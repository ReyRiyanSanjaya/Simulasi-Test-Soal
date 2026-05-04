const TEST_BLUEPRINT = [
  { id: "bahasa", title: "TPK Sub 1 - Bahasa", count: 50, durationMin: 7 },
  { id: "hitungan", title: "TPK Sub 2 - Hitungan", count: 31, durationMin: 7 },
  { id: "umum", title: "TPK Sub 3 - Pengetahuan Umum", count: 40, durationMin: 7 },
  { id: "pola", title: "TPK Sub 4 - Pola Gambar", count: 55, durationMin: 7 },
  { id: "ruang", title: "TPK Sub 5 - Abstraksi Ruang", count: 27, durationMin: 7 },
  { id: "bentuk", title: "TPK Sub 6 - Bentuk", count: 25, durationMin: 7 },
  { id: "kdkmp", title: "Tes Manajemen Bidang KDKMP/KNMP", count: 20, durationMin: 20 }
];

const ALPHABET = ["A", "B", "C", "D", "E"];

const state = {
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
    wrongStreak: 0,
    correctStreak: 0,
    bestCorrectStreak: 0,
    remedialActive: false
  },
  tutor: {
    active: false,
    focusTrapTypes: [],
    queue: [],
    cursor: 0,
    answers: [],
    correct: 0
  }
};

const dom = {
  startScreen: document.getElementById("startScreen"),
  examScreen: document.getElementById("examScreen"),
  resultScreen: document.getElementById("resultScreen"),
  tutorScreen: document.getElementById("tutorScreen"),
  reviewScreen: document.getElementById("reviewScreen"),
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
  liveTrapList: document.getElementById("liveTrapList")
};

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

function applyTheme() {
  document.body.classList.toggle("dark-theme", state.ui.darkTheme);
  document.body.classList.toggle("corporate-theme", state.ui.corporateTheme);
  dom.themeToggleBtn.textContent = state.ui.darkTheme ? "Tema Terang" : "Tema Gelap";
  dom.corporateThemeBtn.textContent = state.ui.corporateTheme ? "Corporate: ON" : "Corporate: OFF";
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

function createQuestion(prompt, correctAnswer, distractors, explanation, targetIndex) {
  const options = placeCorrectOption(correctAnswer, distractors, targetIndex);
  return {
    prompt,
    options,
    correctIndex: options.indexOf(correctAnswer),
    explanation,
    shortcut: ""
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
  if (question.sectionId === "hitungan") {
    if (text.includes("%") || text.includes("persen")) {
      return "persen";
    }
    if (text.includes("rasio")) {
      return "rasio";
    }
  }
  if (question.sectionId === "bahasa") {
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
  if (question.sectionId === "kdkmp") {
    return "manajerial";
  }
  if (question.sectionId === "umum") {
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
  dom.quickTipsCard.classList.remove("flash");
  window.requestAnimationFrame(() => {
    dom.quickTipsCard.classList.add("flash");
  });
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

function getActiveBlueprint() {
  if (state.customBank && Array.isArray(state.customBank.blueprint) && state.customBank.blueprint.length > 0) {
    return state.customBank.blueprint;
  }
  return TEST_BLUEPRINT;
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

function buildQuestionBank() {
  const blueprint = getActiveBlueprint();
  const bySection = state.customBank?.sections || {
    bahasa: generateBahasa(TEST_BLUEPRINT[0].count),
    hitungan: generateHitungan(TEST_BLUEPRINT[1].count),
    umum: generatePengetahuanUmum(TEST_BLUEPRINT[2].count),
    pola: generatePola(TEST_BLUEPRINT[3].count),
    ruang: generateAbstraksiRuang(TEST_BLUEPRINT[4].count),
    bentuk: generateBentuk(TEST_BLUEPRINT[5].count),
    kdkmp: generateKDKMP(TEST_BLUEPRINT[6].count)
  };

  const questions = [];
  const ranges = {};
  let globalIndex = 0;

  blueprint.forEach((section) => {
    let pool = bySection[section.id] || [];
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
  const distractWord = [
    "sementara",
    "bertahap",
    "biasa",
    "regional",
    "manual",
    "terbuka",
    "seragam",
    "parsial"
  ];

  const out = [];
  for (let i = 0; i < count; i += 1) {
    const mode = i % 4;
    if (mode === 0) {
      const [kata, benar] = sinonim[i % sinonim.length];
      out.push(createQuestion(
        `Pilih sinonim paling tepat dari kata "${kata}" dalam konteks administrasi publik.`,
        benar,
        distractWord.concat(sinonim.map((x) => x[1])),
        `Kata "${kata}" paling tepat diganti dengan "${benar}" karena maknanya setara dalam konteks formal.`,
        i % 5
      ));
    } else if (mode === 1) {
      const [kata, benar] = antonim[i % antonim.length];
      out.push(createQuestion(
        `Pilih antonim paling tepat dari kata "${kata}".`,
        benar,
        distractWord.concat(antonim.map((x) => x[1])),
        `Lawan kata "${kata}" adalah "${benar}" karena menunjukkan makna yang berlawanan langsung.`,
        i % 5
      ));
    } else if (mode === 2) {
      const [soalKalimat, benar, pembahasan] = kalimatEfektif[i % kalimatEfektif.length];
      out.push(createQuestion(
        `Manakah perbaikan kalimat efektif yang paling tepat dari kalimat berikut?\n"${soalKalimat}"`,
        benar,
        [
          `${benar} untuk peningkatan`,
          soalKalimat,
          "Kalimat tidak perlu diubah",
          "Pengurus koperasi dipercepat agar layanan"
        ],
        pembahasan,
        i % 5
      ));
    } else {
      const [a, b, c, benar] = analogi[i % analogi.length];
      out.push(createQuestion(
        `${a} : ${b} = ${c} : ...`,
        benar,
        ["pengawasan", "pelaporan", "penjadwalan", "standarisasi", "delegasi"],
        `Hubungan ${a}-${b} adalah relasi proses dan hasil; relasi ${c} yang setara adalah ${benar}.`,
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
    const mode = i % 5;
    if (mode === 0) {
      const anggota = 80 + (i % 7) * 10;
      const aktif = Math.round(anggota * (0.65 + (i % 3) * 0.05));
      const benar = String(Math.round((aktif / anggota) * 100));
      out.push(createQuestion(
        `Di Koperasi Desa ${desa[i % desa.length]}, dari ${anggota} anggota terdapat ${aktif} anggota aktif. Persentase anggota aktif adalah ...`,
        `${benar}%`,
        [`${Number(benar) - 5}%`, `${Number(benar) + 5}%`, `${Number(benar) - 10}%`, `${Number(benar) + 10}%`],
        `Persentase anggota aktif = ${aktif}/${anggota} x 100% = ${benar}%.`,
        i % 5
      ));
    } else if (mode === 1) {
      const target = 120 + (i % 6) * 20;
      const hari = 4 + (i % 4);
      const benar = String(Math.ceil(target / hari));
      out.push(createQuestion(
        `Tim pendamping harus mengunjungi ${target} UMKM dalam ${hari} hari kerja. Minimal kunjungan per hari agar target tercapai adalah ...`,
        `${benar} UMKM`,
        [`${Number(benar) - 2} UMKM`, `${Number(benar) - 1} UMKM`, `${Number(benar) + 1} UMKM`, `${Number(benar) + 2} UMKM`],
        `Kunjungan minimal per hari = ceil(${target}/${hari}) = ${benar}.`,
        i % 5
      ));
    } else if (mode === 2) {
      const modal = 25 + (i % 5) * 5;
      const kenaikan = 10 + (i % 4) * 5;
      const benar = String(Math.round((modal * kenaikan) / 100));
      out.push(createQuestion(
        `Simpan pinjam naik sebesar ${kenaikan}% dari modal awal ${modal} juta rupiah. Kenaikan nominalnya adalah ...`,
        `${benar} juta`,
        [`${Number(benar) - 2} juta`, `${Number(benar) + 2} juta`, `${Number(benar) + 3} juta`, `${Number(benar) - 1} juta`],
        `Kenaikan nominal = ${kenaikan}% x ${modal} = ${benar} juta rupiah.`,
        i % 5
      ));
    } else if (mode === 3) {
      const produksi1 = 18 + (i % 5) * 2;
      const produksi2 = 24 + (i % 4) * 2;
      const benar = `${produksi1}:${produksi2}`;
      out.push(createQuestion(
        `Kelompok A menghasilkan ${produksi1} paket sembako dan Kelompok B menghasilkan ${produksi2} paket. Rasio A : B adalah ...`,
        benar,
        [`${produksi2}:${produksi1}`, `${produksi1 + produksi2}:${produksi2}`, `${produksi1}:${produksi1 + produksi2}`, `${produksi2}:${produksi1 + produksi2}`],
        `Rasio langsung sesuai data adalah ${produksi1}:${produksi2}.`,
        i % 5
      ));
    } else {
      const a = 3 + (i % 6);
      const b = 4 + (i % 7);
      const c = a * b + 6;
      const benar = String((c - 6) / a);
      out.push(createQuestion(
        `Tentukan nilai x: ${a}x + 6 = ${c}.`,
        benar,
        [String(Number(benar) - 1), String(Number(benar) + 1), String(Number(benar) + 2), String(Number(benar) - 2)],
        `Pindahkan 6 ke ruas kanan: ${a}x = ${c - 6}, maka x = ${(c - 6) / a}.`,
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
    ["Pemilu nasional di Indonesia dilaksanakan setiap ...", "5 tahun", "Siklus pemilu nasional dilaksanakan 5 tahunan."]
  ];

  const distract = ["Perppu", "KPK", "MPR", "Mahkamah Agung", "DPRD", "RPJPD", "4 tahun", "Dolar", "Tertutup", "Individualisme"];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    out.push(createQuestion(item[0], item[1], distract.concat(bank.map((b) => b[1])), item[2], i % 5));
  }
  return out;
}

function generatePola(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const mode = i % 3;
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
        prompt: `Pola angka: ${seq.join(", ")}, ... Angka berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: `Pola bertambah ${diff} setiap langkah, jadi angka berikutnya ${benar}.`
      });
    } else if (mode === 1) {
      const a = 2 + (i % 3);
      const seq = [a, a * 2, a * 4, a * 8];
      const benar = String(a * 16);
      const options = placeCorrectOption(
        benar,
        [String(a * 12), String(a * 14), String(a * 18), String(a * 20)],
        i % 5
      );
      out.push({
        prompt: `Pola angka: ${seq.join(", ")}, ... Angka berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: `Pola dikali 2, sehingga suku berikutnya ${benar}.`
      });
    } else {
      const seq = ["A", "C", "F", "J", "O"];
      const benar = "U";
      const options = placeCorrectOption(benar, ["T", "V", "S", "R", "Q"], i % 5);
      out.push({
        prompt: `Pola huruf: ${seq.join(", ")}, ... Huruf berikutnya adalah ...`,
        options,
        correctIndex: options.indexOf(benar),
        explanation: "Lompatan alfabet berturut-turut +2, +3, +4, +5, sehingga berikutnya +6 yaitu U."
      });
    }
  }
  return out;
}

function generateAbstraksiRuang(count) {
  const bank = [
    [
      "Sebuah kubus diputar 90 derajat searah jarum jam pada sumbu vertikal. Sisi depan menjadi ...",
      "Sisi kanan",
      "Pada rotasi 90 derajat vertikal, sisi kanan berpindah ke depan."
    ],
    [
      "Jika peta diperkecil dengan skala lebih besar (misal dari 1:50.000 ke 1:100.000), maka objek pada peta terlihat ...",
      "Lebih kecil",
      "Semakin besar penyebut skala, objek tergambar semakin kecil."
    ],
    [
      "Bangun 3D dengan 2 alas lingkaran dan 1 sisi lengkung adalah ...",
      "Tabung",
      "Tabung memiliki dua alas lingkaran sejajar dan selimut lengkung."
    ],
    [
      "Bila balok memiliki panjang 8, lebar 4, tinggi 3, maka volumenya ...",
      "96",
      "Volume balok = p x l x t = 8 x 4 x 3 = 96."
    ],
    [
      "Jaring-jaring yang dapat membentuk kubus harus terdiri dari ...",
      "6 persegi",
      "Kubus memiliki enam sisi persegi kongruen."
    ],
    [
      "Jika arah utara berada di atas peta, maka arah timur berada di ...",
      "Kanan",
      "Orientasi peta standar menempatkan timur di sebelah kanan."
    ],
    [
      "Bangun ruang yang semua rusuknya sama panjang dan semua sisinya persegi adalah ...",
      "Kubus",
      "Definisi kubus: semua rusuk sama, sisi berbentuk persegi."
    ],
    [
      "Jika sebuah objek dicerminkan pada sumbu vertikal, maka sisi kiri akan berpindah ke ...",
      "Sisi kanan",
      "Pencerminan vertikal menukar posisi kiri dan kanan."
    ]
  ];

  const distract = ["Prisma", "Kerucut", "Sisi kiri", "Lebih besar", "Atas", "Bawah", "5 persegi", "64", "Depan"];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    const options = placeCorrectOption(item[1], distract, i % 5);
    out.push({
      prompt: item[0],
      options,
      correctIndex: options.indexOf(item[1]),
      explanation: item[2]
    });
  }
  return out;
}

function generateBentuk(count) {
  const bank = [
    [
      "Bangun datar yang memiliki 4 sisi sama panjang dan 4 sudut siku-siku adalah ...",
      "Persegi",
      "Persegi memiliki empat sisi sama panjang dan sudut 90 derajat."
    ],
    [
      "Bangun datar dengan tepat satu pasang sisi sejajar adalah ...",
      "Trapesium",
      "Trapesium memiliki satu pasang sisi sejajar."
    ],
    [
      "Segitiga dengan tiga sisi sama panjang disebut ...",
      "Segitiga sama sisi",
      "Semua sisinya sama panjang."
    ],
    [
      "Lingkaran memiliki jumlah sudut ...",
      "0",
      "Lingkaran tidak memiliki sudut."
    ],
    [
      "Bangun yang semua titik pada sisinya berjarak sama dari pusat adalah ...",
      "Lingkaran",
      "Itu adalah definisi lingkaran."
    ],
    [
      "Persegi panjang mempunyai ... pasang sisi sejajar",
      "2",
      "Persegi panjang memiliki dua pasang sisi sejajar."
    ],
    [
      "Sudut lebih dari 90 derajat dan kurang dari 180 derajat disebut ...",
      "Sudut tumpul",
      "Rentang tersebut adalah sudut tumpul."
    ]
  ];

  const distract = ["Segitiga", "Jajar genjang", "1", "3", "Sudut lancip", "Sudut lurus", "Belah ketupat", "Persegi panjang"];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = bank[i % bank.length];
    const options = placeCorrectOption(item[1], distract, i % 5);
    out.push({
      prompt: item[0],
      options,
      correctIndex: options.indexOf(item[1]),
      explanation: item[2]
    });
  }
  return out;
}

function generateKDKMP(count) {
  const kasus = [
    {
      p: "Koperasi desa mencatat penurunan partisipasi rapat anggota selama 3 periode. Tindakan manajerial paling tepat adalah ...",
      a: "Menganalisis akar masalah dan menyesuaikan pola layanan rapat berbasis kebutuhan anggota",
      e: "Penurunan partisipasi perlu ditangani melalui diagnosis masalah dan redesign layanan, bukan sekadar instruksi."
    },
    {
      p: "Unit usaha simpan pinjam mengalami NPL meningkat. Prioritas kebijakan pengurus adalah ...",
      a: "Memperketat analisis kelayakan, monitoring angsuran, dan edukasi peminjam",
      e: "Pengendalian kredit bermasalah membutuhkan kombinasi analisis risiko, kontrol, dan pendampingan anggota."
    },
    {
      p: "Saat menyusun RKAT, data kebutuhan anggota tidak lengkap. Langkah awal terbaik adalah ...",
      a: "Melakukan pemetaan kebutuhan anggota melalui survei dan forum kelompok",
      e: "Perencanaan yang baik harus berbasis evidence agar program tepat sasaran."
    },
    {
      p: "Pengurus ingin digitalisasi layanan koperasi, tetapi SDM belum siap. Strategi paling realistis adalah ...",
      a: "Menerapkan digitalisasi bertahap disertai pelatihan dan SOP",
      e: "Transformasi digital berhasil jika kesiapan SDM, proses, dan tata kelola dibangun bertahap."
    },
    {
      p: "Konflik antara dua kelompok anggota mengganggu operasional koperasi. Pendekatan terbaik adalah ...",
      a: "Mediasi berbasis AD/ART dengan fasilitator netral",
      e: "Mediasi berbasis aturan organisasi menjaga objektivitas sekaligus legitimasi keputusan."
    },
    {
      p: "Pengurus menemukan selisih kas kecil berulang pada unit toko koperasi. Tindakan korektif paling tepat adalah ...",
      a: "Audit internal rutin, pemisahan fungsi, dan rekonsiliasi kas harian",
      e: "Pengendalian internal mencegah fraud melalui pemisahan tugas dan verifikasi berlapis."
    },
    {
      p: "Program pemberdayaan UMKM anggota belum memberi dampak signifikan. Evaluasi yang paling relevan adalah ...",
      a: "Mengukur perubahan omzet, akses pasar, dan keberlanjutan usaha anggota",
      e: "Indikator dampak harus menilai outcome, bukan hanya jumlah pelatihan yang terlaksana."
    },
    {
      p: "Dalam kondisi dana terbatas, prioritas investasi koperasi sebaiknya ditentukan berdasarkan ...",
      a: "Urgensi kebutuhan anggota, dampak ekonomi, dan risiko pelaksanaan",
      e: "Prioritas investasi perlu menyeimbangkan manfaat, risiko, dan keberlanjutan."
    },
    {
      p: "Rasio biaya operasional koperasi meningkat tajam. Langkah manajerial yang tepat adalah ...",
      a: "Review proses kerja untuk efisiensi dan tetapkan pengendalian biaya berbasis KPI",
      e: "Efisiensi biaya yang sehat dilakukan melalui perbaikan proses, bukan pemotongan membabi buta."
    },
    {
      p: "Agar pengurus dan pengawas memiliki arah kerja yang selaras, yang harus diperkuat adalah ...",
      a: "Siklus perencanaan, pelaporan berkala, dan forum evaluasi bersama",
      e: "Penyelarasan lintas fungsi membutuhkan mekanisme komunikasi dan evaluasi yang terstruktur."
    }
  ];

  const distract = [
    "Menunda keputusan sampai masalah selesai sendiri",
    "Fokus pada pencitraan jangka pendek",
    "Membatasi informasi hanya untuk pengurus inti",
    "Mengambil keputusan tanpa data",
    "Menghapus proses evaluasi",
    "Mengandalkan intuisi tanpa standar"
  ];

  const out = [];
  for (let i = 0; i < count; i += 1) {
    const item = kasus[i % kasus.length];
    out.push(createQuestion(item.p, item.a, distract, item.e, i % 5));
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
  const q = state.questions[state.currentQuestionIndex];
  dom.questionPanel.classList.remove("transitioning");
  window.requestAnimationFrame(() => {
    dom.questionPanel.classList.add("transitioning");
  });

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

  renderTopBar();
  renderQuickTips(section.id, q);
  renderInstantStrategy(q);
  renderLearningCoach(q);
  renderLearningDashboard();
  if (state.ui.lastRenderedQuestionIndex !== state.currentQuestionIndex) {
    flashTipsCard();
    state.ui.lastRenderedQuestionIndex = state.currentQuestionIndex;
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

  renderExam();
}

function startExam() {
  const name = dom.participantName.value.trim();
  const id = dom.participantId.value.trim();
  if (!name || !id) {
    alert("Nama dan nomor peserta wajib diisi.");
    return;
  }

  state.settings.shuffleQuestions = dom.shuffleQuestions.checked;
  state.settings.shuffleOptions = dom.shuffleOptions.checked;

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
  state.ui.focusMode = false;
  state.ui.lastRenderedQuestionIndex = -1;
  state.ui.wrongStreak = 0;
  state.ui.correctStreak = 0;
  state.ui.bestCorrectStreak = 0;
  state.ui.remedialActive = false;
  document.body.classList.remove("focus-mode");
  dom.showTrapGuideBtn.textContent = "Lihat Panduan Jebakan";
  dom.focusModeBtn.textContent = "Mode Fokus";
  state.currentSegmentIndex = 0;
  state.finished = false;
  state.result = null;
  resetTutorState();
  const firstSectionId = getActiveBlueprint()[0].id;
  state.currentQuestionIndex = getRange(firstSectionId).start;
  state.totalRemaining = getActiveBlueprint().reduce((sum, s) => sum + s.durationMin * 60, 0);
  state.segmentRemaining = getActiveBlueprint()[0].durationMin * 60;

  dom.badge.textContent = `${state.questions.length} Soal • ${Math.floor(state.totalRemaining / 60)} Menit`;

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

function renderWeakTrapAnalysis() {
  const analysis = analyzeWeakTraps().filter((x) => x.total > 0).slice(0, 5);
  dom.weakTrapList.innerHTML = "";
  analysis.forEach((a) => {
    const li = document.createElement("li");
    const pct = Math.round(a.errorRate * 100);
    li.textContent = `${a.label}: ${a.mistakes}/${a.total} belum tepat (${pct}%).`;
    dom.weakTrapList.appendChild(li);
  });
  const canTutor = analysis.some((x) => x.mistakes > 0);
  dom.startTutorBtn.disabled = !canTutor;
  if (!canTutor) {
    const li = document.createElement("li");
    li.textContent = "Akurasi sudah sangat baik. Tutor adaptif tidak diperlukan saat ini.";
    dom.weakTrapList.appendChild(li);
  }
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

function renderResult(message) {
  const r = state.result;
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
  renderWeakTrapAnalysis();

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
    dom.badge.textContent = `${state.customBank.blueprint.reduce((sum, x) => sum + x.count, 0)} Soal • Custom`;
    alert("Import bank soal berhasil.");
  } catch (error) {
    alert(`Import gagal: ${error.message}`);
  } finally {
    dom.bankFileInput.value = "";
  }
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
  }
});

updateBankInfoText();
applyTheme();
applySoundLabel();
