import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  History, 
  BookOpen,
  ChevronRight,
  Target
} from 'lucide-react';
import { Radar } from 'react-chartjs-2';

const Dashboard = ({ user }) => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('simulasi_ujian_history_v1');
      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    } catch {
      localStorage.removeItem('simulasi_ujian_history_v1');
      setHistory([]);
    }
  }, []);

  if (!user) {
    return (
      <div className="section-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '48px' }}>
          <History size={48} color="var(--primary)" style={{ margin: '0 auto 24px' }} />
          <h2>Silakan Masuk Terlebih Dahulu</h2>
          <p className="muted">Anda perlu masuk untuk melihat dashboard performa dan riwayat ujian Anda.</p>
        </div>
      </div>
    );
  }

  const avgScore = history.length > 0 
    ? (history.reduce((sum, h) => sum + Number(h.score), 0) / history.length).toFixed(1)
    : 0;

  const totalQuestions = history.reduce((sum, h) => sum + h.total, 0);
  const totalCorrect = history.reduce((sum, h) => sum + h.correct, 0);
  const globalAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;

  // Mock radar data for global performance
  const radarData = {
    labels: ['TWK', 'TIU', 'TKP'],
    datasets: [
      {
        label: 'Performa Rata-rata (%)',
        data: [75, 68, 82], // In real app, calculate from history
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="fade-in section-container">
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Halo, {user.name}! 👋</h2>
        <p className="muted">Pantau progres persiapan CPNS 2026 Anda di sini.</p>
      </div>

      <div className="stats-grid" style={{ marginTop: '0', marginBottom: '40px' }}>
        <div className="card stat-card">
          <TrendingUp size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <strong>{history.length}</strong>
          <span>Total Simulasi</span>
        </div>
        <div className="card stat-card">
          <Target size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <strong>{avgScore}</strong>
          <span>Rata-rata Skor</span>
        </div>
        <div className="card stat-card">
          <CheckCircle2 size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <strong>{globalAccuracy}%</strong>
          <span>Akurasi Global</span>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={20} /> Riwayat Ujian</h3>
            <button className="btn-text">Lihat Semua</button>
          </div>
          <div className="recent-list" style={{ display: 'grid', gap: '16px' }}>
            {history.length > 0 ? (
              history.map(h => (
                <div key={h.id} className="recent-item" style={{ padding: '16px', background: 'var(--primary-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{h.examLabel}</strong>
                    <small className="muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{h.score}</div>
                    <small style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{h.correct}/{h.total} Benar</small>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p className="muted">Belum ada riwayat ujian. Mulai simulasi pertama Anda sekarang!</p>
                <button onClick={() => navigate('/#tryout-section')} className="btn-primary" style={{ marginTop: '16px' }}>Mulai Tryout</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div className="card">
            <h3>Analisis Kekuatan</h3>
            <div style={{ height: '250px', marginTop: '16px' }}>
              <Radar data={radarData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
          
          <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><BookOpen size={18} /> Rekomendasi AI</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
              Berdasarkan hasil terakhir, Anda perlu memperkuat materi <strong>TIU - Numerik</strong>. Luangkan waktu 30 menit setiap hari untuk latihan soal hitungan cepat.
            </p>
            <button className="btn-text" style={{ color: 'white', marginTop: '12px', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Pelajari Sekarang <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
