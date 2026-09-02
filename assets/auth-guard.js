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

export function guardPage(expectedRole) {
  return new Promise((resolve) => {
    // Kalau Firebase Auth belum juga memberi status setelah 8 detik (koneksi
    // lambat, domain belum di-authorize di Firebase Console, dsb), beri tahu
    // pengguna lewat elemen #sidebarUser (dipakai di semua halaman dashboard)
    // alih-alih membiarkan tulisan "Memuat..." diam selamanya.
    let resolved = false;
    setTimeout(() => {
      if (resolved) return;
      const el = document.getElementById("sidebarUser");
      if (el) {
        el.textContent = "Gagal memuat sesi. Periksa koneksi / domain di Firebase Console.";
      }
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
        goTo("/login.html?error=firestore");
        return;
      }

      if (!snap.exists()) {
        // Akun Auth ada tapi tidak ada profil di Firestore - data tidak konsisten.
        console.error("Dokumen users/" + user.uid + " tidak ditemukan di Firestore.");
        await signOut(auth);
        goTo("/login.html?error=no-profile");
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
  await signOut(auth);
  sessionStorage.removeItem("sikadu_uid");
  sessionStorage.removeItem("sikadu_username");
  sessionStorage.removeItem("sikadu_nama");
  sessionStorage.removeItem("sikadu_level");
  goTo("/login.html");
}
