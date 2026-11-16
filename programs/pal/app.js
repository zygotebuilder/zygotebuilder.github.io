import { reply, extractTask, classifyBreak, loadLLM, llmReady, resetBrain } from './brain.js';

const $ = s => document.querySelector(s);
const log = $('#log'), inp = $('#input'), cap = $('#caption'), vid = $('#cam');
let mode = 'personal', mic = false, cam = false, speaking = false, asked = false, pending = false;
let tasks = [], rec = null, camStream = null, awaySince = null, fd = null;
const live = () => mic && cam;

function add(t, who) {
  const d = document.createElement('div');
  d.className = 'msg ' + who; d.textContent = t;
  log.append(d); log.scrollTop = log.scrollHeight; return d;
}
// Pal speaks aloud only in live mode (mic + camera) and only when not in quiet Work mode (unless forced).
function say(t, force) {
  add(t, 'pal');
  if (live() && (mode === 'personal' || force)) speak(t);
}
function speak(t) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.rate = 0.98;
  const v = speechSynthesis.getVoices().find(v => /^en/i.test(v.lang) && /natural|google|samantha|aria|jenny/i.test(v.name));
  if (v) u.voice = v;
  u.onstart = () => { speaking = true; stopRec(); };
  u.onend = u.onerror = () => { speaking = false; if (mic) startRec(); };
  speechSynthesis.speak(u);
}

async function send(text) {
  text = text.trim(); if (!text) return;
  add(text, 'user');
  if (asked) {
    const k = classifyBreak(text);
    if (k) {
      asked = false;
      return say(k === 'proc'
        ? "Thanks for being honest, that's the hard part. Pick the tiniest next step, two minutes of it counts. What is it?"
        : "Good, you've earned it. I'll keep the music going and stay quiet. Tell me when you're back.", true);
    }
  }
  let note = '';
  const t = extractTask(text, mode);
  if (t && !tasks.some(x => x.t.toLowerCase() === t.toLowerCase())) {
    tasks.push({ id: Date.now(), t, d: false }); renderTasks(); note = `Added to your list: "${t}". `;
  }
  const typing = add('…', 'pal typing');
  const r = await reply(text, mode).catch(() => null);
  typing.remove();
  say(note + (r || "I'm here. Say that again?"));
}
$('#f').onsubmit = e => { e.preventDefault(); const v = inp.value; inp.value = ''; send(v); };

// ---------- microphone / live transcription ----------
function startRec() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { add('This browser has no speech recognition. Try Chrome or Edge.', 'system'); return setMic(false); }
  if (rec || speaking || !mic) return;
  rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || 'en-US';
  rec.onresult = e => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) { cap.textContent = ''; send(r[0].transcript); } else interim += r[0].transcript;
    }
    if (interim) cap.textContent = '🎙 ' + interim;
  };
  rec.onend = () => { rec = null; if (mic && !speaking) setTimeout(startRec, 300); };
  rec.onerror = e => { if (/not-allowed|service-not-allowed/.test(e.error)) { add('Microphone permission was blocked.', 'system'); setMic(false); } };
  try { rec.start(); } catch { }
}
function stopRec() { if (rec) { const r = rec; rec = null; r.onend = null; try { r.abort(); } catch { } } }
function setMic(on) {
  mic = on; $('#bMic').classList.toggle('on', on);
  if (on) startRec(); else { stopRec(); cap.textContent = ''; }
  updateLive();
}
function updateLive() {
  document.body.classList.toggle('live', live());
  if (!live()) speechSynthesis.cancel();
  else add('— Live: mic and camera on, Pal will talk —', 'system');
}

// ---------- camera (preview only; frames never recorded or sent) ----------
async function setCam(on) {
  if (!on) { camStream?.getTracks().forEach(t => t.stop()); camStream = null; vid.hidden = true; vid.srcObject = null; cam = false; }
  else {
    try { camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); vid.srcObject = camStream; await vid.play(); vid.hidden = false; cam = true; }
    catch { add('Camera permission was blocked or unavailable.', 'system'); cam = false; }
  }
  $('#bCam').classList.toggle('on', cam); updateLive();
}

// ---------- background music (generated in-browser) ----------
let ac = null, master = null, nodes = [];
function music(on) {
  $('#bMusic').classList.toggle('on', on);
  if (!on) {
    if (!ac) return;
    master.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2);
    const c = ac, n = nodes; ac = null; nodes = [];
    setTimeout(() => { n.forEach(o => { try { o.stop(); } catch { } }); c.close(); }, 1300); return;
  }
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800; lp.connect(master);
  const dl = ac.createDelay(); dl.delayTime.value = 0.4; const fb = ac.createGain(); fb.gain.value = 0.3;
  dl.connect(fb); fb.connect(dl); dl.connect(master);
  [65.41, 98, 130.81, 196, 261.63].forEach((f, i) => [1, 1.004].forEach(d => {
    const o = ac.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f * d;
    const g = ac.createGain(); g.gain.value = 0.16 / (i + 1);
    o.connect(g); g.connect(lp); g.connect(dl); o.start(); nodes.push(o);
  }));
  const l = ac.createOscillator(); l.frequency.value = 0.05; const lg = ac.createGain(); lg.gain.value = 250;
  l.connect(lg); lg.connect(lp.frequency); l.start(); nodes.push(l);
  master.gain.linearRampToValueAtTime(0.07, ac.currentTime + 2.5);
}

// ---------- 5-minute "break or procrastinating?" check (Work mode only) ----------
// "Away" = tab hidden, or (if the browser supports FaceDetector and camera is on) no face in view.
function ask() { asked = true; say('Are you taking a break or procrastinating?', true); }
setInterval(async () => {
  if (mode !== 'required' || asked) { awaySince = null; pending = false; return; }
  let away = document.hidden;
  if (!away && cam && 'FaceDetector' in window && vid.readyState >= 2) {
    try { fd = fd || new FaceDetector({ fastMode: true }); away = (await fd.detect(vid)).length === 0; } catch { }
  }
  if (away) { awaySince = awaySince || Date.now(); if (Date.now() - awaySince > 300000) pending = true; }
  else { awaySince = null; if (pending) { pending = false; ask(); } }
}, 5000);

// ---------- smart brain (optional on-device LLM) ----------
$('#bBrain').onclick = async () => {
  if (llmReady()) return add('Smart brain is already on.', 'system');
  const s = add('Downloading on-device brain (~700 MB, cached after the first time)…', 'system');
  try { await loadLLM(t => { s.textContent = t; }); $('#bBrain').classList.add('on'); s.textContent = 'Smart brain on. It runs entirely on your device.'; }
  catch (e) { s.textContent = 'Smart brain unavailable: ' + e.message + '. Pal keeps using its built-in brain.'; }
};

// ---------- tasks (memory only) ----------
function renderTasks() {
  const box = $('#tasks'); box.textContent = '';
  tasks.forEach(k => {
    const r = document.createElement('div'); r.className = 'task' + (k.d ? ' d' : '');
    const c = document.createElement('input'); c.type = 'checkbox'; c.checked = k.d;
    c.onchange = () => { k.d = c.checked; renderTasks(); if (k.d) say(tasks.every(x => x.d) ? "That's the whole list cleared. Take the win." : 'Nice, one less thing.'); };
    const s = document.createElement('span'); s.textContent = k.t;
    const x = document.createElement('button'); x.textContent = '×'; x.onclick = () => { tasks = tasks.filter(y => y !== k); renderTasks(); };
    r.append(c, s, x); box.append(r);
  });
  $('#badge').textContent = tasks.filter(t => !t.d).length;
}

// ---------- mode & wiring ----------
const GREET = { personal: "Hey, it's Pal. Whatever's going on, I'm here. What's up?", required: "On the clock. I'll keep the music going and stay quiet. Shout if you need me." };
$('#sw').onclick = () => {
  mode = mode === 'personal' ? 'required' : 'personal'; asked = false; pending = false; awaySince = null;
  document.body.classList.remove('personal', 'required'); document.body.classList.add(mode);
  $('#sub').textContent = mode === 'personal' ? 'personal · off the clock' : 'required · on the clock';
  add(mode === 'personal' ? '— PERSONAL —' : '— WORK —', 'system');
  music(mode === 'required');
  if (mode === 'required') speechSynthesis.cancel();
  say(GREET[mode]);
};
$('#bMic').onclick = () => setMic(!mic);
$('#bCam').onclick = () => setCam(!cam);
$('#bMusic').onclick = () => music(!ac);
$('#bTasks').onclick = () => $('#drawer').classList.add('open');
$('#bClose').onclick = () => $('#drawer').classList.remove('open');
$('#bReset').onclick = () => { if (!confirm('Clear this conversation?')) return; log.textContent = ''; resetBrain(); asked = false; say(GREET[mode]); };
window.addEventListener('pagehide', () => { camStream?.getTracks().forEach(t => t.stop()); });
renderTasks(); say(GREET.personal);
