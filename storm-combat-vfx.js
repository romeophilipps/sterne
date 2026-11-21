'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm-skins.js'):root.StarSkins);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarCombatVFX=api;})(globalThis,Skins=>{
 const data=typeof module==='object'&&module.exports?require('./storm-combat-vfx-data.js'):globalThis.StarCombatVFXData;
 const EFFECTS=data.effects,FPS=20,FRAME_MS=50,MAX_EVENTS=32,MAX_IMAGES=6;
 const CLIPS=Object.freeze(Object.fromEntries(['impact','shot','magic','heal','death'].map(k=>[k,{frames:6}])));
 // Original motifs selected explicitly for the theme of every existing skin.
 const PROFILES={
  1:[[24],[21,22],[25,27,29]],2:[[74],[61,62],[66,64,63]],3:[[71,76],[81,73],[84,38]],4:[[79],[37,58],[83,85]],
  11:[[55],[22],[25,27]],12:[[56],[17,19],[20,18]],13:[[89],[81],[57,58]],14:[[55],[58],[59,56]],
  21:[[24],[22,21],[29,23]],22:[[43],[46,42],[39,44]],23:[[33],[87],[36,34]],24:[[16],[73],[83,37]],
  31:[[5],[1,3],[7,6]],32:[[9],[61,67],[64,69]],33:[[70],[64,68],[69,63]],34:[[14],[81,90],[82,84]],
  41:[[26],[23,30],[25,27]],42:[[14],[13,17],[15,19]],43:[[33],[35,40],[31,32,34,36,39,87,88]],44:[[10,2],[1,3,6],[4,8,9]],
  51:[[28],[21],[27,29]],52:[[78],[77],[39,34]],53:[[72],[76],[75,71]],54:[[80],[74],[40,97]],
  61:[[64],[65],[63,67]],62:[[11],[12,13],[20,19]],63:[[77],[1,6],[3,8]],64:[[62],[68],[69,70]],
  71:[[52],[51],[25,53]],72:[[54],[59],[57,60]],73:[[58],[60],[89,85]],74:[[52],[53],[56,51]],
  81:[[96],[95],[98,29]],82:[[18],[100],[91,92,93,94,97]],83:[[43,47,50],[42,46,48],[41,44,45,49]],84:[[16],[17],[99,83]],
  91:[[26],[30],[25,27]],92:[[37],[85],[38,58]],93:[[33],[87],[31,32,88]],94:[[35],[86],[82,84]]
 };
 Object.assign(PROFILES,{
  81:[[29],[22,30],[23,25]],
  1:[[101,107],[101,109],[108,110]],11:[[102],[102,108],[102,109]],31:[[103],[103,109],[103,107]],61:[[104],[104,110],[104,109]],71:[[105],[105,107],[105,108]],91:[[106],[106,110],[106,109]],
  3:[[111],[111,122],[111,125]],13:[[112],[112,128],[112]],23:[[113],[113,125],[113]],33:[[114,130],[114,132],[114]],43:[[115],[115,133],[115,126]],53:[[116],[116],[116,124]],63:[[117],[117],[117]],73:[[118],[118],[118]],93:[[119],[119],[119,129]],83:[[120],[120,127],[120,123]],
  12:[[121],[17,123],[20,18]],24:[[121],[73,125],[83,37]],34:[[122],[81,130],[82,84]],42:[[121],[13,128],[15,19]],54:[[124],[74],[40,97]],62:[[131],[12,123],[20,19]],82:[[134],[100,132],[91,92,93,97]],84:[[121],[17,123],[99,134]]
 });
 Object.assign(PROFILES,{14:[[121],[17],[17]],11:[[107],[102,108],[102,109]],12:[[121],[17,123],[20,18]],13:[[85],[112],[112]]});
 const DEFAULTS=[[[71],[79],[58]],[[55],[17],[56]],[[16],[73],[18]],[[5],[1],[67]],[[14],[13],[15]],[[72],[74],[75]],[[64],[65],[69]],[[52],[51],[53]],[[18],[100],[93]],[[37],[35],[38]]];
 const HEROES=[[[58],[85],[57]],[[11],[12],[20]],[[24],[22],[23]],[[55],[89],[56]],[[2],[1],[8]]];
 const ENEMY_PROFILES={shadow:[[71],[76],[75]],guard:[[74],[17],[55]],hunter:[[16],[73],[97]],runner:[[72],[74],[80]],brood:[[43],[46],[45]],skyrazor:[[79],[76],[93]],nexusling:[[14],[90],[133]],ravager:[[71],[77],[117]],priest:[[52],[51],[57]],starwyrm:[[4],[6],[8]],basaltor:[[68],[64],[69]],voidlurker:[[33],[35],[39]],riftworm:[[33],[87],[129]],specter:[[113],[86],[88]],obsidian:[[26],[30],[89]],vulkanus:[[2],[1],[10]],aerion:[[131],[12],[20]],kronos:[[99],[17],[32]],leviathan:[[95],[96],[98]],tyrant:[[130],[114],[132]],umbra:[[124],[87],[36]],astraea:[[85],[81],[111]]};
 const ENEMIES={fire:[[2],[1,6],[4,8]],frost:[[24],[22],[23,30]],storm:[[11],[13],[19,20]],tide:[[95],[96],[98]],poison:[[43],[46],[41,49]],void:[[33],[35],[34,87]],default:[[77],[79],[39,40]]};
 const get=id=>Number.isInteger(id)&&id>=1&&id<=EFFECTS.length?EFFECTS[id-1]:null;
 function profile(u){if(u?.hero>=0)return HEROES[u.hero]||HEROES[0];if(u?.cosmeticSkin>0&&Skins?.get(u.cosmeticSkin)?.type===u.type)return PROFILES[u.cosmeticSkin]||DEFAULTS[u.type]||DEFAULTS[0];if(u?.hero===undefined){if(ENEMY_PROFILES[u?.skin])return ENEMY_PROFILES[u.skin];const key=String(u?.skin||'')+' '+String(u?.role||'')+' '+String(u?.affinity||'');return ENEMIES[/fire|inferno|ember|lava/.test(key)?'fire':/frost|ice|winter/.test(key)?'frost':/storm|tesla|volt/.test(key)?'storm':/tide|leviathan|water/.test(key)?'tide':/poison|toxic|venom/.test(key)?'poison':/void|shadow|specter/.test(key)?'void':'default'];}return DEFAULTS[u?.type]||DEFAULTS[0];}
 function choose(u,kind,serial=0){const p=profile(u),pool=kind==='heal'&&u?.type!==7?[51,54,59,60]:p[kind==='shot'?0:kind==='impact'||kind==='death'?1:2];return pool[Math.abs(Math.floor(serial))%pool.length];}
 function frameIndex(now,start,kind='impact',loop=false){const n=CLIPS[kind]?.frames||6,i=Math.floor(Math.max(0,now-start)/FRAME_MS);return loop?i%n:Math.min(n-1,i);}
 // Playback only: all six phases are independently authored transparent PNG pixels.
 const images=new Map();
 function image(src){let e=images.get(src);if(!e&&typeof Image!=='undefined'){const im=new Image();e={im,promise:new Promise(resolve=>{im.onload=()=>resolve(true);im.onerror=()=>resolve(false);})};images.set(src,e);im.src=src;while(images.size>MAX_IMAGES){const key=images.keys().next().value;images.delete(key);}}if(e){images.delete(src);images.set(src,e);}return e;}
 async function ready(id=1){const e=get(id),entry=e&&image(e.src);return entry?entry.promise:false;}
 function paintEffect(c,id,x,y,size,now,start=0,loop=false,angle=0,opacity=1){const effect=get(id);if(!effect)return false;const entry=image(effect.src),im=entry?.im;if(!im?.complete||!im.naturalWidth)return false;const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,i=reduced?2:frameIndex(now,start,'impact',loop),f=effect.frames[i],[sx,sy,sw,sh]=f.rect,[ox,oy]=f.offset,scale=size/effect.referenceSize;c.save();c.translate(x,y);c.rotate(angle);c.imageSmoothingEnabled=false;c.globalAlpha*=opacity;c.drawImage(im,sx,sy,sw,sh,(ox-data.anchor[0])*scale,(oy-data.anchor[1])*scale,sw*scale,sh*scale);c.restore();return true;}
 function compose(id,index){const effect=get(id),im=effect&&image(effect.src)?.im;if(!im?.complete||!im.naturalWidth)return null;const [w,h]=data.canvas,cv=typeof OffscreenCanvas==='function'?new OffscreenCanvas(w,h):typeof document!=='undefined'?document.createElement('canvas'):null;if(!cv)return null;cv.width=w;cv.height=h;const f=effect.frames[Math.max(0,Math.min(5,index))];cv.getContext('2d').drawImage(im,...f.rect,...f.offset,f.rect[2],f.rect[3]);return cv;}
 function picture(id,kind,index){return compose(id,index);}
 function emit(r,u,kind,x,z,options={}){if(!Number.isFinite(r.elapsed)||!Number.isFinite(x)||!Number.isFinite(z)||!CLIPS[kind])return null;r.vfx??=[];r.vfx=r.vfx.filter(e=>e.end>r.elapsed);const serial=r.combatVfxSerial=(r.combatVfxSerial||0)+1,e={family:0,combatEffect:choose(u,kind,(u?.attackCount||0)+serial),kind,x,z,start:r.elapsed,end:r.elapsed+CLIPS[kind].frames*FRAME_MS,size:(options.size||(kind==='death'?90:kind==='magic'?100:kind==='heal'?75:kind==='shot'?42:65))*(u?.type===1&&u.hero<0?({14:.45,11:.5,12:.5,13:.6}[u.cosmeticSkin]??1):1),ground:!!options.ground,follow:options.follow||0,anchor:options.anchor||'',face:u?.face||1};r.vfx.push(e);const own=r.vfx.filter(f=>f.combatEffect);if(own.length>MAX_EVENTS){const remove=new Set(own.slice(0,own.length-MAX_EVENTS));r.vfx=r.vfx.filter(f=>!remove.has(f));}if(r.vfx.length>80)r.vfx.splice(0,r.vfx.length-80);return e;}
 function impact(r,t,source,before){if(!t||!(before>t.hp)||t.pvpProxy)return;if(t.hp>0&&r.elapsed-(t.combatHitAt??-1000)<100)return;t.combatHitAt=r.elapsed;emit(r,t.hp<=0?t:source||t,t.hp<=0?'death':'impact',t.x,t.z,{size:t.boss?130:source?.type===3||source?.type===6?85:58});}
 function draw(c,r,project,width,unitPoint=null){const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,scale=Math.min(1.2,Math.max(.65,width/700));let budget=44;const paint=(id,kind,x,y,size,angle=0,start=0,loop=false)=>{if(x+size<0||x-size>width||--budget<0||!get(id)||!CLIPS[kind]||!Number.isFinite(size))return;const index=reduced?Math.floor(CLIPS[kind].frames/2):frameIndex(r.elapsed,start,kind,loop),s=Math.max(8,Math.min(180,size))*scale;paintEffect(c,id,x,y,s,r.elapsed,start,loop,angle);};
  for(const e of (r.vfx||[]).filter(e=>e.combatEffect&&e.start<=r.elapsed&&e.end>r.elapsed).slice(-MAX_EVENTS)){const u=e.follow&&[...r.troops,...r.enemies].find(t=>t.id===e.follow&&t.hp>0);if(e.follow&&!u)continue;let q=u&&unitPoint?unitPoint(u):project(e.x,e.z);if(e.anchor==='muzzle'&&u){if(globalThis.StarGuardianArt?.supports(u.cosmeticSkin))continue;if(u.type===4)q=globalThis.StarStormArt?.fusionMuzzleAnchor(u,q,r.elapsed)||{x:q.x+(u.face||1)*12,y:q.y-20};else q={x:q.x+(u.face||1)*(u.type===2?16:8),y:q.y-21};}else q={x:q.x,y:q.y-(e.ground?0:20)};paint(e.combatEffect,e.kind,q.x,q.y,e.size,e.kind==='shot'&&e.face<0?Math.PI:0,e.start);}
  for(const b of [...(r.projectiles||[]),...(r.rockets||[])].slice(-16)){const source=b.combatVisual||b.source||{hero:-1,type:b.type||3};const q=project(b.x,b.z),from=project(b.fromX??b.x,b.fromZ??b.z);paint(choose(source,'shot',source.attackCount||0),'shot',q.x,q.y-17,30,Math.atan2(q.y-from.y,q.x-from.x),0,true);}
  for(const b of (r.shots||[]).slice(-12)){if(b.type===3)continue;const a=project(b.x,b.z),to=project(b.toX,b.toZ),progress=Math.min(1,(1-b.life/b.max)*1.8),source=b.combatVisual||{hero:-1,type:b.type};paint(choose(source,'shot'),'shot',a.x+(to.x-a.x)*progress,a.y-20+(to.y-a.y)*progress,32,Math.atan2(to.y-a.y,to.x-a.x),r.elapsed-(b.max-b.life));}
  for(const f of (r.fx||[]).slice(-8)){const q=project(f.x,f.z);paint(f.color==='#ff9955'?1:17,'impact',q.x,q.y-18,Math.max(40,Math.min(110,f.r*width)),0,r.elapsed-(f.max-f.life));}

 }
 function drawLayer(layer,c,r,p,width=c.canvas?.clientWidth||700){let budget=24;const now=r.elapsed,units=[...(r.troops||[]),...(r.enemies||[])],source=f=>units.find(t=>t.id===f.source)||{hero:-1,type:f.type??7,cosmeticSkin:f.cosmeticSkin||0};
  const paint=(id,f,size,loop=false,offset=0)=>{const age=now-f.start;if(age<0||now>=(f.end??f.start+(f.duration||300)))return;const q=p(f.x,f.z);if(q.x+size<0||q.x-size>width||--budget<0)return;paintEffect(c,id,q.x,q.y+offset,size,now,f.start,loop);};
  if(layer==='heal-ground')for(const f of r.healingZones||[])paint(choose(source(f),'magic'),f,Math.min(260,f.radius*width*2),true);
  if(layer==='heal-orb')for(const f of r.healingProjectiles||[]){const t=Math.max(0,Math.min(1,(now-f.start)/f.duration)),a=p(f.fromX,f.fromZ),b=p(f.x,f.z),height=20+Math.abs(b.x-a.x)*.22;paintEffect(c,choose(source(f),'shot'),a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-24*(1-t)-Math.sin(t*Math.PI)*height,38,now,f.start,true);}
  if(layer==='hammer')for(const f of r.hammerWaves||[])paint(choose(source({...f,type:6}),'impact'),f,Math.min(240,f.radius*width*2));
  if(layer==='drone-boom')for(const f of r.droneExplosions||[])paint(choose(source(f),'impact'),f,86);
  if(layer==='dimension-burst')for(const f of r.dimensionBursts||[])paint(choose(source({...f,type:9}),'magic'),f,125);
  if(layer==='hero')for(const f of r.heroFx||[]){paint(choose({hero:f.hero},'magic'),f,f.ultimate?140:105);for(const t of f.targets||[])paint(choose({hero:f.hero},'impact'),{...f,x:t.x,z:t.z},75);}
  if(layer==='melee')for(const f of r.meleeWaves||[])paint(f.cosmeticSkin?choose(source(f),'shot'):f.weapon===1?124:71,f,f.wave?100:60);
  if(layer==='threats')for(const f of r.hazards||[]){if(f.life<=0)continue;const owner=units.find(t=>t.id===f.source);if(f.boss500||owner?.apex||owner?.apexOwner){globalThis.StarBoss500?.drawHazard?.(c,r,f,p);continue;}const caster=owner||{skin:f.skin},id=choose(caster,f.done?'impact':'magic'),start=f.done?f.until:f.start,end=f.until+(f.effectDuration||850),q={...f,x:f.done?(f.impactX??f.x):f.x,z:f.done?(f.impactZ??f.z):f.z,start,end};paint(id,q,Math.min(200,Math.max(65,(f.r||.1)*width*2)),!f.done);}

 }
 function install(Round){const p=Round.prototype;if(p.combatVfxInstalled)return;p.combatVfxInstalled=true;const wrap=(key,f)=>{const old=p[key];if(old)p[key]=function(...args){return f.call(this,old,...args);};};
  const visuals=r=>{for(const b of [...r.projectiles,...r.rockets])if(b.source&&!b.combatVisual){const t=b.source;b.combatVisual={type:t.type,hero:t.hero,cosmeticSkin:t.cosmeticSkin,skin:t.skin,role:t.role,affinity:t.affinity,attackCount:t.attackCount};}};
  wrap('step',function(old,...args){const result=old.apply(this,args);visuals(this);return result;});
  wrap('spawnLegion',function(old,...args){const e=old.apply(this,args);if(e)for(const id of profile(e).flat())ready(id);return e;});
  wrap('setEquipment',function(old,...args){const result=old.apply(this,args);for(const [type,id]of Object.entries(this.equipment?.skins||args[0]?.skins||{}))for(const effect of profile({hero:-1,type:+type,cosmeticSkin:+id}).flat())ready(effect);return result;});
  wrap('strike',function(old,t,e){const count=t.attackCount||0,rockets=new Set(this.rockets),shots=new Set(this.shots),result=old.call(this,t,e);if((t.attackCount||0)>count){emit(this,t,'shot',t.x,t.z,{follow:t.id,anchor:'muzzle',size:t.type===3?55:40});for(const shot of this.shots)if(!shots.has(shot))shot.combatVisual={type:t.type,hero:t.hero,cosmeticSkin:t.cosmeticSkin};for(const rocket of this.rockets)if(!rockets.has(rocket))rocket.combatVisual={id:t.id,type:t.type,hero:t.hero,cosmeticSkin:t.cosmeticSkin,attackCount:t.attackCount};}return result;});
  wrap('hit',function(old,e,...args){const before=e?.hp,result=old.call(this,e,...args),source=args[3]||this.rockets.find(b=>b.life<=0&&b.combatVisual&&e&&Math.hypot((b.x-e.x)*.45,b.z-e.z)<(b.blast||.12)+.05)?.combatVisual;impact(this,e,source,before);return result;});
  wrap('wound',function(old,t,n,source,...args){const before=t?.hp,result=old.call(this,t,n,source,...args);impact(this,t,source,before);return result;});
  wrap('summon',function(old,...args){const id=this.id,result=old.apply(this,args);for(const t of this.troops)if(t.id>id)emit(this,t,'magic',t.x,t.z,{ground:true,follow:t.id,size:80});return result;});
  wrap('materializeHeroes',function(old,...args){const before=new Set(this.troops.map(t=>t.id)),result=old.apply(this,args);for(const t of this.troops)if(t.hero>=0&&!before.has(t.id))emit(this,t,'magic',t.x,t.z,{ground:true,follow:t.id,size:120});return result;});
  wrap('heroVisual',function(old,t,...args){const result=old.call(this,t,...args);emit(this,t,'magic',t.x,t.z,{size:115});return result;});
  wrap('castHeal',function(old,t,group){const result=old.call(this,t,group);if(result){emit(this,t,'shot',t.x,t.z,{size:55});emit(this,t,'heal',group.x,group.z,{ground:true,size:85});}return result;});
  wrap('restoreHealth',function(old,t,n){const result=old.call(this,t,n);if(result>0&&this.elapsed-(t.combatHealAt??-1000)>=600){emit(this,t,'heal',t.x,t.z,{size:50});t.combatHealAt=this.elapsed;}return result;});
  wrap('launchDrone',function(old,t,targets){const result=old.call(this,t,targets);if(result){emit(this,t,'magic',t.x,t.z,{size:70});for(const target of targets.slice(0,3))emit(this,t,'magic',target.x,target.z,{ground:true,size:60});}return result;});
  wrap('openDimension',function(old,t){const result=old.call(this,t);if(result){const field=this.dimensionFields.find(f=>f.source===t.id);if(field)emit(this,t,'magic',field.x,field.z,{ground:true,size:120});}return result;});
  wrap('enemyAttack',function(old,e,t){const active=e?.hp>0&&!this.isDimensionHeld(e),shots=new Set(this.shots),projectiles=new Set(this.projectiles),result=old.call(this,e,t);if(!active)return result;const visual={skin:e.skin,type:e.type,role:e.role,affinity:e.affinity,attackCount:e.attackCount};for(const shot of this.shots)if(!shots.has(shot))shot.combatVisual={...visual};for(const b of this.projectiles)if(!projectiles.has(b))b.combatVisual={...visual};if(!e.apex&&!e.apexOwner)emit(this,e,'shot',e.x,e.z,{size:e.boss?70:40});return result;});

 }
 ready(1);ready(21);ready(121);
 return {EFFECTS,PROFILES,ENEMY_PROFILES,DEFAULTS,CLIPS,FPS,FRAME_MS,MAX_EVENTS,MAX_IMAGES,get,profile,choose,frameIndex,compose,picture,ready,paintEffect,drawLayer,emit,draw,install,images};
});
