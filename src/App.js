import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Patients from './components/Patients';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Layout from './components/Layout';
import UserManagement from './components/UserManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route path="patients" element={<Patients />} />
          <Route path="patient/:patientId" element={<PatientDetails />} />
          <Route path="video/:encounterId/:mediaId" element={<VideoPlayer />} />
          <Route path="user-management" element={<UserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
