import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/seedoc-high-resolution-logo-transparent.png';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#f5f5f5' }}>
      <img src={logo} alt="SeeDoc Logo" style={{ height: '50px' }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '20px' }}>admin</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
