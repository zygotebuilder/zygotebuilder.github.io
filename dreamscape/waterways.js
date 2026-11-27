/* Waterways with a purpose — passenger ferries and liners link the lands; cargo ships shuttle between ports with cranes and earn trade income */
(()=>{"use strict";
if(!window.DS3||!window.DS)return;
const D=DS,X=DS3,T=X.T,S=()=>D.S,M3=X.M3,mesh=X.mesh,L=(a,b,t)=>a+(b-a)*t;
const COLS=[0xd23a3a,0x3a7ad2,0xf2b134,0x3aa86a];
function cargoGroup(n,sx){const g=new T.Group();for(let i=0;i<n;i++)g.add(mesh(new T.BoxGeometry(sx,.9,1.2),M3(COLS[i%4]),-1.4+i*(sx+.1),1.3+(i>2?.95:0),(i%2?.3:-.3)));return g}
function dhow(c){const g=new T.Group();g.add(mesh(new T.BoxGeometry(5.5,.9,1.9),M3(0x6a4a2a),0,.45,0));const pw=mesh(new T.ConeGeometry(.95,1.6,4),M3(0x6a4a2a),3.4,.5,0);pw.rotation.z=-1.5708;g.add(pw);g.add(mesh(new T.CylinderGeometry(.07,.07,5,6),M3(0x4a3018),-1.8,3,0));const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(2.6,0);sh.lineTo(0,4);const s=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshStandardMaterial({color:c,side:T.DoubleSide,roughness:.9}));s.position.set(-1.9,1,0);g.add(s);const cg=cargoGroup(3,1.3);g.add(cg);g.userData.cargo=cg;return g}
function ship(){const g=new T.Group();g.add(mesh(new T.BoxGeometry(16,2.2,4.4),M3(0x2a3a5a),0,1.1,0));const bw=mesh(new T.ConeGeometry(2.2,3.6,4),M3(0x2a3a5a),9.6,1.1,0);bw.rotation.z=-1.5708;bw.rotation.x=.78;g.add(bw);g.add(mesh(new T.BoxGeometry(4,3,3.4),M3(0xf2efe6),-5,3.7,0));g.add(mesh(new T.CylinderGeometry(.9,.9,3,10),M3(0xff9933),-5,6.7,0));const cg=cargoGroup(5,2);cg.position.set(3,.5,0);g.add(cg);g.userData.cargo=cg;return g}
function liner(){const g=new T.Group();g.add(mesh(new T.BoxGeometry(16,2.2,4.4),M3(0xf2efe6),0,1.1,0));g.add(mesh(new T.BoxGeometry(12,2.4,3.8),M3(0x6fa8c9,{metalness:.4}),-1,3.4,0));g.add(mesh(new T.BoxGeometry(8,1.6,3.4),M3(0xffffff),-1,5.2,0));g.add(mesh(new T.CylinderGeometry(.8,.8,2.4,10),M3(0xff9933),-3,6.8,0));const bw=mesh(new T.ConeGeometry(2.2,3.6,4),M3(0xf2efe6),9.6,1.1,0);bw.rotation.z=-1.5708;g.add(bw);return g}
function ferry(){const g=new T.Group();g.add(mesh(new T.BoxGeometry(8,.7,3.6),M3(0x8a5a2a),0,.35,0));[-3.4,3.4].forEach(x=>[-1.6,1.6].forEach(z=>g.add(mesh(new T.CylinderGeometry(.08,.08,2.2,6),M3(0xcccccc),x,1.5,z))));g.add(mesh(new T.BoxGeometry(8.4,.2,4),M3(0xff9933),0,2.7,0));
 g.userData.pax=[];for(let k=0;k<4;k++){const pr=X.person([0xff9933,0x3a8fd6,0xe85a8a,0x74a84a][k],k%2===1,false,{lite:1});pr.scale.setScalar(.7);pr.position.set(-2.4+k*1.6,.6,k%2?.9:-.9);g.add(pr);g.userData.pax.push(pr)}return g}
function mkPort(sc,x,z,dir){const g=new T.Group();g.add(mesh(new T.BoxGeometry(9,.6,5),M3(0x8a5a2a),dir*4,.3,0));g.add(mesh(new T.BoxGeometry(5,3.4,4),M3(0xd8c8a8),-dir*5,1.7,0));g.add(mesh(new T.BoxGeometry(5.4,.4,4.4),M3(0xb5442a),-dir*5,3.6,0));
 for(let i=0;i<3;i++)g.add(mesh(new T.BoxGeometry(2.4,1.1,1.2),M3(COLS[i]),-dir*1.5,.9+i*1.15,-3.2));g.add(mesh(new T.CylinderGeometry(.3,.4,8,8),M3(0xf2b134),dir*.5,4,3));
 const jib=new T.Group();jib.position.set(dir*.5,8,3);jib.add(mesh(new T.BoxGeometry(9,.4,.4),M3(0xf2b134),dir*2,0,0));jib.add(mesh(new T.CylinderGeometry(.04,.04,3,4),M3(0x333333),dir*5,-1.5,0));g.add(jib);
 g.position.set(x,X.Hh(x,z)+.1,z);sc.add(g);return{g,jib}}
let near=null,nearT=0,ride=null,lastSt=null,lastT=-9999;
const btn=document.createElement("button");btn.className="go";Object.assign(btn.style,{position:"absolute",left:"50%",bottom:"130px",transform:"translateX(-50%)",width:"auto",padding:"10px 18px",zIndex:70,display:"none"});document.getElementById("app").appendChild(btn);
setInterval(()=>{const on=near&&performance.now()-nearT<400&&!ride&&S().view==="world"&&!X.busy();btn.style.display=on?"block":"none";if(on)btn.textContent=near.label},250);
btn.onclick=()=>{if(!near||ride||!lastSt)return;ride={a:{x:lastSt.x,z:lastSt.z},b:near.to,t:0,d:near.sea?8:6,boat:near.boat};D.toast(near.sea?"🚢 The liner departs with its passengers…":"⛵ The ferry departs…")};
const old=window.DS_legacy;window.DS_legacy=(sc,pi,st)=>{const f=old?old(sc,pi,st):null,p=S().planets[pi];if(!X.WV.r||(window.DS_hab&&!DS_hab(pi)))return f;const wl=-2+p.water*.017,opts=[],tr=[],pax=[];
 const land=(x,z,dx)=>{for(let k=0;k<14;k++){const xx=x+dx*k*1.5;if(X.Hh(xx,z)>wl+.35)return xx}return null};
 const pay=(amt,txt)=>{const s=S();s.trade=s.trade||{n:0,k:0};s.trade.n++;s.trade.k+=amt;if(s.fin)s.fin.k+=amt;if(performance.now()-lastT>8000){lastT=performance.now();D.toast(`⚓ ${txt}: +${amt} Kosha`)}};
 const route=(zs,xAt,ports,mk,income,spd)=>{if(!ports[0]||!ports[1])return;const ps=ports.map(q=>mkPort(sc,q.x,q.z,q.dir)),ships=[0,1].map(k=>{const b=mk(k);sc.add(b);return{b,z:zs[0]+k*(zs[1]-zs[0])*.5,dir:1,w:0,cargo:!k}});
  tr.push((t,dt)=>ships.forEach(o=>{if(o.w>0){o.w-=dt;ps[Math.abs(o.z-zs[1])<Math.abs(o.z-zs[0])?1:0].jib.rotation.y=Math.sin(t*1.2)*.8}else{o.z+=o.dir*spd*dt;if(o.z>=zs[1]){o.z=zs[1];o.dir=-1;o.w=6;if(o.cargo){pay(income,"Cargo delivered");o.cargo=false}else o.cargo=true}else if(o.z<=zs[0]){o.z=zs[0];o.dir=1;o.w=6;if(o.cargo){pay(income,"Cargo delivered");o.cargo=false}else o.cargo=true}}
   const x=xAt(o.z),dx=x.d*o.dir;o.b.position.set(x.x,wl+.1+Math.sin(t*2+o.z)*.05,o.z);o.b.rotation.y=-Math.atan2(o.dir,dx);o.b.userData.cargo.visible=o.cargo}))};
 /* river: cargo shuttles between two river ports */
 const rport=z=>{const xr=X.riverX(z);let x=land(xr+9,z,1),dir=-1;if(x==null){x=land(xr-9,z,-1);dir=1}return x==null?null:{x,z,dir}};
 route([-90,90],z=>({x:X.riverX(z),d:48*.018*Math.cos(z*.018+1.3+X.WV.p*.4)}),[rport(-90),rport(90)],k=>dhow(k?0xff9933:0xffffff),30,5);
 /* river passenger ferry between the two lands */
 let fer=null;for(let t=0;t<6&&!fer;t++){const zc=-26+t*13*(t%2?-1:1),xr=X.riverX(zc),a=land(xr-9,zc,-1),b=land(xr+9,zc,1);if(a!=null&&b!=null)fer={zc,a,b}}
 let fm=null;if(fer){fm=ferry();sc.add(fm);pax.push(...fm.userData.pax);[fer.a,fer.b].forEach(x=>sc.add(mesh(new T.BoxGeometry(4,.5,3),M3(0x8a5a2a),x,X.Hh(x,fer.zc)+.3,fer.zc)));
  opts.push({x:fer.a,z:fer.zc,to:{x:fer.b,z:fer.zc},label:"⛵ Passenger ferry — cross the river to the other land",boat:fm,sea:0},{x:fer.b,z:fer.zc,to:{x:fer.a,z:fer.zc},label:"⛵ Passenger ferry — cross the river to the other land",boat:fm,sea:0})}
 /* sea: cargo ships between two seaports, passenger liner to the far continent */
 let lm=null,se=null,sw=null;
 if(X.WV.s){const sp=z=>{const x=land(-92,z,1);return x==null?null:{x,z,dir:-1}};route([-60,60],z=>({x:-105,d:0}),[sp(-60),sp(60)],()=>ship(),60,4);
  se=land(-92,0,1);sw=land(-118,0,-1);if(se!=null&&sw!=null){lm=liner();sc.add(lm);[se,sw].forEach(x=>sc.add(mesh(new T.BoxGeometry(6,.6,4),M3(0x8a5a2a),x,X.Hh(x,0)+.3,0)));
   opts.push({x:se,z:0,to:{x:sw,z:0},label:"🚢 Passenger liner — sail to the far continent",boat:lm,sea:1},{x:sw,z:0,to:{x:se,z:0},label:"🚢 Passenger liner — sail to the far continent",boat:lm,sea:1})}}
 return(t,dt,s)=>{f&&f(t,dt,s);lastSt=s;tr.forEach(u=>u(t,dt));pax.forEach((q,k)=>X.anim(q,t+k,0,false));
  if(fm&&!(ride&&ride.boat===fm)){const u=(1+Math.sin(t*.26))/2;fm.position.set(L(fer.a,fer.b,u),wl+.15,fer.zc)}
  if(lm&&!(ride&&ride.boat===lm)){const u=(1+Math.sin(t*.18))/2;lm.position.set(L(se,sw,u),wl+.1,0)}
  if(ride){ride.t+=dt;const u=Math.min(1,ride.t/ride.d),e=u*u*(3-2*u);s.x=L(ride.a.x,ride.b.x,e);s.z=L(ride.a.z,ride.b.z,e);ride.boat.position.set(s.x,wl+.15,s.z);ride.boat.rotation.y=ride.b.x>ride.a.x?0:Math.PI;if(u>=1){s.x=ride.b.x;s.z=ride.b.z;ride=null}}
  else{let best=null,bd=9;opts.forEach(o=>{const d=Math.hypot(s.x-o.x,s.z-o.z);if(d<bd){bd=d;best=o}});if(best){near=best;nearT=performance.now()}}}};
})();
