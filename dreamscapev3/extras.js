/* Dreamscape v3: 3D worlds, royal court, Pushpak rocket travel, procedural Indian-raga music. Needs THREE + window.DS from game.js */
(()=>{"use strict";
if(!window.THREE||!window.DS)return;
const D=DS,T=THREE,$=id=>document.getElementById(id),cv=$("c3d");
const R=new T.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
let cur=null,musicOverride=null,keys={},held=false,turn=0,lastX=0,seed=1;
const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const M3=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.1},o));
const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);return o};
const size=()=>{R.setSize(innerWidth,innerHeight,false);if(cur){cur.cam.aspect=innerWidth/innerHeight;cur.cam.updateProjectionMatrix()}};addEventListener("resize",size);
const cam=()=>new T.PerspectiveCamera(60,innerWidth/innerHeight,.1,900);
const queen=()=>D.S.ruler&&D.S.ruler.g==="queen", addr=()=>queen()?"Maharani":"Maharaj";

/* ---------- MUSIC: procedural raga + drone + tabla ---------- */
const AU={on:true,mode:"space",drone:[],acc:0,b:0};
const SC={bhupali:[0,2,4,7,9],yaman:[0,2,4,6,7,9,11],pent:[0,2,5,7,9],bhairav:[0,1,4,5,7,8,11],dark:[0,1,3,7,8],kafi:[0,2,3,5,7,9,10]};
const MOOD={space:{r:55,s:"bhupali",bpm:36},court:{r:55,s:"bhupali",bpm:60,tabla:1},travel:{r:61.7,s:"yaman",bpm:110,tabla:1},
 bhumi:{r:55,s:"bhupali",bpm:56},jala:{r:61.7,s:"yaman",bpm:46},vayu:{r:73.4,s:"pent",bpm:64},agni:{r:55,s:"bhairav",bpm:84,tabla:1},akasha:{r:65.4,s:"dark",bpm:34},soma:{r:82.4,s:"bhupali",bpm:38},prana:{r:49,s:"yaman",bpm:70},vajra:{r:58.3,s:"kafi",bpm:78,tabla:1}};
function pluck(f,t,v){const C=AU.c,o=C.createOscillator(),g=C.createGain();o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+1.8);o.connect(g);g.connect(AU.m);g.connect(AU.d);o.start(t);o.stop(t+1.9)}
function thump(t,v){const C=AU.c,o=C.createOscillator(),g=C.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(48,t+.15);g.gain.setValueAtTime(v*.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(AU.m);o.start(t);o.stop(t+.35)}
function auStep(){const C=AU.c;if(!C||C.state!=="running")return;const md=MOOD[AU.mode]||MOOD.space,per=60/md.bpm;AU.acc+=.25;if(AU.acc<per)return;AU.acc-=per;AU.b++;
 const sc=SC[md.s],t=C.currentTime;if(Math.random()<.75)pluck(md.r*Math.pow(2,sc[Math.floor(Math.random()*sc.length)]/12)*[2,4,4,8][Math.floor(Math.random()*4)],t,.1);
 if(md.tabla)thump(t,AU.b%4===0?1:.5)}
function auMode(k){AU.mode=k;if(!AU.c)return;const md=MOOD[k]||MOOD.space;AU.drone.forEach(([o,x])=>o.frequency.setTargetAtTime(md.r*x,AU.c.currentTime,.8))}
function auInit(){if(AU.c)return;const C=AU.c=new(window.AudioContext||window.webkitAudioContext)();C.resume();const m=AU.m=C.createGain();m.gain.value=AU.on?.5:0;m.connect(C.destination);
 const d=AU.d=C.createDelay();d.delayTime.value=.4;const fb=C.createGain();fb.gain.value=.4;d.connect(fb);fb.connect(d);const w=C.createGain();w.gain.value=.5;d.connect(w);w.connect(m);
 [1,1.5,2,3].forEach((k,i)=>{const o=C.createOscillator(),g=C.createGain(),f=C.createBiquadFilter();o.type="sawtooth";f.type="lowpass";f.frequency.value=500;g.gain.value=.045/(i+1);o.connect(f);f.connect(g);g.connect(m);o.start();AU.drone.push([o,k])});
 setInterval(auStep,250);auMode(AU.mode)}
["pointerdown","keydown"].forEach(e=>addEventListener(e,auInit,{once:true}));
const syncMusic=()=>auMode(musicOverride||(D.S.view==="world"?D.PLANETS[D.S.selectedPlanet].id:"space"));
const mb=document.createElement("button");mb.textContent="🔊";mb.onclick=()=>{AU.on=!AU.on;mb.textContent=AU.on?"🔊":"🔇";if(AU.m)AU.m.gain.value=AU.on?.5:0;auInit()};document.querySelector(".navbtns").appendChild(mb);

/* ---------- SCENE CONTROL ---------- */
let running=false;
function start(s,cinema){cur=s;cv.classList.add("on");$("app").classList.toggle("cinema",!!cinema);size();if(!running){running=true;let l=performance.now();(function loop(n){if(!cur){running=false;return}const dt=Math.min(.05,(n-l)/1000);l=n;cur.update(n/1000,dt);R.render(cur.scene,cur.cam);requestAnimationFrame(loop)})(l)}}
function stop(){cur=null;cv.classList.remove("on");$("app").classList.remove("cinema")}
function say(who,txt){$("court").style.display="block";$("cWho").textContent=who;$("cTxt").textContent=txt;$("cBtns").innerHTML=""}
const hideSay=()=>$("court").style.display="none";

/* ---------- CHARACTERS ---------- */
function person(col,q,crown){const g=new T.Group();
 g.add(mesh(q?new T.ConeGeometry(.6,1.7,12):new T.CylinderGeometry(.35,.45,1.5,10),M3(col),0,.85,0));
 g.add(mesh(new T.SphereGeometry(.28,12,10),M3(0xf0b98a),0,1.85,0));
 g.add(mesh(new T.SphereGeometry(.3,12,8,0,6.3,0,1.3),M3(0x1a1010),0,1.9,0));
 g.add(mesh(new T.BoxGeometry(.8,.1,.5),M3(0xffd56b,{emissive:0x332200}),0,1.4,0));
 if(crown)g.add(mesh(new T.ConeGeometry(.28,.4,6),M3(0xffd56b,{emissive:0x6a4a00}),0,2.28,0));
 else g.add(mesh(new T.SphereGeometry(.32,10,8),M3(0xe8e0d0),0,2.02,0));
 return g}
const ruler=()=>person(queen()?0xd63a6b:0xff9933,queen(),true);
const aides=()=>[person(0x3a5fa8,false,false),person(0xf0f0e0,false,false)];

/* ---------- 3D WORLD ---------- */
const Hh=(x,z)=>{const r=Math.hypot(x,z);return r<14?0:(Math.sin(x*.05)*Math.cos(z*.04)*5+Math.sin(x*.13+z*.1)*1.5)*Math.min(1,(r-14)/20)};
const sig=()=>{const S=D.S,p=S.planets[S.selectedPlanet];return S.selectedPlanet+"|"+Object.values(p.buildings).join(",")+"|"+(p.biosphere/5|0)+"|"+(p.water/5|0)+"|"+(p.population/6|0)+"|"+(p.pollution/10|0)};
function stars(sc,n,r){const a=[];for(let i=0;i<n;i++){const u=rnd()*6.28,v=Math.acos(2*rnd()-1);a.push(r*Math.sin(v)*Math.cos(u),Math.abs(r*Math.cos(v)),r*Math.sin(v)*Math.sin(u))}
 const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(a,3));const p=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:1.4,fog:false,transparent:true}));sc.add(p);return p}
function buildWalk(st){
 const S=D.S,i=S.selectedPlanet,c=D.PLANETS[i],p=S.planets[i],id=c.id;seed=7+i;st=st&&st.i===i?st:{i,x:0,z:14,a:Math.PI};
 const sc=new T.Scene(),sky=new T.Color(c.sky[1]).lerp(new T.Color(0x1a1008),p.pollution/200);sc.background=sky;sc.fog=new T.Fog(sky,25,140);
 sc.add(new T.HemisphereLight(0xffffff,0x334455,.95));const sun=new T.DirectionalLight(0xfff0d0,1.1);sun.position.set(30,50,20);sc.add(sun);
 const g=new T.PlaneGeometry(300,300,70,70);g.rotateX(-Math.PI/2);const pa=g.attributes.position,col=[],base=new T.Color(c.col).lerp(new T.Color(0x3f9a4f),p.biosphere/160).lerp(new T.Color(0x2a2018),p.pollution/250);
 for(let k=0;k<pa.count;k++){const x=pa.getX(k),z=pa.getZ(k),s=.85+.3*Math.abs(Math.sin(x*.3)*Math.cos(z*.27));pa.setY(k,Hh(x,z));col.push(base.r*s,base.g*s,base.b*s)}
 g.setAttribute("color",new T.Float32BufferAttribute(col,3));g.computeVertexNormals();sc.add(new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1})));
 const wl=-2+p.water*.017;let wm=null;if(p.water>4||id==="jala"){wm=mesh(new T.PlaneGeometry(300,300),M3(0x2c78c9,{transparent:true,opacity:.7,roughness:.2}),0,wl,0);wm.rotation.x=-Math.PI/2;sc.add(wm)}
 const place=(o,r0,r1)=>{const a=rnd()*6.28,r=r0+rnd()*(r1-r0),x=Math.cos(a)*r,z=Math.sin(a)*r;o.position.set(x,Math.max(Hh(x,z),wl)-.1,z);sc.add(o)};
 for(let k=0;k<Math.round(p.biosphere/2.5)+(id==="prana"?30:3);k++){const t=new T.Group(),h=2+rnd()*3;t.add(mesh(new T.CylinderGeometry(.2,.3,h,6),M3(0x5a3a22),0,h/2,0));t.add(mesh(new T.ConeGeometry(1.2+rnd(),h*1.2,7),M3(id==="prana"?0x3fe08a:0x2f8f4e,id==="prana"?{emissive:0x0a3a1a}:{}),0,h+.8,0));place(t,16,100)}
 const items=[],cit=[],fx=[];
 if(id==="bhumi"||id==="vajra")for(let k=0;k<30;k++){const s=1+rnd()*3;place(mesh(new T.DodecahedronGeometry(s),M3(id==="vajra"?0x7a6a2a:0x6a5a4a)),18,110)}
 if(id==="agni"){for(let k=0;k<10;k++){const l=mesh(new T.CircleGeometry(3+rnd()*4,20),M3(0xff4a10,{emissive:0xff3300,emissiveIntensity:1.4}));l.rotation.x=-Math.PI/2;place(l,18,90);l.position.y=Hh(l.position.x,l.position.z)+.1}
  const pl=new T.PointLight(0xff5a20,1.6,90);pl.position.set(0,8,0);sc.add(pl);const a=[];for(let k=0;k<150;k++)a.push((rnd()-.5)*120,rnd()*40,(rnd()-.5)*120);const gg=new T.BufferGeometry();gg.setAttribute("position",new T.Float32BufferAttribute(a,3));const em=new T.Points(gg,new T.PointsMaterial({color:0xffaa33,size:.6}));sc.add(em);fx.push(dt=>{const q=gg.attributes.position;for(let k=0;k<q.count;k++){let y=q.getY(k)+dt*4;if(y>40)y=0;q.setY(k,y)}q.needsUpdate=true})}
 if(id==="vayu"||id==="soma")for(let k=0;k<14;k++){const c2=new T.Group();for(let j=0;j<4;j++)c2.add(mesh(new T.SphereGeometry(3+rnd()*3,10,8),M3(0xffffff,{transparent:true,opacity:.85,emissive:0x445566}),j*3.5,rnd()*2,rnd()*3));place(c2,25,120);c2.position.y=18+rnd()*25;items.push(c2)}
 if(id==="akasha")for(let k=0;k<22;k++){const cr=mesh(new T.OctahedronGeometry(1+rnd()*1.6),M3(0xa98cff,{emissive:0x5a3acc,emissiveIntensity:1}));place(cr,16,90);cr.position.y=3+rnd()*8;items.push(cr);}
 if(id==="soma"||id==="akasha"||id==="vajra"){stars(sc,300,260);sc.background=new T.Color(c.sky[0]);sc.fog.color=sc.background.clone()}
 if(id==="soma"||id==="akasha"){const m=mesh(new T.SphereGeometry(16,24,18),new T.MeshBasicMaterial({color:0xeeeeff,fog:false}),-90,70,-140);sc.add(m)}
 let light=null;if(id==="vajra"){light=new T.PointLight(0xffffff,0,300);light.position.set(0,60,0);sc.add(light)}
 const B=[["solar"],["bioreactor"],["terraform"],["habitat"],["aiCore"],["purifier"],["mandap"]];let n=0;
 B.forEach(([k])=>{for(let j=0;j<Math.min(3,p.buildings[k]);j++){const o=new T.Group();
  if(k==="solar"){o.add(mesh(new T.CylinderGeometry(.15,.15,2),M3(0x888888),0,1,0));const pn=mesh(new T.BoxGeometry(3.4,.12,2.2),M3(0x1a3a8a,{emissive:0x0a1a4a,metalness:.7}),0,2.2,0);pn.rotation.x=-.5;o.add(pn)}
  if(k==="bioreactor"){o.add(mesh(new T.CylinderGeometry(1,1.2,1.6,12),M3(0x555a5a),0,.8,0));o.add(mesh(new T.SphereGeometry(1.4,14,10),M3(0x74e7a5,{emissive:0x1a6a3a,transparent:true,opacity:.85}),0,2.4,0))}
  if(k==="terraform"){o.add(mesh(new T.CylinderGeometry(.8,1.1,6,12),M3(0xdddddd),0,3,0));const r=mesh(new T.TorusGeometry(1.6,.15,8,24),M3(0x59e7ff,{emissive:0x59e7ff}),0,5.5,0);r.rotation.x=Math.PI/2;o.add(r);items.push(r)}
  if(k==="habitat"){o.add(mesh(new T.SphereGeometry(2.2,16,10,0,6.3,0,1.57),M3(0xefe0c0),0,0,0));o.add(mesh(new T.BoxGeometry(.9,1.3,.2),M3(0x6a4a2a),0,.65,2.1))}
  if(k==="aiCore"){const oc=mesh(new T.OctahedronGeometry(1.2),M3(0xa98cff,{emissive:0x6a4acc,emissiveIntensity:1.2}),0,3,0);o.add(oc);items.push(oc)}
  if(k==="purifier"){o.add(mesh(new T.CylinderGeometry(.7,.9,3.5,10),M3(0xffffff),0,1.75,0));o.add(mesh(new T.ConeGeometry(.9,1.4,10),M3(0x9ad0ff),0,4.2,0))}
  if(k==="mandap"){o.add(mesh(new T.BoxGeometry(5,.6,5),M3(0xe8dcc0),0,.3,0));o.add(mesh(new T.BoxGeometry(3,3,3),M3(0xf2e4c8),0,2.1,0));for(let s=0;s<4;s++)o.add(mesh(new T.ConeGeometry(2.2-s*.4,1.6,4),M3(0xff9933,{emissive:0x331a00}),0,4.4+s*1.2,0)).rotation.y=.78;o.add(mesh(new T.SphereGeometry(.35,8,8),M3(0xffd56b,{emissive:0x6a4a00}),0,9.6,0))}
  const a=n*.95+.4,r=8+(n%3)*2.6;o.position.set(Math.cos(a)*r,0,Math.sin(a)*r);o.rotation.y=-a;n++;sc.add(o)}});
 for(let k=0;k<Math.min(24,p.population/2);k++){const cz=mesh(new T.ConeGeometry(.3,1.3,6),M3([0xff9933,0x3a8fd6,0xe85a8a,0x74e7a5][k%4]));place(cz,6,30);cz.position.y=.65;cit.push(cz)}
 const pl=ruler(),fo=aides();sc.add(pl);fo.forEach(f=>sc.add(f));const camr=cam();
 return{scene:sc,cam:camr,st,sg:sig(),ck:0,update(t,dt){
  const mv=(keys.ArrowUp||keys.w||held)?1:(keys.ArrowDown||keys.s)?-.6:0;st.a+=((keys.ArrowLeft||keys.a?1:0)-(keys.ArrowRight||keys.d?1:0))*dt*2.2+turn;turn=0;
  st.x+=Math.sin(st.a)*mv*dt*9;st.z+=Math.cos(st.a)*mv*dt*9;const r=Math.hypot(st.x,st.z);if(r>120){st.x*=120/r;st.z*=120/r}
  const y=Math.max(Hh(st.x,st.z),wl);pl.position.set(st.x,y+Math.abs(Math.sin(t*9))*.07*Math.abs(mv),st.z);pl.rotation.y=st.a;
  const f=[Math.sin(st.a),Math.cos(st.a)],L=[Math.cos(st.a),-Math.sin(st.a)];
  fo.forEach((q,k)=>{const s=k?-1:1,tx=st.x-f[0]*2.8+L[0]*2.2*s,tz=st.z-f[1]*2.8+L[1]*2.2*s;q.position.x+=(tx-q.position.x)*dt*3;q.position.z+=(tz-q.position.z)*dt*3;q.position.y=Math.max(Hh(q.position.x,q.position.z),wl);q.rotation.y=st.a});
  const cp=new T.Vector3(st.x-f[0]*8,y+4.6,st.z-f[1]*8);camr.position.lerp(cp,.1);camr.lookAt(st.x,y+1.6,st.z);
  if(wm)wm.position.y=wl+Math.sin(t*1.3)*.12;items.forEach((o,k)=>{o.rotation.y+=dt*.8;if(id==="vayu"||id==="soma")o.position.x+=dt*.6;else if(id==="akasha")o.position.y+=Math.sin(t+k)*.01});
  cit.forEach((o,k)=>o.position.y=.65+Math.abs(Math.sin(t*3+k))*.15);fx.forEach(fn=>fn(dt));if(light)light.intensity=Math.random()<.015?3.5:Math.max(0,light.intensity-dt*8);
  if(t-this.ck>2){this.ck=t;if(sig()!==this.sg)start(buildWalk(st),false)}}}
}
let keysOn=true;
addEventListener("keydown",e=>{keys[e.key]=1;if(cur&&cur.walk&&e.key.startsWith("Arrow"))e.preventDefault()});addEventListener("keyup",e=>keys[e.key]=0);
cv.addEventListener("pointerdown",e=>{held=true;lastX=e.clientX});addEventListener("pointerup",()=>held=false);cv.addEventListener("pointermove",e=>{if(held){turn-=(e.clientX-lastX)*.006;lastX=e.clientX}});
window.DS_view=v=>{if(cur&&cur.lock)return;if(v==="world"){const w=buildWalk();w.walk=1;start(w,false)}else stop();syncMusic()};

/* ---------- ROYAL COURT ---------- */
function buildCourt(){
 const sc=new T.Scene();sc.background=new T.Color(0x1a0c06);sc.fog=new T.Fog(0x1a0c06,20,60);sc.add(new T.AmbientLight(0xffd9a0,.6));
 sc.add(mesh(new T.BoxGeometry(24,.4,44),M3(0xe8dcc0,{roughness:.3}),0,-.2,-4));sc.add(mesh(new T.BoxGeometry(4,.05,36),M3(0x8a1c2a),0,.03,-3));
 sc.add(mesh(new T.BoxGeometry(24,.5,44),M3(0x2a1608),0,10,-4));sc.add(mesh(new T.BoxGeometry(24,10,.5),M3(0x3a1a0a),0,5,-22));
 const lights=[];for(let z=-16;z<=10;z+=6)[-8,8].forEach(x=>{sc.add(mesh(new T.CylinderGeometry(.7,.8,9.5,12),M3(0xd8b36a,{metalness:.5,roughness:.4}),x,4.75,z));const L=new T.PointLight(0xff9a40,1,26);L.position.set(x*.7,6,z);sc.add(L);lights.push(L);sc.add(mesh(new T.SphereGeometry(.25,8,8),new T.MeshBasicMaterial({color:0xffc060}),x*.7,6,z))});
 [-6,6].forEach(x=>{const b=mesh(new T.PlaneGeometry(3,8),M3(0xff9933,{side:T.DoubleSide,emissive:0x331800}),x,5.2,-21.6);sc.add(b)});
 sc.add(mesh(new T.BoxGeometry(9,.9,6),M3(0xd8b36a,{metalness:.5}),0,.45,-15));
 sc.add(mesh(new T.BoxGeometry(2.4,4,.5),M3(0xffd56b,{metalness:.7,roughness:.3,emissive:0x2a1a00}),0,3.4,-17.4));sc.add(mesh(new T.BoxGeometry(2,.7,1.6),M3(0x8a1c2a),0,1.25,-16.2));
 const K=ruler();K.position.set(0,1.5,-16);sc.add(K);
 const mins={Mahamatya:[0x3a5fa8,-5.5,-9,1.57],Senapati:[0xa83a3a,5.5,-9,-1.57],Rajguru:[0xf0f0e0,-3,-4,.7]},M={};
 for(const k in mins){const q=person(mins[k][0],false,false);q.position.set(mins[k][1],0,mins[k][2]);q.rotation.y=mins[k][3];sc.add(q);M[k]=q}
 for(let k=0;k<8;k++){const q=person([0xff9933,0x138808,0x3a8fd6,0xe85a8a][k%4],k%2,false);q.position.set(k<4?-8+0:8,0,0);q.position.set(k%2?-4:4,0,-1+Math.floor(k/2)*4.5+1);q.position.x*=1.9;q.rotation.y=k%2?1.2:-1.2;sc.add(q)}
 const camr=cam();let who=null;
 return{scene:sc,cam:camr,M,K,setWho(w){who=w},update(t){camr.position.set(Math.sin(t*.15)*3,4.2,9);camr.lookAt(0,2.6,-10);lights.forEach((L,i)=>L.intensity=.9+.25*Math.sin(t*7+i*2));
  for(const k in M)M[k].scale.setScalar(k===who?1.1+Math.sin(t*6)*.02:1);K.scale.setScalar(who==="King"?1.1:1)}}
}
let courtBusy=false;
window.DS_court=(e,s)=>{if(courtBusy)return;courtBusy=true;$("modal").classList.remove("show");const prev=cur,sv=D.S.view;const sc=buildCourt();sc.lock=1;start(sc,true);musicOverride="court";syncMusic();
 const A=addr(),L=[["Mahamatya",`Jai ho, ${A}! The court is assembled. The matter of ${e[0]} demands your attention.`],["Mahamatya",e[1]],["Rajguru",`"${s}" — so teaches Chanakya.`],["Senapati","The court awaits your decision."]];let k=0;
 const next=()=>{if(k<L.length){const[w,t]=L[k++];sc.setWho(w);say(w,t);const b=document.createElement("button");b.innerHTML="Continue ▶";b.onclick=next;$("cBtns").appendChild(b)}else choose()};
 const choose=()=>{sc.setWho("King");say(D.rulerTitle(),"What is your decree?");e.slice(2).forEach((o,i)=>{const b=document.createElement("button");b.innerHTML=`<b>${o[0]}</b><small>${o[1]}</small>`;b.onclick=()=>{
   document.querySelectorAll("#mBody .opt")[i].click();sc.setWho("King");say(D.rulerTitle(),`${o[0]}. Let it be so.`);
   const good=(o[2].h||0)>=0,w=good?"Rajguru":"Mahamatya";setTimeout(()=>{sc.setWho(w);say(w,good?`A judgment rooted in dharma, ${A}. The people will remember it.`:`Artha is served, ${A} — may dharma not be forgotten.`);const b2=document.createElement("button");b2.textContent="Adjourn court ▶";b2.onclick=end;$("cBtns").appendChild(b2)},1600)};$("cBtns").appendChild(b)})};
 const end=()=>{hideSay();courtBusy=false;musicOverride=null;if(sv==="world"){const w=buildWalk();w.walk=1;start(w,false)}else stop();syncMusic()};
 next()};

/* ---------- PUSHPAK ROCKET TRAVEL ---------- */
function rocket(){const g=new T.Group();
 g.add(mesh(new T.CylinderGeometry(1,1.1,7,20),M3(0xf4f4f4,{metalness:.3,roughness:.4}),0,5,0));
 [[0xff9933,3.2],[0xffffff,3.5],[0x138808,3.8]].forEach(([c,y])=>g.add(mesh(new T.CylinderGeometry(1.06,1.08,.3,20),M3(c),0,y+3,0)));
 g.add(mesh(new T.ConeGeometry(1,2.6,20),M3(0xff9933,{metalness:.3}),0,9.8,0));
 for(let i=0;i<3;i++){const f=mesh(new T.BoxGeometry(.2,2.4,1.8),M3(0x138808),0,2.6,0);const a=i*2.09;f.position.set(Math.cos(a)*1.4,2.6,Math.sin(a)*1.4);f.rotation.y=-a;g.add(f)}
 g.add(mesh(new T.SphereGeometry(.38,10,10),M3(0x59e7ff,{emissive:0x2a7a9a}),0,7.2,.95));
 const fl=mesh(new T.ConeGeometry(.8,3.8,12),new T.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.85}),0,0,0);fl.rotation.x=Math.PI;g.add(fl);g.userData.fl=fl;return g}
window.DS_travel=to=>{const S=D.S,from=S.location??S.selectedPlanet,fuel=30*Math.abs(to-from),p=S.planets[from],P=D.PLANETS;
 D.show("Royal Rocket · Pushpak-1",`${P[from].n} → ${P[to].n}`,`<p style="line-height:1.6">Worlds are far apart. ${D.rulerTitle()} and the dignitaries must travel by rocket — the Pushpak-1.</p><p>Fuel needed: ⚡ <b>${fuel}</b> from ${P[from].n}'s reserves (you have ${D.fmt(p.energy)}).</p><button class="go" id="lnch">🚀 Launch</button>`);
 $("lnch").onclick=()=>{if(p.energy<fuel)return D.toast("Not enough Energy on "+P[from].n+" for fuel.");p.energy-=fuel;D.closeModal();travel(from,to)}};
function travel(from,to){const P=D.PLANETS,cf=P[from],ct=P[to],sc=new T.Scene(),A=addr();sc.background=new T.Color(cf.sky[1]);sc.fog=new T.Fog(cf.sky[1],40,300);
 sc.add(new T.HemisphereLight(0xffffff,0x334455,1));const sun=new T.DirectionalLight(0xfff0d0,1.3);sun.position.set(40,60,60);sc.add(sun);
 const gr=mesh(new T.CircleGeometry(80,40),M3(new T.Color(cf.col)),0,0,0);gr.rotation.x=-Math.PI/2;sc.add(gr);
 const st=stars(sc,400,500);st.material.opacity=0;const rk=rocket();rk.position.set(0,1.2,0);sc.add(rk);
 const ru=ruler(),ai=aides(),cr=[ru,...ai];cr.forEach((q,i)=>{q.position.set(-12-i*2,0,6);sc.add(q)});
 const dest=mesh(new T.SphereGeometry(90,40,30),M3(new T.Color(ct.col).lerp(new T.Color(0x3f9a4f),S_bio(to)),{roughness:1}),0,0,-520);dest.visible=false;sc.add(dest);
 const halo=mesh(new T.SphereGeometry(96,30,20),new T.MeshBasicMaterial({color:0x8cd2ff,transparent:true,opacity:.22}),0,0,-520);halo.visible=false;sc.add(halo);
 const caps=[[.3,"Mahamatya",`The Pushpak-1 is fueled, ${A}. The dignitaries are boarding.`],[2.6,"Mission Control","T-minus 3 … 2 … 1 …"],[5,"Mission Control","Liftoff! Jai Bharat!"],[9,"Rajguru","\"A king's happiness lies in the happiness of his subjects.\""],[11,"Senapati",`Course set for ${ct.n}, ${A}. ${ct.el}.`],[15,"Pilot","Entering atmosphere. Brace yourselves."]];
 const camr=cam(),END=17.5;let t0=null,done=false,ci=-1;
 const finish=()=>{if(done)return;done=true;const S=D.S;S.location=to;S.selectedPlanet=to;S.view="world";hideSay();musicOverride=null;D.renderAll();D.save();const w=buildWalk();w.walk=1;start(w,false);syncMusic();D.toast("Welcome to "+ct.n+" — "+ct.b);
  document.getElementById("vWorld").classList.add("active");document.getElementById("vSystem").classList.remove("active")};
 const skip=document.createElement("button");
 const o={scene:sc,cam:camr,lock:1,update(tt){if(t0===null)t0=tt;const t=tt-t0;if(t>=END)return finish();
  caps.forEach((c,i)=>{if(t>=c[0]&&i>ci){ci=i;say(c[1],c[2]);if(!$("cBtns").querySelector("button")){const b=document.createElement("button");b.textContent="Skip ▶";b.onclick=finish;$("cBtns").appendChild(b)}}});
  const fl=rk.userData.fl;fl.visible=t>4.4;fl.scale.set(1+Math.random()*.2,1+Math.random()*.4,1+Math.random()*.2);fl.position.y=-.6;
  cr.forEach((q,i)=>{if(t<2.6){q.position.x+=(-.8*Math.min(1,t/2.6)+0)*0+.06*(1);q.rotation.y=1.57}else q.visible=false});
  if(t<5){camr.position.set(14,5,16);camr.lookAt(0,5,0);rk.position.y=1.2+(t>4.5?(t-4.5)**2*.5:0);if(t>2.6)rk.position.x=0}
  else if(t<9.5){const u=t-5;rk.position.y=1.2+4*u*u+1.2;gr.visible=u<3;camr.position.set(12,rk.position.y+2,14);camr.lookAt(rk.position.x,rk.position.y,0);
   const k=Math.min(1,u/4.5);sc.background=new T.Color(cf.sky[1]).lerp(new T.Color(0x02030a),k);sc.fog.color.copy(sc.background);st.material.opacity=k;rk.rotation.x=-Math.max(0,u-3.2)/1.3*1.5707*0.9}
  else if(t<15){const u=t-9.5;rk.rotation.x=-1.4;rk.position.z=-u*u*3-u*40*0;rk.position.z=-u*70;dest.visible=halo.visible=true;camr.position.set(rk.position.x+5,rk.position.y+2.5,rk.position.z+13);camr.lookAt(rk.position.x,rk.position.y,rk.position.z-10);st.position.z=-rk.position.z*.05}
  else{const u=t-15,k=Math.min(1,u/2.5);rk.position.z=-315-u*60;sc.background=new T.Color(0x02030a).lerp(new T.Color(ct.sky[1]),k);sc.fog.color.copy(sc.background);camr.position.set(rk.position.x+5,rk.position.y+2.5,rk.position.z+13);camr.lookAt(rk.position.x,rk.position.y,rk.position.z-10)}}};
 musicOverride="travel";syncMusic();start(o,true)}
const S_bio=i=>D.S.planets[i].biosphere/160;
if(D.S.view==="world")DS_view("world");
})();
