'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarIntroAudio=api;})(globalThis,()=>{
 function create(context,fetchAudio=globalThis.fetch?.bind(globalThis)){
  let buffer=null,source=null;const gain=context.createGain();gain.gain.value=1;gain.connect(context.destination);
  const ready=Promise.resolve().then(async()=>{const response=await fetchAudio('./intro-narration.m4a?v=116');if(!response.ok)throw new Error('Narration unavailable');buffer=await context.decodeAudioData(await response.arrayBuffer());return buffer;});
  function stop(){if(source){try{source.stop();}catch{}source.disconnect();source=null;}}
  function play(ms){stop();if(!buffer)return false;const offset=Math.max(0,Number.isFinite(ms)?ms/1000:0);if(offset>=Math.min(30,buffer.duration))return false;source=context.createBufferSource();source.buffer=buffer;source.connect(gain);source.start(context.currentTime+.015,offset);return true;}
  return {ready,play,stop};
 }
 return {create};
});
