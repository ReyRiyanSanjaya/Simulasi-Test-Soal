import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  BookOpen,
  Trophy,
  Download
} from 'lucide-react';
import { QUESTION_BANK, EXAM_PROFILES } from '../data/examData';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const Exam = ({ user }) => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);

  const profile = EXAM_PROFILES[type] || EXAM_PROFILES.cpns;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const startExam = () => {
    if (!user) {
      alert("Silakan masuk terlebih dahulu untuk memulai simulasi.");
      return;
    }

    // Generate questions based on blueprint
    let allQs = [];
    let totalTime = 0;
    
    profile.blueprint.forEach(section => {
      const bankQs = QUESTION_BANK[section.id] || [];
      // In real app, we would shuffle and pick N questions
      // For now, we use available questions and repeat if necessary
      const sectionQs = Array.from({ length: section.count }, (_, i) => {
        const baseQ = bankQs[i % bankQs.length];
        return { ...baseQ, sectionTitle: section.title, globalNumber: allQs.length + i + 1 };
      });
      allQs = [...allQs, ...sectionQs];
      totalTime += section.duration * 60;
    });

    setQuestions(allQs);
    setTimeLeft(totalTime);
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
    const latestAnswers = answersRef.current;
    const latestQuestions = questionsRef.current;
    
    // Calculate results per section
    const sectionResults = profile.blueprint.map(section => {
      const sectionQs = latestQuestions.filter(q => q.sectionTitle === section.title);
      let correct = 0;
      sectionQs.forEach(q => {
        if (latestAnswers[q.globalNumber - 1] === q.correctIndex) correct++;
      });
      const score = ((correct / section.count) * 100).toFixed(1);
      return { title: section.title, correct, total: section.count, score: parseFloat(score) };
    });

    const totalCorrect = sectionResults.reduce((acc, curr) => acc + curr.correct, 0);
    const totalScore = latestQuestions.length ? ((totalCorrect / latestQuestions.length) * 100).toFixed(1) : "0.0";

    const resultObj = {
      totalScore,
      totalCorrect,
      totalQuestions: latestQuestions.length,
      sectionResults,
      date: new Date().toISOString()
    };

    setResults(resultObj);

    // Save to history
    const historyEntry = {
      id: Date.now(),
      date: resultObj.date,
      examType: type,
      examLabel: profile.label,
      participantName: user?.name || "Peserta",
      score: totalScore,
      correct: totalCorrect,
      total: latestQuestions.length
    };

    let existingHistory = [];
    try {
      existingHistory = JSON.parse(localStorage.getItem('simulasi_ujian_history_v1') || '[]');
    } catch {
      localStorage.removeItem('simulasi_ujian_history_v1');
    }
    localStorage.setItem('simulasi_ujian_history_v1', JSON.stringify([historyEntry, ...existingHistory].slice(0, 20)));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentIndex)) {
      newFlagged.delete(currentIndex);
    } else {
      newFlagged.add(currentIndex);
    }
    setFlagged(newFlagged);
  };

  if (finished && results) {
    const radarData = {
      labels: results.sectionResults.map(r => r.title),
      datasets: [
        {
          label: 'Skor Anda (%)',
          data: results.sectionResults.map(r => r.score),
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
        },
      ],
    };

    if (showReview) {
      return (
        <div className="fade-in section-container">
          <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2>Pembahasan Lengkap</h2>
            <button onClick={() => setShowReview(false)} className="btn-secondary">Kembali ke Hasil</button>
          </div>
          <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div key={i} className={`card ${isCorrect ? 'correct' : 'wrong'}`} style={{ borderLeft: `6px solid ${isCorrect ? 'var(--ok)' : 'var(--danger)'}` }}>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{q.sectionTitle} • Soal {q.globalNumber}</span>
                    <span style={{ fontWeight: 700, color: isCorrect ? 'var(--ok)' : 'var(--danger)' }}>{isCorrect ? 'BENAR' : 'SALAH'}</span>
                  </div>
                  <h4 style={{ marginBottom: '16px' }}>{q.prompt}</h4>
                  <div className="options-review" style={{ display: 'grid', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ 
                        padding: '10px', 
                        borderRadius: '4px',
                        background: optIdx === q.correctIndex ? 'var(--primary-soft)' : optIdx === answers[i] ? '#fee2e2' : 'transparent',
                        border: optIdx === q.correctIndex ? '1px solid var(--ok)' : optIdx === answers[i] ? '1px solid var(--danger)' : '1px solid var(--border)'
                      }}>
                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                        {optIdx === q.correctIndex && <CheckCircle2 size={16} style={{ float: 'right', color: 'var(--ok)' }} />}
                      </div>
                    ))}
                  </div>
                  <div className="explanation-box" style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Pembahasan:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="fade-in section-container">
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Trophy size={64} color="var(--warn)" style={{ margin: '0 auto 24px' }} />
          <h2>Simulasi Selesai!</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '40px', textAlign: 'left' }}>
            <div>
              <div className="score-value" style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                {results.totalScore}
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '8px' }}>Skor Akhir Anda</p>
              <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                {results.sectionResults.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--primary-soft)', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 600 }}>{r.title}</span>
                    <strong style={{ color: 'var(--primary)' }}>{r.correct}/{r.total}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: '350px' }}>
              <Radar data={radarData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="action-row" style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={() => setShowReview(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} /> Lihat Pembahasan
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Unduh Sertifikat
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fade-in section-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--primary-soft)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
              <Clock size={40} color="var(--primary)" />
            </div>
            <h2>{profile.label}</h2>
            <p className="muted">Persiapkan diri Anda untuk simulasi dengan standar resmi BKN.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div className="card" style={{ background: '#f8fafc' }}>
              <h4 style={{ marginBottom: '12px' }}>Aturan Simulasi</h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li>Dilarang membuka tab lain atau aplikasi lain.</li>
                <li>Waktu akan terus berjalan meski koneksi terputus.</li>
                <li>Gunakan tombol "Selesai" jika sudah yakin.</li>
                <li>Skor otomatis keluar setelah waktu habis atau selesai.</li>
              </ul>
            </div>
            <div className="card" style={{ background: '#f8fafc' }}>
              <h4 style={{ marginBottom: '12px' }}>Rincian Soal</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {profile.blueprint.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>{s.title}</span>
                    <strong>{s.count} Soal</strong>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Total Waktu</span>
                  <span>{profile.blueprint.reduce((acc, curr) => acc + curr.duration, 0)} Menit</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={startExam} className="btn-primary btn-lg full-width">🚀 Mulai Simulasi Sekarang</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="fade-in app-shell" style={{ paddingTop: '20px' }}>
      <div className="exam-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <span className="muted" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>SUBTES AKTIF</span>
            <strong style={{ color: 'var(--primary)' }}>{currentQ.sectionTitle}</strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
            <span className="muted" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>TERJAWAB</span>
            <strong>{Object.keys(answers).length} / {questions.length}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: timeLeft < 60 ? '#fee2e2' : 'var(--primary-soft)', padding: '8px 20px', borderRadius: '8px' }}>
          <Clock size={20} color={timeLeft < 60 ? 'var(--danger)' : 'var(--primary)'} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: timeLeft < 60 ? 'var(--danger)' : 'var(--primary)' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="exam-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <section className="question-panel card" style={{ padding: '32px' }}>
          <div className="question-head" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>SOAL NOMOR {currentIndex + 1}</span>
              <button onClick={toggleFlag} className="btn-text" style={{ color: flagged.has(currentIndex) ? 'var(--warn)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flag size={18} fill={flagged.has(currentIndex) ? 'var(--warn)' : 'none'} /> {flagged.has(currentIndex) ? 'Batalkan Ragu' : 'Ragu-ragu'}
              </button>
            </div>
            <h3 style={{ fontSize: '1.4rem', lineHeight: 1.4, fontWeight: 600 }}>{currentQ.prompt}</h3>
          </div>

          <div className="options" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options.map((opt, i) => (
              <div 
                key={i} 
                className={`option card ${answers[currentIndex] === i ? 'active' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'center',
                  border: answers[currentIndex] === i ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: answers[currentIndex] === i ? 'var(--primary-soft)' : 'white'
                }}
                onClick={() => {
                  setAnswers({ ...answers, [currentIndex]: i });
                }}
              >
                <div style={{ 
                  width: '32px', height: '32px', 
                  borderRadius: '50%', 
                  border: '1px solid var(--border)', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  background: answers[currentIndex] === i ? 'var(--primary)' : 'white',
                  color: answers[currentIndex] === i ? 'white' : 'inherit',
                  fontWeight: 800
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div style={{ fontWeight: 500 }}>{opt}</div>
              </div>
            ))}
          </div>

          <div className="nav-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <button 
              className="btn-secondary" 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ChevronLeft size={20} /> Sebelumnya
            </button>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={finishExam} className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Hentikan Ujian</button>
              {currentIndex === questions.length - 1 ? (
                <button className="btn-primary" onClick={finishExam} style={{ background: 'var(--ok)' }}>Selesai Ujian</button>
              ) : (
                <button className="btn-primary" onClick={() => setCurrentIndex(prev => prev + 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Berikutnya <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} /> Navigasi Soal
            </h4>
            <div className="number-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {questions.map((_, i) => (
                <button 
                  key={i} 
                  className={`num-btn ${currentIndex === i ? 'current' : ''} ${answers[i] !== undefined ? 'answered' : ''} ${flagged.has(i) ? 'flagged' : ''}`}
                  style={{ 
                    width: '100%', 
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: currentIndex === i ? 'var(--primary)' : flagged.has(i) ? 'var(--warn)' : answers[i] !== undefined ? 'var(--primary-soft)' : 'white',
                    color: currentIndex === i || (flagged.has(i) && answers[i] === undefined) ? 'white' : 'inherit',
                    borderColor: currentIndex === i ? 'var(--primary)' : flagged.has(i) ? 'var(--warn)' : 'var(--border)'
                  }}
                  onClick={() => setCurrentIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '20px', display: 'grid', gap: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--primary)' }}></div> Aktif
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--primary-soft)', border: '1px solid var(--border)' }}></div> Terjawab
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--warn)' }}></div> Ragu-ragu
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'white', border: '1px solid var(--border)' }}></div> Belum
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> Tip Cerdas AI
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.4 }}>
              Jangan habiskan waktu lebih dari 1 menit pada satu soal. Jika ragu, tandai dan lanjutkan ke soal berikutnya!
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Exam;
