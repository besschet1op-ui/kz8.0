/* ===== КМ·Инженер v20–21 (оверлей к v13.0) =====
   🗺 Схема завода · 📊 Недельный отчёт · 📅 Отпуска/смены · ⏱ Отметка о смене
   🗂 Папки чатов · 💬 Ответы(треды) · 📚 База знаний · 🔔 Умные напоминания
   Тренды и рейтинг — НЕТ (по запросу) */
(function(){
var S=window.state;
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.schema-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sch-node{background:var(--card);backdrop-filter:var(--glass);border:1px solid var(--sep2);border-left:4px solid var(--green);border-radius:14px;padding:12px}.sch-node.warn{border-left-color:var(--orange)}.sch-node b{font-size:13px;display:block}.sch-node small{font-size:11px;color:var(--label2)}.sch-node .load{height:6px;background:var(--card3);border-radius:3px;margin-top:8px;overflow:hidden}.sch-node .load i{display:block;height:100%;background:var(--grad)}.rep-pre{background:var(--card2);border:1px solid var(--sep2);border-radius:12px;padding:12px;font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;line-height:1.6}.kb-cat{display:inline-block;font-size:10px;font-weight:700;color:var(--blue);background:rgba(10,132,255,.12);border-radius:6px;padding:2px 8px;margin-bottom:6px;text-transform:uppercase}.kb-card{background:var(--card);border:1px solid var(--sep2);border-radius:14px;padding:12px;margin-bottom:8px}.kb-card b{font-size:14px;display:block;margin-bottom:4px}.kb-card p{font-size:12.5px;color:var(--label2);line-height:1.5}.folder-chips{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto}.reply-banner{display:flex;gap:8px;align-items:center;background:rgba(10,132,255,.1);border:1px solid rgba(10,132,255,.25);border-radius:12px;padding:8px 12px;margin-bottom:8px;font-size:12px}.reply-banner .x{margin-left:auto;color:var(--red);font-weight:700}.vac-row{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}.vac-row .ava{width:36px;height:36px;font-size:12px}.vac-row b{font-size:13px;display:block}.vac-row small{font-size:11px;color:var(--label2)}.vac-row .shift{margin-left:auto;font-family:"Russo One";font-size:14px;color:var(--violet)}';
document.head.appendChild(st);
// ---------- STATE ----------
S.chatFolder=S.chatFolder||'all';
try{S.mutedChats=JSON.parse(localStorage.getItem('km-muted')||'[]')}catch(e){S.mutedChats=[]}
try{S.clock=JSON.parse(localStorage.getItem('km-clock')||'null')}catch(e){S.clock=null}
S.clock=S.clock||{start:null,log:[]};
S.replyTo=null;S.reminded=S.reminded||{};S.escalated=S.escalated||{};
function saveMuted(){try{localStorage.setItem('km-muted',JSON.stringify(S.mutedChats))}catch(e){}}
function saveClock(){try{localStorage.setItem('km-clock',JSON.stringify(S.clock))}catch(e){}}
function lp(el,fn){var t=null;el.addEventListener('touchstart',function(){t=setTimeout(fn,450)},{passive:true});el.addEventListener('touchend',function(){clearTimeout(t)});el.addEventListener('touchmove',function(){clearTimeout(t)});el.addEventListener('contextmenu',function(e){e.preventDefault();fn()})}
// ---------- 🗺 СХЕМА ЗАВОДА ----------
function renderSchema(app){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){S.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🗺 Схема завода'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
b.appendChild(h('div',{class:'txt-sm cl-m mb'},'Тап по узлу — детали. Зелёный — норма, оранжевый — внимание.'));
var g=h('div',{class:'schema-grid'});
for(var k in S.telemetry){(function(k){var t=S.telemetry[k];
g.appendChild(h('div',{class:'sch-node press'+(t.status==='warn'?' warn':''),onclick:function(){showIsland(k+': '+Math.round(t.temp)+'°C, нагр. '+Math.round(t.load)+'%','factory',t.status==='warn'?'o':'g')},
h('b',{},t.name),h('small',{},k+' · '+Math.round(t.temp)+'°C'),
h('div',{class:'load'},h('i',{style:{width:Math.round(t.load)+'%'}}))));
})(k)}
g.appendChild(h('div',{class:'sch-node press',onclick:function(){showIsland('Склад: 2 критичные позиции','warn','o')},h('b',{},'📦 Склад'),h('small',{},'Запчасти и ГСМ')));
g.appendChild(h('div',{class:'sch-node press',onclick:function(){showIsland('ОТК: приёмка 2ТЭ25КМ','check','g')},h('b',{},'🔍 ОТК'),h('small',{},'Контроль качества')));
b.appendChild(g);
pg.appendChild(b);app.appendChild(pg);
}
// ---------- 📊 НЕДЕЛЬНЫЙ ОТЧЁТ ----------
function buildReport(){
var done=S.tasks.filter(function(t){return t.stage==='done'}).length;
var late=S.tasks.filter(function(t){return t.due&&new Date(t.due)<now()&&t.stage!=='done'}).length;
var avg=0,n=0;for(var k in S.telemetry){avg+=S.telemetry[k].load;n++}avg=Math.round(avg/(n||1));
var crit=WAREHOUSE.filter(function(w){return w.stock<w.min}).length;
return '📊 НЕДЕЛЬНЫЙ ОТЧЁТ · '+now().toLocaleDateString('ru-RU')+'\n\n✅ Задач выполнено: '+done+' из '+S.tasks.length+'\n⏰ Просрочено: '+late+'\n📅 Мероприятий: '+S.events.length+'\n🏭 Средняя нагрузка: '+avg+'%\n📦 Критичных позиций: '+crit+'\n🛡 Дней без травм: 142\n\n— КМ·Инженер v21';
}
function renderReport(app){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){S.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📊 Недельный отчёт'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var txt=buildReport();
b.appendChild(h('div',{class:'rep-pre'},txt));
b.appendChild(h('div',{class:'row',style:{gap:'8px',marginTop:'12px'}},
h('button',{class:'btn card press',style:{flex:'1'},onclick:function(){try{navigator.clipboard.writeText(txt)}catch(e){}showIsland('Скопировано','check','g')},'📋 Копировать'),
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){
var dir=null;S.employees.forEach(function(e){if(e.role==='director')dir=e});
if(sbOk&&dir){sb.from('notifications').insert({user_id:dir.id,text:'📊 Недельный отчёт готов',type:'task'}).then(function(){showIsland('Отправлено директору ✅','send','g')})}
else showIsland('Нужен Supabase','warn','o');
}},'📨 Директору')
));
pg.appendChild(b);app.appendChild(pg);
}
// ---------- 📅 ОТПУСКА И СМЕНЫ ----------
function renderVacation(app){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){S.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📅 Отпуска и смены'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var week=Math.floor(Date.now()/(7*86400000))%2;
b.appendChild(h('div',{class:'txt-sm cl-m mb'},'Текущая неделя: смена '+(week?'Б':'А')));
S.employees.forEach(function(e){
var a=e.absence||{};if(!a.vacation)return;
var start=new Date(Date.now()+( (+e.badge)%30 )*86400000);
var shift=(+e.badge)%2?'Б':'А';
b.appendChild(h('div',{class:'vac-row'},
h('div',{class:'ava '+e.avatar},initials(e.name)),
h('div',{style:{flex:'1'}},h('b',{},e.name),h('small',{},'Отпуск '+a.vacation+' дн · с '+start.toLocaleDateString('ru-RU',{day:'numeric',month:'short'}))),
h('div',{class:'shift'},shift)
));
});
pg.appendChild(b);app.appendChild(pg);
}
// ---------- 📚 БАЗА ЗНАНИЙ ----------
var KB=[
{cat:'ОТ',t:'Допуск к огневым работам',p:'Наряд-допуск оформляется до начала работ. Действует 1 смену. Продление — только через инженера по ОТ.'},
{cat:'Эксплуатация',t:'Д49: обкатка после ТО',p:'После ТО-2 обкатка 4 часа на холостом, затем 2 часа под нагрузкой 50%. Контроль темп. масла ≤ 85°C.'},
{cat:'Безопасность',t:'Работа на высоте',p:'Допуск при наличии страховки и наряда. Запрещено при ветре > 10 м/с.'},
{cat:'Склад',t:'Выдача ГСМ',p:'Масло М-14В2 выдаётся по лимитной карте. Остаток ниже 200 л — автосигнал снабжению.'},
{cat:'ОТК',t:'Приёмка тепловоза',p:'Контроль по чек-листу из 12 пунктов. Любой красный пункт — стоп-приёмка.'}
];
function renderKB(app){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){S.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📚 База знаний'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
b.appendChild(h('div',{class:'search'},h('span',{html:icon('search')}),h('input',{id:'kbq',placeholder:'Поиск инструкций…',oninput:function(e){
var q=(e.target.value||'').toLowerCase();var list=$('#kbList');if(!list)return;list.innerHTML='';
KB.filter(function(d){return d.t.toLowerCase().indexOf(q)>=0||d.p.toLowerCase().indexOf(q)>=0||d.cat.toLowerCase().indexOf(q)>=0}).forEach(function(d){list.appendChild(kbCard(d))});
}})));
var list=h('div',{id:'kbList'});KB.forEach(function(d){list.appendChild(kbCard(d))});
b.appendChild(list);
pg.appendChild(b);app.appendChild(pg);
}
function kbCard(d){return h('div',{class:'kb-card'},h('span',{class:'kb-cat'},d.cat),h('b',{},d.t),h('p',{},d.p))}
// ---------- ⏱ ОТМЕТКА О СМЕНЕ ----------
function clockToggle(){
if(S.clock.start){
var hrs=Math.round((Date.now()-S.clock.start)/360000)/10;
S.clock.log.push({d:new Date().toISOString(),h:hrs});S.clock.start=null;
showIsland('Смена окончена: '+hrs+' ч','check','g');
}else{S.clock.start=Date.now();showIsland('Смена начата ⏱','clock','b')}
saveClock();render();
}
// ---------- 🗂 ПАПКИ ЧАТОВ + 🔇 MUTE ----------
var _rc=window.renderChats;
window.renderChats=function(view){
view.appendChild(h('div',{class:'large-title'},'Чаты'));
var chips=h('div',{class:'folder-chips'});
[['all','Все'],['work','Рабочие'],['personal','Личные'],['muted','Без звука']].forEach(function(f){
chips.appendChild(h('button',{class:'chip press'+(S.chatFolder===f[0]?' on':''),onclick:function(){S.chatFolder=f[0];render()}},f[1]));
});
view.appendChild(chips);
view.appendChild(h('button',{class:'btn b full press mb',onclick:function(){S.page='newchat';render()}},'＋ Новый чат'));
var list=S.chats.filter(function(c){
var muted=S.mutedChats.indexOf(c.id)>=0;
if(S.chatFolder==='muted')return muted;
if(muted)return false;
if(S.chatFolder==='work')return c.type==='group';
if(S.chatFolder==='personal')return c.type!=='group';
return true;
});
if(!list.length){view.appendChild(h('div',{class:'empty'},'Папка пуста.'));return}
var card=h('div',{class:'card'});
list.forEach(function(c){card.appendChild(chatRow(c))});
view.appendChild(card);
};
// Долгое нажатие на чат — mute
var _crow=window.chatRow;
window.chatRow=function(c){
var row=_crow(c);
lp(row,function(){
var i=S.mutedChats.indexOf(c.id);
if(i>=0){S.mutedChats.splice(i,1);showIsland('Звук включён','bell','g')}
else{S.mutedChats.push(c.id);showIsland('Без звука 🔇','bell','o')}
saveMuted();render();
});
return row;
};
// ---------- 💬 ОТВЕТЫ (треды) ----------
var _rm=window.renderMessages;
window.renderMessages=function(box){
_rm(box);
var bubbles=box.querySelectorAll('.bub');
bubbles.forEach(function(bub,i){
var m=S.activeChatMessages[i];if(!m)return;
lp(bub,function(){
S.replyTo={name:m.sender_name||'?',text:(m.text||'').slice(0,60)};
render();
});
});
};
var _rroom=window.renderChatRoom;
window.renderChatRoom=function(view){
_rroom(view);
if(S.replyTo){
var inp=view.querySelector('.chat-input');
if(inp){var ban=h('div',{class:'reply-banner'},h('span',{},'↩ '+S.replyTo.name+': '+S.replyTo.text),h('button',{class:'x',onclick:function(){S.replyTo=null;render()}},'✕'));view.insertBefore(ban,inp)}
}
};
var _sm=window.sendMessage;
window.sendMessage=async function(){
var inp=$('#msgInput');
if(inp&&S.replyTo){inp.value='> '+S.replyTo.name+': '+S.replyTo.text+'\n'+inp.value;S.replyTo=null}
return _sm();
};
// ---------- 🔔 УМНЫЕ НАПОМИНАНИЯ ----------
setInterval(function(){
if(!S.user)return;
var t=Date.now();
(S.tasks||[]).forEach(function(tk){
if(tk.stage==='done'||!tk.due)return;
var d=new Date(tk.due).getTime();
if(d-t>0&&d-t<30*60000&&!S.reminded[tk.id]){S.reminded[tk.id]=1;showIsland('⏰ Скоро дедлайн: '+(tk.title||'').slice(0,22),'warn','o',5000)}
if(d<t&&!S.escalated[tk.id]){S.escalated[tk.id]=1;
if(sbOk)sb.from('notifications').insert({user_id:'e1',text:'⚠️ Просрочена: '+(tk.title||'')+' ('+(tk.executor_name||'—')+')',type:'task'});
showIsland('⚠️ Эскалация директору','warn','o',5000);
}
});
},60000);
// ---------- HUB ----------
var _oh=window.openHub;
window.openHub=function(){
_oh();
var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v20–21'));
[['🗺','Схема завода','Узлы и статусы',function(){closeHub();S.page='schema';render()}],
['📊','Недельный отчёт','Авто-сводка',function(){closeHub();S.page='report';render()}],
['📅','Отпуска и смены','Календарь персонала',function(){closeHub();S.page='vacation';render()}],
['📚','База знаний','Инструкции и ГОСТы',function(){closeHub();S.page='kb';render()}],
[S.clock.start?'⏹':'⏱',S.clock.start?'Завершить смену':'Начать смену','Отметка времени',function(){closeHub();clockToggle()}]
].forEach(function(it){
sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')));
});
b.appendChild(sec);
};
// ---------- ROUTING ----------
var _rpo=window.renderPageOverlay;
window.renderPageOverlay=function(app){
if(S.page==='schema'){renderSchema(app);return}
if(S.page==='report'){renderReport(app);return}
if(S.page==='vacation'){renderVacation(app);return}
if(S.page==='kb'){renderKB(app);return}
_rpo(app);
};
// ---------- PROFILE: часы смены + версия ----------
var _rp=window.renderProfile;
window.renderProfile=function(view){
_rp(view);
var todayH=S.clock.log.reduce(function(a,l){return a+(l.h||0)},0);
view.appendChild(h('div',{class:'gtitle'},'⏱ УЧЁТ ВРЕМЕНИ'));
view.appendChild(h('div',{class:'card'},h('div',{class:'grow'},
h('div',{class:'ava gray',html:icon('clock')}),
h('div',{style:{flex:'1'}},h('b',{},'Наработано (журнал)'),h('small',{class:'cl-m'},Math.round(todayH*10)/10+' ч · '+(S.clock.start?'смена идёт':'смена не начата'))),
h('button',{class:'btn sm '+(S.clock.start?'w':'b')+' press',onclick:clockToggle},S.clock.start?'⏹ Стоп':'⏱ Старт')
)));
};
})();