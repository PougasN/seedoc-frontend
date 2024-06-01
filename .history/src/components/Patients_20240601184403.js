import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './Patients.css';  // Create and import a CSS file for styling the modal

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ givenName: '', familyName: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('http://localhost:9090/patients')
      .then(response => response.json())
      .then(data => {
        const patientNames = data.entry.map(entry => {
          const name = entry.resource.name[0];
          return `${name.given.join(' ')} ${name.family}`;
        });
        setPatients(patientNames);
      })
      .catch(error => console.error('Error fetching patients:', error));
  }, []);

  const handleAddPatient = () => {
    const patientData = {
      resourceType: "Patient",
      identifier: [{
        system: "http://hospital.smarthealthit.org",
        value: "12345"
      }],
      name: [{
        use: "official",
        family: newPatient.familyName,
        given: [newPatient.givenName]
      }],
      gender: "male",
      birthDate: "1980-01-01"
    };

    fetch('http://localhost:9090/patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(patientData),
    })
      .then(response => response.json())
      .then(data => {
        const name = data.name[0];
        setPatients([...patients, `${name.given.join(' ')} ${name.family}`]);
        setShowModal(false);
        setNewPatient({ givenName: '', familyName: '' });
      })
      .catch(error => console.error('Error adding patient:', error));
  };

  return (
    <div>
      <h1>Patients</h1>
      <button onClick={() => setShowModal(true)}>Add Patient</button>
      <ul>
        {patients.map((patient, index) => (
          <li key={index}>{patient}</li>
        ))}
      </ul>
      <Modal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleAddPatient}
        newPatient={newPatient}
        setNewPatient={setNewPatient}
      />
    </div>
  );
};

export default Patients;
