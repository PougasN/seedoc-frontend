import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Patients from './components/Patients';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Patients />} />
      </Routes>
    </Router>
  );
}

export default App;
