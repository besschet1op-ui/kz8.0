/* ===== КМ·Инженер v34 — ПОЛИРОВКА (без новых фич) ===== */
(function(){
var V='34';

// ---------- 1) Единая версия ----------
var _rp=window.renderProfile;
window.renderProfile=function(view){
  _rp(view);
  view.querySelectorAll('.grow small').forEach(function(s){
    if(/КМ·Инженер/.test(s.textContent))s.textContent='КМ·Инженер '+V;
  });
};

// ---------- 2) Тихие часы: реально глушим звук/пуши ----------
if(typeof state.quiet==='undefined')state.quiet=localStorage.getItem('km-quiet')==='1';
function quietNow(){if(!state.quiet)return false;var h=new Date().getHours();return h>=22||h<7}
var _ps=window.playSound;window.playSound=function(){if(quietNow())return;_ps()};
var _ns=window.notifySystem;window.notifySystem=function(t,b){if(quietNow())return;_ns(t,b)};
// Тумблер в профиле (если ещё нет)
var _rp2=window.renderProfile;
window.renderProfile=function(view){
  _rp2(view);
  var card=view.querySelector('.card:last-of-type');
  if(!view.querySelector('[data-quiet]')){
    view.appendChild(h('div',{class:'gtitle'},'РЕЖИМ'));
    view.appendChild(h('div',{class:'card'},
      h('button',{class:'grow','data-quiet':'1',onclick:function(){
        state.quiet=!state.quiet;localStorage.setItem('km-quiet',state.quiet?'1':'0');render();
      }},
      h('div',{class:'ava gray',html:icon('bell')}),
      h('div',{style:{flex:'1'}},h('b',{},'Тихие часы 22–7'),h('small',{class:'cl-m'},state.quiet?'Включены':'Выключены')),
      h('div',{class:'tgl'+(state.quiet?' on':'')})
    )));
  }
};

// ---------- 3) Живое присутствие (мягкая симуляция) ----------
setInterval(function(){
  var arr=['on','away','off'];
  var e=state.employees[Math.floor(Math.random()*state.employees.length)];
  if(e&&!e.remote){e.present=arr[Math.floor(Math.random()*3)];if(state.tab==='staff')render()}
},20000);

// ---------- 4) Избранное: звезда на задаче + секция на главной ----------
if(!state.favorites)state.favorites={employees:[],tasks:[]};
function isFav(t,id){return(state.favorites[t]||[]).indexOf(id)>=0}
function toggleFav(t,id){var a=state.favorites[t]=state.favorites[t]||[];var i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);try{localStorage.setItem('km-favs',JSON.stringify(state.favorites))}catch(e){}vib(10);render()}
var _tc=window.taskCard;
window.taskCard=function(t){
  var c=_tc(t);
  if(!c.querySelector('.fav-star')){
    c.style.position='relative';
    var on=isFav('tasks',t.id);
    var st=h('div',{class:'fav-star',style:{position:'absolute',top:'10px',right:'12px',fontSize:'18px',cursor:'pointer',color:on?'var(--orange)':'var(--gray)'},onclick:function(e){e.stopPropagation();toggleFav('tasks',t.id)}},on?'★':'☆');
    c.appendChild(st);
  }
  return c;
};
var _rh=window.renderHome;
window.renderHome=function(view){
  _rh(view);
  if(!view.querySelector('[data-favhome]')){
    var favs=state.tasks.filter(function(t){return isFav('tasks',t.id)});
    if(favs.length){
      var sec=h('div',{'data-favhome':'1'});
      sec.appendChild(h('div',{class:'gtitle'},'⭐ ИЗБРАННОЕ'));
      favs.slice(0,3).forEach(function(t){sec.appendChild(taskCard(t))});
      var pipe=view.querySelector('.route-pipeline');
      if(pipe&&pipe.parentNode)pipe.parentNode.insertBefore(sec,pipe);
    }
  }
};

// ---------- 5) Доступность: reduced-motion + focus ----------
var st=document.createElement('style');
st.textContent='@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}'+
':focus-visible{outline:2px solid var(--accent,var(--blue));outline-offset:2px}'+
'.fav-star:active{transform:scale(.9)}';
document.head.appendChild(st);

// ---------- 6) Что нового (один раз) ----------
if(localStorage.getItem('km-seen-v34')!=='1'){
  localStorage.setItem('km-seen-v34','1');
  setTimeout(function(){showIsland('v34: полировка готова ✅','check','g',4000)},1200);
}
})();