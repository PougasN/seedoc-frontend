import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { encounterId, mediaId } = useParams();
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
  const [videoUrl, setVideoUrl] = useState('');

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [conclusion, setConclusion] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`http://localhost:9090/media/${mediaId}`);
        const data = await response.json();
        if (data && data.content && data.content.url) {
          setVideoUrl(data.content.url); // Set the video URL from the media resource
          fetchFindings(mediaId);
        }
      } catch (err) {
        console.error('Error fetching media:', err);
      }
    };

    const fetchFindings = async (mediaId) => {
      try {
        const response = await fetch(`http://localhost:9090/findings/${mediaId}`);
        const data = await response.json();
        setFindings(data);
      } catch (err) {
        console.error('Error fetching findings:', err);
      }
    };

    if (mediaId) {
      fetchMedia();
    }
  }, [mediaId]);

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
      
      const uniqueFrameName = `frame-${new Date().getTime()}.png`;
      formData.append('frame', dataURLtoFile(newFinding.frame, uniqueFrameName));

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

  const handleFinalization = async () => {
    const diagnosticReport = {
      resourceType: "DiagnosticReport",
      status: "final",
      code: {
        text: "Diagnostic Report"
      },
      // subject: {
      //   reference: `Patient/${encounter.subject}` // replace with actual patientId
      // },
      encounter: {
        reference: `Encounter/${encounterId}` // replace with actual encounterId
      },
      conclusion: conclusion,
      presentedForm: selectedFrames.map((frameUrl, index) => ({
        contentType: "image/png",
        url: frameUrl,
        title: `Frame ${index + 1}`
      }))
    };
  
    try {
      const response = await fetch('http://localhost:9090/diagnostic-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
        },
        body: JSON.stringify(diagnosticReport),
      });
  
      if (!response.ok) {
        throw new Error('Error creating diagnostic report');
      }
  
      const savedReport = await response.json();
      console.log('Diagnostic Report created with ID = ', savedReport.id);
        
      // Update encounter status to completed
      const updateEncounterResponse = await fetch(`http://localhost:9090/encounter/${encounterId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!updateEncounterResponse.ok) {
        throw new Error('Error updating encounter status');
      }


      setShowReportModal(false);
      setSelectedFrames([]);
      setConclusion('');

      // Navigate back to patient details page
      navigate(`/patient/${encounterId}`);
    } catch (err) {
      console.error('Error creating diagnostic report:', err);
    }
  };

  return (
    <div className="video-player-container">
      <div className="header">
        <button onClick={() => navigate(-1)}>Back</button>
        <div className="ids">
          <span>Encounter ID: {encounterId}</span>
          <span>Media ID: {mediaId}</span>
        </div>
      </div>
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
        <button onClick={() => setShowReportModal(true)}>Report</button>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="640"></canvas>

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
                    <p>Frame: <img src={finding.frameUrl} alt={`Frame at ${finding.time}`} width="90" height="90" /></p>
                    <p>Comment: {finding.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowFindingsModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Report</h2>
            <div className="frames-selection">
              {findings.map((finding, index) => (
                <div key={index}>
                  <input 
                    type="checkbox" 
                    id={`frame-${index}`} 
                    value={finding.frameUrl} 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFrames([...selectedFrames, e.target.value]);
                      } else {
                        setSelectedFrames(selectedFrames.filter(frame => frame !== e.target.value));
                      }
                    }}
                  />
                  <label htmlFor={`frame-${index}`}>
                    <img src={finding.frameUrl} alt={`Frame at ${finding.time}`} width="90" height="90" />
                  </label>
                </div>
              ))}
            </div>
            <textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Write your conclusion here"
            />
            <div className="modal-buttons">
              <button onClick={handleFinalization}>Finalization</button>
              <button onClick={() => setShowReportModal(false)}>Cancel</button>
            </div>
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
