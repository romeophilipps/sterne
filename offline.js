'use strict';
(() => {
  const VERSION='v161', $=id=>document.getElementById(id);
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let preparing, promptEvent, ready=false, updatePending=false;
  function status(text,ok=false){ready=ok;$('offline-status').textContent=text;$('offline-status').dataset.ready=String(ok);$('download-status').textContent=ok?'Auf diesem Gerät gespeichert.':text;$('download-status').dataset.ready=String(ok);$('download-retry').hidden=ok||text==='Wird gespeichert …';$('install').hidden=ok&&standalone();$('install-steps').hidden=standalone();$('native-install').disabled=!ok;}
  function ask(worker,type='OFFLINE_STATUS',timeout=3500){return new Promise((resolve,reject)=>{if(!worker){reject(new Error('No controller'));return;}const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();reject(new Error('Timeout'));},timeout);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};worker.postMessage({type},[channel.port2]);});}
  async function verify(){try{const reply=await ask(navigator.serviceWorker.controller);if(reply.version===VERSION&&reply.ready){updatePending=false;status('Offline bereit',true);return true;}if(Number(reply.version?.slice(1))>Number(VERSION.slice(1)))updatePending=true;}catch{}return false;}
  function controlled(){if(navigator.serviceWorker.controller)return Promise.resolve();return new Promise((resolve,reject)=>{const done=()=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',done);resolve();};const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('controllerchange',done);reject(new Error('No controller'));},15000);navigator.serviceWorker.addEventListener('controllerchange',done);});}
  async function prepare(){
    if(preparing)return preparing;
    preparing=(async()=>{
      if(!('serviceWorker' in navigator)||!window.isSecureContext){status('Zum Laden bitte in Safari öffnen.');return false;}
      if(await verify())return true;
      status('Wird gespeichert …');
      try{
        await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
        await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Install timeout')),20000))]);
        await controlled();
        const result=await ask(navigator.serviceWorker.controller,'DOWNLOAD',20000);
        if(result.version!==VERSION||!result.ready)throw new Error('Not ready');
        status('Offline bereit',true);return true;
      }catch{if(await verify())return true;status('Internet prüfen und erneut laden.');return false;}
    })().finally(()=>{preparing=null;});return preparing;
  }
  if('serviceWorker' in navigator){
    navigator.serviceWorker.addEventListener('controllerchange',()=>{verify().then(ok=>{if(!ok&&updatePending&&$('game').hidden)location.reload();});});
    new MutationObserver(()=>{if(updatePending&&$('game').hidden)location.reload();}).observe($('game'),{attributes:true,attributeFilter:['hidden']});
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;$('native-install').hidden=false;});
  window.addEventListener('appinstalled',()=>{$('install').hidden=true;$('install-dialog').close();});
  $('native-install').addEventListener('click',async()=>{if(!promptEvent||!ready)return;await promptEvent.prompt();promptEvent=null;$('native-install').hidden=true;});
  $('install').addEventListener('click',async()=>{$('install-dialog').showModal();if(await prepare()){try{await navigator.storage?.persist?.();}catch{}}});
  $('download-retry').addEventListener('click',prepare);
  $('close-install').addEventListener('click',()=>$('install-dialog').close());
  window.addEventListener('online',()=>{if(!ready)prepare();});
  window.addEventListener('pageshow',()=>{prepare();});
  prepare().then(()=>{if('serviceWorker' in navigator)navigator.serviceWorker.getRegistration().then(reg=>reg?.update()).catch(()=>{});});
})();
