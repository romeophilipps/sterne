'use strict';
const VERSION='v79';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./storm-healer.png?v=79','./storm-scout.png?v=79','./storm-drone.png?v=79','./storm-bruiser.png?v=79','./storm-assassin.png?v=79','./storm-battlefield-gold.png?v=79','./storm-battlefield-silver.png?v=79','./storm-banter.js?v=79','./storm-boss-sigil.png?v=79','./storm-dissolve-solaris.png?v=79','./storm-dissolve-solaris-symbol.png?v=79','./storm-dissolve-volt.png?v=79','./storm-dissolve-volt-symbol.png?v=79','./storm-dissolve-polaris.png?v=79','./storm-dissolve-polaris-symbol.png?v=79','./storm-dissolve-aegis.png?v=79','./storm-dissolve-aegis-symbol.png?v=79','./storm-dissolve-phoenix.png?v=79','./storm-dissolve-phoenix-symbol.png?v=79','./','./index.html','./style.css?v=79','./app.js?v=79','./game.js?v=79','./snake.js?v=79','./trail.js?v=79','./nova.js?v=79','./storm.js?v=79','./storm-art.js?v=79','./storm-enemies.js?v=79','./storm-layout.js?v=79','./storm-legion-0.png?v=79','./storm-legion-1.png?v=79','./storm-legion-2.png?v=79','./storm-battlefield-v40.png?v=79','./storm-core.png?v=79','./storm-hero-solaris.png?v=79','./storm-hero-volt.png?v=79','./storm-hero-polaris.png?v=79','./storm-hero-aegis.png?v=79','./storm-hero-phoenix.png?v=79','./storm-sword.png?v=79','./storm-shield.png?v=79','./storm-sniper.png?v=79','./storm-rocket.png?v=79','./storm-plasma.png?v=79','./leaderboard.js?v=79','./leaderboard-config.js?v=79','./dodge.js?v=79','./music.js?v=79','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=79','./battle-strings-high.m4a?v=79','./battle-strings-pad.m4a?v=79','./battle-cello.m4a?v=79','./battle-horn.m4a?v=79','./battle-horn-stab.m4a?v=79','./battle-trumpet.m4a?v=79','./battle-drum.m4a?v=79','./battle-snare.m4a?v=79','./battle-timpani.m4a?v=79','./battle-cymbal.m4a?v=79','./offline.js?v=79','./manifest.webmanifest?v=79','./icon.svg?v=79','./icon-180.png?v=79','./icon-192.png?v=79','./icon-512.png?v=79'];
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
