import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Patients from './components/Patients';
import PatientDetails from './components/PatientDetails';
import VideoPlayer from './components/VideoPlayer';

const App = () => {
  const isAuthenticated = true; // Replace with actual authentication logic
  const username = 'admin';

  return (
    <Router>
      {isAuthenticated ? (
        <Layout username={username}>
          <Routes>
            <Route path="/" element={<Patients />} />
            <Route path="/patient/:patientId" element={<PatientDetails />} />
            <Route path="/video" element={<VideoPlayer />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
