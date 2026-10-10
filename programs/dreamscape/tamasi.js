/* Dreamscape v6: Tamasi intelligence — star system map, conquests, spy network, peace-treaty requirements */
(()=>{"use strict";
if(!window.DS_story||!window.DS)return;
const D=DS,S=()=>D.S,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const STG=["Unclaimed","Outpost","Colony","Fortified"],COL=["#667788","#e0b040","#ff8a3a","#ff4a4a"];
const BASE=[["Tamas Prime","Homeworld",3],["Kālikā","Colony world",2],["Raktā","Mining world",1],["Nīlimā","Ocean world",0],["Dhūmrā","Dust world",0],["Ulkā Belt","Asteroid belt",0]];
function T0(){const s=S();if(!s.tam)s.tam={pl:BASE.map(b=>({n:b[0],k:b[1],s:b[2],p:0})),fleet:30,spies:0,mand:20,rep:[],next:Date.now()+45000};return s.tam}
T0();window.DS_tamAdd=v=>{const t=T0();t.mand=clamp(t.mand+v,0,100)};
const intel=()=>S().agency?S().agency.intel:0, ST=()=>DS_story.init(), A=()=>DS3.addr();
const req=()=>{const s=S(),st=ST(),t=T0(),df=DS_story.defence();return[["Contact made — the Tamasi envoy has been met",st.ch>=3],["Intelligence on the Tamasi ≥ 40% (now "+intel().toFixed(0)+"%)",intel()>=40],["Relations ≥ +25 (now "+st.rel.toFixed(0)+")",st.rel>=25],["Dharma Index ≥ 0 (now "+s.dharmaIndex.toFixed(0)+")",s.dharmaIndex>=0],["Priestess Mandakini's support ≥ 50 (now "+t.mand.toFixed(0)+")",t.mand>=50],["Defence at parity ≥ 2 (now "+df.toFixed(1)+")",df>=2]]};
function rep(text){const t=T0();t.rep.unshift({t:Date.now(),text});t.rep.length=Math.min(t.rep.length,12);if(S().agency)S().agency.intel=Math.min(100,S().agency.intel+.4)}
const doing=()=>{const st=ST(),t=T0(),i=intel();if(i<10)return"Telemetry too weak. Launch more Tamasi Watch satellites.";const tg=t.pl.find(p=>p.s<3);
 if(st.ch>=5)return`Both worlds raise the Dyson scaffold. Tamasi progress: ${st.dyson.a.toFixed(0)}%. Priestess Mandakini's reunion faith guides the Sabha.`;
 if(st.ch<3)return"The Sabha of Seven debates whether to answer Earth's signal. Marshal Vyaghra's fleets train in the dust belts.";
 return`${tg?`Marshal Vyaghra pushes to ${tg.s?"fortify":"claim"} ${tg.n}. `:"All Tamasi worlds are fortified. "}Fleet strength ${i>=25?t.fleet.toFixed(0):"unknown"}. Mandakini's peace faction holds ${i>=25?t.mand.toFixed(0)+"%":"an unknown share"} of the Sabha.`};
setInterval(()=>{const s=S();if(!s||!s.onboarded)return;const t=T0(),st=ST(),now=Date.now();
 if(st.ch<5){const rate=.05+(st.rel<0?.03:0)+(t.mand<30?.02:0)-(t.mand>60?.03:0),p=t.pl.find(q=>q.s<3);
  if(p){p.p+=Math.max(.01,rate);if(p.p>=100){p.p=0;p.s++;t.fleet=Math.min(150,t.fleet+8);rep(p.s===1?`Tamasi planted an outpost on ${p.n}.`:p.s===2?`${p.n} grew into a Tamasi colony.`:`${p.n} was fortified by Marshal Vyaghra.`)}}
  if(st.ch>=3&&st.ch<5)st.threat=clamp(st.threat+Math.max(0,t.fleet-60)*.0003,0,130)}
 t.mand=clamp(t.mand+(s.dharmaIndex>10?.01:0)-(st.rel<-20?.01:0),0,100);
 if(t.spies>0&&now>=t.next){const ps=t.pl.filter(p=>p.s>=1),p=ps[Math.floor(Math.random()*ps.length)];const L=[`Marshal Vyaghra inspects the Ulka fleet at ${p.n}. Fleet strength ${t.fleet.toFixed(0)}.`,`Priestess Mandakini's sermon draws crowds on Tamas Prime. Peace support ${t.mand.toFixed(0)}%.`,"Tamasi engineers test ulka-dhātu hull plates for the star-engine.","The Sabha of Seven quarrels over the twin world's reply.",`A Tamasi supply convoy reaches ${p.n}.`];rep(L[Math.floor(Math.random()*L.length)]);t.next=now+60000/(1+t.spies*.5);D.toast("🕵 New spy report")}},1000);
function map(){const t=T0(),k=intel()>=10;return`<svg viewBox="0 0 320 190" style="width:100%;background:radial-gradient(#10204a,#050a1c);border-radius:14px"><circle cx="160" cy="95" r="11" fill="#ff6a4a"/><circle cx="160" cy="95" r="18" fill="none" stroke="#ff6a4a" opacity=".3"/>${t.pl.map((p,i)=>{const rx=38+i*24,ry=rx*.55,a=i*1.35+.4,x=160+Math.cos(a)*rx,y=95+Math.sin(a)*ry;return`<ellipse cx="160" cy="95" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(160,205,255,.15)"/><circle cx="${x}" cy="${y}" r="${i===0?8:5.5}" fill="${i===0?"#59a8ff":COL[p.s]}"/><text x="${x}" y="${y+16}" fill="#cfe0f4" font-size="8" text-anchor="middle">${k?p.n:"?"}</text>`}).join("")}<text x="8" y="14" fill="#9eb5d6" font-size="9">Proxima Tamas — 4.2 light-years</text></svg>`}
function open(){const t=T0(),st=ST(),i=intel(),conq=t.pl.filter(p=>p.s>=2).length,r=req(),ok=r.every(x=>x[1]),can=ok&&st.ch>=2&&st.ch<5;
 D.show("🕵 Tamasi System & Spy Network",`Intelligence ${i.toFixed(0)}% · ${t.spies} spies`,
 `${map()}<div class="codex"><b>What they are doing</b><br>${doing()}</div>
 <h3 style="margin:12px 0 4px;font-size:13px">Worlds of the Tamasi · ${conq}/${t.pl.length} colonised or fortified</h3>
 ${t.pl.map(p=>`<div class="sat"><span>${i>=10?p.n+" · "+p.k:"? unknown world"}</span><span style="color:${COL[p.s]}">${i>=10?STG[p.s]+(i>=25&&p.s<3?" "+p.p.toFixed(0)+"%":""):"?"}</span></div>`).join("")}
 <h3 style="margin:12px 0 4px;font-size:13px">Gūḍhapuruṣa — spy operations</h3>
 <div class="grid"><button class="card go" data-o="rec">🕵 Recruit spy<br><small>📡30 · max 6</small></button><button class="card go" data-o="int">📡 Intercept Sabha<br><small>📡25 · +2% intel</small></button>
 <button class="card go" data-o="sab">💣 Sabotage fleet<br><small>📡50 · fleet −15, threat −8, dharma −3</small></button><button class="card go" data-o="sup">🕊 Back Mandakini<br><small>📡40 ☸20 · support +12</small></button></div>
 ${t.rep.length?t.rep.slice(0,6).map(x=>`<div class="codex">${x.text}</div>`).join(""):"<p style='font-size:12px;color:var(--muted)'>No spy reports yet — recruit a spy.</p>"}
 <h3 style="margin:12px 0 4px;font-size:13px">☮ Treaty of Peace with the Tamasi</h3>${st.ch>=5?"<p>✔ The treaty is signed. The Dyson race is on.</p>":r.map(x=>`<div class="sat"><span>${x[1]?"✔":"✘"} ${x[0]}</span></div>`).join("")+`<button class="go" id="trty" ${can?"":"disabled style='opacity:.4'"}>☮ Propose the Treaty of Equals</button><p style="font-size:11.5px;color:var(--muted)">Raise Relations through Sāma choices and embassies, keep dharma up, back Mandakini, and hold shields at parity.</p>`}`);
 document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const s=S(),o=b.dataset.o,sp=t.spies>0;
  const pay=(d,i)=>{if(s.data<d||s.influence<(i||0)){D.toast("Not enough 📡/☸.");return false}s.data-=d;s.influence-=i||0;return true};
  if(o==="rec"){if(t.spies>=6)return D.toast("Network is full.");if(!pay(30))return;t.spies++;rep("A new Gūḍhapuruṣa agent crosses into Tamasi space.")}
  else if(!sp)return D.toast("Recruit a spy first.");
  else if(o==="int"){if(!pay(25))return;if(s.agency)s.agency.intel=Math.min(100,s.agency.intel+2);rep("Intercepted: the Sabha weighs the twin throne's reply.")}
  else if(o==="sab"){if(!pay(50))return;t.fleet=Math.max(10,t.fleet-15);st.threat=Math.max(0,st.threat-8);s.dharmaIndex-=3;rep("A Tamasi fleet depot was sabotaged.")}
  else if(o==="sup"){if(!pay(40,20))return;t.mand=clamp(t.mand+12,0,100);rep("Secret gifts strengthen Priestess Mandakini's faction.")}
  D.renderAll();D.save();open()});
 if($("trty"))$("trty").onclick=()=>{if(!can)return;D.closeModal();DS_story.scene([["Mahamatya",`${A()}, the Sabha of Seven is ready to hear the twin throne.`],["High Priestess Mandakini","Two shards of one asteroid, two lights of one fire. Let us end this."],["Samrat Kalavarman","Marshal Vyaghra objects. But our harvests burn, and your shields are no jest. I listen."],{c:[["Sign the Treaty of Equals (Sāma)","Peace; the Dyson sphere race begins",()=>{st.rel=50;st.threat=0;st.ch=5;st.dyson.a=Math.max(st.dyson.a,3);t.mand=100;S().dharmaIndex=Math.min(100,S().dharmaIndex+6);D.chron("☮ Treaty of Equals signed with the Tamasi. The Dyson race begins.");return[["Samrat Kalavarman","So be it. Two thrones, one sun."],["Mahamatya","Our scientists and theirs hold the star-engine blueprint. Whoever completes the Dyson sphere first claims its power — in peace."]]}]]}],()=>D.save(),1)}}
const b=document.createElement("button");b.textContent="🕵 Tamasi & Spies";b.onclick=open;document.querySelector(".navbtns").prepend(b);
})();
