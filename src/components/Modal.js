import React from 'react';
import DatePicker from 'react-datepicker';
import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './Modal.css';

const Modal = ({ show, handleClose, handleSave, newPatient, setNewPatient, newEncounter, setNewEncounter, }) => {
  
  const [dateError, setDateError] = useState(false);
  const [patientError, setPatientError] = useState(false);  
  
  const validateAndSave = () => {
    if (newPatient) {
      if (
        !newPatient.givenName ||
        !newPatient.familyName ||
        !newPatient.gender ||
        !newPatient.birthDate
      ) {
        setPatientError(true);
        return;
      }
      setPatientError(false);
    } else if (newEncounter) {
      if (!newEncounter.date) {
        setDateError(true);
        return;
      }
      setDateError(false);
    } else {
      console.error("Modal is opened without valid data (newPatient or newEncounter).");
      return;
    }  
    handleSave();
  };  

  if (!show) return null  

  const isPatientModal = Boolean(newPatient);

  const handleEncounterDateChange = (date) => {
    setNewEncounter({ ...newEncounter, date });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isPatientModal ? 'Add New Patient' : 'Add New Encounter'}</h2>
        {isPatientModal ? (
          <>
            <input
              type="text"
              value={newPatient.givenName}
              onChange={(e) =>
                setNewPatient({
                  ...newPatient,
                  givenName: e.target.value.toUpperCase(),
                })
              }
              placeholder="Enter given name"
            />
            <input
              type="text"
              value={newPatient.familyName}
              onChange={(e) =>
                setNewPatient({
                  ...newPatient,
                  familyName: e.target.value.toUpperCase(),
                })
              }
              placeholder="Enter family name"
            />
            <select
              value={newPatient.gender}
              onChange={(e) =>
                setNewPatient({ ...newPatient, gender: e.target.value })
              }
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>            
            <input
              type="date"
              value={newPatient.birthDate}
              onChange={(e) =>
                setNewPatient({ ...newPatient, birthDate: e.target.value })
              }
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </>
        ) : (
          <>            
            <input
              type="text"
              value={newEncounter.description}
              onChange={(e) => {
                const value = e.target.value.slice(0, 200);
                setNewEncounter({ ...newEncounter, description: value });
              }}
              placeholder="Enter description (max 200 characters)"
              maxLength={200}
            />
            <div className="char-count">
              {newEncounter.description.length}/200 characters
            </div>
            <DatePicker
              selected={newEncounter.date ? new Date(newEncounter.date) : null}
              onChange={handleEncounterDateChange}
              showTimeSelect
              timeIntervals={15}
              dateFormat="MM/dd/yyyy hh:mm aa"
              placeholderText="Encounter's Date and Time."
              className="custom-datepicker"
              minDate={new Date()}
              filterTime={(time) => {
                const selectedDate = new Date(time);
                const now = new Date();            
                if (
                  new Date().toDateString() ===
                  selectedDate.toDateString()
                ) {
                  return selectedDate.getTime() > now.getTime();
                }
                return true;
              }}
            />
          </>
        )}
        {dateError && <p className="error-message">Please select a valid date and time.</p>}
        {patientError && <p className="error-message">Please fill all the fields.</p>}
        <div className="modal-actions">
          <button onClick={validateAndSave}>OK</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
