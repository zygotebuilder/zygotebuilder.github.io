/* Orbit View — watch a planet, its satellites, navigation grid and settler transports from space */
(()=>{"use strict";
if(!window.DS3||!window.DS||!window.DS_phys)return;
const D=DS,X=DS3,T=X.T,S=()=>D.S,$=id=>document.getElementById(id),cv=$("c3d");
let yaw=0,pit=.3,rad=70,drag=null,live=false;
cv.addEventListener("pointerdown",e=>{if(live)drag=[e.clientX,e.clientY]});addEventListener("pointerup",()=>drag=null);
cv.addEventListener("pointermove",e=>{if(live&&drag){yaw-=(e.clientX-drag[0])*.006;pit=Math.max(-1.2,Math.min(1.2,pit+(e.clientY-drag[1])*.004));drag=[e.clientX,e.clientY]}});cv.addEventListener("wheel",e=>{if(live)rad=Math.max(32,Math.min(160,rad+e.deltaY*.1))},{passive:true});
function ptex(pi){const p=S().planets[pi],c=D.PLANETS[pi],k=document.createElement("canvas");k.width=512;k.height=256;const x=k.getContext("2d");let sd=pi*131+7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 x.fillStyle=p.water>25?"#1d5fa8":c.col;x.fillRect(0,0,512,256);
 if(p.water>25){const n=Math.round(50*(1-p.water/130));for(let i=0;i<n;i++){x.fillStyle=`hsl(${90+p.biosphere*.4},${30+p.biosphere*.4}%,${28+r()*12}%)`;x.beginPath();x.ellipse(r()*512,30+r()*196,15+r()*45,8+r()*22,r()*3,0,6.3);x.fill()}}
 else for(let i=0;i<70;i++){x.fillStyle=`rgba(0,0,0,${r()*.25})`;x.beginPath();x.arc(r()*512,r()*256,3+r()*12,0,6.3);x.fill()}
 if(DS_phys(pi).T<0){x.fillStyle="rgba(255,255,255,.85)";x.fillRect(0,0,512,14);x.fillRect(0,242,512,14)}
 return new T.CanvasTexture(k)}
function ctex(pi){const p=S().planets[pi],k=document.createElement("canvas");k.width=512;k.height=256;const x=k.getContext("2d");let sd=pi*71+3;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;for(let i=0;i<Math.round(p.atmosphere*1.2);i++){x.fillStyle=`rgba(255,255,255,${.12+r()*.2})`;x.beginPath();x.ellipse(r()*512,r()*256,10+r()*40,4+r()*10,0,0,6.3);x.fill()}return new T.CanvasTexture(k)}
function open(pi){const s=S();if(pi==null){if(X.busy())return D.toast("Finish the current scene first.");pi=s.location??s.selectedPlanet}D.closeModal();const un=s.planets.map((p,i)=>i).filter(i=>s.planets[i].unlocked),p=s.planets[pi],ph=DS_phys(pi),sc=new T.Scene();sc.background=new T.Color(0x02030a);
 sc.add(new T.AmbientLight(0x334466,.9));const sun=new T.DirectionalLight(0xfff0d0,1.8);sun.position.set(80,30,50);sc.add(sun);
 const a=[];for(let k=0;k<900;k++){const th=Math.random()*6.283,v=Math.acos(2*Math.random()-1);a.push(500*Math.sin(v)*Math.cos(th),500*Math.cos(v),500*Math.sin(v)*Math.sin(th))}const sg=new T.BufferGeometry();sg.setAttribute("position",new T.Float32BufferAttribute(a,3));sc.add(new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:1.4})));
 const globe=X.mesh(new T.SphereGeometry(20,48,32),new T.MeshStandardMaterial({map:ptex(pi),roughness:.9}));sc.add(globe);
 const cl=X.mesh(new T.SphereGeometry(20.4,32,24),new T.MeshStandardMaterial({map:ctex(pi),transparent:true,depthWrite:false,opacity:.9}));sc.add(cl);
 if(p.atmosphere>8)sc.add(X.mesh(new T.SphereGeometry(23,32,24),new T.ShaderMaterial({transparent:true,side:T.BackSide,blending:T.AdditiveBlending,depthWrite:false,uniforms:{c:{value:new T.Color(ph.o2>10?0x66b0ff:0xffb070)},k:{value:Math.min(1,p.atmosphere/60)}},vertexShader:"varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"uniform vec3 c;uniform float k;varying vec3 n;void main(){float i=pow(.72-dot(n,vec3(0,0,1)),3.);gl_FragColor=vec4(c,1.)*i*k;}"})));
 if(p.hab){const lp=[];for(let k=0;k<Math.min(300,p.population*3);k++){const u=Math.random()*6.283,v=Math.acos(2*Math.random()-1);lp.push(20.2*Math.sin(v)*Math.cos(u),20.2*Math.cos(v),20.2*Math.sin(v)*Math.sin(u))}const lg=new T.BufferGeometry();lg.setAttribute("position",new T.Float32BufferAttribute(lp,3));sc.add(new T.Points(lg,new T.PointsMaterial({color:0xffe9a8,size:.35})))}
 if((s.end&&s.end.proj||[]).includes("rings")){const rg=X.mesh(new T.TorusGeometry(30,.5,8,80),new T.MeshBasicMaterial({color:0xffd56b}));rg.rotation.x=1.4;sc.add(rg)}
 // Natural satellites are persistent planetary bodies, separate from artificial agency satellites.
 const moons=[],moonList=window.DS_civilisation?DS_civilisation.moons(pi):[{n:"Luna",type:"Rocky moon"},{n:"Minor moon",type:"Captured asteroid"}];
 moonList.forEach((m,k)=>{const r=34+k*10,sz=1.6+(k%2)*.8,mg=X.mesh(new T.SphereGeometry(sz,20,14),new T.MeshStandardMaterial({color:[0xb8b3a8,0x8f9ba8,0xc6b7a0,0x9b9eae][k%4],roughness:1}));const orbit=X.mesh(new T.TorusGeometry(r,.045,5,100),new T.MeshBasicMaterial({color:0x6b86a8,transparent:true,opacity:.35}));orbit.rotation.x=1.1+k*.25;sc.add(orbit);sc.add(mg);moons.push({g:mg,r,a:k*2.3,sp:.08+k*.035,inc:.35+k*.42,name:m.n,type:m.type})});
 const sats=[],mk=(col,r,inc,sp,nav)=>{const g=new T.Group();g.add(X.mesh(new T.BoxGeometry(.8,.8,1.2),X.M3(0xcccccc,{metalness:.8})));g.add(X.mesh(new T.BoxGeometry(3,.05,.9),X.M3(col,{emissive:col,emissiveIntensity:.5})));sc.add(g);const o={g,r,inc,sp,a:Math.random()*6.283};if(nav){const lg=new T.BufferGeometry();lg.setAttribute("position",new T.Float32BufferAttribute(6,3));o.ln=new T.Line(lg,new T.LineBasicMaterial({color:0x66ffee,transparent:true,opacity:.55}));sc.add(o.ln)}sats.push(o)};
 (s.agency?s.agency.sats.slice(-8):[]).forEach((x,k)=>mk(0x1a3a8a,26+k*1.2,k*.5,.3+k*.03));for(let k=0;k<ph.comm*3;k++)mk(0xff66cc,34+k,k*.7,.2);for(let k=0;k<ph.nav*4;k++)mk(0x66ffee,29,(k%3)*1.0,.25,true);
 const ships=[];if(s.mig&&s.mig.to===pi&&Date.now()-s.mig.t<12000)for(let k=0;k<4;k++){const sh=X.mesh(new T.ConeGeometry(.5,1.6,6),new T.MeshBasicMaterial({color:0xffd56b}));sc.add(sh);ships.push({sh,u:k/4})}
 const cam=new T.PerspectiveCamera(50,innerWidth/innerHeight,.5,2000);live=true;yaw=0;rad=70;const sv=s.view;
 const o={scene:sc,cam,lock:1,update(t,dt){if(!drag)yaw+=dt*.05;cam.position.set(Math.cos(yaw)*Math.cos(pit)*rad,Math.sin(pit)*rad,Math.sin(yaw)*Math.cos(pit)*rad);cam.lookAt(0,0,0);globe.rotation.y+=dt*.04;cl.rotation.y+=dt*.055;
  moons.forEach(q=>{q.a+=q.sp*dt;const x=Math.cos(q.a)*q.r,y=Math.sin(q.a)*Math.sin(q.inc)*q.r,z=Math.sin(q.a)*Math.cos(q.inc)*q.r;q.g.position.set(x,y,z);q.g.rotation.y+=dt*.08});
  sats.forEach(q=>{q.a+=q.sp*dt*.4;const x=Math.cos(q.a)*q.r,y=Math.sin(q.a)*Math.sin(q.inc)*q.r,z=Math.sin(q.a)*Math.cos(q.inc)*q.r;q.g.position.set(x,y,z);q.g.rotation.y=q.a;if(q.ln){const l=Math.hypot(x,y,z),ar=q.ln.geometry.attributes.position.array;ar[0]=x;ar[1]=y;ar[2]=z;ar[3]=x/l*20;ar[4]=y/l*20;ar[5]=z/l*20;q.ln.geometry.attributes.position.needsUpdate=true}});
  ships.forEach(q=>{q.u=(q.u+dt*.12)%1;const f=1-q.u;q.sh.position.set(21+f*50,f*10,f*-14);q.sh.lookAt(0,0,0)})}};
 X.start(o,true);X.setMusic("space");
 X.say("🌍 "+D.PLANETS[pi].n+" — orbit view",`Gravity ${ph.g.toFixed(2)} g · ${ph.P.toFixed(2)} bar · O₂ ${ph.o2.toFixed(0)}% · ${ph.T.toFixed(0)} °C · ${p.hab?"habitable":"not habitable"} · comms ${ph.cov.toFixed(0)}% · ${ph.nav*4} nav satellites · natural moons: ${moonList.map(m=>m.n).join(", ")}. Drag to rotate, scroll to zoom.`);
 const mkb=(t,f)=>{const b=document.createElement("button");b.textContent=t;b.onclick=f;$("cBtns").appendChild(b)},leave=()=>{live=false;X.hideSay();X.setMusic(null);if(sv==="world"){X.enterWalk()}else X.stop()};
 mkb("◀ Previous world",()=>{live=false;open(un[(un.indexOf(pi)+un.length-1)%un.length])});mkb("Next world ▶",()=>{live=false;open(un[(un.indexOf(pi)+1)%un.length])});mkb("🌙 Expeditions",()=>{live=false;X.hideSay();X.stop();if(window.DS_civilisation)DS_civilisation.expeditions()});mkb("Leave orbit",leave)}
window.DS_orbit=open;
const b=document.createElement("button");b.textContent="🌍 Orbit View";b.onclick=()=>open();document.querySelector(".navbtns").appendChild(b);
})();
