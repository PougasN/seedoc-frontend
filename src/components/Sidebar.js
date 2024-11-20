import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileWaveform, faSave } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, encounterDesc, encounterId, mediaId, patientId, name, surname, birthdate, gender, encounterStatus, showReportModalHandler, role }) => {
  
  const [isPreRead, setIsPreRead] = useState(false);
  const authCredentials = localStorage.getItem('authCredentials');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreReadStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        });
        const encounterData = await response.json();
        const preReadExtension = encounterData.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/PreReadStatus'
        );
        setIsPreRead(preReadExtension?.valueBoolean || false);
      } catch (error) {
        console.error('Failed to fetch pre-read status:', error);
      }
    };

    if (encounterId && role === 'ROLE_PREREADER') {
      fetchPreReadStatus();
    }
  }, [encounterId, role]);

  const savePreReading = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/${encounterId}/PreRead`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
          body: JSON.stringify({ PreReadStatus: true }),
        }
      );
      if (response.ok) {
        setIsPreRead(true);
        navigate(-1);
      } else {
        console.error("Failed to save pre-reading:", response.status);
      }
    } catch (error) {
      console.error("Error during pre-reading save:", error);
    }
  };

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
      <h2>Encounter Details</h2>
        <div className='encounter-description'>
          <p className="label">Encounter Description:</p>
          <p className="value">{encounterDesc}</p>
        </div>
      {role === "ROLE_DOCTOR" ? (
        encounterStatus !== 'finished' ? (
          <div title="Final Report" className="overlay-report-button" onClick={showReportModalHandler}>
            <span className="report-text">Report</span>
            <FontAwesomeIcon icon={faFileWaveform} />
          </div>
        ) : (
          <div title="Final Report" className="overlay-report-button faded">
            <span className="report-text">Report</span>
            <FontAwesomeIcon icon={faFileWaveform} />
          </div>
        )
      ) : role === "ROLE_PREREADER" ? (
        isPreRead === true || encounterStatus === "finished" ? (
          <div 
            title={isPreRead || encounterStatus === "finished" ? "View" : "Save Pre-Reading"} 
            className={`overlay-report-button faded`}
          >
            <span className="report-text">Save</span>
            <FontAwesomeIcon icon={faFileWaveform} />
          </div>
        ) : (
          <div 
            title={isPreRead || encounterStatus === "finished" ? "View" : "Save Pre-Reading"} 
            className={`overlay-report-button`}
            onClick={!isPreRead && encounterStatus !== "finished" ? savePreReading : null}
          >
            <span className="report-text">Save</span>
            <FontAwesomeIcon icon={faFileWaveform} />
          </div>
        )
      ) : null}
    </div>
  );
};

export default Sidebar;
