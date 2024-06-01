import React from 'react';

const Modal = ({ show, handleClose, handleSave, newPatient, setNewPatient }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Patient</h2>
        <input
          type="text"
          value={newPatient.givenName}
          onChange={e => setNewPatient({ ...newPatient, givenName: e.target.value })}
          placeholder="Enter given name"
        />
        <input
          type="text"
          value={newPatient.familyName}
          onChange={e => setNewPatient({ ...newPatient, familyName: e.target.value })}
          placeholder="Enter family name"
        />
        <button onClick={handleSave}>OK</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
  );
};

export default Modal;
