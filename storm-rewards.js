/* New owner-defined codes are added here. Each code is redeemable once per profile. */
'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarRewards=api;})(globalThis,()=>{
 const CODES=Object.freeze({moneyrain:Object.freeze({diamonds:200,title:'Moneyrain',message:'Dein Geschenk: 200 Diamanten. Viel Spaß in Sternensturm!'})});
 function find(input){if(typeof input!=='string'||input.length>80)return null;const code=input.trim().toLowerCase();return Object.hasOwn(CODES,code)?{code,...CODES[code]}:null;}
 return {CODES,find};
});
