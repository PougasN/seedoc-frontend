import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const username = sessionStorage.getItem('username');

  return (
    <div>
      <Header username={username} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
