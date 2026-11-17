'use strict';
const VERSION='v69';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./storm-battlefield-silver.png?v=69','./storm-banter.js?v=69','./storm-boss-sigil.png?v=69','./storm-dissolve-solaris.png?v=69','./storm-dissolve-solaris-symbol.png?v=69','./storm-dissolve-volt.png?v=69','./storm-dissolve-volt-symbol.png?v=69','./storm-dissolve-polaris.png?v=69','./storm-dissolve-polaris-symbol.png?v=69','./storm-dissolve-aegis.png?v=69','./storm-dissolve-aegis-symbol.png?v=69','./storm-dissolve-phoenix.png?v=69','./storm-dissolve-phoenix-symbol.png?v=69','./','./index.html','./style.css?v=69','./app.js?v=69','./game.js?v=69','./snake.js?v=69','./trail.js?v=69','./nova.js?v=69','./storm.js?v=69','./storm-art.js?v=69','./storm-enemies.js?v=69','./storm-layout.js?v=69','./storm-legion-0.png?v=69','./storm-legion-1.png?v=69','./storm-legion-2.png?v=69','./storm-battlefield-v40.png?v=69','./storm-core.png?v=69','./storm-hero-solaris.png?v=69','./storm-hero-volt.png?v=69','./storm-hero-polaris.png?v=69','./storm-hero-aegis.png?v=69','./storm-hero-phoenix.png?v=69','./storm-sword.png?v=69','./storm-shield.png?v=69','./storm-sniper.png?v=69','./storm-rocket.png?v=69','./storm-plasma.png?v=69','./leaderboard.js?v=69','./leaderboard-config.js?v=69','./dodge.js?v=69','./music.js?v=69','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=69','./battle-strings-high.m4a?v=69','./battle-strings-pad.m4a?v=69','./battle-cello.m4a?v=69','./battle-horn.m4a?v=69','./battle-horn-stab.m4a?v=69','./battle-trumpet.m4a?v=69','./battle-drum.m4a?v=69','./battle-snare.m4a?v=69','./battle-timpani.m4a?v=69','./battle-cymbal.m4a?v=69','./offline.js?v=69','./manifest.webmanifest?v=69','./icon.svg?v=69','./icon-180.png?v=69','./icon-192.png?v=69','./icon-512.png?v=69'];
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
