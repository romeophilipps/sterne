'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarStormLayout=api;})(globalThis,()=>{
 const isLandscape=(width,height)=>Number.isFinite(width)&&Number.isFinite(height)&&width>height;
 const isPortrait=(width,height)=>Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>=width;
 function portraitViewport(width,height,angle=0){width=Math.max(1,Number.isFinite(width)?width:1);height=Math.max(1,Number.isFinite(height)?height:1);const a=((angle%360)+360)%360,landscape=width>height;return {width:Math.min(width,height),height:Math.max(width,height),rotation:landscape?(a===90?-90:90):a===180?-180:0};}
 function bindPurchase(button,purchase){
  const activate=e=>{if(button.disabled)return;e.preventDefault();purchase();};
  button.addEventListener('click',activate);
  return ()=>button.removeEventListener('click',activate);
 }
 return {isLandscape,isPortrait,portraitViewport,bindPurchase};
});
