/* ===== КМ·ИНЖЕНЕР v24 — заявки, безопасность, схема, смены, эскалация ===== */
(function(){
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.appr-row{background:var(--card);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:8px}'+
'.zone-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}'+
'.zone-node{background:var(--card);border:1px solid var(--sep2);border-left:4px solid var(--green);border-radius:14px;padding:12px;text-align:left}'+
'.zone-node.warn{border-left-color:var(--orange)}.zone-node.sel{border-color:var(--blue);box-shadow:0 0 0 2px rgba(10,132,255,.2)}'+
'.zone-node b{font-size:13px;display:block}.zone-node small{font-size:11px;color:var(--label2)}'+
'.ab-day{display:flex;flex-direction:column;align-items:center;background:var(--card);border:1px solid var(--sep2);border-radius:10px;padding:6px 0}'+
'.ab-day .ab{font-family:"Russo One";font-size:14px;color:var(--violet)}.ab-day small{font-size:9px;color:var(--label3)}'+
'.sig-box{background:rgba(40,179,107,.1);border:1px solid rgba(40,179,107,.3);border-radius:12px;padding:10px 12px;font-size:12px;margin-top:8px}';
document.head.appendChild(st);

// ---------- СОСТОЯНИЕ ----------
var S24={approvals:[],nearmiss:[],handovers:[],shiftOv:{},esc:{}};
try{var _s=JSON.parse(localStorage.getItem('km24')||'null');if(_s)S24=Object.assign(S24,_s)}catch(e){}
function save24(){try{localStorage.setItem('km24',JSON.stringify(S24))}catch(e){}}
function isBoss(){return state.user&&['director','deputy','chiefeng'].indexOf(state.user.role)>=0}
function nav24(t){return h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},t),h('div',{class:'nav-sp'}))}
function body24(){return h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}})}

// ---------- 1. ЗАЯВКИ НА СОГЛАСОВАНИЕ ----------
function submitApproval(){
var type=$('#apType').value,from=$('#apFrom').value,to=$('#apTo').value,com=$('#apCom').value.trim();
if(!from||!to){showIsland('Укажите даты','warn','o');return}
S24.approvals.unshift({id:uid(),type:type,from:from,to:to,com:com,who:state.user?state.user.name:'—',whoId:state.user?state.user.id:null,st:'pending',date:new Date().toISOString()});
save24();
if(sbOk)sb.from('notifications').insert({user_id:'e1',text:'📄 Заявка ('+type+'): '+com.slice(0,40),type:'task'});
showIsland('Заявка отправлена','check','g');vib(15);render();
}
function setApproval(id,res){
var a=S24.approvals.find(function(x){return x.id===id});if(!a)return;
a.st=res;a.by=state.user.name;save24();
if(sbOk&&a.whoId)sb.from('notifications').insert({user_id:a.whoId,text:(res==='ok'?'✅ Одобрено':'❌ Отклонено')+': '+a.type,type:'task'});
vib(15);render();
}
function renderApprPage(pg){
pg.appendChild(nav24('📄 Согласования'));
var b=body24();
var f=h('div',{class:'card',style:{padding:'14px'}});
var ty=h('select',{id:'apType'});['Отпуск','Командировка','Пропуск'].forEach(function(t){ty.appendChild(h('option',{value:t},t))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Тип'),ty));
f.appendChild(h('div',{class:'row'},h('div',{class:'fld',style:{flex:'1'}},h('label',{},'С'),h('input',{id:'apFrom',type:'date'})),h('div',{class:'fld',style:{flex:'1'}},h('label',{},'По'),h('input',{id:'apTo',type:'date'}))));
f.appendChild(h('div',{class:'fld'},h('label',{},'Комментарий'),h('input',{id:'apCom',placeholder:'Причина…'})));
f.appendChild(h('button',{class:'btn b full press',onclick:submitApproval},'Отправить'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ЗАЯВКИ · '+S24.approvals.length));
S24.approvals.forEach(function(a){
var card=h('div',{class:'appr-row'},
h('div',{class:'r1'},h('span',{class:'tag '+(a.st==='ok'?'tg-g':a.st==='no'?'tg-r':'tg-o')},a.st==='ok'?'Одобрено':a.st==='no'?'Отклонено':'На согласовании'),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(a.date))),
h('b',{style:{display:'block',margin:'6px 0'}},a.type+' · '+a.who),
h('div',{class:'txt-sm cl-m'},new Date(a.from).toLocaleDateString('ru-RU')+' — '+new Date(a.to).toLocaleDateString('ru-RU')+(a.com?' · '+a.com:'')));
if(isBoss()&&a.st==='pending'){
card.appendChild(h('div',{class:'row',style:{gap:'8px',marginTop:'8px'}},
h('button',{class:'btn sm g press',onclick:function(){setApproval(a.id,'ok')}},'✅ Одобрить'),
h('button',{class:'btn sm card press',style:{color:'var(--red)'},onclick:function(){setApproval(a.id,'no')}},'❌ Отклонить')));
}
card.appendChild(h('button',{class:'btn sm card press mt',onclick:function(){print24('req',a)}},'🖨 Печать'));
b.appendChild(card);
});
pg.appendChild(b);
}

// ---------- 2. КАРТОЧКИ БЕЗОПАСНОСТИ (near-miss) ----------
var nmPhoto=null;
function attachNmPhoto(){if(!sbOk){showIsland('Нужен Supabase для фото','warn','o');return}var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async function(){var f=i.files&&i.files[0];if(!f)return;try{nmPhoto=await uploadToStorage(f,'safety/'+Date.now()+'_'+uid(),f.type||'image/jpeg');var e=$('#nmPhotoName');if(e)e.textContent='✅'}catch(e){}};i.click()}
function submitNearMiss(){
var place=$('#nmPlace').value,desc=$('#nmDesc').value.trim();
if(!desc){showIsland('Опишите наблюдение','warn','o');return}
S24.nearmiss.unshift({id:uid(),place:place,desc:desc,who:state.user?state.user.name:'—',date:new Date().toISOString(),photo:nmPhoto});
nmPhoto=null;save24();
if(sbOk)sb.from('notifications').insert({user_id:'e7',text:'🛡 Near-miss: '+place+' — '+desc.slice(0,40),type:'task'});
showIsland('Отправлено в ОТ 🛡','check','g');vib(20);render();
}
function renderNearPage(pg){
pg.appendChild(nav24('🛡 Безопасность'));
var b=body24();
var f=h('div',{class:'card',style:{padding:'14px'}});
var pl=h('select',{id:'nmPlace'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5','Склад'].forEach(function(a){pl.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Место'),pl));
f.appendChild(h('div',{class:'fld'},h('label',{},'Наблюдение *'),h('textarea',{id:'nmDesc',rows:'3',placeholder:'Что могло привести к инциденту…'})));
f.appendChild(h('div',{class:'row',style:{gap:'8px',marginBottom:'12px'}},h('button',{class:'btn sm card press',onclick:attachNmPhoto},'📷 Фото'),h('span',{class:'txt-sm cl-m',id:'nmPhotoName'},'нет фото')));
f.appendChild(h('button',{class:'btn g full press',onclick:submitNearMiss},'🛡 Отправить в ОТ'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'НАБЛЮДЕНИЯ · '+S24.nearmiss.length));
S24.nearmiss.forEach(function(r){
var c=h('div',{class:'appr-row'},h('div',{class:'r1'},h('span',{class:'tag tg-g'},r.place),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(r.date))),h('div',{class:'txt-sm'},r.desc),h('div',{class:'txt-xs cl-gr mt'},'👤 '+r.who));
if(r.photo)c.appendChild(h('img',{src:r.photo,style:{width:'100%',borderRadius:'10px',marginTop:'6px'}}));
b.appendChild(c);
});
pg.appendChild(b);
}

// ---------- 3. СХЕМА ЗАВОДА ----------
var ZONES=[
{id:'L1',name:'Линия Л-1',tel:'Л-1',resp:'e5'},{id:'L2',name:'Линия Л-2',tel:'Л-2',resp:'e5'},
{id:'L3',name:'Линия Л-3',tel:'Л-3',resp:'e11'},{id:'L5',name:'Линия Л-5',tel:'Л-5',resp:'e5'},
{id:'CNC',name:'ЧПУ-07',tel:'ЧПУ-07',resp:'e11'},{id:'WH',name:'📦 Склад',resp:'e9'},
{id:'OTK',name:'🔍 ОТК',resp:'e6'},{id:'SAFE',name:'🛡 Охрана труда',resp:'e7'}
];
var selZone=null;
function renderSchema24(pg){
pg.appendChild(nav24('🗺 Схема завода'));
var b=body24();
var g=h('div',{class:'zone-grid'});
ZONES.forEach(function(z){
var warn=z.tel&&state.telemetry[z.tel]&&state.telemetry[z.tel].status==='warn';
g.appendChild(h('button',{class:'zone-node press'+(warn?' warn':'')+(selZone===z.id?' sel':''),onclick:function(){selZone=z.id;render()}},
h('b',{},z.name),h('small',{},warn?'⚠️ внимание':'✅ норма')));
});
b.appendChild(g);
if(selZone){
var z=null;ZONES.forEach(function(x){if(x.id===selZone)z=x});
if(z){
var resp=null;state.employees.forEach(function(e){if(e.id===z.resp)resp=e});
var card=h('div',{class:'card',style:{padding:'14px'}});
card.appendChild(h('b',{style:{display:'block',marginBottom:'8px'}},z.name));
if(z.tel&&state.telemetry[z.tel]){var t=state.telemetry[z.tel];card.appendChild(h('div',{class:'txt-sm cl-m mb'},Math.round(t.temp)+'°C · нагрузка '+Math.round(t.load)+'%'))}
if(resp){
card.appendChild(h('div',{class:'scard'},h('div',{class:'ava '+resp.avatar},initials(resp.name)),h('div',{style:{flex:'1'}},h('b',{},resp.name),h('small',{},resp.pos)),h('div',{class:'acts'},h('button',{class:'press chat',onclick:function(){openOrCreateChat(resp)},html:icon('chat')}),h('button',{class:'press vks',onclick:function(){openVKS('call-'+resp.badge)},html:icon('video')}))));
}
b.appendChild(card);
}
}
pg.appendChild(b);
}

// ---------- 4. ПЕРЕДАЧА СМЕНЫ 2.0 ----------
function submitHandover(){
var area=$('#hdArea').value,note=$('#hdNote').value.trim();
if(!note){showIsland('Опишите смену','warn','o');return}
S24.handovers.unshift({id:uid(),area:area,note:note,who:state.user.name,whoId:state.user.id,date:new Date().toISOString(),accepted:null});
save24();
showIsland('Смена передана — ждёт приёмки','check','g');vib(20);render();
}
function acceptHandover(hd){
hd.accepted={by:state.user.name,badge:state.user.badge||'—',at:new Date().toISOString()};
save24();
if(sbOk&&hd.whoId)sb.from('notifications').insert({user_id:hd.whoId,text:'🤝 Смена принята: '+hd.by,type:'event'});
showIsland('Смена принята ✅','check','g');vib(20);render();
}
function renderHandPage(pg){
pg.appendChild(nav24('🤝 Передача смены'));
var b=body24();
var f=h('div',{class:'card',style:{padding:'14px'}});
var ar=h('select',{id:'hdArea'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5'].forEach(function(a){ar.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Участок'),ar));
f.appendChild(h('div',{class:'fld'},h('label',{},'Состояние *'),h('textarea',{id:'hdNote',rows:'3'})));
f.appendChild(h('button',{class:'btn b full press',onclick:submitHandover},'📤 Передать смену'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ПЕРЕДАЧИ · '+S24.handovers.length));
S24.handovers.forEach(function(hd){
var c=h('div',{class:'appr-row'},h('div',{class:'r1'},h('span',{class:'tag tg-v'},hd.area),h('span',{class:'due',style:{marginLeft:'auto'}},fmtDT(hd.date))),h('b',{style:{display:'block',margin:'6px 0'}},hd.who),h('div',{class:'txt-sm cl-m'},hd.note));
if(hd.accepted){c.appendChild(h('div',{class:'sig-box'},'✍️ Принял: '+hd.accepted.by+' (т.н. '+hd.accepted.badge+') · '+fmtDT(hd.accepted.at)))}
else if(state.user&&state.user.id!==hd.whoId&&(isBoss()||state.user.role==='master')){c.appendChild(h('button',{class:'btn sm g press mt',onclick:function(){acceptHandover(hd)}},'✅ Принять смену (подпись)'))}
else if(!hd.accepted){c.appendChild(h('div',{class:'txt-xs cl-o mt'},'⏳ Ожидает приёмки'))}
b.appendChild(c);
});
pg.appendChild(b);
}

// ---------- 5. СМЕНЫ А/Б ----------
function dayParity(d){return Math.floor(d.getTime()/(7*86400000))%2?'Б':'А'}
function empShift(e){var base=((+e.badge)%2===0)?'А':'Б';if(dayParity(now())==='Б')base=base==='А'?'Б':'А';if(S24.shiftOv[e.id])base=base==='А'?'Б':'А';return base}
function renderABPage(pg){
pg.appendChild(nav24('📅 Смены А/Б'));
var b=body24();
b.appendChild(h('div',{class:'txt-sm cl-m mb'},'Сегодня неделя: '+dayParity(now())+'. Тап по сотруднику — подмена.'));
var cal=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'14px'}});
for(var i=0;i<14;i++){var d=new Date(Date.now()+i*86400000);cal.appendChild(h('div',{class:'ab-day'},h('small',{},d.getDate()),h('span',{class:'ab'},dayParity(d))))}
b.appendChild(cal);
state.employees.forEach(function(e){
b.appendChild(h('div',{class:'scard press',onclick:function(){S24.shiftOv[e.id]=!S24.shiftOv[e.id];save24();vib(10);render()}},
h('div',{class:'ava '+e.avatar},initials(e.name)),
h('div',{style:{flex:'1'}},h('b',{},e.name),h('small',{},e.pos)),
h('span',{class:'ab-day',style:{padding:'6px 12px'}},h('span',{class:'ab'},empShift(e)))));
});
pg.appendChild(b);
}

// ---------- 6. НЕДЕЛЬНЫЙ АВТОСВОД ----------
function buildWeekly(){
var done=state.tasks.filter(function(t){return t.stage==='done'}).length;
var late=state.tasks.filter(function(t){return t.due&&new Date(t.due)<now()&&t.stage!=='done'}).length;
var avg=0,n=0;for(var k in state.telemetry){avg+=state.telemetry[k].load;n++}avg=Math.round(avg/(n||1));
var crit=WAREHOUSE.filter(function(w){return w.stock<w.min}).length;
return '📊 НЕДЕЛЬНАЯ СВОДКА · '+now().toLocaleDateString('ru-RU')+'\n\n✅ Задачи: '+done+' из '+state.tasks.length+'\n⏰ Просрочено: '+late+'\n🛡 Near-miss: '+S24.nearmiss.length+'\n🏭 Нагрузка: '+avg+'%\n📦 Критичных позиций: '+crit+'\n\n— КМ·Инженер v24';
}
function renderWeekPage(pg){
pg.appendChild(nav24('📊 Недельная сводка'));
var b=body24();
var txt=buildWeekly();
b.appendChild(h('div',{class:'rep-pre',style:{background:'var(--card2)',border:'1px solid var(--sep2)',borderRadius:'12px',padding:'12px',fontFamily:'ui-monospace,monospace',fontSize:'12px',whiteSpace:'pre-wrap',lineHeight:'1.6'}},txt));
b.appendChild(h('div',{class:'row',style:{gap:'8px',marginTop:'12px'}},
h('button',{class:'btn card press',style:{flex:'1'},onclick:function(){try{navigator.clipboard.writeText(txt)}catch(e){}showIsland('Скопировано','check','g')},'📋 Копировать'),
h('button',{class:'btn b press',style:{flex:'1'},onclick:function(){if(sbOk)sb.from('notifications').insert({user_id:'e1',text:'📊 Недельная сводка готова',type:'task'}).then(function(){showIsland('Директору отправлено ✅','send','g')});else showIsland('Нужен Supabase','warn','o')},'📨 Директору')));
pg.appendChild(b);
}

// ---------- 7. ЭСКАЛАЦИЯ ----------
setInterval(function(){
if(!state.user)return;
(state.tasks||[]).forEach(function(t){
if(t.stage==='done'||!t.due)return;
if(new Date(t.due).getTime()<Date.now()&&!S24.esc[t.id]){
S24.esc[t.id]=1;save24();
showIsland('⚠️ Просрочено → директору: '+(t.title||'').slice(0,20),'warn','o',5000);
if(sbOk)sb.from('notifications').insert({user_id:'e1',text:'⚠️ Эскалация: '+(t.title||'')+' ('+(t.executor_name||'—')+')',type:'task'});
}
});
},60000);

// ---------- 8. ПЕЧАТЬ ----------
function print24(kind,extra){
var t='';
if(kind==='req'&&extra)t='<h1>ЗАЯВКА ('+extra.type.toUpperCase()+')</h1><table><tr><td>Сотрудник</td><td>'+extra.who+'</td></tr><tr><td>Период</td><td>'+new Date(extra.from).toLocaleDateString('ru-RU')+' — '+new Date(extra.to).toLocaleDateString('ru-RU')+'</td></tr><tr><td>Комментарий</td><td>'+(extra.com||'—')+'</td></tr><tr><td>Статус</td><td>'+(extra.st==='ok'?'ОДОБРЕНО':extra.st==='no'?'ОТКЛОНЕНО':'НА СОГЛАСОВАНИИ')+'</td></tr></table><p>Подписи: ____________</p>';
if(kind==='cert')t='<h1>СПРАВКА</h1><p>Выдана '+(state.user?state.user.name:'—')+' в том, что он(а) является сотрудником АО «Коломенский завод», табельный № '+(state.user?state.user.badge:'—')+', должность: '+(state.user?state.user.pos:'—')+'.</p><p>Подпись: ____________</p>';
if(kind==='permit')t='<h1>НАРЯД-ДОПУСК №НД-204</h1><table><tr><td>Вид работ</td><td>Огневые работы</td></tr><tr><td>Место</td><td>Цех №3</td></tr><tr><td>Ответственный</td><td>Михайлов С.В.</td></tr></table><p>Меры безопасности: очистить площадку, огнетушитель, наблюдающий.</p><p>Подписи: ____________</p>';
var w=window.open('','_blank');if(!w){showIsland('Разрешите всплывающие окна','warn','o');return}
w.document.write('<html><head><meta charset="utf-8"><title>Форма</title><style>body{font-family:Arial;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:6px;font-size:12px}</style></head><body>АО «КОЛОМЕНСКИЙ ЗАВОД»'+t+'</body></html>');
w.document.close();setTimeout(function(){w.print()},300);
}
function renderPrint24(pg){
pg.appendChild(nav24('🖨 Формы'));
var b=body24();
b.appendChild(h('button',{class:'btn b full press mb',onclick:function(){print24('req',S24.approvals[0])}},'📄 Заявка (последняя)'));
b.appendChild(h('button',{class:'btn g full press mb',onclick:function(){print24('cert')}},'🪪 Справка с места работы'));
b.appendChild(h('button',{class:'btn card full press',onclick:function(){print24('permit')}},'⚡ Наряд-допуск'));
pg.appendChild(b);
}

// ---------- МЕНЮ + РОУТИНГ ----------
var _oh=openHub;
openHub=function(){_oh();var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v24 · Документы и безопасность'));
[['📄','Согласования','Отпуск, командировка',function(){closeHub();state.page='appr';render()}],
['🛡','Безопасность','Near-miss в ОТ',function(){closeHub();state.page='near';render()},'g'],
['🗺','Схема завода','Зоны и ответственные',function(){closeHub();state.page='schema24';render()}],
['🤝','Передача смены','Приёмка с подписью',function(){closeHub();state.page='hand';render()}],
['📅','Смены А/Б','График и подмены',function(){closeHub();state.page='ab';render()},'v'],
['📊','Недельная сводка','Авто-отчёт',function(){closeHub();state.page='week';render()},'w'],
['🖨','Формы','Заявка, справка, наряд',function(){closeHub();state.page='print24';render()},'w']
].forEach(function(it){sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'+(it[4]?' '+it[4]:'')},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')))});
b.appendChild(sec)};
var _rpo=renderPageOverlay;
renderPageOverlay=function(app){
if(state.page==='appr'){var pg=h('div',{class:'page on'});renderApprPage(pg);app.appendChild(pg);return}
if(state.page==='near'){var pg=h('div',{class:'page on'});renderNearPage(pg);app.appendChild(pg);return}
if(state.page==='schema24'){var pg=h('div',{class:'page on'});renderSchema24(pg);app.appendChild(pg);return}
if(state.page==='hand'){var pg=h('div',{class:'page on'});renderHandPage(pg);app.appendChild(pg);return}
if(state.page==='ab'){var pg=h('div',{class:'page on'});renderABPage(pg);app.appendChild(pg);return}
if(state.page==='week'){var pg=h('div',{class:'page on'});renderWeekPage(pg);app.appendChild(pg);return}
if(state.page==='print24'){var pg=h('div',{class:'page on'});renderPrint24(pg);app.appendChild(pg);return}
_rpo(app)};

// Понедельник — напоминание о сводке
setTimeout(function(){if(state.user&&now().getDay()===1&&localStorage.getItem('km24-week')!==String(Math.floor(Date.now()/(7*86400000)))){localStorage.setItem('km24-week',String(Math.floor(Date.now()/(7*86400000))));showIsland('📊 Понедельник: отправьте сводку','chart','b',6000)}},6000);
})();