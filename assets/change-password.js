// assets/change-password.js
// Ganti password akun SENDIRI (admin/dosen/mahasiswa - siapa pun yang
// sedang login). Firebase Auth mewajibkan re-autentikasi (masukkan
// password lama) sebelum boleh ganti password, demi keamanan - kalau
// dilewati, updatePassword() akan gagal dengan kode
// "auth/requires-recent-login".

import { auth } from "./firebase-config.js";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export async function changeOwnPassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("Sesi tidak valid. Silakan login ulang.");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
