import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useLocation } from 'react-router-dom';
import FindingModal from './FindingModal';

const VideoPlayer = () => {
  const location = useLocation();
  const { videoUrl, encounterId } = location.state || {};
  const [showFindingModal, setShowFindingModal] = useState(false);

  const navigate = useNavigate();

  const handleFindings = () => {
    setShowFindingModal(true);
  };

  const handleSaveFindings = (code, comment) => {
    // Save the findings to the backend
    const findingData = {
      encounterId: encounterId,
      code,
      comment
    };

    fetch('http://localhost:9090/saveFinding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(findingData),
    })
    .then(response => response.json())
    .then(() => {
      setShowFindingModal(false);
      // Optionally, you can add a success message or redirect the user
    })
    .catch(error => {
      console.error('Error saving findings:', error);
    });
  };

  return (
    <div className="container">
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={handleFindings}>Findings</button>
      <ReactPlayer url={decodeURIComponent(videoUrl)} controls className="react-player" />
      <FindingModal 
        show={showFindingModal}
        handleClose={() => setShowFindingModal(false)}
        handleSave={handleSaveFindings}
      />
    </div>
  );
};

export default VideoPlayer;
