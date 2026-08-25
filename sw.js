/* ===== КМ·Инженер — Service Worker (улучшенные пуши) ===== */
const APP='КМ·Инженер';
const ICON='/icon.svg', BADGE='/icon.svg';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});

self.addEventListener('push',e=>{
  let d={};
  try{d=e.data?e.data.json():{}}catch(err){d={title:APP,body:e.data?e.data.text():''}}
  const title=d.title||APP;
  const body=d.body||d.text||'Новое уведомление';
  const type=d.type||'default';
  const critical=(d.priority==='critical');
  const url=d.url||d.link||'/';
  const actions=[];
  if(type==='chat')actions.push({action:'reply',title:'↩ Ответить'},{action:'open',title:'Открыть'});
  else actions.push({action:'open',title:'Открыть'});
  const opts={
    body, tag:d.tag||type, icon:ICON, badge:BADGE,
    data:{url,type},
    vibrate:d.silent?[]:[120,60,120],
    silent:!!d.silent,
    requireInteraction:critical,
    renotify:critical,
    actions, timestamp:Date.now()
  };
  const work=[self.registration.showNotification(title,opts)];
  if('setAppBadge' in self.registration)work.push(self.registration.setAppBadge(d.badgeCount||1));
  e.waitUntil(Promise.all(work));
});

self.addEventListener('notificationclick',e=>{
  const n=e.notification;n.close();
  const url=(n.data&&n.data.url)||'/';
  if('setAppBadge' in self.registration)self.registration.clearAppBadge();
  if(e.action==='reply'){e.waitUntil(focusOrOpen(url+(url.includes('?')?'&':'?')+'reply=1'));return}
  e.waitUntil(focusOrOpen(url));
});
function focusOrOpen(url){
