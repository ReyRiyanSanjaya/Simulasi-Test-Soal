import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Exam from './pages/Exam';
import Leaderboard from './pages/Leaderboard';
import AuthModal from './components/AuthModal';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();

  const readJsonStorage = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const savedUser = readJsonStorage('simulasi_ujian_user_v1', null);
    if (savedUser) setUser(savedUser);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const target = document.querySelector(location.hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 0);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('simulasi_ujian_user_v1');
    setUser(null);
  };

  return (
    <div className="app-shell">
      <Header 
        user={user} 
        onLoginClick={() => setShowAuth(true)} 
        onLogout={handleLogout} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/exam/:type" element={<Exam user={user} />} />
        </Routes>
      </main>

      <Footer />

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onLogin={(userData) => {
            setUser(userData);
            setShowAuth(false);
          }} 
        />
      )}
    </div>
  );
}

export default App;
