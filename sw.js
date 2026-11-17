'use strict';
const VERSION='v64';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./storm-boss-sigil.png?v=64','./storm-dissolve-solaris.png?v=64','./storm-dissolve-solaris-symbol.png?v=64','./storm-dissolve-volt.png?v=64','./storm-dissolve-volt-symbol.png?v=64','./storm-dissolve-polaris.png?v=64','./storm-dissolve-polaris-symbol.png?v=64','./storm-dissolve-aegis.png?v=64','./storm-dissolve-aegis-symbol.png?v=64','./storm-dissolve-phoenix.png?v=64','./storm-dissolve-phoenix-symbol.png?v=64','./','./index.html','./style.css?v=64','./app.js?v=64','./game.js?v=64','./snake.js?v=64','./trail.js?v=64','./nova.js?v=64','./storm.js?v=64','./storm-art.js?v=64','./storm-enemies.js?v=64','./storm-layout.js?v=64','./storm-legion-0.png?v=64','./storm-legion-1.png?v=64','./storm-legion-2.png?v=64','./storm-battlefield-v40.png?v=64','./storm-core.png?v=64','./storm-hero-solaris.png?v=64','./storm-hero-volt.png?v=64','./storm-hero-polaris.png?v=64','./storm-hero-aegis.png?v=64','./storm-hero-phoenix.png?v=64','./storm-sword.png?v=64','./storm-shield.png?v=64','./storm-sniper.png?v=64','./storm-rocket.png?v=64','./storm-plasma.png?v=64','./leaderboard.js?v=64','./leaderboard-config.js?v=64','./dodge.js?v=64','./music.js?v=64','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=64','./battle-strings-high.m4a?v=64','./battle-strings-pad.m4a?v=64','./battle-cello.m4a?v=64','./battle-horn.m4a?v=64','./battle-horn-stab.m4a?v=64','./battle-trumpet.m4a?v=64','./battle-drum.m4a?v=64','./battle-snare.m4a?v=64','./battle-timpani.m4a?v=64','./battle-cymbal.m4a?v=64','./offline.js?v=64','./manifest.webmanifest?v=64','./icon.svg?v=64','./icon-180.png?v=64','./icon-192.png?v=64','./icon-512.png?v=64'];
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
