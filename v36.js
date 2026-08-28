/* ===== КМ·Инженер v36 — безопасная полировка (без рекурсии) ===== */
if(!window.__v36){window.__v36=1;(function(){
state.chatRead=state.chatRead||{};try{Object.assign(state.chatRead,JSON.parse(localStorage.getItem('km-read')||'{}'))}catch(e){}
state.autoDark=localStorage.getItem('km-autodark')==='1';
state.quiet=localStorage.getItem('km-quiet')==='1';
state.saver=false;

// Тихие часы
function inQuiet(){if(!state.quiet)return false;var h=new Date().getHours();return h>=22||h<7}
var _ps=playSound;playSound=function(){if(inQuiet())return;_ps()};
var _ns=notifySystem;notifySystem=function(t,b){if(inQuiet())return;_ns(t,b)};

// Непрочитанная точка в списке чатов
var _cr=chatRow;
chatRow=function(c){
  var row=_cr(c);
  var last=c.last_time?new Date(c.last_time).getTime():0;
  if(last>(state.chatRead[c.id]||0)&&c.last){
    var t=row.querySelector('.txt-xs');
    if(t)t.parentNode.insertBefore(h('span',{style:{width:'10px',height:'10px',borderRadius:'50%',background:'var(--blue)',flex:'none'}}),t);
  }
  return row;
};

// Прочитано ✓✓ + отметка прочтения
var _rm=renderMessages;
renderMessages=function(box){
  _rm(box);
  var rows=box.querySelectorAll('.mrow');
  for(var i=0;i<rows.length;i++){
    var m=state.activeChatMessages[i];if(!m)continue;
    var mine=state.user&&m.sender_id===state.user.id;
    var tm=rows[i].querySelector('.tm');
    if(tm&&mine)tm.textContent=((m.read_by||[]).length>0?'✓✓ ':'✓ ')+tm.textContent;
  }
};
function markRead(id){
  if(!sbOk||!state.user)return;var my=state.user.id;
  state.activeChatMessages.forEach(function(m){
    if(m.sender_id!==my){var rb=m.read_by||[];if(rb.indexOf(my)<0){rb.push(my);sb.from('messages').update({read_by:rb}).eq('id',m.id).catch(function(){})}}
  });
}

// «Печатает…» + отметка прочтения при входе
var _rcr=renderChatRoom;
renderChatRoom=function(view){
  _rcr(view);
  var ac=state.activeChat;if(!ac)return;
  state.chatRead[ac.id]=Date.now();
  try{localStorage.setItem('km-read',JSON.stringify(state.chatRead))}catch(e){}
  markRead(ac.id);
  if(sbOk){
    var ch=sb.channel('typ-'+ac.id);
    ch.on('broadcast',{event:'typing'},function(p){
      var sm=view.querySelector('.chat-hd small');
      if(sm){sm.textContent=((p.payload&&p.payload.name)||'')+' печатает…';setTimeout(function(){if(sm)sm.textContent=''},2000)}
    });
    if(!ch._s){ch.subscribe();ch._s=true}
    var inp=view.querySelector('#msgInput');
    if(inp)inp.addEventListener('input',debounce(function(){ch.send({type:'broadcast',event:'typing',payload:{name:state.user?state.user.name:''}})},300));
  }
};

// Авто-тёмная тема
function autoDark(){if(!state.autoDark)return;var h=new Date().getHours();document.documentElement.setAttribute('data-theme',(h>=21||h<7)?'dark':'light')}
setInterval(autoDark,60000);autoDark();

// Энергосбережение
if(navigator.getBattery)navigator.getBattery().then(function(b){
  function u(){state.saver=b.level<0.2&&!b.charging}u();
  b.addEventListener('levelchange',u);b.addEventListener('chargingchange',u);
}).catch(function(){});
var _tt=tickTelemetry;
tickTelemetry=function(){if(state.saver&&Math.random()<0.5)return;_tt()};

// Настройки в профиле
var _rp=renderProfile;
renderProfile=function(view){
  _rp(view);
  view.appendChild(h('div',{class:'gtitle'},'СЕРВИС'));
  view.appendChild(h('div',{class:'card'},
    h('button',{class:'grow',onclick:function(){state.autoDark=!state.autoDark;localStorage.setItem('km-autodark',state.autoDark?'1':'0');autoDark();render()}},
      h('div',{class:'ava gray',html:icon('gear')}),
      h('div',{style:{flex:'1'}},h('b',{},'Авто-тёмная тема (21–7)')),
      h('div',{class:'tgl'+(state.autoDark?' on':'')})),
    h('button',{class:'grow',onclick:function(){state.quiet=!state.quiet;localStorage.setItem('km-quiet',state.quiet?'1':'0');render()}},
      h('div',{class:'ava gray',html:icon('bell')}),
      h('div',{style:{flex:'1'}},h('b',{},'Тихие часы 22–7')),
      h('div',{class:'tgl'+(state.quiet?' on':'')})),
    h('button',{class:'grow',onclick:function(){try{['km-ai','km-shift','km-react','km-edits','km-offq'].forEach(function(k){localStorage.removeItem(k)});if('caches'in window)caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})});showIsland('Кеш очищен ✅','check','g')}catch(e){}},
      h('div',{class:'ava gray',html:icon('cloud')}),
      h('div',{style:{flex:'1'}},h('b',{},'Очистить кеш')),
      h('span',{class:'cl-gr'},'→'))
  ));
};
showIsland('v36 подключён ✅','check','g');
})()}