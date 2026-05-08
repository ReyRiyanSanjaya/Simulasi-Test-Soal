import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Trophy, 
  Target, 
  Zap, 
  MessageSquare, 
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 20, minutes: 56, seconds: 2 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const examTypes = [
    { id: 'cpns', title: 'Tryout Gratis Tes CPNS 2026', icon: '🏛️', color: 'cpns', desc: 'Simulasi penuh dengan standar resmi Kepmen PANRB No. 321/2024.', meta: '110 Soal • Gratis', price: 'Gratis' },
    { id: 'tiu', title: 'Latihan Soal TIU (Intelegensia Umum)', icon: '🧠', color: 'tiu', desc: 'Fokus pada kemampuan verbal, numerik, dan figural.', meta: '35 Soal • Intensif', price: 'Premium' },
    { id: 'twk', title: 'Latihan Soal TWK (Wawasan Kebangsaan)', icon: '🇮🇩', color: 'twk', desc: 'Pendalaman materi Pancasila, UUD 1945, dan Bela Negara.', meta: '30 Soal • Komprehensif', price: 'Premium' },
    { id: 'tkp', title: 'Latihan Soal TKP (Karakteristik Pribadi)', icon: '👤', color: 'tkp', desc: 'Tes kepribadian, anti radikalisme, dan jejaring kerja.', meta: '45 Soal • Adaptif', price: 'Premium' },
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="company-hero">
        <div className="hero-content fade-in-up">
          <h2>Tryout Tes CPNS 2026 <span>Berbasis Analisis AI</span></h2>
          <p>Platform tryout dan tes CPNS 2026 online terlengkap dengan analisis AI, pembahasan mendalam, dan rekomendasi belajar personal sesuai standar resmi BKN.</p>
          <div className="hero-btns">
            <button onClick={() => document.getElementById('tryout-section').scrollIntoView({behavior: 'smooth'})} className="btn-primary">Coba Tryout Gratis</button>
            <button className="btn-secondary">Lihat Paket Belajar</button>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16} color="var(--ok)" /> Analisis AI Akurat</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16} color="var(--ok)" /> Standar Resmi CPNS</span>
          </div>
        </div>
        <div className="hero-visual fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="visual-placeholder" style={{ width: '300px', height: '300px' }}>
            <BrainCircuit size={120} color="var(--primary)" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="stats-grid fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="card stat-card">
          <Users size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <strong>1,000+</strong>
          <span>Peserta Aktif</span>
        </div>
        <div className="card stat-card">
          <BookOpen size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <strong>10,000+</strong>
          <span>Bank Soal</span>
        </div>
        <div className="card stat-card">
          <CheckCircle size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <strong>100%</strong>
          <span>Jaminan Puas</span>
        </div>
      </div>

      {/* AI Analysis Showcase */}
      <section className="section-container">
        <h2 className="section-title">Contoh Analisis AI Hasil Tryout</h2>
        <p className="section-subtitle">Dapatkan rincian skor, evaluasi mendalam, dan rekomendasi belajar personal dari AI kami.</p>
        
        <div className="ai-showcase">
          <div className="score-card">
            <div className="score">472</div>
            <div className="label">Skor Sangat Tinggi</div>
            <div className="sub-label">TWK: 125 | TIU: 145 | TKP: 202</div>
            <div style={{ marginTop: '16px', color: 'var(--ok)', fontWeight: 700, fontSize: '0.875rem' }}>LULUS AMBANG BATAS</div>
          </div>
          <div className="score-card">
            <div className="score">311</div>
            <div className="label">Skor Ambang Batas</div>
            <div className="sub-label">TWK: 65 | TIU: 80 | TKP: 166</div>
            <div style={{ marginTop: '16px', color: 'var(--warn)', fontWeight: 700, fontSize: '0.875rem' }}>TEPAT DI GARIS LULUS</div>
          </div>
          <div className="score-card">
            <div className="score">224</div>
            <div className="label">Perlu Peningkatan</div>
            <div className="sub-label">TWK: 35 | TIU: 45 | TKP: 144</div>
            <div style={{ marginTop: '16px', color: 'var(--danger)', fontWeight: 700, fontSize: '0.875rem' }}>BELUM LULUS</div>
          </div>
        </div>
      </section>

      {/* Tryout Grid */}
      <section id="tryout-section" className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ background: 'var(--danger)', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800 }}>🔥 SEDANG BERLANGSUNG</span>
          <h2 className="section-title" style={{ marginTop: '16px' }}>Tryout Akbar CPNS 2026</h2>
          <p className="muted">Segera kerjakan simulasi nasional sebelum waktu pendaftaran ditutup.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '32px' }}>
            <div className="countdown-box">
              <div className="value">{timeLeft.days.toString().padStart(2, '0')}</div>
              <div className="label">Hari</div>
            </div>
            <div className="countdown-box">
              <div className="value">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="label">Jam</div>
            </div>
            <div className="countdown-box">
              <div className="value">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="label">Menit</div>
            </div>
            <div className="countdown-box">
              <div className="value">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="label">Detik</div>
            </div>
          </div>
        </div>

        <div className="exam-category-grid">
          {examTypes.map(type => (
            <div key={type.id} className="card exam-card" onClick={() => navigate(`/exam/${type.id}`)}>
              <div className="exam-card-header" style={{ background: 'var(--primary-soft)' }}>
                <span className="exam-icon">{type.icon}</span>
              </div>
              <div className="exam-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '4px 8px', borderRadius: '4px' }}>{type.price}</span>
                  <Trophy size={16} color="var(--warn)" />
                </div>
                <h3>{type.title}</h3>
                <p className="muted" style={{ fontSize: '0.9rem' }}>{type.desc}</p>
                <div className="exam-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={14} /> {type.meta}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ambang Batas Section */}
      <section className="section-container">
        <div className="threshold-box">
          <h2 className="section-title">Nilai Ambang Batas Minimum</h2>
          <p className="section-subtitle">Raih skor impianmu dan pastikan tidak berada di bawah ambang batas sesuai Kepmen PANRB No. 321/2024.</p>
          
          <div className="threshold-grid">
            <div className="threshold-item">
              <h4>TWK</h4>
              <div className="value">65 Poin</div>
              <p className="muted" style={{ fontSize: '0.8rem' }}>30 Soal • Min. 13 Benar</p>
            </div>
            <div className="threshold-item">
              <h4>TIU</h4>
              <div className="value">80 Poin</div>
              <p className="muted" style={{ fontSize: '0.8rem' }}>35 Soal • Min. 16 Benar</p>
            </div>
            <div className="threshold-item">
              <h4>TKP</h4>
              <div className="value">166 Poin</div>
              <p className="muted" style={{ fontSize: '0.8rem' }}>45 Soal • Min. 34 Benar</p>
            </div>
            <div className="threshold-item" style={{ background: 'var(--primary)', color: 'white' }}>
              <h4 style={{ color: 'white' }}>TOTAL</h4>
              <div className="value">311 Poin</div>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Min. 63 Soal Benar</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section-container">
        <h2 className="section-title">Cara Kerja Tryout Online</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginTop: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '1.5rem', fontWeight: 800 }}>1</div>
            <h4 style={{ marginBottom: '12px' }}>Login & Pilih Tryout</h4>
            <p className="muted">Masuk ke akun Anda dan pilih paket tryout yang tersedia.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '1.5rem', fontWeight: 800 }}>2</div>
            <h4 style={{ marginBottom: '12px' }}>Kerjakan Simulasi</h4>
            <p className="muted">Kerjakan soal dengan interface CAT asli dan timer realistis.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '1.5rem', fontWeight: 800 }}>3</div>
            <h4 style={{ marginBottom: '12px' }}>Analisis AI & Pembahasan</h4>
            <p className="muted">Dapatkan hasil instan lengkap dengan evaluasi cerdas dari AI.</p>
          </div>
        </div>
      </section>

      {/* Community Banner */}
      <section className="community-banner fade-in-up">
        <MessageSquare size={48} style={{ marginBottom: '20px' }} />
        <h3>Join Grup Diskusi Belajar CPNS 2026</h3>
        <p>Bahas soal, tanya strategi belajar, dan saling update bareng ribuan peserta lain di Telegram.</p>
        <a href="#" className="btn-telegram">Masuk Grup Telegram</a>
      </section>

      {/* Contact Section */}
      <section className="section-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', letter-spacing: '-0.025em' }}>Hubungi Kami</h2>
            <p className="muted" style={{ marginBottom: '32px' }}>Punya pertanyaan atau kendala teknis? Tim support kami siap membantu Anda 24/7.</p>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--primary-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <MessageSquare color="var(--primary)" size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Live Chat</h4>
                  <p className="muted" style={{ fontSize: '0.85rem' }}>Respon cepat via WhatsApp atau Telegram.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--primary-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ShieldCheck color="var(--primary)" size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Email Support</h4>
                  <h4 style={{ fontSize: '1rem' }}>support@tes-cpns.com</h4>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '40px' }}>
            <form onSubmit={(e) => { e.preventDefault(); alert('Pesan Anda telah terkirim!'); }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Nama Lengkap</label>
                  <input type="text" placeholder="Masukkan nama Anda" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} required />
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Email Aktif</label>
                  <input type="email" placeholder="nama@email.com" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} required />
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pesan</label>
                  <textarea rows="4" placeholder="Apa yang bisa kami bantu?" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit' }} required></textarea>
                </div>
                <button type="submit" className="btn-primary full-width">Kirim Pesan</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
