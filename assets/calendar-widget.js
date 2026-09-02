// assets/calendar-widget.js
// Widget kalender bulan berjalan, terinspirasi contoh desain (kalender
// hijau dengan tanggal hari ini ditandai). Murni dekoratif/informatif,
// tidak terhubung ke data akademik.

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DOW = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

export function renderCalendarWidget(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  let cells = "";
  for (let i = firstDow - 1; i >= 0; i--) {
    cells += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells += `<div class="calendar-day${d === today ? " today" : ""}">${d}</div>`;
  }
  const filled = firstDow + daysInMonth;
  const remain = (7 - (filled % 7)) % 7;
  for (let d = 1; d <= remain; d++) {
    cells += `<div class="calendar-day other-month">${d}</div>`;
  }

  el.innerHTML = `
    <div class="calendar-widget">
      <div class="calendar-header">${MONTH_NAMES[month].toUpperCase()} ${year}</div>
      <div class="calendar-grid">
        ${DOW.map((d) => `<div class="calendar-dow">${d}</div>`).join("")}
        ${cells}
      </div>
    </div>
  `;
}
