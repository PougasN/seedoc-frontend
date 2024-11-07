import React, { useState, useEffect } from 'react';
import LoadingBar from './LoadingBar'; // Assuming you already have a LoadingBar component
import './VideoUploadModal.css';

const VideoUploadModal = ({ show, handleClose, handleUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false); // Track when the upload is complete
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Control when to show success message

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleOk = () => {
    if (selectedFile) {
      handleUpload(selectedFile, setUploadProgress); // Pass the file and progress setter to the upload function
    }
  };

  const handleCloseWithReset = () => {
    setUploadProgress(0); // Reset upload progress
    setSelectedFile(null); // Reset selected file
    setUploadComplete(false); // Reset completion state
    setShowSuccessMessage(false); // Hide success message
    handleClose(); // Close the modal
  };

  useEffect(() => {
    if (uploadProgress === 100) {
      // Step 1: Keep the loading bar at 100% for 2 seconds
      const loadingTimeout = setTimeout(() => {
        setUploadComplete(true); // Show success message after 2 seconds
        setShowSuccessMessage(true);
      }, 5000); // 2 seconds delay

      return () => clearTimeout(loadingTimeout); // Cleanup
    }
  }, [uploadProgress]);

  if (!show) {
    return null;
  }

  return (
    <div className="modal" onClick={handleCloseWithReset}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Upload Video</h2>
        
        {/* Show file input if upload has not started */}
        {uploadProgress === 0 && !uploadComplete && (
          <div className="file-input-container">
            <label htmlFor="file-upload" className="file-input-label">Select File</label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {selectedFile && <span className="file-name">{selectedFile.name}</span>}
          </div>
        )}

        {/* Show loading bar during upload */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-container">
            <LoadingBar progress={uploadProgress} />
          </div>
        )}

        {/* Show loading bar at 100% for 2 seconds */}
        {uploadProgress === 100 && !showSuccessMessage && (
          <div className="progress-container">
            <LoadingBar progress={100} />
          </div>
        )}

        {/* Show success message after 2 seconds */}
        {showSuccessMessage && (
          <div className="success-message">
            <p>Video upload was successful!</p>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={handleOk} disabled={!selectedFile || uploadProgress > 0}>
            Upload
          </button>
          <button onClick={handleCloseWithReset} disabled={uploadProgress > 0}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
