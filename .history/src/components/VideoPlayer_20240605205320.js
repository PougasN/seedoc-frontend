import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoUrl, patientId, encounterId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [patient, setPatient] = useState({});
  const [encounter, setEncounter] = useState({});

  useEffect(() => {
    // Fetch patient details
    fetch(`http://localhost:9090/patient/${patientId}`)
      .then(response => response.json())
      .then(data => {
        setPatient({
          name: `${data.name[0].given.join(' ')} ${data.name[0].family}`,
          birthDate: data.birthDate
        });
      })
      .catch(error => console.error('Error fetching patient:', error));

    // Fetch encounter details
    fetch(`http://localhost:9090/encounter/${encounterId}`)
      .then(response => response.json())
      .then(data => {
        setEncounter({
          date: new Date(data.period.start).toLocaleDateString(),
        });
      })
      .catch(error => console.error('Error fetching encounter:', error));
  }, [patientId, encounterId]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="video-player-container">
      <div className="video-section">
        <button onClick={() => navigate(-1)}>Back</button>
        <ReactPlayer
          ref={playerRef}
          url={decodeURIComponent(videoUrl)}
          playing={isPlaying}
          controls
          width="640px"
          height="360px"
        />
        <div className="video-controls">
          <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        </div>
      </div>
      <div className="info-section">
        <h3>Patient Details</h3>
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Birth Date:</strong> {patient.birthDate}</p>
        <p><strong>Encounter Date:</strong> {encounter.date}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
