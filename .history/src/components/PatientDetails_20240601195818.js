import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from './Modal';
import './PatientDetails.css';

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
        console.log("Patient data:", data);
        const name = data.name[0];
        setPatient(`${name.given.join(' ')} ${name.family}`);
      })
      .catch(error => console.error('Error fetching patient:', error));

    fetch(`http://localhost:9090/patient/${patientId}/encounters`)
      .then(response => response.json())
      .then(data => {
        console.log("Encounters data:", data);
        if (data.entry) {
            const encounterList = data.entry.map(entry => {
              const resource = entry.resource;
              const description = resource.reasonCode && resource.reasonCode[0] ? resource.reasonCode[0].text : 'No Description';
              const date = resource.period && resource.period.start ? resource.period.start : 'No Date';
              return { description, date };
            });
            setEncounters(encounterList);
          } else {
            setEncounters([]); // No encounters
          }
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

    console.log("Encounter data to be sent:", encounterData);

    fetch('http://localhost:9090/encounter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(encounterData),
    })
      .then(response => response.json())
      .then(data => {
        console.log("Response data:", data);
        const newEnc = {
          description: data.reasonCode && data.reasonCode[0] ? data.reasonCode[0].text : 'No Description',
          date: data.period && data.period.start ? data.period.start : 'No Date'
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
