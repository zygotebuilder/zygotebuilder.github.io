(() => {
const $ = s => document.querySelector(s), E = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.textContent = h; return e; };
const LS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
let words = [], dict = new Map(), shared = [], mine = LS('zd_mine', []), st = LS('zd_state', { xp: 0, streak: 0, last: '', badges: [] });
let picked = [], page = 0, view = [], PER = 25;
const key = w => w.trim().toLowerCase();
const coined = () => new Map([...shared, ...mine].map(c => [key(c.word), c]));

// ---------- load ----------
Promise.all([fetch('data/words.json').then(r => r.json()), fetch('data/community.json').then(r => r.json()).catch(() => [])]).then(([w, c]) => {
  words = w; dict = new Map(w); shared = c; view = words; renderAll();
}).catch(() => { $('#list').append(E('li', '', 'Could not load data/words.json — serve the folder over http (see README).')); });

// ---------- tabs ----------
document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.tab,.view').forEach(e => e.classList.remove('on'));
  t.classList.add('on'); $('#' + t.dataset.v).classList.add('on');
});

// ---------- library ----------
function entry(w, m, tag, by) {
  const li = E('li'), b = E('b', '', w); li.append(b);
  if (tag) li.append(E('span', 'tag', tag));
  if (by) li.append(E('small', '', by));
  li.append(E('p', '', m)); return li;
}
function renderLib() {
  const n = Math.max(1, Math.ceil(view.length / PER)); page = Math.min(page, n - 1);
  const ul = $('#list'); ul.replaceChildren();
  view.slice(page * PER, page * PER + PER).forEach(([w, m]) => ul.append(entry(w, m)));
  if (!view.length) ul.append(E('li', '', 'No match. Maybe it is a word waiting to be coined — try the Word Forge.'));
  $('#pg').textContent = `Page ${page + 1} of ${n}`; $('#prog').style.width = ((page + 1) / n * 100) + '%';
}
function search() {
  const q = key($('#q').value); page = 0;
  if (!q) view = words;
  else { const a = [], b = []; for (const e of words) { if (e[0].startsWith(q)) a.push(e); else if (e[0].includes(q)) b.push(e); if (a.length + b.length > 400) break; } view = a.concat(b); }
  renderLib();
}
$('#q').oninput = search;
$('#prev').onclick = () => { page = Math.max(0, page - 1); renderLib(); scrollTo(0, 0); };
$('#next').onclick = () => { page++; renderLib(); scrollTo(0, 0); };
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(l => { const b = E('button', '', l.toUpperCase()); b.onclick = () => { $('#q').value = ''; view = words; page = Math.floor(words.findIndex(e => e[0] >= l) / PER); renderLib(); }; $('#az').append(b); });

// ---------- coined lists ----------
function renderCoined() {
  const all = [...mine.map(c => ({ ...c, own: 1 })), ...shared].sort((a, b) => (b.t || 0) - (a.t || 0));
  const nl = $('#nl'); nl.replaceChildren();
  all.forEach(c => nl.append(entry(c.word, c.meaning, c.own ? 'yours' : 'new', c.by ? 'by ' + c.by : '')));
  if (!all.length) nl.append(E('li', '', 'Nothing here yet. Be the first to coin a word.'));
  const ml = $('#ml'); ml.replaceChildren();
  mine.forEach(c => ml.append(entry(c.word, c.meaning, '', `built from ${c.parts.join(' + ')}`)));
  if (!mine.length) ml.append(E('li', '', 'Your coined words will live here.'));
  $('#nc').textContent = all.length; $('#mc').textContent = mine.length;
}
$('#exp').onclick = async () => { const t = JSON.stringify(mine, null, 2); try { await navigator.clipboard.writeText(t); flash('Copied. Add it to data/community.json via pull request to share it.', 'ok'); } catch { prompt('Copy:', t); } };

// ---------- forge ----------
const V = /[aeiouy]/;
function fuse(a, b) {
  const out = new Set(); out.add(a + b);
  for (let k = Math.min(a.length, b.length) - 1; k >= 2; k--) if (a.endsWith(b.slice(0, k))) { out.add(a + b.slice(k)); break; }
  out.add(a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2)));
  out.add(a.slice(0, -1) + b);
  let i = a.length - 1; while (i > 0 && !V.test(a[i])) i--; while (i > 0 && V.test(a[i - 1])) i--;
  if (i > 1) out.add(a.slice(0, i) + b);
  let j = b.search(V); if (j > 0) out.add(a + b.slice(j));
  return [...out].filter(w => w.length >= 3 && w.length <= 24);
}
function candidates() {
  if (picked.length < 2) return [];
  let cur = fuse(picked[0], picked[1]);
  for (let i = 2; i < picked.length; i++) cur = [...new Set(cur.flatMap(c => fuse(c, picked[i]).slice(0, 3)))];
  return cur.slice(0, 8);
}
function renderForge() {
  const t = $('#tiles'); t.replaceChildren();
  picked.forEach((w, i) => { if (i) t.append(E('span', 'plus', '+')); const b = E('button', 'tile', w); b.onclick = () => { picked.splice(i, 1); renderForge(); }; t.append(b); });
  if (!picked.length) t.append(E('span', 'hint', 'No words yet — add one, or roll the dice.'));
  const c = $('#cands'); c.replaceChildren();
  const cs = candidates();
  cs.forEach(w => { const b = E('button', '', w); b.onclick = () => { $('#nw').value = w; $('#nw').classList.remove('fused'); void $('#nw').offsetWidth; $('#nw').classList.add('fused'); updScore(); }; c.append(b); });
  if (cs.length && !$('#nw').value) $('#nw').value = cs[0];
  updScore();
}
function scoreOf(w) {
  if (!w || picked.length < 2) return 0;
  const hits = picked.filter(p => w.includes(p.slice(0, 2)) || w.includes(p.slice(-2))).length;
  return picked.length * 10 + Math.min(w.length, 14) * 2 + hits * 5 + (V.test(w) ? 5 : 0);
}
function updScore() { const s = scoreOf(key($('#nw').value)); $('#score').textContent = s ? `+${s} XP` : ''; }
$('#nw').oninput = updScore;
function addWord(w) {
  w = key(w);
  if (!dict.has(w)) return flash(`"${w}" isn't in the dictionary. Use real words as ingredients.`, 'bad');
  if (picked.length >= 5) return flash('Five ingredients is the limit.', 'bad');
  picked.push(w); $('#nw').value = ''; $('#wi').value = ''; flash(''); renderForge();
}
$('#add').onclick = () => addWord($('#wi').value);
$('#wi').onkeydown = e => { if (e.key === 'Enter') addWord($('#wi').value); };
const pool = () => words.filter(e => e[0].length >= 3 && e[0].length <= 6);
$('#dice').onclick = () => { const p = pool(); picked = [0, 0].map(() => p[Math.random() * p.length | 0][0]); $('#nw').value = ''; renderForge(); };
$('#daily').onclick = () => { const d = new Date(), s = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(), p = pool(); picked = [p[(s * 7919) % p.length][0], p[(s * 104729) % p.length][0]]; $('#nw').value = ''; renderForge(); flash("Today's pair is the same for everyone. Make something great.", 'ok'); };
function flash(t, c) { const m = $('#msg'); m.textContent = t; m.className = 'msg ' + (c || ''); }

$('#pub').onclick = () => {
  const w = key($('#nw').value), m = $('#nm').value.trim();
  if (picked.length < 2) return flash('Add at least two words to fuse.', 'bad');
  if (!/^[a-z]{3,24}$/.test(w)) return flash('A word needs 3–24 letters, a–z only.', 'bad');
  if (dict.has(w)) return flash("That's already a dictionary word. Try something creative.", 'bad');
  if (coined().has(w)) return flash('Word already constructed. Try something creative.', 'bad');
  if (m.length < 8) return flash('Give it a meaning of at least 8 characters.', 'bad');
  const xp = scoreOf(w);
  mine.unshift({ word: w, meaning: m, parts: [...picked], t: Date.now(), by: 'you' }); save('zd_mine', mine);
  award(xp); burst(w); flash(`"${w}" is published. +${xp} XP`, 'ok');
  picked = []; $('#nw').value = ''; $('#nm').value = ''; renderForge(); renderCoined();
};

// ---------- progress ----------
function award(xp) {
  const today = new Date().toDateString(), y = new Date(Date.now() - 864e5).toDateString();
  st.streak = st.last === today ? st.streak : st.last === y ? st.streak + 1 : 1; st.last = today; st.xp += xp;
  const add = b => { if (!st.badges.includes(b)) { st.badges.push(b); flash(`Badge unlocked: ${b}`, 'ok'); } };
  if (mine.length >= 1) add('First Coin'); if (picked.length >= 3) add('Triple Fusion'); if (mine.length >= 5) add('Wordsmith'); if (st.streak >= 3) add('On a Roll');
  save('zd_state', st); renderStats();
}
function renderStats() {
  $('#lvl').textContent = 'Lv ' + (Math.floor(st.xp / 100) + 1); $('#xpbar').style.width = (st.xp % 100) + '%';
  $('#streak').textContent = st.streak ? `🔥 ${st.streak}d` : '';
}
function renderAll() { renderLib(); renderCoined(); renderForge(); renderStats(); }

// ---------- letter burst ----------
const cv = $('#fx'), cx = cv.getContext('2d'); let ps = [];
function size() { cv.width = innerWidth; cv.height = innerHeight; } size(); addEventListener('resize', size);
function burst(w) {
  const cols = ['#5b3df5', '#19c58f', '#ffb020', '#ff5d8f'];
  for (let i = 0; i < 70; i++) ps.push({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - .5) * 12, vy: Math.random() * -11 - 2, c: w[i % w.length].toUpperCase(), col: cols[i % 4], a: 1, r: Math.random() * 6 });
  if (ps.length === 70) loop();
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35; p.a -= .012; cx.globalAlpha = Math.max(p.a, 0); cx.fillStyle = p.col; cx.font = '700 22px Space Grotesk,sans-serif'; cx.fillText(p.c, p.x, p.y); });
  ps = ps.filter(p => p.a > 0); if (ps.length) requestAnimationFrame(loop); else cx.clearRect(0, 0, cv.width, cv.height);
}
if (matchMedia('(prefers-reduced-motion:reduce)').matches) window.burst = () => {};
})();
