import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Patients from './components/Patients';
import Login from './components/Login';
import Layout from './components/Layout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Patients /></Layout>} />
        <Route path="/patient/:patientId" element={<Layout><PatientDetails /></Layout>} />
        <Route path="/video/:videoUrl" element={<Layout><VideoPlayer /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;