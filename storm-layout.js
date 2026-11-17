'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarStormLayout=api;})(globalThis,()=>{
 const isLandscape=(width,height)=>Number.isFinite(width)&&Number.isFinite(height)&&width>height;
 function create({viewport,active,playing,pause,resume,show}){
  let blocked=null,resumePending=false;
  return {update(){const enabled=active(),{width,height}=viewport(),next=enabled&&!isLandscape(width,height);if(next&&playing()){resumePending=true;pause();}if(!next&&blocked&&resumePending&&enabled)resume();if(!enabled||!next)resumePending=false;if(next!==blocked){blocked=next;show(next);}return next;},get blocked(){return !!blocked;}};
 }
 return {isLandscape,create};
});
