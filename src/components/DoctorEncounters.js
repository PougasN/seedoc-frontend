import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import pdfIcon from '../assets/pdf.png';
import VideoUploadModal from './VideoUploadModal';
import './DoctorEncounters.css';

const DoctorEncounters = () => {
  const [encounters, setEncounters] = useState([]);  
  const [selectedEncounterIndex, setSelectedEncounterIndex] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);  
  const [filteredEncounters, setFilteredEncounters] = useState([]);
  const [filter, setFilter] = useState('all');
  const [counts, setCounts] = useState({ pending: 0, completed: 0, all: 0 });
  const authCredentials = localStorage.getItem('authCredentials');
  const practitionerId = localStorage.getItem('practitionerId');
  const role = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();

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
    
            // Check if a preReader is assigned
            const preReaderAssigned = encounter.participant?.some(participant => {
              return participant.type?.some(type => type.text === "PreReader");
            });
    
            // Check for pre-reading status
            const preReaderPreReadStatusExtension = encounter.extension?.find(
              ext => ext.url === 'http://example.com/fhir/StructureDefinition/PreReadStatus'
            );
            const isPreRead = preReaderPreReadStatusExtension ? preReaderPreReadStatusExtension.valueBoolean : false;
    
            // Determine the pre-reading state
            let preReadingState = "unassigned";
            if (preReaderAssigned) {
              preReadingState = isPreRead ? "finished" : "pending";
            }
    
            return {
              id: encounter.id,
              description: encounter.reasonCode?.[0]?.text || 'No Description',
              status: encounter.status || 'Unknown',
              date: encounter.period?.start
                ? new Date(encounter.period.start).toLocaleString()
                : 'No Date',
              patientId: encounter.subject?.reference?.split('/')[1] || 'Unknown',
              videoUploaded: encounter.extension?.some(
                ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded' && ext.valueBoolean
              ),
              readEnabled: encounter.extension?.some(
                ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded' && ext.valueBoolean
              ),
              isPreRead,
              preReadingState,
            };
          });
    
          setEncounters(encountersWithPatientId);
          updateCounts(encountersWithPatientId);
          setFilteredEncounters(encountersWithPatientId);
    
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
    
    handleFilter(filter);
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

  const handleUpload = (file, setUploadProgress, setUploadComplete) => {
    if (!file) {
      alert("Please select a file to upload");
      return null;
    }
  
    const maxSize = 3 * 1024 * 1024 * 1024; // 2GB in bytes

    if (file.size > maxSize) {
      alert("The file is too large. Please upload a file smaller than 2GB.");
      return null;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    const encounterId = encounters[selectedEncounterIndex].id;
    const patientId = encounters[selectedEncounterIndex].patientId;
  
    const xhr = new XMLHttpRequest(); // Create the XMLHttpRequest instance
  
    try {
      xhr.open(
        "POST",
        `${process.env.REACT_APP_API_URL}/upload?patientId=${patientId}&encounterId=${encounterId}`,
        true
      );
      xhr.setRequestHeader("Authorization", authCredentials);
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentCompleted);
        }
      };
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log("Media created with ID =", data.id);
          const updatedEncounters = encounters.map((enc, i) =>
            i === selectedEncounterIndex
              ? {
                  ...enc,
                  status: "in-progress",
                  videoUploaded: true,
                  readEnabled: true,
                }
              : enc
          );
          setEncounters(updatedEncounters);
          setFilteredEncounters(
            updatedEncounters.filter((enc) => {
              if (filter === "pending") return enc.status !== "finished";
              if (filter === "completed") return enc.status === "finished";
              return true;
            })
          );  
          setUploadComplete(true);
          setTimeout(() => {
            setShowVideoModal(false);
            setUploadProgress(0);
            setUploadComplete(false);
          }, 2000);
        } else {
          console.error("Error uploading file:", xhr.responseText);
          alert("Error uploading file.");
          setUploadProgress(0);
        }
      };
  
      xhr.onerror = () => {
        console.error("Error uploading video");
        alert("Error uploading video");
        setUploadProgress(0);
      };
  
      xhr.send(formData); // Start the upload
    } catch (err) {
      console.error("Error uploading video:", err);
      alert("Error uploading video");
      setUploadProgress(0);
    }
  
    return xhr; // Return the xhr object so it can be canceled
  };
  

  const handleFilter = (status) => {
    setFilter(status);

    if (status === 'pending') {
      setFilteredEncounters(encounters.filter(enc => enc.status !== 'finished'));
    } else if (status === 'completed') {
      setFilteredEncounters(encounters.filter(enc => enc.status === 'finished'));
    } else {
      setFilteredEncounters(encounters);
    }
  };

  const updateCounts = (data) => {
    const pendingCount = data.filter(enc => enc.status !== 'finished').length;
    const completedCount = data.filter(enc => enc.status === 'finished').length;
    setCounts({
      pending: pendingCount,
      completed: completedCount,
      all: data.length
    });
  };

  return (
    <div>      
      <h1>{`${role === 'ROLE_DOCTOR' ? 'Dr.' : 'Pr.'} ${userName}'s Encounters`}</h1>
      <div>
        <button onClick={() => handleFilter('pending')}>Pending Review ({counts.pending})</button>
        <button onClick={() => handleFilter('completed')}>Completed ({counts.completed})</button>
        <button onClick={() => handleFilter('all')}>All ({counts.all})</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Description</th>
            <th>Status</th>            
            {role === 'ROLE_DOCTOR' && <th>Video</th>}
            {role === 'ROLE_DOCTOR' && <th>Pre-Reading</th>}
            <th>Reading</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {encounters.length === 0 ? (
            <tr>
              <td colSpan="9">No encounters found</td>
            </tr>
          ) : (
            filteredEncounters.map((encounter, index) => (
              <tr key={encounter.id}>
                <td>{index + 1}</td>
                <td>
                  {encounter.date && new Date(encounter.date).toString() !== "Invalid Date"
                    ? new Date(encounter.date).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : new Date().toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                </td>
                <td>{encounter.description}</td>
                <td style={{ backgroundColor: getStatusColor(encounter.status) }}>
                  {encounter.status}
                </td>                                
                {role === 'ROLE_DOCTOR' && (
                  <td>
                    {encounter.videoUploaded ? (
                      <span>A video has been uploaded.</span>
                    ) : (
                      <button onClick={() => handleUploadClick(index)}>
                        Upload Video
                      </button>
                    )}
                  </td>
                )}
                {role === 'ROLE_DOCTOR' && (
            <td>
              {encounter.preReadingState === "unassigned" && <span>Unassigned</span>}
              {encounter.preReadingState === "pending" && <span style={{ color: 'orange' }}>Pending</span>}
              {encounter.preReadingState === "finished" && <span style={{ color: 'green' }}>Finished</span>}
            </td>
          )}                
                <td>
                  {encounter.readEnabled ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button onClick={() => handleReadClick(encounter)}>
                        {role === "ROLE_DOCTOR"
                          ? encounter.status === "finished"
                            ? "View"
                            : "Reading"
                          : encounter.isPreRead || encounter.status === "finished"
                            ? "View"
                            : "Pre-Reading"}
                      </button>
                      {role === "ROLE_DOCTOR" && encounter.isPreRead && (
                        <span title='Pre-Reading Done'> ✅ </span>
                      )}
                    </div>
                  ) : (
                    <button disabled>{role === "ROLE_DOCTOR" ? "Reading" : "Pre-Reading"}</button>
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
