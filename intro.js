'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarIntro=api;})(globalThis,()=>{
 const DURATION=30000;
 // One continuous, thirty-second story. The last three seconds are the title reveal.
 const SCENES=[
  {at:0,end:3000,image:'world',title:'Eine Macht. Sieben Wächter.',text:'Der Stern bewahrte das Gleichgewicht der Welten.',fx:'sun'},
  {at:3000,end:6000,image:'guardians',title:'Die Sternenwächter',text:'Solaris · Volt · Polaris · Aegis · Phönix · der Sechste · Nexus',fx:'sun'},
  {at:6000,end:8000,image:'ambition',title:'Einer wollte alles.',text:'Nexus wollte die Macht des Sterns für sich allein.',fx:'corrupt'},
  {at:8000,end:10000,image:'betrayal',title:'Ein Verrat.',text:'Er tötete den sechsten Wächter aus dem Hinterhalt.',fx:'strike'},
  {at:10000,end:11500,image:'fallen',title:'Fünf blieben zurück.',text:'Sie stellten sich ihrem einstigen Gefährten.',fx:'embers'},
  {at:11500,end:14000,image:'battle',title:'Fünf gegen Nexus.',text:'Doch selbst gemeinsam konnten sie ihn nicht besiegen.',fx:'battle'},
  {at:14000,end:16500,image:'banish',title:'Verbannt. Nicht vernichtet.',text:'Mit der Kraft des Sterns sperrten sie ihn in die Leere.',fx:'portal'},
  {at:16500,end:18500,image:'void',title:'In der Leere wuchs seine Macht.',text:'Nexus erschuf die Schattenlegion.',fx:'portal',crop:[.025,.14,.95,.65]},
  {at:18500,end:21500,image:'legion',title:'Eine Armee der Dunkelheit.',text:'Krieger. Bestien. Generäle. Immer neue Angreifer.',fx:'legion',roster:'legion'},
  {at:21500,end:24000,image:'eclipse',title:'Ihr Ziel: der Stern.',text:'Nur seine Energie kann Nexus aus der Leere befreien.',fx:'portal',roster:'bosses'},
  {at:24000,end:27000,image:'battle',title:'Deine Armee. Ihre letzte Hoffnung.',text:'Vereine Sternenkrieger und Helden. Beschütze den Stern.',fx:'battle',roster:'defenders'},
  {at:27000,end:30000,image:'legion',title:'STERNENKRIEGER',text:'DER FALL DES NEXUS',fx:'logo',roster:null}
 ];
 const IMAGES=[...new Set(SCENES.map(s=>s.image))];
 const CAST={guardians:['Solaris','Volt','Polaris','Aegis','Phönix','Der Sechste','Nexus'],warriors:['Schwert','Schild','Sniper','Rakete','Plasma']};
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 function sample(ms){const elapsed=clamp(Number.isFinite(ms)?ms:0,0,DURATION),index=SCENES.findIndex(s=>elapsed<s.end),scene=SCENES[index<0?SCENES.length-1:index];return {scene,index:index<0?SCENES.length-1:index,elapsed,progress:clamp((elapsed-scene.at)/(scene.end-scene.at)),ended:elapsed>=DURATION};}
 function clock(){let elapsed=0,last=null,finished=false;return {step(now,visible=true){if(finished)return sample(DURATION);if(last!==null&&visible)elapsed+=Math.max(0,now-last);last=visible?now:null;const s=sample(elapsed);finished=s.ended;return s;},reset(){elapsed=0;last=null;finished=false;},skip(){elapsed=DURATION;finished=true;return sample(elapsed);}};}
 function mount({onEnd=()=>{},onSound=()=>{}}={}){
  const overlay=document.getElementById('story-intro'),canvas=document.getElementById('intro-canvas'),c=canvas.getContext('2d'),app=document.querySelector('main.app'),skip=document.getElementById('intro-skip'),audioButton=document.getElementById('intro-audio'),title=document.getElementById('intro-title'),caption=document.getElementById('intro-caption'),logo=document.getElementById('intro-logo'),progress=document.getElementById('intro-progress');
  const pictures={};let raf=0,active=false,lastIndex=-1,audio=null,music=null,audible=false,previousFocus=null,narrator=null,audioRequest=0,soundStarted=false,currentElapsed=0;const timeline=clock();
  const ready=Promise.all(IMAGES.map(name=>new Promise(resolve=>{const img=new Image();pictures[name]=img;img.onload=img.onerror=resolve;img.src='./intro-'+name+'.jpg?v=71';})));
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function cover(img,s,p){if(!img?.complete||!img.naturalWidth)return;const crop=s.crop||[0,0,1,1],sx=crop[0]*img.width,sy=crop[1]*img.height,sw=crop[2]*img.width,sh=crop[3]*img.height;const scale=Math.max(1280/sw,720/sh)*(reduced?1:1.025+.045*p),w=sw*scale,h=sh*scale,x=(1280-w)/2+(reduced?0:Math.sin(p*2)*7),y=(720-h)*.43;c.drawImage(img,sx,sy,sw,sh,x,y,w,h);
   // Local foreground motion: a gently moving cloak/arm, separate from the camera move.
   if(!reduced&&['betrayal','battle','banish','legion'].includes(s.image)){c.save();c.beginPath();const poly=s.image==='betrayal'?[[.26,.5],[.46,.27],[.65,.48],[.49,.88],[.25,.93]]:s.image==='legion'?[[.04,.35],[.19,.25],[.32,.56],[.2,.78],[.02,.7]]:[[.02,.6],[.18,.4],[.36,.65],[.31,.96],[.01,.92]];poly.forEach(([px,py],i)=>i?c.lineTo(px*1280,py*720):c.moveTo(px*1280,py*720));c.closePath();c.clip();const sway=Math.sin(p*5)*3;c.drawImage(img,sx,sy,sw,sh,x+sway,y-1,w,h+3);c.restore();}
  }
  function ring(x,y,r,t,color,tilt=.3){c.save();c.translate(x,y);c.rotate(t);c.strokeStyle=color;c.lineWidth=2;c.globalAlpha=.65;c.beginPath();c.ellipse(0,0,r,r*tilt,0,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.fillStyle=color;c.fillRect(Math.cos(a)*r-2,Math.sin(a)*r*tilt-2,4,4);}c.restore();}
  function bolt(x,y,x2,y2,t,color){c.strokeStyle=color;c.lineWidth=2.4;c.shadowBlur=12;c.shadowColor=color;c.beginPath();c.moveTo(x,y);for(let i=1;i<9;i++){const p=i/8;c.lineTo(x+(x2-x)*p+Math.sin(i*31+t*9)*10,y+(y2-y)*p+Math.cos(i*17+t*8)*10);}c.stroke();c.shadowBlur=0;}
  function effects(s,t,p){const gold=s.fx==='sun'||s.fx==='battle'||s.fx==='logo',color=gold?'#ffe0a0':'#d293ff';c.save();c.globalCompositeOperation='screen';
   if(['sun','portal','logo'].includes(s.fx)){const x=s.fx==='sun'?660:650,y=s.fx==='sun'?210:310,r=s.fx==='logo'?140:180;ring(x,y,r,t*.4,color);ring(x,y,r*.85,-t*.53,color,.7);if(!reduced)for(let i=0;i<95;i++){const a=i*.73+t*.7,rr=r*.7+(i%19)*4;c.globalAlpha=.35+(i%5)*.1;c.fillStyle=color;c.fillRect(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.7,2+i%3,2+i%3);}c.globalAlpha=1;if(s.fx==='portal'){const g=c.createRadialGradient(x,y,10,x,y,240);g.addColorStop(0,'#af48ff00');g.addColorStop(.7,'#ac49ff00');g.addColorStop(.85,'#b257ff33');g.addColorStop(1,'#a345ff00');c.fillStyle=g;c.fillRect(x-240,y-240,480,480);}}
   if(!reduced&&['battle','strike','corrupt'].includes(s.fx)){const pulse=.35+.3*Math.sin(t*5);c.globalAlpha=pulse;if(s.fx==='battle'){for(const [x,y,color]of [[130,300,'#ffe7a9'],[210,550,'#7ddcff'],[1080,200,'#ff9d62'],[1100,530,'#ffe5a8']])bolt(x,y,680,360,t,color);}else bolt(480,420,850,290,t,'#dc97ff');c.globalAlpha=1;}
   const count=reduced?10:55;for(let i=0;i<count;i++){const seed=(i*7919%1000)/1000,x=(seed*1280+t*(i%2?9:-6)+12800)%1280,y=(i*199%720-t*(12+i%20)+7200)%720,r=i%8===0?2.5:1;c.globalAlpha=.18+(i%5)*.1;c.fillStyle=color;c.fillRect(x,y,r,r);}
   c.restore();
   if(!reduced&&s.fx==='strike'){const flash=Math.max(0,1-Math.abs(p-.18)*14);c.fillStyle='rgba(222,153,255,'+(flash*.22)+')';c.fillRect(0,0,1280,720);}
  }
  function actor(item,x,y,scale,t,enemy,action='run',alpha=1){
   c.save();c.translate(x,y);c.scale(scale,scale);c.globalAlpha=alpha;
   const unit={...item,skin:enemy?item.id:undefined,type:item.type,hero:enemy?-1:item.hero??-1,id:Math.round(x),hp:1,max:1,face:enemy?-1:1,boss:false,phase:t*5+x*.02,blend:action==='run'?1:0,anim:action==='attack'?{state:'attack',start:Math.floor(t/1.1)*1100,duration:850}:null};
   globalThis.StarStormArt?.drawUnit(c,unit,{x:0,y:0},t*1000,enemy,true);c.restore();
  }
  function choreography(kind,p,t){
   const out=[];const legion=globalThis.StarLegion;if(!legion)return out;
   if(kind==='legion')for(let i=0;i<51;i++){const depth=(i*37%101)/100,item=[...legion.regular,...legion.elite,...legion.mid][i%17];out.push({item,x:((i*197+1000-p*(220+depth*280))%1640+1640)%1640-180,y:500+depth*120+Math.sin(i*47)*9,scale:.75+depth*1.8,enemy:true});}
   if(kind==='bosses')legion.major.forEach((item,i)=>{const depth=[.15,.45,.85,.65,.25][i];out.push({item,x:230+i*205-p*(100+i*22),y:510+depth*100,scale:1.8+depth*.8,enemy:true});});
   if(kind==='defenders'||kind==='combat'){
    for(let i=0;i<(kind==='combat'?10:22);i++){const depth=(i%4)/3;out.push({item:{type:i%5,hero:-1},x:((i*173+p*380)%950)-180,y:510+depth*110,scale:.9+depth*1.25,enemy:false});}
    for(let i=0;i<5;i++){const depth=[.45,.1,.3,.85,.65][i];out.push({item:{type:i,hero:i},x:120+i*130+Math.sin(p*3+i)*45+p*90,y:495+depth*120,scale:1.9+depth*.65,enemy:false,action:'attack'});}
    if(kind==='combat')legion.regular.slice(0,5).forEach((item,i)=>out.push({item,x:1050-i*75-p*150,y:510+(i%3)*50,scale:1.8,enemy:true,action:'attack'}));
   }
   return out.sort((a,b)=>a.y-b.y);
  }
  function burst(x,y,r,p,color){
   if(p<0||p>1)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha=(1-p)*.8;const radius=8+p*r;
   const glow=c.createRadialGradient(x,y,0,x,y,radius);glow.addColorStop(0,'#fff5db');glow.addColorStop(.16,color);glow.addColorStop(1,'#29021d00');c.fillStyle=glow;c.fillRect(x-radius,y-radius,radius*2,radius*2);
   c.strokeStyle=color;c.lineWidth=4*(1-p)+.5;c.beginPath();c.ellipse(x,y,radius,radius*.38,0,0,Math.PI*2);c.stroke();
   for(let i=0;i<23;i++){const a=i*2.399,r1=radius*(.4+(i%4)*.16);c.strokeStyle=i%3?'#ffd8a4':color;c.lineWidth=1.8;c.beginPath();c.moveTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1*.65+p*p*50);c.lineTo(x+Math.cos(a)*(r1+10*(1-p)),y+Math.sin(a)*(r1+10)*.65+p*p*50);c.stroke();}c.restore();
  }
  function combatFX(p,t){
   const shots=[[110,310,760,390,'#ffdf84'],[240,565,850,465,'#70d8ff'],[1020,230,600,410,'#ff8544'],[400,470,930,430,'#c392ff'],[1120,500,650,440,'#db64ff']];
   shots.forEach(([x,y,tx,ty,color],i)=>{const phase=(t*.72+i*.213)%1;
    if(phase<.22){const q=phase/.22;c.save();c.globalAlpha=q;c.fillStyle=color;c.shadowColor=color;c.shadowBlur=25;c.beginPath();c.arc(x,y,3+q*15,0,Math.PI*2);c.fill();c.restore();}
    if(phase>=.22&&phase<.6){const q=(phase-.22)/.38,px=x+(tx-x)*q,py=y+(ty-y)*q;c.save();c.globalCompositeOperation='screen';c.strokeStyle=color;c.lineWidth=5;c.shadowColor=color;c.shadowBlur=18;c.beginPath();c.moveTo(px-(tx-x)*.15,py-(ty-y)*.15);c.lineTo(px,py);c.stroke();c.fillStyle='#fff7e1';c.beginPath();c.arc(px,py,5,0,7);c.fill();c.restore();}
    if(phase>=.6)burst(tx,ty,100,(phase-.6)/.4,color);
   });
   // Distinct moving sword sweeps, plasma spirals and a lightning chain.
   c.save();c.globalCompositeOperation='screen';for(let i=0;i<3;i++){const q=(t*.9+i*.31)%1;if(q<.65){c.strokeStyle=['#ffe7a0','#79d6ff','#ffa15a'][i];c.lineWidth=7*(1-q)+1;c.globalAlpha=Math.sin(q/.65*Math.PI)*.75;c.beginPath();c.ellipse(400+i*130,450+i%2*55,70+q*45,28+q*30,q*3-1,0,Math.PI*1.35);c.stroke();}}
   if((t*.65)%1>.7){c.globalAlpha=.8;bolt(290,470,690,400,t,'#80dcff');bolt(690,400,900,440,t,'#80dcff');}c.restore();
  }
  function roster(scene,t,p){const kind=scene.roster;for(const a of choreography(kind,p,t)){
   actor(a.item,a.x,a.y,a.scale,t,a.enemy,a.action||'run');
   if(!reduced&&a.scale>1.8){c.fillStyle=a.enemy?'#9c4ac624':'#ffbd6524';c.beginPath();c.ellipse(a.x-8,a.y+2,20+Math.sin(t*5+a.x)*8,3,0,0,7);c.fill();}
  }if(!reduced&&kind==='defenders')combatFX(p,t);}
  function render(s){currentElapsed=s.elapsed;const {scene,progress:p,elapsed}=s,t=reduced?0:elapsed/1000;c.clearRect(0,0,1280,720);c.fillStyle='#0b0719';c.fillRect(0,0,1280,720);c.save();if(!reduced&&scene.fx==='battle'){const hit=Math.pow(Math.max(0,Math.sin(t*4.5)),12);c.translate(Math.sin(t*91)*hit*4,Math.cos(t*83)*hit*3);}cover(pictures[scene.image],scene,p);effects(scene,t,p);if(scene.roster)roster(scene,t,p);if(scene.fx==='battle'&&!scene.roster){for(const a of choreography('combat',p,t))actor(a.item,a.x,a.y,a.scale,t,a.enemy,a.action||'run');if(!reduced)combatFX(p,t);}c.restore();
   const vignette=c.createRadialGradient(640,320,200,640,360,800);vignette.addColorStop(0,'#08041100');vignette.addColorStop(1,'#080411b8');c.fillStyle=vignette;c.fillRect(0,0,1280,720);
   const fade=reduced?0:Math.max(0,1-p*9,1-(1-p)*9);if(fade){c.fillStyle='rgba(7,4,15,'+fade+')';c.fillRect(0,0,1280,720);}
   if(lastIndex!==s.index){lastIndex=s.index;overlay.dataset.scene=String(s.index);overlay.dataset.title=scene.title;title.textContent=scene.title;caption.textContent=scene.text;logo.hidden=scene.fx!=='logo';document.getElementById('intro-copy').hidden=scene.fx==='logo';overlay.style.setProperty('--scene-art','url("./intro-'+scene.image+'.jpg?v=71")');}
   progress.style.transform='scaleX('+(elapsed/DURATION)+')';if(music&&audible)music.update(1+Math.floor(elapsed/1800),20000,elapsed*12,{boss:elapsed>21000,phase:elapsed>24000?3:1,rest:elapsed<6000||elapsed>=27000});
  }
  function tick(now){if(!active)return;const s=timeline.step(now,!document.hidden);render(s);if(s.ended){finish();return;}raf=requestAnimationFrame(tick);}
  function duckMusic(){if(music?.bus)music.bus.gain.setTargetAtTime(.14,audio.currentTime,.12);}
  async function toggleAudio(){
   const token=++audioRequest;audible=!audible;onSound(audible);audioButton.setAttribute('aria-pressed',String(audible));
   if(!audible){audioButton.textContent='Ton an';narrator?.stop();music?.pause();return;}
   audioButton.textContent='Stimme lädt …';audioButton.setAttribute('aria-busy','true');
   try{
    audio??=new (window.AudioContext||window.webkitAudioContext)();const resumed=audio.resume();
    music??=StarMusic.create(audio);narrator??=StarIntroAudio.create(audio);music.reset(1,'storm');
    await Promise.all([resumed,narrator.ready,music.prepareStorm()]);
    if(!active||!audible||token!==audioRequest)return;
    if(!soundStarted){timeline.reset();lastIndex=-1;currentElapsed=0;soundStarted=true;render(sample(0));}
    audioButton.textContent='Ton aus';if(!document.hidden){music.play();duckMusic();narrator.play(currentElapsed);}
   }catch{if(token===audioRequest){audible=false;music?.pause();audioButton.textContent='Ton erneut laden';audioButton.setAttribute('aria-pressed','false');}}
   finally{if(token===audioRequest)audioButton.removeAttribute('aria-busy');}
  }
  function finish(){if(!active)return;active=false;timeline.skip();cancelAnimationFrame(raf);++audioRequest;narrator?.stop();music?.pause();audible=false;audioButton.removeAttribute('aria-busy');audioButton.textContent='Mit Ton starten';audioButton.setAttribute('aria-pressed','false');overlay.hidden=true;document.body.classList.remove('intro-open');app.inert=false;onEnd();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
  function play(){if(active)return;previousFocus=document.activeElement;active=true;soundStarted=false;currentElapsed=0;lastIndex=-1;timeline.reset();overlay.hidden=false;document.body.classList.add('intro-open');app.inert=true;render(sample(0));skip.focus({preventScroll:true});raf=requestAnimationFrame(tick);}
  skip.addEventListener('click',finish);audioButton.addEventListener('click',toggleAudio);overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish();}if(e.key==='Tab'){const buttons=[audioButton,skip],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+2)%2].focus();}});
  document.addEventListener('visibilitychange',()=>{timeline.step(performance.now(),false);if(document.hidden){music?.pause();narrator?.stop();}else if(active&&audible&&soundStarted){music?.play();duckMusic();narrator?.play(currentElapsed);}});
  return {play,finish,ready,get active(){return active;}};
 }
 return {DURATION,SCENES,IMAGES,CAST,sample,clock,mount};
});
