// vksfix.js — надёжное закрытие ВКС + плавающая кнопка
var _origVKS=renderVKSPage;
renderVKSPage=function(view){
  _origVKS(view);
  // Убираем fullscreen у iframe (иначе Jitsi разворачивается на весь экран и прячет кнопки)
  var fr=view.querySelector('iframe');
  if(fr){fr.setAttribute('allow','camera; microphone; display-capture; autoplay')}
  // Плавающая красная кнопка ✕ поверх всего
  view.appendChild(h('button',{class:'press',style:{
    position:'absolute',top:'calc(12px + var(--sat))',right:'10px',
    width:'42px',height:'42px',borderRadius:'50%',
    background:'linear-gradient(135deg,#ff3b30,#ff6b35)',color:'#fff',
    fontSize:'18px',fontWeight:'800',zIndex:60,
    display:'grid',placeItems:'center',
    boxShadow:'0 8px 20px rgba(255,59,48,.45)'
  },onclick:function(){
    state.page=null;state.vksRoom=null;render();
    showIsland('ВКС завершена','video','o');
  }},'✕'));
  // Подсказка под iframe
  var ifr=view.querySelector('iframe');
  if(ifr){ifr.parentNode.insertBefore(h('div',{class:'txt-sm cl-m',style:{marginTop:'8px',textAlign:'center'}},'Если видео развернулось на весь экран — нажмите ✕ внутри видео (слева сверху), затем красную кнопку.'),ifr.nextSibling)}
};