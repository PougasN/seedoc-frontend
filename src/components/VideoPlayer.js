import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import Sidebar from './Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowRight, faArrowLeft, faExpand, faCompress, faHome, faFileWaveform, faInfo, faBars, faInfoCircle, faPlay, faPause, faUndoAlt, faRedoAlt, faStepBackward, faStepForward, faForward, faForwardFast, faBackwardFast, faBackward, faCircleArrowLeft, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { encounterId, mediaId } = useParams();
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
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const authCredentials = localStorage.getItem('authCredentials');
  const userRole = localStorage.getItem('userRole');
  const predefinedComments = [
    "Fresh Blood",
    "Vascular Lesion",
    "Ulcerative Lesion",
    "Polyp",
    "Other"
  ];
  const [selectedComment, setSelectedComment] = useState('');
  const [reportError, setReportError] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [encounterStatus, setEncounterStatus] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoContainerRef = useRef(null);
  const [currentFindingIndex, setCurrentFindingIndex] = useState(0);  
  const [isPreRead, setIsPreRead] = useState('');
  const location = useLocation();
  const { encounterDescription } = location.state || {};
  const [successMessage, setSuccessMessage] = useState('');
  const [overlayMessage, setOverlayMessage] = useState(false);
  const [findingAdded, setFindingAdded] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    patientId: '',
    name: '',
    surname: '',
    birthdate: '',
    gender: ''
  });
  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/video/${encounterId}`, {
          headers: {
            'Authorization': authCredentials,
          },
        });
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/media/${mediaId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        });
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
        const encounterResponse = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        });
        const encounterData = await encounterResponse.json();
        setEncounterStatus(encounterData.status);
        
        const preReadExtension = encounterData.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/PreReadStatus'
        );
        setIsPreRead(preReadExtension?.valueBoolean || false);
  
        const patientId = encounterData.subject.reference.split('/')[1];
  
        const patientResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authCredentials,
          },
        });
        const patientData = await patientResponse.json();
        setPatientDetails({
          patientId: patientData.id,
          name: patientData.name[0].given[0],
          surname: patientData.name[0].family,
          birthdate: patientData.birthDate,
          gender: patientData.gender,
        });
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };
  
    if (encounterId) {
      fetchEncounterAndPatientDetails();
      fetchVideo();
    }
    if (mediaId) {
      fetchMedia();
      fetchFindings();
    }
  
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
  
    const handleScroll = (event) => {
      const scrollSensitivity = 0.2;
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        const newTime = event.deltaY < 0 ? currentTime - scrollSensitivity : currentTime + scrollSensitivity;
        playerRef.current.seekTo(newTime, 'seconds');
      }
    };
  
    const handleKeyDown = (event) => {
      if (isFullScreen && event.key.toLowerCase() === 'f') {
        handleAddFinding();
      }
    };
  
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    if (isFullScreen) {
      window.addEventListener('wheel', handleScroll);
      document.addEventListener('keydown', handleKeyDown);
    }
  
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('wheel', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mediaId, encounterId, isFullScreen, authCredentials]);
  
  const handleAddFinding = async () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      const frameImage = captureFrame();
  
      const existingFinding = findings.find((finding) => {
        const timeTolerance = 0.1;
        return Math.abs(finding.time - time) <= timeTolerance;
      });
  
      if (existingFinding) {
        alert("A finding already exists at this time. Please choose a different moment.");
        return;
      }
  
      if (frameImage) {
        const newFinding = {
          mediaId,
          time,
          comment: "",
          frame: frameImage,
          frameUrl: URL.createObjectURL(dataURLtoFile(frameImage, `frame-${Date.now()}.png`)),
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
            headers: {
              'Authorization': authCredentials,
            },
            body: formData,
          });
  
          if (response.ok) {
            const savedFinding = await response.json();
  
            savedFinding.frameUrl = newFinding.frameUrl;
  
            setFindings((prevFindings) => [...prevFindings, savedFinding].sort((a, b) => a.time - b.time));
  
            setFindingAdded(true);
  
            setTimeout(() => {
              setFindingAdded(false);
            }, 2000);
  
          } else {
            console.error('Error saving finding:', response.statusText);
          }
        } catch (err) {
          console.error('Error saving finding:', err);
        }
      }
    }
  };   
  
  const fetchFindings = async () => {
    if (!mediaId) return;
    try {
      const authCredentials = localStorage.getItem('authCredentials');
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/findings/get/${mediaId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        const sortedFindings = data.sort((a, b) => a.time - b.time);
        setFindings(sortedFindings);
      } else {
        console.error('Error fetching findings:', response.statusText);
      }
    } catch (err) {
      console.error('Error fetching findings:', err);
    }
  };  

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

  const handleSaveComment = async () => {
    const newFinding = {
      mediaId: mediaId,
      time: currentTime,
      comment: selectedComment,
      frame: currentFrame,
    };
  
    try {
      const formData = new FormData();
      formData.append('mediaId', newFinding.mediaId);
      formData.append('time', newFinding.time);
      formData.append('comment', newFinding.comment);
  
      const uniqueFrameName = `frame-${new Date().getTime()}.png`;
      formData.append('frame', dataURLtoFile(newFinding.frame, uniqueFrameName));
  
      const authCredentials = localStorage.getItem('authCredentials');
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/findings`, {
        method: 'POST',
        headers: {
          'Authorization': authCredentials,
        },
        body: formData,
      });
  
      if (response.ok) {
        await response.json();
        setShowCommentModal(false);
        setSelectedComment('');
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

  const handleFinalization = () => {
    if (selectedFrames.length === 0) {
      setReportError('Please select at least one finding.');
      return;
    }
    if (conclusion.trim() === '') {
      setReportError('Please enter a conclusion.');
      return;
    }
  
    setReportError('');  
    setShowConfirmationModal(true);
  };  

  const confirmFinalization = async () => {
    const diagnosticReport = {
      resourceType: "DiagnosticReport",
      status: "final",
      code: {
        text: "Diagnostic Report"
      },
      encounter: {
        reference: `Encounter/${encounterId}`
      },
      conclusion: conclusion,
      presentedForm: selectedFrames.map((frameUrl, index) => ({
        contentType: "image/png",
        url: frameUrl,
        title: `Frame ${index + 1}`
      }))
    };
  
    const authCredentials = localStorage.getItem('authCredentials');
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/diagnostic-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'Authorization': authCredentials,
        },
        body: JSON.stringify(diagnosticReport),
      });
  
      if (!response.ok) {
        throw new Error('Error creating diagnostic report');
      }
  
      const savedReport = await response.json();
      const diagnosticReportId = savedReport.id;

      const updateEncounterResponse = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials,
        },
        body: JSON.stringify({ status: 'finished' }),
      });

      if (!updateEncounterResponse.ok) {
        throw new Error('Error updating encounter status');
      }      
      navigate(-1);
    } catch (err) {
      console.error('Error finalizing report:', err);
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
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
  
    return `${h}:${m}:${s}.${ms}`;
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

  const handleFullScreenToggle = () => {
    const videoContainer = videoContainerRef.current;
  
    if (videoContainer) {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch(err => console.error(`Error trying to enter full-screen mode: ${err.message}`));
      } else {
        document.exitFullscreen()
          .then(() => setIsFullScreen(false))
          .catch(err => console.error(`Error trying to exit full-screen mode: ${err.message}`));
      }
    } else {
      console.error("Video container not found for full-screen toggle.");
    }
  };
  
  const goToNextFinding = () => {
    if (findings && currentFindingIndex < findings.length - 1) {
      const nextFinding = findings[currentFindingIndex + 1];
      playerRef.current.seekTo(nextFinding.time, 'seconds');
      setCurrentFindingIndex(currentFindingIndex + 1);
    }
  };
  
  const goToPreviousFinding = () => {
    if (findings && currentFindingIndex > 0) {
      const previousFinding = findings[currentFindingIndex - 1];
      playerRef.current.seekTo(previousFinding.time, 'seconds');
      setCurrentFindingIndex(currentFindingIndex - 1);
    }
  };  

  const handleSaveCommentForFinding = async (findingId) => {
    if (!selectedComment) {
      toast.error("Please select a pathology before saving.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/findings/${findingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authCredentials,
        },
        body: JSON.stringify({ comment: selectedComment }),
      });
  
      if (response.ok) {
        const updatedFinding = await response.json();
  
        setFindings((prevFindings) =>
          prevFindings.map((finding) =>
            finding.id === findingId ? { ...finding, comment: updatedFinding.comment } : finding
          )
        );
  
        setSelectedComment("");
        setSelectedFinding((prevFinding) => ({
          ...prevFinding,
          comment: updatedFinding.comment,
        }));
      } else {
        console.error("Error updating finding:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  return (
    <div className="video-player-container">
      {isLoading ? (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="5x" />
      </div>
    ) : (
        <>        
        {!isSidebarOpen && (
        <button className="back-icon" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faHome} />
        </button>
      )}
      <button className="info-icon" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faInfoCircle} />        
      </button>            
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        encounterDesc={encounterDescription}
        encounterId={encounterId}
        mediaId={mediaId}
        patientId={patientDetails.patientId}
        name={patientDetails.name}
        surname={patientDetails.surname}
        birthdate={patientDetails.birthdate}
        gender={patientDetails.gender}
        encounterStatus={encounterStatus}
        role={userRole}
        showReportModalHandler={() => setShowReportModal(true)}
      />     
      <div className={`video-section ${isFullScreen ? 'full-screen' : ''}`}>       
        <div className={`video-player-wrapper ${isFullScreen ? 'full-screen' : ''}`} ref={videoContainerRef}>
          <ReactPlayer
            ref={playerRef}
            url={decodeURIComponent(videoUrl)}
            playing={isPlaying}
            playbackRate={speed}
            onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
            onDuration={(duration) => setDuration(duration)}
            controls
            width={isFullScreen ? "100%" : "100%"}
            height={isFullScreen ? "90vh" : "auto"}
            style={{
              maxHeight: isFullScreen ? '90vh' : 'auto',
              maxWidth: isFullScreen ? '80vw' : '100%',
              margin: isFullScreen ? 'auto' : '0',
              display: 'block'
            }}
            config={{ file: { attributes: { crossOrigin: 'anonymous' } } }}
          />
          <div className="overlay-button-wrapper">
            {encounterStatus === 'in-progress' && (userRole === 'ROLE_DOCTOR' || (userRole === 'ROLE_PREREADER' && !isPreRead)) ? (
              <>
                {findingAdded && (
                  <div className="finding-added-message">
                    Finding added!
                  </div>
                )}
                <div
                  title="Add Finding with 'F'"
                  className="overlay-finding-button"
                  onClick={handleAddFinding}
                >
                  <FontAwesomeIcon icon={faCirclePlus} />
                </div>
              </>
            ) : (
              <div title="Add Finding" className="overlay-finding-button faded">
                <FontAwesomeIcon icon={faCirclePlus} />
              </div>
            )}
          </div>
          <div className={`controls-toolbar ${isFullScreen ? 'full-screen-toolbar' : ''}`}>
            <div className="controls-left">
              <button
                data-tooltip={isPlaying ? "Pause" : "Play"}
                onClick={handlePlayPause}
              >
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
                    if (newSpeed >= 0.01 && newSpeed <= 2) {
                      setSpeed(newSpeed);
                    }
                  }}
                />
              </div>
              <button data-tooltip="Back 10s" onClick={handleRewind}>
                <FontAwesomeIcon icon={faBackwardFast} />
              </button>
              <button data-tooltip="Forward 10s" onClick={handleForward}>
                <FontAwesomeIcon icon={faForwardFast} />
              </button>
              <button data-tooltip="Previous Frame" onClick={handleFrameBackward}>
                <FontAwesomeIcon icon={faStepBackward} />
              </button>
              <button data-tooltip="Next Frame" onClick={handleFrameForward}>
                <FontAwesomeIcon icon={faStepForward} />
              </button>
            </div>
            <div className="controls-right">
              <button data-tooltip="Previous Finding" onClick={goToPreviousFinding}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <button data-tooltip="Next Finding" onClick={goToNextFinding}>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <button
                data-tooltip="Toggle Fullscreen"
                onClick={handleFullScreenToggle}
              >
                <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
              </button>
            </div>
          </div>
          <div className="progress-info">
            <span>[Frame: {Math.floor(currentTime * 5)} / {Math.floor(duration * 5)}] {((currentTime / duration) * 100).toFixed(2)}%</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>             
      </div>      
      <div className="findings-preview">
        {findings.map((finding, index) => (
          <div
            key={index}
            className={`finding-item ${finding.comment?.trim() ? 'commented' : 'no-comment'}`} // Add dynamic class
            onClick={() => handleFindingClick(finding)} // Existing click handler
          >
            <img 
              src={finding.frameUrl} 
              alt={`Finding at ${new Date(finding.time * 1000).toISOString().substr(11, 8)}`} 
              className="finding-thumbnail" 
            />
            <p className="timestamp">{formatTime(finding.time)}</p>
          </div>
        ))}
      </div>      
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="640"></canvas>  
      {showCommentModal && (
      <div className="modal">
        <div className="modal-content">
          <h2>Add Finding</h2>          
          {currentFrame && (
            <img 
              src={currentFrame} 
              alt="Captured Frame" 
              className="modal-finding-image" 
              style={{ width: '100%', height: 'auto', marginBottom: '10px', borderRadius: '8px' }}
            />
          )}
          <p><strong>Timestamp:</strong> {currentTime ? formatTime(currentTime) : ''}</p>          
          <select
            value={selectedComment}
            onChange={(e) => setSelectedComment(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              marginTop: '5px',
              boxSizing: 'border-box'
            }}          >
            <option value="" disabled>Select Pathology...</option>
            {predefinedComments.map((comment, index) => (
              <option key={index} value={comment}>{comment}</option>
            ))}
          </select>
          <button onClick={handleSaveComment} style={{ marginTop: '10px' }}>Save</button>
          <button onClick={() => setShowCommentModal(false)} style={{ marginLeft: '10px', marginTop: '10px' }}>Cancel</button>
        </div>
      </div>
      )}
      {showConfirmationModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to finalize this report?</h3>
            <div className="confirmation-buttons">
              <button onClick={confirmFinalization}>Yes</button>
              <button onClick={() => setShowConfirmationModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      {showFindingModal && selectedFinding && (
        <div className="modal">
          <div className="modal-content">
            <h2>Finding Details</h2>

            {successMessage && (
              <p className={`success-message ${successMessage === null ? 'hidden' : ''}`}>
                {successMessage}
              </p>
            )}
            <img 
              src={selectedFinding.frameUrl} 
              alt="Finding Frame" 
              className="modal-finding-image" 
            />
            <p><strong>Timestamp:</strong> {selectedFinding.time ? formatTime(selectedFinding.time) : ''}</p>
            {selectedFinding.comment ? (
              <p><strong>Comment:</strong> {selectedFinding.comment}</p>
            ) : (
              <>
                <select
                  value={selectedComment}
                  onChange={(e) => setSelectedComment(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    marginTop: '5px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="" disabled>Select Pathology...</option>
                  {predefinedComments.map((comment, index) => (
                    <option key={index} value={comment}>{comment}</option>
                  ))}
                </select>
              </>
            )}
            <div className="modal-buttons">
              {selectedFinding.comment ? null : (
                <button
                  onClick={async () => {
                    await handleSaveCommentForFinding(selectedFinding.id);
                  }}
                >
                  Save Comment
                </button>
              )}
              <button onClick={goToFinding}>Go to Finding</button>
              <button onClick={closeFindingModal}>Close</button>
            </div>
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
            {reportError && (
              <p className="report-error-message">{reportError}</p>
            )}

            <div className="report-modal-buttons">
              <button onClick={handleFinalization}>Finalize Report</button>
              <button onClick={() => setShowReportModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showConfirmationModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to finalize this report?</h3>
            <div className="confirmation-buttons">
              <button onClick={confirmFinalization}>Yes</button>
              <button onClick={() => setShowConfirmationModal(false)}>No</button>
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
      <ToastContainer />
    </div>
  );
};

export default VideoPlayer;
