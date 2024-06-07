import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9090/patient')
      .then(response => response.json())
      .then(data => {
        if (data.entry) {
          const patientList = data.entry.map(entry => {
            const resource = entry.resource;
            const name = resource.name && resource.name[0];
            const givenName = name ? name.given.join(' ') : 'No Given Name';
            const familyName = name ? name.family : 'No Family Name';
            const birthDate = resource.birthDate || 'No Birth Date';
            return {
              id: resource.id,
              fullName: `${givenName} ${familyName}`,
              birthDate: birthDate
            };
          });
          setPatients(patientList);
        }
      })
      .catch(error => console.error('Error fetching patients:', error));
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  return (
    <div className="patients-container">
      <h1>Patients</h1>
      <button onClick={() => navigate('/add-patient')}>Add Patient</button>
      <input
        type="text"
        placeholder="Search by surname"
        value={searchQuery}
        onChange={handleSearch}
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
              <tr key={patient.id}>
                <td>{index + 1}</td>
                <td>{patient.fullName}</td>
                <td>{patient.birthDate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Patients;
