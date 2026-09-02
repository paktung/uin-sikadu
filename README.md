# SIKADU

Sistem Informasi Akademik & Pembelajaran — dibangun di atas Firebase
(Authentication + Firestore). Struktur folder mengikuti tiga peran: admin,
dosen, mahasiswa.

## ⚠️ Kalau muncul "Missing or insufficient permissions"

Ini SELALU berarti **Firestore Rules belum di-publish / belum yang terbaru**.
Bukan bug kode. Cara pasti memperbaikinya:

1. Buka **Firebase Console → Firestore Database → tab Rules**.
2. **Hapus semua isi kotak editor**, ganti dengan isi file `firestore.rules`
   di paket ini (paling atas folder, bukan yang di dalam admin/dosen/mahasiswa).
3. Klik tombol **Publish** di kanan atas.
4. Tunggu ~30 detik, lalu hard refresh browser (`Ctrl+Shift+R`) dan coba lagi.

Rules ini sudah berubah beberapa kali seiring fitur baru ditambahkan (krs,
materi, pertemuan, absensi, dst). Kalau kamu publish rules versi lama,
halaman KRS/Materi/Presensi/Dosen/Mahasiswa akan selalu kena error ini.
**Selalu copy dari file `firestore.rules` yang paling baru di paket ini.**

## Sebelum deploy ulang - checklist wajib

1. **Hapus semua file lama di server, upload SEMUA isi zip ini sekaligus.**
   Banyak file saling `import` berdasarkan nama persis — campur versi
   lama+baru akan error.
2. **Publish ulang `firestore.rules`** (lihat bagian di atas).
3. **Hard refresh** browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) setelah upload.
   Semua asset lokal sekarang versi `?v=6`.
4. Kalau Firestore memunculkan error **"query requires an index"** di
   Console (F12), klik link yang muncul di pesan error itu — link otomatis
   dari Firebase untuk membuat index yang dibutuhkan (~1-2 menit).

## Status fitur per peran

| Fitur | Admin | Dosen | Mahasiswa |
|---|---|---|---|
| Master data (fakultas, prodi, matkul, tahun akademik, kelas) | ✅ | - | - |
| Profil + edit profil | ✅ (kelola semua) | ✅ | ✅ |
| KRS (ambil/batal kelas) | - | - | ✅ |
| Materi | ✅ (lewat admin, kalau perlu) | ✅ (CRUD per kelas) | ✅ (lihat, per kelas) |
| Presensi | - | ✅ (buat pertemuan + catat kehadiran) | ✅ (lihat rekap) |
| Import Excel mahasiswa | ✅ | - | - |
| Tugas (kumpul & nilai) | - | ⏳ belum | ⏳ belum |
| Nilai / KHS | - | ⏳ belum | ⏳ belum |

Tugas dan Nilai/KHS sengaja belum dibuat karena butuh logika penilaian &
alur pengumpulan yang lebih hati-hati.

## Desain

- **Background full-cover** (foto asli, bukan watermark) khusus di halaman
  login/index/setup, pakai file `assets/uin-gusdur-01.jpg` + overlay hijau
  gelap transparan supaya teks tetap kebaca.
- **Avatar besar di tengah sidebar** (foto/inisial + nama + garis aksen
  warna), bukan kecil di pojok bawah.
- **Widget kalender** (bulan berjalan, tanggal hari ini ditandai) di
  dashboard Admin, Dosen, dan Mahasiswa.
- Nuansa hijau-emas islami dipakai konsisten di semua komponen (bukan
  warna oranye/pink dari referensi awal manapun).
- Dashboard admin/dosen/mahasiswa full-bleed (sidebar + konten mengisi
  layar penuh), tidak ada bingkai/kotak mengambang di tengah.

## Nama vs username

Semua halaman selalu prioritaskan `profile.nama || profile.username`. Kalau
yang muncul masih username, field `nama` di dokumen Firestore akun itu
kemungkinan kosong — cek langsung di Firestore Console → collection `users`
atau `dosen`/`mahasiswa`.

## Model data (Firestore)

Skema `.graphql` yang pernah dikirim di awal itu formatnya seperti Firebase
Data Connect (SQL/Postgres) — **belum dipakai**. Semua data sistem ini
tersimpan di **Firestore**, koleksi utama:

- `users/{uid}` — username, level (admin/dosen/mahasiswa), isActive, nama.
- `dosen/{uid}`, `mahasiswa/{uid}` — profil masing-masing, `uid` = Firebase Auth UID.
- `fakultas`, `programStudi`, `mataKuliah`, `tahunAkademik`, `kelasKuliah` — master data akademik (dikelola admin).
- `krs` — mahasiswa mengambil kelas (mahasiswaId, kelasKuliahId, tahunAkademikId).
- `materi` — per kelasKuliahId, dikelola dosen pemilik kelas.
- `pertemuan`, `absensi` — presensi per kelas per pertemuan.
- `pengumuman` — pengumuman umum (dikelola admin).

## Cara menjalankan pertama kali

1. Aktifkan **Email/Password Sign-in** di Firebase Console → Authentication.
2. Aktifkan **Firestore** (Native mode).
3. Publish `firestore.rules` (lihat bagian paling atas).
4. Serve lewat static hosting (Vercel/Firebase Hosting) — jangan buka
   langsung dengan `file://`, ES module butuh HTTP(S).
5. Buka `/setup.html` untuk membuat akun admin pertama (hanya bisa dipakai
   sekali, selama koleksi `users` masih kosong).
6. Login sebagai admin → isi Fakultas → Program Studi → Mata Kuliah →
   Tahun Akademik (aktifkan salah satu) → Kelas Kuliah → Dosen → Mahasiswa.

## Keterbatasan yang perlu kamu tahu

- **Hapus akun tidak tersedia**, hanya "Nonaktifkan" — menghapus akun Auth
  milik user lain butuh Firebase Admin SDK (server/Cloud Functions).
- **Reset password oleh admin belum ada**, alasan yang sama.
- Beberapa rules (absensi, nilai nanti) disederhanakan untuk MVP — lihat
  komentar `TODO` di `firestore.rules` untuk yang perlu diperketat nanti.

## Langkah berikutnya

- Bangun **Tugas** (dosen beri tugas, mahasiswa kumpulkan, dosen menilai).
- Bangun **Nilai/KHS** (rekap nilai per mahasiswa per kelas).
- Pertimbangkan migrasi sebagian data ke SQL/Data Connect kalau memang
  dibutuhkan nanti (laporan lintas-tabel yang kompleks, dsb) — bukan
  keharusan teknis untuk saat ini.
