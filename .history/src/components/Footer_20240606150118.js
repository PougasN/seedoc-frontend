import React from 'react';

const Footer = () => {
  return (
    <footer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0', background: '#f5f5f5', marginTop: '20px' }}>
      <p style={{ margin: 0 }}>
        © <a href="mailto:test-email@hotmail.com" style={{ textDecoration: 'none' }}>test-email@hotmail.com</a>
      </p>
    </footer>
  );
};

export default Footer;
