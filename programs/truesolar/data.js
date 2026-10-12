// Real physical data. r and a in km, P in days. rot = rotation period in days (negative = retrograde).
export const AU=149597870.7;
const M=(id,name,par,r,a,P,e,i,rot,tilt,kind,cols,x={})=>({id,name,par,r,a,P,e,i,rot,tilt,kind,cols,...x});
const mo=(id,name,par,r,a,P,cols,x={})=>M(id,name,par,r,a,P,0,0,P,0,1,cols,{cr:1,f:2,moon:1,...x});
export const BODIES=[
M('sun','Sun',null,696340,0,0,0,0,25.4,7.25,0,['#ff8a1e','#ffd36b','#e8480a']),
M('mercury','Mercury','sun',2439.7,57.91e6,87.97,.2056,7,58.65,0,1,['#6e6a66','#a39c94','#4a4745'],{cr:1,f:2}),
M('venus','Venus','sun',6051.8,108.21e6,224.7,.0068,3.4,-243,177.4,3,['#e8cf9a','#c9a45f','#f3e4be'],{bands:3,turb:1.3,atmo:['#ffd9a0',.9]}),
M('earth','Earth','sun',6371,149.6e6,365.256,.0167,0,.9973,23.44,2,['#0b3d91','#2f7a3b','#c7b27a'],{atmo:['#6fb4ff',1]}),
M('mars','Mars','sun',3389.5,227.94e6,686.98,.0934,1.85,1.026,25.2,1,['#9c4a2a','#c8774a','#5e2d1a'],{cr:.6,f:2.5,atmo:['#e8a27a',.35]}),
M('jupiter','Jupiter','sun',69911,778.57e6,4332.6,.0489,1.3,.4135,3.1,3,['#c9a27a','#8a5a3a','#efe0c8'],{bands:9,turb:.5,flat:.935,spot:1,atmo:['#d8b890',.35]}),
M('saturn','Saturn','sun',58232,1433.5e6,10759,.0565,2.49,.444,26.7,3,['#d8c08a','#b08f5c','#f0e2b6'],{bands:7,turb:.25,flat:.902,atmo:['#e8d49c',.3],ring:[74500,140220,1,'#e6d5b0','#9d8a68']}),
M('uranus','Uranus','sun',25362,2872.5e6,30687,.0457,.77,-.718,97.8,3,['#9bd9dc','#86c8d0','#b6e8ea'],{bands:3,turb:.08,atmo:['#a5e8ee',.6],ring:[41837,51149,.3,'#9aa6ad','#6b747a']}),
M('neptune','Neptune','sun',24622,4495.1e6,60190,.0113,1.77,.671,28.3,3,['#3c5fd0','#2a45a8','#6d8cf0'],{bands:4,turb:.25,atmo:['#5f86ff',.6]}),
M('pluto','Pluto','sun',1188.3,5906.4e6,90560,.2488,17.2,-6.387,122.5,1,['#a58a76','#d8c4ae','#6a4f40'],{cr:.5,f:2.2}),
mo('moon','Moon','earth',1737.4,384400,27.32,['#77746f','#b4b0a8','#4b4946'],{e:.055,i:5.1}),
mo('phobos','Phobos','mars',11.3,9376,.319,['#5d5249','#84766a','#3a322c']),
mo('deimos','Deimos','mars',6.2,23463,1.263,['#6b5f55','#93857a','#473f38']),
mo('io','Io','jupiter',1821.6,421700,1.769,['#d9c34a','#f0e08a','#8a4a1a'],{cr:.2}),
mo('europa','Europa','jupiter',1560.8,671034,3.551,['#c9bba8','#efe8dc','#8a5a3a'],{cr:.2}),
mo('ganymede','Ganymede','jupiter',2634.1,1070412,7.155,['#6f655a','#a89c8c','#3e372f']),
mo('callisto','Callisto','jupiter',2410.3,1882709,16.69,['#4a4036','#7d6f60','#2c261f'],{cr:1.5}),
mo('enceladus','Enceladus','saturn',252.1,238020,1.37,['#e8eef2','#ffffff','#b8c6d0'],{cr:.4}),
mo('rhea','Rhea','saturn',763.8,527108,4.518,['#9a9690','#cfcbc4','#6a665f']),
mo('titan','Titan','saturn',2574.7,1221870,15.945,['#b8803a','#d9a45a','#8a5a22'],{cr:0,atmo:['#ffb050',1.1]}),
mo('iapetus','Iapetus','saturn',734.5,3560820,79.33,['#2a2420','#d8d4cc','#6a625a']),
mo('ariel','Ariel','uranus',578.9,191020,2.52,['#8f8b86','#c5c1ba','#5d5a55']),
mo('umbriel','Umbriel','uranus',584.7,266000,4.144,['#4d4b49','#76736f','#2f2e2c']),
mo('titania','Titania','uranus',788.4,436300,8.706,['#85807a','#b3aea6','#55514c']),
mo('oberon','Oberon','uranus',761.4,583500,13.46,['#6d6259','#9a8d82','#443d37']),
mo('triton','Triton','neptune',1353.4,354759,-5.877,['#c9c3c0','#e8dfe0','#8a7a7a'],{cr:.3}),
mo('charon','Charon','pluto',606,19591,6.387,['#7a736d','#a79f98','#4a4540'],{cr:.8})
];
