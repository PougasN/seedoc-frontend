// NewUserModal.js
import React from 'react';

const NewUserModal = ({ show, handleClose, handleSave, newUser, setNewUser }) => {
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
          <option value="NURSE">NURSE</option>
        </select>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;
