// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { EncounterProvider } from './components/EncounterContext';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';
import Patients from './components/Patients';
import Login from './components/Login';


function App() {
  return (
    <EncounterProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Patients />} />
          <Route path="/patient/:patientId" element={<PatientDetails />} />
          <Route path="/video/:videoUrl" element={<VideoPlayer />} />
        </Routes>
      </Router>
    </EncounterProvider>
  );
}

export default App;
