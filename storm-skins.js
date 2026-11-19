'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSkins=api;})(globalThis,()=>{
 const CHEST_COST=100,DIRECT_COST=200;
 const TROOPS=Object.freeze([
  {type:0,name:'Rekrut',skins:['Weihnachtssoldat','Wüstenranger','Galaktischer Ritter','Sternenrekrut']},
  {type:1,name:'Wächter',skins:['Santa-Wächter','Zenit-Wache','Aegis-Paladin','Sternenwächter']},
  {type:2,name:'Sniper',skins:['Eisjäger','Schattenagent','Geisterschütze','Sternenschütze']},
  {type:3,name:'Panzerjäger',skins:['Geschenkwerfer','Verwüster','Imperialer Brecher','Orbitaljäger']},
  {type:4,name:'Fusionist',skins:['Winter-Fusionist','Neon-Fusionist','Void-Synth','Plasma-Pionier']},
  {type:5,name:'Assassine',skins:['Eis-Assassine','Schattenklinge','Ronin','Nachtläufer']},
  {type:6,name:'Haudrauf',skins:['Weihnachts-Haudrauf','Donnerkrieger','Berserker','Stahlkoloss']},
  {type:7,name:'Heiler',skins:['Weihnachtsheiler','Lichtpriester','Sternenheiler','Feldsanitäter']},
  {type:9,name:'Arkanist',skins:['Weihnachtsarkanist','Sternenweiser','Dimensionswächter','Sternenmagier']},
  {type:8,name:'Späher',skins:['Winterspäher','Pilot','Agent','Orbitalspäher']}
 ].map(t=>Object.freeze({...t,skins:Object.freeze(t.skins)})));
 const RARITIES=Object.freeze({rare:Object.freeze({label:'SELTEN',color:'#79d9ef'}),epic:Object.freeze({label:'EPISCH',color:'#c298ed'}),legendary:Object.freeze({label:'LEGENDÄR',color:'#efd080'})});
 const CATALOG=Object.freeze(TROOPS.flatMap(t=>t.skins.map((name,i)=>{const variant=(i+1)%4,rarity=variant===0?'rare':variant===3?'legendary':'epic';return Object.freeze({id:t.type*10+i+1,type:t.type,variant,name,rarity,seasonal:variant===1,available:variant!==1,color:RARITIES[rarity].color});})));
 const AVAILABLE=Object.freeze(CATALOG.filter(s=>s.available));
 function collection(owned=[]){return TROOPS.flatMap(t=>CATALOG.filter(s=>s.type===t.type&&(s.available||owned.includes(s.id))).sort((a,b)=>a.variant-b.variant));}
 const get=id=>CATALOG.find(s=>s.id===id)||null;
 function normalize(owned=[],equipped={}){const ids=Array.isArray(owned)?[...new Set(owned.filter(id=>get(id)))]:[],selection={};if(equipped&&typeof equipped==='object')for(const {type} of TROOPS){const id=equipped[type];if(ids.includes(id)&&get(id)?.type===type)selection[type]=id;}return {owned:ids,equipped:selection};}
 function choose(owned,random=Math.random,catalog=CATALOG){const pool=catalog.filter(s=>!owned.includes(s.id));if(!pool.length)return null;const n=Number(random());if(!Number.isFinite(n)||n<0||n>=1)throw Error('Ungültige Ziehung.');return pool[Math.floor(n*pool.length)];}
 function rotationInfo(now=Date.now()){
  const date=new Date(now);if(!Number.isFinite(date.getTime()))throw Error('Ungültige Zeit.');
  const key=[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-'),next=new Date(date);next.setHours(24,0,0,0);
  let seed=(Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)+115)>>>0;
  const pool=[...AVAILABLE];for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=Math.floor((seed/4294967296)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return {key,next:next.getTime(),skins:pool.slice(0,3)};
 }
 function isDailyOffer(id,now=Date.now()){return rotationInfo(now).skins.some(s=>s.id===id);}
 const DAILY_CHEST=false;
 function chestPool(now=Date.now()){return DAILY_CHEST?rotationInfo(now).skins:AVAILABLE;}
 function statePose(state){return ({idle:'idle',run:'run',jump:'jump',attack:'attack',aim:'attack',special:'special',ability:'special',ultimate:'special',hit:'hit',block:'hit',death:'death',cloak:'special',reload:'idle',rise:'jump'})[state]||'idle';}
 return {TROOPS,CATALOG,AVAILABLE,RARITIES,collection,CHEST_COST,DIRECT_COST,DAILY_CHEST,rotationInfo,isDailyOffer,chestPool,get,normalize,choose,statePose};
});
