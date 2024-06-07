import React from 'react';
import './Modal.css';

const Modal = ({ show, handleClose, handleSave, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children || <p>No description available</p>}
        <div className="modal-buttons">
          <button className="secondary" onClick={handleSave}>Save</button>
          <button className="danger" onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
