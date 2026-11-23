/* Hifdh moved to ../hifdh/. This replaces the old app's service worker, removes itself, and sends open windows to the new address. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{e.waitUntil(self.registration.unregister().then(()=>self.clients.matchAll({type:'window'})).then(cs=>Promise.all(cs.map(c=>c.navigate(c.url.replace('/hifz/','/hifdh/')).catch(()=>{}))))))});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(Response.redirect(e.request.url.replace('/hifz/','/hifdh/'),302))});
