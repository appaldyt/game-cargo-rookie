// ====== KONTEN GAME ======
// Sumber: deck "IAS Universe" (Juli 2026) dan ias.id/tentang-kami (direksi, diakses 16 Nov 2026).
// Pada setiap soal, jawaban BENAR selalu ditulis PERTAMA (urutan diacak otomatis saat tampil).

export const PORT = [
  { id: 'cargo', name: 'Cargo & Logistics', ab: 'CL', col: '#f2a541' },
  { id: 'gh', name: 'Ground Handling', ab: 'GH', col: '#4fa3d9' },
  { id: 'hosp', name: 'Hospitality', ab: 'HO', col: '#e86a92' },
  { id: 'sup', name: 'Support', ab: 'SU', col: '#6cc070' },
  { id: 'prop', name: 'Properties', ab: 'PR', col: '#a77dd6' },
];

export const NPC = {
  raka: { name: 'Mas Raka', role: 'Supervisor Shift' },
  sari: { name: 'Bu Sari', role: 'Koordinator Sortir' },
  dina: { name: 'Mbak Dina', role: 'Sekretariat Perusahaan' },
  bima: { name: 'Kapten Bima', role: 'Ground Operation' },
};

export const BRIEF = [
  'Selamat datang di Gudang IAS, {nama}! Saya Mas Raka, supervisor shift hari ini.',
  'IAS adalah InJourney Aviation Services, nama resminya PT Integrasi Aviasi Solusi. Kantor pusat kita di Gedung Sarinah Lt. 8, Jl. M.H. Thamrin No. 11, Jakarta.',
  'IAS bagian dari InJourney, holding ekosistem aviasi dan pariwisata Indonesia: Airports, Aviation Services, Hospitality, Tourism Development, Destination Management dan Retail. IAS memegang Aviation Services.',
  'Visi kita: menjadi penyedia layanan aviasi kelas dunia yang seamless, di Indonesia dan mancanegara.',
  'Misi kita: menghadirkan pengalaman luar biasa lewat sinergi operasional, service excellence dan inovasi digital.',
  'Kita hadir di 55 kota dan 45 area operasi dengan lebih dari 46 ribu karyawan. Ada 4 region: Jakarta (CGK), Bali (DPS), Medan (KNO), Makassar (UPG). Segera menyusul Region 5 Global: Hong Kong dan Dubai.',
  'Cara kerja kita dipandu nilai AKHLAK: Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif.',
  'Oke, cukup ceritanya. Sekarang buktikan kamu menyimak. Ayo duel kuis!',
];
export const BRIEF_Q = [
  { q: 'IAS adalah bagian dari holding apa?', a: ['InJourney', 'Holding Logistik Nasional', 'Holding Perbankan', 'Holding Energi'], e: 'IAS bagian dari InJourney, holding ekosistem aviasi dan pariwisata Indonesia.' },
  { q: 'Region 2 IAS berpusat di mana?', a: ['Bali (DPS)', 'Medan (KNO)', 'Makassar (UPG)', 'Jakarta (CGK)'], e: 'Region 1 Jakarta (CGK), Region 2 Bali (DPS), Region 3 Medan (KNO), Region 4 Makassar (UPG).' },
  { q: 'Huruf "H" dalam AKHLAK adalah…', a: ['Harmonis', 'Handal', 'Humanis', 'Hebat'], e: 'AKHLAK: Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif.' },
  { q: 'Menurut visinya, IAS ingin menjadi…', a: ['Penyedia layanan aviasi kelas dunia yang seamless', 'Maskapai terbesar di Asia', 'Satu-satunya operator bandara', 'Perusahaan e-commerce nasional'], e: 'Visi IAS: to be a world class and seamless aviation services provider in Indonesia and beyond.' },
];

export const SARI = [
  'Halo, {nama}! Saya Bu Sari, koordinator sortir. Di conveyor ini semua paket harus masuk ke kandang portofolio yang benar.',
  'IAS punya 5 portofolio dan 15 lini bisnis: Cargo & Logistics, Ground Handling, Hospitality, Support dan Properties.',
  'Baca label paketnya, lalu pilih kandang yang tepat sebelum waktunya habis. Siap?',
];
export const SORT = [
  { p: 'cargo', t: 'Bongkar muat & monitoring CCTV di terminal kargo bandara', e: 'Cargo Terminal Operation, lengkap dengan cold storage, DG room dan strong room. Tahun 2024: 182.310 penerbangan dan 680,4 juta kg kargo.' },
  { p: 'cargo', t: 'Kirim paket Door to Door, first mile sampai last mile', e: 'Air Express / GSA, dengan mode DTD, DTP dan PTD. On-time performance 99,8%.' },
  { p: 'cargo', t: 'Gudang cold chain & fulfillment e-commerce di Pasuruan', e: 'Contract Logistics: Pasuruan 8.500 m², Bali Logistics Park 6.240 m², Marunda 3.500 m².' },
  { p: 'cargo', t: 'Urus bea cukai & logistik event MotoGP Lombok', e: 'Freight Forwarding ke 50+ negara. Rekam jejaknya: MotoGP & WSBK Lombok, F1 Powerboat & Aquabike Danau Toba.' },
  { p: 'cargo', t: 'Wrapping, titip & antar bagasi penumpang di bandara', e: 'Baggage Solution masuk portofolio Cargo & Logistics, bukan Ground Handling. Tersedia di 16 bandara.' },
  { p: 'gh', t: 'Layanan pesawat, ramp & bagasi berbasis SLA', e: 'Ground Handling: aircraft, passenger, ramp & baggage services berbasis SLA.' },
  { p: 'gh', t: 'Kesiapan operasional bandara (airport operational readiness)', e: 'Airport operational readiness termasuk portofolio Ground Handling.' },
  { p: 'hosp', t: 'Lounge premium sebelum penerbangan', e: 'Hospitality: IAS mengoperasikan 27 lounge di bandara-bandara Indonesia.' },
  { p: 'hosp', t: 'Meet & greet penumpang VIP JOUMPA', e: 'Concierge Services JOUMPA VIP hadir di 35 stasiun.' },
  { p: 'hosp', t: 'Katering pesawat & pasokan bakery ke hotel', e: 'Food Services: in-flight catering sejak 2013, bakery supply, dan buffet untuk acara.' },
  { p: 'sup', t: 'Personel Avsec, PKP-PK & operator aviobridge', e: 'Support · Manpower: 6.745 tenaga berlisensi dan 3.298 non-lisensi di 35 bandara, sejak 2014.' },
  { p: 'sup', t: 'Facility management & robot cleaning', e: 'Support · Facility Management & Cleaning.' },
  { p: 'sup', t: 'Penyediaan & perawatan peralatan, termasuk EV bus', e: 'Support · Equipment Supply & Maintenance.' },
  { p: 'sup', t: 'Solusi ICT, aplikasi & layanan keamanan', e: 'Support · ICT and Security Services.' },
  { p: 'prop', t: 'Pengembangan properti', e: 'Properties · Property Development.' },
  { p: 'prop', t: 'Pembangunan infrastruktur aviasi', e: 'Properties · Aviation Infrastructure Development.' },
];

export const DIR = [
  { n: 'Tri Andayani', j: 'Direktur Utama', r: 'Saya memimpin Direksi dan menentukan arah strategis IAS.', ab: 'DU', col: '#ffd23f', suit: '#1f3b73', hair: '#2a1a12' },
  { n: 'Citra Amelya', j: 'Direktur Keuangan & Manajemen Risiko', r: 'Saya membidangi keuangan dan manajemen risiko perusahaan.', ab: 'KU', col: '#f2a541', suit: '#5a2e4f', hair: '#1b1b1b' },
  { n: 'Danny P Thaharsyah', j: 'Direktur Operasi', r: 'Saya membidangi operasional layanan IAS di lapangan.', ab: 'OP', col: '#4fa3d9', suit: '#2d3a40', hair: '#3a2a1e' },
  { n: 'Muchdian Muchlis', j: 'Direktur Komersial', r: 'Saya membidangi penjualan, klien dan pengembangan bisnis.', ab: 'KO', col: '#e86a92', suit: '#22404a', hair: '#1b1b1b' },
  { n: 'Anik Hidayati', j: 'Direktur SDM & Digitalisasi', r: 'Saya membidangi pengelolaan SDM dan transformasi digital IAS.', ab: 'SD', col: '#6cc070', suit: '#3d2f6b', hair: '#2a1a12' },
  { n: 'Dody Rahmadi Amar', j: 'Direktur Hubungan Lembaga', r: 'Saya membidangi hubungan IAS dengan lembaga dan pemangku kepentingan.', ab: 'HL', col: '#a77dd6', suit: '#40301f', hair: '#1b1b1b' },
];
// Isi manifest disusun dari nama jabatan. Validasikan ke HC/Corsec sebelum dipakai.
export const MAN = [
  { d: 0, t: 'Arahan strategis & laporan kinerja IAS Group' },
  { d: 0, t: 'Persetujuan akhir rencana jangka panjang perusahaan' },
  { d: 1, t: 'Laporan keuangan & anggaran tahunan' },
  { d: 1, t: 'Register risiko & rencana mitigasinya' },
  { d: 2, t: 'Laporan on-time performance terminal kargo' },
  { d: 2, t: 'Kesiapan operasional ground handling di bandara' },
  { d: 3, t: 'Proposal kerja sama klien korporat baru' },
  { d: 3, t: 'Strategi penjualan layanan lounge & JOUMPA' },
  { d: 4, t: 'Program onboarding karyawan baru (seperti game ini!)' },
  { d: 4, t: 'Pengembangan aplikasi digital internal' },
  { d: 5, t: 'Koordinasi dengan kementerian & lembaga pemerintah' },
  { d: 5, t: 'Hubungan dengan regulator & pemangku kepentingan' },
];
export const DINA = [
  'Selamat datang di Menara Kontrol, {nama}. Saya Mbak Dina dari Sekretariat Perusahaan.',
  'Di dalam ada ruang keenam Direksi IAS. Kenalan dulu dengan masing-masing direktur, lalu kembali ke saya.',
];
export const DINA2 = [
  'Kamu sudah kenal semua direksi. Sekarang ada manifest yang perlu ditandatangani.',
  'Antar setiap manifest ke direktur yang membidanginya. Hanya percobaan pertama yang dinilai!',
];

export const BIMA = [
  'Kamu {nama}, ya? Saya Kapten Bima dari Ground Operation. Pesawat kargo ini siap berangkat.',
  'Setiap jawaban benar memuat satu kontainer ULD. Jawab cepat untuk bonus. Siap duel terakhir?',
];
export const QUIZ = [
  { q: 'Siapa Direktur Utama IAS?', a: ['Tri Andayani', 'Citra Amelya', 'Anik Hidayati', 'Muchdian Muchlis'], e: 'Direktur Utama IAS adalah Tri Andayani.' },
  { q: 'Anik Hidayati menjabat sebagai…', a: ['Direktur SDM & Digitalisasi', 'Direktur Komersial', 'Direktur Operasi', 'Direktur Hubungan Lembaga'], e: 'Anik Hidayati adalah Direktur SDM & Digitalisasi IAS.' },
  { q: 'Berapa lounge yang dioperasikan IAS di Indonesia?', a: ['27', '12', '35', '55'], e: 'IAS mengoperasikan 27 lounge.' },
  { q: 'Layanan concierge VIP IAS bernama…', a: ['JOUMPA', 'SAPA', 'KAWAN', 'TEMU'], e: 'JOUMPA VIP hadir di 35 stasiun.' },
  { q: 'Berapa volume kargo yang ditangani IAS pada 2024?', a: ['680,4 juta kg', '68 juta kg', '6,8 miliar kg', '180 juta kg'], e: 'Tahun 2024: 182.310 penerbangan dan 680,4 juta kg kargo.' },
  { q: 'Barang berbahaya (dangerous goods) di terminal kargo disimpan di…', a: ['DG room', 'Cold storage', 'Lounge', 'Lost & found'], e: 'Terminal kargo IAS punya cold storage, DG room dan strong room.' },
  { q: 'ISO 45001:2018 yang dimiliki IAS adalah standar untuk…', a: ['Keselamatan & kesehatan kerja (K3)', 'Manajemen mutu', 'Keamanan pangan', 'Manajemen lingkungan'], e: 'ISO 45001 = K3, ISO 9001 = mutu, ISO 37001 = anti penyuapan.' },
  { q: 'Kode layanan DTD pada Air Express berarti…', a: ['Door to Door', 'Dock to Dock', 'Direct Transit Delivery', 'Daily Truck Dispatch'], e: 'DTD (Door to Door), DTP (Door to Port), PTD (Port to Door).' },
  { q: 'Event mana yang logistiknya pernah ditangani IAS?', a: ['MotoGP Lombok', 'Piala Dunia FIFA', 'Olimpiade Paris', 'Tour de France'], e: 'MotoGP & World Superbike Lombok, F1 Powerboat & Aquabike Danau Toba.' },
  { q: 'Gudang contract logistics IAS yang terluas ada di…', a: ['Pasuruan', 'Marunda', 'Bali Logistics Park', 'Lini 2 CGK'], e: 'Pasuruan 8.500 m², Bali Logistics Park 6.240 m², Marunda 3.500 m².' },
  { q: 'Baggage solution IAS tersedia di berapa bandara?', a: ['16', '4', '27', '55'], e: 'Wrapping, repacking, penitipan dan antar bagasi tersedia di 16 bandara.' },
  { q: 'Sejak kapan IAS menjalankan in-flight catering?', a: ['2013', '2020', '2005', '2024'], e: 'In-flight catering IAS berjalan sejak 2013.' },
  { q: 'PKP-PK dan operator aviobridge termasuk portofolio…', a: ['Support', 'Ground Handling', 'Hospitality', 'Properties'], e: 'Keduanya bagian dari Manpower berlisensi di portofolio Support.' },
  { q: 'Freight forwarding IAS menjangkau berapa negara?', a: ['50+', '10', '5', '100+'], e: 'Lebih dari 50 negara dengan 4 hub region global.' },
  { q: 'On-time performance Air Express IAS tercatat…', a: ['99,8%', '89,5%', '75%', '100%'], e: 'Air Express menjaga SLA dengan OTP 99,8%.' },
  { q: 'Di mana kantor pusat IAS?', a: ['Gedung Sarinah Lt. 8, Jakarta', 'Bandara Soekarno-Hatta T3', 'Bali Logistics Park', 'Gudang Marunda'], e: 'Gedung Sarinah Lt. 8, Jl. M.H. Thamrin No. 11, Jakarta.' },
  { q: 'Berapa titik perjalanan penumpang yang dapat dilayani IAS?', a: ['33 dari 36', '16 dari 36', '36 dari 36', '12 dari 36'], e: '17 titik keberangkatan dan 16 titik kedatangan.' },
];

// Kartu info tersebar di gudang (koleksi opsional, +50 poin per kartu)
export const INFO = [
  { t: '27 lounge', d: 'IAS mengoperasikan 27 lounge premium di bandara-bandara Indonesia.' },
  { t: 'JOUMPA VIP', d: 'Layanan meet & greet JOUMPA hadir di 35 stasiun, untuk kedatangan maupun keberangkatan.' },
  { t: 'Produksi kargo 2024', d: '182.310 penerbangan ditangani dengan volume 680,4 juta kg kargo.' },
  { t: 'Ruang khusus kargo', d: 'Terminal kargo IAS punya cold storage, DG room dan strong room untuk hewan hidup, barang berbahaya dan jenazah.' },
  { t: 'Sertifikasi ISO', d: 'ISO 9001:2015 (mutu), ISO 45001:2018 (K3) dan ISO 37001:2016 (anti penyuapan).' },
  { t: 'Freight forwarding', d: 'Menjangkau 50+ negara dan 4 hub region global, termasuk logistik MotoGP dan F1 Powerboat.' },
  { t: 'Gudang contract logistics', d: 'Pasuruan 8.500 m², Bali Logistics Park 6.240 m², Marunda 3.500 m², plus MDC DPS, MDC CGK dan Gempol.' },
  { t: 'Baggage solution', d: 'Wrapping, repacking, titip dan antar bagasi di 16 bandara, dari DPS dan CGK sampai BTH.' },
  { t: 'Tenaga berlisensi', d: '6.745 tenaga berlisensi (Avsec, PKP-PK, operator aviobridge) dan 3.298 non-lisensi di 35 bandara.' },
  { t: 'Food services', d: 'In-flight catering sejak 2013, plus bakery untuk restoran, hotel dan minimarket.' },
  { t: 'Perjalanan penumpang', d: 'IAS melayani 33 dari 36 titik perjalanan: 17 keberangkatan dan 16 kedatangan.' },
  { t: 'Travel management', d: 'Corporate travel, MICE dan transportasi darat. Pernah mendukung kunjungan Presiden Prancis di Borobudur.' },
];
