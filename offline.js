'use strict';
(() => {
  const VERSION='v210', $=id=>document.getElementById(id);
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let preparing, promptEvent, ready=false, updatePending=false;
  function status(text,ok=false){ready=ok;$('offline-status').textContent=text;$('offline-status').dataset.ready=String(ok);$('download-status').textContent=ok?'Auf diesem Gerät gespeichert.':text;$('download-status').dataset.ready=String(ok);$('download-retry').hidden=ok||text.startsWith('Wird gespeichert …');$('install').hidden=ok&&standalone();$('install-steps').hidden=standalone();$('native-install').disabled=!ok;}
  function ask(worker,type='OFFLINE_STATUS',timeout=10000){return new Promise((resolve,reject)=>{
    if(!worker){reject(new Error('No controller'));return;}
    const channel=new MessageChannel();let timer;
    const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{channel.port1.close();reject(Object.assign(new Error('Timeout'),{kind:'timeout'}));},timeout);};
    channel.port1.onmessage=e=>{if(e.data?.progress){arm();status('Wird gespeichert … '+e.data.done+' / '+e.data.files+' Dateien');return;}clearTimeout(timer);channel.port1.close();resolve(e.data);};
    arm();worker.postMessage({type},[channel.port2]);
  });}
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
        await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Install timeout')),60000))]);
        await controlled();
        const result=await ask(navigator.serviceWorker.controller,'DOWNLOAD',45000);
        if(result.version!==VERSION){updatePending=true;status('Neue Version verfügbar. Bitte das Spiel neu öffnen.');return false;}
        if(!result.ready)throw Object.assign(new Error('Not ready'),{kind:result.error||'incomplete'});
        status('Offline bereit',true);return true;
      }catch(error){if(await verify())return true;const message=error.kind==='storage'?'Nicht genug Gerätespeicher. Bitte Speicher freigeben und erneut laden.':navigator.onLine===false?'Gerade offline. Bereits geladene Dateien bleiben gespeichert.':error.kind==='timeout'?'Der Download dauert länger. Erneut laden setzt ihn fort.':'Einige Spieldateien konnten nicht gespeichert werden. Erneut laden setzt den Download fort.';status(message);return false;}
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
