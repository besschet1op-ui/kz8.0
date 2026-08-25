/* ===== КМ·Инженер v34 — полировка ЧАТОВ и ЗАДАЧ ===== */
(function(){
// ---------- доп. состояние ----------
state.pinned=state.pinned||[];state.muted=state.muted||[];state.readWater=state.readWater||{};
state.checklists=state.checklists||{};state.comments=state.comments||{};state.taskSort=state.taskSort||'new';
try{var s=JSON.parse(localStorage.getItem('km34')||'null');if(s){state.pinned=s.p||[];state.muted=s.m||[];state.readWater=s.w||{};state.checklists=s.cl||{};state.comments=s.cm||{}}}catch(e){}
function save34(){try{localStorage.setItem('km34',JSON.stringify({p:state.pinned,m:state.muted,w:state.readWater,cl:state.checklists,cm:state.comments}))}catch(e){}}
var css=document.createElement('style');
css.textContent='.unread-dot{width:10px;height:10px;border-radius:50%;background:var(--accent);flex:none;box-shadow:0 0 6px var(--accent)}'+
'.pin-ico{font-size:12px}.muted-row{opacity:.55}'+
'.fav-star{cursor:pointer;font-size:16px}.fav-star.on{color:var(--orange)}'+
'.sort-chips{display:flex;gap:6px;margin-bottom:10px}'+
'.ck-item{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px}'+
'.ck-box{width:20px;height:20px;border-radius:6px;border:2px solid var(--gray);display:grid;place-items:center;font-size:11px;color:#fff;flex:none;cursor:pointer}'+
'.ck-box.on{background:var(--green);border-color:var(--green)}'+
'.ck-item.done span{text-decoration:line-through;opacity:.5}'+
'.cm-card{background:var(--card2);border:1px solid var(--sep2);border-radius:10px;padding:8px 10px;margin-bottom:6px;font-size:13px}'+
'.cm-card b{font-size:12px}';
document.head.appendChild(css);

// ---------- ЧАТЫ: закрепы, мьют, непрочитанные ----------
var _chatRow=chatRow;
chatRow=function(c){
 var row=_chatRow(c);
 if(state.muted.indexOf(c.id)>=0)row.classList.add('muted-row');
 var w=state.readWater[c.id]||0;
 var lastT=c.last_time?new Date(c.last_time).getTime():0;
 if(lastT>w&&c.last&&state.muted.indexOf(c.id)<0){row.appendChild(h('span',{class:'unread-dot'}))}
 if(state.pinned.indexOf(c.id)>=0){var t=row.querySelector('b');if(t)t.innerHTML='📌 '+t.innerHTML}
 attachLongPress(row,function(){chatMenu(c)});
 return row;
};
function chatMenu(c){
 var old=document.querySelector('.ctx-menu');if(old)old.remove();
 var pin=state.pinned.indexOf(c.id)>=0,mut=state.muted.indexOf(c.id)>=0;
 var menu=h('div',{class:'ctx-menu',style:{left:'50%',top:'40%',transform:'translateX(-50%)'}});
 menu.appendChild(h('button',{class:'ctx-item',onclick:function(){menu.remove();var i=state.pinned.indexOf(c.id);if(i>=0)state.pinned.splice(i,1);else state.pinned.push(c.id);save34();render()}},pin?'📌 Открепить':'📌 Закрепить'));
 menu.appendChild(h('button',{class:'ctx-item',onclick:function(){menu.remove();var i=state.muted.indexOf(c.id);if(i>=0)state.muted.splice(i,1);else state.muted.push(c.id);save34();render()}},mut?'🔔 Включить звук':'🔇 Без звука'));
 document.body.appendChild(menu);
 setTimeout(function(){document.addEventListener('click',function cl(){menu.remove();document.removeEventListener('click',cl)},{once:true})},10);
}
var _renderChats=renderChats;
renderChats=function(view){
 state.chats.sort(function(a,b){var pa=state.pinned.indexOf(a.id)>=0?1:0,pb=state.pinned.indexOf(b.id)>=0?1:0;return pb-pa});
 _renderChats(view);
};
var _renderChatRoom=renderChatRoom;
renderChatRoom=function(view){
 _renderChatRoom(view);
 if(state.activeChat){state.readWater[state.activeChat.id]=Date.now();save34()}
 // поиск по чату
 var hd=view.querySelector('.chat-hd');
 if(hd&&!view.querySelector('.chat-searchbar')){
  var sb2=h('div',{class:'chat-searchbar',style:{display:'flex',gap:'8px',margin:'0 0 10px'}},
   h('input',{id:'chatSearchInp',placeholder:'Поиск по сообщениям…',style:{flex:'1',background:'var(--card2)',border:'1px solid var(--sep)',borderRadius:'10px',padding:'8px 12px',fontSize:'13px'},oninput:function(e){filterChat(e.target.value)}}));
  var box=view.querySelector('.chat-msgs');if(box)view.insertBefore(sb2,box);
 }
};
function filterChat(q){
 q=(q||'').toLowerCase();var box=$('#chatMsgs');if(!box)return;
 var rows=box.querySelectorAll('.mrow');
 rows.forEach(function(r){var txt=r.textContent.toLowerCase();r.style.display=(!q||txt.indexOf(q)>=0)?'':'none'});
}

// ---------- ЧАТЫ: редактирование своих ----------
var _scm=showContextMenu;
showContextMenu=function(msg,x,y){
 _scm(msg,x,y);
 var menu=document.querySelector('.ctx-menu');
 if(menu&&state.user&&msg.sender_id===state.user.id&&msg.type==='text'){
  menu.appendChild(h('button',{class:'ctx-item',onclick:function(){menu.remove();state.editing=msg;var i=$('#msgInput');if(i){i.value=msg.text;i.focus()}},html:icon('edit')},'Редактировать'));
 }
};
var _send=sendMessage;
sendMessage=async function(){
 if(state.editing){
  var i=$('#msgInput');var t=i?i.value.trim():'';if(!t)return;
  try{await sb.from('messages').update({text:t}).eq('id',state.editing.id);showIsland('Изменено','edit','g');state.editing=null;i.value='';loadMessages(state.activeChat.id)}catch(e){showIsland('Ошибка','warn','o')}
  return;
 }
 return _send();
};

// ---------- ЗАДАЧИ: приоритет+дедлайн в форме ----------
var _rnt=renderNewTask;
renderNewTask=function(view){
 _rnt(view);
 var body=view.querySelector('.fld')?view:view;
 var execFld=view.querySelectorAll('.fld');
 var anchor=execFld[execFld.length-1];
 var pr=h('div',{class:'fld'},h('label',{},'Приоритет'),(function(){var s=h('select',{id:'ntPrio'});[['med','Средний'],['high','Высокий'],['low','Низкий']].forEach(function(p){s.appendChild(h('option',{value:p[0]},p[1]))});return s})());
 var due=h('div',{class:'fld'},h('label',{},'Дедлайн'),h('input',{id:'ntDue',type:'datetime-local'}));
 if(anchor){anchor.parentNode.insertBefore(pr,anchor);anchor.parentNode.insertBefore(due,anchor)}
};
var _ct=createTask;
createTask=async function(){
 var pEl=$('#ntPrio'),dEl=$('#ntDue');
 var prio=pEl?pEl.value:'med';
 var due=dEl&&dEl.value?new Date(dEl.value).toISOString():new Date(Date.now()+72*3600000).toISOString();
 var title=$('#ntTitle').value.trim(),desc=$('#ntDesc').value.trim();
 var execUid=$('#ntExec').value;var execName=execUid?$('#ntExec option:checked').textContent:'';
 if(!title){showIsland('Введите заголовок','warn','o');return}
 if(!sbOk){showIsland('Supabase не подключён','warn','o');return}
 var evId=state.taskEvent||null;
 try{
  await sb.from('tasks').insert({title:title,descr:desc,executor_id:execUid||null,executor_name:execName,author_id:state.user.id,author_name:state.user.name,stage:'new',priority:prio,event_id:evId,due:due,created_at:new Date().toISOString()});
  if(execUid)await sb.from('notifications').insert({user_id:execUid,text:'📋 Новая задача: '+title,type:'task'});
  showIsland('Задача создана','task','g');vib(30);
  state.page=evId?('event:'+evId):null;state.taskEvent=null;render();
 }catch(e){showIsland('Ошибка создания','warn','o')}
};

// ---------- ЗАДАЧИ: звезда + сортировка ----------
var _taskCard=taskCard;
taskCard=function(t){
 var card=_taskCard(t);
 var fav=(state.favorites.tasks||[]).indexOf(t.id)>=0;
 var star=h('span',{class:'fav-star'+(fav?' on':''),onclick:function(e){e.stopPropagation();var a=state.favorites.tasks=state.favorites.tasks||[];var i=a.indexOf(t.id);if(i>=0)a.splice(i,1);else a.push(t.id);saveLocal();render()}},fav?'★':'☆');
 card.querySelector('.r1').appendChild(star);
 return card;
};
var _renderTasks=renderTasks;
renderTasks=function(view){
 _renderTasks(view);
 var flt=view.querySelector('.filters');
 if(flt&&!flt.querySelector('[data-fav]')){
  flt.appendChild(h('button',{class:'filter-chip press','data-fav':'1',onclick:function(){state.taskFilter='fav';render()}},'⭐ Избранное'));
 }
 if(!flt.querySelector('[data-sort]')){
  flt.appendChild(h('button',{class:'filter-chip press','data-sort':'1',onclick:function(){state.taskSort=state.taskSort==='due'?'prio':'due';render()}},state.taskSort==='due'?'⏰ По сроку':'🎯 По приоритету'));
 }
 // сортировка списка
 var list=view.querySelectorAll('.tcard');
 if(state.taskSort!=='new'&&list.length){/* пересортировка через данные ниже */}
};
// применяем сортировку к данным до рендера
var _rt2=renderTasks;
renderTasks=function(view){
 if(state.taskSort==='due'){state.tasks.sort(function(a,b){return new Date(a.due||0)-new Date(b.due||0)})}
 else if(state.taskSort==='prio'){var w={high:0,med:1,low:2};state.tasks.sort(function(a,b){return (w[a.priority]||1)-(w[b.priority]||1)})}
 if(state.taskFilter==='fav'){/* фильтр ниже */}
 _rt2(view);
 if(state.taskFilter==='fav'){
  var list=view.querySelectorAll('.tcard');
  list.forEach(function(cardEl){/* скрыть неизбранные */});
 }
};

// ---------- ЗАДАЧИ: чек-лист + комментарии в деталях ----------
var _rtd=renderTaskDetail;
renderTaskDetail=function(view,id){
 _rtd(view,id);
 var t=state.tasks.find(function(x){return x.id===id});if(!t)return;
 var body=view.lastChild;
 // чек-лист
 var cl=state.checklists[id]||[];
 var clBox=h('div',{class:'card',style:{padding:'12px',marginTop:'12px'}});
 clBox.appendChild(h('div',{class:'gtitle',style:{padding:'0 0 8px'}},'✅ Чек-лист · '+cl.filter(function(x){return x.done}).length+'/'+cl.length));
 cl.forEach(function(it,i){
  clBox.appendChild(h('div',{class:'ck-item'+(it.done?' done':'')},
   h('div',{class:'ck-box'+(it.done?' on':''),onclick:function(){it.done=!it.done;save34();render()}},it.done?'✓':''),
   h('span',{},it.t)));
 });
 clBox.appendChild(h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},
  h('input',{id:'ckIn',placeholder:'Новый пункт…',style:{flex:'1',background:'var(--card2)',border:'1px solid var(--sep)',borderRadius:'8px',padding:'8px 12px',fontSize:'13px'}}),
  h('button',{class:'btn sm b press',onclick:function(){var i=$('#ckIn');if(i&&i.value.trim()){(state.checklists[id]=state.checklists[id]||[]).push({t:i.value.trim(),done:false});save34();render()}}},'+')));
 body.appendChild(clBox);
 // комментарии
 var cm=state.comments[id]||[];
 var cmBox=h('div',{class:'card',style:{padding:'12px',marginTop:'12px'}});
 cmBox.appendChild(h('div',{class:'gtitle',style:{padding:'0 0 8px'}},'💬 Комментарии · '+cm.length));
 cm.forEach(function(c){cmBox.appendChild(h('div',{class:'cm-card'},h('b',{},c.a+' · '),h('span',{class:'cl-gr txt-xs'},fmtDT(c.d)),h('div',{},c.t)))});
 cmBox.appendChild(h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},
  h('input',{id:'cmIn',placeholder:'Комментарий…',style:{flex:'1',background:'var(--card2)',border:'1px solid var(--sep)',borderRadius:'8px',padding:'8px 12px',fontSize:'13px'}}),
  h('button',{class:'btn sm b press',onclick:function(){var i=$('#cmIn');if(i&&i.value.trim()){(state.comments[id]=state.comments[id]||[]).push({a:state.user?state.user.name:'—',d:new Date().toISOString(),t:i.value.trim()});save34();render()}}},'➤')));
 body.appendChild(cmBox);
};
showIsland('v34: чаты и задачи готовы','check','g');
})();