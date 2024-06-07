import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/Login';
import Patients from './components/Patients';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Layout from './components/Layout';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Patients />} />
          <Route path="/patient/:patientId" element={<PatientDetails />} />
          <Route path="/video/:videoUrl" element={<VideoPlayer />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
