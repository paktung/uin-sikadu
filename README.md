# SIKADU

## Perubahan arsitektur penting: peserta kelas ditentukan DOSEN, bukan mahasiswa

Sistem ini adalah **LMS untuk dosen**, bukan sistem pendaftaran mandiri ala
kampus. Jadi:

- **Dosen** yang menentukan siapa saja mahasiswa di kelasnya, lewat menu
  **Peserta Kelas** (`dosen/peserta.html`) — cari mahasiswa by nama/NIM,
  tambahkan ke kelas, atau keluarkan.
- **Mahasiswa** hanya bisa **melihat** kelas yang sudah didaftarkan dosen
  untuknya (`mahasiswa/krs.html`, sekarang jadi halaman read-only "Kelas
  Saya"), tidak ada tombol pilih/ambil kelas sendiri.
- Koleksi Firestore `krs` tetap sama strukturnya, cuma **siapa yang boleh
  menulis** yang berubah: dulu mahasiswa (`mahasiswaId == auth.uid`),
  sekarang dosen pemilik kelas (`isDosenOwnsKelas`). Kalau kamu publish
  rules versi lama, penambahan peserta oleh dosen akan gagal.

## ⚠️ Kalau muncul "Missing or insufficient permissions"

Ini SELALU berarti **Firestore Rules belum di-publish / belum yang terbaru**.
Bukan bug kode. Cara pasti memperbaikinya:

1. Buka **Firebase Console → Firestore Database → tab Rules**.
2. **Hapus semua isi kotak editor**, ganti dengan isi file `firestore.rules`
   di paket ini (paling atas folder, bukan yang di dalam admin/dosen/mahasiswa).
3. Klik tombol **Publish** di kanan atas.
4. Tunggu ~30 detik, lalu hard refresh browser (`Ctrl+Shift+R`) dan coba lagi.

## Sebelum deploy ulang - checklist wajib

1. **Hapus semua file lama di server, upload SEMUA isi zip ini sekaligus.**
2. **Publish ulang `firestore.rules`** (lihat bagian di atas — rules KRS berubah lagi ronde ini).
3. **Hard refresh** browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) setelah upload.
   Semua asset lokal sekarang versi `?v=7`.
4. Kalau Firestore memunculkan error **"query requires an index"** di
   Console (F12), klik link yang muncul di pesan error itu.

## Status fitur per peran

| Fitur | Admin | Dosen | Mahasiswa |
|---|---|---|---|
| Master data (fakultas, prodi, matkul, tahun akademik, kelas) | ✅ | - | - |
| Profil + edit profil | ✅ (kelola semua) | ✅ | ✅ |
| Peserta Kelas (dosen tentukan siapa masuk kelasnya) | - | ✅ | lihat saja |
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
- Nuansa hijau-emas islami dipakai konsisten di semua komponen.
- Dashboard admin/dosen/mahasiswa full-bleed, tidak ada bingkai/kotak
  mengambang di tengah.
- **Tidak ada widget kalender** — sempat ditambahkan sebagai elemen dekoratif
  meniru referensi desain, tapi dihapus lagi karena tidak relevan untuk LMS ini.

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
- `krs` — roster kelas, DITULIS OLEH DOSEN pemilik kelas (mahasiswaId, kelasKuliahId, tahunAkademikId).
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
7. Login sebagai dosen → menu **Peserta Kelas** → tambahkan mahasiswa ke
   kelas yang diampu.

## Keterbatasan yang perlu kamu tahu

- **Hapus akun tidak tersedia**, hanya "Nonaktifkan" — menghapus akun Auth
  milik user lain butuh Firebase Admin SDK (server/Cloud Functions).
- **Reset password oleh admin belum ada**, alasan yang sama.
- Beberapa rules (absensi, nilai nanti) disederhanakan untuk MVP — lihat
  komentar `TODO` di `firestore.rules` untuk yang perlu diperketat nanti.

## Langkah berikutnya

- Bangun **Tugas** (dosen beri tugas, mahasiswa kumpulkan, dosen menilai).
- Bangun **Nilai/KHS** (rekap nilai per mahasiswa per kelas).

