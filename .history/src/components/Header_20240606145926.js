import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  console.log("this is the username = " , sessionStorage.getItem('password'))

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
      <h1>{username}</h1>
      </div>
      <div className="header-center">
        <h1>SeeDoc</h1>
      </div>
      <div className="header-right">
        <span>{username}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
