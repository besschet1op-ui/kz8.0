// ===== vks.js — ВКС на Jitsi Meet + кнопки входа =====
var VIDEO_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>';
function vksUrl(room){return 'https://meet.jit.si/'+encodeURIComponent(room)}
function openVKS(room){state.page='vks';state.vksRoom=room||null;render()}

function renderVKSPage(view){
  view.innerHTML='';
  view.appendChild(h('div',{class:'nav'},
    h('button',{class:'back press',onclick:function(){state.page=null;state.vksRoom=null;render()},html:icon('back')}),
    h('div',{class:'nav-title'},'🎥 ВКС · Видеосвязь'),
    h('div',{class:'nav-sp'})
  ));
  var body=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
  if(state.vksRoom){
    var url=vksUrl(state.vksRoom);
    body.appendChild(h('div',{class:'tcard'},
      h('div',{class:'r1'},h('span',{class:'tag tg-b'},'Комната'),h('span',{class:'due'},state.vksRoom)),
      h('div',{class:'row'},
        h('button',{class:'btn sm b press',onclick:function(){window.open(url,'_blank')}},'Открыть в новой вкладке'),
        h('button',{class:'btn sm card press',onclick:function(){state.vksRoom=null;render()}},'← Комнаты')
      )
    ));
    body.appendChild(h('iframe',{src:url,style:{width:'100%',height:'62vh',border:'0',borderRadius:'16px',background:'#000'},allow:'camera; microphone; fullscreen; display-capture; autoplay'}));
    body.appendChild(h('div',{class:'txt-sm cl-m mt'},'Если во встроенном окне темно — нажмите «Открыть в новой вкладке». Ссылку на комнату можно отправить коллегам в чат.'));
  }else{
    body.appendChild(h('div',{class:'txt-sm cl-m mb'},'Выберите комнату или создайте свою. Коллеги подключаются с любого устройства по ссылке.'));
    [['planiorka','🗓 Общая планёрка'],['ceh3','🏭 Цех №3'],['direkcia','🏢 Дирекция'],['otk','🔍 ОТК']].forEach(function(r){
      body.appendChild(h('div',{class:'scard press',onclick:function(){openVKS(r[0])}},
        h('div',{class:'ava b4',html:VIDEO_ICON}),
        h('div',{style:{flex:'1'}},h('b',{},r[1]),h('small',{class:'cl-m'},'Комната: '+r[0])),
        h('span',{class:'cl-gr'},'→')
      ));
    });
    body.appendChild(h('div',{class:'gtitle'},'СВОЯ КОМНАТА'));
    body.appendChild(h('div',{class:'fld'},h('input',{id:'vksCustom',placeholder:'Название (латиницей): soveschanie-101'})));
    body.appendChild(h('button',{class:'btn b full press',onclick:function(){
      var v=(($('#vksCustom')||{}).value||'').trim().replace(/[^a-zA-Z0-9-]/g,'-');
      if(!v){showIsland('Введите название','warn','o');return}
      openVKS('kmz-'+v);
    }},'Создать и войти'));
  }
  view.appendChild(body);
}

// Роутер: страница vks
var _origPO=renderPageOverlay;
renderPageOverlay=function(app){
  if(state.page==='vks'){var pg=h('div',{class:'page on'});renderVKSPage(pg);app.appendChild(pg);return}
  _origPO(app);
};

// Фиолетовая кнопка ВКС на Главной
var _origMain=renderMain;
renderMain=function(app){
  _origMain(app);
  if(state.tab==='home'){
    var main=app.querySelector('.main');
    if(main)main.appendChild(h('button',{class:'fab press',style:{bottom:'calc(160px + var(--sab))',background:'linear-gradient(150deg,#8e6cf0,#5c3fd4)'},onclick:function(){openVKS(null)},html:VIDEO_ICON}));
  }
};

// Видеокнопка у каждого сотрудника в Штате
var _origStaff=staffCard;
staffCard=function(e){
  var card=_origStaff(e);
  var acts=card.querySelector('.acts');
  if(acts)acts.appendChild(h('button',{class:'press',style:{background:'rgba(142,108,240,.18)'},onclick:function(ev){ev.stopPropagation();openVKS('call-'+(e.badge||e.id))},html:VIDEO_ICON}));
  return card;
};