// assets/firebase-config.js
// Satu-satunya tempat konfigurasi Firebase didefinisikan.
// Semua halaman (index, login, admin/*, dosen/*, mahasiswa/*) import dari sini
// supaya kalau project Firebase berubah, cukup diedit di satu file.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

// Domain palsu dipakai untuk mengubah NIM/NIDN/username jadi format email,
// karena Firebase Auth (mode email/password) mewajibkan email.
export const EMAIL_DOMAIN = "@sikadu.local";
export const usernameToEmail = (username) => `${username.trim()}${EMAIL_DOMAIN}`;

// Halaman dashboard tujuan untuk tiap level user.
export const ROLE_HOME = {
  admin: "/admin/dashboard.html",
  dosen: "/dosen/dashboard.html",
  mahasiswa: "/mahasiswa/dashboard.html",
};
