// pushfix.js v3 — убираем ядовитый автозапрос + точная диагностика
if (window.state) state._pushDone = true; // больше никаких автозапросов без пальца!

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
    if(perm!=='granted'){alert('PUSH DIAG\n'+info.join('\n')+'\n→ Разрешение: '+perm+'.\n1) Настройки iPhone → «КМ·Инженер» → Уведомления → Включить\n2) Если пункта нет — удалите иконку и установите PWA заново (шаги ниже)');return false}
    var reg=await Promise.race([
      navigator.serviceWorker.ready,
      new Promise(function(_,rej){setTimeout(function(){rej(new Error('SW timeout — замените sw.js на v4'))},8000)})
    ]);
    info.push('SW:ready');
    var sub=await reg.pushManager.getSubscription();
    info.push('sub0:'+(sub?'есть':'нет'));
    if(!sub||force){
      if(sub&&force){try{await sub.unsubscribe()}catch(e){}}
      sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
    }
    info.push('sub1:OK');
    var p256dh=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('p256dh'))));
    var authKey=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('auth'))));
    var r=await sb.from('push_subscriptions').upsert({user_id:state.user.id,endpoint:sub.endpoint,p256dh:p256dh,auth:authKey},{onConflict:'endpoint'});
    if(r.error)throw r.error;
    alert('PUSH ✅ ПОДПИСКА АКТИВНА\n'+info.join('\n'));
    showIsland('Подписка на пуши активна ✅','bell','g',5000);
    return true;
  }catch(e){
    alert('PUSH DIAG\n'+info.join('\n')+'\nОШИБКА: '+String(e&&e.message||e));
    return false;
  }
}