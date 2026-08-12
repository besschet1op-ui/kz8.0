var CACHE='km-engineer-10.7';
var CORE=['./','manifest.webmanifest','icon.svg'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE).catch(function(){})}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){
      var copy=res.clone();caches.open(CACHE).then(function(c){c.put('./',copy)});
      return res;
    }).catch(function(){return caches.match('./')}));
    return;
  }
  e.respondWith(caches.match(req).then(function(cached){
    if(cached)return cached;
    return fetch(req).then(function(res){
      if(res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy)})}
      return res;
    });
  }));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){if('focus' in list[i])return list[i].focus();}
    return self.clients.openWindow('./');
  }));
});
self.addEventListener('push',function(e){
  var d={};try{d=e.json()}catch(err){}
  var title=d.title||'КМ·Инженер';
  var body=d.body||d.text||'Новое уведомление';
  e.waitUntil(self.registration.showNotification(title,{body:body}));
});