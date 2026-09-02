// assets/admin-nav.js
// Satu sumber untuk daftar menu sidebar admin. Setiap halaman admin cukup:
//   <nav class="sidebar-nav" id="sidebarNav"></nav>
// lalu panggil renderAdminNav("nama-file-ini.html") di script-nya.
// Nambah halaman baru = tambah satu baris di array ini, tidak perlu edit
// tiap file HTML satu-satu.

export const ADMIN_NAV = [
  { href: "dashboard.html", label: "Dashboard" },
  { href: "fakultas.html", label: "Fakultas" },
  { href: "program-studi.html", label: "Program Studi" },
  { href: "mata-kuliah.html", label: "Mata Kuliah" },
  { href: "tahun-akademik.html", label: "Tahun Akademik" },
  { href: "kelas-kuliah.html", label: "Kelas Kuliah" },
  { href: "dosen.html", label: "Data Dosen" },
  { href: "mahasiswa.html", label: "Data Mahasiswa" },
  { href: "pengumuman.html", label: "Pengumuman" },
];

export function renderAdminNav(activeHref) {
  const nav = document.getElementById("sidebarNav");
  if (!nav) return;
  nav.innerHTML = ADMIN_NAV.map(
    (item) => `<a href="${item.href}"${item.href === activeHref ? ' class="active"' : ""}>${item.label}</a>`
  ).join("");
}
