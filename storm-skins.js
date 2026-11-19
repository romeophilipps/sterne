'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSkins=api;})(globalThis,()=>{
 const CHEST_COST=100,DIRECT_COST=200;
 const CATALOG=Object.freeze([
  {id:1,type:0,variant:1,name:'Weihnachtssoldat',color:'#ed8b9f'},
  {id:2,type:0,variant:2,name:'Wüstenranger',color:'#e8cb8d'},
  {id:3,type:0,variant:3,name:'Galaktischer Ritter',color:'#b7a4e5'},
  {id:81,type:8,variant:1,name:'Winterspäher',color:'#b7e7f2'},
  {id:82,type:8,variant:2,name:'Pilot',color:'#e8cb8d'},
  {id:83,type:8,variant:3,name:'Agent',color:'#9ddd81'},
  {id:91,type:9,variant:1,name:'Weihnachtsarkanist',color:'#ed8b9f'},
  {id:92,type:9,variant:2,name:'Sternenweiser',color:'#e8cb8d'},
  {id:93,type:9,variant:3,name:'Dimensionswächter',color:'#b7a4e5'}
 ].map(Object.freeze));
 const get=id=>CATALOG.find(s=>s.id===id)||null;
 function normalize(owned=[],equipped={}){const ids=Array.isArray(owned)?[...new Set(owned.filter(id=>get(id)))]:[],selection={};if(equipped&&typeof equipped==='object')for(const type of [0,8,9]){const id=equipped[type];if(ids.includes(id)&&get(id)?.type===type)selection[type]=id;}return {owned:ids,equipped:selection};}
 function choose(owned,random=Math.random,catalog=CATALOG){const pool=catalog.filter(s=>!owned.includes(s.id));if(!pool.length)return null;const n=Number(random());if(!Number.isFinite(n)||n<0||n>=1)throw Error('Ungültige Ziehung.');return pool[Math.floor(n*pool.length)];}
 function rotationInfo(now=Date.now()){
  const date=new Date(now);if(!Number.isFinite(date.getTime()))throw Error('Ungültige Zeit.');
  const key=[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-'),next=new Date(date);next.setHours(24,0,0,0);
  let seed=(Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)+115)>>>0;
  const pool=[...CATALOG];for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=Math.floor((seed/4294967296)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return {key,next:next.getTime(),skins:pool.slice(0,4)};
 }
 const DAILY_CHEST=false;
 function chestPool(now=Date.now()){return DAILY_CHEST?rotationInfo(now).skins:CATALOG;}
 function statePose(state){return ({idle:'idle',run:'run',jump:'jump',attack:'attack',aim:'attack',special:'special',ability:'special',ultimate:'special',hit:'hit',block:'hit',death:'death',cloak:'special',reload:'idle',rise:'jump'})[state]||'idle';}
 return {CATALOG,CHEST_COST,DIRECT_COST,DAILY_CHEST,rotationInfo,chestPool,get,normalize,choose,statePose};
});
