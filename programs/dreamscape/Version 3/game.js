(()=>{"use strict";
const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SAVE_KEY="dreamscape_panchabhuta_v1", OFFLINE_CAP=8*3600, COUNCIL_EVERY=190;
const fmt=n=>{n=Math.floor(n*10)/10;return Math.abs(n)>=1e6?(n/1e6).toFixed(2)+"M":Math.abs(n)>=1e3?(n/1e3).toFixed(2)+"K":String(n)};

/* ---------- DATA ---------- */
const BUILDINGS={
 solar:{n:"Solar Array",i:"☀",d:"Generates Energy from starlight.",c:{energy:18,biomass:8},g:1.15},
 bioreactor:{n:"Bioreactor",i:"🧫",d:"Converts organic matter into Biomass.",c:{energy:22,biomass:12},g:1.15},
 terraform:{n:"Terraform Station",i:"🌍",d:"Raises atmosphere → oceans → biosphere.",c:{energy:38,biomass:28},g:1.18},
 habitat:{n:"Habitat Dome",i:"🏠",d:"Population capacity. Needs atmosphere ≥ 40%.",c:{energy:55,biomass:45},g:1.2,req:40},
 aiCore:{n:"AI Core",i:"🧠",d:"Turns population into Data.",c:{data:14},g:1.25},
 purifier:{n:"Bio-Purifier",i:"♻",d:"Reduces pollution.",c:{energy:32,biomass:18},g:1.17},
 shield:{n:"Raksha Kavach",i:"🛡",d:"Planetary shield; deters alien raids.",c:{energy:70,biomass:40},g:1.3},
 mandap:{n:"Yajna Mandap",i:"🔱",d:"Sacred hall: Influence and Dharma over time.",c:{energy:60,biomass:60},g:1.3}
};
const ORDER=Object.keys(BUILDINGS);
// el = element, bonus text, col = planet colour, sky = world-view sky gradient
const PLANETS=[
 {id:"bhumi",n:"Bhūmi Minor",el:"Earth · Prithvi",b:"Biomass ×1.5",col:"#8a7159",sky:["#2b1a0e","#7a5a3a"],size:30},
 {id:"jala",n:"Jala Prime",el:"Water · Apas",b:"Terraforming ×1.4",col:"#3f7ea8",sky:["#06284a","#2a7fb0"],size:36,u:[140,90]},
 {id:"vayu",n:"Vāyu Reach",el:"Air · Vayu",b:"Pollution ×0.5",col:"#b7c9d6",sky:["#3a5778","#cfe6f7"],size:27,u:[380,260]},
 {id:"agni",n:"Agni Belt",el:"Fire · Agni",b:"Energy ×1.6",col:"#a8461f",sky:["#2a0600","#e0561a"],size:33,u:[820,600]},
 {id:"akasha",n:"Ākāśha's Edge",el:"Ether · Akasha",b:"Data ×1.6",col:"#5b4a8a",sky:["#0a0620","#4b3a8f"],size:29,u:[1800,1400]},
 {id:"soma",n:"Soma Kshetra",el:"Moon · Soma",b:"Influence ×1.4",col:"#c9c9e8",sky:["#0d1030","#8a8fc9"],size:26,u:[3400,2600]},
 {id:"prana",n:"Prāṇa Vana",el:"Life · Prana",b:"Population growth ×2",col:"#3f9a5a",sky:["#06200f","#4fb36a"],size:34,u:[6000,4600]},
 {id:"vajra",n:"Vajra Loka",el:"Thunder · Indra",b:"Pop. capacity ×1.5",col:"#e0c25a",sky:["#14102a","#f0d060"],size:31,u:[10000,8000]}
];
const EL_ID=PLANETS.map(p=>p.id);
const TECHS={
 fusion:{n:"Fusion Efficiency",i:"⚡",d:"Energy +20%/tier",b:100,g:1.6,m:1.2},
 genomics:{n:"Genomic Acceleration",i:"🧬",d:"Biomass +20%/tier",b:100,g:1.6,m:1.2},
 governance:{n:"Neural Governance",i:"☸",d:"Influence +25%/tier",b:180,g:1.65,m:1.25},
 orbital:{n:"Orbital Purifiers",i:"♻",d:"Pollution −15%/tier",b:180,g:1.65,m:.85},
 sensors:{n:"Deep Space Sensors",i:"📡",d:"Claim cost −12%/tier",b:220,g:1.7,m:.88},
 cities:{n:"Sustainable Cities",i:"🏙",d:"Pop. capacity +25%/tier",b:250,g:1.7,m:1.25},
 arthashastra:{n:"Arthashastra Archive",i:"📚",d:"Council rewards +15%/tier",b:300,g:1.7,m:1.15}
};
const SUTRAS=["Even a small act of justice outshines a great sacrifice done without it.","A king's happiness lies in the happiness of his subjects.","Before you start, ask: why, what will the results be, and will I succeed?","The root of happiness is dharma; the root of dharma is artha.","Test a servant in duty, a friend in adversity, a spouse in poverty.","As the bee takes honey without harming the flower, so the king must draw taxes.","Education is the best friend; an educated person is respected everywhere.","Do not reveal what you have thought upon doing; carry it into action in secret."];
const DEEDS=[
 ["first_breath","First Breath","Atmosphere 50% on any world",s=>s.planets.some(p=>p.atmosphere>=50)],
 ["blue_marble","Blue Marble","Water 50% on any world",s=>s.planets.some(p=>p.water>=50)],
 ["its_alive","It's Alive","Biosphere 50% on any world",s=>s.planets.some(p=>p.biosphere>=50)],
 ["first_colonists","First Colonists","Grow a population",s=>s.planets.some(p=>p.population>=1)],
 ["sustainable","Sustainable Utopia","Fully sustain a world",s=>s.planets.some(p=>p.sustained)],
 ["five_elements","Panchabhūta","Claim the first five worlds",s=>s.planets.slice(0,5).every(p=>p.unlocked)],
 ["all_worlds","Brahmāṇḍa","Claim all eight worlds",s=>s.planets.every(p=>p.unlocked)],
 ["architect","Galactic Architect","Sustain every claimed world (min 3)",s=>s.planets.filter(p=>p.unlocked).length>=3&&s.planets.filter(p=>p.unlocked).every(p=>p.sustained)],
 ["sage_ruler","The Sage Ruler","Dharma Index +50",s=>s.dharmaIndex>=50],
 ["pragmatist","The Pragmatist","Dharma Index −50",s=>s.dharmaIndex<=-50],
 ["centurion","Centurion","Return on 7 different days",s=>s.streak>=7],
 ["mandapa","Rajasuya","Build 5 Yajna Mandaps in total",s=>s.planets.reduce((a,p)=>a+p.buildings.mandap,0)>=5]
];
// [flavor,text,[label,note,{i,d,h,pol,en,bio}] x2]
const EVENTS=[
 ["Taxation","As the bee takes honey without harming the flower, so must a king tax. Ministers urge higher levies.",["Raise the levy","+Influence, less trust",{i:45,h:-6}],["Keep it light","Small Influence, more trust",{i:12,h:6}]],
 ["Gūḍhapuruṣa (Spies)","Your spymaster wants informants in every settlement to catch corruption early.",["Fund the network","+Data, −Influence",{d:35,i:-8,h:-4}],["Trust your officers","+Influence",{i:25,h:5}]],
 ["Agriculture vs Industry","A fertile valley could be farmland or a Bioreactor complex.",["Farmland","+Biomass on a random world",{bio:120,h:4}],["Industry","+Energy on a random world",{en:120,h:-2}]],
 ["Nyāya (Justice)","A governor is accused of skimming grain. Evidence is circumstantial.",["Open trial","+Influence, −Data",{i:30,d:-15,h:8}],["Quiet reassignment","+Data, whispers",{d:25,h:-6}]],
 ["Environment","Run-off is thickening the haze over a world.",["Emergency clean-up","Pollution −25 on a random world",{pol:-25,i:-10,h:7}],["Let Purifiers catch up","+Influence",{i:15,h:-3}]],
 ["Rakṣā (Defense)","Unidentified debris drifts toward a settled orbit.",["Divert Energy to shields","−Energy on a random world",{en:-40,h:2}],["Watch and wait","No cost",{h:-1}]],
 ["AI Ethics","Your AI Cores could manage allocation alone.",["Grant autonomy","+Data, −Influence",{d:20,i:-12,h:-5}],["Human hand on the wheel","+Influence",{i:20,h:5}]],
 ["Vyāpāra (Trade)","A guild asks for an exclusive route.",["Grant it","+Influence",{i:35,h:-3}],["Keep trade open","Goodwill",{i:15,h:6}]],
 ["Succession","Advisors ask you to train successors.",["Begin mentorship","+Influence, +Dharma",{i:20,h:8}],["Focus on the present","+Data",{d:30,h:-2}]],
 ["Sāma-Dāna-Bheda-Daṇḍa","A rival outpost hoards terraforming data. Chanakya's four means are open to you.",["Sāma & Dāna: negotiate and pay","+Data, −Influence",{d:50,i:-30,h:3}],["Daṇḍa: embargo them","+Influence, −Dharma",{i:40,h:-8}]],
 ["Beej (Seeds)","A travelling merchant asks to use the royal seed-store to green the frontier fields.",["Allow the merchant","Orchards bloom, +Biomass here",{i:15,bio:90,h:4}],["Keep the seeds sealed","Seeds stay in the vault",{h:-1}]],
 ["Gurukula","Scholars ask for a school in every dome.",["Fund the Gurukula","+Data, +Dharma",{d:30,h:6}],["Fund the army instead","+Influence",{i:30,h:-4}]],
 ["Annadāna","A harvest shortfall looms. Open the royal granary?",["Open the granary","−Biomass, +Dharma",{bio:-60,h:9}],["Sell the surplus","+Influence",{i:35,h:-6}]]
];

/* ---------- STATE ---------- */
let S=null, queue=[], modal=null;
const freshPlanet=i=>({unlocked:i===0,sustained:false,atmosphere:i===0?6:0,water:0,biosphere:0,pollution:0,population:0,popCap:0,energy:0,biomass:0,buildings:Object.fromEntries(ORDER.map(k=>[k,0]))});
const freshState=()=>({version:2,data:20,influence:30,dharmaIndex:0,techTier:Object.fromEntries(Object.keys(TECHS).map(k=>[k,0])),planets:PLANETS.map((_,i)=>freshPlanet(i)),selectedPlanet:0,unlockedAchievements:[],chronicle:[],councilTimer:0,onboarded:false,streak:0,lastVisitDay:null,lastSaveTime:Date.now(),playSeconds:0,view:"system",ruler:null});
function loadState(){
 try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return freshState();
  const P=JSON.parse(raw),F=freshState(),M=Object.assign({},F,P);
  M.planets=F.planets.map((f,i)=>{const o=(P.planets&&P.planets[i])||{};return Object.assign({},f,o,{buildings:Object.assign({},f.buildings,o.buildings||{})})});
  M.techTier=Object.assign({},F.techTier,P.techTier||{});return M;
 }catch(e){return freshState()}
}
const save=()=>{S.lastSaveTime=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}};

/* ---------- HELPERS ---------- */
const tm=k=>Math.pow(TECHS[k].m,S.techTier[k]||0), tc=k=>Math.ceil(TECHS[k].b*Math.pow(TECHS[k].g,S.techTier[k]||0));
const eCap=p=>220+p.buildings.solar*45, bCap=p=>220+p.buildings.bioreactor*45;
const sust=p=>p.unlocked?clamp(p.atmosphere*.25+p.water*.25+p.biosphere*.35+(100-p.pollution)*.15,0,100):0;
const bcost=(p,k)=>{const c={};for(const r in BUILDINGS[k].c)c[r]=Math.ceil(BUILDINGS[k].c[r]*Math.pow(BUILDINGS[k].g,p.buildings[k]));return c};
const have=(p,r)=>r==="data"||r==="influence"?S[r]:p[r];
const afford=(p,c)=>Object.keys(c).every(r=>have(p,r)>=c[r]);
const pay=(p,c)=>{for(const r in c){if(r==="data"||r==="influence")S[r]-=c[r];else p[r]-=c[r]}};
const idx=p=>S.planets.indexOf(p);
const chron=(t,m)=>{S.chronicle.unshift({t:Date.now(),text:t,manual:!!m});S.chronicle.length=Math.min(S.chronicle.length,80)};
function toast(m){const e=$("toast");e.textContent=m;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),2600)}
const rulerTitle=()=>S.ruler?(S.ruler.g==="queen"?"Maharani ":"Maharaja ")+S.ruler.name:"The Architect";

/* ---------- SIMULATION ---------- */
function tickPlanet(p,dt){
 if(!p.unlocked)return;const id=EL_ID[idx(p)],b=p.buildings;
 p.energy=Math.max(0,Math.min(p.energy+b.solar*.55*tm("fusion")*(id==="agni"?1.6:1)*dt,Math.max(eCap(p),p.energy)));
 p.biomass=Math.max(0,Math.min(p.biomass+b.bioreactor*.48*tm("genomics")*(id==="bhumi"?1.5:1)*dt,Math.max(bCap(p),p.biomass)));
 if(b.terraform>0&&(p.atmosphere<100||p.water<100||p.biosphere<100)){
  let pts=Math.min(b.terraform*.34*(id==="jala"?1.4:1)*dt,p.energy/.5,p.biomass/.5);
  if(pts>0){p.energy-=pts*.5;p.biomass-=pts*.5;
   for(const f of["atmosphere","water","biosphere"]){if(pts<=0)break;if(p[f]<100){const a=Math.min(pts,100-p[f]);p[f]+=a;pts-=a}if(p[f]<100)break}}
 }
 p.popCap=Math.round(b.habitat*18*tm("cities")*(id==="vajra"?1.5:1));
 if(p.atmosphere>=40&&p.water>=15&&p.population<p.popCap)
  p.population=Math.min(p.popCap,p.population+Math.max(.15,p.biosphere/100)*p.popCap*.012*(id==="prana"?2:1)*dt);
 if(p.population>p.popCap)p.population=Math.max(p.popCap,p.population-dt*.05); // bug fix: overpop shrinks
 if(p.population>0){const up=p.population*.018*dt;if(p.biomass>=up)p.biomass-=up;else{p.biomass=0;p.population=Math.max(0,p.population*(1-.01*dt))}}
 const gen=((b.solar+b.bioreactor+b.terraform)*.05*tm("orbital")+p.population*.012)*(id==="vayu"?.5:1);
 p.pollution=clamp(p.pollution+(gen-b.purifier*.55)*dt*.12,0,100);
 if(!p.sustained&&sust(p)>=99.99){p.sustained=true;toast("✦ "+PLANETS[idx(p)].n+" is fully sustained!");chron("✦ "+PLANETS[idx(p)].n+" achieves balance.")}
}
function tickGlobal(dt){
 let pop=0,sc=0,dg=0,mand=0;
 S.planets.forEach((p,i)=>{if(!p.unlocked)return;pop+=p.population;if(p.sustained)sc++;mand+=p.buildings.mandap;
  dg+=p.buildings.aiCore*.11*(1+p.population*.02)*(i===4?1.6:1)});
 S.data+=dg*dt*(1+Math.min(0,S.dharmaIndex)/-400);
 S.influence+=(pop*.0012+sc*.05+.015+mand*.12)*tm("governance")*(1+Math.max(0,S.dharmaIndex)/400)*(S.planets[5].unlocked?1.4:1)*dt;
 S.dharmaIndex=clamp(S.dharmaIndex+mand*.0015*dt,-100,100);
}
function tick(dt){
 S.planets.forEach(p=>tickPlanet(p,dt));tickGlobal(dt);S.councilTimer+=dt;S.playSeconds+=dt;
 DEEDS.forEach(([id,n,d,f])=>{if(!S.unlockedAchievements.includes(id)&&f(S)){S.unlockedAchievements.push(id);S.influence+=25;toast("🏆 Deed: "+n);chron("🏆 "+n+" — "+d)}});
}
const fastForward=sec=>{for(let r=sec;r>0;r-=60)tick(Math.min(60,r))};

/* ---------- COUNCIL ---------- */
function openCouncil(){
 if(!queue.length){queue=EVENTS.map((_,i)=>i).sort(()=>Math.random()-.5)}
 const e=EVENTS[queue.shift()],s=SUTRAS[Math.floor(Math.random()*SUTRAS.length)];
 const who=S.ruler?`<p style="color:var(--muted);font-size:12px">${rulerTitle()}, the council awaits your ruling.</p>`:"";
 show("Council of Ministers","Every choice bends the dharma of your reign.",
  `<div style="color:#ffb866;letter-spacing:1px;text-transform:uppercase;font-size:12px;font-weight:700">${e[0]}</div>${who}<p style="line-height:1.6">${e[1]}</p><div class="sutra">${s} <small>— Chanakya Niti</small></div>`+
  e.slice(2).map((o,i)=>`<button class="opt" data-i="${i}"><b>${o[0]}</b><span>${o[1]}</span></button>`).join(""),true);
 document.querySelectorAll("#mBody .opt").forEach(btn=>btn.onclick=()=>{
  const o=e[2+ +btn.dataset.i],x=o[2],k=1+.15*S.techTier.arthashastra;
  S.influence=Math.max(0,S.influence+(x.i||0)*(x.i>0?k:1));S.data=Math.max(0,S.data+(x.d||0)*(x.d>0?k:1));S.dharmaIndex=clamp(S.dharmaIndex+(x.h||0),-100,100);
  const p=S.planets[S.location??S.selectedPlanet];
  if(x.pol)p.pollution=clamp(p.pollution+x.pol,0,100);if(x.en)p.energy=Math.max(0,p.energy+x.en);if(x.bio)p.biomass=Math.max(0,p.biomass+x.bio);
  chron(`☸ Council — "${e[0]}": ${o[0]}.`);S.councilTimer=0;closeModal();toast("The council's decision is recorded.");renderAll();save()});
 if(window.DS_court)DS_court(e,s);
}

/* ---------- MODAL ---------- */
function show(t,sub,html,noClose){modal=t;$("mTitle").textContent=t;$("mSub").textContent=sub||"";$("mBody").innerHTML=html;$("mClose").style.display=noClose?"none":"";$("modal").classList.add("show")}
function closeModal(){modal=null;$("modal").classList.remove("show")}
$("mClose").onclick=closeModal;
function openPanel(n){
 if(n==="tech"){modal="Tech";show("Tech & Governance","Spend Data on empire-wide upgrades.",`<div class="grid">${Object.entries(TECHS).map(([k,t])=>`<div class="card"><b>${t.i} ${t.n} · Lv.${S.techTier[k]}</b>${t.d}<button class="go" data-k="${k}" ${S.data>=tc(k)?"":"disabled"}>Upgrade — 📡 ${fmt(tc(k))}</button></div>`).join("")}</div>`);
  document.querySelectorAll(".card .go").forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(S.data<tc(k))return;S.data-=tc(k);S.techTier[k]++;chron(`🧠 ${TECHS[k].n} reached level ${S.techTier[k]}.`);openPanel("tech");renderAll();save()})}
 if(n==="deeds")show("Deeds of the Reign",`${S.unlockedAchievements.length} / ${DEEDS.length}`,`<div class="grid">${DEEDS.map(d=>{const u=S.unlockedAchievements.includes(d[0]);return`<div class="card ${u?"got":"lock"}"><b>${u?"🏆":"🔒"} ${d[1]}</b>${d[2]}</div>`}).join("")}</div>`);
 if(n==="chronicle"){show("Ruler's Chronicle",rulerTitle(),`<div class="dh"><i style="left:${(S.dharmaIndex+100)/2}%"></i></div><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted)"><span>Artha — pragmatic</span><span>Dharma ${S.dharmaIndex.toFixed(0)}</span><span>Compassionate</span></div><textarea id="note" rows="2" placeholder="Write a note to your future self…"></textarea><button class="go" id="addNote">Add note</button>${S.chronicle.map(e=>`<div class="entry">${e.text}</div>`).join("")||"<p>Your chronicle is empty.</p>"}`);
  $("addNote").onclick=()=>{const v=$("note").value.trim();if(v){chron("📖 "+v.replace(/</g,"&lt;"),1);openPanel("chronicle")}}}
 if(n==="data"){show("Save Data","Stored in this browser only.",`<textarea id="ex" rows="5" readonly></textarea><button class="go" id="cp">Copy backup</button><textarea id="im" rows="3" placeholder="Paste a backup JSON to restore…"></textarea><button class="go" id="ld">Restore backup</button><button class="go" id="rs" style="background:#7a2b2b">Reset reign</button>`);
  $("ex").value=JSON.stringify(S);
  $("cp").onclick=()=>{$("ex").select();try{navigator.clipboard.writeText($("ex").value)}catch(e){document.execCommand("copy")}toast("Backup copied.")};
  $("ld").onclick=()=>{try{const o=JSON.parse($("im").value);if(!o.planets)throw 0;localStorage.setItem(SAVE_KEY,JSON.stringify(o));location.reload()}catch(e){toast("Invalid backup.")}};
  $("rs").onclick=()=>{if(confirm("Erase your reign and restart?")){localStorage.removeItem(SAVE_KEY);location.reload()}}}
}
document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openPanel(b.dataset.open));

/* ---------- ONBOARDING: choose ruler ---------- */
function onboard(){
 let g="king";
 show("Welcome, Architect ✦","A dying star system. Eight barren worlds. One long dharma.",
 `<p style="font-size:13px;line-height:1.6">Terraform worlds (Atmosphere → Water → Biosphere), settle people, rule through the Council using the wisdom of Chanakya, and walk your worlds in person. Each world is strongest in its own element. Progress saves to this browser and continues while you're away.</p>
 <b style="font-size:13px">Who rules?</b><div class="pick"><button class="opt sel" data-g="king">🤴<br><small>Maharaja</small></button><button class="opt" data-g="queen">👸<br><small>Maharani</small></button></div>
 <input id="rname" maxlength="16" placeholder="Your royal name (e.g. Chandragupta)"><button class="go" id="begin">Begin your reign</button>`,true);
 document.querySelectorAll(".pick .opt").forEach(b=>b.onclick=()=>{g=b.dataset.g;document.querySelectorAll(".pick .opt").forEach(x=>x.classList.toggle("sel",x===b))});
 $("begin").onclick=()=>{S.ruler={g,name:($("rname").value.trim()||(g==="queen"?"Ahilya":"Vikram")).replace(/[<>&]/g,"")};S.onboarded=true;chron(`✦ ${rulerTitle()}'s reign over Bhūmi Minor begins.`);closeModal();renderAll();save()};
}

/* ---------- CANVAS ---------- */
const cv=$("sky"),ctx=cv.getContext("2d");let W,H,DPR;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}addEventListener("resize",resize);resize();
const stars=Array.from({length:160},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.2,a:Math.random()*.7+.2}));
const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
function pcol(p,c){const[a,b,d]=rgb(c),w=p.water/100,f=p.biosphere/100*.6;let r=a*(1-w)+44*w,g=b*(1-w)+120*w,bl=d*(1-w)+201*w;r=r*(1-f)+79*f;g=g*(1-f)+154*f;bl=bl*(1-f)+95*f;return`rgb(${r|0},${g|0},${bl|0})`}
let pos=[],mouse={x:0,y:0};
function starfield(t,a=1){stars.forEach(s=>{ctx.globalAlpha=a*s.a*(.55+.45*Math.sin(t*.0006+s.x*10));ctx.fillStyle="#d8edff";ctx.beginPath();ctx.arc(s.x*W+mouse.x*8,s.y*H*.9,s.r,0,6.3);ctx.fill()});ctx.globalAlpha=1}
function drawSystem(t){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#050f26");g.addColorStop(1,"#0a1d43");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);starfield(t);
 const cx=W*.5,cy=H*.56,sc=Math.min(W,H)/900;
 const gl=ctx.createRadialGradient(cx,cy,4,cx,cy,150);gl.addColorStop(0,"rgba(255,200,110,.6)");gl.addColorStop(1,"transparent");ctx.fillStyle=gl;ctx.fillRect(cx-150,cy-150,300,300);
 ctx.fillStyle="#ffc15a";ctx.beginPath();ctx.arc(cx,cy,30,0,6.3);ctx.fill();
 pos=[];
 PLANETS.forEach((c,i)=>{const p=S.planets[i],R=(95+i*47)*sc+30,a=t*.00002*(40/(30+i*14))*40+i*1.4,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R*.55,r=c.size*sc+(p.unlocked?sust(p)*.03:0);
  ctx.strokeStyle=p.unlocked?"rgba(160,205,255,.2)":"rgba(160,205,255,.07)";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,R,R*.55,0,0,6.3);ctx.stroke();
  pos.push({x,y,r:Math.max(r,16),i});
  if(!p.unlocked){ctx.fillStyle="rgba(120,140,170,.35)";ctx.beginPath();ctx.arc(x,y,r,0,6.3);ctx.fill();ctx.fillStyle="#cfe0f4";ctx.textAlign="center";ctx.font="11px sans-serif";ctx.fillText("🔒",x,y+4)}
  else{const gr=ctx.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);gr.addColorStop(0,pcol(p,c.col));gr.addColorStop(1,"rgba(5,10,25,.7)");ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r,0,6.3);ctx.fill();
   if(p.atmosphere>5){ctx.strokeStyle=`rgba(140,210,255,${clamp(p.atmosphere/140,0,.55)})`;ctx.lineWidth=Math.max(1.5,r*.14);ctx.beginPath();ctx.arc(x,y,r+3,0,6.3);ctx.stroke()}
   if(p.sustained){ctx.strokeStyle="rgba(255,213,107,.9)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+7,0,6.3);ctx.stroke()}
   if(i===S.selectedPlanet){ctx.strokeStyle="#ffb866";ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(x,y,r+11,0,6.3);ctx.stroke();ctx.setLineDash([])}}
  ctx.fillStyle="#dceeff";ctx.font="600 11px sans-serif";ctx.textAlign="center";ctx.fillText(c.n,x,y+r+16)});
}
/* World view: ruler walks the selected world, scene themed by element */
let rx=.3,rdir=1,walk=0,keys={},speech=null;
function drawWorld(t){
 const p=S.planets[S.selectedPlanet],c=PLANETS[S.selectedPlanet],id=c.id,gy=H*.72;
 const g=ctx.createLinearGradient(0,0,0,gy);g.addColorStop(0,c.sky[0]);g.addColorStop(1,c.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);starfield(t,id==="akasha"||id==="soma"?1:.35);
 if(p.pollution>5){ctx.fillStyle=`rgba(140,90,50,${p.pollution/220})`;ctx.fillRect(0,0,W,gy)}
 const off=(rx-.5)*W*.6;
 // distant mountains
 ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.moveTo(0,gy);for(let x=0;x<=W;x+=40)ctx.lineTo(x,gy-50-40*Math.sin((x+off*.3)*.008)-20*Math.sin((x+off*.3)*.021));ctx.lineTo(W,gy);ctx.fill();
 // elemental effects
 if(id==="agni"){for(let i=0;i<24;i++){const x=(i*97+t*.03)%W,y=gy-((t*.05+i*53)%260);ctx.fillStyle=`rgba(255,${120+i*5},40,.7)`;ctx.fillRect(x,y,3,3)}}
 if(id==="jala"||p.water>30){ctx.fillStyle="rgba(60,150,220,.55)";ctx.fillRect(0,gy-4,W,p.water*.4+4);for(let x=0;x<W;x+=30){ctx.fillStyle="rgba(255,255,255,.2)";ctx.fillRect(x+Math.sin(t*.002+x)*6,gy+4,14,2)}}
 if(id==="vayu"||id==="akasha"){ctx.strokeStyle="rgba(255,255,255,.25)";for(let i=0;i<5;i++){ctx.beginPath();ctx.arc((i*260+t*.04)%(W+200)-100,H*.2+i*30,40+i*8,3.3,6.1);ctx.stroke()}}
 if(id==="soma"||id==="akasha"){ctx.fillStyle="rgba(230,230,255,.9)";ctx.beginPath();ctx.arc(W*.8,H*.18,28,0,6.3);ctx.fill()}
 if(id==="vajra"&&Math.sin(t*.003)>.97){ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(W*.3,0);ctx.lineTo(W*.33,gy*.4);ctx.lineTo(W*.31,gy*.45);ctx.lineTo(W*.35,gy);ctx.stroke()}
 // ground
 ctx.fillStyle=pcol(p,c.col);ctx.fillRect(0,gy,W,H-gy);ctx.fillStyle="rgba(0,0,0,.25)";ctx.fillRect(0,gy,W,6);
 // flora by biosphere
 for(let i=0;i<Math.round(p.biosphere/4);i++){const x=((i*131)%W*1.3-off+W*5)%W,h=14+(i*7)%22;ctx.fillStyle="#2f8f4e";ctx.fillRect(x,gy-h,4,h);ctx.beginPath();ctx.arc(x+2,gy-h,9+(i%4),0,6.3);ctx.fill()}
 // structures by building level
 let n=0;[["solar","#ffd56b",26],["bioreactor","#74e7a5",30],["terraform","#59e7ff",40],["habitat","#e8dcc0",34],["aiCore","#a98cff",44],["purifier","#9ad",24],["mandap","#ff9933",50]].forEach(([k,col,h])=>{
  for(let j=0;j<Math.min(4,p.buildings[k]);j++){const x=((n++*173+60)%(W-100))-off*.5+ (n>0?0:0),xx=((x%W)+W)%W;ctx.fillStyle=col;ctx.fillRect(xx,gy-h,26,h);ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(xx,gy-h,26,4);
   if(k==="mandap"){ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(xx-6,gy-h);ctx.lineTo(xx+13,gy-h-22);ctx.lineTo(xx+32,gy-h);ctx.fill()}}});
 // citizens
 for(let i=0;i<Math.min(30,p.population/2);i++){const x=((i*89+t*.01*(i%3+1))%W);ctx.fillStyle="#ffe9a8";ctx.fillRect(x,gy+10+(i%4)*8,3,7)}
 // ruler
 if(keys.ArrowLeft||keys.a){rx-=.0016;rdir=-1;walk+=.3}if(keys.ArrowRight||keys.d){rx+=.0016;rdir=1;walk+=.3}rx=clamp(rx,.05,.95);
 drawRuler(W*.5+(rx-.5)*W*.3,gy+24,rdir,walk);
 if(speech&&speech.until>t){ctx.font="13px sans-serif";const w=Math.min(W-40,ctx.measureText(speech.text).width+24),x=W*.5+(rx-.5)*W*.3-w/2;ctx.fillStyle="rgba(8,20,46,.9)";ctx.fillRect(clamp(x,10,W-w-10),gy-120,w,34);ctx.fillStyle="#ffd9a0";ctx.textAlign="left";ctx.fillText(speech.text,clamp(x,10,W-w-10)+12,gy-98)}
 ctx.fillStyle="#fff";ctx.font="600 13px sans-serif";ctx.textAlign="center";ctx.fillText(`${c.n} — ${c.el} · ${c.b}`,W/2,H*.2+60);
}
function drawRuler(x,y,d,w){
 const q=S.ruler&&S.ruler.g==="queen",sw=Math.sin(w)*5;
 ctx.save();ctx.translate(x,y);ctx.scale(d,1);
 ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.ellipse(0,0,18,5,0,0,6.3);ctx.fill();
 ctx.fillStyle=q?"#d63a6b":"#ff9933";ctx.beginPath();if(q){ctx.moveTo(-14,0);ctx.lineTo(-8,-44);ctx.lineTo(8,-44);ctx.lineTo(14,0)}else{ctx.rect(-9,-46,18,32);ctx.fillRect(-8+sw,-14,6,14);ctx.fillRect(2-sw,-14,6,14)}ctx.fill();
 ctx.fillStyle="#f0b98a";ctx.beginPath();ctx.arc(0,-54,9,0,6.3);ctx.fill();
 ctx.fillStyle=q?"#2a1018":"#1c1c1c";ctx.fillRect(-9,-60,18,4);if(q){ctx.fillRect(-10,-58,4,22)}
 ctx.fillStyle="#ffd56b";ctx.beginPath();ctx.moveTo(-9,-62);ctx.lineTo(-6,-72);ctx.lineTo(0,-64);ctx.lineTo(6,-72);ctx.lineTo(9,-62);ctx.fill();
 ctx.fillStyle="#ffd56b";ctx.fillRect(-9,-44,18,3);ctx.restore();
}
function render(t){if(S){S.view==="system"?drawSystem(t):drawWorld(t)}requestAnimationFrame(render)}
cv.addEventListener("pointermove",e=>{mouse.x=clamp((e.clientX/W-.5)*1.2,-1,1)});
cv.addEventListener("pointerdown",e=>{if(S.view!=="system")return;let best=-1,bd=1e9;pos.forEach(o=>{const d=Math.hypot(e.clientX-o.x,e.clientY-o.y);if(d<o.r+14&&d<bd){bd=d;best=o.i}});
 if(best>=0){if(S.planets[best].unlocked){if(window.DS_travel&&best!==(S.location??S.selectedPlanet))DS_travel(best);else{S.selectedPlanet=best;S.location=best;renderAll()}}else toast("Sustain the previous world to 60% and claim it first.")}});
addEventListener("keydown",e=>{keys[e.key]=1;if(S&&S.view==="world"){if(e.key===" "){e.preventDefault();speak()}if(e.key==="Escape")setView("system")}});
addEventListener("keyup",e=>keys[e.key]=0);
let tx=null;cv.addEventListener("touchstart",e=>{tx=e.touches[0].clientX});cv.addEventListener("touchmove",e=>{if(S.view==="world"&&tx!==null){const d=e.touches[0].clientX-tx;rx=clamp(rx+d*.002,.05,.95);rdir=d>0?1:-1;walk+=.3;tx=e.touches[0].clientX}});
function speak(){const p=S.planets[S.selectedPlanet];let t=SUTRAS[Math.floor(Math.random()*SUTRAS.length)];
 if(p.pollution>40)t="The air grows heavy. My people deserve clean skies — build Purifiers.";else if(!p.buildings.terraform)t="A world without terraforming is only stone. Begin the work.";
 speech={text:rulerTitle()+": "+t,until:performance.now()+5000}}

/* ---------- UI ---------- */
function setView(v){S.view=v;window.DS_view&&DS_view(v);$("vSystem").classList.toggle("active",v==="system");$("vWorld").classList.toggle("active",v==="world");$("walkHint").style.display=v==="world"?"block":"none";if(v==="world")speak()}
$("vSystem").onclick=()=>setView("system");$("vWorld").onclick=()=>setView("world");
const bar=(l,v,c,x)=>`<div><div class="lbl"><span>${l}</span><span>${x||v.toFixed(1)+"%"}</span></div><div class="bar"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></div></div>`;
function renderStats(){
 const p=S.planets[S.selectedPlanet],c=PLANETS[S.selectedPlanet];$("pTitle").textContent=c.n;$("pEpi").textContent=c.el;
 const sc=sust(p);
 $("statsBody").innerHTML=`<div class="elem">✦ ${c.el.split(" ·")[0]} bonus: <b>${c.b}</b></div>`+
  bar("⚡ Energy",p.energy/eCap(p)*100,"#ffb24d",`${fmt(p.energy)} / ${eCap(p)}`)+bar("🧬 Biomass",p.biomass/bCap(p)*100,"#74e7a5",`${fmt(p.biomass)} / ${bCap(p)}`)+
  bar("Atmosphere",p.atmosphere,"#59e7ff")+bar("Oceans",p.water,"#59c9ff")+bar("Biosphere",p.biosphere,"#74e7a5")+bar("Pollution",p.pollution,"#ff8b6b")+
  bar("Population",p.popCap?p.population/p.popCap*100:0,"#ff91d5",`${fmt(p.population)} / ${p.popCap}`)+bar("Sustainability",sc,"#ffd56b")+(p.sustained?`<div class="badge">✦ Fully Sustained</div>`:"");
 const n=S.selectedPlanet+1,btn=$("claimBtn");
 // bug fix: claim the next world after the LATEST unlocked one, shown only when its predecessor is ready
 const next=S.planets.findIndex(q=>!q.unlocked);
 if(next>0&&sust(S.planets[next-1])>=60){const u=PLANETS[next].u,k=tm("sensors");btn.style.display="";btn.textContent=`🚀 Claim ${PLANETS[next].n} (☸${Math.ceil(u[0]*k)} 📡${Math.ceil(u[1]*k)})`;btn.onclick=()=>claim(next)}else btn.style.display="none";
}
function renderBuild(){
 const p=S.planets[S.selectedPlanet];
 $("buildBody").innerHTML=ORDER.map(k=>{const b=BUILDINGS[k],c=bcost(p,k),lock=b.req&&p.atmosphere<b.req,ok=!lock&&afford(p,c);
  return`<div class="bld ${lock?"off":""} ${!ok&&!lock?"poor":""}" data-k="${k}"><div class="top"><span>${b.i} ${b.n}</span><em>Lv.${p.buildings[k]}</em></div><p>${b.d}</p><div class="cost">${Object.entries(c).map(([r,v])=>`<span>${r==="energy"?"⚡":r==="biomass"?"🧬":"📡"} ${fmt(v)}</span>`).join("")}</div></div>`}).join("");
 document.querySelectorAll(".bld").forEach(r=>r.onclick=()=>{const k=r.dataset.k,b=BUILDINGS[k],c=bcost(p,k);
  if(b.req&&p.atmosphere<b.req)return toast("Atmosphere must reach "+b.req+"% first.");if(!afford(p,c))return toast("Not enough resources.");
  pay(p,c);p.buildings[k]++;toast(`${b.i} ${b.n} → Lv.${p.buildings[k]}`);renderAll();save()});
}
function renderAll(){
 $("resourceBar").innerHTML=`<div class="res">📡 <b>${fmt(S.data)}</b></div><div class="res">☸ <b>${fmt(S.influence)}</b></div><div class="res">🕉 Dharma <b>${S.dharmaIndex.toFixed(0)}</b></div>`;
 $("rulerTag").textContent=S.ruler?rulerTitle()+" · Five worlds. One dharma.":"Five worlds. One dharma.";
 renderStats();renderBuild();window.DS_hud&&DS_hud();
}
function claim(i){
 const prev=S.planets[i-1],u=PLANETS[i].u,k=tm("sensors"),ci=Math.ceil(u[0]*k),cd=Math.ceil(u[1]*k);
 if(sust(prev)<60)return toast(PLANETS[i-1].n+" needs 60% sustainability.");if(S.influence<ci||S.data<cd)return toast("Not enough Influence or Data.");
 S.influence-=ci;S.data-=cd;Object.assign(S.planets[i],{unlocked:true,atmosphere:5});S.selectedPlanet=i;S.location=i;
 chron(`🚀 ${PLANETS[i].n} (${PLANETS[i].el}) claimed for the empire.`);
 show("New World Claimed",PLANETS[i].n+" — "+PLANETS[i].el,`<p>Elemental bonus: <b>${PLANETS[i].b}</b>. Walk its surface with the 👑 button.</p><div class="sutra">${SUTRAS[i%SUTRAS.length]}</div>`);renderAll();save();
}
$("councilBtn").onclick=()=>{if(S.playSeconds<15)return toast("Give your ministers a moment to convene.");openCouncil()};
["left","right"].forEach(s=>{const b=document.createElement("button");b.className="mtog";b.style[s]="12px";b.textContent=s==="left"?"📊":"⚒";b.onclick=()=>{$(s+"Dock").classList.toggle("open");$(s==="left"?"rightDock":"leftDock").classList.remove("open")};$("app").appendChild(b)});

/* ---------- BOOT ---------- */
const dur=s=>{s=Math.floor(s);return s>=3600?`${Math.floor(s/3600)}h ${Math.floor(s%3600/60)}m`:s>=60?`${Math.floor(s/60)}m ${s%60}s`:s+"s"};
const dayKey=d=>{const t=new Date(d);return t.getFullYear()+"/"+(t.getMonth()+1)+"/"+t.getDate()};
function boot(){
 const isNew=!localStorage.getItem(SAVE_KEY);S=loadState();
 const today=dayKey(Date.now());
 if(S.lastVisitDay!==today){const prev=S.lastVisitDay;
  if(!prev)S.streak=1;else{const diff=Math.round((new Date(today)-new Date(prev.replace(/-/g,"/")))/864e5);S.streak=diff===1?S.streak+1:1}
  S.lastVisitDay=today;if(prev){const bonus=Math.min(200,15*S.streak);S.influence+=bonus;chron(`🌅 Day ${S.streak} — the council grants +${bonus} Influence.`)}}
 let back=null;
 if(!isNew&&S.onboarded){const el=Math.max(0,Math.floor((Date.now()-S.lastSaveTime)/1000)),cap=Math.min(el,OFFLINE_CAP);
  if(cap>60){const d0=S.data,i0=S.influence;fastForward(cap);S.councilTimer=0; // bug fix: no council ambush after offline
   back=`<p>Your empire ran for ${dur(cap)}${el>OFFLINE_CAP?" (capped at 8h)":""}.</p><p>📡 +${fmt(S.data-d0)} · ☸ +${fmt(S.influence-i0)} · 🔥 Day streak ${S.streak}</p>`}}
 setView(S.view||"system");renderAll();save();
 if(!S.onboarded)onboard();else if(back)show("Welcome back, "+rulerTitle(),"",back);
 setInterval(()=>{tick(1);if(S.councilTimer>=COUNCIL_EVERY&&!modal&&S.onboarded){S.councilTimer=0;openCouncil()}renderAll();if(modal==="Tech")openPanel("tech")},1000);
 setInterval(save,15000);addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")save()});addEventListener("beforeunload",save);
 requestAnimationFrame(render);
}
window.DS={get S(){return S},get modal(){return modal},PLANETS,SUTRAS,DEEDS,BUILDINGS,rulerTitle,show,closeModal,toast,renderAll,save,fmt,chron,reset(){const f=freshState();Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,f);save()}};
boot();
})();
