import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Exam = ({ user }) => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  const startExam = () => {
    if (!user) {
      alert("Silakan masuk terlebih dahulu.");
      return;
    }
    // Mock questions for demo
    const mockQs = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      prompt: `Contoh Soal ${i + 1} untuk simulasi ${type.toUpperCase()}. Apa ibukota Indonesia?`,
      options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'IKN'],
      correctIndex: 0,
      explanation: 'Jakarta saat ini masih menjadi ibukota resmi Indonesia.'
    }));
    setQuestions(mockQs);
    setAnswers(Array(10).fill(null));
    setTimeLeft(600); // 10 minutes
    setStarted(true);
  };

  useEffect(() => {
    if (started && timeLeft > 0 && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  const finishExam = () => {
    setFinished(true);
    clearInterval(timerRef.current);
    
    // Calculate score
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const score = ((correct / questions.length) * 100).toFixed(1);

    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      examType: type,
      examLabel: `Simulasi ${type.toUpperCase()}`,
      score: score,
      correct: correct,
      total: questions.length
    };

    const existingHistory = JSON.parse(localStorage.getItem('simulasi_ujian_history_v1') || '[]');
    localStorage.setItem('simulasi_ujian_history_v1', JSON.stringify([historyEntry, ...existingHistory].slice(0, 20)));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (finished) {
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: '48px' }}>
        <h2>Hasil Simulasi</h2>
        <div className="score-value" style={{ fontSize: '4rem', color: 'var(--primary)', fontWeight: 800 }}>
          {((correct / questions.length) * 100).toFixed(1)}
        </div>
        <p>Benar {correct} dari {questions.length} soal</p>
        <div className="action-row" style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Lihat Dashboard</button>
          <button onClick={() => window.location.reload()} className="btn-secondary">Ulangi</button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card fade-in" style={{ maxWidth: '600px', margin: '48px auto', textAlign: 'center' }}>
        <h2>Konfigurasi Simulasi: {type.toUpperCase()}</h2>
        <p className="muted">Pastikan koneksi internet stabil dan Anda memiliki waktu luang yang cukup.</p>
        <div style={{ margin: '32px 0' }}>
          <strong>Peserta:</strong> {user?.name || 'Belum Masuk'}
        </div>
        <button onClick={startExam} className="btn-primary btn-lg full-width">🚀 Mulai Sekarang</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="exam-layout fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
      <section className="question-panel card">
        <div className="question-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p className="meta">Soal {currentIndex + 1} dari {questions.length}</p>
            <h3>{currentQ.prompt}</h3>
          </div>
          <div className="timer" style={{ fontSize: '1.5rem', fontWeight: 700, color: timeLeft < 60 ? 'var(--danger)' : 'inherit' }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="options" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options.map((opt, i) => (
            <div 
              key={i} 
              className={`option card ${answers[currentIndex] === i ? 'active' : ''}`}
              style={{ cursor: 'pointer', border: answers[currentIndex] === i ? '2px solid var(--primary)' : '1px solid var(--border)' }}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[currentIndex] = i;
                setAnswers(newAnswers);
              }}
            >
              <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
            </div>
          ))}
        </div>

        <div className="nav-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button 
            className="btn-secondary" 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            Sebelumnya
          </button>
          {currentIndex === questions.length - 1 ? (
            <button className="btn-danger" onClick={finishExam}>Selesai</button>
          ) : (
            <button className="btn-primary" onClick={() => setCurrentIndex(prev => prev + 1)}>Berikutnya</button>
          )}
        </div>
      </section>

      <aside className="right-panel">
        <div className="card">
          <h3>Navigasi Soal</h3>
          <div className="number-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '16px' }}>
            {questions.map((_, i) => (
              <button 
                key={i} 
                className={`num-btn ${currentIndex === i ? 'current' : ''} ${answers[i] !== null ? 'answered' : ''}`}
                style={{ 
                  width: '40px', height: '40px', border: '1px solid var(--border)', borderRadius: '8px',
                  background: currentIndex === i ? 'var(--primary)' : answers[i] !== null ? 'var(--primary-soft)' : 'white',
                  color: currentIndex === i ? 'white' : 'inherit'
                }}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Exam;
