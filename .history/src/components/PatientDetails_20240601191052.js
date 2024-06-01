import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from './Modal';

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
        const name = data.name[0];
        setPatient(`${name.given.join(' ')} ${name.family}`);
      })
      .catch(error => console.error('Error fetching patient:', error));

    fetch(`http://localhost:9090/api/patient/${patientId}/encounters`)
      .then(response => response.json())
      .then(data => {
        const encounterList = data.entry.map(entry => entry.resource);
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
      description: newEncounter.description,
      period: {
        start: newEncounter.date
      }
    };

    fetch('http://localhost:9090/api/encounter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(encounterData),
    })
      .then(response => response.json())
      .then(data => {
        setEncounters([...encounters, data]);
        setShowModal(false);
        setNewEncounter({ description: '', date: '' });
      })
      .catch(error => console.error('Error adding encounter:', error));
  };

  return (
    <div>
      <h1>{patient}</h1>
      <button onClick={() => setShowModal(true)}>Add Encounter</button>
      <ul>
        {encounters.map((encounter, index) => (
          <li key={index}>{encounter.description}</li>
        ))}
      </ul>
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
