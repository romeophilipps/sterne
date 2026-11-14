'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarMusic=api;})(globalThis,()=>{
  // Original, endlessly arranged A-minor arcade track. All instruments are synthesized locally.
  const ROOTS=[45,41,48,43], ARP=[0,7,12,7,3,7,15,12];
  const HOOK=[12,null,12,19,17,null,15,12,10,null,7,10,12,null,7,null];
  const frequency=note=>440*Math.pow(2,(note-69)/12);
  function intensity(level=1,remaining=20000){
    const energy=1-Math.exp(-(Math.max(1,level)-1)/8), urgent=remaining<=5000;
    return {bpm:138+42*energy+(urgent?6:0),energy,urgent,hats:level>=2,arp:level>=4,chords:level>=6,fill:level>=8};
  }
  function dodgeIntensity(elapsed=0){
    const seconds=Math.max(0,elapsed)/1000,energy=1-Math.exp(-seconds/95),ramp=(from,length)=>Math.max(0,Math.min(1,(seconds-from)/length));
    return {bpm:108+64*energy,energy,seconds,hats:ramp(8,20),snare:ramp(14,18),arp:ramp(28,30),chords:ramp(40,35),fill:ramp(58,35),pulse:ramp(20,25)};
  }
  class Track {
    constructor(context,timers={setInterval:(fn,ms)=>setInterval(fn,ms),clearInterval:id=>clearInterval(id)}){
      this.ctx=context;this.timers=timers;this.voices=new Set();this.playing=false;this.timer=null;this.step=0;this.settings=intensity();
      this.noise=context.createBuffer(1,context.sampleRate,context.sampleRate);
      const samples=this.noise.getChannelData(0);let seed=5731;
      for(let i=0;i<samples.length;i++){seed=(seed*16807)%2147483647;samples[i]=seed/1073741823.5-1;}
    }
    update(level,remaining,elapsed=0){this.settings=this.mode==='dodge'?dodgeIntensity(elapsed):intensity(level,remaining);}
    reset(level=1,mode='tap'){this.pause();this.mode=mode;this.step=0;this.update(level,20000,0);}
    play(){
      if(this.playing)return;
      try{
      const c=this.ctx;this.bus=c.createGain();this.bus.gain.setValueAtTime(0,c.currentTime);this.bus.gain.linearRampToValueAtTime(.62,c.currentTime+.05);
      this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-18;this.compressor.knee.value=12;this.compressor.ratio.value=5;this.compressor.attack.value=.003;this.compressor.release.value=.12;
      this.bus.connect(this.compressor);this.compressor.connect(c.destination);
      this.playing=true;this.next=c.currentTime+.035;this.schedule();this.timer=this.timers.setInterval(()=>this.schedule(),25);
      }catch(error){this.pause();console.warn('Musik nicht verfügbar',error);}
    }
    pause(){
      if(this.timer!==null)this.timers.clearInterval(this.timer);this.timer=null;this.playing=false;
      // Disconnect the whole graph, including already scheduled notes, on mute/pause.
      if(this.bus){this.bus.disconnect();this.compressor.disconnect();this.bus=null;}
      for(const voice of this.voices){try{voice.source.stop();}catch{}voice.nodes.forEach(node=>node.disconnect());}this.voices.clear();
    }
    schedule(){
      if(!this.playing||this.ctx.state!=='running')return;
      const now=this.ctx.currentTime;
      if(this.next<now-.1)this.next=now+.025; // Never replay a backlog after an interruption.
      while(this.next<now+.12){const beat=60/this.settings.bpm;this.sequence(this.step,this.next,beat);this.step++;this.next+=beat/4;}
    }
    voice(source,time,duration,volume,filter=null,pan=0){
      const c=this.ctx,gain=c.createGain(),nodes=[source,gain];
      gain.gain.setValueAtTime(.0001,time);gain.gain.linearRampToValueAtTime(volume,time+.006);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
      let tail=source;
      if(filter){const f=c.createBiquadFilter();f.type=filter.type||'lowpass';f.frequency.setValueAtTime(filter.hz,time);if(filter.end)f.frequency.exponentialRampToValueAtTime(filter.end,time+duration);f.Q.value=filter.q||.7;tail.connect(f);tail=f;nodes.push(f);}
      tail.connect(gain);tail=gain;
      if(c.createStereoPanner&&pan){const p=c.createStereoPanner();p.pan.value=pan;tail.connect(p);tail=p;nodes.push(p);}
      tail.connect(this.bus);
      const voice={source,nodes};this.voices.add(voice);
      source.onended=()=>{nodes.forEach(node=>node.disconnect());this.voices.delete(voice);};
      source.start(time);source.stop(time+duration+.015);
    }
    note(note,time,duration,volume,type='triangle',filter=null,pan=0,detune=0){
      const source=this.ctx.createOscillator();source.type=type;source.frequency.setValueAtTime(frequency(note),time);source.detune.value=detune;this.voice(source,time,duration,volume,filter,pan);
    }
    hiss(time,duration,volume,hz=7000,type='highpass'){
      const source=this.ctx.createBufferSource();source.buffer=this.noise;this.voice(source,time,duration,volume,{type,hz});
    }
    kick(time,volume=1){
      const o=this.ctx.createOscillator();o.frequency.setValueAtTime(155,time);o.frequency.exponentialRampToValueAtTime(48,time+.12);this.voice(o,time,.23,.62*volume);
      this.hiss(time,.018,.08*volume,2200);
    }
    snare(time,volume=1){this.hiss(time,.15,.22*volume,1400);this.note(50,time,.09,.13*volume);}
    dodgeSequence(step,time,beat){
      const s=step%16,bar=Math.floor(step/16),root=[38,34,41,36][Math.floor(bar/2)%4],p=this.settings;
      // An original D-minor pulse: drums, syncopation and melody fade in as survival time grows.
      if(s===0||s===8)this.kick(time,.68);else if(s%4===0&&p.pulse>0)this.kick(time,.68*p.pulse);
      if((s===4||s===12)&&p.snare>0)this.snare(time,.65*p.snare);
      if(s===0||s===6||s===10){this.note(root+(s===10?7:0),time,beat*.7,.16,'triangle',{hz:400+p.energy*700,end:110});this.note(root-12,time,beat*.55,.1,'sine');}
      if(p.hats>0&&s%2===0)this.hiss(time,.035,(s%4===2?.075:.04)*p.hats,7500);
      if(p.fill>0&&s%2===1)this.hiss(time,.026,.035*p.fill,9000);
      if(p.arp>0&&s%2===0){
        const melody=[12,19,15,22,19,15,10,7],note=root+12+melody[(s/2+bar)%8];
        this.note(note,time,beat*.34,.07*p.arp,'triangle',null,-.22);
        this.note(note,time+beat*.75,beat*.4,.024*p.arp,'sine',null,.28);
      }
      if(p.chords>0&&s===0)for(const n of [0,root===38?3:4,7])this.note(root+12+n,time,beat*2,.035*p.chords,'sawtooth',{hz:950+p.energy*800,end:250},n===0?-.3:.3);
      if(p.fill>0&&bar%4===3&&s>=13)this.note(45+(15-s)*3,time,.08,.09*p.fill,'sine');
      if(p.pulse>0&&s===14)this.note(root+12,time,beat*.2,.09*p.pulse,'sawtooth',{hz:1000,end:150});
      if(s===0&&bar%8===0)this.hiss(time,.5,.06,5000);
    }
    sequence(step,time,beat){
      if(this.mode==='dodge'){this.dodgeSequence(step,time,beat);return;}
      const s=step%16,bar=Math.floor(step/16),root=ROOTS[Math.floor(bar/2)%4],p=this.settings;
      // Four-on-the-floor kick, offbeat bass and a two-bar hook keep even level one driving.
      if(s%4===0)this.kick(time);
      if(s===4||s===12)this.snare(time);
      if(s%4===2){
        this.note(root,time,beat*.42,.25,'sawtooth',{hz:460+p.energy*900,end:130});
        this.note(root-12,time,beat*.4,.17,'sine');
        this.hiss(time,.09,.07,6500);
      }
      if(p.hats&&s%2===0)this.hiss(time,.035,s%4===0?.045:.075,8000);
      const hook=HOOK[(bar%2)*8+Math.floor(s/2)];
      if(s%2===0&&hook!==null){
        const pitch=57+hook;this.note(pitch,time,beat*.5,.085,'triangle',null,-.18);
        this.note(pitch,time,beat*.45,.032,'sawtooth',{hz:1700+p.energy*2200,end:700},.18,7);
        this.note(pitch,time+beat*.75,beat*.42,.018,'triangle',null,.3);
      }
      if(p.arp){
        // Major thirds in F/C/G, minor third in A; alternate octaves every eight bars.
        let interval=ARP[(s+bar)%ARP.length];if(root!==45&&(interval===3||interval===15))interval++;
        this.note(root+12+interval+(Math.floor(bar/8)%2)*12,time,beat*.19,.045,'square',{hz:1700+p.energy*1700,end:650},s%2?.3:-.3);
      }
      if(p.chords&&(s===2||s===10))for(const interval of [0,root===45?3:4,7])this.note(root+12+interval,time,beat*.8,.045,'sawtooth',{hz:1800,end:350},interval===0?-.25:.25);
      if(p.fill&&bar%4===3&&s>=13)this.snare(time,.38+(s-13)*.16);
      if(p.urgent&&s%4===3)this.hiss(time,.04,.06,9000);
      if(s===0&&bar%8===0)this.hiss(time,.65,.12,4500);
    }
  }
  return {create:context=>new Track(context),Track,intensity,dodgeIntensity};
});
