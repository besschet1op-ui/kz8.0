/* КМ·Инженер v17 — модуль C: главная, тренды, присутствие, идеи, журнал */
var S3=window.state;
S3.whSearch=S3.whSearch||'';
window.getGreeting=function(){var h=now().getHours();if(h<6)return'Доброй ночи';if(h<12)return'Доброе утро';if(h<18)return'Добрый день';return'Добрый вечер'};
window.getWeather=function(){var w=0;for(var k in S3.telemetry){if(S3.telemetry[k].status==='warn')w++}if(w===0)return{i:'☀️',l:'Все линии в норме',v:'OK'};if(w===1)return{i:'⛅',l:'1 линия требует внимания',v:'⚠️'};return{i:'🌧',l:w+' линии требуют внимания',v:'🔴'}};
window.getTrend=function(v){var d=v.load-(v._prev||v.load);if(d>1)return{c:'up',t:'▲ +'+Math.round(d)+'%'};if(d<-1)return{c:'down',t:'▼ '+Math.round(d)+'%'};return{c:'flat',t:'● 0%'}};
var _tt=window.tickTelemetry;
window.tickTelemetry=function(){for(var k in S3.telemetry)S3.telemetry[k]._prev=S3.telemetry[k].load;_tt()};
window.tickPresence=function(){var ch=false;S3.employees.forEach(function(e){if(Math.random()<0.03){var o=['on','away','off'];var c=o.indexOf(e.present);var n=o[(c+1+Math.floor(Math.random()*2))%3];if(n!==e.present){e.present=n;ch=true}}});if(ch&&(S3.tab==='staff'||S3.tab==='home'))render()};
setInterval(tickPresence,10000);
window.addIdea=function(){var inp=$('#ideaTitle');if(!inp||!inp.value.trim()){showIsland('Опишите идею','warn','o');return}IDEAS.unshift({title:inp.value.trim(),author:S3.user?S3.user.name:'Аноним',votes:0,my:true});showIsland('Идея подана! 💡','check','g');vib(20);render()};
var _rh=window.renderHome;
window.renderHome=function(v){_rh(v);
var w=getWeather();
var hero=v.querySelector('.hero');
if(hero){var h3=hero.querySelector('h3');if(h3&&S3.user)h3.textContent=getGreeting()+', '+(S3.user.name?S3.user.name.split(' ')[0]:'')+'!'}
if(hero&&hero.nextSibling){v.insertBefore(h('div',{class:'weather-widget'},h('div',{class:'w-ico'},w.i),h('div',{class:'w-info'},h('b',{},'Погода производства'),h('small',{},w.l)),h('div',{class:'w-temp'},w.v)),hero.nextSibling)}
var favT=S3.tasks.filter(function(t){return S3.favorites.tasks.indexOf(t.id)>=0});
if(favT.length){var sec=h('div',{});sec.appendChild(h('div',{class:'gtitle'},h('span',{},'⭐ ИЗБРАННОЕ')));favT.slice(0,3).forEach(function(t){sec.appendChild(taskCard(t))});var pipe=v.querySelector('.route-pipeline');if(pipe&&pipe.parentNode)pipe.parentNode.insertBefore(sec,pipe.previousSibling&&pipe.previousSibling.classList.contains('gtitle')?pipe.previousSibling:pipe)}
};
var _rs=window.renderStaff;
window.renderStaff=function(v){_rs(v);
var list=$('#staffList');if(!list)return;
if(!S3.orgUnit){var favE=S3.employees.filter(function(e){return S3.favorites.employees.indexOf(e.id)>=0});
if(favE.length){var sec=document.createElement('div');var tt=h('div',{class:'gtitle',style:{paddingTop:'4px'}},'⭐ ИЗБРАННОЕ');sec.appendChild(tt);favE.forEach(function(e){sec.appendChild(staffCard17(e))});list.insertBefore(sec,list.firstChild)}}
};
window.staffCard17=function(e){var isFav=S3.favorites.employees.indexOf(e.id)>=0;return h('div',{class:'scard press',onclick:function(){if(sbOk&&S3.user)openOrCreateChat(e)}},h('div',{class:'ava '+e.avatar,style:{position:'relative'}},initials(e.name),h('span',{class:'pres '+e.present})),h('div',{style:{flex:'1',minWidth:'0'}},h('b',{},e.name),h('small',{},e.pos),h('small',{class:'cl-gr txt-xs'},e.dept)),h('div',{class:'acts'},h('button',{class:'press fav'+(isFav?' on':''),style:{background:'rgba(255,159,10,.12)'},onclick:function(ev){ev.stopPropagation();toggleFav('employees',e.id)},html:icon('star')}),h('button',{class:'press chat',onclick:function(ev){ev.stopPropagation();if(sbOk&&S3.user)openOrCreateChat(e)},html:icon('chat')}),h('button',{class:'press vks',onclick:function(ev){ev.stopPropagation();openVKS('call-'+(e.badge||e.id))},html:icon('video')}),h('button',{class:'press',onclick:function(ev){ev.stopPropagation();if(e.phone){showIsland('Звонок…','phone','b');setTimeout(function(){location.href='tel:'+e.phone},400)}},html:icon('phone')})))};
var _rf=window.renderFactory;
window.renderFactory=function(v){
if(window.prodSection==='ideas'){v.appendChild(h('div',{class:'large-title'},'Производство'));var chips=h('div',{class:'chips'});[['telemetry','📡 Телеметрия'],['products','⚙️ Изделия'],['warehouse','📦 Склад'],['permits','⚡ Наряды'],['safety','🛡 Безопасность'],['ideas','💡 Идеи']].forEach(function(s){chips.appendChild(h('button',{class:'chip press'+(prodSection===s[0]?' on':''),onclick:function(){prodSection=s[0];render()}},s[1]))});v.appendChild(chips);
v.appendChild(h('div',{class:'card',style:{padding:'14px',marginBottom:'14px'}},h('div',{class:'fld',style:{marginBottom:'10px'}},h('label',{},'💡 Новая идея'),h('input',{id:'ideaTitle',placeholder:'Опишите предложение…'})),h('button',{class:'btn b full press',onclick:addIdea},'Подать идею')));
IDEAS.forEach(function(idea,i){v.appendChild(h('div',{class:'idea-card'},h('b',{style:{display:'block',marginBottom:'6px'}},idea.title),h('div',{class:'txt-sm cl-m mb'},'Автор: '+idea.author),h('div',{class:'row between'},h('div',{class:'vote'+(idea.my?' voted':''),onclick:function(){IDEAS[i].my=!idea.my;IDEAS[i].votes+=idea.my?1:-1;render()}},(idea.my?'❤️ ':'👍 ')+idea.votes),h('span',{class:'txt-xs cl-gr'},'→'))))});return}
_rf(v);
if(window.prodSection==='telemetry'){v.querySelectorAll('.telem-card').forEach(function(card,i){var k=Object.keys(S3.telemetry)[i];if(!k)return;var tr=getTrend(S3.telemetry[k]);var hd=card.querySelector('.hd');if(hd&&!hd.querySelector('.trend'))hd.insertBefore(h('span',{class:'trend '+tr.c},tr.t),hd.querySelector('small'))})}
if(window.prodSection==='warehouse'&&!v.querySelector('.wh-search')){var first=v.querySelector('.stock-row');if(first){var sr=h('div',{class:'search wh-search'},h('span',{html:icon('search')}),h('input',{placeholder:'Поиск по складу…',value:S3.whSearch,oninput:debounce(function(e){S3.whSearch=(e.target.value||'').toLowerCase();var q=S3.whSearch;v.querySelectorAll('.stock-row').forEach(function(row){var name=row.querySelector('b');row.style.display=!q||(name&&name.textContent.toLowerCase().indexOf(q)>=0)?'':'none'})},150)}));first.parentNode.insertBefore(sr,first)}}
};
var _rp=window.renderProfile;
window.renderProfile=function(v){_rp(v);
v.appendChild(h('div',{class:'gtitle'},'🔐 ЖУРНАЛ ВХОДОВ'));
var card=h('div',{class:'card'});
if(S3.loginLog.length){S3.loginLog.slice(0,5).forEach(function(l){card.appendChild(h('div',{class:'login-row'},h('div',{class:'li '+(l.ok?'ok':'bad')},l.ok?'✅':'❌'),h('div',{style:{flex:'1'}},h('b',{style:{fontSize:'13px'}},(l.ok?'Вход':'Ошибка')+' · '+l.m),h('small',{class:'cl-gr'},fmtDT(l.t)))))})}
else card.appendChild(h('div',{class:'empty'},'История пуста'));
v.appendChild(card);
};