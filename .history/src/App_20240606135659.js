import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Patients from './components/Patients';
import Login from './components/Login';
import Layout from './components/Layout';
import useAuth from './hooks/useAuth';

const App = () => {
  const [auth, setAuth] = useState(localStorage.getItem('auth') === 'true');

  return (
    <Router>
      <AuthWrapper setAuth={setAuth}>
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          {auth ? (
            <>
              <Route path="/" element={<Layout><Patients /></Layout>} />
              <Route path="/patient/:patientId" element={<Layout><PatientDetails /></Layout>} />
              <Route path="/video/:videoUrl" element={<Layout><VideoPlayer /></Layout>} />
            </>
          ) : (
            <Route path="*" element={<Login setAuth={setAuth} />} />
          )}
        </Routes>
      </AuthWrapper>
    </Router>
  );
};

const AuthWrapper = ({ setAuth, children }) => {
  const navigate = useNavigate();

  useAuth(() => {
    setAuth(false);
    alert('Your session has expired. Please log in again.');
    navigate('/login');
  });

  return children;
};

export default App;
