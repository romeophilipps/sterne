'use strict';
const VERSION='v52';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./intro-audio.js?v=52','./intro-narration.m4a?v=52','./intro.js?v=52','./intro.css?v=52','./intro-guardians.jpg?v=52','./intro-ambition.jpg?v=52','./intro-void.jpg?v=52','./intro-world.jpg?v=52','./intro-betrayal.jpg?v=52','./intro-fallen.jpg?v=52','./intro-battle.jpg?v=52','./intro-banish.jpg?v=52','./intro-legion.jpg?v=52','./intro-eclipse.jpg?v=52','./','./index.html','./style.css?v=52','./app.js?v=52','./game.js?v=52','./snake.js?v=52','./trail.js?v=52','./nova.js?v=52','./storm.js?v=52','./storm-art.js?v=52','./storm-enemies.js?v=52','./storm-layout.js?v=52','./storm-legion-0.png?v=52','./storm-legion-1.png?v=52','./storm-legion-2.png?v=52','./storm-battlefield-v40.png?v=52','./storm-core.png?v=52','./storm-hero-solaris.png?v=52','./storm-hero-volt.png?v=52','./storm-hero-polaris.png?v=52','./storm-hero-aegis.png?v=52','./storm-hero-phoenix.png?v=52','./storm-sword.png?v=52','./storm-shield.png?v=52','./storm-sniper.png?v=52','./storm-rocket.png?v=52','./storm-plasma.png?v=52','./leaderboard.js?v=52','./leaderboard-config.js?v=52','./dodge.js?v=52','./music.js?v=52','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=52','./battle-strings-high.m4a?v=52','./battle-strings-pad.m4a?v=52','./battle-cello.m4a?v=52','./battle-horn.m4a?v=52','./battle-horn-stab.m4a?v=52','./battle-trumpet.m4a?v=52','./battle-drum.m4a?v=52','./battle-snare.m4a?v=52','./battle-timpani.m4a?v=52','./battle-cymbal.m4a?v=52','./offline.js?v=52','./manifest.webmanifest?v=52','./icon.svg?v=52','./icon-180.png?v=52','./icon-192.png?v=52','./icon-512.png?v=52'];
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
