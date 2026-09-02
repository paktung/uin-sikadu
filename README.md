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
| Profil + edit profil (+ foto, IG, TikTok, LinkedIn) | ✅ (kelola semua) | ✅ | ✅ |
| Peserta Kelas (dosen tentukan siapa masuk kelasnya) | - | ✅ | lihat saja |
| Materi | ✅ (lewat admin, kalau perlu) | ✅ (CRUD per kelas) | ✅ (lihat, per kelas) |
| Tugas (buat, kumpul, nilai) | - | ✅ | ✅ |
| Presensi | - | ✅ (buat pertemuan + catat kehadiran) | ✅ (lihat rekap) |
| Nilai / KHS | - | ✅ (input per komponen, huruf otomatis) | ✅ (lihat + IP semester) |
| Import Excel mahasiswa | ✅ | - | - |

Semua modul inti sudah ada di ketiga peran. Yang belum: transkrip resmi
lintas-semester (sekarang baru per tahun akademik aktif), dan approval
KRS berjenjang (sekarang dosen langsung menambahkan, tanpa tahap
persetujuan terpisah).

## Ganti Password & Reset Password

**Ganti password sendiri** (admin/dosen/mahasiswa) — tombol "Ganti Password"
di dashboard masing-masing. Ini murni client-side (Firebase Auth memang
mengizinkan user ganti password sendiri), **tidak butuh setup tambahan**,
langsung jalan begitu file di-upload.

**Reset password oleh admin** (untuk akun dosen/mahasiswa) — ini beda cerita.
Firebase Auth **tidak mengizinkan** satu akun mengubah password akun lain
dari browser (client SDK) - itu batasan keamanan bawaan Firebase, bukan
kode saya. Solusi resminya butuh **Cloud Function** kecil yang jalan di
server pakai Firebase Admin SDK. Sudah saya siapkan di folder `functions/`,
tapi ini **perlu di-deploy terpisah dari Vercel**, langkahnya:

1. Install Firebase CLI (kalau belum ada): `npm install -g firebase-tools`
2. Login: `firebase login`
3. Dari root folder project ini (yang ada file `firebase.json`), jalankan:
   `firebase use --add` lalu pilih project `uin-sikadu`
4. Deploy: `firebase deploy --only functions`

Kemungkinan Firebase akan minta upgrade ke **plan Blaze** (pay-as-you-go)
untuk bisa deploy Cloud Functions - ini syarat dari Google, bukan pilihan.
Tenang, plan Blaze tetap punya kuota gratis bulanan yang besar (jutaan
invocation/bulan) - untuk kebutuhan reset password sesekali, kemungkinan
besar biayanya **Rp 0** selamanya, kecuali dipakai jauh di luar wajar.

Kalau Cloud Function belum di-deploy, tombol "Reset Password" di admin
akan menampilkan pesan error yang jelas (bukan diam/macet), mengarahkan
balik ke bagian ini.

Setelah ter-deploy, tombol "Reset Password" muncul di setiap baris tabel
Data Dosen dan Data Mahasiswa di panel admin.



Halaman `dosen/materi.html` sekarang pakai editor visual (Quill) untuk isi
materi: bold/italic, heading, list, blockquote, link, gambar (via URL),
code block. Ada tombol **"Edit sebagai kode HTML"** untuk yang mau nulis/
tempel HTML langsung. Hasilnya disimpan sebagai HTML dan dirender apa
adanya di `mahasiswa/materi.html` (bukan ditampilkan sebagai teks mentah).

⚠️ Catatan keamanan: karena isi materi dirender sebagai HTML mentah (bukan
di-escape), pastikan hanya akun dosen tepercaya yang punya akses menulis
materi (ini sudah dijamin lewat Firestore Rules - hanya dosen pemilik
kelas atau admin yang bisa menulis ke koleksi `materi`).



Bobot nilai akhir: **Tugas 20% + UTS 30% + UAS 40% + Kehadiran 10%**,
dihitung otomatis di halaman `dosen/nilai.html` begitu dosen mengisi
keempat komponen (semua manual, kehadiran belum ditarik otomatis dari
data presensi - itu jadi salah satu perbaikan berikutnya). Huruf mutu:
A (≥85), B (≥75), C (≥65), D (≥50), E (<50). Mahasiswa melihat rekapnya
di `mahasiswa/nilai.html`, termasuk IP semester (rata-rata bobot huruf
dikali SKS, dibagi total SKS kelas yang sudah dinilai).

## Foto profil & media sosial

Field `foto` di dokumen mahasiswa/dosen hanya menyimpan **link URL**
(bukan upload file - Firestore bukan tempat menyimpan file). Alurnya:
upload gambar ke layanan gratis seperti Imgur atau Cloudinary dulu, lalu
tempel link gambarnya ke field "Link Foto Profil". Kalau link rusak/tidak
bisa dimuat, otomatis kembali menampilkan inisial nama.


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
- `tugas` — per kelasKuliahId, dikelola dosen pemilik kelas.
- `tugasSubmission` — jawaban mahasiswa, doc ID `{tugasId}_{mahasiswaId}`.
- `pertemuan`, `absensi` — presensi per kelas per pertemuan, doc ID absensi `{pertemuanId}_{mahasiswaId}`.
- `nilai` — nilai akhir per mahasiswa per kelas, doc ID `{kelasKuliahId}_{mahasiswaId}`.
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
  milik user lain butuh Firebase Admin SDK. Bisa ditambahkan ke Cloud
  Function yang sama (`functions/index.js`) kalau dibutuhkan nanti.
- **Reset password oleh admin butuh Cloud Function ter-deploy** (lihat
  bagian "Ganti Password & Reset Password" di atas) — kalau belum
  di-deploy, tombolnya akan menampilkan pesan error yang jelas, bukan
  pura-pura berhasil.
- Beberapa rules (absensi, nilai nanti) disederhanakan untuk MVP — lihat
  komentar `TODO` di `firestore.rules` untuk yang perlu diperketat nanti.

## Langkah berikutnya (ide, belum dikerjakan)

- Tarik komponen Kehadiran di Nilai otomatis dari data presensi (sekarang manual).
- Approval KRS berjenjang (opsional, kalau perlu ada tahap konfirmasi admin).
- Transkrip lintas-semester (sekarang KHS baru per tahun akademik aktif).
- Notifikasi (tugas baru, nilai keluar, pengumuman) - sekarang mahasiswa/dosen harus buka sendiri.

