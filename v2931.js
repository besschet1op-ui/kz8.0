/* ===== КМ·Инженер v29–31 (объединённый оверлей) =====
   v29 UX: избранное, приветствие, присутствие, поиск в чате, правка сообщений
   v30 Задачи: приоритет+дедлайн, комментарии, чек-листы, экспорт CSV
   v31 Настройки/инструменты: тихие часы, крупный текст, компакт, поиск склада, подача идей
   Подключается ПОСЛЕ базы (v13/v15). Ничего не ломает — только оборачивает. */
(function(){
var S=window.state;
S.favorites=S.favorites||{employees:[],tasks:[]};
try{var fv=JSON.parse(localStorage.getItem('km-favs')||'null');if(fv)S.favorites=fv}catch(e){}
S.taskComments=S.taskComments||{};S.taskChecklists=S.taskChecklists||{};
S.quiet=localStorage.getItem('km-quiet')==='1';
S.largeText=localStorage.getItem('km-lt')==='1';
S.compact=localStorage.getItem('km-cp')==='1';
S.chatSearch='';S.chatSearchOn=false;S.editingMsg=null;S._ntPrio='med';
function saveFavs(){try{localStorage.setItem('km-favs',JSON.stringify(S.favorites))}catch(e){}}
function saveSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function isFav(t,id){return(S.favorites[t]||[]).indexOf(id)>=0}
function toggleFav(t,id){var a=S.favorites[t]=S.favorites[t]||[];var i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);saveFavs();vib(10);render()}

// ---------- CSS ----------
var css=document.createElement('style');
css.textContent='.fav-star{position:absolute;top:10px;right:12px;font-size:18px;cursor:pointer;z-index:2}'+
'.cl-item{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13px}'+
'.cl-chk{width:20px;height:20px;border-radius:6px;border:2px solid var(--gray);display:grid;place-items:center;font-size:11px;color:#fff;flex:none;cursor:pointer}'+
'.cl-chk.on{background:var(--green);border-color:var(--green)}'+
'.cl-item.done span{text-decoration:line-through;opacity:.5}'+
'.comment-card{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:6px}'+
'.prio-sel{display:flex;gap:8px;margin-bottom:14px}'+
'.prio-opt{flex:1;padding:10px;border-radius:12px;text-align:center;font-size:13px;font-weight:700;border:2px solid var(--sep2);cursor:pointer}'+
'.prio-opt.sel{border-color:var(--accent,var(--blue));background:var(--accent-soft,rgba(10,132,255,.1))}'+
'.chat-search{display:flex;gap:8px;align-items:center;background:var(--card2);border-radius:12px;padding:8px 12px;margin-bottom:10px}'+
'.chat-search input{flex:1;background:none;border:0;outline:none;color:var(--label);font-size:14px}'+
'html.lt #app{font-size:17px}html.cp .tcard,html.cp .scard{padding:10px}'+
'.weather-widget{display:flex;gap:10px;align-items:center;background:var(--card);border:1px solid var(--sep2);border-radius:14px;padding:10px 12px;margin-bottom:12px}';
document.head.appendChild(css);
function applyA11y(){document.documentElement.classList.toggle('lt',S.largeText);document.documentElement.classList.toggle('cp',S.compact)}
applyA11y();

// ---------- v29: приветствие + погода + избранное на главной ----------
function computeWeather(){var w=0;for(var k in S.telemetry)if(S.telemetry[k].status==='warn')w++;if(!w)return{i:'☀️',t:'Все линии в норме'};if(w===1)return{i:'⛅',t:'1 линия требует внимания'};return{i:'🌧',t:w+' линии требуют внимания'}}
var _rh=renderHome;
renderHome=function(view){
_rh(view);
var h3=view.querySelector('.hero h3');
if(h3&&S.user){var hh=now().getHours();var g=hh<6?'Доброй ночи':hh<12?'Доброе утро':hh<18?'Добрый день':'Добрый вечер';h3.textContent=g+', '+(S.user.name?S.user.name.split(' ')[1]:'')+'!'}
var hero=view.querySelector('.hero');
if(hero){var w=computeWeather();hero.parentNode.insertBefore(h('div',{class:'weather-widget'},h('span',{style:{fontSize:'22px'}},w.i),h('div',{style:{flex:'1'}},h('b',{style:{fontSize:'13px'}},'Погода производства'),h('small',{class:'cl-m',style:{display:'block'}},w.t))),hero.nextSibling)}
var favT=S.tasks.filter(function(t){return isFav('tasks',t.id)});
if(favT.length){var sec=h('div',{});sec.appendChild(h('div',{class:'gtitle'},'⭐ ИЗБРАННОЕ'));favT.slice(0,3).forEach(function(t){sec.appendChild(taskCard(t))});var pipe=view.querySelector('.route-pipeline');if(pipe&&pipe.parentNode)pipe.parentNode.insertBefore(sec,pipe)}
};
// звезда на задаче
var _tc=taskCard;
taskCard=function(t){var c=_tc(t);c.style.position='relative';c.appendChild(h('div',{class:'fav-star',onclick:function(e){e.stopPropagation();toggleFav('tasks',t.id)}},isFav('tasks',t.id)?'★':'☆'));return c};
// звезда на сотруднике
var _sc=staffCard;
staffCard=function(e){var c=_sc(e);var acts=c.querySelector('.acts');if(acts)acts.insertBefore(h('button',{class:'press',style:{background:isFav('employees',e.id)?'rgba(255,159,10,.2)':'var(--card2)'},onclick:function(ev){ev.stopPropagation();toggleFav('employees',e.id)}},'★'),acts.firstChild);return c};
// присутствие (симуляция)
setInterval(function(){var arr=['on','away','off'];var e=S.employees[Math.floor(Math.random()*S.employees.length)];if(e&&!e.remote){e.present=arr[Math.floor(Math.random()*3)];if(S.tab==='staff')render()}},20000);

// ---------- v29: поиск в чате + правка сообщений ----------
var _rcr=renderChatRoom;
renderChatRoom=function(view){
_rcr(view);
var hd=view.querySelector('.chat-hd');
if(hd)hd.appendChild(h('button',{class:'hdr-btn press',style:{width:'36px',height:'36px'},onclick:function(){S.chatSearchOn=!S.chatSearchOn;render()},html:icon('search')}));
if(S.chatSearchOn){var box=view.querySelector('.chat-msgs');if(box)view.insertBefore(h('div',{class:'chat-search'},h('input',{placeholder:'Поиск…',value:S.chatSearch,oninput:function(e){S.chatSearch=e.target.value.toLowerCase();var bx=$('#chatMsgs');if(bx)renderMessagesFiltered(bx)}})),box)}
if(S.editingMsg){var ci=view.querySelector('.chat-input');if(ci)view.insertBefore(h('div',{style:{fontSize:'11px',color:'var(--accent,var(--blue))',padding:'4px 12px'}},'✏️ Редактирование · ',h('a',{style:{color:'var(--red)'},onclick:function(){S.editingMsg=null;var i=$('#msgInput');if(i)i.value='';render()}},'отмена')),ci);var mi=$('#msgInput');if(mi&&S.editingMsg)mi.value=S.editingMsg.text}
};
function renderMessagesFiltered(bx){var keep=S.activeChatMessages;S.activeChatMessages=keep.filter(function(m){return(m.text||'').toLowerCase().indexOf(S.chatSearch)>=0});renderMessages(bx);S.activeChatMessages=keep}
var _sm=sendMessage;
sendMessage=async function(){
if(S.editingMsg){var inp=$('#msgInput');var t=inp?inp.value.trim():'';if(!t)return;try{await sb.from('messages').update({text:t,edited:true}).eq('id',S.editingMsg.id);S.editingMsg=null;showIsland('Изменено','edit','g');loadMessages(S.activeChat.id)}catch(e){showIsland('Ошибка','warn','o')}return}
return _sm();
};
if(window.showContextMenu){var _scm=showContextMenu;showContextMenu=function(msg,x,y){_scm(msg,x,y);var menu=document.querySelector('.ctx-menu');if(menu&&S.user&&msg.sender_id===S.user.id&&msg.type==='text'){menu.appendChild(h('button',{class:'ctx-item',onclick:function(){menu.remove();S.editingMsg=msg;var i=$('#msgInput');if(i){i.value=msg.text;i.focus()}},html:icon('edit')},'Редактировать'))}};}

// ---------- v30: приоритет + дедлайн в форме ----------
var _rnt=renderNewTask;
renderNewTask=function(view){
_rnt(view);
var btns=view.querySelectorAll('.btn.b');var btn=btns[btns.length-1];if(!btn)return;var holder=btn.parentNode;
var ps=h('div',{class:'prio-sel'});
[['high','🔴 Высокий'],['med','🟡 Средний'],['low','🔵 Низкий']].forEach(function(p){
var o=h('div',{class:'prio-opt'+(S._ntPrio===p[0]?' sel':'')},p[1]);
o.onclick=function(){S._ntPrio=p[0];ps.querySelectorAll('.prio-opt').forEach(function(x){x.classList.remove('sel')});o.classList.add('sel')};
ps.appendChild(o);
});
holder.insertBefore(ps,btn);
holder.insertBefore(h('div',{class:'fld'},h('label',{},'Дедлайн'),h('input',{id:'ntDue',type:'datetime-local'})),btn);
};
var _ct=createTask;
createTask=async function(){
var title=$('#ntTitle')?$('#ntTitle').value.trim():'';var desc=$('#ntDesc')?$('#ntDesc').value.trim():'';
var execUid=$('#ntExec')?$('#ntExec').value:'';var execName='';if(execUid){var sel=$('#ntExec');execName=sel.options[sel.selectedIndex].text}
if(!title){showIsland('Введите заголовок','warn','o');return}
if(!sbOk){showIsland('Supabase не подключён','warn','o');return}
var evId=S.taskEvent||null;
var due=($('#ntDue')&&$('#ntDue').value)?new Date($('#ntDue').value).toISOString():new Date(Date.now()+72*3600000).toISOString();
try{await sb.from('tasks').insert({title:title,descr:desc,executor_id:execUid||null,executor_name:execName,author_id:S.user.id,author_name:S.user.name,stage:'new',priority:S._ntPrio||'med',event_id:evId,due:due,created_at:new Date().toISOString()});
if(execUid)await sb.from('notifications').insert({user_id:execUid,text:'📋 Новая задача: '+title,type:'task'});
showIsland('Задача создана','task','g');vib(30);S.page=evId?('event:'+evId):null;S.taskEvent=null;render();
}catch(e){showIsland('Ошибка создания','warn','o')}
};
// комментарии + чек-листы в деталях
var _rtd=renderTaskDetail;
renderTaskDetail=function(view,id){
_rtd(view,id);
var t=null;S.tasks.forEach(function(x){if(x.id===id)t=x});if(!t)return;
var body=view.lastChild||view;
var cl=S.taskChecklists[id]||[];
var clCard=h('div',{class:'card',style:{padding:'12px',marginTop:'12px'}});
clCard.appendChild(h('div',{class:'gtitle',style:{padding:'0 0 8px'}},'✅ ЧЕК-ЛИСТ'));
cl.forEach(function(it,i){clCard.appendChild(h('div',{class:'cl-item'+(it.done?' done':'')},h('div',{class:'cl-chk'+(it.done?' on':''),onclick:function(){it.done=!it.done;render()}},it.done?'✓':''),h('span',{},it.t)))});
clCard.appendChild(h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},h('input',{id:'clIn',placeholder:'Новый пункт…',style:{flex:'1',background:'var(--card2)',border:'1px solid var(--sep)',borderRadius:'8px',padding:'8px 12px',fontSize:'13px'}}),h('button',{class:'btn sm b press',onclick:function(){var i=$('#clIn');if(i&&i.value.trim()){(S.taskChecklists[id]=S.taskChecklists[id]||[]).push({t:i.value.trim(),done:false});render()}}},'+')));
body.appendChild(clCard);
var cm=S.taskComments[id]||[];
var cmCard=h('div',{class:'card',style:{padding:'12px'}});
cmCard.appendChild(h('div',{class:'gtitle',style:{padding:'0 0 8px'}},'💬 КОММЕНТАРИИ · '+cm.length));
cm.forEach(function(c){cmCard.appendChild(h('div',{class:'comment-card'},h('div',{style:{fontSize:'11px',color:'var(--gray)',marginBottom:'2px'}},c.a+' · '+fmtDT(c.d)),h('div',{style:{fontSize:'13px'}},c.t)))});
cmCard.appendChild(h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},h('input',{id:'cmIn',placeholder:'Комментарий…',style:{flex:'1',background:'var(--card2)',border:'1px solid var(--sep)',borderRadius:'8px',padding:'8px 12px',fontSize:'13px'}}),h('button',{class:'btn sm b press',onclick:function(){var i=$('#cmIn');if(i&&i.value.trim()){(S.taskComments[id]=S.taskComments[id]||[]).push({a:S.user?S.user.name:'—',t:i.value.trim(),d:new Date().toISOString()});render()}}},'➤')));
body.appendChild(cmCard);
};
// экспорт CSV
var _rt=renderTasks;
renderTasks=function(view){
_rt(view);
view.style.position='relative';
view.appendChild(h('button',{class:'btn sm card press',onclick:exportTasksCSV,style:{position:'absolute',right:'16px',top:'16px'}},'📤 CSV'));
};
function exportTasksCSV(){var rows=[['ID','Заголовок','Статус','Приоритет','Исполнитель','Дедлайн']];S.tasks.forEach(function(t){rows.push([(t.id||'').slice(0,8),t.title||'',t.stage||'',t.priority||'',t.executor_name||'',t.due?fmtDT(t.due):''])});var csv=rows.map(function(r){return r.map(function(c){return'"'+String(c).replace(/"/g,'""')+'"'}).join(';')}).join('\n');var b=new Blob(['\ufeff'+csv],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='tasks.csv';a.click();URL.revokeObjectURL(a.href);showIsland('CSV скачан','download','g')}

// ---------- v31: тихие часы + доступность ----------
function quietNow(){var h=now().getHours();return S.quiet&&(h>=22||h<7)}
var _ps=playSound;playSound=function(){if(quietNow())return;_ps()};
var _ns=notifySystem;notifySystem=function(t,b){if(quietNow())return;_ns(t,b)};
var _rp=renderProfile;
renderProfile=function(view){
_rp(view);
var card=h('div',{class:'card'});
card.appendChild(h('button',{class:'grow',onclick:function(){S.quiet=!S.quiet;saveSet('km-quiet',S.quiet?'1':'0');render()}},h('div',{class:'ava gray',html:icon('bell')}),h('div',{style:{flex:'1'}},h('b',{},'Тихие часы 22–7'),h('small',{class:'cl-m'},S.quiet?'Включены':'Выключены')),h('div',{class:'tgl'+(S.quiet?' on':'')})));
card.appendChild(h('button',{class:'grow',onclick:function(){S.largeText=!S.largeText;saveSet('km-lt',S.largeText?'1':'0');applyA11y();render()}},h('div',{class:'ava gray',html:icon('gear')}),h('div',{style:{flex:'1'}},h('b',{},'Крупный текст'),h('small',{class:'cl-m'},S.largeText?'Включен':'Выключен')),h('div',{class:'tgl'+(S.largeText?' on':'')})));
card.appendChild(h('button',{class:'grow',onclick:function(){S.compact=!S.compact;saveSet('km-cp',S.compact?'1':'0');applyA11y();render()}},h('div',{class:'ava gray',html:icon('grid')}),h('div',{style:{flex:'1'}},h('b',{},'Компактный режим'),h('small',{class:'cl-m'},S.compact?'Включен':'Выключен')),h('div',{class:'tgl'+(S.compact?' on':'')})));
view.appendChild(card);
};
// поиск по складу
var _rw=renderWarehouse;
renderWarehouse=function(view){
view.appendChild(h('div',{class:'search'},h('span',{html:icon('search')}),h('input',{placeholder:'Поиск по складу…',oninput:debounce(function(e){var q=e.target.value.toLowerCase();view.querySelectorAll('.stock-row').forEach(function(r){var n=r.querySelector('b');r.style.display=(!q||(n&&n.textContent.toLowerCase().indexOf(q)>=0))?'':'none'})},150)})));
_rw(view);
};
// подача идей
var _ri=renderIdeas;
renderIdeas=function(view){
view.appendChild(h('div',{class:'card',style:{padding:'14px'}},h('div',{class:'fld'},h('label',{},'💡 Новая идея'),h('input',{id:'ideaIn',placeholder:'Опишите предложение…'})),h('button',{class:'btn b full press',onclick:function(){var i=$('#ideaIn');if(i&&i.value.trim()){IDEAS.unshift({title:i.value.trim(),author:S.user?S.user.name:'—',votes:0,my:false});showIsland('Идея подана 💡','check','g');render()}else showIsland('Пусто','warn','o')}},'Подать идею')));
_ri(view);
};
})();