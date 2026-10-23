/* TPS Wellness Bot — UX layer: living scene, ambient music, ripples, story captions, quotes. No app logic touched. */
(()=>{
const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- Story captions + scene progress ---------- */
const story={welcome:["Before dawn, a tiny seed rests in the quiet earth.",.04],details:["It stirs — waiting to learn your name.",.18],
 scan:["First light touches the hills.",.34],expression:["A shoot reaches up toward the sun.",.5],
 questions:["Every honest answer helps it grow.",.55],result:["In full bloom — that is the wellness within you.",1],single:["A seed, a sunrise, a little growth each day.",.9]};
const cap=document.createElement('div');cap.id='storyCaption';document.body.appendChild(cap);
let stage='single',capTimer;
function setStage(){
  const a=$('.screen.active');const id=a?a.id:'single';if(id===stage&&cap.textContent)return;stage=story[id]?id:'single';
  cap.classList.remove('show');clearTimeout(capTimer);
  capTimer=setTimeout(()=>{cap.textContent=story[stage][0];cap.classList.add('show')},650);
}
const app=$('.app');
if(app)new MutationObserver(setStage).observe(app,{subtree:true,attributes:true,attributeFilter:['class']});
setStage();
function target(){
  if(stage==='questions'){const b=$('#bar');const p=b?parseFloat(b.style.width)||0:0;return .5+.4*p/100}
  return story[stage][1];
}

/* ---------- Living scene canvas ---------- */
const cv=document.createElement('canvas');cv.id='sceneCanvas';document.body.prepend(cv);
const c=cv.getContext('2d');let W,H,D;
function size(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;c.setTransform(D,0,0,D,0,0)}
addEventListener('resize',size);size();
const lerp=(a,b,t)=>a+(b-a)*t, mix=(A,B,t)=>A.map((v,i)=>lerp(v,B[i],t)), rgb=(a,al=1)=>`rgba(${a.map(Math.round).join(',')},${al})`;
const SKY=[[[11,18,48],[40,54,100]],[[112,146,208],[255,190,150]],[[140,206,245],[236,250,240]]];
const stars=Array.from({length:70},()=>({x:Math.random(),y:Math.random()*.6,r:Math.random()*1.4+.3,p:Math.random()*6}));
const fl=Array.from({length:34},()=>({x:Math.random(),y:Math.random(),s:Math.random()*.6+.2,p:Math.random()*6}));
const clouds=Array.from({length:4},(_,i)=>({x:Math.random(),y:.1+i*.09,s:.6+Math.random()*.7,v:.00002+Math.random()*.00003}));
let t=0,T=0,last=performance.now();
const dark=()=>document.documentElement.getAttribute('data-theme')==='dark';
function sky(k){const i=k<.5?0:1,f=k<.5?k*2:(k-.5)*2;return[mix(SKY[i][0],SKY[i+1][0],f),mix(SKY[i][1],SKY[i+1][1],f)]}
function branch(x,y,len,ang,d,leafR){
  const sw=Math.sin(T*.0008+d*.7)*.035*(1-d/9),x2=x+Math.sin(ang+sw)*len,y2=y-Math.cos(ang+sw)*len;
  c.lineWidth=Math.max(1,d*1.5);c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
  if(d>1){branch(x2,y2,len*.76,ang-.46,d-1,leafR);branch(x2,y2,len*.76,ang+.42,d-1,leafR);if(d>3)branch(x2,y2,len*.6,ang+.05,d-2,leafR)}
  else{c.fillStyle=(Math.round(x2+y2)%5===0&&t>.85)?'#f9a8c9':'#4fbf8b';c.globalAlpha=.9;c.beginPath();c.arc(x2,y2,leafR,0,6.3);c.fill();c.globalAlpha=1}
}
function frame(now){
  const dt=Math.min(now-last,50);last=now;if(!reduced)T+=dt;
  t+=(target()-t)*Math.min(1,dt*.0016);
  const dk=dark(),[top,bot]=sky(t).map(a=>dk?mix(a,[8,14,32],.62):a);
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,rgb(top));g.addColorStop(1,rgb(bot));c.fillStyle=g;c.fillRect(0,0,W,H);
  const night=Math.max(dk?.75:0,1-t*2.2);
  stars.forEach(s=>{c.fillStyle=`rgba(255,255,240,${night*(.5+.5*Math.sin(T*.002+s.p))})`;c.beginPath();c.arc(s.x*W,s.y*H,s.r,0,6.3);c.fill()});
  // sun rises with the journey
  const sx=W*.24,sy=lerp(H*.95,H*.2,Math.min(1,t*1.1)),sr=Math.min(W,H)*.09;
  const sg=c.createRadialGradient(sx,sy,0,sx,sy,sr*4);sg.addColorStop(0,`rgba(255,226,160,${dk?.35:.85})`);sg.addColorStop(.25,`rgba(255,200,130,${dk?.12:.35})`);sg.addColorStop(1,'rgba(255,200,130,0)');
  c.fillStyle=sg;c.fillRect(0,0,W,H);c.fillStyle=dk?'rgba(240,230,200,.8)':'#fff3c8';c.beginPath();c.arc(sx,sy,sr*.55,0,6.3);c.fill();
  // clouds
  clouds.forEach(o=>{o.x=(o.x+o.v*dt*(reduced?0:1))%1.3;const cx=(o.x-.15)*W,cy=o.y*H,r=36*o.s;c.fillStyle=dk?'rgba(120,140,180,.12)':`rgba(255,255,255,${.25+t*.35})`;
    [[0,0,1],[r*.9,-r*.2,.8],[-r*.9,r*.05,.75],[r*1.7,r*.1,.6]].forEach(q=>{c.beginPath();c.ellipse(cx+q[0],cy+q[1],r*q[2]*1.3,r*q[2]*.7,0,0,6.3);c.fill()})});
  // hills
  const cols=[[[30,70,70],[66,160,120]],[[22,56,58],[48,138,104]],[[16,44,48],[34,112,86]]];
  cols.forEach((cc,i)=>{const col=mix(cc[0],cc[1],t*(dk?.45:1));c.fillStyle=rgb(col);c.beginPath();c.moveTo(0,H);
    for(let x=0;x<=W;x+=24)c.lineTo(x,H*(.8+i*.06)+Math.sin(x*.004+i*2+T*.00012)*H*.03*(1+i*.3));c.lineTo(W,H);c.fill()});
  // tree (the seed's journey)
  const tx=W>700?W*.84:W*.9,ty=H*.93,S=.12+.88*t,len=Math.min(W,H)*.16*S;
  c.strokeStyle=dk?'#6b4f3a':'#6e4b35';c.lineCap='round';
  branch(tx,ty,len,0,2+Math.floor(t*5.4),2+4*t);
  // fireflies / pollen
  fl.forEach(f=>{f.y-=f.s*dt*.00003*(reduced?0:1);f.x+=Math.sin(T*.0006+f.p)*.00015*(reduced?0:1);if(f.y<-.02)f.y=1.02;
    const a=(.25+.75*Math.abs(Math.sin(T*.0015+f.p)))*(dk||t<.4?.9:.45);c.fillStyle=`rgba(255,230,140,${a})`;c.shadowColor='rgba(255,220,120,.9)';c.shadowBlur=10;
    c.beginPath();c.arc(f.x*W,f.y*H,1.8+f.s*1.4,0,6.3);c.fill();c.shadowBlur=0});
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Ambient generative music (Web Audio, no files needed) ---------- */
const Music=(()=>{let ac,master,bus,on=false,timer,step=0;
 const chords=[[48,55,59,64],[45,52,57,64],[41,48,57,60],[43,50,55,62]],penta=[64,67,69,72,74,76,79];
 const f=m=>440*2**((m-69)/12);
 function init(){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=0;bus=ac.createGain();
  const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;const d=ac.createDelay(2);d.delayTime.value=.47;
  const fb=ac.createGain();fb.gain.value=.42;const wet=ac.createGain();wet.gain.value=.4;
  master.connect(bus);bus.connect(lp);bus.connect(d);d.connect(fb);fb.connect(d);d.connect(wet);wet.connect(lp);lp.connect(ac.destination)}
 function note(m,t0,dur,type,peak,atk){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f(m);o.detune.value=(Math.random()-.5)*10;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(peak,t0+atk);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+.1)}
 function bar(){const t0=ac.currentTime+.1,ch=chords[step++%4];ch.forEach(m=>{note(m,t0,11,'sine',.05,3);note(m+12,t0,11,'triangle',.014,3.5)});
  for(let i=0;i<5;i++)if(Math.random()<.8)note(penta[Math.floor(Math.random()*penta.length)],t0+1+i*1.45+Math.random()*.6,4,'sine',.05,.02)}
 return{get on(){return on},start(){if(!ac)init();ac.resume();if(!on){on=true;bar();timer=setInterval(bar,8000)}master.gain.setTargetAtTime(.75,ac.currentTime,1.4)},
  stop(){if(!ac||!on)return;on=false;clearInterval(timer);master.gain.setTargetAtTime(0,ac.currentTime,.5);setTimeout(()=>{if(!on)ac.suspend()},2500)},
  pause(){if(ac&&on)ac.suspend()},resume(){if(ac&&on)ac.resume()}}})();

const mb=document.createElement('button');mb.id='musicBtn';mb.type='button';mb.title='Toggle ambient music';mb.setAttribute('aria-label','Toggle ambient music');
mb.innerHTML='<span class="eq"><i></i><i></i><i></i><i></i></span><span class="lbl">Music</span>';document.body.appendChild(mb);
const sync=()=>{mb.classList.toggle('on',Music.on);mb.querySelector('.lbl').textContent=Music.on?'Music on':'Music off'};
mb.classList.add('hint');sync();
mb.addEventListener('click',e=>{e.stopPropagation();mb.classList.remove('hint');if(Music.on){Music.stop();store.set('tps_music','off')}else{Music.start();store.set('tps_music','on')}sync()});
const autoStart=()=>{removeEventListener('pointerdown',autoStart);removeEventListener('keydown',autoStart);
  if(store.get('tps_music')!=='off'&&!Music.on){Music.start();mb.classList.remove('hint');sync()}};
addEventListener('pointerdown',autoStart);addEventListener('keydown',autoStart);
document.addEventListener('visibilitychange',()=>document.hidden?Music.pause():Music.resume());

/* ---------- Ripples on buttons & options ---------- */
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn,.option');if(!b||b.disabled)return;
  const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)/4,el=document.createElement('span');el.className='ripple';
  el.style.cssText=`width:${s*2}px;height:${s*2}px;left:${e.clientX-r.left-s}px;top:${e.clientY-r.top-s}px`;b.appendChild(el);setTimeout(()=>el.remove(),750)});

/* ---------- Health quotes in the report ---------- */
const Q=[["The greatest wealth is health.","Virgil"],["It is health that is real wealth, and not pieces of gold and silver.","Mahatma Gandhi"],
 ["Happiness is the highest form of health.","Dalai Lama"],["Take care of your body. It’s the only place you have to live.","Jim Rohn"],
 ["Walking is man’s best medicine.","Hippocrates"],["To enjoy good health is to bring true happiness to one’s family.","Confucius"],
 ["A healthy outside starts from the inside.","Robert Urich"],["Health is not valued till sickness comes.","Thomas Fuller"]];
function placeQuote(){const host=$('#result.active .card')||(!$('#result')&&$('.card'));if(!host)return;const d=host.querySelector('.disclaimer');if(!d)return;
  const old=host.querySelector('.quote-card');if(old)old.remove();
  const seed=[...(($('#metrics')||{}).textContent||'')+(($('#heading')||{}).textContent||'')].reduce((a,ch)=>a*31+ch.charCodeAt(0)|0,7);
  const q=Q[Math.abs(seed)%Q.length],el=document.createElement('div');el.className='quote-card';
  el.innerHTML=`<blockquote>${q[0]}</blockquote><cite>${q[1]}</cite>`;d.parentNode.insertBefore(el,d)}
if($('#result')){new MutationObserver(()=>{if($('#result.active'))placeQuote()}).observe($('#result'),{attributes:true,attributeFilter:['class']})}
else addEventListener('load',()=>setTimeout(placeQuote,50));
})();
