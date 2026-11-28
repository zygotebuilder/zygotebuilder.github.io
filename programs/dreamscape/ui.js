/* Command Center — gathers every command button into one grouped menu so nothing is hidden off-screen */
(()=>{"use strict";
const $=id=>document.getElementById(id),nav=document.querySelector(".navbtns"),cmd=$("cmd");if(!nav||!cmd)return;
const SEC={empire:["Tech","Deeds","Chronicle","Mahamatya","Finance","Gazette"],space:["Space Agency","Tamasi & Spies","Observatory","Summits","Tamasi Realm","Science","Orbit View","Planet Map","Moon Expeditions"],war:["Dyson","War Council","Resistance"],sys:["Data","Guide","Manual","🔊","🔇"]};
const close=()=>{cmd.classList.remove("show");cmd.setAttribute("aria-hidden","true")},open=()=>{cmd.classList.add("show");cmd.setAttribute("aria-hidden","false")};
const all=[...nav.querySelectorAll("button")].filter(b=>b.id!=="menuBtn"),src={};
all.forEach(b=>{for(const k in SEC)if(SEC[k].some(t=>b.textContent.includes(t))){document.querySelector(`#cmd [data-sec="${k}"] .tiles`).appendChild(b);b.classList.add("tile");if(!/🔊|🔇/.test(b.textContent))b.addEventListener("click",close);src[b.textContent]=b;break}});
$("menuBtn").onclick=open;$("vTop").onclick=()=>{window.DS_topview=!window.DS_topview;$("vTop").classList.toggle("active",!!window.DS_topview);if(DS.S.view!=="world")DS.toast("Top View works while walking a world.")};$("vOrbit").onclick=()=>window.DS_orbit&&DS_orbit();addEventListener("keydown",e=>{if((e.key==="v"||e.key==="V")&&DS.S.view==="world")$("vTop").click()});$("cmdClose").onclick=close;cmd.addEventListener("click",e=>{if(e.target===cmd)close()});addEventListener("keydown",e=>{if(e.key==="Escape")close()});
/* quick shortcuts stay on the toolbar */
["Space Agency","Tamasi & Spies","Tamasi Realm","Dyson"].forEach(t=>{const o=all.find(b=>b.textContent.includes(t));if(!o)return;const q=document.createElement("button");q.textContent=o.textContent;q.onclick=()=>o.click();nav.appendChild(q)});
/* anything unplaced remains visible in the toolbar */
})();
