'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm.js'):root.StarStorm,typeof module==='object'&&module.exports?require('./storm-items.js'):root.StarItems);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarItemPreview=api;})(globalThis,(S,I)=>{
 const CYCLE=42000,SPEED=4;
 const cycleFor=item=>item.number===79?12000:CYCLE,speedFor=item=>item.number===79?1:SPEED;
 function random(seed=71261){return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
 function targetFor(item,preferred){const allowed=I.allowedTargets(item);return allowed.includes(preferred)?preferred:allowed[0];}
 function createSide(item,target,enabled){
  const run=S.create(item.number===70?()=>.005:random(),{lootSeed:71261});run.army.coins=150;run.army.stars=150;run.base.hp=run.base.max=1e6;
  if(item.number===174)run.wave=4;else if(item.number===19)run.wave=61;else if(item.number===23||item.params.everyWave||item.number===200)run.wave=5;else if(item.number===180)run.wave=3;
  run.remaining=1;run.spawnClock=1e9;run.rest=1e9;
  run.setEquipment({items:enabled?{[target]:item.id}:{}});
  const side={run,item,target,enabled,unit:null,dealt:0,attacks:0,kills:0,travel:0,event:'Einsatz',clock:0,step:0};
  const hit=run.hit;run.hit=function(e,...args){const hp=e?.hp||0,result=hit.call(this,e,...args);side.dealt+=Math.max(0,hp-(e?.hp||0));if(hp>0&&e.hp<=0)side.kills++;return result;};
  const strike=run.strike;run.strike=function(...args){side.attacks++;return strike.apply(this,args);};
  function deploy(key,pay=true){const hero=key[0]==='h',index=Number(key.slice(1));if(pay)run.buy(hero?'heroes':'warriors',index);else run.summon(hero?0:index,hero?index:-1);const arriving=run.heroArrivals.at(-1);if(hero&&arriving){run.heroArrivals.pop();run.troops.push(arriving.unit);arriving.unit.anim={state:'idle',start:run.elapsed,duration:0};}return run.troops.at(-1);}
  side.deploy=deploy;
  if([32,37].includes(item.number))for(let i=1;i<item.params.every;i++){deploy(target);run.troops=[];}
  if(item.number===151){const ally=deploy('t1',false);ally.hp=ally.max*.45;}
  side.unit=deploy(target,item.number!==13);side.unit.x=.5;side.unit.z=.7;side.unit.anim={state:'idle',start:0,duration:0};
  const p=item.params,required=new Set((p.types||[]).map(t=>'t'+t));if(p.nearType!==undefined)required.add('t'+p.nearType);if(p.meleeTeam)required.add('t0');if(p.healer)required.add('t7');if(p.classes)for(const n of [0,1,2].slice(0,p.classes))required.add('t'+n);if(p.heroes||p.nearHero||item.number===157){required.add('h0');required.add('h1');}if(p.allies)for(const n of [0,1,2,3])required.add('t'+n);if(p.same)required.add(target+'duplicate');if(p.radius&&p.defense)required.add(target==='t0'?'t1':'t0');if(item.number===74)required.add('t1');if(item.number===136)required.add('t1');if(item.number===190)required.add('t8');if(item.number===194){required.add('t0');required.add('t1');required.add('t2');}if(item.number===197){required.add('h1');required.add('h2');required.add('h4');}if([64,67,78,110,135,141,146,151,154,157,159,189,192].includes(item.number))required.add('t1');
  for(const key of required){if(key===target)continue;const other=deploy(key.replace('duplicate',''),false);if(other&&other!==side.unit){other.x=.46+run.troops.length*.008;other.z=.69;}}
  if([64,67,78,110,135,141,146,154,157,159,189,192].includes(item.number))for(const t of run.troops)t.hp=t.max*.45;
  // Controlled training opponents; both halves use identical values, equipment is the only difference.
  side.enemy=()=>{const info=p.boss||p.pierce?S.Legion.major[0]:p.elite||p.eliteFreeze||p.group==='elite'?S.Legion.elite[0]:p.ranged?S.Legion.byId.hunter:S.Legion.byId.shadow;
   const e=run.spawnLegion({...info,hp:500,damage:item.number===120?0:.1,speed:.003},{x:.5,z:.48});e.bornUntil=0;if(item.number===55)e.hp=e.max*.15;if(item.number===105)e.abilityShield=50;e.damage=item.number===120?0:.1;e.abilityClock=1e9;e.weak=Array(10).fill(1);e.heroWeak=Array(5).fill(1);return e;};
  for(let i=0;i<(p.chain||p.area||p.blast||item.number===128?4:1);i++){const e=side.enemy();e.x=.32+i*.12;e.z=(item.number===148?.56:.48)-i*.05;}
  
  if(item.number===13)run.army.coins=0;if(item.number===143)run.heroClocks[2]=1e9;
  if(item.number===181){const eng=run.itemEngines.find(e=>e.id===181);if(eng)eng.state.spent=99;side.event='Bereits 99 Bronze ausgegeben';}
  if(item.number===89)run.wound(side.unit,1,{range:.1});
  for(const eng of run.itemEngines)eng.waveStart();
  if(item.number===79){side.unit.attack=1e9;side.unit.cloakUntil=0;side.unit.cloakReadyAt=1e9;side.unit.nextDimensionAt=1e9;run.heroClocks.fill(1e9);side.event='Erster tödlicher Treffer steht bevor';}
  if(item.number===199){const memory=new Map();side.store=new S.Armory.Store({getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},'preview-only');const profile=side.store.read();profile.diamonds=50;profile.items.owned=enabled?['199']:[];side.store.save(profile);side.store.finishItems('preview-round',enabled?{[target]:'199'}:{});side.event='Rundenende → nächste Item-Kiste';}
  return side;
 }
 function event(side){const {run:r,item,unit:t}=side,p=item.params;side.step++;
  const engines=r.itemEngines;
  if(item.trigger==='wave'||item.number===172){r.completed+=1;side.event='Welle '+r.completed+' beendet';for(const e of engines)e.waveEnd();}
  else if(item.trigger==='waveStart'){side.event='Wellenbeginn '+r.wave;for(const e of engines)e.waveStart();}
  else if(item.trigger==='purchase'){side.event='Kauf '+(side.step+1)+' der Beispielklasse';if(t.hero<0&&t.type>=5)r.troops=r.troops.filter(u=>u!==side.unit);if(item.number!==13){r.army.coins+=100;r.army.stars+=40;}const u=side.deploy(side.target);if(u){side.unit=u;u.x=.5;u.z=.7;} }
  else if(item.trigger==='death'){const victim=p.healer?r.troops.find(u=>u!==t):t;if(victim?.hp>0){side.event='Ein Verbündeter fällt';r.wound(victim,victim.max*100,{range:.1});}}
  else if(item.trigger==='wound'||p.defense||p.shield){side.event='Gegnerischer Treffer';if(t.hp>0){r.wound(t,t.max*.06,{range:p.ranged?.3:.05});if(item.number===65)r.knockback(t,0,.03);}}
  else if(item.trigger==='heal'||[141,146,154,157,189].includes(item.number)){side.event='Heilung';r.restoreHealth(t,t.max*.08);if(t.hero===0){t.castCount=(t.castCount||0)+1;r.heroVisual(t);}}
  else if(item.trigger==='kill'||p.afterKill||p.killCharge||[8,11,15,18,169].includes(item.number)){side.event='Gegner besiegt · '+side.step;const e=side.enemy();e.hp=1;e.x=t.x;e.z=t.z-.04;r.hit(e,10*e.max,-1,true,t);}
  else if(item.trigger==='enemySpawn'){side.event='Gegner rücken an';if(r.enemies.filter(e=>e.hp>0).length<12)side.enemy();}
 }
 function advance(side,dt){const r=side.run;side.clock+=dt;if(side.item.number===199){if(side.clock>=800&&!side.opening){side.opening=true;side.store.openItemChest('preview-open',random()).then(result=>{side.chestResult=result;});}return;}
  // Incoming training hits expose defense/last-stand effects without altering either half's rules.
  const before=side.unit.z;r.tick(dt);side.travel+=Math.abs(side.unit.z-before);
  if(side.item.number===79){const at=[1800,2800,7800][side.step];if(at!==undefined&&side.clock>=at){side.step++;if(side.unit.hp>0)r.wound(side.unit,side.unit.max*100,{range:.1});side.event=side.step===1?(side.unit.hp>0?'Wiederbelebt · volles Leben':'Erster tödlicher Treffer · gefallen'):side.step===2?(side.unit.hp>0?'Treffer während der 2 Sekunden Schutz · abgewehrt':'Ohne Item bleibt der Träger gefallen'):(side.enabled?'Zweiter tödlicher Treffer · Wiederbelebung dieser Welle verbraucht':'Ohne Item bleibt der Träger gefallen');}}
  else{const interval=side.item.trigger==='kill'?500:1800;if(Math.floor(side.clock/interval)>side.step)event(side);}
  if(r.enemies.filter(e=>e.hp>0).length<1)side.enemy();
 }
 function create(id,preferred){const item=I.get(id);if(!item)throw Error('Unbekanntes Item');const target=targetFor(item,preferred);return {item,target,elapsed:0,sides:[createSide(item,target,false),createSide(item,target,true)],tick(dt){this.elapsed+=dt;for(const s of this.sides)advance(s,dt);}};}
 function values(side){const r=side.run,t=side.unit,eng=S.ItemEngine.engine(r,t),a=eng.aura(t),p=side.item.params;
  const result=[['Leben',Math.max(0,t.hp),t.max],['Schaden',side.dealt],['Angriffe',side.attacks]];
  if(side.item.number===79)result.push(['Wiederbelebungen übrig',side.enabled?Math.max(0,p.perWave-(eng.state.revives||0)):0],['Schutz (s)',Math.max(0,(t.itemInvulnerableUntil||0)-r.elapsed)/1000]);
  if(side.item.scope==='resource'||side.item.effectType==='resource'||side.item.number===199)result.unshift(['Bronze',r.army.coins],['Silber',r.army.silver],['Gold',r.army.gold],['Sterne',r.army.stars]);
  if(p.move||p.chasing)result.push(['Bewegung %',100*(1+(a.move||0))]);
  if(p.move||p.speed||p.attack||p.afterHit||p.chasing)result.push(['Weg (%)',side.travel*100],['Angriffstempo %',100*(1+(a.attack||0))*(S.leveledStats(t.type,1).cooldown||t.cooldown)/t.cooldown]);
  if(side.item.effectType==='healing'||side.item.trigger==='death'||[135,141,146,151,154,157,159].includes(side.item.number))result.push(['Teamleben',r.troops.reduce((n,t)=>n+Math.max(0,t.hp),0)]);
  if(side.item.number===149)result.push(['Fähigkeit in (s)',Math.max(0,r.heroClocks[t.hero])/1000]);
  if(side.item.trigger==='purchase')result.push(['Nächster Kauf',r.offer(t.hero>=0?'heroes':'warriors',t.hero>=0?t.hero:t.type).amount]);
  if(side.item.number===128)result.push(['Explosionsradius',t.blast*100]);
  if(side.item.number===135)result.push(['Heilung/s',t.healRate]);
  if([65,81,86,89,91,102,107,112,133,143,148,161,163,165,167,168,170,174].includes(side.item.number)){const e=r.enemies.find(e=>e.hp>0);if(e){result.push(['Gegnerleben',e.hp,e.max],['Gegnerposition',e.z*100],['Gegnertempo',e.speed*100],['Eisrest (s)',Math.max(0,(e.slowUntil||0)-r.elapsed)/1000]);if(e.itemSlowUntil>r.elapsed)result.push(['Verlangsamt %',(e.itemSlow||0)*100]);}}
  if(side.item.number===199)result.push(['Auswahl',side.store.read().items.forge?3:1]);
  if(side.item.number===172)result.push(['Wellenpause (s)',r.rest/1000-1e6]);
  if(side.item.number===126)result.push(['Krit.-Markierung %',Math.max(0,...r.enemies.map(e=>e.itemCritUntil>r.elapsed?(e.itemCrit||0)*100:0))]);
  if(t.itemShield)result.push(['Schutzschild',t.itemShield]);
  if(side.item.scope==='summon'||p.power||p.revive)result.push(['Verbündete',r.troops.filter(t=>t.hp>0).length]);
  return result;
 }
 function displayValues(side){
  const valuesByName=new Map(values(side).map(v=>[v[0],v])),p=side.item.params,id=side.item.number;let keys;
  if(id===79)keys=['Leben','Wiederbelebungen übrig','Schutz (s)'];
  else if(id===199)keys=['Auswahl'];
  else if(id===172)keys=['Wellenpause (s)'];
  else if(p.discount!==undefined||p.flat!==undefined)keys=['Nächster Kauf',p.hero?'Sterne':'Bronze'];
  else if(side.item.effectType==='resource'||side.item.scope==='resource')keys=p.allCurrencies?['Bronze','Silber','Gold']:[p.currency==='gold'?'Gold':'Bronze'];
  else if(id===165)keys=['Gegnerleben','Gegnerposition'];
  else if(id===159)keys=['Schaden','Teamleben'];
  else if(p.attack||p.speed)keys=['Angriffstempo %','Angriffe','Schaden'];
  else if(p.move||p.chasing)keys=['Bewegung %','Weg (%)','Angriffe'];
  else if(p.heal||p.healTeam||p.transfer||side.item.trigger==='death')keys=['Teamleben','Leben','Verbündete'];
  else if(p.hp||p.defense||p.block||side.item.trigger==='wound')keys=['Leben','Schutzschild','Weg (%)'];
  else if(id===128)keys=['Explosionsradius','Schaden'];
  else if(id===149)keys=['Fähigkeit in (s)','Angriffe'];
  else if([102,107,112,133,143,148,161,163,165,167,168,170,174].includes(id))keys=['Gegnerleben','Gegnerposition','Verlangsamt %','Eisrest (s)','Gegnertempo'];
  else keys=['Schaden','Angriffe','Leben','Verbündete'];
  return keys.map(k=>valuesByName.get(k)).filter(Boolean).slice(0,3);
 }
 function mount(host,id,preferred){const model=create(id,preferred),item=model.item;let current=model,raf=0,last=0,paused=false,dead=false,visible=false;
  const imageCache=new Map();
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const box=node('section',undefined,'item-preview'),title=node('h5','Im Spiel: Ohne / Mit Item'),intro=node('p','Beispiel: '+globalThis.StarItemGuide.name(model.target)+' · gleiche Ausgangslage','item-preview-caption'),row=node('div',undefined,'item-preview-row');box.setAttribute('aria-label','Animierter Itemvergleich für '+item.name);
  const panels=model.sides.map((side,i)=>{const panel=node('div',undefined,'item-preview-side'),h=node('strong',i?'Mit Item':'Ohne Item'),canvas=node('canvas'),stats=node('dl'),event=node('p',undefined,'item-preview-event');canvas.setAttribute('aria-label',(i?'Mit ':'Ohne ')+item.name+' – Beispielkampf');const focus=node('p',undefined,'item-preview-focus');panel.append(h,focus,canvas,event,stats);row.append(panel);return {panel,canvas,stats,event,focus,renderer:new S.Renderer(canvas)};});
  const guide=I.explain(item,model.target),note=node('p',item.number===79?'Echtzeit-Beispiel: erste Rettung, 2 Sekunden Schutz, danach verbraucht. Neustart nach 12 Sekunden.':'Beispiel im 4× Zeitraffer. Zufallseffekte zeigen eine mögliche Auslösung. Dein Konto bleibt unverändert.','item-preview-caption'),controls=node('div',undefined,'item-preview-controls'),pause=node('button','Pause'),replay=node('button','Neu abspielen');pause.type=replay.type='button';controls.append(pause,replay);box.append(title,intro,row,note,controls);host.append(box);
  function reset(){for(const side of current.sides)for(const e of side.run.itemEngines)e.finish();current=create(id,preferred);last=0;for(const p of panels)p.renderer.poses.clear();}
  pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Abspielen':'Pause';pause.setAttribute('aria-pressed',String(paused));};replay.onclick=()=>{reset();paused=false;pause.textContent='Pause';};
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);},{threshold:.2});observer.observe(box);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');paused=reduced.matches;if(paused)pause.textContent='Abspielen';
  function render(){current.sides.forEach((side,i)=>{const p=panels[i];if(item.number!==199)p.renderer.paint(side.run);else{const c=p.canvas.getContext('2d');if(side.clock<3200&&globalThis.StarChestArt){StarChestArt.draw(p.canvas,Math.min(19,Math.floor(side.clock/3200*20)),side.clock/3200,'weapons');}else{const w=p.canvas.clientWidth,h=p.canvas.clientHeight,d=Math.min(2,devicePixelRatio||1);p.canvas.width=w*d;p.canvas.height=h*d;c.setTransform(d,0,0,d,0,0);c.fillStyle='#0a1428';c.fillRect(0,0,w,h);const found=side.chestResult,ids=found?.pending?found.choices:found?.id?[found.id]:[];ids.forEach((id,j)=>{const item=I.get(id),frameId='frame-'+item.rarity;if(!imageCache.has(id)){const img=new Image();img.src=item.icon;imageCache.set(id,img);}if(!imageCache.has(frameId)){const img=new Image();img.src='./item-frame-'+(item.rarity==='common'?'rare':item.rarity)+'.png?v=154';imageCache.set(frameId,img);}const img=imageCache.get(id),border=imageCache.get(frameId),size=ids.length===1?Math.min(90,w-12):Math.min(55,(w-8)/3),x=ids.length===1?(w-size)/2:4+j*(w-8)/3,y=(h-size)/2-10;c.globalAlpha=Math.min(1,(side.clock-3200)/400);if(border.complete&&border.naturalWidth){c.filter=item.rarity==='common'?'grayscale(1)':'none';c.drawImage(border,x,y,size,size);c.filter='none';}if(img.complete&&img.naturalWidth)c.drawImage(img,x+size*.12,y+size*.12,size*.76,size*.76);c.globalAlpha=1;});}}
   const focus=displayValues(side)[0];p.focus.textContent=focus[0]+': '+focus[1].toLocaleString('de-DE',{maximumFractionDigits:2});p.event.textContent=side.event;p.stats.replaceChildren();for(const [label,n,max]of displayValues(side)){if(!Number.isFinite(n))continue;const cell=node('div');cell.append(node('dt',label),node('dd',n.toLocaleString('de-DE',{maximumFractionDigits:2})+(max!==undefined?' / '+max.toLocaleString('de-DE',{maximumFractionDigits:2}):'')));p.stats.append(cell);}});}
  function frame(now){if(dead)return;if(!host.isConnected){dispose();return;}if(!last)last=now;if(now-last>=50){const delta=Math.min(100,now-last);last=now;if(!paused&&visible&&!document.hidden){let left=delta*speedFor(item);while(left>0){const dt=Math.min(100,left);current.tick(dt);left-=dt;}if(current.elapsed>=cycleFor(item))reset();}render();}raf=requestAnimationFrame(frame);}
  function dispose(){if(dead)return;dead=true;observer.disconnect();cancelAnimationFrame(raf);for(const side of current.sides)for(const e of side.run.itemEngines)e.finish();}
  raf=requestAnimationFrame(frame);return {dispose,model:current,element:box};
 }
 return {create,advance,values,displayValues,targetFor,mount,CYCLE,SPEED,cycleFor,speedFor};
});
