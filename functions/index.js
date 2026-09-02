// functions/index.js
//
// Satu-satunya cara yang SAH untuk mengubah password akun ORANG LAIN di
// Firebase Auth adalah lewat Admin SDK di server - client SDK di browser
// sengaja tidak mengizinkan ini (alasan keamanan). Makanya fitur "admin
// reset password" butuh Cloud Function kecil ini, di-deploy terpisah dari
// hosting statis (Vercel).

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.resetUserPassword = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError("unauthenticated", "Anda harus login.");
  }

  // Verifikasi pemanggil memang admin aktif (cek Firestore, bukan percaya
  // begitu saja klaim dari client).
  const callerDoc = await getFirestore().collection("users").doc(callerUid).get();
  const callerData = callerDoc.data();
  if (!callerDoc.exists || callerData.level !== "admin" || callerData.isActive !== true) {
    throw new HttpsError("permission-denied", "Hanya admin aktif yang boleh reset password.");
  }

  const { targetUid, newPassword } = request.data || {};
  if (!targetUid || typeof targetUid !== "string") {
    throw new HttpsError("invalid-argument", "targetUid wajib diisi.");
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    throw new HttpsError("invalid-argument", "newPassword wajib diisi, minimal 6 karakter.");
  }

  await getAuth().updateUser(targetUid, { password: newPassword });

  return { success: true };
});
