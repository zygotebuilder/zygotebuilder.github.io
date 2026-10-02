/* CIVICA — The City Is Ours. 3D civic-sense game. Progress saved in localStorage. */
const $=s=>document.querySelector(s), SAVE="civica_progress_v2";
let S=null;try{S=JSON.parse(localStorage.getItem(SAVE))}catch(e){}
S=S||{stars:{},best:{},total:0};
const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}};

// kinds: wet = organic, dry = recyclable, haz = hazardous
const T={wet:{n:"Organic",c:0x7a9b2e,h:"#6f8f25"},dry:{n:"Recyclable",c:0x3d9be0,h:"#3d86e8"},haz:{n:"Hazardous",c:0xe0524f,h:"#d9433f"}};
// m: collect | sort | rush ; c: items to clear ; t: time limit(s) ; par: 3-star time ; e/cap: rush spawn gap / fail cap
const L=[
{n:"Sunrise Lane",m:"collect",k:["dry","wet"],c:8,par:35,sky:0x9bd8ff,dirty:0x8a8470,gr:0x5fae5a,
 i:"Your own street. Walk over litter to pick it up and watch the neighbourhood come back to life.",
 f:"A street is a shared home. Litter that looks small to one person is one more thing for everyone else to live with."},
{n:"Market Mess",m:"collect",k:["wet","wet","dry"],c:14,t:60,par:40,sky:0xffd9a0,dirty:0x8c7b62,gr:0x7cab55,
 i:"The market closed and left a trail of scraps. Clear it before the timer runs out.",
 f:"Rotting food waste attracts flies, rats and stray animals, and spreads disease. Fast, clean disposal protects public health."},
{n:"Sort Street",m:"sort",k:["wet","dry"],c:10,par:50,sky:0xa8e0f5,dirty:0x8a8470,gr:0x5fae5a,
 i:"Pick up an item, then carry it to the matching bin. Wrong bins cost you stars.",
 f:"Sorting at source keeps recyclables clean enough to reuse and lets food waste become compost instead of landfill."},
{n:"Riverbank",m:"sort",k:["dry","dry","wet"],c:12,par:60,sky:0xbfe9ff,dirty:0x77806f,gr:0x6bb36a,water:1,
 i:"Plastic is drifting toward the river. Intercept it before it reaches the water.",
 f:"Plastic never truly disappears. It breaks into microplastics that spread through rivers, soil and food chains."},
{n:"Rush Hour Bazaar",m:"rush",k:["wet","dry"],c:16,e:3.2,cap:11,t:100,par:70,sky:0xffe6b8,dirty:0x8a7a62,gr:0x80a84f,
 i:"Crowds keep dropping waste. Sort it as fast as it appears. If litter hits the limit, the street is lost.",
 f:"Cleanliness is not a one-time event. A clean city is kept clean by thousands of small, repeated habits."},
{n:"Hazard Alley",m:"sort",k:["wet","dry","haz"],c:12,par:65,sky:0xd5c8ff,dirty:0x726c78,gr:0x62a35f,
 i:"Batteries and chemicals mixed into normal waste. Red items go in the red hazard bin only.",
 f:"Batteries, paint and chemicals can leak toxins into soil and groundwater. Hazardous waste needs its own safe route."},
{n:"Monsoon Drains",m:"collect",k:["dry","dry","wet"],c:18,t:70,par:50,sky:0x9db4c8,dirty:0x5c6670,gr:0x4f8f5c,
 i:"Storm clouds are coming. Clear the drains before the street floods.",
 f:"Waste that clogs drains is a leading cause of urban flooding. One blocked drain can flood many streets."},
{n:"Beach Day",m:"sort",k:["dry","wet","haz"],c:16,par:75,sky:0x8fe0ff,dirty:0x8e8872,gr:0xe8d6a0,water:1,
 i:"Visitors left the shore in a state. Sort what the tide did not take.",
 f:"Beaches and oceans are public goods. Waste left on sand ends up in the sea and harms marine life."},
{n:"Night Festival",m:"rush",k:["wet","dry","dry"],c:20,e:2.6,cap:12,t:110,par:85,sky:0x24365e,dirty:0x2e2e38,gr:0x3c7a52,night:1,
 i:"Lanterns, crowds, food stalls — and mountains of waste. Keep the celebration clean.",
 f:"Festivals can be joyful and clean. Celebration does not come with permission to leave a mess for others."},
{n:"Quiet Zone",m:"sort",k:["wet","dry","haz"],c:20,t:110,par:85,sky:0xe8f4ff,dirty:0x8c8c86,gr:0x70b078,
 i:"A hospital lane. Cleanliness here protects people who are already vulnerable.",
 f:"Dirty surroundings spread infection. In places where people heal, hygiene is part of care."},
{n:"Zero Waste Fair",m:"rush",k:["wet","dry","haz"],c:26,e:2.2,cap:12,t:120,par:95,sky:0xc6f0c8,dirty:0x81806a,gr:0x66b25f,
 i:"Faster. Messier. Sort everything correctly and keep the fair spotless.",
 f:"Systems work when everyone cooperates: citizens sort, workers collect, and the city recycles."},
{n:"Civica Central",m:"rush",k:["wet","dry","haz"],c:32,e:1.9,cap:13,t:140,par:115,sky:0x8fd3ff,dirty:0x6f6c60,gr:0x5fb461,
 i:"The final test. A whole city of habits in one square. Prove it can stay clean.",
 f:"A good society is not built by one hero. It is built by ordinary people doing the clean, responsible thing even when nobody is watching."}
];

// ---------- three.js ----------
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
$("#view").appendChild(R.domElement);
const cam=new THREE.PerspectiveCamera(55,1,.1,200),clock=new THREE.Clock();
let sc=null,G=null;
function resize(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener("resize",resize);resize();
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
const M=c=>new THREE.MeshLambertMaterial({color:c});
function mesh(g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);return o}
function label(t,col){const c=document.createElement("canvas");c.width=256;c.height=96;const x=c.getContext("2d");
 x.fillStyle=col;x.fillRect(0,0,256,96);x.fillStyle="#fff";x.font="bold 40px sans-serif";x.textAlign="center";x.fillText(t,128,63);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c)}));s.scale.set(3.4,1.3,1);return s}
let AC;function beep(f,d=.08){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
let tt;function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("on"),1400)}

function build(i){
 const d=L[i];sc=new THREE.Scene();
 const clean=new THREE.Color(d.sky),dirty=new THREE.Color(d.dirty);
 sc.background=dirty.clone();sc.fog=new THREE.Fog(dirty.clone(),16,60);
 const amb=new THREE.AmbientLight(0xffffff,.4),sun=new THREE.DirectionalLight(d.night?0x9aaaff:0xffffff,.8);sun.position.set(10,20,8);sc.add(amb,sun);
 const gm=M(d.gr),lm=M(0x77704a);
 sc.add(mesh(new THREE.PlaneGeometry(120,120).rotateX(-Math.PI/2),gm,0,0,0));
 sc.add(mesh(new THREE.BoxGeometry(80,.05,6),M(0x3b4248),0,.03,4));
 for(let x=-36;x<40;x+=6)sc.add(mesh(new THREE.BoxGeometry(2.5,.06,.25),M(0xf1d66c),x,.07,4));
 if(d.water)sc.add(mesh(new THREE.BoxGeometry(90,.1,16),M(0x3b8fd0),0,.05,-30));
 for(let a=0;a<30;a++){const r=rnd(26,34),t=a/30*Math.PI*2,h=rnd(5,16),w=rnd(4,7);
  if(d.water&&Math.sin(t)<-.3)continue;
  const b=mesh(new THREE.BoxGeometry(w,h,w),M(pick([0xd7ccb4,0xc8a995,0xaebfbb,0xd1c6a6,0xc5aaa0])),Math.cos(t)*r,h/2,Math.sin(t)*r);
  if(d.night)b.material.color.multiplyScalar(.45);sc.add(b)}
 for(let a=0;a<16;a++){const x=rnd(-19,19),z=rnd(-17,17);if(Math.abs(z-4)<4)continue;
  sc.add(mesh(new THREE.CylinderGeometry(.2,.3,1.6),M(0x6b4a2b),x,.8,z),mesh(new THREE.ConeGeometry(1.2,3,8),lm,x,2.8,z))}
 if(d.night)for(let x=-18;x<=18;x+=9){sc.add(mesh(new THREE.CylinderGeometry(.08,.08,4),M(0x333333),x,2,7));
  const l=mesh(new THREE.SphereGeometry(.4),new THREE.MeshBasicMaterial({color:0xffe08a}),x,4.2,7);sc.add(l)}
 const p=new THREE.Group();
 p.add(mesh(new THREE.CylinderGeometry(.45,.5,1.2),M(0xef8b39),0,.8,0),mesh(new THREE.SphereGeometry(.38),M(0xf0c9a0),0,1.7,0),mesh(new THREE.BoxGeometry(.2,.2,.4),M(0x222222),0,1.7,-.4));
 p.position.set(0,0,8);sc.add(p);
 const bins=[];
 if(d.m!=="collect"){const ks=[...new Set(d.k)];if(d.k.includes("haz")&&!ks.includes("haz"))ks.push("haz");
  ks.forEach((k,j)=>{const x=(j-(ks.length-1)/2)*6,b=new THREE.Group();
   b.add(mesh(new THREE.BoxGeometry(2,2,2),M(T[k].c),0,1,0),mesh(new THREE.BoxGeometry(2.2,.25,2.2),M(0x222222),0,2.1,0));
   const s=label(T[k].n,T[k].h);s.position.y=3.6;b.add(s);b.position.set(x,0,-12);b.k=k;sc.add(b);bins.push(b)})}
 G={d,i,p,bins,gm,lm,clean,dirty,amb,items:[],carry:null,cleared:0,spawned:0,sp:0,mist:0,score:0,combo:0,el:0,t:d.t||0,over:true,vx:0,vz:0};
 const init=d.m==="rush"?4:d.c;for(let j=0;j<init;j++)spawn()
}
function spawn(){
 const k=pick(G.d.k),g=new THREE.Group();let m;
 if(k==="wet")m=mesh(new THREE.SphereGeometry(.4,10,8),M(T.wet.c),0,.5,0);
 else if(k==="dry")m=mesh(new THREE.BoxGeometry(.7,.7,.7),M(T.dry.c),0,.5,0);
 else m=mesh(new THREE.CylinderGeometry(.3,.3,.8,10),M(T.haz.c),0,.5,0);
 g.add(m,mesh(new THREE.CylinderGeometry(.05,.05,6),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.45}),0,3,0));
 let x,z;do{x=rnd(-18,18);z=rnd(-8,16)}while(Math.hypot(x,z-8)<3);
 g.position.set(x,0,z);g.k=k;g.ph=Math.random()*6;sc.add(g);G.items.push(g);G.spawned++;
}
function cleanliness(){const den=G.d.cap||G.d.c;return Math.max(0,Math.min(1,1-G.items.length/den))}
function env(){const c=cleanliness();
 sc.background.copy(G.dirty).lerp(G.clean,c);sc.fog.color.copy(sc.background);sc.fog.far=35+c*50;G.amb.intensity=.3+.5*c;
 G.gm.color.set(0x77704f).lerp(new THREE.Color(G.d.gr),c);G.lm.color.set(0x77704a).lerp(new THREE.Color(0x3fa34d),c);
 $("#hClean").style.width=c*100+"%"}

// ---------- input ----------
const keys={};let joy=null;
addEventListener("keydown",e=>keys[e.key.toLowerCase()]=1);addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
const cv=R.domElement;
cv.addEventListener("pointerdown",e=>joy={x:e.clientX,y:e.clientY,dx:0,dy:0});
cv.addEventListener("pointermove",e=>{if(joy){joy.dx=Math.max(-1,Math.min(1,(e.clientX-joy.x)/50));joy.dy=Math.max(-1,Math.min(1,(e.clientY-joy.y)/50))}});
addEventListener("pointerup",()=>joy=null);

// ---------- loop ----------
function tick(){requestAnimationFrame(tick);if(!sc)return;const dt=Math.min(clock.getDelta(),.05);
 if(G&&!G.over)update(dt);
 if(G){const p=G.p.position;cam.position.lerp(new THREE.Vector3(p.x*.6,9,p.z+11),.1);cam.lookAt(p.x,0,p.z-3)}
 R.render(sc,cam)}
function update(dt){
 const g=G,p=g.p;g.el+=dt;
 let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(joy){ix+=joy.dx;iz+=joy.dy}
 const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
 p.position.x=Math.max(-19,Math.min(19,p.position.x+ix*9*dt));p.position.z=Math.max(-14,Math.min(18,p.position.z+iz*9*dt));
 if(l>.1)p.rotation.y=Math.atan2(-ix,-iz);
 const pp=p.position;
 g.items.forEach(it=>{it.children[0].position.y=.5+Math.sin(g.el*3+it.ph)*.15;it.rotation.y+=dt;
  if(it===g.carry){it.position.set(pp.x,2.4,pp.z);return}
  if(Math.hypot(it.position.x-pp.x,it.position.z-pp.z)<1.5){
   if(g.d.m==="collect")clear(it,true);
   else if(!g.carry){g.carry=it;it.children[1].visible=false;it.scale.setScalar(.8);beep(520);$("#hCarry").textContent="Carrying: "+T[it.k].n+" → go to the "+T[it.k].n+" bin"}}});
 if(g.carry)g.bins.forEach(b=>{if(g.carry&&Math.hypot(b.position.x-pp.x,b.position.z-pp.z)<2.8){
  if(b.k===g.carry.k)clear(g.carry,true);
  else{g.mist++;g.combo=0;g.carry.position.set(pp.x+rnd(-2,2),0,pp.z+3);g.carry.scale.setScalar(1);g.carry.children[1].visible=true;g.carry=null;$("#hCarry").textContent="";toast("✗ Wrong bin! That item was not for "+T[b.k].n+".");beep(160,.2)}}});
 if(g.d.m==="rush"){g.sp+=dt;if(g.spawned<g.d.c&&g.sp>=g.d.e){g.sp=0;spawn()}
  if(g.items.length>=g.d.cap)return end(false,"Litter piled up past the limit. A street is only as clean as the habits keeping it so.")}
 if(g.d.t){g.t-=dt;if(g.t<=0)return end(false,"Time ran out. Cleanliness needs speed and consistency.")}
 if(g.cleared>=g.d.c)return end(true);
 env();hud()}
function clear(it,ok){const g=G;sc.remove(it);g.items.splice(g.items.indexOf(it),1);if(g.carry===it)g.carry=null;
 g.cleared++;g.combo++;g.score+=10+Math.min(g.combo,6)*2;$("#hCarry").textContent="";beep(660+g.combo*30);
 if(g.combo>=3)toast("🔥 Combo x"+g.combo)}
function hud(){const g=G;$("#hLeft").textContent="🧹 "+g.cleared+"/"+g.d.c;$("#hScore").textContent="⭐ "+g.score;
 $("#hTime").textContent=g.d.t?"⏱ "+Math.ceil(g.t)+"s":""}

// ---------- screens ----------
function ov(h){const o=$("#ov");o.innerHTML='<div class="card">'+h+'</div>';o.classList.add("on")}
function closeOv(){$("#ov").classList.remove("on")}
const un=i=>i===0||(S.stars[i-1]||0)>0;
function menu(first){
 G&&(G.over=true);$("#hud").classList.add("hide");
 const tot=L.length*3,got=Object.values(S.stars).reduce((a,b)=>a+b,0),pct=Math.round(got/tot*100);
 ov((first?'<div class="k">Zygote Builder presents</div><h1>CIVI<span>CA</span></h1><p><b>The city is ours.</b> Every street starts dirty and grey. Your actions bring it back to life. Clean it, sort it, protect it.</p>':'<h2>City Map</h2>')+
 '<p><b>City restored: '+pct+'%</b> · 🏆 '+S.total+' points · progress saves in this browser</p><div class="grid">'+
 L.map((d,i)=>'<button class="lv '+(un(i)?'':'lock')+'" onclick="'+(un(i)?'intro('+i+')':'toast(\'🔒 Complete the previous level\')')+'"><b>'+(i+1)+'. '+d.n+'</b><small>'+({collect:"Clean-up",sort:"Sorting",rush:"Rush"})[d.m]+'</small><div class="st">'+(un(i)?"★".repeat(S.stars[i]||0)+"☆".repeat(3-(S.stars[i]||0)):"🔒")+'</div></button>').join("")+
 '</div><button class="btn" onclick="if(confirm(\'Reset all progress?\')){S={stars:{},best:{},total:0};save();menu()}">Reset progress</button>')}
function intro(i){build(i);const d=L[i],ks=[...new Set(d.k)];
 ov('<div class="k">Level '+(i+1)+' · '+({collect:"Clean-up",sort:"Sorting",rush:"Rush"})[d.m]+'</div><h2>'+d.n+'</h2><p>'+d.i+'</p>'+
 '<div class="lg">'+ks.map(k=>'<span style="background:'+T[k].h+'">'+T[k].n+'</span>').join("")+'</div>'+
 '<p>Move with <b>WASD / arrows</b>, or drag on the screen. '+(d.m==="collect"?'Walk over items to collect them.':'Walk over an item to pick it up, then reach the matching bin.')+(d.t?' Time limit: <b>'+d.t+'s</b>.':'')+' Watch the sky and trees: they recover as you clean.</p>'+
 '<button class="btn p" onclick="go()">Start</button><button class="btn" onclick="menu()">Map</button>')}
function go(){closeOv();$("#hud").classList.remove("hide");$("#hName").textContent=G.d.n;G.over=false;clock.getDelta();env()}
function end(win,why){const g=G;g.over=true;$("#hud").classList.add("hide");$("#hCarry").textContent="";
 if(!win)return ov('<h2>Not this time</h2><p>'+why+'</p><button class="btn p" onclick="intro('+g.i+')">Try again</button><button class="btn" onclick="menu()">Map</button>');
 const st=g.mist===0&&g.el<=g.d.par?3:g.mist<=2?2:1,bonus=st*20;g.score+=bonus;
 S.stars[g.i]=Math.max(S.stars[g.i]||0,st);S.total+=Math.max(0,g.score-(S.best[g.i]||0));S.best[g.i]=Math.max(S.best[g.i]||0,g.score);save();
 G.items=[];sc.background.copy(g.clean);sc.fog.color.copy(g.clean);g.gm.color.set(g.d.gr);g.lm.color.set(0x3fa34d);
 beep(880,.3);
 ov('<div class="k">Level complete</div><h2>'+g.d.n+' is restored ✨</h2><p class="big">'+"★".repeat(st)+"☆".repeat(3-st)+'</p><p>⭐ '+g.score+' points · ⏱ '+Math.round(g.el)+'s · ✗ '+g.mist+' mistakes</p>'+
 '<div class="fact"><b>Why it matters</b><br>'+g.d.f+'</div>'+
 (g.i<L.length-1?'<button class="btn p" onclick="intro('+(g.i+1)+')">Next level →</button>':'<p><b>🏙️ You restored Civica.</b> Now take the habit outside the game.</p>')+
 '<button class="btn" onclick="intro('+g.i+')">Replay</button><button class="btn" onclick="menu()">Map</button>')}
$("#hMap").onclick=()=>menu();
sc=new THREE.Scene();sc.background=new THREE.Color(0x10201a);
menu(true);tick();
