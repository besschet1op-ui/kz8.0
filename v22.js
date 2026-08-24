/* ===== КМ·Инженер v22 — оверлей ===== */
(function(){
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.calc-disp{width:100%;background:var(--card2);border:1px solid var(--sep);border-radius:14px;padding:16px;font-size:26px;font-family:ui-monospace,monospace;text-align:right;margin-bottom:10px}.calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}.calc-key{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:14px 0;font-size:18px;font-weight:700}.calc-key.op{background:var(--accent-soft,rgba(10,132,255,.14));color:var(--accent,var(--blue))}.conv-row{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}.conv-row .conv-l{flex:1}.conv-row .conv-l small{display:block;font-size:10px;color:var(--label2);text-transform:uppercase;font-weight:700;margin-bottom:4px}.conv-inp{width:90px;background:var(--card2);border:1px solid var(--sep);border-radius:8px;padding:8px;font-size:15px}.conv-out{font-family:ui-monospace,monospace;font-size:15px}.cert-row.exp{border-left:4px solid var(--red)}.cert-row.soon{border-left:4px solid var(--orange)}.poll-opt{display:flex;align-items:center;gap:8px;background:var(--card2);border:1px solid var(--sep2);border-radius:10px;padding:10px 12px;margin-bottom:6px;font-weight:600}.poll-bar{height:8px;background:var(--card3);border-radius:4px;overflow:hidden;margin:4px 0 8px}.poll-bar i{display:block;height:100%;background:var(--grad)}';
document.head.appendChild(st);

// ---------- ДАННЫЕ ----------
var MACHINES=[
{id:'m1',name:'Станок ЧПУ-07',model:'DMU 80',sn:'CNC-2019-007',resp:'Кузнецов П.А.',line:'Цех №3',lastTO:'12.07.2026',nextTO:'12.09.2026',hours:1240,history:[{t:'ТО-2 + замена шпинделя',d:'12.07.2026',by:'Михайлов С.В.'},{t:'Калибровка осей',d:'03.05.2026',by:'Беляев Д.А.'}]},
{id:'m2',name:'Лазерная резка Л-1',model:'TruLaser 3030',sn:'LAS-2020-001',resp:'Михайлов С.В.',line:'Цех №3',lastTO:'01.08.2026',nextTO:'01.11.2026',hours:3120,history:[{t:'Замена линзы + ТО-1',d:'01.08.2026',by:'Михайлов С.В.'}]},
{id:'m3',name:'Сварочный пост Л-2',model:'Fronius TPS',sn:'WLD-2018-002',resp:'Михайлов С.В.',line:'Цех №3',lastTO:'15.06.2026',nextTO:'15.09.2026',hours:5480,history:[{t:'Замена горелки',d:'15.06.2026',by:'Михайлов С.В.'}]}
];
var CERTS=[
{who:'Михайлов С.В.',type:'Электробезопасность (IV гр.)',exp:'2026-08-30'},
{who:'Жуков М.О.',type:'Работа на высоте',exp:'2026-09-02'},
{who:'Кузнецов П.А.',type:'Оператор ЧПУ (5 разряд)',exp:'2026-09-14'},
{who:'Николаева Е.И.',type:'ОТК (визуальный контроль)',exp:'2026-10-20'},
{who:'Тарасов В.П.',type:'Охрана труда (инструктор)',exp:'2027-02-01'}
];
var POLLS=[
{id:'p1',q:'Когда удобнее планёрка?',opts:['08:00','08:30','09:00'],votes:[4,9,6]},
{id:'p2',q:'Нужен ли второй кофе-автомат в цехе №3?',opts:['Да','Нет'],votes:[14,3]}
];

// ---------- СОСТОЯНИЕ ----------
var S22={requests:[],incidents:[],pollVotes:{},clock:{start:null,log:[]},calc:'0',incPhoto:null};
try{var s22=JSON.parse(localStorage.getItem('km22')||'null');if(s22)S22=Object.assign(S22,s22)}catch(e){}
function save22(){try{localStorage.setItem('km22',JSON.stringify({requests:S22.requests,incidents:S22.incidents,pollVotes:S22.pollVotes,clock:S22.clock,calc:S22.calc}))}catch(e){}}
function daysTo(ds){return Math.ceil((new Date(ds).getTime()-Date.now())/86400000)}
function nav22(t){return h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},t),h('div',{class:'nav-sp'}))}
function body22(){return h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}})}

// ---------- КАЛЬКУЛЯТОР ----------
function calcPress(k){var s=S22.calc||'0';
if(k==='C')s='0';
else if(k==='='){try{var ex=s.replace(/×/g,'*').replace(/÷/g,'/');var v=Function('return ('+ex+')')();s=String(Math.round(v*10000)/10000)}catch(e){s='Ошибка'}}
else{s=(s==='0'||s==='Ошибка')?k:s+k}
S22.calc=s;save22();var d=$('#calcDisp');if(d)d.value=s}
function convRow(label,from,to,k){
var inp=h('input',{type:'number',value:'1',class:'conv-inp'});
var out=h('b',{class:'conv-out'});
function calc(){var v=parseFloat(inp.value)||0;var r=(k===null)?v*9/5+32:v*k;out.textContent=r.toFixed(2)+' '+to}
inp.addEventListener('input',calc);calc();
return h('div',{class:'conv-row'},h('div',{class:'conv-l'},h('small',{},label),h('div',{class:'row'},inp,h('span',{class:'txt-sm cl-m'},from))),out)}
function renderCalcPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('🧮 Калькулятор'));
var b=body22();
b.appendChild(h('input',{class:'calc-disp',id:'calcDisp',value:S22.calc||'0',readonly:true}));
var grid=h('div',{class:'calc-grid'});
['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].forEach(function(k){grid.appendChild(h('button',{class:'calc-key'+(isNaN(k)?' op':''),onclick:function(){calcPress(k)}},k))});
b.appendChild(grid);
b.appendChild(h('div',{class:'gtitle'},'КОНВЕРТЕР ВЕЛИЧИН'));
b.appendChild(convRow('Мощность','кВт','л.с.',1.35962));
b.appendChild(convRow('Давление','МПа','кгс/см²',10.1972));
b.appendChild(convRow('Температура','°C','°F',null));
b.appendChild(convRow('Длина','мм','дюйм',0.0393701));
pg.appendChild(b);app.appendChild(pg)}

// ---------- ПАСПОРТА СТАНКОВ ----------
function renderMachinesPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('🔧 Паспорта станков'));
var b=body22();
MACHINES.forEach(function(m){
var d=daysTo(m.nextTO);
b.appendChild(h('div',{class:'tcard press',onclick:function(){state.page='machine:'+m.id;render()}},
h('div',{class:'r1'},h('span',{class:'tid'},m.sn),h('span',{class:'due '+(d<=14?'late':'')},'ТО через '+d+' дн.')),
h('b',{class:'tt'},m.name),
h('div',{class:'desc'},m.model+' · '+m.line+' · отв. '+m.resp),
h('div',{class:'txt-xs cl-m'},'Наработка: '+m.hours+' моточасов')))});
pg.appendChild(b);app.appendChild(pg)}
function renderMachineDetail(app,id){
var m=null;MACHINES.forEach(function(x){if(x.id===id)m=x});
if(!m){state.page=null;render();return}
var pg=h('div',{class:'page on'});pg.appendChild(nav22(m.name));
var b=body22();
b.appendChild(h('div',{class:'tcard'},
h('b',{class:'tt'},m.model),
h('div',{class:'desc'},'S/N: '+m.sn+' · '+m.line),
h('div',{class:'txt-sm cl-m'},'Ответственный: '+m.resp),
h('div',{class:'txt-sm cl-m'},'Последнее ТО: '+m.lastTO+' · Следующее: '+m.nextTO),
h('div',{class:'txt-sm cl-m'},'Наработка: '+m.hours+' моточасов'),
h('button',{class:'btn sm card press mt',onclick:function(){printDoc('passport',m)}},'🖨 Печать паспорта')));
b.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ ОБСЛУЖИВАНИЯ'));
m.history.forEach(function(op){b.appendChild(h('div',{class:'form-op'},h('div',{class:'fo-dot'}),h('div',{class:'fo-t'},h('b',{},op.t),h('small',{},op.by)),h('div',{class:'fo-d'},op.d)))});
pg.appendChild(b);app.appendChild(pg)}

// ---------- ИНЦИДЕНТЫ ----------
function attachIncPhoto(){if(!sbOk){showIsland('Нужен Supabase для фото','warn','o');return}var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async function(){var f=i.files&&i.files[0];if(!f)return;try{var u=await uploadToStorage(f,'inc/'+Date.now()+'_'+uid(),f.type||'image/jpeg');S22.incPhoto=u;var e=$('#incPhotoName');if(e)e.textContent='✅'}catch(e){showIsland('Ошибка фото','warn','o')}};i.click()}
function submitIncident(){
var place=$('#incPlace').value,desc=$('#incDesc').value.trim(),sev=$('#incSev').value;
if(!desc){showIsland('Опишите происшествие','warn','o');return}
S22.incidents.unshift({id:uid(),place:place,desc:desc,sev:sev,who:state.user?state.user.name:'—',date:new Date().toISOString(),photo:S22.incPhoto});
S22.incPhoto=null;save22();
if(sbOk)sb.from('notifications').insert({user_id:'e7',text:'🚨 Инцидент: '+place+' — '+desc.slice(0,40),type:'task'});
showIsland('Инцидент зарегистрирован','warn','o');vib(20);state.page='incident';render()}
function renderIncidentPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('🚨 Инцидент'));
var b=body22();
var f=h('div',{class:'card',style:{padding:'14px'}});
var sel=h('select',{id:'incPlace'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5'].forEach(function(a){sel.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Место'),sel));
f.appendChild(h('div',{class:'fld'},h('label',{},'Что случилось *'),h('textarea',{id:'incDesc',rows:'3',placeholder:'Описание…'})));
var sv=h('select',{id:'incSev'});sv.appendChild(h('option',{value:'minor'},'Незначительное'));sv.appendChild(h('option',{value:'major'},'Серьёзное'));sv.appendChild(h('option',{value:'crit'},'Критическое'));
f.appendChild(h('div',{class:'fld'},h('label',{},'Серьёзность'),sv));
f.appendChild(h('div',{class:'row',style:{gap:'8px',marginBottom:'12px'}},h('button',{class:'btn sm card press',onclick:attachIncPhoto},'📷 Фото'),h('span',{class:'txt-sm cl-m',id:'incPhotoName'},'нет фото')));
f.appendChild(h('button',{class:'btn w full press',onclick:submitIncident},'⚠️ Сообщить в ОТ'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ЖУРНАЛ · '+S22.incidents.length));
S22.incidents.forEach(function(r){b.appendChild(h('div',{class:'tcard'},h('div',{class:'r1'},h('span',{class:'tag '+(r.sev==='crit'?'tg-r':r.sev==='major'?'tg-o':'tg-g')},r.sev==='crit'?'Критич.':r.sev==='major'?'Серьёзн.':'Незнач.'),h('span',{class:'due'},fmtDT(r.date))),h('b',{class:'tt'},r.place),h('div',{class:'desc'},r.desc),h('div',{class:'txt-xs cl-m'},'👤 '+r.who)))});
pg.appendChild(b);app.appendChild(pg)}

// ---------- ЗАЯВКИ НА ЗАПЧАСТИ ----------
var REQ_ST=['новая','в работе','выдано'];
function submitRequest(){
var name=$('#reqName').value.trim(),qty=parseInt($('#reqQty').value)||1,unit=$('#reqUnit').value,urg=$('#reqUrg').checked;
if(!name){showIsland('Укажите позицию','warn','o');return}
S22.requests.unshift({id:uid(),name:name,qty:qty,unit:unit,urg:urg,st:0,date:new Date().toISOString()});
save22();if(sbOk&&state.user)sb.from('notifications').insert({user_id:'e9',text:'📦 Заявка: '+name+' × '+qty+' '+unit,type:'task'});
showIsland('Заявка создана','check','g');vib(15);state.page='parts';render()}
function renderPartsPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('📦 Заявки на запчасти'));
var b=body22();
var f=h('div',{class:'card',style:{padding:'14px'}});
f.appendChild(h('div',{class:'fld'},h('label',{},'Позиция *'),h('input',{id:'reqName',placeholder:'Например: Форсунка Д49'})));
f.appendChild(h('div',{class:'row'},h('div',{class:'fld',style:{flex:'1'}},h('label',{},'Кол-во'),h('input',{id:'reqQty',type:'number',value:'1'})),h('div',{class:'fld',style:{flex:'1'}},h('label',{},'Ед.'),h('input',{id:'reqUnit',value:'шт'}))));
f.appendChild(h('label',{class:'check'},h('input',{type:'checkbox',id:'reqUrg'}),h('span',{},'Срочно')));
f.appendChild(h('button',{class:'btn b full press',onclick:submitRequest},'Создать заявку'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'МОИ ЗАЯВКИ · '+S22.requests.length));
S22.requests.forEach(function(r,i){
b.appendChild(h('div',{class:'tcard press',onclick:function(){S22.requests[i].st=(r.st+1)%3;save22();render()}},
h('div',{class:'r1'},h('span',{class:'tag '+(r.st===2?'tg-g':r.st===1?'tg-o':'tg-b')},REQ_ST[r.st]),r.urg?h('span',{class:'tag tg-r'},'Срочно'):null,h('span',{class:'due'},fmtDT(r.date))),
h('b',{class:'tt'},r.name),
h('div',{class:'txt-sm cl-m'},r.qty+' '+r.unit+' · тап — сменить статус')))});
pg.appendChild(b);app.appendChild(pg)}

// ---------- УДОСТОВЕРЕНИЯ ----------
function renderCertsPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('📚 Удостоверения'));
var b=body22();
CERTS.slice().sort(function(a,c){return new Date(a.exp)-new Date(c.exp)}).forEach(function(c){
var d=daysTo(c.exp);var cls=d<0?'exp':d<=30?'soon':'';
b.appendChild(h('div',{class:'scard cert-row '+cls},
h('div',{class:'ava b3'},'📚'),
h('div',{style:{flex:'1',minWidth:'0'}},h('b',{},c.who),h('small',{},c.type),h('small',{class:'cl-gr txt-xs'},'до '+new Date(c.exp).toLocaleDateString('ru-RU'))),
h('span',{class:'txt-sm '+(d<0?'cl-r':d<=30?'cl-o':'cl-g'),style:{fontWeight:'700'}},d<0?'истекло':d+' дн.')))});
pg.appendChild(b);app.appendChild(pg)}

// ---------- ОПРОСЫ ----------
function votePoll(p,oi){if(S22.pollVotes[p.id]!==undefined)return;S22.pollVotes[p.id]=oi;p.votes[oi]++;save22();vib(10);render()}
function renderPollsPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('🗳 Опросы'));
var b=body22();
POLLS.forEach(function(p){
var voted=S22.pollVotes[p.id];var total=p.votes.reduce(function(a,c){return a+c},0)||1;
var card=h('div',{class:'card',style:{padding:'14px'}});
card.appendChild(h('b',{style:{display:'block',marginBottom:'10px'}},p.q));
p.opts.forEach(function(o,oi){
if(voted===undefined){card.appendChild(h('button',{class:'poll-opt press',onclick:function(){votePoll(p,oi)}},o))}
else{var pct=Math.round(p.votes[oi]/total*100);
card.appendChild(h('div',{},h('div',{class:'row between'},h('span',{class:'txt-sm',style:{fontWeight:'600'}},o+(voted===oi?' ✅':'')),h('span',{class:'txt-sm cl-m'},pct+'%')),h('div',{class:'poll-bar'},h('i',{style:{width:pct+'%'}}))))}});
b.appendChild(card)});
pg.appendChild(b);app.appendChild(pg)}

// ---------- МОЙ ДЕНЬ ----------
function clockToggle(){var c=S22.clock;
if(c.start){var hrs=Math.round((Date.now()-c.start)/360000)/100;c.log.unshift({d:new Date().toISOString(),h:hrs});c.start=null;showIsland('Смена: '+hrs+' ч','check','g')}
else{c.start=Date.now();showIsland('Смена начата ⏱','clock','b')}
save22();render()}
function renderMyDayPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('📊 Мой день'));
var b=body22();
var c=S22.clock;
b.appendChild(h('div',{class:'card',style:{padding:'14px'}},
h('div',{class:'row between'},h('b',{},'⏱ Отметка о смене'),h('button',{class:'btn sm '+(c.start?'w':'b')+' press',onclick:clockToggle},c.start?'⏹ Завершить':'⏱ Начать')),
h('div',{class:'txt-sm cl-m mt'},c.start?'Идёт смена с '+new Date(c.start).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):'Смена не начата')));
var today=new Date().toDateString();
var tToday=(state.tasks||[]).filter(function(t){return t.due&&new Date(t.due).toDateString()===today});
var eToday=(state.events||[]).filter(function(e){return new Date(e.date).toDateString()===today});
var unread=(state.notifs||[]).filter(function(n){return !n.read}).length;
var warns=0;for(var k in state.telemetry)if(state.telemetry[k].status==='warn')warns++;
b.appendChild(h('div',{class:'kpi-grid'},
h('div',{class:'kpi blue'},h('small',{},'Задач сегодня'),h('b',{},String(tToday.length))),
h('div',{class:'kpi green'},h('small',{},'Мероприятий'),h('b',{},String(eToday.length))),
h('div',{class:'kpi orange'},h('small',{},'Непрочит.'),h('b',{},String(unread))),
h('div',{class:'kpi red'},h('small',{},'Линии ⚠️'),h('b',{},String(warns)))));
b.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ СМЕН'));
c.log.slice(0,5).forEach(function(l){b.appendChild(h('div',{class:'scard'},h('div',{class:'ava b1'},'⏱'),h('div',{style:{flex:'1'}},h('b',{},l.h+' ч'),h('small',{},fmtDT(l.d)))))});
pg.appendChild(b);app.appendChild(pg)}

// ---------- ПЕЧАТЬ ----------
function printDoc(type,extra){
var t='АО «КОЛОМЕНСКИЙ ЗАВОД»\n';
if(type==='permit'){t+='\nНАРЯД-ДОПУСК №НД-203\n\nВид работ: Огневые работы\nМесто: Цех №3, пост сварки\nОтветственный: Михайлов С.В.\nСрок: 1 смена\n\nМеры безопасности:\n1. Очистить площадку от горючих материалов.\n2. Обеспечить огнетушитель и наблюдающего.\n3. Проверить загазованность.\n\nПодписи: ____________'}
else if(type==='shift'){t+='\nЖУРНАЛ ПЕРЕДАЧИ СМЕНЫ\n\nДата: '+new Date().toLocaleDateString('ru-RU')+'\nСдал: '+(state.user?state.user.name:'—')+'\n\nСостояние линий: Л-1 норма, Л-2 ВНИМАНИЕ (темп.), Л-3 норма, Л-5 норма, ЧПУ-07 норма.\nЗамечания: ________________________\n\nПодпись: ____________'}
else if(type==='passport'&&extra){t+='\nПАСПОРТ ОБОРУДОВАНИЯ\n\n'+extra.name+' ('+extra.model+')\nS/N: '+extra.sn+'\nЛиния: '+extra.line+'\nОтветственный: '+extra.resp+'\nНаработка: '+extra.hours+' моточасов\nПоследнее ТО: '+extra.lastTO+'\nСледующее ТО: '+extra.nextTO+'\n\nИстория:\n'+extra.history.map(function(o){return '— '+o.d+' '+o.t+' ('+o.by+')'}).join('\n')}
var w=window.open('','_blank');
if(!w){showIsland('Разрешите всплывающие окна','warn','o');return}
w.document.write('<pre style="font-family:Arial;font-size:13px;white-space:pre-wrap;padding:24px">'+t+'</pre>');
w.document.close();setTimeout(function(){w.print()},300)}
function renderPrintPage(app){
var pg=h('div',{class:'page on'});pg.appendChild(nav22('🖨 Печать форм'));
var b=body22();
b.appendChild(h('button',{class:'btn b full press mb',onclick:function(){printDoc('permit')}},'📄 Наряд-допуск'));
b.appendChild(h('button',{class:'btn g full press mb',onclick:function(){printDoc('shift')}},'📒 Журнал передачи смены'));
b.appendChild(h('button',{class:'btn card full press',onclick:function(){printDoc('passport',MACHINES[0])}},'🔧 Паспорт станка (ЧПУ-07)'));
pg.appendChild(b);app.appendChild(pg)}

// ---------- МЕНЮ + РОУТИНГ ----------
var V22=[
['🧮','Калькулятор','Конвертер величин',function(){go22('calc')}],
['🔧','Паспорта станков','Машины и ТО',function(){go22('machines')}],
['🚨','Инцидент','Сообщить в ОТ',function(){go22('incident')},'r'],
['📦','Заявка на запчасти','Склад',function(){go22('parts')}],
['📚','Удостоверения','Сроки допусков',function(){go22('certs')}],
['🗳','Опросы','Голосования',function(){go22('polls')}],
['📊','Мой день','Личная сводка',function(){go22('myday')}],
['🖨','Печать форм','Наряд, журнал',function(){go22('print')}]
];
function go22(p){closeHub();state.page=p;render()}
var _oh=openHub;
openHub=function(){_oh();var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v22 · Инструменты'));
V22.forEach(function(it){sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'+(it[4]?' '+it[4]:'')},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')))});
b.appendChild(sec)};
var _rpo=renderPageOverlay;
renderPageOverlay=function(app){
if(state.page==='calc'){renderCalcPage(app);return}
if(state.page==='machines'){renderMachinesPage(app);return}
if(state.page.indexOf('machine:')===0){renderMachineDetail(app,state.page.split(':')[1]);return}
if(state.page==='incident'){renderIncidentPage(app);return}
if(state.page==='parts'){renderPartsPage(app);return}
if(state.page==='certs'){renderCertsPage(app);return}
if(state.page==='polls'){renderPollsPage(app);return}
if(state.page==='myday'){renderMyDayPage(app);return}
if(state.page==='print'){renderPrintPage(app);return}
_rpo(app)};

// Напоминание о допусках
setTimeout(function(){var soon=CERTS.filter(function(c){var d=daysTo(c.exp);return d>=0&&d<=30});if(soon.length&&state.user)showIsland('📚 Допусков истекает: '+soon.length,'warn','o',5000)},5000);
})();