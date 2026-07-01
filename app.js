const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = 'ember-focus-data-v1';
const defaults = { streak: 0, best: 0, sessions: 0, minutes: 0, completedDates: [], lastCompleted: null, sound: true };
let data = { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let timerId = null;
let running = false;

const localDate = (date = new Date()) => {
  const y = date.getFullYear(); const m = String(date.getMonth()+1).padStart(2,'0'); const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const dayDiff = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);

function normalizeStreak() {
  if (data.lastCompleted && dayDiff(data.lastCompleted, localDate()) > 1) data.streak = 0;
}
function formatTime(seconds) { return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
function renderTimer() {
  $('#timeDisplay').textContent = formatTime(remainingSeconds);
  const circumference = 2 * Math.PI * 125;
  $('#ringProgress').style.strokeDashoffset = circumference * (1 - remainingSeconds / totalSeconds);
  document.title = `${formatTime(remainingSeconds)} — Ember`;
}
function renderStats() {
  normalizeStreak();
  $('#streakCount').textContent = data.streak;
  $('#bestStreak').textContent = data.best;
  $('#totalSessions').textContent = data.sessions;
  $('#focusMinutes').textContent = data.minutes;
  $('#soundButton').classList.toggle('muted', !data.sound);
  $('#soundButton').setAttribute('aria-pressed', String(data.sound));
  const doneToday = data.completedDates.includes(localDate());
  $('#encouragement').textContent = doneToday ? 'The flame is lit. Anything else today is a bonus.' : 'Complete today’s session to light the flame.';
  renderWeek(); save();
}
function renderWeek() {
  const view = $('#weekView'); view.innerHTML = '';
  const today = new Date(); const start = new Date(today); start.setDate(today.getDate() - ((today.getDay()+6)%7));
  ['M','T','W','T','F','S','S'].forEach((name,i) => {
    const date = new Date(start); date.setDate(start.getDate()+i); const key = localDate(date);
    const day = document.createElement('div'); day.className = `day${data.completedDates.includes(key)?' complete':''}${key===localDate()?' today':''}`;
    day.innerHTML = `<span class="day-name">${name}</span><span class="day-dot">${data.completedDates.includes(key)?'✓':date.getDate()}</span>`; view.appendChild(day);
  });
}
function setDuration(minutes) {
  if (running) toggleTimer(); totalSeconds = Math.round(minutes * 60); remainingSeconds = totalSeconds;
  document.querySelectorAll('.presets button').forEach(b => b.classList.toggle('active', Number(b.dataset.minutes) === minutes));
  $('#statusLabel').textContent = 'READY WHEN YOU ARE'; renderTimer();
}
function toggleTimer() {
  running = !running;
  $('#startLabel').textContent = running ? 'Pause session' : 'Resume focus'; $('#playIcon').textContent = running ? 'Ⅱ' : '▶';
  $('#statusLabel').textContent = running ? 'STAY WITH IT' : 'PAUSED';
  if (running) timerId = setInterval(tick, 1000); else { clearInterval(timerId); timerId = null; }
}
function tick() { remainingSeconds--; renderTimer(); if (remainingSeconds <= 0) completeSession(); }
function completeSession() {
  clearInterval(timerId); running = false; remainingSeconds = 0; renderTimer();
  const today = localDate(); const isFirstToday = !data.completedDates.includes(today);
  data.sessions++; data.minutes += Math.round(totalSeconds/60);
  if (isFirstToday) {
    if (!data.lastCompleted) data.streak = 1;
    else { const gap = dayDiff(data.lastCompleted, today); data.streak = gap === 1 ? data.streak + 1 : gap === 0 ? data.streak : 1; }
    data.lastCompleted = today; data.completedDates.push(today); data.best = Math.max(data.best, data.streak);
  }
  $('#startLabel').textContent = 'Begin again'; $('#playIcon').textContent = '▶'; $('#statusLabel').textContent = 'SESSION COMPLETE';
  if (data.sound) chime(); renderStats(); showToast();
}
function chime() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  [523.25,659.25,783.99].forEach((freq,i)=>{const osc=ctx.createOscillator(), gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,ctx.currentTime+i*.12);gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+i*.12+.02);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+i*.12+.5);osc.start(ctx.currentTime+i*.12);osc.stop(ctx.currentTime+i*.12+.55);});
}
function showToast(){const t=$('#toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}

$('#startButton').addEventListener('click', () => { if (remainingSeconds === 0) { remainingSeconds = totalSeconds; renderTimer(); } toggleTimer(); });
$('#resetButton').addEventListener('click', () => { if(running) toggleTimer(); remainingSeconds=totalSeconds; $('#startLabel').textContent='Begin focus'; $('#playIcon').textContent='▶'; $('#statusLabel').textContent='READY WHEN YOU ARE'; renderTimer(); });
document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => setDuration(Number(button.dataset.minutes))));
$('#customButton').addEventListener('click', () => $('#customDialog').showModal());
$('#setCustomButton').addEventListener('click', (e) => { e.preventDefault(); const value = Math.min(180,Math.max(1,Number($('#customMinutes').value)||30)); setDuration(value); $('#customDialog').close(); });
$('#soundButton').addEventListener('click', () => { data.sound=!data.sound; renderStats(); });
$('#todayLabel').textContent = new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date());
renderTimer(); renderStats();
