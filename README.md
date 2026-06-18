# Termux Music Streaming App

Aplikasi musik streaming Full Stack modern yang didesain 100% untuk berjalan di Termux Android.
Backend dibangun dengan Python (Flask, ytmusicapi, yt-dlp) dan Frontend menggunakan React (Vite).

## Fitur Utama
- **Python Backend**: Stabil dan ringan dengan `sqlite` bawaan.
- **Frontend React**: UI Modern ala iOS Music & Spotify, mobile first.
- **ytmusicapi**: Untuk mengambil data trending, search, artist, album, dll.
- **yt-dlp**: Engine streaming dan download yang sangat bertenaga.

## Cara Install di Termux

Jalankan perintah ini satu per-satu di Termux kamu:

```bash
pkg update -y
pkg upgrade -y
pkg install python -y
pkg install nodejs -y
pkg install git -y
pkg install ffmpeg -y
```

Clone atau download source code ini ke dalam Termux, masuk ke folder project:

```bash
# Pastikan berada di folder project
cd termux-music-app
```

## Cara Menjalankan Backend (Python)

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Install pip list `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
3. Jalankan server Flask:
   ```bash
   python app.py
   ```
Server backend akan berjalan di `http://0.0.0.0:5000`. Database, cache, dan folder downloads akan otomatis digenerate.

## Cara Menjalankan Frontend (Vite)

Buka terminal **baru** di Termux (swipe dari kiri ke kanan -> New Session).

1. Masuk ke folder project utamanya (dimana file `package.json` berada):
   ```bash
   cd termux-music-app
   ```
2. Install semua dependency Node.js:
   ```bash
   npm install
   ```
3. Jalankan frontend (Dev Mode):
   ```bash
   npm run dev
   ```
Buka browser (Chrome/Edge/Brave) di Android kamu dan ketik `http://localhost:5173`. Frontend akan meload data dari backend Python di port 5000.

## Cara Build Production (Frontend)

Jika kamu ingin menjalankan Frontend secara static:

1. Di folder utama jalankan:
   ```bash
   npm run build
   ```
2. Hasil build akan berada di folder `dist/`. Kamu bisa jalankan dengan *static server* sederhana:
   ```bash
   npx serve -s dist
   ```

Terima kasih telah mencoba!
