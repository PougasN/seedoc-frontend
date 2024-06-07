import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="user-info">
        {username}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
