import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ givenName: '', familyName: '', gender: '', birthDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9090/patients')
      .then(response => response.json())
      .then(data => {
        const patientNames = data.entry.map(entry => {
          const name = entry.resource.name[0];
          const birthDate = entry.resource.birthDate;
          return {
            fullName: `${name.given.join(' ')} ${name.family}`,
            id: entry.resource.id,
            birthDate
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
        const birthDate = data.birthDate;
        setPatients([...patients, { fullName: `${name.given.join(' ')} ${name.family}`, id: data.id, birthDate }]);
        setShowModal(false);
        setNewPatient({ givenName: '', familyName: '', gender: '', birthDate: '' });
      })
      .catch(error => console.error('Error adding patient:', error));
  };

  const handlePatientClick = (id) => {
    navigate(`/patient/${id}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredPatients = sortedPatients.filter(patient => {
    const surname = patient.fullName.split(' ').pop().toLowerCase();
    return surname.startsWith(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h1>Patients</h1>
      <button onClick={() => setShowModal(true)}>Add Patient</button>
      <input
        type="text"
        placeholder="Search by surname"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      <table className="patients-table">
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort('fullName')}>Full Name</th>
            <th onClick={() => handleSort('birthDate')}>Birth Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((patient, index) => (
            <tr key={patient.id} onClick={() => handlePatientClick(patient.id)}>
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
