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
 {id:'priest',name:'Voidpriester',sheet:1,row:0,type:4,role:'summoner',hp:30,damage:1.6,range:.3,speed:.018,stars:3,weak:[1.5,.9,1.45,1.3,1],skill:'summon',hint:'Beschworene Brut mit Fläche, Priester mit Schwert/Sniper'},
 {id:'starwyrm',name:'Sternenwyrm',sheet:1,row:1,type:3,role:'dragon',hp:38,damage:2,range:.2,speed:.024,stars:3,flying:true,weak:[.85,1,1.55,1.25,1.4],skill:'breath',hint:'Sniper hinter Schilden oder Plasma + Raketen'}
 ];
 const mid=[
 {id:'basaltor',name:'Basaltor',sheet:1,row:2,type:1,hp:80,damage:3,range:.09,speed:.014,stars:5,weak:[.75,.85,1.65,1.35,1.5],skill:'quake',hint:'Rüstung brechen: Sniper/Plasma, Front mit Schilden halten'},
 {id:'voidlurker',name:'Voidlurker',sheet:1,row:3,type:3,hp:65,damage:2.5,range:.08,speed:.027,stars:5,weak:[1.5,1.25,.8,1.3,1.35],skill:'pounce',hint:'Schilde + Fläche oder Schwerter mit Volt/Polaris'},
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
 {id:'umbra',name:'Umbra',title:'Schattenklinge',sheet:2,row:4,type:0,hp:200,damage:3.3,range:.12,speed:.027,stars:9,weak:[1.4,1.1,.85,1.5,1.5],heroes:[1.3,1.3,1.35,1,1.2],skill:'blink',hint:'Illusionen mit Fläche, Front mit Schwertern/Schutz halten'},
 {id:'astraea',name:'Astraea',title:'Sternenrichterin',sheet:2,row:5,type:4,hp:240,damage:3,range:.34,speed:.018,stars:9,weak:[1.4,.85,1.45,1.3,1],heroes:[1.2,1.3,1.1,1.2,1.3],skill:'judgment',hint:'Lichtwall mit Schwertern/Snipern brechen; mehrere Helden helfen'}
 ];
 for(const [group,list]of Object.entries({regular,elite,mid,major}))for(const e of list){e.group=group;e.cooldown??=group==='major'?2300:1900;e.role??='boss';}
 const all=[...regular,...elite,...mid,...major],byId=Object.fromEntries(all.map(e=>[e.id,e]));
 function unlocked(wave){return regular.filter(e=>e.unlock<=wave);}
 // Three introductory minibosses, then seven alternating mid/miniboss pairs per major.
 // Completing a wave requires every planned boss to be defeated, so later stages cannot skip them.
 const MAJOR_ORDER=['umbra','leviathan','tyrant','astraea','kronos'];
 function encounterPlan(wave){if(!Number.isSafeInteger(wave)||wave<4||wave%4!==0)return [];const slot=wave/4-1;if(slot<elite.length)return [elite[slot]];
 const offset=slot-elite.length,stage=Math.floor(offset/15),position=offset%15;
 if(position===14){const leader=byId[MAJOR_ORDER[stage%MAJOR_ORDER.length]],team=[leader];if(stage>=2){team.push(mid[(stage*2)%mid.length],mid[(stage*2+3)%mid.length]);if(stage>=5&&stage%2===0)team.push(elite[stage%elite.length]);}return team;}
 const pair=Math.floor(position/2),leader=position%2===0?mid[pair]:elite[(pair+stage)%elite.length],team=[leader];
 if(stage>=1&&position%2===0&&(pair+stage)%3===0)team.push(elite[(pair+stage)%elite.length],elite[(pair+stage+1)%elite.length]);
 else if(stage>=3&&position%2===1&&(pair+stage)%4===0)team.push(elite[(pair+stage+1)%elite.length]);
 return team;
 }
 function encounter(wave){return encounterPlan(wave)[0]||null;}
 function isSwarmWave(wave){return Number.isSafeInteger(wave)&&wave>=9&&wave%10===9;}

 // One wave-based curve per enemy class. Arena currency and waiting time never multiply combat stats.
 const waveIndex=wave=>Math.max(0,Math.floor(Number.isFinite(wave)?wave:1)-1);
 function bossWaveMultiplier(wave=1){return 2.4+.055*waveIndex(wave);}
 function bossScaling(wave=1,group='elite'){const n=waveIndex(wave),hpWeight=group==='major'?1.35:group==='mid'?1.15:1,damageWeight=group==='major'?1.1:group==='mid'?1.05:1;return {hp:bossWaveMultiplier(wave)*hpWeight,damage:(1.15+.018*n)*damageWeight};}
 function scaling(wave=1,elapsed=0,tier=0){const n=waveIndex(wave);return {hp:2.25+.035*n,damage:1.1+.01*n,speed:1+Math.min(.65,n*.008),rank:1+Math.floor(n/12)};}
 const MODIFIERS=[{id:'corrupt',name:'Korruptiert',color:'#ff527e',hp:1,damage:1.3},{id:'frozen',name:'Gefroren',color:'#8bdcff',hp:1.1,damage:1,slow:true},{id:'armored',name:'Verstärkt',color:'#ffd377',hp:1.4,damage:1},{id:'elite',name:'Elite',color:'#ed79ff',hp:1.2,damage:1.15}];
 return {regular,elite,mid,major,all,byId,unlocked,encounter,encounterPlan,isSwarmWave,MAJOR_ORDER,scaling,bossScaling,bossWaveMultiplier,MODIFIERS};
});
