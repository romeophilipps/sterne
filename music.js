'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarMusic=api;})(globalThis,()=>{
  // Original adaptive cinematic themes, using the bundled orchestra in every game.
  const frequency=note=>440*Math.pow(2,(note-69)/12);
  function intensity(level=1,remaining=20000){
    const energy=1-Math.exp(-(Math.max(1,level)-1)/8), urgent=remaining<=5000;
    return {bpm:138+42*energy+(urgent?6:0),energy,urgent,hats:level>=2,arp:level>=4,chords:level>=6,fill:level>=8};
  }
  function dodgeIntensity(elapsed=0){
    const seconds=Math.max(0,elapsed)/1000,energy=1-Math.exp(-seconds/95),ramp=(from,length)=>Math.max(0,Math.min(1,(seconds-from)/length));
    return {bpm:108+64*energy,energy,seconds,hats:ramp(8,20),snare:ramp(14,18),arp:ramp(28,30),chords:ramp(40,35),fill:ramp(58,35),pulse:ramp(20,25)};
  }
  const BATTLE_SAMPLES={
    'strings-low':{root:55},'strings-high':{root:72},'strings-pad':{root:72},cello:{root:60},horn:{root:60},'horn-stab':{root:60},trumpet:{root:60},drum:{root:36},snare:{root:60},timpani:{root:42},cymbal:{root:60}
  };
  const BATTLE_ROOTS=[38,38,34,34,41,41,36,33];
  // An original eight-bar D-minor theme, with a dominant cadence back into the march.
  const BATTLE_THEME=[[[0,62,1.5],[6,69,.5],[8,72,1],[12,70,1]],[[0,69,2],[8,65,1],[12,64,1]],[[0,62,1],[4,65,1],[8,70,1.5],[14,69,.5]],[[0,67,2],[8,65,1],[12,62,1]],[[0,65,1.5],[6,69,.5],[8,72,1],[12,74,1]],[[0,72,2],[8,69,1],[12,67,1]],[[0,64,1],[4,67,1],[8,72,1.5],[14,70,.5]],[[0,67,1],[4,64,1],[8,61,1],[12,69,.75]]];
  function stormIntensity(elapsed=0,wave=1,scene={}){
    const seconds=Math.max(0,elapsed)/1000,energy=1-Math.exp(-(seconds/130+Math.max(0,wave-1)/55)),boss=!!scene.boss,phase=boss?Math.max(1,Math.min(3,scene.phase||1)):0,rest=!!scene.rest;
    return {bpm:112+12*energy+(boss?5+phase:0),energy,boss,phase,rest,strings:rest?.6:1,highStrings:Math.min(1,.25+energy*.75+(boss?.3:0)),brass:rest?.38:.72+energy*.28,trumpet:rest?0:Math.min(1,energy*.85+(boss?.4:0)),drums:rest?.3:.72+energy*.28,fill:boss||energy>.5};
  }
  const SCORES={
    tap:{bpm:126,rise:18,roots:[38,34,41,36,38,34,33,33],lead:[74,77,81,79,77,74,73,69],drums:[0,6,8,14],name:'Sternenschmiede'},
    dodge:{bpm:108,rise:34,roots:[38,38,34,34,36,36,33,33],lead:[62,69,65,70,67,64,61,69],drums:[0,10],name:'Durch den Schatten'},
    sling:{bpm:100,rise:20,roots:[41,37,44,39,41,44,39,36],lead:[65,72,75,77,72,68,67,72],drums:[0,8,14],name:'Spur der Sterne'},
    nova:{bpm:132,rise:16,roots:[36,32,39,34,36,32,31,31],lead:[72,79,75,82,79,75,74,79],drums:[0,3,6,8,11,14],name:'Sonnenlanze'}
  };
  function cinematicIntensity(mode='tap',level=1,remaining=20000,elapsed=0,scene={}){const profile=SCORES[mode]||SCORES.tap,energy=1-Math.exp(-(Math.max(0,elapsed)/1000/100+Math.max(0,level-1)/14)),urgent=mode==='tap'&&remaining<=5000,boss=!!scene.boss;return {bpm:profile.bpm+profile.rise*energy+(urgent?4:0)+(boss?4:0),energy,urgent,boss,strings:.75+energy*.25,highStrings:.2+energy*.8,brass:.45+energy*.55,drums:.65+energy*.35,fill:energy>.45||boss};}

  class Track {
    constructor(context,timers={setInterval:(fn,ms)=>setInterval(fn,ms),clearInterval:id=>clearInterval(id)},options={}){
      this.ctx=context;this.timers=timers;this.sampleBank={};this.sampleReady=null;this.fetchSample=options.fetch||(globalThis.fetch?globalThis.fetch.bind(globalThis):null);this.maxVoices=options.maxVoices??96;this.voices=new Set();this.playing=false;this.timer=null;this.step=0;this.mode='tap';this.settings=cinematicIntensity('tap');
      this.noise=context.createBuffer(1,context.sampleRate,context.sampleRate);
      const samples=this.noise.getChannelData(0);let seed=5731;
      for(let i=0;i<samples.length;i++){seed=(seed*16807)%2147483647;samples[i]=seed/1073741823.5-1;}
    }
    update(level,remaining,elapsed=0,scene={}){this.settings=this.mode==='storm'?stormIntensity(elapsed,level,scene):cinematicIntensity(this.mode,level,remaining,elapsed,scene);}
    reset(level=1,mode='tap'){this.pause();this.mode=mode;this.step=0;this.update(level,20000,0);this.prepareStorm();}
    play(){
      if(this.playing)return;
      try{
      const c=this.ctx;this.bus=c.createGain();this.bus.gain.setValueAtTime(0,c.currentTime);this.bus.gain.linearRampToValueAtTime(this.mode==='storm'?.55:.48,c.currentTime+.15);
      this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-18;this.compressor.knee.value=12;this.compressor.ratio.value=5;this.compressor.attack.value=.003;this.compressor.release.value=.12;
      this.bus.connect(this.compressor);this.compressor.connect(c.destination);
      if(c.createConvolver){this.reverb=c.createConvolver();this.reverbSend=c.createGain();this.reverbSend.gain.value=.24;const impulse=c.createBuffer(2,Math.ceil(c.sampleRate*1.65),c.sampleRate);let seed=811;for(let channel=0;channel<2;channel++){const data=impulse.getChannelData(channel);let smooth=0;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;smooth=smooth*.65+(seed/1073741823.5-1)*.35;data[i]=smooth*Math.pow(1-i/data.length,2.8)*.32;}}this.reverb.buffer=impulse;this.reverbSend.connect(this.reverb);this.reverb.connect(this.bus);}

      this.playing=true;this.next=c.currentTime+.035;this.schedule();this.timer=this.timers.setInterval(()=>this.schedule(),25);
      }catch(error){this.pause();console.warn('Musik nicht verfügbar',error);}
    }
    pause(){
      if(this.timer!==null)this.timers.clearInterval(this.timer);this.timer=null;this.playing=false;
      // Disconnect the whole graph, including already scheduled notes, on mute/pause.
      if(this.bus){this.bus.disconnect();this.compressor.disconnect();this.bus=null;}
      for(const node of [this.reverbSend,this.reverb])node?.disconnect();this.reverbSend=null;this.reverb=null;
      for(const voice of this.voices){try{voice.source.stop();}catch{}voice.nodes.forEach(node=>node.disconnect());}this.voices.clear();
    }
    schedule(){
      if(!this.playing||this.ctx.state!=='running')return;
      const now=this.ctx.currentTime;
      if(this.next<now-.1)this.next=now+.025; // Never replay a backlog after an interruption.
      while(this.next<now+.12){const beat=60/this.settings.bpm;this.sequence(this.step,this.next,beat);this.step++;this.next+=beat/4;}
    }
    voice(source,time,duration,volume,filter=null,pan=0,envelope=null){
      if(!this.bus||this.voices.size>=this.maxVoices)return;const c=this.ctx,gain=c.createGain(),nodes=[source,gain];
      gain.gain.setValueAtTime(.0001,time);gain.gain.linearRampToValueAtTime(volume,time+(envelope?.attack||.006));if(envelope?.hold)gain.gain.setValueAtTime(volume*.85,time+Math.max(envelope.attack||.006,duration-(envelope.release||.15)));gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
      let tail=source;
      if(filter){const f=c.createBiquadFilter();f.type=filter.type||'lowpass';f.frequency.setValueAtTime(filter.hz,time);if(filter.end)f.frequency.exponentialRampToValueAtTime(filter.end,time+duration);f.Q.value=filter.q||.7;tail.connect(f);tail=f;nodes.push(f);}
      tail.connect(gain);tail=gain;
      if(c.createStereoPanner&&pan){const p=c.createStereoPanner();p.pan.value=pan;tail.connect(p);tail=p;nodes.push(p);}
      tail.connect(this.bus);if(this.reverbSend)gain.connect(this.reverbSend);
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
    prepareStorm(){
      if(this.sampleReady)return this.sampleReady;
      if(!this.fetchSample||!this.ctx.decodeAudioData)return Promise.resolve(false);
      this.sampleReady=Promise.all(Object.keys(BATTLE_SAMPLES).map(async name=>{try{const response=await this.fetchSample('./battle-'+name+'.m4a?v=139');if(!response.ok)throw new Error('Audio download failed');const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.sampleBank[name]=buffer;return true;}catch{return false;}})).then(results=>{this.samplesLoaded=results.every(Boolean);if(!this.samplesLoaded)this.sampleReady=null;return this.samplesLoaded;});return this.sampleReady;
    }
    instrument(name,pitch,time,duration,volume,pan=0){
      const buffer=this.sampleBank[name],meta=BATTLE_SAMPLES[name];
      if(buffer){const source=this.ctx.createBufferSource();source.buffer=buffer;const rate=Math.pow(2,(pitch-meta.root)/12);source.playbackRate.setValueAtTime(rate,time);const natural=buffer.duration/rate,length=Math.max(.025,Math.min(duration+.16,natural-.005));this.voice(source,time,length,volume,null,pan,{attack:name==='strings-pad'?.1:.008,hold:true,release:name==='strings-pad'?.35:.14});}
      else if(name==='drum'||name==='timpani'){const source=this.ctx.createOscillator();source.type='sine';source.frequency.setValueAtTime(name==='drum'?95:frequency(pitch),time);source.frequency.exponentialRampToValueAtTime(name==='drum'?38:frequency(pitch)*.92,time+.16);this.voice(source,time,Math.min(1,duration),volume*.6);}
      else if(name==='snare'||name==='cymbal')this.hiss(time,Math.min(.5,duration),volume*.25,name==='snare'?1300:5500);
      else this.note(pitch,time,duration,volume*.16,name.startsWith('strings')?'triangle':'sawtooth',{hz:1100,end:650},pan);
    }
    stormSequence(step,time,beat){
      const s=step%16,bar=Math.floor(step/16),phrase=bar%32,chord=bar%8,root=BATTLE_ROOTS[chord],third=chord===0||chord===1?3:4,p=this.settings;
      // A measured orchestral march, rather than the arcade four-on-the-floor groove.
      if([0,6,8,14].includes(s))this.instrument('drum',36,time,1.1,(s===0?.34:s===8?.27:.16)*p.drums,s===6?-.12:.1);
      if(s===0||s===8)this.instrument('timpani',root,time,1.15,.18*p.drums,-.18);
      if(s===4||s===12)this.instrument('snare',60,time,.28,.14*p.drums,.2);
      if(p.fill&&(phrase%4===3||p.boss)&&s>=13)this.instrument('snare',60,time,.16,(s===15?.15:.08)*p.drums,.16);
      if(s===0&&(bar%8===0||p.boss&&bar%4===0))this.instrument('cymbal',60,time,3,.16*p.drums,.2);
      const ostinato=[0,7,12,7,third,7,12,7];
      if(s%2===0){const i=s/2,velocity=i%4===0?.17:.115;
        this.instrument('cello',root+12+(i%4===2?7:0),time,beat*.42,velocity*p.strings,-.28);
        this.instrument('strings-low',root+24+ostinato[i],time+.005,beat*.38,velocity*p.strings,-.4);
        if(p.highStrings>.35&&(phrase<24||phrase>=28||p.boss))this.instrument('strings-high',root+36+(ostinato[(i+2)%8]%12),time+.012,beat*.35,.075*p.highStrings,.4);
      }
      // A real phrase has sustained notes, responses, space and a cadence, not a short bleep loop.
      for(const [at,pitch,beats]of BATTLE_THEME[chord])if(s===at){
        this.instrument('horn',pitch,time,beat*beats*.94,.24*p.brass,-.08);
        if(p.trumpet>.32&&(phrase>=8||p.boss))this.instrument('trumpet',pitch+(phrase>=16&&pitch<65?12:0),time+.012,beat*beats*.8,.085*p.trumpet,.18);
      }
      if(s===0){for(const interval of [0,third,7])this.instrument('strings-pad',root+24+interval,time,beat*3.85,.045*(p.rest?.6:1),interval===0?-.4:.4);
        if(phrase>=16||p.boss)for(const interval of [0,7])this.instrument('horn-stab',root+24+interval,time,beat*.7,.075*p.brass,interval===0?-.3:.3);
      }
      if(p.boss&&p.phase>=2&&s===10)this.instrument('timpani',root+7,time,.6,.18,.05);
      if(p.boss&&p.phase===3&&s%4===3)this.instrument('strings-high',root+36+(ostinato[Math.floor(s/2)]%12),time,beat*.2,.065,.35);
    }
    cinematicSequence(step,time,beat){
      const mode=SCORES[this.mode]?this.mode:'tap',score=SCORES[mode],s=step%16,bar=Math.floor(step/16),chord=bar%8,root=score.roots[chord],p=this.settings,third=root===score.roots[0]?3:4,phrase=Math.floor(bar/8)%4;
      if(score.drums.includes(s))this.instrument('drum',36,time,.9,(s===0?.32:.16)*p.drums,s%2?-.14:.1);
      if(s===0||mode==='nova'&&s===8)this.instrument('timpani',root,time,1.1,.16*p.drums,-.2);
      if((s===4||s===12)&&(mode!=='sling'||p.energy>.25))this.instrument('snare',60,time,.25,.1*p.drums,.22);
      if(s===0&&bar%8===0)this.instrument('cymbal',60,time,2.6,.1,.18);
      if(p.fill&&bar%4===3&&s>=13)this.instrument('snare',60,time,.13,.055+(s-13)*.025,.16);
      const notes=[0,7,12,7,third,7,12,7];
      if(s%2===0&&(mode!=='sling'||s%4===0||p.energy>.35)){
        const i=s/2;this.instrument('cello',root+12+(i%4===2?7:0),time,beat*.55,.13*p.strings,-.3);
        this.instrument('strings-low',root+24+notes[i],time+.006,beat*.44,.105*p.strings,-.45);
        if(p.highStrings>.35)this.instrument('strings-high',root+36+notes[(i+chord)%8]%12,time+.012,beat*.4,.065*p.highStrings,.44);
      }
      if(s===0){for(const interval of [0,third,7])this.instrument('strings-pad',root+24+interval,time,beat*3.8,.037,interval===0?-.5:.5);
        this.note(root-12,time,beat*2.8,.035,'sine',{hz:180,end:65});
        if(mode==='sling')this.instrument('strings-high',score.lead[chord]+12,time,beat*2.7,.045,.32);
      }
      const lead=score.lead[chord]+(phrase===2&&mode!=='dodge'?12:0);
      for(const at of mode==='dodge'?[0,10]:[0,6,12])if(s===at){const pitch=lead+(at===6?7:at===12?-2:0),length=mode==='sling'?1.6:at===0?1.2:.65;
        this.instrument('horn',pitch,time,beat*length,.2*p.brass,-.12);
        if(p.energy>.38&&(mode==='nova'||phrase>=1))this.instrument('trumpet',pitch,time+.015,beat*length*.85,.07*p.brass,.25);
      }
      if(mode==='dodge'&&s===14)this.instrument('timpani',root+7,time,.6,.08+p.energy*.05,.1);
      if(mode==='nova'&&p.boss&&s%4===3)this.instrument('horn-stab',root+24,time,.25,.09,.16);
      if(p.urgent&&s%4===3)this.instrument('strings-high',root+48,time,.1,.05,.3);
    }
    sequence(step,time,beat){if(this.mode==='storm')this.stormSequence(step,time,beat);else this.cinematicSequence(step,time,beat);}

  }
  return {create:context=>new Track(context),Track,intensity,dodgeIntensity,stormIntensity,BATTLE_SAMPLES,BATTLE_THEME,SCORES,cinematicIntensity};
});
