import React, { useState } from 'react';

const AuthModal = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: isLogin ? formData.email.split('@')[0] : formData.name,
      email: formData.email,
      id: 'USER-' + Math.floor(Math.random() * 1000)
    };
    localStorage.setItem('simulasi_ujian_user_v1', JSON.stringify(userData));
    onLogin(userData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card auth-card" onClick={e => e.stopPropagation()}>
        <div className="auth-tabs">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Masuk
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Daftar
          </button>
          <button className="btn-close-modal" onClick={onClose}>×</button>
        </div>

        <div className="auth-form-area active">
          <h3>{isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}</h3>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <label>
                Nama Lengkap
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </label>
            )}
            <label>
              Email
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </label>
            <label>
              Password
              <input 
                type="password" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </label>
            <button type="submit" className="btn-primary full-width">
              {isLogin ? 'Masuk' : 'Daftar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
