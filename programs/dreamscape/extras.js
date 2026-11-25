/* 3D worlds, royal court, Pushpak rocket travel, procedural Indian-raga music. Needs THREE + window.DS from game.js */
(()=>{"use strict";
if(!window.THREE||!window.DS)return;
const D=DS,T=THREE,$=id=>document.getElementById(id),cv=$("c3d");
let R;try{R=new T.WebGLRenderer({canvas:cv,antialias:true})}catch(e){window.__fatal&&__fatal("WebGL is not available in this browser, so 3D worlds are disabled. Turn on hardware acceleration or try another browser.");return}R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.25;
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
function start(s,cinema){const old=cur;if(old&&old!==s&&old.scene)old.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})});cur=s;cv.classList.add("on");$("app").classList.toggle("cinema",!!cinema);size();if(!running){running=true;let l=performance.now();(function loop(n){if(!cur){running=false;return}const dt=Math.min(.05,(n-l)/1000);l=n;cur.update(n/1000,dt);R.render(cur.scene,cur.cam);requestAnimationFrame(loop)})(l)}}
function stop(){cur=null;cv.classList.remove("on");$("app").classList.remove("cinema")}
function say(who,txt){$("court").style.display="block";$("cWho").textContent=who;$("cTxt").textContent=txt;$("cBtns").innerHTML=""}
const hideSay=()=>$("court").style.display="none";

/* ---------- CHARACTERS ---------- */
const SKINS=[0xe9b48a,0xd49a6a,0xb77a52,0x9a6038],FTC={};
function faceTex(sk,q){const key=sk+"|"+(q?1:0);if(FTC[key])return FTC[key];const c=document.createElement("canvas");c.width=1024;c.height=512;const x=c.getContext("2d");x.fillStyle="#"+sk.toString(16).padStart(6,"0");x.fillRect(0,0,1024,512);const fx=256,ey=242;
 const bl=(cx,cy,r)=>{const g=x.createRadialGradient(cx,cy,1,cx,cy,r);g.addColorStop(0,"rgba(215,95,85,.28)");g.addColorStop(1,"rgba(215,95,85,0)");x.fillStyle=g;x.fillRect(cx-r,cy-r,2*r,2*r)};bl(fx-72,300,38);bl(fx+72,300,38);
 [-1,1].forEach(s=>{const ex=fx+s*58;x.fillStyle="rgba(60,30,20,.16)";x.beginPath();x.ellipse(ex,ey-3,27,16,0,0,6.3);x.fill();x.fillStyle="#f6f1ea";x.beginPath();x.ellipse(ex,ey,21,10,0,0,6.3);x.fill();x.fillStyle="#3a2210";x.beginPath();x.arc(ex,ey,8.5,0,6.3);x.fill();x.fillStyle="#000";x.beginPath();x.arc(ex,ey,4.2,0,6.3);x.fill();x.fillStyle="#fff";x.beginPath();x.arc(ex-3,ey-3,2,0,6.3);x.fill();
  x.lineCap="round";x.strokeStyle="#1a0f0a";x.lineWidth=q?4.5:3;x.beginPath();x.ellipse(ex,ey,22,11,0,Math.PI*1.03,Math.PI*1.97);x.stroke();x.lineWidth=2;x.strokeStyle="rgba(60,30,20,.5)";x.beginPath();x.ellipse(ex,ey,21,10,0,.1,Math.PI-.1);x.stroke();
  x.strokeStyle="#150d08";x.lineWidth=q?5:8;x.beginPath();x.moveTo(fx+s*34,ey-27);x.quadraticCurveTo(fx+s*62,ey-43,fx+s*90,ey-29);x.stroke();
  x.strokeStyle="rgba(90,45,30,.35)";x.lineWidth=6;x.beginPath();x.moveTo(fx+s*15,ey+22);x.lineTo(fx+s*17,ey+48);x.stroke();x.fillStyle="rgba(60,25,20,.55)";x.beginPath();x.ellipse(fx+s*9,ey+57,5,3,0,0,6.3);x.fill()});
 x.fillStyle="rgba(255,255,255,.12)";x.beginPath();x.ellipse(fx,ey+46,10,7,0,0,6.3);x.fill();
 x.fillStyle=q?"#b3303c":"#a8554a";x.beginPath();x.moveTo(fx-30,346);x.quadraticCurveTo(fx-15,331,fx,338);x.quadraticCurveTo(fx+15,331,fx+30,346);x.quadraticCurveTo(fx,351,fx-30,346);x.fill();
 x.fillStyle=q?"#c8404c":"#b8635a";x.beginPath();x.moveTo(fx-30,346);x.quadraticCurveTo(fx,382,fx+30,346);x.quadraticCurveTo(fx,352,fx-30,346);x.fill();x.strokeStyle="rgba(50,15,15,.7)";x.lineWidth=2;x.beginPath();x.moveTo(fx-30,346);x.quadraticCurveTo(fx,352,fx+30,346);x.stroke();
 if(q){x.fillStyle="#c0182a";x.beginPath();x.arc(fx,ey-58,6,0,6.3);x.fill()}
 const t=new T.CanvasTexture(c);t.anisotropy=4;return FTC[key]=t}
function person(col,q,crown,o){o=o||{};const g=new T.Group(),P={},su=!!o.suit,ro=!!o.royal,lt=!!o.lite;
 const skc=o.skin||(o.alien?0xe3b08a:SKINS[(col>>4)%4]),sk=M3(skc,{roughness:.55}),cl=M3(col,{roughness:.6}),gd=M3(0xffd56b,{metalness:.85,roughness:.22,emissive:0x3a2800}),wh=M3(0xf4f4f6,{roughness:.4,metalness:.15}),acc=M3(q?0xff9933:0xf2efe6,{roughness:.55}),hm=M3(o.alien?0x8a8a9a:0x120c08,{roughness:.7}),sf=M3(0xff9933,{roughness:.5,emissive:0x331800}),gn=M3(0x138808,{roughness:.5}),rw=M3(0xffffff,{roughness:.25,metalness:.35});
 const A=(p,m)=>{p.add(m);return m},lat=(pts,m,sg)=>mesh(new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),sg||(lt?12:18)),m),sp=(r,m,x,y,z,sx,sy,sz)=>{const s=mesh(new T.SphereGeometry(r,lt?8:14,lt?6:10),m,x,y,z);s.scale.set(sx||1,sy||1,sz||1);return s},cy=(a,b,h,m,x,y,z,s)=>mesh(new T.CylinderGeometry(a,b,h,s||10),m,x,y,z),tr=(r,t,m,x,y,z,rx)=>{const q2=mesh(new T.TorusGeometry(r,t,6,18),m,x,y,z);q2.rotation.x=rx==null?Math.PI/2:rx;return q2};
 const lg=s=>{const l=new T.Group();l.position.set(s*.15,.95,0);const m=su?(ro?rw:wh):q?sk:M3(0xf2eee4,{roughness:.8});l.add(lat([[.001,0],[.1,-.01],[.108,-.12],[.1,-.3],[.083,-.47],[.001,-.49]],m));
  const sh=new T.Group();sh.position.y=-.49;sh.add(lat([[.001,0],[.082,0],[.08,-.1],[.07,-.25],[.05,-.39],[.001,-.42]],m));const bm=su?M3(ro?0xe8e8ee:0x55585e,{metalness:.4,roughness:.4}):M3(0x3a2412,{roughness:.6});sh.add(sp(.058,bm,0,-.43,.05,1.05,.55,2.2));
  if(ro){sh.add(sp(.062,gd,0,-.425,.12,1.02,.45,1.1));l.add(sp(.075,gd,0,-.49,.07,1,.9,.8))}else if(!su&&!q){const t=mesh(new T.ConeGeometry(.03,.1,6),bm,0,-.44,.17);t.rotation.x=Math.PI/2+.5;sh.add(t);sh.add(tr(.062,.014,M3(0xe6dcc0),0,-.36,0))}
  l.add(sh);g.add(l);return[l,sh]};
 [P.legL,P.shinL]=lg(-1);[P.legR,P.shinR]=lg(1);
 const tor=new T.Group();g.add(tor);P.tor=tor;
 if(su){const t1=lat([[.21,.95],[.25,1.05],[.3,1.25],[.32,1.45],[.3,1.62],[.17,1.74],[.1,1.77]],ro?rw:wh);t1.scale.set(1.18,1,.84);tor.add(t1);tor.add(tr(.31,.03,ro?gd:M3(0x888a90),0,1.0,0));
  tor.add(mesh(new T.BoxGeometry(ro?.52:.44,ro?.7:.58,.26),ro?rw:wh,0,1.4,-.32));
  if(ro){tor.add(mesh(new T.BoxGeometry(.56,.06,.28),gd,0,1.74,-.32));[-.15,.15].forEach(x=>{tor.add(cy(.07,.09,.3,M3(0x2a2f3a,{metalness:.7}),x,1.0,-.34));const n=mesh(new T.ConeGeometry(.06,.18,10),new T.MeshBasicMaterial({color:0x66ffee}),x,.82,-.34);n.rotation.x=Math.PI;tor.add(n)});
   [-1,1].forEach(s=>{const f=mesh(new T.BoxGeometry(.03,.4,.3),gd,s*.3,1.45,-.34);f.rotation.z=s*.25;tor.add(f);tor.add(sp(.12,gd,s*.4,1.72,0,1,.7,1))});
   tor.add(mesh(new T.CircleGeometry(.11,24),wh,0,1.5,.285));tor.add(tr(.095,.008,M3(0x1a2a8a),0,1.5,.288,0));tor.add(tr(.115,.01,gd,0,1.5,.288,0));for(let i=0;i<12;i++){const sp2=mesh(new T.BoxGeometry(.004,.19,.004),M3(0x1a2a8a),0,1.5,.289);sp2.rotation.z=i/12*Math.PI*2;tor.add(sp2)}
   tor.add(sp(.03,M3(0xff2255,{emissive:0xaa0022}),0,1.0,.3));P.cape=new T.Group();P.cape.position.set(0,1.72,-.46);P.cape.add(mesh(new T.BoxGeometry(.78,1.5,.04),sf,0,-.75,0));P.cape.add(mesh(new T.BoxGeometry(.8,.05,.05),gd,0,-1.5,0));P.cape.add(mesh(new T.BoxGeometry(.04,1.5,.05),gd,-.4,-.75,0));P.cape.add(mesh(new T.BoxGeometry(.04,1.5,.05),gd,.4,-.75,0));tor.add(P.cape)}
  else{tor.add(cy(.02,.02,.4,M3(0x888888),.14,1.85,-.32,5));tor.add(mesh(new T.BoxGeometry(.2,.15,.05),M3(0x20242c,{metalness:.5}),0,1.45,.275));tor.add(mesh(new T.BoxGeometry(.06,.04,.02),sf,-.07,1.5,.3));tor.add(mesh(new T.BoxGeometry(.06,.04,.02),gn,.07,1.5,.3));tor.add(tr(.31,.02,cl,0,1.3,0))}}
 else if(!q){const coat=lat([[.31,.55],[.32,.78],[.3,1.0],[.27,1.2],[.3,1.45],[.29,1.62],[.2,1.72],[.1,1.76]],cl);coat.scale.set(1.18,1,.8);tor.add(coat);const hem=tr(.37,.025,gd,0,.56,0);hem.scale.set(1.18,.8,1);tor.add(hem);tor.add(lat([[.1,1.74],[.11,1.8],[.09,1.83]],cl));for(let i=0;i<5;i++)tor.add(sp(.02,gd,0,1.0+i*.14,.255));
  const sa=mesh(new T.BoxGeometry(.1,.95,.04),acc,0,1.3,.255);sa.rotation.z=.6;tor.add(sa);if(crown)tor.add(mesh(new T.BoxGeometry(.72,1.35,.04),M3(0x8a1c2a,{emissive:0x200408}),0,1.1,-.34))}
 else{P.skirt=lat([[.5,.04],[.47,.2],[.43,.42],[.37,.62],[.3,.8],[.24,.96]],cl);g.add(P.skirt);g.add(tr(.5,.02,gd,0,.06,0));tor.add(lat([[.2,.96],[.19,1.06],[.23,1.15]],sk));const bl=lat([[.24,1.13],[.3,1.27],[.31,1.4],[.27,1.56],[.2,1.68],[.1,1.74]],acc);bl.scale.set(1.08,1,.82);tor.add(bl);
  const pa=mesh(new T.BoxGeometry(.3,1.0,.03),cl,-.12,1.25,.26);pa.rotation.z=.5;tor.add(pa);tor.add(mesh(new T.BoxGeometry(.5,1.05,.03),cl,0,1.15,-.28));if(crown)tor.add(mesh(new T.BoxGeometry(.74,1.3,.04),sf,0,1.1,-.36))}
 const arm=s=>{const a=new T.Group();a.position.set(s*.4,1.68,0);const slv=su?(ro?rw:wh):cl;a.add(sp(.075,su&&ro?gd:slv,0,0,0));a.add(lat([[.001,0],[.068,0],[.066,-.06],[.058,-.2],[.054,-.34],[.001,-.35]],slv));
  const fo=new T.Group();fo.position.y=-.34;fo.rotation.x=-.25;fo.add(lat([[.001,0],[.056,0],[.05,-.2],[.04,-.34],[.001,-.35]],su?(ro?rw:wh):(q?sk:cl)));
  const h=new T.Group();h.position.y=-.36;const hs=su?wh:sk;h.add(sp(.045,hs,0,-.04,0,1,1.15,.55));if(!lt){for(let i=0;i<4;i++){const f=cy(.011,.008,.07,hs,(i-1.5)*.02,-.11,0,5);f.rotation.x=.22;h.add(f)}const th=cy(.012,.009,.055,hs,s*.04,-.05,.015,5);th.rotation.z=s*.7;h.add(th)}else h.add(sp(.04,hs,0,-.1,0,1,.8,.5));
  fo.add(h);a.add(fo);if(q&&!su)for(let i=0;i<3;i++)fo.add(tr(.044,.008,gd,0,-.3+i*.012,0));
  if(ro){a.add(tr(.07,.014,sf,0,-.1,0));a.add(tr(.068,.014,wh,0,-.14,0));a.add(tr(.066,.014,gn,0,-.18,0))}g.add(a);return[a,fo]};
 [P.armL,P.foreL]=arm(-1);[P.armR,P.foreR]=arm(1);g.add(cy(.075,.085,.14,sk,0,1.8,0));
 const hd=new T.Group();hd.position.y=1.97;g.add(hd);P.head=hd;
 const hh=mesh(new T.SphereGeometry(.22,lt?14:24,lt?10:18),new T.MeshStandardMaterial({color:0xffffff,map:faceTex(skc,q),roughness:.55}));hh.scale.set(.9,1.08,1);hd.add(hh);hd.add(sp(.15,sk,0,-.11,.035,.9,.72,.85));
 const ns=cy(.012,.03,.07,sk,0,-.03,.215,6);ns.rotation.x=.35;hd.add(ns);hd.add(sp(.026,sk,0,-.062,.232));[-1,1].forEach(s=>hd.add(sp(.04,sk,s*.2,-.01,-.005,.5,1,.8)));
 const mk=(tl,ps,pl)=>{const m=mesh(new T.SphereGeometry(.232,16,12,ps,pl,0,tl),hm);m.scale.set(.93,1.07,1.04);m.position.y=.015;return m};hd.add(mk(1.0,0,6.283));hd.add(mk(1.85,Math.PI,Math.PI));
 if(!q&&!su&&!o.alien)hd.add(mesh(new T.BoxGeometry(.1,.016,.02),hm,0,-.075,.222));
 if(q){P.braid=new T.Group();P.braid.position.set(0,-.05,-.22);for(let i=0;i<7;i++)P.braid.add(sp(.065-.006*i,hm,0,-i*.1,-i*.012));hd.add(P.braid)}
 if(su){const vis=new T.MeshPhysicalMaterial({color:ro?0xffd27a:0xbfe8ff,metalness:.9,roughness:.06,transparent:true,opacity:ro?.38:.3,clearcoat:1});hd.add(sp(.31,vis,0,.015,.015));hd.add(mesh(new T.SphereGeometry(.325,18,12,0,6.283,0,1.15),ro?rw:wh,0,.03,-.02));hd.add(tr(.3,.03,ro?gd:M3(0x888a90),0,-.2,0));
  [-1,1].forEach(s=>hd.add(sp(.03,new T.MeshBasicMaterial({color:0x66ffee}),s*.27,.1,.12)));
  if(ro){for(let i=0;i<9;i++){const a=i/9*Math.PI*2,c=mesh(new T.ConeGeometry(.035,.16,5),gd,Math.cos(a)*.24,.3,Math.sin(a)*.24);hd.add(c)}hd.add(tr(.25,.025,gd,0,.26,0));hd.add(mesh(new T.BoxGeometry(.03,.14,.3),gd,0,.38,0));hd.add(sp(.04,M3(0xff2255,{emissive:0xaa0022}),0,.3,.27))}}
 else if(crown){hd.add(cy(.24,.25,.09,gd,0,.2,0,16));for(let i=0;i<7;i++){const a=i*6.283/7;hd.add(mesh(new T.ConeGeometry(.045,.2,5),gd,Math.cos(a)*.21,.33,Math.sin(a)*.21))}hd.add(mesh(new T.ConeGeometry(.06,.26,6),gd,0,.4,0));hd.add(sp(.035,M3(0xff2255,{emissive:0xaa0022}),0,.2,.25));if(q){hd.add(sp(.025,gd,0,.17,.215));[-1,1].forEach(s=>hd.add(sp(.025,gd,s*.215,-.07,0)))}}
 else if(!q&&!o.alien){const tc=M3(col===0xf0f0e0?0xe8e0d0:0xcc3a2a,{roughness:.8});for(let i=0;i<3;i++){const t=tr(.235-i*.01,.045,tc,0,.06+i*.045,0);t.rotation.x=Math.PI/2+.12;hd.add(t)}const tb=sp(.22,tc,0,.15,0,1,.7,1);hd.add(tb);hd.add(sp(.035,gd,0,.1,.24))}
 if(!su)tor.add(tr(.2,.02,gd,0,1.64,.02));
 g.userData.p=P;return g}
function anim(g,t,m,talk){const P=g.userData.p;if(!P)return;
 if(g.userData.sit){P.legL.rotation.x=P.legR.rotation.x=-1.45;if(P.shinL)P.shinL.rotation.x=P.shinR.rotation.x=1.5;P.armL.rotation.x=-.4;P.armR.rotation.x=talk?-1+Math.sin(t*5)*.3:-.4;if(P.head)P.head.rotation.y=talk?Math.sin(t*2)*.15:0;return}
 const s=Math.sin(t*9)*m*.8;P.legL.rotation.x=s;P.legR.rotation.x=-s;if(P.shinL){P.shinL.rotation.x=Math.max(0,-s)*1.1;P.shinR.rotation.x=Math.max(0,s)*1.1}
 P.armL.rotation.x=-s*.9;P.armR.rotation.x=s*.9;if(P.foreL){P.foreL.rotation.x=-.25-Math.max(0,s)*.7;P.foreR.rotation.x=-.25-Math.max(0,-s)*.7}
 if(talk){P.armR.rotation.x=-1.1+Math.sin(t*5)*.35;P.armR.rotation.z=-.3}else P.armR.rotation.z=0;
 P.tor.scale.y=1+Math.sin(t*2)*.012*(1-m);if(P.skirt)P.skirt.rotation.x=Math.sin(t*9)*m*.05;if(P.head)P.head.rotation.y=talk?Math.sin(t*2.3)*.18:Math.sin(t*.7)*.05*(1-m);if(P.braid)P.braid.rotation.x=.1+Math.sin(t*9)*m*.2;if(P.cape)P.cape.rotation.x=.1+Math.sin(t*5)*.05+m*.25}


const ruler=o=>person(queen()?0xd63a6b:0xff9933,queen(),true,o);
const aides=o=>[person(0x3a5fa8,false,false,o),person(0xf0f0e0,false,false,o)];

/* ---------- 3D WORLD ---------- */
const WV={r:0,s:0,p:0},riverX=z=>20+48*Math.sin(z*.018+1.3+WV.p*.4);
const Hh=(x,z)=>{const r=Math.hypot(x,z);if(r<14)return 0;let h=(Math.sin(x*.05+WV.p)*Math.cos(z*.04+WV.p*.7)*5+Math.sin(x*.13+z*.1+WV.p*1.3)*1.5)*Math.min(1,(r-14)/20);if(WV.r)h-=7*Math.exp(-Math.pow((x-riverX(z))/7,2));if(WV.s)h-=9*Math.exp(-Math.pow((x+105)/14,2));return h};
const sig=()=>{const S=D.S,p=S.planets[S.selectedPlanet];return S.selectedPlanet+"|"+(S.story&&S.story.legacy?S.story.legacy.length:0)+"|"+(window.DS_story?1:0)+(window.DS_agency?1:0)+"|"+(S.story&&S.story.dyson?(S.story.dyson.h/4|0):0)+"|"+(S.end&&S.end.mode||"")+"|"+(S.visit?S.visit.k:"")+"|"+(p.hab?"H":"")+(p.cities?p.cities.map(c=>c.lvl).join(""):"")+"|"+Object.values(p.buildings).join(",")+"|"+(p.biosphere/5|0)+"|"+(p.water/5|0)+"|"+(p.population/6|0)+"|"+(p.pollution/10|0)};
function stars(sc,n,r){const a=[];for(let i=0;i<n;i++){const u=rnd()*6.28,v=Math.acos(2*rnd()-1);a.push(r*Math.sin(v)*Math.cos(u),Math.abs(r*Math.cos(v)),r*Math.sin(v)*Math.sin(u))}
 const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(a,3));const p=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:1.4,fog:false,transparent:true}));sc.add(p);return p}
function noiseTex(rep){const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d"),im=x.createImageData(256,256);for(let i=0;i<65536;i++){const n=Math.sin(i%256*.31)*Math.cos((i>>8)*.27)*.5+Math.random()*.5,v=205+n*50;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}x.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=4;return t}
function skyDome(top,bot){const m=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{t:{value:new T.Color(top)},b:{value:new T.Color(bot)}},vertexShader:"varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"uniform vec3 t,b;varying vec3 p;void main(){float h=clamp(p.y*1.4+.1,0.,1.);gl_FragColor=vec4(mix(b,t,pow(h,.7)),1.);}"});const s=new T.Mesh(new T.SphereGeometry(500,24,16),m);s.userData.noShadow=1;s.renderOrder=-1;return s}
function buildWalk(st){
 const S=D.S,V=window.DS_visit?DS_visit():null,i=V?V.i:S.selectedPlanet,c=V?V.c:D.PLANETS[i],p=V?V.p:S.planets[i],id=c.id;seed=7+i;WV.r=p.water>=20?1:0;WV.s=p.water>=50?1:0;WV.p=i*1.7;st=st&&st.i===i?st:{i,x:0,z:14,a:Math.PI};
 const sc=new T.Scene(),sky=new T.Color(c.sky[1]).lerp(new T.Color(0x1a1008),p.pollution/200);sc.background=sky;sc.fog=new T.Fog(sky,25,140);const solids=[];sc.userData.solid=solids;
 const hemi=new T.HemisphereLight(0xcfe4ff,0x334455,.7);sc.add(hemi);const sun=new T.DirectionalLight(0xfff0d0,1.7);sun.position.set(30,50,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sh=sun.shadow.camera;sh.left=sh.bottom=-45;sh.right=sh.top=45;sh.near=1;sh.far=160;sun.shadow.bias=-.0004;sc.add(sun);sc.add(sun.target);
 const skyM=skyDome(c.sky[0],sky);skyM.add(mesh(new T.SphereGeometry(16,16,12),new T.MeshBasicMaterial({color:0xfff2c0,fog:false}),216,360,144));skyM.add(mesh(new T.SphereGeometry(30,16,12),new T.MeshBasicMaterial({color:0xffe9b0,transparent:true,opacity:.18,fog:false,depthWrite:false}),216,360,144));
 const g=new T.PlaneGeometry(560,560,160,160);g.rotateX(-Math.PI/2);const pa=g.attributes.position,col=[],base=new T.Color(c.col).lerp(new T.Color(0x3f9a4f),p.biosphere/160).lerp(new T.Color(0x2a2018),p.pollution/250);
 for(let k=0;k<pa.count;k++){const x=pa.getX(k),z=pa.getZ(k),s=.85+.3*Math.abs(Math.sin(x*.3)*Math.cos(z*.27));pa.setY(k,Hh(x,z)+(Math.hypot(x,z)>14?Math.sin(x*1.3)*Math.cos(z*1.1)*.18:0));const hh=pa.getY(k),w0=-2+p.water*.017,rk=hh>3?Math.min(1,(hh-3)/3):0,sh=hh<w0+.5?1:0,cc=base.clone().lerp(new T.Color(0x8a8a92),rk*.7).lerp(new T.Color(0xcdbf95),sh*.8);col.push(cc.r*s,cc.g*s,cc.b*s)}
 g.setAttribute("color",new T.Float32BufferAttribute(col,3));g.computeVertexNormals();sc.add(new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.95,map:noiseTex(140),bumpMap:noiseTex(140),bumpScale:.7})));
 const wl=-2+p.water*.017;let wm=null;if(p.water>4||id==="jala"){wm=mesh(new T.PlaneGeometry(560,560),M3(0x1f6fb8,{transparent:true,opacity:.78,roughness:.05,metalness:.6}),0,wl,0);wm.rotation.x=-Math.PI/2;sc.add(wm)}
 const place=(o,r0,r1,fl)=>{for(let k=0;k<14;k++){const a=rnd()*6.28,r=r0+rnd()*(r1-r0),x=Math.cos(a)*r,z=Math.sin(a)*r,y=Hh(x,z);if(fl||y>wl+.4){o.position.set(x,y-.1,z);sc.add(o);return true}}return false};
 for(let k=0;k<Math.round(p.biosphere/2.5)+(id==="prana"?30:3);k++){const t=new T.Group(),h=2+rnd()*3;t.add(mesh(new T.CylinderGeometry(.2,.3,h,6),M3(0x5a3a22),0,h/2,0));for(let j=0;j<3;j++)t.add(mesh(new T.ConeGeometry(1.7-j*.4+rnd()*.4,h*.7,8),M3(id==="prana"?0x3fe08a:[0x2f8f4e,0x38a05a,0x2a7f45][j],id==="prana"?{emissive:0x0a3a1a}:{}),0,h*.6+j*h*.35+.6,0));place(t,16,100)}
 {const n=Math.round(250+p.biosphere*30),gm=new T.InstancedMesh(new T.ConeGeometry(.07,.8,3),M3(0xffffff,{roughness:1}),n),d=new T.Object3D(),gc=new T.Color(c.col).lerp(new T.Color(0x3fae4f),Math.min(1,p.biosphere/60));
  for(let k=0;k<n;k++){const a=rnd()*6.28,rr=3+Math.sqrt(rnd())*60,x=Math.cos(a)*rr,z=Math.sin(a)*rr,y=Hh(x,z);if(y<wl)d.scale.setScalar(0);else{d.position.set(x,y+.35,z);d.rotation.set((rnd()-.5)*.4,rnd()*6,(rnd()-.5)*.4);d.scale.set(1,.6+rnd(),1)}d.updateMatrix();gm.setMatrixAt(k,d.matrix);gm.setColorAt(k,gc.clone().multiplyScalar(.7+rnd()*.5))}gm.userData.noShadow=1;sc.add(gm)}
 const items=[],cit=[],fx=[];
 if(id==="bhumi"||id==="vajra")for(let k=0;k<30;k++){const s=1+rnd()*3;place(mesh(new T.DodecahedronGeometry(s),M3(id==="vajra"?0x7a6a2a:0x6a5a4a)),18,110)}
 if(id==="agni"){for(let k=0;k<10;k++){const l=mesh(new T.CircleGeometry(3+rnd()*4,20),M3(0xff4a10,{emissive:0xff3300,emissiveIntensity:1.4}));l.rotation.x=-Math.PI/2;place(l,18,90);l.position.y=Hh(l.position.x,l.position.z)+.1}
  const pl=new T.PointLight(0xff5a20,1.6,90);pl.position.set(0,8,0);sc.add(pl);const a=[];for(let k=0;k<150;k++)a.push((rnd()-.5)*120,rnd()*40,(rnd()-.5)*120);const gg=new T.BufferGeometry();gg.setAttribute("position",new T.Float32BufferAttribute(a,3));const em=new T.Points(gg,new T.PointsMaterial({color:0xffaa33,size:.6}));sc.add(em);fx.push(dt=>{const q=gg.attributes.position;for(let k=0;k<q.count;k++){let y=q.getY(k)+dt*4;if(y>40)y=0;q.setY(k,y)}q.needsUpdate=true})}
 if(id==="vayu"||id==="soma")for(let k=0;k<14;k++){const c2=new T.Group();for(let j=0;j<4;j++)c2.add(mesh(new T.SphereGeometry(3+rnd()*3,10,8),M3(0xffffff,{transparent:true,opacity:.85,emissive:0x445566}),j*3.5,rnd()*2,rnd()*3));place(c2,25,120,1);c2.position.y=18+rnd()*25;items.push(c2)}
 if(id==="akasha")for(let k=0;k<22;k++){const cr=mesh(new T.OctahedronGeometry(1+rnd()*1.6),M3(0xa98cff,{emissive:0x5a3acc,emissiveIntensity:1}));place(cr,16,90,1);cr.position.y=3+rnd()*8;items.push(cr);}
 if(id==="soma"||id==="akasha"||id==="vajra"){stars(sc,300,260);sc.background=new T.Color(c.sky[0]);sc.fog.color=sc.background.clone()}
 if(id==="soma"||id==="akasha"){const m=mesh(new T.SphereGeometry(16,24,18),new T.MeshBasicMaterial({color:0xeeeeff,fog:false}),-90,70,-140);sc.add(m)}
 let light=null;if(id==="vajra"){light=new T.PointLight(0xffffff,0,300);light.position.set(0,60,0);sc.add(light)}
 const B=[["solar"],["bioreactor"],["terraform"],["habitat"],["aiCore"],["purifier"],["mandap"],["shield"]];let n=0;const SL=[0,0];
 B.forEach(([k])=>{for(let j=0;j<Math.min(3,p.buildings[k]);j++){const o=new T.Group();
  if(k==="solar"){o.add(mesh(new T.CylinderGeometry(.15,.15,2),M3(0x888888),0,1,0));const pn=mesh(new T.BoxGeometry(3.4,.12,2.2),M3(0x1a3a8a,{emissive:0x0a1a4a,metalness:.7}),0,2.2,0);pn.rotation.x=-.5;o.add(pn)}
  if(k==="bioreactor"){o.add(mesh(new T.CylinderGeometry(1,1.2,1.6,12),M3(0x555a5a),0,.8,0));o.add(mesh(new T.SphereGeometry(1.4,14,10),M3(0x74e7a5,{emissive:0x1a6a3a,transparent:true,opacity:.85}),0,2.4,0))}
  if(k==="terraform"){o.add(mesh(new T.CylinderGeometry(.8,1.1,6,12),M3(0xdddddd),0,3,0));const r=mesh(new T.TorusGeometry(1.6,.15,8,24),M3(0x59e7ff,{emissive:0x59e7ff}),0,5.5,0);r.rotation.x=Math.PI/2;o.add(r);items.push(r)}
  if(k==="habitat"){o.add(mesh(new T.SphereGeometry(2.2,16,10,0,6.3,0,1.57),M3(0xefe0c0),0,0,0));o.add(mesh(new T.BoxGeometry(.9,1.3,.2),M3(0x6a4a2a),0,.65,2.1))}
  if(k==="aiCore"){const oc=mesh(new T.OctahedronGeometry(1.2),M3(0xa98cff,{emissive:0x6a4acc,emissiveIntensity:1.2}),0,3,0);o.add(oc);items.push(oc)}
  if(k==="purifier"){o.add(mesh(new T.CylinderGeometry(.7,.9,3.5,10),M3(0xffffff),0,1.75,0));o.add(mesh(new T.ConeGeometry(.9,1.4,10),M3(0x9ad0ff),0,4.2,0))}
  if(k==="mandap"){o.add(mesh(new T.BoxGeometry(5,.6,5),M3(0xe8dcc0),0,.3,0));o.add(mesh(new T.BoxGeometry(3,3,3),M3(0xf2e4c8),0,2.1,0));for(let s=0;s<4;s++)o.add(mesh(new T.ConeGeometry(2.2-s*.4,1.6,4),M3(0xff9933,{emissive:0x331a00}),0,4.4+s*1.2,0)).rotation.y=.78;o.add(mesh(new T.SphereGeometry(.35,8,8),M3(0xffd56b,{emissive:0x6a4a00}),0,9.6,0))}
  if(k==="shield")o.add(mesh(new T.SphereGeometry(3,18,12),M3(0x59e7ff,{transparent:true,opacity:.22,emissive:0x59e7ff,emissiveIntensity:.5}),0,0,0));
  const side=(k==="solar"||k==="bioreactor"||k==="terraform"||k==="purifier")?-1:1,ix=SL[side<0?0:1]++;if(ix<9){const zz=-26+ix*7.5,xx=side*11;o.add(mesh(new T.BoxGeometry(7.5,2.4,7.5),M3(0xcfc6b4,{roughness:.9}),0,-1.1,0));o.position.set(xx,Hh(xx,zz),zz);o.rotation.y=side<0?1.5708:-1.5708;sc.add(o);solids.push({x:xx,z:zz,r:3.4})}n++}});
 for(let k=0;k<(window.DS_hab&&!DS_hab(i)?0:Math.min(24,p.population/2));k++){const cz=mesh(new T.ConeGeometry(.3,1.3,6),M3([0xff9933,0x3a8fd6,0xe85a8a,0x74e7a5][k%4]));place(cz,6,30);cz.position.y=.65;cit.push(cz)}
 const ex=V?(window.DS_tamCity?DS_tamCity(sc,V,st):null):(window.DS_legacy?DS_legacy(sc,i,st):null);const sp=window.DS_hab&&!DS_hab(i)?{suit:1}:null,pl=ruler(sp?{suit:1,royal:1}:null),fo=aides(sp);sc.add(pl);fo.forEach(f=>sc.add(f));const camr=cam();sc.traverse(o=>{if(o.isMesh&&!o.userData.noShadow&&!(o.material&&o.material.isShaderMaterial)){o.castShadow=true;o.receiveShadow=true}});sc.add(skyM);const clouds=[];if(p.atmosphere>40&&id!=="agni")for(let k=0;k<12;k++){const cg=new T.Group();for(let j=0;j<4;j++)cg.add(mesh(new T.SphereGeometry(5+rnd()*5,10,8),new T.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.75,roughness:1,emissive:0x333a44}),j*6,rnd()*2,rnd()*5));cg.position.set(-200+rnd()*400,65+rnd()*35,-200+rnd()*400);cg.userData.noShadow=1;sc.add(cg);clouds.push(cg)}
 return{scene:sc,cam:camr,st,sg:sig(),ck:0,update(t,dt){
  skyM.position.copy(camr.position);sun.position.set(st.x+30,50,st.z+20);sun.target.position.set(st.x,0,st.z);
  if(window.DS_env)DS_env(t,{sun,hemi,skyM,sc,st});
  const mv=(keys.ArrowUp||keys.w||held)?1:(keys.ArrowDown||keys.s)?-.6:0;st.a+=((keys.ArrowLeft||keys.a?1:0)-(keys.ArrowRight||keys.d?1:0))*dt*2.2+turn;turn=0;
  const nx=st.x+Math.sin(st.a)*mv*dt*9,nz=st.z+Math.cos(st.a)*mv*dt*9;if(Hh(nx,nz)>=wl+.05&&!solids.some(o=>{const d=Math.hypot(nx-o.x,nz-o.z);return d<o.r&&d<Math.hypot(st.x-o.x,st.z-o.z)})){st.x=nx;st.z=nz}const r=Math.hypot(st.x,st.z);if(r>240){st.x*=240/r;st.z*=240/r}
  const y=Math.max(Hh(st.x,st.z),wl);pl.position.set(st.x,y+Math.abs(Math.sin(t*9))*.07*Math.abs(mv),st.z);pl.rotation.y=st.a;anim(pl,t,Math.abs(mv));
  const f=[Math.sin(st.a),Math.cos(st.a)],L=[Math.cos(st.a),-Math.sin(st.a)];
  fo.forEach((q,k)=>{const s=k?-1:1;let tx=st.x-f[0]*2.8+L[0]*2.2*s,tz=st.z-f[1]*2.8+L[1]*2.2*s;if(Hh(tx,tz)<wl+.05){tx=st.x;tz=st.z}const dd=Math.hypot(tx-q.position.x,tz-q.position.z);q.position.x+=(tx-q.position.x)*dt*3;q.position.z+=(tz-q.position.z)*dt*3;q.position.y=Math.max(Hh(q.position.x,q.position.z),wl);q.rotation.y=st.a;anim(q,t+k,Math.min(1,dd*1.2))});
  if(window.DS_topview){camr.position.lerp(new T.Vector3(st.x,y+88,st.z+.01),.12);camr.lookAt(st.x,y,st.z)}else{const cp=new T.Vector3(st.x-f[0]*8,y+4.6,st.z-f[1]*8);camr.position.lerp(cp,.1);camr.lookAt(st.x,y+1.6,st.z)}
  if(wm)wm.position.y=wl+Math.sin(t*1.3)*.12;clouds.forEach(c=>{c.position.x+=dt*1.5;if(c.position.x>220)c.position.x=-220});items.forEach((o,k)=>{o.rotation.y+=dt*.8;if(id==="vayu"||id==="soma")o.position.x+=dt*.6;else if(id==="akasha")o.position.y+=Math.sin(t+k)*.01});
  cit.forEach((o,k)=>o.position.y=.65+Math.abs(Math.sin(t*3+k))*.15);fx.forEach(fn=>fn(dt));if(light)light.intensity=Math.random()<.015?3.5:Math.max(0,light.intensity-dt*8);
  if(ex)ex(t,dt,st,pl);
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
 const K=ruler();K.userData.sit=true;K.position.set(0,1.5,-16);sc.add(K);
 const mins={Mahamatya:[0x3a5fa8,-5.5,-9,1.57],Senapati:[0xa83a3a,5.5,-9,-1.57],Rajguru:[0xf0f0e0,-3,-4,.7]},M={};
 for(const k in mins){const q=person(mins[k][0],false,false);q.position.set(mins[k][1],0,mins[k][2]);q.rotation.y=mins[k][3];sc.add(q);M[k]=q}
 for(let k=0;k<8;k++){const q=person([0xff9933,0x138808,0x3a8fd6,0xe85a8a][k%4],k%2,false);q.position.set(k<4?-8+0:8,0,0);q.position.set(k%2?-4:4,0,-1+Math.floor(k/2)*4.5+1);q.position.x*=1.9;q.rotation.y=k%2?1.2:-1.2;sc.add(q)}
 const camr=cam();let who=null;
 return{scene:sc,cam:camr,M,K,setWho(w){who=w},update(t){camr.position.set(Math.sin(t*.15)*3,4.2,9);camr.lookAt(0,2.6,-10);lights.forEach((L,i)=>L.intensity=.9+.25*Math.sin(t*7+i*2));
  for(const k in M){M[k].scale.setScalar(k===who?1.08:1);anim(M[k],t,0,k===who)}anim(K,t,0,who==="King")}}
}
let courtBusy=false;
window.DS_court=(e,s)=>{if(courtBusy)return;courtBusy=true;$("modal").classList.remove("show");const prev=cur,sv=D.S.view;const sc=buildCourt();sc.lock=1;start(sc,true);musicOverride="court";syncMusic();
 const A=addr(),L=[["Mahamatya",`Jai ho, ${A}! The court is assembled. The matter of ${e[0]} demands your attention.`],["Mahamatya",e[1]],["Rajguru",`"${s}" — so teaches Chanakya.`],["Senapati","The court awaits your decision."]];let k=0;
 const next=()=>{if(k<L.length){const[w,t]=L[k++];sc.setWho(w);say(w,t);const b=document.createElement("button");b.innerHTML="Continue ▶";b.onclick=next;$("cBtns").appendChild(b)}else choose()};
 const choose=()=>{sc.setWho("King");say(D.rulerTitle(),"What is your decree?");e.slice(2).forEach((o,i)=>{const b=document.createElement("button");b.innerHTML=`<b>${o[0]}</b><small>${o[1]}</small>`;b.onclick=()=>{
   document.querySelectorAll("#mBody .opt")[i].click();window.DS_decided&&DS_decided(e,i);sc.setWho("King");say(D.rulerTitle(),`${o[0]}. Let it be so.`);
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
window.DS_travel=to=>{const S=D.S,from=S.location??S.selectedPlanet,fuel=Math.ceil(30*Math.abs(to-from)*(1-(window.DS_nav?DS_nav():0))),p=S.planets[from],P=D.PLANETS;
 D.show("Royal Rocket · Pushpak-1",`${P[from].n} → ${P[to].n}`,`<p style="line-height:1.6">Worlds are far apart. ${D.rulerTitle()} and the dignitaries must travel by rocket — the Pushpak-1.</p><p>Fuel needed: ⚡ <b>${fuel}</b> from ${P[from].n}'s reserves (you have ${D.fmt(p.energy)}).</p><button class="go" id="lnch">🚀 Launch</button>`);
 $("lnch").onclick=()=>{if(p.energy<fuel)return D.toast("Not enough Energy on "+P[from].n+" for fuel.");p.energy-=fuel;D.closeModal();travel(from,to)}};
function travel(from,to){const P=D.PLANETS,X0=typeof to==="object"?to:null,cf=P[from],ct=X0?X0.c:P[to],sc=new T.Scene(),A=addr();sc.background=new T.Color(cf.sky[1]);sc.fog=new T.Fog(cf.sky[1],40,300);
 sc.add(new T.HemisphereLight(0xffffff,0x334455,1));const sun=new T.DirectionalLight(0xfff0d0,1.3);sun.position.set(40,60,60);sc.add(sun);
 const gr=mesh(new T.CircleGeometry(80,40),M3(new T.Color(cf.col)),0,0,0);gr.rotation.x=-Math.PI/2;sc.add(gr);
 const st=stars(sc,400,500);st.material.opacity=0;const rk=rocket();rk.position.set(0,1.2,0);sc.add(rk);
 const ru=ruler(),ai=aides(),cr=[ru,...ai];cr.forEach((q,i)=>{q.position.set(-12-i*2,0,6);sc.add(q)});
 const dest=mesh(new T.SphereGeometry(90,40,30),M3(new T.Color(ct.col).lerp(new T.Color(0x3f9a4f),X0?X0.bio:S_bio(to)),{roughness:1}),0,0,-520);dest.visible=false;sc.add(dest);
 const halo=mesh(new T.SphereGeometry(96,30,20),new T.MeshBasicMaterial({color:0x8cd2ff,transparent:true,opacity:.22}),0,0,-520);halo.visible=false;sc.add(halo);
 const caps=[[.3,"Mahamatya",`The Pushpak-1 is fueled, ${A}. The dignitaries are boarding.`],[2.6,"Mission Control","T-minus 3 … 2 … 1 …"],[5,"Mission Control","Liftoff! Jai Bharat!"],[9,"Rajguru","\"A king's happiness lies in the happiness of his subjects.\""],[11,"Senapati",`Course set for ${ct.n}, ${A}. ${ct.el}.`],[15,"Pilot","Entering atmosphere. Brace yourselves."]];
 const camr=cam(),END=17.5;let t0=null,done=false,ci=-1;
 const finish=()=>{if(done)return;done=true;if(X0){hideSay();musicOverride=null;syncMusic();X0.arrive();return}const S=D.S;S.location=to;S.selectedPlanet=to;S.view="world";hideSay();musicOverride=null;D.renderAll();D.save();const w=buildWalk();w.walk=1;start(w,false);syncMusic();D.toast("Welcome to "+ct.n+" — "+ct.b);
  document.getElementById("vWorld").classList.add("active");document.getElementById("vSystem").classList.remove("active")};
 const skip=document.createElement("button");
 const o={scene:sc,cam:camr,lock:1,update(tt){if(t0===null)t0=tt;const t=tt-t0;if(t>=END)return finish();
  caps.forEach((c,i)=>{if(t>=c[0]&&i>ci){ci=i;say(c[1],c[2]);if(!$("cBtns").querySelector("button")){const b=document.createElement("button");b.textContent="Skip ▶";b.onclick=finish;$("cBtns").appendChild(b)}}});
  const fl=rk.userData.fl;fl.visible=t>4.4;fl.scale.set(1+Math.random()*.2,1+Math.random()*.4,1+Math.random()*.2);fl.position.y=-.6;
  cr.forEach((q,i)=>{if(t<2.6){anim(q,t+i,1);q.position.x+=(-.8*Math.min(1,t/2.6)+0)*0+.06*(1);q.rotation.y=1.57}else q.visible=false});
  if(t<5){camr.position.set(14,5,16);camr.lookAt(0,5,0);rk.position.y=1.2+(t>4.5?(t-4.5)**2*.5:0);if(t>2.6)rk.position.x=0}
  else if(t<9.5){const u=t-5;rk.position.y=1.2+4*u*u+1.2;gr.visible=u<3;camr.position.set(12,rk.position.y+2,14);camr.lookAt(rk.position.x,rk.position.y,0);
   const k=Math.min(1,u/4.5);sc.background=new T.Color(cf.sky[1]).lerp(new T.Color(0x02030a),k);sc.fog.color.copy(sc.background);st.material.opacity=k;rk.rotation.x=-Math.max(0,u-3.2)/1.3*1.5707*0.9}
  else if(t<15){const u=t-9.5;rk.rotation.x=-1.4;rk.position.z=-u*u*3-u*40*0;rk.position.z=-u*70;dest.visible=halo.visible=true;camr.position.set(rk.position.x+5,rk.position.y+2.5,rk.position.z+13);camr.lookAt(rk.position.x,rk.position.y,rk.position.z-10);st.position.z=-rk.position.z*.05}
  else{const u=t-15,k=Math.min(1,u/2.5);rk.position.z=-315-u*60;sc.background=new T.Color(0x02030a).lerp(new T.Color(ct.sky[1]),k);sc.fog.color.copy(sc.background);camr.position.set(rk.position.x+5,rk.position.y+2.5,rk.position.z+13);camr.lookAt(rk.position.x,rk.position.y,rk.position.z-10)}}};
 musicOverride="travel";syncMusic();start(o,true)}
const S_bio=i=>D.S.planets[i].biosphere/160;
window.DS3={T,mesh,M3,Hh,person,anim,start,stop,buildWalk,buildCourt,say,hideSay,addr,travel,riverX,WV,curSt:()=>cur&&cur.st,enterWalk:()=>{const w=buildWalk();w.walk=1;start(w,false);syncMusic()},setMusic:m=>{musicOverride=m;syncMusic()},busy:()=>courtBusy||!!(cur&&cur.lock)};
addEventListener("load",()=>{if(D.S.view==="world")DS_view("world")});addEventListener("pagehide",D.save);addEventListener("blur",()=>{keys={};held=false});
})();
