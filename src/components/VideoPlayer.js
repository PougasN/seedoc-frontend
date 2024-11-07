import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import Sidebar from './Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFileWaveform, faInfo, faBars, faInfoCircle, faPlay, faPause, faUndoAlt, faRedoAlt, faStepBackward, faStepForward, faForward, faForwardFast, faBackwardFast, faBackward, faCircleArrowLeft, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
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
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    patientId: '',
    name: '',
    surname: '',
    birthdate: '',
    gender: ''
});
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/video/${encounterId}`);
        if (response.ok) {
          const blob = await response.blob();
          const videoUrl = URL.createObjectURL(blob);
          setVideoUrl(videoUrl);
        } else {
          console.error('Error fetching video:', response.statusText);
        }
      } catch (err) {
        console.error('Error fetching video:', err);
      }
    };  
    const fetchMedia = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/media/${mediaId}`);
        const data = await response.json();
        if (data && data.content && data.content.url) {
          fetchFindings();
        }
      } catch (err) {
        console.error('Error fetching media:', err);
      }
    };    
    const fetchEncounterAndPatientDetails = async () => {
      try {
        const encounterResponse = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}`);
        const encounterData = await encounterResponse.json();  
        const patientId = encounterData.subject.reference.split('/')[1];  
        const patientResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}`);
        const patientData = await patientResponse.json();  
        setPatientDetails({
          patientId: patientData.id,
          name: patientData.name[0].given[0],
          surname: patientData.name[0].family,
          birthdate: patientData.birthDate,
          gender: patientData.gender
        });
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };  
    if (encounterId) {
      fetchEncounterAndPatientDetails();
    }
    if (mediaId) {
      fetchMedia();
      fetchFindings();
    }    
    if (encounterId) {
      fetchVideo();
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [mediaId, encounterId]);

  const fetchFindings = async () => {
    if (!mediaId) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/findings/get/${mediaId}`);
      const data = await response.json();
      setFindings(data);
      console.log('fetched FINDINGS successfully!!!')
    } catch (err) {
      console.error('Error fetching findings:', err);
    }
  }
  

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

        const response = await fetch(`${process.env.REACT_APP_API_URL}/findings`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            await response.json(); // Wait for the response and ignore the savedFinding here
            setShowCommentModal(false);
            setComment('');

            // Refresh findings list
            fetchFindings();
        } else {
            console.error('Error saving finding:', response.statusText);
        }
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/diagnostic-report`, {
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
      const updateEncounterResponse = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'finished' }),
      });

      if (!updateEncounterResponse.ok) {
        throw new Error('Error updating encounter status');
      }

      // Fetch encounter to get patientId
      const encounterResponse = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}`);
      if (!encounterResponse.ok) {
        throw new Error('Error fetching encounter');
      }

      const encounterData = await encounterResponse.json();
      const patientId = encounterData.subject.reference.split('/')[1];

      setShowReportModal(false);
      setSelectedFrames([]);
      setConclusion('');
      navigate(`/patient/${patientId}`);
    } catch (err) {
      console.error('Error creating diagnostic report:', err);
    }
  };

  const handleSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    
    return `${h}:${m}:${s}`;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFindingClick = (finding) => {
    setSelectedFinding(finding);
    setShowFindingModal(true);
  };
  
  const closeFindingModal = () => {
    setShowFindingModal(false);
    setSelectedFinding(null);
  };
  
  const goToFinding = () => {
    if (playerRef.current && selectedFinding) {
      playerRef.current.seekTo(selectedFinding.time);
      setShowFindingModal(false);
    }
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
  };

  return (
    <div className="video-player-container">
      {isLoading ? (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="5x" />
      </div>
    ) : (
        <>
      <button className="info-icon" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faInfoCircle} />        
      </button>
      {!isSidebarOpen && (
        <button className="back-icon" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faCircleArrowLeft} />
        </button>
      )}      
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        encounterId={encounterId}
        mediaId={mediaId}
        patientId={patientDetails.patientId}
        name={patientDetails.name}
        surname={patientDetails.surname}
        birthdate={patientDetails.birthdate}
        gender={patientDetails.gender}
      />     
      <div className="video-section">       
        <div className="video-player-wrapper">
          <ReactPlayer
            ref={playerRef}
            url={decodeURIComponent(videoUrl)}
            playing={isPlaying}
            playbackRate={speed}
            onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
            onDuration={(duration) => setDuration(duration)}
            controls
            width="100%"
            height="auto"
            config={{ file: { attributes: { crossOrigin: 'anonymous' } } }}
          />
          <div className="overlay-button-wrapper">
            <div title='Add Finding' className="overlay-finding-button" onClick={handleAddFinding}>
              <FontAwesomeIcon icon={faCirclePlus} />
            </div>
            <div title='Final Report' className='overlay-report-button' onClick={() => setShowReportModal(true)}>
              <FontAwesomeIcon icon={faFileWaveform} />
            </div>
          </div>
          <div className="controls-toolbar">          
            <button title={isPlaying ? "Pause" : "Play"} onClick={handlePlayPause}>
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>          
            <div className="speed-control">
              <label>Speed:</label>
              <input
                  type="number"
                  value={speed}
                  min="0.05"
                  max="2"
                  step="0.05"
                  onChange={(e) => {
                      const newSpeed = parseFloat(e.target.value);
                      // Ensure new speed is within range
                      if (newSpeed >= 0.01 && newSpeed <= 2) {
                          setSpeed(newSpeed);
                      }
                  }}
              />
            </div>

            <button title='Back 10s' onClick={handleRewind}>
                <FontAwesomeIcon icon={faBackwardFast} />
            </button>
            <button title='Forward 10s' onClick={handleForward}>
                <FontAwesomeIcon icon={faForwardFast} />
            </button>
            <button title='Previous Frame' onClick={handleFrameBackward}>
                <FontAwesomeIcon icon={faStepBackward} />
            </button>
            <button title='Next Frame' onClick={handleFrameForward}>
                <FontAwesomeIcon icon={faStepForward} />
            </button>
          </div>
          <div className="progress-info">
            <span>[Frame: {Math.floor(currentTime * 5)} / {Math.floor(duration * 5)}] {((currentTime / duration) * 100).toFixed(2)}% </span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>             
      </div>      

      <div className="findings-preview">
        {findings.map((finding, index) => (
          <div
            key={index}
            className="finding-item"
            onClick={() => handleFindingClick(finding)} // Open modal on click
          >
            <img 
              src={finding.frameUrl} 
              alt={`Finding at ${new Date(finding.time * 1000).toISOString().substr(11, 8)}`} 
              className="finding-thumbnail" 
            />
            <p>{new Date(finding.time * 1000).toISOString().substr(11, 8)}</p>
          </div>
        ))}
      </div>

      {showFindingModal && selectedFinding && (
        <div className="modal">
          <div className="modal-content">
            <h2>Finding Details</h2>
            <img 
              src={selectedFinding.frameUrl} 
              alt="Finding Frame" 
              className="modal-finding-image" 
            />
            <p><strong>Timestamp:</strong> {new Date(selectedFinding.time * 1000).toISOString().substr(11, 8)}</p>
            <p><strong>Comment:</strong> {selectedFinding.comment}</p>
            <button onClick={goToFinding}>Go to Finding</button>
            <button onClick={closeFindingModal}>Close</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="640"></canvas>

      {showCommentModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Finding</h2>
            
            {/* Display the captured frame */}
            {currentFrame && (
              <img 
                src={currentFrame} 
                alt="Captured Frame" 
                className="modal-finding-image" 
                style={{ width: '100%', height: 'auto', marginBottom: '10px', borderRadius: '8px' }}
              />
            )}

            {/* Display the timestamp */}
            <p><strong>Timestamp:</strong> {currentTime ? new Date(currentTime * 1000).toISOString().substr(11, 8) : ''}</p>
            
            {/* Text area for adding a comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here"
              style={{
                width: '100%',
                height: '100px',
                padding: '5px',
                marginTop: '5px',
                resize: 'none',  // Disables resizing
                boxSizing: 'border-box' // Ensures padding doesn't affect the width
              }}
            />

            {/* Save and Cancel buttons */}
            <button onClick={handleSaveComment} style={{ marginTop: '10px' }}>Save</button>
            <button onClick={() => setShowCommentModal(false)} style={{ marginLeft: '10px', marginTop: '10px' }}>Cancel</button>
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
                    <p>Frame:</p>
                    <img src={finding.frameUrl} alt={`Frame at ${finding.time}`} width="90" height="90" />
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
          <div className="report-modal-content">
            <h2>Final Diagnostic Report</h2>            
            <div className="report-modal-findings-preview">
              {findings.map((finding, index) => (
                <div
                  key={index}
                  className={`report-modal-finding-item ${selectedFrames.includes(finding.frameUrl) ? 'selected' : ''}`}
                  onClick={() => {
                    if (selectedFrames.includes(finding.frameUrl)) {
                      setSelectedFrames(selectedFrames.filter(frame => frame !== finding.frameUrl));
                    } else {
                      setSelectedFrames([...selectedFrames, finding.frameUrl]);
                    }
                  }}
                >
                  <img 
                    src={finding.frameUrl} 
                    alt={`Finding at ${new Date(finding.time * 1000).toISOString().substr(11, 8)}`} 
                    className="report-modal-finding-thumbnail"
                  />
                  <p>{new Date(finding.time * 1000).toISOString().substr(11, 8)}</p>
                </div>
              ))}
            </div>
            <textarea
              className="report-modal-conclusion-input"
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Write your conclusion here"
            />
            <div className="report-modal-buttons">
              <button onClick={handleFinalization}>Finalize Report</button>
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



        </>
      )}

    </div>
  );
};

export default VideoPlayer;
