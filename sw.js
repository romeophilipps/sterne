'use strict';
const VERSION='v94';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./sound.js?v=94','./cosmic-theme.css?v=94','./cosmic-art.js?v=94','./home-menu.js?v=94','./storm-logo-space.png?v=94','./storm-reveal-space.png?v=94','./storm-reveal.js?v=94','./storm-wordmark.png?v=94','./storm-reveal.m4a?v=94','./storm-roster.js?v=94','./storm-duel.js?v=94','./storm-online.js?v=94','./storm-duel-ui.js?v=94','./storm-healer.png?v=94','./storm-scout.png?v=94','./storm-arcanist.png?v=94','./storm-soul-portal.png?v=94','./storm-drone.png?v=94','./storm-bruiser.png?v=94','./storm-assassin.png?v=94','./storm-battlefield-gold.png?v=94','./storm-battlefield-silver.png?v=94','./storm-banter.js?v=94','./storm-boss-sigil.png?v=94','./storm-dissolve-solaris.png?v=94','./storm-dissolve-solaris-symbol.png?v=94','./storm-dissolve-volt.png?v=94','./storm-dissolve-volt-symbol.png?v=94','./storm-dissolve-polaris.png?v=94','./storm-dissolve-polaris-symbol.png?v=94','./storm-dissolve-aegis.png?v=94','./storm-dissolve-aegis-symbol.png?v=94','./storm-dissolve-phoenix.png?v=94','./storm-dissolve-phoenix-symbol.png?v=94','./','./index.html','./style.css?v=94','./app.js?v=94','./game.js?v=94','./snake.js?v=94','./trail.js?v=94','./nova.js?v=94','./storm.js?v=94','./storm-art.js?v=94','./storm-enemies.js?v=94','./storm-layout.js?v=94','./storm-legion-0.png?v=94','./storm-legion-1.png?v=94','./storm-legion-2.png?v=94','./storm-battlefield-v40.png?v=94','./storm-core.png?v=94','./storm-hero-solaris.png?v=94','./storm-hero-volt.png?v=94','./storm-hero-polaris.png?v=94','./storm-hero-aegis.png?v=94','./storm-hero-phoenix.png?v=94','./storm-sword.png?v=94','./storm-shield.png?v=94','./storm-sniper.png?v=94','./storm-rocket.png?v=94','./storm-plasma.png?v=94','./leaderboard.js?v=94','./leaderboard-config.js?v=94','./dodge.js?v=94','./music.js?v=94','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=94','./battle-strings-high.m4a?v=94','./battle-strings-pad.m4a?v=94','./battle-cello.m4a?v=94','./battle-horn.m4a?v=94','./battle-horn-stab.m4a?v=94','./battle-trumpet.m4a?v=94','./battle-drum.m4a?v=94','./battle-snare.m4a?v=94','./battle-timpani.m4a?v=94','./battle-cymbal.m4a?v=94','./offline.js?v=94','./manifest.webmanifest?v=94','./icon.svg?v=94','./icon-180.png?v=94','./icon-192.png?v=94','./icon-512.png?v=94'];
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
