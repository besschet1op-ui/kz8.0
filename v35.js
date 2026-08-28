/* ===== КМ·Инженер v35 — прочитано/печатает, непрочитанные, авто-тема, энергосбережение, сервис ===== */
(function(){
state.chatRead=state.chatRead||{};try{Object.assign(state.chatRead,JSON.parse(localStorage.getItem('km-read')||'{}'))}catch(e){}
state.autoDark=localStorage.getItem('km-autodark')==='1';
state.saver=false;

// ---------- 1) Непрочитанные в списке чатов ----------
var _cr=chatRow;
chatRow=function(c){
var row=_cr(c);
var last=c.last_time?new Date(c.last_time).getTime():0;
var rd=state.chatRead[c.id]||0;
if(last>rd&&c.last){
var t=row.querySelector('.txt-xs');
if(t)t.parentNode.insertBefore(h('span',{style:{width:'10px',height:'10px',borderRadius:'50%',background:'var(--blue)',flex:'none',boxShadow:'0 0 6px var(--blue)'}}),t);
}
return row;
};

// ---------- 2) Прочитано (✓✓) + отметка прочтения ----------
function markRead(id){
if(!sbOk||!state.user)return;var my=state.user.id;
state.activeChatMessages.forEach(function(m){
if(m.sender_id!==my){var rb=m.read_by||[];if(rb.indexOf(my)<0){rb.push(my);sb.from('messages').update({read_by:rb}).eq('id',m.id).catch(function(){})}}
});
}
var _rm=renderMessages;
renderMessages=function(box){
_rm(box);
var rows=box.querySelectorAll('.mrow');
for(var i=0;i<rows.length;i++){
var m=state.activeChatMessages[i];if(!m)continue;
var mine=state.user&&m.sender_id===state.user.id;
var tm=rows[i].querySelector('.tm');
if(tm&&mine)tm.textContent=((m.read_by||[]).length>0?'✓✓ ':'✓ ')+tm.textContent;
}
};

// ---------- 3) «Печатает…» ----------
function attachTyping(id,view){
if(!sbOk)return;
var ch=sb.channel('typ-'+id);
ch.on('broadcast',{event:'typing'},function(p){
var sm=view.querySelector('.chat-hd small');
if(sm){sm.textContent=(p.payload&&p.payload.name?p.payload.name:'')+' печатает…';setTimeout(function(){sm.textContent=''},2000)}
});
if(!ch._sub){ch.subscribe();ch._sub=true}
}
var _rcr=renderChatRoom;
renderChatRoom=function(view){
_rcr(view);
var ac=state.activeChat;if(!ac)return;
state.chatRead[ac.id]=Date.now();
try{localStorage.setItem('km-read',JSON.stringify(state.chatRead))}catch(e){}
markRead(ac.id);
attachTyping(ac.id,view);
var inp=view.querySelector('#msgInput');
if(inp&&sbOk){inp.addEventListener('input',debounce(function(){sb.channel('typ-'+ac.id).send({type:'broadcast',event:'typing',payload:{name:state.user?state.user.name:''}})},300));}
};

// ---------- 4) Авто-тёмная тема по расписанию ----------
function applyAutoDark(){
if(!state.autoDark)return;
var h=new Date().getHours();
document.documentElement.setAttribute('data-theme',(h>=21||h<7)?'dark':'light');
}
setInterval(applyAutoDark,60000);applyAutoDark();

// ---------- 5) Энергосбережение ----------
if(navigator.getBattery){navigator.getBattery().then(function(b){
function upd(){state.saver=b.level<0.2&&!b.charging;document.documentElement.classList.toggle('saver',state.saver)}
upd();b.addEventListener('levelchange',upd);b.addEventListener('chargingchange',upd);
}).catch(function(){})}
var _tt=tickTelemetry;
tickTelemetry=function(){if(state.saver&&Math.random()<0.5)return;_tt()};

// ---------- 6) Сервис: очистка кеша + авто-тема тумблер ----------
function clearCache(){
try{
['km-ai','km-shift','km-react','km-edits','km-offq'].forEach(function(k){localStorage.removeItem(k)});
if('caches' in window)caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})});
showIsland('Кеш очищен ✅','check','g');
}catch(e){showIsland('Ошибка','warn','o')}
}
var _rp=renderProfile;
renderProfile=function(view){
_rp(view);
view.appendChild(h('div',{class:'gtitle'},'СЕРВИС'));
view.appendChild(h('div',{class:'card'},
h('button',{class:'grow',onclick:function(){state.autoDark=!state.autoDark;localStorage.setItem('km-autodark',state.autoDark?'1':'0');applyAutoDark();render()}},
h('div',{class:'ava gray',html:icon('gear')}),
h('div',{style:{flex:'1'}},h('b',{},'Авто-тёмная тема (21–7)'),h('small',{class:'cl-m'},state.autoDark?'Включена':'Выключена')),
h('div',{class:'tgl'+(state.autoDark?' on':'')})
),
h('button',{class:'grow',onclick:clearCache},
h('div',{class:'ava gray',html:icon('cloud')}),
h('div',{style:{flex:'1'}},h('b',{},'Очистить кеш'),h('small',{class:'cl-m'},'Локальные данные и SW')),
h('span',{class:'cl-gr'},'→')
)
));
};
showIsland('v35 подключён ✅','check','g');
})();