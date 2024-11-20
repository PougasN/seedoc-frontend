import React, { useState, useEffect } from 'react';
import './LoadingBar.css';

const LoadingBar = ({ progress }) => {
  return (
    <div className="loading-bar-container">
      <div className="loading-bar">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="loading-bar-percentage">{progress}%</span>
    </div>
  );
};

export default LoadingBar;
