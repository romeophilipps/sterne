'use strict';
const VERSION='v40';
const CACHE='sternensammler-'+VERSION;
const ASSETS=['./','./index.html','./style.css?v=40','./app.js?v=40','./game.js?v=40','./snake.js?v=40','./trail.js?v=40','./nova.js?v=40','./storm.js?v=40','./storm-art.js?v=40','./storm-battlefield-v40.png?v=40','./storm-core.png?v=40','./storm-hero-solaris.png?v=40','./storm-hero-volt.png?v=40','./storm-hero-polaris.png?v=40','./storm-hero-aegis.png?v=40','./storm-hero-phoenix.png?v=40','./storm-sword.png?v=40','./storm-shield.png?v=40','./storm-sniper.png?v=40','./storm-rocket.png?v=40','./storm-plasma.png?v=40','./leaderboard.js?v=40','./leaderboard-config.js?v=40','./dodge.js?v=40','./music.js?v=40','./offline.js?v=40','./manifest.webmanifest?v=40','./icon.svg?v=40','./icon-180.png?v=40','./icon-192.png?v=40','./icon-512.png?v=40'];
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
