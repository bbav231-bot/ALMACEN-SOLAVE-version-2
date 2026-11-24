// Almacén 3D — service worker. Cambia VERSION en cada entrega para que los equipos detecten la actualización.
const VERSION='1.2.3',CORE_CACHE='a3d-core-'+VERSION,LIB_CACHE='a3d-libs';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','version.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE_CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CORE_CACHE&&k!==LIB_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){
  if(u.pathname.endsWith('/version.json')||u.pathname.endsWith('/config-nube.js')){e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok&&u.pathname.endsWith('/config-nube.js')){const c=res.clone();caches.open(CORE_CACHE).then(k=>k.put(r,c))}return res}).catch(()=>caches.match(r)));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(h=>h||fetch(r)));return}
 // librerías externas (Three.js, Tailwind): se guardan la primera vez y después abren sin internet
 e.respondWith(caches.open(LIB_CACHE).then(c=>c.match(r).then(h=>h||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}))));
});
