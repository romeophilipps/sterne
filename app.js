'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const modes=[{id:'tap',name:'Tippen',key:'stars-best',create:()=>StarGame.create()},{id:'catch',name:'Fangen',key:'stars-catch-best',create:()=>StarCatch.create()}];
  const records={tap:0,catch:0};let mode=0,sound=true;
  try { modes.forEach(m=>records[m.id]=Math.max(0,Number(localStorage.getItem(m.key))||0));sound=localStorage.getItem('stars-sound')!=='off';mode=Math.max(0,modes.findIndex(m=>m.id===localStorage.getItem('stars-mode'))); } catch {}
  const catching=()=>modes[mode].id==='catch';
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
    const current=modes[mode];$('home-best').textContent=records[current.id];$('mode-name').textContent=current.name;
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
  function renderBoard() { if(catching()){renderCatch();return;}clearTarget();if(run.ended)return;showStar(run.target,run.bonus?'bonus':'good');run.badStars.forEach(i=>showStar(i,'evil')); }
  const fallingNodes=new Map();
  function renderCatch(){
    const visible=new Set(run.stars.map(star=>star.id));
    for(const [id,node]of fallingNodes)if(!visible.has(id)){node.remove();fallingNodes.delete(id);}
    for(const star of run.stars){
      let node=fallingNodes.get(star.id);
      if(!node){node=document.createElementNS('http://www.w3.org/2000/svg','svg');node.classList.add('falling-star',star.kind);node.setAttribute('aria-hidden','true');node.innerHTML='<use href="'+(star.kind==='bad'?'#evil-star':'#star')+'"/>';$('falling-stars').appendChild(node);fallingNodes.set(star.id,node);}
      node.hidden=star.age<0;node.style.left=star.x*100+'%';node.style.top=star.y*100+'%';node.style.width=star.size*100+'%';node.style.setProperty('--turn',(star.rotation+star.spin*Math.max(0,star.age)/star.duration)+'deg');
    }
    $('catcher').style.left=run.player*100+'%';$('catcher').style.setProperty('--tilt',run.tilt+'deg');$('catch-field').setAttribute('aria-valuenow',Math.round(run.player*100));
    $('catch-field').classList.toggle('rushing',run.rush>0);$('catcher').classList.toggle('protected',run.grace>0);
    $('catch-chain').setAttribute('aria-label',run.rush>0?'Sternenrausch: Magnet und doppelte Punkte':run.combo+' von 6 Treffern bis zum Sternenrausch');
    $('catch-chain').classList.toggle('rushing',run.rush>0);$('catch-chain').style.setProperty('--rush-left',run.rush/StarCatch.RUSH_MS);
    $('catch-chain').querySelectorAll('i').forEach((dot,i)=>dot.classList.toggle('lit',i<run.combo));
  }
  function renderHUD() {
    music?.update(run.level,run.remaining);
    $('score').textContent=run.score;$('time').textContent=Math.ceil(run.remaining/1000);
    $('time-bar').style.width=Math.min(100,run.remaining/StarGame.START_MS*100)+'%';
    $('game').classList.toggle('urgent',run.remaining<=5000);
    $('level').textContent='Lv. '+run.level;$('level').setAttribute('aria-label','Schwierigkeitsstufe '+run.level);
    if(run.level>shownLevel){pulse($('level'),'level-up');shownLevel=run.level;}
  }
  function advance(now) {
    const previousTarget=run.target,events=run.tick(Math.max(0,now-lastFrame));lastFrame=now;renderHUD();
    if(catching()){for(const event of events)catchFeedback(event);renderCatch();}
    if(run.ended){finish(run.reason);return false;}if(!catching()&&previousTarget!==run.target)renderBoard();return true;
  }
  function catchFeedback(event){
    if(event.kind==='miss')return;
    const field=$('catch-effects'),effect=document.createElement('span');effect.className='catch-pop '+event.kind;effect.style.left=event.x*100+'%';effect.setAttribute('aria-hidden','true');
    effect.textContent=event.kind==='gold'?'+4 s':event.kind==='bad'?'−1 ♥':event.kind==='rush'?'✦ ×2':'+'+event.points;field.appendChild(effect);setTimeout(()=>effect.remove(),750);
    const splash=document.createElement('span');splash.className='catch-splash '+event.kind;splash.style.left=event.x*100+'%';
    const ring=document.createElement('i');ring.className='catch-ring';splash.appendChild(ring);
    for(let i=0;i<8;i++){const dot=document.createElement('i'),angle=i*Math.PI/4;dot.style.setProperty('--dx',Math.cos(angle)*(25+i%3*10)+'px');dot.style.setProperty('--dy',(Math.sin(angle)*30-15)+'px');dot.style.setProperty('--delay',i%3*15+'ms');splash.appendChild(dot);}
    field.appendChild(splash);setTimeout(()=>splash.remove(),650);
    if(event.kind==='bad'){hearts();pulse($('lives'),'heart-hit');pulse($('catcher'),'catcher-hit');pulse($('catch-field'),'field-hit');tone(190,.2,0,'triangle',.065,.5);$('encouragement').textContent='Ein Leben verloren';}
    else if(event.kind==='rush'){tone(660,.12);tone(990,.15,.07);tone(1320,.24,.15);$('encouragement').textContent='Sternenrausch! Magnet und doppelte Punkte';}
    else if(event.kind==='dodge'){tone(1100,.07,0,'sine',.035,1.25);pulse($('score'),'score-pop');}
    else{tone(460*Math.pow(1.122,event.boosted?7:Math.min(6,event.combo)),.13,0,'sine',.075,1.04);tone(180,.06,0,'sine',.07,.5);if(event.kind==='gold')catchSound(true);pulse($('score'),'score-pop');pulse($('catcher'),'catcher-pop');if(event.kind==='gold'){pulse($('time'),'time-gain');$('encouragement').textContent='Vier Sekunden dazu';}}
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
    if(catching()||state!=='playing'||!advance(performance.now()))return;
    const event=run.hit(i);if(event.kind==='none')return;
    const gold=event.kind==='gold',evil=event.kind==='bad';
    burst(i,event.points,gold,evil);renderHUD();hearts();
    if(evil){pulse($('lives'),'heart-hit');pulse($('board'),'board-hit');tone(190,.2,0,'triangle',.065,.5);$('encouragement').textContent='Ein Leben verloren';}
    else{catchSound(gold);pulse($('score'),'score-pop');if(gold)pulse($('time'),'time-gain');$('encouragement').textContent=gold?'Vier Sekunden dazu':'Stern gefangen';}
    renderBoard();
    if(run.ended){state='ending';music?.pause();setTimeout(()=>{if(state==='ending')finish(run.reason);},550);}
  }
  function start() {
    unlockAudio();run=modes[mode].create();music?.reset();shownLevel=1;hearts();
    cells.forEach(cell=>cell.querySelectorAll('.burst').forEach(effect=>effect.remove()));fallingNodes.clear();$('falling-stars').replaceChildren();$('catch-effects').replaceChildren();
    $('catch-chain').hidden=!catching();$('board').hidden=catching();$('catch-field').hidden=!catching();$('catch-hint').hidden=!catching();$('game').classList.toggle('catch-mode',catching());
    $('catch-hint').classList.remove('learned');renderHUD();$('encouragement').textContent=catching()?'Fänger nach links und rechts ziehen. Rote Sterne meiden.':'Gelbe Sterne verlängern die Zeit';screen('game');state='playing';if(sound)music?.play();lastFrame=performance.now();renderBoard();
  }
  function finish(reason='time') {
    state='result';music?.pause();clearTarget();const current=modes[mode],record=run.score>records[current.id];if(record){records[current.id]=run.score;try{localStorage.setItem(current.key,String(run.score));}catch{}}
    homeUI();$('final-score').textContent=run.score;
    $('result-title').textContent=reason==='lives'?'Alle Herzen verbraucht':reason==='time'?'Zeit abgelaufen':record?'Neuer Rekord':'Runde beendet';
    $('record-message').textContent=record?'Neuer Rekord · '+current.name:'Rekord '+records[current.id]+' · '+current.name;
    screen('result');if(reason!=='lives')tone(850,.25);$('again').focus({preventScroll:true});
  }
  function pause() { if(state!=='playing'||!advance(performance.now()))return;state='paused';music?.pause();$('pause-dialog').showModal(); }
  function resume() { $('pause-dialog').close();if(state==='paused'){unlockAudio();state='playing';if(sound)music?.play();lastFrame=performance.now();} }
  function frame(now) { if(state==='playing')advance(now);else lastFrame=now;requestAnimationFrame(frame); }
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
  function steer(e){if(!catching()||state!=='playing'||!advance(performance.now()))return;const box=$('catch-field').getBoundingClientRect();run.move((e.clientX-box.left)/box.width);$('catch-hint').classList.add('learned');renderCatch();}
  $('catch-field').addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;e.preventDefault();dragging=e.pointerId;$('catch-field').setPointerCapture(e.pointerId);steer(e);});
  $('catch-field').addEventListener('pointermove',e=>{if(e.pointerId===dragging)steer(e);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])$('catch-field').addEventListener(name,()=>dragging=null);
  $('catch-field').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||!catching()||state!=='playing')return;e.preventDefault();if(!advance(performance.now()))return;run.move(e.key==='Home'?.1:e.key==='End'?.9:run.player+(e.key==='ArrowRight'?.16:-.16));$('catch-hint').classList.add('learned');renderCatch();});
  homeUI();soundUI();hearts();requestAnimationFrame(frame);
})();
