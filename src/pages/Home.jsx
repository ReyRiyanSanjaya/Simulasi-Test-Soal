import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ user }) => {
  const navigate = useNavigate();

  const examTypes = [
    { id: 'cpns', title: 'Simulasi CPNS 2026', icon: '🏛️', color: 'cpns', desc: 'Latihan lengkap TWK, TIU, dan TKP sesuai kisi-kisi terbaru BKN.', meta: '⏱️ 100 Menit • 📝 110 Soal' },
    { id: 'bumn', title: 'Rekrutmen Bersama BUMN', icon: '🏢', color: 'bumn', desc: 'Fokus pada Core Values AKHLAK, Numerik, Verbal, dan Manajerial.', meta: '⏱️ 90 Menit • 📝 100 Soal' },
    { id: 'kdkmp', title: 'Seleksi KDKMP/KNMP', icon: '🤝', color: 'kdkmp', desc: 'Tes Potensi Kerja dan Kompetensi Manajemen Koperasi Nusantara.', meta: '⏱️ 62 Menit • 📝 288 Soal' },
    { id: 'campuran', title: 'Simulasi Campuran', icon: '🧩', color: 'campuran', desc: 'Latihan adaptif lintas topik untuk menguji fleksibilitas kognitif.', meta: '⏱️ 60 Menit • 📝 100 Soal' },
  ];

  return (
    <div className="fade-in">
      <section className="company-hero card">
        <div className="hero-content">
          <h2>Partner Persiapan Karier Digital Anda</h2>
          <p>Kami menyediakan ekosistem simulasi ujian terstruktur untuk membantu peserta mempersiapkan seleksi nasional dan korporasi secara terukur.</p>
          <div className="hero-btns">
            <button onClick={() => document.getElementById('simulation-select').scrollIntoView({behavior: 'smooth'})} className="btn-primary">Mulai Simulasi</button>
            <button className="btn-secondary">Pelajari Fitur</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-placeholder">
            <span className="icon-lg">🚀</span>
          </div>
        </div>
      </section>

      <section id="simulation-select" className="section-container">
        <h2 className="section-title">Pilih Jalur Sukses Anda</h2>
        <div className="exam-category-grid">
          {examTypes.map(type => (
            <div key={type.id} className="card exam-card" onClick={() => navigate(`/exam/${type.id}`)}>
              <div className={`exam-card-header ${type.color}`}>
                <span className="exam-icon">{type.icon}</span>
              </div>
              <div className="exam-card-body">
                <h3>{type.title}</h3>
                <p className="muted">{type.desc}</p>
                <div className="exam-meta">
                  <span>{type.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container">
        <h2 className="section-title">Pertanyaan Sering Diajukan (FAQ)</h2>
        <div className="faq-grid">
          <div className="card">
            <h3>Apakah simulasi ini gratis?</h3>
            <p className="muted">Ya, kami menyediakan paket gratis untuk 1 paket simulasi.</p>
          </div>
          <div className="card">
            <h3>Bagaimana cara mendapatkan sertifikat?</h3>
            <p className="muted">Sertifikat otomatis dapat diunduh setelah Anda menyelesaikan simulasi.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
