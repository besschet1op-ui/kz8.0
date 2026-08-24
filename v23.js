/* ===== КМ·ИНЖЕНЕР v23 — оверлей ===== */
(function(){
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.calc-disp{width:100%;background:var(--card2);border:1px solid var(--sep);border-radius:12px;padding:14px;font-size:22px;font-family:ui-monospace,monospace;text-align:right;margin-bottom:10px}'+
'.calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}'+
'.calc-key{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:14px 0;font-size:18px;font-weight:700}'+
'.calc-key.op{background:var(--accent-soft,rgba(10,132,255,.14));color:var(--accent,var(--blue))}'+
'.conv-row{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:13px}'+
'.conv-row input{width:80px;background:var(--card2);border:1px solid var(--sep);border-radius:8px;padding:8px;font-size:14px}'+
'.conv-row b{margin-left:auto;font-family:ui-monospace,monospace}'+
'.cert-row{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}'+
'.cert-row .days{margin-left:auto;font-weight:700;font-size:12px}'+
'.poll-opt{display:flex;align-items:center;gap:8px;background:var(--card2);border:1px solid var(--sep2);border-radius:10px;padding:10px 12px;margin-bottom:6px;font-weight:600}'+
'.poll-bar{height:8px;background:var(--card3);border-radius:4px;overflow:hidden;margin:4px 0 8px}'+
'.poll-bar i{display:block;height:100%;background:var(--grad,linear-gradient(135deg,#0a84ff,#0055d4))}'+
'.req-row{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}'+
'.clock-big{font-family:"Russo One";font-size:44px;text-align:center;padding:20px 0}';
document.head.appendChild(st);

// ---------- ДАННЫЕ ----------
var BIRTHDAYS={'100123':'02.10','100127':'08.25','100131':'08.30','100133':'09.02'};
var CERTS=[
{who:'Кузнецов П.А.',type:'Оператор ЧПУ (5 разряд)',exp:'2026-09-14'},
{who:'Михайлов С.В.',type:'Электробезопасность (IV гр.)',exp:'2026-08-30'},
{who:'Тарасов В.П.',type:'Охрана труда (инструктор)',exp:'2027-02-01'},
{who:'Жуков М.О.',type:'Работа на высоте',exp:'2026-10-05'}
];
var POLLS=[
{id:'p1',q:'Когда удобнее планёрка?',opts:['08:00','08:30','09:00'],votes:[4,9,6]},
{id:'p2',q:'Нужен ли второй кофе-автомат в цехе №3?',opts:['Да','Нет'],votes:[14,3]}
];

// ---------- СОСТОЯНИЕ ----------
var S23={requests:[],incidents:[],clock:{start:null,log:[]},pollVotes:{}};
try{var _s=JSON.parse(localStorage.getItem('km23')||'null');if(_s)S23=Object.assign(S23,_s)}catch(e){}
function save23(){try{localStorage.setItem('km23',JSON.stringify(S23))}catch(e){}}
var calcBuf='';

// ---------- ДНИ РОЖДЕНИЯ ----------
setTimeout(function(){
var t=now(),dd=('0'+t.getDate()).slice(-2)+'.'+('0'+(t.getMonth()+1)).slice(-2);
(state.employees||[]).forEach(function(e){if(BIRTHDAYS[e.badge]===dd)showIsland('🎂 Сегодня: '+e.name,'gift','w',6000)});
},3000);

// ---------- КАЛЬКУЛЯТОР ----------
function calcEval(x){try{var c=x.replace(/[^0-9+\-*/.()]/g,'');if(!c)return'';var v=Function('return ('+c+')')();return String(Math.round(v*10000)/10000)}catch(e){return'Ошибка'}}
function renderCalcPage(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🧮 Калькулятор'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var disp=h('div',{class:'calc-disp'},calcBuf||'0');
b.appendChild(disp);
var g=h('div',{class:'calc-grid'});
['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].forEach(function(k){
g.appendChild(h('button',{class:'calc-key press'+(isNaN(k)?' op':''),onclick:function(){
if(k==='C')calcBuf='';else if(k==='='){calcBuf=calcEval(calcBuf)}else calcBuf+=k;
disp.textContent=calcBuf||'0';
}},k));
});
b.appendChild(g);
b.appendChild(h('div',{class:'gtitle'},'КОНВЕРТЕР ИНЖЕНЕРА'));
function conv(label,fn){var inp=h('input',{type:'number',value:'1',oninput:function(){out.textContent=fn(parseFloat(inp.value)||0)}});var out=h('b',{},fn(1));var r=h('div',{class:'conv-row'},h('span',{},label),inp,out);return r}
b.appendChild(conv('кВт → л.с.',function(v){return(v*1.341).toFixed(2)+' л.с.'}));
b.appendChild(conv('МПа → кгс/см²',function(v){return(v*10.197).toFixed(2)}));
b.appendChild(conv('°C → °F',function(v){return(v*9/5+32).toFixed(1)+' °F'}));
b.appendChild(conv('мм → дюйм',function(v){return(v*0.03937).toFixed(4)+'"'}));
pg.appendChild(b);
}

// ---------- ИНЦИДЕНТЫ ----------
function renderIncidentPage(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🚨 Инцидент'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
var pl=h('select',{id:'incPlace'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5'].forEach(function(a){pl.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Место'),pl));
f.appendChild(h('div',{class:'fld'},h('label',{},'Что случилось *'),h('textarea',{id:'incDesc',rows:'3'})));
var sv=h('select',{id:'incSev'});sv.appendChild(h('option',{value:'minor'},'Незначительное'));sv.appendChild(h('option',{value:'major'},'Серьёзное'));sv.appendChild(h('option',{value:'crit'},'Критическое'));
f.appendChild(h('div',{class:'fld'},h('label',{},'Серьёзность'),sv));
f.appendChild(h('button',{class:'btn w full press',onclick:function(){
var d=$('#incDesc').value.trim();if(!d){showIsland('Опишите инцидент','warn','o');return}
S23.incidents.unshift({place:$('#incPlace').value,desc:d,sev:$('#incSev').value,who:state.user?state.user.name:'—',date:new Date().toISOString()});
save23();
if(sbOk&&state.user)sb.from('notifications').insert({user_id:'e7',text:'🚨 Инцидент: '+$('#incPlace').value+' — '+d.slice(0,40),type:'task'});
showIsland('Инцидент зарегистрирован','warn','o');vib(20);render();
}},'⚠️ Сообщить в ОТ'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ЖУРНАЛ · '+S23.incidents.length));
S23.incidents.forEach(function(r){b.appendChild(h('div',{class:'req-row'},h('div',{class:'r1'},h('span',{class:'tag '+(r.sev==='crit'?'tg-r':r.sev==='major'?'tg-o':'tg-g')},r.sev==='crit'?'Критич.':r.sev==='major'?'Серьёзн.':'Незнач.'),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.date))),h('b',{style:{display:'block',margin:'6px 0'}},r.place),h('div',{class:'txt-sm cl-m'},r.desc),h('div',{class:'txt-xs cl-gr'},'👤 '+r.who)))});
pg.appendChild(b);
}

// ---------- ЗАЯВКИ НА ЗАПЧАСТИ ----------
function renderPartsPage(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📦 Заявки'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
f.appendChild(h('div',{class:'fld'},h('label',{},'Позиция *'),h('input',{id:'reqName',placeholder:'Например: Форсунка Д49'})));
f.appendChild(h('div',{class:'row'},h('div',{class:'fld',style:{flex:'1'}},h('label',{},'Кол-во'),h('input',{id:'reqQty',type:'number',value:'1'})),h('div',{class:'fld',style:{flex:'1'}},h('label',{},'Ед.'),h('input',{id:'reqUnit',value:'шт'}))));
f.appendChild(h('label',{class:'check'},h('input',{type:'checkbox',id:'reqUrg'}),h('span',{},'Срочно')));
f.appendChild(h('button',{class:'btn b full press',onclick:function(){
var n=$('#reqName').value.trim();if(!n){showIsland('Укажите позицию','warn','o');return}
S23.requests.unshift({name:n,qty:parseInt($('#reqQty').value)||1,unit:$('#reqUnit').value,urg:$('#reqUrg').checked,st:0,date:new Date().toISOString()});
save23();
if(sbOk&&state.user)sb.from('notifications').insert({user_id:'e9',text:'📦 Заявка: '+n,type:'task'});
showIsland('Заявка создана','check','g');vib(15);render();
}},'Создать заявку'));
b.appendChild(f);
b.appendChild(h('div',{class:'txt-xs cl-gr mb'},'Тап по заявке — сменить статус'));
var ST=['новая','в работе','выдано'];
S23.requests.forEach(function(r,i){
b.appendChild(h('div',{class:'req-row press',onclick:function(){S23.requests[i].st=(r.st+1)%3;save23();render()}},
h('div',{class:'r1'},h('span',{class:'tag '+(r.st===2?'tg-g':r.st===1?'tg-o':'tg-b')},ST[r.st]),r.urg?h('span',{class:'tag tg-r'},'Срочно'):null,h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.date))),
h('b',{style:{display:'block',margin:'6px 0'}},r.name),h('div',{class:'txt-sm cl-m'},r.qty+' '+r.unit)));
});
pg.appendChild(b);
}

// ---------- УДОСТОВЕРЕНИЯ ----------
function renderCertsPage(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📚 Допуски'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
CERTS.forEach(function(c){
var days=Math.ceil((new Date(c.exp).getTime()-Date.now())/86400000);
var cls=days<0?'cl-r':days<=30?'cl-o':'cl-g';
b.appendChild(h('div',{class:'cert-row'},h('div',{class:'ava b3',style:{width:'36px',height:'36px',fontSize:'12px'}},'📚'),h('div',{style:{flex:'1'}},h('b',{style:{fontSize:'13px'}},c.who),h('small',{},c.type)),h('span',{class:'days '+cls},days<0?'истекло':days+' дн.')));
});
pg.appendChild(b);
}

// ---------- ОПРОСЫ ----------
function renderPollsPage(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🗳 Опросы'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
POLLS.forEach(function(p){
var card=h('div',{class:'card',style:{padding:'14px'}});
card.appendChild(h('b',{style:{display:'block',marginBottom:'10px'}},p.q));
var voted=S23.pollVotes[p.id];
var total=p.votes.reduce(function(a,c){return a+c},0)||1;
p.opts.forEach(function(o,oi){
if(voted===undefined){
card.appendChild(h('button',{class:'poll-opt press',onclick:function(){S23.pollVotes[p.id]=oi;p.votes[oi]++;save23();vib(10);render()}},o));
}else{
var pct=Math.round(p.votes[oi]/total*100);
card.appendChild(h('div',{},h('div',{class:'row between'},h('span',{class:'txt-sm',style:{fontWeight:'600'}},o+(voted===oi?' ✅':'')),h('span',{class:'txt-sm cl-m'},pct+'%')),h('div',{class:'poll-bar'},h('i',{style:{width:pct+'%'}}))))
}
});
b.appendChild(card);
});
pg.appendChild(b);
}

// ---------- ОТМЕТКА О СМЕНЕ ----------
function renderClockPage(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'⏱ Смена'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var c=S23.clock;
if(c.start){
var hrs=((Date.now()-c.start)/3600000);
b.appendChild(h('div',{class:'clock-big cl-g'},hrs.toFixed(1)+' ч'));
b.appendChild(h('button',{class:'btn w full press',onclick:function(){var h2=Math.round((Date.now()-c.start)/360000)/100;c.log.unshift({d:new Date().toISOString(),h:h2});c.start=null;save23();showIsland('Смена: '+h2+' ч','check','g');render()}},'⏹ Завершить смену'));
}else{
b.appendChild(h('div',{class:'clock-big cl-m'},'—'));
b.appendChild(h('button',{class:'btn g full press',onclick:function(){c.start=Date.now();save23();showIsland('Смена начата ⏱','clock','b');render()}},'⏱ Начать смену'));
}
b.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ'));
c.log.slice(0,7).forEach(function(l){b.appendChild(h('div',{class:'req-row'},h('b',{},l.h+' ч'),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(l.d))))});
pg.appendChild(b);
}

// ---------- ПЕЧАТЬ ----------
function printHTML(title,bodyHTML){
var w=window.open('','_blank');
if(!w){showIsland('Разрешите всплывающие окна','warn','o');return}
w.document.write('<html><head><meta charset="utf-8"><title>'+title+'</title><style>body{font-family:Arial;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:6px;font-size:12px}</style></head><body>'+bodyHTML+'</body></html>');
w.document.close();setTimeout(function(){w.print()},300);
}
function renderPrintPage(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🖨 Печать'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
b.appendChild(h('button',{class:'btn b full press mb',onclick:function(){
printHTML('Наряд-допуск','<h1>НАРЯД-ДОПУСК №НД-203</h1><table><tr><td>Вид работ</td><td>Огневые работы</td></tr><tr><td>Место</td><td>Цех №3</td></tr><tr><td>Ответственный</td><td>Михайлов С.В.</td></tr><tr><td>Дата</td><td>'+now().toLocaleDateString('ru-RU')+'</td></tr></table><p>Меры безопасности: 1. Очистить площадку. 2. Обеспечить огнетушитель. 3. Назначить наблюдающего.</p><p>Подписи: ____________</p>');
}},'📄 Наряд-допуск'));
b.appendChild(h('button',{class:'btn g full press mb',onclick:function(){
printHTML('Журнал смены','<h1>ЖУРНАЛ ПЕРЕДАЧИ СМЕНЫ</h1><p>Дата: '+now().toLocaleDateString('ru-RU')+'</p><p>Сдал: '+(state.user?state.user.name:'—')+'</p><p>Состояние линий: Л-1 норма, Л-2 ВНИМАНИЕ, Л-3 норма, Л-5 норма, ЧПУ-07 норма.</p><p>Замечания: ______________________</p><p>Подпись: ____________</p>');
}},'📒 Журнал смены'));
pg.appendChild(b);
}

// ---------- МЕНЮ + РОУТИНГ ----------
var _oh23=openHub;
openHub=function(){
_oh23();
var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v23 · Инструменты'));
[['🧮','Калькулятор','Конвертер инженера',function(){closeHub();state.page='calc';render()}],
['🚨','Инцидент','Сообщить в ОТ',function(){closeHub();state.page='incident';render()},'r'],
['📦','Заявки','Запчасти со склада',function(){closeHub();state.page='parts';render()}],
['📚','Допуски','Сроки удостоверений',function(){closeHub();state.page='certs';render()}],
['🗳','Опросы','Голосования',function(){closeHub();state.page='polls';render()}],
['⏱','Смена','Отметка времени',function(){closeHub();state.page='clock';render()},'g'],
['🖨','Печать','Наряд, журнал',function(){closeHub();state.page='print';render()},'w']
].forEach(function(it){
sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'+(it[4]?' '+it[4]:'')},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')));
});
b.appendChild(sec);
};
var _rpo23=renderPageOverlay;
renderPageOverlay=function(app){
if(state.page==='calc'){var pg=h('div',{class:'page on'});renderCalcPage(pg);app.appendChild(pg);return}
if(state.page==='incident'){var pg=h('div',{class:'page on'});renderIncidentPage(pg);app.appendChild(pg);return}
if(state.page==='parts'){var pg=h('div',{class:'page on'});renderPartsPage(pg);app.appendChild(pg);return}
if(state.page==='certs'){var pg=h('div',{class:'page on'});renderCertsPage(pg);app.appendChild(pg);return}
if(state.page==='polls'){var pg=h('div',{class:'page on'});renderPollsPage(pg);app.appendChild(pg);return}
if(state.page==='clock'){var pg=h('div',{class:'page on'});renderClockPage(pg);app.appendChild(pg);return}
if(state.page==='print'){var pg=h('div',{class:'page on'});renderPrintPage(pg);app.appendChild(pg);return}
_rpo23(app);
};
})();