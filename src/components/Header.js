import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/seedoc-high-resolution-logo-transparent.png';

const Header = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ role: '', username: '' });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const username = localStorage.getItem('userName');

    const formatRole = (role) => {
      switch (role) {
        case 'ROLE_ADMIN':
          return 'Admin';
        case 'ROLE_DOCTOR':
          return 'Dr.';
        case 'ROLE_PREREADER':
          return 'Pr.';
        default:
          return 'User';
      }
    };

    setUserInfo({ role: formatRole(role), username });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#f5f5f5' }}>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 20 }}>
        <img src={logo} alt="SeeDoc Logo" style={{ height: '50px' }} />
        <span style={{ marginLeft: '20px' }}>Capsule Reader Software</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '20px' }}>{userInfo.role} {userInfo.username}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
