import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {BODIES,AU} from './data.js';
import {VERT,FRAG,ATM_F,RING_F} from './shaders.js';
const U=1000,MAXD=3.5e7,SYS=1.8e7,$=s=>document.querySelector(s),C=h=>new THREE.Color(h),rad=d=>d*Math.PI/180;
const R=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true,logarithmicDepthBuffer:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,1e-4,1e8);
const ctl=new OrbitControls(cam,R.domElement);Object.assign(ctl,{enableDamping:true,dampingFactor:.08,zoomSpeed:2.2,rotateSpeed:.7,enablePan:false,maxDistance:MAXD});
cam.position.set(0,.35,1).setLength(SYS);
const uSun={value:new THREE.Vector3()},uT={value:0},sphere=new THREE.SphereGeometry(1,128,64),B={},list=[];
const lbRoot=$('#labels');
function label(txt,cls,onclick){const e=document.createElement('div');e.className='lbl '+cls;e.textContent=txt;if(onclick)e.onclick=onclick;lbRoot.appendChild(e);return e;}
function ellipse(d,n){const pts=[],e=d.e,a=d.a/U,b=a*Math.sqrt(1-e*e),inc=rad(d.i);for(let k=0;k<n;k++){const E=k/n*2*Math.PI,x=a*(Math.cos(E)-e),z=b*Math.sin(E);pts.push(new THREE.Vector3(x,z*Math.sin(inc),-z*Math.cos(inc)));}return pts;}
// ---- build bodies
for(const d of BODIES){
 const g=new THREE.Group(),piv=new THREE.Group(),rr=d.r/U;g.add(piv);scene.add(g);
 const seed=([...d.id].reduce((s,c)=>s+c.charCodeAt(0),0)*1.37)%40,at=d.atmo?C(d.atmo[0]):C('#000');
 const mat=new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader:FRAG,uniforms:{uSun,uT,uK:{value:d.kind},uC1:{value:C(d.cols[0])},uC2:{value:C(d.cols[1])},uC3:{value:C(d.cols[2])},uF:{value:d.f||2},uCr:{value:d.cr||0},uBands:{value:d.bands||0},uTurb:{value:d.turb||0},uSpot:{value:d.spot||0},uAtm:{value:new THREE.Vector4(at.r,at.g,at.b,d.atmo?d.atmo[1]:0)},uSeed:{value:seed}}});
 const spin=new THREE.Mesh(sphere,mat);spin.scale.set(rr,rr*(d.flat||1),rr);if(d.r<300)spin.scale.set(rr*1.12,rr*.85,rr*.92);spin.frustumCulled=false;piv.add(spin);piv.rotation.z=rad(d.tilt);
 if(d.atmo){const k=d.id==='earth'?1.03:d.kind===3?1.04:1.03,m=new THREE.Mesh(sphere,new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader:ATM_F,side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uSun,uCol:{value:at},uS:{value:Math.min(1.6,d.atmo[1]*1.2)},uDl:{value:Math.sqrt(1-1/(k*k))}}}));m.scale.setScalar(rr*k);m.frustumCulled=false;g.add(m);}
 if(d.ring){const[a,b,o,c1,c2]=d.ring,m=new THREE.Mesh(new THREE.RingGeometry(a/U,b/U,192,1),new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader:RING_F,side:THREE.DoubleSide,transparent:true,depthWrite:false,uniforms:{uIn:{value:a/U},uOut:{value:b/U},uA:{value:o},uC1:{value:C(c1)},uC2:{value:C(c2)}}}));m.rotation.x=-Math.PI/2;m.frustumCulled=false;piv.add(m);}
 const o={d,g,piv,spin,abs:new THREE.Vector3(),ph:(seed*2.399)%(2*Math.PI),orb:null};B[d.id]=o;list.push(o);
 if(d.par){const l=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ellipse(d,d.moon?160:720)),new THREE.LineBasicMaterial({color:d.moon?0x6a7a99:0x4f78b8,transparent:true,opacity:d.moon?.4:.5,depthWrite:false}));l.frustumCulled=false;B[d.par].g.add(l);o.orb=l;}
 o.lb=label(d.name,d.moon?'moon':'',()=>focusOn(d.id));
}
// ---- sun glow
const gc=document.createElement('canvas');gc.width=gc.height=256;const gx=gc.getContext('2d'),gr=gx.createRadialGradient(128,128,0,128,128,128);
[[0,'rgba(255,240,200,1)'],[.12,'rgba(255,200,110,.7)'],[.35,'rgba(255,140,40,.18)'],[1,'rgba(255,100,20,0)']].forEach(s=>gr.addColorStop(s[0],s[1]));gx.fillStyle=gr;gx.fillRect(0,0,256,256);
const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gc),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));B.sun.g.add(glow);
// ---- belts (asteroid 2.1-3.3 AU, Kuiper 30-50 AU)
const beltGroup=new THREE.Group();scene.add(beltGroup);
function belt(n,a0,a1,thick,color,size,opa,P){const p=new Float32Array(n*3),rnd=()=>(Math.random()+Math.random()+Math.random())/3;
 for(let i=0;i<n;i++){const a=(a0+(a1-a0)*rnd())*AU/U,t=Math.random()*6.2832,y=(rnd()-.5)*2*thick*a;p[i*3]=Math.cos(t)*a;p[i*3+1]=y;p[i*3+2]=Math.sin(t)*a;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));
 const pts=new THREE.Points(geo,new THREE.PointsMaterial({color,size,sizeAttenuation:false,transparent:true,opacity:opa,depthWrite:false}));pts.frustumCulled=false;pts.userData.P=P;beltGroup.add(pts);return pts;}
const asteroids=belt(60000,2.1,3.3,.12,0xb9a58c,1.5,.85,1680),kuiper=belt(90000,30,50,.18,0x8fb0d8,1.4,.6,105000);
const asLbl=label('Asteroid belt · 2.1–3.3 AU','ref',null),kuLbl=label('Kuiper belt · 30–50 AU','ref',null);
// ---- stars
{const n=7000,p=new Float32Array(n*3),c=new Float32Array(n*3);for(let i=0;i<n;i++){const v=new THREE.Vector3().randomDirection().multiplyScalar(6e7);p.set([v.x,v.y,v.z],i*3);const b=.35+Math.random()*.65,w=Math.random();c.set([b*(.8+.2*w),b*.9,b*(1-.2*w)],i*3);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
 const s=new THREE.Points(g,new THREE.PointsMaterial({size:1.5,sizeAttenuation:false,vertexColors:true,depthWrite:false}));s.frustumCulled=false;scene.add(s);}
// ---- Earth references: Karman line, ISS/LEO, GEO (true heights above the surface)
const refs=new THREE.Group(),ER=6371,earthPiv=B.earth.piv;earthPiv.add(refs);
const wire=(h,col,op)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,72,36),new THREE.MeshBasicMaterial({color:col,wireframe:true,transparent:true,opacity:op,depthWrite:false}));m.scale.setScalar((ER+h)/U);m.frustumCulled=false;refs.add(m);};
const ring=(h,col,incl)=>{const pts=[];for(let i=0;i<256;i++){const a=i/256*6.2832;pts.push(new THREE.Vector3(Math.cos(a),0,Math.sin(a)).multiplyScalar((ER+h)/U));}const l=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col}));l.rotation.z=rad(incl||0);l.frustumCulled=false;refs.add(l);};
wire(100,0x55e0ff,.55);wire(2000,0xffb347,.28);wire(35786,0x66ff99,.12);ring(408,0xffffff,51.6);ring(35786,0x66ff99,0);
const refDefs=[[100,'Kármán line · 100 km (edge of space)','#55e0ff',35],[2000,'Low Earth Orbit · up to 2,000 km (ISS ≈ 408 km)','#ffb347',15],[35786,'Geostationary orbit · 35,786 km','#66ff99',0]].map(([h,t,c,lat])=>{const a=new THREE.Object3D(),L=rad(lat);a.position.set(Math.cos(L),Math.sin(L),0).multiplyScalar((ER+h)/U);refs.add(a);const e=label(t,'ref',null);e.style.color=c;e.firstChild;return{a,e};});
// ---- UI
const nav=$('#nav'),moonsEl=$('#moons'),info=$('#info'),hud=$('#hud'),zr=$('#zr');
const mk=(txt,fn,p)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=fn;p.appendChild(b);return b;};
const navBtns={};mk('☉ Whole system',()=>focusOn('sun',SYS),nav);
BODIES.filter(d=>!d.par||d.par==='sun').forEach(d=>navBtns[d.id]=mk(d.name,()=>focusOn(d.id),nav));
const speeds=[['Real time',1/86400],['1 min / s',1/1440],['1 hour / s',1/24],['1 day / s',1],['10 days / s',10],['1 month / s',30.44],['1 year / s',365.25],['10 years / s',3652.5]];
const sp=$('#speed');speeds.forEach((s,i)=>sp.add(new Option(s[0],i)));sp.value=2;
let t=0,speed=speeds[2][1],paused=false,focus=B.sun,fp=new THREE.Vector3(),lock=true,dT=SYS;
sp.onchange=()=>speed=speeds[sp.value][1];$('#pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'▶ Play':'⏸ Pause';};
const show={orb:true,lab:true,belt:true,ref:true};
[['tOrb','orb'],['tLab','lab'],['tBelt','belt'],['tRef','ref']].forEach(([id,k])=>$('#'+id).onchange=e=>show[k]=e.target.checked);
$('#go').onclick=()=>$('#intro').remove();
const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+' billion km':n>=1e6?(n/1e6).toFixed(2)+' million km':Math.round(n).toLocaleString()+' km';
const lt=s=>s<90?s.toFixed(1)+' s':s<5400?(s/60).toFixed(1)+' min':(s/3600).toFixed(2)+' h';
const per=d=>d<2?(d*24).toFixed(1)+' h':d<730?d.toFixed(1)+' days':(d/365.25).toFixed(1)+' years';
function focusOn(id,dist){focus=B[id];lock=false;const rr=focus.d.r/U;dT=dist||(id==='sun'?rr*4:rr*3.4);ctl.minDistance=rr*1.15;
 Object.entries(navBtns).forEach(([k,b])=>b.classList.toggle('on',k===id||(focus.d.par===k)));
 const d=focus.d;moonsEl.innerHTML='';const planet=d.moon?d.par:d.id;
 if(d.moon)mk('↑ '+B[planet].d.name,()=>focusOn(planet),moonsEl);
 BODIES.filter(m=>m.par===planet&&m.moon).forEach(m=>{const b=mk(m.name,()=>focusOn(m.id),moonsEl);if(m.id===id)b.classList.add('on');});
 const ds=d.par?d.a:0;info.style.display='block';
 info.innerHTML=`<b>${d.name}</b><div>Radius: ${fmt(d.r)} (${(d.r/ER).toFixed(2)}× Earth)</div>`+(d.par?`<div>Distance from ${B[d.par].d.name}: ${fmt(d.a)}${d.par==='sun'?` (${(d.a/AU).toFixed(2)} AU)`:''}</div><div>${d.moon?'Orbital':'Year'} period: ${per(Math.abs(d.P))}${d.P<0?' (retrograde)':''}</div>`:`<div>Diameter: ${(d.r*2/ER).toFixed(0)}× Earth's · 99.86% of the system's mass</div>`);}
focusOn('sun',SYS);lock=true;
zr.oninput=()=>{const lo=Math.log(ctl.minDistance),d=Math.exp(lo+zr.value/1000*(Math.log(MAXD)-lo));if(lock)cam.position.setLength(d);else dT=d;};
function resize(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}addEventListener('resize',resize);resize();
// ---- Keplerian motion
const tmp=new THREE.Vector3();
function kep(d,ph){const M=2*Math.PI*(t/d.P)+ph,e=d.e;let E=M;for(let i=0;i<6;i++)E=M+e*Math.sin(E);const a=d.a/U,b=a*Math.sqrt(1-e*e),x=a*(Math.cos(E)-e),z=b*Math.sin(E),inc=rad(d.i);return tmp.set(x,z*Math.sin(inc),-z*Math.cos(inc));}
const pv=new THREE.Vector3(),cp=new THREE.Vector3();let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;if(!paused)t+=dt*speed;uT.value=now/1000;
 for(const b of list){if(b.d.par)b.abs.copy(B[b.d.par].abs).add(kep(b.d,b.ph));if(b.d.rot)b.spin.rotation.y=2*Math.PI*t/b.d.rot;}
 let dist=cam.position.length();const target=focus.abs;
 if(!lock){fp.lerp(target,1-Math.exp(-dt*3));dist=Math.exp(Math.log(dist)+(Math.log(dT)-Math.log(dist))*(1-Math.exp(-dt*2.2)));cam.position.setLength(dist);
  if(Math.abs(Math.log(dist/dT))<.02&&fp.distanceTo(target)<dist*.003)lock=true;}else fp.copy(target);
 for(const b of list)b.g.position.copy(b.abs).sub(fp);
 beltGroup.position.copy(fp).negate();asteroids.rotation.y=-2*Math.PI*t/asteroids.userData.P;kuiper.rotation.y=-2*Math.PI*t/kuiper.userData.P;beltGroup.visible=show.belt;
 uSun.value.copy(fp).negate();
 const sg=B.sun.g.position.distanceTo(cam.position);glow.scale.setScalar(Math.max(B.sun.d.r/U*14,sg*.02));
 for(const b of list)if(b.orb)b.orb.visible=show.orb;
 refs.visible=show.ref;controls();
 ctl.minDistance=focus.d.r/U*1.15;ctl.update();
 cam.updateMatrixWorld();labels();
 const lo=Math.log(ctl.minDistance);if(document.activeElement!==zr)zr.value=Math.max(0,Math.min(1000,(Math.log(cam.position.length())-lo)/(Math.log(MAXD)-lo)*1000));
 const fk=focus.abs.length()*U,cd=cam.position.length()*U;
 hud.innerHTML=`<b>${focus.d.name}</b> · from Sun: ${fmt(fk)} (${(fk/AU).toFixed(2)} AU), light takes ${lt(fk/299792.458)}<br>Camera ${fmt(cd)} from centre · altitude ${fmt(Math.max(0,cd-focus.d.r))}`;
 R.render(scene,cam);}
function controls(){}
function place(e,w,vis){const p=cp.copy(w).applyMatrix4(cam.matrixWorldInverse);if(!vis||p.z>-1e-6){e.style.display='none';return;}
 pv.copy(w).project(cam);const x=(pv.x*.5+.5)*innerWidth,y=(-pv.y*.5+.5)*innerHeight;if(x<-50||x>innerWidth+50||y<-20||y>innerHeight+20){e.style.display='none';return;}e.style.display='block';e.style.transform=`translate(${x}px,${y-8}px)`;}
function labels(){const L=show.lab;
 for(const b of list){let v=L;if(b.d.moon)v=v&&cam.position.distanceTo(B[b.d.par].g.position)<b.d.a/U*10;place(b.lb,b.g.position,v);}
 const nearE=cam.position.distanceTo(B.earth.g.position)<1.3e5;
 for(const r of refDefs){r.a.getWorldPosition(pv);place(r.e,pv,show.ref&&L&&nearE);}
 const s=beltGroup.position;place(asLbl,tmp.set(s.x+2.7*AU/U,0,s.z),L&&show.belt);place(kuLbl,tmp.set(s.x+42*AU/U,0,s.z),L&&show.belt);}
requestAnimationFrame(frame);
