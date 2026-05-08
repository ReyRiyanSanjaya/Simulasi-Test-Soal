import React from 'react';

const Materials = () => {
  const materials = [
    { id: 1, title: 'E-Book TWK Lengkap', icon: '📚', desc: 'Rangkuman materi wawasan kebangsaan paling update.' },
    { id: 2, title: 'Video Tutorial TIU', icon: '🧮', desc: 'Trik cepat mengerjakan soal hitungan dan logika.' },
    { id: 3, title: 'Simulasi TKP', icon: '🎭', desc: 'Latihan kepribadian dengan analisis psikologis.' },
  ];

  return (
    <div className="fade-in">
      <div className="review-header">
        <h2>Materi Belajar & Bank Soal</h2>
      </div>
      <div className="materials-grid">
        {materials.map(m => (
          <div key={m.id} className="card material-item">
            <div className="icon" style={{ fontSize: '3rem' }}>{m.icon}</div>
            <h3>{m.title}</h3>
            <p className="muted">{m.desc}</p>
            <button className="btn-primary-outline" style={{ marginTop: '16px' }}>Unduh / Pelajari</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Materials;
