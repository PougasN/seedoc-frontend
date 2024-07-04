import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#f5f5f5' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '20px', fontWeight: 'bold' }}>{username}</span>
        <h1 style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bolder' }}>SeeDoc</h1>
      </div>
      <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
    </header>
  );
};

export default Header;