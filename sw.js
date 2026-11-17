'use strict';
const VERSION='v42';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./','./index.html','./style.css?v=42','./app.js?v=42','./game.js?v=42','./snake.js?v=42','./trail.js?v=42','./nova.js?v=42','./storm.js?v=42','./storm-art.js?v=42','./storm-enemies.js?v=42','./storm-legion-0.png?v=42','./storm-legion-1.png?v=42','./storm-legion-2.png?v=42','./storm-battlefield-v40.png?v=42','./storm-core.png?v=42','./storm-hero-solaris.png?v=42','./storm-hero-volt.png?v=42','./storm-hero-polaris.png?v=42','./storm-hero-aegis.png?v=42','./storm-hero-phoenix.png?v=42','./storm-sword.png?v=42','./storm-shield.png?v=42','./storm-sniper.png?v=42','./storm-rocket.png?v=42','./storm-plasma.png?v=42','./leaderboard.js?v=42','./leaderboard-config.js?v=42','./dodge.js?v=42','./music.js?v=42','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=42','./battle-strings-high.m4a?v=42','./battle-strings-pad.m4a?v=42','./battle-cello.m4a?v=42','./battle-horn.m4a?v=42','./battle-horn-stab.m4a?v=42','./battle-trumpet.m4a?v=42','./battle-drum.m4a?v=42','./battle-snare.m4a?v=42','./battle-timpani.m4a?v=42','./battle-cymbal.m4a?v=42','./offline.js?v=42','./manifest.webmanifest?v=42','./icon.svg?v=42','./icon-180.png?v=42','./icon-192.png?v=42','./icon-512.png?v=42'];
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
