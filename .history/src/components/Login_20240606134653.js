import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes from now
      localStorage.setItem('auth', 'true');
      localStorage.setItem('expirationTime', expirationTime);
      setAuth(true);
      navigate('/');
    } else {
      alert('Incorrect username or password');
    }
  };

  return (
    <div className="login-container">
      <h1>SeeDoc</h1>
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
