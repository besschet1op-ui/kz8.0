/* ===== КМ·Инженер v27 — Обходы, аудиты, справочники (оверлей) ===== */
(function(){
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.cp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}'+
'.cp-item{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:12px;text-align:left;position:relative}'+
'.cp-item.done{border-color:var(--green);background:rgba(40,179,107,.08)}'+
'.cp-item b{font-size:13px;display:block;margin-bottom:2px}.cp-item small{font-size:11px;color:var(--label2)}'+
'.cp-item .ck{position:absolute;top:10px;right:10px;font-size:16px}'+
'.score-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--sep2)}'+
'.score-row:last-child{border-bottom:0}'+
'.score-row .sl{flex:1;font-size:13px;font-weight:600}'+
'.score-row .sb{width:30px;height:30px;border-radius:8px;background:var(--card2);font-size:13px;font-weight:700}'+
'.score-row .sb.on{background:var(--accent,var(--blue));color:#fff}'+
'.sig-canvas{width:100%;height:160px;background:#fff;border:1px solid var(--sep);border-radius:12px;touch-action:none}'+
'.torq-out{font-family:"Russo One";font-size:30px;text-align:center;padding:14px;background:var(--card2);border-radius:12px;margin:10px 0}'+
'.gl-row{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}'+
'.gl-row b{font-size:13px;display:block}.gl-row small{font-size:12px;color:var(--label2)}';
document.head.appendChild(st);

// ---------- СОСТОЯНИЕ ----------
var S27={rounds:[],audits:[],ppe:{},signature:null,recur:[]};
try{var s=JSON.parse(localStorage.getItem('km27')||'null');if(s)S27=Object.assign(S27,s)}catch(e){}
function save27(){try{localStorage.setItem('km27',JSON.stringify(S27))}catch(e){}}

// ---------- ДАННЫЕ ----------
var CPS=[{id:'cnc',n:'ЧПУ-07',d:'Фрезерный центр'},{id:'l1',n:'Л-1',d:'Лазерная резка'},{id:'l2',n:'Л-2',d:'Сварка'},{id:'l3',n:'Л-3',d:'Покраска'},{id:'l5',n:'Л-5',d:'Сборка'},{id:'wh',n:'Склад',d:'ГСМ и запчасти'}];
var FIVE_S=['Сортировка','Самоорганизация','Содержание в чистоте','Стандартизация','Совершенствование'];
var PPE_ITEMS=[{id:'helmet',n:'Каска',months:24},{id:'gloves',n:'Перчатки',months:3},{id:'glasses',n:'Очки',months:12},{id:'boots',n:'Ботинки',months:12},{id:'ears',n:'Наушники',months:12}];
var TORQUE={'M8':{'8.8':25,'10.9':34,'12.9':40},'M10':{'8.8':49,'10.9':67,'12.9':79},'M12':{'8.8':85,'10.9':117,'12.9':138},'M16':{'8.8':205,'10.9':282,'12.9':332},'M20':{'8.8':405,'10.9':557,'12.9':656},'M24':{'8.8':700,'10.9':960,'12.9':1130}};
var GLOSSARY=[{t:'Д49',d:'Дизель 2200 кВт, V16, для магистральных тепловозов.'},{t:'ОТК',d:'Отдел технического контроля.'},{t:'ВКС',d:'Видеоконференцсвязь.'},{t:'ТО',d:'Техническое обслуживание (ТО-1/ТО-2/ТО-3).'},
{t:'ГБЦ',d:'Головка блока цилиндров.'},{t:'СОЖ',d:'Смазочно-охлаждающая жидкость.'},{t:'ЧПУ',d:'Числовое программное управление.'},{t:'НД',d:'Наряд-допуск на опасные работы.'},{t:'СИЗ',d:'Средства индивидуальной защиты.'},{t:'OEE',d:'Общая эффективность оборудования.'}];
var DRAWINGS=[{code:'Д49-100-001',name:'Блок цилиндров',rev:'В',date:'2026-03-12'},{code:'Д49-100-002',name:'Коленвал',rev:'Г',date:'2026-02-01'},{code:'ТЭМ-010-000',name:'Рама тепловоза',rev:'Б',date:'2026-01-15'},{code:'2ТЭ-020-000',name:'Секция А',rev:'А',date:'2025-12-10'}];
var RECUR_TPL=[{id:'r1',t:'Проверка уровня СОЖ',freq:'daily'},{id:'r2',t:'Смазка узлов Л-5',freq:'weekly'},{id:'r3',t:'Контроль давления в компрессорной',freq:'daily'}];

// ---------- СТРАНИЦЫ ----------
function renderRounds(pg){
pg.appendChild(h('div',{class:'gtitle'},'🚶 ТОЧКИ ОБХОДА'));
var cur=S27._cur||null;
var g=h('div',{class:'cp-grid'});
CPS.forEach(function(c){
var done=cur&&cur.marked&&cur.marked[c.id];
g.appendChild(h('button',{class:'cp-item press'+(done?' done':''),onclick:function(){
if(!S27._cur)S27._cur={start:new Date().toISOString(),marked:{}};
S27._cur.marked[c.id]=new Date().toISOString();save27();vib(10);render();
}},h('span',{class:'ck'},done?'✅':'⬜'),h('b',{},c.n),h('small',{},c.d)));
});
pg.appendChild(g);
var marked=cur?Object.keys(cur.marked||{}).length:0;
pg.appendChild(h('div',{class:'row',style:{gap:'8px'}},
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){
if(!S27._cur){S27._cur={start:new Date().toISOString(),marked:{}};showIsland('Обход начат','route','b');render();return}
S27.rounds.unshift({start:S27._cur.start,end:new Date().toISOString(),count:marked});
S27.rounds=S27.rounds.slice(0,20);S27._cur=null;save27();showIsland('Обход завершён ✅ ('+marked+'/'+CPS.length+')','check','g');render();
}},cur?'✅ Завершить обход':'▶ Начать обход'),
h('button',{class:'btn card press',onclick:function(){S27._cur=null;save27();render()}},'Сброс')));
pg.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ · '+S27.rounds.length));
S27.rounds.forEach(function(r){
pg.appendChild(h('div',{class:'gl-row'},h('b',{},'Отмечено точек: '+r.count+'/'+CPS.length),h('small',{},fmtDT(r.start)+' — '+fmtDT(r.end))));
});
}
function renderAudit5s(pg){
var scores=S27._5s||[0,0,0,0,0];
FIVE_S.forEach(function(name,i){
var row=h('div',{class:'score-row'},h('span',{class:'sl'},(i+1)+'. '+name));
for(var s=0;s<=5;s++){
(function(ss){row.appendChild(h('button',{class:'sb press'+(scores[i]===ss?' on':''),onclick:function(){scores[i]=ss;S27._5s=scores;save27();render()}},String(ss)))})(s);
}
pg.appendChild(row);
});
var total=scores.reduce(function(a,b){return a+b},0);
pg.appendChild(h('div',{class:'torq-out'},total+' / 25'));
pg.appendChild(h('button',{class:'btn b full press',onclick:function(){
S27.audits.unshift({date:new Date().toISOString(),score:total});S27.audits=S27.audits.slice(0,10);S27._5s=[0,0,0,0,0];save27();
showIsland('Аудит сохранён: '+total+'/25','check','g');render();
}},'💾 Сохранить аудит'));
pg.appendChild(h('div',{class:'gtitle'},'ПОСЛЕДНИЕ АУДИТЫ'));
S27.audits.forEach(function(a){pg.appendChild(h('div',{class:'gl-row'},h('b',{},a.score+'/25'),h('small',{},fmtDT(a.date))))});
}
function renderPPE(pg){
var emp=state.user?state.user.name:'Сотрудник';
PPE_ITEMS.forEach(function(p){
var rec=S27.ppe[p.id]||null;
var exp=null,left=null;
if(rec){var d=new Date(rec);exp=new Date(d);exp.setMonth(exp.getMonth()+p.months);left=Math.floor((exp-Date.now())/86400000)}
var cls=left===null?'':(left<0?'cl-r':left<30?'cl-o':'cl-g');
pg.appendChild(h('div',{class:'gl-row'},
h('div',{style:{flex:'1'}},h('b',{},p.n),h('small',{},rec?('Выдано '+fmtDT(rec)+' · '+(left<0?'ПРОСРОЧЕНО':'осталось '+left+' дн.')):'Не выдано')),
h('span',{class:'txt-sm '+cls,style:{fontWeight:'700'}},left===null?'—':(left<0?'⚠️':left+' дн.')),
h('button',{class:'btn sm b press',onclick:function(){S27.ppe[p.id]=new Date().toISOString();save27();showIsland('Выдано: '+p.n,'check','g');render()}},'Выдать')));
});
}
function renderTorque(pg){
var size=S27._tqSize||'M12',cls=S27._tqCls||'8.8';
var sz=h('div',{class:'chips'});
Object.keys(TORQUE).forEach(function(k){sz.appendChild(h('button',{class:'chip press'+(size===k?' on':''),onclick:function(){S27._tqSize=k;save27();render()}},k))});
pg.appendChild(sz);
var cl=h('div',{class:'chips'});
['8.8','10.9','12.9'].forEach(function(k){cl.appendChild(h('button',{class:'chip press'+(cls===k?' on':''),onclick:function(){S27._tqCls=k;save27();render()}},k))});
pg.appendChild(cl);
var nm=TORQUE[size][cls];
pg.appendChild(h('div',{class:'torq-out'},nm+' Нм'));
pg.appendChild(h('div',{class:'txt-sm cl-m txt-c'},'≈ '+(nm*0.10197).toFixed(1)+' кгс·м'));
}
function renderGlossary(pg){
pg.appendChild(h('div',{class:'search'},h('span',{html:icon('search')}),h('input',{id:'glq',placeholder:'Термин…',oninput:function(e){
var q=(e.target.value||'').toLowerCase();var l=$('#glList');if(!l)return;l.innerHTML='';
GLOSSARY.filter(function(g){return g.t.toLowerCase().indexOf(q)>=0||g.d.toLowerCase().indexOf(q)>=0}).forEach(function(g){l.appendChild(glRow(g))});
}})));
var l=h('div',{id:'glList'});GLOSSARY.forEach(function(g){l.appendChild(glRow(g))});
pg.appendChild(l);
}
function glRow(g){return h('div',{class:'gl-row'},h('b',{},g.t),h('small',{},g.d))}
function renderDrawings(pg){
pg.appendChild(h('div',{class:'search'},h('span',{html:icon('search')}),h('input',{id:'dwq',placeholder:'Код / название…',oninput:function(e){
var q=(e.target.value||'').toLowerCase();var l=$('#dwList');if(!l)return;l.innerHTML='';
DRAWINGS.filter(function(d){return d.code.toLowerCase().indexOf(q)>=0||d.name.toLowerCase().indexOf(q)>=0}).forEach(function(d){l.appendChild(dwRow(d))});
}})));
var l=h('div',{id:'dwList'});DRAWINGS.forEach(function(d){l.appendChild(dwRow(d))});
pg.appendChild(l);
}
function dwRow(d){return h('div',{class:'gl-row press',onclick:function(){showIsland(d.code+' · рев. '+d.rev,'file','b',4000)}},h('b',{},d.code+' · '+d.name),h('small',{},'Рев. '+d.rev+' · '+fmtDT(d.date)))}
function renderSign(pg){
pg.appendChild(h('div',{class:'gtitle'},'✍️ ЭЛЕКТРОННАЯ ПОДПИСЬ'));
var cv=h('canvas',{class:'sig-canvas'});
pg.appendChild(cv);
setTimeout(function(){
var cx=cv.getContext('2d');cx.lineWidth=2;cx.lineCap='round';cx.strokeStyle='#111';
var drawing=false;
function pos(e){var r=cv.getBoundingClientRect();var p=e.touches?e.touches[0]:e;return[p.clientX-r.left,p.clientY-r.top]}
cv.addEventListener('pointerdown',function(e){drawing=true;var q=pos(e);cx.beginPath();cx.moveTo(q[0],q[1])});
cv.addEventListener('pointermove',function(e){if(!drawing)return;var q=pos(e);cx.lineTo(q[0],q[1]);cx.stroke()});
cv.addEventListener('pointerup',function(){drawing=false});
},50);
pg.appendChild(h('div',{class:'row',style:{gap:'8px',marginTop:'10px'}},
h('button',{class:'btn card press',style:{flex:'1'},onclick:function(){var cx=cv.getContext('2d');cx.clearRect(0,0,cv.width,cv.height)}},'🧹 Очистить'),
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){S27.signature=cv.toDataURL('image/png');save27();showIsland('Подпись сохранена ✍️','check','g');render()}},'💾 Сохранить')));
if(S27.signature){pg.appendChild(h('div',{class:'gtitle'},'ТЕКУЩАЯ ПОДПИСЬ'));pg.appendChild(h('img',{src:S27.signature,style:{width:'180px',background:'#fff',borderRadius:'8px',padding:'6px'}}))}
pg.appendChild(h('div',{class:'txt-xs cl-gr mt'},'Подпись прикрепляется к наряд-допускам и инструктажам.'));
}
function renderRecur(pg){
pg.appendChild(h('div',{class:'gtitle'},'🔁 ШАБЛОНЫ ЗАДАЧ'));
RECUR_TPL.forEach(function(t){
var on=S27.recur.indexOf(t.id)>=0;
pg.appendChild(h('div',{class:'gl-row'},
h('div',{style:{flex:'1'}},h('b',{},t.t),h('small',{},t.freq==='daily'?'Ежедневно':'Еженедельно')),
h('button',{class:'btn sm '+(on?'g':'card')+' press',onclick:function(){
var i=S27.recur.indexOf(t.id);if(i>=0)S27.recur.splice(i,1);else S27.recur.push(t.id);save27();render();
}},on?'Вкл':'Выкл')));
});
pg.appendChild(h('button',{class:'btn b full press mt',onclick:async function(){
var created=0;
for(var i=0;i<RECUR_TPL.length;i++){
if(S27.recur.indexOf(RECUR_TPL[i].id)<0)continue;
if(sbOk&&state.user){
await sb.from('tasks').insert({title:RECUR_TPL[i].t,descr:'Автозадача (v27)',executor_id:state.user.id,executor_name:state.user.name,author_id:state.user.id,author_name:state.user.name,stage:'new',priority:'med',due:new Date(Date.now()+24*3600000).toISOString(),created_at:new Date().toISOString()});
created++;
}
}
showIsland(created?('Создано задач: '+created):'Включите шаблоны','check','g');
if(created&&window.loadTasks)loadTasks();
}},'⚡ Создать задачи по шаблонам'));
}

// ---------- РОУТИНГ ----------
var _rpo=window.renderPageOverlay;
window.renderPageOverlay=function(app){
var p=state.page;
if(p==='rounds'||p==='audit5s'||p==='ppe'||p==='torque'||p==='glossary'||p==='drawings'||p==='sign'||p==='recur'){
var pg=h('div',{class:'page on'});
var titles={rounds:'🚶 Обход',audit5s:'✅ Аудит 5S',ppe:'🦺 СИЗ',torque:'📐 Моменты',glossary:'📘 Словарь',drawings:'🖼 Чертежи',sign:'✍️ Подпись',recur:'🔁 Шаблоны'};
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},titles[p]),h('div',{class:'nav-sp'})));
var body=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
if(p==='rounds')renderRounds(body);else if(p==='audit5s')renderAudit5s(body);else if(p==='ppe')renderPPE(body);else if(p==='torque')renderTorque(body);else if(p==='glossary')renderGlossary(body);else if(p==='drawings')renderDrawings(body);else if(p==='sign')renderSign(body);else renderRecur(body);
pg.appendChild(body);app.appendChild(pg);return;
}
_rpo(app);
};

// ---------- МЕНЮ ----------
var _oh=window.openHub;
window.openHub=function(){
_oh();
var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v27 · Обходы и справочники'));
[['🚶','Обход','Точки и история',function(){closeHub();state.page='rounds';render()}],
['✅','Аудит 5S','Оценка участка',function(){closeHub();state.page='audit5s';render()}],
['🦺','СИЗ','Выдача и сроки',function(){closeHub();state.page='ppe';render()}],
['📐','Моменты затяжки','Справочник Нм',function(){closeHub();state.page='torque';render()}],
['📘','Словарь','Термины завода',function(){closeHub();state.page='glossary';render()}],
['🖼','Чертежи','База документов',function(){closeHub();state.page='drawings';render()}],
['✍️','Подпись','Электронная',function(){closeHub();state.page='sign';render()}],
['🔁','Шаблоны задач','Повторяющиеся',function(){closeHub();state.page='recur';render()}]
].forEach(function(it){
sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')));
});
b.appendChild(sec);
};
})();