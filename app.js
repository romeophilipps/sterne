'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let novaProgress={},novaLastSave=0,stormProgress={};
  try{const saved=JSON.parse(localStorage.getItem('stars-nova-progress-v1')||'{}');if(saved&&typeof saved==='object')novaProgress=saved;}catch{}
  function saveNovaProgress(){if(modes[mode].id!=='nova'||!run.exportProgress)return;novaProgress=run.exportProgress();try{localStorage.setItem('stars-nova-progress-v1',JSON.stringify(novaProgress));}catch{}novaLastSave=performance.now();}
  try{const saved=JSON.parse(localStorage.getItem('stars-storm-unlocks-v1')||'{}');if(saved&&typeof saved==='object')stormProgress=saved;}catch{}
  function saveStormProgress(){if(modes[mode].id!=='storm'||!run.exportUnlocks)return;stormProgress=run.exportUnlocks();try{localStorage.setItem('stars-storm-unlocks-v1',JSON.stringify(stormProgress));}catch{}}

  const modes=[{id:'tap',name:'Tippen',key:'stars-best',create:()=>StarGame.create()},{id:'dodge',name:'Ausweichen',key:'stars-dodge-best-ms',create:()=>StarDodge.create()},{id:'sling',name:'Sternenschlange',key:'stars-snake-best',create:()=>StarSnake.create()},{id:'nova',name:'Supernova',key:'stars-nova-best',create:()=>StarNova.create(Math.random,novaProgress)},{id:'storm',name:'Sternensturm',key:'stars-storm-best',create:()=>StarStorm.create(Math.random,stormProgress)}];
  let stormArtReady=false;StarStormArt.ready.then(()=>{stormArtReady=true;if(state==='home')homeUI();});
  const records={tap:0,dodge:0,sling:0,nova:0,storm:0};let mode=0,sound=true;
  try { modes.forEach(m=>records[m.id]=Math.max(0,Number(localStorage.getItem(m.key))||0));sound=localStorage.getItem('stars-sound')!=='off';mode=Math.max(0,modes.findIndex(m=>m.id===(localStorage.getItem('stars-mode')==='catch'?'dodge':localStorage.getItem('stars-mode')))); } catch {}
  const slinging=()=>modes[mode].id==='sling';
  const shooting=()=>['nova','storm'].includes(modes[mode].id);
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
  function screen(name) { ['home','game','result'].forEach(id => $(id).hidden = id !== name);document.body.classList.toggle('storm-layout',name==='game'&&modes[mode].id==='storm');stormOrientation.update(); }
  const stormOrientation=StarStormLayout.create({
    viewport:()=>({width:window.innerWidth,height:window.innerHeight}),
    active:()=>modes[mode].id==='storm'&&!$('game').hidden,
    playing:()=>state==='playing',
    pause:()=>{state='rotation';keys.clear();pointerAnchor=null;music?.pause();lastFrame=performance.now();},
    resume:()=>{if(state==='rotation'){state='playing';lastFrame=performance.now();if(sound)music?.play();}},
    show:blocked=>{const dialog=$('storm-rotate');if(blocked&&!dialog.open)dialog.showModal();else if(!blocked&&dialog.open)dialog.close();}
  });
  function syncStormViewport(){
    const active=modes[mode].id==='storm'&&!$('game').hidden;
    document.body.classList.toggle('storm-layout',active);
    const view=window.visualViewport;
    document.documentElement.style.setProperty('--storm-height',Math.round(view&&Math.abs(view.scale-1)<.02?Math.min(innerHeight,view.height):innerHeight)+'px');
    stormOrientation.update();
  }
  window.addEventListener('resize',syncStormViewport);window.addEventListener('orientationchange',()=>requestAnimationFrame(syncStormViewport));window.visualViewport?.addEventListener('resize',syncStormViewport);
  $('storm-rotate').addEventListener('cancel',e=>e.preventDefault());
  $('storm-rotate-home').addEventListener('click',()=>{for(const id of ['pause-dialog','game-help-dialog'])if($(id).open)$(id).close();helpWasPlaying=false;state='home';music?.pause();keys.clear();pointerAnchor=null;screen('home');homeUI();});
  function homeUI(){
    document.dispatchEvent(new CustomEvent('stars-mode',{detail:{mode:modes[mode].id}}));
    const current=modes[mode];$('home-best').textContent=dodging()?duration(records[current.id]):records[current.id];$('mode-name').textContent=current.name;
    $('nova-home-rank').hidden=modes[mode].id!=='nova';$('nova-home-rank').textContent='Arsenal '+Math.max(1,Math.floor(Number(novaProgress.rank)||1));$('storm-shop').hidden=current.id!=='storm';$('storm-shop').textContent='10 ◉ · 0 ✦';$('storm-shop').dataset.tier='0';$('storm-shop').setAttribute('aria-label','10 Bronzemünzen, 0 Sterne');$('mode-art').dataset.mode=current.id;$('start').setAttribute('aria-label',current.name+' – endlos spielen');
    $('start').disabled=current.id==='storm'&&!stormArtReady;$('start').classList.toggle('loading-art',current.id==='storm'&&!stormArtReady);$('mode-picker').querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===mode)));
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
    $('lives').closest('.life-row').hidden=modes[mode].id==='storm';
    $('lives').setAttribute('aria-label', run.lives+' von 3 Leben');
    $('lives').querySelectorAll('span').forEach((heart,i)=>{heart.classList.toggle('lost',i>=run.lives);heart.textContent=i<run.lives?'♥':'♡';});
    $('life-status').hidden=modes[mode].id==='storm';$('life-status').textContent=modes[mode].id==='storm'?'':run.lives+' von 3 Leben übrig';
  }
  function clearCell(i) { const cell=cells[i];cell.classList.remove('active','bonus','evil');cell.querySelector('.star-art').setAttribute('hidden','');cell.setAttribute('aria-label','Leerer Sternenplatz'); }
  function clearTarget() { cells.forEach((_,i)=>clearCell(i)); }
  function showStar(i, kind) { const cell=cells[i], svg=cell.querySelector('.star-art');cell.classList.add('active');if(kind!=='good')cell.classList.add(kind);svg.querySelector('use').setAttribute('href',kind==='evil'?'#evil-star':'#star');svg.removeAttribute('hidden');cell.setAttribute('aria-label',kind==='evil'?'Böser Stern: kostet ein Leben':kind==='bonus'?'Gelber Stern: vier Sekunden extra':'Stern fangen: ein Punkt'); }
  function renderBoard() { if(shooting()){renderNova();return;} if(slinging()){renderSling();return;} if(dodging()){renderDodge();return;}clearTarget();if(run.ended)return;showStar(run.target,run.bonus?'bonus':'good');run.badStars.forEach(i=>showStar(i,'evil')); }
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
    const musicBoss=modes[mode].id==='storm'?run.enemies.find(e=>e.boss&&e.hp>0):null;music?.update(run.level,run.remaining,run.elapsed,{boss:!!musicBoss,phase:musicBoss?.combatPhase||1,rest:run.rest>0});
    $('score').textContent=dodging()?duration(run.elapsed):run.score;
    if(!dodging()&&!slinging()&&!shooting()){$('time').textContent=Math.ceil(run.remaining/1000);$('time-bar').style.width=Math.min(100,run.remaining/StarGame.START_MS*100)+'%';}
    $('game').classList.toggle('urgent',!dodging()&&run.remaining<=5000);
    $('level').textContent='Lv. '+run.level;$('level').setAttribute('aria-label','Schwierigkeitsstufe '+run.level);
    if(run.level>shownLevel){pulse($('level'),'level-up');shownLevel=run.level;}
  }
  function advance(now) {
    const dt=Math.max(0,now-lastFrame),previousTarget=run.target;
    if(dodging()&&keys.size){let x=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a')),y=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));const norm=Math.hypot(x,y)||1;run.move(run.player.x+x/norm*dt/1000*2,run.player.y+y/norm*dt/1000*2);}
    if(shooting()&&keys.size){const x=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a')),y=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w')),n=Math.hypot(x,y)||1;run.move(run.player.x+x/n*dt*.0008,run.player.y+y/n*dt*.0008);}
    const events=run.tick(dt);lastFrame=now;renderHUD();
    if(shooting()){novaFeedback(events);renderNova();}
    if(dodging()){for(const event of events)dodgeFeedback(event);renderDodge();}
    if(run.ended){if(dodging()||slinging()||shooting()){state='ending';music?.pause();setTimeout(()=>{if(state==='ending')finish(run.reason);},380);}else finish(run.reason);return false;}
    if(slinging()){for(const event of events){if(event.kind==='hit')catchSound(false);if(event.kind==='loop'){tone(523,.15);tone(784,.2,.07);tone(1047,.32,.14);$('encouragement').textContent='Schleife! '+event.score+' Punkte und '+event.captured+' rote Sterne eingefangen';}if(event.kind==='comet'){tone(660,.15);tone(990,.2,.08);tone(1320,.3,.16);$('encouragement').textContent='Sternbild vollendet! Sechs Sekunden Kometenrausch, doppelte Punkte und Schutz';}if(event.kind==='burn')tone(280,.1,0,'sine',.04,2);if(event.kind==='clear'){tone(880,.2);tone(1320,.25,.1);}if(event.kind==='bad'){hearts();tone(160,.2,0,'triangle',.05,.5);}}renderSling();}
    if(!dodging()&&!slinging()&&!shooting()&&previousTarget!==run.target)renderBoard();return true;
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
    if(dodging()||slinging()||shooting()||state!=='playing'||!advance(performance.now()))return;
    const event=run.hit(i);if(event.kind==='none')return;
    const gold=event.kind==='gold',evil=event.kind==='bad';
    burst(i,event.points,gold,evil);renderHUD();hearts();
    if(evil){pulse($('lives'),'heart-hit');pulse($('board'),'board-hit');tone(190,.2,0,'triangle',.065,.5);$('encouragement').textContent='Ein Leben verloren';}
    else{catchSound(gold);pulse($('score'),'score-pop');if(gold)pulse($('time'),'time-gain');$('encouragement').textContent=gold?'Vier Sekunden dazu':'Stern gefangen';}
    renderBoard();
    if(run.ended){state='ending';music?.pause();setTimeout(()=>{if(state==='ending')finish(run.reason);},550);}
  }
  let helpWasPlaying=false;
  const instructions={
    tap:{steps:['<strong>Tippe die hellen Sterne</strong> an, bevor sie verschwinden.','<strong>Gold gibt 4 Sekunden dazu.</strong> Sammle weiter, damit die Zeit nicht abläuft.','<strong>Meide Rot.</strong> Jeder rote Stern kostet ein Herz.'],note:'Drei Herzen. Das Spiel endet, wenn die Zeit oder alle Herzen aufgebraucht sind. Es wird immer schneller.'},
    dodge:{steps:['<strong>Ziehe den gelben Stern</strong> mit dem Finger frei durch das Spielfeld.','<strong>Weiche Rot aus.</strong> Überlebe so lange wie möglich; nach und nach kommen fünf Gegnerarten hinzu.','<strong>Nutze Power-ups.</strong> Die Blase schützt bis zu 20 Sekunden vor einem Treffer. Feuer macht dich 10 Sekunden unbesiegbar.'],note:'Dein Stern schießt automatisch Sternenstaub auf den nächsten Gegner. Rote Treffer kosten ein Herz; die Blase platzt beim ersten Treffer. Drei Herzen.'},
    storm:{steps:['<strong>Spiele im Hoch- oder Querformat und beschütze den Stern links.</strong> Er ist die Basis und das Ziel der Gegner. Wenn seine Lebensleiste leer ist, endet die Runde. Die Lebensleiste an der Sternenvorrichtung zeigt ihre verbleibende Energie. Von rechts kommen die Gegner. Deine gekauften Krieger laufen langsam zur Front und kämpfen selbstständig.','<strong>Kaufe unten deine Armee.</strong> Jede Runde startet mit 10 Münzen. Du kannst das iPhone während der Schlacht frei drehen; Runde, Armee und Fortschritt bleiben erhalten. Jeder Kauf lässt genau eine Figur erscheinen. Ohne Gegner warten deine Krieger. Fernkämpfer ziehen sich hinter Schilde zurück.','<strong>Achte auf Gegner und Boss-Schwächen.</strong> Kombiniere Schutz, Nahkampf und passende Fernwaffen. Du bekommst anfangs alle 2 Sekunden eine Münze für Krieger. Nur schwere Gegner und Bosse geben Sterne für Helden.'],note:'Schwert 1 · Schild 3 · Sniper 10 · Raketen 15 · Plasma 20. Die erste Heldenfreischaltung auf diesem Gerät kostet 100 Bronzemünzen, danach die zweite 150, die dritte 200, die vierte 250 und die fünfte 300. Du bestimmst die Reihenfolge der Helden. Diese festen Bronzepreise gelten auch bei Silber und Gold. Der freigeschaltete Held erscheint sofort an der Front. Er bleibt höchstens 20 Sekunden, löst sich danach vier Sekunden lang in sein persönliches Symbol auf und kann anschließend für 30 Sterne erneut gerufen werden. Die Freischaltung bleibt über Runden hinweg erhalten; pro Typ ist nur ein Held gleichzeitig aktiv. Die Einsatzzeit pausiert mit dem Spiel. Leichte Gegner geben keine Sterne; Schildträger und Raketenkrieger 1, Nexusbrut/Flieger 1, Elitegegner 3, Zwischenbosse 5 und große Bosse 9. Wellen haben unterschiedliche Schwächen: Schwärme brauchen Flächenschaden oder geschützte Schwerter; Panzer sind anfällig für Sniper oder Plasma. Kaufe Verluste nach und wechsle deine Mischung. Anfangs eine Münze alle 2 Sekunden, nach jeder geschafften Welle 0,02 Sekunden schneller bis 0,5 Sekunden. Nach der Welle mit diesem Höchsttempo folgt Silber, danach genauso Gold; jede Stufe startet wieder bei 2 Sekunden. Eine Silbermünze zählt 4 Bronze, eine Goldmünze 4 Silber. Neue Krieger kosten damit je Stufe viermal so viel und haben fünfmal so viele Lebenspunkte und Schaden. Restgeld bleibt erhalten, bestehende Truppen behalten ihr Level. Silber zeigt Lvl. 2, Gold Lvl. 3: Schwerter brennen nach, Schilde bekommen Rüstung und breitere Deckung, Sniper durchschlagen mehr Ziele, Raketen explodieren größer, Plasma trifft breiter und feuert schneller. Bei Gold bleibt das Tempo schließlich bei 0,5 Sekunden, auch in Atempausen. Es gibt keine Münzen für Abschüsse oder Wellen. Sniper haben enorme Reichweite und 6 Schaden, aber nur 3 Leben; schütze sie mit Schilden. Beschütze die Sternenvorrichtung; höchstens 36 eigene Kämpfer. Beide Währungen und die aktive Armee gelten für diese Runde; Helden-Freischaltungen bleiben auf diesem Gerät gespeichert. Die Schattenlegion wächst: anfangs Krieger, dann Brut und Schilde, Jäger, Läufer, Flieger und explosive Nexusbrut. Alle früheren Arten bleiben dabei. Alle vier Wellen kommt eine Bossbegegnung: zuerst alle drei Minibosse, dann alle sieben Zwischenbosse mit Minibossen dazwischen. Erst nach dieser vollständigen Folge kommt der erste Hauptboss. Danach beginnt die stärkere Zwischenboss-/Minibossfolge erneut. Die Hauptbosse folgen als Umbra, Leviathan, Tyrant, Astraea und zuletzt Kronos. Anschließend wiederholt sich die Folge endlos stärker. Später kommen Zwischenbosse mit zwei Minibossen und Hauptbosse mit zwei Zwischenbossen, in noch späteren Durchläufen weitere gemischte Formationen. Jede zehnte Welle ab Welle 9 überfällt dich ein Schwarm aus 20 kleinen Monstern in schneller Folge. Eine Welle zählt erst nach dem letzten Gegner samt aller Bossbegleiter. Es gibt keinen Endboss und keinen Sieg-Bildschirm. Große Bosse haben drei Phasen, kleinere zwei. Leuchtende Bodenringe kündigen Angriffe an; deine Truppen versuchen auszuweichen. Den Urheber früh ausschalten unterbricht seinen Flächenangriff. Schilde und Aegis fangen Geschosse ab. Es gibt keine Waffenimmunität: für jeden Boss helfen mehrere Kombinationen. Der Tipp unter dem Schlachtfeld und die Boss-Lebensleiste zeigen den aktuellen Gegner. Ab Welle 18 kommen korruptierte, gefrorene, verstärkte und Elitevarianten dazu. Helden: Solaris entfesselt Sonnenenergie, Volt schlägt mit Kettenblitzen zu, Polaris setzt Gegner fest, Aegis heilt und schützt, Phönix rettet einmal ein Leben.'},
    nova:{steps:['<strong>Ziehe deinen Stern</strong> frei durch die Arena. Er feuert automatisch auf den nächsten Gegner.','<strong>Drücke Nova</strong>, wenn es eng wird: Der Puls sprengt Gegner in deiner Nähe und räumt Geschosse weg. Danach lädt er 6 Sekunden auf.','<strong>Dein Arsenal wächst automatisch.</strong> Abschüsse schalten stärkere Waffen frei, ohne den Kampf zu unterbrechen. Deine Upgrades bleiben auf diesem Gerät für die nächsten Runden gespeichert.'],note:'Drei Leben. Verlasse die roten Warnzonen, bevor sie explodieren. Wer stehen bleibt, wird getroffen. Alle 40 Sekunden erscheint ein Boss. Mehr Gegner, schnellere Schüsse und neue Gegnertypen machen jede Welle extremer. Tastatur: Pfeiltasten oder WASD, Leertaste für Nova.'},
    sling:{steps:['<strong>Wische</strong>, um den gelben Kopf zu lenken.','<strong>Sammle Gelb.</strong> Dein Schweif wird länger und leuchtet stärker.','<strong>Kreise Rot ein</strong> und berühre deinen eigenen Schweif, um die Schleife zu schließen.'],note:'Rot berühren kostet ein Herz. Leere Schleifen geben nur 1 Punkt und keinen Schutz. Erfolgreiche Fänge hintereinander bringen eine Kombo.'}
  };
  function openHelp(){
    if(state==='playing'&&!advance(performance.now()))return;
    helpWasPlaying=state==='playing';if(helpWasPlaying){state='help';keys.clear();pointerAnchor=null;music?.pause();}
    const info=instructions[modes[mode].id];$('game-help-title').textContent=modes[mode].name;
    $('game-help-rules').innerHTML=info.steps.map(step=>'<li>'+step+'</li>').join('');$('game-help-note').textContent=info.note;$('game-help-demo').hidden=!slinging();$('game-help-close').textContent=helpWasPlaying?'Weiterspielen':'Fertig';$('game-help-dialog').showModal();
  }
  function closeHelp(){ $('game-help-dialog').close();if(helpWasPlaying&&state==='help'){state='playing';lastFrame=performance.now();stormOrientation.update();if(state==='playing'&&sound)music?.play();}helpWasPlaying=false; }
  $('game-help').addEventListener('click',openHelp);$('game-help-close').addEventListener('click',closeHelp);$('game-help-dialog').addEventListener('cancel',e=>{e.preventDefault();closeHelp();});
  function start() {
    unlockAudio();run=modes[mode].create();music?.reset(1,modes[mode].id==='storm'?'storm':slinging()||shooting()?'dodge':modes[mode].id);shownLevel=1;keys.clear();pointerAnchor=null;hearts();
    cells.forEach(cell=>cell.querySelectorAll('.burst').forEach(effect=>effect.remove()));enemyNodes.clear();$('dodge-enemies').replaceChildren();$('dodge-effects').replaceChildren();
    $('sling-field').hidden=!slinging();$('sling-shots').hidden=!slinging();$('game').classList.toggle('sling-mode',slinging());$('board').hidden=dodging()||slinging()||shooting();$('nova-field').hidden=!shooting();$('nova-hud').hidden=!shooting();$('nova-pulse').hidden=!shooting()||modes[mode].id==='storm';$('storm-market').hidden=modes[mode].id!=='storm';$('game').classList.toggle('storm-mode',modes[mode].id==='storm');$('game').classList.toggle('nova-mode',shooting());$('dodge-field').hidden=!dodging();$('dodge-hint').hidden=!dodging();$('dodge-types').hidden=!dodging();$('game').classList.toggle('dodge-mode',dodging());
    novaRenderer=null;novaBossUntil=0;novaNoticeUntil=0;$('dodge-instructions').hidden=!dodging();$('score').parentElement.setAttribute('aria-label',dodging()?'Überlebenszeit':'Punkte');$('dodge-hint').classList.remove('learned');$('dodge-announcement').textContent='';
    screen('game');if(dodging()){const box=$('dodge-field').getBoundingClientRect();run.resize(box.width,box.height);}
    
    renderHUD();$('encouragement').textContent=modes[mode].id==='storm'?'Beschütze den Stern. Deine Armee fängt die Angreifer ab.':shooting()?'Frei bewegen. Dein Stern feuert automatisch. Nova drücken, um Gegner wegzusprengen.':slinging()?'Überall wischen. Sterne sammeln und den eigenen Schweif berühren: Schleifen fangen rote Sterne. Große Schleifen geben mehr Punkte.':dodging()?'Gelben Stern frei bewegen und ausweichen.':'Gelbe Sterne verlängern die Zeit';state='playing';stormOrientation.update();if(state==='playing'&&sound)music?.play();lastFrame=performance.now();renderBoard();
  }
  function finish(reason='time') {
    saveNovaProgress();saveStormProgress();
    state='result';music?.pause();keys.clear();pointerAnchor=null;clearTarget();const current=modes[mode],record=run.score>records[current.id];if(record){records[current.id]=run.score;try{localStorage.setItem(current.key,String(run.score));}catch{}}
    document.dispatchEvent(new CustomEvent('stars-result',{detail:{mode:current.id,score:run.score}}));homeUI();$('final-score').textContent=dodging()?duration(run.score):run.score;$('final-score').parentElement.setAttribute('aria-label',dodging()?'Überlebenszeit':'Gesammelte Sterne');$('result').classList.toggle('dodge-result',dodging());
    $('result-title').textContent=dodging()?'Überlebt':reason==='lives'?'Alle Herzen verbraucht':reason==='time'?'Zeit abgelaufen':record?'Neuer Rekord':'Runde beendet';
    $('record-message').textContent=record?'Neuer Rekord · '+current.name:'Rekord '+(dodging()?duration(records[current.id]):records[current.id])+' · '+current.name;
    screen('result');if(reason!=='lives')tone(850,.25);$('again').focus({preventScroll:true});
  }
  function pause() { if(state!=='playing'||!advance(performance.now()))return;state='paused';keys.clear();pointerAnchor=null;music?.pause();$('pause-dialog').showModal(); }
  function resume() { $('pause-dialog').close();if(state==='paused'){unlockAudio();state='playing';stormOrientation.update();if(state==='playing'&&sound)music?.play();lastFrame=performance.now();} }
  function frame(now) { syncStormViewport();document.body.classList.toggle('snake-playing',(slinging()||shooting())&&state==='playing');if(state==='playing')advance(now);else lastFrame=now;requestAnimationFrame(frame); }
  $('start').addEventListener('click',start);$('again').addEventListener('click',start);
  $('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);
  $('pause-dialog').addEventListener('cancel',e=>{e.preventDefault();resume();});
  $('quit').addEventListener('click',()=>{$('pause-dialog').close();finish('quit');});
  $('back-home').addEventListener('click',()=>{state='home';homeUI();screen('home');});
  $('sound-toggle').addEventListener('click',()=>{sound=!sound;unlockAudio();soundUI();try{localStorage.setItem('stars-sound',sound?'on':'off');}catch{}if(sound){if(state==='playing')music?.play();catchSound(false);}else music?.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){saveNovaProgress();saveStormProgress();pause();}});window.addEventListener('pagehide',()=>{saveNovaProgress();saveStormProgress();pause();});
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
  document.addEventListener('keydown',e=>{if((dodging()||shooting())&&state==='playing'&&controls.includes(e.key)){e.preventDefault();keys.add(e.key);$('dodge-hint').classList.add('learned');}});
  document.addEventListener('keyup',e=>{keys.delete(e.key);});window.addEventListener('blur',()=>keys.clear());
  window.addEventListener('resize',()=>{if(dodging()&&['playing','paused'].includes(state)){const box=$('dodge-field').getBoundingClientRect();run.resize(box.width,box.height);pointerAnchor=null;}});
  let armyShopRound=null,armyButtons=[],armyShopKey="";
  function renderArmyShop(){if(!(run instanceof StarStorm.Round))return;const army=run.army;if(armyShopRound!==run){armyShopRound=run;armyShopKey="";armyButtons=[];$('storm-shop-items').replaceChildren();for(const [kind,items] of [['warriors',StarStorm.WARRIORS],['heroes',StarStorm.HEROES]]){const row=document.createElement('div');row.className='army-buy-row';items.forEach((info,index)=>{const button=document.createElement('button');button.className='army-buy';button.setAttribute('aria-label',info.name+' kaufen für '+info.cost+(info.cost===1?' Münze':' Münzen'));button.title=info.text;{const portrait=document.createElement('canvas');portrait.className='army-portrait';portrait.setAttribute('aria-hidden','true');button.style.setProperty('--class-color',(kind==='heroes'?StarStormArt.HERO_COLORS:StarStormArt.ACCENTS)[index]);button.append(portrait);StarStormArt.ready.then(()=>StarStormArt.portrait(portrait,index,run.currencyTier,kind==='heroes'));}const name=document.createElement('strong'),price=document.createElement('span'),count=document.createElement('small');name.textContent=kind==='warriors'?['Schwert','Schild','Sniper','Rakete','Plasma'][index]:info.name;price.textContent=info.cost+' ◉';button.dataset.kind=kind;button.append(name,price,count);const purchase=()=>{if(state==='playing'&&run.buy(kind,index)){tone(660,.1,0,'sine',.025);if(kind==='heroes')saveStormProgress();renderNova();}};StarStormLayout.bindPurchase(button,purchase);row.append(button);armyButtons.push({button,price,count,kind,index,info});});$('storm-shop-items').append(row);}}
  const seconds=StarStorm.HEROES.map((_,i)=>{const hero=run.troops.find(t=>t.hero===i&&t.hp>0);return hero?Math.max(0,Math.ceil((hero.expiresAt-run.elapsed)/1000)):0;});
  const shopKey=[army.coins,army.stars,run.currencyTier,run.troops.length,...army.warriors,...army.heroes,...army.heroUnlocked,...seconds].join();if(shopKey===armyShopKey)return;armyShopKey=shopKey;
  for(const {button,price,count,kind,index,info} of armyButtons){const offer=run.offer(kind,index),isHero=kind==='heroes',active=isHero&&seconds[index]>0;button.dataset.tier=String(isHero&&!offer.unlocked?0:run.currencyTier);button.dataset.currency=offer.currency;price.textContent=offer.display+(offer.currency==='stars'?' ✦':' ◉');
   const money=offer.currency==='stars'?' Sterne':' '+(isHero?'Bronze':run.currencyName)+(offer.display===1?'münze':'münzen'),action=isHero?(offer.unlocked?'rufen':'freischalten'):'kaufen';
   button.setAttribute('aria-label',active?info.name+' im Einsatz · noch '+seconds[index]+' Sekunden':info.name+' '+action+' für '+offer.display+money+(isHero?' · 20 Sekunden an der Front':' · '+run.unitStrength+'-fache Lebenspunkte und Schaden · Lvl. '+(run.currencyTier+1)+' · '+StarStorm.UPGRADES[index][run.currencyTier]));
   const stats=isHero?null:StarStorm.unitStats(index,run.currencyTier);if(stats){if(button.dataset.portraitTier!==String(run.currencyTier)){StarStormArt.portrait(button.querySelector('canvas'),index,run.currencyTier);button.dataset.portraitTier=String(run.currencyTier);}button.querySelector('strong').textContent=['Schwert','Schild','Sniper','Rakete','Plasma'][index];}
   button.title=isHero?info.text+' · 20 Sekunden Einsatz · '+(offer.unlocked?'Erneut rufen: 30 Sterne':'Einmalig freischalten: '+offer.display+' Bronzemünzen; danach 30 Sterne'):stats.upgrade+' · '+run.currencyName+': '+stats.hp+' Leben, '+stats.damage+' Schaden · '+(stats.cooldown/1000)+' s';
   count.textContent=isHero?(active?'Noch '+seconds[index]+' s':offer.unlocked?'Bereit':'Bronze'):('Lvl. '+stats.level+' · '+(army.warriors[index]?'×'+army.warriors[index]:'Krieger'));
   button.disabled=army[offer.currency]<offer.amount||active||run.troops.length>=36;
  }}
  let novaRenderer=null,lastBoom=0,novaBossUntil=0,novaNoticeUntil=0,novaNotice='',novaBossName='BOSS';
  function renderNova(){if(!novaRenderer)novaRenderer=new (modes[mode].id==='storm'?StarStorm.Renderer:StarNova.Renderer)($('nova-canvas'));novaRenderer.draw(run);hearts();if(modes[mode].id==='storm'){$('storm-shop').textContent=run.visibleCoins.toLocaleString('de-DE',{maximumFractionDigits:4})+' ◉ · '+run.army.stars+' ✦';$('storm-shop').dataset.tier=String(run.currencyTier);$('storm-shop').setAttribute('aria-label',run.visibleCoins.toLocaleString('de-DE',{maximumFractionDigits:4})+' '+run.currencyName+'münzen, '+run.army.stars+' Sterne. Eine Münze alle '+(run.coinInterval/1000).toLocaleString('de-DE',{maximumFractionDigits:2})+' Sekunden.');renderArmyShop();$('storm-tactics').textContent=run.currencyName+(run.currencyTier?' · '+run.unitStrength+'×':'')+' · ◉ alle '+(run.coinInterval/1000).toLocaleString('de-DE',{maximumFractionDigits:2})+' s · '+(run.rest>0?'Atempause · Nachschub kaufen: ':'')+run.bossHint;}$('nova-announcement').textContent=run.elapsed<novaBossUntil?novaBossName:'';$('nova-upgrade-notice').textContent=run.elapsed<novaNoticeUntil?novaNotice:'';$('nova-xp-fill').style.width=Math.min(100,run.xp/run.needed*100)+'%';$('nova-rank').textContent=modes[mode].id==='storm'?'Welle '+run.wave+' · '+run.plan.name:'Arsenal '+run.rank+' · Welle '+run.wave;$('nova-pulse').disabled=run.cooldown>0;$('nova-pulse').textContent=(modes[mode].id==='storm'?'Verstärkung':'Nova')+(run.cooldown>0?' · '+Math.ceil(run.cooldown/1000)+' s':'');$('nova-field').setAttribute('aria-label',modes[mode].name+': '+(modes[mode].id==='storm'?'':run.lives+' Leben, ')+run.score+' Punkte'+(modes[mode].id==='storm'?', Stern '+Math.ceil(run.base.hp)+' von '+run.base.max+' Energie':''));}
  function novaFeedback(events){for(const e of events){if(e.kind==='currency'){novaNotice=e.name+' · neue Krieger '+run.unitStrength+'× stark';novaNoticeUntil=run.elapsed+4500;tone(990,.25);}if(e.kind==='warning'){$('encouragement').textContent='Warnzone! Aus der roten Markierung herausbewegen.';}if(e.kind==='ability'){novaNotice=e.name;novaNoticeUntil=run.elapsed+1600;}if(e.kind==='upgrade'){saveNovaProgress();novaNotice=StarNova.UPGRADES[e.key].name+' +';novaNoticeUntil=run.elapsed+1800;tone(880,.13,0,'sine',.025,1.5);}if(e.kind==='hurt'){hearts();pulse($('nova-field'),'field-hit');tone(100,.2,0,'triangle',.05,.35);}if(e.kind==='explode'&&performance.now()-lastBoom>130){lastBoom=performance.now();tone(e.boss?55:110,e.boss?.4:.15,0,'sawtooth',.025,.2);tone(440,.09,0,'sine',.015,2);}if(e.kind==='boss'){novaBossName=e.name||'BOSS';novaBossUntil=run.elapsed+2200;tone(150,.25,0,'sawtooth',.025,.65);$('encouragement').textContent=(e.name||'Boss')+' erscheint';}}if(events.some(e=>e.kind==='explode')){if(modes[mode].id==='storm')saveStormProgress();else if(performance.now()-novaLastSave>400)saveNovaProgress();}}
  function novaPulse(){if(shooting()&&state==='playing'&&run.nova()){pulse($('nova-field'),'field-hit');tone(80,.4,0,'sawtooth',.045,4);renderNova();}}
  $('nova-pulse').addEventListener('click',novaPulse);
  document.addEventListener('keydown',e=>{if(shooting()&&state==='playing'&&e.code==='Space'){e.preventDefault();novaPulse();}});
  let novaPointer=null,novaAnchor=null;
  document.addEventListener('pointerdown',e=>{if(!shooting()||state!=='playing'||!e.isPrimary||e.target.closest('button,dialog,input'))return;e.preventDefault();novaPointer=e.pointerId;novaAnchor={x:e.clientX,y:e.clientY,px:run.player.x,py:run.player.y};document.body.setPointerCapture(e.pointerId);});
  document.addEventListener('pointermove',e=>{if(!shooting()||state!=='playing'||e.pointerId!==novaPointer||!novaAnchor)return;const box=$('nova-field').getBoundingClientRect();run.move(novaAnchor.px+(e.clientX-novaAnchor.x)/box.width*1.35,novaAnchor.py+(e.clientY-novaAnchor.y)/box.height*1.35);});
  for(const name of ['pointerup','pointercancel'])document.addEventListener(name,()=>{novaPointer=null;novaAnchor=null;});
  let slingAim=null;
  const snakeNodes=[];let cometTrail=null;
  function renderSling(){
    hearts();$('sling-player').setAttribute('hidden','');
    if(!cometTrail)cometTrail=new StarTrail($('sling-field'));
    cometTrail.render(run.positions,run.elapsed,run.snake.length,run.rush);
    $('sling-field').classList.toggle('snake-hurt',run.grace>0);$('sling-field').classList.toggle('comet-rush',run.rush>0);
    let constellation=$('snake-constellation');if(!constellation){constellation=document.createElement('div');constellation.id='snake-constellation';constellation.setAttribute('aria-label','Sternbild-Fortschritt');$('sling-shots').after(constellation);}
    const echo=run.echo&&run.echo.until>run.elapsed?run.echo:null;
    constellation.textContent=echo?'+'+echo.score+(echo.captured?' · '+echo.captured+' eingefangen':' · Schleife war leer'):run.rush>0?'Kurz geschützt':run.combo>1&&run.elapsed-run.lastLoop<10000?'Fang-Kombo ×'+run.combo:'Rot einkreisen · Schweif berühren';
    constellation.setAttribute('aria-label',constellation.textContent);
    let bloom=$('snake-bloom');if(!bloom){bloom=document.createElementNS('http://www.w3.org/2000/svg','svg');bloom.id='snake-bloom';bloom.setAttribute('viewBox','0 0 13 13');bloom.innerHTML='<path/>';$('sling-field').append(bloom);}
    const d=echo?'M'+echo.points.map(p=>(p.x+.5)+','+(p.y+.5)).join('L')+'Z':'';
    bloom.firstElementChild.setAttribute('d',d);bloom.style.opacity=echo?Math.min(1,(echo.until-run.elapsed)/700):0;
    const items=[];
    run.positions.slice(0,1).forEach(p=>{
      const cls='head';items.push({...p,cls});
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
    $('sling-shots').textContent=run.snake.length+' ✦';$('sling-shots').setAttribute('aria-label','Schweiflänge '+run.snake.length);
  }
  let snakeSwipe=null;
  document.addEventListener('pointerdown',e=>{if(slinging()&&state==='playing'&&e.isPrimary&&!e.target.closest('button,dialog,input')){e.preventDefault();snakeSwipe={id:e.pointerId,x:e.clientX,y:e.clientY};document.body.setPointerCapture(e.pointerId);}});
  document.addEventListener('pointermove',e=>{if(!slinging()||state!=='playing'||!snakeSwipe||snakeSwipe.id!==e.pointerId)return;const dx=e.clientX-snakeSwipe.x,dy=e.clientY-snakeSwipe.y;if(Math.hypot(dx,dy)<14)return;run.turn(Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0,Math.abs(dy)>=Math.abs(dx)?Math.sign(dy):0);snakeSwipe.x=e.clientX;snakeSwipe.y=e.clientY;});
  for(const event of ['pointerup','pointercancel'])document.addEventListener(event,()=>snakeSwipe=null);
  for(const gesture of ['gesturestart','gesturechange'])$('storm-market').addEventListener(gesture,e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchmove',e=>{if(slinging()&&state==='playing')e.preventDefault();},{passive:false});
  document.addEventListener('keydown',e=>{if(!slinging()||state!=='playing')return;const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]};if(dirs[e.key]){e.preventDefault();run.turn(...dirs[e.key]);}});
  homeUI();soundUI();hearts();requestAnimationFrame(frame);
})();
