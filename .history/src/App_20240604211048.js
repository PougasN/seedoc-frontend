import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Patients from './components/Patients';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Patients />} />
        <Route path="/patient/:patientId" element={<PatientDetails />} />
        <Route path="/video/:videoUrl" component={VideoPlayer} />
      </Routes>
    </Router>
  );
}

export default App;
