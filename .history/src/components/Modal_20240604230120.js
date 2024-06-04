import React from 'react';
import './Modal.css';

const Modal = ({ show, handleClose, handleSave, children }) => {
  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        {children}
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default Modal;
