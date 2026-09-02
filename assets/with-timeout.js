// assets/with-timeout.js
// Membungkus Promise Firestore supaya tidak pernah "macet" selamanya kalau
// request gantung (network bermasalah, ad-blocker/VPN memblokir domain
// Firestore, dsb). Firestore SDK sendiri kadang butuh waktu sangat lama
// untuk retry/backoff sebelum akhirnya reject, jadi kita paksa batas waktu
// sendiri di sisi UI.

export function withTimeout(promise, ms = 15000, label = "Operasi") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(
          `${label} melebihi batas waktu (${Math.round(ms / 1000)} detik). ` +
          `Periksa koneksi internet, atau matikan sementara ad-blocker/VPN ` +
          `yang mungkin memblokir domain firestore.googleapis.com.`
        )),
        ms
      )
    ),
  ]);
}
