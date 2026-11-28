/* Dreamscape v10: moons of every world and scientific expeditions to them */
(()=>{"use strict";
if(!window.DS)return;
const D=DS,S=()=>D.S,$=id=>document.getElementById(id);
const MN=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Shravana","Dhanishta","Revati","Uttara","Purva","Abhijit","Shatabhisha"];
const NOTE=["Its dust holds traces of the ancient asteroid's alloy.","Caves of ice lie beneath its dusty plains.","A perfectly round crater hints at a collision with a shard.","Its slow tides lift the oceans below.","Faint radio whispers echo from its far side — natural, say the scientists."];
const moonsOf=pi=>{const n=1+((pi*5+2)%3),a=[];for(let j=0;j<n;j++)a.push({id:j,n:MN[(pi*3+j)%24],r:32+j*9,size:2.2+((pi+j)%3)*.9,col:[0xcfcfd8,0xb8a890,0x9aa0b8][(pi+j)%3]});return a};
const st=pi=>{const s=S();if(!s.moons)s.moons={};if(!s.moons[pi])s.moons[pi]=moonsOf(pi).map(()=>({s:0,end:0,k:null}));return s.moons[pi]};
window.DS_moons=pi=>moonsOf(pi).map((m,j)=>Object.assign({},m,{state:st(pi)[j].s}));
const ST=[["Survey",100,0,60,"a survey flyby: +50 📡 and a sample"],["Landing",200,150,120,"a crewed landing: +150 📡"],["Outpost",400,300,240,"a permanent outpost: +1.5 ⚡/s and +0.2 📡/s for its world"]];
const LAB=["Unvisited","Surveyed","Landed","Outpost"];
setInterval(()=>{const s=S();if(!s||!s.onboarded)return;const now=Date.now();
 s.planets.forEach((p,pi)=>{if(!p.unlocked)return;const ms=st(pi),mo=moonsOf(pi);ms.forEach((m,j)=>{
  if(m.k!==null&&now>=m.end){m.s=m.k+1;if(m.k===0)s.data+=50;if(m.k===1)s.data+=150;const t=`🌙 Expedition to ${mo[j].n}, moon of ${D.PLANETS[pi].n}: ${LAB[m.s].toLowerCase()} complete. ${NOTE[(pi+j+m.s)%5]}`;m.k=null;D.toast("🌙 "+mo[j].n+" — "+LAB[m.s]);D.chron(t);window.DS_news&&DS_news(t)}
  if(m.s>=3){p.energy+=1.5;s.data+=.2}})})},1000);
function open(){const s=S(),now=Date.now();
 D.show("🌙 Moon Expeditions","Scientific missions to the moons of your worlds",s.planets.map((p,pi)=>!p.unlocked?"":`<h3 style="font-size:13px;margin:10px 0 4px">${D.PLANETS[pi].n}</h3>`+moonsOf(pi).map((m,j)=>{const q=st(pi)[j],a=ST[q.s];return`<div class="sat"><span>🌙 ${m.n} · ${LAB[q.s]}${q.k!==null?` — ${Math.max(0,Math.ceil((q.end-now)/1000))}s left`:""}</span><span>${q.s>=3?"✔":q.k!==null?"…":`<button class="go" data-m="${pi}:${j}" style="width:auto;padding:4px 10px;margin:0">${a[0]} · 📡${a[1]}${a[2]?" ⚡"+a[2]:""}</button>`}</span></div>`}).join("")).join(""));
 document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const[pi,j]=b.dataset.m.split(":").map(Number),q=st(pi)[j],a=ST[q.s],p=s.planets[pi];if(s.data<a[1]||p.energy<a[2])return D.toast(`Need 📡${a[1]} and ⚡${a[2]} on ${D.PLANETS[pi].n}.`);s.data-=a[1];p.energy-=a[2];q.k=q.s;q.end=Date.now()+a[3]*1000;D.toast("🚀 Mission launched: "+a[4]);D.save();open()})}
const b=document.createElement("button");b.textContent="🌙 Moon Expeditions";b.onclick=open;document.querySelector(".navbtns").appendChild(b);
})();
