'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarLootReveal=api;})(globalThis,()=>{
 const SPECS=Object.freeze({rare:Object.freeze({columns:5,rows:3,frames:15,duration:2100,peak:9,color:'#64dcff'}),epic:Object.freeze({columns:4,rows:4,frames:16,duration:2800,peak:11,color:'#ce79ff'}),legendary:Object.freeze({columns:4,rows:4,frames:16,duration:3400,peak:11,color:'#ffd16b'})}),images={},pending={};
 function spec(rarity){if(!Object.hasOwn(SPECS,rarity))throw Error('Unbekannte Seltenheit.');return SPECS[rarity];}
 function timeline(rarity,ms){const s=spec(rarity),frame=Math.min(s.frames-1,Math.floor(Math.max(0,ms)/s.duration*s.frames));return {frame,done:ms>=s.duration,showSkin:frame>=s.peak,progress:Math.max(0,Math.min(1,ms/s.duration))};}
 function rect(rarity,frame,width,height){const s=spec(rarity),i=Math.max(0,Math.min(s.frames-1,Math.floor(frame))),w=width/s.columns,h=height/s.rows;return {x:i%s.columns*w+12,y:Math.floor(i/s.columns)*h+10,width:w-24,height:h-20};}
 function prepare(rarity){spec(rarity);if(typeof Image==='undefined')return Promise.resolve(false);if(!pending[rarity])pending[rarity]=new Promise(resolve=>{const image=new Image();image.onload=()=>{images[rarity]=image;resolve(true);};image.onerror=()=>resolve(false);image.src='./loot-reveal-'+rarity+'.jpg?v=138';});return pending[rarity];}
 function draw(canvas,rarity,frame){const image=images[rarity];if(!image)return false;const r=rect(rarity,frame,image.width,image.height);if(canvas.width!==600||canvas.height!==400){canvas.width=600;canvas.height=400;}const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,600,400);c.drawImage(image,r.x,r.y,r.width,r.height,0,0,600,400);return true;}
 return {SPECS,timeline,rect,prepare,draw};
});
