import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [comment, setComment] = useState('');
  const [findings, setFindings] = useState([]);

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

  return (
    <div className="video-player-container">
      <button onClick={() => navigate(-1)}>Back</button>
      <ReactPlayer ref={playerRef} url={decodeURIComponent(videoUrl)} controls width="80%" height="60%" />
      <button onClick={handleAddFinding}>Add Finding</button>

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
    </div>
  );
};

export default VideoPlayer;
