import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import NewUserModal from './NewUserModal';
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
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10; // Set the number of patients per page
  const authCredentials = localStorage.getItem('authCredentials');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '' });

  useEffect(() => {
    const fetchPatients = async () => {        
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/patients`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials, // Use stored credentials
          },
        });  
        if (response.ok) {
          const data = await response.json();
          if (data.entry) {
            const patientNames = data.entry.map(entry => {
              const name = entry.resource.name[0];
              return {
                fullName: `${name.given.join(' ')} ${name.family}`,
                familyName: name.family,
                birthDate: entry.resource.birthDate,
                gender: entry.resource.gender,
                id: entry.resource.id,
              };
            });
            setPatients(patientNames);
          } else {
            setPatients([]);
          }
        } else if (response.status === 401) {
          alert('Unauthorized access. Please log in again.');
          navigate('/login');
        } else {
          console.error(`Error fetching patients: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
  
    fetchPatients();
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

    fetch(`${process.env.REACT_APP_API_URL}/patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Authorization': authCredentials,
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
          gender: data.gender,
          id: data.id
        }]);
        setShowModal(false);
        setNewPatient({ givenName: '', familyName: '', gender: '', birthDate: '' });
      })
      .catch(error => console.error('Error adding patient:', error));
  };  

  const handlePatientClick = (id) => {
    navigate(`/patient/${id}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.familyName?.toLowerCase().startsWith(searchText.toLowerCase())
  );

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSaveUser = async () => {
    // Ensure all fields are filled
    if (!newUser.username || !newUser.password || !newUser.role) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Retrieve Basic Auth credentials for admin access from localStorage (or set up as needed)
      const adminAuthCredentials = localStorage.getItem('authCredentials');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminAuthCredentials,
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert('User registered successfully!');
        setShowUserModal(false); // Close the modal
        setNewUser({ username: '', password: '', role: '' }); // Reset form
      } else if (response.status === 401) {
        alert('Unauthorized. Please check admin credentials.');
      } else {
        alert(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('An error occurred during registration.');
    }
  };
  

  return (
    <div className="patients-container">
  <h1>Patients</h1>

  <div className="controls-container">
    <button onClick={() => setShowModal(true)}>Add Patient</button>
    <input
      type="text"
      className="search-input"
      placeholder="Search by surname"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />
    <div className="right-buttons">
      <button className="users-list" onClick={() => navigate('/user-management')}>
        Users
      </button>
      <button className="create-new-user" onClick={() => setShowUserModal(true)}>
        Create New User
      </button>
    </div>
  </div>

  <table className="patients-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Full Name</th>
        <th>Gender</th>
        <th>Birth Date</th>
      </tr>
    </thead>
    <tbody>
      {filteredPatients.length === 0 ? (
        <tr>
          <td colSpan="4">No Patients found.</td>
        </tr>
      ) : (
        currentPatients.map((patient, index) => (
          <tr key={index} onClick={() => handlePatientClick(patient.id)}>
            <td>{index + 1}</td>
            <td>{patient.fullName}</td>
            <td>{patient.gender}</td>
            <td>{patient.birthDate}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>

  {totalPages > 1 && (
    <div className="pagination">
      <button onClick={handlePreviousPage} disabled={currentPage === 1}>
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={handleNextPage} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  )}

  <Modal
    show={showModal}
    handleClose={() => setShowModal(false)}
    handleSave={handleAddPatient}
    newPatient={newPatient}
    setNewPatient={setNewPatient}
  />
  <NewUserModal
        show={showUserModal}
        handleClose={() => setShowUserModal(false)}
        handleSave={handleSaveUser}
        newUser={newUser}
        setNewUser={setNewUser}
      />
</div>
  );
};

export default Patients;
