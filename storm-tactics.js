'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarTactics=api;})(globalThis,()=>{
 const ABILITIES={
 shadow:{name:'Duellhieb',role:'Frontduellant',style:'duel',color:'#ff567d',cooldown:10000,delay:1100,targets:1,power:1.15,counter:'Schildfront hält den markierten Hieb ab.'},
 guard:{name:'Deckungsformation',role:'Leibwächter',style:'brace',color:'#bc9bff',cooldown:11000,delay:1100,targets:0,counter:'Beschützt höchstens zwei Begleiter. Den Wächter mit Sniper/Plasma ausschalten.'},
 hunter:{name:'Visierschuss',role:'Präzisionsjäger',style:'snipe',color:'#ff709d',cooldown:10500,delay:1550,targets:1,power:1.5,counter:'Die rote Ziellinie kündigt den Schuss an. Ein Schild fängt ihn ab.'},
 runner:{name:'Flankenjagd',role:'Flankierer',style:'leap',color:'#d994ff',cooldown:10500,delay:1350,targets:1,power:1.2,counter:'Sucht ungeschützte Fernkämpfer. Eine zweite Front schützt sie.'},
 brood:{name:'Schildfraß',role:'Rüstungssaboteur',style:'pack',color:'#ff69b8',cooldown:12000,delay:1100,targets:1,power:1,counter:'Verletzt Standschilde stärker, ist aber sehr anfällig für Flächenschaden.'},
 skyrazor:{name:'Abfangsturz',role:'Fliegender Abfangjäger',style:'dive',color:'#c9a9ff',cooldown:12000,delay:1450,targets:1,power:1.3,counter:'Der markierte Sturzflug lässt ihn kurz verwundbar zurück. Sniper kontern.'},
 nexusling:{name:'Instabiler Kern',role:'Aufladender Sprengläufer',style:'reactor',color:'#ff4fba',cooldown:13000,delay:2000,targets:2,power:1.8,counter:'Den pulsierenden Kern während der Aufladung zerstören: dann entfällt die Explosion.'},
 ravager:{name:'Herausforderung',role:'Frontbrecher',style:'duel',color:'#ff4f70',cooldown:9500,delay:1450,targets:1,power:1.85,counter:'Markiert den stärksten Frontkämpfer. Schild + Fernfeuer beantworten den Einzelhieb.'},
 priest:{name:'Seelenpakt',role:'Ritualbeschwörer',style:'ritual',color:'#dc87ff',cooldown:12500,delay:1850,targets:0,counter:'Der Ritus heilt einen Begleiter und ruft höchstens zwei Bruten. Den Priester fokussieren.'},
 starwyrm:{name:'Sternenatem',role:'Linienbrecher',style:'breath',color:'#ff74cf',cooldown:10500,delay:1650,targets:2,power:1.35,counter:'Ein sichtbarer Atemkorridor trifft höchstens zwei Truppen. Deckung und verteilte Fernkämpfer helfen.'},
 basaltor:{name:'Tektonischer Bruch',role:'Bollwerkbrecher',style:'quake',color:'#ffbc72',cooldown:11000,delay:1750,targets:2,power:1.45,counter:'Die Bruchlinie erschüttert die Front. Gepflanzte Schilde halten dem Rückstoß stand.'},
 voidlurker:{name:'Jagd aus der Leere',role:'Hinterhaltjäger',style:'ambush',color:'#ca77ff',cooldown:11500,delay:1750,targets:1,power:1.6,counter:'Markiert eine ungeschützte Unterstützung. Nach dem Sprung ist er drei Sekunden verwundbar.'},
 riftworm:{name:'Risswechsel',role:'Portaljäger',style:'rift',color:'#b586ff',cooldown:12000,delay:1850,targets:2,power:1.3,counter:'Ein Ein- und Ausgang verrät den Positionswechsel. Nach dem Auftauchen offen für Gegenangriffe.'},
 specter:{name:'Seelenfrost',role:'Kontrollgeist',style:'frost',color:'#8dedff',cooldown:12000,delay:1700,targets:2,power:1.1,counter:'Bindet zwei schnelle Angreifer kurz mit Frost. Andere Truppen können den Geist weiter treffen.'},
 obsidian:{name:'Splitterschirm',role:'Kristallkonter',style:'crystal',color:'#df9cff',cooldown:12000,delay:2200,targets:2,power:1.25,counter:'Ein begrenzter Kristallschild zerbricht nach dem Ausbruch. Danach nimmt Obsidian mehr Schaden.'},
 vulkanus:{name:'Glutspalten',role:'Gebietskontrolleur',style:'fire',color:'#ff995e',cooldown:12000,delay:1800,targets:2,power:1.25,counter:'Zwei versetzte Glutspalten sind vorgewarnt. Schilde und Heilung begrenzen den Brandschaden.'},
 aerion:{name:'Sturmkrone',role:'Kettenblitzjäger',style:'storm',color:'#9be8ff',cooldown:11500,delay:1750,targets:2,power:1.35,counter:'Ein Blitz springt höchstens einmal weiter. Der Greif ist nach dem Sturz verwundbar.'},
 kronos:{name:'Zeitkerker',role:'Zeitmagier',style:'time',color:'#ffe6a1',cooldown:14500,delay:2000,targets:2,power:1.05,counter:'Hält zwei Ziele kurz an. Kein Dauerstopp; danach öffnet sich ein dreisekündiges Angriffsfenster.'},
 leviathan:{name:'Gezeitenmahl',role:'Strudelkontrolleur',style:'tide',color:'#76eaff',cooldown:12500,delay:2000,targets:3,power:1.2,counter:'Der Strudel zieht höchstens drei Truppen heran. Verankerte Schilde widerstehen dem Sog.'},
 tyrant:{name:'Belagerungssalve',role:'Gezielter Artillerist',style:'missile',color:'#ffbd73',cooldown:13000,delay:1850,targets:2,power:1.65,counter:'Zwei Zielmarken kündigen die Salve an. Deckung bewahrt die Fernkämpfer vor dem Hauptschaden.'},
 umbra:{name:'Spiegelduell',role:'Schattenassassinin',style:'mirror',color:'#d69aff',cooldown:12500,delay:1850,targets:1,power:1.6,counter:'Ruft höchstens zwei kurzlebige Spiegel. Nach dem markierten Angriff ist die echte Umbra verwundbar.'},
 astraea:{name:'Sternentribunal',role:'Lichtinquisitorin',style:'judgment',color:'#fff0b4',cooldown:14000,delay:2100,targets:2,power:1.5,counter:'Zwei Lichtlanzen sind deutlich markiert. Kurzes Schweigen statt kompletter Armeesperre; danach verwundbar.'}
 };
 for(const [id,range]of Object.entries({shadow:.15,guard:.5,hunter:.6,runner:.55,brood:.14,skyrazor:.6,nexusling:.28}))ABILITIES[id].range=range;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot((a.x-b.x)*.45,a.z-b.z);
 const ENDGAME={startWave:300,tierWaves:50,maxTier:15,initialCooldown:18000,minCooldown:9000,minWarning:1400,shieldStartWave:350,gravityStartWave:400};
 function endgameTier(r,e){return e.boss&&r.wave>=ENDGAME.startWave?Math.min(ENDGAME.maxTier,1+Math.floor((r.wave-ENDGAME.startWave)/ENDGAME.tierWaves)):0;}
 function catastrophe(r,e,forced=false){const tier=endgameTier(r,e);if(!tier||r.frozen||e.hp<=0||r.isDimensionHeld(e)||(e.bornUntil||0)>r.elapsed||e.castUntil>r.elapsed)return false;
  const cycle=e.cataclysmCount||0,style=e.apex?['missile','tide','judgment'][cycle%3]:r.wave>=ENDGAME.gravityStartWave&&cycle%2?'tide':'missile',delay=e.apex?2000:Math.max(ENDGAME.minWarning,2000-(tier-1)*60),count=Math.min(4,1+Math.floor((tier-1)/2)+(e.apex?1:0)),selected=targets(r,{...e,skin:style==='tide'?'leviathan':style==='judgment'?'astraea':'tyrant'}).slice(0,count);
  // Use the common target selector, then fill to the escalating target cap without duplicate marks.
  for(const t of r.troops.filter(t=>t.hp>0&&!r.isCloaked(t)).sort((a,b)=>b.max-a.max||a.id-b.id))if(selected.length<count&&!selected.includes(t))selected.push(t);
  const name=e.apex?'Weltenurteil · '+({missile:'Sternenfall',tide:'Gravitationsbruch',judgment:'Lichtgericht'}[style]):style==='tide'?'Kataklysmus · Gravitationssog':'Kataklysmus · Sternensalve';
  e.castCount=(e.castCount||0)+1;e.cataclysmCount=cycle+1;e.castStyle=style;e.castAt=r.elapsed;e.castUntil=r.elapsed+delay;e.abilityName=name;
  selected.forEach((t,i)=>{const h=r.warn(e,t.x,t.z,style==='tide'?.12:.085,style,0,delay+i*120);if(h)Object.assign(h,{tactical:true,boss500:!!e.apex,core500:!!e.apexOwner,targetId:t.id,limit:1,fromX:e.x,fromZ:e.z,color:style==='tide'?'#76eaff':'#fff0b4',ability:name,cast:e.castCount,index:i,total:selected.length,skin:e.skin,effectDuration:850,cataclysm:true,healthFraction:Math.min(.45,.23+tier*.015+(e.apex?.04:0)),pullDistance:.065});});
  r.events.push({kind:'ability',name:e.name+' · '+name});return true;
 }
 function phaseTransition(r,e,L){if(!e.apex)return;e.bossPhaseAt=r.elapsed;const cores=[];for(let i=0;i<e.combatPhase;i++){const core=r.spawnLegion(L.byId.nexusling,{x:clamp(e.x+.18+i*.08,.1,.9),z:Math.min(.86,e.z+.16+i*.14),summoned:true});if(core){core.apexOwner=e.id;core.boss500BornAt=r.elapsed;core.name='Weltenkern';cores.push(core.id);}}e.apexCoreIds=cores;e.apexCoresActive=cores.length>0;e.cataclysmReadyAt=r.elapsed;e.abilityClock=Math.max(e.abilityClock,2500);r.events.push({kind:'ability',name:'Weltenrichterin · '+cores.length+' Weltenkerne schützen sie'});}
 function ability(e){return ABILITIES[e.skin||e.id]||{name:'Energiehieb',style:e.skill||'duel',color:'#dc98ff',cooldown:11000,delay:1600,targets:1,power:1.2,counter:'Deckung hält den Angriff ab.'};}
 function covers(r,g,target){if(g===target||g.hp<=0||g.role!=='guard'||g.z<=target.z||g.z-target.z>=.16||Math.abs(g.x-target.x)>=.3)return false;return r.enemies.filter(e=>e!==g&&e.hp>0&&e.z<g.z&&g.z-e.z<.16&&Math.abs(g.x-e.x)<.3).sort((a,b)=>distance(a,g)-distance(b,g)||a.id-b.id).slice(0,2).includes(target);}
 function targets(r,e){const list=r.troops.filter(t=>t.hp>0&&!r.isCloaked(t)&&!(t.hero<0&&t.type===5&&t.cloaked)&&distance(t,e)<(ability(e).range??.95)),m=ability(e),dps=t=>(t.damage||0)/Math.max(100,t.cooldown||1000)+(t.type>=7? .02:0),front=t=>t.max||1;
 if(['ambush','leap','mirror','snipe'].includes(m.style))list.sort((a,b)=>(b.hero<0?(b.type>=7?2:b.type>=2&&b.type<=4?1:0):0)-(a.hero<0?(a.type>=7?2:a.type>=2&&a.type<=4?1:0):0)||dps(b)-dps(a)||a.hp-b.hp||a.id-b.id);
 else if(['missile','frost','time','judgment'].includes(m.style))list.sort((a,b)=>dps(b)-dps(a)||a.id-b.id);
 else list.sort((a,b)=>a.z-b.z||front(b)-front(a)||a.id-b.id);
 if(e.skin==='ravager'&&list.length){const frontZ=Math.min(...list.map(t=>t.z));list.sort((a,b)=>(b.z<frontZ+.16?b.max:0)-(a.z<frontZ+.16?a.max:0)||a.z-b.z);}
 if(['breath','storm','tide'].includes(m.style)&&list.length>1){const first=list[0],rest=list.slice(1);rest.sort((a,b)=>(m.style==='breath'?Math.abs(a.x-first.x):distance(a,first))-(m.style==='breath'?Math.abs(b.x-first.x):distance(b,first))||a.id-b.id);list.splice(1,list.length-1,...rest);}
 const selected=list.slice(0,m.targets||1);return selected.length?selected:[r.base];}
 function protectedTarget(r,t){if(t===r.base)return t;return r.shields().filter(s=>s.hp>0&&s.z<=t.z&&t.z-s.z<.35&&Math.abs(s.x-t.x)<.25).sort((a,b)=>distance(a,t)-distance(b,t))[0]||t;}
 function cast(r,e,target){if(!target||e.hp<=0||r.isDimensionHeld(e)||(e.bornUntil||0)>r.elapsed||e.castUntil>r.elapsed)return false;const m=ability(e),phase=e.combatPhase||1;e.castCount=(e.castCount||0)+1;e.abilityName=m.name;e.castStyle=m.style;e.castAt=r.elapsed;e.castUntil=r.elapsed+m.delay;e.castTarget=target.id;
 if(m.style==='crystal'||m.style==='brace'){e.abilityShield=e.max*.12;e.shieldUntil=r.elapsed+m.delay+600;}
 if(m.style==='judgment')e.wardUntil=r.elapsed+m.delay;
 const selected=targets(r,e);if(selected[0]&&selected[0]!==r.base){e.focusId=selected[0].id;e.focusUntil=e.castUntil+3500;}const chosen=['ritual','brace'].includes(m.style)?[e]:selected;
 for(let i=0;i<chosen.length;i++){const t=chosen[i],x=m.style==='reactor'?e.x:clamp(t.x+(m.style==='fire'?(i?.08:-.08):0),.05,.95),z=m.style==='reactor'?e.z:t.z,h=r.warn(e,x,z,m.style==='reactor'?.24:m.style==='breath'?.11:m.style==='tide'?.14:m.style==='quake'?.105:.075,m.style,e.damage*(m.power||0)*(1+(phase-1)*.08),m.delay+i*(m.style==='missile'?250:m.style==='storm'?160:0));if(h)Object.assign(h,{tactical:true,boss500:!!e.apex,core500:!!e.apexOwner,targetId:t.id,limit:1,fromX:e.x,fromZ:e.z,color:m.color,ability:m.name,cast:e.castCount,index:i,total:chosen.length,skin:e.skin,effectDuration:850,chainX:i?chosen[i-1].x:e.x,chainZ:i?chosen[i-1].z:e.z,linkIds:m.style==='brace'?r.enemies.filter(a=>covers(r,e,a)).map(a=>a.id):[]} );}
 if(e.boss)r.events.push({kind:'ability',name:e.name+' · '+m.name});return true;
 }
 function control(r,t,kind,duration){if(t===r.base||t.kind==='shield'||r.elapsed<(t.controlSafeUntil||0))return;const length=Math.min(t.hero>=0?650:1400,duration);t[kind]=r.elapsed+length;t.controlSafeUntil=r.elapsed+length+3500;}
 function resolve(r,h,e,L){const m=ability(e),style=h.kind;e.lastCastAt=r.elapsed;e.lastCastStyle=style;e.exposedUntil=r.elapsed+(e.boss?2800:1600);e.castUntil=0;
 if(style==='ritual'){const ally=r.enemies.filter(a=>a!==e&&a.hp>0&&!a.illusion&&a.hp<a.max).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(ally){ally.hp=Math.min(ally.max,ally.hp+Math.min(ally.max*.12,e.max*.12));ally.pactUntil=r.elapsed+1800;h.healedId=ally.id;}for(let i=0;i<1;i++)if(r.enemies.filter(a=>a.hp>0).length<12&&r.enemies.filter(a=>a.hp>0&&a.summoned&&!a.illusion).length<2)r.spawnLegion(L.byId.brood,{x:clamp(e.x+(i?.1:-.1),.1,.9),z:e.z+.03,summoned:true});return;}
 if(style==='brace'){for(const a of r.enemies.filter(a=>a!==e&&a.hp>0).sort((a,b)=>distance(a,e)-distance(b,e)).slice(0,2))a.wardUntil=r.elapsed+1800;return;}
 const marked=h.targetId===r.base.id?r.base:r.friendlyTargets().find(t=>t.id===h.targetId&&t.hp>0&&!r.isCloaked(t));let victims=marked&&distance(marked,h)<h.r+.025?[marked]:[];h.missed=!victims.length;
 if(marked&&['snipe','missile','duel','mirror','ambush','leap'].includes(style))victims=victims.map(t=>protectedTarget(r,t));
 for(const t of victims){const base=t===r.base,limit=base?t.max*.07:t.kind==='shield'?Infinity:t.max*(e.boss?.5:.4),already=t.skillCastSource===e.id&&t.skillCastId===h.cast;if(already)continue;t.skillCastSource=e.id;t.skillCastId=h.cast;h.impactX=t.x;h.impactZ=t.z;h.intercepted=t.id!==h.targetId;const before=t.hp;let damage=h.cataclysm?Math.min(t.max*(base?.06:h.healthFraction),limit):Math.min(h.damage,limit);if(t.kind==='shield'&&['quake','tide','breath'].includes(style))damage*=.65;r.wound(t,damage,e,true);
  if(style==='time')control(r,t,'stunUntil',1200);if(style==='frost'){control(r,t,'slowAttackUntil',1400);t.slowUntil=r.elapsed+1800;}if(style==='judgment')control(r,t,'silenceUntil',1400);
  if(['quake','storm'].includes(style)&&!base&&t.kind!=='shield'&&!(t.type===1&&t.shield?.hp>0))r.knockback(t,0,.025);
  if(style==='tide'&&!base&&t.kind!=='shield'&&!(t.type===1&&t.shield?.hp>0)){r.knockback(t,(h.x-t.x)*.3,-(h.pullDistance||.035));}
  if(['breath','fire'].includes(style)&&!base){t.burnUntil=r.elapsed+1600;t.burnDamage=Math.min(e.damage*.12,t.max*.04);}
  if(style==='duel'&&e.boss&&!base)t.fractureUntil=r.elapsed+1800;
  if(style==='frost')e.hp=Math.min(e.max,e.hp+Math.min(e.max*.02,Math.max(0,before-t.hp)*.4));
 }
 if(['ambush','rift','mirror','leap','dive'].includes(style)&&marked&&marked!==r.base&&Math.max(e.netUntil||0,e.dimensionUntil||0)<=r.elapsed){e.x=clamp(h.x,.08,.92);e.z=clamp(Math.min(e.z+.16,h.z-.055),.03,.88);e.vx=e.vz=0;}
 if(style==='mirror'&&h.index===0){for(let i=0;i<2;i++)if(r.enemies.filter(a=>a.hp>0).length<12&&r.enemies.filter(a=>a.hp>0&&a.illusion).length<2){const illusion=r.spawnLegion(L.byId.shadow,{x:clamp(e.x+(i?-.14:.14),.1,.9),z:e.z,summoned:true,illusion:true});if(illusion){illusion.expiresAt=r.elapsed+5500;illusion.reward=0;illusion.stars=0;illusion.damage*=.35;}}}
 if(style==='crystal'){e.abilityShield=0;e.shieldUntil=0;e.exposedUntil=r.elapsed+3500;}
 if(style==='reactor'&&h.index===h.total-1){e.detonated=true;r.hit(e,e.max*2,-1,true);}
 }
 function step(r,dt){for(const e of r.enemies){if(e.hp<=0)continue;if(e.expiresAt&&r.elapsed>=e.expiresAt){e.hp=0;continue;}if(e.shieldUntil<=r.elapsed)e.abilityShield=0;if(e.skin==='nexusling'&&e.hp<e.max*.5&&e.castCount===undefined)e.abilityClock=0;
 const tier=endgameTier(r,e);if(!tier||r.isDimensionHeld(e))continue;
 if(e.apexCoresActive&&!r.enemies.some(a=>e.apexCoreIds.includes(a.id)&&a.hp>0)){e.apexCoresActive=false;e.coresBrokenAt=r.elapsed;e.exposureAt=r.elapsed;e.exposedUntil=r.elapsed+5000;r.events.push({kind:'ability',name:'Weltenkerne zerstört · 5 Sekunden verwundbar'});}
 e.cataclysmReadyAt??=r.elapsed+7000;if(r.elapsed>=e.cataclysmReadyAt&&catastrophe(r,e))e.cataclysmReadyAt=r.elapsed+Math.max(ENDGAME.minCooldown,ENDGAME.initialCooldown-(tier-1)*700)/(e.apex?1+(e.combatPhase-1)*.12:1);
 if(r.wave>=ENDGAME.shieldStartWave){e.starShieldReadyAt??=r.elapsed+12000;if(r.elapsed>=e.starShieldReadyAt&&!(e.exposedUntil>r.elapsed)){e.abilityShield=e.max*Math.min(.18,.06+tier*.01);e.shieldUntil=r.elapsed+4500;e.starShieldAt=r.elapsed;e.starShieldReadyAt=r.elapsed+Math.max(14000,24000-tier*600);r.events.push({kind:'ability',name:e.name+' · Sternenpanzer für 4,5 Sekunden'});}if(e.starShieldWasActive&&e.shieldUntil<=r.elapsed){e.starShieldBrokenAt=r.elapsed;e.exposureAt=r.elapsed;e.exposedUntil=Math.max(e.exposedUntil||0,r.elapsed+3000);}e.starShieldWasActive=e.shieldUntil>r.elapsed&&e.abilityShield>0;}
}}
 function hit(r,e,damage,pure){if(pure)return damage;if(e.apexCoresActive&&r.enemies.some(a=>e.apexCoreIds.includes(a.id)&&a.hp>0))damage*=.65;if(e.exposedUntil>r.elapsed)damage*=1.18;if(e.abilityShield>0&&e.shieldUntil>r.elapsed){const block=Math.min(e.abilityShield,damage);e.abilityShield-=block;damage-=block;if(e.abilityShield<=0){e.starShieldBrokenAt=r.elapsed;e.exposureAt=r.elapsed;e.exposedUntil=r.elapsed+2800;}}return damage;}
 return {ENDGAME,endgameTier,catastrophe,phaseTransition,ABILITIES,ability,targets,covers,cast,resolve,control,step,hit};
});
