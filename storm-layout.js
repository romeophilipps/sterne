'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarStormLayout=api;})(globalThis,()=>{
 const isLandscape=(width,height)=>Number.isFinite(width)&&Number.isFinite(height)&&width>height;
 const isPortrait=(width,height)=>Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>=width;
 function portraitViewport(width,height,angle=0){width=Math.max(1,Number.isFinite(width)?width:1);height=Math.max(1,Number.isFinite(height)?height:1);const a=((angle%360)+360)%360,landscape=width>height;return {width:Math.min(width,height),height:Math.max(width,height),rotation:landscape?(a===90?-90:90):a===180?-180:0};}
 function bindPurchase(button,purchase){
  // Keep Safari from focusing and panning to a rapidly tapped purchase button.
  // Activation remains a native click (including keyboard/assistive clicks).
  const press=e=>{if(!button.disabled&&e.isPrimary!==false&&e.button===0)e.preventDefault();};
  const activate=e=>{if(button.disabled)return;e.preventDefault();purchase();};
  button.addEventListener('pointerdown',press);
  button.addEventListener('click',activate);
  return ()=>{button.removeEventListener('pointerdown',press);button.removeEventListener('click',activate);};
 }
 function createViewportLock(win,doc){
  let active=false,previousViewport=null;
  const options={passive:false,capture:true};
  const stop=e=>{if(e.cancelable)e.preventDefault();};
  const touchStart=e=>{if(e.touches.length>1)stop(e);};
  const touchMove=e=>{if(e.touches.length>1||!e.target?.closest?.('dialog[open]'))stop(e);};
  const resetScroll=()=>{if(win.scrollX||win.scrollY)win.scrollTo(0,0);};
  const handlers={gesturestart:stop,gesturechange:stop,dblclick:stop,touchstart:touchStart,touchmove:touchMove};
  return enabled=>{
   enabled=!!enabled;if(enabled===active)return;active=enabled;
   doc.documentElement.classList.toggle('storm-viewport',active);
   const viewport=doc.querySelector('meta[name="viewport"]');
   if(active){previousViewport=viewport?.getAttribute('content')??null;viewport?.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');}
   else if(viewport&&previousViewport!==null)viewport.setAttribute('content',previousViewport);
   for(const [name,handler]of Object.entries(handlers))doc[active?'addEventListener':'removeEventListener'](name,handler,options);
   win[active?'addEventListener':'removeEventListener']('scroll',resetScroll);
   if(active)resetScroll();
  };
 }
 return {isLandscape,isPortrait,portraitViewport,bindPurchase,createViewportLock};
});
