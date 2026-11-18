'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm.js'):root.StarStorm);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarDuel=api;})(globalThis,S=>{
 const VERSION=1,MAX_UNITS=30;
 const roundKeys=['elapsed','wave','completed','base','army','baseSafeUntil','heroArrivals','heroDepartures','heroFx','bossDeaths','hammerWaves','healingProjectiles','healingZones','droneMissions','droneExplosions','dimensionFields','dimensionBursts','corpses','fx','shots','frozen','armored'];
 const unitKeys=['id','kind','type','hero','x','z','hp','max','level','tier','face','phase','walking','blend','vx','vz','aim','recoil','flash','hitAt','anim','shield','cloaked','cloakAt','visibleUntil','killCloakUntil','cloakUntil','arcaneState','energyReady','rechargeStartedAt','nextDimensionAt','dimensionLift','dimensionUntil','netUntil','deathAt','healedUntil'];
 const clean=o=>JSON.parse(JSON.stringify(o,(key,value)=>(['pending','to','_raw'].includes(key)||key==='source'&&typeof value==='object')?undefined:typeof value==='number'&&!Number.isFinite(value)?0:value));
 const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>o[k]!==undefined).map(k=>[k,o[k]]));
 function random(seed){let n=seed>>>0;return ()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
 class Match{
  constructor(seed=12345){this.rounds=[S.create(random(seed)),S.create(random(seed^0xabcdef))];this.elapsed=0;this.winner=null;this.sequence=0;this.proxies=[new Map(),new Map()];this.lastCommands=[0,0];this.commandTimes=[[],[]];
   this.rounds.forEach((r,side)=>{r.duel=true;r.id=side*1000000;r.army.coins=40;r.army.stars=0;r.base.hp=r.base.max=600;r.events=[];Object.defineProperty(r,'coinInterval',{get:()=>500});Object.defineProperty(r,'upgradeCap',{get:()=>30});Object.defineProperty(r,'unitStrength',{get:()=>1});
    const baseDamage=r.damageBase.bind(r);r.damageBase=amount=>{const max=r.base.max;const expected=Math.max(0,r.base.hp-amount*S.baseStats(r.army.baseLevel).armor);baseDamage(amount);if(!r.revived||r.base.hp<=0)r.base.hp=expected;r.base.max=max;};
    const originalUpgrade=r.upgrade.bind(r);r.upgrade=type=>{if(type===S.WARRIORS.length)return false;return originalUpgrade(type);};
    r.hit=(target,damage,weapon=-1,pure=false,source=null)=>this.damage(side,target,damage,pure,source);
    const capture=r.captureSoul.bind(r);r.captureSoul=(e,field)=>e.kind!=='base'&&e.kind!=='shield'&&capture(e,field);
    const targets=r.dimensionTargets.bind(r);r.dimensionTargets=(t,global=false)=>targets(t,global).filter(e=>e.kind!=='base'&&e.kind!=='shield');
    const home=r.arcaneHome.bind(r);r.arcaneHome=()=>home();
   });
  }
  mirror(side,raw){const cache=this.proxies[side];if(cache.has(raw.id)&&cache.get(raw.id)._raw===raw)return cache.get(raw.id);const proxy=new Proxy(raw,{get(t,k){if(k==='_raw')return t;if(k==='z')return 1-t.z;if(k==='face')return -(t.face||1);if(k==='vz')return -(t.vz||0);if(k==='boss')return false;if(k==='reward'||k==='stars')return 0;return t[k];},set(t,k,v){t[k]=k==='z'?1-v:k==='vz'?-v:v;return true;}});cache.set(raw.id,proxy);return proxy;}
  enemies(side){const other=this.rounds[1-side],live=[...other.shields(),...other.troops.filter(t=>t.hp>0&&!other.isCloaked(t)),other.base],ids=new Set(live.map(t=>t.id));for(const id of this.proxies[side].keys())if(!ids.has(id))this.proxies[side].delete(id);return live.map(t=>this.mirror(side,t));}
  damage(side,target,damage,pure,source){if(!target||target.hp<=0||!Number.isFinite(damage)||damage<=0)return;const other=this.rounds[1-side],raw=target._raw;if(!raw||raw.hp<=0||other.isCloaked(raw))return;const before=raw.hp;if(raw===other.base)other.damageBase(damage);else if(pure){raw.hp-=damage;raw.hitAt=this.elapsed;}else other.wound(raw,damage,source);if(before>0&&raw.hp<=0&&source?.hero<0&&source.type===5){const killer=this.rounds[side].troops.find(t=>t.id===source.id&&t.hp>0);if(killer){killer.killCloakUntil=this.elapsed+10000;killer.visibleUntil=0;killer.cloaked=true;killer.cloakAt=this.elapsed-500;}}}
  command(side,cmd){if(![0,1].includes(side)||!cmd||this.winner!==null||!Number.isInteger(cmd.seq)||cmd.seq!==this.lastCommands[side]+1)return false;this.lastCommands[side]=cmd.seq;const times=this.commandTimes[side]=this.commandTimes[side].filter(t=>this.elapsed-t<1000);if(times.length>=12)return false;times.push(this.elapsed);const r=this.rounds[side];if(cmd.action==='buy'&&cmd.kind==='warriors'&&Number.isInteger(cmd.index)&&r.troops.length+r.heroArrivals.length<MAX_UNITS)return r.buy(cmd.kind,cmd.index);if(cmd.action==='upgrade'&&Number.isInteger(cmd.index))return r.upgrade(cmd.index);return false;}
  tick(ms){if(this.winner!==null||!Number.isFinite(ms)||ms<=0)return;let left=Math.min(ms,160);while(left>0&&this.winner===null){const dt=Math.min(16,left);left-=dt;this.elapsed+=dt;
    for(let order=0;order<2;order++){const side=(order+Math.floor(this.elapsed/16))%2,r=this.rounds[side],other=this.rounds[1-side];r.enemies=this.enemies(side);r.wave=1;r.completed=Math.floor(this.elapsed/30000);r.army.silver+=0;r.silverIncomeClock+=dt;while(r.silverIncomeClock>=1000){r.silverIncomeClock-=1000;r.army.silver++;}if(other.frozen)for(const t of r.troops)t.duelFrozenUntil=Math.max(t.duelFrozenUntil||0,this.elapsed+16);
     for(const t of r.troops)if(Math.max(t.dimensionUntil||0,t.netUntil||0)>r.elapsed){r.projectiles=r.projectiles.filter(p=>p.source?.id!==t.id);r.rockets=r.rockets.filter(p=>p.source?.id!==t.id);}
     r.step(dt);r.army.stars=0;
    }
    const dead=this.rounds.map(r=>r.base.hp<=0);if(dead[0]&&dead[1])this.winner='draw';else if(dead[0])this.winner=1;else if(dead[1])this.winner=0;
   }this.sequence++;
  }
  surrender(side){if(this.winner===null&&[0,1].includes(side))this.winner=1-side;}
  snapshot(){return {v:VERSION,seq:this.sequence,elapsed:this.elapsed,winner:this.winner,ack:[...this.lastCommands],rounds:this.rounds.map(r=>{const s=clean(pick(r,roundKeys));s.troops=r.troops.map(t=>clean(pick(t,unitKeys)));s.projectiles=r.projectiles.map(p=>clean({...p,to:undefined,source:undefined,toX:p.to?.x,toZ:p.to?.z}));s.rockets=r.rockets.map(p=>clean({...p,to:undefined,source:undefined,tx:p.to?.x??p.tx,tz:p.to?.z??p.tz}));return s;})};}
 }
 function validSnapshot(s){return !!s&&s.v===VERSION&&Number.isFinite(s.seq)&&Number.isFinite(s.elapsed)&&[null,0,1,'draw'].includes(s.winner)&&Array.isArray(s.ack)&&s.ack.length===2&&Array.isArray(s.rounds)&&s.rounds.length===2&&s.rounds.every(r=>r&&r.base&&Number.isFinite(r.base.hp)&&Number.isFinite(r.base.max)&&Array.isArray(r.troops)&&r.troops.length<=36&&r.army);}
 return {VERSION,Match,validSnapshot,MAX_UNITS};
});
