# Cargo Rookie IAS — Game Onboarding 3D

Game petualangan 3D low-poly ala RPG monster-trainer. Karyawan baru menjelajahi gudang kargo IAS,
mengobrol dengan NPC, duel kuis, menyortir paket, menemui Direksi, mengumpulkan kartu info,
lalu memberangkatkan pesawat kargo. Skor tersimpan di server sendiri (SQLite) dan direkap per kode event.

## Alur permainan (±15–20 menit)
| Lencana | NPC & lokasi | Aktivitas |
|---|---|---|
| BR · Briefing | Mas Raka, dekat gerbang | Dialog profil IAS (InJourney, visi-misi, region, AKHLAK), lalu duel kuis 4 soal |
| SO · Sortir | Bu Sari, area conveyor (barat) | Sortir 12 paket ke kandang 5 portofolio, dengan batas waktu dan bonus streak |
| DR · Direksi | Mbak Dina, Menara Kontrol (barat laut) | Kenalan dengan 6 direktur, lalu antar 6 manifest ke direktur yang tepat |
| DS · Dispatch | Kapten Bima, pintu apron (timur laut) | Duel kuis 8 soal dengan timer, lalu pesawat lepas landas |

Ada 12 kotak kuning "?" (kartu info) yang tersebar sebagai koleksi opsional, masing-masing +50 poin.
Kontrol: joystick kiri dan tombol SPACE di HP; WASD/panah dan SPACE/E di laptop.

## Struktur
```
server.js          Server Node.js (tanpa framework) + SQLite bawaan Node 22
public/index.html  Halaman game
public/game.js     Dunia 3D & logika game (Three.js)
public/content.js  SEMUA MATERI: dialog, soal, sortir, direksi, manifest, kartu info
public/admin.html  Halaman rekap per event (dilindungi password)
Dockerfile         Untuk Easypanel
```
Untuk mengubah materi, cukup edit `public/content.js`. Jawaban benar selalu ditulis **pertama**, dan urutannya diacak otomatis saat tampil.

## Deploy ke Easypanel
1. Push folder ini ke repository GitHub (boleh private).
2. Di Easypanel: **Create Project → + Service → App**.
3. **Source**: pilih repository GitHub tadi. **Build**: pilih **Dockerfile**.
4. **Environment**:
   ```
   ADMIN_PASSWORD=ganti-dengan-password-kuat
   ADMIN_USER=admin
   ```
5. **Mounts → Add Volume**: name `data`, mount path `/app/data`.
   Ini **wajib**. Tanpa volume, semua skor hilang setiap kali redeploy.
6. **Domains**: arahkan domain/subdomain ke port **3000** dan aktifkan HTTPS.
7. Klik **Deploy**.

Setelah jalan:
- Game: `https://domain-anda/`. Bagikan link atau QR code ke peserta.
- Rekap: `https://domain-anda/admin`. Login dengan ADMIN_USER / ADMIN_PASSWORD. Isinya rekap per event, pencarian, unduh CSV, dan hapus entri uji coba.
- Health check: `/healthz`

## Jalankan lokal
```
npm install
ADMIN_PASSWORD=rahasia npm start      # http://localhost:3000
```
Butuh Node.js 22.5 atau lebih baru (memakai modul bawaan `node:sqlite`).

## Saat event
1. Fasilitator menentukan kode event, misalnya `ONB-NOV26`.
2. Peserta membuka link di HP dan mengisi kartu identitas dengan kode event tersebut.
3. Pantau hasilnya di `/admin`, yang otomatis dikelompokkan per kode event.

## Catatan
- Kalau sinyal peserta putus saat mengirim skor, skor disimpan di HP dan dikirim ulang otomatis saat game dibuka lagi.
- API publik hanya menampilkan nama, unit, dan skor (top 10 per event). NIP dan "tentang saya" hanya terlihat di `/admin`.
- Data direksi diambil dari ias.id/tentang-kami (16 Nov 2026). Perbarui `DIR` di `content.js` jika ada pergantian.
- Isi manifest disusun berdasarkan nama jabatan. Validasikan ke HC/Corsec.
- Materi bersumber dari deck IAS Universe (berlabel *Confidential | For client discussion*). Pastikan pemilik materi setuju sebelum link dibuka untuk umum.
- Font pixel dimuat dari Google Fonts. Jika HP peserta tidak bisa mengakses Google, game tetap jalan dengan font cadangan.
