'use strict';
const VERSION='v95';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./player-profile.js?v=95','./sound.js?v=95','./cosmic-theme.css?v=95','./cosmic-art.js?v=95','./home-menu.js?v=95','./storm-logo-space.png?v=95','./storm-reveal-space.png?v=95','./storm-reveal.js?v=95','./storm-wordmark.png?v=95','./storm-reveal.m4a?v=95','./storm-roster.js?v=95','./storm-duel.js?v=95','./storm-online.js?v=95','./storm-duel-ui.js?v=95','./storm-healer.png?v=95','./storm-scout.png?v=95','./storm-arcanist.png?v=95','./storm-soul-portal.png?v=95','./storm-drone.png?v=95','./storm-bruiser.png?v=95','./storm-assassin.png?v=95','./storm-battlefield-gold.png?v=95','./storm-battlefield-silver.png?v=95','./storm-banter.js?v=95','./storm-boss-sigil.png?v=95','./storm-dissolve-solaris.png?v=95','./storm-dissolve-solaris-symbol.png?v=95','./storm-dissolve-volt.png?v=95','./storm-dissolve-volt-symbol.png?v=95','./storm-dissolve-polaris.png?v=95','./storm-dissolve-polaris-symbol.png?v=95','./storm-dissolve-aegis.png?v=95','./storm-dissolve-aegis-symbol.png?v=95','./storm-dissolve-phoenix.png?v=95','./storm-dissolve-phoenix-symbol.png?v=95','./','./index.html','./style.css?v=95','./app.js?v=95','./game.js?v=95','./snake.js?v=95','./trail.js?v=95','./nova.js?v=95','./storm.js?v=95','./storm-art.js?v=95','./storm-enemies.js?v=95','./storm-layout.js?v=95','./storm-legion-0.png?v=95','./storm-legion-1.png?v=95','./storm-legion-2.png?v=95','./storm-battlefield-v40.png?v=95','./storm-core.png?v=95','./storm-hero-solaris.png?v=95','./storm-hero-volt.png?v=95','./storm-hero-polaris.png?v=95','./storm-hero-aegis.png?v=95','./storm-hero-phoenix.png?v=95','./storm-sword.png?v=95','./storm-shield.png?v=95','./storm-sniper.png?v=95','./storm-rocket.png?v=95','./storm-plasma.png?v=95','./leaderboard.js?v=95','./leaderboard-config.js?v=95','./dodge.js?v=95','./music.js?v=95','./MUSIC-CREDITS.txt','./battle-strings-low.m4a?v=95','./battle-strings-high.m4a?v=95','./battle-strings-pad.m4a?v=95','./battle-cello.m4a?v=95','./battle-horn.m4a?v=95','./battle-horn-stab.m4a?v=95','./battle-trumpet.m4a?v=95','./battle-drum.m4a?v=95','./battle-snare.m4a?v=95','./battle-timpani.m4a?v=95','./battle-cymbal.m4a?v=95','./offline.js?v=95','./manifest.webmanifest?v=95','./icon.svg?v=95','./icon-180.png?v=95','./icon-192.png?v=95','./icon-512.png?v=95'];
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
