'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm.js'):root.StarStorm);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarDuel=api;})(globalThis,S=>{
 const VERSION=3,MAX_UNITS=30;
 const fieldKeys=['elapsed','wave','completed','base','army','baseSafeUntil','heroArrivals','heroDepartures','heroFx','bossDeaths','hammerWaves','healingProjectiles','healingZones','droneMissions','droneExplosions','dimensionFields','dimensionBursts','corpses','fx','shots','frozen','armored','troops','enemies','hazards','legionFx','banishments','rockets','projectiles','bossName','score','xp','needed','rank','rest'];
 const clean=o=>JSON.parse(JSON.stringify(o,(key,value)=>(['pending','to','_raw'].includes(key)||key==='source'&&typeof value==='object')?undefined:typeof value==='number'&&!Number.isFinite(value)?0:value));
 function random(seed){let n=seed>>>0;return ()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
 class Match{
  constructor(seed=12345){this.run=S.create(random(seed));this.wallets=[this.run.army,S.profile()];this.elapsed=0;this.winner=null;this.sequence=0;this.lastCommands=[0,0];this.commandTimes=[[],[]];const r=this.run,spawn=r.spawnLegion.bind(r);r.spawnLegion=(...args)=>{const e=spawn(...args);if(e){e.hp*=2;e.max*=2;}return e;};
   this.rounds=this.wallets.map((army,side)=>({army,get troops(){return r.troops.filter(t=>t.owner===side);},get base(){return r.base;},get heroArrivals(){return [];}}));
  }
  command(side,cmd){if(![0,1].includes(side)||!cmd||this.winner!==null||!Number.isInteger(cmd.seq)||cmd.seq!==this.lastCommands[side]+1)return false;this.lastCommands[side]=cmd.seq;const times=this.commandTimes[side]=this.commandTimes[side].filter(t=>this.elapsed-t<1000);if(times.length>=12)return false;times.push(this.elapsed);
   if(cmd.action!=='buy'&&cmd.action!=='upgrade'||!Number.isInteger(cmd.index))return false;
   const r=this.run,all=r.troops,own=all.filter(t=>t.owner===side),others=all.filter(t=>t.owner!==side),army=this.wallets[side];
   if(cmd.action==='buy'&&(cmd.kind!=='warriors'||own.filter(t=>t.hp>0).length>=MAX_UNITS))return false;
   r.army=army;r.troops=own;let ok=false;try{if(cmd.action==='buy')ok=r.buy('warriors',cmd.index);else ok=r.upgrade(cmd.index);for(const t of r.troops)if(t.owner===undefined)t.owner=side;}finally{r.troops=[...others,...r.troops];r.army=this.wallets[0];}
   if(ok&&cmd.action==='upgrade'&&cmd.index===S.WARRIORS.length)for(const wallet of this.wallets)wallet.baseLevel=army.baseLevel;
   return ok;
  }
  tick(ms){if(this.winner!==null||!Number.isFinite(ms)||ms<=0)return;let left=Math.min(ms,160);while(left>0&&this.winner===null){const dt=Math.min(16,left);left-=dt;const r=this.run,before={coins:r.army.coins,silver:r.army.silver,gold:r.army.gold};r.step(dt);this.elapsed=r.elapsed;
    for(const key of ['coins','silver','gold'])this.wallets[1][key]+=r.army[key]-before[key];
    for(let side=0;side<2;side++){const wallet=this.wallets[side];wallet.stars=0;wallet.warriors=S.WARRIORS.map((_,type)=>r.troops.filter(t=>t.owner===side&&t.type===type&&t.hero<0&&t.hp>0).length);}
    if(r.ended)this.winner='defeat';
   }this.sequence++;
  }
  surrender(side){if(this.winner===null&&[0,1].includes(side))this.winner='draw';}
  snapshot(){const r=this.run,field=clean(Object.fromEntries(fieldKeys.map(key=>[key,r[key]])));return {v:VERSION,mode:'coop',seq:this.sequence,elapsed:this.elapsed,winner:this.winner,ack:[...this.lastCommands],field,rounds:this.wallets.map((army,side)=>({army:clean(army),base:clean(r.base),troops:field.troops.filter(t=>t.owner===side),heroArrivals:[]}))};}
 }
 function validSnapshot(s){return !!s&&s.v===VERSION&&s.mode==='coop'&&Number.isFinite(s.seq)&&Number.isFinite(s.elapsed)&&[null,'defeat','draw'].includes(s.winner)&&Array.isArray(s.ack)&&s.ack.length===2&&s.field&&Number.isFinite(s.field.wave)&&Array.isArray(s.field.troops)&&s.field.troops.length<=MAX_UNITS*2&&Array.isArray(s.field.enemies)&&s.field.enemies.length<=40&&Array.isArray(s.rounds)&&s.rounds.length===2&&s.rounds.every(r=>r&&r.base&&Number.isFinite(r.base.hp)&&Number.isFinite(r.base.max)&&Array.isArray(r.troops)&&r.troops.length<=MAX_UNITS&&r.army);}
 return {VERSION,Match,validSnapshot,MAX_UNITS};
});
