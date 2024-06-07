// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Patients from './components/Patients';
import Login from './components/Login';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patient/:patientId" element={<PatientDetails />} />
          <Route path="/video/:videoUrl" element={<VideoPlayer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
