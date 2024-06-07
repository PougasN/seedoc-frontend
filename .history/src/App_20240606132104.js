import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Patients from './components/Patients';
import Login from './components/Login';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={isAuthenticated ? <Layout username={username} onLogout={handleLogout} component={Patients} /> : <Navigate to="/login" />} />
        <Route path="/patient/:patientId" element={isAuthenticated ? <Layout username={username} onLogout={handleLogout} component={PatientDetails} /> : <Navigate to="/login" />} />
        <Route path="/video/:videoUrl" element={isAuthenticated ? <Layout username={username} onLogout={handleLogout} component={VideoPlayer} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
