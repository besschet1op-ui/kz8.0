/* ===== КМ·Инженер v19b: дашборд руководителя, тихие часы, хаб ===== */
(function(){
// ---------- ДАШБОРД ----------
function renderDashPage(app){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📊 Дашборд'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var lines=Object.keys(state.telemetry);
var avgLoad=Math.round(lines.reduce(function(a,k){return a+state.telemetry[k].load},0)/lines.length);
var warns=lines.filter(function(k){return state.telemetry[k].status==='warn'}).length;
var done=state.tasks.filter(function(t){return t.stage==='done'}).length;
var onSite=state.employees.filter(function(e){return e.present==='on'}).length;
var crit=WAREHOUSE.filter(function(w){return w.stock<w.min}).length;
b.appendChild(h('div',{class:'kpi-grid'},
h('div',{class:'kpi blue'},h('small',{},'Нагрузка'),h('b',{},avgLoad+'%')),
h('div',{class:'kpi '+(warns?'orange':'green')},h('small',{},'Внимание'),h('b',{},String(warns))),
h('div',{class:'kpi green'},h('small',{},'Задачи'),h('b',{},done+'/'+state.tasks.length)),
h('div',{class:'kpi violet'},h('small',{},'На смене'),h('b',{},String(onSite)))
));
if(crit)b.appendChild(h('div',{class:'alert'},'📦 Критичных позиций склада: '+crit));
b.appendChild(h('div',{class:'gtitle'},'ЛИНИИ · НАГРУЗКА'));
lines.forEach(function(k){var t=state.telemetry[k];
b.appendChild(h('div',{class:'dash-line press',onclick:function(){showIsland(k+': '+Math.round(t.temp)+'°C, нагр. '+Math.round(t.load)+'%','chart','b')},
h('span',{style:{width:'10px',height:'10px',borderRadius:'50%',flex:'none',background:t.status==='warn'?'var(--orange)':'var(--green)'}}),
h('b',{},t.name),
h('div',{class:'load'},h('i',{style:{width:Math.round(t.load)+'%'}})),
h('span',{class:'val'},Math.round(t.load)+'%')))
});
b.appendChild(h('div',{class:'gtitle'},'ЗАДАЧИ ПО СТАТУСАМ'));
var st={new:0,work:0,review:0,done:0};state.tasks.forEach(function(t){if(st[t.stage]!==undefined)st[t.stage]++});
b.appendChild(h('div',{class:'chart-card'},h('div',{class:'row',style:{gap:'16px',alignItems:'center'}},
buildDonut([{v:st.new,c:'#8fa3bd'},{v:st.work,c:'#0a84ff'},{v:st.review,c:'#ff9f0a'},{v:st.done,c:'#28b36b'}]),
h('div',{class:'legend',style:{flex:'1'}},
h('div',{class:'legend-item'},h('span',{class:'sq',style:{background:'#8fa3bd'}}),h('span',{},'Новые'),h('b',{},st.new)),
h('div',{class:'legend-item'},h('span',{class:'sq',style:{background:'#0a84ff'}}),h('span',{},'В работе'),h('b',{},st.work)),
h('div',{class:'legend-item'},h('span',{class:'sq',style:{background:'#ff9f0a'}}),h('span',{},'Проверка'),h('b',{},st.review)),
h('div',{class:'legend-item'},h('span',{class:'sq',style:{background:'#28b36b'}}),h('span',{},'Готово'),h('b',{},st.done))
))));
pg.appendChild(b);app.appendChild(pg);
}
var _rpo2=renderPageOverlay;
renderPageOverlay=function(app){if(state.page==='dash'){renderDashPage(app);return}_rpo2(app)};

// Кнопка дашборда на главной
var _rh0=renderHome;
renderHome=function(v){_rh0(v);var hdr=v.querySelector('.hdr');if(hdr){var bell=hdr.querySelector('.hdr-btn:last-child');if(bell)hdr.insertBefore(h('button',{class:'hdr-btn press',onclick:function(){state.page='dash';render()},html:icon('chart')}),bell)}};

// ---------- ПУНКТЫ В МЕНЮ ----------
var _oh=openHub;
openHub=function(){_oh();var b=document.querySelector('.hub-body');if(!b)return;
var sec=h('div',{class:'hub-section'},h('div',{class:'lbl'},'🏭 Цех и управление'));
[['📷','QR-сканер','Изделия и сотрудники',function(){closeHub();state.page='qr';render()}],
['📒','Журнал смены','Передача с фото',function(){closeHub();state.page='shift';render()}],
['📊','Дашборд','KPI производства',function(){closeHub();state.page='dash';render()}]].forEach(function(it){
sec.appendChild(h('button',{class:'hub-item press',onclick:it[3]},h('div',{class:'ico'},it[0]),h('div',{class:'txt'},h('b',{},it[1]),h('small',{},it[2])),h('div',{class:'arr'},'›')))});
b.appendChild(sec)};

// ---------- ТИХИЕ ЧАСЫ ----------
state.quiet=localStorage.getItem('km-quiet')==='1';
function isQuietHour(){var h=now().getHours();return h>=22||h<7}
var _ps=playSound;playSound=function(){if(state.quiet&&isQuietHour())return;_ps()};
var _ns=notifySystem;notifySystem=function(t,b){if(state.quiet&&isQuietHour())return;_ns(t,b)};
var _rp3=renderProfile;
renderProfile=function(v){_rp3(v);
v.appendChild(h('div',{class:'gtitle'},'🌙 РЕЖИМ'));
v.appendChild(h('div',{class:'card'},
h('button',{class:'grow',onclick:function(){state.quiet=!state.quiet;localStorage.setItem('km-quiet',state.quiet?'1':'0');render()}},
h('div',{class:'ava gray',html:icon('bell')}),
h('div',{style:{flex:'1'}},h('b',{},'Тихие часы 22–7'),h('small',{class:'cl-m'},state.quiet?'Звук и пуши отключены ночью':'Выключено')),
h('div',{class:'tgl'+(state.quiet?' on':'')}))));
v.appendChild(h('div',{class:'txt-xs cl-gr txt-c',style:{padding:'8px'}},'Модули v19 подключены · сборка 19.0'));
};
})();