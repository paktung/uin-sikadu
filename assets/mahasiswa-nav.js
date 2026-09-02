// assets/mahasiswa-nav.js
export const MAHASISWA_NAV = [
  { href: "dashboard.html", label: "Dashboard" },
  { href: "krs.html", label: "Kelas Saya" },
  { href: "materi.html", label: "Materi" },
  { href: "presensi.html", label: "Presensi" },
];

export function renderMahasiswaNav(activeHref) {
  const nav = document.getElementById("sidebarNav");
  if (!nav) return;
  nav.innerHTML = MAHASISWA_NAV.map(
    (item) => `<a href="${item.href}"${item.href === activeHref ? ' class="active"' : ""}>${item.label}</a>`
  ).join("");
}
