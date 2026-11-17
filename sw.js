'use strict';
const VERSION='v70';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./storm-battlefield-gold.png?v=70','./storm-battlefield-silver.png?v=70','./storm-banter.js?v=70','./storm-boss-sigil.png?v=70','./storm-dissolve-solaris.png?v=70','./storm-dissolve-solaris-symbol.png?v=70','./storm-dissolve-volt.png?v=70','./storm-dissolve-volt-symbol.png?v=70','./storm-dissolve-polaris.png?v=70','./storm-dissolve-polaris-symbol.png?v=70','./storm-dissolve-aegis.png?v=70','./storm-dissolve-aegis-symbol.png?v=70','./storm-dissolve-phoenix.png?v=70','./storm-dissolve-phoenix-symbol.png?v=70','./','./index.html','./style.css?v=70','./app.js?v=70','./game.js?v=70','./snake.js?v=70','./trail.js?v=70','./nova.js?v=70','./storm.js?v=70','./storm-art.js?v=70','./storm-enemies.js?v=70','./storm-layout.js?v=70','./storm-legion-0.png?v=70','./storm-legion-1.png?v=70','./storm-legion-2.png?v=70','./storm-battlefield-v40.png?v=70','./storm-core.png?v=70','./storm-hero-solaris.png?v=70','./storm-hero-volt.png?v=70','./storm-hero-polaris.png?v=70','./storm-hero-aegis.png?v=70','./storm-hero-phoenix.png?v=70','./storm-sword.png?v=70','./storm-shield.png?v=70','./storm-sniper.png?v=70','./storm-rocket.png?v=70','./storm-plasma.png?v=70','./leaderboard.js?v=70','./leaderboard-config.js?v=70','./dodge.js?v=70','./music.js?v=70','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=70','./battle-strings-high.m4a?v=70','./battle-strings-pad.m4a?v=70','./battle-cello.m4a?v=70','./battle-horn.m4a?v=70','./battle-horn-stab.m4a?v=70','./battle-trumpet.m4a?v=70','./battle-drum.m4a?v=70','./battle-snare.m4a?v=70','./battle-timpani.m4a?v=70','./battle-cymbal.m4a?v=70','./offline.js?v=70','./manifest.webmanifest?v=70','./icon.svg?v=70','./icon-180.png?v=70','./icon-192.png?v=70','./icon-512.png?v=70'];
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
