/* dedicated planet maps and multi-city settlement — every world has its own terrain, rivers and seas; found, grow and visit cities */
(()=>{"use strict";
if(!window.DS3||!window.DS)return;
const D=DS,X=DS3,S=()=>D.S,$=id=>document.getElementById(id),WV=X.WV;
const NAMES=["Ayodhya","Hastinapur","Indraprastha","Dwarka","Kashi","Ujjain","Pataliputra","Vijayanagara","Mathura","Madurai","Nalanda","Taxila"];
let cur=0,pick=null;
const cities=pi=>{const p=S().planets[pi];if(!p.cities)p.cities=[];return p.cities};
function withWorld(pi,fn){const sv={r:WV.r,s:WV.s,p:WV.p},p=S().planets[pi];WV.r=p.water>=20?1:0;WV.s=p.water>=50?1:0;WV.p=pi*1.7;try{return fn(-2+p.water*.017)}finally{WV.r=sv.r;WV.s=sv.s;WV.p=sv.p}}
function drawMap(cv,pi){const p=S().planets[pi],c=D.PLANETS[pi],ctx=cv.getContext("2d"),N=250,im=ctx.createImageData(N,N),cs=cities(pi),col=[parseInt(c.col.slice(1,3),16),parseInt(c.col.slice(3,5),16),parseInt(c.col.slice(5,7),16)];
 withWorld(pi,wl=>{for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i-N/2)*2,z=(j-N/2)*2,h=X.Hh(x,z),k=(j*N+i)*4;let r,g,b;if(h<wl){const d=Math.min(1,(wl-h)/6);r=30-d*15;g=95-d*35;b=170-d*40}else{const sh=Math.max(-.3,Math.min(.3,(X.Hh(x+2,z)-h)*.12)),gr=p.biosphere/100;r=col[0]*(1-gr*.5)+30*gr;g=col[1]*(1-gr*.5)+75*gr;b=col[2]*(1-gr*.5)+35*gr;if(h<wl+.5){r=205;g=190;b=150}const f=1+sh+(h>3?.15:0);r*=f;g*=f;b*=f}im.data[k]=r;im.data[k+1]=g;im.data[k+2]=b;im.data[k+3]=255}});
 ctx.putImageData(im,0,0);const P=v=>v/2+N/2,dot=(x,z,r,f)=>{ctx.fillStyle=f;ctx.beginPath();ctx.arc(P(x),P(z),r,0,6.3);ctx.fill()},tx=(t,x,z,f)=>{ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillText(t,P(x)+1,P(z)+1);ctx.fillStyle=f||"#fff";ctx.fillText(t,P(x),P(z))};
 ctx.strokeStyle="rgba(255,255,255,.35)";ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(P(0),P(0),50,0,6.3);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle="#ffd56b";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(P(0),P(-46));ctx.lineTo(P(0),P(40));ctx.stroke();
 cs.forEach(q=>{ctx.strokeStyle="rgba(240,230,200,.8)";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(P(0),P(40));ctx.lineTo(P(q.x),P(q.z));ctx.stroke()});
 dot(0,0,5,"#ff9933");tx("Rajdhani",0,10,"#ffd9a0");dot(0,-46,3,"#fff");tx("Mahal",0,-50);cs.forEach(q=>{dot(q.x,q.z,4+q.lvl,"#ff9933");tx(q.n,q.x,q.z-9,"#ffd9a0")});
 const st=X.curSt&&X.curSt();if(st&&S().view==="world"&&S().selectedPlanet===pi&&!S().visit)dot(st.x,st.z,3,"#66ffee");
 if(pick){dot(pick.x,pick.z,4,pick.err?"#ff6b6b":"#74e7a5");ctx.strokeStyle=pick.err?"#ff6b6b":"#74e7a5";ctx.beginPath();ctx.arc(P(pick.x),P(pick.z),9,0,6.3);ctx.stroke()}}
function check(pi,x,z){const p=S().planets[pi],cs=cities(pi);if(!p.hab)return"This world is not habitable yet.";if(cs.length>=4)return"This world already has the maximum of four extra cities.";if(p.population<25*(cs.length+1))return`A new city needs a population of ${25*(cs.length+1)}.`;
 const h=withWorld(pi,wl=>X.Hh(x,z)-wl);if(h<.8)return"That site is under water — choose dry land.";if(Math.hypot(x,z)<150)return"Too close to the capital — choose a site at least 150 units away.";if(Math.hypot(x,z)>225)return"That site is beyond the edge of the world.";if(cs.some(q=>Math.hypot(q.x-x,q.z-z)<125))return"Too close to another city.";return null}
function open(pi){const s=S(),un=s.planets.map((p,i)=>i).filter(i=>s.planets[i].unlocked);if(pi==null)pi=un.includes(cur)?cur:(s.location??s.selectedPlanet);cur=pi;const p=s.planets[pi],cs=cities(pi),nm=D.PLANETS[pi].n;if(pick&&pick.pi!==pi)pick=null;
 const ph=window.DS_phys?DS_phys(pi):null;
 D.show("🗺 Planet Map — "+nm,`${p.hab?"Habitable":"Not yet habitable"} · population ${Math.floor(p.population)} · ${cs.length+1} cit${cs.length?"ies":"y"} · water ${p.water.toFixed(0)}%${ph?` · ${ph.g.toFixed(2)} g`:""}`,
 `<div style="display:flex;gap:6px"><button class="go" id="mp" style="margin:0">◀</button><button class="go" id="mn" style="margin:0">▶</button></div>
 <canvas id="pmap" width="250" height="250" style="width:100%;margin-top:8px;border-radius:12px;cursor:crosshair;image-rendering:pixelated"></canvas>
 <p style="font-size:11.5px;color:var(--muted);line-height:1.5">Blue = water (rivers and seas). Gold line = Rajpath to the Mahal. Tap dry land at least 150 units from the capital to choose a site for a new city.</p>
 <div id="pinfo" style="font-size:12.5px;min-height:20px"></div><button class="go" id="found" ${pick&&!pick.err?"":"disabled style='opacity:.4'"}>🏙 Found a city here · 💰${300+150*cs.length}</button>
 <h3 style="font-size:13px;margin:12px 0 4px">Cities</h3><div class="sat"><span>Rajdhani (capital)</span><span>pop ${Math.floor(p.population)}</span></div>
 ${cs.map((q,i)=>`<div class="sat"><span>${q.n} · level ${q.lvl}</span><span><button class="go" data-dv="${i}" style="width:auto;padding:4px 10px;margin:0" ${q.lvl>=5?"disabled":""}>Develop 💰${150*q.lvl}</button> <button class="go" data-vs="${i}" style="width:auto;padding:4px 10px;margin:0">Visit</button></span></div>`).join("")}`);
 const cv=$("pmap");drawMap(cv,pi);if(pick)$("pinfo").textContent=pick.err||"Site is suitable.";if(pick&&pick.err)$("pinfo").style.color="#ff9d9d";
 cv.onclick=e=>{const r=cv.getBoundingClientRect(),x=((e.clientX-r.left)/r.width-.5)*500,z=((e.clientY-r.top)/r.height-.5)*500;pick={pi,x,z,err:check(pi,x,z)};open(pi)};
 $("mp").onclick=()=>{open(un[(un.indexOf(pi)+un.length-1)%un.length])};$("mn").onclick=()=>{open(un[(un.indexOf(pi)+1)%un.length])};
 const pay=amt=>{const f=s.fin;if(f){if(f.k<amt){D.toast("The treasury needs "+amt+" Kosha.");return false}f.k-=amt}else{if(s.influence<amt/2){D.toast("Need ☸"+amt/2);return false}s.influence-=amt/2}return true};
 $("found").onclick=()=>{if(!pick||pick.err)return;const e2=check(pi,pick.x,pick.z);if(e2)return D.toast(e2);if(!pay(300+150*cs.length))return;const name=NAMES[(cs.length+pi*3)%12];cs.push({n:name,x:Math.round(pick.x),z:Math.round(pick.z),lvl:1});pick=null;D.chron(`🏙 ${name} was founded on ${nm}.`);D.toast("🏙 "+name+" founded!");D.save();open(pi)};
 document.querySelectorAll("[data-dv]").forEach(b=>b.onclick=()=>{const q=cs[+b.dataset.dv];if(q.lvl>=5||!pay(150*q.lvl))return;q.lvl++;D.chron(`🏗 ${q.n} grew to level ${q.lvl}.`);D.save();open(pi)});
 document.querySelectorAll("[data-vs]").forEach(b=>b.onclick=()=>{const q=cs[+b.dataset.vs],st=X.curSt&&X.curSt();if(st&&s.view==="world"&&s.selectedPlanet===pi&&!s.visit){st.x=q.x;st.z=q.z+16;st.a=Math.PI;D.closeModal();D.toast("🚗 The royal convoy arrives in "+q.n)}else D.toast("Walk this world first (👑), then use Visit.")})}
window.DS_map=open;
const b=document.createElement("button");b.textContent="🗺 Planet Map";b.onclick=()=>open();document.querySelector(".navbtns").appendChild(b);
})();
