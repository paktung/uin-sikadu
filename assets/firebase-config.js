// assets/firebase-config.js
// Satu-satunya tempat konfigurasi Firebase didefinisikan.
// Semua halaman (index, login, admin/*, dosen/*, mahasiswa/*) import dari sini
// supaya kalau project Firebase berubah, cukup diedit di satu file.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCFtcNow9EGQlxhoX6jJKM97v40y1DdUjA",
  authDomain: "uin-sikadu.firebaseapp.com",
  databaseURL: "https://uin-sikadu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uin-sikadu",
  storageBucket: "uin-sikadu.firebasestorage.app",
  messagingSenderId: "58411098315",
  appId: "1:58411098315:web:f6092b636caa482872bb4e",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Cloud Functions dipakai untuk operasi yang TIDAK BISA dilakukan client
// SDK biasa - saat ini hanya untuk admin mereset password user lain
// (lihat /functions/index.js). Region default us-central1, sesuaikan
// getFunctions(app, "region") kalau function di-deploy ke region lain.
export const functionsInstance = getFunctions(app);

// Domain palsu dipakai untuk mengubah NIM/NIDN/username jadi format email,
// karena Firebase Auth (mode email/password) mewajibkan email.
export const EMAIL_DOMAIN = "@sikadu.local";
export const usernameToEmail = (username) => `${username.trim()}${EMAIL_DOMAIN}`;

// Halaman dashboard tujuan untuk tiap level user (path absolut dari domain root).
export const ROLE_HOME = {
  admin: "/admin/dashboard.html",
  dosen: "/dosen/dashboard.html",
  mahasiswa: "/mahasiswa/dashboard.html",
};

// Level di Firestore kadang ketikannya tidak konsisten ("Admin", " admin ",
// dst). Selalu normalisasi sebelum dipakai untuk pengecekan/redirect.
export const normalizeLevel = (level) => String(level || "").trim().toLowerCase();

// Redirect pakai window.location.origin (bukan path relatif yang di-strip
// manual) supaya tetap benar dari halaman manapun (root, /admin/, /dosen/,
// dst), selama aplikasi di-deploy di ROOT domain/hosting (bukan subfolder).
export function goToRoleHome(level) {
  const path = ROLE_HOME[normalizeLevel(level)];
  window.location.href = path ? window.location.origin + path : window.location.origin + "/login.html";
}
