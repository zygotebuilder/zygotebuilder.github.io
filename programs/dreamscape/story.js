/* Dreamscape v4: storyline (Mahamatya, Tamasi aliens, Dyson sphere), decision legacies shown in-world, NPC dialogue, dethronement */
(()=>{"use strict";
if(!window.DS3||!window.DS)return;
const D=DS,X=DS3,T=X.T,P=D.PLANETS,S=()=>D.S,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const LK="dreamscape_legacy",falls=()=>{try{return+JSON.parse(localStorage.getItem(LK)||"{}").falls||0}catch(e){return 0}};
function init(){const s=S();if(!s.story)s.story={ch:0,rel:0,threat:0,raids:0,legacy:[],dyson:{h:0,a:0},warned:0,park:0,coup:0};return s.story}
init();if(S().dharmaIndex<=-100)S().dharmaIndex=-85; // grace for old saves
const loc=()=>S().location??S().selectedPlanet, title=()=>D.rulerTitle(), A=()=>X.addr();

/* ---------- legacies: every council decision leaves something standing in the world ---------- */
const LEG={};const BX=(c,x,y,z,a,b,d)=>["b",c,x,y,z,a,b,d],CY=(c,x,y,z,r,h)=>["c",c,x,y,z,r,h],CN=(c,x,y,z,r,h)=>["k",c,x,y,z,r,h],SP=(c,x,y,z,r)=>["s",c,x,y,z,r],OC=(c,x,y,z,r)=>["o",c,x,y,z,r];
const L=(id,n,parts,ppl,r,lines,def,rel)=>LEG[id]={n,parts,ppl,r:r||{},lines,def:def||0,rel:rel||0};
const row=(n,f)=>Array.from({length:n},(_,k)=>f(k));
L("gurukul","Gurukul",[BX(0x8a6a3a,0,1,0,5,2,4),CN(0xb8452a,0,2.8,0,3.8,1.6),CY(0x5a3a22,4,1.5,2,.3,3),SP(0x2f8f4e,4,3.8,2,1.8)],{n:3,m:"sit"},{d:.05,h:.001},["Teacher: Knowledge is the king's greatest wealth.","Student: The Gurukul teaches us dharma, numbers and the stars!"]);
L("granary","Royal Granary",[CY(0xd8b36a,0,2,0,2,4),CN(0x8a5a2a,0,4.6,0,2.3,1.2)],{n:3,m:"mill"},{bio:.3,h:.002},["Keeper: The granary is full — no child sleeps hungry on your watch."]);
L("orchard","Seed Orchards",row(8,k=>CN(0x2f8f4e,(k%4)*2.5-4,1.6,(k>>2)*3,1,3)).concat(row(8,k=>SP(0xff7a2a,(k%4)*2.5-4,2.5,(k>>2)*3+.6,.3))),{n:2,m:"mill"},{bio:.25,i:.02},["Merchant: Your seeds took root! The frontier fields are green because you allowed it.","Farmer: These orchards feed three villages now."]);
L("farm","Royal Farmland",[BX(0x6a8a2a,0,.1,0,10,.2,7)].concat(row(5,k=>BX(0x3fae4f,0,.5,-2.6+k*1.3,9,.6,.5))),{n:2,m:"mill"},{bio:.4,h:.001},["Farmer: The valley is golden with crops, thanks to you."]);
L("factory","Industrial Complex",[BX(0x666a70,0,1.5,0,6,3,4),CY(0x333333,-2,4.5,0,.5,3.5),CY(0x333333,1.5,4.3,0,.5,3.1),SP(0x555555,-2,6.7,0,.9)],{n:2,m:"march"},{en:.5,pol:.02},["Foreman: The furnaces roar. Energy flows — the air pays the price."]);
L("justicehall","Hall of Justice",[BX(0xe8dcc0,0,.4,0,8,.8,5)].concat(row(4,k=>CY(0xf2e4c8,-3+k*2,2.4,0,.3,3.2)),[BX(0xe8dcc0,0,4.3,0,8.4,.6,5.4),SP("effd56b",0,5.4,0,.5)]),{n:2,m:"mill"},{h:.004,i:.03},["Judge: Justice done openly is justice trusted."]);
L("governor_house","Governor's Residence",[BX(0x9a8a7a,0,1.2,0,5,2.4,4),CN(0x6a3a2a,0,3.3,0,3.8,1.8)],{n:1,m:"stand"},{d:.03},["Governor: A quiet reassignment… and quiet whispers follow."]);
L("taxhall","Treasury Hall",[BX(0xb89a4a,0,1.5,0,5,3,4),SP("effd56b",0,3.8,0,.8)],{n:2,m:"mill"},{i:.06,h:-.002},["Collector: The treasury overflows. The farmers grumble, Maharaj."]);
L("bazaar","Open Bazaar",row(3,k=>BX([0xe85a8a,0x3a8fd6,0xff9933][k],-4+k*4,1,0,2.6,.2,2.6)).concat(row(3,k=>CY(0x5a3a22,-4+k*4,.5,0,.1,1))),{n:3,m:"mill"},{i:.05,h:.002},["Trader: Light taxes, busy stalls — the bazaar sings your name."]);
L("caravan","Merchant Caravan",row(3,k=>BX(0x8a5a2a,k*3-3,.9,0,2,1,1.2)).concat(row(3,k=>CY(0x333333,k*3-3,.4,.7,.4,.2))),{n:2,m:"mill"},{i:.05,bio:.1},["Merchant: Open roads, open trade. The caravans carry your name across the worlds."]);
L("guildhouse","Merchant Guild",[BX(0x6a4a8a,0,1.6,0,5,3.2,4),SP("effd56b",0,3.8,0,.6)],{n:2,m:"mill"},{i:.07,h:-.001},["Guildmaster: The exclusive route is profitable… the small traders remember."]);
L("spytower","Gūḍhapuruṣa Tower",[CY(0x222233,0,5,0,1,10),SP("eff2200",0,10.5,0,.8)],{n:1,m:"stand"},{d:.06,h:-.002},["Hooded Spy: I see everything, Maharaj. The people are uneasy about it."]);
L("darbar","Open Durbar",row(4,k=>CY(0xd8b36a,k%2?3:-3,2,k>>1?2.4:-2.4,.3,4)).concat([BX(0xff9933,0,4.2,0,8,.4,6.4)]),{n:4,m:"mill"},{h:.004,i:.04},["Citizen: At the open durbar, even I may speak to the throne."]);
L("greenbelt","Green Belt",row(12,k=>CN(0x2f8f4e,Math.cos(k/1.9)*5,2,Math.sin(k/1.9)*5,1.1,4)),{n:2,m:"mill"},{pol:-.03,bio:.1},["Gardener: The green belt scrubs the sky clean — thank you."]);
L("shieldpylon","Shield Pylon",[CY(0x888899,0,3,0,.5,6),SP("e59e7ff",0,6.4,0,.9)],{n:1,m:"stand"},{},["Technician: Pylon online. The Raksha grid hums."],1);
L("watchtower","Watchtower",[BX(0x6a5a4a,0,4,0,2,8,2),BX(0x4a3a2a,0,8.5,0,3.2,1,3.2)],{n:1,m:"stand"},{},["Sentry: Eyes on the sky, Maharaj."],.5);
L("drones","Autonomous Drones",row(3,k=>OC("e59e7ff",0,6+k,0,.7)),{n:0},{d:.08,h:-.002},[],0);
L("sabha","Janasabha Hall",[CY(0xe8dcc0,0,1.5,0,3.2,3),SP(0xf2e4c8,0,3,0,3)],{n:3,m:"mill"},{i:.05,h:.003},["Councillor: Humans guide the machines. That is as it should be."]);
L("mentors","Hall of Mentors",row(3,k=>BX(0xd8c8a8,k*3-3,.5,0,1.4,1,1.4)).concat(row(3,k=>SP("effd56b",k*3-3,1.9,0,.6))),{n:3,m:"mill"},{i:.05,h:.003},["Young Heir: One day I shall rule as wisely as you, Maharaj."]);
L("embassy","Embassy of Peace",[BX(0xf4f4f4,0,1.8,0,5,3.6,4),CY(0x888888,3.5,3,0,.08,6),BX(0xff9933,3.9,5.4,0,1,.7,.05),BX("e66ffcc",5,5.4,0,1,.7,.05)],{n:3,m:"mill"},{h:.003,i:.02},["Diplomat: Every embassy is a bridge, Maharaj. Even to the stars."],0,.012);
L("fortress","Frontier Fortress",[BX(0x5a5a62,0,2,0,8,4,6)].concat(row(6,k=>BX(0x5a5a62,-3.5+k*1.4,4.4,3,.8,.8,.8))),{n:3,m:"march"},{h:-.001},["Captain: No raider will pass these walls."],1.5,-.01);
L("barracks","Barracks",[BX(0x5a6a5a,0,1,0,7,2,3),BX(0x4a5a4a,0,2.3,0,7.4,.6,3.4)],{n:4,m:"march"},{i:.02},["Soldier: The army is strong, ready for anything."],1);
L("exportdock","Export Dock",[BX(0x4a5a7a,0,.4,0,7,.8,4)].concat(row(4,k=>BX(0x8a5a2a,-2.5+k*1.7,1.3,0,1.2,1.2,1.2))),{n:2,m:"mill"},{i:.05},["Docker: Surplus shipped, coin earned."]);
const MAP={"Taxa|0":"taxhall","Taxa|1":"bazaar","Gudh|0":"spytower","Gudh|1":"darbar","Agri|0":"farm","Agri|1":"factory","Nyay|0":"justicehall","Nyay|1":"governor_house","Envi|0":"greenbelt","Raks|0":"shieldpylon","Raks|1":"watchtower","AI E|0":"drones","AI E|1":"sabha","Vyap|0":"guildhouse","Vyap|1":"caravan","Succ|0":"mentors","Sama|0":"embassy","Sama|1":"fortress","Guru|0":"gurukul","Guru|1":"barracks","Anna|0":"granary","Anna|1":"exportdock","Beej|0":"orchard"};
const nm=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").slice(0,4);
window.DS_decided=(e,i)=>{const s=S(),st=init(),x=e[2+i][2],pi=loc(),id=MAP[nm(e[0])+"|"+i],bits=[];
 if(x.bio)bits.push((x.bio>0?"+":"")+x.bio+" 🧬 biomass");if(x.en)bits.push((x.en>0?"+":"")+x.en+" ⚡ energy");if(x.pol)bits.push(x.pol+" pollution");if(x.i)bits.push((x.i>0?"+":"")+x.i+" ☸");if(x.d)bits.push((x.d>0?"+":"")+x.d+" 📡");if(x.h)bits.push((x.h>0?"+":"")+x.h+" dharma");
 let msg=bits.join(" · ")+(x.bio||x.en||x.pol?" on "+P[pi].n:"");
 if(id&&!st.legacy.some(l=>l.id===id&&l.p===pi)){st.legacy.push({id,p:pi});msg+=`\n📍 ${LEG[id].n} now stands on ${P[pi].n} — walk there to see it.`;D.chron(`📍 ${LEG[id].n} built on ${P[pi].n} after your ruling on "${e[0]}".`)}
 else if(id)msg+=`\n📍 ${LEG[id].n} on ${P[pi].n} is strengthened.`;
 setTimeout(()=>D.toast(msg.replace(/\n/g," — ")),1700);D.save()};

/* ---------- 3D legacy + NPCs + sky ---------- */
function build(parts){const g=new T.Group();parts.forEach(([t,c,x,y,z,a,b,d])=>{const G=t==="b"?new T.BoxGeometry(a,b,d):t==="c"?new T.CylinderGeometry(a,a,b,12):t==="k"?new T.ConeGeometry(a,b,8):t==="s"?new T.SphereGeometry(a,12,10):new T.OctahedronGeometry(a),em=typeof c==="string",col=em?parseInt(c.slice(1),16):c;g.add(X.mesh(G,X.M3(col,em?{emissive:col,emissiveIntensity:.9}:{}),x,y,z))});return g}
let near=null,talking=null;
const counsel=()=>{const s=S(),st=init(),o=[];o.push(`Dharma stands at ${s.dharmaIndex.toFixed(0)}. ${s.dharmaIndex<-50?"Beware, "+A()+": at −100 I am bound by the Arthashastra to dethrone you.":"The throne is secure while dharma holds."}`);
 o.push(st.ch<=1?"Terraform Bhūmi Minor, then claim a second world and travel there by rocket.":st.ch===2?"Claim a third world. The Tamasi will soon make their move.":st.ch===3?`The Tamasi threat stands at ${st.threat|0}%. Raise Raksha Kavach shields and rule with care.`:st.ch===4?"The parley with the Tamasi awaits, "+A()+".":"Contribute to the Dyson sphere (🌞) before the Tamasi finish it.");
 o.push("Every ruling you make leaves a mark on the worlds. Walk among your people and see it.");return o};
window.DS_legacy=(sc,pi,stt)=>{const st=init(),npcs=[],sauc=[],mv=[];near=null;talking=null;
 const addP=(g,x,z,m,who,lines)=>{g.position.set(x,X.Hh(x,z),z);sc.add(g);const n={g,hx:x,hz:z,m,tm:0,a:Math.random()*6,who,lines};if(m==="sit")g.userData.sit=true;npcs.push(n);return n};
 const mm=X.person(0x3a5fa8,false,false);addP(mm,-4,9,"stand","Mahamatya",counsel);
 if(st.ch>=5){const a=X.person(0x2a6a5a,false,false,{alien:1});addP(a,4,9,"stand","Tamasi Envoy",["Envoy: We breathe the carbon dioxide your factories make, and we give back oxygen for your plants.","Envoy: Equal in strength, we chose peace. May the sphere reward the better builder."])}
 st.legacy.filter(l=>l.p===pi).forEach((l,idx)=>{const d=LEG[l.id];if(!d)return;const g=build(d.parts),a=idx*.95+2.2,r=24+(idx%3)*7,x=Math.cos(a)*r,z=Math.sin(a)*r;g.position.set(x,X.Hh(x,z),z);g.rotation.y=-a+1.57;sc.add(g);
  if(l.id==="drones")mv.push(t=>g.children.forEach((c,k)=>{c.position.set(Math.cos(t*.8+k*2)*5,6+k,Math.sin(t*.8+k*2)*5)}));
  for(let k=0;k<(d.ppl.n||0);k++){const p=X.person([0xff9933,0x3a8fd6,0xe85a8a,0x74a84a][k%4],k%2===1,false);p.scale.setScalar(.9);addP(p,x+(k-1)*1.6,z+3,d.ppl.m,d.n,d.lines)}});
 if(st.ch>=2&&st.ch<5)for(let k=0;k<Math.min(4,1+(st.threat/30|0));k++){const g=new T.Group();g.add(X.mesh(new T.SphereGeometry(4,16,10),X.M3(0x8a98a0,{metalness:.8,roughness:.3}))).scale.set(1,.28,1);g.add(X.mesh(new T.SphereGeometry(1.7,12,8),X.M3(0x66ffcc,{transparent:true,opacity:.7,emissive:0x2a8a6a}),0,.6,0));const lt=new T.PointLight(0x66ffcc,1,40);lt.position.y=-1;g.add(lt);sc.add(g);sauc.push({g,k})}
 return(t,dt,p)=>{let best=null,bd=4.5;
  npcs.forEach((n,k)=>{let m=0;const g=n.g;
   if(n.m==="mill"){n.tm-=dt;if(n.tm<=0){n.tm=3+Math.random()*4;n.tx=n.hx+(Math.random()-.5)*8;n.tz=n.hz+(Math.random()-.5)*8}const dx=n.tx-g.position.x,dz=n.tz-g.position.z,d=Math.hypot(dx,dz);if(d>.3){m=1;g.position.x+=dx/d*dt*1.3;g.position.z+=dz/d*dt*1.3;g.rotation.y=Math.atan2(dx,dz)}}
   else if(n.m==="march"){n.a+=dt*.5;const x=n.hx+Math.cos(n.a)*3.5,z=n.hz+Math.sin(n.a)*3.5;g.rotation.y=Math.atan2(x-g.position.x,z-g.position.z);g.position.x=x;g.position.z=z;m=1}
   else if(n.who==="Mahamatya"||n.who==="Tamasi Envoy"||n.m==="stand"){g.rotation.y=Math.atan2(p.x-g.position.x,p.z-g.position.z)}
   g.position.y=X.Hh(g.position.x,g.position.z)-(n.m==="sit"?.45:0);X.anim(g,t+k,m,n===talking);
   const d=Math.hypot(g.position.x-p.x,g.position.z-p.z);if(d<bd){bd=d;best=n}});
  near=best;mv.forEach(f=>f(t));sauc.forEach(({g,k})=>{const a=t*.12+k*1.7;g.position.set(Math.cos(a)*(50+k*8),42+Math.sin(t+k)*2,Math.sin(a)*(50+k*8));g.rotation.y=t})}};
const tb=document.createElement("button");tb.className="go";tb.textContent="💬 Talk (E)";Object.assign(tb.style,{position:"absolute",left:"50%",bottom:"130px",transform:"translateX(-50%)",width:"auto",padding:"10px 18px",zIndex:70,display:"none"});$("app").appendChild(tb);
function talk(n){if(!n||talking||X.busy())return;talking=n;const Ls=typeof n.lines==="function"?n.lines():n.lines;let k=0;const nx=()=>{if(k>=Ls.length){X.hideSay();talking=null;return}const[w,...r]=Ls[k++].split(": ");X.say(r.length?w:n.who,r.length?r.join(": "):w);const b=document.createElement("button");b.textContent=k<Ls.length?"Continue ▶":"Farewell";b.onclick=nx;$("cBtns").appendChild(b)};nx()}
tb.onclick=()=>talk(near);addEventListener("keydown",e=>{if((e.key==="e"||e.key==="E")&&near)talk(near)});

/* ---------- court scenes ---------- */
function scene(q,end,alien){if(X.busy()||D.modal)return false;const c=X.buildCourt();c.lock=1;if(alien){const a=X.person(0x2a6a5a,false,false,{alien:1});a.position.set(0,0,-3.5);c.scene.add(a);c.M.Envoy=a}
 const sv=S().view;X.start(c,true);X.setMusic("court");
 const fin=()=>{X.hideSay();X.setMusic(null);if(sv==="world"){const w=X.buildWalk();w.walk=1;X.start(w,false)}else X.stop();end&&end()};
 const nx=()=>{const it=q.shift();if(!it)return fin();
  if(it.c){c.setWho("King");X.say(title(),it.t||"What is your decree?");it.c.forEach(o=>{const b=document.createElement("button");b.innerHTML=`<b>${o[0]}</b><small>${o[1]}</small>`;b.onclick=()=>{q.unshift(...(o[2]()||[]));nx()};$("cBtns").appendChild(b)})}
  else{c.setWho(it[0]);X.say(it[0],it[1]);const b=document.createElement("button");b.textContent="Continue ▶";b.onclick=nx;$("cBtns").appendChild(b)}};
 nx();return true}
const dh=v=>{const s=S();s.dharmaIndex=clamp(s.dharmaIndex+v,-100,100)};
const unl=()=>S().planets.filter(p=>p.unlocked).length;
const defence=()=>S().planets.reduce((a,p)=>a+p.buildings.shield,0)+init().legacy.reduce((a,l)=>a+((LEG[l.id]||{}).def||0),0);
const hit=(f)=>S().planets.forEach(p=>{if(p.unlocked){p.energy*=1-f;p.biomass*=1-f;p.population*=1-f*.6}});
const S1={
 prologue(){const st=init(),f=falls();return scene([["Mahamatya",`Jai ho, ${title()}! Your reign has brought peace to Earth.${f?` Yet the chronicles remember ${f} fallen reign${f>1?"s":""} before yours — let us not repeat them.`:""}`],["Mahamatya","Our space organisation, the Antariksha Sangathan, has found eight worlds in the nearby system — barren, but waiting."],["Rajguru","Five carry the seeds of the Panchabhūta: Earth, Water, Air, Fire and Ether. Three more — Soma, Prāṇa and Vajra — are gifts of the cosmos."],["Mahamatya",`Terraform, settle and govern them with dharma. But hear me, ${A()}: if your Dharma Index ever falls to −100, the Arthashastra binds me to dethrone you and choose another. The empire would fall with you.`],["Senapati","And we may not be alone. Our sensors catch faint signals from a star four light-years away."],["Mahamatya","Begin on Bhūmi Minor. Build, terraform, and walk among your people. The empire awaits."]],()=>{st.ch=1;D.chron("📜 Prologue: eight worlds found. The Mahamatya warns that dharma below −100 means dethronement.");D.save()})},
 signal(){const st=init();return scene([["Mahamatya",`${A()}! Deep sensors decoded a transmission from the Tamasi of Proxima Tamas, 4.2 light-years away.`],["Senapati","They look almost like us, but breathe carbon dioxide and exhale oxygen for their plants. Our air is poison to them — and theirs to us."],["Rajguru","Chanakya teaches: know your rival's strength before you speak."],{c:[["Send greetings (Sama)","Relations +15",()=>{st.rel+=15;return[["Mahamatya","A wise first word, "+A()+"."]]}],["Raise defences (Danda)","Relations −15, Dharma ±0, threat +10",()=>{st.rel-=15;st.threat+=10;return[["Senapati","The grid will be ready."]]}]]}],()=>{st.ch=2;st.threat=Math.max(st.threat,10);D.chron("👽 Contact: the Tamasi of Proxima Tamas are coming.");D.save()})},
 envoy(){const st=init();return scene([["Envoy","Humans. I am Vael-Tamas, envoy of the Tamasi. Our star is dying. We claim this system."],["Mahamatya","They are our equals in strength, "+A()+". War would burn both civilisations."],{t:"How do you answer the envoy?",c:[["Offer shared stewardship (Sama-Dāna)","Relations +20, Influence −30",()=>{st.rel+=20;S().influence=Math.max(0,S().influence-30);return[["Envoy","Then perhaps there is another way."]]}],["Refuse and warn them (Daṇḍa)","Relations −20, threat +20",()=>{st.rel-=20;st.threat+=20;return[["Envoy","You will regret this, human."]]}],["Stall and watch (Bheda)","Data +20, Dharma −3",()=>{S().data+=20;dh(-3);return[["Mahamatya","Patience — and shadows. Use them well."]]}]]}],()=>{st.ch=3;D.chron("👽 The Tamasi envoy Vael-Tamas demanded our system.");D.save()},1)},
 raid(){const st=init(),need=2+st.raids,def=defence(),ok=def>=need;st.raids++;st.threat=40;
  const q=ok?[["Senapati",`${A()}, the Tamasi raiders broke upon our shields (defence ${def.toFixed(1)} vs ${need}).`],["Mahamatya","Strength is the language they understand."]]:[["Senapati",`${A()}, the Tamasi raiders struck! Our defence (${def.toFixed(1)}) was below ${need}. Stores and settlements are damaged.`],["Mahamatya","Raise Raksha Kavach shields and build watchtowers, pylons and fortresses."]];
  return scene(q,()=>{if(ok){S().influence+=25;dh(3)}else hit(.35);D.chron(ok?"🛡 A Tamasi raid was repelled.":"🔥 A Tamasi raid damaged our worlds.");if(st.raids>=2)st.ch=4;D.save()})},
 parley(){const st=init();return scene([["Envoy","Our fleets match yours. One more clash and both our stars burn."],["Mahamatya","A war of equals is no victory, "+A()+" — only ash. A dvandva yuddha helps neither side."],{c:[["Treaty of equals (Sāma)","Peace; the Dyson sphere race begins",()=>{st.rel=50;st.threat=0;st.ch=5;st.dyson.a=Math.max(st.dyson.a,3);dh(6);D.chron("☮ Treaty of equals with the Tamasi. The Dyson sphere race begins.");return[["Mahamatya","Our scientists and theirs found the ancient star-engine blueprints: a Dyson sphere to hold the sun's power. We share the sky in peace, but whoever completes it first claims its energy."],["Envoy","May the better builders win."]]}],["Press the war (Daṇḍa)","Catastrophic losses, Dharma −20",()=>{hit(.5);dh(-20);st.threat=30;st.park=Date.now()+150000;return[["Senapati","The battle is a catastrophe for both sides…"],["Mahamatya","We may yet sue for peace — but the cost is already paid."]]}]]}],()=>D.save(),1)},
 warn(){const st=init();st.warned=1;return scene([["Mahamatya",`${A()}, your Dharma Index has fallen to ${S().dharmaIndex.toFixed(0)}. At −100 I must dethrone you and the empire will collapse.`],["Rajguru","Fund the Gurukul, hold open trials, feed the hungry, build the Yajna Mandap — restore dharma."]],()=>D.save())},
 coup(){const st=init();st.coup=1;return scene([["Mahamatya",`${A()}. Your Dharma Index has reached its lowest ebb. The people have lost faith.`],["Mahamatya","By the law of the Arthashastra, I declare this reign at an end."],["Senapati","The guards obey the Mahamatya."],["Rajguru","A new ruler will be chosen. Without you the empire cannot hold…"]],()=>{const n=falls()+1;try{localStorage.setItem(LK,JSON.stringify({falls:n}))}catch(e){}
  D.show("The Empire Falls",`${title()} has been dethroned`,`<p style="line-height:1.6">The Mahamatya has chosen another ruler. Across the worlds the empire collapses and the settlements fall silent. Reigns fallen so far: <b>${n}</b>.</p><button class="go" id="again">Begin a new reign</button>`,true);
  $("again").onclick=()=>{D.reset();location.reload()}})},
 won(p){const st=init();st.dyson.done=1;const w=p==="h";return scene(w?[["Mahamatya",`${A()}, the Dyson sphere is complete! Its light is ours first.`],["Envoy","The sphere is yours. We honour the treaty, as equals."],["Rajguru","A king who builds a sun-engine and keeps the peace is a Chakravarti."]]:[["Envoy","The Tamasi have completed the sphere first. But we honour the treaty — the light shall be shared."],["Mahamatya","Peace holds, "+A()+". Dharma is the greater victory."]],()=>{D.chron(w?"🌞 We completed the Dyson sphere first!":"🌞 The Tamasi completed the Dyson sphere; peace endures.");if(w)S().influence+=500;D.save()},1)}
};
function director(){const s=S(),st=init();
 if(s.dharmaIndex<=-100&&!st.coup)return S1.coup();
 if(s.dharmaIndex>-50)st.warned=0;
 if(s.dharmaIndex<=-70&&!st.warned)return S1.warn();
 if(st.ch===0)return S1.prologue();if(st.ch===1&&unl()>=2)return S1.signal();if(st.ch===2&&unl()>=3)return S1.envoy();
 if(st.ch===3&&st.threat>=100)return S1.raid();if(st.ch===4&&Date.now()>st.park)return S1.parley();
 if(st.ch>=5&&!st.dyson.done){if(st.dyson.h>=100)return S1.won("h");if(st.dyson.a>=100)return S1.won("a")}}
function passive(){const s=S(),st=init();
 st.legacy.forEach(l=>{const d=LEG[l.id];if(!d)return;const r=d.r,p=s.planets[l.p];s.data+=r.d||0;s.influence+=r.i||0;dh(r.h||0);if(r.bio)p.biomass+=r.bio;if(r.en)p.energy+=r.en;if(r.pol)p.pollution=clamp(p.pollution+r.pol,0,100);st.rel=clamp(st.rel+(d.rel||0),-100,100)});
 if(st.ch>=3&&st.ch<5)st.threat=clamp(st.threat+.06+(st.rel<0?.06:0)-(st.rel>30?.04:0)-defence()*.008,0,130);
 if(st.ch>=5&&!st.dyson.done)st.dyson.a=Math.min(100,st.dyson.a+.012+(st.rel<0?.01:0))}
setInterval(()=>{const s=S();if(!s||!s.onboarded)return;passive();tb.style.display=near&&!talking&&s.view==="world"&&!X.busy()?"block":"none";if(X.busy()||D.modal||talking)return;director()},1000);

/* ---------- HUD, nav, Dyson ---------- */
window.DS_hud=()=>{const st=S().story;if(!st)return;let h="";if(st.ch>=2&&st.ch<5)h+=`<div class="res">👽 Threat <b>${st.threat|0}%</b></div>`;if(st.ch>=5)h+=`<div class="res">🌞 <b>${st.dyson.h|0}%</b> vs 👽 <b>${st.dyson.a|0}%</b></div>`;if(h)$("resourceBar").insertAdjacentHTML("beforeend",h)};
function dyson(){const st=init(),d=st.dyson,ok=st.ch>=5;D.show("🌞 Dyson Sphere",ok?"First to complete it claims the star's power.":"Locked until a treaty with the Tamasi.",ok?`<div class="lbl"><span>Our progress</span><span>${d.h.toFixed(1)}%</span></div><div class="bar"><i style="width:${d.h}%;background:#ffd56b"></i></div><div class="lbl" style="margin-top:8px"><span>👽 Tamasi progress</span><span>${d.a.toFixed(1)}%</span></div><div class="bar"><i style="width:${d.a}%;background:#66ffcc"></i></div><p style="font-size:12px;color:var(--muted)">Each contribution: ⚡150 from this world + 📡60 + ☸30 → +2.5%.</p><button class="go" id="dyc">Contribute</button>`:"");
 if($("dyc"))$("dyc").onclick=()=>{const s=S(),p=s.planets[loc()];if(p.energy<150||s.data<60||s.influence<30)return D.toast("Need ⚡150 on this world, 📡60 and ☸30.");p.energy-=150;s.data-=60;s.influence-=30;d.h=Math.min(100,d.h+2.5);D.renderAll();D.save();dyson()}}
const nb=document.querySelector(".navbtns");[["🧔 Mahamatya",()=>D.show("Mahamatya's Counsel","Chief Minister of the realm",`<div class="sutra">${counsel().join("</div><div class=\"sutra\">")}</div>`)],["🌞 Dyson",dyson]].forEach(([t,f])=>{const b=document.createElement("button");b.textContent=t;b.onclick=f;nb.appendChild(b)});
D.DEEDS.push(["peace","Śānti Dūta","Make peace with the Tamasi",s=>s.story&&s.story.ch>=5],["chakravarti","Chakravarti","Complete the Dyson sphere first",s=>s.story&&s.story.dyson.done&&s.story.dyson.h>=100]);
})();
