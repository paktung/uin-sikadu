// assets/auth-guard.js
// Dipakai di setiap halaman terproteksi (admin/*, dosen/*, mahasiswa/*).
//
// Pemakaian:
//   import { guardPage, logout } from "../assets/auth-guard.js";
//   const { user, profile } = await guardPage("admin");
//
// guardPage akan:
//   1. Menunggu status login Firebase Auth.
//   2. Kalau belum login -> redirect ke /login.html
//   3. Ambil dokumen users/{uid} dari Firestore.
//   4. Kalau akun dinonaktifkan (isActive === false) -> sign out + redirect.
//   5. Kalau level user tidak cocok dengan halaman ini -> redirect ke
//      dashboard yang sesuai levelnya (bukan langsung ke login), supaya
//      dosen yang salah buka folder admin diarahkan ke dashboard dosen.

import { auth, db, ROLE_HOME } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export function guardPage(expectedRole) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login.html";
        return;
      }

      let snap;
      try {
        snap = await getDoc(doc(db, "users", user.uid));
      } catch (err) {
        console.error("Gagal membaca profil user:", err);
        window.location.href = "/login.html";
        return;
      }

      if (!snap.exists()) {
        // Akun Auth ada tapi tidak ada profil di Firestore - data tidak konsisten.
        await signOut(auth);
        window.location.href = "/login.html?error=no-profile";
        return;
      }

      const profile = snap.data();

      if (profile.isActive === false) {
        await signOut(auth);
        window.location.href = "/login.html?error=inactive";
        return;
      }

      if (profile.level !== expectedRole) {
        window.location.href = ROLE_HOME[profile.level] || "/login.html";
        return;
      }

      resolve({ user, uid: user.uid, profile });
    });
  });
}

export async function logout() {
  await signOut(auth);
  window.location.href = "/login.html";
}
