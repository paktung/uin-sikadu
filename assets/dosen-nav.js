// assets/dosen-nav.js
export const DOSEN_NAV = [
  { href: "dashboard.html", label: "Dashboard" },
  { href: "peserta.html", label: "Peserta Kelas" },
  { href: "materi.html", label: "Materi" },
  { href: "tugas.html", label: "Tugas" },
  { href: "presensi.html", label: "Presensi" },
  { href: "nilai.html", label: "Nilai" },
];

export function renderDosenNav(activeHref) {
  const nav = document.getElementById("sidebarNav");
  if (!nav) return;
  nav.innerHTML = DOSEN_NAV.map(
    (item) => `<a href="${item.href}"${item.href === activeHref ? ' class="active"' : ""}>${item.label}</a>`
  ).join("");
}
