/* modern Indian metropolises (glass towers + shikhara crowns, chhatris, gopurams, havelis, domes, lotus temple, maglev), day/night cycle, Dyson shell in the sky */
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
function park(p){const g=new T.Group();g.add(mesh(new T.CylinderGeometry(6,6,.3,20),M3(0x3f8f4e,{roughness:1}),0,.15,0));for(let i=0;i<6;i++){const a=i*1.05,t=new T.Group();t.add(mesh(new T.CylinderGeometry(.2,.3,2.4,6),M3(0x5a3a22),0,1.2,0));t.add(mesh(new T.SphereGeometry(1.4,8,6),M3(0x2f8f4e),0,3,0));t.position.set(Math.cos(a)*4.2,0,Math.sin(a)*4.2);g.add(t)}const c=chhatri(p,.9);c.position.y=.1;g.add(c);return g}
const CARC=[0xe8e8e8,0xd23a3a,0x2a5ac2,0xf2b134,0x222222,0x3aa86a],RM=M3(0x2a2d33,{roughness:.9}),SM=M3(0xb8b0a0,{roughness:.9}),PM=M3(0xf2efe6);
const hY=(x,z,wl)=>Math.max(X.Hh(x,z),wl+.9);
function label(t){const c=document.createElement("canvas");c.width=256;c.height=64;const x=c.getContext("2d");x.fillStyle="rgba(8,20,46,.78)";x.fillRect(0,8,256,48);x.strokeStyle="#ff9933";x.strokeRect(1,8,254,48);x.fillStyle="#ffd9a0";x.font="bold 26px sans-serif";x.textAlign="center";x.fillText(t,128,42);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false,fog:false}));s.scale.set(22,5.5,1);s.userData.noShadow=1;return s}
function mkSeg(sc,wl,segs){return(x0,z0,x1,z1,w)=>{w=w||10;const key=[x0,z0,x1,z1].join();if(segs.has(key))return;segs.set(key,{x0,z0,x1,z1});
 const y0=hY(x0,z0,wl),y1=hY(x1,z1,wl),L=Math.hypot(x1-x0,z1-z0),g=new T.Group(),mx=(x0+x1)/2,mz=(z0+z1)/2,ang=Math.atan2(y1-y0,L),hd=Math.atan2(z1-z0,x1-x0);
 g.add(mesh(new T.BoxGeometry(L+.4,.35,w),RM));[-1,1].forEach(s=>g.add(mesh(new T.BoxGeometry(L+.4,.5,1.6),SM,0,.1,s*(w/2+.8))));
 for(let k=-Math.floor(L/10);k<=Math.floor(L/10);k++)g.add(mesh(new T.BoxGeometry(3,.05,.25),PM,k*5,.2,0));
 [-1,1].forEach(s=>{const lp=new T.Group();lp.add(mesh(new T.CylinderGeometry(.1,.12,5,6),M3(0x555555),0,2.5,0));lp.add(spr(0,5.2,0,3));lp.position.set(s*(L/2-1),0,s*(w/2+.9));g.add(lp)});
 g.position.set(mx,(y0+y1)/2+.05,mz);g.rotation.y=-hd;g.rotation.z=ang;
 if(X.Hh(mx,mz)<wl+.5)[-1,1].forEach(s=>sc.add(mesh(new T.CylinderGeometry(.5,.6,Math.max(1,(y0+y1)/2-(wl-3)),8),M3(0xcfc6b4),mx+Math.cos(hd)*s*L/4,(wl-3+(y0+y1)/2)/2,mz+Math.sin(hd)*s*L/4)));
 sc.add(g)}}
function fleet(sc,sg,cnt,rnd,upd,wl){if(!sg.length)return;const cg=new T.BoxGeometry(2.3,.75,1.1),cb=new T.BoxGeometry(1.2,.55,1),bg=new T.BoxGeometry(5,1.4,1.5),cars=[];
 for(let k=0;k<cnt;k++){const s=sg[k%sg.length],bus=k%7===0,gr=new T.Group();gr.add(mesh(bus?bg:cg,M3(bus?0xff9933:CARC[k%6],{metalness:.5,roughness:.35}),0,.6,0));if(!bus)gr.add(mesh(cb,M3(0x1a2433,{metalness:.6}),-.1,1.2,0));gr.add(spr(1.2,.6,0,1.4,0xffe9a8));sc.add(gr);const v=(.05+rnd()*.07)*(rnd()<.5?1:-1);cars.push({gr,s,u:rnd(),v,len:Math.hypot(s.x1-s.x0,s.z1-s.z0),lane:v>0?2.3:-2.3})}
 upd.push((t,dt)=>cars.forEach(c=>{c.u+=c.v*(dt||0)*2*(26/Math.max(8,c.len));if(c.u>1)c.u-=1;if(c.u<0)c.u+=1;const s=c.s,dx=s.x1-s.x0,dz=s.z1-s.z0,hd=Math.atan2(dz,dx),x=s.x0+dx*c.u-Math.sin(hd)*c.lane,z=s.z0+dz*c.u+Math.cos(hd)*c.lane;c.gr.position.set(x,hY(x,z,wl)+.25,z);c.gr.rotation.y=-(c.v>0?hd:hd+Math.PI)}))}
function stambh(p){const g=new T.Group();g.add(mesh(new T.CylinderGeometry(7.4,7.8,.5,28),M3(0xcfc6b4,{roughness:.9}),0,.25,0));g.add(mesh(new T.CylinderGeometry(5.2,5.4,.6,24),M3(0x3f8f4e,{roughness:1}),0,.5,0));g.add(mesh(new T.CylinderGeometry(.6,.8,7,12),M3(0xe8dcc0,{roughness:.5}),0,4,0));for(let i=0;i<4;i++){const a=i*1.5708;g.add(mesh(new T.BoxGeometry(1.1,1.1,1.1),gold(p[2]),Math.cos(a)*.9,8,Math.sin(a)*.9))}g.add(mesh(new T.TorusGeometry(1.4,.12,8,24),M3(0x1a2a8a),0,6.2,0));g.add(spr(0,9,0,8,0xfff0c0));return g}
/* planned city: zoned grid of 26-unit cells on wide avenues; capital has a central roundabout with the Ashoka pillar, a grand avenue to the Mahal, side streets */
function layout(sc,pal,n,seed0,wl,opt){opt=opt||{};const cx=opt.cx||0,cz=opt.cz||0,dmin=opt.dmin||50,dmax=opt.dmax||100,win=[],upd=[],sol=sc.userData.solid||[];let seed=seed0;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const G=26,cells=[];for(let gx=-5;gx<=5;gx++)for(let gz=-5;gz<=5;gz++){const x=cx+gx*G,z=cz+gz*G,d=Math.hypot(gx*G,gz*G);if(d<dmin||d>dmax||X.Hh(x,z)<wl+.8)continue;if(opt.core==="small"&&(gx===0||gz===0))continue;if((opt.avoid||[]).some(a=>Math.hypot(x-a.x,z-a.z)<a.r))continue;cells.push({x,z,d})}
 cells.sort((a,b)=>a.d-b.d);const use=cells.slice(0,n),segs=new Map(),seg=mkSeg(sc,wl,segs),ring=(x,z,r)=>{const y=hY(x,z,wl);sc.add(mesh(new T.CylinderGeometry(r,r,.35,32),RM,x,y+.05,z));sc.add(mesh(new T.CylinderGeometry(r*.62,r*.62,.5,28),M3(0x3f8f4e,{roughness:1}),x,y+.15,z))};
 if(opt.core==="capital"){[[-30,-16],[-16,-8],[8,16],[16,30],[30,40]].forEach(a=>seg(0,a[0],0,a[1],10));[-20,20].forEach(x=>{for(let z=-30;z<40;z+=14)seg(x,z,x,z+14,8)});for(let x=-34;x<36;x+=14)seg(x,16,x+14,16,8);
  ring(0,0,9);const st=stambh(pal);st.position.set(0,X.Hh(0,0),0);sc.add(st);sol.push({x:0,z:0,r:5.5})}
 else if(opt.core==="small"){[[-40,-20],[-20,-10],[10,20],[20,40]].forEach(a=>{seg(cx,cz+a[0],cx,cz+a[1],8);seg(cx+a[0],cz,cx+a[1],cz,8)});ring(cx,cz,9);const hall=dome(pal);hall.scale.setScalar(.4);hall.position.set(cx,X.Hh(cx,cz),cz);sc.add(hall);sol.push({x:cx,z:cz,r:5});if(opt.name){const lb=label(opt.name);lb.position.set(cx,X.Hh(cx,cz)+34,cz);sc.add(lb)}}
 use.forEach(c=>[[c.x-13,c.z-13,c.x+13,c.z-13],[c.x-13,c.z+13,c.x+13,c.z+13],[c.x-13,c.z-13,c.x-13,c.z+13],[c.x+13,c.z-13,c.x+13,c.z+13]].forEach(a=>seg(...a,10)));
 use.forEach((c,k)=>{const u=rnd(),d=c.d;let g;
  if(k===0&&opt.core==="capital"){g=dome(pal);g.scale.setScalar(.62)}else if(k===1&&opt.core==="capital"){g=lotus(pal);g.scale.setScalar(.6)}else if(k%6===3)g=park(pal);
  else if(d<(opt.core==="small"?32:68))g=u<.45?haveli(pal):u<.75?gopuram(pal):chhatri(pal,2);else if(d<(opt.core==="small"?44:92))g=u<.6?tower(pal,18+rnd()*22,7+rnd()*2,win,u>.4):u<.8?gopuram(pal):haveli(pal);else g=u<.4?haveli(pal):u<.65?tower(pal,12+rnd()*12,7,win,false):chhatri(pal,2);
  const y=X.Hh(c.x,c.z);g.position.set(c.x,y,c.z);g.rotation.y=Math.floor(rnd()*4)*1.5708;sc.add(g);sc.add(mesh(new T.BoxGeometry(12,5,12),M3(0xcfc6b4,{roughness:.9}),c.x,y-2.3,c.z));sol.push({x:c.x,z:c.z,r:7.5})});
 fleet(sc,[...segs.values()],Math.min(30,segs.size*2),rnd,upd,wl);
 if(n>=14&&opt.core==="capital"){const R=41,H=11,sg2=48,tr=new T.Group();for(let i=0;i<sg2;i++){const a=i/sg2*6.283,x=Math.cos(a)*R,z=Math.sin(a)*R,b=mesh(new T.BoxGeometry(5.4,.5,2.4),M3(0x9aa4b0,{metalness:.6}),x,H,z);b.rotation.y=-a-1.5708;tr.add(b);if(i%4===0){const y0=X.Hh(x,z);tr.add(mesh(new T.CylinderGeometry(.5,.7,H-y0,8),M3(0xcfc6b4),x,(H+y0)/2,z))}}sc.add(tr);
  const cars2=[0,1,2,3].map(()=>{const c=mesh(new T.BoxGeometry(4.2,1.4,1.6),M3(0xffffff,{emissive:0xffb347,emissiveIntensity:.4}),0,H+1,0);sc.add(c);return c});upd.push(t=>cars2.forEach((c,i)=>{const a=t*.12-i*.06;c.position.set(Math.cos(a)*R,H+1,Math.sin(a)*R);c.rotation.y=-a-1.5708}))}
 if(n>=26&&opt.core==="capital"){const cp=[[-32,-30],[30,-32],[-32,32]].find(q=>X.Hh(q[0],q[1])>wl+.5);if(cp){const ch=new T.Group();ch.add(mesh(new T.TorusGeometry(5,.35,8,40),gold(0xffffff)));for(let i=0;i<24;i++){const sp=mesh(new T.BoxGeometry(.12,10,.12),gold(0xffffff));sp.rotation.z=i/24*6.283;ch.add(sp)}ch.add(mesh(new T.CylinderGeometry(.8,1.2,9,10),M3(0xf2efe6),0,-4.5,0));ch.position.set(cp[0],X.Hh(cp[0],cp[1])+9,cp[1]);sc.add(ch);sol.push({x:cp[0],z:cp[1],r:2.5});upd.push(t=>ch.rotation.z=t*.4)}}
 return{win,update:(t,dt)=>upd.forEach(f=>f(t,dt)),rnd}}
function highway(sc,wl,a,b,rnd,upd){const hs=new Map(),seg=mkSeg(sc,wl,hs),L=Math.hypot(b.x-a.x,b.z-a.z),k=Math.max(2,Math.round(L/26));let px=a.x,pz=a.z;for(let i=1;i<=k;i++){const x=a.x+(b.x-a.x)*i/k,z=a.z+(b.z-a.z)*i/k;seg(px,pz,x,z,8);px=x;pz=z}fleet(sc,[...hs.values()],Math.min(10,k*2),rnd,upd,wl)}
window.DS_layout=(sc,pal,n,seed,wl)=>layout(sc,pal,n,seed,wl,{});
/* research outposts: before a world is habitable only domes, labs and suited crews exist */
function outpost(sc,pi,wl){const p=S().planets[pi],sol=sc.userData.solid||[],upd=[],lv=Object.values(p.buildings).reduce((a,b)=>a+b,0),n=2+Math.min(6,Math.round(lv*.5)),ds=[],glass=new T.MeshPhysicalMaterial({color:0xaee8ff,transparent:true,opacity:.35,roughness:.05,metalness:.2,emissive:0x1a4a6a,emissiveIntensity:.5});
 for(let k=0;k<n;k++){let a=k*2.1+.5,r=34+(k%3)*7,x,z,tr=0;do{x=Math.cos(a)*r;z=Math.sin(a)*r;a+=.4;tr++}while(X.Hh(x,z)<wl+.8&&tr<14);if(X.Hh(x,z)<wl+.8)continue;const y=X.Hh(x,z),g=new T.Group();
  g.add(mesh(new T.CylinderGeometry(6,6.5,.8,20),M3(0xcfc6b4),0,.4,0));g.add(mesh(new T.SphereGeometry(5,20,12,0,6.283,0,1.57),glass,0,.8,0));g.add(mesh(new T.CylinderGeometry(3,3,2.4,14),M3(0xe8eef4,{metalness:.4}),0,2,0));g.add(spr(0,3,0,7,0xaee8ff));g.position.set(x,y,z);sc.add(g);sol.push({x,z,r:7});
  const q=ds[ds.length-1];if(q){const L=Math.hypot(x-q.x,z-q.z),tube=mesh(new T.CylinderGeometry(.9,.9,L,10),M3(0xdfe6ee,{metalness:.5}),(x+q.x)/2,y+1,(z+q.z)/2);tube.rotation.z=1.5708;tube.rotation.y=-Math.atan2(z-q.z,x-q.x);sc.add(tube)}ds.push({x,z})}
 const ct=[[-26,6],[26,6],[0,30]].find(q=>X.Hh(q[0],q[1])>wl+.5);if(ct){const g=new T.Group();g.add(mesh(new T.CylinderGeometry(.4,.7,14,8),M3(0xdddddd),0,7,0));const bowl=mesh(new T.SphereGeometry(2.2,14,8,0,6.283,0,1.2),M3(0xf4f4f4,{side:T.DoubleSide}),0,14,0);bowl.rotation.x=-.8;g.add(bowl);g.add(spr(0,15,0,5,0xff4040));g.position.set(ct[0],X.Hh(ct[0],ct[1]),ct[1]);sc.add(g)}
 const crew=[];if(ds.length)for(let k=0;k<5;k++){const pr=X.person([0xf4f4f6,0xff9933,0xf4f4f6][k%3],false,false,{suit:1}),d0=ds[k%ds.length];pr.position.set(d0.x+3,X.Hh(d0.x+3,d0.z),d0.z);sc.add(pr);crew.push({g:pr,t:ds[(k+1)%ds.length]})}
 upd.push((t,dt)=>crew.forEach((c,j)=>{const dx=c.t.x-c.g.position.x,dz=c.t.z-c.g.position.z,d=Math.hypot(dx,dz);if(d<4)c.t=ds[Math.floor(Math.random()*ds.length)];else{c.g.position.x+=dx/d*dt*1.2;c.g.position.z+=dz/d*dt*1.2;c.g.rotation.y=Math.atan2(dx,dz)}c.g.position.y=X.Hh(c.g.position.x,c.g.position.z);X.anim(c.g,t+j,1,false)}));
 return{win:[],update:(t,dt)=>upd.forEach(f=>f(t,dt))}}
/* the Mahal: walk up to it to convene the Sabha */
let NEAR=0;const mb=document.createElement("button");mb.className="go";mb.textContent="🏛 Enter the Mahal — convene the Sabha";Object.assign(mb.style,{position:"absolute",left:"50%",bottom:"130px",transform:"translateX(-50%)",width:"auto",padding:"10px 18px",zIndex:70,display:"none"});document.getElementById("app").appendChild(mb);
mb.onclick=()=>{if(!X.busy())document.getElementById("councilBtn").click()};setInterval(()=>{mb.style.display=performance.now()-NEAR<400&&S().view==="world"&&!X.busy()?"block":"none"},300);
const mahalPos=wl=>[[0,-46],[46,0],[0,46],[-46,0],[34,-34]].find(q=>X.Hh(q[0],q[1])>wl+.8)||[0,-46];
function mahal(pal,sol,pos){const g=new T.Group(),w=M3(0xf2efe6,{roughness:.5}),sd=M3(pal[0],{roughness:.7}),gd=gold(pal[2]);
 g.add(mesh(new T.BoxGeometry(38,5,44),M3(0xcfc6b4,{roughness:.9}),0,-2,6));[[34,1,22],[30,1,18],[26,1,14]].forEach((s,i)=>g.add(mesh(new T.BoxGeometry(...s),w,0,.5+i,0)));
 g.add(mesh(new T.BoxGeometry(22,9,12),sd,0,8,-1));g.add(mesh(new T.CylinderGeometry(4.5,4.8,4,24),w,0,14.5,-1));g.add(mesh(new T.SphereGeometry(5.6,28,14,0,6.283,0,1.57),gd,0,16.5,-1));g.add(mesh(new T.CylinderGeometry(.2,.2,4,6),gd,0,23,-1));
 [-1,1].forEach(s=>{g.add(mesh(new T.BoxGeometry(8,6,11),sd,s*15,6,-1));const c=chhatri(pal,1.3);c.position.set(s*15,9,-1);g.add(c);g.add(mesh(new T.CylinderGeometry(.6,.7,12,10),w,s*17,7,6));g.add(mesh(new T.ConeGeometry(.8,1.8,10),gd,s*17,14,6))});
 for(let i=-5;i<=5;i++)g.add(mesh(new T.CylinderGeometry(.45,.5,7,10),w,i*2,6.5,5.5));g.add(mesh(new T.BoxGeometry(24,.8,3),w,0,10.2,5.5));g.add(mesh(new T.BoxGeometry(4,6,.4),M3(0x3a1a0a,{emissive:0x331100}),0,6,5.05));
 [-12,12].forEach(x=>{g.add(mesh(new T.CylinderGeometry(.1,.1,12,6),M3(0x888888),x,6,12));g.add(mesh(new T.BoxGeometry(2.4,1.4,.1),M3(0xff9933,{emissive:0x331800}),x+1.3,11,12))});
 g.add(mesh(new T.BoxGeometry(34,.15,16),M3(0x3f8f4e,{roughness:1}),0,.1,19));g.add(mesh(new T.BoxGeometry(6,.4,16),M3(0x2a8ad0,{metalness:.5,roughness:.1}),0,.3,17));[-6,-2,2,6].forEach(z=>g.add(mesh(new T.CylinderGeometry(.15,.15,3,6),M3(0xbfe8ff,{transparent:true,opacity:.6}),0,1.8,17+z)));
 g.add(spr(0,24,-1,14));g.position.set(pos[0],X.Hh(pos[0],pos[1]),pos[1]);g.rotation.y=Math.atan2(-pos[0],-pos[1]);sol.push({x:pos[0],z:pos[1],r:15});
 return{g,update:(t,p)=>{if(Math.hypot(p.x-pos[0],p.z-pos[1])<26)NEAR=performance.now()}}}
function cityF(sc,pi,wl,pos){const p=S().planets[pi],pal=PAL[D.PLANETS[pi].id]||PAL.bhumi,n=p.unlocked?Math.min(36,Math.round(1+p.population/5+Object.values(p.buildings).reduce((a,b)=>a+b,0)*.7+(p.sustained?6:0))):0;return layout(sc,pal,n,pi*977+13,wl,{core:"capital",avoid:[{x:pos[0],z:pos[1],r:30}],dmin:50,dmax:100})}
const old=window.DS_legacy;window.DS_legacy=(sc,pi,st)=>{const f=old?old(sc,pi,st):null,p=S().planets[pi],wl=-2+p.water*.017,hab=!window.DS_hab||DS_hab(pi),pos=mahalPos(wl),pal=PAL[D.PLANETS[pi].id]||PAL.bhumi,m=mahal(pal,sc.userData.solid||[],pos);sc.add(m.g);
 const c=hab?cityF(sc,pi,wl,pos):outpost(sc,pi,wl),more=[];
 if(hab)(p.cities||[]).forEach((ct,ci)=>{const L=layout(sc,pal,Math.min(30,4+ct.lvl*4),pi*977+ci*131+97,wl,{cx:ct.x,cz:ct.z,dmin:20,dmax:50,core:"small",name:ct.n});c.win.push(...L.win);more.push(L);highway(sc,wl,{x:0,z:40},{x:ct.x,z:ct.z},c.rnd||L.rnd,more)});
 sc.userData.win=c.win;return(t,dt,pp)=>{f&&f(t,dt,pp);c.update(t,dt);more.forEach(u=>u.update?u.update(t,dt):u(t,dt));m.update(t,pp)}};


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
