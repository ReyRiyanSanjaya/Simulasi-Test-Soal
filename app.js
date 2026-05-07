const KDKMP_BLUEPRINT = [
  { id: "bahasa", title: "TPK Sub 1 - Bahasa", count: 50, durationMin: 7 },
  { id: "hitungan", title: "TPK Sub 2 - Hitungan", count: 31, durationMin: 7 },
  { id: "umum", title: "TPK Sub 3 - Pengetahuan Umum", count: 40, durationMin: 7 },
  { id: "pola", title: "TPK Sub 4 - Pola Gambar", count: 55, durationMin: 7 },
  { id: "ruang", title: "TPK Sub 5 - Abstraksi Ruang", count: 27, durationMin: 7 },
  { id: "bentuk", title: "TPK Sub 6 - Bentuk", count: 25, durationMin: 7 },
  { id: "kdkmp", title: "Tes Manajemen Bidang KDKMP/KNMP", count: 20, durationMin: 20 }
];

const ALPHABET = ["A", "B", "C", "D", "E"];
const LOCAL_TOP_SCORE_KEY = "simulasi_ujian_top_scores_v1";

const EXAM_PROFILES = {
  cpns: {
    label: "Simulasi Ujian CPNS",
    headline: "Simulasi Ujian Nusantara - CPNS",
    subtitle: "Tryout CPNS dengan format TWK, TIU, dan TKP untuk latihan terukur.",
    blueprint: [
      { id: "twk", title: "TWK - Wawasan Kebangsaan", count: 40, durationMin: 35 },
      { id: "tiu", title: "TIU - Intelegensi Umum", count: 35, durationMin: 30 },
      { id: "tkp", title: "TKP - Karakteristik Pribadi", count: 45, durationMin: 40 }
    ]
  },
  bumn: {
    label: "Simulasi Ujian BUMN",
    headline: "Simulasi Ujian Nusantara - BUMN",
    subtitle: "Latihan tes BUMN meliputi core values, numerik, verbal, dan manajerial.",
    blueprint: [
      { id: "akhlak", title: "Core Values AKHLAK", count: 25, durationMin: 20 },
      { id: "numerik", title: "Numerik & Logika", count: 30, durationMin: 25 },
      { id: "verbal", title: "Verbal & Bahasa", count: 30, durationMin: 25 },
      { id: "manajerial", title: "Situasional Manajerial", count: 25, durationMin: 20 }
    ]
  },
  kdkmp: {
    label: "Simulasi Ujian KDKMP",
    headline: "Simulasi Ujian Nusantara - KDKMP",
    subtitle: "Format tes mengikuti skema seleksi KDKMP (TPK + KDKMP).",
    blueprint: KDKMP_BLUEPRINT
  },
  campuran: {
    label: "Simulasi Campuran (Lainnya)",
    headline: "Simulasi Ujian Nusantara - Campuran",
    subtitle: "Paket latihan campuran lintas topik untuk memperkuat adaptasi soal.",
    blueprint: [
      { id: "bahasa", title: "Verbal & Bahasa", count: 25, durationMin: 15 },
      { id: "hitungan", title: "Numerik Dasar", count: 25, durationMin: 15 },
      { id: "umum", title: "Pengetahuan Umum", count: 25, durationMin: 15 },
      { id: "manajerial", title: "Manajerial Situasional", count: 25, durationMin: 15 }
    ]
  }
};

const state = {
  examType: "kdkmp",
  participant: { name: "", id: "" },
  questions: [],
  ranges: {},
  answers: [],
  flagged: new Set(),
  currentSegmentIndex: 0,
  currentQuestionIndex: 0,
  segmentRemaining: 0,
  totalRemaining: 0,
  timerId: null,
  finished: false,
  result: null,
  settings: {
    shuffleQuestions: false,
    shuffleOptions: true
  },
  customBank: null,
  ui: {
    tipOffset: 0,
    trapGuideOpen: false,
    focusMode: false,
    darkTheme: false,
    corporateTheme: false,
    soundOn: true,
    lastRenderedQuestionIndex: -1,
    lastQuestionBySection: {},
    wrongStreak: 0,
    correctStreak: 0,
    bestCorrectStreak: 0,
    remedialActive: false,
    questionStartTime: 0,
    smartTipShown: false
  },
  tutor: {
    active: false,
    focusTrapTypes: [],
    queue: [],
    cursor: 0,
    answers: [],
    correct: 0
  },
  audio: {
    ambientPlaying: false,
    ambientOsc: null,
    speechSynthesis: window.speechSynthesis,
    utterance: null
  }
};

function getSavedQuestionIndexForSection(sectionId) {
  const saved = state.ui.lastQuestionBySection?.[sectionId];
  const range = getRange(sectionId);
  if (!range) {
    return 0;
  }
  if (typeof saved === "number" && saved >= range.start && saved <= range.end) {
    return saved;
  }
  return range.start;
}

const dom = {
  startScreen: document.getElementById("startScreen"),
  examScreen: document.getElementById("examScreen"),
  resultScreen: document.getElementById("resultScreen"),
  tutorScreen: document.getElementById("tutorScreen"),
  reviewScreen: document.getElementById("reviewScreen"),
  appTitle: document.getElementById("appTitle"),
  appSubtitle: document.getElementById("appSubtitle"),
  examType: document.getElementById("examType"),
  examDetailList: document.getElementById("examDetailList"),
  participantName: document.getElementById("participantName"),
  participantId: document.getElementById("participantId"),
  shuffleQuestions: document.getElementById("shuffleQuestions"),
  shuffleOptions: document.getElementById("shuffleOptions"),
  importBankBtn: document.getElementById("importBankBtn"),
  bankFileInput: document.getElementById("bankFileInput"),
  bankInfo: document.getElementById("bankInfo"),
  startBtn: document.getElementById("startBtn"),
  totalTimer: document.getElementById("totalTimer"),
  segmentTitle: document.getElementById("segmentTitle"),
  segmentTimer: document.getElementById("segmentTimer"),
  answeredCount: document.getElementById("answeredCount"),
  flaggedCount: document.getElementById("flaggedCount"),
  activeNumber: document.getElementById("activeNumber"),
  segmentCount: document.getElementById("segmentCount"),
  questionMeta: document.getElementById("questionMeta"),
  questionTitle: document.getElementById("questionTitle"),
  questionBody: document.getElementById("questionBody"),
  questionVisual: document.getElementById("questionVisual"),
  instantStrategy: document.getElementById("instantStrategy"),
  learningCoach: document.getElementById("learningCoach"),
  questionPanel: document.querySelector(".question-panel"),
  optionsContainer: document.getElementById("optionsContainer"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  finishBtn: document.getElementById("finishBtn"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),
  flagBtn: document.getElementById("flagBtn"),
  segmentPills: document.getElementById("segmentPills"),
  numberGrid: document.getElementById("numberGrid"),
  segmentNavTitle: document.getElementById("segmentNavTitle"),
  finalScore: document.getElementById("finalScore"),
  finalSummary: document.getElementById("finalSummary"),
  weakTrapList: document.getElementById("weakTrapList"),
  startTutorBtn: document.getElementById("startTutorBtn"),
  resultName: document.getElementById("resultName"),
  resultId: document.getElementById("resultId"),
  resultDate: document.getElementById("resultDate"),
  sectionResultBody: document.getElementById("sectionResultBody"),
    showReviewBtn: document.getElementById("showReviewBtn"),
    restartBtn: document.getElementById("restartBtn"),
    backToResultBtn: document.getElementById("backToResultBtn"),
    backTutorToResultBtn: document.getElementById("backTutorToResultBtn"),
    // Comparison addition
    yourScoreVal: document.getElementById("yourScoreVal"),
    avgTopScoreVal: document.getElementById("avgTopScoreVal"),
    comparisonNote: document.getElementById("comparisonNote"),
    tutorMeta: document.getElementById("tutorMeta"),
  tutorQuestionTitle: document.getElementById("tutorQuestionTitle"),
  tutorQuestionBody: document.getElementById("tutorQuestionBody"),
  tutorOptions: document.getElementById("tutorOptions"),
  tutorFeedback: document.getElementById("tutorFeedback"),
  tutorNextBtn: document.getElementById("tutorNextBtn"),
  tutorFinishBtn: document.getElementById("tutorFinishBtn"),
  tutorFocusInfo: document.getElementById("tutorFocusInfo"),
  reviewList: document.getElementById("reviewList"),
  badge: document.querySelector(".badge"),
  topParticipant: document.getElementById("topParticipant"),
  topSection: document.getElementById("topSection"),
  topProgress: document.getElementById("topProgress"),
  topStatus: document.getElementById("topStatus"),
  quickTipsCard: document.getElementById("quickTipsCard"),
  prevTipBtn: document.getElementById("prevTipBtn"),
  nextTipPanelBtn: document.getElementById("nextTipPanelBtn"),
  tipIndicator: document.getElementById("tipIndicator"),
  questionProgressBar: document.getElementById("questionProgressBar"),
  showTrapGuideBtn: document.getElementById("showTrapGuideBtn"),
  focusModeBtn: document.getElementById("focusModeBtn"),
  trapGuideBox: document.getElementById("trapGuideBox"),
  openStrategyBtn: document.getElementById("openStrategyBtn"),
  closeStrategyBtn: document.getElementById("closeStrategyBtn"),
  strategyModal: document.getElementById("strategyModal"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  corporateThemeBtn: document.getElementById("corporateThemeBtn"),
  soundToggleBtn: document.getElementById("soundToggleBtn"),
  tipToast: null,
  remedialModal: document.getElementById("remedialModal"),
  remedialTitle: document.getElementById("remedialTitle"),
  remedialPrompt: document.getElementById("remedialPrompt"),
  remedialOptions: document.getElementById("remedialOptions"),
  remedialFeedback: document.getElementById("remedialFeedback"),
  closeRemedialBtn: document.getElementById("closeRemedialBtn"),
  skipRemedialBtn: document.getElementById("skipRemedialBtn"),
  liveAccuracy: document.getElementById("liveAccuracy"),
  liveCorrectStreak: document.getElementById("liveCorrectStreak"),
  liveWrongStreak: document.getElementById("liveWrongStreak"),
  liveBestStreak: document.getElementById("liveBestStreak"),
  liveTrapList: document.getElementById("liveTrapList"),
  leaderboardBody: document.getElementById("leaderboardBody"),
  clearLeaderboardBtn: document.getElementById("clearLeaderboardBtn"),
  // New elements
  examCards: document.querySelectorAll(".exam-card"),
  registrationForm: document.getElementById("registrationForm"),
  backToCategories: document.getElementById("backToCategories"),
   selectedExamTitle: document.getElementById("selectedExamTitle"),
   enableFocusModeInit: document.getElementById("enableFocusModeInit"),
   examCategoryGrid: document.querySelector(".exam-category-grid"),
   // Analytics and Certificate
   passingPrediction: document.getElementById("passingPrediction"),
   avgSpeed: document.getElementById("avgSpeed"),
   recommendationList: document.getElementById("recommendationList"),
   generateCertificateBtn: document.getElementById("generateCertificateBtn"),
   certificateModal: document.getElementById("certificateModal"),
   closeCertificateBtn: document.getElementById("closeCertificateBtn"),
   certName: document.getElementById("certName"),
   certExamType: document.getElementById("certExamType"),
   certScore: document.getElementById("certScore"),
   certDate: document.getElementById("certDate"),
    downloadCertBtn: document.getElementById("downloadCertBtn"),
    shareResultsBtn: document.getElementById("shareResultsBtn"),
    // Completion additions
    ttsBtn: document.getElementById("ttsBtn"),
    ambientMusicBtn: document.getElementById("ambientMusicBtn"),
    performanceChart: document.getElementById("performanceChart"),
    keyboardGuideModal: document.getElementById("keyboardGuideModal"),
    closeKeyboardGuideBtn: document.getElementById("closeKeyboardGuideBtn"),
    openKeyboardGuideBtn: document.getElementById("openKeyboardGuideBtn")
  };

// Initialize Particles.js
if (typeof particlesJS !== 'undefined') {
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#3b82f6' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#3b82f6',
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'window',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 0.5 } },
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  });
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}

let audioContext = null;

function ensureAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  return audioContext;
}

function playFeedbackTone(type) {
  if (!state.ui.soundOn) {
    return;
  }
  const ctx = ensureAudioContext();
  if (!ctx) {
    return;
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === "correct") {
    osc.frequency.value = 820;
  } else if (type === "wrong") {
    osc.frequency.value = 260;
  } else {
    osc.frequency.value = 520;
  }
  osc.type = "sine";
  gain.gain.value = 0.0001;
  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  osc.start(now);
  osc.stop(now + 0.15);
}

function toggleAmbientMusic() {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  if (state.audio.ambientPlaying) {
    state.audio.ambientOsc?.stop();
    state.audio.ambientPlaying = false;
    dom.ambientMusicBtn.textContent = "🎵 Musik: OFF";
    dom.ambientMusicBtn.classList.remove("active");
  } else {
    // Simple harmonic ambient sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime); // Low A
    
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    state.audio.ambientOsc = osc;
    state.audio.ambientPlaying = true;
    dom.ambientMusicBtn.textContent = "🎵 Musik: ON";
    dom.ambientMusicBtn.classList.add("active");
  }
}

function speakQuestion() {
  if (state.audio.speechSynthesis.speaking) {
    state.audio.speechSynthesis.cancel();
    dom.ttsBtn.classList.remove("speaking");
    dom.ttsBtn.textContent = "🔊 Baca Soal";
    return;
  }

  const q = state.questions[state.currentQuestionIndex];
  if (!q) return;

  const text = `${q.prompt}. Pilihan jawaban. A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}. D: ${q.options[3]}. E: ${q.options[4]}.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.rate = 0.9;

  utterance.onstart = () => {
    dom.ttsBtn.classList.add("speaking");
    dom.ttsBtn.textContent = "⏹ Berhenti";
  };
  utterance.onend = () => {
    dom.ttsBtn.classList.remove("speaking");
    dom.ttsBtn.textContent = "🔊 Baca Soal";
  };

  state.audio.utterance = utterance;
  state.audio.speechSynthesis.speak(utterance);
}

function applyTheme() {
  const isDark = state.ui.darkTheme;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  dom.themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  
  // Also update background color for particles visibility if needed
  if (isDark) {
    document.body.style.backgroundColor = "#0f172a";
  } else {
    document.body.style.backgroundColor = "#f8fafc";
  }
  
  // Also keep old class for compatibility
  document.body.classList.toggle("dark-theme", isDark);
  document.body.classList.toggle("corporate-theme", state.ui.corporateTheme);
  dom.corporateThemeBtn.textContent = state.ui.corporateTheme ? "Corporate: ON" : "Corporate: OFF";

  // Update particles color based on theme
  if (typeof particlesJS !== 'undefined' && window.pJSDom && window.pJSDom[0]) {
    try {
      const pJS = window.pJSDom[0].pJS;
      const color = isDark ? '#3b82f6' : '#2563eb';
      pJS.particles.color.value = color;
      pJS.particles.line_linked.color = color;
      pJS.fn.particlesRefresh();
    } catch (e) { console.warn("Particles refresh failed", e); }
  }
}

function applySoundLabel() {
  dom.soundToggleBtn.textContent = state.ui.soundOn ? "Suara: ON" : "Suara: OFF";
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function shuffleArray(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function placeCorrectOption(correct, distractors, targetIndex) {
  const cleanDistractors = uniqueValues(distractors.filter((d) => d !== correct)).slice(0, 4);
  while (cleanDistractors.length < 4) {
    cleanDistractors.push(`${correct} (${cleanDistractors.length + 1})`);
  }
  const options = [];
  let distractorCursor = 0;
  for (let i = 0; i < 5; i += 1) {
    if (i === targetIndex) {
      options.push(correct);
    } else {
      options.push(cleanDistractors[distractorCursor]);
      distractorCursor += 1;
    }
  }
  return options;
}

function createQuestion(prompt, correctAnswer, distractors, explanation, targetIndex, visual = null) {
  const options = placeCorrectOption(correctAnswer, distractors, targetIndex);
  return {
    prompt,
    options,
    correctIndex: options.indexOf(correctAnswer),
    explanation,
    shortcut: "",
    visual
  };
}

function createSvgDataUri(inner, width = 760, height = 220) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><defs><linearGradient id='bg' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='#f7fbff'/><stop offset='100%' stop-color='#e9f2ff'/></linearGradient><marker id='arrowHead' markerWidth='8' markerHeight='8' refX='7' refY='4' orient='auto'><path d='M0,0 L8,4 L0,8 Z' fill='#2c5ea8'/></marker></defs><rect width='100%' height='100%' fill='url(#bg)' rx='18' ry='18'/>${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createSequenceVisual(sequence) {
  const all = [...sequence, "?"];
  const gap = 18;
  const boxW = 92;
  const boxH = 86;
  const totalW = (boxW * all.length) + (gap * (all.length - 1));
  const startX = Math.max(18, Math.floor((760 - totalW) / 2));
  const y = 64;
  const normalized = all.map((value) => {
    if (value === "^") return "UP";
    if (value === ">") return "RT";
    if (value === "v") return "DN";
    if (value === "<") return "LT";
    return String(value);
  });
  const connectors = all.map((_, idx) => {
    if (idx >= all.length - 1) {
      return "";
    }
    const x1 = startX + (idx * (boxW + gap)) + boxW;
    const x2 = startX + ((idx + 1) * (boxW + gap));
    const cy = y + (boxH / 2);
    return `<line x1='${x1 + 4}' y1='${cy}' x2='${x2 - 4}' y2='${cy}' stroke='#6f97d6' stroke-width='2.5' marker-end='url(#arrowHead)'/>`;
  }).join("");
  const boxes = all.map((value, idx) => {
    const x = startX + (idx * (boxW + gap));
    const fill = idx === all.length - 1 ? "#dbe9ff" : "#ffffff";
    const stroke = idx === all.length - 1 ? "#4a7fda" : "#9bb9e8";
    const label = normalized[idx];
    const fontSize = label.length >= 8 ? 20 : label.length >= 5 ? 24 : 34;
    return `<rect x='${x}' y='${y}' width='${boxW}' height='${boxH}' rx='14' fill='${fill}' stroke='${stroke}' stroke-width='2'/><text x='${x + (boxW / 2)}' y='${y + 22}' text-anchor='middle' font-family='Inter, Arial' font-size='13' font-weight='600' fill='#5a78aa'>${idx + 1}</text><text x='${x + (boxW / 2)}' y='${y + 56}' text-anchor='middle' font-family='Inter, Arial' font-size='${fontSize}' font-weight='700' fill='#1f3f75'>${label}</text>`;
  }).join("");
  const hint = "<text x='380' y='186' text-anchor='middle' font-family='Inter, Arial' font-size='14' fill='#5474a8'>Amati perubahan antar-kotak secara berurutan.</text>";
  return {
    src: createSvgDataUri(`${connectors}${boxes}${hint}`),
    caption: "Pola deret visual dengan penanda urutan. Tentukan elemen terakhir yang konsisten."
  };
}

function createShapeVisual(kind) {
  let inner = "";
  if (kind === "persegi") {
    inner = "<rect x='300' y='45' width='160' height='160' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/><line x1='300' y1='45' x2='460' y2='205' stroke='#d8e7ff' stroke-width='3'/><line x1='460' y1='45' x2='300' y2='205' stroke='#d8e7ff' stroke-width='3'/><text x='292' y='40' font-size='14' fill='#1f3f75' font-weight='700'>s</text><text x='466' y='128' font-size='14' fill='#1f3f75' font-weight='700'>s</text>";
  } else if (kind === "trapesium") {
    inner = "<polygon points='250,190 510,190 450,60 310,60' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/><line x1='250' y1='190' x2='510' y2='190' stroke='#d8e7ff' stroke-width='3' stroke-dasharray='7 6'/><line x1='310' y1='60' x2='450' y2='60' stroke='#d8e7ff' stroke-width='3' stroke-dasharray='7 6'/><text x='258' y='206' font-size='14' fill='#1f3f75' font-weight='700'>sejajar</text>";
  } else if (kind === "segitiga_sama_sisi") {
    inner = "<polygon points='380,42 520,190 240,190' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/><text x='372' y='30' font-size='14' fill='#1f3f75' font-weight='700'>A</text><text x='525' y='202' font-size='14' fill='#1f3f75' font-weight='700'>B</text><text x='226' y='202' font-size='14' fill='#1f3f75' font-weight='700'>C</text>";
  } else if (kind === "lingkaran") {
    inner = "<circle cx='380' cy='120' r='82' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/><line x1='298' y1='120' x2='462' y2='120' stroke='#d8e7ff' stroke-width='4'/><line x1='380' y1='120' x2='450' y2='90' stroke='#d8e7ff' stroke-width='4'/><circle cx='380' cy='120' r='4' fill='#f7fbff'/><text x='386' y='118' font-size='12' fill='#f7fbff' font-weight='700'>O</text>";
  } else if (kind === "sudut_tumpul") {
    inner = "<line x1='200' y1='170' x2='380' y2='170' stroke='#1e4c9c' stroke-width='8'/><line x1='200' y1='170' x2='330' y2='75' stroke='#1e4c9c' stroke-width='8'/><path d='M244 168 A44 44 0 0 1 264 136' fill='none' stroke='#3f78da' stroke-width='6'/><text x='268' y='158' font-size='14' fill='#1f3f75' font-weight='700'>135 deg</text>";
  } else if (kind === "jajar_genjang") {
    inner = "<polygon points='250,170 460,170 540,70 330,70' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/><line x1='250' y1='170' x2='540' y2='70' stroke='#d8e7ff' stroke-width='3'/><line x1='330' y1='70' x2='460' y2='170' stroke='#d8e7ff' stroke-width='3'/>";
  } else if (kind === "belah_ketupat") {
    inner = "<polygon points='380,40 530,120 380,200 230,120' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/><line x1='380' y1='40' x2='380' y2='200' stroke='#d8e7ff' stroke-width='4'/><line x1='230' y1='120' x2='530' y2='120' stroke='#d8e7ff' stroke-width='4'/>";
  } else if (kind === "layang_layang") {
    inner = "<polygon points='380,35 510,118 380,205 285,118' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/><line x1='380' y1='35' x2='380' y2='205' stroke='#1e4c9c' stroke-width='4' stroke-dasharray='8 8'/><text x='388' y='118' font-size='13' fill='#1f3f75' font-weight='700'>sumbu</text>";
  } else if (kind === "simetri_lipat") {
    inner = "<line x1='380' y1='30' x2='380' y2='200' stroke='#2c5ea8' stroke-width='5' stroke-dasharray='8 8'/><polygon points='250,170 300,70 360,140 420,70 510,170' fill='none' stroke='#1e4c9c' stroke-width='6'/><text x='388' y='48' font-size='13' fill='#1f3f75' font-weight='700'>lipat</text>";
  } else if (kind === "simetri_putar") {
    inner = "<rect x='290' y='55' width='180' height='130' fill='none' stroke='#1e4c9c' stroke-width='6'/><path d='M380 40 A70 70 0 1 1 379 40' fill='none' stroke='#3f78da' stroke-width='5'/><polygon points='442,51 462,54 452,69' fill='#3f78da'/><text x='456' y='47' font-size='13' fill='#1f3f75' font-weight='700'>90 deg</text>";
  } else {
    inner = "<rect x='280' y='50' width='200' height='140' fill='#3f78da' stroke='#1e4c9c' stroke-width='6'/>";
  }
  return {
    src: createSvgDataUri(inner),
    caption: "Perhatikan gambar bangun berikut."
  };
}

function createSpatialVisual(kind) {
  let inner = "";
  if (kind === "kubus_rotasi") {
    inner = "<polygon points='235,70 355,50 500,92 380,112' fill='#d7e7ff' stroke='#2c5ea8' stroke-width='4'/><polygon points='235,70 235,165 380,207 380,112' fill='#b5cff7' stroke='#2c5ea8' stroke-width='4'/><polygon points='380,112 500,92 500,187 380,207' fill='#8cb4ed' stroke='#2c5ea8' stroke-width='4'/><text x='292' y='118' font-size='22' fill='#1f3f75' font-weight='700' font-family='Inter, Arial'>DEPAN</text><text x='425' y='160' font-size='22' fill='#1f3f75' font-weight='700' font-family='Inter, Arial'>KANAN</text><path d='M345 34 A44 44 0 0 1 435 54' fill='none' stroke='#2c5ea8' stroke-width='3.5' marker-end='url(#arrowHead)'/><text x='392' y='34' font-size='13' fill='#1f3f75' font-weight='700'>rotasi</text>";
  } else if (kind === "skala_peta") {
    inner = "<rect x='120' y='52' width='230' height='140' rx='14' fill='#c9defa' stroke='#2c5ea8' stroke-width='4'/><rect x='430' y='74' width='155' height='95' rx='12' fill='#9fc2f4' stroke='#2c5ea8' stroke-width='4'/><line x1='365' y1='120' x2='420' y2='120' stroke='#2c5ea8' stroke-width='3' marker-end='url(#arrowHead)'/><text x='170' y='132' font-size='24' fill='#1f3f75' font-weight='700' font-family='Inter, Arial'>1 : 50.000</text><text x='450' y='132' font-size='22' fill='#1f3f75' font-weight='700' font-family='Inter, Arial'>1 : 100.000</text><text x='350' y='110' font-size='12' fill='#1f3f75' font-weight='700'>diperkecil</text>";
  } else if (kind === "cermin_vertikal") {
    inner = "<line x1='380' y1='30' x2='380' y2='195' stroke='#2c5ea8' stroke-width='5' stroke-dasharray='8 8'/><polygon points='190,165 275,70 315,165' fill='#83ace8' stroke='#2c5ea8' stroke-width='5'/><polygon points='570,165 485,70 445,165' fill='#b7d2f8' stroke='#2c5ea8' stroke-width='5'/><text x='387' y='48' font-size='12' fill='#1f3f75' font-weight='700'>sumbu cermin</text>";
  } else if (kind === "arah_kompas") {
    inner = "<circle cx='380' cy='110' r='74' fill='none' stroke='#2c5ea8' stroke-width='5'/><line x1='380' y1='36' x2='380' y2='184' stroke='#2c5ea8' stroke-width='4'/><line x1='306' y1='110' x2='454' y2='110' stroke='#2c5ea8' stroke-width='4'/><line x1='380' y1='110' x2='430' y2='72' stroke='#2c5ea8' stroke-width='3' marker-end='url(#arrowHead)'/><text x='372' y='28' font-size='20' fill='#1f3f75' font-weight='700'>U</text><text x='372' y='206' font-size='20' fill='#1f3f75' font-weight='700'>S</text><text x='278' y='116' font-size='20' fill='#1f3f75' font-weight='700'>B</text><text x='468' y='116' font-size='20' fill='#1f3f75' font-weight='700'>T</text><text x='434' y='68' font-size='12' fill='#1f3f75' font-weight='700'>arah</text>";
  } else if (kind === "rotasi_panah") {
    inner = "<rect x='180' y='52' width='130' height='120' rx='10' fill='#d7e7ff' stroke='#2c5ea8' stroke-width='4'/><rect x='330' y='52' width='130' height='120' rx='10' fill='#bcd5f7' stroke='#2c5ea8' stroke-width='4'/><rect x='480' y='52' width='100' height='120' rx='10' fill='#95bdf0' stroke='#2c5ea8' stroke-width='4'/><line x1='312' y1='112' x2='326' y2='112' stroke='#2c5ea8' stroke-width='3' marker-end='url(#arrowHead)'/><line x1='462' y1='112' x2='476' y2='112' stroke='#2c5ea8' stroke-width='3' marker-end='url(#arrowHead)'/><polygon points='227,112 260,84 260,102 286,102 286,122 260,122 260,140' fill='#1f3f75'/><polygon points='382,80 410,112 392,112 392,138 372,138 372,112 354,112' fill='#1f3f75'/><text x='518' y='118' font-size='38' fill='#1f3f75' font-weight='700' font-family='Inter, Arial'>?</text><text x='344' y='186' font-size='12' fill='#1f3f75' font-weight='700'>rotasi 90 deg</text>";
  } else if (kind === "jaring_kubus") {
    inner = "<rect x='230' y='88' width='70' height='70' fill='#d7e7ff' stroke='#2c5ea8' stroke-width='4'/><rect x='300' y='88' width='70' height='70' fill='#b5cff7' stroke='#2c5ea8' stroke-width='4'/><rect x='370' y='88' width='70' height='70' fill='#8cb4ed' stroke='#2c5ea8' stroke-width='4'/><rect x='440' y='88' width='70' height='70' fill='#b5cff7' stroke='#2c5ea8' stroke-width='4'/><rect x='300' y='18' width='70' height='70' fill='#d7e7ff' stroke='#2c5ea8' stroke-width='4'/><rect x='300' y='158' width='70' height='70' fill='#d7e7ff' stroke='#2c5ea8' stroke-width='4'/><text x='334' y='132' text-anchor='middle' font-size='14' fill='#1f3f75' font-weight='700'>T</text><text x='264' y='132' text-anchor='middle' font-size='14' fill='#1f3f75' font-weight='700'>L</text><text x='404' y='132' text-anchor='middle' font-size='14' fill='#1f3f75' font-weight='700'>R</text>";
  } else {
    inner = "<rect x='245' y='58' width='130' height='130' fill='#d6e6ff' stroke='#2c5ea8' stroke-width='5'/><rect x='390' y='58' width='130' height='130' fill='#93b8ef' stroke='#2c5ea8' stroke-width='5'/><text x='300' y='129' text-anchor='middle' font-size='20' fill='#1f3f75' font-weight='700' font-family='Inter, Arial'>A</text><text x='455' y='129' text-anchor='middle' font-size='20' fill='#1f3f75' font-weight='700' font-family='Inter, Arial'>B</text>";
  }
  return {
    src: createSvgDataUri(inner),
    caption: "Perhatikan ilustrasi ruang berikut."
  };
}

const SECTION_SHORTCUTS = {
  bahasa: [
    "Gunakan metode eliminasi: buang 2 opsi paling tidak relevan terlebih dahulu.",
    "Fokus pada kata inti dan konteks kalimat, jangan terpancing kata mirip bunyi.",
    "Untuk kalimat efektif, pilih versi paling ringkas tanpa mengubah makna."
  ],
  hitungan: [
    "Estimasi cepat dulu untuk menolak opsi yang tidak masuk akal.",
    "Jika rumus sederhana, hitung dari opsi (backward checking) agar lebih cepat.",
    "Waspadai satuan dan persen; salah satuan sering jadi jebakan."
  ],
  umum: [
    "Prioritaskan opsi yang paling sesuai konstitusi dan tata kelola resmi.",
    "Jika ragu, pilih jawaban paling umum dan paling normatif dalam administrasi negara.",
    "Hindari opsi yang terlalu ekstrem atau tidak sesuai prinsip layanan publik."
  ],
  pola: [
    "Cek pola selisih, rasio, lalu kombinasi keduanya.",
    "Tuliskan 2 loncatan terakhir untuk menebak suku berikutnya lebih cepat.",
    "Untuk huruf, ubah ke urutan alfabet agar lompatan mudah terlihat."
  ],
  ruang: [
    "Bayangkan rotasi per 90 derajat dan lacak hanya satu sisi acuan.",
    "Untuk skala, ingat penyebut makin besar berarti objek pada peta makin kecil.",
    "Kerjakan dari opsi yang paling pasti salah untuk mempercepat eliminasi."
  ],
  bentuk: [
    "Ingat sifat inti bangun: jumlah sisi sejajar, panjang sisi, dan sudut.",
    "Pisahkan bangun yang mirip (persegi vs persegi panjang) lewat ciri kunci.",
    "Jika soal definisi, pilih opsi yang memuat syarat paling lengkap."
  ],
  kdkmp: [
    "Pilih opsi yang berbasis data, terukur, dan bisa dievaluasi.",
    "Dalam konflik/manajemen risiko, utamakan SOP, AD/ART, dan musyawarah.",
    "Hindari opsi instan; jawaban terbaik biasanya sistematis dan berkelanjutan."
  ]
};

SECTION_SHORTCUTS.twk = SECTION_SHORTCUTS.umum;
SECTION_SHORTCUTS.tiu = SECTION_SHORTCUTS.hitungan;
SECTION_SHORTCUTS.tkp = SECTION_SHORTCUTS.kdkmp;
SECTION_SHORTCUTS.akhlak = SECTION_SHORTCUTS.umum;
SECTION_SHORTCUTS.numerik = SECTION_SHORTCUTS.hitungan;
SECTION_SHORTCUTS.verbal = SECTION_SHORTCUTS.bahasa;
SECTION_SHORTCUTS.manajerial = SECTION_SHORTCUTS.kdkmp;

const TRAP_TIPS_BANK = {
  persen: {
    label: "Jebakan Persen",
    clue: "Biasanya ada angka persentase, kenaikan/penurunan, atau pertumbuhan.",
    shortcuts: [
      "Ubah ke pecahan cepat: 10% = 1/10, 25% = 1/4, 50% = 1/2.",
      "Hitung nilai dasar dulu, baru persen (hindari hitung lompat).",
      "Cek kewajaran hasil: persen kecil tidak mungkin memberi hasil terlalu besar."
    ]
  },
  antonim: {
    label: "Jebakan Antonim/Sinonim",
    clue: "Opsi sering mirip makna, tapi tidak berlawanan langsung.",
    shortcuts: [
      "Tentukan makna inti kata pada konteks formal.",
      "Coret opsi yang hanya 'mirip bunyi' tetapi beda makna.",
      "Untuk antonim, cari lawan yang paling tegas, bukan sekadar berbeda tipis."
    ]
  },
  pola_angka: {
    label: "Jebakan Pola Angka",
    clue: "Deret tampak sederhana tapi sering gabungan selisih dan rasio.",
    shortcuts: [
      "Cek urutan: selisih -> rasio -> pola campuran.",
      "Bandingkan 3 loncatan terakhir, bukan hanya 1 loncatan.",
      "Jika buntu, uji opsi dari tengah ke atas/bawah untuk validasi cepat."
    ]
  },
  pola_huruf: {
    label: "Jebakan Pola Huruf",
    clue: "Huruf terlihat acak, padahal ada lompatan alfabet.",
    shortcuts: [
      "Konversi huruf ke nomor alfabet (A=1 ... Z=26).",
      "Hitung lompatan antarhuruf, cari tren kenaikan/penurunan.",
      "Waspadai pola bertingkat seperti +2, +3, +4."
    ]
  },
  rasio: {
    label: "Jebakan Rasio",
    clue: "Angka total dimasukkan untuk mengacaukan rasio dasar.",
    shortcuts: [
      "Ambil rasio dari data mentah terlebih dulu.",
      "Sederhanakan rasio jika bisa dibagi faktor sama.",
      "Jangan tertukar urutan (A:B berbeda dengan B:A)."
    ]
  },
  skala_ruang: {
    label: "Jebakan Skala/Ruang",
    clue: "Pertanyaan rotasi/skala sering menukar orientasi.",
    shortcuts: [
      "Pilih satu sisi acuan lalu ikuti perpindahannya.",
      "Ingat: penyebut skala lebih besar -> objek pada peta lebih kecil.",
      "Eliminasi opsi yang melanggar prinsip geometri dasar."
    ]
  },
  definisi_bentuk: {
    label: "Jebakan Definisi Bentuk",
    clue: "Opsi terlihat benar sebagian, tapi tidak memenuhi semua syarat.",
    shortcuts: [
      "Cari kata kunci definisi: sisi, sudut, sejajar, sama panjang.",
      "Prioritaskan opsi dengan syarat paling lengkap.",
      "Hindari opsi yang hanya benar pada satu ciri."
    ]
  },
  manajerial: {
    label: "Jebakan Opsi Manajerial",
    clue: "Banyak opsi tampak baik, tapi tidak sistematis/terukur.",
    shortcuts: [
      "Utamakan opsi berbasis data, SOP, dan indikator kinerja.",
      "Pilih langkah yang punya tindak lanjut dan evaluasi.",
      "Hindari opsi instan, sepihak, atau tanpa analisis risiko."
    ]
  },
  kebijakan_umum: {
    label: "Jebakan Kebijakan Umum",
    clue: "Opsi bisa bernuansa benar, tapi tidak sesuai prinsip tata negara.",
    shortcuts: [
      "Pilih jawaban paling normatif sesuai aturan resmi.",
      "Eliminasi opsi ekstrem yang tidak proporsional.",
      "Gunakan prinsip dasar: legalitas, akuntabilitas, pelayanan publik."
    ]
  },
  umum: {
    label: "Pola Soal Umum",
    clue: "Gunakan teknik eliminasi dan manajemen waktu.",
    shortcuts: [
      "Baca inti pertanyaan sebelum melihat semua opsi.",
      "Coret 2 opsi paling lemah dulu agar fokus.",
      "Jika ragu > 20 detik, tandai lalu lanjut."
    ]
  }
};

const TRAP_DEEP_GUIDE = {
  persen: {
    steps: [
      "Tentukan dulu nilai dasar (angka sebelum persen).",
      "Ubah persen ke bentuk pecahan/desimal paling cepat.",
      "Hitung kasar dulu untuk cek logika, baru hitung presisi."
    ],
    pattern: "Jika soal memuat kenaikan/penurunan, pakai: nilai baru = nilai awal x (1 ± p/100).",
    miniExample: "Contoh: 20% dari 150 = 0,2 x 150 = 30.",
    avoid: "Hindari langsung mengalikan tanpa tahu mana nilai dasar dan mana persennya."
  },
  antonim: {
    steps: [
      "Cari makna inti kata target dalam konteks kalimat.",
      "Eliminasi kata yang dekat makna atau netral.",
      "Pilih lawan yang paling tegas, bukan yang sekadar berbeda nuansa."
    ],
    pattern: "Sinonim = makna searah; antonim = makna berlawanan langsung.",
    miniExample: "Contoh: 'objektif' lawan paling tepat adalah 'subjektif'.",
    avoid: "Hindari opsi yang terdengar canggih tapi tidak berlawanan makna."
  },
  pola_angka: {
    steps: [
      "Cek selisih antarangka berturut-turut.",
      "Jika tidak konsisten, cek rasio atau pola selang-seling.",
      "Uji 1-2 opsi ke pola untuk validasi tercepat."
    ],
    pattern: "Urutan cepat: selisih -> rasio -> kombinasi.",
    miniExample: "Contoh: 3, 6, 12, 24 -> pola x2 -> berikutnya 48.",
    avoid: "Jangan hanya melihat dua angka pertama."
  },
  pola_huruf: {
    steps: [
      "Ubah huruf ke nomor alfabet (A=1 ... Z=26).",
      "Hitung lompatan antarposisi huruf.",
      "Cari tren lompatan (tetap/naik/turun)."
    ],
    pattern: "Banyak soal memakai kenaikan bertahap seperti +2, +3, +4.",
    miniExample: "Contoh: A, C, F, J -> +2, +3, +4, maka berikutnya +5 = O.",
    avoid: "Jangan menebak huruf tanpa memetakan lompatan."
  },
  rasio: {
    steps: [
      "Tuliskan data mentah sesuai urutan yang diminta.",
      "Sederhanakan rasio dengan FPB.",
      "Cek ulang urutan A:B agar tidak terbalik."
    ],
    pattern: "Rasio bukan jumlah; gunakan pasangan langsung dari data.",
    miniExample: "Contoh: 18:24 disederhanakan jadi 3:4.",
    avoid: "Jangan campur rasio dengan total kecuali diminta."
  },
  skala_ruang: {
    steps: [
      "Pilih satu sisi/arah sebagai patokan.",
      "Lakukan transformasi satu per satu (rotasi/cermin/skala).",
      "Buang opsi yang melanggar orientasi dasar."
    ],
    pattern: "Skala peta: penyebut lebih besar -> gambar lebih kecil.",
    miniExample: "1:50.000 ke 1:100.000 membuat objek tergambar lebih kecil.",
    avoid: "Jangan membayangkan semua sisi sekaligus; pakai satu acuan."
  },
  definisi_bentuk: {
    steps: [
      "Identifikasi ciri wajib dari bangun yang ditanya.",
      "Bandingkan satu per satu dengan opsi.",
      "Pilih opsi yang memenuhi semua ciri, bukan sebagian."
    ],
    pattern: "Soal definisi menang di kata kunci: sisi, sudut, sejajar, sama panjang.",
    miniExample: "Persegi: 4 sisi sama panjang dan 4 sudut siku-siku.",
    avoid: "Jangan tertipu opsi yang hanya cocok di satu karakteristik."
  },
  manajerial: {
    steps: [
      "Cari opsi yang diawali diagnosis masalah berbasis data.",
      "Prioritaskan tindakan yang punya SOP, indikator, dan evaluasi.",
      "Pilih solusi berkelanjutan, bukan instan."
    ],
    pattern: "Jawaban terbaik biasanya: analisis -> aksi -> monitoring -> evaluasi.",
    miniExample: "Masalah partisipasi rapat: analisis akar masalah lalu redesign layanan anggota.",
    avoid: "Hindari opsi sepihak, tanpa data, atau tanpa tindak lanjut."
  },
  kebijakan_umum: {
    steps: [
      "Cocokkan dengan prinsip konstitusi/aturan umum.",
      "Eliminasi opsi ekstrem atau tidak proporsional.",
      "Pilih jawaban paling normatif dan akuntabel."
    ],
    pattern: "Kebijakan publik yang benar: legal, transparan, berorientasi layanan.",
    miniExample: "Pelayanan publik yang baik: cepat, mudah, transparan.",
    avoid: "Jangan pilih opsi populer jika bertentangan dengan prinsip hukum."
  },
  umum: {
    steps: [
      "Baca inti pertanyaan dalam 5-8 detik pertama.",
      "Eliminasi 2 opsi lemah agar fokus.",
      "Putuskan cepat atau tandai jika ragu."
    ],
    pattern: "Kecepatan + eliminasi lebih efektif daripada hitung ulang panjang.",
    miniExample: "Jika dua opsi jelas salah, peluang benar naik jadi 1 dari 3.",
    avoid: "Jangan terjebak terlalu lama pada satu nomor."
  }
};

function inferTrapType(question) {
  const text = `${question.prompt} ${question.explanation}`.toLowerCase();
  if (["hitungan", "tiu", "numerik"].includes(question.sectionId)) {
    if (text.includes("%") || text.includes("persen")) {
      return "persen";
    }
    if (text.includes("rasio")) {
      return "rasio";
    }
  }
  if (["bahasa", "verbal"].includes(question.sectionId)) {
    if (text.includes("antonim") || text.includes("sinonim")) {
      return "antonim";
    }
  }
  if (question.sectionId === "pola") {
    if (text.includes("huruf")) {
      return "pola_huruf";
    }
    return "pola_angka";
  }
  if (question.sectionId === "ruang") {
    return "skala_ruang";
  }
  if (question.sectionId === "bentuk") {
    return "definisi_bentuk";
  }
  if (["kdkmp", "tkp", "manajerial"].includes(question.sectionId)) {
    return "manajerial";
  }
  if (["umum", "twk", "akhlak"].includes(question.sectionId)) {
    return "kebijakan_umum";
  }
  return "umum";
}

function getTrapTipPack(question) {
  const trapType = inferTrapType(question);
  return TRAP_TIPS_BANK[trapType] || TRAP_TIPS_BANK.umum;
}

function getDeepGuideByTrapType(trapType) {
  return TRAP_DEEP_GUIDE[trapType] || TRAP_DEEP_GUIDE.umum;
}

function inferQuestionShortcut(question) {
  if (question.shortcut && question.shortcut.trim()) {
    return question.shortcut;
  }
  const pack = getTrapTipPack(question);
  if (pack.shortcuts && pack.shortcuts.length > 0) {
    return pack.shortcuts[0];
  }
  if (question.sectionId === "hitungan") {
    return "Cara pintas: estimasi dulu hasilnya, lalu verifikasi cepat ke opsi terdekat agar hemat waktu.";
  }
  if (question.sectionId === "bahasa") {
    return "Cara pintas: identifikasi kata kunci, eliminasi 2 opsi yang maknanya paling jauh, baru pilih final.";
  }
  if (question.sectionId === "kdkmp") {
    return "Cara pintas: pilih opsi paling manajerial (berbasis data, ada tindak lanjut, dan sesuai tata kelola).";
  }
  return "Cara pintas: baca inti pertanyaan, eliminasi opsi ekstrem, lalu pilih jawaban paling logis dan konsisten.";
}

function pickThreeTips(sourceTips, offset) {
  if (!sourceTips.length) {
    return ["Gunakan eliminasi opsi.", "Jaga ketenangan dan waktu.", "Tandai soal ragu untuk putaran kedua."];
  }
  const selected = [];
  for (let i = 0; i < 3; i += 1) {
    selected.push(sourceTips[(offset + i) % sourceTips.length]);
  }
  return selected;
}

function renderQuickTips(sectionId, question) {
  const baseTips = SECTION_SHORTCUTS[sectionId] || [
    "Kerjakan soal mudah lebih dulu, tandai soal ragu untuk putaran kedua.",
    "Gunakan eliminasi opsi agar keputusan lebih cepat.",
    "Jaga waktu, jangan terjebak lama di satu nomor."
  ];
  const trapType = inferTrapType(question);
  const trap = TRAP_TIPS_BANK[trapType] || TRAP_TIPS_BANK.umum;
  const guide = getDeepGuideByTrapType(trapType);
  const mergedTips = [...baseTips, ...trap.shortcuts];
  const tips = pickThreeTips(mergedTips, state.ui.tipOffset);
  const tipMax = Math.max(mergedTips.length, 1);
  dom.tipIndicator.textContent = `Tip ${(state.ui.tipOffset % tipMax) + 1}/${tipMax}`;
  dom.quickTipsCard.innerHTML = `
    <h4>Tips Cepat Subtes</h4>
    <ul>
      <li>${tips[0]}</li>
      <li>${tips[1]}</li>
      <li>${tips[2]}</li>
    </ul>
    <h4>${trap.label}</h4>
    <ul>
      <li>${trap.clue}</li>
      <li>${trap.shortcuts[0]}</li>
      <li>${trap.shortcuts[1]}</li>
      <li>${trap.shortcuts[2]}</li>
    </ul>
    <h4>Langkah Jawab Cepat</h4>
    <ul>
      <li>${guide.steps[0]}</li>
      <li>${guide.steps[1]}</li>
      <li>${guide.steps[2]}</li>
    </ul>
    <h4>Pola Umum</h4>
    <p>${guide.pattern}</p>
    <h4>Contoh Mini</h4>
    <p>${guide.miniExample}</p>
  `;
}

function renderInstantStrategy(question) {
  const trapType = inferTrapType(question);
  const trap = TRAP_TIPS_BANK[trapType] || TRAP_TIPS_BANK.umum;
  const guide = getDeepGuideByTrapType(trapType);
  const shortcut = inferQuestionShortcut(question);
  dom.instantStrategy.innerHTML = `
    <div class="instant-strategy-head">
      <strong>Tips & Trik Soal Ini</strong>
      <span>${trap.label}</span>
    </div>
    <p>${shortcut}</p>
    <div class="instant-strategy-steps">
      <span>1) ${guide.steps[0]}</span>
      <span>2) ${guide.steps[1]}</span>
      <span>3) ${guide.steps[2]}</span>
    </div>
  `;
}

function renderLearningCoach(question) {
  const answer = state.answers[state.currentQuestionIndex];
  const trapType = inferTrapType(question);
  const trap = TRAP_TIPS_BANK[trapType] || TRAP_TIPS_BANK.umum;
  const guide = getDeepGuideByTrapType(trapType);

  if (answer === null) {
    dom.learningCoach.className = "learning-coach";
    dom.learningCoach.innerHTML = `
      <div class="learning-coach-head">
        <strong>Mode Belajar Aktif</strong>
        <span>Interaktif</span>
      </div>
      <p>Pilih jawaban untuk melihat umpan balik langsung dan pelajaran inti soal ini.</p>
      <div class="learning-coach-points">
        <span>Gunakan shortcut: A-E untuk jawab cepat.</span>
        <span>Panah kiri/kanan untuk pindah nomor.</span>
        <span>Tekan F untuk tandai ragu.</span>
      </div>
    `;
    return;
  }

  const isCorrect = answer === question.correctIndex;
  const mainLabel = isCorrect ? "Jawaban Anda Benar" : "Jawaban Anda Belum Tepat";
  const outcomeClass = isCorrect ? "learning-coach correct" : "learning-coach wrong";
  dom.learningCoach.className = outcomeClass;
  dom.learningCoach.innerHTML = `
    <div class="learning-coach-head">
      <strong>${mainLabel}</strong>
      <span>${trap.label}</span>
    </div>
    <p><strong>Pelajaran inti:</strong> ${question.explanation}</p>
    <div class="learning-coach-points">
      <span>Konsep cepat: ${guide.pattern}</span>
      <span>Langkah ulang: 1) ${guide.steps[0]} 2) ${guide.steps[1]} 3) ${guide.steps[2]}</span>
      <span>Anti jebakan: ${guide.avoid}</span>
    </div>
  `;
}

let tipToastTimer = null;

function ensureTipToast() {
  if (dom.tipToast) {
    return dom.tipToast;
  }
  const box = document.createElement("div");
  box.id = "tipToast";
  box.className = "tip-toast";
  document.body.appendChild(box);
  dom.tipToast = box;
  return box;
}

function hideTipToast() {
  if (!dom.tipToast) {
    return;
  }
  dom.tipToast.classList.remove("active");
}

function showWrongAnswerTipNotification(question, chosenIndex) {
  const toast = ensureTipToast();
  if (tipToastTimer) {
    clearTimeout(tipToastTimer);
  }
  const trapType = inferTrapType(question);
  const trap = TRAP_TIPS_BANK[trapType] || TRAP_TIPS_BANK.umum;
  const guide = getDeepGuideByTrapType(trapType);
  const chosenText = `${ALPHABET[chosenIndex]}. ${question.options[chosenIndex]}`;
  const correctText = `${ALPHABET[question.correctIndex]}. ${question.options[question.correctIndex]}`;
  const quickA = trap.shortcuts?.[0] || guide.steps[0];
  const quickB = trap.shortcuts?.[1] || guide.steps[1];

  toast.innerHTML = `
    <div class="tip-toast-head">
      <strong>Belajar dari Kesalahan</strong>
      <button type="button" id="closeTipToastBtn">Tutup</button>
    </div>
    <p><strong>Jawaban Anda:</strong> ${chosenText}</p>
    <p><strong>Kunci yang tepat:</strong> ${correctText}</p>
    <p><strong>Tips & Trik:</strong> ${trap.label}</p>
    <ul>
      <li>${quickA}</li>
      <li>${quickB}</li>
      <li>${guide.avoid}</li>
    </ul>
    <button type="button" id="openTrapGuideFromToast" class="btn-secondary">Lihat Panduan Jebakan</button>
  `;
  toast.classList.add("active");

  const closeBtn = toast.querySelector("#closeTipToastBtn");
  const openGuideBtn = toast.querySelector("#openTrapGuideFromToast");
  closeBtn?.addEventListener("click", hideTipToast);
  openGuideBtn?.addEventListener("click", () => {
    state.ui.trapGuideOpen = true;
    dom.showTrapGuideBtn.textContent = "Sembunyikan Panduan";
    renderTrapGuide(question);
    dom.trapGuideBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    hideTipToast();
  });

  tipToastTimer = setTimeout(() => {
    hideTipToast();
  }, 9000);
}

function buildRemedialCandidate(trapType, currentQuestion) {
  const candidates = state.questions.filter((q, idx) => (
    idx !== state.currentQuestionIndex && inferTrapType(q) === trapType
  ));
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return currentQuestion;
}

function closeRemedialModal() {
  state.ui.remedialActive = false;
  dom.remedialModal.classList.remove("active");
  dom.remedialFeedback.classList.remove("active");
  dom.remedialFeedback.innerHTML = "";
}

function getLiveTrapStats(limit = 4) {
  const map = {};
  state.questions.forEach((q, idx) => {
    const ans = state.answers[idx];
    if (ans === null) {
      return;
    }
    const trapType = inferTrapType(q);
    if (!map[trapType]) {
      map[trapType] = {
        trapType,
        label: TRAP_TIPS_BANK[trapType]?.label || trapType,
        answered: 0,
        correct: 0
      };
    }
    map[trapType].answered += 1;
    if (ans === q.correctIndex) {
      map[trapType].correct += 1;
    }
  });
  return Object.values(map)
    .map((x) => ({ ...x, accuracy: x.answered ? Math.round((x.correct / x.answered) * 100) : 0 }))
    .sort((a, b) => (b.answered - a.answered) || (a.accuracy - b.accuracy))
    .slice(0, limit);
}

function renderLearningDashboard() {
  const answered = state.answers.filter((x) => x !== null).length;
  const correct = state.questions.reduce((sum, q, idx) => (
    sum + (state.answers[idx] === q.correctIndex ? 1 : 0)
  ), 0);
  const acc = answered ? Math.round((correct / answered) * 100) : 0;
  dom.liveAccuracy.textContent = `${acc}%`;
  dom.liveCorrectStreak.textContent = String(state.ui.correctStreak);
  dom.liveWrongStreak.textContent = String(state.ui.wrongStreak);
  dom.liveBestStreak.textContent = String(state.ui.bestCorrectStreak);

  const topTraps = getLiveTrapStats();
  if (topTraps.length === 0) {
    dom.liveTrapList.innerHTML = `<p class="muted">Belum ada data. Mulai jawab soal untuk melihat performa per pola jebakan.</p>`;
    return;
  }
  dom.liveTrapList.innerHTML = topTraps.map((item) => `
    <div class="live-trap-item">
      <div class="live-trap-head">
        <span>${item.label}</span>
        <strong>${item.accuracy}%</strong>
      </div>
      <div class="live-trap-bar">
        <span style="width: ${item.accuracy}%"></span>
      </div>
      <small>${item.correct}/${item.answered} benar</small>
    </div>
  `).join("");
}

function startMiniRemedial(question) {
  const trapType = inferTrapType(question);
  const trap = TRAP_TIPS_BANK[trapType] || TRAP_TIPS_BANK.umum;
  const guide = getDeepGuideByTrapType(trapType);
  const candidate = buildRemedialCandidate(trapType, question);
  state.ui.remedialActive = true;

  dom.remedialTitle.textContent = `Mini Remedial: ${trap.label}`;
  dom.remedialPrompt.textContent = candidate.prompt;
  dom.remedialOptions.innerHTML = "";
  dom.remedialFeedback.classList.remove("active");
  dom.remedialFeedback.innerHTML = "";

  candidate.options.forEach((opt, idx) => {
    const el = document.createElement("div");
    el.className = "option";
    el.innerHTML = `<span class="option-index">${ALPHABET[idx]}</span><div>${opt}</div>`;
    el.addEventListener("click", () => {
      if (!state.ui.remedialActive) {
        return;
      }
      [...dom.remedialOptions.children].forEach((child, cIdx) => {
        child.classList.remove("active");
        if (cIdx === candidate.correctIndex) {
          child.classList.add("active");
        }
      });
      const correct = idx === candidate.correctIndex;
      dom.remedialFeedback.classList.add("active");
      dom.remedialFeedback.innerHTML = `
        <strong>${correct ? "Mantap, remedial berhasil." : "Belum tepat, tapi ini pembelajaran penting."}</strong><br>
        <strong>Pembahasan:</strong> ${candidate.explanation}<br>
        <strong>Langkah cepat:</strong> 1) ${guide.steps[0]} 2) ${guide.steps[1]} 3) ${guide.steps[2]}
      `;
    });
    dom.remedialOptions.appendChild(el);
  });

  dom.remedialModal.classList.add("active");
}

function flashTipsCard() {
  // Animasi flash dinonaktifkan agar UI tidak terasa "berdetak".
}

function chooseCurrentAnswer(answerIndex) {
  const q = state.questions[state.currentQuestionIndex];
  if (!q || answerIndex < 0 || answerIndex > q.options.length - 1) {
    return;
  }
  const prevAnswer = state.answers[state.currentQuestionIndex];
  const isFirstAttempt = prevAnswer === null;
  const isNewChoice = prevAnswer !== answerIndex;
  state.answers[state.currentQuestionIndex] = answerIndex;
  const isCorrect = answerIndex === q.correctIndex;
  playFeedbackTone(isCorrect ? "correct" : "wrong");
  if (!isCorrect && isNewChoice) {
    showWrongAnswerTipNotification(q, answerIndex);
    if (isFirstAttempt) {
      state.ui.wrongStreak += 1;
      state.ui.correctStreak = 0;
      if (state.ui.wrongStreak >= 3 && !state.ui.remedialActive) {
        state.ui.wrongStreak = 0;
        startMiniRemedial(q);
      }
    }
  } else if (isCorrect) {
    hideTipToast();
    if (isFirstAttempt && isNewChoice) {
      state.ui.correctStreak += 1;
      state.ui.bestCorrectStreak = Math.max(state.ui.bestCorrectStreak, state.ui.correctStreak);
      state.ui.wrongStreak = 0;
    }
  }
  renderExam();
}

function shuffleQuestionOptions(question) {
  if (!state.settings.shuffleOptions) {
    return question;
  }
  const entries = question.options.map((value, idx) => ({ value, idx }));
  const shuffled = shuffleArray(entries);
  return {
    ...question,
    options: shuffled.map((x) => x.value),
    correctIndex: shuffled.findIndex((x) => x.idx === question.correctIndex)
  };
}

function getCurrentProfile() {
  return EXAM_PROFILES[state.examType] || EXAM_PROFILES.kdkmp;
}

function getExamTypeLabel(examType) {
  return EXAM_PROFILES[examType]?.label || "Simulasi Umum";
}

function renderExamDetails() {
  const profile = getCurrentProfile();
  dom.appTitle.textContent = profile.headline;
  dom.appSubtitle.textContent = profile.subtitle;
  if (dom.examDetailList) {
    dom.examDetailList.innerHTML = "";
    profile.blueprint.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.title}: ${item.count} soal (${item.durationMin} menit)`;
      dom.examDetailList.appendChild(li);
    });
  }
  const totalSoal = profile.blueprint.reduce((sum, x) => sum + x.count, 0);
  const totalMenit = profile.blueprint.reduce((sum, x) => sum + x.durationMin, 0);
  if (dom.badge) {
    dom.badge.textContent = `${profile.label} • ${totalSoal} Soal • ${totalMenit} Menit`;
  }
}

function loadTopScores() {
  try {
    const raw = localStorage.getItem(LOCAL_TOP_SCORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveTopScores(list) {
  localStorage.setItem(LOCAL_TOP_SCORE_KEY, JSON.stringify(list));
}

function addTopScoreEntry(result) {
  const list = loadTopScores();
  list.push({
    examType: state.examType,
    examLabel: getExamTypeLabel(state.examType),
    name: state.participant.name,
    participantId: state.participant.id,
    score100: Number(result.score100),
    finishedAt: new Date().toISOString()
  });
  list.sort((a, b) => b.score100 - a.score100);
  saveTopScores(list.slice(0, 30));
}

function renderTopScores() {
  const list = loadTopScores();
  dom.leaderboardBody.innerHTML = "";
  if (list.length === 0) {
    dom.leaderboardBody.innerHTML = `
      <div class="leaderboard-row empty">
        <p>Belum ada data skor. Jadilah yang pertama!</p>
      </div>
    `;
    return;
  }
  list.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    const rankClass = idx < 3 ? `rank-${idx + 1}` : "";
    row.innerHTML = `
      <div><span class="rank-badge ${rankClass}">${idx + 1}</span></div>
      <div><strong>${item.name}</strong><br><small class="muted">${item.participantId}</small></div>
      <div>${item.examLabel || getExamTypeLabel(item.examType)}</div>
      <div><strong class="text-primary">${Number(item.score100).toFixed(2)}</strong></div>
    `;
    dom.leaderboardBody.appendChild(row);
  });
}

function getActiveBlueprint() {
  if (state.customBank && Array.isArray(state.customBank.blueprint) && state.customBank.blueprint.length > 0) {
    return state.customBank.blueprint;
  }
  return getCurrentProfile().blueprint;
}

function normalizeImportedQuestion(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const prompt = typeof raw.prompt === "string" ? raw.prompt.trim() : "";
  const explanation = typeof raw.explanation === "string" ? raw.explanation.trim() : "";
  const options = Array.isArray(raw.options) ? raw.options.map((x) => String(x)) : [];
  if (!prompt || options.length !== 5) {
    return null;
  }

  let correctIndex = Number(raw.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 4) {
    if (typeof raw.correctAnswer === "string") {
      const found = options.findIndex((x) => x === raw.correctAnswer);
      if (found >= 0) {
        correctIndex = found;
      }
    }
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 4) {
    return null;
  }

  return {
    prompt,
    options,
    correctIndex,
    explanation: explanation || "Pembahasan belum tersedia untuk soal ini."
  };
}

function parseCustomBank(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Format JSON tidak valid.");
  }
  if (!payload.sections || typeof payload.sections !== "object") {
    throw new Error("JSON harus memiliki properti sections.");
  }

  const sections = {};
  const blueprint = [];
  const sourceBlueprint = Array.isArray(payload.blueprint) ? payload.blueprint : [];

  Object.keys(payload.sections).forEach((sectionId) => {
    const list = Array.isArray(payload.sections[sectionId]) ? payload.sections[sectionId] : [];
    const normalized = list.map(normalizeImportedQuestion).filter(Boolean);
    if (normalized.length === 0) {
      return;
    }
    sections[sectionId] = normalized;

    const fromBlueprint = sourceBlueprint.find((x) => x.id === sectionId) || {};
    blueprint.push({
      id: sectionId,
      title: typeof fromBlueprint.title === "string" && fromBlueprint.title.trim()
        ? fromBlueprint.title.trim()
        : `Subtes ${sectionId.toUpperCase()}`,
      count: normalized.length,
      durationMin: Number.isFinite(Number(fromBlueprint.durationMin))
        ? Number(fromBlueprint.durationMin)
        : 7
    });
  });

  if (blueprint.length === 0) {
    throw new Error("Tidak ada soal valid pada file JSON.");
  }

  return { sections, blueprint };
}

function updateBankInfoText() {
  if (!state.customBank) {
    dom.bankInfo.textContent = "Menggunakan bank soal bawaan sistem.";
    return;
  }
  const total = Object.values(state.customBank.sections).reduce((sum, arr) => sum + arr.length, 0);
  dom.bankInfo.textContent = `Bank soal custom aktif: ${total} soal pada ${state.customBank.blueprint.length} subtes.`;
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return;
  }
  await document.exitFullscreen();
}

function generateQuestionsBySection(sectionId, count) {
  const generatorMap = {
    bahasa: generateBahasa,
    verbal: generateBahasa,
    hitungan: generateHitungan,
    tiu: generateHitungan,
    numerik: generateHitungan,
    umum: generatePengetahuanUmum,
    twk: generatePengetahuanUmum,
    akhlak: generateAKHLAK,
    pola: generatePola,
    ruang: generateAbstraksiRuang,
    bentuk: generateBentuk,
    kdkmp: generateKDKMP,
    tkp: generateTKP,
    manajerial: generateKDKMP
  };
  const generator = generatorMap[sectionId] || generatePengetahuanUmum;
  return generator(Math.max(0, Number(count) || 0));
}

function buildQuestionBank() {
  const blueprint = getActiveBlueprint();
  const bySection = state.customBank?.sections || Object.fromEntries(
    blueprint.map((section) => [section.id, generateQuestionsBySection(section.id, section.count)])
  );

  const questions = [];
  const ranges = {};
  let globalIndex = 0;

  blueprint.forEach((section) => {
    let pool = (bySection[section.id] || []).slice(0, section.count);
    if (state.settings.shuffleQuestions) {
      pool = shuffleArray(pool);
    }
    pool = pool.map((q) => shuffleQuestionOptions(q));
    const start = globalIndex;
    pool.forEach((item, idx) => {
      questions.push({
        ...item,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionLocalNumber: idx + 1,
        globalNumber: globalIndex + 1
      });
      globalIndex += 1;
    });
    ranges[section.id] = { start, end: globalIndex - 1, count: pool.length };
  });

  return { questions, ranges };
}

function generateBahasa(count) {
  const sinonim = [
    ["akuntabel", "dapat dipertanggungjawabkan"],
    ["koordinasi", "penyelarasan"],
    ["komprehensif", "menyeluruh"],
    ["prioritas", "utama"],
    ["mitigasi", "pengurangan risiko"],
    ["resiliensi", "daya lenting"],
    ["konsensus", "kesepakatan"],
    ["inklusif", "merangkul semua pihak"]
  ];
  const antonim = [
    ["objektif", "subjektif"],
    ["transparan", "tertutup"],
    ["stabil", "fluktuatif"],
    ["adaptif", "kaku"],
    ["efisien", "boros"],
    ["progresif", "stagnan"],
    ["kolaboratif", "individualistis"],
    ["akurat", "keliru"]
  ];
  const kalimatEfektif = [
    [
      "Pada rapat evaluasi, pengurus koperasi memutuskan untuk meningkatkan mutu layanan anggota agar proses pinjaman menjadi lebih cepat.",
      "Pada rapat evaluasi, pengurus koperasi memutuskan meningkatkan mutu layanan agar proses pinjaman lebih cepat.",
      "Kalimat efektif menghilangkan kata tidak perlu, tetapi tetap menjaga makna inti."
    ],
    [
      "Sehubungan dengan adanya pelatihan digitalisasi, maka seluruh pengelola koperasi diwajibkan untuk hadir tepat waktu.",
      "Sehubungan dengan pelatihan digitalisasi, seluruh pengelola koperasi wajib hadir tepat waktu.",
      "Kata 'adanya' dan 'untuk' tidak diperlukan sehingga kalimat lebih ringkas."
    ],
    [
      "Program pendampingan usaha ini bertujuan untuk supaya UMKM anggota berkembang lebih optimal.",
      "Program pendampingan usaha ini bertujuan agar UMKM anggota berkembang lebih optimal.",
      "Kata 'untuk supaya' redundan dan cukup diganti menjadi 'agar'."
    ]
  ];
  const analogi = [
    ["musyawarah", "kesepakatan", "mediasi", "perdamaian"],
    ["rencana kerja", "pelaksanaan", "anggaran", "penggunaan"],
    ["ketua", "koordinasi", "bendahara", "pencatatan keuangan"],
    ["evaluasi", "perbaikan", "monitoring", "pengendalian"]
  ];
  const simpulanParagraf = [
    [
      "Digitalisasi koperasi meningkatkan kecepatan layanan, tetapi membutuhkan pelatihan SDM dan SOP yang jelas. Tanpa dua hal itu, adopsi sistem cenderung menurun.",
      "Digitalisasi efektif jika didukung pelatihan SDM dan SOP.",
      "Simpulan yang tepat merangkum hubungan sebab-akibat utama dalam paragraf."
    ],
    [
      "Partisipasi anggota naik ketika jadwal rapat fleksibel, materi rapat relevan, dan tindak lanjut keputusan terdokumentasi.",
      "Partisipasi anggota meningkat bila rapat dirancang relevan dan terstruktur.",
      "Simpulan merangkum faktor utama yang mendorong peningkatan partisipasi."
    ],
    [
      "Program pembiayaan mikro berhasil ketika seleksi calon penerima akurat, pendampingan rutin berjalan, dan evaluasi dampak dilakukan berkala.",
      "Keberhasilan pembiayaan mikro ditentukan seleksi, pendampingan, dan evaluasi berkala.",
      "Simpulan menggabungkan tiga syarat inti keberhasilan program."
    ]
  ];
  const ejaanBaku = [
    ["resiko", "risiko"],
    ["aktifitas", "aktivitas"],
    ["obyektif", "objektif"],
    ["analisa", "analisis"],
    ["praktek", "praktik"],
    ["ijin", "izin"]
  ];
  const distractWord = [
    "bertingkat",
    "sementara",
    "terbatas",
    "parsial",
    "prosedural",
    "operasional",
    "situasional",
    "teknis"
  ];
  const sinonimDistractorMap = {
    akuntabel: ["konsisten", "terbuka", "partisipatif", "berorientasi hasil"],
    koordinasi: ["komunikasi", "komando", "konsolidasi", "sinkronisasi terbatas"],
    komprehensif: ["parsial", "garis besar", "sederhana", "selektif"],
    prioritas: ["pendukung", "pelengkap", "tambahan", "opsional"],
    mitigasi: ["adaptasi", "reaksi", "kompensasi", "normalisasi"],
    resiliensi: ["ketahanan awal", "kesiapsiagaan", "respons cepat", "pemulihan sesaat"],
    konsensus: ["voting mayoritas", "instruksi pimpinan", "kompromi sepihak", "musyawarah awal"],
    inklusif: ["eksklusif", "selektif", "terbatas", "sebagian pihak"]
  };
  const antonimDistractorMap = {
    objektif: ["argumentatif", "rasional", "kritis", "kontekstual"],
    transparan: ["terstruktur", "terpadu", "terukur", "terjadwal"],
    stabil: ["dinamis", "konstan", "tetap", "berimbang"],
    adaptif: ["responsif", "fleksibel", "proaktif", "situasional"],
    efisien: ["hemat", "optimal", "produktif", "efektif"],
    progresif: ["konservatif", "evolutif", "incremental", "berkelanjutan"],
    kolaboratif: ["kooperatif", "partisipatif", "kolegial", "sinergis"],
    akurat: ["presisi rendah", "aproksimatif", "indikatif", "estimatif"]
  };
  const simpulanDistractor = [
    [
      "Digitalisasi cukup didorong oleh pengadaan aplikasi tanpa pembinaan SDM.",
      "SOP dapat disusun setelah implementasi berjalan penuh.",
      "Kecepatan layanan otomatis meningkat meski SDM tidak dilatih.",
      "Penurunan adopsi lebih dipengaruhi faktor eksternal semata."
    ],
    [
      "Kenaikan partisipasi rapat terutama dipicu kewajiban kehadiran anggota.",
      "Dokumentasi keputusan tidak berkorelasi dengan partisipasi anggota.",
      "Jadwal rapat fleksibel cukup tanpa perbaikan kualitas materi.",
      "Relevansi materi rapat tidak memengaruhi antusiasme anggota."
    ],
    [
      "Keberhasilan pembiayaan mikro terutama ditentukan besaran plafon pinjaman.",
      "Pendampingan cukup dilakukan di awal program tanpa evaluasi lanjutan.",
      "Seleksi penerima dapat dipermudah selama penyaluran cepat tercapai.",
      "Evaluasi dampak hanya diperlukan pada akhir siklus program."
    ]
  ];

  const out = [];
  for (let i = 0; i < count; i += 1) {
    const mode = i % 6;
    if (mode === 0) {
      const [kata, benar] = sinonim[i % sinonim.length];
      out.push(createQuestion(
        `Dalam konteks tata kelola layanan publik, sinonim yang paling tepat untuk kata "${kata}" adalah ...`,
        benar,
        (sinonimDistractorMap[kata] || []).concat(distractWord).concat(sinonim.map((x) => x[1])),
        `Kunci: "${benar}". Dalam konteks formal, kata tersebut memiliki makna paling setara dengan "${kata}" dibanding opsi lain.`,
        i % 5
      ));
    } else if (mode === 1) {
      const [kata, benar] = antonim[i % antonim.length];
      out.push(createQuestion(
        `Pilih antonim yang paling tepat untuk kata "${kata}" dalam ragam bahasa formal.`,
        benar,
        (antonimDistractorMap[kata] || []).concat(distractWord).concat(antonim.map((x) => x[1])),
        `Kunci: "${benar}". Opsi tersebut berlawanan makna secara langsung dengan "${kata}".`,
        i % 5
      ));
    } else if (mode === 2) {
      const [soalKalimat, benar, pembahasan] = kalimatEfektif[i % kalimatEfektif.length];
      const distractKalimat = [
        benar.replace(" meningkatkan mutu layanan", " untuk meningkatkan mutu layanan"),
        benar.replace(" agar ", " sehingga "),
        benar.replace(" wajib ", " diwajibkan untuk "),
        soalKalimat
      ];
      out.push(createQuestion(
        `Perhatikan kalimat berikut.\n"${soalKalimat}"\nPerbaikan kalimat efektif yang paling tepat adalah ...`,
        benar,
        distractKalimat,
        `Kunci: "${benar}". ${pembahasan}`,
        i % 5
      ));
    } else if (mode === 3) {
      const [a, b, c, benar] = analogi[i % analogi.length];
      out.push(createQuestion(
        `Tentukan pasangan analogi yang setara.\n${a} : ${b} = ${c} : ...`,
        benar,
        ["pengawasan", "pelaporan", "penjadwalan", "standardisasi", "delegasi"],
        `Kunci: "${benar}". Relasi ${a}-${b} menunjukkan keterkaitan fungsi/hasil; pasangan ${c}-${benar} paling sepadan.`,
        i % 5
      ));
    } else if (mode === 4) {
      const [paragraf, benar, pembahasan] = simpulanParagraf[i % simpulanParagraf.length];
      out.push(createQuestion(
        `Bacalah paragraf berikut.\n"${paragraf}"\nSimpulan yang paling tepat adalah ...`,
        benar,
        simpulanDistractor[i % simpulanDistractor.length],
        `Kunci: "${benar}". ${pembahasan}`,
        i % 5
      ));
    } else {
      const [tidakBaku, baku] = ejaanBaku[i % ejaanBaku.length];
      out.push(createQuestion(
        `Menurut kaidah PUEBI, bentuk baku yang tepat dari kata "${tidakBaku}" adalah ...`,
        baku,
        ejaanBaku.map((x) => x[1]).concat(["koordinatif", "adaptif"]).filter((x) => x !== baku),
        `Kunci: "${baku}". Berdasarkan kaidah PUEBI, bentuk tidak baku "${tidakBaku}" dibakukan menjadi "${baku}".`,
        i % 5
      ));
    }
  }
  return out;
}

function generateHitungan(count) {
  const desa = ["Suka Maju", "Harapan Jaya", "Mekar Tani", "Karya Bersama", "Sejahtera"];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const mode = i % 8;
    if (mode === 0) {
      const modal = 120 + (i % 6) * 20;
      const naik = 10 + (i % 3) * 5;
      const turun = 5 + (i % 3) * 5;
      const akhir = Math.round(modal * (1 + (naik / 100)) * (1 - (turun / 100)));
      out.push(createQuestion(
        `Unit usaha di Desa ${desa[i % desa.length]} memiliki modal awal ${modal} juta rupiah. Setelah naik ${naik}% dan kemudian turun ${turun}%, nilai akhir modal adalah ...`,
        `${akhir} juta`,
        [`${akhir - 6} juta`, `${akhir + 6} juta`, `${akhir - 10} juta`, `${akhir + 10} juta`],
        `Gunakan perubahan bertingkat: ${modal} x (1 + ${naik}/100) x (1 - ${turun}/100) = ${akhir}. Jadi modal akhir ${akhir} juta rupiah.`,
        i % 5
      ));
    } else if (mode === 1) {
      const petugasAwal = 6 + (i % 4) * 2;
      const hariAwal = 12 + (i % 3) * 3;
      const petugasBaru = petugasAwal + 3;
      const benar = Math.ceil((petugasAwal * hariAwal) / petugasBaru);
      out.push(createQuestion(
        `${petugasAwal} petugas menyelesaikan verifikasi data dalam ${hariAwal} hari. Jika jumlah petugas ditambah menjadi ${petugasBaru} orang dengan produktivitas sama, waktu yang dibutuhkan adalah ...`,
        `${benar} hari`,
        [`${benar - 2} hari`, `${benar - 1} hari`, `${benar + 1} hari`, `${benar + 2} hari`],
        `Gunakan perbandingan berbalik nilai: p1 x t1 = p2 x t2. Maka t2 = (${petugasAwal} x ${hariAwal})/${petugasBaru} = ${benar} hari (dibulatkan ke atas).`,
        i % 5
      ));
    } else if (mode === 2) {
      const totalBulan = 5;
      const rataRata = 76 + (i % 5) * 3;
      const empatBulan = [70 + (i % 4), 74 + (i % 4), 78 + (i % 4), 80 + (i % 4)];
      const jumlah4 = empatBulan.reduce((s, x) => s + x, 0);
      const benar = (rataRata * totalBulan) - jumlah4;
      out.push(createQuestion(
        `Rata-rata skor monitoring selama 5 bulan adalah ${rataRata}. Jika skor 4 bulan pertama berturut-turut ${empatBulan.join(", ")}, skor bulan ke-5 adalah ...`,
        String(benar),
        [String(benar - 2), String(benar + 2), String(benar - 4), String(benar + 4)],
        `Total skor 5 bulan = ${rataRata} x 5 = ${rataRata * 5}. Jumlah 4 bulan pertama = ${jumlah4}. Jadi skor bulan ke-5 = ${(rataRata * 5) - jumlah4}.`,
        i % 5
      ));
    } else if (mode === 3) {
      const barisAwal = 12 + (i % 4);
      const beda = 4 + (i % 3);
      const sukuKe = 6 + (i % 3);
      const benar = barisAwal + ((sukuKe - 1) * beda);
      out.push(createQuestion(
        `Suatu deret aritmetika memiliki suku pertama ${barisAwal} dan beda ${beda}. Nilai suku ke-${sukuKe} adalah ...`,
        String(benar),
        [String(benar - beda), String(benar + beda), String(benar - 2), String(benar + 2)],
        `Gunakan rumus Un = a + (n-1)b, sehingga U${sukuKe} = ${barisAwal} + (${sukuKe}-1) x ${beda} = ${benar}.`,
        i % 5
      ));
    } else if (mode === 4) {
      const aHari = 4 + (i % 3);
      const bHari = 6 + (i % 4);
      const benar = Math.round((1 / ((1 / aHari) + (1 / bHari))) * 10) / 10;
      out.push(createQuestion(
        `Petugas A menyelesaikan validasi data dalam ${aHari} hari, sedangkan petugas B dalam ${bHari} hari. Jika keduanya bekerja bersama dengan laju konstan, pekerjaan selesai sekitar ...`,
        `${benar} hari`,
        [`${(benar + 0.8).toFixed(1)} hari`, `${(benar + 1.2).toFixed(1)} hari`, `${(benar - 0.6).toFixed(1)} hari`, `${(benar + 1.8).toFixed(1)} hari`],
        `Laju kerja gabungan = 1/${aHari} + 1/${bHari}. Maka waktu = 1/(laju gabungan) = ${benar} hari.`,
        i % 5
      ));
    } else if (mode === 5) {
      const beli = 24000 + (i % 5) * 3000;
      const untung = 15 + (i % 4) * 5;
      const benar = Math.round(beli * (1 + (untung / 100)));
      out.push(createQuestion(
        `Suatu produk koperasi dibeli seharga Rp${beli.toLocaleString("id-ID")} lalu dijual dengan keuntungan ${untung}%. Harga jual yang tepat adalah ...`,
        `Rp${benar.toLocaleString("id-ID")}`,
        [
          `Rp${(benar - 2000).toLocaleString("id-ID")}`,
          `Rp${(benar + 2000).toLocaleString("id-ID")}`,
          `Rp${(benar - 4000).toLocaleString("id-ID")}`,
          `Rp${(benar + 4000).toLocaleString("id-ID")}`
        ],
        `Harga jual = harga beli x (1 + persentase untung) = ${beli} x (1 + ${untung}/100) = Rp${benar.toLocaleString("id-ID")}.`,
        i % 5
      ));
    } else if (mode === 6) {
      const total = 120 + (i % 5) * 20;
      const laki = 45 + (i % 4) * 5;
      const benar = Math.round((laki / total) * 100);
      out.push(createQuestion(
        `Dalam pelatihan yang diikuti ${total} peserta, jumlah peserta laki-laki adalah ${laki} orang. Persentase peserta laki-laki adalah ...`,
        `${benar}%`,
        [`${benar - 5}%`, `${benar + 5}%`, `${benar - 10}%`, `${benar + 10}%`],
        `Persentase peserta laki-laki = (${laki}/${total}) x 100% = ${benar}%.`,
        i % 5
      ));
    } else {
      const jarak = 90 + (i % 6) * 15;
      const kecepatan = 30 + (i % 5) * 5;
      const benar = Math.round((jarak / kecepatan) * 100) / 100;
      const menit = Math.round(benar * 60);
      out.push(createQuestion(
        `Tim monitoring menempuh jarak ${jarak} km dengan kecepatan rata-rata ${kecepatan} km/jam. Waktu tempuh yang diperlukan adalah ...`,
        `${menit} menit`,
        [`${menit - 15} menit`, `${menit + 15} menit`, `${menit - 30} menit`, `${menit + 30} menit`],
        `Waktu = jarak/kecepatan = ${jarak}/${kecepatan} = ${benar} jam. Konversi ke menit: ${menit} menit.`,
        i % 5
      ));
    }
  }
  return out;
}

function generatePengetahuanUmum(count) {
  const bank = [
    ["Lembaga yang berwenang menguji undang-undang terhadap UUD 1945 adalah ...", "Mahkamah Konstitusi", "Uji materi undang-undang terhadap UUD 1945 merupakan kewenangan Mahkamah Konstitusi."],
    ["Lembaga yang memeriksa pengelolaan dan tanggung jawab keuangan negara adalah ...", "BPK", "BPK memiliki mandat audit atas pengelolaan keuangan negara."],
    ["Sistem pemerintahan Indonesia berdasarkan UUD 1945 adalah ...", "Presidensial", "Presiden adalah kepala negara sekaligus kepala pemerintahan dalam sistem presidensial."],
    ["Sila ke-3 Pancasila menegaskan nilai ...", "Persatuan Indonesia", "Sila ketiga menekankan integrasi nasional di atas kepentingan golongan."],
    ["Bhinneka Tunggal Ika bermakna ...", "Berbeda-beda tetapi tetap satu", "Semboyan ini menegaskan persatuan dalam keberagaman."],
    ["Instrumen utama perencanaan pembangunan nasional jangka menengah adalah ...", "RPJMN", "RPJMN menjadi arah kebijakan pembangunan lima tahunan nasional."],
    ["Rencana pembangunan jangka menengah daerah disebut ...", "RPJMD", "RPJMD menjadi pedoman pembangunan daerah selama masa jabatan kepala daerah."],
    ["Asas utama pelayanan publik yang baik adalah ...", "Cepat, mudah, dan transparan", "Pelayanan publik berkualitas berorientasi pada kemudahan, kecepatan, dan keterbukaan."],
    ["Mata uang resmi Negara Republik Indonesia adalah ...", "Rupiah", "Sesuai ketentuan, Rupiah merupakan alat pembayaran yang sah di Indonesia."],
    ["Pemilu nasional di Indonesia dilaksanakan setiap ...", "5 tahun", "Siklus pemilu nasional dilaksanakan 5 tahunan."],
    ["Prinsip negara hukum menempatkan seluruh tindakan pemerintah harus berdasarkan ...", "Peraturan perundang-undangan", "Asas legalitas mewajibkan tindakan pemerintahan berbasis aturan hukum."],
    ["Lembaga yang berwenang memeriksa laporan keuangan pemerintah adalah ...", "BPK", "Pemeriksaan pengelolaan dan tanggung jawab keuangan negara dilakukan oleh BPK."],
    ["Dokumen perencanaan pembangunan daerah lima tahunan adalah ...", "RPJMD", "RPJMD menjadi acuan pembangunan daerah dalam periode kepala daerah."],
    ["Salah satu indikator tata kelola publik yang baik adalah ...", "Akuntabilitas", "Akuntabilitas memastikan setiap kebijakan dapat dipertanggungjawabkan."],
    ["Asas penyelenggaraan pelayanan publik yang menekankan keterbukaan informasi adalah ...", "Transparansi", "Transparansi membuat proses layanan mudah dipantau publik."],
    ["Nilai yang dikedepankan sila ke-5 Pancasila adalah ...", "Keadilan sosial", "Sila kelima menegaskan keadilan sosial bagi seluruh rakyat Indonesia."],
    ["Dokumen perencanaan pembangunan nasional 20 tahunan disebut ...", "RPJPN", "RPJPN menjadi arah pembangunan nasional jangka panjang."],
    ["Fungsi utama APBN dalam kebijakan publik adalah ...", "Pedoman penerimaan dan belanja negara", "APBN merupakan instrumen fiskal pemerintah untuk menjalankan program negara."],
    ["Asas desentralisasi memberi kewenangan kepada ...", "Pemerintah daerah", "Desentralisasi mendorong daerah mengatur urusan pemerintahan sesuai kewenangannya."],
    ["Instrumen hukum tertinggi di Indonesia adalah ...", "UUD 1945", "UUD 1945 merupakan norma hukum dasar tertinggi."],
    ["Makna utama Bhinneka Tunggal Ika dalam kebijakan publik adalah ...", "Persatuan dalam keberagaman", "Nilai ini menegaskan keberagaman harus dikelola dalam semangat persatuan."],
    ["Lembaga yang berwenang mengadili sengketa hasil pemilu adalah ...", "Mahkamah Konstitusi", "Sengketa hasil pemilu nasional menjadi ranah Mahkamah Konstitusi."],
    ["Kebijakan publik yang baik harus memiliki indikator ...", "Terukur", "Indikator terukur diperlukan agar evaluasi kebijakan objektif."],
    ["Pelaksanaan musrenbang bertujuan utama untuk ...", "Menyerap aspirasi perencanaan pembangunan", "Musrenbang menjadi forum partisipatif penyusunan rencana pembangunan."]
  ];

  const categoryDistractorMap = {
    "Mahkamah Konstitusi": ["Mahkamah Agung", "Komisi Yudisial", "MPR", "DPR"],
    BPK: ["BPKP", "Kementerian Keuangan", "Inspektorat Jenderal", "OJK"],
    Presidensial: ["Parlementer", "Semi-presidensial", "Monarki konstitusional", "Federal"],
    "Persatuan Indonesia": ["Keadilan sosial", "Kemanusiaan adil dan beradab", "Kerakyatan", "Ketuhanan Yang Maha Esa"],
    "Berbeda-beda tetapi tetap satu": ["Kesatuan tanpa perbedaan", "Kebebasan tanpa batas", "Keberagaman tanpa persatuan", "Persamaan mutlak"],
    RPJMN: ["RPJPN", "RPJMD", "RKP", "Renstra K/L"],
    RPJMD: ["RPJMN", "RPJPD", "RKPD", "Renja OPD"],
    "Cepat, mudah, dan transparan": ["Lambat namun akurat", "Prosedural ketat", "Tertutup dan formal", "Berjenjang tanpa kepastian"],
    Rupiah: ["Dolar AS", "Euro", "Yen", "Ringgit"],
    "5 tahun": ["4 tahun", "6 tahun", "7 tahun", "3 tahun"],
    "Peraturan perundang-undangan": ["Diskresi pejabat", "Kebiasaan birokrasi", "Arahan lisan", "Kesepakatan informal"],
    Akuntabilitas: ["Popularitas", "Sentralisasi", "Dominasi mayoritas", "Diskresi personal"],
    Transparansi: ["Kerahasiaan internal", "Eksklusivitas informasi", "Pembatasan akses data", "Komunikasi satu arah"],
    "Keadilan sosial": ["Persatuan nasional", "Kerakyatan", "Ketuhanan", "Kemanusiaan"],
    RPJPN: ["RPJMN", "RPJPD", "RKP", "RPJMD"],
    "Pedoman penerimaan dan belanja negara": ["Dokumen audit internal", "Rencana kerja kementerian", "Instrumen moneter bank sentral", "Laporan pertanggungjawaban tahunan"],
    "Pemerintah daerah": ["Pemerintah pusat", "Lembaga yudikatif", "Lembaga legislatif nasional", "Badan usaha milik negara"],
    "UUD 1945": ["Undang-Undang", "Peraturan Pemerintah", "Perpres", "Permen"],
    "Persatuan dalam keberagaman": ["Asimilasi total", "Dominasi kelompok mayoritas", "Keseragaman budaya", "Kompetisi antarkelompok"],
    Terukur: ["Normatif", "Abstrak", "Generik", "Simbolik"],
    "Menyerap aspirasi perencanaan pembangunan": ["Menyusun laporan realisasi anggaran", "Menetapkan sanksi administratif", "Menghimpun pajak daerah", "Melakukan inspeksi mendadak"]
  };
  const globalDistract = [
    "Mahkamah Agung", "BPKP", "MPR", "DPR", "DPD",
    "RPJPD", "RKP", "RKPD", "4 tahun", "6 tahun",
    "Sentralisasi", "Dekonsentrasi", "Dolar AS", "Diskresi tanpa aturan"
  ];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    out.push(createQuestion(
      `Pilih jawaban yang paling tepat.\n${item[0]}`,
      item[1],
      (categoryDistractorMap[item[1]] || []).concat(globalDistract).concat(bank.map((b) => b[1])),
      `Kunci: "${item[1]}". ${item[2]}`,
      i % 5
    ));
  }
  return out;
}

function generateTKP(count) {
  const bank = [
    [
      "Anda melihat rekan kerja melakukan kesalahan prosedur yang cukup fatal tapi tidak ada yang tahu. Tindakan Anda adalah ...",
      "Menegurnya secara pribadi dan membantunya memperbaiki kesalahan tersebut",
      "Integritas dan kolaborasi menuntut kita berani meluruskan kesalahan dengan cara yang tepat."
    ],
    [
      "Menjelang jam pulang, atasan memberikan tugas mendadak yang harus selesai besok pagi. Sikap Anda adalah ...",
      "Mengerjakannya dengan penuh tanggung jawab meski harus lembur sebentar",
      "Profesionalisme dan loyalitas pada tugas adalah nilai utama dalam pelayanan publik."
    ],
    [
      "Seorang pelanggan marah-marah karena merasa pelayanan terlalu lambat. Anda akan ...",
      "Tetap tenang, mendengarkan keluhan, dan memberikan penjelasan serta solusi dengan sopan",
      "Orientasi pelayanan menuntut kesabaran dan kemampuan problem solving yang baik."
    ],
    [
      "Dalam diskusi kelompok, ide Anda ditolak oleh mayoritas anggota. Reaksi Anda ...",
      "Menerima keputusan tersebut dengan lapang dada dan mendukung ide yang terpilih",
      "Kemampuan bekerja sama dan berlapang dada adalah kunci keharmonisan tim."
    ],
    [
      "Ada perubahan sistem kerja baru yang lebih kompleks dan menggunakan teknologi baru. Anda akan ...",
      "Mempelajarinya dengan antusias agar cepat menguasai sistem tersebut",
      "Nilai adaptif dan kemauan belajar sangat penting dalam menghadapi perubahan."
    ],
    [
      "Rekan kerja Anda sedang mengalami kesulitan pribadi yang memengaruhi kinerjanya. Anda akan ...",
      "Memberikan dukungan moral dan menawarkan bantuan jika memungkinkan",
      "Empati dan keharmonisan lingkungan kerja meningkatkan produktivitas tim."
    ]
  ];
  const distractWord = ["Marah", "Diam saja", "Lapor atasan langsung", "Mengabaikan", "Protes keras"];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    out.push(createQuestion(
      `Tes Karakteristik Pribadi: ${item[0]}`,
      item[1],
      distractWord.concat(bank.map((b) => b[1])).filter((x) => x !== item[1]),
      `Kunci: "${item[1]}". ${item[2]}`,
      i % 5
    ));
  }
  return out;
}

function generatePola(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const mode = i % 6;
    if (mode === 0) {
      const start = 2 + (i % 5);
      const diff = 3 + (i % 4);
      const seq = [start, start + diff, start + 2 * diff, start + 3 * diff];
      const benar = String(start + 4 * diff);
      const options = placeCorrectOption(
        benar,
        [String(Number(benar) - 1), String(Number(benar) + 1), String(Number(benar) + diff), String(Number(benar) - diff)],
        i % 5
      );
      out.push({
        prompt: `Perhatikan deret berikut: ${seq.join(", ")}. Nilai suku berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: `Kunci: ${benar}. Selisih antarsuku konstan +${diff}, sehingga suku berikutnya = ${seq[seq.length - 1]} + ${diff}.`,
        visual: createSequenceVisual(seq)
      });
    } else if (mode === 1) {
      const a = 2 + (i % 3);
      const ratio = i % 2 === 0 ? 2 : 3;
      const seq = [a, a * ratio, a * ratio * ratio, a * ratio * ratio * ratio];
      const benar = String(a * ratio * ratio * ratio * ratio);
      const options = placeCorrectOption(
        benar,
        [
          String(seq[seq.length - 1] + ratio),
          String(seq[seq.length - 1] * (ratio + 1)),
          String(Number(benar) - ratio),
          String(Number(benar) + ratio)
        ],
        i % 5
      );
      out.push({
        prompt: `Perhatikan deret berikut: ${seq.join(", ")}. Nilai suku berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: `Kunci: ${benar}. Pola deret adalah dikali ${ratio} secara konsisten pada setiap langkah.`,
        visual: createSequenceVisual(seq)
      });
    } else if (mode === 2) {
      const start = 5 + (i % 4);
      const inc1 = 2 + (i % 3);
      const inc2 = inc1 + 2;
      const inc3 = inc2 + 2;
      const seq = [start, start + inc1, start + inc1 + inc2, start + inc1 + inc2 + inc3];
      const nextInc = inc3 + 2;
      const benar = String(seq[seq.length - 1] + nextInc);
      const options = placeCorrectOption(
        benar,
        [
          String(seq[seq.length - 1] + inc3),
          String(seq[seq.length - 1] + nextInc + 2),
          String(Number(benar) - 2),
          String(Number(benar) + 4)
        ],
        i % 5
      );
      out.push({
        prompt: `Perhatikan deret berikut: ${seq.join(", ")}. Nilai suku berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: `Kunci: ${benar}. Selisih antarsuku membentuk pola naik +2: +${inc1}, +${inc2}, +${inc3}, sehingga berikutnya +${nextInc}.`,
        visual: createSequenceVisual(seq)
      });
    } else if (mode === 3) {
      const seq = ["A", "C", "F", "J", "O"];
      const benar = "U";
      const options = placeCorrectOption(benar, ["T", "V", "W", "S", "R"], i % 5);
      out.push({
        prompt: `Perhatikan deret huruf berikut: ${seq.join(", ")}. Huruf pada posisi berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: "Kunci: U. Pola lompatan alfabet berturut-turut adalah +2, +3, +4, +5, sehingga lompatan berikutnya +6 menghasilkan U.",
        visual: createSequenceVisual(seq)
      });
    } else if (mode === 4) {
      const seq = ["^", ">", "v", "<", "^"];
      const benar = ">";
      const options = placeCorrectOption(benar, ["^", "v", "<", "x"], i % 5);
      out.push({
        prompt: `Perhatikan pola gambar berikut (arah panah): ${seq.join(", ")}. Simbol berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: "Kunci: >. Arah panah berputar 90 derajat searah jarum jam secara berulang.",
        visual: createSequenceVisual(seq)
      });
    } else {
      const seq = ["[]", "()()", "[][][]", "()()()()", "[][][][][]"];
      const benar = "()()()()()()";
      const options = placeCorrectOption(
        benar,
        ["[][][][][][]", "()()()()()", "[][][][][]", "()()()()()()()"],
        i % 5
      );
      out.push({
        prompt: `Perhatikan pola gambar berulang berikut: ${seq.join(", ")}. Elemen berikutnya yang tepat adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: "Kunci: ()()()()()(). Pola berganti jenis simbol secara selang-seling sambil jumlah pasangan bertambah satu setiap langkah.",
        visual: createSequenceVisual(seq)
      });
    }
  }
  return out;
}

function generateAbstraksiRuang(count) {
  const bank = [
    {
      p: "Sebuah kubus diputar 90 derajat searah jarum jam terhadap sumbu vertikal. Posisi sisi depan setelah rotasi adalah ...",
      a: "Sisi kanan",
      e: "Kunci: Sisi kanan. Pada rotasi 90 derajat searah jarum jam (dilihat dari atas), sisi kanan berpindah ke posisi depan.",
      d: ["Sisi kiri", "Sisi belakang", "Sisi atas", "Sisi bawah"],
      visual: createSpatialVisual("kubus_rotasi")
    },
    {
      p: "Jika skala peta berubah dari 1:50.000 menjadi 1:100.000, representasi objek pada peta akan tampak ...",
      a: "Lebih kecil",
      e: "Kunci: Lebih kecil. Semakin besar angka penyebut skala, semakin kecil ukuran objek yang tergambar.",
      d: ["Lebih besar", "Tetap sama", "Lebih detail", "Lebih tebal"],
      visual: createSpatialVisual("skala_peta")
    },
    {
      p: "Sebuah panah mula-mula mengarah ke kanan. Jika diputar 90 derajat berlawanan arah jarum jam, arah panah menjadi ...",
      a: "Atas",
      e: "Kunci: Atas. Rotasi 90 derajat berlawanan arah jarum jam dari kanan menghasilkan arah atas.",
      d: ["Bawah", "Kanan", "Kiri", "Tenggara"],
      visual: createSpatialVisual("rotasi_panah")
    },
    {
      p: "Pada peta berskala 1:50.000, jarak dua titik adalah 3 cm. Jarak sebenarnya kedua titik tersebut adalah ...",
      a: "1,5 km",
      e: "Kunci: 1,5 km. Jarak sebenarnya = 3 x 50.000 cm = 150.000 cm = 1,5 km.",
      d: ["0,5 km", "1,2 km", "2,0 km", "15 km"],
      visual: createSpatialVisual("skala_peta")
    },
    {
      p: "Jika seseorang bergerak 40 meter ke timur lalu 30 meter ke utara, jarak lurus dari titik awal ke titik akhir adalah ...",
      a: "50 meter",
      e: "Kunci: 50 meter. Gunakan Teorema Pythagoras: akar(40^2 + 30^2) = akar(2500) = 50.",
      d: ["45 meter", "60 meter", "70 meter", "80 meter"],
      visual: createSpatialVisual("arah_kompas")
    },
    {
      p: "Pada orientasi peta standar ketika arah utara berada di bagian atas, arah timur berada di ...",
      a: "Kanan",
      e: "Kunci: Kanan. Dalam orientasi peta standar, timur berada di sisi kanan.",
      d: ["Kiri", "Atas", "Bawah", "Barat"],
      visual: createSpatialVisual("arah_kompas")
    },
    {
      p: "Pada jaring-jaring kubus model salib, persegi yang berada di posisi tengah akan bersinggungan langsung dengan ... sisi saat dilipat.",
      a: "4 sisi",
      e: "Kunci: 4 sisi. Pada jaring-jaring kubus model salib, sisi tengah menjadi acuan yang berbatasan dengan empat sisi lain.",
      d: ["2 sisi", "3 sisi", "5 sisi", "6 sisi"],
      visual: createSpatialVisual("jaring_kubus")
    },
    {
      p: "Jika suatu objek dicerminkan terhadap sumbu vertikal, posisi sisi kiri objek akan berpindah ke ...",
      a: "Sisi kanan",
      e: "Kunci: Sisi kanan. Pencerminan terhadap sumbu vertikal menukar posisi kiri dan kanan.",
      d: ["Sisi kiri", "Sisi atas", "Sisi bawah", "Tetap di depan"],
      visual: createSpatialVisual("cermin_vertikal")
    }
  ];

  const distract = ["Sisi kiri", "Sisi belakang", "Sisi atas", "Prisma", "Limas", "84", "72"];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    const options = placeCorrectOption(item.a, [...(item.d || []), ...distract], i % 5);
    out.push({
      prompt: item.p,
      options,
      correctIndex: options.indexOf(item.a),
      explanation: item.e,
      visual: item.visual
    });
  }
  return out;
}

function generateBentuk(count) {
  const bank = [
    {
      p: "Bangun datar yang memiliki empat sisi sama panjang dan empat sudut siku-siku adalah ...",
      a: "Persegi",
      e: "Kunci: Persegi. Ciri utamanya adalah empat sisi sama panjang dan empat sudut 90 derajat.",
      d: ["Persegi panjang", "Belah ketupat", "Jajar genjang", "Layang-layang"],
      visual: createShapeVisual("persegi")
    },
    {
      p: "Bangun datar yang memiliki dua pasang sisi sejajar, sisi berhadapan sama panjang, tetapi tidak wajib memiliki sudut siku-siku adalah ...",
      a: "Jajar genjang",
      e: "Kunci: Jajar genjang. Ciri ini membedakan jajar genjang dari persegi panjang yang mensyaratkan sudut siku-siku.",
      d: ["Trapesium", "Belah ketupat", "Layang-layang", "Persegi panjang"],
      visual: createShapeVisual("jajar_genjang")
    },
    {
      p: "Pada belah ketupat, sifat diagonal yang benar adalah ...",
      a: "Kedua diagonal saling tegak lurus",
      e: "Kunci: Kedua diagonal saling tegak lurus. Pada belah ketupat, diagonal juga saling membagi dua.",
      d: ["Kedua diagonal sama panjang", "Diagonal tidak saling berpotongan", "Hanya satu diagonal membagi dua", "Diagonal sejajar satu sama lain"],
      visual: createShapeVisual("belah_ketupat")
    },
    {
      p: "Bangun layang-layang memiliki jumlah sumbu simetri lipat sebanyak ...",
      a: "1",
      e: "Kunci: 1. Layang-layang memiliki satu sumbu simetri yang membagi bangun menjadi dua bagian kongruen.",
      d: ["0", "2", "3", "4"],
      visual: createShapeVisual("layang_layang")
    },
    {
      p: "Jumlah simetri putar tingkat penuh pada persegi adalah ...",
      a: "4",
      e: "Kunci: 4. Persegi menempati bingkai semula setiap diputar 90 derajat, 180 derajat, 270 derajat, dan 360 derajat.",
      d: ["1", "2", "3", "8"],
      visual: createShapeVisual("simetri_putar")
    },
    {
      p: "Bangun datar yang memiliki tepat satu pasang sisi sejajar adalah ...",
      a: "Trapesium",
      e: "Kunci: Trapesium. Definisi trapesium adalah segiempat dengan tepat satu pasang sisi sejajar.",
      d: ["Jajar genjang", "Persegi panjang", "Belah ketupat", "Layang-layang"],
      visual: createShapeVisual("trapesium")
    },
    {
      p: "Jika sebuah sudut besarnya 135 derajat, sudut tersebut termasuk kategori ...",
      a: "Sudut tumpul",
      e: "Kunci: Sudut tumpul. Sudut tumpul berada pada rentang lebih dari 90 derajat dan kurang dari 180 derajat.",
      d: ["Sudut lancip", "Sudut siku-siku", "Sudut lurus", "Sudut refleks"],
      visual: createShapeVisual("sudut_tumpul")
    },
    {
      p: "Bangun datar yang semua titik pada kelilingnya berjarak sama terhadap satu titik pusat adalah ...",
      a: "Lingkaran",
      e: "Kunci: Lingkaran. Ini adalah definisi dasar lingkaran.",
      d: ["Elips", "Persegi", "Layang-layang", "Jajar genjang"],
      visual: createShapeVisual("lingkaran")
    },
    {
      p: "Jumlah sumbu simetri lipat pada persegi adalah ...",
      a: "4",
      e: "Kunci: 4. Persegi memiliki dua sumbu melalui diagonal dan dua sumbu melalui titik tengah sisi berhadapan.",
      d: ["1", "2", "3", "8"],
      visual: createShapeVisual("simetri_lipat")
    }
  ];

  const distract = [
    "Persegi panjang", "Belah ketupat", "Jajar genjang", "Layang-layang",
    "Segitiga sama kaki", "1", "3", "4", "Sudut lancip", "Sudut siku-siku", "Sudut lurus"
  ];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    const options = placeCorrectOption(item.a, [...(item.d || []), ...distract], i % 5);
    out.push({
      prompt: item.p,
      options,
      correctIndex: options.indexOf(item.a),
      explanation: item.e,
      visual: item.visual
    });
  }
  return out;
}

function generateAKHLAK(count) {
  const bank = [
    ["Amanah dalam konteks Core Values BUMN berarti ...", "Memegang teguh kepercayaan yang diberikan", "Amanah berarti integritas dan tanggung jawab atas janji/tugas."],
    ["Kompeten berarti terus belajar dan mengembangkan kapabilitas. Salah satu perilakunya adalah ...", "Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah", "Kompeten fokus pada pengembangan diri dan kualitas hasil kerja."],
    ["Harmonis menekankan pada nilai ...", "Saling peduli dan menghargai perbedaan", "Harmonis menciptakan lingkungan kerja yang kondusif dan inklusif."],
    ["Loyal berarti berdedikasi dan mengutamakan kepentingan Bangsa dan Negara. Contoh perilakunya adalah ...", "Menjaga nama baik sesama karyawan, pimpinan, BUMN, dan Negara", "Loyalitas ditunjukkan dengan menjaga reputasi dan integritas instansi."],
    ["Adaptif berarti terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan. Contoh perilakunya ...", "Cepat menyesuaikan diri untuk menjadi lebih baik", "Adaptabilitas kunci dalam menghadapi disrupsi digital dan bisnis."],
    ["Kolaboratif berarti membangun kerja sama yang sinergis. Perilaku utamanya adalah ...", "Memberi kesempatan kepada berbagai pihak untuk berkontribusi", "Kolaborasi mengutamakan sinergi untuk nilai tambah bersama."],
    ["Apa kepanjangan dari AKHLAK?", "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", "AKHLAK adalah identitas dan perekat budaya kerja BUMN."],
    ["Menghargai setiap orang apapun latar belakangnya adalah cerminan nilai ...", "Harmonis", "Saling menghargai adalah fondasi dari nilai Harmonis."],
    ["Menuntaskan tugas dengan kualitas terbaik adalah cerminan nilai ...", "Kompeten", "Hasil terbaik adalah output dari kompetensi yang dikembangkan."],
    ["Menjaga rahasia jabatan dan negara adalah cerminan nilai ...", "Loyal", "Kerahasiaan dan integritas adalah bagian dari loyalitas pada bangsa."]
  ];
  const globalDistract = [
    "Jujur, Disiplin, Tanggung Jawab",
    "Profesionalisme dan Mandiri",
    "Efisiensi dan Efektivitas",
    "Orientasi Pelanggan",
    "Inovasi Berkelanjutan"
  ];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    out.push(createQuestion(
      `Core Values BUMN (AKHLAK): ${item[0]}`,
      item[1],
      globalDistract.concat(bank.map((b) => b[1])).filter((x) => x !== item[1]),
      `Kunci: "${item[1]}". ${item[2]}`,
      i % 5
    ));
  }
  return out;
}

function generateKDKMP(count) {
  const kasus = [
    {
      p: "Koperasi desa mencatat penurunan partisipasi rapat anggota selama 3 periode. Tindakan manajerial paling tepat adalah ...",
      a: "Menganalisis akar masalah dan menyesuaikan pola layanan rapat berbasis kebutuhan anggota",
      e: "Penurunan partisipasi perlu ditangani melalui diagnosis masalah dan redesign layanan, bukan sekadar instruksi.",
      d: [
        "Menegur anggota yang tidak hadir tanpa evaluasi penyebab",
        "Mengurangi frekuensi rapat agar konflik berkurang",
        "Menutup forum diskusi agar rapat lebih singkat",
        "Menetapkan kehadiran wajib tanpa dukungan fasilitasi"
      ]
    },
    {
      p: "Unit usaha simpan pinjam mengalami NPL meningkat. Prioritas kebijakan pengurus adalah ...",
      a: "Memperketat analisis kelayakan, monitoring angsuran, dan edukasi peminjam",
      e: "Pengendalian kredit bermasalah membutuhkan kombinasi analisis risiko, kontrol, dan pendampingan anggota.",
      d: [
        "Membekukan seluruh pinjaman tanpa segmentasi risiko",
        "Menambah plafon pinjaman agar tunggakan tertutup",
        "Menghapus evaluasi kelayakan untuk mempercepat layanan",
        "Mengandalkan penagihan informal tanpa SOP"
      ]
    },
    {
      p: "Saat menyusun RKAT, data kebutuhan anggota tidak lengkap. Langkah awal terbaik adalah ...",
      a: "Melakukan pemetaan kebutuhan anggota melalui survei dan forum kelompok",
      e: "Perencanaan yang baik harus berbasis evidence agar program tepat sasaran.",
      d: [
        "Menyalin program tahun lalu tanpa validasi kebutuhan terbaru",
        "Menentukan prioritas berdasarkan asumsi pengurus inti",
        "Mengutamakan program paling populer tanpa data lapangan",
        "Menunda RKAT hingga seluruh data sempurna"
      ]
    },
    {
      p: "Pengurus ingin digitalisasi layanan koperasi, tetapi SDM belum siap. Strategi paling realistis adalah ...",
      a: "Menerapkan digitalisasi bertahap disertai pelatihan dan SOP",
      e: "Transformasi digital berhasil jika kesiapan SDM, proses, dan tata kelola dibangun bertahap.",
      d: [
        "Meluncurkan sistem penuh sekaligus agar cepat terlihat modern",
        "Menunda digitalisasi sampai semua anggota mahir teknologi",
        "Mengganti seluruh proses manual tanpa pelatihan",
        "Fokus membeli aplikasi tanpa redesign proses kerja"
      ]
    },
    {
      p: "Konflik antara dua kelompok anggota mengganggu operasional koperasi. Pendekatan terbaik adalah ...",
      a: "Mediasi berbasis AD/ART dengan fasilitator netral",
      e: "Mediasi berbasis aturan organisasi menjaga objektivitas sekaligus legitimasi keputusan.",
      d: [
        "Membiarkan konflik mereda sendiri agar tidak memperbesar isu",
        "Memutuskan sepihak berdasarkan suara mayoritas pengurus",
        "Menghapus kelompok yang dianggap sumber konflik",
        "Membatasi komunikasi antaranggota sementara waktu"
      ]
    },
    {
      p: "Pengurus menemukan selisih kas kecil berulang pada unit toko koperasi. Tindakan korektif paling tepat adalah ...",
      a: "Audit internal rutin, pemisahan fungsi, dan rekonsiliasi kas harian",
      e: "Pengendalian internal mencegah fraud melalui pemisahan tugas dan verifikasi berlapis.",
      d: [
        "Menambah kas cadangan agar selisih tidak terlihat",
        "Menunjuk satu orang memegang kas dan pembukuan sekaligus",
        "Mengurangi frekuensi pencatatan agar beban kerja turun",
        "Menutup unit toko untuk menghindari temuan berulang"
      ]
    },
    {
      p: "Program pemberdayaan UMKM anggota belum memberi dampak signifikan. Evaluasi yang paling relevan adalah ...",
      a: "Mengukur perubahan omzet, akses pasar, dan keberlanjutan usaha anggota",
      e: "Indikator dampak harus menilai outcome, bukan hanya jumlah pelatihan yang terlaksana.",
      d: [
        "Menghitung jumlah sertifikat pelatihan yang dibagikan",
        "Menilai keberhasilan dari banyaknya publikasi kegiatan",
        "Menggunakan indikator yang sama tanpa melihat konteks usaha",
        "Memperbanyak seminar tanpa pendampingan lapangan"
      ]
    },
    {
      p: "Dalam kondisi dana terbatas, prioritas investasi koperasi sebaiknya ditentukan berdasarkan ...",
      a: "Urgensi kebutuhan anggota, dampak ekonomi, dan risiko pelaksanaan",
      e: "Prioritas investasi perlu menyeimbangkan manfaat, risiko, dan keberlanjutan.",
      d: [
        "Program yang paling mudah dipromosikan secara eksternal",
        "Keinginan pengurus yang paling berpengaruh",
        "Proposal dengan nilai anggaran terbesar",
        "Usulan yang paling cepat disetujui tanpa kajian"
      ]
    },
    {
      p: "Rasio biaya operasional koperasi meningkat tajam. Langkah manajerial yang tepat adalah ...",
      a: "Review proses kerja untuk efisiensi dan tetapkan pengendalian biaya berbasis KPI",
      e: "Efisiensi biaya yang sehat dilakukan melalui perbaikan proses, bukan pemotongan membabi buta.",
      d: [
        "Memotong seluruh biaya pelatihan dan pengawasan tanpa analisis",
        "Menaikkan iuran anggota untuk menutup pemborosan",
        "Menghentikan layanan yang belum populer",
        "Menghapus target kinerja agar tekanan biaya berkurang"
      ]
    },
    {
      p: "Agar pengurus dan pengawas memiliki arah kerja yang selaras, yang harus diperkuat adalah ...",
      a: "Siklus perencanaan, pelaporan berkala, dan forum evaluasi bersama",
      e: "Penyelarasan lintas fungsi membutuhkan mekanisme komunikasi dan evaluasi yang terstruktur.",
      d: [
        "Pertemuan informal tanpa agenda dan notulen",
        "Pemisahan total fungsi agar tidak saling memengaruhi",
        "Pelaporan hanya saat terjadi masalah besar",
        "Mengurangi keterlibatan pengawas dalam proses evaluasi"
      ]
    },
    {
      p: "Tingkat kepuasan anggota terhadap layanan front office menurun. Tindakan pertama yang paling tepat adalah ...",
      a: "Memetakan titik keluhan utama dan menetapkan standar layanan minimum",
      e: "Perbaikan layanan dimulai dari data keluhan yang terukur dan standar layanan yang jelas."
    },
    {
      p: "Dalam audit eksternal ditemukan dokumen transaksi tidak lengkap. Respons manajemen yang paling tepat adalah ...",
      a: "Menyusun rencana aksi perbaikan dokumen, PIC, dan tenggat waktu terukur",
      e: "Temuan audit harus ditindaklanjuti dengan action plan yang spesifik, terukur, dan dapat diaudit ulang."
    },
    {
      p: "Unit usaha baru koperasi berjalan 6 bulan tetapi margin rendah. Langkah evaluasi paling tepat adalah ...",
      a: "Menganalisis struktur biaya, harga jual, dan produktivitas operasional",
      e: "Margin rendah harus dibedah dari komponen biaya, pricing, dan efisiensi proses."
    },
    {
      p: "Koperasi ingin meningkatkan inklusi anggota perempuan dalam pengambilan keputusan. Kebijakan terbaik adalah ...",
      a: "Menetapkan mekanisme partisipasi setara melalui forum representatif dan indikator keterlibatan",
      e: "Inklusi efektif membutuhkan desain forum, representasi, dan indikator partisipasi yang terpantau."
    },
    {
      p: "Pengurus menerima proposal kerja sama dari mitra swasta. Langkah due diligence yang paling tepat adalah ...",
      a: "Menilai legalitas, rekam jejak, skema manfaat-risiko, dan kesesuaian dengan AD/ART",
      e: "Kemitraan yang sehat menuntut verifikasi legal, finansial, reputasi, dan kesesuaian tata kelola."
    },
    {
      p: "Sistem antrean layanan koperasi sering menumpuk pada jam tertentu. Solusi manajerial paling tepat adalah ...",
      a: "Menerapkan manajemen kapasitas berbasis data jam sibuk dan penjadwalan petugas",
      e: "Antrian ditangani melalui data demand, kapasitas layanan, dan penjadwalan sumber daya."
    },
    {
      p: "Ketika terjadi perubahan regulasi, langkah adaptasi organisasi yang paling tepat adalah ...",
      a: "Melakukan asesmen dampak regulasi lalu revisi SOP dan sosialisasi internal",
      e: "Perubahan regulasi wajib diterjemahkan ke proses kerja melalui asesmen, revisi SOP, dan pelatihan."
    },
    {
      p: "Target penyaluran pinjaman tercapai, tetapi kualitas portofolio memburuk. Indikator kontrol terbaik adalah ...",
      a: "Rasio kolektibilitas, NPL, dan kualitas monitoring pasca-penyaluran",
      e: "Keberhasilan pinjaman tidak cukup dari volume, tetapi juga kualitas portofolio dan pengawasan."
    },
    {
      p: "Koperasi menghadapi isu reputasi akibat informasi tidak akurat di media sosial. Respons terbaik adalah ...",
      a: "Menyusun klarifikasi berbasis data, kanal resmi, dan tindak lanjut perbaikan layanan",
      e: "Krisis reputasi harus dijawab cepat, faktual, dan disertai perbaikan nyata agar kepercayaan pulih."
    },
    {
      p: "Agar implementasi program tepat sasaran lintas unit, mekanisme koordinasi terbaik adalah ...",
      a: "Menetapkan RACI, milestone lintas unit, dan review progres berkala",
      e: "Koordinasi lintas unit efektif jika peran jelas, target waktu konkret, dan review rutin."
    },
    {
      p: "Koperasi ingin memperluas layanan digital ke wilayah dengan literasi rendah. Pendekatan terbaik adalah ...",
      a: "Menyediakan pendampingan hibrida, panduan sederhana, dan kanal bantuan berjenjang",
      e: "Adopsi digital di wilayah literasi rendah perlu desain layanan bertahap dan dukungan pendampingan."
    },
    {
      p: "Pada evaluasi triwulan, banyak program selesai tepat waktu tetapi dampaknya rendah. Fokus perbaikan adalah ...",
      a: "Menyelaraskan KPI output menjadi KPI outcome berbasis manfaat anggota",
      e: "Ketepatan waktu tidak cukup; KPI harus bergeser ke outcome yang dirasakan anggota."
    },
    {
      p: "Untuk mengurangi ketergantungan pada satu sumber pendapatan, strategi paling tepat adalah ...",
      a: "Diversifikasi unit usaha berdasarkan studi kelayakan dan profil risiko",
      e: "Diversifikasi yang sehat harus ditopang kajian kelayakan, kapasitas organisasi, dan mitigasi risiko."
    },
    {
      p: "Dalam pengadaan barang, ditemukan perbedaan harga signifikan antarvendor. Langkah terbaik adalah ...",
      a: "Menerapkan evaluasi vendor berbasis spesifikasi, kualitas, SLA, dan total biaya kepemilikan",
      e: "Keputusan pengadaan harus menilai nilai total, bukan hanya harga terendah."
    },
    {
      p: "Rapat pengurus sering tidak menghasilkan keputusan yang bisa dieksekusi. Perbaikan paling tepat adalah ...",
      a: "Menerapkan format rapat berbasis keputusan: agenda, opsi, PIC, tenggat, dan tindak lanjut",
      e: "Rapat efektif menghasilkan keputusan operasional dengan penanggung jawab dan batas waktu jelas."
    },
    {
      p: "Koperasi ingin meningkatkan loyalitas anggota jangka panjang. Strategi terbaik adalah ...",
      a: "Mengembangkan nilai layanan berbasis kebutuhan anggota dan sistem umpan balik berkelanjutan",
      e: "Loyalitas dibangun dari layanan yang relevan, konsisten, dan terus disempurnakan dari feedback."
    }
  ];

  const distract = [
    "Menunda keputusan sampai masalah selesai sendiri",
    "Fokus pada pencitraan jangka pendek",
    "Membatasi informasi hanya untuk pengurus inti",
    "Mengambil keputusan tanpa data",
    "Menghapus proses evaluasi",
    "Mengandalkan intuisi tanpa standar",
    "Menyalin kebijakan lama tanpa evaluasi konteks",
    "Memilih langkah tercepat tanpa analisis dampak"
  ];

  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = kasus[i % kasus.length];
    const combinedDistractors = [...(item.d || []), ...distract];
    out.push(createQuestion(
      `Pilih keputusan manajerial yang paling tepat.\n${item.p}`,
      item.a,
      combinedDistractors,
      `Kunci: ${item.a}. Langkah pikir: prioritaskan opsi yang berbasis data, terukur, dan dapat dieksekusi. ${item.e}`,
      i % 5
    ));
  }
  return out;
}

function setActiveScreen(screenId) {
  const all = [dom.startScreen, dom.examScreen, dom.resultScreen, dom.tutorScreen, dom.reviewScreen];
  all.forEach((el) => el.classList.remove("active"));
  screenId.classList.add("active");
}

function currentSection() {
  return getActiveBlueprint()[state.currentSegmentIndex];
}

function getRange(sectionId) {
  return state.ranges[sectionId];
}

function renderTopBar() {
  const section = currentSection();
  const answered = state.answers.filter((x) => x !== null).length;
  dom.topParticipant.textContent = `${state.participant.name} (${state.participant.id})`;
  dom.topSection.textContent = section.title;
  dom.topProgress.textContent = `${answered} / ${state.questions.length}`;
  dom.topStatus.textContent = state.finished ? "Selesai" : "Sedang Berjalan";
}

function renderTrapGuide(question) {
  const trapType = inferTrapType(question);
  const trap = TRAP_TIPS_BANK[trapType] || TRAP_TIPS_BANK.umum;
  const guide = getDeepGuideByTrapType(trapType);
  dom.trapGuideBox.innerHTML = `
    <strong>${trap.label}</strong><br>
    <strong>Deteksi cepat:</strong> ${trap.clue}<br>
    <strong>Langkah 3 detik:</strong> 1) ${guide.steps[0]} 2) ${guide.steps[1]} 3) ${guide.steps[2]}<br>
    <strong>Anti jebakan:</strong> ${guide.avoid}
  `;
  dom.trapGuideBox.classList.toggle("active", state.ui.trapGuideOpen);
}

function renderExam() {
  const section = currentSection();
  const range = getRange(section.id);
  state.ui.lastQuestionBySection[section.id] = state.currentQuestionIndex;
  const q = state.questions[state.currentQuestionIndex];
  const isQuestionChanged = state.ui.lastRenderedQuestionIndex !== state.currentQuestionIndex;
  if (isQuestionChanged) {
    dom.questionPanel.classList.remove("transitioning");
    window.requestAnimationFrame(() => {
      dom.questionPanel.classList.add("transitioning");
    });
  }

  dom.totalTimer.textContent = formatTime(state.totalRemaining);
  dom.segmentTimer.textContent = formatTime(state.segmentRemaining);
  dom.segmentTitle.textContent = section.title;
  dom.segmentNavTitle.textContent = `Navigasi ${section.title}`;
  dom.segmentCount.textContent = String(range.count);

  const segmentAnswers = state.answers.slice(range.start, range.end + 1);
  const answeredCount = segmentAnswers.filter((a) => a !== null).length;
  const flaggedCount = [...state.flagged].filter((idx) => idx >= range.start && idx <= range.end).length;

  dom.answeredCount.textContent = String(answeredCount);
  dom.flaggedCount.textContent = String(flaggedCount);
  dom.activeNumber.textContent = String(q.sectionLocalNumber);
  dom.questionMeta.textContent = `${q.sectionTitle} • Nomor ${q.sectionLocalNumber}/${range.count} • Soal ${q.globalNumber}/${state.questions.length}`;
  dom.questionTitle.textContent = `Soal ${q.globalNumber}`;
  dom.questionBody.textContent = q.prompt;
  if (q.visual?.src) {
    dom.questionVisual.innerHTML = `<img src="${q.visual.src}" alt="${q.visual.caption || "Ilustrasi soal"}"><p>${q.visual.caption || "Ilustrasi visual soal."}</p>`;
    dom.questionVisual.classList.add("active");
  } else {
    dom.questionVisual.innerHTML = "";
    dom.questionVisual.classList.remove("active");
  }
  dom.flagBtn.textContent = state.flagged.has(state.currentQuestionIndex) ? "Batalkan Ragu" : "Tandai Ragu";
  dom.questionProgressBar.style.width = `${Math.round((q.globalNumber / state.questions.length) * 100)}%`;
  dom.focusModeBtn.textContent = state.ui.focusMode ? "Matikan Mode Fokus" : "Mode Fokus";

  dom.optionsContainer.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const item = document.createElement("div");
    item.className = "option";
    if (state.answers[state.currentQuestionIndex] === idx) {
      item.classList.add("active");
    }
    item.innerHTML = `<span class="option-index">${ALPHABET[idx]}</span><div>${opt}</div>`;
    item.addEventListener("click", () => {
      chooseCurrentAnswer(idx);
      item.classList.add("pop");
      setTimeout(() => item.classList.remove("pop"), 260);
    });
    dom.optionsContainer.appendChild(item);
  });

  dom.prevBtn.disabled = state.currentQuestionIndex === range.start;
  dom.nextBtn.disabled = state.currentQuestionIndex === range.end;

  // Update Question Progress Bar
  const totalQuestions = state.questions.length;
  const answeredCount = state.answers.filter(a => a !== null).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;
  dom.questionProgressBar.style.width = `${progressPercent}%`;

  renderTopBar();
  renderQuickTips(section.id, q);
  renderInstantStrategy(q);
  renderLearningCoach(q);
  renderLearningDashboard();
  if (state.ui.lastRenderedQuestionIndex !== state.currentQuestionIndex) {
    flashTipsCard();
    state.ui.lastRenderedQuestionIndex = state.currentQuestionIndex;
    state.ui.questionStartTime = Date.now();
    state.ui.smartTipShown = false;
  }
  renderTrapGuide(q);
  renderSegmentPills();
  renderNumberGrid();
}

function renderSegmentPills() {
  dom.segmentPills.innerHTML = "";
  getActiveBlueprint().forEach((section, idx) => {
    const range = getRange(section.id);
    const answers = state.answers.slice(range.start, range.end + 1);
    const answered = answers.filter((x) => x !== null).length;
    const pill = document.createElement("div");
    pill.className = "segment-pill";
    if (idx === state.currentSegmentIndex) {
      pill.classList.add("active");
    }
    pill.innerHTML = `<strong>${section.title}</strong><br>${answered}/${range.count} terjawab • ${section.durationMin} menit`;
    pill.setAttribute("role", "button");
    pill.setAttribute("tabindex", "0");
    pill.title = `Buka ${section.title}`;
    pill.addEventListener("click", () => {
      state.currentSegmentIndex = idx;
      state.currentQuestionIndex = getSavedQuestionIndexForSection(section.id);
      renderExam();
    });
    pill.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        state.currentSegmentIndex = idx;
        state.currentQuestionIndex = getSavedQuestionIndexForSection(section.id);
        renderExam();
      }
    });
    dom.segmentPills.appendChild(pill);
  });
}

function renderNumberGrid() {
  dom.numberGrid.innerHTML = "";
  const section = currentSection();
  const range = getRange(section.id);

  for (let i = range.start; i <= range.end; i += 1) {
    const q = state.questions[i];
    const btn = document.createElement("button");
    btn.className = "num-btn";
    btn.textContent = String(q.sectionLocalNumber);

    if (state.answers[i] !== null) {
      btn.classList.add("answered");
    }
    if (state.flagged.has(i)) {
      btn.classList.add("flagged");
    }
    if (i === state.currentQuestionIndex) {
      btn.classList.add("current");
    }

    btn.addEventListener("click", () => {
      state.currentQuestionIndex = i;
      renderExam();
    });
    dom.numberGrid.appendChild(btn);
  }
}

function moveToNextSection() {
  if (state.currentSegmentIndex >= getActiveBlueprint().length - 1) {
    finishExam("Waktu ujian telah selesai.");
    return;
  }
  state.currentSegmentIndex += 1;
  const section = currentSection();
  const range = getRange(section.id);
  state.currentQuestionIndex = range.start;
  state.segmentRemaining = section.durationMin * 60;
  renderExam();
}

function tick() {
  if (state.finished) {
    return;
  }

  state.totalRemaining -= 1;
  state.segmentRemaining -= 1;

  if (state.totalRemaining <= 0) {
    finishExam("Waktu total habis.");
    return;
  }

  if (state.segmentRemaining <= 0) {
    moveToNextSection();
    return;
  }

  dom.totalTimer.textContent = formatTime(state.totalRemaining);
  dom.segmentTimer.textContent = formatTime(state.segmentRemaining);

  // Smart Tip Check
  if (!state.ui.smartTipShown && !state.ui.remedialActive && dom.examScreen.classList.contains("active")) {
    const elapsed = (Date.now() - state.ui.questionStartTime) / 1000;
    if (elapsed > 30) {
      state.ui.smartTipShown = true;
      showSmartTipToast();
    }
  }
}

function showSmartTipToast() {
  const q = state.questions[state.currentQuestionIndex];
  if (!q) return;
  const guide = TRAP_GUIDE_DB[q.trapType] || TRAP_GUIDE_DB["default"];
  
  // Create a temporary toast for the smart tip
  const toast = document.createElement("div");
  toast.className = "smart-tip-toast";
  toast.innerHTML = `
    <div class="toast-content">
      <strong>💡 Tips Cerdas:</strong> Kamu sudah 30 detik di soal ini. Coba strategi: <em>${guide.avoid}</em>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

function startExam() {
  const name = dom.participantName.value.trim();
  const id = dom.participantId.value.trim();
  // state.examType is already set when selecting category card
  if (!name || !id) {
    alert("Nama dan nomor peserta wajib diisi.");
    return;
  }

  state.settings.shuffleQuestions = dom.shuffleQuestions.checked;
  state.settings.shuffleOptions = dom.shuffleOptions.checked;
  state.ui.focusMode = dom.enableFocusModeInit.checked;

  const built = buildQuestionBank();
  if (!built.questions.length) {
    alert("Bank soal kosong. Silakan import bank soal yang valid.");
    return;
  }
  state.participant = { name, id };
  state.questions = built.questions;
  state.ranges = built.ranges;
  state.answers = Array(state.questions.length).fill(null);
  state.flagged = new Set();
  state.ui.tipOffset = 0;
  state.ui.trapGuideOpen = false;
  // Apply initial focus mode
  document.body.classList.toggle("focus-mode", state.ui.focusMode);
  dom.focusModeBtn.textContent = state.ui.focusMode ? "Matikan Mode Fokus" : "Mode Fokus";
  
  state.ui.lastRenderedQuestionIndex = -1;
  state.ui.lastQuestionBySection = {};
  state.ui.wrongStreak = 0;
  state.ui.correctStreak = 0;
  state.ui.bestCorrectStreak = 0;
  state.ui.remedialActive = false;
  
  dom.showTrapGuideBtn.textContent = "Lihat Panduan Jebakan";
  state.currentSegmentIndex = 0;
  state.finished = false;
  state.result = null;
  resetTutorState();
  const firstSectionId = getActiveBlueprint()[0].id;
  state.currentQuestionIndex = getRange(firstSectionId).start;
  state.totalRemaining = getActiveBlueprint().reduce((sum, s) => sum + s.durationMin * 60, 0);
  state.segmentRemaining = getActiveBlueprint()[0].durationMin * 60;

  if (dom.badge) {
    dom.badge.textContent = `${state.questions.length} Soal • ${Math.floor(state.totalRemaining / 60)} Menit`;
  }

  if (state.timerId) {
    clearInterval(state.timerId);
  }
  state.timerId = setInterval(tick, 1000);

  setActiveScreen(dom.examScreen);
  renderExam();
}

function calculateResults() {
  const sectionStats = getActiveBlueprint().map((section) => {
    const range = getRange(section.id);
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    for (let i = range.start; i <= range.end; i += 1) {
      const ans = state.answers[i];
      if (ans === null) {
        empty += 1;
      } else if (ans === state.questions[i].correctIndex) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }

    const nilai = range.count > 0 ? ((correct / range.count) * 100).toFixed(1) : "0.0";
    return {
      sectionTitle: section.title,
      count: range.count,
      correct,
      wrong,
      empty,
      nilai
    };
  });

  const totalCorrect = sectionStats.reduce((sum, s) => sum + s.correct, 0);
  const totalWrong = sectionStats.reduce((sum, s) => sum + s.wrong, 0);
  const totalEmpty = sectionStats.reduce((sum, s) => sum + s.empty, 0);
  const score100 = ((totalCorrect / state.questions.length) * 100).toFixed(2);

  return {
    sectionStats,
    totalCorrect,
    totalWrong,
    totalEmpty,
    score100
  };
}

function analyzeWeakTraps() {
  const map = {};
  state.questions.forEach((q, idx) => {
    const trapType = inferTrapType(q);
    if (!map[trapType]) {
      map[trapType] = { trapType, label: TRAP_TIPS_BANK[trapType]?.label || trapType, total: 0, mistakes: 0 };
    }
    map[trapType].total += 1;
    const ans = state.answers[idx];
    const isMistake = ans === null || ans !== q.correctIndex;
    if (isMistake) {
      map[trapType].mistakes += 1;
    }
  });
  return Object.values(map)
    .map((x) => ({ ...x, errorRate: x.total ? x.mistakes / x.total : 0 }))
    .sort((a, b) => (b.errorRate - a.errorRate) || (b.mistakes - a.mistakes));
}

function buildTutorQueue() {
  const analysis = analyzeWeakTraps().filter((x) => x.mistakes > 0);
  const focus = analysis.slice(0, 3).map((x) => x.trapType);
  const wrongPool = [];
  const supportPool = [];

  state.questions.forEach((q, idx) => {
    const trapType = inferTrapType(q);
    if (!focus.includes(trapType)) {
      return;
    }
    const ans = state.answers[idx];
    const isWrong = ans === null || ans !== q.correctIndex;
    const item = { ...q, sourceIndex: idx, trapType };
    if (isWrong) {
      wrongPool.push(item);
    } else {
      supportPool.push(item);
    }
  });

  const queue = shuffleArray(wrongPool).slice(0, 10);
  if (queue.length < 10) {
    queue.push(...shuffleArray(supportPool).slice(0, 10 - queue.length));
  }
  return { focusTrapTypes: focus, queue };
}

function resetTutorState() {
  state.tutor = {
    active: false,
    focusTrapTypes: [],
    queue: [],
    cursor: 0,
    answers: [],
    correct: 0
  };
}

function startAdaptiveTutor() {
  const built = buildTutorQueue();
  if (!built.queue.length) {
    alert("Belum ada pola kesalahan yang cukup untuk tutor adaptif.");
    return;
  }
  state.tutor.active = true;
  state.tutor.focusTrapTypes = built.focusTrapTypes;
  state.tutor.queue = built.queue;
  state.tutor.cursor = 0;
  state.tutor.answers = Array(built.queue.length).fill(null);
  state.tutor.correct = 0;

  const labels = built.focusTrapTypes.map((t) => TRAP_TIPS_BANK[t]?.label || t);
  dom.tutorFocusInfo.textContent = `Fokus latihan: ${labels.join(", ")}.`;
  setActiveScreen(dom.tutorScreen);
  renderTutorQuestion();
}

function renderTutorQuestion() {
  const idx = state.tutor.cursor;
  const q = state.tutor.queue[idx];
  const guide = getDeepGuideByTrapType(q.trapType);
  const trap = TRAP_TIPS_BANK[q.trapType] || TRAP_TIPS_BANK.umum;

  dom.tutorMeta.textContent = `Latihan ${idx + 1}/${state.tutor.queue.length} • ${trap.label}`;
  dom.tutorQuestionTitle.textContent = `Soal Adaptif ${idx + 1}`;
  dom.tutorQuestionBody.textContent = q.prompt;
  dom.tutorOptions.innerHTML = "";
  dom.tutorFeedback.classList.remove("active");
  dom.tutorFeedback.innerHTML = "";
  dom.tutorNextBtn.disabled = true;

  q.options.forEach((opt, optIdx) => {
    const el = document.createElement("div");
    el.className = "option";
    el.innerHTML = `<span class="option-index">${ALPHABET[optIdx]}</span><div>${opt}</div>`;
    el.addEventListener("click", () => {
      if (state.tutor.answers[idx] !== null) {
        return;
      }
      state.tutor.answers[idx] = optIdx;
      const correct = optIdx === q.correctIndex;
      if (correct) {
        state.tutor.correct += 1;
      }

      [...dom.tutorOptions.children].forEach((child, cIdx) => {
        child.classList.remove("active");
        if (cIdx === q.correctIndex) {
          child.classList.add("active");
        }
      });

      dom.tutorFeedback.classList.add("active");
      dom.tutorFeedback.innerHTML = `
        <strong>${correct ? "Benar" : "Perlu Perbaikan"}.</strong> ${q.explanation}<br>
        <strong>Pola:</strong> ${guide.pattern}<br>
        <strong>Langkah Cepat:</strong> 1) ${guide.steps[0]} 2) ${guide.steps[1]} 3) ${guide.steps[2]}
      `;
      dom.tutorNextBtn.disabled = false;
    });
    dom.tutorOptions.appendChild(el);
  });
}

function nextTutorQuestion() {
  if (state.tutor.answers[state.tutor.cursor] === null) {
    return;
  }
  if (state.tutor.cursor >= state.tutor.queue.length - 1) {
    finishAdaptiveTutor();
    return;
  }
  state.tutor.cursor += 1;
  renderTutorQuestion();
}

function finishAdaptiveTutor() {
  const total = state.tutor.queue.length;
  const correct = state.tutor.correct;
  const acc = total ? Math.round((correct / total) * 100) : 0;
  state.tutor.active = false;
  alert(`Tutor adaptif selesai. Akurasi latihan: ${correct}/${total} (${acc}%).`);
  setActiveScreen(dom.resultScreen);
}

function finishExam(message) {
  if (state.finished) {
    return;
  }
  state.finished = true;
  if (state.timerId) {
    clearInterval(state.timerId);
  }

  state.result = calculateResults();
  renderResult(message);
  setActiveScreen(dom.resultScreen);
}

function renderSmartAnalytics() {
  const r = state.result;
  const score = Number(r.score100);
  
  // Passing Prediction
  let prediction = "Rendah";
  let color = "var(--danger)";
  if (score >= 80) {
    prediction = "Sangat Tinggi";
    color = "var(--ok)";
  } else if (score >= 65) {
    prediction = "Tinggi";
    color = "#2d6fe4";
  } else if (score >= 50) {
    prediction = "Sedang";
    color = "var(--warn)";
  }
  dom.passingPrediction.textContent = prediction;
  dom.passingPrediction.style.color = color;

  // Average Speed
  const totalDurationUsed = (getActiveBlueprint().reduce((sum, s) => sum + s.durationMin * 60, 0)) - state.totalRemaining;
  const answeredCount = state.answers.filter(a => a !== null).length;
  const speed = answeredCount > 0 ? (totalDurationUsed / answeredCount).toFixed(1) : 0;
  dom.avgSpeed.textContent = `${speed} detik/soal`;

  // Render Chart
  dom.performanceChart.innerHTML = "";
  r.sectionStats.forEach(s => {
    const wrapper = document.createElement("div");
    wrapper.className = "chart-bar-wrapper";
    
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = "0%"; // Start from 0 for animation
    bar.setAttribute("data-value", s.nilai);
    
    const label = document.createElement("div");
    label.className = "chart-label";
    label.textContent = s.sectionTitle;
    label.title = s.sectionTitle;
    
    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    dom.performanceChart.appendChild(wrapper);
    
    // Trigger animation
    setTimeout(() => {
      bar.style.height = `${s.nilai}%`;
    }, 100);
  });

  // Recommendations
  const weakTraps = getLiveTrapStats(3);
  dom.recommendationList.innerHTML = "";
  
  // AI Feedback Logic
  const stressLi = document.createElement("li");
  const usedRatio = totalDurationUsed / (getActiveBlueprint().reduce((sum, s) => sum + s.durationMin * 60, 0));
  if (usedRatio > 0.9) {
    stressLi.innerHTML = "<strong>🤖 AI Analis:</strong> Kamu sangat tertekan oleh waktu. Jangan terlalu perfeksionis di subtes awal.";
  } else if (score < 50) {
    stressLi.innerHTML = "<strong>🤖 AI Analis:</strong> Fokus pada pemahaman konsep dasar sebelum mencoba simulasi waktu penuh.";
  } else {
    stressLi.innerHTML = "<strong>🤖 AI Analis:</strong> Performa stabil. Pertahankan ritme ini untuk ujian sebenarnya.";
  }
  dom.recommendationList.appendChild(stressLi);

  if (weakTraps.length > 0) {
    weakTraps.forEach(trap => {
      const li = document.createElement("li");
      li.textContent = `Perkuat pemahaman pada pola "${trap.label}" (Akurasi: ${trap.accuracy}%)`;
      dom.recommendationList.appendChild(li);
    });
  }
}

function showCertificate() {
  const r = state.result;
  dom.certName.textContent = state.participant.name.toUpperCase();
  dom.certExamType.textContent = getExamTypeLabel(state.examType).toUpperCase();
  dom.certScore.textContent = r.score100;
  dom.certDate.textContent = new Date().toLocaleDateString("id-ID", { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });
  dom.certificateModal.classList.add("active");
}

function renderResult(message) {
  const r = state.result;
  addTopScoreEntry(r);
  dom.finalScore.textContent = r.score100;
  dom.finalSummary.textContent = `Benar ${r.totalCorrect} | Salah ${r.totalWrong} | Kosong ${r.totalEmpty}`;
  dom.resultName.textContent = `Nama: ${state.participant.name}`;
  dom.resultId.textContent = `Nomor Peserta: ${state.participant.id}`;
  dom.resultDate.textContent = `Waktu Selesai: ${new Date().toLocaleString("id-ID")}`;

  dom.sectionResultBody.innerHTML = "";
  r.sectionStats.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.sectionTitle}</td>
      <td>${s.count}</td>
      <td>${s.correct}</td>
      <td>${s.wrong}</td>
      <td>${s.empty}</td>
      <td>${s.nilai}</td>
    `;
    dom.sectionResultBody.appendChild(tr);
  });
  
  // Performance Comparison Logic
  const topScores = loadTopScores();
  const currentScore = Number(r.score100);
  dom.yourScoreVal.textContent = currentScore;
  
  if (topScores.length > 0) {
    const top10 = topScores.slice(0, 10);
    const avg = top10.reduce((sum, x) => sum + x.score100, 0) / top10.length;
    dom.avgTopScoreVal.textContent = avg.toFixed(1);
    
    if (currentScore > avg) {
      dom.comparisonNote.textContent = "Luar biasa! Skor Anda di atas rata-rata peserta terbaik.";
      dom.comparisonNote.style.color = "var(--ok)";
    } else {
      dom.comparisonNote.textContent = "Skor Anda sedikit di bawah rata-rata top score. Teruslah berlatih!";
      dom.comparisonNote.style.color = "var(--warn)";
    }
  } else {
    dom.avgTopScoreVal.textContent = "-";
    dom.comparisonNote.textContent = "Anda adalah peserta pertama yang mencatat skor!";
  }

  renderSmartAnalytics();
  renderTopScores();

  if (message) {
    alert(message);
  }
}

function renderReview() {
  dom.reviewList.innerHTML = "";
  state.questions.forEach((q, idx) => {
    const answer = state.answers[idx];
    const correct = q.correctIndex;
    const userAnswer = answer === null ? "-" : `${ALPHABET[answer]}. ${q.options[answer]}`;
    const correctAnswer = `${ALPHABET[correct]}. ${q.options[correct]}`;
    const statusClass = answer === null ? "empty" : answer === correct ? "correct" : "wrong";
    const statusLabel = answer === null ? "Tidak dijawab" : answer === correct ? "Benar" : "Salah";
    const trapType = inferTrapType(q);
    const trap = getTrapTipPack(q);
    const shortcut = inferQuestionShortcut(q);
    const guide = getDeepGuideByTrapType(trapType);

    const item = document.createElement("div");
    item.className = `review-item ${statusClass}`;
    item.innerHTML = `
      <h4>${q.sectionTitle} • Soal ${q.globalNumber} (${statusLabel})</h4>
      <p>${q.prompt}</p>
      <p><strong>Jawaban Anda:</strong> ${userAnswer}</p>
      <p><strong>Kunci:</strong> ${correctAnswer}</p>
      <div class="explain"><strong>Pembahasan:</strong> ${q.explanation}</div>
      <div class="shortcut">
        <strong>${trap.label}:</strong> ${trap.clue}<br>
        <strong>Cara Pintas:</strong> ${shortcut}<br>
        <strong>Pola Soal Sejenis:</strong> ${guide.pattern}<br>
        <strong>Langkah 3 Detik:</strong> 1) ${guide.steps[0]} 2) ${guide.steps[1]} 3) ${guide.steps[2]}<br>
        <strong>Catatan Anti Jebakan:</strong> ${guide.avoid}
      </div>
    `;
    dom.reviewList.appendChild(item);
  });
}

dom.startBtn.addEventListener("click", startExam);

dom.examCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const type = card.getAttribute("data-type");
    console.log("Exam card clicked:", type);
    
    state.examType = type;
    state.customBank = null;
    updateBankInfoText();
    renderExamDetails();
    
    dom.selectedExamTitle.textContent = getExamTypeLabel(type);
    dom.examCategoryGrid.classList.add("hidden");
    dom.registrationForm.classList.remove("hidden");
    
    // Scroll with small delay to ensure visibility
    setTimeout(() => {
      dom.registrationForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  });
});

// Also bind the inner buttons if they exist
document.querySelectorAll(".select-exam-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const type = btn.getAttribute("data-type");
    console.log("Select exam button clicked:", type);
    // Find parent card and trigger its click
    const card = btn.closest(".exam-card");
    if (card) card.click();
  });
});

dom.backToCategories.addEventListener("click", () => {
  dom.registrationForm.classList.add("hidden");
  dom.examCategoryGrid.classList.remove("hidden");
});

// Remove old examType change listener if it exists
if (dom.examType) {
  dom.examType.addEventListener("change", () => {
    state.customBank = null;
    updateBankInfoText();
    state.examType = dom.examType.value || "kdkmp";
    renderExamDetails();
  });
}

dom.importBankBtn.addEventListener("click", () => {
  dom.bankFileInput.click();
});

dom.bankFileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state.customBank = parseCustomBank(parsed);
    updateBankInfoText();
    if (dom.badge) {
      dom.badge.textContent = `${state.customBank.blueprint.reduce((sum, x) => sum + x.count, 0)} Soal • Custom`;
    }
    alert("Import bank soal berhasil.");
  } catch (error) {
    alert(`Import gagal: ${error.message}`);
  } finally {
    dom.bankFileInput.value = "";
  }
});

dom.clearLeaderboardBtn.addEventListener("click", () => {
  const ok = confirm("Reset semua top score lokal pada perangkat ini?");
  if (!ok) {
    return;
  }
  saveTopScores([]);
  renderTopScores();
});

dom.prevBtn.addEventListener("click", () => {
  const section = currentSection();
  const range = getRange(section.id);
  if (state.currentQuestionIndex > range.start) {
    state.currentQuestionIndex -= 1;
    renderExam();
  }
});

dom.nextBtn.addEventListener("click", () => {
  const section = currentSection();
  const range = getRange(section.id);
  if (state.currentQuestionIndex < range.end) {
    state.currentQuestionIndex += 1;
    renderExam();
  }
});

dom.finishBtn.addEventListener("click", () => {
  const ok = confirm("Apakah Anda yakin ingin menyelesaikan ujian sekarang?");
  if (ok) {
    finishExam("Ujian diselesaikan oleh peserta.");
  }
});

dom.fullscreenBtn.addEventListener("click", async () => {
  try {
    await toggleFullscreen();
  } catch (_error) {
    alert("Browser menolak mode layar penuh.");
  }
});

document.addEventListener("fullscreenchange", () => {
  dom.fullscreenBtn.textContent = document.fullscreenElement ? "Keluar Fullscreen" : "Layar Penuh";
});

dom.flagBtn.addEventListener("click", () => {
  if (state.flagged.has(state.currentQuestionIndex)) {
    state.flagged.delete(state.currentQuestionIndex);
  } else {
    state.flagged.add(state.currentQuestionIndex);
  }
  renderExam();
});

dom.prevTipBtn.addEventListener("click", () => {
  const q = state.questions[state.currentQuestionIndex];
  if (!q) {
    return;
  }
  const section = currentSection();
  const tipPoolLength = (SECTION_SHORTCUTS[section.id] || []).length + (getTrapTipPack(q).shortcuts || []).length;
  const max = Math.max(tipPoolLength, 1);
  state.ui.tipOffset = (state.ui.tipOffset - 1 + max) % max;
  renderQuickTips(section.id, q);
});

dom.nextTipPanelBtn.addEventListener("click", () => {
  const q = state.questions[state.currentQuestionIndex];
  if (!q) {
    return;
  }
  const section = currentSection();
  const tipPoolLength = (SECTION_SHORTCUTS[section.id] || []).length + (getTrapTipPack(q).shortcuts || []).length;
  const max = Math.max(tipPoolLength, 1);
  state.ui.tipOffset = (state.ui.tipOffset + 1) % max;
  renderQuickTips(section.id, q);
});

dom.showTrapGuideBtn.addEventListener("click", () => {
  state.ui.trapGuideOpen = !state.ui.trapGuideOpen;
  const q = state.questions[state.currentQuestionIndex];
  if (q) {
    renderTrapGuide(q);
  }
  dom.showTrapGuideBtn.textContent = state.ui.trapGuideOpen ? "Sembunyikan Panduan" : "Lihat Panduan Jebakan";
});

dom.focusModeBtn.addEventListener("click", () => {
  state.ui.focusMode = !state.ui.focusMode;
  document.body.classList.toggle("focus-mode", state.ui.focusMode);
  dom.focusModeBtn.textContent = state.ui.focusMode ? "Matikan Mode Fokus" : "Mode Fokus";
});

dom.openStrategyBtn.addEventListener("click", () => {
  dom.strategyModal.classList.add("active");
});

dom.themeToggleBtn.addEventListener("click", () => {
  state.ui.darkTheme = !state.ui.darkTheme;
  console.log("Theme toggle clicked, isDark:", state.ui.darkTheme);
  applyTheme();
});

dom.corporateThemeBtn.addEventListener("click", () => {
  state.ui.corporateTheme = !state.ui.corporateTheme;
  applyTheme();
});

dom.soundToggleBtn.addEventListener("click", () => {
  state.ui.soundOn = !state.ui.soundOn;
  applySoundLabel();
});

dom.closeStrategyBtn.addEventListener("click", () => {
  dom.strategyModal.classList.remove("active");
});

dom.strategyModal.addEventListener("click", (event) => {
  if (event.target === dom.strategyModal) {
    dom.strategyModal.classList.remove("active");
  }
});

dom.closeRemedialBtn.addEventListener("click", () => {
  closeRemedialModal();
});

dom.skipRemedialBtn.addEventListener("click", () => {
  closeRemedialModal();
});

dom.remedialModal.addEventListener("click", (event) => {
  if (event.target === dom.remedialModal) {
    closeRemedialModal();
  }
});

dom.showReviewBtn.addEventListener("click", () => {
  renderReview();
  setActiveScreen(dom.reviewScreen);
});

dom.startTutorBtn.addEventListener("click", () => {
  startAdaptiveTutor();
});

dom.tutorNextBtn.addEventListener("click", () => {
  nextTutorQuestion();
});

dom.tutorFinishBtn.addEventListener("click", () => {
  finishAdaptiveTutor();
});

dom.generateCertificateBtn.addEventListener("click", () => {
  showCertificate();
});

dom.closeCertificateBtn.addEventListener("click", () => {
  dom.certificateModal.classList.remove("active");
});

dom.downloadCertBtn.addEventListener("click", () => {
  window.print();
});

dom.ttsBtn.addEventListener("click", () => {
  speakQuestion();
});

dom.ambientMusicBtn.addEventListener("click", () => {
  toggleAmbientMusic();
});

dom.shareResultsBtn.addEventListener("click", () => {
  const score = state.result.score100;
  const exam = getExamTypeLabel(state.examType);
  const text = `Saya baru saja menyelesaikan ${exam} di Simulasi Ujian Nusantara dengan skor ${score}! Coba juga di: ${window.location.href}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Hasil Simulasi Ujian',
      text: text,
      url: window.location.href,
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(text);
    alert("Teks hasil telah disalin ke clipboard!");
  }
});

dom.backToResultBtn.addEventListener("click", () => {
  setActiveScreen(dom.resultScreen);
});

dom.backTutorToResultBtn.addEventListener("click", () => {
  setActiveScreen(dom.resultScreen);
});

dom.restartBtn.addEventListener("click", () => {
  window.location.reload();
});

document.addEventListener("keydown", (event) => {
  if (!dom.examScreen.classList.contains("active")) {
    return;
  }
  const tag = document.activeElement?.tagName || "";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return;
  }

  const key = event.key.toLowerCase();
  if (key >= "a" && key <= "e") {
    const answerIndex = ALPHABET.indexOf(key.toUpperCase());
    if (answerIndex !== -1) {
      chooseCurrentAnswer(answerIndex);
      event.preventDefault();
    }
    return;
  }

  const section = currentSection();
  const range = getRange(section.id);

  if (event.key === "ArrowRight" && state.currentQuestionIndex < range.end) {
    state.currentQuestionIndex += 1;
    renderExam();
    event.preventDefault();
    return;
  }
  if (event.key === "ArrowLeft" && state.currentQuestionIndex > range.start) {
    state.currentQuestionIndex -= 1;
    renderExam();
    event.preventDefault();
    return;
  }
  if (key === "f") {
    if (state.flagged.has(state.currentQuestionIndex)) {
      state.flagged.delete(state.currentQuestionIndex);
    } else {
      state.flagged.add(state.currentQuestionIndex);
    }
    renderExam();
    event.preventDefault();
    return;
  }
  if (event.key === " ") {
    event.preventDefault();
    speakQuestion();
    return;
  }
  if (event.key === "Escape") {
    dom.strategyModal.classList.remove("active");
    dom.certificateModal.classList.remove("active");
    dom.keyboardGuideModal.classList.remove("active");
    return;
  }
});

dom.closeKeyboardGuideBtn.addEventListener("click", () => {
  dom.keyboardGuideModal.classList.remove("active");
});

dom.openKeyboardGuideBtn.addEventListener("click", () => {
  dom.keyboardGuideModal.classList.add("active");
});

updateBankInfoText();
if (dom.examType) {
  dom.examType.value = state.examType;
}
renderExamDetails();
renderTopScores();
applyTheme();
applySoundLabel();
