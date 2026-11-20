/* New owner-defined codes are added here. Each code is redeemable once per profile. */
'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarRewards=api;})(globalThis,()=>{
 const CODES=Object.freeze({start2010:Object.freeze({diamonds:500,title:'START2010',message:'Dein Startgeschenk: 500 Sternenstaub. Viel Spaß in Sternensturm!'}),moneyrain:Object.freeze({diamonds:200,title:'Moneyrain',message:'Dein Geschenk: 200 Sternenstaub. Viel Spaß in Sternensturm!'}),donner:Object.freeze({skinId:62,title:'Donnerkrieger',message:'Dein Geschenk: der epische Donnerkrieger-Skin für den Haudrauf. Viel Spaß in Sternensturm!'})});
 const COMMANDS=Object.freeze({_money:Object.freeze({amount:10000}),_kill:Object.freeze({confirm:true}),_all:Object.freeze({skins:true}),_testplay:Object.freeze({launch:true})});
 function find(input){if(typeof input!=='string'||input.length>80)return null;const code=input.trim().toLowerCase();return Object.hasOwn(CODES,code)?{code,...CODES[code]}:null;}
 function command(input){if(typeof input!=='string'||input.length>80)return null;const name=input.trim().toLowerCase();return Object.hasOwn(COMMANDS,name)?{name,...COMMANDS[name]}:null;}
 const BOSS_BONUS=Object.freeze(Object.fromEntries([
  ['ravager','Schattenravager',1],['priest','Voidpriester',1],['starwyrm','Sternenwyrm',2],
  ['basaltor','Basaltor',3],['voidlurker','Voidlurker',3],['riftworm','Riftwurm',3],['specter','Specter',3],['obsidian','Obsidian',4],['vulkanus','Vulkanus',4],['aerion','Aerion',4],
  ['umbra','Umbra',6],['leviathan','Leviathan',7],['tyrant','Tyrant',8],['astraea','Astraea',9],['kronos','Kronos',10]
 ].map(([id,name,amount])=>[id,Object.freeze({name,amount})])));
 const LOOT=Object.freeze({regularChance:.002,regularAmount:1,maxCount:1000000});
 function normalizeLoot(value){if(value===undefined)return {bosses:{},regular:0};if(!value||typeof value!=='object'||Array.isArray(value)||!value.bosses||typeof value.bosses!=='object'||Array.isArray(value.bosses)||!Number.isSafeInteger(value.regular)||value.regular<0||value.regular>LOOT.maxCount||Object.keys(value).some(k=>!['bosses','regular'].includes(k)))throw Error('Ungültiger Boss-Bonus.');const bosses={};for(const [id,count]of Object.entries(value.bosses)){if(!Object.hasOwn(BOSS_BONUS,id)||!Number.isSafeInteger(count)||count<0||count>LOOT.maxCount)throw Error('Ungültiger Boss-Bonus.');if(count)bosses[id]=count;}return {bosses,regular:value.regular};}
 function bonus(value){const loot=normalizeLoot(value),rows=Object.entries(loot.bosses).map(([id,count])=>({id,name:BOSS_BONUS[id].name,count,amount:count*BOSS_BONUS[id].amount})),bossTotal=rows.reduce((n,row)=>n+row.amount,0),dropTotal=loot.regular*LOOT.regularAmount;return {loot,rows,bossTotal,dropTotal,total:bossTotal+dropTotal};}
 function validLoot(value){if(value===undefined)return false;try{normalizeLoot(value);return true;}catch{return false;}}
 return {CODES,find,COMMANDS,command,BOSS_BONUS,LOOT,normalizeLoot,bonus,validLoot};
});
