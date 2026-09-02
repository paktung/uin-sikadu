# SIKADU

Sistem Informasi Akademik & Pembelajaran — dibangun di atas Firebase
(Authentication + Firestore). Struktur folder mengikuti tiga peran:

```
/                 <- entry point + login (untuk semua peran)
/setup.html       <- bootstrap SATU KALI untuk membuat admin pertama
/admin/           <- panel admin (SELESAI: dashboard, kelola dosen, kelola mahasiswa)
/dosen/           <- panel dosen (placeholder, dibangun tahap berikutnya)
/mahasiswa/       <- panel mahasiswa (placeholder, dibangun tahap berikutnya)
/assets/          <- kode & style bersama (firebase-config, auth-guard, style.css)
```

## Yang sudah diperbaiki dari index.html & login.html lama

- **Duplikasi dihapus.** Sebelumnya ada dua halaman login yang hampir identik
  (satu pakai field `nim`, satu pakai `username`) — sekarang cuma satu
  `login.html`, memakai satu field `username` yang menerima NIM, NIDN, atau
  username admin.
- **`index.html` sekarang jadi entry point, bukan halaman login kedua.** Ia
  mengecek status login lalu redirect otomatis ke dashboard yang sesuai
  peran (admin/dosen/mahasiswa), atau ke `login.html` kalau belum login.
- **Login sekarang sadar peran (role-aware).** Setelah `signInWithEmailAndPassword`
  berhasil, dibaca dokumen `users/{uid}` di Firestore untuk tahu `level`-nya,
  lalu diarahkan ke dashboard yang tepat.
- **Cek akun nonaktif.** Kalau `isActive === false`, user langsung di-sign-out
  dan diberi pesan jelas, bukan dibiarkan "menggantung" di sesi login.
- **`lastLoginAt` otomatis tercatat** setiap kali login berhasil.
- **CSS & konfigurasi Firebase dipisah** ke `/assets` supaya tidak disalin-ulang
  di tiap file (sebelumnya `firebaseConfig` di-copy-paste identik di dua file).

## Model data (Firestore)

Skema `.graphql` yang kamu kirim awal terlihat seperti definisi Firebase Data
Connect (Postgres). Untuk kebutuhan sekarang — panel admin sederhana dengan
Firebase Auth berbasis client — kode ini memakai **Firestore**, koleksi:

- `users/{uid}` — `username`, `level` (`admin`/`dosen`/`mahasiswa`), `isActive`,
  `lastLoginAt`, `createdAt`, `updatedAt`. `uid` = UID Firebase Auth.
- `dosen/{uid}` — profil dosen, `uid` sama dengan `users/{uid}` (relasi 1:1
  implisit, tidak perlu field `user` terpisah).
- `mahasiswa/{uid}` — profil mahasiswa, pola yang sama.

Kalau kamu memang ingin memakai Firebase **Data Connect** (skema SQL/GraphQL
yang kamu kirim), beri tahu — strukturnya perlu diubah karena Data Connect
pakai Cloud SQL dan cara akses datanya beda dari Firestore.

## Cara menjalankan

1. **Aktifkan Email/Password Sign-in** di Firebase Console →
   Authentication → Sign-in method.
2. **Aktifkan Firestore** (Native mode) di Firebase Console.
3. **Pasang aturan keamanan** dari `firestore.rules` (lihat komentar di
   dalamnya — ini contoh awal, perketat lagi sebelum production).
4. Serve folder ini lewat static server (jangan buka langsung dengan
   `file://`, karena ES module `import` butuh HTTP). Untuk Firebase Hosting:
   ```
   firebase init hosting   # pilih folder ini sebagai public dir
   firebase deploy --only hosting
   ```
   Untuk coba lokal cepat: `npx serve .` lalu buka `http://localhost:3000`.
5. Buka **`/setup.html`** untuk membuat akun admin pertama (hanya bisa
   dipakai sekali, selama koleksi `users` masih kosong).
6. Login sebagai admin di **`/login.html`**, lalu buka **Data Dosen** /
   **Data Mahasiswa** untuk menambahkan akun dosen & mahasiswa.

## Keterbatasan yang perlu kamu tahu

- **Hapus akun tidak tersedia**, hanya "Nonaktifkan". Menghapus akun Auth
  milik user lain butuh Firebase Admin SDK (server/Cloud Functions) —
  client SDK tidak bisa melakukan itu. Nonaktifkan (`isActive: false`) sudah
  cukup untuk mengunci akses login.
- **Reset password oleh admin belum ada** untuk alasan yang sama. Untuk versi
  lanjutan, ini sebaiknya lewat Cloud Function (`admin.auth().updateUser`).
- Pembuatan akun baru dari panel admin memakai trik *secondary Firebase App*
  (lihat komentar di `assets/create-auth-user.js`) supaya sesi admin tidak
  ter-replace oleh akun yang baru dibuat. Ini aman untuk skala kecil–menengah,
  tapi kalau butuh keamanan lebih ketat (password sementara tidak lewat
  client sama sekali), pindahkan proses ini ke Cloud Function.

## Langkah berikutnya

- Bangun `/dosen/*`: kelola kelas, materi, tugas, latihan soal, nilai, absensi.
- Bangun `/mahasiswa/*`: lihat materi, kumpul tugas, kerjakan latihan, lihat nilai.
- Perketat `firestore.rules` seiring koleksi baru (materi, tugas, nilai, dst.)
  ditambahkan.
