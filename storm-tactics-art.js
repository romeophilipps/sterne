'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarTacticsArt=api;})(globalThis,()=>{
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*(3-2*t);
 // Identity motion stays independent from the original PNG effect playback.
 const PROFILES={
 shadow:{motif:'blade',color:'#f85679',light:'#ffe1e8',weight:.8,pace:140},guard:{motif:'bastion',color:'#9c86ce',light:'#e1d9ff',weight:1.5,pace:290},hunter:{motif:'scope',color:'#ed69af',light:'#ffdcf0',weight:.6,pace:210},runner:{motif:'claw',color:'#bf66d9',light:'#f9c8ff',weight:.65,pace:105},brood:{motif:'fang',color:'#ec4ca4',light:'#ffcee8',weight:.35,pace:85},skyrazor:{motif:'wing',color:'#b284e4',light:'#ead9ff',weight:.5,pace:160},nexusling:{motif:'core',color:'#ef48b7',light:'#ffe1fc',weight:.4,pace:270},
 ravager:{motif:'cleaver',color:'#eb365e',light:'#ffd3de',weight:1.5,pace:245},priest:{motif:'pact',color:'#b66de3',light:'#edd2ff',weight:.5,pace:380},starwyrm:{motif:'breath',color:'#d25acf',light:'#ffdaff',weight:1,pace:250},basaltor:{motif:'stone',color:'#ec9a51',light:'#ffe1ad',weight:2,pace:340},voidlurker:{motif:'hunt',color:'#9f5add',light:'#ead0ff',weight:.8,pace:130},riftworm:{motif:'rift',color:'#b780f1',light:'#ecdbff',weight:1.2,pace:240},specter:{motif:'soul',color:'#6dcced',light:'#d6ffff',weight:.3,pace:430},obsidian:{motif:'shard',color:'#c27eea',light:'#f3d8ff',weight:1.8,pace:370},vulkanus:{motif:'magma',color:'#fb873e',light:'#ffe9a4',weight:1.8,pace:310},aerion:{motif:'tempest',color:'#71bfe9',light:'#e1fbff',weight:.6,pace:165},kronos:{motif:'clock',color:'#e4bc69',light:'#fff4ca',weight:.45,pace:480},leviathan:{motif:'abyss',color:'#44b7d5',light:'#cefbff',weight:1.4,pace:320},tyrant:{motif:'ordnance',color:'#ec9b46',light:'#ffe0b0',weight:2.2,pace:380},umbra:{motif:'mirror',color:'#b978e6',light:'#f2d8ff',weight:.6,pace:170},astraea:{motif:'verdict',color:'#efcd86',light:'#fff7db',weight:.5,pace:440}
 };
 const profile=e=>PROFILES[e.skin||e.id]||PROFILES.shadow;
 function motion(e,now){const pr=profile(e),dead=e.deathAt!==undefined;if(dead)return {x:0,y:0,tilt:0,sx:1,sy:1,lift:0};const cast=e.castUntil>now,t=cast?clamp((now-e.castAt)/Math.max(1,e.castUntil-e.castAt)):0,recovery=clamp(1-(now-(e.lastCastAt??-10000))/650),walk=clamp(e.blend||0),cycle=(e.phase||0)*2,air=['wing','breath','tempest','soul','clock','verdict','pact'].includes(pr.motif);let x=0,y=air?Math.sin(now/pr.pace)*1.8:Math.sin(cycle)*walk*.8/Math.sqrt(pr.weight),tilt=0,sx=1,sy=1,lift=air?3:0;
 if(cast){const load=ease(t);if(['blade','cleaver','claw','fang','hunt','mirror'].includes(pr.motif)){x=-3*load;tilt=-.035*load;sy=1-.025*load;}
 else if(['stone','magma','ordnance','bastion','shard'].includes(pr.motif)){y=2*load;sy=1-.035*load;sx=1+.02*load;}
 else if(['wing','breath','tempest'].includes(pr.motif)){lift+=7*Math.sin(t*Math.PI);tilt=-.025*Math.sin(t*Math.PI);}
 else{lift+=4*load;y-=2*load;}}
 if(recovery>0){x+=Math.sin((1-recovery)*Math.PI)*3/pr.weight;y+=Math.sin(recovery*Math.PI)*pr.weight*.5;}
 x-=clamp(1-(now-(e.hitAt??-10000))/150)*.7/pr.weight;return {x,y,tilt,sx,sy,lift};}
 function drawThreats(c,run,p){globalThis.StarCombatVFX?.drawLayer('threats',c,run,p);}
 function drawUnit(c,e,q,now,size,lift=0){if(e.deathAt!==undefined||globalThis.StarBoss500?.belongs(e)||!(e.castUntil>now))return;globalThis.StarCombatVFX?.paintEffect(c,globalThis.StarCombatVFX.choose(e,'magic'),q.x,q.y-size*.38-lift,65,now,e.castAt,true);}
 function drawStatuses(){} // Supplied PNG status icons are rendered centrally by StarVFX.
 return {PROFILES,profile,motion,drawThreats,drawUnit,drawStatuses};
});
