import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('simulasi_ujian_history_v1');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <h2>Silakan Masuk Terlebih Dahulu</h2>
        <p>Anda perlu masuk untuk melihat dashboard performa Anda.</p>
      </div>
    );
  }

  const avgScore = history.length > 0 
    ? (history.reduce((sum, h) => sum + Number(h.score), 0) / history.length).toFixed(1)
    : 0;

  return (
    <div className="fade-in">
      <div className="review-header">
        <h2>Dashboard Pengguna: {user.name}</h2>
      </div>

      <div className="dashboard-grid">
        <div className="card user-stats-card">
          <h3>Ringkasan Performa</h3>
          <div className="stats-overview">
            <div className="stat-item">
              <span className="label">Total Simulasi</span>
              <strong>{history.length}</strong>
            </div>
            <div className="stat-item">
              <span className="label">Rata-rata Skor</span>
              <strong>{avgScore}</strong>
            </div>
          </div>
        </div>

        <div className="card recent-exams-card">
          <h3>Riwayat Ujian Terakhir</h3>
          <div className="recent-list">
            {history.length > 0 ? (
              history.map(h => (
                <div key={h.id} className="recent-item">
                  <div>
                    <strong>{h.examLabel}</strong><br />
                    <small className="muted">{new Date(h.date).toLocaleDateString()}</small>
                  </div>
                  <strong>{h.score}</strong>
                </div>
              ))
            ) : (
              <p className="muted">Belum ada riwayat ujian.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
