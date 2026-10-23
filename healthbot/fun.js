/* TPS Wellness Bot — result extras: camera snapshot, wellness spirit, badges, challenge, downloadable card, confetti. Reads the rendered report; changes no logic. */
(()=>{
const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let photo=null,done=false;
function grab(){try{const v=$('#video');if(!v||!v.videoWidth)return;const s=Math.min(v.videoWidth,v.videoHeight),c=document.createElement('canvas');c.width=c.height=360;const x=c.getContext('2d');
  x.translate(360,0);x.scale(-1,1);x.drawImage(v,(v.videoWidth-s)/2,(v.videoHeight-s)/2,s,s,0,0,360,360);photo=c.toDataURL('image/jpeg',.85)}catch(e){photo=null}}
if(window.scan){const o=window.scan;window.scan=function(){grab();return o.apply(this,arguments)}}
if(window.skip){const o=window.skip;window.skip=function(){photo=null;return o.apply(this,arguments)}}
const SP={Energy:["🦊","Sunrise Fox","Quick, bright and full of spark."],Sleep:["🦉","Moon Owl","Wise about rest and calm evenings."],Movement:["🐆","Trail Cheetah","Born to move and explore."],Exercise:["🐆","Trail Cheetah","Born to move and explore."],
 Mind:["🐼","Zen Panda","Calm, steady and clear-headed."],Hydration:["🦦","River Otter","Flowing, fresh and well hydrated."],"Screen Balance":["🦢","Mindful Swan","Graceful with screens and time."],Food:["🐿️","Orchard Squirrel","A collector of good, fresh fuel."],Diet:["🐿️","Orchard Squirrel","A collector of good, fresh fuel."],"Me-time":["🦋","Dreamy Butterfly","Makes time for joy and hobbies."]};
const CH={Energy:"Do 10 star jumps and a big stretch right now.",Sleep:"Switch off screens 30 minutes before bed tonight.",Movement:"Take a 10-minute walk after your next meal.",Exercise:"Take a 10-minute walk after your next meal.",Mind:"Try 1 minute of slow breathing: in for 4, hold 4, out for 4.",
 Hydration:"Drink a glass of water now, and one with each meal.","Screen Balance":"Enjoy one full screen-free hour today.",Food:"Add one colourful fruit or veggie to your next meal.",Diet:"Add one colourful fruit or veggie to your next meal.","Me-time":"Spend 15 minutes on something you love."};
const EXC={positive:"Sparkling, positive energy ✨",calm:"Calm and centered 🌊",tired:"A little sleepy — rest is a superpower 😴",tense:"Some tension — breathe out slowly 🌬️"};
const stage=s=>s<45?["🌱","Seed"]:s<65?["🌿","Sprout"]:s<82?["🌳","Sapling"]:["🌸","Blossom Tree"];
function rows(){return[...document.querySelectorAll('#metrics .metric')].map(m=>({l:m.querySelector('b').textContent.trim(),i:m.firstElementChild.textContent.trim().split(' ')[0],n:(m.querySelector('.stars').textContent.match(/★/g)||[]).length}))}
function nameOf(){const h=$('#heading');return h?h.textContent.replace(/,? here is your Wellness Snapshot$/,'').trim()||'Friend':'Friend'}
function confetti(){if(reduced)return;const c=document.createElement('canvas');c.style.cssText='position:fixed;inset:0;z-index:2000;pointer-events:none';c.width=innerWidth;c.height=innerHeight;document.body.appendChild(c);
  const x=c.getContext('2d'),cl=['#34d399','#f59e0b','#f472b6','#60a5fa','#fde047'],p=Array.from({length:130},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,r:Math.random()*6,s:4+Math.random()*6,k:cl[Math.random()*5|0]}));let f=0;
  (function L(){x.clearRect(0,0,c.width,c.height);p.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.r+=.12;x.save();x.translate(q.x,q.y);x.rotate(q.r);x.fillStyle=q.k;x.fillRect(-q.s/2,-q.s/2,q.s,q.s*.6);x.restore()});++f<230?requestAnimationFrame(L):c.remove()})()}
function wrap(x,t,px,py,mw,lh){let l='';for(const w of t.split(' ')){const n=l+w+' ';if(x.measureText(n).width>mw&&l){x.fillText(l.trim(),px,py);l=w+' ';py+=lh}else l=n}x.fillText(l.trim(),px,py);return py}
function card(R,score,sp,st){const c=document.createElement('canvas');c.width=900;c.height=1240;const x=c.getContext('2d'),F="'Fraunces',Georgia,serif",B="'Manrope',system-ui,sans-serif";
  const g=x.createLinearGradient(0,0,900,1240);g.addColorStop(0,'#0f3d3a');g.addColorStop(1,'#2d8f73');x.fillStyle=g;x.fillRect(0,0,900,1240);
  x.fillStyle='#fffdf8';x.beginPath();x.roundRect(50,50,800,1140,40);x.fill();x.textAlign='center';x.fillStyle='#2d8f73';x.font=`800 22px ${B}`;x.fillText('T P S   W E L L N E S S   B O T',450,115);
  const done=()=>{x.fillStyle='#17324d';x.font=`700 54px ${F}`;x.fillText(nameOf().slice(0,24),450,470);x.font=`600 28px ${F}`;x.fillStyle='#2d8f73';x.fillText(`${sp[0]} ${sp[1]}  ·  ${st[0]} ${st[1]}`,450,520);
    x.fillStyle='#17324d';x.font=`700 84px ${F}`;x.fillText(score+' / 100',450,620);let y=690;x.textAlign='left';x.font=`600 26px ${B}`;
    R.forEach(r=>{x.fillStyle='#17324d';x.fillText(`${r.i}  ${r.l}`,130,y);x.fillStyle='#f59e0b';x.textAlign='right';x.fillText('★'.repeat(r.n)+'☆'.repeat(5-r.n),770,y);x.textAlign='left';y+=48});
    const q=$('.quote-card blockquote');x.textAlign='center';if(q){x.fillStyle='#4b6275';x.font=`italic 26px ${F}`;wrap(x,'“'+q.textContent+'” — '+$('.quote-card cite').textContent,450,1040,640,36)}
    x.fillStyle='#8a6a00';x.font=`700 20px ${B}`;x.fillText('Not a medical prescription or medical advice.',450,1135);x.fillStyle='#8aa0ad';x.font=`500 18px ${B}`;x.fillText(new Date().toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'}),450,1165);
    c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`wellness-card-${nameOf().replace(/\W+/g,'-')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)})};
  if(photo){const im=new Image();im.onload=()=>{x.save();x.beginPath();x.arc(450,290,130,0,6.3);x.clip();x.drawImage(im,320,160,260,260);x.restore();x.strokeStyle='#2d8f73';x.lineWidth=8;x.beginPath();x.arc(450,290,134,0,6.3);x.stroke();done()};im.src=photo}
  else{x.font='170px serif';x.fillText(sp[0],450,350);done()}}
function enrich(){const R=rows(),m=$('#metrics');if(!R.length||!m||$('#funZone'))return;
  const score=Math.round(R.reduce((a,r)=>a+r.n,0)/(R.length*5)*100),top=R.reduce((a,r)=>r.n>a.n?r:a,R[0]),low=R.reduce((a,r)=>r.n<a.n?r:a,R[0]),sp=SP[top.l]||["🌟","Wellness Star","Shining in your own way."],st=stage(score);
  const bd=R.filter(r=>r.n>=5).slice(0,4).map((r,i)=>`<span style="animation-delay:${.6+i*.15}s">🏅 ${r.l} Star</span>`).join('')||'<span>🌱 Every journey starts with one step</span>';
  const ex=typeof expr!=='undefined'&&photo?EXC[expr]:null,z=document.createElement('div');z.className='fun';z.id='funZone';
  z.innerHTML=`${photo?`<figure class="polaroid"><img src="${photo}" alt="Your snapshot"><figcaption>${ex||'Looking great!'}<small>Fun mood-read · not a diagnosis</small></figcaption></figure>`:''}
  <div class="hero"><div class="ring"><svg width="140" height="140" viewBox="0 0 120 120"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#fbbf24"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52"/></svg><b><span><span id="scoreNum">0</span><small>WELLNESS SCORE</small></span></b></div>
  <div class="spirit"><span class="em">${sp[0]}</span><h4>You are a ${sp[1]}</h4><p>${sp[2]}</p><span class="stage">${st[0]} Growth stage: ${st[1]}</span></div></div>
  <div class="badges">${bd}</div>
  <div class="challenge"><b>🎯 Fun challenge for today</b><p>${low.n>=5?'Share one healthy habit with a friend today!':CH[low.l]||'Do one kind thing for your body today.'}</p></div>
  <button class="btn" id="dlCard">⬇️ Download My Wellness Card</button>
  <p class="priv">${photo?'🔒 Your photo stays on this device and is never uploaded.':'🔒 Nothing is uploaded — your card is made on this device.'}</p>`;
  m.before(z);requestAnimationFrame(()=>setTimeout(()=>{$('#funZone .fg').style.strokeDashoffset=327*(1-score/100)},60));
  const n=$('#scoreNum');let s=0;const iv=setInterval(()=>{s+=Math.max(1,Math.round(score/40));if(s>=score){s=score;clearInterval(iv)}n.textContent=s},35);
  $('#dlCard').onclick=()=>card(R,score,sp,st);if(score>=80)setTimeout(confetti,500)}
if($('#result')){new MutationObserver(()=>{if($('#result.active')&&!done){done=true;enrich()}}).observe($('#result'),{attributes:true,attributeFilter:['class']})}else enrich();
})();
