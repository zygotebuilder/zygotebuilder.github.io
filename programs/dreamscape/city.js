/* Dreamscape v7: modern Indian metropolises (glass towers + shikhara crowns, chhatris, gopurams, havelis, domes, lotus temple, maglev), day/night cycle, Dyson shell in the sky */
(()=>{"use strict";
if(!window.DS3||!window.DS)return;
const D=DS,X=DS3,T=X.T,S=()=>D.S,M3=X.M3,mesh=X.mesh,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PAL={bhumi:[0xd9a066,0x6fa8c9,0xff9933],jala:[0xeef2f6,0x2aa8a8,0x59e7ff],vayu:[0xdfe9f2,0x8fc4f0,0xffffff],agni:[0xb5442a,0xd96a3a,0xffb347],akasha:[0xb9a6ff,0x8a6aff,0xe8dcff],soma:[0xdfe6ff,0x9aa6ff,0xffffff],prana:[0xe6f2e0,0x3fae6a,0xa7f0b0],vajra:[0xe0c25a,0x7a8aa0,0xfff0a0]};
let FT=null;const TXC={};
function facade(){const c=document.createElement("canvas");c.width=128;c.height=256;const x=c.getContext("2d");x.fillStyle="#1a2433";x.fillRect(0,0,128,256);for(let r=0;r<16;r++)for(let k=0;k<8;k++){x.fillStyle=Math.random()<.55?"#ffe2a8":"#2c3a52";x.fillRect(k*16+3,r*16+3,10,10)}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
const tx=h=>{const k=h>20?3:h>10?2:1;if(!TXC[k]){if(!FT)FT=facade();const t=FT.clone();t.needsUpdate=true;t.repeat.set(1,k);TXC[k]=t}return TXC[k]};
let GL=null;const glow=()=>{if(GL)return GL;const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,64,64);return GL=new T.CanvasTexture(c)};
const spr=(x,y,z,s,col)=>{const o=new T.Sprite(new T.SpriteMaterial({map:glow(),color:col||0xffc070,blending:T.AdditiveBlending,depthWrite:false,fog:false,transparent:true}));o.position.set(x,y,z);o.scale.set(s,s,1);o.userData.noShadow=1;return o};
const gold=c=>M3(c,{metalness:.7,roughness:.3,emissive:0x332200});
function tower(p,h,w,win,sky){const g=new T.Group(),m=new T.MeshStandardMaterial({color:p[1],map:tx(h),emissiveMap:tx(h),emissive:0xffd9a0,emissiveIntensity:.3,metalness:.5,roughness:.3});win.push(m);let y=0;
 [[1,.55],[.78,.3],[.58,.15]].forEach(([f,r])=>{const hh=h*r;g.add(mesh(new T.BoxGeometry(w*f,hh,w*f),m,0,y+hh/2,0));y+=hh});
 for(let i=0;i<4;i++)g.add(mesh(new T.ConeGeometry(w*(.42-i*.08),2.4,8),M3(p[0]),0,y+1.2+i*1.8,0));g.add(mesh(new T.SphereGeometry(.5,8,8),gold(p[2]),0,y+8,0));
 if(sky){g.add(mesh(new T.CylinderGeometry(.08,.08,8,4),M3(0x888888),0,y+12,0));g.add(spr(0,y+16,0,6,0xff3030))}else g.add(spr(0,y+8.5,0,5));return g}
function chhatri(p,s){const g=new T.Group();[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>g.add(mesh(new T.CylinderGeometry(.2,.2,3,8),M3(p[0]),a*1.3,1.5,b*1.3)));g.add(mesh(new T.BoxGeometry(3.4,.3,3.4),M3(p[0]),0,3.1,0));g.add(mesh(new T.SphereGeometry(1.8,16,8,0,6.283,0,1.57),gold(p[2]),0,3.2,0));g.add(mesh(new T.ConeGeometry(.2,1,6),gold(p[2]),0,5.4,0));g.scale.setScalar(s||1);return g}
function dome(p){const g=new T.Group(),w=M3(0xf2efe6,{roughness:.5});g.add(mesh(new T.BoxGeometry(18,2,18),w,0,1,0));g.add(mesh(new T.BoxGeometry(10,6,10),w,0,5,0));g.add(mesh(new T.CylinderGeometry(3.4,3.6,3,20),w,0,9.5,0));g.add(mesh(new T.SphereGeometry(4.2,24,12,0,6.283,0,1.57),gold(p[2]),0,11,0));g.add(mesh(new T.CylinderGeometry(.15,.15,3,6),gold(p[2]),0,16,0));
 [[-8,-8],[8,-8],[-8,8],[8,8]].forEach(([a,b])=>{g.add(mesh(new T.CylinderGeometry(.6,.7,10,10),w,a,7,b));g.add(mesh(new T.ConeGeometry(.8,1.6,10),gold(p[2]),a,13.2,b))});
 [-3,0,3].forEach(a=>g.add(mesh(new T.BoxGeometry(2.2,3.6,.3),M3(0x223344,{emissive:0x332211}),a,4.6,5.1)));g.add(spr(0,12,0,10));return g}
function gopuram(p){const g=new T.Group();let y=0;for(let i=0;i<6;i++){const w=9-i*1.3,h=1.8;g.add(mesh(new T.BoxGeometry(w,h,w*.7),M3(i%2?p[2]:p[0]),0,y+h/2,0));g.add(mesh(new T.BoxGeometry(w*.8,.35,w*.7+.2),M3([0xd23a3a,0x3a7ad2,0xffd56b][i%3]),0,y+h*.4,0));y+=h}
 const b=mesh(new T.CylinderGeometry(1.3,1.3,4.5,12),M3(p[0]),0,y+1.3,0);b.rotation.z=1.5708;g.add(b);[-1.6,0,1.6].forEach(x=>g.add(mesh(new T.ConeGeometry(.3,1.2,8),gold(p[2]),x,y+2.8,0)));return g}
function haveli(p){const g=new T.Group();g.add(mesh(new T.BoxGeometry(11,5,8),M3(p[0]),0,2.5,0));g.add(mesh(new T.BoxGeometry(11.4,.5,8.4),M3(0xf2efe6),0,5.2,0));
 [-3.5,0,3.5].forEach(x=>{g.add(mesh(new T.BoxGeometry(2,2.4,1),M3(p[0]),x,3.2,4.4));g.add(mesh(new T.BoxGeometry(1.4,1.6,.2),M3(0xffd9a0,{emissive:0xffb050,emissiveIntensity:.6}),x,3.2,4.95))});
 [-3.6,3.6].forEach(x=>{const c=chhatri(p,.7);c.position.set(x,5.4,0);g.add(c)});return g}
function lotus(p){const g=new T.Group(),w=M3(0xfaf6ee,{roughness:.4}),pool=mesh(new T.CircleGeometry(9,32),M3(0x2a8ad0,{metalness:.5,roughness:.1}),0,.1,0);pool.rotation.x=-1.5708;g.add(pool);
 for(let i=0;i<9;i++){const a=i/9*6.283,pt=mesh(new T.SphereGeometry(1,12,10),w,Math.cos(a)*3.2,4,Math.sin(a)*3.2);pt.scale.set(.6,4.2,1.7);pt.rotation.y=-a;pt.rotation.z=-.22;g.add(pt)}g.add(spr(0,6,0,8,0xfff0c0));return g}
function city(sc,pi,wl){const s=S(),p=s.planets[pi],pal=PAL[D.PLANETS[pi].id]||PAL.bhumi,win=[],upd=[];
 const n=p.unlocked?Math.min(44,Math.round(1+p.population/5+Object.values(p.buildings).reduce((a,b)=>a+b,0)*.7+(p.sustained?6:0))):0;
 let seed=pi*977+13;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let k=0;k<n;k++){let a=k*2.4+rnd()*.3,r=40+Math.sqrt(k)*10,x,z,tr=0;do{x=Math.cos(a)*r;z=Math.sin(a)*r;a+=.35;tr++}while(X.Hh(x,z)<wl+.8&&tr<16);if(X.Hh(x,z)<wl+.8)continue;
  const q=k/n,u=rnd(),kind=k===0?"dome":k===1?"lotus":q<.35?(u<.5?"haveli":u<.8?"chhatri":"gopuram"):(u<.45?"tower":u<.65?"sky":u<.8?"gopuram":u<.9?"haveli":"dome"),h=14+rnd()*26*(.5+q);
  const g=kind==="dome"?dome(pal):kind==="lotus"?lotus(pal):kind==="gopuram"?gopuram(pal):kind==="haveli"?haveli(pal):kind==="chhatri"?chhatri(pal,2):tower(pal,h,6+rnd()*3,win,kind==="sky");
  g.position.set(x,X.Hh(x,z),z);g.rotation.y=-a;g.add(mesh(new T.BoxGeometry(14,5,14),M3(0xcfc6b4,{roughness:.9}),0,-2.3,0));sc.add(g)}
 if(n>=14){const R=36,H=11,seg=48,tr=new T.Group();for(let i=0;i<seg;i++){const a=i/seg*6.283,x=Math.cos(a)*R,z=Math.sin(a)*R,b=mesh(new T.BoxGeometry(5.4,.5,2.4),M3(0x9aa4b0,{metalness:.6}),x,H,z);b.rotation.y=-a-1.5708;tr.add(b);if(i%4===0){const y0=X.Hh(x,z);tr.add(mesh(new T.CylinderGeometry(.5,.7,H-y0,8),M3(0xcfc6b4),x,(H+y0)/2,z))}}sc.add(tr);
  const cars=[0,1,2,3].map(()=>{const c=mesh(new T.BoxGeometry(4.2,1.4,1.6),M3(0xffffff,{emissive:0xffb347,emissiveIntensity:.4}),0,H+1,0);sc.add(c);return c});
  upd.push(t=>cars.forEach((c,i)=>{const a=t*.12-i*.06;c.position.set(Math.cos(a)*R,H+1,Math.sin(a)*R);c.rotation.y=-a-1.5708}))}
 if(n>=26){const ch=new T.Group(),ring=mesh(new T.TorusGeometry(5,.35,8,40),gold(0xffffff),0,0,0);ch.add(ring);for(let i=0;i<24;i++){const a=i/24*6.283,sp=mesh(new T.BoxGeometry(.12,10,.12),gold(0xffffff),0,0,0);sp.rotation.z=a;ch.add(sp)}ch.position.set(-14,9,-42);if(X.Hh(-14,-42)>wl+.5){ch.add(mesh(new T.CylinderGeometry(.8,1.2,9,10),M3(0xf2efe6),0,-4.5,0));sc.add(ch);upd.push(t=>ch.rotation.z=t*.4)}}
 return{win,update:t=>upd.forEach(f=>f(t))}}
const old=window.DS_legacy;window.DS_legacy=(sc,pi,st)=>{const f=old?old(sc,pi,st):null,wl=-2+S().planets[pi].water*.017,c=city(sc,pi,wl);sc.userData.win=c.win;return(t,dt,p)=>{f&&f(t,dt,p);c.update(t)}};
const NC=new T.Color(0x050818),NB=new T.Color(0x0a1230);
window.DS_env=(t,o)=>{const sc=o.sc,U=sc.userData,u=o.skyM.material.uniforms;
 if(!U.b){U.b={top:u.t.value.clone(),bot:u.b.value.clone(),sun:o.sun.intensity,hemi:o.hemi.intensity};const a=[];for(let i=0;i<500;i++){const th=Math.random()*6.283,v=Math.acos(Math.random());a.push(450*Math.sin(v)*Math.cos(th),450*Math.cos(v),450*Math.sin(v)*Math.sin(th))}
  const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(a,3));U.stars=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:1.6,fog:false,transparent:true,opacity:0,depthWrite:false}));U.stars.userData.noShadow=1;o.skyM.add(U.stars);
  const s0=S(),dy=s0.story&&s0.story.dyson,e=s0.end||{};if(dy){const fr=dy.done?1:dy.h/100,col=dy.done&&e.winner==="a"?0x66ffcc:0xffd56b,n=Math.ceil(fr*36);if(n>0){const gr=new T.Group();gr.position.set(216,360,144);
   for(let i=0;i<n;i++){const a2=i/36*6.283,b=new T.Mesh(new T.BoxGeometry(5,1.6,.5),new T.MeshBasicMaterial({color:col,fog:false}));b.position.set(Math.cos(a2)*34,Math.sin(a2)*34,0);b.rotation.z=a2;gr.add(b)}
   if(fr>=1)gr.add(new T.Mesh(new T.SphereGeometry(30,16,12),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.22,fog:false,depthWrite:false})));o.skyM.add(gr);gr.lookAt(0,0,0)}}}
 const ph=t*.026+1,el=Math.sin(ph),day=clamp(el*1.5+.3,0,1),night=1-day;
 o.sun.position.set(o.st.x+Math.cos(ph)*45,Math.max(10,el*55+8),o.st.z+20);o.sun.intensity=U.b.sun*(.12+.88*day);o.hemi.intensity=U.b.hemi*(.4+.6*day);
 u.t.value.copy(U.b.top).lerp(NC,night*.85);u.b.value.copy(U.b.bot).lerp(NB,night*.8);sc.fog.color.copy(u.b.value);if(sc.background&&sc.background.isColor)sc.background.copy(u.b.value);
 (U.win||[]).forEach(m=>m.emissiveIntensity=.12+night*1.2);U.stars.material.opacity=night;o.skyM.children[0].visible=day>.15};
})();
