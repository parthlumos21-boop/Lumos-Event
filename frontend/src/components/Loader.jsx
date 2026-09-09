import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loading">
      <div className="loading-text">
        <span className="loading-text-words">L</span>
        <span className="loading-text-words">U</span>
        <span className="loading-text-words">M</span>
        <span className="loading-text-words">O</span>
        <span className="loading-text-words">S</span>
      </div>
    </div>
  );
};

export default Loader;
