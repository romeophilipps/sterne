'use strict';
const VERSION='v44';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./intro.js?v=44','./intro.css?v=44','./intro-guardians.jpg?v=44','./intro-ambition.jpg?v=44','./intro-void.jpg?v=44','./intro-world.jpg?v=44','./intro-betrayal.jpg?v=44','./intro-fallen.jpg?v=44','./intro-battle.jpg?v=44','./intro-banish.jpg?v=44','./intro-legion.jpg?v=44','./intro-eclipse.jpg?v=44','./','./index.html','./style.css?v=44','./app.js?v=44','./game.js?v=44','./snake.js?v=44','./trail.js?v=44','./nova.js?v=44','./storm.js?v=44','./storm-art.js?v=44','./storm-enemies.js?v=44','./storm-layout.js?v=44','./storm-legion-0.png?v=44','./storm-legion-1.png?v=44','./storm-legion-2.png?v=44','./storm-battlefield-v40.png?v=44','./storm-core.png?v=44','./storm-hero-solaris.png?v=44','./storm-hero-volt.png?v=44','./storm-hero-polaris.png?v=44','./storm-hero-aegis.png?v=44','./storm-hero-phoenix.png?v=44','./storm-sword.png?v=44','./storm-shield.png?v=44','./storm-sniper.png?v=44','./storm-rocket.png?v=44','./storm-plasma.png?v=44','./leaderboard.js?v=44','./leaderboard-config.js?v=44','./dodge.js?v=44','./music.js?v=44','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=44','./battle-strings-high.m4a?v=44','./battle-strings-pad.m4a?v=44','./battle-cello.m4a?v=44','./battle-horn.m4a?v=44','./battle-horn-stab.m4a?v=44','./battle-trumpet.m4a?v=44','./battle-drum.m4a?v=44','./battle-snare.m4a?v=44','./battle-timpani.m4a?v=44','./battle-cymbal.m4a?v=44','./offline.js?v=44','./manifest.webmanifest?v=44','./icon.svg?v=44','./icon-180.png?v=44','./icon-192.png?v=44','./icon-512.png?v=44'];
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
    event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(absolute('./index.html')))||fetch(request)));return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));
});
