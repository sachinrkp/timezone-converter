// Elements
const sourceZone = document.getElementById('sourceZone');
const targetZone = document.getElementById('targetZone');
const sourceSearch = document.getElementById('sourceSearch');
const targetSearch = document.getElementById('targetSearch');
const form = document.getElementById('converterForm');
const result = document.getElementById('result');
const currentTimes = document.getElementById('currentTimes');
const dstStatus = document.getElementById('dstStatus');
const sourceSlider = document.getElementById('sourceSlider');
const targetSlider = document.getElementById('targetSlider');
const sourceTimeLabel = document.getElementById('sourceTimeLabel');
const targetTimeLabel = document.getElementById('targetTimeLabel');
const hourDifference = document.getElementById('hourDifference');
const darkToggle = document.getElementById('darkToggle');
const swapZones = document.getElementById('swapZones');

let allZones = [];
let inputUtcMs = null;
let diffMinutesAtInput = 0;
let fromZoneGlobal = '';
let toZoneGlobal = '';

// ---------- Dark Mode ----------
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
    darkToggle.textContent = 'Dark Mode: ON';
  } else {
    document.documentElement.classList.remove('dark');
    darkToggle.textContent = 'Dark Mode: OFF';
  }
})();

darkToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  darkToggle.textContent = isDark ? 'Dark Mode: ON' : 'Dark Mode: OFF';
});

// ---------- Swap Timezones ----------
swapZones.addEventListener('click', () => {
  const tmp = sourceZone.value;
  sourceZone.value = targetZone.value;
  targetZone.value = tmp;
});

// ---------- Fetch Timezones ----------
fetch('/api/timezones')
  .then(res => res.json())
  .then(data => {
    allZones = data.zones || [];
    populateDropdown(sourceZone, allZones);
    populateDropdown(targetZone, allZones);
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (allZones.includes(userZone)) sourceZone.value = userZone;
  });

function populateDropdown(select, zones) {
  select.innerHTML = '';
  zones.forEach(zone => {
    const opt = new Option(zone, zone);
    select.add(opt);
  });
}

function filterDropdown(searchInput, dropdown) {
  const term = searchInput.value.toLowerCase();
  Array.from(dropdown.options).forEach(opt => {
    opt.style.display = opt.value.toLowerCase().includes(term) ? 'block' : 'none';
  });
}
sourceSearch.addEventListener('input', () => filterDropdown(sourceSearch, sourceZone));
targetSearch.addEventListener('input', () => filterDropdown(targetSearch, targetZone));

// ---------- Time Helpers ----------
function two(n) { return n.toString().padStart(2, '0'); }

function formatLocal(utcMs, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  return fmt.format(new Date(utcMs)).replace(',', '');
}

function getHM(utcMs, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date(utcMs));
  const map = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  return { h: parseInt(map.hour, 10), m: parseInt(map.minute, 10) };
}

function tzOffsetMinutes(utcMs, timeZone) {
  const d = new Date(utcMs);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).formatToParts(d);
  const map = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const asUTC = Date.UTC(
    parseInt(map.year, 10),
    parseInt(map.month, 10) - 1,
    parseInt(map.day, 10),
    parseInt(map.hour, 10),
    parseInt(map.minute, 10),
    parseInt(map.second, 10)
  );
  return (asUTC - utcMs) / 60000;
}

function wallTimeToUtcMs(year, month, day, hour, minute, timeZone) {
  let guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let offset1 = tzOffsetMinutes(guess, timeZone);
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset1 * 60000;
  let offset2 = tzOffsetMinutes(utc, timeZone);
  if (offset2 !== offset1) {
    utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset2 * 60000;
  }
  return utc;
}

// ---------- Form Submit ----------
form.addEventListener('submit', (e) => {
  e.preventDefault();

  fromZoneGlobal = sourceZone.value;
  toZoneGlobal = targetZone.value;
  const dateStr = document.getElementById('date').value;
  const timeStr = document.getElementById('time').value;

  const [y, mo, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);

  inputUtcMs = wallTimeToUtcMs(y, mo, d, hh, mm, fromZoneGlobal);

  const fromOff = tzOffsetMinutes(inputUtcMs, fromZoneGlobal);
  const toOff = tzOffsetMinutes(inputUtcMs, toZoneGlobal);
  diffMinutesAtInput = toOff - fromOff;

  result.innerHTML = `
    <div>🕒 <strong>Input Time</strong> (${fromZoneGlobal}): ${formatLocal(inputUtcMs, fromZoneGlobal)}</div>
    <div>➡️ <strong>Converted Time</strong> (${toZoneGlobal}): ${formatLocal(inputUtcMs, toZoneGlobal)}</div>
  `;

  const now = Date.now();
  currentTimes.innerHTML = `
    <div>🕓 <em>Live Clock</em> (${fromZoneGlobal}): ${formatLocal(now, fromZoneGlobal)}</div>
    <div>🕓 <em>Live Clock</em> (${toZoneGlobal}): ${formatLocal(now, toZoneGlobal)}</div>
  `;

  const dstActiveNow = tzOffsetMinutes(inputUtcMs, toZoneGlobal) !== Math.max(
    tzOffsetMinutes(Date.UTC(y, 0, 1, 12, 0, 0), toZoneGlobal),
    tzOffsetMinutes(Date.UTC(y, 6, 1, 12, 0, 0), toZoneGlobal)
  );
  dstStatus.textContent = dstActiveNow ? 'Daylight Saving Active ✅' : 'Daylight Saving Inactive ❌';

  initSliders();
});

// ---------- Sliders ----------
function minutesSinceMidnight(utcMs, timeZone) {
  const { h, m } = getHM(utcMs, timeZone);
  return h * 60 + m;
}

function initSliders() {
  // Range: -1440 to +1440 minutes relative to input time
  sourceSlider.min = -1440;
  sourceSlider.max = 1440;
  targetSlider.min = -1440;
  targetSlider.max = 1440;

  // Start both sliders at 0 (the exact input instant)
  sourceSlider.value = 0;
  targetSlider.value = 0;

  updateSliderLabels(0, 0);

  sourceSlider.disabled = false;
  targetSlider.disabled = false;

  // Bind events so moving one slider updates the other
  sourceSlider.addEventListener('input', () => {
    const srcOffsetMinutes = parseInt(sourceSlider.value, 10);
    const tgtOffsetMinutes = srcOffsetMinutes + diffMinutesAtInput;

    updateSliderLabels(srcOffsetMinutes, tgtOffsetMinutes);
    targetSlider.value = tgtOffsetMinutes;
  });

  targetSlider.addEventListener('input', () => {
    const tgtOffsetMinutes = parseInt(targetSlider.value, 10);
    const srcOffsetMinutes = tgtOffsetMinutes - diffMinutesAtInput;

    updateSliderLabels(srcOffsetMinutes, tgtOffsetMinutes);
    sourceSlider.value = srcOffsetMinutes;
  });
}

// Update the labels above sliders with full date + time
function updateSliderLabels(srcOffsetMinutes, tgtOffsetMinutes) {
  const srcUtc = inputUtcMs + srcOffsetMinutes * 60000;
  const tgtUtc = inputUtcMs + tgtOffsetMinutes * 60000;

  sourceTimeLabel.textContent = `Selected Time (${fromZoneGlobal}): ${formatLocal(srcUtc, fromZoneGlobal)}`;
  targetTimeLabel.textContent = `Converted Time (${toZoneGlobal}): ${formatLocal(tgtUtc, toZoneGlobal)}`;

  // Also update hour difference display based on current slider positions
  const srcOff = tzOffsetMinutes(srcUtc, fromZoneGlobal);
  const tgtOff = tzOffsetMinutes(tgtUtc, toZoneGlobal);
  const diffHours = ((tgtOff - srcOff) / 60).toFixed(2);
  hourDifference.textContent = `🕓 Time Difference: ${diffHours} hours`;
}
