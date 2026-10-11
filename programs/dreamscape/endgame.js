/* Dreamscape v7: Dvandva Yuddha (equal war), dominion over the Dyson sphere, Dyson Era projects, visible star-map progress */
(()=>{"use strict";
if(!window.DS_story||!window.DS)return;
const D=DS,X=DS3,S=()=>D.S,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ST=()=>DS_story.init(),A=()=>X.addr();
function E(){const s=S();if(!s.end)s.end={mode:null,winner:null,pend:0,proj:[],crowned:0};return s.end}E();
const tam=()=>S().tam||{fleet:40,mand:20,spies:0},dh=v=>{S().dharmaIndex=clamp(S().dharmaIndex+v,-100,100)};
const hit=f=>S().planets.forEach(p=>{if(p.unlocked){p.energy*=1-f;p.biomass*=1-f;p.population*=1-f*.6}});
const MODE={merge:"Merged empire",vassal:"Tamasi are our vassals",partner:"Equal co-stewards",vassalized:"Earth is a Tamasi vassal",absorbed:"Earth merged into the Tamasi realm"};
const setMode=(m,txt)=>{const e=E();e.mode=m;e.era=1;D.chron(txt);D.save()};
const era=()=>{const e=E();return e.mode&&(e.winner==="h"||e.mode==="partner")&&e.mode!=="vassalized"&&e.mode!=="absorbed"};
window.DS_war=()=>{E().pend=1};
function dominion(win){return win==="h"?{t:"The Tamasi are defeated. What becomes of them?",c:[["Merge the empires (Vilaya)","Dharma +8, ☸ +300, one joint empire",()=>{setMode("merge","☸ The Tamasi merged into our empire.");dh(8);S().influence+=300;return[["High Priestess Mandakini","Two shards, one people. Let it be so."]]}],["Make them vassals (Sāmanta)","+0.6 ☸/s tribute, Dharma −5",()=>{setMode("vassal","⚔ The Tamasi became our vassals.");dh(-5);return[["Marshal Vyaghra","We kneel… for now."]]}]]}:
 {t:"The Tamasi hold the sphere. What becomes of Earth?",c:[["Accept vassalage","−35% stores, tribute −0.4 ☸/s, Dharma +4",()=>{hit(.35);setMode("vassalized","🏳 Earth became a Tamasi vassal.");dh(4);return[["Samrat Kalavarman","Earth keeps its crown, under my sun."]]}],["Merge into the Tamasi realm","−15% stores, +0.3 📡/s",()=>{hit(.15);setMode("absorbed","🕉 Earth merged into the Tamasi realm.");return[["High Priestess Mandakini","One people at last."]]}]]}}
window.DS_endgame=p=>{const e=E();e.winner=p;DS_story.scene([["Mahamatya",p==="h"?"As the first to complete the sphere, we hold dominance — the treaty lets us decide how the Tamasi stand.":"The Tamasi hold dominance. The treaty lets them decide how Earth stands."],
 {t:"Dominion over the Dyson sphere",c:p==="h"?[["Co-stewards (Sāma)","Equal partners: +0.5 📡/s, +0.2 ☸/s",()=>{setMode("partner","☮ Earth and the Tamasi steward the sphere as equals.");return[["High Priestess Mandakini","The twins share the sun."]]}]].concat(dominion("h").c):[["Honour the treaty — equals","The Tamasi keep us as partners",()=>{setMode("partner","☮ The Tamasi honoured the treaty.");return[]}]].concat(dominion("a").c)}],()=>D.save(),1)};
function runWar(){const st=ST(),t=tam(),s=S();let w=0,l=0;
 const us=()=>40+DS_story.defence()*12+Math.min(40,(s.agency?s.agency.intel:0)*.4)+s.dharmaIndex*.15,them=()=>t.fleet+30-t.mand*.2;
 const rd=n=>({t:`Round ${n} of 3 — choose your stratagem`,c:[["Chakravyūha assault (Daṇḍa)","High risk, high reward",()=>res(n,18,0)],["Shield wall (Rakṣā)","Steady, fewer losses",()=>res(n,6,.1)],["Spy strike (Bheda)","Weakens their command (needs a spy)",()=>t.spies<1?[["Mahamatya","We have no agents in their camp, "+A()+"."],rd(n)]:res(n,12,.05,8)]]});
 const res=(n,b,lf,sp)=>{const a=us()+b+Math.random()*20-10,e=them()+Math.random()*20-10-(sp||0),win=a>=e;win?w++:l++;hit(.22-lf);t.fleet=Math.max(10,t.fleet-(win?18:8));dh(-1);
  const q=[["Senapati",win?`Round ${n}: our line holds and theirs breaks!`:`Round ${n}: the Tamasi hold — both fleets burn.`]];if(n<3)q.push(rd(n+1));else q.push(...close());return q};
 const close=()=>{const win=w>l?"h":"a";st.ch=7;st.threat=0;st.dyson.done=1;if(win==="h")st.dyson.h=100;else st.dyson.a=100;E().winner=win;D.chron(`⚔ The Dvandva Yuddha ended: ${win==="h"?"we":"the Tamasi"} conquered the Dyson sphere.`);
  return[["Mahamatya",win==="h"?`Victory, ${A()} — at a terrible price. The Dyson sphere is ours alone.`:`Defeat, ${A()}. The Tamasi hold the Dyson sphere and our worlds lie scarred.`],dominion(win)]};
 DS_story.scene([["Senapati","Both fleets are equal. This is the Dvandva Yuddha — a duel of two equal empires, and a catastrophe for both."],["Mahamatya","Whoever wins claims the Dyson sphere with no stake left to the other. The loser must merge or kneel."],rd(1)],()=>D.save(),1)}
/* economy of the new eras */
const PROJ=[["sol","☀ Solar Collectors","⚡ +3/s on every world",300,100],["rings","💍 Orbital Rings","🧬 +2/s on every world; rings appear on the star map",600,200],["lift","🌟 Star-Lifting Beam","📡 +4/s",1000,400],["beacon","📡 Galactic Beacon","Final project: the Chakravarti Coronation",2000,800]];
setInterval(()=>{const s=S();if(!s||!s.onboarded)return;const e=E();if(e.pend&&!X.busy()&&!D.modal){e.pend=0;runWar();return}
 const m=e.mode;if(m==="merge"){s.data+=1;s.influence+=.3}else if(m==="vassal")s.influence+=.6;else if(m==="partner"){s.data+=.5;s.influence+=.2}else if(m==="vassalized")s.influence=Math.max(0,s.influence-.4);else if(m==="absorbed")s.data+=.3;
 if(era()){s.planets.forEach(p=>{if(!p.unlocked)return;if(e.proj.includes("sol"))p.energy+=3;if(e.proj.includes("rings"))p.biomass+=2});if(e.proj.includes("lift"))s.data+=4}},1000);
function openDyson(){const st=ST(),e=E(),d=st.dyson,s=S();
 let h=`<div class="lbl"><span>🇮🇳 Earth</span><span>${d.h.toFixed(1)}%</span></div><div class="bar"><i style="width:${d.h}%;background:#ffd56b"></i></div><div class="lbl" style="margin-top:8px"><span>👁 Tamasi</span><span>${d.a.toFixed(1)}%</span></div><div class="bar"><i style="width:${d.a}%;background:#66ffcc"></i></div>`;
 if(st.ch>=5&&!d.done)h+=`<p style="font-size:12px;color:var(--muted)">Each contribution: ⚡150 (this world) + 📡60 + ☸30 → +2.5%. The first to 100% holds dominion.</p><button class="go" id="dyc">Contribute</button>`;
 else if(e.mode){h+=`<p>Dominion: <b>${MODE[e.mode]}</b></p>`;
  if(era())h+=`<h3 style="font-size:13px;margin:10px 0 4px">Dyson Era projects</h3><div class="grid">`+PROJ.map(p=>`<div class="card"><b>${p[1]}</b>${p[2]}<button class="go" data-p="${p[0]}" ${e.proj.includes(p[0])?"disabled":""}>${e.proj.includes(p[0])?"✔ Complete":`📡${p[3]} ☸${p[4]}`}</button></div>`).join("")+"</div>"+(e.crowned?"<p>👑 You were crowned Chakravarti.</p>":"");
  else h+=`<p>The sphere is under Tamasi control.</p><button class="go" id="lib">Petition for liberty (☸500, Dharma ≥ 20)</button>`}
 else h+="<p style='color:var(--muted)'>The sphere race begins after a Treaty of Peace — or the sphere is decided by war.</p>";
 D.show("🌞 Dyson Sphere & Dominion",st.ch>=5?"A star-engine to hold the whole sun":"Locked",h);
 if($("dyc"))$("dyc").onclick=()=>{const p=s.planets[s.location??s.selectedPlanet];if(p.energy<150||s.data<60||s.influence<30)return D.toast("Need ⚡150 on this world, 📡60 and ☸30.");p.energy-=150;s.data-=60;s.influence-=30;d.h=Math.min(100,d.h+2.5);D.renderAll();D.save();openDyson()};
 if($("lib"))$("lib").onclick=()=>{if(s.influence<500||s.dharmaIndex<20)return D.toast("Need ☸500 and Dharma ≥ 20.");s.influence-=500;setMode("partner","🕊 Earth won its liberty as an equal partner.");openDyson()};
 document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{const p=PROJ.find(x=>x[0]===b.dataset.p);if(s.data<p[3]||s.influence<p[4])return D.toast("Not enough 📡/☸.");s.data-=p[3];s.influence-=p[4];e.proj.push(p[0]);D.chron("🌞 Dyson project complete: "+p[1]);D.save();
  if(p[0]==="beacon"){D.closeModal();DS_story.scene([["Mahamatya",`${A()}, the Galactic Beacon burns across the stars.`],["Rajguru","A ruler who tamed a sun and kept dharma is a Chakravarti."],["High Priestess Mandakini","From the twin shards to one sky — we bless your crown."],["Mahamatya",`Long live ${D.rulerTitle()}, Chakravarti of the Five Elements!`]],()=>{e.crowned=1;s.influence+=1000;D.chron("👑 The Chakravarti Coronation.");D.save()},1)}else openDyson()})}
const find=t=>[...document.querySelectorAll(".navbtns button")].find(b=>b.textContent.includes(t));
const dy=find("Dyson");if(dy)dy.onclick=openDyson;
function warCouncil(){const st=ST(),t=tam(),i=S().agency?S().agency.intel:0,own=40+DS_story.defence()*12+Math.min(40,i*.4)+S().dharmaIndex*.15;
 D.show("⚔ War Council","Dvandva Yuddha — the duel of equal empires",st.ch<2?"<p>No enemy has made contact yet.</p>":st.ch>=5?"<p>A treaty is in force, or the war has been decided.</p>":`<p style="line-height:1.6">The Tamasi and Earth are near-equals. War would devastate both, but the victor claims the Dyson sphere alone — the loser must merge or kneel.</p><div class="lbl"><span>Our strength</span><span>${own.toFixed(0)}</span></div><div class="lbl"><span>Estimated Tamasi strength</span><span>${i>=25?(t.fleet+30-t.mand*.2).toFixed(0):"unknown (needs 25% intel)"}</span></div><button class="go" id="wr" style="background:#8a2a2a">⚔ Declare the Dvandva Yuddha</button>`);
 if($("wr"))$("wr").onclick=()=>{D.show("Declare war?","",`<p style="line-height:1.6">Three rounds of battle, heavy losses on both sides, and a Dyson sphere that goes entirely to the winner. This cannot be undone.</p><button class="go" id="y" style="background:#8a2a2a">Yes — Dvandva Yuddha</button><button class="go" id="n" style="background:#2a3a5a">No, return</button>`);$("y").onclick=()=>{D.closeModal();DS_war()};$("n").onclick=warCouncil}}
const wb=document.createElement("button");wb.textContent="⚔ War Council";wb.onclick=warCouncil;document.querySelector(".navbtns").appendChild(wb);
D.DEEDS.push(["coronation","Chakravarti","Complete the Galactic Beacon",s=>s.end&&s.end.crowned],["conqueror","Vijayī","Win the Dvandva Yuddha",s=>s.end&&s.end.winner==="h"&&s.story&&s.story.ch===7]);
/* visible progress in the stars (2D star map) */
window.DS_sky=(c,cx,cy,t,W,H,sc,pos)=>{const st=S().story,e=E();if(!st)return;const d=st.dyson,done=d.done,fr=done&&e.winner==="h"?1:d.h/100,tx=W*.86,ty=H*.3;
 if(fr>0){c.save();c.lineWidth=4;c.strokeStyle="rgba(255,213,107,.9)";c.shadowColor="#ffd56b";c.shadowBlur=12;const n=Math.ceil(fr*40);for(let i=0;i<n;i++){const a=i/40*6.283+t*.0002;c.beginPath();c.arc(cx,cy,48,a,a+.12);c.stroke()}c.restore();
  if(fr>=1){const g=c.createRadialGradient(cx,cy,30,cx,cy,56);g.addColorStop(0,"rgba(255,200,100,.4)");g.addColorStop(1,"rgba(255,200,100,0)");c.fillStyle=g;c.fillRect(cx-60,cy-60,120,120)}}
 c.fillStyle="rgba(255,106,74,.95)";c.beginPath();c.arc(tx,ty,9,0,6.3);c.fill();c.fillStyle="#9eb5d6";c.font="10px sans-serif";c.textAlign="center";c.fillText("Proxima Tamas",tx,ty+32);
 const ft=done&&e.winner==="a"?1:d.a/100;if(ft>0){c.strokeStyle="rgba(102,255,204,.9)";c.lineWidth=3;const n=Math.ceil(ft*24);for(let i=0;i<n;i++){const a=i/24*6.283;c.beginPath();c.arc(tx,ty,18,a,a+.15);c.stroke()}}
 if(e.proj&&e.proj.includes("rings")&&pos)pos.forEach(o=>{if(S().planets[o.i]&&S().planets[o.i].unlocked){c.strokeStyle="rgba(255,213,107,.8)";c.lineWidth=1.5;c.beginPath();c.ellipse(o.x,o.y,o.r+9,(o.r+9)*.3,.4,0,6.3);c.stroke()}});
 if(e.proj&&e.proj.includes("beacon")){c.strokeStyle="rgba(255,255,255,.5)";c.setLineDash([4,6]);c.beginPath();c.moveTo(cx,cy);c.lineTo(tx,ty);c.stroke();c.setLineDash([])}
 if(S().agency)S().agency.sats.filter(x=>!x.done).forEach(x=>{const u=clamp((Date.now()-x.t0)/x.eta,0,1);c.fillStyle="#cfe";c.fillRect(cx+(tx-cx)*u-1,cy+(ty-cy)*u-1,3,3)})};
})();
