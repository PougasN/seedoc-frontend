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
  const authCredentials = localStorage.getItem('authCredentials');
  const navigate = useNavigate();

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}`)
  //     .then(response => response.json())
  //     .then(data => {
  //       const name = data.name[0];
  //       setPatient(`${name.given.join(' ')} ${name.family}`);
  //     })
  //     .catch(error => console.error('Error fetching patient:', error));

  //   fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}/encounters`)
  //     .then(response => response.json())
  //     .then(data => {
  //       if (data.entry) {
  //         const encounterList = data.entry.map(entry => {
  //           const resource = entry.resource;
  //           const id = resource.id;
  //           const description = resource.reasonCode && resource.reasonCode[0] ? resource.reasonCode[0].text : 'No Description';
  //           const status = resource.status || 'No Status';
  //           const date = resource.period && resource.period.start ? resource.period.start : 'No Date';

  //           // Check for videoUploaded extension
  //           const videoUploadedExtension = resource.extension && resource.extension.find(ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded');
  //           const videoUploaded = videoUploadedExtension ? videoUploadedExtension.valueBoolean : false;

  //           return { id, description, status, date, videoUploaded, readEnabled: videoUploaded, dReport: false };
  //         });
  //         encounterList.sort((a, b) => new Date(a.date) - new Date(b.date));
  //         setEncounters(encounterList);
  //       } else {
  //         setEncounters([]); // No encounters
  //       }
  //     });
  // }, [patientId]);

  // useEffect(() => {
  //   const fetchPatientDetails = async () => {  
  //     try {
  //       // Fetch patient details
  //       const patientResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': authCredentials, // Use stored credentials
  //         },
  //       });
  
  //       if (patientResponse.ok) {
  //         const patientData = await patientResponse.json();
  //         const name = patientData.name[0];
  //         setPatient(`${name.given.join(' ')} ${name.family}`);
  //       } else if (patientResponse.status === 401) {
  //         alert('Unauthorized access. Please log in again.');
  //         navigate('/login');
  //         return;
  //       } else {
  //         console.error(`Error fetching patient: ${patientResponse.status}`);
  //       }
  
  //       // Fetch encounters
  //       const encountersResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}/encounters`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': authCredentials, // Use stored credentials
  //         },
  //       });
  
  //       if (encountersResponse.ok) {
  //         const encountersData = await encountersResponse.json();
  //         if (encountersData.entry) {
  //           // Map encounters and fetch DiagnosticReport status for each encounter
  //           const encounterList = await Promise.all(encountersData.entry.map(async entry => {
  //             const resource = entry.resource;
  //             const id = resource.id;
  //             const description = resource.reasonCode && resource.reasonCode[0] ? resource.reasonCode[0].text : 'No Description';
  //             const status = resource.status || 'No Status';
  //             const date = resource.period && resource.period.start ? resource.period.start : 'No Date';
  
  //             // Check for videoUploaded extension
  //             const videoUploadedExtension = resource.extension && resource.extension.find(ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded');
  //             const videoUploaded = videoUploadedExtension ? videoUploadedExtension.valueBoolean : false;
  
  //             // Fetch DiagnosticReport status for the encounter
  //             let diagnosticReportStatus = 'registered'; // Default to 'registered'
  //             try {
  //               const diagnosticReportResponse = await fetch(`${process.env.REACT_APP_API_URL}/diagnostic-report/status/${id}`, {
  //                 headers: {
  //                   'Authorization': authCredentials,
  //                 },
  //               });
  
  //               if (diagnosticReportResponse.ok) {
  //                 const reportData = await diagnosticReportResponse.json();
  //                 diagnosticReportStatus = reportData.status || 'registered';
  //               }
  //             } catch (error) {
  //               console.error(`Error fetching diagnostic report status for encounter ${id}:`, error);
  //             }
  
  //             return { 
  //               id, 
  //               description, 
  //               status, 
  //               date, 
  //               videoUploaded, 
  //               readEnabled: videoUploaded, 
  //               dReport: diagnosticReportStatus 
  //             };
  //           }));
  
  //           encounterList.sort((a, b) => new Date(a.date) - new Date(b.date));
  //           setEncounters(encounterList);
  //         } else {
  //           setEncounters([]); // No encounters
  //         }
  //       } else if (encountersResponse.status === 401) {
  //         alert('Unauthorized access. Please log in again.');
  //         navigate('/login');
  //       } else {
  //         console.error(`Error fetching encounters: ${encountersResponse.status}`);
  //       }
  
  //     } catch (error) {
  //       console.error('Error fetching patient or encounters:', error);
  //     }
  //   };
  
  //   fetchPatientDetails();
  // }, [patientId]);

  useEffect(() => {
    const fetchPatientDetails = async () => {  
      try {
        // Fetch patient details
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
  
        // Fetch encounters
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
  
              // Check for videoUploaded extension
              const videoUploadedExtension = resource.extension && resource.extension.find(ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded');
              const videoUploaded = videoUploadedExtension ? videoUploadedExtension.valueBoolean : false;
  
              // Set readEnabled based on whether a video was uploaded
              return { 
                id, 
                description, 
                status, 
                date, 
                videoUploaded, 
                readEnabled: videoUploaded 
              };
            });
  
            encounterList.sort((a, b) => new Date(a.date) - new Date(b.date));
            setEncounters(encounterList);
          } else {
            setEncounters([]); // No encounters
          }
        } else if (encountersResponse.status === 401) {
          alert('Unauthorized access. Please log in again.');
          navigate('/login');
        } else {
          console.error(`Error fetching encounters: ${encountersResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching patient or encounters:', error);
      }
    };
  
    fetchPatientDetails();
  }, [patientId]);
  
  


  // useEffect(() => {
  //   const fetchPatientDetails = async () => {  
  //     try {
  //       // Fetch patient details
  //       const patientResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': authCredentials, // Use stored credentials
  //         },
  //       });
  
  //       if (patientResponse.ok) {
  //         const patientData = await patientResponse.json();
  //         const name = patientData.name[0];
  //         setPatient(`${name.given.join(' ')} ${name.family}`);
  //       } else if (patientResponse.status === 401) {
  //         alert('Unauthorized access. Please log in again.');
  //         navigate('/login');
  //       } else {
  //         console.error(`Error fetching patient: ${patientResponse.status}`);
  //       }
  
  //       // Fetch encounters
  //       const encountersResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}/encounters`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': authCredentials, // Use stored credentials
  //         },
  //       });
  
  //       if (encountersResponse.ok) {
  //         const encountersData = await encountersResponse.json();
  //         if (encountersData.entry) {
  //           const encounterList = encountersData.entry.map(entry => {
  //             const resource = entry.resource;
  //             const id = resource.id;
  //             const description = resource.reasonCode && resource.reasonCode[0] ? resource.reasonCode[0].text : 'No Description';
  //             const status = resource.status || 'No Status';
  //             const date = resource.period && resource.period.start ? resource.period.start : 'No Date';
  
  //             // Check for videoUploaded extension
  //             const videoUploadedExtension = resource.extension && resource.extension.find(ext => ext.url === 'http://example.com/fhir/StructureDefinition/videoUploaded');
  //             const videoUploaded = videoUploadedExtension ? videoUploadedExtension.valueBoolean : false;
  
  //             return { id, description, status, date, videoUploaded, readEnabled: videoUploaded, dReport: false };
  //           });
  //           encounterList.sort((a, b) => new Date(a.date) - new Date(b.date));
  //           setEncounters(encounterList);
  //         } else {
  //           setEncounters([]); // No encounters
  //         }
  //       } else if (encountersResponse.status === 401) {
  //         alert('Unauthorized access. Please log in again.');
  //         navigate('/login');
  //       } else {
  //         console.error(`Error fetching encounters: ${encountersResponse.status}`);
  //       }
  
  //     } catch (error) {
  //       console.error('Error fetching patient or encounters:', error);
  //     }
  //   };
  
  //   fetchPatientDetails();
  // }, [patientId]);
  
//=======================================================================

  // const handleAddEncounter = () => {
  //   setLoading(true); // Set loading state
  
  //   const encounterData = {
  //     resourceType: "Encounter",
  //     subject: {
  //       reference: `Patient/${patientId}`
  //     },
  //     period: {
  //       start: new Date(newEncounter.date).toISOString()
  //     },
  //     reasonCode: [{
  //       text: newEncounter.description
  //     }],
  //     status: newEncounter.status
  //   };  
    
  //   const optimisticEnc = {
  //     id: `optimistic-${Date.now()}`,
  //     description: newEncounter.description,
  //     status: newEncounter.status,
  //     date: new Date(newEncounter.date).toISOString(),
  //     videoUploaded: false,
  //     readEnabled: false,
  //     dReport: false
  //   };
  
  //   setEncounters(prevEncounters => [...prevEncounters, optimisticEnc]);
  
  //   fetch(`${process.env.REACT_APP_API_URL}/encounterWithReport`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/fhir+json',
  //       'Authorization': authCredentials, // Use stored credentials
  //     },
  //     body: JSON.stringify(encounterData),
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       setEncounters(prevEncounters => prevEncounters.map(enc =>
  //         enc.id === optimisticEnc.id ? {
  //           id: data.id,
  //           description: data.reasonCode && data.reasonCode[0] ? data.reasonCode[0].text : 'No Description',
  //           status: data.status || 'No Status',
  //           date: data.period && data.period.start ? data.period.start : 'No Date',
  //           videoUploaded: false,
  //           readEnabled: false,
  //           dReport: false
  //         } : enc
  //       ));
  //       setLoading(false); // Clear loading state
  //       setShowModal(false);
  //       setNewEncounter({ description: '', date: '', status: 'planned' });
  //     })
  //     .catch(error => {
  //       console.error('Error adding encounter:', error);
  //       setEncounters(prevEncounters => prevEncounters.filter(enc => enc.id !== optimisticEnc.id));
  //       setLoading(false); // Clear loading state
  //     });
  // };

  // const handleAddEncounter = () => {
  //   setLoading(true); // Set loading state
  
  //   const encounterData = {
  //     resourceType: "Encounter",
  //     subject: {
  //       reference: `Patient/${patientId}`
  //     },
  //     period: {
  //       start: new Date(newEncounter.date).toISOString()
  //     },
  //     reasonCode: [{
  //       text: newEncounter.description
  //     }],
  //     status: newEncounter.status
  //   };
  
  //   const optimisticEnc = {
  //     id: `optimistic-${Date.now()}`,
  //     description: newEncounter.description,
  //     status: newEncounter.status,
  //     date: new Date(newEncounter.date).toISOString(),
  //     videoUploaded: false,
  //     readEnabled: false,
  //     dReport: false
  //   };
  
  //   setEncounters(prevEncounters => [...prevEncounters, optimisticEnc]);
  
  //   fetch(`${process.env.REACT_APP_API_URL}/encounterWithReport`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/fhir+json',
  //       'Authorization': authCredentials, // Use stored credentials
  //     },
  //     body: JSON.stringify(encounterData),
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       // Access the `encounter` field in the combined response
  //       const createdEncounter = data.encounter;
  
  //       // Update the encounters list with the new encounter data
  //       setEncounters(prevEncounters => prevEncounters.map(enc =>
  //         enc.id === optimisticEnc.id ? {
  //           id: createdEncounter.id,
  //           description: createdEncounter.reasonCode && createdEncounter.reasonCode[0] ? createdEncounter.reasonCode[0].text : 'No Description',
  //           status: createdEncounter.status || 'No Status',
  //           date: createdEncounter.period && createdEncounter.period.start ? createdEncounter.period.start : 'No Date',
  //           videoUploaded: false,
  //           readEnabled: false,
  //           dReport: false
  //         } : enc
  //       ));
  //       setLoading(false); // Clear loading state
  //       setShowModal(false);
  //       setNewEncounter({ description: '', date: '', status: 'planned' });
  //     })
  //     .catch(error => {
  //       console.error('Error adding encounter:', error);
  //       setEncounters(prevEncounters => prevEncounters.filter(enc => enc.id !== optimisticEnc.id));
  //       setLoading(false); // Clear loading state
  //     });
  // };

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
            'Authorization': authCredentials, // Use stored credentials
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
        setLoading(false); // Clear loading state
        setShowModal(false);
        setNewEncounter({ description: '', date: '', status: 'planned' });
    })
    .catch(error => {
        console.error('Error adding encounter:', error);
        setEncounters(prevEncounters => prevEncounters.filter(enc => enc.id !== optimisticEnc.id));
        setLoading(false); // Clear loading state
    });
};

  
  

  const handleUploadClick = (index) => {
    setSelectedEncounterIndex(index);
    setShowVideoModal(true);
  };

  // const handleUpload = async (file) => {
  //   if (!file) {
  //     alert('Please select a file to upload');
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   const encounterId = encounters[selectedEncounterIndex].id; // Define encounterId
  
  //   try {
  //     const response = await fetch(`http://localhost:9090/upload?patientId=${patientId}&encounterId=${encounterId}`, {
  //       method: 'POST',
  //       body: formData,
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Error uploading file');
  //     }

  //     const data = await response.json();
  //     console.log('media created with ID = ', data.id);
  
  //     const videoUrl = `http://localhost:9000/videos-bucket/${file.name}`;
  
  //     // Update encounter with video URL
  //     setEncounters(encounters.map((enc, i) => i === selectedEncounterIndex ? {
  //       ...enc,
  //       status: 'in-progress',
  //       videoUploaded: true,
  //       readEnabled: true,
  //       videoUrl: videoUrl // Set the correct video URL
  //     } : enc));
  //     setShowVideoModal(false);
  //   } catch (err) {
  //     console.error('Error uploading video:', err);
  //   }
  // };

  // const handleUpload = async (file, setUploadProgress) => {
  //   if (!file) {
  //     alert('Please select a file to upload');
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   const encounterId = encounters[selectedEncounterIndex].id; // Define encounterId
  
  //   try {
  //     // Create a new XMLHttpRequest
  //     const xhr = new XMLHttpRequest();
  //     xhr.open('POST', `${process.env.REACT_APP_API_URL}/upload?patientId=${patientId}&encounterId=${encounterId}`, true);
  
  //     // Set up the progress event listener
  //     xhr.upload.onprogress = (event) => {
  //       if (event.lengthComputable) {
  //         const percentCompleted = Math.round((event.loaded * 100) / event.total);
  //         setUploadProgress(percentCompleted);
  //       }
  //     };
  
  //     // Set up the load event listener
  //     xhr.onload = () => {
  //       if (xhr.status === 200) {
  //         const data = JSON.parse(xhr.responseText);
  //         console.log('media created with ID = ', data.id);
  
  //         const videoUrl = `${process.env.REACT_APP_API_URL}/videos-bucket/${file.name}`;
          
  //         // Update encounter with video URL
  //         setEncounters(encounters.map((enc, i) => i === selectedEncounterIndex ? {
  //           ...enc,
  //           status: 'in-progress',
  //           videoUploaded: true,
  //           readEnabled: true,
  //           videoUrl: videoUrl // Set the correct video URL
  //         } : enc));
  //         setShowVideoModal(false);
  //         setUploadProgress(0); // Reset the progress bar after upload
  //       } else {
  //         alert('Error uploading file');
  //         setUploadProgress(0);
  //       }
  //     };
  
  //     // Set up the error event listener
  //     xhr.onerror = () => {
  //       console.error('Error uploading video');
  //       alert('Error uploading video');
  //       setUploadProgress(0);
  //     };
  
  //     // Send the form data
  //     xhr.send(formData);
  //   } catch (err) {
  //     console.error('Error uploading video:', err);
  //     alert('Error uploading video');
  //     setUploadProgress(0);
  //   }
  // };

  const handleUpload = async (file, setUploadProgress) => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    const encounterId = encounters[selectedEncounterIndex].id; // Define encounterId
  
    try {  
      // Create a new XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${process.env.REACT_APP_API_URL}/upload?patientId=${patientId}&encounterId=${encounterId}`, true);
  
      // Set the Authorization header with the stored credentials
      xhr.setRequestHeader('Authorization', authCredentials);
  
      // Set up the progress event listener
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentCompleted);
        }
      };
  
      // Set up the load event listener
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log('Media created with ID =', data.id);
  
          const videoUrl = `${process.env.REACT_APP_API_URL}/videos-bucket/${file.name}`;
          
          // Update encounter with video URL
          setEncounters(encounters.map((enc, i) => i === selectedEncounterIndex ? {
            ...enc,
            status: 'in-progress',
            videoUploaded: true,
            readEnabled: true,
            videoUrl: videoUrl // Set the correct video URL
          } : enc));
          setShowVideoModal(false);
          setUploadProgress(0); // Reset the progress bar after upload
        } else {
          alert('Error uploading file');
          setUploadProgress(0);
        }
      };
  
      // Set up the error event listener
      xhr.onerror = () => {
        console.error('Error uploading video');
        alert('Error uploading video');
        setUploadProgress(0);
      };
  
      // Send the form data
      xhr.send(formData);
    } catch (err) {
      console.error('Error uploading video:', err);
      alert('Error uploading video');
      setUploadProgress(0);
    }
  };
  
  
  

  const handleReadClick = async (encounter) => {
    try {
      const authCredentials = localStorage.getItem('authCredentials'); // Retrieve stored credentials
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounter.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials, // Use stored credentials
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
      const authCredentials = localStorage.getItem('authCredentials'); // Retrieve stored credentials
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/diagnostic-report?encounterId=${encounter.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials, // Use stored credentials
        },
      });
  
      if (response.status === 404) {
        // Generate PDF without conclusion and images
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
  
        let currentY = 60; // Start position for images
        const maxY = 270; // Maximum Y position on a page
  
        const imagePromises = data.presentedForm.map((form, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = form.url;
            img.onload = () => {
              const imgWidth = 100; // Fixed width for images
              const imgHeight = (img.height / img.width) * imgWidth; // Maintain aspect ratio
  
              if (currentY + imgHeight > maxY) {
                doc.addPage();
                currentY = 10; // Reset Y position for new page
              }
  
              doc.addImage(img, 'PNG', 10, currentY, imgWidth, imgHeight); // Adjust the positioning as needed
              currentY += imgHeight + 10; // Add space between images
  
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
                    <button onClick={() => handleReadClick(encounter)}>
                      {encounter.status === 'finished' ? 'Review' : 'Read'}
                    </button>
                  ) : (
                    <button disabled>Read</button>
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => encounter.status === 'finished' && generatePDF(encounter)}
                    disabled={encounter.status !== 'finished'}
                    style={{ opacity: encounter.status === 'finished' ? 1 : 0.5 }} // Fades the icon if not finished
                  >
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
