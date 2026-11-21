'use strict';
/* Authored guardian PNG playback only. No gameplay values or generated geometry. */
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm-guardian-data.js'):root.StarGuardianData);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarGuardianArt=api;})(globalThis,data=>{
 const FPS=20,FRAME_MS=50,MAX_IMAGES=8,images=new Map();
 const supports=id=>!!data?.skins[id];
 const STANDARD='standard-1';
 function identity(u){if(!u||u.kind==='shield'||u.hero>=0||u.type!==1||!(u.hero<0))return null;const id=u.cosmeticSkin;if(supports(id))return id;return (id===undefined||id===null||id<0)&&supports(STANDARD)?STANDARD:null;}
 function image(src){let e=images.get(src);if(!e&&typeof Image!=='undefined'){const im=new Image();e={im,loaded:false,promise:new Promise(resolve=>{im.onload=()=>{e.loaded=true;resolve(true)};im.onerror=()=>resolve(false)})};images.set(src,e);im.src=src;}if(e){images.delete(src);images.set(src,e);}while([...images.keys()].filter(k=>!k.includes('-idle-')).length>MAX_IMAGES)images.delete([...images.keys()].find(k=>!k.includes('-idle-')));return e;}
 const clip=(id,state)=>data?.skins[id]?.clips[state];
 async function ready(id,state='idle'){const a=clip(id,state==='jump'?'spawn':state);return a?image(a.src)?.promise:false;}
 const duration=(id,state)=>(clip(id,state)?.count||0)*FRAME_MS;
 const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function selection(id,f={},u={},now=0){
  u||={};f||={};
  let state='idle',start=0;
  const preview=u.testAnimation;if(preview&&clip(id,preview.state)&&(preview.state==='death'||now-preview.start<preview.duration)){const a=clip(id,preview.state);return {state:preview.state,index:Math.max(0,Math.min(a.count-1,Math.floor((now-preview.start)/FRAME_MS))),start:preview.start};}
  if(u.hp<=0||u.deathAt!==undefined||f.state==='death'){state='death';start=u.deathAt??u.anim?.start??now;}
  else{
   const shot=u.lastStrikeAt!==undefined?now-u.lastStrikeAt:Infinity,special=(u.attackCount||0)%3===0,attack=special?'special':'attack',postDuration=duration(id,attack)-(clip(id,attack)?.contactFrame||0)*FRAME_MS;
   const strong=u.guardianStrongHitAt!==undefined?now-u.guardianStrongHitAt:Infinity,hit=u.hitAt!==undefined?now-u.hitAt:Infinity,block=u.shield?.hitAt!==undefined?now-u.shield.hitAt:Infinity;
   if(shot>=0&&shot<50){state=attack;start=u.lastStrikeAt;}
   else if(strong>=0&&strong<duration(id,'knockback')){state='knockback';start=u.guardianStrongHitAt;}
   else if(hit>=0&&hit<duration(id,'hit')){state='hit';start=u.hitAt;}
   else if(block>=0&&block<duration(id,'block')){state='block';start=u.shield.hitAt;}
   else if(shot>=0&&shot<postDuration){state=attack;start=u.lastStrikeAt;}
   else if(u.shield?.plantedAt!==undefined&&now-u.shield.plantedAt<duration(id,'shieldActivate')){state='shieldActivate';start=u.shield.plantedAt;}
   else if(u.guardianBornAt!==undefined&&now-u.guardianBornAt<duration(id,'spawn')){state='spawn';start=u.guardianBornAt;}
   else if((u.attackCount||0)%3===2&&clip(id,'special')?.contactFrame&&u.attack>0&&u.attack<=clip(id,'special').contactFrame*FRAME_MS&&(u.blend||0)<.12){const a=clip(id,'special');return {state:'special',index:Math.max(0,a.contactFrame-Math.ceil(u.attack/FRAME_MS)),start:now};}
   else if((u.blend||0)>.12||f.state==='run'){state='run';}
   else if(!u.id&&clip(id,f.state)){state=f.state;start=now-(f.column+(f.mix||0))*FRAME_MS;}
  }
  const a=clip(id,state)||clip(id,'idle'),contact=(state==='special'?a.contactFrame||0:0),age=Math.max(0,now-start)+contact*FRAME_MS,index=reduced()?state==='idle'||state==='run'?0:Math.min(a.count-1,Math.floor(age/FRAME_MS)):a.loop?Math.floor(age/FRAME_MS)%a.count:Math.min(a.count-1,Math.floor(age/FRAME_MS));return {state,index,start};
 }
 function paint(c,id,state,index,size,bodyHeight=.7,offsetY=0){const a=clip(id,state);if(!a)return false;const entry=image(a.src);if(!entry?.loaded)return false;const f=a.frames[Math.max(0,Math.min(a.count-1,index))],scale=size*bodyHeight/a.body,[ax,ay]=a.anchor;c.imageSmoothingEnabled=false;c.drawImage(entry.im,...f.rect,-ax*scale,-ay*scale+offsetY,f.rect[2]*scale,f.rect[3]*scale);return true;}
 function drawLocal(c,id,f,size,jump,now,u,bodyHeight=.7){if(!supports(id))return false;const s=selection(id,f,u,now);if(!paint(c,id,s.state,s.index,size,bodyHeight))paint(c,id,'idle',0,size,bodyHeight);return true;}
 function poster(canvas,id,width=224,height=160){if(!supports(id))return false;const a=clip(id,'idle'),e=image(a.src);if(!e?.loaded)return false;const f=a.frames[0],[bx,by,bw,bh]=f.bounds;canvas.width=width;canvas.height=height;const c=canvas.getContext('2d'),scale=Math.min(height*.6875/a.body,(width-20)/bw,(height-20)/bh);c.clearRect(0,0,width,height);c.imageSmoothingEnabled=false;c.drawImage(e.im,f.rect[0]+bx,f.rect[1]+by,bw,bh,(width-bw*scale)/2,height-12-bh*scale,bw*scale,bh*scale);return true;}
 function pose(id,state,index=0){const a=clip(id,state),e=a&&image(a.src);if(!e?.loaded||typeof document==='undefined')return null;const cv=document.createElement('canvas'),f=a.frames[Math.max(0,Math.min(a.count-1,index))];cv.width=a.canvas[0];cv.height=a.canvas[1];cv.getContext('2d').drawImage(e.im,...f.rect,0,0,...a.canvas);return {canvas:cv,width:cv.width,height:cv.height,anchorX:a.anchor[0],foot:a.anchor[1],groundFoot:a.anchor[1],body:a.body,characterHeight:a.body,count:a.count};}
 function drawShield(c,s,q,now){const id=s.guardianSkin;if(!supports(id)||s.hp<=0)return false;const a=clip(id,'shield');if(!a)return false;const age=Math.max(0,now-s.plantedAt),i=Math.min(a.count-1,Math.floor(age/FRAME_MS));c.save();c.translate(q.x,q.y);c.scale(s.face||1,1);paint(c,id,'shield',i,53,.72);c.restore();const ageHit=now-(s.hitAt??-1000);if(ageHit>=0&&ageHit<300)globalThis.StarCombatVFX?.paintEffect(c,id===13?112:id===11?102:id===12?123:id===STANDARD?85:17,q.x,q.y-20,id===13?48:35,now,s.hitAt);return true;}
 function muzzle(u,q,now,size,bodyHeight=.7){const id=identity(u);if(id===null)return null;const s=selection(id,{},u,now),a=clip(id,s.state),scale=size*bodyHeight/a.body;return {x:q.x+(u.face||1)*a.canvas[0]*.24*scale,y:q.y-a.canvas[1]*.48*scale};}
 function install(Round){const p=Round.prototype;if(p.guardianPresentationInstalled)return;p.guardianPresentationInstalled=true;const wrap=(key,fn)=>{const old=p[key];if(old)p[key]=function(...args){return fn.call(this,old,...args)}};
  wrap('setEquipment',function(old,...args){const result=old.apply(this,args);for(const id of Object.values(this.equipment?.skins||args[0]?.skins||{}))if(supports(id))ready(id);return result});
  wrap('summon',function(old,...args){const ids=new Set(this.troops.map(t=>t.id)),result=old.apply(this,args);for(const t of this.troops){const key=identity(t);if(!ids.has(t.id)&&key!==null){t.guardianBornAt=this.elapsed;ready(key,'spawn');ready(key,'run');ready(key,'attack')}}return result});
  wrap('deployShield',function(old,t,...args){const before=t?.shield,result=old.call(this,t,...args);const key=identity(t);if(t?.shield&&t.shield!==before&&key!==null){t.shield.guardianSkin=key;t.shield.face=t.face||1;ready(key,'shield');ready(key,'shieldActivate')}return result});
  wrap('wound',function(old,t,n,...args){const hp=t?.hp,result=old.call(this,t,n,...args);if(identity(t)!==null&&hp-t.hp>=t.max*.18)t.guardianStrongHitAt=this.elapsed;return result});
 }
 return {data,STANDARD,identity,FPS,FRAME_MS,MAX_IMAGES,images,supports,clip,ready,duration,selection,paint,drawLocal,poster,pose,drawShield,muzzle,install};
});
