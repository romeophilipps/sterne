'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm.js'):root.StarStorm,typeof module==='object'&&module.exports?require('./storm-pvp.js'):root.StarPvp);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarBot=api;})(globalThis,(S,P)=>{
 const NAME='Jensi Spahn',DIFFICULTIES=Object.freeze({easy:{label:'Leicht',think:1800,smart:.2,upgradeEvery:18000},medium:{label:'Mittel',think:850,smart:.7,upgradeEvery:8000},hard:{label:'Schwer',think:350,smart:1,upgradeEvery:3000}});
 const pick=(a,r)=>a[Math.min(a.length-1,Math.floor(r()*a.length))];
 function team(random=Math.random,previous){let warriors;for(let n=0;n<12;n++){const pool=Array.from({length:S.WARRIORS.length},(_,i)=>i);warriors=[pick([0,1,2],random)];pool.splice(pool.indexOf(warriors[0]),1);while(warriors.length<4){const i=pick(pool,random);warriors.push(i);pool.splice(pool.indexOf(i),1);}if(!previous||warriors.some(i=>!previous.warriors.includes(i)))break;}if(previous&&warriors.every(i=>previous.warriors.includes(i))){warriors[3]=Array.from({length:S.WARRIORS.length},(_,i)=>i).find(i=>!warriors.includes(i));}return {warriors,heroes:[Math.floor(random()*S.HEROES.length)]};}
 class Controller{
  constructor(match,difficulty='medium',random=Math.random){this.match=match;this.options=DIFFICULTIES[difficulty]||DIFFICULTIES.medium;this.random=random;this.nextThink=0;this.nextUpgrade=6000;this.planned=null;this.actions=[];}
  act(action,kind,index){const m=this.match,ok=m.command(1,{seq:m.lastCommands[1]+1,action,kind,index});if(ok){this.actions.push({at:m.elapsed,action,kind,index});if(this.actions.length>1000)this.actions.shift();}return ok;}
  step(){const m=this.match;if(m.winner!==null||m.elapsed<this.nextThink)return;this.nextThink=m.elapsed+this.options.think;const r=m.runs[1],deck=m.loadouts[1],ours=r.troops.filter(t=>t.hp>0),foes=r.enemies.filter(t=>t.hp>0&&t.kind!=='base'&&t.kind!=='shield'),count=i=>S.troopCount(ours,i),danger=foes.filter(t=>Math.abs(t.z-r.base.z)<.6),hurt=ours.some(t=>t.hp/t.max<.65),front=ours.filter(t=>[0,1,5,6].includes(t.type)&&t.hero<0).length;
   // Only deployed enemies inform the decision. No opponent deck, wallet or future orders.
   const hero=deck.heroes[0];if(foes.length&&r.army.stars>=r.offer('heroes',hero).amount&&!ours.some(t=>t.hero===hero)&&!r.heroArrivals.some(t=>t.hero===hero))this.act('buy','heroes',hero);
   const candidates=deck.warriors.filter(i=>count(i)<S.troopLimit(i));
   if(ours.length+r.heroArrivals.length<P.CONFIG.maxUnits&&candidates.length){
    const score=i=>{const cost=r.offer('warriors',i).amount;let value=1+this.random();if(this.random()<this.options.smart){if(front===0&&[0,1,6].includes(i))value+=5;if(hurt&&i===7&&count(i)===0)value+=6;if(i===7&&!ours.length)value-=4;if([2,3,4,9].includes(i)&&front>0)value+=3;if(danger.length&&cost<=r.army.energy)value+=4;if(count(i)===0)value+=1.5;value-=count(i)*.8;}return value;};
    if(!candidates.includes(this.planned)||danger.length||r.army.energy>=95)this.planned=candidates.map(i=>({i,score:score(i)})).sort((a,b)=>b.score-a.score)[0].i;
    if(r.army.energy>=r.offer('warriors',this.planned).amount&&this.act('buy','warriors',this.planned))this.planned=null;
   }
   if(m.elapsed<this.nextUpgrade)return;this.nextUpgrade=m.elapsed+this.options.upgradeEvery;
   const upgrades=deck.warriors.filter(i=>S.canAffordUpgrade(r.army,r.upgradeOffer(i))).sort((a,b)=>r.army.levels[a]-r.army.levels[b]||count(b)-count(a));if(upgrades.length)this.act('upgrade',null,upgrades[0]);
   // Buy a real base weapon and improve it with the same silver/gold prices as the player.
   if(!r.core.active){const weapon=danger.length?1:pick([1,2,3,5],this.random);if(r.army.silver>=S.Core.get(weapon).cost)this.act('coreBuy',null,weapon);}
   else{const o=S.Core.offer(r,r.core.active);if(o?.available&&r.army[o.currency]>=o.cost)this.act('coreUpgrade',null,r.core.active);}
   if(danger.length&&S.canAffordUpgrade(r.army,S.upgradeTerms(r.army.baseLevel,S.WARRIORS.length,S.upgradeCapFor(S.WARRIORS.length,61))))this.act('upgrade',null,S.WARRIORS.length);
   if(danger.length>=3&&S.Core.novaOffer(r).available)this.act('coreNova',null,0);
   else if(this.options.smart>=.7&&r.core.active&&r.core.gold<3&&r.army.gold>=S.Core.CONFIG.goldCosts[r.core.gold])this.act('coreGold',null,0);
  }
 }
 class Session{
  constructor({loadout,equipment={},difficulty='medium',random=Math.random,clock=()=>Date.now(),isHidden=()=>!!globalThis.document?.hidden}={}){if(!S.validLoadout(loadout,4,1))throw Error('Wähle zuerst 4 Truppen und 1 Helden.');this.loadout=loadout;this.equipment=equipment;this.difficulty=DIFFICULTIES[difficulty]?difficulty:'medium';this.random=random;this.clock=clock;this.isHidden=isHidden;this.mode='pvp';this.bot=true;this.peerName=NAME;this.host=true;this.connected=true;this.closed=false;this.state='lobby';this.round=0;this.code='JENSI';this.votes=[false,true];this.peerLeft=false;this.onchange=()=>{};}
  get paused(){return !this.closed&&this.isHidden();}
  start(){this.startMatch();this.timer=setInterval(()=>this.update(),50);return this;}
  startMatch(){this.peerLoadout=team(this.random,this.peerLoadout);this.round++;this.match=new P.Match(Math.floor(this.random()*4294967296),[this.loadout,this.peerLoadout],[this.equipment,{}]);this.controller=new Controller(this.match,this.difficulty,this.random);this.state='playing';this.votes=[false,true];this.lastTick=this.clock();this.snapshot=this.match.snapshot(0);this.onchange(this);}
  update(){if(this.closed)return;const now=this.clock(),dt=Math.max(0,Math.min(160,now-this.lastTick));this.lastTick=now;if(!this.paused&&this.match.winner===null){this.controller.step();this.match.tick(dt);}if(!this.lastNotify||now-this.lastNotify>=200||this.match.winner!==null){this.snapshot=this.match.snapshot(0);this.lastNotify=now;this.onchange(this);}}
  command(action,kind,index){if(this.closed||this.paused||this.match?.winner!==null)return false;const ok=this.match.command(0,{seq:this.match.lastCommands[0]+1,action,kind,index});this.snapshot=this.match.snapshot(0);this.onchange(this);return ok;}
  requestRematch(){if(this.closed||this.match?.winner===null)return false;this.startMatch();return true;}
  close(){if(this.closed)return;this.closed=true;this.connected=false;clearInterval(this.timer);this.match?.surrender(0);}
 }
 return {NAME,DIFFICULTIES,team,Controller,Session};
});
