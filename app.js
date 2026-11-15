'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const modes=[{id:'tap',name:'Tippen',key:'stars-best',create:()=>StarGame.create()},{id:'dodge',name:'Ausweichen',key:'stars-dodge-best-ms',create:()=>StarDodge.create()},{id:'sling',name:'Sternenschlange',key:'stars-snake-best',create:()=>StarSnake.create()}];
  const records={tap:0,dodge:0,sling:0};let mode=0,sound=true;
  try { modes.forEach(m=>records[m.id]=Math.max(0,Number(localStorage.getItem(m.key))||0));sound=localStorage.getItem('stars-sound')!=='off';mode=Math.max(0,modes.findIndex(m=>m.id===(localStorage.getItem('stars-mode')==='catch'?'dodge':localStorage.getItem('stars-mode')))); } catch {}
  const slinging=()=>modes[mode].id==='sling';
  const dodging=()=>modes[mode].id==='dodge';
  const duration=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0')+','+Math.floor(ms%1000/100);
  const keys=new Set();let pointerAnchor=null;
  let state = 'home', run = StarGame.create(), lastFrame = 0, shownLevel = 1, audio, music;
  const cells = Array.from({length:9}, (_, i) => {
    const button = document.createElement('button'); button.className = 'cell'; button.setAttribute('aria-label', 'Leerer Sternenplatz');
    button.innerHTML = '<svg class="star-art" aria-hidden="true" hidden><use href="#star"/></svg>';
    button.addEventListener('pointerdown', e => { if(e.button !== 0)return; e.preventDefault(); hit(i); });
    button.addEventListener('click', e => { if(e.detail === 0) hit(i); });
    $('board').appendChild(button); return button;
  });
  function screen(name) { ['home','game','result'].forEach(id => $(id).hidden = id !== name); }
  function homeUI(){
    document.dispatchEvent(new CustomEvent('stars-mode',{detail:{mode:modes[mode].id}}));
    const current=modes[mode];$('home-best').textContent=dodging()?duration(records[current.id]):records[current.id];$('mode-name').textContent=current.name;
    $('mode-art').dataset.mode=current.id;$('start').setAttribute('aria-label',current.name+' – endlos spielen');
    $('mode-picker').querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===mode)));
  }
  function chooseMode(index,direction=1){if(state!=='home')return;mode=(index+modes.length)%modes.length;homeUI();$('mode-art').style.setProperty('--slide',direction*22+'px');pulse($('mode-art'),'mode-change');try{localStorage.setItem('stars-mode',modes[mode].id);}catch{}}
  function soundUI() { $('sound-toggle').setAttribute('aria-pressed', String(sound)); $('sound-toggle').setAttribute('aria-label', sound ? 'Ton ausschalten' : 'Ton einschalten'); $('mute-mark').hidden = sound; }
  function unlockAudio() { try { if(!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if(!music)music=StarMusic.create(audio); if(audio.state !== 'running') audio.resume().catch(()=>{}); } catch {} }
  function tone(frequency=650, duration=.12, delay=0, type='sine', volume=.07, end=1.35) {
    if(!sound || !audio) return;
    try { const o = audio.createOscillator(), gain = audio.createGain(), t = audio.currentTime + delay;
      o.type=type; o.frequency.setValueAtTime(frequency,t); o.frequency.exponentialRampToValueAtTime(frequency*end,t+duration);
      gain.gain.setValueAtTime(.001,t); gain.gain.exponentialRampToValueAtTime(volume,t+.008); gain.gain.exponentialRampToValueAtTime(.001,t+duration);
      o.connect(gain); gain.connect(audio.destination); o.start(t); o.stop(t+duration+.01);
    } catch {}
  }
  function catchSound(isBonus) {
    tone(180,.07,0,'sine',.09,.5);
    tone(isBonus?880:660,.17,.015,'sine',.07,1.1);
    tone(isBonus?1320:990,.2,.07,'sine',.045,1.04);
    if(isBonus)tone(1760,.24,.13,'sine',.035,1.02);
  }
  function pulse(element, name) { element.classList.remove(name); void element.offsetWidth; element.classList.add(name); }
  function hearts() {
    $('lives').setAttribute('aria-label', run.lives+' von 3 Leben');
    $('lives').querySelectorAll('span').forEach((heart,i)=>{heart.classList.toggle('lost',i>=run.lives);heart.textContent=i<run.lives?'♥':'♡';});
    $('life-status').textContent=run.lives+' von 3 Leben übrig';
  }
  function clearCell(i) { const cell=cells[i];cell.classList.remove('active','bonus','evil');cell.querySelector('.star-art').setAttribute('hidden','');cell.setAttribute('aria-label','Leerer Sternenplatz'); }
  function clearTarget() { cells.forEach((_,i)=>clearCell(i)); }
  function showStar(i, kind) { const cell=cells[i], svg=cell.querySelector('.star-art');cell.classList.add('active');if(kind!=='good')cell.classList.add(kind);svg.querySelector('use').setAttribute('href',kind==='evil'?'#evil-star':'#star');svg.removeAttribute('hidden');cell.setAttribute('aria-label',kind==='evil'?'Böser Stern: kostet ein Leben':kind==='bonus'?'Gelber Stern: vier Sekunden extra':'Stern fangen: ein Punkt'); }
  function renderBoard() { if(slinging()){renderSling();return;} if(dodging()){renderDodge();return;}clearTarget();if(run.ended)return;showStar(run.target,run.bonus?'bonus':'good');run.badStars.forEach(i=>showStar(i,'evil')); }
  const enemyNodes=new Map();
  function renderDodge(){
    let dustLayer=$('dodge-dust');if(!dustLayer){dustLayer=document.createElement('div');dustLayer.id='dodge-dust';$('dodge-field').appendChild(dustLayer);}
    dustLayer.innerHTML=run.dust.map(s=>'<i style="left:'+s.x*100+'%;top:'+s.y/run.height*100+'%"></i>').join('');
    $('dodge-player').classList.toggle('shielded',run.shield>0);$('dodge-player').classList.toggle('fiery',run.fire>0);
    $('dodge-player').setAttribute('aria-label',run.fire>0?'Feuerstern aktiv':run.shield>0?'Schutzblase aktiv':'Gelber Stern');
    let extras=$('dodge-pickups');if(!extras){extras=document.createElement('div');extras.id='dodge-pickups';$('dodge-field').appendChild(extras);}
    extras.innerHTML=run.pickups.map(item=>'<span class="dodge-pickup '+item.kind+'" style="left:'+item.x*100+'%;top:'+item.y/run.height*100+'%">'+'<svg viewBox="0 0 40 40" aria-hidden="true"><path class="power-core" d="'+(item.kind==='fire'?'M22 5c2 8-6 10-3 16 2-2 4-5 4-8 7 6 10 11 7 17-3 7-16 8-20 0-3-6 1-12 6-17-1 6 0 9 2 10-2-8 4-12 4-18Z':'M20 6c7 0 13 6 13 13s-6 14-13 15C13 33 7 26 7 19S13 6 20 6Z')+'"/><path class="power-detail" d="'+(item.kind==='fire'?'M20 24c4 4 5 7 0 9-5-2-4-5 0-9Z':'M12 19a8 8 0 0 1 8-8M28 21a8 8 0 0 1-5 7')+'"/><path class="power-spark" d="m32 5 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/></svg>'+'</span>').join('');
    const ids=new Set(run.enemies.map(e=>e.id));
    for(const [id,node]of enemyNodes)if(!ids.has(id)){node.remove();enemyNodes.delete(id);}
    for(const enemy of run.enemies){
      let node=enemyNodes.get(enemy.id);
      if(!node){node=document.createElement('div');node.className='dodge-enemy type-'+enemy.type;node.innerHTML='<span class="enemy-orbit"></span><span class="dash-ray"></span><svg aria-hidden="true"><use href="#evil-star"/></svg>';$('dodge-enemies').appendChild(node);enemyNodes.set(enemy.id,node);}
      const warning=enemy.warning>0,aiming=enemy.type===3&&enemy.age<1200;
      node.classList.toggle('warning',warning);node.classList.toggle('aiming',aiming&&!warning);node.classList.toggle('locked',enemy.locked);node.classList.toggle('splitting',enemy.type===4&&!enemy.shard&&enemy.age>1200);node.classList.toggle('shard',enemy.shard);
      const x=warning||aiming?Math.max(.055,Math.min(.945,enemy.x)):enemy.x;
      const y=warning||aiming?Math.max(.055,Math.min(run.height-.055,enemy.y)):enemy.y;
      node.style.left=x*100+'%';node.style.top=y/run.height*100+'%';node.style.setProperty('--rotation',enemy.rotation+'deg');node.style.setProperty('--heading',enemy.angle+'rad');
    }
    $('dodge-player').style.left=run.player.x*100+'%';$('dodge-player').style.top=run.player.y/run.height*100+'%';$('dodge-player').classList.toggle('protected',run.grace>0);
    $('dodge-types').querySelectorAll('svg').forEach((icon,i)=>icon.classList.toggle('unlocked',i<run.available));
    $('dodge-types').setAttribute('aria-label',run.available+' von 5 Gegnerarten aktiv');
  }
  function renderHUD() {
    music?.update(run.level,run.remaining,run.elapsed);
    $('score').textContent=dodging()?duration(run.elapsed):run.score;
    if(!dodging()&&!slinging()){$('time').textContent=Math.ceil(run.remaining/1000);$('time-bar').style.width=Math.min(100,run.remaining/StarGame.START_MS*100)+'%';}
    $('game').classList.toggle('urgent',!dodging()&&run.remaining<=5000);
    $('level').textContent='Lv. '+run.level;$('level').setAttribute('aria-label','Schwierigkeitsstufe '+run.level);
    if(run.level>shownLevel){pulse($('level'),'level-up');shownLevel=run.level;}
  }
  function advance(now) {
    const dt=Math.max(0,now-lastFrame),previousTarget=run.target;
    if(dodging()&&keys.size){let x=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a')),y=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));const norm=Math.hypot(x,y)||1;run.move(run.player.x+x/norm*dt/1000*2,run.player.y+y/norm*dt/1000*2);}
    const events=run.tick(dt);lastFrame=now;renderHUD();
    if(dodging()){for(const event of events)dodgeFeedback(event);renderDodge();}
    if(run.ended){if(dodging()||slinging()){state='ending';music?.pause();setTimeout(()=>{if(state==='ending')finish(run.reason);},380);}else finish(run.reason);return false;}
    if(slinging()){for(const event of events){if(event.kind==='hit')catchSound(false);if(event.kind==='loop'){tone(523,.15);tone(784,.2,.07);tone(1047,.32,.14);$('encouragement').textContent='Schleife! '+event.score+' Punkte und '+event.captured+' rote Sterne eingefangen';}if(event.kind==='comet'){tone(660,.15);tone(990,.2,.08);tone(1320,.3,.16);$('encouragement').textContent='Sternbild vollendet! Sechs Sekunden Kometenrausch, doppelte Punkte und Schutz';}if(event.kind==='burn')tone(280,.1,0,'sine',.04,2);if(event.kind==='clear'){tone(880,.2);tone(1320,.25,.1);}if(event.kind==='bad'){hearts();tone(160,.2,0,'triangle',.05,.5);}}renderSling();}
    if(!dodging()&&!slinging()&&previousTarget!==run.target)renderBoard();return true;
  }
  function dodgeFeedback(event){
    if(event.kind==='unlock'){
      $('dodge-announcement').textContent=StarDodge.TYPES[event.type].name;pulse($('dodge-announcement'),'announce');
      $('encouragement').textContent=StarDodge.TYPES[event.type].name+' kommen hinzu';tone(440,.12,0,'sine',.04,1.5);tone(660,.18,.1,'sine',.035,1.1);return;
    }
    if(event.kind==='destroy'){
      const cloud=document.createElement('span');cloud.className='dust-cloud';cloud.style.left=event.x*100+'%';cloud.style.top=event.y/run.height*100+'%';
      for(let i=0;i<12;i++){const dot=document.createElement('i'),angle=i*Math.PI/6;dot.style.setProperty('--dx',Math.cos(angle)*(22+i%3*9)+'px');dot.style.setProperty('--dy',Math.sin(angle)*(22+i%3*9)+'px');cloud.appendChild(dot);}
      $('dodge-effects').appendChild(cloud);setTimeout(()=>cloud.remove(),700);tone(600,.08,0,'sine',.025,1.6);
    }
    const ring=document.createElement('span');ring.className='dodge-impact '+event.kind;ring.style.left=event.x*100+'%';ring.style.top=event.y/run.height*100+'%';$('dodge-effects').appendChild(ring);setTimeout(()=>ring.remove(),650);
    if(['shield','fire'].includes(event.kind)){tone(event.kind==='fire'?880:660,.25);$('encouragement').textContent=event.kind==='fire'?'Feuerstern: zehn Sekunden unbesiegbar':'Schutzblase: zwanzig Sekunden oder ein Treffer';}
    if(event.kind==='hit'){hearts();pulse($('lives'),'heart-hit');pulse($('dodge-field'),'field-hit');tone(150,.18,0,'triangle',.06,.45);$('encouragement').textContent='Ein Leben verloren';}
    else if(event.kind==='split')tone(500,.06,0,'sine',.022,1.5);
  }
  function burst(i, points, isBonus, evil=false) {
    const effect=document.createElement('span');effect.className='burst'+(evil?' danger-burst':isBonus?' gold-burst':'');effect.setAttribute('aria-hidden','true');
    const art=cells[i].querySelector('.star-art').cloneNode(true);art.removeAttribute('hidden');art.classList.remove('star-art');art.classList.add('caught-star');effect.appendChild(art);
    const ring=document.createElement('span');ring.className='hit-ring';effect.appendChild(ring);
    const label=document.createElement('span');label.className='points';label.textContent=evil?'−1 ♥':isBonus?'+4 s':'+'+points;effect.appendChild(label);
    for(let n=0;n<(evil?5:10);n++){const dot=document.createElement('span');dot.className='particle';dot.textContent=n%3===0?'✦':'•';const angle=n*Math.PI*2/(evil?5:10);const distance=(isBonus?65:49)+(n%3)*6;dot.style.setProperty('--dx',Math.cos(angle)*distance+'px');dot.style.setProperty('--dy',Math.sin(angle)*distance+'px');dot.style.setProperty('--spin',(n%2?160:-140)+'deg');effect.appendChild(dot);}
    cells[i].appendChild(effect);setTimeout(()=>effect.remove(),750);
  }
  function hit(i) {
    if(dodging()||slinging()||state!=='playing'||!advance(performance.now()))return;
    const event=run.hit(i);if(event.kind==='none')return;
    const gold=event.kind==='gold',evil=event.kind==='bad';
    burst(i,event.points,gold,evil);renderHUD();hearts();
    if(evil){pulse($('lives'),'heart-hit');pulse($('board'),'board-hit');tone(190,.2,0,'triangle',.065,.5);$('encouragement').textContent='Ein Leben verloren';}
    else{catchSound(gold);pulse($('score'),'score-pop');if(gold)pulse($('time'),'time-gain');$('encouragement').textContent=gold?'Vier Sekunden dazu':'Stern gefangen';}
    renderBoard();
    if(run.ended){state='ending';music?.pause();setTimeout(()=>{if(state==='ending')finish(run.reason);},550);}
  }
  function start() {
    unlockAudio();run=modes[mode].create();music?.reset(1,slinging()?'dodge':modes[mode].id);shownLevel=1;keys.clear();pointerAnchor=null;hearts();
    cells.forEach(cell=>cell.querySelectorAll('.burst').forEach(effect=>effect.remove()));enemyNodes.clear();$('dodge-enemies').replaceChildren();$('dodge-effects').replaceChildren();
    $('sling-field').hidden=!slinging();$('sling-hint').hidden=!slinging();$('sling-shots').hidden=!slinging();$('game').classList.toggle('sling-mode',slinging());$('board').hidden=dodging()||slinging();$('dodge-field').hidden=!dodging();$('dodge-hint').hidden=!dodging();$('dodge-types').hidden=!dodging();$('game').classList.toggle('dodge-mode',dodging());
    $('score').parentElement.setAttribute('aria-label',dodging()?'Überlebenszeit':'Punkte');$('dodge-hint').classList.remove('learned');$('dodge-announcement').textContent='';
    screen('game');if(dodging()){const box=$('dodge-field').getBoundingClientRect();run.resize(box.width,box.height);}
    
    renderHUD();$('encouragement').textContent=slinging()?'Überall wischen. Sterne sammeln und die eigene Kette kreuzen: Schleifen fangen rote Sterne. Große Schleifen geben mehr Punkte.':dodging()?'Gelben Stern frei bewegen und ausweichen.':'Gelbe Sterne verlängern die Zeit';state='playing';if(sound)music?.play();lastFrame=performance.now();renderBoard();
  }
  function finish(reason='time') {
    state='result';music?.pause();keys.clear();pointerAnchor=null;clearTarget();const current=modes[mode],record=run.score>records[current.id];if(record){records[current.id]=run.score;try{localStorage.setItem(current.key,String(run.score));}catch{}}
    document.dispatchEvent(new CustomEvent('stars-result',{detail:{mode:current.id,score:run.score}}));homeUI();$('final-score').textContent=dodging()?duration(run.score):run.score;$('final-score').parentElement.setAttribute('aria-label',dodging()?'Überlebenszeit':'Gesammelte Sterne');$('result').classList.toggle('dodge-result',dodging());
    $('result-title').textContent=dodging()?'Überlebt':reason==='lives'?'Alle Herzen verbraucht':reason==='time'?'Zeit abgelaufen':record?'Neuer Rekord':'Runde beendet';
    $('record-message').textContent=record?'Neuer Rekord · '+current.name:'Rekord '+(dodging()?duration(records[current.id]):records[current.id])+' · '+current.name;
    screen('result');if(reason!=='lives')tone(850,.25);$('again').focus({preventScroll:true});
  }
  function pause() { if(state!=='playing'||!advance(performance.now()))return;state='paused';keys.clear();pointerAnchor=null;music?.pause();$('pause-dialog').showModal(); }
  function resume() { $('pause-dialog').close();if(state==='paused'){unlockAudio();state='playing';if(sound)music?.play();lastFrame=performance.now();} }
  function frame(now) { document.body.classList.toggle('snake-playing',slinging()&&state==='playing');if(state==='playing')advance(now);else lastFrame=now;requestAnimationFrame(frame); }
  $('start').addEventListener('click',start);$('again').addEventListener('click',start);
  $('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);
  $('pause-dialog').addEventListener('cancel',e=>{e.preventDefault();resume();});
  $('quit').addEventListener('click',()=>{$('pause-dialog').close();finish('quit');});
  $('back-home').addEventListener('click',()=>{state='home';homeUI();screen('home');});
  $('sound-toggle').addEventListener('click',()=>{sound=!sound;unlockAudio();soundUI();try{localStorage.setItem('stars-sound',sound?'on':'off');}catch{}if(sound){if(state==='playing')music?.play();catchSound(false);}else music?.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
  $('mode-picker').querySelectorAll('button').forEach((button,i)=>button.addEventListener('click',()=>chooseMode(i)));
  let swipe=null,suppressClickUntil=0,dragging=null;
  $('home').addEventListener('pointerdown',e=>{suppressClickUntil=0;if(e.isPrimary&&e.button===0)swipe={id:e.pointerId,x:e.clientX,y:e.clientY};});
  $('home').addEventListener('pointermove',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.3)$('home').setPointerCapture(e.pointerId);});
  $('home').addEventListener('pointerup',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.3){suppressClickUntil=performance.now()+400;chooseMode(mode+(dx>0?1:-1),Math.sign(dx));}});
  $('home').addEventListener('pointercancel',()=>swipe=null);
  $('home').addEventListener('click',e=>{if(e.detail!==0&&performance.now()<suppressClickUntil){suppressClickUntil=0;e.preventDefault();e.stopImmediatePropagation();}},true);
  $('home').addEventListener('keydown',e=>{if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&state==='home'){e.preventDefault();chooseMode(mode+(e.key==='ArrowRight'?1:-1));}});
  function steer(e){
    if(!pointerAnchor||!dodging()||state!=='playing'||!advance(performance.now()))return;
    const box=$('dodge-field').getBoundingClientRect();run.move(pointerAnchor.x+(e.clientX-pointerAnchor.clientX)/box.width,pointerAnchor.y+(e.clientY-pointerAnchor.clientY)/box.width);$('dodge-hint').classList.add('learned');
  }
  $('dodge-field').addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||!dodging()||state!=='playing')return;e.preventDefault();if(!advance(performance.now()))return;dragging=e.pointerId;pointerAnchor={clientX:e.clientX,clientY:e.clientY,x:run.player.x,y:run.player.y};$('dodge-field').setPointerCapture(e.pointerId);});
  $('dodge-field').addEventListener('pointermove',e=>{if(e.pointerId===dragging)steer(e);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])$('dodge-field').addEventListener(name,()=>{dragging=null;pointerAnchor=null;});
  const controls=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'];
  document.addEventListener('keydown',e=>{if(dodging()&&state==='playing'&&controls.includes(e.key)){e.preventDefault();keys.add(e.key);$('dodge-hint').classList.add('learned');}});
  document.addEventListener('keyup',e=>{keys.delete(e.key);});window.addEventListener('blur',()=>keys.clear());
  window.addEventListener('resize',()=>{if(dodging()&&['playing','paused'].includes(state)){const box=$('dodge-field').getBoundingClientRect();run.resize(box.width,box.height);pointerAnchor=null;}});
  let slingAim=null;
  const snakeNodes=[];
  function renderSling(){
    hearts();$('sling-player').setAttribute('hidden','');
    let ribbon=$('snake-ribbon');if(!ribbon){ribbon=document.createElementNS('http://www.w3.org/2000/svg','svg');ribbon.id='snake-ribbon';ribbon.setAttribute('viewBox','0 0 13 13');ribbon.setAttribute('aria-hidden','true');ribbon.innerHTML='<path/>';$('sling-field').prepend(ribbon);}
    const points=run.positions,paths=[];
    for(let i=1;i<points.length;i++){const a={x:points[i-1].x+.5,y:points[i-1].y+.5},b={x:points[i].x+.5,y:points[i].y+.5};if(b.x-a.x>6.5)b.x-=13;if(b.x-a.x<-6.5)b.x+=13;if(b.y-a.y>6.5)b.y-=13;if(b.y-a.y<-6.5)b.y+=13;for(const dx of [-13,0,13])for(const dy of [-13,0,13])paths.push('M'+(a.x+dx)+','+(a.y+dy)+'L'+(b.x+dx)+','+(b.y+dy));}
    ribbon.firstElementChild.setAttribute('d',paths.join(' '));$('sling-field').classList.toggle('comet-rush',run.rush>0);
    let constellation=$('snake-constellation');if(!constellation){constellation=document.createElement('div');constellation.id='snake-constellation';constellation.setAttribute('aria-label','Sternbild-Fortschritt');$('sling-shots').after(constellation);}
    const echo=run.echo&&run.echo.until>run.elapsed?run.echo:null;
    constellation.textContent=echo?'+'+echo.score+(echo.captured?' · '+echo.captured+' eingefangen':' · Sternbild'):run.rush>0?'Sternenrausch':run.combo>1&&run.elapsed-run.lastLoop<14000?'Schleifen ×'+run.combo:'Schließe eine Schleife';
    constellation.setAttribute('aria-label',constellation.textContent);
    let bloom=$('snake-bloom');if(!bloom){bloom=document.createElementNS('http://www.w3.org/2000/svg','svg');bloom.id='snake-bloom';bloom.setAttribute('viewBox','0 0 13 13');bloom.innerHTML='<path/>';$('sling-field').append(bloom);}
    const d=echo?'M'+echo.points.map(p=>(p.x+.5)+','+(p.y+.5)).join('L')+'Z':'';
    bloom.firstElementChild.setAttribute('d',d);bloom.style.opacity=echo?Math.min(1,(echo.until-run.elapsed)/700):0;
    const items=[];
    run.positions.forEach((p,i)=>{
      const cls=i===0?'head':'tail';items.push({...p,cls});
      // Mirror at the seam so a star slides out and reappears without crossing the board.
      if(p.x<0)items.push({...p,x:p.x+13,cls});if(p.x>12)items.push({...p,x:p.x-13,cls});
      if(p.y<0)items.push({...p,y:p.y+13,cls});if(p.y>12)items.push({...p,y:p.y-13,cls});
    });
    if(run.food)items.push({...run.food,cls:run.gold?'gold':'food'});run.bonuses.forEach(p=>items.push({...p,cls:'food'}));
    run.hazards.forEach(p=>{items.push({...p,cls:'evil'+(p.wake>run.elapsed?' waking':'')});if(p.target)items.push({...p.target,cls:'warning'});});
    items.forEach((item,i)=>{
      let node=snakeNodes[i];if(!node||!node.isConnected){node=document.createElementNS('http://www.w3.org/2000/svg','svg');node.innerHTML='<use/>';$('sling-targets').appendChild(node);snakeNodes[i]=node;}
      node.removeAttribute('hidden');node.setAttribute('class','snake-star '+item.cls);node.style.left=(item.x+.5)/13*100+'%';node.style.top=(item.y+.5)/13*100+'%';node.firstElementChild.setAttribute('href',item.cls.startsWith('evil')||item.cls==='warning'?'#evil-star':'#star');
    });
    for(let i=items.length;i<snakeNodes.length;i++)snakeNodes[i].setAttribute('hidden','');
    $('sling-shots').textContent=run.loops+' ◌';$('sling-shots').setAttribute('aria-label','Sternenkette mit '+run.snake.length+' Sternen');
  }
  let snakeSwipe=null;
  document.addEventListener('pointerdown',e=>{if(slinging()&&state==='playing'&&e.isPrimary&&!e.target.closest('button,dialog,input')){e.preventDefault();snakeSwipe={id:e.pointerId,x:e.clientX,y:e.clientY};document.body.setPointerCapture(e.pointerId);}});
  document.addEventListener('pointermove',e=>{if(!slinging()||state!=='playing'||!snakeSwipe||snakeSwipe.id!==e.pointerId)return;const dx=e.clientX-snakeSwipe.x,dy=e.clientY-snakeSwipe.y;if(Math.hypot(dx,dy)<14)return;run.turn(Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0,Math.abs(dy)>=Math.abs(dx)?Math.sign(dy):0);snakeSwipe.x=e.clientX;snakeSwipe.y=e.clientY;});
  for(const event of ['pointerup','pointercancel'])document.addEventListener(event,()=>snakeSwipe=null);
  document.addEventListener('touchmove',e=>{if(slinging()&&state==='playing')e.preventDefault();},{passive:false});
  document.addEventListener('keydown',e=>{if(!slinging()||state!=='playing')return;const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]};if(dirs[e.key]){e.preventDefault();run.turn(...dirs[e.key]);}});
  homeUI();soundUI();hearts();requestAnimationFrame(frame);
})();
