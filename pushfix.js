// pushfix.js v2 — точная диагностика пушей через alert
var VAPID_PUBLIC_KEY='BG2CGhCgW0qj8agahh4LfOgkD0yK-EwHIb77NJgCzIBCXojGZ6wPnkuCyDot6CeIKvrx84MQgcd7RtPj4yZzYLQ';
function urlBase64ToUint8Array(s){var p='='.repeat((4-s.length%4)%4);var b=(s+p).replace(/\-/g,'+').replace(/_/g,'/');var r=window.atob(b);var a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}

async function subscribePush(force){
  var info=[];
  try{
    info.push('user:'+(state.user?String(state.user.id).slice(0,8):'НЕТ'));
    info.push('sbOk:'+sbOk);
    info.push('SW:'+('serviceWorker' in navigator));
    info.push('PushMgr:'+('PushManager' in window));
    info.push('perm:'+Notification.permission);
    if(!sbOk||!state.user||String(state.user.id).length<8){alert('PUSH DIAG\n'+info.join('\n')+'\n→ Нет входа через Supabase');return false}
    if(!('serviceWorker' in navigator)||!('PushManager' in window)){alert('PUSH DIAG\n'+info.join('\n')+'\n→ Откройте приложение С ИКОНКИ домашнего экрана!');return false}
    var perm=Notification.permission;
    if(perm==='default'){perm=await Notification.requestPermission()}
    info.push('permAfter:'+perm);
    if(perm!=='granted'){alert('PUSH DIAG\n'+info.join('\n')+'\n→ Разрешение НЕ дано.\nНастройки iPhone → найдите «КМ·Инженер» → Уведомления → Включить.\nЕсли пункта нет — удалите иконку и установите PWA заново.');return false}
    var reg=await Promise.race([
      navigator.serviceWorker.ready,
      new Promise(function(_,rej){setTimeout(function(){rej(new Error('SW timeout'))},8000)})
    ]);
    info.push('SW:ready');
    var sub=await reg.pushManager.getSubscription();
    info.push('sub0:'+(sub?'есть':'нет'));
    if(!sub||force){
      if(sub&&force){try{await sub.unsubscribe()}catch(e