'use strict';
const VERSION='v68';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./storm-banter.js?v=68','./storm-boss-sigil.png?v=68','./storm-dissolve-solaris.png?v=68','./storm-dissolve-solaris-symbol.png?v=68','./storm-dissolve-volt.png?v=68','./storm-dissolve-volt-symbol.png?v=68','./storm-dissolve-polaris.png?v=68','./storm-dissolve-polaris-symbol.png?v=68','./storm-dissolve-aegis.png?v=68','./storm-dissolve-aegis-symbol.png?v=68','./storm-dissolve-phoenix.png?v=68','./storm-dissolve-phoenix-symbol.png?v=68','./','./index.html','./style.css?v=68','./app.js?v=68','./game.js?v=68','./snake.js?v=68','./trail.js?v=68','./nova.js?v=68','./storm.js?v=68','./storm-art.js?v=68','./storm-enemies.js?v=68','./storm-layout.js?v=68','./storm-legion-0.png?v=68','./storm-legion-1.png?v=68','./storm-legion-2.png?v=68','./storm-battlefield-v40.png?v=68','./storm-core.png?v=68','./storm-hero-solaris.png?v=68','./storm-hero-volt.png?v=68','./storm-hero-polaris.png?v=68','./storm-hero-aegis.png?v=68','./storm-hero-phoenix.png?v=68','./storm-sword.png?v=68','./storm-shield.png?v=68','./storm-sniper.png?v=68','./storm-rocket.png?v=68','./storm-plasma.png?v=68','./leaderboard.js?v=68','./leaderboard-config.js?v=68','./dodge.js?v=68','./music.js?v=68','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=68','./battle-strings-high.m4a?v=68','./battle-strings-pad.m4a?v=68','./battle-cello.m4a?v=68','./battle-horn.m4a?v=68','./battle-horn-stab.m4a?v=68','./battle-trumpet.m4a?v=68','./battle-drum.m4a?v=68','./battle-snare.m4a?v=68','./battle-timpani.m4a?v=68','./battle-cymbal.m4a?v=68','./offline.js?v=68','./manifest.webmanifest?v=68','./icon.svg?v=68','./icon-180.png?v=68','./icon-192.png?v=68','./icon-512.png?v=68'];
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
