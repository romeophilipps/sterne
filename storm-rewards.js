/* New owner-defined codes are added here. Each code is redeemable once per profile. */
'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarRewards=api;})(globalThis,()=>{
 const CODES=Object.freeze({moneyrain:Object.freeze({diamonds:200,title:'Moneyrain',message:'Dein Geschenk: 200 Sternenstaub. Viel Spaß in Sternensturm!'}),donner:Object.freeze({skinId:62,title:'Donnerkrieger',message:'Dein Geschenk: der epische Donnerkrieger-Skin für den Haudrauf. Viel Spaß in Sternensturm!'})});
 const COMMANDS=Object.freeze({_money:Object.freeze({amount:10000}),_kill:Object.freeze({confirm:true}),_all:Object.freeze({skins:true}),_testplay:Object.freeze({launch:true})});
 function find(input){if(typeof input!=='string'||input.length>80)return null;const code=input.trim().toLowerCase();return Object.hasOwn(CODES,code)?{code,...CODES[code]}:null;}
 function command(input){if(typeof input!=='string'||input.length>80)return null;const name=input.trim().toLowerCase();return Object.hasOwn(COMMANDS,name)?{name,...COMMANDS[name]}:null;}
 return {CODES,find,COMMANDS,command};
});
