'use strict';
const VERSION='v56';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./storm-dissolve-solaris.png?v=56','./storm-dissolve-solaris-symbol.png?v=56','./storm-dissolve-volt.png?v=56','./storm-dissolve-volt-symbol.png?v=56','./storm-dissolve-polaris.png?v=56','./storm-dissolve-polaris-symbol.png?v=56','./storm-dissolve-aegis.png?v=56','./storm-dissolve-aegis-symbol.png?v=56','./storm-dissolve-phoenix.png?v=56','./storm-dissolve-phoenix-symbol.png?v=56','./','./index.html','./style.css?v=56','./app.js?v=56','./game.js?v=56','./snake.js?v=56','./trail.js?v=56','./nova.js?v=56','./storm.js?v=56','./storm-art.js?v=56','./storm-enemies.js?v=56','./storm-layout.js?v=56','./storm-legion-0.png?v=56','./storm-legion-1.png?v=56','./storm-legion-2.png?v=56','./storm-battlefield-v40.png?v=56','./storm-core.png?v=56','./storm-hero-solaris.png?v=56','./storm-hero-volt.png?v=56','./storm-hero-polaris.png?v=56','./storm-hero-aegis.png?v=56','./storm-hero-phoenix.png?v=56','./storm-sword.png?v=56','./storm-shield.png?v=56','./storm-sniper.png?v=56','./storm-rocket.png?v=56','./storm-plasma.png?v=56','./leaderboard.js?v=56','./leaderboard-config.js?v=56','./dodge.js?v=56','./music.js?v=56','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=56','./battle-strings-high.m4a?v=56','./battle-strings-pad.m4a?v=56','./battle-cello.m4a?v=56','./battle-horn.m4a?v=56','./battle-horn-stab.m4a?v=56','./battle-trumpet.m4a?v=56','./battle-drum.m4a?v=56','./battle-snare.m4a?v=56','./battle-timpani.m4a?v=56','./battle-cymbal.m4a?v=56','./offline.js?v=56','./manifest.webmanifest?v=56','./icon.svg?v=56','./icon-180.png?v=56','./icon-192.png?v=56','./icon-512.png?v=56'];
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
