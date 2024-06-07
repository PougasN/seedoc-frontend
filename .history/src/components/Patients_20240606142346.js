// Patients.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ givenName: '', familyName: '' });
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'ascending' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9090/patients')
      .then(response => response.json())
      .then(data => {
        const patientNames = data.entry.map(entry => {
          const name = entry.resource.name[0];
          return {
            fullName: `${name.given.join(' ')} ${name.family}`,
            id: entry.resource.id,
            birthDate: entry.resource.birthDate
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

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredPatients = sortedPatients.filter(patient =>
    patient.fullName.toLowerCase().startsWith(searchText.toLowerCase())
  );

  return (
    <div className="fixed-width">
      <h1>Patients</h1>
      <input
        type="text"
        placeholder="Search by surname"
        value={searchText}
        onChange={handleSearchChange}
      />
      <button onClick={() => setShowModal(true)}>Add Patient</button>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => handleSort('fullName')}>Full Name</th>
              <th onClick={() => handleSort('birthDate')}>Birth Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={index} onClick={() => handlePatientClick(patient.id)}>
                <td>{index + 1}</td>
                <td>{patient.fullName}</td>
                <td>{new Date(patient.birthDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
