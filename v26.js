/* ===== КМ·Инженер v26 — Контроль и безопасность (оверлей) ===== */
(function(){
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.zone-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}'+
'.zone{background:var(--card);backdrop-filter:var(--glass);border:1px solid var(--sep2);border-radius:14px;padding:12px;text-align:left;position:relative}'+
'.zone .zi{font-size:24px}.zone b{display:block;font-size:13px;margin:6px 0 2px}.zone small{font-size:11px;color:var(--label2)}'+
'.zone .st{position:absolute;top:10px;right:10px;width:10px;height:10px;border-radius:50%}'+
'.ab-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:12px}'+
'.ab-day{border-radius:8px;padding:6px 0;text-align:center;font-size:11px;font-weight:700;border:1px solid var(--sep2)}'+
'.ab-day.A{background:rgba(10,132,255,.12);color:var(--blue)}.ab-day.B{background:rgba(142,108,240,.12);color:var(--violet)}'+
'.req-row{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}';
document.head.appendChild(st);

// ---------- СОСТОЯНИЕ ----------
var S26={requests:[],incidents:[],swap:{},handAcc:{},esc:{}};
try{var s=JSON.parse(localStorage.getItem('km26')||'null');if(s)S26=Object.assign(S26,s)}catch(e){}
function save26(){try{localStorage.setItem('km26',JSON.stringify(S26))}catch(e){}}
function isBoss(){return state.user&&['director','deputy','chiefeng'].indexOf(state.user.role)>=0}
function empById(id){var r=null;state.employees.forEach(function(e){if(e.id===id)r=e});return r}

// ---------- ДАННЫЕ: ЗОНЫ ----------
var ZONES=[
{id:'z1',name:'Линия Л-1',tel:'Л-1',resp:'e5',ico:'🔪'},
{id:'z2',name:'Сварка Л-2',tel:'Л-2',resp:'e5',ico:'🔥'},
{id:'z3',name:'Покраска Л-3',tel:'Л-3',resp:'e11',ico:'🎨'},
{id:'z4',name:'Сборка Л-5',tel:'Л-5',resp:'e5',ico:'🔩'},
{id:'z5',name:'ЧПУ-07',tel:'ЧПУ-07',resp:'e11',ico:'⚙️'},
{id:'z6',name:'Склад',tel:null,resp:'e9',ico:'📦'},
{id:'z7',name:'ОТК',tel:null,resp:'e6',ico:'🔍'},
{id:'z8',name:'Охрана труда',tel:null,resp:'e7',ico:'🛡'}
];

// ---------- ПЕЧАТЬ ----------
function printHTML(title,bodyHTML){
var w=window.open('','_blank');
if(!w){showIsland('Разрешите всплывающие окна','warn','o');return}
w.document.write('<html><head><meta charset="utf-8"><title>'+title+'</title><style>body{font-family:Arial;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:6px;font-size:12px}</style></head><body><b>АО «Коломенский завод»</b>'+bodyHTML+'</body></html>');
w.document.close();setTimeout(function(){w.print()},300);
}

// ---------- НЕДЕЛЬНЫЙ ОТЧЁТ ----------
function buildWeekly(){
var done=state.tasks.filter(function(t){return t.stage==='done'}).length;
var late=state.tasks.filter(function(t){return t.due&&new Date(t.due)<now()&&t.stage!=='done'}).length;
var warn=0;for(var k in state.telemetry)if(state.telemetry[k].status==='warn')warn++;
return 'НЕДЕЛЬНЫЙ ОТЧЁТ · '+now().toLocaleDateString('ru-RU')+'\n\n✅ Задач выполнено: '+done+'\n⏰ Просрочено: '+late+'\n🚨 Инцидентов: '+S26.incidents.length+'\n📡 Линий с вниманием: '+warn+'\n📄 Заявок: '+S26.requests.length;
}

// ---------- ЭСКАЛАЦИЯ ----------
function escalate(){
if(!sbOk||!state.user)return;
state.tasks.forEach(function(t){
if(t.stage==='done'||!t.due)return;
if(new Date(t.due).getTime()<Date.now()&&!S26.esc[t.id]){
S26.esc[t.id]=1;save26();
sb.from('notifications').insert({user_id:'e1',text:'⚠️ Эскалация: '+(t.title||'')+' ('+(t.executor_name||'—')+')',type:'task'});
showIsland('⚠️ Просрочка → директору','warn','o',4000);
}
});
}
setTimeout(escalate,8000);setInterval(escalate,120000);

// ---------- СТРАНИЦЫ ----------
function renderMap(pg){
pg.appendChild(h('div',{class:'gtitle'},'🗺 СХЕМА ЗАВОДА'));
var g=h('div',{class:'zone-grid'});
ZONES.forEach(function(z){
var warn=false;if(z.tel&&state.telemetry[z.tel])warn=state.telemetry[z.tel].status==='warn';
var resp=empById(z.resp);
g.appendChild(h('button',{class:'zone press',onclick:function(){showIsland(z.name+' · '+(resp?resp.name:'—')+(warn?' · ⚠️':' · ✅'),'factory',warn?'o':'g',4000)}},
h('span',{class:'st',style:{background:warn?'var(--orange)':'var(--green)'}}),
h('div',{class:'zi'},z.ico),h('b',{},z.name),h('small',{},resp?resp.name:'—')));
});
pg.appendChild(g);
}
function renderAppr(pg){
pg.appendChild(h('div',{class:'gtitle'},'📄 НОВАЯ ЗАЯВКА'));
var f=h('div',{class:'card',style:{padding:'14px'}});
var ty=h('select',{id:'apType'});['Отпуск','Командировка','Пропуск'].forEach(function(t){ty.appendChild(h('option',{value:t},t))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Тип'),ty));
f.appendChild(h('div',{class:'row'},
h('div',{class:'fld',style:{flex:'1'}},h('label',{},'С'),h('input',{id:'apFrom',type:'date'})),
h('div',{class:'fld',style:{flex:'1'}},h('label',{},'По'),h('input',{id:'apTo',type:'date'}))));
f.appendChild(h('div',{class:'fld'},h('label',{},'Комментарий'),h('input',{id:'apCom',placeholder:'Причина…'})));
f.appendChild(h('button',{class:'btn b full press',onclick:function(){
var from=$('#apFrom').value,to=$('#apTo').value;
if(!from||!to){showIsland('Укажите даты','warn','o');return}
S26.requests.unshift({id:uid(),type:$('#apType').value,from:from,to:to,com:$('#apCom').value,who:state.user.name,st:'pending'});
save26();
if(sbOk)sb.from('notifications').insert({user_id:'e1',text:'📄 Заявка ('+$('#apType').value+'): '+state.user.name,type:'task'});
showIsland('Заявка отправлена','check','g');render();
}},'Отправить'));
pg.appendChild(f);
pg.appendChild(h('div',{class:'gtitle'},'ЗАЯВКИ · '+S26.requests.length));
S26.requests.forEach(function(r){
var card=h('div',{class:'req-row'},
h('div',{class:'r1'},h('span',{class:'tag '+(r.st==='ok'?'tg-g':r.st==='no'?'tg-r':'tg-o')},r.st==='ok'?'Одобрено':r.st==='no'?'Отклонено':'На согласовании'),h('span',{class:'due',style:{marginLeft:'auto'}},r.type)),
h('b',{style:{display:'block',margin:'6px 0'}},r.who),
h('div',{class:'txt-sm cl-m'},new Date(r.from).toLocaleDateString('ru-RU')+' — '+new Date(r.to).toLocaleDateString('ru-RU')+(r.com?' · '+r.com:'')));
if(isBoss()&&r.st==='pending'){
card.appendChild(h('div',{class:'row',style:{gap:'8px',marginTop:'8px'}},
h('button',{class:'btn sm g press',onclick:function(){r.st='ok';save26();render()}},'✅'),
h('button',{class:'btn sm card press',style:{color:'var(--red)'},onclick:function(){r.st='no';save26();render()}},'❌')));
}
pg.appendChild(card);
});
}
function renderIncid(pg){
pg.appendChild(h('div',{class:'gtitle'},'🚨 СООБЩИТЬ ОБ ИНЦИДЕНТЕ'));
var f=h('div',{class:'card',style:{padding:'14px'}});
var pl=h('select',{id:'inPlace'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5','Склад'].forEach(function(a){pl.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Место'),pl));
var sv=h('select',{id:'inSev'});sv.appendChild(h('option',{value:'minor'},'Незначительное'));sv.appendChild(h('option',{value:'major'},'Серьёзное'));sv.appendChild(h('option',{value:'crit'},'Критическое'));
f.appendChild(h('div',{class:'fld'},h('label',{},'Серьёзность'),sv));
f.appendChild(h('div',{class:'fld'},h('label',{},'Описание *'),h('textarea',{id:'inDesc',rows:'3'})));
f.appendChild(h('button',{class:'btn w full press',onclick:function(){
var d=$('#inDesc').value.trim();if(!d){showIsland('Опишите инцидент','warn','o');return}
S26.incidents.unshift({place:$('#inPlace').value,sev:$('#inSev').value,desc:d,who:state.user.name,date:new Date().toISOString()});
save26();
if(sbOk)sb.from('notifications').insert({user_id:'e7',text:'🚨 Инцидент: '+$('#inPlace').value+' — '+d.slice(0,40),type:'task'});
showIsland('Отправлено в ОТ 🛡','check','g');render();
}},'⚠️ Отправить в ОТ'));
pg.appendChild(f);
pg.appendChild(h('div',{class:'gtitle'},'ЖУРНАЛ · '+S26.incidents.length));
S26.incidents.forEach(function(r){
pg.appendChild(h('div',{class:'req-row'},
h('div',{class:'r1'},h('span',{class:'tag '+(r.sev==='crit'?'tg-r':r.sev==='major'?'tg-o':'tg-g')},r.place),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.date))),
h('div',{class:'txt-sm'},r.desc),h('div',{class:'txt-xs cl-gr mt'},'👤 '+r.who)));
});
}
function renderShifts(pg){
pg.appendChild(h('div',{class:'gtitle'},'📅 СМЕНЫ А/Б (14 дней)'));
var cal=h('div',{class:'ab-cal'});
var week=Math.floor(Date.now()/(7*86400000))%2;
for(var i=0;i<14;i++){
var d=new Date(Date.now()+i*86400000);
var par=(Math.floor(d.getTime()/(7*86400000))%2)?'B':'A';
cal.appendChild(h('div',{class:'ab-day '+par},h('div',{},d.getDate()),h('div',{},par)));
}
pg.appendChild(cal);
pg.appendChild(h('div',{class:'gtitle'},'👥 КОГО СЕЙЧАС'));
state.employees.slice(0,8).forEach(function(e){
var base=((+e.badge)%2===0)?'A':'B';
if(S26.swap[e.id])base=base==='A'?'B':'A';
pg.appendChild(h('div',{class:'scard press',onclick:function(){S26.swap[e.id]=!S26.swap[e.id];save26();vib(10);render()}},
h('div',{class:'ava '+e.avatar},initials(e.name)),
h('div',{style:{flex:'1'}},h('b',{},e.name),h('small',{},e.pos)),
h('span',{class:'ab-day '+base,style:{padding:'6px 12px'}},base)));
});
pg.appendChild(h('div',{class:'txt-xs cl-gr'},'Тап по сотруднику — подмена (поменять смену).'));
}
function renderReport(pg){
pg.appendChild(h('div',{class:'gtitle'},'📊 НЕДЕЛЬНЫЙ ОТЧЁТ'));
var txt=buildWeekly();
pg.appendChild(h('div',{style:{background:'var(--card2)',border:'1px solid var(--sep2)',borderRadius:'12px',padding:'12px',fontFamily:'ui-monospace,monospace',fontSize:'12px',whiteSpace:'pre-wrap',lineHeight:'1.6',marginBottom:'12px'}},txt));
pg.appendChild(h('div',{class:'row',style:{gap:'8px'}},
h('button',{class:'btn card press',style:{flex:'1'},onclick:function(){try{navigator.clipboard.writeText(txt)}catch(e){}showIsland('Скопировано','check','g')},'📋 Копировать'),
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){if(sbOk)sb.from('notifications').insert({user_id:'e1',text:'📊 Недельная сводка готова',type:'task'}).then(function(){showIsland('Директору отправлено ✅','send','g')})},'📨 Директору')));
pg.appendChild(h('button',{class:'btn card full press mt',onclick:function(){printHTML('Недельный отчёт','<pre>'+txt+'</pre>')}},'🖨 Печать'));
}
function renderPrint(pg){
pg.appendChild(h('div',{class:'gtitle'},'🖨 ПЕЧАТЬ ФОРМ'));
pg.appendChild(h('button',{class:'btn b full press mb',onclick:function(){printHTML('Наряд-допуск','<h1>НАРЯД-ДОПУСК №НД-205</h1><table><tr><td>Вид работ</td><td></td></tr><tr><td>Место</td><td></td></tr><tr><td>Ответственный</td><td>'+(state.user?state.user.name:'')+'</td></tr><tr><td>Дата</td><td>'+now().toLocaleDateString('ru-RU')+'</td></tr></table><p>Меры безопасности: ______________________</p><p>Подписи: ____________</p>')}},'⚡ Наряд-допуск'));
pg.appendChild(h('button',{class:'btn g full press mb',onclick:function(){printHTML('Справка','<p>Выдана '+(state.user?state.user.name:'—')+' в том, что он(а) является сотрудником АО «Коломенский завод», табельный № '+(state.user?state.user.badge:'—')+'.</p><p>Подпись: ____________</p>')}},'🪪 Справка'));
pg.appendChild(h('button',{class:'btn card full press',onclick:function(){printHTML('Недельный отчёт','<pre>'+buildWeekly()+'</pre>')}},'📊 Отчёт'));
}

// ---------- РОУТИНГ ----------
var _rpo=renderPageOverlay;
renderPageOverlay=function(app){
if(state.page==='map'||state.page==='appr'||state.page==='incid'||state.page==='shifts'||state.page==='report'||state.page==='print'){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},
h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),
h('div',{class:'nav-title'},{map:'🗺 Карта',appr:'📄 Заявки',incid:'🚨 Инцидент',shifts:'📅 Смены',report:'📊 Отчёт',print:'🖨 Печать'}[state.page]),
h('div',{class:'nav-sp'})));
var body=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
if(state.page==='map')renderMap(body);
else if(state.page==='appr')renderAppr(body);
else if(state.page==='incid')renderIncid(body);
else if(state.page==='shifts')renderShifts(body);
else if(state.page==='report')renderReport(body);
else renderPrint(body);
pg.appendChild(body);app.appendChild(pg);return;
}
_rpo(app);
};

// ---------- МЕНЮ ----------
var _oh=openHub;
openHub=function(){
_oh();
var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v26 · Контроль и безопасность'));
[['🗺','Карта завода','Схема и зоны',function(){closeHub();state.page='map';render()}],
['📄','Заявки','Отпуск, командировка, пропуск',function(){closeHub();state.page='appr';render()}],
['🚨','Инцидент','Сообщить в ОТ',function(){closeHub();state.page='incid';render()}],
['📅','Смены А/Б','Календарь и подмены',function(){closeHub();state.page='shifts';render()}],
['📊','Недельный отчёт','Авто-сводка',function(){closeHub();state.page='report';render()}],
['🖨','Печать форм','Наряд, справка, отчёт',function(){closeHub();state.page='print';render()}]
].forEach(function(it){
sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},
h('div',{class:'ico'},it[0]),
h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),
h('div',{class:'arr'},'›')));
});
b.appendChild(sec);
};
})();