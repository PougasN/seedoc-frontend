import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useLocation } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { videoUrl, patientName, birthDate, encounterDate } = location.state;
  
    return (
      <div style={{ margin: '20px' }}>
        <button onClick={() => navigate(-1)}>Back</button>
        <ReactPlayer url={decodeURIComponent(videoUrl)} controls width="80%" height="400px" />
        <div style={{ marginTop: '20px' }}>
          <p><strong>Patient Name:</strong> {patientName}</p>
          <p><strong>Birth Date:</strong> {birthDate}</p>
          <p><strong>Encounter Date:</strong> {new Date(encounterDate).toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</p>
        </div>
      </div>
    );
  };
  
  export default VideoPlayer;
