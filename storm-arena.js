'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarArena=api;})(globalThis,()=>{
 const CONFIG=Object.freeze({minZ:-2.6,maxZ:.98,spawnZ:-2.57,spawnSpread:.045,panoramaRatio:2172/724,ground:.86,laneDepth:.10,marchMultiplier:3.2,marchDistance:.75});
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const clampZ=(z,max=CONFIG.maxZ)=>clamp(z,CONFIG.minZ,max);
 function geometry(w,h){const width=Math.max(w,h*CONFIG.panoramaRatio);return {x:0,y:0,w:width,h,maxOffset:Math.max(0,width-w)};}
 function project(lane,z,w,h,offset=0){const g=geometry(w,h);return {x:g.w*(.02+.96*(CONFIG.maxZ-z)/(CONFIG.maxZ-CONFIG.minZ))-clamp(offset,0,g.maxOffset),y:h*(CONFIG.ground+(lane-.5)*CONFIG.laneDepth)};}
 class Camera{
  constructor(){this.offset=0;this.max=0;this.revision=0;this.size='';}
  resize(w,h){const key=w+':'+h;if(key===this.size)return false;const old=this.max,ratio=old?this.offset/old:0;this.max=geometry(w,h).maxOffset;this.offset=clamp(ratio*this.max,0,this.max);this.size=key;this.revision++;return true;}
  pan(value){const next=clamp(Number.isFinite(value)?value:0,0,this.max);if(next===this.offset)return false;this.offset=next;this.revision++;return true;}
  reset(){this.offset=0;this.revision++;}
 }
 const bindings=new WeakMap();
 function bind(field,canvas,camera,redraw){if(!field?.addEventListener)return;const previous=bindings.get(field);if(previous){previous.canvas=canvas;previous.camera=camera;previous.redraw=redraw;return previous;}
  const state={canvas,camera,redraw,drag:null};bindings.set(field,state);field.classList?.add('storm-pannable-arena');field.setAttribute('aria-label','Schlachtfeld · nach links und rechts verschieben');field.setAttribute('aria-description','Mit dem Finger oder der Maus horizontal ziehen. Mit den Pfeiltasten blättern; Pos1 zeigt den Stern.');if(!field.hasAttribute('tabindex'))field.setAttribute('tabindex','0');
  const home=field.ownerDocument.createElement('button');home.type='button';home.className='arena-return';home.hidden=true;home.textContent='Zum Stern';home.setAttribute('aria-label','Kamera zum Stern zurücksetzen');home.onclick=()=>{if(state.camera.pan(state.camera.homeSide?state.camera.max:0))state.redraw();};field.append(home);state.home=home;
  const update=offset=>{state.camera.resize(state.canvas.clientWidth,state.canvas.clientHeight);if(state.camera.pan(offset)){home.hidden=Math.abs(state.camera.offset-(state.camera.homeSide?state.camera.max:0))<1;state.redraw();}};
  field.addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button!==0||e.target.closest?.('button,input,dialog'))return;state.camera.resize(state.canvas.clientWidth,state.canvas.clientHeight);state.drag={id:e.pointerId,x:e.clientX,offset:state.camera.offset};field.setPointerCapture?.(e.pointerId);e.preventDefault();});
  field.addEventListener('pointermove',e=>{if(state.drag?.id!==e.pointerId)return;update(state.drag.offset-(e.clientX-state.drag.x));e.preventDefault();});
  const end=e=>{if(state.drag?.id===e.pointerId){state.drag=null;if(field.hasPointerCapture?.(e.pointerId))field.releasePointerCapture(e.pointerId);}};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])field.addEventListener(event,end);
  field.addEventListener('wheel',e=>{const delta=e.deltaX||e.deltaY;if(!Number.isFinite(delta)||!delta)return;update(state.camera.offset+delta*(e.deltaMode===1?16:e.deltaMode===2?state.canvas.clientWidth:1));e.preventDefault();},{passive:false});
  field.addEventListener('keydown',e=>{const key=e.key;if(!['ArrowLeft','ArrowRight','Home','End'].includes(key)||e.target.closest?.('button,input,dialog'))return;state.camera.resize(state.canvas.clientWidth,state.canvas.clientHeight);update(key==='Home'?(state.camera.homeSide?state.camera.max:0):key==='End'?(state.camera.homeSide?0:state.camera.max):state.camera.offset+(key==='ArrowRight'?1:-1)*state.canvas.clientWidth*.65);e.preventDefault();e.stopPropagation();});
  return state;
 }
 function status(binding,run){if(!binding)return;binding.home.hidden=Math.abs(binding.camera.offset-(binding.camera.homeSide?binding.camera.max:0))<1;const hp=Math.max(0,Math.ceil(run.base.hp)),max=Math.ceil(run.base.max),text='Stern '+hp+'/'+max;if(binding.home.textContent!==text)binding.home.textContent=text;binding.home.dataset.danger=String(hp<max*.35);binding.home.setAttribute('aria-label','Stern '+hp+' von '+max+' Leben · Kamera zum Stern zurücksetzen');}
 let panorama=null,rock=null;function load(src){return new Promise(done=>{const image=new Image();image.onload=()=>done(image);image.onerror=()=>done(null);image.src=src;});}
 const ready=typeof Image==='undefined'?Promise.resolve():Promise.all([load('./storm-arena-wide-v196.png?v=196').then(i=>panorama=i),load('./storm-arena-rock.png?v=194').then(i=>rock=i)]);
 function background(c,w,h,offset=0){if(!panorama)return false;const g=geometry(w,h);c.save();c.imageSmoothingEnabled=false;c.drawImage(panorama,-clamp(offset,0,g.maxOffset),0,g.w,h);c.restore();return true;}
 function foreground(c,w,h,offset=0){if(!rock)return false;const g=geometry(w,h),rw=h*.72,rh=rw*rock.height/rock.width;c.save();c.imageSmoothingEnabled=false;c.drawImage(rock,g.w-rw-offset,h-rh,rw,rh);c.restore();return true;}
 return {CONFIG,clampZ,geometry,project,Camera,bind,status,ready,background,foreground};
});
