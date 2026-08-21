/* ===== КМ·Инженер v18 CORE: офлайн-очередь + доступность ===== */
(function(){
var S=window.state;
S.vibOn=localStorage.getItem('km-vib')!=='0';
S.fsLarge=localStorage.getItem('km-fs')==='1';
S.compact=localStorage.getItem('km-compact')==='1';
try{S.offlineQueue=JSON.parse(localStorage.getItem('km-oq')||'[]')}catch(e){S.offlineQueue=[]}

function applyA11y(){
if(S.fsLarge)document.documentElement.setAttribute('data-fs','large');else document.documentElement.removeAttribute('data-fs');
if(S.compact)document.documentElement.setAttribute('data-compact','1');else document.documentElement.removeAttribute('data-compact');
}
applyA11y();

// Вибрация — с учётом настройки
var _vib=window.vib;
window.vib=function(p){if(S.vibOn!==false)_vib(p)};

// Офлайн-баннер
var ban=document.createElement('div');ban.className='offline-banner hidden';ban.textContent='⚠️ Нет сети — сообщения уйдут в очередь';document.body.appendChild(ban);
function setBan(){ban.classList.toggle('hidden',navigator.onLine)}
window.addEventListener('offline',function(){setBan();showIsland('Офлайн-режим','warn','o')});
window.addEventListener('online',function(){setBan();flushQueue()});
setBan();

// Отправка: если нет сети — в очередь
var _sm=window.sendMessage;
window.sendMessage=async function(){
var inp=document.getElementById('msgInput');if(!inp)return;
var text=inp.value.trim();if(!text||!S.activeChat)return;
if(!navigator.onLine||!window.sbOk){
inp.value='';
S.offlineQueue.push({chat_id:S.activeChat.id,text:text,time:new Date().toISOString()});
localStorage.setItem('km-oq',JSON.stringify(S.offlineQueue));
S.activeChatMessages.push({id:'oq_'+Date.now(),sender_id:S.user.id,sender_name:S.user.name,type:'text',text:text,time:new Date().toISOString(),_pending:true});
var b=document.getElementById('chatMsgs');if(b&&window.renderMessages){renderMessages(b);b.scrollTop=b.scrollHeight}
showIsland('В очереди до сети','cloud','o');vib(20);
return;
}
return _sm();
};

// При появлении сети — отправляем очередь
async function flushQueue(){
if(!S.offlineQueue.length||!window.sbOk||!S.user)return;
showIsland('Отправка очереди…','cloud','b');
var q=S.offlineQueue.slice();S.offlineQueue=[];localStorage.setItem('km-oq','[]');
for(var i=0;i<q.length;i++){
try{
await sb.from('messages').insert({chat_id:q[i].chat_id,sender_id:S.user.id,sender_name:S.user.name,type:'text',text:q[i].text,time:q[i].time});
await sb.from('chats').update({last:q[i].text,last_time:q[i].time}).eq('id',q[i].chat_id);
}catch(e){S.offlineQueue.push(q[i])}
}
localStorage.setItem('km-oq',JSON.stringify(S.offlineQueue));
if(window.loadMessages&&S.activeChat)loadMessages(S.activeChat.id);
showIsland('Очередь отправлена ✅','check','g');
}

// Настройки доступности в профиле
var _rp=window.renderProfile;
window.renderProfile=function(v){
_rp(v);
v.appendChild(h('div',{class:'gtitle'},'ДОСТУПНОСТЬ'));
v.appendChild(h('div',{class:'card'},
h('button',{class:'grow',onclick:function(){S.vibOn=!S.vibOn;localStorage.setItem('km-vib',S.vibOn?'1':'0');vib(30);render()}},
h('div',{class:'ava gray',html:icon('phone')}),
h('div',{style:{flex:'1'}},h('b',{},'Вибрация'),h('small',{class:'cl-m'},S.vibOn?'Включена':'Выключена')),
h('div',{class:'tgl'+(S.vibOn?' on':'')})),
h('button',{class:'grow',onclick:function(){S.fsLarge=!S.fsLarge;localStorage.setItem('km-fs',S.fsLarge?'1':'0');applyA11y();render()}},
h('div',{class:'ava gray',html:icon('news')}),
h('div',{style:{flex:'1'}},h('b',{},'Крупный текст'),h('small',{class:'cl-m'},S.fsLarge?'Включен':'Выключен')),
h('div',{class:'tgl'+(S.fsLarge?' on':'')})),
h('button',{class:'grow',onclick:function(){S.compact=!S.compact;localStorage.setItem('km-compact',S.compact?'1':'0');applyA11y();render()}},
h('div',{class:'ava gray',html:icon('grid')}),
h('div',{style:{flex:'1'}},h('b',{},'Компактный режим'),h('small',{class:'cl-m'},S.compact?'Включен':'Выключен')),
h('div',{class:'tgl'+(S.compact?' on':'')}))
));
};
})();