/* rivers with boats and a ferry, seas with ships and a port (cross rivers and continents) */
(()=>{"use strict";
if(!window.DS3||!window.DS)return;
const D=DS,X=DS3,T=X.T,S=()=>D.S,M3=X.M3,mesh=X.mesh,L=(a,b,t)=>a+(b-a)*t;
function dhow(c){const g=new T.Group();g.add(mesh(new T.BoxGeometry(5.5,.9,1.9),M3(0x6a4a2a),0,.45,0));const pw=mesh(new T.ConeGeometry(.95,1.6,4),M3(0x6a4a2a),3.4,.5,0);pw.rotation.z=-1.5708;g.add(pw);g.add(mesh(new T.CylinderGeometry(.07,.07,5,6),M3(0x4a3018),0,3,0));const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(3.2,0);sh.lineTo(0,4.2);const s=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshStandardMaterial({color:c,side:T.DoubleSide,roughness:.9}));s.position.set(-.2,1,0);g.add(s);return g}
function ship(){const g=new T.Group();g.add(mesh(new T.BoxGeometry(16,2.2,4.4),M3(0x2a3a5a),0,1.1,0));const bw=mesh(new T.ConeGeometry(2.2,3.6,4),M3(0x2a3a5a),9.6,1.1,0);bw.rotation.z=-1.5708;bw.rotation.x=.78;g.add(bw);g.add(mesh(new T.BoxGeometry(5,3,3.4),M3(0xf2efe6),-3,3.7,0));g.add(mesh(new T.CylinderGeometry(.9,.9,3,10),M3(0xff9933),-3,6.7,0));[0,2.4,4.8].forEach((x,i)=>g.add(mesh(new T.BoxGeometry(1.8,1.6,3.4),M3([0xd23a3a,0x3a7ad2,0xf2b134][i]),x+1,2.8,0)));return g}
function ferry(){const g=new T.Group();g.add(mesh(new T.BoxGeometry(8,.7,3.6),M3(0x8a5a2a),0,.35,0));[-3.4,3.4].forEach(x=>[-1.6,1.6].forEach(z=>g.add(mesh(new T.CylinderGeometry(.08,.08,2.2,6),M3(0xcccccc),x,1.5,z))));g.add(mesh(new T.BoxGeometry(8.4,.2,4),M3(0xff9933),0,2.7,0));return g}
let near=null,nearT=0,ride=null,lastSt=null;
const btn=document.createElement("button");btn.className="go";Object.assign(btn.style,{position:"absolute",left:"50%",bottom:"130px",transform:"translateX(-50%)",width:"auto",padding:"10px 18px",zIndex:70,display:"none"});document.getElementById("app").appendChild(btn);
setInterval(()=>{const on=near&&performance.now()-nearT<400&&!ride&&S().view==="world"&&!X.busy();btn.style.display=on?"block":"none";if(on)btn.textContent=near.label},250);
btn.onclick=()=>{if(!near||ride||!lastSt)return;ride={a:{x:lastSt.x,z:lastSt.z},b:near.to,t:0,d:near.sea?8:6,boat:near.boat};D.toast(near.sea?"🚢 Setting sail…":"⛵ The ferry departs…")};
const old=window.DS_legacy;window.DS_legacy=(sc,pi,st)=>{const f=old?old(sc,pi,st):null,p=S().planets[pi];if(!X.WV.r)return f;const wl=-2+p.water*.017,boats=[],opts=[];
 const land=(x,z,dx)=>{for(let k=0;k<12;k++){const xx=x+dx*k*1.5;if(X.Hh(xx,z)>wl+.35)return xx}return null};
 for(let k=0;k<3;k++){const b=dhow([0xffffff,0xff9933,0xf2efe6][k]);b.position.y=wl+.1;sc.add(b);boats.push({b,z:-110+k*75,v:3+k})}
 let fer=null;for(let t=0;t<6&&!fer;t++){const zc=-26+t*13*(t%2?-1:1),xr=X.riverX(zc),a=land(xr-9,zc,-1),b=land(xr+9,zc,1);if(a!=null&&b!=null)fer={zc,a,b}}
 let fm=null;if(fer){fm=ferry();sc.add(fm);[fer.a,fer.b].forEach(x=>{const pier=mesh(new T.BoxGeometry(4,.5,3),M3(0x8a5a2a),x,X.Hh(x,fer.zc)+.3,fer.zc);sc.add(pier)});
  opts.push({x:fer.a,z:fer.zc,to:{x:fer.b,z:fer.zc},label:"⛵ Take the ferry across the river",boat:fm,sea:0},{x:fer.b,z:fer.zc,to:{x:fer.a,z:fer.zc},label:"⛵ Take the ferry across the river",boat:fm,sea:0})}
 const ships=[];let sm=null,se=null,sw=null;
 if(X.WV.s){for(let k=0;k<3;k++){const s=ship();s.position.y=wl+.1;sc.add(s);ships.push({s,z:-100+k*80,v:4+k})}
  se=land(-92,0,1);sw=land(-118,0,-1);if(se!=null&&sw!=null){sm=ship();sc.add(sm);[se,sw].forEach(x=>sc.add(mesh(new T.BoxGeometry(6,.6,4),M3(0x8a5a2a),x,X.Hh(x,0)+.3,0)));
   opts.push({x:se,z:0,to:{x:sw,z:0},label:"🚢 Board the ship to the far continent",boat:sm,sea:1},{x:sw,z:0,to:{x:se,z:0},label:"🚢 Board the ship to the far continent",boat:sm,sea:1})}}
 return(t,dt,s)=>{f&&f(t,dt,s);lastSt=s;
  boats.forEach(o=>{o.z+=o.v*dt;if(o.z>130)o.z=-130;const x=X.riverX(o.z),dx=48*.018*Math.cos(o.z*.018+1.3);o.b.position.set(x,wl+.1+Math.sin(t*2+o.z)*.05,o.z);o.b.rotation.y=-Math.atan2(1,dx)})
  ships.forEach(o=>{o.z+=o.v*dt;if(o.z>130)o.z=-130;o.s.position.set(-105,wl+.1,o.z);o.s.rotation.y=-Math.atan2(1,0)});
  if(fm&&!(ride&&ride.boat===fm)){const u=(1+Math.sin(t*.26))/2;fm.position.set(L(fer.a,fer.b,u),wl+.15,fer.zc)}
  if(sm&&!(ride&&ride.boat===sm)){const u=(1+Math.sin(t*.18))/2;sm.position.set(L(se,sw,u),wl+.1,0)}
  if(ride){ride.t+=dt;const u=Math.min(1,ride.t/ride.d),e=u*u*(3-2*u);s.x=L(ride.a.x,ride.b.x,e);s.z=L(ride.a.z,ride.b.z,e);ride.boat.position.set(s.x,wl+.15,s.z);ride.boat.rotation.y=ride.b.x>ride.a.x?0:Math.PI;if(u>=1){s.x=ride.b.x;s.z=ride.b.z;ride=null}}
  else{let best=null,bd=9;opts.forEach(o=>{const d=Math.hypot(s.x-o.x,s.z-o.z);if(d<bd){bd=d;best=o}});if(best){near=best;nearT=performance.now()}}}};
})();
