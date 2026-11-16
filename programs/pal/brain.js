// Pal brain. Runs 100% in the browser. History lives in memory only and dies with the tab.
const H = [];
const used = new Set();
let engine = null, loading = false;

const SYS = {
  personal: "You are Pal, a warm, grounded friend. Talk like a real person: 1-3 short sentences, plain words, no lists, no diagnosing, no therapy-speak, no clichés. React to the specifics of what they just said and to earlier context. Ask at most one gentle question, only if it helps. Never repeat yourself. If they mention hurting themselves, respond with care and urge them to contact a crisis line or someone nearby.",
  required: "You are Pal, a calm focus partner while the user works. Be brief (1-2 sentences), practical, never chatty. Help them find the next small step."
};

export const llmReady = () => !!engine;
export const resetBrain = () => { H.length = 0; used.clear(); };

export async function loadLLM(onProgress) {
  if (engine || loading) return;
  loading = true;
  try {
    if (!('gpu' in navigator)) throw new Error('this browser has no WebGPU (try desktop Chrome/Edge)');
    const { CreateMLCEngine } = await import('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm');
    engine = await CreateMLCEngine('Llama-3.2-1B-Instruct-q4f16_1-MLC', { initProgressCallback: p => onProgress(p.text) });
  } finally { loading = false; }
}

// ---------- helpers ----------
const pick = (a, k) => {
  let pool = a.map((_, i) => i).filter(i => !used.has(k + i));
  if (!pool.length) { a.forEach((_, i) => used.delete(k + i)); pool = a.map((_, i) => i); }
  const i = pool[Math.random() * pool.length | 0]; used.add(k + i); return a[i];
};
const MAP = { i: 'you', am: 'are', my: 'your', me: 'you', "i'm": "you're", "i've": "you've", "i'll": "you'll", myself: 'yourself', mine: 'yours', was: 'were' };
const refl = s => s.replace(/[\w']+/g, w => MAP[w.toLowerCase()] ?? w);
const reason = t => { const m = t.match(/\b(?:because|about|since|after|over)\s+(.{3,70}?)(?:[.!?,]|$)/i); return m ? refl(m[1].trim()) : null; };

const CRISIS = /\b(kill myself|suicid|end my life|hurt myself|self[- ]?harm|want to die|don'?t want to (live|be here)|better off without me)\b/i;
const CRISIS_MSG = "I'm really glad you told me, and I'm taking it seriously. I'm not the right kind of help for this, but people are. If you might act on these thoughts, please contact local emergency services now. In the US you can call or text 988 anytime; elsewhere, search \"crisis line\" plus your country. And if someone is near you, please tell them tonight. I'm still here with you.";

// ---------- tasks & break/procrastination decoding ----------
export function extractTask(t, mode) {
  const explicit = t.match(/\b(?:remind me to|don'?t let me forget to|add (?:task|to (?:my )?list)[:\-]?|todo[:\-]|note to self[:\-])\s*(.+)/i);
  const loose = mode === 'required' && t.match(/\b(?:i (?:need|have|got|gotta) to|i should|i must)\s+(?!vent|talk|rest|breathe|cry|relax|sleep)(.+)/i);
  const m = explicit || loose;
  const x = m && m[1].trim().replace(/[.!?]+$/, '');
  return x && x.length > 2 && x.length < 120 ? x : null;
}
export function classifyBreak(t) {
  const proc = /\b(procrastinat|avoid|scroll|doomscroll|distract|youtube|reels|insta|can'?t start|putting (it )?off|lazy|unmotivated|wasting)/i.test(t);
  const brk = /\b(break|rest|breather|stretch|coffee|tea|lunch|snack|eat|walk|water|nap|relax|stepped away|recharg)/i.test(t);
  if (proc && !/\b(not|n't) procrastinat/i.test(t)) return 'proc';
  return brk ? 'break' : null;
}

// ---------- local engine ----------
const E = [
  { re: /tired|exhaust|burn(t|ed)? ?out|drained|no energy|sleepy/i,
    p: ["That sounds heavy. Is it a body-needs-sleep tired, or a mind-needs-a-break tired?", "Being worn down like that makes everything harder. How long has it been going on?", "You're allowed to be tired without justifying it. What's draining you the most?"],
    r: ["Being tired because of {r} makes sense. Is that the main thing eating your energy?"] },
  { re: /anxious|anxiety|worried|nervous|on edge|panic|stress(ed)?|overwhelm|too much/i,
    p: ["That knot of worry is exhausting. What's the specific thing your mind keeps going back to?", "Okay, let's slow down. What's the one thing that feels loudest right now?", "Is it more of a racing-thoughts feeling, or more in your body?"],
    r: ["{R} sounds like it's taking up a lot of space in your head. What's the worst part of it?", "Let's look at {r} together. What's the part of it you actually have a say in?"] },
  { re: /\b(sad|down|low|upset|hurt|heartbroken|miserable|crying|cried)\b/i,
    p: ["I'm sorry, that sounds really tough. Do you know what set it off, or is it more of a fog?", "No need to explain it neatly. What does it feel like right now?", "That's allowed to be true today. Want to tell me more?"],
    r: ["That sounds painful, especially with {r}. What's been the hardest bit?"] },
  { re: /alone|lonely|isolated|no one (gets|understands|cares)/i,
    p: ["That's a hard thing to carry quietly. When did it start feeling this way?", "I'm here with you for this part. Is it that nobody's around, or that nobody quite gets it?"],
    r: ["Feeling alone with {r} is rough. Is there anyone you'd even want to tell?"] },
  { re: /angry|furious|pissed|mad at|frustrat|irritat|annoyed/i,
    p: ["That's a fair thing to feel. What set it off?", "Anger usually points at something that mattered. What got stepped on?", "Do you want to vent it out, or figure out what to do about it?"],
    r: ["Yeah, {r} would get to me too. What do you wish had happened instead?"] },
  { re: /not good enough|fraud|imposter|failure|useless|stupid|worthless|hate myself|behind everyone|can'?t do this|give up/i,
    p: ["That voice is loud, but loud isn't the same as true. What's it saying right now?", "What would you say to a friend who told you exactly that?", "Sounds like you're being really hard on yourself. What happened today?"],
    r: ["{R}, and now you're doubting yourself. What's the evidence for and against it?"] },
  { re: /lost someone|grie|passed away|died|funeral|miss (him|her|them)/i,
    p: ["I'm so sorry. There's no schedule for that kind of loss. Do you want to tell me about them?", "Grief comes in waves. What's today's wave like?"], r: [] },
  { re: /breakup|broke up|fight with|argument|argued|ex\b/i,
    p: ["That sounds tense. What happened, from your side?", "Do you want to vent about it, or think through what to say or do next?"], r: [] },
  { re: /proud|shipped|finally works|nailed it|happy|great news|excited|glad|got the job|passed/i,
    p: ["That's genuinely great! Tell me everything.", "Nice, you earned that. What part are you proudest of?", "I love hearing this. What made it click?"],
    r: ["That's wonderful, {r} must feel good. What's next?"] },
  { re: /bored|nothing to do|rut|uninspired/i,
    p: ["Bored of everything, or of the one thing you're supposed to be doing?", "What was the last thing that actually grabbed your attention?"], r: [] },
  { re: /can'?t sleep|insomnia|awake all night/i,
    p: ["Ugh, the 3 a.m. brain is the worst. Is it your thoughts keeping you up, or just can't switch off?"], r: [] }
];
const SOCIAL = [
  { re: /^(hi|hey|hello|yo|sup|good (morning|evening|afternoon))\b/i, a: ["Hey, good to see you. How's today treating you?", "Hi. What's on your mind?", "Hey you. How are you really doing?"] },
  { re: /how are you|how'?s it going|how do you feel/i, a: ["I'm good, and happy you're here. More interested in you though. How's your day been?", "Doing well. Your turn, how are you actually?"] },
  { re: /who are you|what are you|what can you do/i, a: ["I'm Pal, a small companion that lives in your browser. I listen, think things through with you, keep a task list, and keep quiet with music while you work. Nothing you say leaves this tab."] },
  { re: /\bthank(s| you)\b/i, a: ["Anytime, I mean it.", "Of course. I'm glad it helped."] },
  { re: /^(bye|goodnight|good night|gtg|see you|later)\b/i, a: ["Take care of yourself. I'll be here.", "Go easy on yourself tonight. Talk soon."] },
  { re: /^(yes|yeah|yep|no|nope|nah|maybe|idk|i don'?t know|not sure|ok|okay|hmm+)\W*$/i, a: ["That's fine, no pressure. Take your time.", "Okay. Want to try putting it into words, even badly?", "Mm. What's the first thing that comes to mind?"] },
  { re: /\b(joke|make me laugh)\b/i, a: ["I told my laptop I needed a break. It said no problem, it'd freeze up too.", "Why do programmers prefer dark mode? Because light attracts bugs."] }
];
const WORK = [
  { re: /stuck|blocked|can'?t figure|bug|error/i, a: ["What's the smallest thing you could test next?", "Explain it to me in one sentence. Often the problem shows up there."] },
  { re: /overwhelm|too much|where (do|to) (i )?start/i, a: ["Pick the one 20-minute chunk. I'll stay quiet while you do it.", "Brain-dump it on the task list, then do only the top item."] },
  { re: /tired|exhaust|burn/i, a: ["Take five minutes, away from the screen. Then one small task."] },
  { re: /anxious|stress|panic/i, a: ["Slow breath, then the next smallest step. Want to switch to Personal mode and talk it out?"] }
];

function local(t, mode) {
  const rs = reason(t), R = rs ? rs[0].toUpperCase() + rs.slice(1) : null;
  const fill = s => s.replace('{r}', rs).replace('{R}', R);
  if (mode === 'required') {
    for (const w of WORK) if (w.re.test(t)) return pick(w.a, 'w' + w.re);
    return pick(["Got it. I'm here if you need me.", "Noted. Back to it.", "Okay. Say the word if you want a hand."], 'wd');
  }
  for (const s of SOCIAL) if (s.re.test(t)) return pick(s.a, 's' + s.re);
  for (const e of E) if (e.re.test(t)) {
    const useR = rs && e.r.length && Math.random() < 0.7;
    return fill(pick(useR ? e.r : e.p, 'e' + e.re));
  }
  const m = t.match(/\b(?:i'?m|i am|i feel|i think|i want|i('ve| have) been)\s+(.{3,90}?)(?:[.!?]|$)/i);
  if (m) return pick([`So ${refl(m[0].replace(/[.!?]+$/, ''))}. What's behind that?`, `${refl(m[0].replace(/[.!?]+$/, ''))} — how long has that been true?`, `Okay, ${refl(m[0].replace(/[.!?]+$/, ''))}. What would help most right now?`].map(x => x[0].toUpperCase() + x.slice(1)), 'm');
  if (/\?\s*$/.test(t)) return pick(["Good question. I'm a small on-device Pal, so I won't pretend to know everything. What's your own gut telling you?", "Honestly I'm not sure. What made you ask?"], 'q');
  const prev = H.filter(h => h.role === 'user').slice(-2)[0];
  if (prev && Math.random() < 0.3) return `Is that connected to what you said earlier, "${prev.content.slice(0, 50)}"? Or something new?`;
  return pick(["I'm listening. Keep going.", "Tell me more about that part.", "What's that like for you?", "And how did that leave you feeling?", "Take your time. I'm not going anywhere."], 'f');
}

export async function reply(text, mode) {
  if (CRISIS.test(text)) { H.push({ role: 'user', content: text }, { role: 'assistant', content: CRISIS_MSG }); return CRISIS_MSG; }
  let out;
  if (engine) {
    try {
      const r = await engine.chat.completions.create({ messages: [{ role: 'system', content: SYS[mode] }, ...H.slice(-12), { role: 'user', content: text }], max_tokens: 120, temperature: 0.8 });
      out = r.choices[0].message.content.trim();
    } catch { out = null; }
  }
  out = out || local(text, mode);
  H.push({ role: 'user', content: text }, { role: 'assistant', content: out });
  if (H.length > 40) H.splice(0, 2);
  return out;
}
