/* ===== КМ·Инженер v32 — всё кроме калькулятора ===== */
(function(){
var S32={requests:[],near:[],hand:[],esc:{},swap:{}};
try{var x=JSON.parse(localStorage.getItem('km32')||'null');if(x)S32=Object.assign(S32,x)}catch(e){}
function save32(){try{localStorage.setItem('km32',JSON.stringify(S32))}catch(e){}}
function isBoss(){return state.user&&['director','deputy','chiefeng'].indexOf(state.user.role)>=0}
var st=document.createElement('style');
st.textContent='.map-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}.map-z{background:var(--card);backdrop-filter:var(--glass);border:1px solid var(--sep2);border-radius:14px;padding:12px;text-align:left;border-left:4px solid var(--green)}.map-z.warn{border-left-color:var(--orange)}.map-z b{display:block;font-size:13px}.map-z small{font-size:11px;color:var(--label2)}.appr-row{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}.appr-row b{display:block;font-size:13px}.appr-row small{font-size:11px;color:var(--label2)}';
document.head.appendChild(st);

// ---------- 1. ЗАЯВКИ ----------
function renderAppr(view){
view.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📄 Заявки'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
var ty=h('select',{id:'apType'});['Отпуск','Командировка','Пропуск'].forEach(function(t){ty.appendChild(h('option',{value:t},t))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Тип'),ty));
f.appendChild(h('div',{class:'row'},h('div',{class:'fld',style:{flex:'1'}},h('label',{},'С'),h('input',{id:'apFrom',type:'date'})),h('div',{class:'fld',style:{flex:'1'}},h('label',{},'По'),h('input',{id:'apTo',type:'date'}))));
f.appendChild(h('div',{class:'fld'},h('label',{},'Комментарий'),h('input',{id:'apCom',placeholder:'Причина…'})));
f.appendChild(h('button',{class:'btn b full press',onclick:function(){
var from=$('#apFrom').value,to=$('#apTo').value;
if(!from||!to){showIsland('Укажите даты','warn','o');return}
S32.requests.unshift({id:uid(),type:$('#apType').value,from:from,to:to,com:$('#apCom').value,who:state.user.name,status:'pending',date:new Date().toISOString()});
save32();if(sbOk&&state.user)sb.from('notifications').insert({user_id:'e1',text:'📄 Заявка: '+$('#apType').value+' · '+state.user.name,type:'task'});
showIsland('Заявка отправлена','check','g');render();
}},'Отправить'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'МОИ ЗАЯВКИ · '+S32.requests.length));
S32.requests.forEach(function(r){
var row=h('div',{class:'appr-row'},
h('div',{class:'r1'},h('span',{class:'tag '+(r.status==='ok'?'tg-g':r.status==='no'?'tg-r':'tg-o')},r.status==='ok'?'Одобрено':r.status==='no'?'Отклонено':'На согласовании'),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.date))),
h('b',{},r.type+' · '+r.who),h('small',{},r.from+' — '+r.to+(r.com?' · '+r.com:'')));
if(isBoss()&&r.status==='pending'){row.appendChild(h('div',{class:'row',style:{gap:'8px',marginTop:'8px'}},h('button',{class:'btn sm g press',onclick:function(){r.status='ok';save32();render()}},'✅'),h('button',{class:'btn sm card press',style:{color:'var(--red)'},onclick:function(){r.status='no';save32();render()}},'❌')))}
b.appendChild(row);
});
view.appendChild(b);
}

// ---------- 2. КАРТОЧКИ БЕЗОПАСНОСТИ ----------
function renderNear(view){
view.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🚨 Безопасность'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
var pl=h('select',{id:'nmPlace'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5','Склад'].forEach(function(a){pl.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Место'),pl));
var sv=h('select',{id:'nmSev'});sv.appendChild(h('option',{value:'minor'},'Незначительное'));sv.appendChild(h('option',{value:'major'},'Серьёзное'));sv.appendChild(h('option',{value:'crit'},'Критическое'));
f.appendChild(h('div',{class:'fld'},h('label',{},'Серьёзность'),sv));
f.appendChild(h('div',{class:'fld'},h('label',{},'Наблюдение *'),h('textarea',{id:'nmDesc',rows:'3',placeholder:'Что могло привести к инциденту…'})));
f.appendChild(h('button',{class:'btn w full press',onclick:function(){
var d=$('#nmDesc').value.trim();if(!d){showIsland('Опишите наблюдение','warn','o');return}
S32.near.unshift({id:uid(),place:$('#nmPlace').value,sev:$('#nmSev').value,desc:d,who:state.user.name,date:new Date().toISOString()});
save32();if(sbOk&&state.user)sb.from('notifications').insert({user_id:'e7',text:'🚨 Near-miss: '+$('#nmPlace').value+' — '+d.slice(0,40),type:'task'});
showIsland('Отправлено в ОТ 🛡','check','g');render();
}},'⚠️ Отправить в ОТ'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'НАБЛЮДЕНИЯ · '+S32.near.length));
S32.near.forEach(function(r){b.appendChild(h('div',{class:'appr-row'},h('div',{class:'r1'},h('span',{class:'tag '+(r.sev==='crit'?'tg-r':r.sev==='major'?'tg-o':'tg-g')},r.place),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.date))),h('b',{},r.desc),h('small',{},'👤 '+r.who)))});
view.appendChild(b);
}

// ---------- 3. КАРТА ЗАВОДА ----------
var mapSel=null;
function renderMap(view){
view.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🗺 Карта завода'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var zones=[{id:'Л-1',resp:'e5'},{id:'Л-2',resp:'e5'},{id:'Л-3',resp:'e11'},{id:'Л-5',resp:'e5'},{id:'ЧПУ-07',resp:'e11'},{id:'Склад',resp:'e9',static:1},{id:'ОТК',resp:'e6',static:1}];
var g=h('div',{class:'map-grid'});
zones.forEach(function(z){
var t=state.telemetry[z.id];var warn=t&&t.status==='warn';
g.appendChild(h('button',{class:'map-z press'+(warn?' warn':''),onclick:function(){mapSel=z;render()}},
h('b',{},(t?t.name:z.id)),h('small',{},warn?'⚠️ внимание':'✅ норма')));
});
b.appendChild(g);
if(mapSel){
var t=state.telemetry[mapSel.id];var resp=null;state.employees.forEach(function(e){if(e.id===mapSel.resp)resp=e});
var d=h('div',{class:'card',style:{padding:'14px'}});
d.appendChild(h('b',{style:{display:'block',marginBottom:'8px'}},t?t.name:mapSel.id));
if(t)d.appendChild(h('div',{class:'txt-sm cl-m mb'},Math.round(t.temp)+'°C · нагрузка '+Math.round(t.load)+'%'));
if(resp)d.appendChild(h('div',{class:'scard'},h('div',{class:'ava '+resp.avatar},initials(resp.name)),h('div',{style:{flex:'1'}},h('b',{},resp.name),h('small',{},resp.pos)),h('div',{class:'acts'},h('button',{class:'press chat',onclick:function(){openOrCreateChat(resp)},html:icon('chat')}),h('button',{class:'press vks',onclick:function(){openVKS('call-'+resp.badge)},html:icon('video')}))));
b.appendChild(d);
}
view.appendChild(b);
}

// ---------- 4. ПЕРЕДАЧА СМЕНЫ 2.0 ----------
function renderHand(view){
view.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🤝 Передача смены'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
var ar=h('select',{id:'hdArea'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5'].forEach(function(a){ar.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Участок'),ar));
f.appendChild(h('div',{class:'fld'},h('label',{},'Состояние *'),h('textarea',{id:'hdNote',rows:'3'})));
f.appendChild(h('button',{class:'btn b full press',onclick:function(){
var n=$('#hdNote').value.trim();if(!n){showIsland('Опишите смену','warn','o');return}
S32.hand.unshift({id:uid(),area:$('#hdArea').value,note:n,who:state.user.name,date:new Date().toISOString(),accepted:false,sig:null});
save32();showIsland('Смена передана','check','g');render();
}},'📤 Передать'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ПЕРЕДАЧИ · '+S32.hand.length));
S32.hand.forEach(function(r){
var row=h('div',{class:'appr-row'},h('div',{class:'r1'},h('span',{class:'tag tg-v'},r.area),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.date))),h('b',{},r.note),h('small',{},'👤 '+r.who));
if(r.accepted){row.appendChild(h('div',{class:'txt-xs cl-g',style:{marginTop:'6px'}},'✍️ Принял: '+r.sig))}
else if(isBoss()||state.user.role==='master'){row.appendChild(h('button',{class:'btn sm g press',style:{marginTop:'8px'},onclick:function(){r.accepted=true;r.sig=state.user.name+' · '+fmtDT(new Date());save32();showIsland('Смена принята ✅','check','g');render()}},'✅ Принять смену (подпись)'))}
b.appendChild(row);
});
view.appendChild(b);
}

// ---------- 5. СМЕНЫ А/Б ----------
function renderSab(view){
view.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📅 Смены А/Б'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var cal=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'14px'}});
for(var i=0;i<14;i++){var d=new Date(Date.now()+i*86400000);var par=(Math.floor(d.getTime()/86400000)%2)?'Б':'А';cal.appendChild(h('div',{class:'cal-day'},String(d.getDate()),h('div',{class:'dotm',style:{background:par==='А'?'var(--blue)':'var(--orange)'}})))}
b.appendChild(cal);
b.appendChild(h('div',{class:'gtitle'},'КОГО СЕЙЧАС'));
state.employees.slice(0,8).forEach(function(e){
var base=(+e.badge)%2===0?'А':'Б';if(S32.swap[e.id])base=base==='А'?'Б':'А';
b.appendChild(h('div',{class:'scard press',onclick:function(){S32.swap[e.id]=!S32.swap[e.id];save32();render()}},
h('div',{class:'ava '+e.avatar},initials(e.name)),h('div',{style:{flex:'1'}},h('b',{},e.name),h('small',{},e.pos)),h('span',{class:'tag '+(base==='А'?'tg-b':'tg-o')},'Смена '+base)));
});
b.appendChild(h('div',{class:'txt-xs cl-gr'},'Тап — подмена (поменять смену).'));
view.appendChild(b);
}

// ---------- 6. НЕДЕЛЬНЫЙ ОТЧЁТ ----------
function weeklyText(){
var done=state.tasks.filter(function(t){return t.stage==='done'}).length;
var late=state.tasks.filter(function(t){return t.due&&new Date(t.due)<now()&&t.stage!=='done'}).length;
var warn=0;for(var k in state.telemetry)if(state.telemetry[k].status==='warn')warn++;
var crit=WAREHOUSE.filter(function(w){return w.stock<w.min}).length;
return '📊 НЕДЕЛЬНЫЙ ОТЧЁТ · '+now().toLocaleDateString('ru-RU')+'\n\n✅ Задач: '+done+' из '+state.tasks.length+'\n⏰ Просрочено: '+late+'\n🚨 Инцидентов: '+S32.near.length+'\n📡 Линий с вниманием: '+warn+'\n📦 Критичных позиций: '+crit+'\n\n— КМ·Инженер v32';
}
function printHTML(title,body){var w=window.open('','_blank');if(!w)return;w.document.write('<html><head><title>'+title+'</title><style>body{font-family:Arial;padding:24px}h1{font-size:18px}pre{white-space:pre-wrap;font-size:13px}</style></head><body><b>АО «Коломенский завод»</b><h1>'+title+'</h1>'+body+'</body></html>');w.document.close();setTimeout(function(){w.print()},300)}
function renderWeekly(view){
view.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📊 Недельный отчёт'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var txt=weeklyText();
b.appendChild(h('div',{style:{background:'var(--card2)',border:'1px solid var(--sep2)',borderRadius:'12px',padding:'12px',fontFamily:'ui-monospace,monospace',fontSize:'12px',whiteSpace:'pre-wrap',lineHeight:'1.6',marginBottom:'12px'}},txt));
b.appendChild(h('div',{class:'row',style:{gap:'8px',flexWrap:'wrap'}},
h('button',{class:'btn card press',style:{flex:'1'},onclick:function(){try{navigator.clipboard.writeText(txt)}catch(e){}showIsland('Скопировано','check','g')},'📋 Копировать'),
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){if(sbOk&&state.user)sb.from('notifications').insert({user_id:'e1',text:'📊 Недельная сводка готова',type:'task'}).then(function(){showIsland('Директору отправлено ✅','send','g')})},'📨 Директору'),
h('button',{class:'btn card press',style:{flex:'1'},onclick:function(){printHTML('Недельный отчёт','<pre>'+txt+'</pre>')}},'🖨 Печать')));
view.appendChild(b);
}

// ---------- 8. ПЕЧАТЬ ФОРМ ----------
function renderPrint(view){
view.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🖨 Печать форм'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
b.appendChild(h('button',{class:'btn b full press mb',onclick:function(){printHTML('Наряд-допуск №НД-205','<table border=1 cellpadding=6><tr><td>Вид работ</td><td></td></tr><tr><td>Место</td><td></td></tr><tr><td>Ответственный</td><td>'+(state.user?state.user.name:'')+'</td></tr><tr><td>Дата</td><td>'+now().toLocaleDateString('ru-RU')+'</td></tr></table><p>Подписи: ______</p>')}},'⚡ Наряд-допуск'));
b.appendChild(h('button',{class:'btn g full press mb',onclick:function(){printHTML('Справка','<p>Выдана '+(state.user?state.user.name:'—')+' в том, что он(а) является сотрудником АО «Коломенский завод», табельный № '+(state.user?state.user.badge:'—')+'.</p><p>Подпись: ______</p>')}},'🪪 Справка'));
b.appendChild(h('button',{class:'btn card full press',onclick:function(){printHTML('Недельный отчёт','<pre>'+weeklyText()+'</pre>')}},'📊 Отчёт'));
view.appendChild(b);
}

// ---------- 7. ЭСКАЛАЦИЯ ----------
setInterval(function(){
if(!sbOk||!state.user)return;
state.tasks.forEach(function(t){
if(t.stage==='done'||!t.due)return;
if(new Date(t.due).getTime()<Date.now()&&!S32.esc[t.id]){
S32.esc[t.id]=1;save32();
sb.from('notifications').insert({user_id:'e1',text:'⚠️ Эскалация: '+(t.title||'')+' ('+(t.executor_name||'—')+')',type:'task'});
showIsland('⚠️ Просрочка → директору','warn','o',4000);
}
});
},60000);

// ---------- МЕНЮ + РОУТИНГ ----------
var _oh=openHub;
openHub=function(){_oh();var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v32 · Контроль'));
[['📄','Заявки','Отпуск, командировка, пропуск',function(){closeHub();state.page='appr';render()}],
['🚨','Безопасность','Near-miss в ОТ',function(){closeHub();state.page='near';render()}],
['🗺','Карта завода','Зоны и ответственные',function(){closeHub();state.page='map';render()}],
['🤝','Передача смены','Приёмка с подписью',function(){closeHub();state.page='hand';render()}],
['📅','Смены А/Б','Календарь и подмены',function(){closeHub();state.page='sab';render()}],
['📊','Недельный отчёт','Авто-сводка',function(){closeHub();state.page='weekly';render()}],
['🖨','Печать форм','Наряд, справка, отчёт',function(){closeHub();state.page='print';render()}]
].forEach(function(it){sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')))});
b.appendChild(sec)};
var _rpo=renderPageOverlay;
renderPageOverlay=function(app){
if(state.page==='appr'){var pg=h('div',{class:'page on'});renderAppr(pg);app.appendChild(pg);return}
if(state.page==='near'){var pg=h('div',{class:'page on'});renderNear(pg);app.appendChild(pg);return}
if(state.page==='map'){var pg=h('div',{class:'page on'});renderMap(pg);app.appendChild(pg);return}
if(state.page==='hand'){var pg=h('div',{class:'page on'});renderHand(pg);app.appendChild(pg);return}
if(state.page==='sab'){var pg=h('div',{class:'page on'});renderSab(pg);app.appendChild(pg);return}
if(state.page==='weekly'){var pg=h('div',{class:'page on'});renderWeekly(pg);app.appendChild(pg);return}
if(state.page==='print'){var pg=h('div',{class:'page on'});renderPrint(pg);app.appendChild(pg);return}
_rpo(app)};
showIsland('v32 подключён ✅','check','g');
})();