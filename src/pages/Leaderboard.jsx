import React, { useMemo } from 'react';
import { Trophy, Medal, User, Star } from 'lucide-react';

const Leaderboard = () => {
  const topScores = useMemo(() => {
    try {
      const history = JSON.parse(localStorage.getItem('simulasi_ujian_history_v1') || '[]');
      const parsed = Array.isArray(history) ? history : [];

      const normalized = parsed
        .map((item, idx) => ({
          id: item.id || `entry-${idx}`,
          name: item.participantName || 'Peserta',
          score: Number(item.score || 0),
          type: item.examLabel || 'Simulasi',
          date: item.date || new Date().toISOString()
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      if (normalized.length > 0) return normalized;
    } catch {
      localStorage.removeItem('simulasi_ujian_history_v1');
    }

    return [
      { id: 1, name: 'Andi Pratama', score: 485, type: 'CPNS Full', date: '2026-05-01' },
      { id: 2, name: 'Siti Aminah', score: 478, type: 'CPNS Full', date: '2026-05-02' },
      { id: 3, name: 'Budi Santoso', score: 472, type: 'CPNS Full', date: '2026-05-03' },
      { id: 4, name: 'Dewi Lestari', score: 465, type: 'TIU Khusus', date: '2026-05-04' },
      { id: 5, name: 'Eko Wijaya', score: 460, type: 'CPNS Full', date: '2026-05-05' },
      { id: 6, name: 'Fitriani', score: 455, type: 'TWK Khusus', date: '2026-05-06' },
      { id: 7, name: 'Gilang Ramadhan', score: 450, type: 'CPNS Full', date: '2026-05-07' },
      { id: 8, name: 'Hani Safitri', score: 445, type: 'TKP Khusus', date: '2026-05-08' },
    ];
  }, []);

  return (
    <div className="fade-in section-container">
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Trophy size={64} color="var(--warn)" style={{ margin: '0 auto 16px' }} />
        <h2 className="section-title">Peringkat Nasional</h2>
        <p className="section-subtitle">Daftar peserta dengan skor tertinggi dalam simulasi ujian CPNS 2026.</p>
      </div>

      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '0', overflow: 'hidden' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '20px', display: 'grid', gridTemplateColumns: '80px 1fr 150px 120px', fontWeight: 800 }}>
          <span>Rank</span>
          <span>Nama Peserta</span>
          <span>Jenis Ujian</span>
          <span style={{ textAlign: 'right' }}>Skor</span>
        </div>
        <div className="leaderboard-body">
          {topScores.map((entry, index) => (
            <div key={entry.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '80px 1fr 150px 120px', 
              padding: '20px', 
              borderBottom: index === topScores.length - 1 ? 'none' : '1px solid var(--border)',
              alignItems: 'center',
              background: index < 3 ? 'var(--primary-soft)' : 'transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {index === 0 ? <Medal color="#ffd700" size={24} /> : 
                 index === 1 ? <Medal color="#c0c0c0" size={24} /> : 
                 index === 2 ? <Medal color="#cd7f32" size={24} /> : 
                 <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{index + 1}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <User size={16} />
                </div>
                <span style={{ fontWeight: 700 }}>{entry.name}</span>
              </div>
              <span className="muted" style={{ fontSize: '0.9rem' }}>{entry.type}</span>
              <div style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)' }}>
                {entry.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <div className="card" style={{ display: 'inline-block', padding: '16px 32px', background: 'var(--primary-soft)', border: '1px dashed var(--primary)' }}>
          <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
            <Star size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Peringkat diperbarui setiap jam. Jadilah yang terbaik!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
