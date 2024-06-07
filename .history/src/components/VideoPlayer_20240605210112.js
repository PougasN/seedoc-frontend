import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useLocation } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="video-player-container">
      <div className="video-section">
        <button onClick={() => navigate(-1)}>Back</button>
        <ReactPlayer
          ref={playerRef}
          url={decodeURIComponent(state.videoUrl)}
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
        <p><strong>Name:</strong> {state.patientName}</p>
        <p><strong>Birth Date:</strong> {state.birthDate}</p>
        <p><strong>Encounter Date:</strong> {new Date(state.encounterDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
