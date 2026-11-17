'use strict';
const VERSION='v46';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./intro-audio.js?v=46','./intro-narration.m4a?v=46','./intro.js?v=46','./intro.css?v=46','./intro-guardians.jpg?v=46','./intro-ambition.jpg?v=46','./intro-void.jpg?v=46','./intro-world.jpg?v=46','./intro-betrayal.jpg?v=46','./intro-fallen.jpg?v=46','./intro-battle.jpg?v=46','./intro-banish.jpg?v=46','./intro-legion.jpg?v=46','./intro-eclipse.jpg?v=46','./','./index.html','./style.css?v=46','./app.js?v=46','./game.js?v=46','./snake.js?v=46','./trail.js?v=46','./nova.js?v=46','./storm.js?v=46','./storm-art.js?v=46','./storm-enemies.js?v=46','./storm-layout.js?v=46','./storm-legion-0.png?v=46','./storm-legion-1.png?v=46','./storm-legion-2.png?v=46','./storm-battlefield-v40.png?v=46','./storm-core.png?v=46','./storm-hero-solaris.png?v=46','./storm-hero-volt.png?v=46','./storm-hero-polaris.png?v=46','./storm-hero-aegis.png?v=46','./storm-hero-phoenix.png?v=46','./storm-sword.png?v=46','./storm-shield.png?v=46','./storm-sniper.png?v=46','./storm-rocket.png?v=46','./storm-plasma.png?v=46','./leaderboard.js?v=46','./leaderboard-config.js?v=46','./dodge.js?v=46','./music.js?v=46','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=46','./battle-strings-high.m4a?v=46','./battle-strings-pad.m4a?v=46','./battle-cello.m4a?v=46','./battle-horn.m4a?v=46','./battle-horn-stab.m4a?v=46','./battle-trumpet.m4a?v=46','./battle-drum.m4a?v=46','./battle-snare.m4a?v=46','./battle-timpani.m4a?v=46','./battle-cymbal.m4a?v=46','./offline.js?v=46','./manifest.webmanifest?v=46','./icon.svg?v=46','./icon-180.png?v=46','./icon-192.png?v=46','./icon-512.png?v=46'];
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
