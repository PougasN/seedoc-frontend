import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/seedoc-high-resolution-logo-transparent.png';

import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  

  const handleLogin = async () => {
    const credentials = btoa(`${username}:${password}`);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        
        const data = await response.json();
        localStorage.setItem('authCredentials', `Basic ${credentials}`);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', username);

        navigate('/patients');
      } else if (response.status === 401) {
        alert('Invalid username or password');
      } else {
        console.error(`Login failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }; 

  return (
    <div className="login-container">
      <img src={logo} alt="SeeDoc Logo" className="login-logo" />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
