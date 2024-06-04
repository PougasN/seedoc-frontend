import React, { useState } from 'react';
import './VideoUploadModal.css';

const VideoUploadModal = ({ show, handleClose, handleUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleOk = () => {
    handleUpload(selectedFile);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Upload Video</h2>
        <input type="file" onChange={handleFileChange} />
        <div className="modal-actions">
          <button onClick={handleOk}>OK</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
