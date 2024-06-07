// PatientDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Modal from './Modal';
import VideoUploadModal from './VideoUploadModal';
import s3Client from './s3Client';
import EncounterContext from './EncounterContext';
import './PatientDetails.css';

const PatientDetails = () => {
  const { patientId } = useParams();
  const { encounters, setEncounters } = useContext(EncounterContext);
  const [patient, setPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newEncounter, setNewEncounter] = useState({ description: '', date: '', status: 'planned' });
  const [loading, setLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedEncounterIndex, setSelectedEncounterIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:9090/patient/${patientId}`)
      .then(response => response.json())
      .then(data => {
        const name = data.name[0];
        setPatient(`${name.given.join(' ')} ${name.family}`);
      })
      .catch(error => console.error('Error fetching patient:', error));

    fetch(`http://localhost:9090/patient/${patientId}/encounters`)
      .then(response => response.json())
      .then(data => {
        if (data.entry) {
          const encounterList = data.entry.map(entry => {
            const resource = entry.resource;
            const id = resource.id;
            const description = resource.reasonCode && resource.reasonCode[0] ? resource.reasonCode[0].text : 'No Description';
            const status = resource.status || 'No Status';
            const date = resource.period && resource.period.start ? resource.period.start : 'No Date';
            return { id, description, status, date, videoUploaded: false, readEnabled: false, dReport: false };
          });
          setEncounters(encounterList);
        } else {
          setEncounters([]); // No encounters
        }
      })
      .catch(error => console.error('Error fetching encounters:', error));
  }, [patientId, setEncounters]);

  const handleAddEncounter = () => {
    setLoading(true); // Set loading state
    const encounterData = {
      resourceType: "Encounter",
      subject: {
        reference: `Patient/${patientId}`
      },
      period: {
        start: new Date(newEncounter.date).toISOString()
      },
      reasonCode: [{
        text: newEncounter.description
      }],
      status: newEncounter.status
    };

    // Optimistically update the UI
    const optimisticEnc = {
      id: `temp-${Date.now()}`, // Temporary ID
      description: newEncounter.description,
      status: newEncounter.status,
      date: new Date(newEncounter.date).toISOString(),
      videoUploaded: false,
      readEnabled: false,
      dReport: false
    };
    setEncounters([...encounters, optimisticEnc]);

    fetch('http://localhost:9090/encounter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(encounterData),
    })
      .then(response => response.json())
      .then(data => {
        setEncounters(encounters.map(enc => enc.id === optimisticEnc.id ? {
          id: data.id,
          description: data.reasonCode && data.reasonCode[0] ? data.reasonCode[0].text : 'No Description',
          status: data.status || 'No Status',
          date: data.period && data.period.start ? data.period.start : 'No Date',
          videoUploaded: false,
          readEnabled: false,
          dReport: false
        } : enc));
        setLoading(false); // Clear loading state
        setShowModal(false);
        setNewEncounter({ description: '', date: '', status: 'planned' });
      })
      .catch(error => {
        console.error('Error adding encounter:', error);
        setEncounters(encounters.filter(enc => enc.id !== optimisticEnc.id));
        setLoading(false); // Clear loading state
      });
  };

  const handleCheckboxChange = (index, field) => {
    setEncounters(encounters.map((enc, i) => i === index ? { ...enc, [field]: !enc[field] } : enc));
  };

  const handleUploadClick = (index) => {
    setSelectedEncounterIndex(index);
    setShowVideoModal(true);
  };

  const handleUpload = async (file) => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const params = {
      Bucket: 'seedoc-bucket',
      Key: `videos/${file.name}`,
      Body: file,
      ContentType: file.type,
    };

    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      console.log('Successfully uploaded video');

      // Generate a pre-signed URL for GET (not PUT)
      const getObjectParams = {
        Bucket: 'seedoc-bucket',
        Key: `videos/${file.name}`
      };
      const getCommand = new GetObjectCommand(getObjectParams);
      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 43200 });
      console.log('Signed URL:', signedUrl);

      // Send POST request to create Media resource
      const mediaData = {
        resourceType: "Media",
        status: "completed",
        type: {
          text: "Video"
        },
        encounter: {
          reference: `Encounter/${encounters[selectedEncounterIndex].id}`
        },
        content: {
          url: signedUrl,
          contentType: "video/mp4"
        }
      };

      fetch('http://localhost:9090/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
        },
        body: JSON.stringify(mediaData),
      })
        .then(response => response.json())
        .then(() => {
          // Fetch the original encounter
          fetch(`http://localhost:9090/encounter/${encounters[selectedEncounterIndex].id}`)
            .then(response => response.json())
            .then(originalEncounter => {
              // Update encounter status
              const updatedEncounter = {
                ...originalEncounter,
                status: "in-progress"
              };

              fetch(`http://localhost:9090/encounter/${updatedEncounter.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/fhir+json',
                },
                body: JSON.stringify(updatedEncounter),
              })
                .then(response => response.json())
                .then(() => {
                  setEncounters(encounters.map((enc, i) => i === selectedEncounterIndex ? {
                    ...enc,
                    status: 'in-progress',
                    videoUploaded: true,
                    readEnabled: true,
                    videoUrl: signedUrl
                  } : enc));
                  setShowVideoModal(false);
                })
                .catch(error => {
                  console.error('Error updating encounter:', error);
                });
            })
            .catch(error => {
              console.error('Error fetching original encounter:', error);
            });
        })
        .catch(error => {
          console.error('Error creating media resource:', error);
        });
    } catch (err) {
      console.error('Error uploading video:', err);
    }
  };

  const handleReadClick = (videoUrl) => {
    navigate(`/video/${encodeURIComponent(videoUrl)}`);
  };

  return (
    <div>
      <button onClick={() => navigate('/')}>Back</button>        
      <h1>{patient}</h1>
      <button onClick={() => setShowModal(true)}>Add Encounter</button>
      {loading && <p>Loading...</p>}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Encounter ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Date</th>
            <th>Video</th>
            <th>Read</th>
            <th>D-Report</th>
          </tr>
        </thead>
        <tbody>
          {encounters.length === 0 ? (
            <tr>
              <td colSpan="8">No encounters found</td>
            </tr>
          ) : (
            encounters.map((encounter, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{encounter.id}</td>
                <td>{encounter.description}</td>
                <td>{encounter.status}</td>
                <td>{new Date(encounter.date).toLocaleString()}</td>
                <td>
                  {encounter.videoUploaded ? (
                    <span>A video has been uploaded</span>
                  ) : (
                    <button onClick={() => handleUploadClick(index)}>Upload Video</button>
                  )}
                </td>
                <td>
                  {encounter.readEnabled ? (
                    <button onClick={() => handleReadClick(encounter.videoUrl)}>Read</button>
                  ) : (
                    <button disabled>Read</button>
                  )}
                </td>
                <td><button>D-Report</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Modal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleAddEncounter}
        newEncounter={newEncounter}
        setNewEncounter={setNewEncounter}
      />
      <VideoUploadModal
        show={showVideoModal}
        handleClose={() => setShowVideoModal(false)}
        handleUpload={handleUpload}
      />
    </div>
  );
};

export default PatientDetails;
