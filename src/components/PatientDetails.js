import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import VideoUploadModal from './VideoUploadModal';
import pdfIcon from '../assets/pdf.png';
import AssignModal from './AssignModal';
import { jsPDF } from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [preReaders, setPreReaders] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPreReader, setSelectedPreReader] = useState('');   
  const [assignedStaff, setAssignedStaff] = useState({ doctorId: null, preReaderId: null });
  const [skipNextFetch, setSkipNextFetch] = useState(false);
  const [selectedPreReaders, setSelectedPreReaders] = useState('');
  
  useEffect(() => {
    if (skipNextFetch) {
      setSkipNextFetch(false);
      return;
    }
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
  
              const isAssigned = resource.participant && resource.participant.length > 0;
  
              return { 
                id, 
                description, 
                status, 
                date, 
                videoUploaded, 
                readEnabled: videoUploaded,
                isAssigned
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
  
        fetch(`${process.env.REACT_APP_API_URL}/api/users/prereaders`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        })
          .then((response) => response.json())
          .then((data) => setPreReaders(data));
      } catch (error) {
        console.error('Error fetching patient or encounters:', error);
      }
    };
  
    fetchPatientDetails();
  }, [patientId, skipNextFetch]);

  const onClose = () => {
    setSelectedDoctor("");
    setSelectedPreReader("");
    setShowAssignModal(false);
  };  
  
  const refreshVideos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/videos?encounterId=${selectedEncounterId}`, {
        headers: { Authorization: authCredentials },
      });
      if (response.ok) {
        const data = await response.json();
      } else {
        console.error("Failed to refresh videos:", response.status);
      }
    } catch (error) {
      console.error("Error refreshing videos:", error);
    }
  };  

  const handleDoctorChange = (encounterId, practitionerId) => {
    updateEncounterParticipants(encounterId, practitionerId, "doctor");
  };
  
  const handlePreReaderChange = (encounterId, practitionerId) => {
    updateEncounterParticipants(encounterId, practitionerId, "prereader");
  };

  const updateEncounterParticipants = async (encounterId, practitionerId, role) => {
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/encounter/${encounterId}/addParticipant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authCredentials,
          },
          body: JSON.stringify({
            practitionerId,
            role,
          }),
        }
      );
  
      return response;
    } catch (error) {
      console.error(`Error updating ${role}:`, error);
      throw error;
    }
  };
  
  const handleAddEncounter = () => {
    const encounterData = {
      resourceType: "Encounter",
      subject: {
        reference: `Patient/${patientId}`,
      },
      period: {
        start: new Date(newEncounter.date).toISOString(),
      },
      reasonCode: [
        {
          text: newEncounter.description,
        },
      ],
      status: newEncounter.status,
    };
  
    fetch(`${process.env.REACT_APP_API_URL}/encounter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        Authorization: authCredentials,
      },
      body: JSON.stringify(encounterData),
    })
      .then((response) => response.json())
      .then((data) => {
        const newEncounterItem = {
          id: data.id,
          description: data.reasonCode?.[0]?.text || "No Description",
          status: data.status || "No Status",
          date: data.period?.start || "No Date",
          videoUploaded: data.extension?.some(
            (ext) =>
              ext.url ===
                "http://example.com/fhir/StructureDefinition/videoUploaded" &&
              ext.valueBoolean
          ),
        };
  
        setEncounters((prevEncounters) => [...prevEncounters, newEncounterItem]);

        toast.success("Encounter created successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });        
  
        setNewEncounter({ description: "", date: "", status: "planned" });
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error adding encounter:", error);
      });
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
      alert("The file is too large. Please upload a file smaller than 4GB.");
      return null;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    const encounterId = encounters[selectedEncounterIndex].id;
  
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
  
          setEncounters(
            encounters.map((enc, i) =>
              i === selectedEncounterIndex
                ? {
                    ...enc,
                    status: "in-progress",
                    videoUploaded: true,
                    readEnabled: true,
                  }
                : enc
            )
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
  
    return xhr;
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
      navigate(`/video/${encounter.id}/${mediaId}`, {
        state: {
          encounterDescription: encounter.description,
        },
      });
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
          const preReader = encounterData.participant.find((p) => p.type && p.type[0].text === "PreReader");
  
          setAssignedStaff({
            doctorId: doctor ? doctor.individual.reference.split('/')[1] : null,
            preReaderId: preReader ? preReader.individual.reference.split('/')[1] : null
          });
        } else {
          // No participants assigned
          setAssignedStaff({
            doctorId: null,
            preReaderId: null,
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

  const assignParticipants = async (doctor, preReader, encounterId) => {
  
    try {
      const doctorResponse = await updateEncounterParticipants(encounterId, doctor, "doctor");
  
      if (!doctorResponse.ok) {
        console.error("Failed to assign doctor.", doctorResponse.statusText);
        throw new Error("Failed to assign doctor.");
      }
  
  
      if (preReader) {
        const preReaderResponse = await updateEncounterParticipants(encounterId, preReader, "preReader");
  
        if (!preReaderResponse.ok) {
          console.error("Failed to assign preReader.", preReaderResponse.statusText);
          throw new Error("Failed to assign preReader.");
        }
  
      }
    } catch (error) {
      console.error("Error in assignParticipants:", error);
      throw error;
    }
  };

  const handleAssignParticipants = async () => {
  
    if (!selectedDoctor) {
      toast.error("Please select a doctor.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
  
    try {
      const doctorResponse = await updateEncounterParticipants(selectedEncounterId, selectedDoctor, "doctor");
  
      if (doctorResponse.ok) {
  
        if (selectedPreReader) {
          const preReaderResponse = await updateEncounterParticipants(selectedEncounterId, selectedPreReader, "preReader");
  
          if (preReaderResponse.ok) {
          }
        }

        setEncounters((prevEncounters) =>
          prevEncounters.map((encounter) =>
            encounter.id === selectedEncounterId
              ? { ...encounter, isAssigned: true }
              : encounter
          )
        );
  
        toast.success("Participants assigned successfully.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });

        onClose();
      } else {
        console.error("Failed to assign doctor.");
        toast.error("Failed to assign doctor.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error updating encounter:", error);
      toast.error("Failed to update participants.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };
  
  const handleChangeParticipants = async () => {
  
    if (!selectedDoctor) {
      toast.error("Please select a doctor.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      return;
    }
  
    try {
      const removeResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/encounter/${selectedEncounterId}/removeParticipants`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: authCredentials,
          },
        }
      );
  
      if (!removeResponse.ok) {
        console.error("Failed to remove participants:", removeResponse.statusText);
        throw new Error("Failed to remove participants.");
      }

      await handleAssignParticipants();  

      onClose();
    } catch (error) {
      console.error("Error changing participants:", error);  
      toast.error("Failed to update participants.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
  
      return;
    }
  };  

  const validateParticipants = (selectedDoctor) => {
    if (!selectedDoctor) {
      toast.error("Please select a doctor.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return false;
    }
    return true;
  };

  const hasAssignedStaff = (encounter) => {
    return encounter.participant && Array.isArray(encounter.participant) && encounter.participant.length > 0;
  };

  const handleDeleteEncounter = async (encounterId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}`, {
        method: "DELETE",
        headers: {
          "Authorization": authCredentials,
        },
      });
  
      if (response.ok) {
        toast.success("Encounter deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
  
        setEncounters((prevEncounters) =>
          prevEncounters.filter((encounter) => encounter.id !== encounterId)
        );
      } else {
        const errorText = await response.text();
        console.error("Error deleting encounter:", errorText);
        toast.error("Failed to delete the encounter. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error deleting encounter:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const handleDeleteClick = (encounterId) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>
            Are you sure you want to delete this encounter? This action cannot
            be undone.
          </p>
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              className="btn btn-confirm"
              onClick={async () => {
                closeToast();
                await confirmDelete(encounterId);
              }}
            >
              Yes, Delete
            </button>
            <button className="btn btn-cancel" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: true,
        theme: "colored",
      }
    );
  };

  const confirmDelete = async (encounterId) => {
    try {
      await handleDeleteEncounter(encounterId);
    } catch (error) {
      console.error("Error deleting encounter:", error);
      toast.error("Failed to delete encounter.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };
  
  return (
    <div>      
      <h1>{patient + ' ID(' + patientId + ')'}</h1>
      <button onClick={() => setShowModal(true)}>New Encounter</button>
      {loading && <p>Loading...</p>}
      <button className="danger" onClick={() => navigate('/patients')}>Back</button>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Description</th>
            <th>Status</th>            
            <th>Staff</th>
            <th>Video</th>
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
            encounters.map((encounter, index) => {
              const isAssigned = hasAssignedStaff(encounter);
              return (
                <tr key={index} className="encounter-row">
                  <td>{index + 1}</td>
                  <td>
                    {new Date(encounter.date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    /{" "}
                    <button
                      className="delete-btn"
                      style={{ marginLeft: "8px" }}
                      onClick={() => handleDeleteClick(encounter.id)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <div className="multi-line-text">
                      {encounter.description}
                    </div>
                  </td>
                  <td style={{ backgroundColor: getStatusColor(encounter.status) }}>
                    {encounter.status}
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
                        {encounter.status === "finished" ? "View" : "Read"}
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
        onClose={onClose}
        doctors={doctors}
        preReaders={preReaders}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        selectedPreReader={selectedPreReader}
        setSelectedPreReader={setSelectedPreReader}
        assignedStaff={assignedStaff}
        handleAssignParticipants={handleAssignParticipants}
        handleChangeParticipants={handleChangeParticipants}
      />
      <ToastContainer />
    </div>
  );
};

export default PatientDetails;
