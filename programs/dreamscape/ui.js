/* Dreamscape v8: Command Center — gathers every command button into one grouped menu so nothing is hidden off-screen */
(()=>{"use strict";
const $=id=>document.getElementById(id),nav=document.querySelector(".navbtns"),cmd=$("cmd");if(!nav||!cmd)return;
const SEC={empire:["Tech","Deeds","Chronicle","Mahamatya"],space:["Space Agency","Tamasi & Spies","Observatory","Summits","Tamasi Realm"],war:["Dyson","War Council"],sys:["Data","Guide","🔊","🔇"]};
const close=()=>{cmd.classList.remove("show");cmd.setAttribute("aria-hidden","true")},open=()=>{cmd.classList.add("show");cmd.setAttribute("aria-hidden","false")};
const all=[...nav.querySelectorAll("button")].filter(b=>b.id!=="menuBtn"),src={};
all.forEach(b=>{for(const k in SEC)if(SEC[k].some(t=>b.textContent.includes(t))){document.querySelector(`#cmd [data-sec="${k}"] .tiles`).appendChild(b);b.classList.add("tile");if(!/🔊|🔇/.test(b.textContent))b.addEventListener("click",close);src[b.textContent]=b;break}});
$("menuBtn").onclick=open;$("cmdClose").onclick=close;cmd.addEventListener("click",e=>{if(e.target===cmd)close()});addEventListener("keydown",e=>{if(e.key==="Escape")close()});
/* quick shortcuts stay on the toolbar */
["Space Agency","Tamasi & Spies","Tamasi Realm","Dyson"].forEach(t=>{const o=all.find(b=>b.textContent.includes(t));if(!o)return;const q=document.createElement("button");q.textContent=o.textContent;q.onclick=()=>o.click();nav.appendChild(q)});
/* anything unplaced remains visible in the toolbar */
})();
