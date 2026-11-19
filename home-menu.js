'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarHomeMenu=api;})(globalThis,()=>{
 const wrap=(i,n)=>(i%n+n)%n;
 function swipeStep(dx,dy,ms,width){if(Math.abs(dx)<24||Math.abs(dx)<=Math.abs(dy)*1.3)return 0;const threshold=Math.max(48,Math.min(80,width*.17));return Math.abs(dx)>=threshold||Math.abs(dx)/Math.max(1,ms)>.42?(dx<0?1:-1):0;}
 function bind(root,card,{getIndex,setIndex,count,reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches}){
  let pointer=null,busy=false,animation=null,suppressUntil=0,serial=0;
  const now=()=>performance.now(),width=()=>Math.max(1,root.getBoundingClientRect().width);
  function clear(){card.style.transform='';card.style.opacity='';}
  async function move(from,to,duration){if(reduced()||!card.animate){clear();return;}animation=card.animate([{transform:'translate3d('+from+'px,0,0)',opacity:1-Math.min(.35,Math.abs(from)/width()*.35)},{transform:'translate3d('+to+'px,0,0)',opacity:1-Math.min(.35,Math.abs(to)/width()*.35)}],{duration,easing:'cubic-bezier(.22,.8,.22,1)',fill:'forwards'});try{await animation.finished;}catch{}animation?.cancel();animation=null;}
  async function go(index,direction,offset=0){if(busy)return;const next=wrap(index,count);if(next===getIndex()){await move(offset,0,180);clear();return;}busy=true;root.setAttribute('aria-busy','true');const token=++serial,sign=direction||Math.sign(index-getIndex())||1,w=width();await move(offset,-sign*w,130);if(token!==serial)return;setIndex(next);await move(sign*w,0,230);clear();busy=false;root.removeAttribute('aria-busy');}
  root.addEventListener('pointerdown',e=>{if(busy||!e.isPrimary||e.button!==0)return;suppressUntil=0;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,time:now(),locked:false};});
  root.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId||busy)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(!pointer.locked){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){pointer=null;return;}if(Math.abs(dx)<8||Math.abs(dx)<=Math.abs(dy)*1.3)return;pointer.locked=true;try{root.setPointerCapture(e.pointerId);}catch{}}if(e.cancelable)e.preventDefault();if(!reduced()){card.style.transform='translate3d('+dx+'px,0,0)';card.style.opacity=String(1-Math.min(.35,Math.abs(dx)/width()*.35));}});
  function end(e,cancel=false){if(!pointer||pointer.id!==e.pointerId)return;const p=pointer;pointer=null;if(!p.locked)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;suppressUntil=now()+450;const step=cancel?0:swipeStep(dx,dy,now()-p.time,width());if(step)go(getIndex()+step,step,dx);else{busy=true;move(dx,0,180).finally(()=>{clear();busy=false;});}}
  root.addEventListener('pointerup',e=>end(e));root.addEventListener('pointercancel',e=>end(e,true));// Touch starts implicitly captured by a child. Its capture-loss bubbles here
  // when the menu takes over; only losing the menu's own capture cancels a drag.
  root.addEventListener('lostpointercapture',e=>{if(e.target===root&&!root.hasPointerCapture?.(e.pointerId))end(e,true);});
  root.addEventListener('click',e=>{if((busy||now()<suppressUntil)&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}},true);
  return {go,get busy(){return busy;}};
 }
 async function drawStormLogo(canvas,paint){const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});try{const [space,wordmark]=await Promise.all([load('./storm-logo-space.png?v=148'),load('./storm-wordmark.png?v=148')]);paint(canvas.getContext('2d'),canvas.width,canvas.height,10500,{space,wordmark});}catch{const c=canvas.getContext('2d');c.fillStyle='#edc778';c.font='italic 900 65px system-ui';c.textAlign='center';c.fillText('STERNENSTURM',canvas.width/2,canvas.height/2);}}
 return {wrap,swipeStep,bind,drawStormLogo};
});
