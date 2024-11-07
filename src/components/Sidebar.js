import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, encounterId, mediaId, patientId, name, surname, birthdate, gender }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSidebar}>✖</button>

        <h2>Video Details</h2>
        <div className="info-grid">
            <p className="label">Encounter ID:</p>
            <p className="value">{encounterId}</p>

            <p className="label">Media ID:</p>
            <p className="value">{mediaId}</p>

        </div>
        
        <h2>Patient Details</h2>            
        <div className="info-grid">
            <p className="label">Patient ID:</p>
            <p className="value">{patientId}</p>

            <p className="label">Name:</p>
            <p className="value">{name} {surname}</p>

            <p className="label">Birthdate:</p>
            <p className="value">{birthdate}</p>

            <p className="label">Gender:</p>
            <p className="value">{gender}</p>
        </div>
    </div>
  );
};

export default Sidebar;
