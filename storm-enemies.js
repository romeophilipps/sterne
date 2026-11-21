'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarLegion=api;})(globalThis,()=>{
 const regular=[
 {id:'shadow',name:'Schattenkrieger',type:0,sheet:0,row:0,unlock:1,hp:6,damage:2,range:.055,speed:.023,cooldown:1100,stars:0,role:'melee',weak:[1.3,.9,1,1.3,1.2]},
 {id:'guard',name:'Kolosswächter',type:1,sheet:0,row:1,unlock:2,hp:26,damage:1.3,range:.06,speed:.018,cooldown:1600,stars:1,role:'guard',weak:[.75,.8,1.65,1.25,1.5]},
 {id:'hunter',name:'Schattenjäger',type:2,sheet:0,row:2,unlock:3,hp:10,damage:3.6,range:.34,speed:.018,cooldown:3300,stars:0,role:'ranged',weak:[1.5,1,1.3,1.25,1.1]},
 {id:'runner',name:'Schattenläufer',type:3,sheet:0,row:3,unlock:4,hp:8,damage:2,range:.055,speed:.037,cooldown:1200,stars:0,role:'pounce',weak:[1.4,1.3,.8,1.35,1.4]},
 {id:'brood',name:'Schattenbrut',type:0,sheet:0,row:4,unlock:2,hp:3.6,damage:0.9,range:.04,speed:.027,cooldown:850,stars:0,role:'swarm',weak:[1.1,.9,.7,1.7,1.6]},
 {id:'skyrazor',name:'Himmelsatze',type:3,sheet:0,row:5,unlock:6,hp:12,damage:2.3,range:.11,speed:.031,cooldown:1800,stars:1,role:'dive',flying:true,weak:[.8,1,1.6,1.2,1.5]},
 {id:'nexusling',name:'Nexusbrut',type:4,sheet:0,row:6,unlock:8,hp:18,damage:2.4,range:.22,speed:.019,cooldown:2200,stars:1,role:'reactor',weak:[1.15,.9,1.6,1.25,1.1]}
 ];
 const elite=[
 {id:'ravager',name:'Schattenravager',sheet:0,row:7,type:0,role:'slam',hp:35,damage:2.8,range:.09,speed:.021,stars:3,weak:[1.1,.8,1.45,1.15,1.4],skill:'shock',hint:'Schilde + Sniper oder Plasma + Nahkampf'},
 {id:'priest',name:'Voidpriester',sheet:1,row:0,type:4,role:'summoner',hp:30,damage:1.6,range:.3,speed:.018,stars:3,weak:[1.5,.9,1.45,1.3,1],skill:'summon',hint:'Beschworene Brut mit Fläche, Priester mit Rekruten/Snipern'},
 {id:'starwyrm',name:'Sternenwyrm',sheet:1,row:1,type:3,role:'dragon',hp:38,damage:2,range:.2,speed:.024,stars:3,flying:true,weak:[.85,1,1.55,1.25,1.4],skill:'breath',hint:'Sniper hinter Schilden oder Plasma + Raketen'}
 ];
 const mid=[
 {id:'basaltor',name:'Basaltor',sheet:1,row:2,type:1,hp:80,damage:3,range:.09,speed:.014,stars:5,weak:[.75,.85,1.65,1.35,1.5],skill:'quake',hint:'Rüstung brechen: Sniper/Plasma, Front mit Schilden halten'},
 {id:'voidlurker',name:'Voidlurker',sheet:1,row:3,type:3,hp:65,damage:2.5,range:.08,speed:.027,stars:5,weak:[1.5,1.25,.8,1.3,1.35],skill:'pounce',hint:'Schilde + Fläche oder Rekruten mit Volt/Polaris'},
 {id:'riftworm',name:'Riftwurm',sheet:1,row:4,type:3,hp:85,damage:2.6,range:.15,speed:.022,stars:5,weak:[1.25,.8,1.4,1.5,1.1],skill:'rift',hint:'Risse umgehen; Raketen oder geschützte Sniper'},
 {id:'specter',name:'Specter',sheet:1,row:5,type:4,hp:65,damage:2.3,range:.3,speed:.018,stars:5,weak:[1.4,.9,1.35,1.1,1.5],skill:'frost',hint:'Fernwaffen verteilen; Solaris oder Phönix helfen gegen Frost'},
 {id:'obsidian',name:'Obsidian',sheet:1,row:6,type:1,hp:95,damage:2.6,range:.19,speed:.013,stars:5,weak:[.8,.8,1.5,1.4,1.6],skill:'crystals',hint:'Kristallpanzer: Plasma + Schutz oder Sniper + Raketen'},
 {id:'vulkanus',name:'Vulkanus',sheet:1,row:7,type:0,hp:85,damage:3,range:.12,speed:.018,stars:5,weak:[1.1,.9,1.5,1.35,1.1],skill:'fire',hint:'Abstand und Deckung: Sniper/Raketen; Aegis schützt die Front'},
 {id:'aerion',name:'Aerion',sheet:2,row:0,type:3,hp:75,damage:2.5,range:.24,speed:.027,stars:5,flying:true,weak:[.85,1,1.6,1.2,1.5],skill:'storm',hint:'Sniper/Plasma mit Schilden oder Polaris + Raketen'}
 ];
 const major=[
 {id:'kronos',name:'Kronos',title:'Zeitwächter',sheet:2,row:1,type:4,hp:220,damage:3,range:.3,speed:.017,stars:9,weak:[1.3,.85,1.35,1.1,1.35],heroes:[1.3,1.35,1,1,1.2],skill:'time',hint:'Zeitfeld: verteilte Fernkämpfer + Schutz, Volt oder Solaris'},
 {id:'leviathan',name:'Leviathan',title:'Tiefenrufer',sheet:2,row:2,type:3,hp:250,damage:3.3,range:.23,speed:.017,stars:9,weak:[1.2,1,1.45,1.4,1.1],heroes:[1.1,1.25,1.3,1,1],skill:'tide',hint:'Strudel: Schilde mit Snipern/Raketen; Polaris oder Volt'},
 {id:'tyrant',name:'Tyrant',title:'Eisenlegion',sheet:2,row:3,type:1,hp:310,damage:4,range:.17,speed:.012,stars:9,weak:[.7,.8,1.7,1.4,1.65],heroes:[1.1,1,1.2,1.3,1.25],skill:'barrage',hint:'Schwerer Panzer: Sniper/Plasma + Deckung; Aegis oder Phönix'},
 {id:'umbra',name:'Umbra',title:'Schattenklinge',sheet:2,row:4,type:0,hp:200,damage:3.3,range:.12,speed:.027,stars:9,weak:[1.4,1.1,.85,1.5,1.5],heroes:[1.3,1.3,1.35,1,1.2],skill:'blink',hint:'Illusionen mit Fläche, Front mit Rekruten/Schutz halten'},
 {id:'astraea',name:'Astraea',title:'Sternenrichterin',sheet:2,row:5,type:4,hp:240,damage:3,range:.34,speed:.018,stars:9,weak:[1.4,.85,1.45,1.3,1],heroes:[1.2,1.3,1.1,1.2,1.3],skill:'judgment',hint:'Lichtwall mit Rekruten/Snipern brechen; mehrere Helden helfen'}
 ];
 for(const [group,list]of Object.entries({regular,elite,mid,major}))for(const e of list){e.group=group;e.cooldown??=group==='major'?2300:1900;e.role??='boss';}
 const all=[...regular,...elite,...mid,...major],byId=Object.fromEntries(all.map(e=>[e.id,e]));
 function unlocked(wave){return regular.filter(e=>e.unlock<=wave);}
 // A scheduled intermediate encounter at5/15/25... and a major at10/20/30...
 const MAJOR_ORDER=['umbra','leviathan','tyrant','astraea','kronos'];
 const ENCOUNTERS=Object.freeze({firstWave:5,interval:5,majorInterval:10,firstMidHp:300,firstMidDamage:5,majorHp:1000,majorDamage:14,hpGrowth:1.38,damageGrowth:1.24,lateAfterWave:100,lateHpGrowth:1.20,lateDamageGrowth:1.12,lateMidHpFactor:1.05,lateMidDamageFactor:1.05,midHpFactor:1.10,midDamageFactor:1.10,cooldown:1700,maxGrowthExponent:160});
 function majorBudget(wave){const n=Math.max(0,wave/10-1),exponent=Math.min(ENCOUNTERS.maxGrowthExponent,n),beyond=1+Math.max(0,n-exponent)*.01;return {hp:ENCOUNTERS.majorHp*ENCOUNTERS.hpGrowth**Math.min(exponent,9)*ENCOUNTERS.lateHpGrowth**Math.max(0,exponent-9)*beyond,damage:ENCOUNTERS.majorDamage*ENCOUNTERS.damageGrowth**Math.min(exponent,9)*ENCOUNTERS.lateDamageGrowth**Math.max(0,exponent-9)*beyond};}
 function bossBudget(wave){if(!Number.isSafeInteger(wave)||wave<ENCOUNTERS.firstWave||wave%ENCOUNTERS.interval)return null;if(wave===5)return {hp:ENCOUNTERS.firstMidHp,damage:ENCOUNTERS.firstMidDamage};const major=wave%10===0,late=wave>ENCOUNTERS.lateAfterWave,prior=majorBudget(major?wave:wave-5);return {hp:prior.hp*(major?1:late?ENCOUNTERS.lateMidHpFactor:ENCOUNTERS.midHpFactor)*(wave>=500?2.25:1),damage:prior.damage*(major?1:late?ENCOUNTERS.lateMidDamageFactor:ENCOUNTERS.midDamageFactor)*(wave>=500?1.15:1)};}
 function encounterPlan(wave){const budget=bossBudget(wave);if(!budget)return [];const main=wave%10===0,slot=main?wave/10-1:(wave-5)/10,pool=[...elite,...mid],template=main?byId[MAJOR_ORDER[slot%MAJOR_ORDER.length]]:pool[slot%pool.length],apex=wave===500,info=apex?{...byId.astraea,name:'Die Weltenrichterin',apex:true,hint:'Drei Phasen: Salven, Gravitationssog und Sternentribunal. Zerstöre ihre Nexuskerne, um den Schutz zu brechen.'}:{...template},power=bossScaling(wave,info.group);return [{...info,hp:budget.hp/(power.hp*(apex?2.25:1)),damage:budget.damage/(power.damage*(apex?1.15:1)),cooldown:ENCOUNTERS.cooldown}];}
 function encounter(wave){return encounterPlan(wave)[0]||null;}
 function isSwarmWave(wave){return Number.isSafeInteger(wave)&&wave>=9&&wave%10===9;}

 // Difficulty depends on completed progression, never time spent waiting or arena currency.
 // Waves1–9 stay unchanged; additional pressure starts at10 and grows to a moderate late-game bonus.
 const BALANCE=Object.freeze({rampAfterWave:12,pressureFromWave:15,pressureRampWaves:30,extraHpStart:.40,extraHpEnd:.70,extraDamageStart:.30,extraDamageEnd:.50,extraSpeedStart:.20,extraSpeedEnd:.40,extraTempoStart:.15,extraTempoEnd:.30,regularHpBase:2.25,regularHpPerWave:.035,regularDamageBase:1.1,regularDamagePerWave:.01,bossHpBase:2.4,bossHpPerWave:.055,bossDamageBase:1.15,bossDamagePerWave:.018,hpRamp:.025,hpAcceleration:.0009,bossHpRamp:.02,bossHpAcceleration:.0006,damageRamp:.018,damageAcceleration:.0003,speedPerWave:.008,maxSpeedBonus:.65,endgameAfterWave:120,hpDoublingWaves:160,damageDoublingWaves:160,maxExponent:40,attackTempoRamp:.004,attackTempoAcceleration:.00004,maxAttackTempoBonus:3,minAttackCooldown:400});
 const waveIndex=wave=>Math.max(0,Math.floor(Math.min(Number.MAX_SAFE_INTEGER,Number.isFinite(wave)?wave:1))-1);
 function pressure(wave,boss=false){const d=Math.max(0,waveIndex(wave)-(BALANCE.rampAfterWave-1));const late=Math.max(0,waveIndex(wave)-(BALANCE.endgameAfterWave-1));return {hp:(1+(boss?BALANCE.bossHpRamp:BALANCE.hpRamp)*d+(boss?BALANCE.bossHpAcceleration:BALANCE.hpAcceleration)*d*d)*2**Math.min(BALANCE.maxExponent,late/BALANCE.hpDoublingWaves),damage:(1+BALANCE.damageRamp*d+BALANCE.damageAcceleration*d*d)*2**Math.min(BALANCE.maxExponent,late/BALANCE.damageDoublingWaves)};}
 function attackTempo(wave){const d=Math.max(0,waveIndex(wave)-(BALANCE.rampAfterWave-1));return 1+Math.min(BALANCE.maxAttackTempoBonus,BALANCE.attackTempoRamp*d+BALANCE.attackTempoAcceleration*d*d);}
 function bossWaveMultiplier(wave=1){return (BALANCE.bossHpBase+BALANCE.bossHpPerWave*waveIndex(wave))*pressure(wave,true).hp;}
 function bossScaling(wave=1,group='elite'){const n=waveIndex(wave),hpWeight=group==='major'?1.35:group==='mid'?1.15:1,damageWeight=group==='major'?1.1:group==='mid'?1.05:1;return {tempo:attackTempo(wave),hp:bossWaveMultiplier(wave)*hpWeight,damage:(BALANCE.bossDamageBase+BALANCE.bossDamagePerWave*n)*damageWeight*pressure(wave,true).damage};}
 function scaling(wave=1,elapsed=0,tier=0){const n=waveIndex(wave),p=pressure(wave),early=wave<10?0:Math.min(1,(wave-9)/21),ramp=Math.min(1,Math.max(0,wave-BALANCE.pressureFromWave)/BALANCE.pressureRampWaves),extra=(start,end)=>wave<BALANCE.pressureFromWave?1:1+start+(end-start)*ramp;return {tempo:attackTempo(wave)*extra(BALANCE.extraTempoStart,BALANCE.extraTempoEnd),hp:(BALANCE.regularHpBase+BALANCE.regularHpPerWave*n)*p.hp*(wave<10?1:1.1+.2*early)*extra(BALANCE.extraHpStart,BALANCE.extraHpEnd),damage:(BALANCE.regularDamageBase+BALANCE.regularDamagePerWave*n)*p.damage*(wave<10?1:1.05+.15*early)*extra(BALANCE.extraDamageStart,BALANCE.extraDamageEnd),speed:(1+Math.min(BALANCE.maxSpeedBonus,n*BALANCE.speedPerWave))*extra(BALANCE.extraSpeedStart,BALANCE.extraSpeedEnd),rank:1+Math.floor(n/12)};}
 function squad(wave){if(!Number.isSafeInteger(wave)||wave<1)return [];const boss=encounter(wave);let ids;
 if(wave===1)ids=['shadow','shadow','shadow','shadow'];else if(wave===2)ids=['guard','shadow','brood','shadow'];else if(wave===3)ids=['hunter','guard','shadow','shadow'];
 else if(boss){ids=boss.id==='priest'?['guard','brood']:boss.id==='obsidian'?['runner','hunter']:boss.group==='major'?['guard','hunter']:boss.group==='mid'?['guard','hunter','shadow']:['hunter','shadow'];}
 else if(isSwarmWave(wave))ids=wave<19?['brood','brood','runner','hunter']:['brood','brood','runner','hunter','guard','skyrazor'];
 else{const patterns=[['guard','hunter','shadow','runner'],['shadow','brood','runner','shadow'],['hunter','nexusling','guard','brood'],['skyrazor','runner','hunter','shadow'],['guard','hunter','nexusling','runner'],['brood','runner','guard','hunter']];ids=[...patterns[(wave-1)%patterns.length]];if(wave>=20)ids.push(wave%2?'skyrazor':'nexusling');if(wave>=60)ids.push(wave%3?'hunter':'guard');}
 if(wave>=15)ids.push(wave%2?'runner':'hunter');if(wave>=35)ids.push(wave%3?'brood':'guard');
 return ids.map(id=>byId[id].unlock<=wave?byId[id]:byId.shadow);
 }
 function squadName(wave){const boss=encounter(wave);return boss?(wave%10===0?'Bosswelle · ':'Zwischenboss · ')+boss.name:wave===1?'Schattenvorhut':wave===2?'Schild-Eskorte':wave===3?'Geschützte Jäger':isSwarmWave(wave)?'Flankenüberfall':['Geschützte Jäger','Flankenkeil','Kern-Eskorte','Luftüberfall','Panzer-Durchbruch','Sabotagekommando'][(wave-1)%6];}
 const MODIFIERS=[{id:'corrupt',name:'Korruptiert',color:'#ff527e',hp:1,damage:1.3},{id:'frozen',name:'Gefroren',color:'#8bdcff',hp:1.1,damage:1,slow:true},{id:'armored',name:'Verstärkt',color:'#ffd377',hp:1.4,damage:1},{id:'elite',name:'Elite',color:'#ed79ff',hp:1.2,damage:1.15}];
 return {ENCOUNTERS,bossBudget,regular,elite,mid,major,all,byId,unlocked,encounter,encounterPlan,isSwarmWave,MAJOR_ORDER,BALANCE,scaling,bossScaling,bossWaveMultiplier,squad,squadName,MODIFIERS};
});
