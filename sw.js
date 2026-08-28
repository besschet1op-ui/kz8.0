var CACHE='kmz-v35';
var ASSETS=['/','index.html','icon.svg','manifest.webmanifest','account.js','notify.js','push.js','pushfix.js','realtime.js','vks.js','vksfix.js','v17a.js','v17b.js','v17c.js','v18.css','v18core.js','v18search.js','v19.css','v19a.js','v19b.js','v2021.js','v22.js','v24.js','v25.js','v26.js','v27.js','v28.js','v2931.js','v32.js','v34.js','v34-ct.js','v35.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
var u=new URL(e.request.url);
if(e.request.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(f=>{var cp=f.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return f})));
});
self.addEventListener('push',e=>{
var d={};try{d=e.data.json()}catch(err){}
e.waitUntil(self.registration.showNotification(d.title||'КМ·Инженер',{body:d.body||'',icon:'/icon.svg',tag:d.tag||'km'}));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.openWindow('/'))});