import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [comment, setComment] = useState('');
  const [findings, setFindings] = useState([]);
  const [showFindingsModal, setShowFindingsModal] = useState(false);
  const [error, setError] = useState(null);
  const [mediaId, setMediaId] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`http://localhost:9090/media/${videoUrl}`);
        
      } catch (err) {
        console.error('Error fetching media:', err);
      }
    };

    const fetchFindings = async (mediaId) => {
      try {
        const response = await fetch(`http://localhost:9090/findings/${mediaId}`);
        const data = await response.json();
        setFindings(data);
        console.log(`Fetched media with ID: `, mediaId); // Log the mediaId here
      } catch (err) {
        console.error('Error fetching findings:', err);
      }
    };

    fetchMedia();
  }, [videoUrl]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log(`Fetched media with ID: `, mediaId); // Log the mediaId here
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
    try {
      const videoElement = playerRef.current.getInternalPlayer();
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');
      return dataURL;
    } catch (error) {
      setError('Failed to capture frame. This might be due to CORS restrictions.');
      return null;
    }
  };

  const handleAddFinding = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      const frameImage = captureFrame();
      if (frameImage) {
        setCurrentTime(time);
        setCurrentFrame(frameImage);
        setShowCommentModal(true);
      }
    }
  };

  const handleSaveComment = async () => {
    const newFinding = {
      mediaId: mediaId,
      time: currentTime,
      comment: comment,
      frame: currentFrame,
    };

    try {
      const formData = new FormData();
      formData.append('mediaId', newFinding.mediaId);
      formData.append('time', newFinding.time);
      formData.append('comment', newFinding.comment);
      formData.append('frame', dataURLtoFile(newFinding.frame, 'frame.png'));

      const response = await fetch('http://localhost:9090/findings', {
        method: 'POST',
        body: formData,
      });

      const savedFinding = await response.json();
      setFindings([...findings, savedFinding]);
      setShowCommentModal(false);
      setComment('');
    } catch (err) {
      console.error('Error saving comment:', err);
    }
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleShowFindings = () => {
    setShowFindingsModal(true);
  };

  return (
    <div className="video-player-container">
      <button onClick={() => navigate(-1)}>Back</button>
      <div className="video-section">
        <div className="top-controls">
          <button onClick={handleAddFinding}>Add Finding</button>
          <button onClick={handleShowFindings}>Read Findings</button>
        </div>
        <ReactPlayer
          ref={playerRef}
          url={decodeURIComponent(videoUrl)}
          playing={isPlaying}
          controls
          width="80%"
          height="600px"
          config={{ file: { attributes: { crossOrigin: 'anonymous' } } }}
        />
        <div className="bottom-controls">
          <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={handleRewind}>Rewind 10s</button>
          <button onClick={handleForward}>Forward 10s</button>
          <button onClick={handleFrameBackward}>Frame Backward</button>
          <button onClick={handleFrameForward}>Frame Forward</button>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="360"></canvas>

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
                    <p>Frame: <img src={finding.frame} alt={`Frame at ${finding.time}`} width="90" height="90" /></p>
                    <p>Comment: {finding.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowFindingsModal(false)}>Close</button>
          </div>
        </div>
      )}

      {error && (
        <div className="modal">
          <div className="modal-content">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
