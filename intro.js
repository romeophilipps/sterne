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
  const pictures={};let raf=0,active=false,lastIndex=-1,audio=null,music=null,audible=false,previousFocus=null;const timeline=clock();
  const ready=Promise.all(IMAGES.map(name=>new Promise(resolve=>{const img=new Image();pictures[name]=img;img.onload=img.onerror=resolve;img.src='./intro-'+name+'.jpg?v=44';})));
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function cover(img,s,p){if(!img?.complete||!img.naturalWidth)return;const crop=s.crop||[0,0,1,1],sx=crop[0]*img.width,sy=crop[1]*img.height,sw=crop[2]*img.width,sh=crop[3]*img.height;const scale=Math.max(1280/sw,720/sh)*(reduced?1:1.025+.045*p),w=sw*scale,h=sh*scale,x=(1280-w)/2+(reduced?0:Math.sin(p*2)*7),y=(720-h)*.43;c.drawImage(img,sx,sy,sw,sh,x,y,w,h);
   // Local foreground motion: a gently moving cloak/arm, separate from the camera move.
   if(!reduced&&['betrayal','battle','banish','legion'].includes(s.image)){c.save();c.beginPath();const poly=s.image==='betrayal'?[[.26,.5],[.46,.27],[.65,.48],[.49,.88],[.25,.93]]:s.image==='legion'?[[.04,.35],[.19,.25],[.32,.56],[.2,.78],[.02,.7]]:[[.02,.6],[.18,.4],[.36,.65],[.31,.96],[.01,.92]];poly.forEach(([px,py],i)=>i?c.lineTo(px*1280,py*720):c.moveTo(px*1280,py*720));c.closePath();c.clip();const sway=Math.sin(p*5)*3;c.drawImage(img,sx,sy,sw,sh,x+sway,y-1,w,h+3);c.restore();}
  }
  function ring(x,y,r,t,color,tilt=.3){c.save();c.translate(x,y);c.rotate(t);c.strokeStyle=color;c.lineWidth=2;c.globalAlpha=.65;c.beginPath();c.ellipse(0,0,r,r*tilt,0,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.fillStyle=color;c.fillRect(Math.cos(a)*r-2,Math.sin(a)*r*tilt-2,4,4);}c.restore();}
  function bolt(x,y,x2,y2,t,color){c.strokeStyle=color;c.lineWidth=2.4;c.shadowBlur=12;c.shadowColor=color;c.beginPath();c.moveTo(x,y);for(let i=1;i<9;i++){const p=i/8;c.lineTo(x+(x2-x)*p+Math.sin(i*31+t*9)*10,y+(y2-y)*p+Math.cos(i*17+t*8)*10);}c.stroke();c.shadowBlur=0;}
  function effects(s,t,p){const gold=s.fx==='sun'||s.fx==='battle'||s.fx==='logo',color=gold?'#ffe0a0':'#d293ff';c.save();c.globalCompositeOperation='screen';
   if(['sun','portal','logo'].includes(s.fx)){const x=s.fx==='sun'?660:650,y=s.fx==='sun'?210:310,r=s.fx==='logo'?140:180;ring(x,y,r,t*.16,color);ring(x,y,r*.85,-t*.23,color,.7);if(s.fx==='portal'){const g=c.createRadialGradient(x,y,10,x,y,240);g.addColorStop(0,'#af48ff00');g.addColorStop(.7,'#ac49ff00');g.addColorStop(.85,'#b257ff33');g.addColorStop(1,'#a345ff00');c.fillStyle=g;c.fillRect(x-240,y-240,480,480);}}
   if(!reduced&&['battle','strike','corrupt'].includes(s.fx)){const pulse=.35+.3*Math.sin(t*5);c.globalAlpha=pulse;if(s.fx==='battle'){for(const [x,y,color]of [[130,300,'#ffe7a9'],[210,550,'#7ddcff'],[1080,200,'#ff9d62'],[1100,530,'#ffe5a8']])bolt(x,y,680,360,t,color);}else bolt(480,420,850,290,t,'#dc97ff');c.globalAlpha=1;}
   const count=reduced?10:55;for(let i=0;i<count;i++){const seed=(i*7919%1000)/1000,x=(seed*1280+t*(i%2?9:-6)+12800)%1280,y=(i*199%720-t*(12+i%20)+7200)%720,r=i%8===0?2.5:1;c.globalAlpha=.18+(i%5)*.1;c.fillStyle=color;c.fillRect(x,y,r,r);}
   c.restore();
   if(!reduced&&s.fx==='strike'){const flash=Math.max(0,1-Math.abs(p-.18)*14);c.fillStyle='rgba(222,153,255,'+(flash*.22)+')';c.fillRect(0,0,1280,720);}
  }
  function spriteRow(list,y,t,enemies){const n=list.length,gap=Math.min(140,1120/n),start=640-gap*(n-1)/2;list.forEach((item,i)=>{const x=start+i*gap;c.save();c.translate(x,y);c.scale(1.65,1.65);const anim={state:'attack',start:Math.floor(t/1.7)*1700,duration:700};const unit=enemies?{...item,skin:item.id,id:i,hp:1,max:1,face:-1,hero:-1,boss:false,phase:t*3,blend:0,anim}:{type:item.type,hero:item.hero??-1,id:i,hp:1,max:1,face:1,blend:.4,phase:t*4,anim};globalThis.StarStormArt?.drawUnit(c,unit,{x:0,y:0},t*1000,enemies);c.restore();c.fillStyle='#f5e7ff';c.font='500 15px system-ui';c.textAlign='center';c.fillText(item.name,x,y+24);});}
  function roster(s,t){const legion=globalThis.StarLegion;if(!legion)return;c.fillStyle='#090615c9';c.fillRect(0,290,1280,330);
   if(s.roster==='legion'){spriteRow([...legion.regular,...legion.elite],440,t,true);spriteRow(legion.mid,565,t,true);}
   if(s.roster==='bosses'){spriteRow(legion.major,495,t,true);}
   if(s.roster==='defenders'){spriteRow(CAST.warriors.map((name,type)=>({name,type})),430,t,false);spriteRow(CAST.guardians.slice(0,5).map((name,hero)=>({name,type:hero,hero})),565,t,false);}
  }
  function render(s){const {scene,progress:p,elapsed}=s,t=reduced?0:elapsed/1000;c.clearRect(0,0,1280,720);c.fillStyle='#0b0719';c.fillRect(0,0,1280,720);c.save();cover(pictures[scene.image],scene,p);effects(scene,t,p);if(scene.roster)roster(scene,t);c.restore();
   const vignette=c.createRadialGradient(640,320,200,640,360,800);vignette.addColorStop(0,'#08041100');vignette.addColorStop(1,'#080411b8');c.fillStyle=vignette;c.fillRect(0,0,1280,720);
   const fade=reduced?0:Math.max(0,1-p*9,1-(1-p)*9);if(fade){c.fillStyle='rgba(7,4,15,'+fade+')';c.fillRect(0,0,1280,720);}
   if(lastIndex!==s.index){lastIndex=s.index;overlay.dataset.scene=String(s.index);overlay.dataset.title=scene.title;title.textContent=scene.title;caption.textContent=scene.text;logo.hidden=scene.fx!=='logo';document.getElementById('intro-copy').hidden=scene.fx==='logo';overlay.style.setProperty('--scene-art','url("./intro-'+scene.image+'.jpg?v=44")');}
   progress.style.transform='scaleX('+(elapsed/DURATION)+')';if(music&&audible)music.update(1+Math.floor(elapsed/1800),20000,elapsed*12,{boss:elapsed>21000,phase:elapsed>24000?3:1,rest:elapsed<6000||elapsed>=27000});
  }
  function tick(now){if(!active)return;const s=timeline.step(now,!document.hidden);render(s);if(s.ended){finish();return;}raf=requestAnimationFrame(tick);}
  async function toggleAudio(){audible=!audible;onSound(audible);audioButton.setAttribute('aria-pressed',String(audible));audioButton.textContent=audible?'Ton aus':'Ton an';if(!audible){music?.pause();return;}try{audio??=new (window.AudioContext||window.webkitAudioContext)();music??=StarMusic.create(audio);const track=music;track.reset(1,'storm');await audio.resume();await track.prepareStorm();if(active&&audible)track.play();}catch{audible=false;audioButton.textContent='Ton an';audioButton.setAttribute('aria-pressed','false');}}
  function finish(){if(!active)return;active=false;timeline.skip();cancelAnimationFrame(raf);music?.pause();audible=false;audioButton.textContent='Ton an';audioButton.setAttribute('aria-pressed','false');overlay.hidden=true;document.body.classList.remove('intro-open');app.inert=false;onEnd();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
  function play(){if(active)return;previousFocus=document.activeElement;active=true;lastIndex=-1;timeline.reset();overlay.hidden=false;document.body.classList.add('intro-open');app.inert=true;render(sample(0));skip.focus({preventScroll:true});raf=requestAnimationFrame(tick);}
  skip.addEventListener('click',finish);audioButton.addEventListener('click',toggleAudio);overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish();}if(e.key==='Tab'){const buttons=[audioButton,skip],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+2)%2].focus();}});
  document.addEventListener('visibilitychange',()=>{timeline.step(performance.now(),false);if(document.hidden)music?.pause();else if(active&&audible)music?.play();});
  return {play,finish,ready,get active(){return active;}};
 }
 return {DURATION,SCENES,IMAGES,CAST,sample,clock,mount};
});
