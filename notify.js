// notify.js — финальный модуль уведомлений
var VAPID_PUBLIC_KEY='BG2CGhCgW0qj8agahh4LfOgkD0yK-EwHIb77NJgCzIBCXojGZ6wPnkuCyDot6CeIKvrx84MQgcd7RtPj4yZzYLQ';
function urlBase64ToUint8Array(s){var p='='.repeat((4-s.length%4)%4);var b=(s+p).replace(/\-/g,'+').replace(/_/g,'/');var r=window.atob(b);var a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
async function ensurePushPermission(){if(!('Notification' in window))return 'unsupported';if(Notification.permission==='default'){try{return await Notification.requestPermission()}catch(e){return 'denied'}}return Notification.permission}
async function subscribePush(force){
  if(!sbOk||!state.user||String(state.user.id).length<8)return false;
  if(!('serviceWorker' in navigator)||!('PushManager' in window)){showIsland('Пуши недоступны в этом браузере','warn','o');return false}
  var perm=await ensurePushPermission();
  if(perm!=='granted'){showIsland('Разрешите уведомления в настройках iPhone','warn','o',5000);return false}
  try{
    var reg=await navigator.serviceWorker.ready;
    var sub=await reg.pushManager.getSubscription();
    if(!sub||force){
      if(sub&&force){try{await sub.unsubscribe()}catch(e){}}
      sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
    }
    var p256dh=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('p256dh'))));
    var authKey=btoa(String.fromCharCode.apply(null,new Uint8Array(sub.getKey('auth'))));
    await sb.from('push_subscriptions').upsert({user_id:state.user.id,endpoint:sub.endpoint,p256dh:p256dh,auth:authKey},{onConflict:'endpoint'});
    return true;
  }catch(e){console.error('Push:',e);showIsland('Ошибка подписки на пуши','warn','o');return false}
}
var _origRenderN=render;
render=function(){
  _origRenderN();
  try{
    if(state.user&&sbOk&&!state._pushDone){state._pushDone=true;subscribePush(false).then(function(ok){if(ok)showIsland('Пуши активны ✅','bell','g')})}
  }catch(e){}
};
var _origProfileN=renderProfile;
renderProfile=function(view){
  _origProfileN(view);
  view.appendChild(h('div',{class:'gtitle'},'УВЕДОМЛЕНИЯ'));
  view.appendChild(h('div',{class:'card'},
    h('button',{class:'grow',onclick:async function(){
      var ok=await subscribePush(true);
      showIsland(ok?'Подписка на пуши активна ✅':'Не удалось подписаться','bell',ok?'g':'o');
    }},
      h('div',{class:'ava gray',html:icon('bell')}),
      h('div',{style:{flex:'1'}},h('b',{},'Включить пуши'),h('small',{class:'cl-m'},'Разрешение + подписка устройства')),
      h('span',{class:'cl-gr'},'→')
    ),
    h('button',{class:'grow',onclick:async function(){
      showIsland('Отправляем тестовый пуш…','cloud','b',3000);
      try{
        var r=await sb.from('notifications').insert({user_id:state.user.id,text:'📲 Тест пуша из кабинета',type:'task'});
        if(r.error)throw r.error;
      }catch(e){showIsland('Ошибка: '+e.message,'warn','o')}
    }},
      h('div',{class:'ava gray',html:icon('send')}),
      h('div',{style:{flex:'1'}},h('b',{},'Тест пуша'),h('small',{class:'cl-m'},'Проверить всю цепочку')),
      h('span',{class:'cl-gr'},'→')
    )
  ));
};