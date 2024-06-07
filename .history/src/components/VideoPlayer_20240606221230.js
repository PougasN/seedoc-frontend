import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from './Modal';

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const playerRef = useRef(null);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [findings, setFindings] = useState([]);
  const [newFinding, setNewFinding] = useState({ time: '', frame: '', comment: '' });

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
    }
  };

  const handleRewind = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
    }
  };

  const handleFrameForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + 1 / 5);
    }
  };

  const handleFrameBackward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() - 1 / 5);
    }
  };

  const captureFrame = () => {
    const video = playerRef.current.getInternalPlayer();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  };

  const handleAddFinding = () => {
    const time = playerRef.current.getCurrentTime();
    const frame = captureFrame();
    setNewFinding({ time, frame, comment: '' });
    setShowModal(true);
  };

  const handleSaveFinding = () => {
    setFindings([...findings, newFinding]);
    setShowModal(false);
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={handleAddFinding}>Add Finding</button>
      <button onClick={() => setShowModal(true)}>Read Findings</button>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <ReactPlayer
          ref={playerRef}
          url={decodeURIComponent(videoUrl)}
          playing={isPlaying}
          controls
          width="80%"
          height="auto"
        />
        <div style={{ marginTop: '20px' }}>
          <button onClick={handlePlayPause} style={{ margin: '0 10px' }}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={handleRewind} style={{ margin: '0 10px' }}>Rewind 10s</button>
          <button onClick={handleForward} style={{ margin: '0 10px' }}>Forward 10s</button>
          <button onClick={handleFrameBackward} style={{ margin: '0 10px' }}>Frame Backward</button>
          <button onClick={handleFrameForward} style={{ margin: '0 10px' }}>Frame Forward</button>
        </div>
      </div>
      <Modal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSaveFinding}
      >
        {newFinding.time ? (
          <div>
            <p>Time: {newFinding.time.toFixed(2)}s</p>
            <img src={newFinding.frame} alt="Captured Frame" style={{ width: '100%' }} />
            <textarea
              value={newFinding.comment}
              onChange={(e) => setNewFinding({ ...newFinding, comment: e.target.value })}
              placeholder="Add comment"
              style={{ width: '100%', height: '100px' }}
            />
          </div>
        ) : (
          <div>
            <h2>Findings</h2>
            {findings.map((finding, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <p>Time: {finding.time.toFixed(2)}s</p>
                <img src={finding.frame} alt="Captured Frame" style={{ width: '100%' }} />
                <p>Comment: {finding.comment}</p>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <button onClick={handleSaveFinding}>Save</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default VideoPlayer;
