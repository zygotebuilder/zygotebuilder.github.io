/* Dreamscape v7: interactive new-player guide (shown once before the game starts; reopen from ❓ Guide) */
(()=>{"use strict";
if(!window.DS)return;
const D=DS,$=id=>document.getElementById(id);
const SL=[
 ["✦ Welcome, Architect","Long ago a great asteroid split in two. One shard struck the Sun's third world — Earth — and from it your people arose. The other fell on a distant star's world, where the Tamasi — also human — grew apart. Now you rule from Earth, and your space agency has found eight nearby worlds."],
 ["🪐 The Star Map","Eight worlds orbit your sun. Five carry the Panchabhūta: Earth, Water, Air, Fire and Ether; three more are Soma, Prāṇa and Vajra. Each has an element bonus. Tap a world to see its stats. Gold rings around your sun show Dyson-sphere progress."],
 ["⚒ Build & Terraform","Open Build & Govern. Solar Arrays make ⚡Energy, Bioreactors make 🧬Biomass; a Terraform Station then raises Atmosphere → Oceans → Biosphere in that order. Habitat Domes raise population once the air is breathable. Reach 60% sustainability to claim the next world."],
 ["☸ Council & Dharma","Tap Convene Council to enter the palace. Your Mahamatya Chanakya-style minister puts dilemmas before you. Every decision changes resources, dharma — and leaves a real building in your worlds. If your Dharma Index falls to −100, the Mahamatya dethrones you and the empire collapses."],
 ["👑 Walk the World","Press Walk the World to stroll your 3D worlds as your Maharaja or Maharani. W/A/S/D or arrows move, E talks to people, and your cities grow from villages into modern Indian metropolises — with temples, domes, towers and a maglev. Day turns to night."],
 ["🚀 Rocket Travel","Worlds are far apart. Tap another world on the star map to launch the Pushpak-1 rocket with your dignitaries. The journey costs ⚡ Energy from the world you leave."],
 ["🛰 Space Agency & Spies","The Space Agency launches satellites on its own, gathering Data and intelligence on the Tamasi. Spies, the Observatory and scheduled summits show you what they are doing, which worlds they hold, and how to win the Treaty of Peace."],
 ["⚔ War, Peace & the Dyson Sphere","Meet the six treaty conditions to sign the Treaty of Peace and race the Tamasi to build the Dyson sphere — or declare the Dvandva Yuddha, a catastrophic war of equals. Whoever completes or wins the sphere holds dominion: merge, vassalise, or share. A Dyson Era of mega-projects follows."],
 ["🌌 The Tamasi Realm","After a treaty or conquest, open the Tamasi Realm. Peace gives partial access: your dignitaries may visit the Tamasi capital and request access to more worlds. Conquest gives full access to all six worlds and their star — resources, development and audiences with the Samrat. Beware of unrest in vassal worlds."],
 ["💾 Saving & Sound","Your reign saves automatically in this browser. Use ⚙ Data to back up or restore (with a confirmation), and 🔊 to mute the music. You can reopen this guide any time with ❓ Guide."]];
function guide(done){let i=0;const draw=()=>{const s=SL[i],last=i===SL.length-1;D.show(s[0],`Guide ${i+1} / ${SL.length}`,`<p style="line-height:1.7;font-size:14px">${s[1]}</p><div style="display:flex;gap:8px;margin-top:14px">${i?'<button class="go" id="gb" style="background:#2a3a5a;margin:0">◀ Back</button>':""}<button class="go" id="gn" style="margin:0">${last?"Enter the universe ✦":"Next ▶"}</button></div><button id="gs" style="margin-top:10px;background:none;border:0;color:var(--muted);text-decoration:underline">Skip guide</button>`,true);
  $("gn").onclick=()=>{if(last){D.closeModal();done&&done()}else{i++;draw()}};if($("gb"))$("gb").onclick=()=>{i--;draw()};$("gs").onclick=()=>{D.closeModal();done&&done()}};draw()}
window.DS_guide=guide;
const b=document.createElement("button");b.textContent="❓ Guide";b.onclick=()=>guide(()=>{});document.querySelector(".navbtns").appendChild(b);
})();
