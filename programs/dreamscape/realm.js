/* Dreamscape v8: The Tamasi Realm — after peace or conquest: visit their worlds, harvest resources, harness their star, govern unrest, unite the twin thrones */
(()=>{"use strict";
if(!window.DS_story||!window.DS3)return;
const D=DS,X=DS3,S=()=>D.S,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ST=()=>DS_story.init(),A=()=>X.addr();
function R(){const s=S();if(!s.realm)s.realm={ulka:0,acc:[],dev:[0,0,0,0,0,0],unrest:0,star:0,aud:0,seen:"",mon:0,union:0};return s.realm}R();
const STG=["Unclaimed","Outpost","Colony","Fortified"];
const W=[
 {n:"Tamas Prime",el:"Homeworld · Tamasi capital",id:"bhumi",col:"#4a62a8",sky:["#0a0e30","#6a7ad8"],atm:90,wat:40,bio:60,pol:10,y:{d:.6,i:.25}},
 {n:"Kālikā",el:"Colony world",id:"prana",col:"#3a7a4a",sky:["#06200f","#4fb36a"],atm:80,wat:30,bio:80,pol:5,y:{bio:1.2}},
 {n:"Raktā",el:"Mining world",id:"agni",col:"#8a2a18",sky:["#2a0600","#e0561a"],atm:50,wat:0,bio:5,pol:45,y:{en:1.5,ul:.05}},
 {n:"Nīlimā",el:"Ocean world",id:"jala",col:"#2a5a9a",sky:["#06284a","#2a7fb0"],atm:75,wat:90,bio:30,pol:5,y:{bio:.8,d:.2}},
 {n:"Dhūmrā",el:"Dust world",id:"vayu",col:"#a89070",sky:["#4a3a2a","#c8a878"],atm:60,wat:10,bio:10,pol:40,y:{en:1,ul:.03}},
 {n:"Ulkā Belt",el:"Asteroid station",id:"akasha",col:"#5b4a8a",sky:["#0a0620","#4b3a8f"],atm:30,wat:0,bio:0,pol:0,y:{ul:.12,d:.1}}];
/* access: 0 none · 1 partial (peace) · 2 full (conquest / union) */
const access=()=>{const st=ST(),e=S().end||{};if(e.winner==="h"&&(e.mode==="merge"||e.mode==="vassal"))return 2;return st.ch>=5?1:0};
const can=k=>{const a=access();return a===2||(a===1&&(k===0||R().acc.includes(k)))};
const stage=k=>{const t=S().tam;return Math.max(t&&t.pl[k]?t.pl[k].s:0,R().dev[k])};
const mult=()=>access()===2?((S().end||{}).mode==="vassal"?1.2:1):.35;
const yt=k=>{const f=(stage(k)+1)*.5*mult(),o=[];for(const q in W[k].y)o.push("+"+(W[k].y[q]*f).toFixed(2)+({d:" 📡",i:" ☸",bio:" 🧬",en:" ⚡",ul:" 🪨"})[q]+"/s");return o.join(" ")};
/* 3D hooks used by extras.js */
window.DS_visit=()=>{const v=S().visit;if(!v||v.k==null)return null;const k=v.k,w=W[k],s=stage(k);return{i:20+k,k,c:{id:w.id,n:w.n,el:w.el,b:"Tamasi Realm",col:w.col,sky:w.sky,size:30},p:{unlocked:true,sustained:s>=3,atmosphere:w.atm,water:w.wat,biosphere:clamp(w.bio+s*6,0,100),pollution:Math.max(0,w.pol-s*5),population:20+s*30+(k===0?60:0),popCap:200,energy:0,biomass:0,buildings:{solar:s,bioreactor:s,terraform:s,habitat:s,aiCore:Math.min(s,2),purifier:s>1?1:0,mandap:0,shield:s>=3?2:0}}}};
const LINES=()=>{const m=(S().end||{}).mode,o=["Proxima Tamas flares less since the sphere began.","Ulka-dhātu hums in our ship-yards.","Our harvests are green again."];
 return o.concat(m==="merge"?["Since the Merging, our children study in the Gurukul of Earth.","Two shards, one people."]:m==="vassal"?["We pay tribute — but Marshal Vyaghra's loyalists whisper of freedom."]:m==="vassalized"||m==="absorbed"?["The Samrat welcomes the envoys of the twin throne."]:["The treaty has put bread on our tables.","Priestess Mandakini says the twins are one fire."])};
window.DS_tamCity=(sc,V,st)=>{const k=V.k,wl=-2+V.p.water*.017,s=stage(k),n=Math.round(5+s*8+(k===0?14:0)),L=window.DS_layout?DS_layout(sc,[0x2b2f6b,0x66ffcc,0xc0c8ff],n,k*313+7,wl):null,npcs=[],names=["Tamasi citizen","Tamasi scholar","Tamasi engineer"],ls=LINES();
 sc.userData.win=L?L.win:[];
 for(let j=0;j<8;j++){const a=j*.8+k,r=10+j%3*3,x=Math.cos(a)*r,z=Math.sin(a)*r;if(X.Hh(x,z)<wl+.4)continue;const p=X.person([0x2b2f6b,0x4a5a9a,0xb0b8e8][j%3],j%2===1,false,{alien:1});p.position.set(x,X.Hh(x,z),z);sc.add(p);npcs.push({g:p,hx:x,hz:z,tm:0,tx:x,tz:z,who:names[j%3],cd:0})}
 return(t,dt,p)=>{L&&L.update(t);npcs.forEach((n,j)=>{const g=n.g;let m=0;n.tm-=dt;if(n.tm<=0){n.tm=3+Math.random()*4;n.tx=n.hx+(Math.random()-.5)*8;n.tz=n.hz+(Math.random()-.5)*8;if(X.Hh(n.tx,n.tz)<wl+.3){n.tx=n.hx;n.tz=n.hz}}
  const dx=n.tx-g.position.x,dz=n.tz-g.position.z,d=Math.hypot(dx,dz);if(d>.3){m=1;g.position.x+=dx/d*dt*1.2;g.position.z+=dz/d*dt*1.2;g.rotation.y=Math.atan2(dx,dz)}g.position.y=X.Hh(g.position.x,g.position.z);X.anim(g,t+j,m,false);
  if(Math.hypot(g.position.x-p.x,g.position.z-p.z)<5&&Date.now()>n.cd&&!X.busy()){n.cd=Date.now()+9000;X.say(n.who,ls[Math.floor(Math.random()*ls.length)]);setTimeout(()=>{if(!X.busy())X.hideSay()},4500)}})}};
/* travel */
function go(k){const s=S();if(X.busy())return D.toast("Finish the current scene first.");const loc=s.location??s.selectedPlanet,p=s.planets[loc];if(p.energy<150)return D.toast("Need ⚡150 on "+D.PLANETS[loc].n+" for fuel.");p.energy-=150;D.closeModal();const w=W[k];
 X.travel(loc,{c:{n:w.n,el:w.el,b:"Tamasi Realm",col:w.col,sky:w.sky},bio:w.bio/160,arrive:()=>{s.visit={k};s.view="world";D.renderAll();D.save();X.enterWalk()}})}
function ret(){const s=S();if(X.busy())return;s.visit=null;const loc=s.location??s.selectedPlanet;D.save();X.travel(loc,loc)}
/* story beats */
const dh=v=>{S().dharmaIndex=clamp(S().dharmaIndex+v,-100,100)};
const hit=f=>S().planets.forEach(p=>{if(p.unlocked){p.energy*=1-f;p.biomass*=1-f;p.population*=1-f*.6}});
function first(a,m){const L=a===1?[["High Priestess Mandakini",`The gates of Tamas Prime are open to your dignitaries, ${A()}.`],["Mahamatya","Our rockets may now carry envoys to the Tamasi capital. Other worlds open as trust grows — request access in the Tamasi Realm."],["Samrat Kalavarman","Come as a guest. Leave as a brother."]]:m==="merge"?[["Mahamatya",`The Tamasi worlds are ours, ${A()} — not as slaves, but as one people.`],["High Priestess Mandakini","Six worlds and a star lie open to you."],["Mahamatya","Rebuild what the war broke. Raise all six worlds to Fortified, and the twin shards shall be one again."]]:[["Marshal Vyaghra","We kneel, great one — but unrest simmers in the dust worlds."],["Mahamatya","Govern them justly, or they will rise. Fund the Tamasi Gurukul to keep the peace."]];
 DS_story.scene(L,()=>D.save(),1)}
function rebel(){const r=R();r.unrest=60;DS_story.scene([["Marshal Vyaghra","Dhūmrā and Raktā have risen! The Tamasi will no longer pay tribute!"],["Mahamatya",`The rebellion spreads, ${A()}. Daṇḍa or Sāma — choose.`],{c:[["Crush the rebels (Daṇḍa)","Heavy losses, Dharma −8, unrest → 40",()=>{hit(.2);dh(-8);r.unrest=40;return[["Senapati","The rebellion is crushed. The Tamasi will remember."]]}],["Concede autonomy (Sāma)","The Tamasi merge as equals: Dharma +6, ☸ −200",()=>{S().influence=Math.max(0,S().influence-200);dh(6);r.unrest=0;S().end.mode="merge";D.chron("🤝 Rebellion ended: the Tamasi merged as equals.");return[["High Priestess Mandakini","Then we are one people."]]}]]}],()=>D.save(),1)}
function audience(){const r=R(),s=S();if(Date.now()<r.aud)return D.toast("The Samrat is not receiving yet.");D.closeModal();r.aud=Date.now()+180000;
 DS_story.scene([["Samrat Kalavarman",`${D.rulerTitle()}, you honour my court.`],{t:"What do you ask of the Samrat?",c:[["Request an ulka-dhātu shipment","🪨 +15",()=>{r.ulka+=15;return[["Samrat Kalavarman","The ship-yards will send it."]]}],["Exchange scholars","📡 +150, Dharma +2",()=>{s.data+=150;dh(2);return[["High Priestess Mandakini","Knowledge is the shared inheritance."]]}],["Ask for star-engineers","Unlocks or boosts the Stellar Harvest (☸ +100 if already open)",()=>{if(!r.star)r.star=1;else s.influence+=100;return[["Samrat Kalavarman","Our engineers will serve under your sun."]]}]]}],()=>D.save(),1)}
function union(){const r=R(),s=S();D.closeModal();DS_story.scene([["High Priestess Mandakini","All six worlds stand open. The twin shards may be one."],["Samrat Kalavarman","I will lay down my crown — not to a conqueror, but to a sister throne."],{c:[["Proclaim the Union of the Twin Thrones","Full access, Dharma +10, ☸ +500",()=>{r.union=1;s.end=s.end||{};s.end.mode="merge";s.end.winner="h";dh(10);s.influence+=500;D.chron("🕉 The Union of the Twin Thrones was proclaimed.");return[["Mahamatya","The Tamasi are one with Earth. A new age begins."]]}]]}],()=>D.save(),1)}
function monument(){const r=R(),s=S();if(s.influence<500||r.ulka<30)return D.toast("Need ☸500 and 🪨30.");s.influence-=500;r.ulka-=30;D.closeModal();DS_story.scene([["Mahamatya","Six worlds raised, a people reunited — we shall raise a monument to the shattered asteroid."],["Rajguru","The Shard Monument will carry both names. Let history remember the twin shards, united."]],()=>{r.mon=1;s.influence+=1000;D.chron("🗿 The Shard Monument stands on Tamas Prime.");D.save()},1)}
/* UI */
function open(){const a=access(),r=R(),s=S(),e=s.end||{},st=ST(),m=e.mode,t=s.tam;
 if(a===0){D.show("🌌 Tamasi Realm","No access yet",`<p style="line-height:1.6">The Tamasi worlds are closed to you. Sign the <b>Treaty of Peace</b> for partial access, or win the <b>Dvandva Yuddha</b> for full control. Until then, you can only watch from the Observatory.</p><div class="codex">Open the 🕵 Tamasi &amp; Spies screen to see the treaty requirements.</div>`);return}
 const cards=W.map((w,k)=>{const ok=can(k),sg=stage(k);return`<div class="card"><b>${w.n} <small>· ${w.el}</small></b>${STG[sg]} · ${ok?yt(k):"locked"}${ok?`<button class="go" data-v="${k}">🚀 Send dignitaries (⚡150)</button>${a===2&&sg<3?`<button class="go" data-dev="${k}" style="background:#2a5a3a">Develop · 📡100 🪨5</button>`:""}`:`<button class="go" data-ac="${k}">🤝 Request access · ☸${150*k}</button>`}</div>`}).join("");
 const all3=W.every((w,k)=>stage(k)>=3),opened=W.every((w,k)=>can(k)||k===0&&true)&&r.acc.length>=5;
 D.show("🌌 Tamasi Realm",a===2?"Full access — all six worlds and their star":"Partial access — the capital is open; earn access to more",
 `<div class="lbl"><span>🪨 Ulka-dhātu</span><span>${r.ulka.toFixed(1)}</span></div>${m==="vassal"?`<div class="lbl" style="margin-top:6px"><span>Unrest</span><span>${r.unrest.toFixed(0)}%</span></div><div class="bar"><i style="width:${r.unrest}%;background:#ff6b6b"></i></div><button class="go" data-ug>Fund the Tamasi Gurukul (☸150 · unrest −25)</button>`:""}
 <div class="grid" style="margin-top:10px">${cards}</div>
 <div class="card" style="margin-top:10px"><b>☀ Proxima Tamas — Stellar Harvest</b>${r.star?`Active: +${(4*(a===2?1:.4)).toFixed(1)} ⚡/s`:"Tap the Tamasi star's power for your worlds."}${r.star?"":`<button class="go" data-star>Begin · 📡300 🪨20</button>`}</div>
 <button class="go" data-aud>👑 Request an audience with the Samrat</button>
 ${a===1&&opened&&st.rel>=80&&!r.union?`<button class="go" data-un style="background:linear-gradient(100deg,#ffd56b,#ff9933);color:#1a1200">🕉 Propose the Union of the Twin Thrones</button>`:a===1?`<p style="font-size:11.5px;color:var(--muted)">Union quest: open all six worlds (${r.acc.length}/5 beyond the capital) and reach relations +80 (now ${st.rel.toFixed(0)}).</p>`:""}
 ${a===2&&all3&&!r.mon?`<button class="go" data-mon>🗿 Raise the Shard Monument · ☸500 🪨30</button>`:a===2&&!r.mon?`<p style="font-size:11.5px;color:var(--muted)">Raise all six worlds to Fortified to unlock the Shard Monument.</p>`:""}`);
 const q=sel=>document.querySelectorAll(sel);
 q("[data-v]").forEach(b=>b.onclick=()=>go(+b.dataset.v));
 q("[data-dev]").forEach(b=>b.onclick=()=>{const k=+b.dataset.dev;if(s.data<100||r.ulka<5)return D.toast("Need 📡100 and 🪨5.");s.data-=100;r.ulka-=5;r.dev[k]=Math.min(3,stage(k)+1);D.chron(`🏗 ${W[k].n} developed to ${STG[r.dev[k]]}.`);D.save();open()});
 q("[data-ac]").forEach(b=>b.onclick=()=>{const k=+b.dataset.ac,c=150*k;if(st.rel<30||!t||t.mand<40)return D.toast("Relations ≥ +30 and Mandakini's support ≥ 40 are needed.");if(s.influence<c)return D.toast("Need ☸"+c+".");s.influence-=c;r.acc.push(k);D.chron(`🤝 Access granted to ${W[k].n}.`);D.save();open()});
 q("[data-ug]").forEach(b=>b.onclick=()=>{if(s.influence<150)return D.toast("Need ☸150.");s.influence-=150;r.unrest=Math.max(0,r.unrest-25);D.save();open()});
 q("[data-star]").forEach(b=>b.onclick=()=>{if(s.data<300||r.ulka<20)return D.toast("Need 📡300 and 🪨20.");s.data-=300;r.ulka-=20;r.star=1;D.chron("☀ The Stellar Harvest of Proxima Tamas began.");D.save();open()});
 q("[data-aud]").forEach(b=>b.onclick=audience);q("[data-un]").forEach(b=>b.onclick=union);q("[data-mon]").forEach(b=>b.onclick=monument)}
/* tick */
setInterval(()=>{const s=S();if(!s||!s.onboarded)return;const a=access(),r=R(),e=s.end||{},p0=s.planets[0];
 if(a>0){W.forEach((w,k)=>{if(!can(k))return;const f=(stage(k)+1)*.5*mult();for(const q in w.y){const v=w.y[q]*f;if(q==="d")s.data+=v;else if(q==="i")s.influence+=v;else if(q==="bio")p0.biomass+=v;else if(q==="en")p0.energy+=v;else r.ulka+=v}});if(r.star)p0.energy+=4*(a===2?1:.4);
  r.unrest=e.mode==="vassal"?clamp(r.unrest+.03,0,100):Math.max(0,r.unrest-.05)}
 if(a>0&&!X.busy()&&!D.modal){if(!r.seen.includes("a"+a)){r.seen+="a"+a;first(a,e.mode)}else if(e.mode==="vassal"&&r.unrest>=100)rebel()}
 const v=s.visit&&s.visit.k!=null;$("visitBar").style.display=v?"flex":"none";$("visitTxt").textContent=v?"📍 "+W[s.visit.k].n+" · Tamasi Realm":"";$("app").classList.toggle("visiting",!!v)},1000);
$("visitBack").onclick=ret;
const hud=window.DS_hud;window.DS_hud=()=>{hud&&hud();const r=S().realm;if(r&&(access()>0||r.ulka>0))$("resourceBar").insertAdjacentHTML("beforeend",`<div class="res">🪨 <b>${r.ulka.toFixed(0)}</b></div>`)};
const b=document.createElement("button");b.textContent="🌌 Tamasi Realm";b.onclick=open;document.querySelector(".navbtns").appendChild(b);
D.DEEDS.push(["twinshards","Twin Shards United","Unite the twin thrones or raise the Shard Monument",s=>s.realm&&(s.realm.mon||s.realm.union)]);
})();
