/* ===== КМ·ИНЖЕНЕР v25 — обучение, упоминания, разметка, простои, онбординг, дайджест, склад, Гант ===== */
(function(){
// ---------- CSS ----------
var st=document.createElement('style');
st.textContent='.course-card{background:var(--card);backdrop-filter:var(--glass);border:1px solid var(--sep2);border-radius:16px;padding:14px;margin-bottom:10px}'+
'.course-card b{font-size:14px;display:block;margin-bottom:6px}'+
'.lesson{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px}'+
'.lesson .lk{width:20px;height:20px;border-radius:6px;border:2px solid var(--gray);display:grid;place-items:center;font-size:11px;color:#fff;flex:none;cursor:pointer}'+
'.lesson .lk.on{background:var(--green);border-color:var(--green)}'+
'.test-q{background:var(--card2);border:1px solid var(--sep2);border-radius:12px;padding:10px 12px;margin-bottom:10px;font-size:13px}'+
'.test-opt{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;cursor:pointer}'+
'.gantt-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}'+
'.gantt-row .gl{width:90px;font-size:11px;font-weight:600;color:var(--label2);flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.gantt-row .gt{flex:1;position:relative;height:18px;background:var(--card2);border-radius:6px;overflow:hidden}'+
'.gantt-row .gb{position:absolute;top:2px;bottom:2px;border-radius:4px;background:var(--grad)}'+
'.gantt-row .gb.ev{background:var(--grad-violet)}'+
'.gantt-head{display:flex;gap:8px;margin-bottom:6px}'+
'.gantt-head .gl{width:90px;flex:none}'+
'.gantt-head .gt{flex:1;display:flex;justify-content:space-between;font-size:9px;color:var(--label3)}'+
'.ann-bar{display:flex;gap:8px;margin-top:10px}'+
'.ann-bar button{flex:1;padding:10px 0;border-radius:12px;font-size:13px;font-weight:700}'+
'.digest-card{background:var(--grad);color:#fff;border-radius:16px;padding:14px;margin-bottom:12px}';
document.head.appendChild(st);

// ---------- СОСТОЯНИЕ ----------
var S25={};try{var s25=JSON.parse(localStorage.getItem('km25')||'null');if(s25)S25=s25}catch(e){}
S25.courses=S25.courses||{};S25.downtime=S25.downtime||[];S25.onboard=S25.onboard||{};S25.stock=S25.stock||[];S25.digest=S25.digest||'';
function save25(){try{localStorage.setItem('km25',JSON.stringify(S25))}catch(e){}}
function todayStr(){var d=now();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// ---------- ДАННЫЕ: КУРСЫ ----------
var COURSES=[
{id:'c1',t:'🛡 Охрана труда и ПБ',lessons:['Вводный инструктаж','Пожарная безопасность','Работа на высоте'],test:[
{q:'Что делать при обнаружении возгорания?',a:['Сообщить и начать тушение','Позвонить домой','Уйти молча'],c:0},
{q:'Кто допускается к работе на высоте?',a:['Любой желающий','Прошедший инструктаж и медосмотр','Только директор'],c:1}]},
{id:'c2',t:'⚙️ Дизель Д49: устройство',lessons:['Блок и коленвал','Топливная аппаратура','Обкатка'],test:[
{q:'Сколько цилиндров у Д49?',a:['8','12','16'],c:2},
{q:'После чего проводится обкатка?',a:['После монтажа','До мойки','Не нужна'],c:0}]},
{id:'c3',t:'⚡ Электробезопасность',lessons:['Допуск и группы','Заземление','Первая помощь'],test:[
{q:'Минимальная группа для работ в эл. установках?',a:['I','II','V'],c:1},
{q:'Первое действие при поражении током?',a:['Отключить питание','Полить водой','Позвать директора'],c:0}]}
];

// ---------- УПОМИНАНИЯ / ХЭШТЕГИ ----------
var _sm25=window.sendMessage;
window.sendMessage=async function(){
var inp=$('#msgInput');var t=inp?inp.value:'';
if(t&&state.user&&sbOk){
state.employees.forEach(function(e){
var last=(e.name||'').split(' ')[0];
if(last&&t.indexOf('@'+last)>=0&&e.id!==state.user.id){
sb.from('notifications').insert({user_id:e.id,text:'💬 Вас упомянул(а): '+state.user.name,type:'chat'});
}
});
}
return _sm25.apply(this,arguments);
};
var _rm25=window.renderMessages;
window.renderMessages=function(box){
_rm25(box);
var spans=box.querySelectorAll('.bub > span:not(.tm):not(.sender)');
for(var i=0;i<spans.length;i++){
var sp=spans[i],txt=sp.textContent||'';
if(/[@#][\wа-яА-ЯёЁ]+/.test(txt)){
sp.innerHTML=escapeHtml(txt).replace(/([@#][\wа-яА-ЯёЁ]+)/g,'<b style="color:var(--accent,var(--blue))">$1</b>');
}
}
};

// ---------- ФОТОРАЗМЕТКА ----------
function openAnnotator(cb){
var inp=document.createElement('input');inp.type='file';inp.accept='image/*';
inp.onchange=function(){var f=inp.files&&inp.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){buildEditor(rd.result,cb)};rd.readAsDataURL(f)};
inp.click();
}
function buildEditor(src,cb){
var ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:9700;background:rgba(0,0,0,.88);display:flex;flex-direction:column;padding:12px';
var cv=document.createElement('canvas');cv.style.cssText='flex:1;width:100%;border-radius:12px;background:#111;touch-action:none';
var bar=document.createElement('div');bar.className='ann-bar';
var color='#ff3b30',mode='draw';
function mk(t,fn,cls){var b=document.createElement('button');b.textContent=t;if(cls)b.style.cssText=cls;else b.style.cssText='background:var(--card2);color:#fff';b.onclick=fn;bar.appendChild(b)}
mk('🔴',function(){color='#ff3b30';mode='draw'});mk('🟡',function(){color='#ff9f0a';mode='draw'});
mk('✍️ Текст',function(){mode='text'});
mk('💾 Сохранить',function(){cb(cv.toDataURL('image/jpeg',.8));ov.remove()},'background:var(--green);color:#fff');
mk('✕',function(){ov.remove()});
ov.appendChild(cv);ov.appendChild(bar);document.body.appendChild(ov);
var img=new Image();
img.onload=function(){
var w=img.width>900?900:img.width;cv.width=w;cv.height=Math.round(img.height*(w/img.width));
var cx=cv.getContext('2d');cx.drawImage(img,0,0,cv.width,cv.height);
var drawing=false,lx=0,ly=0;
function pos(e){var r=cv.getBoundingClientRect();var p=e.touches?e.touches[0]:e;return[(p.clientX-r.left)*(cv.width/r.width),(p.clientY-r.top)*(cv.height/r.height)]}
cv.addEventListener('pointerdown',function(e){var q=pos(e);if(mode==='text'){var t=prompt('Текст:');if(t){cx.fillStyle=color;cx.font='bold '+(cv.width/20)+'px sans-serif';cx.fillText(t,q[0],q[1])}return}drawing=true;lx=q[0];ly=q[1]});
cv.addEventListener('pointermove',function(e){if(!drawing)return;var q=pos(e);cx.strokeStyle=color;cx.lineWidth=Math.max(2,cv.width/220);cx.lineCap='round';cx.beginPath();cx.moveTo(lx,ly);cx.lineTo(q[0],q[1]);cx.stroke();lx=q[0];ly=q[1]});
cv.addEventListener('pointerup',function(){drawing=false});
};
img.src=src;
}

// ---------- УТРЕННИЙ ДАЙДЖЕСТ ----------
function maybeDigest(){
var t=todayStr();if(S25.digest===t)return;
var h=now().getHours();if(h<8||h>11)return;
S25.digest=t;save25();
var due=state.tasks.filter(function(x){return x.due&&new Date(x.due).toDateString()===now().toDateString()&&x.stage!=='done'}).length;
var warn=0;for(var k in state.telemetry)if(state.telemetry[k].status==='warn')warn++;
var txt='☀️ Дайджест: задач сегодня '+due+', линий с вниманием '+warn;
showIsland(txt,'news','b',6000);
notifySystem('КМ·Инженер',txt);
}
setTimeout(maybeDigest,4000);setInterval(maybeDigest,60000);

// ---------- СТРАНИЦЫ ----------
function renderLearn(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🎓 Учебный центр'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
COURSES.forEach(function(c){
var pr=S25.courses[c.id]||{done:[],passed:false};
var pct=Math.round(((pr.done.length+(pr.passed?1:0))/(c.lessons.length+1))*100);
pg.appendChild; b.appendChild(h('div',{class:'course-card press',onclick:function(){state.page='learn:'+c.id;render()}},
h('b',{},c.t+(pr.passed?' ✅':'')),
h('div',{class:'progress'},h('i',{style:{width:pct+'%'}})),
h('div',{class:'txt-xs cl-m'},'Прогресс: '+pct+'%')
));
});
pg.appendChild(b);
}
function renderCourse(pg,id){
var c=null;COURSES.forEach(function(x){if(x.id===id)c=x});
if(!c){state.page=null;render();return}
var pr=S25.courses[id]||(S25.courses[id]={done:[],passed:false});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page='learn';render()},html:icon('back')}),h('div',{class:'nav-title'},c.t),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
b.appendChild(h('div',{class:'gtitle'},'УРОКИ'));
c.lessons.forEach(function(l,i){
var on=pr.done.indexOf(i)>=0;
b.appendChild(h('div',{class:'lesson'},
h('div',{class:'lk'+(on?' on':''),onclick:function(){var j=pr.done.indexOf(i);if(j>=0)pr.done.splice(j,1);else pr.done.push(i);save25();render()}},on?'✓':''),
h('span',{},l)
));
});
b.appendChild(h('div',{class:'gtitle'},'ТЕСТ'));
c.test.forEach(function(q,qi){
var qd=h('div',{class:'test-q'},h('b',{},(qi+1)+'. '+q.q));
q.a.forEach(function(opt,oi){
var r=h('input',{type:'radio',name:'q'+qi,value:oi});
qd.appendChild(h('label',{class:'test-opt'},r,h('span',{},opt)));
});
b.appendChild(qd);
});
b.appendChild(h('button',{class:'btn b full press',onclick:function(){
var correct=0;
c.test.forEach(function(q,qi){var el=document.querySelector('input[name="q'+qi+'"]:checked');if(el&&+el.value===q.c)correct++});
if(correct===c.test.length){pr.passed=true;save25();showIsland('Курс пройден ✅','check','g');render()}
else showIsland('Верно '+correct+' из '+c.test.length+'. Ещё раз.','warn','o');
}},'Проверить'));
pg.appendChild(b);
}
function renderDowntime(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📊 Журнал простоев'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
var ls=h('select',{id:'dtLine'});Object.keys(state.telemetry).forEach(function(k){ls.appendChild(h('option',{value:k},state.telemetry[k].name))});
var rs=h('select',{id:'dtReason'});['Поломка','Нет материала','Энергия','Прочее'].forEach(function(r){rs.appendChild(h('option',{value:r},r))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Линия'),ls));
f.appendChild(h('div',{class:'fld'},h('label',{},'Причина'),rs));
f.appendChild(h('div',{class:'fld'},h('label',{},'Минут'),h('input',{id:'dtMin',type:'number',value:'30'})));
f.appendChild(h('button',{class:'btn b full press',onclick:function(){
var m=parseInt($('#dtMin').value)||0;if(m<=0){showIsland('Укажите минуты','warn','o');return}
S25.downtime.unshift({line:$('#dtLine').value,reason:$('#dtReason').value,min:m,date:new Date().toISOString()});save25();showIsland('Простой записан','chart','o');render();
}},'＋ Записать'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'СВОДКА ЗА МЕСЯЦ'));
var sum={};S25.downtime.forEach(function(d){sum[d.line]=(sum[d.line]||0)+d.min});
Object.keys(sum).forEach(function(k){b.appendChild(h('div',{class:'stock-row'},h('div',{class:'st-i'},'⏸'),h('div',{style:{flex:'1'}},h('b',{},state.telemetry[k]?state.telemetry[k].name:k)),h('div',{class:'stock-lvl'},h('b',{class:'cl-o'},sum[k]+' мин'))))});
b.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ'));
S25.downtime.slice(0,10).forEach(function(d){b.appendChild(h('div',{class:'appr-row'},h('b',{style:{display:'block'}},(state.telemetry[d.line]?state.telemetry[d.line].name:d.line)+' · '+d.reason),h('div',{class:'txt-xs cl-m'},d.min+' мин · '+fmtDT(d.date))))});
pg.appendChild(b);
}
var ONBOARD=['Оформление и пропуск','Вводный инструктаж ОТ','Знакомство с участком','Допуск к оборудованию','Первая самостоятельная смена'];
function renderOnboard(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🧭 Онбординг'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var done=ONBOARD.filter(function(o,i){return S25.onboard[i]}).length;
b.appendChild(h('div',{class:'progress',style:{marginBottom:'12px'}},h('i',{style:{width:Math.round(done/ONBOARD.length*100)+'%'}})));
ONBOARD.forEach(function(o,i){
var on=!!S25.onboard[i];
b.appendChild(h('div',{class:'lesson'},h('div',{class:'lk'+(on?' on':''),onclick:function(){S25.onboard[i]=!on;save25();render()}},on?'✓':''),h('span',{},o)));
});
pg.appendChild(b);
}
function renderStockMove(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📦 Движения склада'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
var is=h('select',{id:'smItem'});WAREHOUSE.forEach(function(w){is.appendChild(h('option',{value:w.name},w.name))});
var ts=h('select',{id:'smType'});ts.appendChild(h('option',{value:'in'},'Приход'));ts.appendChild(h('option',{value:'out'},'Расход'));
f.appendChild(h('div',{class:'fld'},h('label',{},'Позиция'),is));
f.appendChild(h('div',{class:'fld'},h('label',{},'Тип'),ts));
f.appendChild(h('div',{class:'fld'},h('label',{},'Кол-во'),h('input',{id:'smQty',type:'number',value:'1'})));
f.appendChild(h('button',{class:'btn b full press',onclick:function(){
var q=parseInt($('#smQty').value)||0;if(q<=0){showIsland('Укажите кол-во','warn','o');return}
S25.stock.unshift({item:$('#smItem').value,type:$('#smType').value,qty:q,date:new Date().toISOString()});save25();showIsland('Проведено','check','g');render();
}},'＋ Провести'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ТЕКУЩИЕ ОСТАТКИ'));
WAREHOUSE.forEach(function(w){
var mv=0;S25.stock.forEach(function(m){if(m.item===w.name)mv+=(m.type==='in'?m.qty:-m.qty)});
var cur=w.stock+mv;var crit=cur<w.min;
b.appendChild(h('div',{class:'stock-row'},h('div',{class:'st-i'},w.ico),h('div',{style:{flex:'1'}},h('b',{},w.name)),h('div',{class:'stock-lvl'},h('b',{class:crit?'cl-r':'cl-g'},cur+' '+w.unit))));
});
b.appendChild(h('div',{class:'gtitle'},'ИСТОРИЯ'));
S25.stock.slice(0,10).forEach(function(m){b.appendChild(h('div',{class:'appr-row'},h('b',{style:{display:'block'}},(m.type==='in'?'📥 ':'📤 ')+m.item+' · '+m.qty),h('div',{class:'txt-xs cl-m'},fmtDT(m.date))))});
pg.appendChild(b);
}
function renderGantt(pg){
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'🗓 Диаграмма Ганта'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var days=14,t0=new Date();t0.setHours(0,0,0,0);
var head=h('div',{class:'gantt-head'},h('div',{class:'gl'}),h('div',{class:'gt'}));
var gt=head.querySelector('.gt');
for(var i=0;i<days;i+=2){gt.appendChild(h('span',{},String(new Date(t0.getTime()+i*86400000).getDate())))}
b.appendChild(head);
function idx(d){return Math.floor((new Date(d).setHours(0,0,0,0)-t0.getTime())/86400000)}
state.events.forEach(function(ev){
var s=idx(ev.date);if(s<0||s>=days)return;
var row=h('div',{class:'gantt-row'},h('div',{class:'gl'},ev.title),h('div',{class:'gt'}));
var bar=h('div',{class:'gb ev',style:{left:(s/days*100)+'%',width:(1/days*100)+'%'}});
row.querySelector('.gt').appendChild(bar);b.appendChild(row);
});
state.tasks.forEach(function(t){
if(!t.due)return;var s=idx(t.created_at||t.due),e=idx(t.due);if(e<0||s>=days)return;s=Math.max(0,s);var w=Math.max(1,e-s+1);
var row=h('div',{class:'gantt-row'},h('div',{class:'gl'},t.title),h('div',{class:'gt'}));
row.querySelector('.gt').appendChild(h('div',{class:'gb',style:{left:(s/days*100)+'%',width:(w/days*100)+'%'}}));
b.appendChild(row);
});
pg.appendChild(b);
}

// ---------- РОУТИНГ ----------
var _rpo25=window.renderPageOverlay;
window.renderPageOverlay=function(app){
if(state.page==='learn'){var pg=h('div',{class:'page on'});renderLearn(pg);app.appendChild(pg);return}
if(state.page&&state.page.indexOf('learn:')===0){var pg=h('div',{class:'page on'});renderCourse(pg,state.page.split(':')[1]);app.appendChild(pg);return}
if(state.page==='downtime'){var pg=h('div',{class:'page on'});renderDowntime(pg);app.appendChild(pg);return}
if(state.page==='onboard'){var pg=h('div',{class:'page on'});renderOnboard(pg);app.appendChild(pg);return}
if(state.page==='stockmove'){var pg=h('div',{class:'page on'});renderStockMove(pg);app.appendChild(pg);return}
if(state.page==='gantt'){var pg=h('div',{class:'page on'});renderGantt(pg);app.appendChild(pg);return}
_rpo25(app);
};

// ---------- МЕНЮ ----------
var _oh25=window.openHub;
window.openHub=function(){
_oh25();
var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🚀 v25 · Развитие и контроль'));
[['🎓','Учебный центр','Курсы и тесты',function(){closeHub();state.page='learn';render()}],
['📊','Простои','Журнал и сводка',function(){closeHub();state.page='downtime';render()}],
['🧭','Онбординг','Чек-лист новичка',function(){closeHub();state.page='onboard';render()}],
['📦','Движения склада','Приход / расход',function(){closeHub();state.page='stockmove';render()}],
['🗓','Гант','План на 14 дней',function(){closeHub();state.page='gantt';render()}],
['📷','Фоторазметка','Стрелки и подписи',function(){closeHub();openAnnotator(function(url){showIsland('Разметка готова 💾','check','g');try{var a=document.createElement('a');a.href=url;a.download='annot.jpg';a.click()}catch(e){}})}]
].forEach(function(it){
sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')));
});
b.appendChild(sec);
};
})();