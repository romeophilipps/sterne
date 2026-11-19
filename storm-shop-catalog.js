'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm-weapons.js'):root.StarWeapons,typeof module==='object'&&module.exports?require('./storm-skins.js'):root.StarSkins);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarShop=api;})(globalThis,(W,K)=>{
 const WINTER_START=Date.parse('2026-12-01T00:00:00+01:00');
 const CHESTS=Object.freeze({standard:Object.freeze({id:'standard',name:'Skin-Truhe',cost:100,seasonal:false}),weapons:Object.freeze({id:'weapons',name:'Waffentruhe',cost:100,seasonal:false}),christmas:Object.freeze({id:'christmas',name:'Weihnachtstruhe',cost:100,seasonal:true})});
 const WINTER_BUNDLE=Object.freeze({id:'winter-four',name:'Winter-Themen-Set',cost:250,ids:Object.freeze([21,41,51,81])});
 const weaponRarity=id=>['rare','epic','legendary','epic'][id]||'rare';
 function seasonInfo(now=Date.now()){if(!Number.isFinite(Number(now)))throw Error('Ungültige Zeit.');return {active:Number(now)>=WINTER_START,start:WINTER_START,label:'Ab 1. Dezember'};}
 function chestAvailable(kind,now=Date.now()){const chest=CHESTS[kind];return !!chest&&(!chest.seasonal||seasonInfo(now).active);}
 function chestPool(kind,profile,now=Date.now()){
  if(!chestAvailable(kind,now))return [];
  const skins=kind==='weapons'?[]:kind==='christmas'?K.CATALOG.filter(s=>s.seasonal):K.AVAILABLE;
  const rewards=skins.filter(s=>!profile.skins.owned.includes(s.id)).map(s=>({...s,kind:'skin'}));
  if(kind==='weapons')for(const w of W.CATALOG)if(!profile.owned.includes(w.id))rewards.push({...w,kind:'weapon',rarity:weaponRarity(w.id)});
  return rewards;
 }
 const DROP_WEIGHTS=Object.freeze({rare:75,epic:20,legendary:5});
 function chances(pool){const counts={rare:0,epic:0,legendary:0};for(const item of pool){if(!(item.rarity in DROP_WEIGHTS))throw Error('Unbekannte Seltenheit.');counts[item.rarity]++;}const total=Object.keys(counts).reduce((n,k)=>n+(counts[k]?DROP_WEIGHTS[k]:0),0);return Object.fromEntries(Object.keys(counts).map(k=>[k,{count:counts[k],probability:counts[k]?DROP_WEIGHTS[k]/total:0}]));}
 function choose(pool,random=Math.random){if(!pool.length)return null;const n=Number(random());if(!Number.isFinite(n)||n<0||n>=1)throw Error('Ungültige Ziehung.');const odds=chances(pool);let start=0;for(const rarity of Object.keys(DROP_WEIGHTS)){const group=pool.filter(s=>s.rarity===rarity),chance=odds[rarity].probability;if(!group.length)continue;if(n<start+chance)return group[Math.min(group.length-1,Math.floor((n-start)/chance*group.length))];start+=chance;}return pool[pool.length-1];}
 function bundleMissing(profile){return WINTER_BUNDLE.ids.filter(id=>!profile.skins.owned.includes(id));}
 return {WINTER_START,CHESTS,WINTER_BUNDLE,DROP_WEIGHTS,chances,weaponRarity,seasonInfo,chestAvailable,chestPool,choose,bundleMissing};
});
