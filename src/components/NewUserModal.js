import React, { useState } from 'react';

const NewUserModal = ({ show, handleClose, handleSave, newUser, setNewUser }) => {

  const [userError, setUserError] = useState(false);

  const validateAndSave = () => {
    if (newUser) {
      if (
        !newUser.username ||
        !newUser.password ||
        !newUser.role
      ) {
        setUserError(true);
        return;
      }
      setUserError(false);    
    } else {
      console.error("Modal is opened without valid data newUser.");
      return;
    }  
    handleSave();
  };

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>New User</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={newUser.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newUser.password}
          onChange={handleChange}
        />
        <select name="role" value={newUser.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="DOCTOR">DOCTOR</option>
          <option value="PREREADER">PRE-READER</option>
        </select>
        {userError && <p className="error-message">Please fill all the fields.</p>}
        <div className="modal-actions">
          <button onClick={validateAndSave}>Save</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;
