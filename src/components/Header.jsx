import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Sun, Moon } from 'lucide-react';

const Header = ({ user, onLoginClick, onLogout, theme, onToggleTheme }) => {
  return (
    <header className="app-header">
      <div className="logo-area">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>TES-CPNS<span>.COM</span></h1>
        </Link>
      </div>

      <nav className="main-nav">
        <Link to="/">Beranda</Link>
        <Link to="/materials">Materi</Link>
        <Link to="/leaderboard">Peringkat</Link>
        <Link to="/#tryout-section">Tryout</Link>
        <button onClick={onToggleTheme} className="btn-text" style={{ padding: '8px' }}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <div className="user-profile-head" style={{ background: 'var(--primary-soft)', padding: '6px 12px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--primary)" />
              <span id="headerUserName" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</span>
              <button onClick={onLogout} className="btn-text" style={{ padding: '0', display: 'flex', alignItems: 'center' }}>
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <button onClick={onLoginClick} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Masuk / Daftar</button>
        )}
      </nav>
    </header>
  );
};

export default Header;
