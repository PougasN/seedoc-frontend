import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, username }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header username={username} />
      <main style={{ padding: '20px', flex: '1' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
