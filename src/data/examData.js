export const QUESTION_BANK = {
  twk: [
    {
      id: 'twk1',
      section: 'TWK',
      topic: 'Pancasila',
      prompt: 'Pancasila sebagai dasar negara Indonesia pertama kali dirumuskan dalam sidang...',
      options: ['BPUPKI', 'PPKI', 'KNIP', 'MPRS', 'DPAS'],
      correctIndex: 0,
      explanation: 'Rumusan Pancasila pertama kali dibahas dalam sidang BPUPKI (Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia) pada 29 Mei - 1 Juni 1945.'
    },
    {
      id: 'twk2',
      section: 'TWK',
      topic: 'UUD 1945',
      prompt: 'Pasal dalam UUD 1945 yang mengatur tentang hak asasi manusia adalah...',
      options: ['Pasal 27-34', 'Pasal 28A-28J', 'Pasal 1-3', 'Pasal 33-34', 'Pasal 18-22'],
      correctIndex: 1,
      explanation: 'Hak Asasi Manusia diatur secara spesifik dalam Bab XA Pasal 28A sampai dengan 28J hasil amandemen kedua UUD 1945.'
    }
  ],
  tiu: [
    {
      id: 'tiu1',
      section: 'TIU',
      topic: 'Analogi',
      prompt: 'Kaka tua : Merpati = ...',
      options: ['Anjing : Herder', 'Gurame : Kakap', 'Gajah : Semut', 'Singa : Naga', 'Elang : Ayam'],
      correctIndex: 1,
      explanation: 'Hubungan antara Kaka tua dan Merpati adalah keduanya termasuk dalam kelompok burung. Hubungan yang setara adalah Gurame dan Kakap yang keduanya termasuk kelompok ikan.'
    },
    {
      id: 'tiu2',
      section: 'TIU',
      topic: 'Numerik',
      prompt: 'Jika 3x + 5 = 20, maka nilai dari 2x - 3 adalah...',
      options: ['5', '7', '9', '11', '13'],
      correctIndex: 1,
      explanation: '3x + 5 = 20 => 3x = 15 => x = 5. Maka 2(5) - 3 = 10 - 3 = 7.'
    }
  ],
  tkp: [
    {
      id: 'tkp1',
      section: 'TKP',
      topic: 'Pelayanan Publik',
      prompt: 'Seorang pelanggan datang dengan marah karena layanan yang ia terima tidak memuaskan. Sikap Anda adalah...',
      options: [
        'Mendengarkan keluhannya dengan sabar dan mencoba mencari solusi.',
        'Meminta rekan kerja lain untuk menanganinya.',
        'Menjelaskan bahwa itu bukan kesalahan Anda.',
        'Mengabaikannya karena ia tidak sopan.',
        'Melaporkannya ke atasan agar segera diusir.'
      ],
      correctIndex: 0,
      explanation: 'Dalam aspek pelayanan publik, sikap terbaik adalah empati, sabar mendengarkan keluhan, dan berorientasi pada solusi untuk menjaga kepuasan pelanggan.'
    }
  ]
};

export const EXAM_PROFILES = {
  cpns: {
    label: 'Simulasi Full CPNS 2026',
    blueprint: [
      { id: 'twk', title: 'Tes Wawasan Kebangsaan', count: 30, duration: 30 },
      { id: 'tiu', title: 'Tes Intelegensia Umum', count: 35, duration: 30 },
      { id: 'tkp', title: 'Tes Karakteristik Pribadi', count: 45, duration: 40 }
    ]
  },
  twk: {
    label: 'Latihan Khusus TWK',
    blueprint: [{ id: 'twk', title: 'Tes Wawasan Kebangsaan', count: 30, duration: 30 }]
  },
  tiu: {
    label: 'Latihan Khusus TIU',
    blueprint: [{ id: 'tiu', title: 'Tes Intelegensia Umum', count: 35, duration: 35 }]
  },
  tkp: {
    label: 'Latihan Khusus TKP',
    blueprint: [{ id: 'tkp', title: 'Tes Karakteristik Pribadi', count: 45, duration: 45 }]
  }
};
