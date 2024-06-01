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
  const [loading, setLoading] = useState(false);

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
            const id = resource.id;
            const description = resource.reasonCode && resource.reasonCode[0] ? resource.reasonCode[0].text : 'No Description';
            const status = resource.status || 'No Status';
            const date = resource.period && resource.period.start ? resource.period.start : 'No Date';
            return { id, description, status, date };
          });
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
      status: "planned" // Set a default status for the new encounter
    };

    console.log("Encounter data to be sent:", encounterData);

    // Optimistically update the UI
    const optimisticEnc = {
      id: 'pending',
      description: newEncounter.description,
      status: 'planned',
      date: new Date(newEncounter.date).toISOString()
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
        console.log("Response data:", data);
        // Update the optimistic encounter with the confirmed data
        setEncounters(encounters.map(enc => enc === optimisticEnc ? {
          id: data.id,
          description: data.reasonCode && data.reasonCode[0] ? data.reasonCode[0].text : 'No Description',
          status: data.status || 'No Status',
          date: data.period && data.period.start ? data.period.start : 'No Date'
        } : enc));
        setLoading(false); // Clear loading state
        setShowModal(false);
        setNewEncounter({ description: '', date: '' });
      })
      .catch(error => {
        console.error('Error adding encounter:', error);
        // Remove the optimistic update if the request fails
        setEncounters(encounters.filter(enc => enc !== optimisticEnc));
        setLoading(false); // Clear loading state
      });
  };

  return (
    <div>
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
          </tr>
        </thead>
        <tbody>
          {encounters.length === 0 ? (
            <tr>
              <td colSpan="5">No encounters found</td>
            </tr>
          ) : (
            encounters.map((encounter, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{encounter.id}</td>
                <td>{encounter.description}</td>
                <td>{encounter.status}</td>
                <td>{new Date(encounter.date).toLocaleString()}</td>
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
    </div>
  );
};

export default PatientDetails;
