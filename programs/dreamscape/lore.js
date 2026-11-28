/* living lore — the Royal Gazette, a headline ticker and an "Age of the realm" that changes with your stats and scenarios */
(()=>{"use strict";
if(!window.DS)return;
const D=DS,S=()=>D.S,$=id=>document.getElementById(id),pick=a=>a[Math.floor(Math.random()*a.length)];
window.DS_news=t=>{const s=S();if(!s)return;(s.gaz=s.gaz||[]).unshift({t:Date.now(),text:t});s.gaz.length=Math.min(s.gaz.length,40)};
function lines(){const s=S(),st=s.story||{},f=s.fin,e=s.end||{},d=s.dharmaIndex,o=["Pilgrims crowd the ghats at dawn.","Bards in the bazaar sing of the shattered asteroid.","A new batch of apprentices joins the Gurukul.","Merchants argue over the price of ulka-dhātu.","The monsoon festival lights the evening sky."];
 if(d>=60)o.push("The people call the ruler a second Ashoka.","Bards compose verses on the throne's justice.");else if(d<=-40)o.push("Murmurs of discontent spread through the markets.","Whispers say the Mahamatya counts the days of the throne.");else if(d<0)o.push("Clerks grumble about unfair rulings.");
 if(f){if(f.k<0)o.push("The treasury runs dry; clerks demand their salaries.");else if(f.k>2000)o.push("Merchants praise the full Kosha of the realm.");if(f.tax&&(f.tax.inc+f.tax.trade+f.tax.prop)/3>20)o.push("Shopkeepers protest the heavy taxes.")}
 if(st.ch>=3&&st.ch<5){if(st.threat>60)o.push("Marshal Vyaghra's fleets mass at the edge of the system.");if(st.rel>30)o.push("Tamasi pilgrims are seen at the Mahal gates.")}
 if(st.ch>=5&&st.dyson&&!st.dyson.done)o.push(`The Dyson scaffold grows: ${st.dyson.h.toFixed(0)}% ours, ${st.dyson.a.toFixed(0)}% theirs.`);
 if(e.mode==="vassal")o.push("Tamasi governors pay tribute to the throne.");if(e.mode==="vassalized"||e.mode==="absorbed")o.push("Tamasi patrols watch the skies; hidden lamps burn in the cellars.");if(e.mode==="liberated")o.push("Bonfires of liberty burn in every city.");
 const un=s.planets.filter(p=>p.unlocked&&p.hab).length;if(un>1)o.push(`${un} worlds now hold living cities; rockets carry settlers between them.`);
 const cs=s.planets.reduce((a,p)=>a+(p.cities?p.cities.length:0),0);if(cs)o.push(`${cs} new cit${cs>1?"ies rise":"y rises"} beyond the capital.`);
 return o}
function age(){const s=S(),st=s.story||{},e=s.end||{},d=s.dharmaIndex,hp=s.planets.filter(p=>p.unlocked&&p.hab).length,pop=Math.floor(s.planets.reduce((a,p)=>a+(p.hab?p.population:0),0)),cs=s.planets.reduce((a,p)=>a+(p.cities?p.cities.length:0),0);
 let n,t;if(e.mode==="liberated"){n="Age of Liberation";t="The Tamasi were driven from the Solar System. Free again, the realm rebuilds beneath its own sun."}else if(e.mode==="vassalized"||e.mode==="absorbed"){n="Age of Occupation";t="The Tamasi hold the sun. In the cellars of the Mahal, the old guard waits and plans."}else if(e.mode==="merge"){n="Age of Unity";t="The twin shards are one people. Ulka-dhātu flows between two stars."}else if(e.mode==="vassal"){n="Age of Dominion";t="The Tamasi kneel, and the throne rules two worlds' worth of subjects — warily."}else if(st.ch>=5){n="Age of the Twin Thrones";t="Peace holds between the shards while two empires race to complete the Dyson sphere."}else if(st.ch>=3){n="Age of Shadows";t="The Tamasi fleets watch from Proxima Tamas. Every decision is weighed against the threat."}else{n="Age of Awakening";t="Eight barren worlds wait for your hand. The Antariksha Sangathan listens to the stars."}
 const m=d>=50?"The people revere the throne.":d>=10?"The people trust their ruler.":d>-30?"The people are uneasy.":"The people mutter, and the Mahamatya watches.";
 return[n,`${t} ${m} ${hp} world${hp>1?"s":""} hold${hp>1?"":"s"} ${pop} citizens${cs?` across ${cs+hp} cities`:""}.`]}
const tk=document.createElement("div");tk.id="ticker";$("app").appendChild(tk);
let last="";function tick(){const s=S();if(!s||!s.onboarded){tk.style.opacity=0;return}let t;do{t=pick(lines())}while(t===last&&lines().length>1);last=t;tk.style.opacity=0;setTimeout(()=>{tk.textContent="📰 "+t;tk.style.opacity=1},600);DS_news(t)}
setInterval(tick,16000);setTimeout(tick,4000);
function open(){const s=S(),a=age();D.show("📰 Royal Gazette",a[0],`<div class="codex"><b>${a[0]}</b><br>${a[1]}</div><h3 style="font-size:13px;margin:12px 0 4px">Latest news</h3>${(s.gaz||[]).slice(0,25).map(x=>`<div class="sat"><span>${x.text}</span></div>`).join("")||"<p style='color:var(--muted)'>No news yet.</p>"}`)}
const b=document.createElement("button");b.textContent="📰 Gazette";b.onclick=open;document.querySelector(".navbtns").appendChild(b);
})();
