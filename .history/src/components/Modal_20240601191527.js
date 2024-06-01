import React from 'react';

const Modal = ({ show, handleClose, handleSave, newPatient, setNewPatient, newEncounter, setNewEncounter }) => {
  if (!show) {
    return null;
  }

  const isPatientModal = Boolean(newPatient);

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isPatientModal ? 'Add New Patient' : 'Add New Encounter'}</h2>
        {isPatientModal ? (
          <>
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
          </>
        ) : (
          <>
            <input
              type="text"
              value={newEncounter.description}
              onChange={e => setNewEncounter({ ...newEncounter, description: e.target.value })}
              placeholder="Enter description"
            />
            <input
              type="date"
              value={newEncounter.date}
              onChange={e => setNewEncounter({ ...newEncounter, date: e.target.value })}
              placeholder="Enter date"
            />
          </>
        )}
        <button onClick={handleSave}>OK</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
  );
};

export default Modal;
