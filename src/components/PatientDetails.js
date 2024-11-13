import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import VideoUploadModal from './VideoUploadModal';
import { jsPDF } from 'jspdf';
import pdfIcon from '../assets/pdf.png';
import AssignModal from './AssignModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd, faUserNurse, faCheckCircle, faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
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
  const authCredentials = localStorage.getItem('authCredentials');
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedNurse, setSelectedNurse] = useState('');   
  const [assignedStaff, setAssignedStaff] = useState({ doctorId: null, nurseId: null });
  
  useEffect(() => {
    const fetchPatientDetails = async () => {  
      try {
        const patientResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        });
  
        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          const name = patientData.name[0];
          setPatient(`${name.given.join(' ')} ${name.family}`);
        } else if (patientResponse.status === 401) {
          alert('Unauthorized access. Please log in again.');
          navigate('/login');
          return;
        } else {
          console.error(`Error fetching patient: ${patientResponse.status}`);
        }
  
        const encountersResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}/encounters`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        });
  
        if (encountersResponse.ok) {
          const encountersData = await encountersResponse.json();
          if (encountersData.entry) {
            const encounterList = encountersData.entry.map(entry => {
              const resource = entry.resource;
              const id = resource.id;
              const description = resource.reasonCode && resource.reasonCode[0] ? resource.reasonCode[0].text : 'No Description';
              const status = resource.status || 'No Status';
              const date = resource.period && resource.period.start ? resource.period.start : 'No Date';
  
              const videoUploadedExtension = resource.extension && resource.extension.find(ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded');
              const videoUploaded = videoUploadedExtension ? videoUploadedExtension.valueBoolean : false;
  
              // Check for assigned participants
              const isAssigned = resource.participant && resource.participant.length > 0;
  
              return { 
                id, 
                description, 
                status, 
                date, 
                videoUploaded, 
                readEnabled: videoUploaded,
                isAssigned // New property to indicate assigned participants
              };
            });
  
            encounterList.sort((a, b) => new Date(a.date) - new Date(b.date));
            setEncounters(encounterList);
          } else {
            setEncounters([]);
          }
        } else if (encountersResponse.status === 401) {
          alert('Unauthorized access. Please log in again.');
          navigate('/login');
        } else {
          console.error(`Error fetching encounters: ${encountersResponse.status}`);
        }
  
        fetch(`${process.env.REACT_APP_API_URL}/api/users/doctors`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        })
          .then((response) => response.json())
          .then((data) => setDoctors(data));
  
        fetch(`${process.env.REACT_APP_API_URL}/api/users/nurses`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        })
          .then((response) => response.json())
          .then((data) => setNurses(data));
      } catch (error) {
        console.error('Error fetching patient or encounters:', error);
      }
    };
  
    fetchPatientDetails();
  }, [patientId]);

  
  
  

  const handleDoctorChange = (encounterId, practitionerId) => {
    updateEncounterParticipants(encounterId, practitionerId, "doctor");
  };
  
  const handleNurseChange = (encounterId, practitionerId) => {
    updateEncounterParticipants(encounterId, practitionerId, "nurse");
  };  
  
  const updateEncounterParticipants = async (encounterId, practitionerId, role) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}/addParticipant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials,
        },
        body: JSON.stringify({
          practitionerId,
          role,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update encounter: ${response.status}`);
      }
  
      return response;
    } catch (error) {
      console.error("Error updating encounter:", error);
      throw error;
    }
  }; 

  const handleAddEncounter = () => {
    setLoading(true);

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

    const optimisticEnc = {
        id: `optimistic-${Date.now()}`,
        description: newEncounter.description,
        status: newEncounter.status,
        date: new Date(newEncounter.date).toISOString(),
        videoUploaded: false,
        readEnabled: false
    };

    setEncounters(prevEncounters => [...prevEncounters, optimisticEnc]);

    fetch(`${process.env.REACT_APP_API_URL}/encounter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/fhir+json',
            'Authorization': authCredentials,
        },
        body: JSON.stringify(encounterData),
    })
    .then(response => response.json())
    .then(data => {
        const createdEncounter = data;
        setEncounters(prevEncounters => prevEncounters.map(enc =>
            enc.id === optimisticEnc.id ? {
                id: createdEncounter.id,
                description: createdEncounter.reasonCode && createdEncounter.reasonCode[0] ? createdEncounter.reasonCode[0].text : 'No Description',
                status: createdEncounter.status || 'No Status',
                date: createdEncounter.period && createdEncounter.period.start ? createdEncounter.period.start : 'No Date',
                videoUploaded: false,
                readEnabled: false
            } : enc
        ));
        setLoading(false);
        setShowModal(false);
        setNewEncounter({ description: '', date: '', status: 'planned' });
    })
    .catch(error => {
        console.error('Error adding encounter:', error);
        setEncounters(prevEncounters => prevEncounters.filter(enc => enc.id !== optimisticEnc.id));
        setLoading(false);
    });
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
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'planned':
        return '#d3d3d3'; // light gray
      case 'in-progress':
        return '#ffffcc'; // light yellow
      case 'finished':
        return '#ccffcc'; // light green
      case 'cancelled':
        return '#ffcccc'; // light red
      default:
        return 'white';
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
        doc.text(`Patient: ${patient}`, 10, 10);
        doc.text(`Status: ${encounter.status}`, 10, 30);
        doc.text(`Encounter ID: ${encounter.id}`, 10, 50);
        doc.save(`Encounter_${encounter.id}.pdf`);
        return;
      }
  
      const data = await response.json();
      const doc = new jsPDF();
      doc.text(`SeeDoc`, 10, 280);
      doc.text(`Patient: ${patient}`, 10, 10);
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

  const openAssignModal = async (encounterId) => {
    try {
        setSelectedEncounterId(encounterId);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authCredentials,
            },
        });
        
        if (response.ok) {
            const encounterData = await response.json();
            
            // Check if there are participants
            if (encounterData.participant && encounterData.participant.length > 0) {
                const doctor = encounterData.participant.find((p) => p.type && p.type[0].text === "Doctor");
                const nurse = encounterData.participant.find((p) => p.type && p.type[0].text === "Nurse");

                setAssignedStaff({
                    doctorId: doctor ? doctor.individual.reference.split('/')[1] : null,
                    nurseId: nurse ? nurse.individual.reference.split('/')[1] : null
                });
            } else {
                // No participants assigned
                setAssignedStaff({
                    doctorId: null,
                    nurseId: null,
                    message: "No assigned staff yet"
                });
            }

            setShowAssignModal(true);
        } else {
            console.error("Failed to fetch encounter data:", response.status);
        }
    } catch (error) {
        console.error("Error fetching assigned staff:", error);
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedDoctor('');
    setSelectedNurse('');
  };

  const handleAssignParticipants = async () => {
    if (!selectedDoctor) {
      alert("Please select a doctor.");
      return;
    }
  
    try {
      const doctorResponse = await updateEncounterParticipants(selectedEncounterId, selectedDoctor, "doctor");
      
      if (doctorResponse.ok) {
        console.log("Doctor assigned successfully.");
  
        if (selectedNurse) {
          const nurseResponse = await updateEncounterParticipants(selectedEncounterId, selectedNurse, "nurse");
  
          if (nurseResponse.ok) {
            console.log("Nurse assigned successfully.");
          } else {
            console.error("Failed to assign nurse:", nurseResponse.statusText);
          }
        }
      } else {
        console.error("Failed to assign doctor:", doctorResponse.statusText);
      }
    } catch (error) {
      console.error("Error updating encounter:", error);
    } finally {
      closeAssignModal();
    }
  };  

  const hasAssignedStaff = (encounter) => {
    return encounter.participant && Array.isArray(encounter.participant) && encounter.participant.length > 0;
  };

  return (
    <div>      
      <h1>{patient + ' ID(' + patientId + ')'}</h1>
      <button onClick={() => setShowModal(true)}>Add Encounter</button>
      {loading && <p>Loading...</p>}
      <button className="danger" onClick={() => navigate('/patients')}>Back</button>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Encounter ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Date</th>
            <th>Staff</th>
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
            encounters.map((encounter, index) => {
              // Check if encounter has assigned staff
              const isAssigned = hasAssignedStaff(encounter);
              return (
                <tr key={index} className="encounter-row">
                  <td>{index + 1}</td>
                  <td>{encounter.id}</td>
                  <td>{encounter.description}</td>
                  <td style={{ backgroundColor: getStatusColor(encounter.status) }}>
                    {encounter.status}
                  </td>
                  <td>
                    {new Date(encounter.date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td>
                    <button onClick={() => openAssignModal(encounter.id)}>Assign</button>
                    <span style={{ marginLeft: "8px" }}>
                      {encounter.isAssigned ? (
                        <FontAwesomeIcon icon={faUserMd} title="Staff assigned" className="assigned-icon" />
                      ) : (
                        <FontAwesomeIcon icon={faTimesCircle} title="No staff assigned" className="not-assigned-icon" />
                      )}
                    </span>
                  </td>
                  <td>
                    {encounter.videoUploaded ? (
                      <span>A video has been uploaded ✅</span>
                    ) : (
                      <button onClick={() => handleUploadClick(index)}>
                        Upload Video
                      </button>
                    )}
                  </td>
                  <td>
                    {encounter.readEnabled ? (
                      <button onClick={() => handleReadClick(encounter)}>
                        {encounter.status === "finished" ? "Review" : "Read"}
                      </button>
                    ) : (
                      <button disabled>Read</button>
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
              );
            })
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
      <AssignModal
        show={showAssignModal}
        onClose={closeAssignModal}
        doctors={doctors}
        nurses={nurses}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        selectedNurse={selectedNurse}
        setSelectedNurse={setSelectedNurse}
        assignedStaff={assignedStaff}
        handleAssignParticipants={handleAssignParticipants}
      />      
    </div>
  );
};

export default PatientDetails;
