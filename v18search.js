/* ===== КМ·Инженер v18 SEARCH: глобальный поиск, напоминания, закрепы ===== */
(function(){
var S=window.state;
try{S.pins=JSON.parse(localStorage.getItem('km-pins')||'{}')}catch(e){S.pins={}}

// ---------- ГЛОБАЛЬНЫЙ ПОИСК ----------
function openGS(){
var old=document.querySelector('.gs-overlay');if(old)old.remove();
var ov=document.createElement('div');ov.className='gs-overlay';
var head=h('div',{class:'gs-head'},
h('input',{id:'gsInp',placeholder:'Поиск: задачи, люди, чаты, события…'}),
h('button',{onclick:function(){ov.remove()}},'✕'));
var body=h('div',{class:'gs-body'});
ov.appendChild(head);ov.appendChild(body);document.body.appendChild(ov);
var inp=head.querySelector('input');setTimeout(function(){inp.focus()},50);
inp.addEventListener('input',function(){draw(body,(inp.value||'').trim().toLowerCase())});
draw(body,'');
}
function draw(body,q){
body.innerHTML='';
if(!q){body.appendChild(h('div',{class:'empty'},'Начните вводить…'));return}
var found=0;
var t=S.tasks.filter(function(x){return(x.title||'').toLowerCase().indexOf(q)>=0}).slice(0,5);
if(t.length){found++;body.appendChild(h('div',{class:'gs-group'},'📋 Задачи'));t.forEach(function(x){body.appendChild(h('button',{class:'gs-item',onclick:function(){document.querySelector('.gs-overlay').remove();S.page='task:'+x.id;render()}},h('div',{class:'ic'},'📋'),h('div',{},h('b',{},x.title),h('small',{},'Статус: '+x.stage))))})}
var e=S.employees.filter(function(x){return(x.name||'').toLowerCase().indexOf(q)>=0||(x.pos||'').toLowerCase().indexOf(q)>=0}).slice(0,5);
if(e.length){found++;body.appendChild(h('div',{class:'gs-group'},'👥 Люди'));e.forEach(function(x){body.appendChild(h('button',{class:'gs-item',onclick:function(){document.querySelector('.gs-overlay').remove();if(window.startChatWith)startChatWith(x)}},h('div',{class:'ic'},'👤'),h('div',{},h('b',{},x.name),h('small',{},x.pos+' · '+x.dept))))})}
var c=S.chats.filter(function(x){return chatTitle(x).toLowerCase().indexOf(q)>=0}).slice(0,5);
if(c.length){found++;body.appendChild(h('div',{class:'gs-group'},'💬 Чаты'));c.forEach(function(x){body.appendChild(h('button',{class:'gs-item',onclick:function(){document.querySelector('.gs-overlay').remove();S.activeChat=x;S.page='chatroom';if(window.subscribeMessages)subscribeMessages(x.id);render()}},h('div',{class:'ic'},'💬'),h('div',{},h('b',{},chatTitle(x)),h('small',{},x.last||''))))})}
var ev=S.events.filter(function(x){return(x.title||'').toLowerCase().indexOf(q)>=0}).slice(0,5);
if(ev.length){found++;body.appendChild(h('div',{class:'gs-group'},'📅 Мероприятия'));ev.forEach(function(x){body.appendChild(h('button',{class:'gs-item',onclick:function(){document.querySelector('.gs-overlay').remove();S.page='event:'+x.id;render()}},h('div',{class:'ic'},'📅'),h('div',{},h('b',{},x.title),h('small',{},fmtDT(x.date)))))})}
if(!found)body.appendChild(h('div',{class:'empty'},'Ничего не найдено'));
}
// Кнопка поиска на главной
var _rh=window.renderHome;
window.renderHome=function(v){
_rh(v);
var hdr=v.querySelector('.hdr');
if(hdr&&hdr.children.length>1){hdr.insertBefore(h('button',{class:'hdr-btn press',onclick:openGS,html:icon('search')}),hdr.children[1])}
};
// Горячая клавиша Ctrl+K
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openGS()}});

// ---------- НАПОМИНАНИЯ ----------
var reminded={};try{reminded=JSON.parse(localStorage.getItem('km-rem')||'{}')}catch(e){}
setInterval(function(){
if(!S.user)return;
var nowT=Date.now();
(S.tasks||[]).forEach(function(t){
if(t.stage==='done'||!t.due)return;
var d=new Date(t.due).getTime();
if(d-nowT>0&&d-nowT<30*60000&&!reminded['t'+t.id]){
reminded['t'+t.id]=1;localStorage.setItem('km-rem',JSON.stringify(reminded));
showIsland('⏰ Скоро дедлайн: '+(t.title||'').slice(0,24),'warn','o');
notifySystem('КМ·Инженер','⏰ Задача «'+t.title+'» — через 30 минут');
}
});
(S.events||[]).forEach(function(ev){
var d=new Date(ev.date).getTime();
if(d-nowT>0&&d-nowT<60*60000&&!reminded['e'+ev.id]){
reminded['e'+ev.id]=1;localStorage.setItem('km-rem',JSON.stringify(reminded));
showIsland('📅 Скоро: '+(ev.title||'').slice(0,24),'cal','b');
notifySystem('КМ·Инженер','📅 «'+ev.title+'» — через час');
}
});
},60000);

// ---------- ЗАКРЕПЫ В ЧАТАХ ----------
function savePins(){localStorage.setItem('km-pins',JSON.stringify(S.pins))}
function pinMenu(bub){
var text=(bub.textContent||'').trim();
var chatId=S.activeChat&&S.activeChat.id;
if(!chatId||!text)return;
vib(15);
var arr=S.pins[chatId]||[];
var idx=arr.indexOf(text);
if(idx>=0){if(confirm('Открепить сообщение?')){arr.splice(idx,1);S.pins[chatId]=arr;savePins();render()}}
else{if(confirm('📌 Закрепить сообщение?')){arr.push(text);S.pins[chatId]=arr;savePins();showIsland('Закреплено 📌','check','g');render()}}
}
var _rm=window.renderMessages;
window.renderMessages=function(box){
_rm(box);
box.querySelectorAll('.bub').forEach(function(b){
var t=null;
b.addEventListener('touchstart',function(){t=setTimeout(function(){pinMenu(b)},500)},{passive:true});
b.addEventListener('touchend',function(){clearTimeout(t)});
b.addEventListener('touchmove',function(){clearTimeout(t)});
});
};
var _rc=window.renderChatRoom;
window.renderChatRoom=function(v){
_rc(v);
var chatId=S.activeChat&&S.activeChat.id;
var arr=(chatId&&S.pins[chatId])||[];
if(arr.length){
var hd=v.querySelector('.chat-hd');
if(hd&&hd.nextSibling){
v.insertBefore(h('div',{class:'pin-bar'},
h('span',{},'📌 '+arr[arr.length-1].slice(0,60)),
h('button',{class:'pin-x',onclick:function(){arr.pop();S.pins[chatId]=arr;savePins();render()}},'✕')),
hd.nextSibling);
}
}
};
})();