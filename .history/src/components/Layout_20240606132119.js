import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ username, onLogout, component: Component, ...rest }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <div className="layout-header">
        <span className="layout-username">{username}</span>
        <button className="layout-logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <Component {...rest} />
    </div>
  );
};

export default Layout;
