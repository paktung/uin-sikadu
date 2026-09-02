// assets/create-auth-user.js
//
// Masalah: memanggil createUserWithEmailAndPassword() dengan instance auth
// utama akan otomatis MENG-GANTI sesi login yang sedang aktif (admin akan
// ter-login sebagai user baru itu, bukan tetap sebagai admin).
//
// Solusi umum tanpa backend (tanpa Cloud Functions/Admin SDK): buat instance
// Firebase App kedua yang terpisah khusus untuk mendaftarkan akun baru,
// lalu langsung dibuang. Sesi admin di app utama tidak tersentuh.
//
// Catatan penting: ini tetap berjalan di sisi client, jadi secara teknis
// siapa pun yang punya akses ke halaman admin (setelah lolos auth-guard)
// bisa memanggil ini. Untuk produksi yang lebih aman, pindahkan pembuatan
// akun ke Cloud Function yang dipanggil admin (pakai Admin SDK di server),
// supaya password sementara dsb tidak pernah lewat client secara langsung
// dan supaya penghapusan akun Auth juga bisa dilakukan (client SDK tidak
// bisa menghapus akun Auth user lain).

import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

export async function createAuthUser(email, password) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = credential.user.uid;
    await signOut(secondaryAuth);
    return uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}

// Versi batch: satu instance app kedua dipakai berulang untuk banyak akun
// sekaligus (mis. import Excel puluhan mahasiswa), supaya tidak bikin+buang
// app baru di setiap baris (lebih cepat & lebih ringan).
//
// Pemakaian:
//   const batch = createAuthUserBatch();
//   try {
//     const uid1 = await batch.create(email1, password1);
//     const uid2 = await batch.create(email2, password2);
//   } finally {
//     await batch.dispose();
//   }
export function createAuthUserBatch() {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-batch-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  return {
    async create(email, password) {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = credential.user.uid;
      await signOut(secondaryAuth);
      return uid;
    },
    async dispose() {
      await deleteApp(secondaryApp);
    },
  };
}
