import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileWaveform, faSave } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, encounterId, mediaId, patientId, name, surname, birthdate, gender, encounterStatus, showReportModalHandler, role }) => {
  const [isPreRead, setIsPreRead] = useState(false);
  const authCredentials = localStorage.getItem('authCredentials');
  const navigate = useNavigate();

  // Fetch the pre-read status from the backend
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
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/nursePreReadStatus'
        );
        setIsPreRead(preReadExtension?.valueBoolean || false);
      } catch (error) {
        console.error('Failed to fetch pre-read status:', error);
      }
    };

    if (encounterId && role === 'ROLE_NURSE') {
      fetchPreReadStatus();
    }
  }, [encounterId, role]);

  const savePreReading = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/${encounterId}/nursePreRead`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
          body: JSON.stringify({ nursePreReadStatus: true }),
        }
      );
      if (response.ok) {
        setIsPreRead(true);
        navigate(-1); // Redirect back to encounters list
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
      ) : role === "ROLE_NURSE" ? (
          isPreRead === true ? (
            <div title={isPreRead ? "Review" : "Save PreReading"} className={`overlay-report-button ${isPreRead ? 'faded' : ''}`} onClick={!isPreRead ? savePreReading : null}>
              <span className="report-text">Save</span>
              <FontAwesomeIcon icon={faFileWaveform} />
            </div>
          ) : (
            <div title={isPreRead ? "Review" : "Save PreReading"} className={`overlay-report-button ${isPreRead ? 'faded' : ''}`} onClick={!isPreRead ? savePreReading : null}>
              <span className="report-text">Save</span>
              <FontAwesomeIcon icon={faFileWaveform} />
            </div>
          )     
      ) : null}
    </div>
  );
};

export default Sidebar;
