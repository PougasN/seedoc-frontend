import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  const isVideoPlayerPage = location.pathname.startsWith('/video');
  
  return (
    <div>
      {!isVideoPlayerPage && <Header />}
      <div style={{ padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
