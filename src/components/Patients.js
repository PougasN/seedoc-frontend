import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import NewUserModal from './NewUserModal';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);  
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);  
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '' });
  const [newPatient, setNewPatient] = useState({
    givenName: '',
    familyName: '',
    gender: '',
    birthDate: ''
  });
  const patientsPerPage = 50;
  const authCredentials = localStorage.getItem('authCredentials');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {        
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/patients`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        });  
  
        if (response.ok) {
          const data = await response.json();
          if (data.entry) {
            const patientNames = data.entry.map(entry => {
              const patient = entry.resource;
              const name = patient.name[0];
              const givenName = name.given.join(' ').toUpperCase();
              const familyName = name.family.toUpperCase();
  
              // Extract registration date from the created extension
              const createdExtension = patient.meta.extension?.find(
                (ext) => ext.url === "http://example.org/fhir/StructureDefinition/created"
              );
              const registrationDate = createdExtension ? createdExtension.valueDateTime : null;
  
              return {
                givenName,
                familyName,
                fullName: `${givenName} ${familyName}`,
                birthDate: patient.birthDate,
                gender: patient.gender,
                id: patient.id,
                registrationDate,
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

  const handlePatientClick = (id) => {
    navigate(`/patient/${id}`);
  };

  const handleAddPatient = () => {
    const patientData = {
      resourceType: "Patient",
      identifier: [
        {
          system: "http://hospital.smarthealthit.org",
          value: "12345",
        },
      ],
      name: [
        {
          use: "official",
          family: newPatient.familyName.toUpperCase(),
          given: [newPatient.givenName.toUpperCase()],
        },
      ],
      gender: newPatient.gender,
      birthDate: newPatient.birthDate,
    };
  
    fetch(`${process.env.REACT_APP_API_URL}/patient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        Authorization: authCredentials,
      },
      body: JSON.stringify(patientData),
    })
      .then((response) => response.json())
      .then((data) => {
        const name = data.name[0];
  
        // Extract the created extension for the registration date
        const createdExtension = data.meta.extension?.find(
          (ext) => ext.url === "http://example.org/fhir/StructureDefinition/created"
        );
        const registrationDate = createdExtension ? createdExtension.valueDateTime : null;
  
        // Add the new patient with the registration date
        setPatients([
          ...patients,
          {
            fullName: `${name.given.join(" ")} ${name.family}`,
            familyName: name.family.toUpperCase(),
            birthDate: data.birthDate,
            gender: data.gender,
            id: data.id,
            registrationDate, // Include the registration date
          },
        ]);
        
        toast.success("Patient registered successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });        

        setShowModal(false);
        setNewPatient({ givenName: "", familyName: "", gender: "", birthDate: "" });
      })
      .catch((error) => console.error("Error adding patient:", error));
  };  

  const filteredPatients = patients.filter(patient => {
    const givenName = patient.givenName?.toLowerCase() || '';
    const familyName = patient.familyName?.toLowerCase() || '';
    const search = searchText.toLowerCase();
  
    return givenName.startsWith(search) || familyName.startsWith(search);
  }); 

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

    try {
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
        toast.success("User created successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        
        setShowUserModal(false);
        setNewUser({ username: '', password: '', role: '' });
      } else if (response.status === 401) {
          toast.error("Unauthorized Access!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
      } else if (response.status === 400) {
          toast.error("Username already exists!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
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
        <button onClick={() => setShowModal(true)}>New Patient</button>
        <input
          type="text"
          className="search-input"
          placeholder="Search by first or last name"
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
                <th>Birth Date</th>
                <th>Gender</th>                
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5">No Patients found.</td>
                </tr>
              ) : (
                currentPatients.map((patient, index) => (
                  <tr key={index} onClick={() => handlePatientClick(patient.id)}>
                    <td>{index + 1}</td>
                    <td>{patient.fullName}</td>
                    <td>{patient.birthDate}</td>
                    <td>{patient.gender.charAt(0).toUpperCase()}</td>                    
                    <td>
                      {patient.registrationDate
                        ? new Date(patient.registrationDate).toLocaleDateString("en-CA")
                        : "No Registration Date."}
                    </td>
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
          <ToastContainer />
    </div>
  );
};

export default Patients;
