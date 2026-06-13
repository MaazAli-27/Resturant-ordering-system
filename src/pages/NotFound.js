import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="notfound-page">
      <div className="notfound-bg">
        <div className="notfound-orb orb-1" />
        <div className="notfound-orb orb-2" />
      </div>
      <div className="notfound-content">
        <div className="notfound-plate">🍽️</div>
        <h1 className="notfound-404">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-sub">Looks like this page went missing — just like that last slice of pizza!</p>
        <div className="notfound-actions">
          <button className="btn-notfound-home" onClick={() => navigate('/')}>🏠 Back to Menu</button>
          <button className="btn-notfound-back" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
