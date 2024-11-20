import React, { useState, useRef } from "react";
import LoadingBar from "./LoadingBar";
import "./VideoUploadModal.css";

const VideoUploadModal = ({ show, handleClose, handleUpload }) => {
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const xhrRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    validateFile(file);
  };

  const validateFile = (file) => {
    const maxSize = 2 * 1024 * 1024 * 1024;
    if (file) {
      const fileType = file.type;
      if (fileType !== "video/mp4") {
        setErrorMessage("Only .mp4 files are accepted.");
        setSelectedFile(null);
        return;
      }  
      if (file.size > maxSize) {
        setErrorMessage("The file is too large. Please upload a file smaller than 2GB.");
        setSelectedFile(null);
        return;
      }  
      setErrorMessage("");
      setSelectedFile(file);
    }    
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    validateFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      xhrRef.current = handleUpload(selectedFile, setUploadProgress, setUploadComplete);
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setUploadProgress(0);
      setSelectedFile(null);
      setUploadComplete(false);
      setErrorMessage("Upload canceled.");
    }
  };

  const handleOk = () => {
    if (selectedFile) {
      xhrRef.current = handleUpload(
        selectedFile,
        setUploadProgress,
        setUploadComplete
      );
    }
  };  

  const handleCloseWithReset = () => {
    handleCancelUpload();
    setErrorMessage("");
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="modal upload-video-modal" onClick={handleCloseWithReset}>
      <div className="modal-content video-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Upload Video</h2>
        <div
          className={`drag-drop-area ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload").click()}
        >
          {selectedFile ? (
            <p className="file-name">{selectedFile.name}</p>
          ) : (
            <p className="drag-drop-text">Drag and drop a file here, or click to select one</p>
          )}
        </div>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {uploadProgress > 0 && (
          <div className="progress-container">
            <LoadingBar progress={uploadProgress} />
            {uploadProgress === 100 && !uploadComplete && (
              <p className="info-message">Waiting for confirmation...</p>
            )}
          </div>
        )}
        {uploadComplete && (
          <div className="success-message">
            <p>Video upload was successful!</p>
          </div>
        )}
        <div className="modal-actions">
          <button
            onClick={handleOk}
            disabled={!selectedFile || uploadProgress > 0 || errorMessage}
          >
            Upload
          </button>
          <button
            onClick={handleCancelUpload}
            disabled={uploadProgress === 0 || uploadComplete}
          >
            Cancel Upload
          </button>
          <button
            onClick={handleCloseWithReset}
            disabled={uploadProgress > 0 && !uploadComplete}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
