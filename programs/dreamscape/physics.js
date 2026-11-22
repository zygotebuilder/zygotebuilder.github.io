/* planetary physics (gravity, pressure, gases, temperature, radiation), habitability, science projects, settler transport, comms & navigation */
(()=>{"use strict";
if(!window.DS)return;
const D=DS,S=()=>D.S,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const BASE=[[.92,-20,1.2],[1.1,5,.9],[.55,-40,1.8],[1.4,70,2.5],[.4,-90,3],[.3,-60,2.8],[1,10,.7],[1.7,45,2.2]];
const PROJ={mir:["🪞 Orbital Mirror Array","Warms cold worlds / shades hot ones (±6 °C per level)"],mag:["🧲 Magnetosphere Generator","Superconducting ring: radiation −22% per level"],grv:["⚖ Graviton Tether Lattice","Pulls gravity toward 1 g (25% per level)"],proc:["🌬 Atmosphere Processor Spires","Pressure +0.07 bar and O₂ +1.2% per level"],comet:["☄ Comet Harvest Fleet","Delivers ice: oceans +8% per level"],comm:["📡 Quantum Comm Tower","+25% communications coverage per level"],nav:["🧭 Dishā Navigation Constellation","Navigation grid: rocket fuel −10% per level"]};
const sci=i=>{const s=S();if(!s.sci)s.sci=[];while(s.sci.length<8)s.sci.push({mir:0,mag:0,grv:0,proc:0,comet:0,comm:0,nav:0,q:null});return s.sci[i]};
function phys(i){const p=S().planets[i],c=sci(i),b=BASE[i],a=p.atmosphere/100,w=p.water/100,bio=p.biosphere/100,po=p.pollution/100;
 const P=.02+a*1.05+c.proc*.07,o2=clamp(bio*28+a*3-po*2+c.proc*1.2,0,32),co2=clamp(95-a*80-bio*12+po*8,.04,95),n2=Math.max(0,100-o2-co2),t0=b[1],T=lerp(t0,15,clamp(a*.8+w*.2,0,1))+c.mir*6*(t0<0?1:-1),g=lerp(b[0],1,clamp(c.grv*.25,0,1)),rad=b[2]*(1-clamp(c.mag*.22,0,.85))*(1-clamp(a*.6,0,.6)),cov=clamp(c.comm*25+Math.min(6,S().agency?S().agency.cnt:0)*5,0,100);
 const chk=[["Gravity 0.75–1.25 g",g>=.75&&g<=1.25],["Pressure 0.6–1.5 bar",P>=.6&&P<=1.5],["Oxygen 16–25%",o2>=16&&o2<=25],["Temperature −5…38 °C",T>=-5&&T<=38],["Radiation < 1 mSv/day",rad<1],["Oceans ≥ 15%",p.water>=15]];
 return{g,P,o2,co2,n2,T,rad,cov,nav:c.nav,comm:c.comm,chk,ok:chk.every(x=>x[1]),sci:c}}
window.DS_phys=phys;window.DS_hab=i=>{if(i>=20)return true;const p=S().planets[i];return !!p&&p.hab!==false};
window.DS_nav=()=>Math.min(.5,(S().sci||[]).reduce((a,c)=>a+c.nav,0)*.1+(window.DS_navX?DS_navX():0));
S().planets.forEach(p=>{if(p.hab===undefined)p.hab=p.population>0}); // keep existing settlers
setInterval(()=>{const s=S();if(!s||!s.onboarded)return;const now=Date.now();
 s.planets.forEach((p,i)=>{if(!p.unlocked)return;const c=sci(i),ph=phys(i),nm=D.PLANETS[i].n;
  if(c.q&&now>=c.q.end){c[c.q.k]++;if(c.q.k==="comet")p.water=Math.min(100,p.water+8);D.toast("🔬 "+PROJ[c.q.k][0]+" complete on "+nm);D.chron(`🔬 ${PROJ[c.q.k][0]} completed on ${nm}.`);c.q=null}
  if(!p.hab){if(ph.ok){p.habT=(p.habT||0)+1;if(p.habT>=90){p.hab=true;p.badT=0;D.toast("🌍 "+nm+" is now habitable — settlers are arriving");D.chron(`🌍 ${nm} became habitable. Settlers will be transported from other worlds.`)}}else p.habT=0}
  else{if(!ph.ok){p.badT=(p.badT||0)+1;if(p.badT>=120){p.hab=false;p.habT=0;D.chron(`⚠ ${nm} is no longer habitable; settlers evacuate.`)}}else p.badT=0}
  if(p.hab&&p.population<p.popCap){const d=s.planets.filter((q,j)=>j!==i&&q.hab&&q.population>25).sort((a,b)=>b.population-a.population)[0];if(d){const amt=Math.min(.5,p.popCap-p.population);d.population-=amt;p.population+=amt;s.mig={to:i,from:s.planets.indexOf(d),t:now}}}})},1000);
let cur=0;
function open(){const s=S(),un=s.planets.map((p,i)=>i).filter(i=>s.planets[i].unlocked);if(!un.includes(cur))cur=un[0];const i=cur,p=s.planets[i],c=sci(i),ph=phys(i),nm=D.PLANETS[i].n,now=Date.now();
 const gr=(l,v,u,lo,hi,max)=>`<div class="lbl"><span>${l}</span><span>${v}${u}</span></div><div class="bar"><i style="width:${clamp(v/max*100,0,100)}%;background:${v>=lo&&v<=hi?"#74e7a5":"#ffb347"}"></i></div>`;
 const hs=p.hab?`<div class="badge">✔ Habitable — settlers flow in from other worlds</div>`:ph.ok?`<div class="badge" style="background:#ffd56b">Stabilising ecology… ${p.habT|0}/90 s</div>`:`<div class="card" style="margin:0">Not habitable. Only scientists, astronauts and the royal party in space suits may walk here.</div>`;
 D.show("🔬 Planetary Science",nm,`<div style="display:flex;gap:6px"><button class="go" id="pp" style="margin:0">◀</button><button class="go" id="pn" style="margin:0">▶</button></div>${hs}
 ${gr("Gravity",ph.g.toFixed(2)," g",.75,1.25,2)}${gr("Pressure",ph.P.toFixed(2)," bar",.6,1.5,2)}${gr("Oxygen",ph.o2.toFixed(1),"%",16,25,32)}${gr("Temperature",ph.T.toFixed(0)," °C",-5,38,100)}${gr("Radiation",ph.rad.toFixed(2)," mSv/d",0,.99,3)}
 <div class="lbl"><span>CO₂ ${ph.co2.toFixed(1)}% · N₂ ${ph.n2.toFixed(1)}% · oceans ${p.water.toFixed(0)}%</span><span>Comms ${ph.cov.toFixed(0)}% · Nav ${c.nav}</span></div>
 <h3 style="font-size:13px;margin:10px 0 4px">Habitability conditions</h3>${ph.chk.map(x=>`<div class="sat"><span>${x[1]?"✔":"✘"} ${x[0]}</span></div>`).join("")}
 <h3 style="font-size:13px;margin:12px 0 4px">Science projects ${c.q?`<small style="color:var(--muted)">— ${PROJ[c.q.k][0]}: ${Math.max(0,Math.ceil((c.q.end-now)/1000))}s left</small>`:""}</h3>
 <div class="grid">${Object.keys(PROJ).map(k=>`<div class="card"><b>${PROJ[k][0]} · Lv.${c[k]}</b>${PROJ[k][1]}<button class="go" data-k="${k}" ${c.q||c[k]>=5?"disabled":""}>📡${150*(c[k]+1)} ⚡${100*(c[k]+1)} · ${45+25*c[k]}s</button></div>`).join("")}</div>`);
 $("pp").onclick=()=>{cur=un[(un.indexOf(cur)+un.length-1)%un.length];open()};$("pn").onclick=()=>{cur=un[(un.indexOf(cur)+1)%un.length];open()};
 document.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{const k=b.dataset.k,d=150*(c[k]+1),e=100*(c[k]+1);if(s.data<d||p.energy<e)return D.toast(`Need 📡${d} and ⚡${e} on ${nm}.`);s.data-=d;p.energy-=e;c.q={k,end:Date.now()+(45+25*c[k])*1000};D.save();open()})}
const b=document.createElement("button");b.textContent="🔬 Science";b.onclick=open;document.querySelector(".navbtns").appendChild(b);
})();
