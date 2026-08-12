// pushfix.js — надёжная подписка на пуши + видимая диагностика
var VAPID_PUBLIC_KEY='BG2CGhCgW0qj8agahh4LfOgkD0yK-EwHIb77NJgCzIBCXojGZ6wPnkuCyDot6CeIKvrx84MQgcd7RtPj4yZzYLQ';
function urlBase64ToUint8Array(s){var p='='.repeat((4-s.length%4)%4);var b=(s+p).replace(/\-/g,'+').replace(/_/g,'/');var r=window.atob(b);var a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}

async function subscribePush(force){
  try{
    if(!sbOk||!state.user){showIsland('Нет Supabase или пользователя','warn','o',6000);return false}
    if(String(state.user.id).length<8){showIsland('Демо-режим: пуши недоступны','warn','o',6000);return false}
    if(!('serviceWorker' in navigator)){showIsland('Нет serviceWorker в браузере','warn','o',6000);return false}
    if(!('PushManager' in window)){showIsland('Нет PushManager — откройте с иконки!','warn','o',6000);return false}
    var perm=Notification.permission;
    if(perm==='default'){perm=await Notification.requestPermission()}
    if(perm!=='granted'){showIsland('Разрешение: '+perm+'. Включите в настройках iPhone','warn','o',6000);return false}
    var reg=await Promise.race([
      navigator.serviceWorker.ready,
      new Promise(function(_,rej){setTimeout(function(){rej(new Error('SW timeout — переустановите sw.js'))},8000)})
    ]);
    var sub=await reg.pushManager.getSubscription();
    if(!sub||force){
      if(sub&&force){try{await sub.unsubscribe()}catch(e){}}
      sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
    }
    var p256dh=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('p256dh'))));
    var authKey=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('auth'))));
    var r=await sb.from('push_subscriptions').upsert({user_id:state.user.id,endpoint:sub.endpoint,p256dh:p256dh,auth:authKey},{onConflict:'endpoint'});
    if(r.error)throw r.error;
    showIsland('Подписка на пуши активна ✅','bell','g',5000);
    return true;
  }catch(e){
    console.error('Push:',e);
    showIsland('Ошибка: '+String(e.message||e).slice(0,60),'warn','o',6000);
    return false;
  }
}