import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const playerRef = useRef(null);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [comment, setComment] = useState('');
  const [findings, setFindings] = useState([]);
  const [showFindingsModal, setShowFindingsModal] = useState(false);

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

  const handleAddFinding = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
      setShowCommentModal(true);
    }
  };

  const handleSaveComment = () => {
    const newFinding = {
      time: currentTime,
      comment: comment,
    };
    setFindings([...findings, newFinding]);
    setShowCommentModal(false);
    setComment('');
  };

  const handleShowFindings = () => {
    setShowFindingsModal(true);
  };

  return (
    <div className="video-player-container">
      <button onClick={() => navigate(-1)}>Back</button>
      <div className="video-section">
        <ReactPlayer
          ref={playerRef}
          url={decodeURIComponent(videoUrl)}
          playing={isPlaying}
          controls
          width="80%"
          height="1000px"
        />
        <div className="video-controls">
          <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={handleRewind}>Rewind 10s</button>
          <button onClick={handleForward}>Forward 10s</button>
          <button onClick={handleFrameBackward}>Frame Backward</button>
          <button onClick={handleFrameForward}>Frame Forward</button>
          <button onClick={handleAddFinding}>Add Finding</button>
          <button onClick={handleShowFindings}>Read Findings</button>
        </div>
      </div>

      {showCommentModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Comment</h2>
            <p>Time: {currentTime ? new Date(currentTime * 1000).toISOString().substr(11, 8) : ''}</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here"
            />
            <button onClick={handleSaveComment}>Save</button>
            <button onClick={() => setShowCommentModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showFindingsModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Findings</h2>
            {findings.length === 0 ? (
              <p>No findings added.</p>
            ) : (
              <ul>
                {findings.map((finding, index) => (
                  <li key={index}>
                    <p>Time: {new Date(finding.time * 1000).toISOString().substr(11, 8)}</p>
                    <p>Comment: {finding.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowFindingsModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
