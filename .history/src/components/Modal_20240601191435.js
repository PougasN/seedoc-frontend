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
             
