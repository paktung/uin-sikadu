// assets/auth-guard.js
// Dipakai di setiap halaman terproteksi (admin/*, dosen/*, mahasiswa/*).
//
// Pemakaian:
//   import { guardPage, logout } from "../assets/auth-guard.js";
//   const { user, profile } = await guardPage("admin");
//
// Firebase Authentication (onAuthStateChanged) TETAP jadi sumber kebenaran
// login, bukan sessionStorage. sessionStorage di sini hanya disegarkan
// supaya halaman lain bisa tampilkan nama/level user tanpa baca ulang
// Firestore, TIDAK dipakai untuk memutuskan boleh/tidaknya akses.
//
// guardPage akan:
//   1. Menunggu status login Firebase Auth.
//   2. Kalau belum login -> redirect ke login.html
//   3. Ambil dokumen users/{uid} dari Firestore.
//   4. Kalau akun dinonaktifkan (isActive === false) -> sign out + redirect.
//   5. Normalisasi level, lalu kalau tidak cocok dengan halaman ini ->
//      redirect ke dashboard yang sesuai levelnya (bukan langsung ke login).

import { auth, db, ROLE_HOME, normalizeLevel } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

function goTo(path) {
  window.location.href = window.location.origin + path;
}

// Banner besar & jelas di paling atas halaman untuk error fatal - dipakai
// alih-alih redirect diam-diam, supaya pesan errornya benar-benar terbaca
// sebelum halaman pindah (redirect instan sering bikin pesan errornya
// "kelewat" karena halaman keburu ganti).
function showFatalBanner(message, { showLoginLink = true } = {}) {
  if (document.getElementById("sikadu-fatal-banner")) return;
  const banner = document.createElement("div");
  banner.id = "sikadu-fatal-banner";
  banner.style.cssText =
    "position:fixed; top:0; left:0; right:0; z-index:9999; " +
    "background:#7f1d1d; color:#fee2e2; padding:14px 20px; " +
    "font:14px/1.6 Inter,-apple-system,sans-serif; text-align:center; " +
    "box-shadow:0 2px 10px rgba(0,0,0,.3);";
  banner.innerHTML =
    `<div style="max-width:840px;margin:0 auto;">${message}` +
    (showLoginLink ? ' <a href="/login.html" style="color:#fecaca;font-weight:700;">Kembali ke Login &rarr;</a>' : "") +
    `</div>`;
  document.body.prepend(banner);
}

export function guardPage(expectedRole) {
  return new Promise((resolve) => {
    // Kalau Firebase Auth belum juga memberi status setelah 8 detik (koneksi
    // lambat, domain belum di-authorize di Firebase Console, file JS versi
    // lama/campur di server, dsb), tampilkan banner BESAR yang jelas
    // terlihat - bukan cuma teks kecil di sidebar yang gampang terlewat.
    let resolved = false;
    setTimeout(() => {
      if (resolved) return;
      const el = document.getElementById("sidebarUser");
      if (el) el.textContent = "Gagal memuat sesi.";
      showFatalBanner(
        "Halaman gagal memverifikasi status login setelah 8 detik. " +
        "Kemungkinan: (1) koneksi internet bermasalah, (2) domain ini belum " +
        "ditambahkan di Firebase Console → Authentication → Settings → " +
        "Authorized domains, atau (3) file yang ter-upload ke server versi " +
        "lama/campuran. Coba refresh paksa (Ctrl+Shift+R / Cmd+Shift+R) dulu."
      );
    }, 8000);

    onAuthStateChanged(auth, async (user) => {
      resolved = true;

      if (!user) {
        goTo("/login.html");
        return;
      }

      let snap;
      try {
        snap = await getDoc(doc(db, "users", user.uid));
      } catch (err) {
        console.error("Gagal membaca profil user:", err.code, err.message);
        await signOut(auth);
        showFatalBanner(
          `Gagal membaca profil dari Firestore (kode: <b>${err.code || "unknown"}</b>). ` +
          `Ini biasanya soal Firestore Security Rules yang belum benar, bukan soal password.`
        );
        return;
      }

      if (!snap.exists()) {
        // Akun Auth ada tapi tidak ada profil di Firestore - data tidak konsisten.
        console.error("Dokumen users/" + user.uid + " tidak ditemukan di Firestore.");
        await signOut(auth);
        showFatalBanner(
          `Login berhasil tapi dokumen <b>users/${user.uid}</b> tidak ditemukan di Firestore. ` +
          `Cek Firestore Console: collection-nya harus persis bernama "users".`
        );
        return;
      }

      const profile = snap.data();
      const level = normalizeLevel(profile.level);

      if (profile.isActive === false) {
        await signOut(auth);
        goTo("/login.html?error=inactive");
        return;
      }

      // Segarkan sessionStorage untuk kebutuhan UI di halaman ini.
      sessionStorage.setItem("sikadu_uid", user.uid);
      sessionStorage.setItem("sikadu_username", profile.username || "");
      sessionStorage.setItem("sikadu_nama", profile.nama || "");
      sessionStorage.setItem("sikadu_level", level);

      if (level !== expectedRole) {
        const target = ROLE_HOME[level];
        goTo(target || "/login.html");
        return;
      }

      resolve({ user, uid: user.uid, profile: { ...profile, level } });
    });
  });
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Gagal sign out (tetap lanjut redirect):", err);
  }
  sessionStorage.removeItem("sikadu_uid");
  sessionStorage.removeItem("sikadu_username");
  sessionStorage.removeItem("sikadu_nama");
  sessionStorage.removeItem("sikadu_level");
  goTo("/login.html");
}
