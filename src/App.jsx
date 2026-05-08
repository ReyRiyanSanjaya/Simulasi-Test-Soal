import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Exam from './pages/Exam';
import AuthModal from './components/AuthModal';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('simulasi_ujian_user_v1');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
      />
      
      <main>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/materials" element={<Materials />} />
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
