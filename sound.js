'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSound=api;})(globalThis,()=>{
 const LIMITS={nova:700,boss:700,portal:700,shot:90,explode:140,collect:65,burn:180,navigate:100,heal:200,drone:200,warning:700};
 class Effects{
  constructor(context){this.ctx=context;this.voices=new Set();this.last=new Map();this.bus=null;this.maxVoices=32;const c=context;this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);let seed=7201;const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741823.5-1;}}
  graph(){if(this.bus)return;const c=this.ctx;this.bus=c.createGain();this.bus.gain.value=.65;this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-14;this.compressor.knee.value=10;this.compressor.ratio.value=8;this.compressor.attack.value=.003;this.compressor.release.value=.16;this.bus.connect(this.compressor);this.compressor.connect(c.destination);
   if(c.createConvolver){this.send=c.createGain();this.send.gain.value=.16;this.reverb=c.createConvolver();const impulse=c.createBuffer(2,c.sampleRate,c.sampleRate);let seed=841;for(let channel=0;channel<2;channel++){const d=impulse.getChannelData(channel);for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=(seed/1073741823.5-1)*Math.pow(1-i/d.length,3)*.22;}}this.reverb.buffer=impulse;this.send.connect(this.reverb);this.reverb.connect(this.bus);}}
  voice(source,duration,volume,{delay=0,pan=0,panEnd=pan,filter=0,filterEnd=filter,attack=.008}={}){if(this.voices.size>=this.maxVoices)return;const c=this.ctx,t=c.currentTime+.006+delay,g=c.createGain(),nodes=[source,g];let tail=source;if(filter){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(filter,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,filterEnd),t+duration);f.Q.value=.7;tail.connect(f);tail=f;nodes.push(f);}tail.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.min(.22,volume),t+Math.min(attack,duration*.3));g.gain.exponentialRampToValueAtTime(.0001,t+duration);tail=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.setValueAtTime(pan,t);p.pan.linearRampToValueAtTime(panEnd,t+duration);tail.connect(p);tail=p;nodes.push(p);}tail.connect(this.bus);if(this.send)g.connect(this.send);const v={source,nodes};this.voices.add(v);source.onended=()=>{nodes.forEach(n=>n.disconnect());this.voices.delete(v);};source.start(t);source.stop(t+duration+.02);}
  osc(f,end,duration,volume,options={}){if(this.voices.size>=this.maxVoices)return;const c=this.ctx,o=c.createOscillator(),t=c.currentTime+.006+(options.delay||0);o.type=options.type||'sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);this.voice(o,duration,volume,options);}
  air(duration,volume,options={}){if(this.voices.size>=this.maxVoices)return;const s=this.ctx.createBufferSource();s.buffer=this.noise;this.voice(s,duration,volume,{filter:2200,filterEnd:200,...options});}
  chime(notes,spacing=.065,volume=.07){notes.forEach((n,i)=>{const f=440*2**((n-69)/12);this.osc(f,f, .65,volume,{delay:i*spacing,pan:(i%2?1:-1)*.32});this.osc(f*2.003,f*2,.36,volume*.28,{delay:i*spacing,pan:i%2?-.4:.4});});}
  impact(power=1){this.osc(95,29,.65,.18*power);this.osc(180,48,.22,.065*power,{type:'triangle',filter:900,filterEnd:90});this.air(.42,.11*power,{filter:3000,filterEnd:180,pan:-.3,panEnd:.3});}
  play(kind,mode='tap'){const c=this.ctx;if(c.state!=='running')return false;const now=c.currentTime;if(now-(this.last.get(kind)??-Infinity)<(LIMITS[kind]||60)/1000)return false;this.last.set(kind,now);this.graph();
   switch(kind){
    case 'collect':this.chime(mode==='sling'?[77,84]:[74,81],.035,.045);this.osc(110,55,.12,.065);break;
    case 'bonus':case 'upgrade':case 'currency':this.chime([62,65,69,74,81],.065,.065);this.impact(.45);break;
    case 'loop':case 'clear':this.air(.8,.07,{filter:500,filterEnd:6500,pan:-.7,panEnd:.7,attack:.15});this.chime([65,69,72,77],.08,.065);break;
    case 'comet':case 'ability':this.chime([62,69,74,77,81],.09,.06);this.air(1.1,.08,{filter:800,filterEnd:6000,pan:-.6,panEnd:.6,attack:.15});this.impact(.6);break;
    case 'hit':case 'defeat':this.impact(kind==='defeat'?1:.8);this.osc(220,55,kind==='defeat'?1.5:.4,.07,{type:'triangle',filter:650,filterEnd:100});if(kind==='defeat')this.chime([62,57,50],.17,.045);break;
    case 'shot':this.osc(1600,240,.13,.03,{type:'triangle',pan:-.15,panEnd:.2});this.air(.08,.016,{filter:4000,filterEnd:900});break;
    case 'explode':this.impact(.7);break;
    case 'boss':this.impact();for(const f of [55,82.4,110])this.osc(f,f*.99,1.5,.06,{type:'sawtooth',filter:850,filterEnd:260,attack:.12,pan:f===55?-.3:.3});break;
    case 'nova':this.impact();this.air(1.35,.12,{filter:8000,filterEnd:100,pan:-.75,panEnd:.75});this.osc(55,440,.7,.08,{type:'triangle',pan:.5,panEnd:-.5});this.chime([74,81,86],.12,.05);break;
    case 'portal':this.osc(55,160,1.6,.065,{type:'sawtooth',filter:400,filterEnd:2500,attack:.18,pan:-.6,panEnd:.6});this.air(1.6,.085,{filter:350,filterEnd:6500,attack:.22,pan:.6,panEnd:-.6});this.chime([62,69,75],.11,.035);break;
    case 'portal-close':this.osc(180,28,.7,.12,{type:'triangle'});this.air(.6,.07,{filter:3000,filterEnd:60});break;
    case 'drone':case 'navigate':case 'launch':this.air(kind==='launch'?.65:.22,.045,{filter:450,filterEnd:3600,pan:-.5,panEnd:.5,attack:.04});if(kind==='launch')this.chime([62,69,74],.045,.04);break;
    case 'heal':this.chime([74,81,86],.1,.035);break;
    case 'purchase':this.osc(360,180,.09,.045,{type:'triangle'});this.chime([74],0,.025);break;
    case 'warning':this.osc(164.8,164.8,.32,.055,{type:'triangle',pan:-.25});this.osc(164.8,164.8,.32,.04,{delay:.35,pan:.25});break;
    case 'burn':this.air(.2,.04,{filter:2600,filterEnd:350});break;
    case 'victory':this.impact(.6);this.chime([62,69,74,77,81,86],.09,.065);break;
    default:return false;
   }return true;
  }
  stop(){for(const v of this.voices){try{v.source.stop();}catch{}v.nodes.forEach(n=>n.disconnect());}this.voices.clear();for(const n of [this.send,this.reverb,this.bus,this.compressor])n?.disconnect();this.send=null;this.reverb=null;this.bus=null;this.compressor=null;this.last.clear();}
 }
 return {Effects,create:context=>new Effects(context),LIMITS};
});
