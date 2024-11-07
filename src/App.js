import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Patients from './components/Patients';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route path="patients" element={<Patients />} />
          <Route path="patient/:patientId" element={<PatientDetails />} />
          <Route path="video/:encounterId/:mediaId" element={<VideoPlayer />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
