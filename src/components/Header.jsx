import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLoginClick, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="logo-area">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Simulasi Ujian Nusantara</h1>
        </Link>
        <p>Platform company profile dan simulasi ujian profesional.</p>
      </div>

      <nav className="main-nav">
        <Link to="/">Beranda</Link>
        <Link to="/materials">Materi</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <div className="user-profile-head">
              <span id="headerUserName">{user.name}</span>
              <button onClick={onLogout} className="btn-text">Keluar</button>
            </div>
          </>
        ) : (
          <button onClick={onLoginClick} className="btn-text">Masuk / Daftar</button>
        )}
      </nav>

      <div className="header-actions">
        <button className="btn-secondary">Dark Mode</button>
      </div>
    </header>
  );
};

export default Header;
