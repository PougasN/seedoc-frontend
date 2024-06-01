import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from './Modal';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ givenName: '', familyName: '' });
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetch('http://localhost:9090/patients')
      .then(response => response.json())
      .then(data => {
        const patientNames = data.entry.map(entry => {
          const name = entry.resource.name[0];
          return {
            fullName: `${name.given.join(' ')} ${name.family}`,
            id: entry.resource.id
          };
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
        setPatients([...patients, { fullName: `${name.given.join(' ')} ${name.family}`, id: data.id }]);
        setShowModal(false);
        setNewPatient({ givenName: '', familyName: '' });
      })
      .catch(error => console.error('Error adding patient:', error));
  };

  const handlePatientClick = (id) => {
    history.push(`/patient/${id}`);
  };

  return (
    <div>
      <h1>Patients</h1>
      <button onClick={() => setShowModal(true)}>Add Patient</button>
      <ul>
        {patients.map((patient, index) => (
          <li key={index} onClick={() => handlePatientClick(patient.id)}>{patient.fullName}</li>
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
