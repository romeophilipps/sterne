'use strict';
(()=>{
 const $=id=>document.getElementById(id);let current='tap',lastResult=null;
 const names={tap:'Tippen',dodge:'Ausweichen',orbit:'Sternensturm'};
 const fmt=(n,mode)=>mode==='dodge'?Math.floor(n/60000)+':'+String(Math.floor(n/1000)%60).padStart(2,'0')+','+Math.floor(n%1000/100):String(n);
 async function rpc(name,data){const c=window.STAR_BOARD;if(!c?.url||!c?.key)throw Error('Bestenliste wird eingerichtet.');const response=await fetch(c.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Gerade nicht erreichbar. Bitte später erneut versuchen.');const text=await response.text();return text?JSON.parse(text):null;}
 function message(text){$('leaderboard-status').textContent=text;}
 function renderRows(container,rows,mode,home=false){container.replaceChildren();rows.slice(0,home?3:20).forEach((row,i)=>{const line=document.createElement(home?'span':'li');line.className=(i<3?'podium place-'+(i+1):'ranking-row');const rank=document.createElement('span'),name=document.createElement('span'),score=document.createElement('strong');rank.textContent=(i+1)+'.';rank.className='ranking-position';name.className='ranking-name';score.className='ranking-score';name.textContent=row.player_name;score.textContent=fmt(row.best_score,mode);line.append(rank,name,score);container.append(line);});}
 let homeRequest=0,listRequest=0;
 async function loadHome(){const mode=current,request=++homeRequest;$('home-leaderboard').replaceChildren();$('home-leaderboard-state').textContent='…';try{const rows=await rpc('star_top',{p_mode:mode});if(request!==homeRequest||mode!==current)return;renderRows($('home-leaderboard'),rows,mode,true);$('home-leaderboard-state').textContent=rows.length?'':'Noch keine Einträge';}catch{if(request===homeRequest)$('home-leaderboard-state').textContent='Bestenliste';}}
 async function load(){const mode=current,request=++listRequest;$('leaderboard-title').textContent='Bestenliste · '+names[mode];$('leaderboard-rows').replaceChildren();message('Wird geladen …');try{const rows=await rpc('star_top',{p_mode:mode});if(mode!==current||request!==listRequest)return;message(rows.length?'':'Noch keine Einträge. Sei der Erste!');renderRows($('leaderboard-rows'),rows,mode);renderRows($('home-leaderboard'),rows,mode,true);$('home-leaderboard-state').textContent=rows.length?'':'Noch keine Einträge';}catch(e){if(request===listRequest)message(navigator.onLine?e.message:'Die Bestenliste braucht Internet.');}}
 function open(mode){current=mode;$('leaderboard-dialog').showModal();load();}
 document.addEventListener('stars-mode',e=>{const next=modeId(e.detail.mode);if(!names[next])return;current=next;loadHome();});
 const modeId=mode=>mode==='sling'?'snake':mode==='storm'?'orbit':mode;
 let pending={},submitted={},syncing=false,retryTimer=null;
 try{pending=JSON.parse(localStorage.getItem('stars-pending-scores')||'{}')||{};submitted=JSON.parse(localStorage.getItem('stars-submitted-scores')||'{}')||{};}catch{}
 const saveQueue=()=>{try{localStorage.setItem('stars-pending-scores',JSON.stringify(pending));localStorage.setItem('stars-submitted-scores',JSON.stringify(submitted));}catch{}};
 async function syncScores(){
  if(syncing||!window.StarPlayer?.ready)return;window.clearTimeout?.(retryTimer);retryTimer=null;syncing=true;
  try{for(const mode of Object.keys(names)){while(Number.isFinite(pending[mode])&&pending[mode]>0){const score=pending[mode];
   try{await rpc('star_submit',{p_player:StarPlayer.id,p_mode:mode,p_name:StarPlayer.name,p_score:score});submitted[mode]=Math.max(Number(submitted[mode])||0,score);if(pending[mode]===score)delete pending[mode];saveQueue();if(lastResult&&modeId(lastResult.mode)===mode) $('submit-score').textContent='Bestenliste ansehen';loadHome();}
   catch{if(lastResult&&modeId(lastResult.mode)===mode)$('submit-score').textContent='Highscore gespeichert · später online';retryTimer??=window.setTimeout?.(syncScores,15000);break;}
  }}}finally{syncing=false;}
 }
 document.addEventListener('stars-result',e=>{lastResult=e.detail;const mode=modeId(lastResult.mode),score=Number(lastResult.score);if(!names[mode])return;$('submit-score').hidden=false;$('submit-score').textContent='Bestenliste ansehen';if(names[mode]&&Number.isFinite(score)&&score>Math.max(Number(submitted[mode])||0,Number(pending[mode])||0)){pending[mode]=score;saveQueue();$('submit-score').textContent='Highscore wird eingetragen …';}syncScores();});
 window.addEventListener('online',syncScores);document.addEventListener('stars-profile-ready',syncScores);document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncScores();});
 syncScores();
 $('open-leaderboard').addEventListener('click',()=>open(current));$('close-leaderboard').addEventListener('click',()=>$('leaderboard-dialog').close());$('leaderboard-retry').addEventListener('click',load);
 $('submit-score').addEventListener('click',()=>{syncScores();if(lastResult)open(lastResult.mode==='sling'?'snake':lastResult.mode==='storm'?'orbit':lastResult.mode,lastResult.score);});
})();
