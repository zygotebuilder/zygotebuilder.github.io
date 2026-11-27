/* Occupation & Resistance — if the Tamasi conquer Earth, hold secret meetings, gather strength, then expel them */
(()=>{"use strict";
if(!window.DS_story||!window.DS3)return;
const D=DS,X=DS3,T=X.T,S=()=>D.S,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ST=()=>DS_story.init(),A=()=>X.addr();
function Rs(){const s=S();if(!s.res)s.res={str:0,cd:0};return s.res}Rs();
const occ=()=>{const e=S().end||{};return e.winner==="a"&&(e.mode==="vassalized"||e.mode==="absorbed")};
setInterval(()=>{const s=S();if(!s||!s.onboarded)return;const o=occ();$("app").classList.toggle("occupied",o);if(!o)return;const r=Rs();s.planets.forEach(p=>{p.energy*=.9985;p.biomass*=.9985});r.str=clamp(r.str+.01,0,100)},1000);
const hud=window.DS_hud;window.DS_hud=()=>{hud&&hud();if(occ())$("resourceBar").insertAdjacentHTML("beforeend",`<div class="res" style="border-color:#ff6b6b">☠ Occupation · 🕯 <b>${Rs().str.toFixed(0)}%</b></div>`)};
const old=window.DS_legacy;window.DS_legacy=(sc,pi,st)=>{const f=old?old(sc,pi,st):null;if(!occ())return f;const sa=[];for(let k=0;k<4;k++){const g=new T.Group();const dsk=X.mesh(new T.SphereGeometry(4,16,10),X.M3(0x8a98a0,{metalness:.8,roughness:.3}));dsk.scale.set(1,.28,1);g.add(dsk);g.add(X.mesh(new T.SphereGeometry(1.7,12,8),X.M3(0x66ffcc,{transparent:true,opacity:.7,emissive:0x2a8a6a}),0,.6,0));sc.add(g);sa.push({g,k})}
 return(t,dt,p)=>{f&&f(t,dt,p);sa.forEach(({g,k})=>{const a=t*.12+k*1.7;g.position.set(Math.cos(a)*(40+k*9),36+Math.sin(t+k)*2,Math.sin(a)*(40+k*9));g.rotation.y=t})}};
const dh=v=>{S().dharmaIndex=clamp(S().dharmaIndex+v,-100,100)},hit=f=>S().planets.forEach(p=>{if(p.unlocked){p.energy*=1-f;p.biomass*=1-f;p.population*=1-f*.6}});
function free(why){const s=S(),st=ST(),e=s.end,r=Rs();e.mode="liberated";e.winner="h";st.ch=7;st.dyson.done=1;st.dyson.h=100;r.str=0;s.influence+=500;D.chron("🔥 "+why);D.save()}
function meeting(){const s=S(),r=Rs(),p0=s.planets[0];if(Date.now()<r.cd)return D.toast("The conspirators must lie low a while longer.");if(s.influence<40)return D.toast("Need ☸40 for the secret meeting.");s.influence-=40;r.cd=Date.now()+90000;D.closeModal();
 DS_story.scene([["Mahamatya",`${A()}, the Tamasi watchmen are asleep. In the cellars of the Mahal, let us speak low.`],["Rajguru","A hidden spark, patiently fed, burns down the occupier's house."],{t:"The agenda of the secret meeting",c:[["Hide grain and arms in the cellars","−100 🧬 on Bhūmi, resistance +9",()=>{p0.biomass=Math.max(0,p0.biomass-100);r.str=clamp(r.str+9+Math.random()*3,0,100);return[["Senapati","The stores are hidden."]]}],["Recruit engineers and scholars","−60 📡, resistance +9",()=>{s.data=Math.max(0,s.data-60);r.str=clamp(r.str+9+Math.random()*3,0,100);return[["Mahamatya","Minds willing to serve in secret."]]}],["Court Priestess Mandakini's faction","−☸60, resistance +11",()=>{s.influence=Math.max(0,s.influence-60);r.str=clamp(r.str+11+Math.random()*3,0,100);return[["High Priestess Mandakini","Not all Tamasi love the occupation."]]}]]}],()=>D.save(),1)}
function mukti(){const s=S(),t=s.tam||{fleet:60,mand:20},r=Rs();D.closeModal();let w=0,l=0;const us=()=>40+DS_story.defence()*12+r.str*.6+s.dharmaIndex*.15,them=()=>t.fleet+30-t.mand*.1;
 const rd=n=>({t:`Mukti Yuddha — round ${n} of 3`,c:[["Strike the garrisons","High risk, high reward",()=>res(n,16,.18)],["Rouse the people","Steady",()=>res(n,8,.08)]]});
 const res=(n,b,lf)=>{const win=us()+b+Math.random()*20-10>=them()+Math.random()*20-10;win?w++:l++;hit(lf);const q=[["Senapati",win?`Round ${n}: the occupiers fall back!`:`Round ${n}: the Tamasi hold the line.`]];if(n<3)q.push(rd(n+1));else if(w>=2){free("The Tamasi were driven out of the Solar System — Earth is free.");q.push(["Mahamatya",`The sun is ours again, ${A()}. The Tamasi withdraw to their own star.`])}else{r.str=40;q.push(["Mahamatya","The rising is crushed. We must gather strength again."])}return q};
 DS_story.scene([["Senapati","The cellars are empty — the people are in the streets. Mukti Yuddha begins!"],rd(1)],()=>D.save(),1)}
function expel(){D.closeModal();DS_story.scene([["Mahamatya",`${A()}, our envoys and Priestess Mandakini's faction have turned the Tamasi Sabha.`],["High Priestess Mandakini","The twin throne is not our master. Let our fleets withdraw."],["Samrat Kalavarman","So be it. We leave your sun — but remember the shared shard."]],()=>{free("The Tamasi withdrew from the Solar System by diplomacy — Earth is free.");D.save()},1)}
function open(){const s=S(),r=Rs(),t=s.tam||{mand:0},st=ST();
 if(!occ()){D.show("🕯 Resistance","Earth is free",`<p style="line-height:1.6">This screen matters only if the Tamasi conquer Earth and control its sun and planets. Win the war — or keep the peace.</p>`);return}
 const ok=r.str>=80&&s.dharmaIndex>=10&&st.rel>=20&&t.mand>=60;
 D.show("🕯 Resistance — Earth under occupation","The Tamasi control the sun and planets",`<div class="lbl"><span>Resistance strength</span><span>${r.str.toFixed(0)}%</span></div><div class="bar"><i style="width:${r.str}%;background:#ffb347"></i></div>
 <p style="font-size:12px;color:var(--muted);line-height:1.5">Stores and output are drained while occupied. Hold secret meetings in the Mahal to gather strength; it also grows slowly by itself. At 100% you may launch the Mukti Yuddha.</p>
 <button class="go" id="mt">🕯 Hold a secret meeting (☸40)${Date.now()<r.cd?` — ${Math.ceil((r.cd-Date.now())/1000)}s`:""}</button>
 <button class="go" id="mk" ${r.str>=100?"":"disabled style='opacity:.4'"}>🔥 Launch the Mukti Yuddha</button>
 <button class="go" id="ex" ${ok?"":"disabled style='opacity:.4'"}>🕊 Diplomatic expulsion (needs resistance ≥80, Dharma ≥10, relations ≥20, Mandakini ≥60)</button>`);
 $("mt").onclick=meeting;$("mk").onclick=()=>{if(r.str>=100)mukti()};$("ex").onclick=()=>{if(ok)expel()}}
const b=document.createElement("button");b.textContent="🕯 Resistance";b.onclick=open;document.querySelector(".navbtns").appendChild(b);
})();
