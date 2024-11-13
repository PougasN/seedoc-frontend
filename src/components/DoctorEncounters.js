import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import pdfIcon from '../assets/pdf.png';
import VideoUploadModal from './VideoUploadModal';
import './DoctorEncounters.css';

const DoctorEncounters = () => {
  const [encounters, setEncounters] = useState([]);
  const authCredentials = localStorage.getItem('authCredentials');
  const practitionerId = localStorage.getItem('practitionerId');
  const navigate = useNavigate();
  const [selectedEncounterIndex, setSelectedEncounterIndex] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const role = localStorage.getItem('userRole'); // Get user role from localStorage
  const userName = localStorage.getItem('userName');
  const [isPreRead, setIsPreRead] = useState('0');

  

  useEffect(() => {
    const fetchEncounters = async () => {
      if (!practitionerId) {
        console.error('No practitioner ID found for doctor.');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/practitioner/${practitionerId}/encounters`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authCredentials,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const encountersWithPatientId = (data.entry || []).map(entry => {
            const encounter = entry.resource;
            const patientId = encounter.subject?.reference?.split('/')[1] || 'Unknown';
            const id = encounter.id;
            const description = encounter.reasonCode && encounter.reasonCode[0] ? encounter.reasonCode[0].text : 'No Description';
            const status = encounter.status || 'Unknown';
            const date = encounter.period && encounter.period.start ? new Date(encounter.period.start).toLocaleString() : 'No Date';

            const videoUploadedExtension = encounter.extension && encounter.extension.find(ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded');
            const videoUploaded = videoUploadedExtension ? videoUploadedExtension.valueBoolean : false;

            // Check for the nursePreReadStatus extension
            const nursePreReadStatusExtension = encounter.extension?.find(
              ext => ext.url === 'http://example.com/fhir/StructureDefinition/nursePreReadStatus'
            );
            const isPreRead = nursePreReadStatusExtension ? nursePreReadStatusExtension.valueBoolean : false;

            return {
              id,
              description,
              status,
              date,
              patientId,
              videoUploaded, 
              readEnabled: videoUploaded,
              isPreRead,

            };
          });

          setEncounters(encountersWithPatientId);
        } else if (response.status === 401) {
          alert('Unauthorized access. Please log in again.');
          navigate('/login');
        } else {
          console.error(`Error fetching encounters: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching encounters:', error);
      }
    };

    fetchEncounters();
  }, [practitionerId, authCredentials, navigate]);

  const handleReadClick = async (encounter) => {
    try {
      const authCredentials = localStorage.getItem('authCredentials');
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounter.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials,
        },
      });
  
      if (!response.ok) {
        console.error(`Error fetching encounter details: ${response.status}`);
        return;
      }
  
      const updatedEncounter = await response.json();
  
      if (!updatedEncounter.extension) {
        console.error('Encounter has no extensions', updatedEncounter);
        return;
      }
  
      const mediaExtension = updatedEncounter.extension.find(ext => ext.url === 'http://example.com/fhir/StructureDefinition/mediaId');
      if (!mediaExtension) {
        console.error('No mediaId extension found in encounter', updatedEncounter);
        return;
      }
  
      const mediaId = mediaExtension.valueReference.reference.split('/')[1];
      navigate(`/video/${encounter.id}/${mediaId}`);
    } catch (error) {
      console.error('Error fetching encounter details:', error);
    }
  };

  const generatePDF = async (encounter) => {
    try {
      const authCredentials = localStorage.getItem('authCredentials');
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/diagnostic-report?encounterId=${encounter.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials,
        },
      });
  
      if (response.status === 404) {
        const doc = new jsPDF();
        doc.text(`SeeDoc`, 10, 280);
        doc.text(`Patient: ${encounter.patientId}`, 10, 10);
        doc.text(`Status: ${encounter.status}`, 10, 30);
        doc.text(`Encounter ID: ${encounter.id}`, 10, 50);
        doc.save(`Encounter_${encounter.id}.pdf`);
        return;
      }
  
      const data = await response.json();
      const doc = new jsPDF();
      doc.text(`SeeDoc`, 10, 280);
      doc.text(`Patient: ${encounter.patientId}`, 10, 10);
      doc.text(`Status: ${encounter.status}`, 10, 20);
      doc.text(`Encounter ID: ${encounter.id}`, 10, 30);
  
      if (data.resourceType === "DiagnosticReport") {
        doc.text(`Conclusion: ${data.conclusion}`, 10, 50);
  
        let currentY = 60;
        const maxY = 270;
  
        const imagePromises = data.presentedForm.map((form, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = form.url;
            img.onload = () => {
              const imgWidth = 100;
              const imgHeight = (img.height / img.width) * imgWidth;
  
              if (currentY + imgHeight > maxY) {
                doc.addPage();
                currentY = 10;
              }
  
              doc.addImage(img, 'PNG', 10, currentY, imgWidth, imgHeight);
              currentY += imgHeight + 10;
  
              resolve();
            };
          });
        });
  
        await Promise.all(imagePromises);
      }
  
      doc.save(`Encounter_${encounter.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'planned':
        return '#d3d3d3'; // light gray
      case 'in-progress':
        return '#ffffcc'; // light yellow
      case 'finished':
        return '#ccffcc'; // light green      
      default:
        return 'white';
    }
  };

  const handleUploadClick = (index) => {
    setSelectedEncounterIndex(index);
    setShowVideoModal(true);
  };

  const handleUpload = async (file, setUploadProgress) => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    const encounterId = encounters[selectedEncounterIndex].id;
    const patientId = encounters[selectedEncounterIndex].patientId;

    try {  
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${process.env.REACT_APP_API_URL}/upload?patientId=${patientId}&encounterId=${encounterId}`, true);
  
      xhr.setRequestHeader('Authorization', authCredentials);
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentCompleted);
        }
      };
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log('Media created with ID =', data.id);
  
          const videoUrl = `${process.env.REACT_APP_API_URL}/videos-bucket/${file.name}`;
          
          setEncounters(encounters.map((enc, i) => i === selectedEncounterIndex ? {
            ...enc,
            status: 'in-progress',
            videoUploaded: true,
            readEnabled: true,
            videoUrl: videoUrl
          } : enc));
          setShowVideoModal(false);
          setUploadProgress(0);
        } else {
          alert('Error uploading file');
          setUploadProgress(0);
        }
      };
  
      xhr.onerror = () => {
        console.error('Error uploading video');
        alert('Error uploading video');
        setUploadProgress(0);
      };
  
      xhr.send(formData);
    } catch (err) {
      console.error('Error uploading video:', err);
      alert('Error uploading video');
      setUploadProgress(0);
    }
  }; 

  return (
    <div>      
      {/* <h1>Doctor's Encounters</h1> */}
      <h1>{`${role === 'ROLE_DOCTOR' ? 'Dr.' : 'Nr.'} ${userName}'s Encounters`}</h1>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Encounter ID</th>
            <th>Patient ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Date</th>
            {/* <th>Video</th> */}
            {role === 'ROLE_DOCTOR' && <th>Video</th>}
            <th>Reading</th>
            <th>D-Report</th>
          </tr>
        </thead>
        <tbody>
          {encounters.length === 0 ? (
            <tr>
              <td colSpan="9">No encounters found</td>
            </tr>
          ) : (
            encounters.map((encounter, index) => (
              <tr key={encounter.id}>
                <td>{index + 1}</td>
                <td>{encounter.id}</td>
                <td>{encounter.patientId}</td>
                <td>{encounter.description}</td>
                <td style={{ backgroundColor: getStatusColor(encounter.status) }}>
                  {encounter.status}
                </td>
                <td>{encounter.date}</td>                
                {role === 'ROLE_DOCTOR' && (
                  <td>
                    {encounter.videoUploaded ? (
                      <span>A video has been uploaded ✅</span>
                    ) : (
                      <button onClick={() => handleUploadClick(index)}>
                        Upload Video
                      </button>
                    )}
                  </td>
                )}
                <td>
                  {encounter.readEnabled ? (
                    <button onClick={() => handleReadClick(encounter)}>
                      {role === "ROLE_DOCTOR"
                        ? encounter.status === "finished"
                          ? "Review"
                          : "Reading"
                        : encounter.isPreRead || encounter.status === "finished"
                          ? "Review"
                          : "PreReading"}
                    </button>
                  ) : (
                    <button disabled>{role === "ROLE_DOCTOR" ? "Reading" : "PreReading"}</button>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => encounter.status === "finished" && generatePDF(encounter)}
                    disabled={encounter.status !== "finished"}
                    style={{ opacity: encounter.status === "finished" ? 1 : 0.5 }}
                  >
                    <img src={pdfIcon} alt="PDF Icon" width="20" height="20" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>      
      <VideoUploadModal
        show={showVideoModal}
        handleClose={() => setShowVideoModal(false)}
        handleUpload={handleUpload}
      />
    </div>
  );
};

export default DoctorEncounters;
