/* Adaptive chronicle: the world remembers how the sovereign governs. */
(()=>{"use strict";
if(!window.DS)return;const D=DS,S=()=>D.S;
const RULES=[
 {id:"ecology-crisis",test:p=>p.pollution>=55,planet:true,title:"The Grey Horizon",body:p=>`The people of ${D.PLANETS[S().selectedPlanet].n} report worsening air and water. The court's next environmental decision will shape public trust.`},
 {id:"green-renaissance",test:p=>p.biosphere>=70&&p.pollution<25,planet:true,title:"The Green Renaissance",body:p=>`Forests and wetlands are returning on ${D.PLANETS[S().selectedPlanet].n}. Scholars call it the beginning of a living age.`},
 {id:"first-metropolis",test:p=>(p.cities||[]).length>=3,planet:true,title:"The Regional Compact",body:p=>`Three or more regional cities now form a network. Governors request common transport, public health and water standards.`},
 {id:"space-age",test:p=>(p.spaceportLevel||0)>=2,planet:true,title:"The Interplanetary Timetable",body:p=>`Passenger traffic is increasing. The Space Agency proposes coordinated timetables and shared rescue standards.`},
 {id:"moon-science",test:p=>(p.moonExpeditions||[]).length>=2,planet:true,title:"Beyond the Homeworld",body:p=>`The lunar expedition reports new geological evidence. The scientific community asks for a permanent planetary exploration programme.`},
 {id:"continental-survey",test:p=>(p.continentData||[]).filter(q=>q.surveyed).length>=2,planet:true,title:"The Age of Cartography",body:p=>`Two or more continents on ${D.PLANETS[S().selectedPlanet].n} have been surveyed. Regional governors begin planning infrastructure around local resources.`},
 {id:"secure-sun",test:p=>(p.solarField||0)>=2,planet:true,title:"The Sunward Reserve",body:p=>`The secure solar district has expanded. The treasury must balance energy independence with transparent oversight.`},
 {id:"defence-readiness",test:p=>(p.defenceLevel||0)>=2,planet:true,title:"A Watchful Sky",body:p=>`Early-warning and emergency coordination have improved. The Space Agency and civil authorities begin joint readiness exercises.`},
 {id:"dharma-low",test:(p,s)=>s.dharmaIndex<=-40,global:true,title:"The Question of Legitimacy",body:()=>`Public confidence is strained. Ministers warn that prosperity without fairness may not endure.`},
 {id:"dharma-high",test:(p,s)=>s.dharmaIndex>=45,global:true,title:"The People's Mandate",body:()=>`Public trust is unusually strong. The Sabha receives petitions asking that the reign's institutions outlast the sovereign.`},
 {id:"tamasi-threat",test:(p,s)=>s.story&&s.story.threat>=45,global:true,title:"Signals from Proxima Tamas",body:()=>`The Space Agency detects increased activity beyond the frontier. Diplomats urge restraint; the Senapati asks for readiness.`}
];
function check(){const s=S();if(!s||!s.onboarded)return;if(!s.loreFlags)s.loreFlags={};const i=s.location??s.selectedPlanet,p=s.planets[i];let changed=false;
 RULES.forEach(r=>{if(s.loreFlags[r.id])return;const ok=r.global?r.test(p,s):r.test(p,s);if(!ok)return;s.loreFlags[r.id]=Date.now();const body=r.body(p,s);D.chron&&D.chron("📖 "+r.title+" — "+body);D.toast("📖 Chronicle: "+r.title);changed=true});
 if(p.solarField>0&&s.story&&s.story.dyson&&(s.story.dyson.h>0||s.story.dyson.done)){p.energy=Math.min(220+(p.buildings.solar||0)*45,p.energy+(p.solarField*.35));}
 const surveyed=(p.continentData||[]).filter(q=>q.surveyed);if(surveyed.length){p.biomass=Math.min(220+(p.buildings.bioreactor||0)*45,p.biomass+surveyed.reduce((a,q)=>a+q.fertility*.08,0));}
 if(changed)D.save();
}
function context(){const s=S(),p=s.planets[s.selectedPlanet];if(p.pollution>55)return"The people ask for clean air before new monuments.";if((p.cities||[]).length>=3)return"The empire is becoming a network of regional cities.";if(p.spaceportLevel>=2)return"The age of regular interplanetary travel has begun.";if(s.dharmaIndex<-30)return"The court must rebuild trust through just governance.";if(s.dharmaIndex>35)return"The people regard this reign as a period of stability.";return"The future of the Panchabhūta worlds remains unwritten."}
window.DS_loreContext=context;setInterval(check,18000);setTimeout(check,5000);
})();
