import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import './Login.css';

const Login = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const navigate = useNavigate();
  const { setUsername } = useContext(UserContext);

  const handleLogin = () => {
    if (usernameInput === 'admin' && passwordInput === 'admin') {
      setUsername(usernameInput);
      navigate('/patients');  // Redirect to patients page after login
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h1>SeeDoc</h1>
      <input
        type="text"
        placeholder="Username"
        value={usernameInput}
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={passwordInput}
        onChange={(e) => setPasswordInput(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
