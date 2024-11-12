import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';
const UserManagement = () => {
  const [role, setRole] = useState(''); // Role selected in dropdown
  const [users, setUsers] = useState([]); // List of users to display
  const navigate = useNavigate();

  // Function to fetch users based on role
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

  // Fetch users when the role changes
  useEffect(() => {
    if (role) {
      fetchUsers(role);
    }
  }, [role]);

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>User Management</h2>
//       <select value={role} onChange={(e) => setRole(e.target.value)}>
//         <option value="">Select Role</option>
//         <option value="admins">Admins</option>
//         <option value="doctors">Doctors</option>
//         <option value="nurses">Nurses</option>
//       </select>

//       {users.length > 0 && (
//         <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr>
//               <th style={{ border: '1px solid black', padding: '8px' }}>#</th>
//               <th style={{ border: '1px solid black', padding: '8px' }}>Username</th>
//               <th style={{ border: '1px solid black', padding: '8px' }}>Role</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((user, index) => (
//               <tr key={user.id}>
//                 <td style={{ border: '1px solid black', padding: '8px' }}>{index + 1}</td>
//                 <td style={{ border: '1px solid black', padding: '8px' }}>{user.username}</td>
//                 <td style={{ border: '1px solid black', padding: '8px' }}>{user.role}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

return (
  <div className="user-management-container">
    <h1>User Management</h1>
    <button className="danger" onClick={() => navigate('/patients')}>Back</button>
    <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
      <option value="">Select Role</option>
      <option value="admins">Admins</option>
      <option value="doctors">Doctors</option>
      <option value="nurses">Nurses</option>
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
