import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

const UserManagement = () => {
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async (role) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${role}`, {
        headers: {
          Authorization: localStorage.getItem('authCredentials'),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error(`Failed to fetch users with role: ${role}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (role) {
      fetchUsers(role);
    }
  }, [role]);

return (
  <div className="user-management-container">
    <h1>User Management</h1>
    <button className="danger" onClick={() => navigate('/patients')}>Back</button>
    <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
      <option value="">Select Role</option>
      <option value="admins">Admins</option>
      <option value="doctors">Doctors</option>
      <option value="prereaders">Pre-readers</option>
    </select>
    <table className="user-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Username</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="no-data-message">Select Role.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
};

export default UserManagement;
