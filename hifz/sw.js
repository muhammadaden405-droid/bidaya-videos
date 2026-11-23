/* Hifz offline cache: the app shell and the whole mushaf are stored on first visit. */
const V='hifz-v5';
const SHELL=['./','index.html','data/quran.json','fonts/amiri-quran.woff2','fonts/figtree-400.woff2','fonts/figtree-600.woff2','fonts/figtree-800.woff2','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','data/mutun/index.json','data/mutun/thalatha.json','data/mutun/qawaid.json','data/mutun/nawaqid.json','data/mutun/shurut.json','data/mutun/arbain.json','data/mutun/tuhfa.json','data/mutun/kashf.json','data/mutun/tawhid.json','data/mutun/ajurrumiyya.json','data/mutun/usulsunna.json','data/mutun/haiyya.json','data/mutun/lumca.json','data/mutun/wasitiyya.json','data/mutun/jazariyya.json','data/mutun/umdaahkam.json','data/mutun/umdafiqh.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hifz-v')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true})||(e.request.mode==='navigate'?await c.match('./'):null);
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);
    if(hit){e.waitUntil(net.catch(()=>{}));return hit}
    return net;
  }));
});
