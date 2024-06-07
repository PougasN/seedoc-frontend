import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ givenName: '', familyName: '' });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9090/patients')
      .then(response => response.json())
      .then(data => {
        const patientNames = data.entry.map(entry => {
          const name = entry.resource.name && entry.resource.name[0];
          const birthDate = entry.resource.birthDate;
          return {
            fullName: name ? `${name.given ? name.given.join(' ') : ''} ${name.family || ''}` : 'No Name',
            id: entry.resource.id,
            birthDate: birthDate || 'Unknown'
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
        setPatients([...patients, { fullName: `${name.given.join(' ')} ${name.family}`, id: data.id, birthDate: data.birthDate }]);
        setShowModal(false);
        setNewPatient({ givenName: '', familyName: '' });
      })
      .catch(error => console.error('Error adding patient:', error));
  };

  const handlePatientClick = (id) => {
    navigate(`/patient/${id}`);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Patients</h1>
      <button onClick={() => setShowModal(true)}>Add Patient</button>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by surname"
      />
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Birth Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length === 0 ? (
            <tr>
              <td colSpan="3">No patients found</td>
            </tr>
          ) : (
            filteredPatients.map((patient, index) => (
              <tr key={index} onClick={() => handlePatientClick(patient.id)}>
                <td>{index + 1}</td>
                <td>{patient.fullName}</td>
                <td>{patient.birthDate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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
