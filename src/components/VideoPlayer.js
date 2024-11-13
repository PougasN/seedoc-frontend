import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import Sidebar from './Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowRight, faArrowLeft, faExpand, faCompress, faFileWaveform, faInfo, faBars, faInfoCircle, faPlay, faPause, faUndoAlt, faRedoAlt, faStepBackward, faStepForward, faForward, faForwardFast, faBackwardFast, faBackward, faCircleArrowLeft, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
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
  const [isLoading, setIsLoading] = useState(true);
  const authCredentials = localStorage.getItem('authCredentials');
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

  


  // useEffect(() => {
  //   const fetchVideo = async () => {
  //     try {
  //       const response = await fetch(`${process.env.REACT_APP_API_URL}/video/${encounterId}`, {
  //         headers: {
  //           'Authorization': authCredentials, // Use stored credentials
  //         },
  //       });
  //       if (response.ok) {
  //         const blob = await response.blob();
  //         const videoUrl = URL.createObjectURL(blob);
  //         setVideoUrl(videoUrl);
  //       } else {
  //         console.error('Error fetching video:', response.statusText);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching video:', err);
  //     }
  //   };
  
  //   const fetchMedia = async () => {
  //     try {
  //       const response = await fetch(`${process.env.REACT_APP_API_URL}/media/${mediaId}`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': authCredentials,
  //         },
  //       });
  //       const data = await response.json();
  //       if (data && data.content && data.content.url) {
  //         fetchFindings();
  //       }
  //     } catch (err) {
  //       console.error('Error fetching media:', err);
  //     }
  //   };
  
  //   const fetchEncounterAndPatientDetails = async () => {
  //     try {
  //       const encounterResponse = await fetch(`${process.env.REACT_APP_API_URL}/encounter/${encounterId}`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': authCredentials,
  //         },
  //       });
  //       const encounterData = await encounterResponse.json();
  //       setEncounterStatus(encounterData.status); // Store encounter status
  
  //       const patientId = encounterData.subject.reference.split('/')[1];
  
  //       const patientResponse = await fetch(`${process.env.REACT_APP_API_URL}/patient/${patientId}`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': authCredentials,
  //         },
  //       });
  //       const patientData = await patientResponse.json();
  //       setPatientDetails({
  //         patientId: patientData.id,
  //         name: patientData.name[0].given[0],
  //         surname: patientData.name[0].family,
  //         birthdate: patientData.birthDate,
  //         gender: patientData.gender,
  //       });
  //     } catch (error) {
  //       console.error('Error fetching patient details:', error);
  //     }
  //   };  
  //   if (encounterId) {
  //     fetchEncounterAndPatientDetails();
  //     fetchVideo();
  //   }
  //   if (mediaId) {
  //     fetchMedia();
  //     fetchFindings();
  //   }
  
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);

  //   const handleFullScreenChange = () => {
  //     setIsFullScreen(!!document.fullscreenElement);
  //   };
  
  //   document.addEventListener('fullscreenchange', handleFullScreenChange);
  //   return () => {
  //     document.removeEventListener('fullscreenchange', handleFullScreenChange);
  //   };

  //   if (isFullScreen) {
  //     // Add scroll listener only in custom full-screen mode
  //     window.addEventListener('wheel', handleScroll);
  //   } else {
  //     // Remove scroll listener when exiting full-screen mode
  //     window.removeEventListener('wheel', handleScroll);
  //   }

  //   return () => {
  //     // Clean up the event listener when component unmounts or isFullScreen changes
  //     window.removeEventListener('wheel', handleScroll);
  //   };

  // }, [mediaId, encounterId, isFullScreen]);  



  // const handleScroll = (event) => {
  //   // Adjust the scroll sensitivity (how much time to skip per scroll)
  //   const scrollSensitivity = 5; // seconds per scroll
  //   if (playerRef.current) {
  //     const currentTime = playerRef.current.getCurrentTime();
  //     const newTime = event.deltaY < 0 ? currentTime - scrollSensitivity : currentTime + scrollSensitivity;
  //     playerRef.current.seekTo(newTime, 'seconds');
  //   }
  // };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/video/${encounterId}`, {
          headers: {
            'Authorization': authCredentials, // Use stored credentials
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
        setEncounterStatus(encounterData.status); // Store encounter status
  
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
      const scrollSensitivity = 0.2; // seconds per scroll
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        const newTime = event.deltaY < 0 ? currentTime - scrollSensitivity : currentTime + scrollSensitivity;
        playerRef.current.seekTo(newTime, 'seconds');
      }
    };
  
    // Set up fullscreen change and scroll events
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    if (isFullScreen) {
      window.addEventListener('wheel', handleScroll);
    }
  
    return () => {
      // Clean up both event listeners
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('wheel', handleScroll);
    };
  }, [mediaId, encounterId, isFullScreen]);
  



  const fetchFindings = async () => {
    if (!mediaId) return;
    try {
      const authCredentials = localStorage.getItem('authCredentials'); // Retrieve stored credentials
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/findings/get/${mediaId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authCredentials, // Use stored credentials
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setFindings(data);
        console.log('Fetched FINDINGS successfully!!!');
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

  const handleAddFinding = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      const frameImage = captureFrame();
  
      // Check if the current time (with milliseconds precision) already exists in findings
      const existingFinding = findings.find((finding) => {
        const timeTolerance = 0.1; // 100 milliseconds tolerance
        return Math.abs(finding.time - time) <= timeTolerance;
      });
  
      if (existingFinding) {
        alert("A finding already exists at this time. Please choose a different moment.");
        return; // Exit the function if a duplicate is found
      }
  
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
      comment: selectedComment, // Use selectedComment here
      frame: currentFrame,
    };
  
    try {
      const formData = new FormData();
      formData.append('mediaId', newFinding.mediaId);
      formData.append('time', newFinding.time);
      formData.append('comment', newFinding.comment);
  
      const uniqueFrameName = `frame-${new Date().getTime()}.png`;
      formData.append('frame', dataURLtoFile(newFinding.frame, uniqueFrameName));
  
      const authCredentials = localStorage.getItem('authCredentials'); // Retrieve stored credentials
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/findings`, {
        method: 'POST',
        headers: {
          'Authorization': authCredentials, // Use stored credentials
        },
        body: formData,
      });
  
      if (response.ok) {
        await response.json(); // Wait for the response and ignore the savedFinding here
        setShowCommentModal(false);
        setSelectedComment(''); // Reset selected comment
        fetchFindings(); // Refresh findings list
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
    // Validation: Check if at least one finding is selected and conclusion is not empty
    if (selectedFrames.length === 0) {
      setReportError('Please select at least one finding.');
      return;
    }
    if (conclusion.trim() === '') {
      setReportError('Please enter a conclusion.');
      return;
    }
  
    // If validation passes, clear any previous error messages
    setReportError('');
  
    // Show confirmation modal
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
      // Create diagnostic report
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
      console.log('Diagnostic Report created with ID = ', diagnosticReportId);

      // Update encounter status to finished
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

      console.log('Encounter status updated to finished');
      
      // Navigate back to PatientDetails page
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
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0'); // Extract milliseconds
  
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
  

  //===============================================================================================

  //====================================================================================================


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
        encounterStatus={encounterStatus}  // Pass encounterStatus to Sidebar
        showReportModalHandler={() => setShowReportModal(true)}
      />     
      <div className={`video-section ${isFullScreen ? 'full-screen' : ''}`}>       
        <div className={`video-player-wrapper ${isFullScreen ? 'full-screen' : ''}`} ref={videoContainerRef}>
          {/* <ReactPlayer
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
          /> */}

          <ReactPlayer
            ref={playerRef}
            url={decodeURIComponent(videoUrl)}
            playing={isPlaying}
            playbackRate={speed}
            onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
            onDuration={(duration) => setDuration(duration)}
            controls
            width={isFullScreen ? "100%" : "100%"}
            height={isFullScreen ? "90vh" : "auto"} // Sets video height to 80% of viewport in full-screen mode
            style={{
              maxHeight: isFullScreen ? '90vh' : 'auto', // Limits video height in full-screen mode
              maxWidth: isFullScreen ? '80vw' : '100%',  // Limits video width in full-screen mode
              margin: isFullScreen ? 'auto' : '0', // Centers video in full-screen mode
              display: 'block'
            }}
            config={{ file: { attributes: { crossOrigin: 'anonymous' } } }}
          />


          <div className="overlay-button-wrapper">
            <div title='Add Finding' className="overlay-finding-button" onClick={handleAddFinding}>
              <FontAwesomeIcon icon={faCirclePlus} />
            </div>            
          </div>
          <div className={`controls-toolbar ${isFullScreen ? 'full-screen-toolbar' : ''}`}>  
            {/* <div className="controls-left">        
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
            <div className="controls-right">             
              <button title="Previous Finding" onClick={goToPreviousFinding}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>              
              <button title="Next Finding" onClick={goToNextFinding}>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <button title="Toggle Fullscreen" onClick={handleFullScreenToggle}>
                <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
              </button>
            </div> */}

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
            className="finding-item"
            onClick={() => handleFindingClick(finding)} // Open modal on click
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

      {showFindingModal && selectedFinding && (
        <div className="modal">
          <div className="modal-content">
            <h2>Finding Details</h2>
            <img 
              src={selectedFinding.frameUrl} 
              alt="Finding Frame" 
              className="modal-finding-image" 
            />
            <p><strong>Timestamp:</strong> {selectedFinding.time ? formatTime(selectedFinding.time) : ''}</p>
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
            <option value="" disabled>Select...</option>
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

            {/* Display error message if validation fails */}
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

      {/* Confirmation Modal */}
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

    </div>
  );
};

export default VideoPlayer;
