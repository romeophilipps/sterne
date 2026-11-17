'use strict';
const VERSION='v41';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./','./index.html','./style.css?v=41','./app.js?v=41','./game.js?v=41','./snake.js?v=41','./trail.js?v=41','./nova.js?v=41','./storm.js?v=41','./storm-art.js?v=41','./storm-enemies.js?v=41','./storm-legion-0.png?v=41','./storm-legion-1.png?v=41','./storm-legion-2.png?v=41','./storm-battlefield-v40.png?v=41','./storm-core.png?v=41','./storm-hero-solaris.png?v=41','./storm-hero-volt.png?v=41','./storm-hero-polaris.png?v=41','./storm-hero-aegis.png?v=41','./storm-hero-phoenix.png?v=41','./storm-sword.png?v=41','./storm-shield.png?v=41','./storm-sniper.png?v=41','./storm-rocket.png?v=41','./storm-plasma.png?v=41','./leaderboard.js?v=41','./leaderboard-config.js?v=41','./dodge.js?v=41','./music.js?v=41','./offline.js?v=41','./manifest.webmanifest?v=41','./icon.svg?v=41','./icon-180.png?v=41','./icon-192.png?v=41','./icon-512.png?v=41'];
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
