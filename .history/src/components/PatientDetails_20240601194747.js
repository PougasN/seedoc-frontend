import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from './Modal';
import './PatientDetails.css'; // Ensure this file exists and styles the table

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEncounter, setNewEncounter] = useState({ description: '', date: '' });

  useEffect(() => {
    fetch(`http://localhost:9090/patient/${patientId}`)
      .then(response => response.json())
      .then(data => {
        console.log("Patient data:", data); // Add this line
        const name = data.name[0];
        setPatient(`${name.given.join(' ')} ${name.family}`);
      })
      .catch(error => console.error('Error fetching patient:', error));

    fetch(`http://localhost:9090/patient/${patientId}/encounters`)
      .then(response => response.json())
      .then(data => {
        console.log("Encounters data:", data); // Add this line
        const encounterList = data.entry.map(entry => ({
          description: entry.resource.reasonCode[0]?.text || 'No Description',
          date: entry.resource.period.start
        }));
        setEncounters(encounterList);
      })
      .catch(error => console.error('Error fetching encounters:', error));
  }, [patientId]);

  const handleAddEncounter = () => {
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
      }]
    };

    console.log("Encounter data to be sent:", encounterData); // Add this line

    fetch('http://localhost:9090/encounter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(encounterData),
    })
      .then(response => response.json())
      .then(data => {
        console.log("Response data:", data); // Add this line
        const newEnc = {
          description: data.reasonCode[0]?.text || 'No Description',
          date: data.period.start
        };
        setEncounters([...encounters, newEnc]);
        setShowModal(false);
        setNewEncounter({ description: '', date: '' });
      })
      .catch(error => console.error('Error adding encounter:', error));
  };

  return (
    <div>
      <h1>{patient}</h1>
      <button onClick={() => setShowModal(true)}>Add Encounter</button>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {encounters.map((encounter, index) => (
            <tr key={index}>
              <td>{encounter.description}</td>
              <td>{new Date(encounter.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleAddEncounter}
        newEncounter={newEncounter}
        setNewEncounter={setNewEncounter}
      />
    </div>
  );
};

export default PatientDetails;
