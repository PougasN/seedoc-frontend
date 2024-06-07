import React, { useState } from 'react';

const FindingModal = ({ show, handleClose, handleSave }) => {
  const [code, setCode] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    handleSave(code, comment);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Findings</h2>
        <div>
          <label>Code:</label>
          <select value={code} onChange={(e) => setCode(e.target.value)}>
            <option value="">Select Code</option>
            <option value="111111">Code 1</option>
            <option value="222222">Code 2</option>
            <option value="333333">Code 3</option>
          </select>
        </div>
        <div>
          <label>Comment:</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <button onClick={handleSubmit}>OK</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FindingModal;
