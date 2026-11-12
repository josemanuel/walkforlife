// WalkForLife - Service Worker v3: network-first (siempre la versión nueva si hay red), caché como respaldo offline.
const CACHE='walkforlife-cache-v3';
const BASE=['./','WalkForLife.html','WalkForLife-Manual.html','WalkForLife-Recetas.html','manifest.json','icon-192.png','icon-512.png','LogoWalkforlife.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.all(BASE.map(u=>c.add(u).catch(()=>{})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));
});
