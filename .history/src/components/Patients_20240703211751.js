import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    givenName: '',
    familyName: '',
    gender: '',
    birthDate: ''
  });
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9090/patients')
      .then(response => response.json())
      .then(data => {
        if (data.entry) {
          const patientNames = data.entry.map(entry => {
            const name = entry.resource.name[0];
            return {
              fullName: `${name.given.join(' ')} ${name.family}`,
              familyName: name.family,
              birthDate: entry.resource.birthDate,
              id: entry.resource.id
            };
          });
          setPatients(patientNames);
        } else {
          setPatients([]); // Handle the case when there are no patients
        }
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
      gender: newPatient.gender,
      birthDate: newPatient.birthDate
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
        setPatients([...patients, {
          fullName: `${name.given.join(' ')} ${name.family}`,
          familyName: name.family,
          birthDate: data.birthDate,
          id: data.id
        }]);
        setShowModal(false);
        setNewPatient({ givenName: '', familyName: '', gender: '', birthDate: '' });
      })
      .catch(error => console.error('Error adding patient:', error));
  };  

  const handlePatientClick = (id) => {
    console.log('patientId = ' , id);
    navigate(`/patient/${id}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.familyName?.toLowerCase().startsWith(searchText.toLowerCase())
  );

  return (
    <div className="patients-container">
      <h1>Patients</h1>
      <button onClick={() => setShowModal(true)}>Add Patient</button>
      <input
        type="text"
        placeholder="Search by surname"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
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
          {filteredPatients.map((patient, index) => (
            <tr key={index} onClick={() => handlePatientClick(patient.id)}>
              <td>{index + 1}</td>
              <td>{patient.fullName}</td>
              <td>{patient.birthDate}</td>
            </tr>
          ))}
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
