'use strict';
const VERSION='v51';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./intro-audio.js?v=51','./intro-narration.m4a?v=51','./intro.js?v=51','./intro.css?v=51','./intro-guardians.jpg?v=51','./intro-ambition.jpg?v=51','./intro-void.jpg?v=51','./intro-world.jpg?v=51','./intro-betrayal.jpg?v=51','./intro-fallen.jpg?v=51','./intro-battle.jpg?v=51','./intro-banish.jpg?v=51','./intro-legion.jpg?v=51','./intro-eclipse.jpg?v=51','./','./index.html','./style.css?v=51','./app.js?v=51','./game.js?v=51','./snake.js?v=51','./trail.js?v=51','./nova.js?v=51','./storm.js?v=51','./storm-art.js?v=51','./storm-enemies.js?v=51','./storm-layout.js?v=51','./storm-legion-0.png?v=51','./storm-legion-1.png?v=51','./storm-legion-2.png?v=51','./storm-battlefield-v40.png?v=51','./storm-core.png?v=51','./storm-hero-solaris.png?v=51','./storm-hero-volt.png?v=51','./storm-hero-polaris.png?v=51','./storm-hero-aegis.png?v=51','./storm-hero-phoenix.png?v=51','./storm-sword.png?v=51','./storm-shield.png?v=51','./storm-sniper.png?v=51','./storm-rocket.png?v=51','./storm-plasma.png?v=51','./leaderboard.js?v=51','./leaderboard-config.js?v=51','./dodge.js?v=51','./music.js?v=51','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=51','./battle-strings-high.m4a?v=51','./battle-strings-pad.m4a?v=51','./battle-cello.m4a?v=51','./battle-horn.m4a?v=51','./battle-horn-stab.m4a?v=51','./battle-trumpet.m4a?v=51','./battle-drum.m4a?v=51','./battle-snare.m4a?v=51','./battle-timpani.m4a?v=51','./battle-cymbal.m4a?v=51','./offline.js?v=51','./manifest.webmanifest?v=51','./icon.svg?v=51','./icon-180.png?v=51','./icon-192.png?v=51','./icon-512.png?v=51'];
const absolute=path=>new URL(path,self.registration.scope).href;
async function complete(){const cache=await caches.open(CACHE);const entries=await Promise.all(ASSETS.map(path=>cache.match(absolute(path))));return entries.every(response=>response&&response.ok);}
async function download(){const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(path=>new Request(absolute(path),{cache:'reload'})));if(!await complete())throw new Error('Incomplete download');}
self.addEventListener('install',event=>{event.waitUntil(download().then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('sternensammler-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{
  if(!['OFFLINE_STATUS','DOWNLOAD'].includes(event.data?.type))return;
  event.waitUntil((async()=>{try{if(event.data.type==='DOWNLOAD'&&!await complete())await download();event.ports[0]?.postMessage({version:VERSION,ready:await complete(),files:ASSETS.length});}catch{event.ports[0]?.postMessage({version:VERSION,ready:false});}})());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
  const root=new URL(self.registration.scope).pathname;
  if(request.mode==='navigate'&&(url.pathname===root||url.pathname===root+'index.html')){
    event.respondWith(caches.open(CACHE).then(async cache=>{try{const response=await fetch(request);if(response.ok)return response;}catch{}return (await cache.match(absolute('./index.html')))||Response.error();}));return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));
});
