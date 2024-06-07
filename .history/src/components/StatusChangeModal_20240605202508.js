import React from 'react';
import './Modal.css';

const StatusChangeModal = ({ show, handleClose, handleSave, newStatus, setNewStatus }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Change Status</h2>
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={handleSave}>OK</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
  );
};

export default StatusChangeModal;
