// pushfix.js v5 — диагностика + отпечаток ключа
if (window.state) state._pushDone = true;

var VAPID_PUBLIC_KEY='BA6icKdVrGG4Tok0oIZwmTE1q807B8x6aKVYCGAeRVhfGXqt8OiXmCNRqnqp7coL17Awazxe6vVolfF8mvO7JN4';
function urlBase64ToUint8Array(s){var p='='.repeat((4-s.length%4)%4);var b=(s+p).replace(/\-/g,'+').replace(/_/g,'/');var r=window.atob(b);var a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}

async function subscribePush(force){
  var info=['file:v5'];
  try{
    var kb=urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    info.push('key:'+VAPID_PUBLIC_KEY.slice(0,10));
    info.push('keyLen:'+kb.length);
    info.push('perm:'+Notification.permission);
    if(!sbOk||!state.user||String(state.user.id).length<8){alert('PUSH DIAG\n'+info.join('\n')+'\n→ Нет входа через Supabase');return false}
    if(!('PushManager' in window)){alert('PUSH DIAG\n'+info.join('\n')+'\n→ Откройте С ИКОНКИ!');return false}
    var perm=Notification.permission;
    if(perm==='default'){perm=await Notification.requestPermission()}
    info.push('permAfter:'+perm);
    if(perm!=='granted'){alert('PUSH DIAG\n'+info.join('\n')+'\n→ Разрешение: '+perm);return false}
    var reg=await Promise.race([navigator.serviceWorker.ready,new Promise(function(_,r){setTimeout(function(){r(new Error('SW timeout'))},8000)})]);
    var sub=await reg.pushManager.getSubscription();
    info.push('sub0:'+(sub?'есть':'нет'));
    if(!sub||force){
      if(sub&&force){try{await sub.unsubscribe()}catch(e){}}
      sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:kb});
    }
    var p256dh=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('p256dh'))));
    var authKey=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('auth'))));
    var r=await sb.from('push_subscriptions').upsert({user_id:state.user.id,endpoint:sub.endpoint,p256dh:p256dh,auth:authKey},{onConflict:'endpoint'});
    if(r.error)throw r.error;
    alert('PUSH ✅ АКТИВНА\n'+info.join('\n'));
    showIsland('Подписка на пуши активна ✅','bell','g',5000);
    return true;
  }catch(e){
    alert('PUSH DIAG\n'+info.join('\n')+'\nОШИБКА: '+String(e&&e.message||e));
    return false;
  }
}