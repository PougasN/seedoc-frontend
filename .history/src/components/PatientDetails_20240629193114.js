import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import VideoUploadModal from './VideoUploadModal';
import { jsPDF } from 'jspdf';
import pdfIcon from '../assets/pdf.png';
import './PatientDetails.css';

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
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
          encounterList.sort((a, b) => new Date(a.date) - new Date(b.date));
          setEncounters(encounterList);
        } else {
          setEncounters([]); // No encounters
        }
      })
      .catch(error => console.error('Error fetching encounters:', error));
  }, [patientId]);

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

    // // Optimistically update the UI
    // const optimisticEnc = {
    //   id: 'pending',
    //   description: newEncounter.description,
    //   status: newEncounter.status,
    //   date: new Date(newEncounter.date).toISOString(),
    //   videoUploaded: false,
    //   readEnabled: false,
    //   dReport: false
    // };
    // setEncounters([...encounters, optimisticEnc]);

    fetch('http://localhost:9090/encounter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(encounterData),
    })
      .then(response => response.json())
      .then(data => {
        setEncounters(encounters.map(enc => enc === optimisticEnc ? {
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
        setEncounters(encounters.filter(enc => enc !== optimisticEnc));
        setLoading(false); // Clear loading state
      });
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
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('encounterId', encounters[selectedEncounterIndex].id);
  
    try {
      const response = await fetch('http://localhost:9090/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Error uploading file');
      }
  
      const data = await response.text();
      const videoUrl = `http://localhost:9000/seedoc-bucket/videos/${file.name}`;
  
      // Update encounter with video URL
      setEncounters(encounters.map((enc, i) => i === selectedEncounterIndex ? {
        ...enc,
        status: 'in-progress',
        videoUploaded: true,
        readEnabled: true,
        videoUrl: videoUrl // Set the correct video URL
      } : enc));
    } catch (err) {
      console.error('Error uploading video:', err);
    }
  };
  

  const handleReadClick = (videoUrl) => {
    navigate(`/video/${encodeURIComponent(videoUrl)}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'planned':
        return '#d3d3d3'; // light gray
      case 'in-progress':
        return '#ffffcc'; // light yellow
      case 'completed':
        return '#ccffcc'; // light green
      case 'cancelled':
        return '#ffcccc'; // light red
      default:
        return 'white';
    }
  };

  const generatePDF = (encounter) => {
    const doc = new jsPDF();
    doc.text(`SeeDoc`, 10, 280);
    doc.text(`${patient}`, 10, 10);
    doc.text(`Description: ${encounter.description}`, 10, 20);
    doc.text(`Status: ${encounter.status}`, 10, 30);
    doc.text(`${new Date(encounter.date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`, 10, 40);
    doc.text(`Encounter ID: ${encounter.id}`, 10, 50);
    doc.save(`Encounter_${encounter.id}.pdf`);
  };

  return (
    <div>
      <button className="danger" onClick={() => navigate('/patients')}>Back</button>
      <h1>{patient}</h1>
      <button className="secondary" onClick={() => setShowModal(true)}>Add Encounter</button>
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
            <th>Reading</th>
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
              <tr key={index} className="encounter-row">
                <td>{index + 1}</td>
                <td>{encounter.id}</td>
                <td>{encounter.description}</td>
                <td style={{ backgroundColor: getStatusColor(encounter.status) }}>
                  {encounter.status}
                </td>
                <td>{new Date(encounter.date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
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
                <td>
                  <button onClick={() => generatePDF(encounter)}>
                    <img src={pdfIcon} alt="PDF Icon" width="20" height="20" />
                  </button>
                </td>
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
