/* ===== КМ·Инженер v28 — единый пакет инструментов (22+23 без дублей) ===== */
(function(){
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.cp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}'+
'.cp-item{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:12px;text-align:left;position:relative}'+
'.cp-item.done{border-color:var(--green);background:rgba(40,179,107,.08)}'+
'.cp-item b{font-size:13px;display:block}.cp-item small{font-size:11px;color:var(--label2)}'+
'.cp-item .ck{position:absolute;top:10px;right:10px;font-size:16px}'+
'.score-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--sep2)}'+
'.score-row:last-child{border-bottom:0}.score-row .sl{flex:1;font-size:13px;font-weight:600}'+
'.score-row .sb{width:30px;height:30px;border-radius:8px;background:var(--card2);font-size:13px;font-weight:700}'+
'.score-row .sb.on{background:var(--accent,var(--blue));color:#fff}'+
'.sig-canvas{width:100%;height:160px;background:#fff;border:1px solid var(--sep);border-radius:12px;touch-action:none}'+
'.torq-out{font-family:"Russo One";font-size:30px;text-align:center;padding:14px;background:var(--card2);border-radius:12px;margin:10px 0}'+
'.gl-row{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}'+
'.gl-row b{font-size:13px;display:block}.gl-row small{font-size:12px;color:var(--label2)}';
document.head.appendChild(st);

// ---------- СОСТОЯНИЕ ----------
var S28={rounds:[],audits:[],ppe:{},signature:null,recur:[],reqs:[],incs:[]};
try{var s=JSON.parse(localStorage.getItem('km28')||'null');if(s)S28=Object.assign(S28,s)}catch(e){}
function save28(){try{localStorage.setItem('km28',JSON.stringify(S28))}catch(e){}}
function nav28(t){return h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},t),h('div',{class:'nav-sp'}))}
function body28(){return h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}})}

// ---------- ДАННЫЕ ----------
var MACHINES=[{id:'m1',n:'Станок ЧПУ-07',model:'DMU 80',sn:'CNC-2019-007',resp:'Кузнецов П.А.',lastTO:'12.07.2026',nextTO:'12.09.2026',h:1240,hist:[{t:'ТО-2 + шпиндель',d:'12.07.2026',by:'Михайлов С.В.'},{t:'Калибровка осей',d:'03.05.2026',by:'Беляев Д.А.'}]},{id:'m2',n:'Лазер Л-1',model:'TruLaser 3030',sn:'LAS-2020-001',resp:'Михайлов С.В.',lastTO:'01.08.2026',nextTO:'01.11.2026',h:3120,hist:[{t:'Замена линзы + ТО-1',d:'01.08.2026',by:'Михайлов С.В.'}]},{id:'m3',n:'Сварочный пост Л-2',model:'Fronius TPS',sn:'WLD-2018-002',resp:'Михайлов С.В.',lastTO:'15.06.2026',nextTO:'15.09.2026',h:5480,hist:[{t:'Замена горелки',d:'15.06.2026',by:'Михайлов С.В.'}]}];
var CERTS=[{who:'Михайлов С.В.',type:'Электробезопасность (IV)',exp:'2026-08-30'},{who:'Жуков М.О.',type:'Работа на высоте',exp:'2026-09-02'},{who:'Кузнецов П.А.',type:'Оператор ЧПУ (5)',exp:'2026-09-14'},{who:'Николаева Е.И.',type:'ОТК (виз. контроль)',exp:'2026-10-20'}];
var PPE=[{id:'helmet',n:'Каска',m:24},{id:'gloves',n:'Перчатки',m:3},{id:'glasses',n:'Очки',m:12},{id:'boots',n:'Ботинки',m:12}];
var TORQUE={'M8':{'8.8':25,'10.9':34,'12.9':40},'M10':{'8.8':49,'10.9':67,'12.9':79},'M12':{'8.8':85,'10.9':117,'12.9':138},'M16':{'8.8':205,'10.9':282,'12.9':332},'M20':{'8.8':405,'10.9':557,'12.9':656}};
var GLOSSARY=[{t:'Д49',d:'Дизель 2200 кВт, V16.'},{t:'ОТК',d:'Отдел технического контроля.'},{t:'ГБЦ',d:'Головка блока цилиндров.'},{t:'СОЖ',d:'Смазочно-охлаждающая жидкость.'},{t:'НД',d:'Наряд-допуск.'},{t:'СИЗ',d:'Средства индивидуальной защиты.'}];
var DRAWINGS=[{c:'Д49-100-001',n:'Блок цилиндров',r:'В'},{c:'Д49-100-002',n:'Коленвал',r:'Г'},{c:'ТЭМ-010-000',n:'Рама тепловоза',r:'Б'}];
var CPS=[{id:'cnc',n:'ЧПУ-07',d:'Фрезерный центр'},{id:'l1',n:'Л-1',d:'Лазер'},{id:'l2',n:'Л-2',d:'Сварка'},{id:'l5',n:'Л-5',d:'Сборка'},{id:'wh',n:'Склад',d:'ГСМ'}];
var FIVE_S=['Сортировка','Самоорганизация','Чистота','Стандартизация','Совершенствование'];
var RECUR_TPL=[{id:'r1',t:'Проверка уровня СОЖ',f:'daily'},{id:'r2',t:'Смазка узлов Л-5',f:'weekly'},{id:'r3',t:'Контроль давления',f:'daily'}];
var POLLS=[{id:'p1',q:'Когда удобнее планёрка?',o:['08:00','08:30','09:00'],v:[4,9,6]},{id:'p2',q:'Второй кофе-автомат в цехе №3?',o:['Да','Нет'],v:[14,3]}];

// ---------- 1. КАЛЬКУЛЯТОР ----------
var calcBuf='';
function renderCalc(pg){
pg.appendChild(nav28('🧮 Калькулятор'));var b=body28();
var disp=h('div',{class:'torq-out',style:{fontSize:'24px'}},calcBuf||'0');b.appendChild(disp);
var g=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'14px'}});
['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].forEach(function(k){
g.appendChild(h('button',{class:'btn card press',style:{padding:'12px 0'},onclick:function(){
if(k==='C')calcBuf='';else if(k==='='){try{calcBuf=String(Math.round(Function('return ('+calcBuf.replace(/[^0-9+\-*/.()]/g,'')+')')()*10000)/10000)}catch(e){calcBuf='Ошибка'}}else calcBuf+=k;
disp.textContent=calcBuf||'0';
}},k));
});
b.appendChild(g);
b.appendChild(h('div',{class:'gtitle'},'КОНВЕРТЕР'));
function conv(l,fn){var i=h('input',{type:'number',value:'1',style:{width:'80px',background:'var(--card2)',border:'1px solid var(--sep)',borderRadius:'8px',padding:'8px'}});var o=h('b',{style:{marginLeft:'auto',fontFamily:'ui-monospace,monospace'}},fn(1));i.addEventListener('input',function(){o.textContent=fn(parseFloat(i.value)||0)});return h('div',{class:'gl-row',style:{display:'flex',alignItems:'center',gap:'8px'}},h('span',{style:{flex:'1',fontSize:'13px',fontWeight:'600'}},l),i,o)}
b.appendChild(conv('кВт → л.с.',function(v){return(v*1.341).toFixed(2)+' л.с.'}));
b.appendChild(conv('МПа → кгс/см²',function(v){return(v*10.197).toFixed(2)}));
b.appendChild(conv('°C → °F',function(v){return(v*9/5+32).toFixed(1)+' °F'}));
b.appendChild(conv('мм → дюйм',function(v){return(v*0.03937).toFixed(4)+'"'}));
pg.appendChild(b);
}
// ---------- 2. ПАСПОРТА ----------
function renderMach(pg){
pg.appendChild(nav28('🔧 Паспорта станков'));var b=body28();
MACHINES.forEach(function(m){
var d=Math.ceil((new Date(m.nextTO.split('.').reverse().join('-'))-Date.now())/86400000);
b.appendChild(h('div',{class:'gl-row press',onclick:function(){
var pg2=h('div',{class:'page on'});pg2.appendChild(nav28(m.n));var bb=body28();
bb.appendChild(h('div',{class:'gl-row'},h('b',{},m.model),h('small',{},'S/N: '+m.sn),h('small',{},'Отв.: '+m.resp),h('small',{},'Наработка: '+m.h+' м/ч')));
bb.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ ТО'));
m.hist.forEach(function(o){bb.appendChild(h('div',{class:'gl-row'},h('b',{},o.t),h('small',{},o.d+' · '+o.by)))});
pg2.appendChild(bb);document.getElementById('app').appendChild(pg2);
}},h('b',{},m.n),h('small',{},m.model+' · ТО через '+d+' дн.')));
});
pg.appendChild(b);
}
// ---------- 3. ИНЦИДЕНТ ----------
function renderInc(pg){
pg.appendChild(nav28('🚨 Инцидент'));var b=body28();
var f=h('div',{class:'card',style:{padding:'14px'}});
var pl=h('select',{id:'in28Place'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Склад'].forEach(function(a){pl.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Место'),pl));
f.appendChild(h('div',{class:'fld'},h('label',{},'Описание *'),h('textarea',{id:'in28Desc',rows:'3'})));
f.appendChild(h('button',{class:'btn w full press',onclick:function(){
var d=$('#in28Desc').value.trim();if(!d){showIsland('Опишите инцидент','warn','o');return}
S28.incs.unshift({p:$('#in28Place').value,d:d,dt:new Date().toISOString()});save28();
if(sbOk)sb.from('notifications').insert({user_id:'e7',text:'🚨 Инцидент: '+$('#in28Place').value+' — '+d.slice(0,40),type:'task'});
$('#in28Desc').value='';showIsland('Отправлено в ОТ 🛡','check','g');render();
}},'⚠️ Отправить в ОТ'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ЖУРНАЛ · '+S28.incs.length));
S28.incs.forEach(function(r){b.appendChild(h('div',{class:'gl-row'},h('b',{},r.p),h('small',{},r.d),h('small',{},fmtDT(r.dt))))});
pg.appendChild(b);
}
// ---------- 4. ЗАЯВКИ ----------
var REQ_ST=['новая','в работе','выдано'];
function renderParts(pg){
pg.appendChild(nav28('📦 Заявки на запчасти'));var b=body28();
var f=h('div',{class:'card',style:{padding:'14px'}});
f.appendChild(h('div',{class:'fld'},h('label',{},'Позиция *'),h('input',{id:'rq28Name'})));
f.appendChild(h('div',{class:'row'},h('div',{class:'fld',style:{flex:'1'}},h('label',{},'Кол-во'),h('input',{id:'rq28Qty',type:'number',value:'1'})),h('div',{class:'fld',style:{flex:'1'}},h('label',{},'Ед.'),h('input',{id:'rq28Unit',value:'шт'}))));
f.appendChild(h('button',{class:'btn b full press',onclick:function(){
var n=$('#rq28Name').value.trim();if(!n){showIsland('Укажите позицию','warn','o');return}
S28.reqs.unshift({n:n,q:parseInt($('#rq28Qty').value)||1,u:$('#rq28Unit').value,st:0,dt:new Date().toISOString()});save28();
if(sbOk&&state.user)sb.from('notifications').insert({user_id:'e9',text:'📦 Заявка: '+n,type:'task'});
showIsland('Заявка создана','check','g');render();
}},'Создать заявку'));
b.appendChild(f);
S28.reqs.forEach(function(r,i){
b.appendChild(h('div',{class:'gl-row press',onclick:function(){S28.reqs[i].st=(r.st+1)%3;save28();render()}},
h('div',{class:'r1'},h('span',{class:'tag '+(r.st===2?'tg-g':r.st===1?'tg-o':'tg-b')},REQ_ST[r.st]),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.dt))),
h('b',{},r.n),h('small',{},r.q+' '+r.u+' · тап — статус')));
});
pg.appendChild(b);
}
// ---------- 5. УДОСТОВЕРЕНИЯ + СИЗ ----------
function renderCerts(pg){
pg.appendChild(nav28('📚 Допуски и СИЗ'));var b=body28();
b.appendChild(h('div',{class:'gtitle'},'УДОСТОВЕРЕНИЯ'));
CERTS.forEach(function(c){
var d=Math.ceil((new Date(c.exp)-Date.now())/86400000);
var cls=d<0?'cl-r':d<=30?'cl-o':'cl-g';
b.appendChild(h('div',{class:'gl-row'},h('b',{},c.who),h('small',{},c.type),h('small',{class:cls,style:{fontWeight:'700'}},d<0?'истекло':d+' дн.')));
});
b.appendChild(h('div',{class:'gtitle'},'СИЗ'));
PPE.forEach(function(p){
var rec=S28.ppe[p.id]||null;var left=null;
if(rec){var e2=new Date(rec);e2.setMonth(e2.getMonth()+p.m);left=Math.floor((e2-Date.now())/86400000)}
var cls=left===null?'':(left<0?'cl-r':left<30?'cl-o':'cl-g');
b.appendChild(h('div',{class:'gl-row',style:{display:'flex',alignItems:'center',gap:'8px'}},
h('div',{style:{flex:'1'}},h('b',{},p.n),h('small',{},rec?('Выдано '+fmtDT(rec)+' · '+(left<0?'ПРОСРОЧЕНО':'осталось '+left+' дн.')):'Не выдано')),
h('span',{class:'txt-sm '+cls,style:{fontWeight:'700'}},left===null?'—':left+' дн.'),
h('button',{class:'btn sm b press',onclick:function(){S28.ppe[p.id]=new Date().toISOString();save28();showIsland('Выдано: '+p.n,'check','g');render()}},'Выдать')));
});
pg.appendChild(b);
}
// ---------- 6. ОПРОСЫ ----------
function renderPolls(pg){
pg.appendChild(nav28('🗳 Опросы'));var b=body28();
POLLS.forEach(function(p){
var card=h('div',{class:'card',style:{padding:'14px'}});card.appendChild(h('b',{style:{display:'block',marginBottom:'10px'}},p.q));
var total=p.v.reduce(function(a,c){return a+c},0)||1;
p.o.forEach(function(o,oi){
var pct=Math.round(p.v[oi]/total*100);
card.appendChild(h('div',{class:'score-row',style:{cursor:'pointer'},onclick:function(){p.v[oi]++;render()}},
h('span',{class:'sl'},o),h('b',{style:{fontFamily:'ui-monospace,monospace'}},pct+'%')));
card.appendChild(h('div',{class:'progress'},h('i',{style:{width:pct+'%'}})));
});
b.appendChild(card);
});
pg.appendChild(b);
}
// ---------- 7. МОЙ ДЕНЬ ----------
function renderMyDay(pg){
pg.appendChild(nav28('📊 Мой день'));var b=body28();
var done=state.tasks.filter(function(t){return t.executor_id===state.user.id&&t.stage==='done'}).length;
var todo=state.tasks.filter(function(t){return t.executor_id===state.user.id&&t.stage!=='done'}).length;
var warn=0;for(var k in state.telemetry)if(state.telemetry[k].status==='warn')warn++;
b.appendChild(h('div',{class:'kpi-grid'},
h('div',{class:'kpi green'},h('small',{},'Готово'),h('b',{},String(done))),
h('div',{class:'kpi blue'},h('small',{},'В работе'),h('b',{},String(todo))),
h('div',{class:'kpi orange'},h('small',{},'Линии ⚠️'),h('b',{},String(warn))),
h('div',{class:'kpi violet'},h('small',{},'Инциденты'),h('b',{},String(S28.incs.length)))));
b.appendChild(h('div',{class:'gtitle'},'МОИ ЗАДАЧИ'));
state.tasks.filter(function(t){return t.executor_id===state.user.id&&t.stage!=='done'}).slice(0,5).forEach(function(t){b.appendChild(h('div',{class:'gl-row'},h('b',{},t.title),h('small',{},fmtDT(t.due))))});
pg.appendChild(b);
}
// ---------- 8. ПЕЧАТЬ ----------
function print28(html){var w=window.open('','_blank');if(!w){showIsland('Разрешите окна','warn','o');return}w.document.write('<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:6px;font-size:12px}</style></head><body><b>АО «Коломенский завод»</b>'+html+'</body></html>');w.document.close();setTimeout(function(){w.print()},300)}
function renderPrint(pg){
pg.appendChild(nav28('🖨 Печать форм'));var b=body28();
b.appendChild(h('button',{class:'btn b full press mb',onclick:function(){print28('<h1>НАРЯД-ДОПУСК №НД-205</h1><table><tr><td>Вид работ</td><td></td></tr><tr><td>Место</td><td></td></tr><tr><td>Ответственный</td><td>'+(state.user?state.user.name:'')+'</td></tr><tr><td>Дата</td><td>'+now().toLocaleDateString('ru-RU')+'</td></tr></table><p>Подписи: ______</p>')}},'⚡ Наряд-допуск'));
b.appendChild(h('button',{class:'btn g full press mb',onclick:function(){print28('<h1>ЖУРНАЛ ПЕРЕДАЧИ СМЕНЫ</h1><p>Дата: '+now().toLocaleDateString('ru-RU')+'</p><p>Сдал: '+(state.user?state.user.name:'—')+'</p><p>Замечания: ______</p><p>Подпись: ______</p>')}},'📒 Журнал смены'));
b.appendChild(h('button',{class:'btn card full press',onclick:function(){print28('<h1>СПРАВКА</h1><p>Выдана '+(state.user?state.user.name:'—')+', табельный № '+(state.user?state.user.badge:'—')+'.</p><p>Подпись: ______</p>')}},'🪪 Справка'));
pg.appendChild(b);
}
// ---------- 9. ОБХОДЫ ----------
function renderRounds(pg){
pg.appendChild(nav28('🚶 Обход'));var b=body28();
var cur=S28._cur||null;
var g=h('div',{class:'cp-grid'});
CPS.forEach(function(c){
var done=cur&&cur.m&&cur.m[c.id];
g.appendChild(h('button',{class:'cp-item press'+(done?' done':''),onclick:function(){
if(!S28._cur)S28._cur={s:new Date().toISOString(),m:{}};
S28._cur.m[c.id]=new Date().toISOString();save28();vib(10);render();
}},h('span',{class:'ck'},done?'✅':'⬜'),h('b',{},c.n),h('small',{},c.d)));
});
b.appendChild(g);
var mk=cur?Object.keys(cur.m||{}).length:0;
b.appendChild(h('div',{class:'row',style:{gap:'8px'}},
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){
if(!S28._cur){S28._cur={s:new Date().toISOString(),m:{}};showIsland('Обход начат','route','b');render();return}
S28.rounds.unshift({s:S28._cur.s,e:new Date().toISOString(),c:mk});S28.rounds=S28.rounds.slice(0,20);S28._cur=null;save28();showIsland('Обход завершён ✅','check','g');render();
}},cur?'✅ Завершить':'▶ Начать'),
h('button',{class:'btn card press',onclick:function(){S28._cur=null;save28();render()}},'Сброс')));
b.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ · '+S28.rounds.length));
S28.rounds.forEach(function(r){b.appendChild(h('div',{class:'gl-row'},h('b',{},'Точек: '+r.c+'/'+CPS.length),h('small',{},fmtDT(r.s)+' — '+fmtDT(r.e))))});
pg.appendChild(b);
}
// ---------- 10. АУДИТ 5S ----------
function render5S(pg){
pg.appendChild(nav28('✅ Аудит 5S'));var b=body28();
var sc=S28._5s||[0,0,0,0,0];
FIVE_S.forEach(function(n,i){
var row=h('div',{class:'score-row'},h('span',{class:'sl'},(i+1)+'. '+n));
for(var s=0;s<=5;s++){(function(ss){row.appendChild(h('button',{class:'sb press'+(sc[i]===ss?' on':''),onclick:function(){sc[i]=ss;S28._5s=sc;save28();render()}},String(ss)))})(s)}
b.appendChild(row);
});
var total=sc.reduce(function(a,b){return a+b},0);
b.appendChild(h('div',{class:'torq-out'},total+' / 25'));
b.appendChild(h('button',{class:'btn b full press',onclick:function(){S28.audits.unshift({d:new Date().toISOString(),s:total});S28.audits=S28.audits.slice(0,10);S28._5s=[0,0,0,0,0];save28();showIsland('Аудит: '+total+'/25','check','g');render()}},'💾 Сохранить'));
pg.appendChild(b);
}
// ---------- 11. МОМЕНТЫ ----------
function renderTorque(pg){
pg.appendChild(nav28('📐 Моменты затяжки'));var b=body28();
var size=S28._tqS||'M12',cls=S28._tqC||'8.8';
var sz=h('div',{class:'chips'});Object.keys(TORQUE).forEach(function(k){sz.appendChild(h('button',{class:'chip press'+(size===k?' on':''),onclick:function(){S28._tqS=k;save28();render()}},k))});b.appendChild(sz);
var cl=h('div',{class:'chips'});['8.8','10.9','12.9'].forEach(function(k){cl.appendChild(h('button',{class:'chip press'+(cls===k?' on':''),onclick:function(){S28._tqC=k;save28();render()}},k))});b.appendChild(cl);
b.appendChild(h('div',{class:'torq-out'},TORQUE[size][cls]+' Нм'));
b.appendChild(h('div',{class:'txt-sm cl-m txt-c'},'≈ '+(TORQUE[size][cls]*0.10197).toFixed(1)+' кгс·м'));
pg.appendChild(b);
}
// ---------- 12. СПРАВОЧНИК ----------
function renderRef(pg){
pg.appendChild(nav28('📘 Справочник'));var b=body28();
b.appendChild(h('div',{class:'gtitle'},'СЛОВАРЬ'));
GLOSSARY.forEach(function(g){b.appendChild(h('div',{class:'gl-row'},h('b',{},g.t),h('small',{},g.d)))});
b.appendChild(h('div',{class:'gtitle'},'ЧЕРТЕЖИ'));
DRAWINGS.forEach(function(d){b.appendChild(h('div',{class:'gl-row press',onclick:function(){showIsland(d.c+' · рев. '+d.r,'file','b',4000)}},h('b',{},d.c+' · '+d.n),h('small',{},'Рев. '+d.r)))});
pg.appendChild(b);
}
// ---------- 13. ПОДПИСЬ ----------
function renderSign(pg){
pg.appendChild(nav28('✍️ Подпись'));var b=body28();
var cv=h('canvas',{class:'sig-canvas'});b.appendChild(cv);
setTimeout(function(){
var cx=cv.getContext('2d');cx.lineWidth=2;cx.lineCap='round';cx.strokeStyle='#111';var dr=false;
function pos(e){var r=cv.getBoundingClientRect();var p=e.touches?e.touches[0]:e;return[p.clientX-r.left,p.clientY-r.top]}
cv.addEventListener('pointerdown',function(e){dr=true;var q=pos(e);cx.beginPath();cx.moveTo(q[0],q[1])});
cv.addEventListener('pointermove',function(e){if(!dr)return;var q=pos(e);cx.lineTo(q[0],q[1]);cx.stroke()});
cv.addEventListener('pointerup',function(){dr=false});
},50);
b.appendChild(h('div',{class:'row',style:{gap:'8px',marginTop:'10px'}},
h('button',{class:'btn card press',style:{flex:'1'},onclick:function(){cv.getContext('2d').clearRect(0,0,cv.width,cv.height)}},'🧹 Очистить'),
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){S28.signature=cv.toDataURL('image/png');save28();showIsland('Подпись сохранена ✍️','check','g');render()}},'💾 Сохранить')));
if(S28.signature){b.appendChild(h('div',{class:'gtitle'},'ТЕКУЩАЯ'));b.appendChild(h('img',{src:S28.signature,style:{width:'180px',background:'#fff',borderRadius:'8px',padding:'6px'}}))}
pg.appendChild(b);
}
// ---------- 14. ШАБЛОНЫ ----------
function renderRecur(pg){
pg.appendChild(nav28('🔁 Шаблоны задач'));var b=body28();
RECUR_TPL.forEach(function(t){
var on=S28.recur.indexOf(t.id)>=0;
b.appendChild(h('div',{class:'gl-row',style:{display:'flex',alignItems:'center',gap:'8px'}},
h('div',{style:{flex:'1'}},h('b',{},t.t),h('small',{},t.f==='daily'?'Ежедневно':'Еженедельно')),
h('button',{class:'btn sm '+(on?'g':'card')+' press',onclick:function(){var i=S28.recur.indexOf(t.id);if(i>=0)S28.recur.splice(i,1);else S28.recur.push(t.id);save28();render()}},on?'Вкл':'Выкл')));
});
b.appendChild(h('button',{class:'btn b full press mt',onclick:async function(){
var n=0;for(var i=0;i<RECUR_TPL.length;i++){if(S28.recur.indexOf(RECUR_TPL[i].id)<0)continue;
if(sbOk&&state.user){await sb.from('tasks').insert({title:RECUR_TPL[i].t,executor_id:state.user.id,executor_name:state.user.name,author_id:state.user.id,author_name:state.user.name,stage:'new',priority:'med',due:new Date(Date.now()+86400000).toISOString(),created_at:new Date().toISOString()});n++}}
showIsland(n?('Создано задач: '+n):'Включите шаблоны','check','g');if(n&&window.loadTasks)loadTasks();
}},'⚡ Создать задачи'));
pg.appendChild(b);
}

// ---------- РОУТИНГ ----------
var _rpo=window.renderPageOverlay;
window.renderPageOverlay=function(app){
var p=state.page;
var map={calc:renderCalc,mach:renderMach,inc:renderInc,parts:renderParts,certs:renderCerts,polls:renderPolls,myday:renderMyDay,print:renderPrint,rounds:renderRounds,fives:render5S,torque:renderTorque,ref:renderRef,sign:renderSign,recur:renderRecur};
if(map[p]){var pg=h('div',{class:'page on'});map[p](pg);app.appendChild(pg);return}
_rpo(app);
};

// ---------- МЕНЮ (одна секция, без дублей) ----------
var _oh=window.openHub;
window.openHub=function(){
_oh();
var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v28 · Инструменты'));
[['🧮','Калькулятор','Конвертер величин','calc'],
['🔧','Паспорта станков','Машины и ТО','mach'],
['🚨','Инцидент','Сообщить в ОТ','inc'],
['📦','Заявки','Запчасти со склада','parts'],
['📚','Допуски и СИЗ','Сроки удостоверений','certs'],
['🗳','Опросы','Голосования','polls'],
['📊','Мой день','Личная сводка','myday'],
['🖨','Печать форм','Наряд, журнал','print'],
['🚶','Обход','Чек-поинты','rounds'],
['✅','Аудит 5S','Оценка участка','fives'],
['📐','Моменты затяжки','Справочник Нм','torque'],
['📘','Справочник','Словарь и чертежи','ref'],
['✍️','Подпись','Электронная','sign'],
['🔁','Шаблоны задач','Повторяющиеся','recur']
].forEach(function(it){
sec.appendChild(h('button',{class:'hub-item press',onclick:function(){closeHub();state.page=it[3];render()}},
h('div',{class:'ico'},it[0]),
h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),
h('div',{class:'arr'},'›')));
});
b.appendChild(sec);
};
})();