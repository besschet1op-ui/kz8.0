// realtime.js v2 — прямой Realtime + авто-резерв (опрос каждые 5 сек)
(function(){
if(window._rtLoaded)return;window._rtLoaded=true;
state.typing=state.typing||{};
state.rtChannels=state.rtChannels||{};

// Отдельный клиент НАПРЯМУЮ к Supabase (прокси не умеет WebSocket)
var sbRT=null;
try{sbRT=window.supabase.createClient(SUPA_URL,SUPA_KEY)}catch(e){}
var RTC=sbRT||sb;

function attachLongPress(el,fn){
  var t=null;
  el.addEventListener('touchstart',function(){t=setTimeout(function(){fn()},450)},{passive:true});
  el.addEventListener('touchend',function(){clearTimeout(t)});
  el.addEventListener('touchmove',function(){clearTimeout(t)});
  el.addEventListener('contextmenu',function(e){e.preventDefault();fn()});
}

function showReactionPicker(m){
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  var box=document.createElement('div');
  box.style.cssText='background:var(--card-solid);border-radius:26px;padding:12px 16px;display:flex;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,.5)';
  ['👍','❤️','😂','',''].forEach(function(e){
    var b=document.createElement('button');
    b.textContent=e;
    b.style.cssText='font-size:28px;background:none;border:0;cursor:pointer';
    b.onclick=function(){ov.remove();toggleReaction(m,e)};
    box.appendChild(b);
  });
  ov.onclick=function(){ov.remove()};
  ov.appendChild(box);
  document.body.appendChild(ov);
  vib(15);
}

function toggleReaction(m,emoji){
  if(!sbOk||!state.user)return;
  var r=JSON.parse(JSON.stringify(m.reactions||{}));
  var arr=r[emoji]||[];
  var i=arr.indexOf(String(state.user.id));
  if(i>=0)arr.splice(i,1);else arr.push(String(state.user.id));
  if(arr.length)r[emoji]=arr;else delete r[emoji];
  sb.from('messages').update({reactions:r}).eq('id',m.id).then(function(){
    vib(10);
    if(state.activeChat)loadMessages(state.activeChat.id);
  });
}

async function markChatRead(chatId){
  if(!sbOk||!state.user)return;
  var mine=state.activeChatMessages.filter(function(m){
    return m.sender_id!==state.user.id&&((m.read_by||[]).indexOf(state.user.id)<0);
  });
  for(var i=0;i<mine.length;i++){
    var m=mine[i];
    var rb=(m.read_by||[]).slice();rb.push(state.user.id);
    await sb.from('messages').update({read_by:rb}).eq('id',m.id);
  }
}

function updateTypingLabel(chatId){
  var el=window._chatSubEl;if(!el)return;
  var t=state.typing[chatId];
  if(t&&t.until>Date.now()){
    el.textContent='✍️ '+(t.name||'')+' печатает…';
    el.style.color='var(--green)';
    setTimeout(function(){updateTypingLabel(chatId)},1000);
  }else{
    el.textContent=window._chatSubOrig||'';
    el.style.color='';
  }
}

var lastTyping=0;
function sendTyping(chatId){
  var t=Date.now();
  if(t-lastTyping<1500)return;
  lastTyping=t;
  var ch=ensureRT(chatId);
  if(ch)ch.send({type:'broadcast',event:'typing',payload:{uid:state.user.id,name:state.user.name}});
}

function ensureRT(chatId){
  if(!sbOk||!RTC)return null;
  if(state.rtChannels[chatId])return state.rtChannels[chatId];
  var ch=RTC.channel('rt-chat-'+chatId)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'chat_id=eq.'+chatId},function(p){
      var m=p.new;
      if(state.activeChat&&state.activeChat.id===chatId){
        if(!state.activeChatMessages.some(function(x){return x.id===m.id})){
          state.activeChatMessages.push(m);
          var box=$('#chatMsgs');
          if(box){renderMessages(box);box.scrollTop=box.scrollHeight}
          if(m.sender_id!==state.user.id){playSound();vib(20);markChatRead(chatId)}
        }
      }
    })
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages',filter:'chat_id=eq.'+chatId},function(p){
      var m=p.new;
      var i=state.activeChatMessages.findIndex(function(x){return x.id===m.id});
      if(i>=0){
        state.activeChatMessages[i]=m;
        var box=$('#chatMsgs');
        if(box)renderMessages(box);
      }
    })
    .on('broadcast',{event:'typing'},function(p){
      if(p.payload&&p.payload.uid!==state.user.id){
        state.typing[chatId]={name:p.payload.name,until:Date.now()+3000};
        updateTypingLabel(chatId);
      }
    })
    .subscribe(function(status){
      if(status==='SUBSCRIBED'&&state.activeChat&&state.activeChat.id===chatId){
        showIsland('⚡ Realtime активен','cloud','g',2000);
      }
    });
  state.rtChannels[chatId]=ch;
  return ch;
}

function ensureGlobalRT(){
  if(!sbOk||!RTC||state._rtGlobal)return;
  state._rtGlobal=true;
  RTC.channel('rt-chats-global')
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'chats'},function(p){
      var c=p.new;
      var i=state.chats.findIndex(function(x){return x.id===c.id});
      if(i>=0)state.chats[i]=c;else state.chats.unshift(c);
      state.chats.sort(function(a,b){return new Date(b.last_time)-new Date(a.last_time)});
      if(state.tab==='chat'||state.tab==='home')render();
    })
    .subscribe();
  RTC.channel('rt-notifs-'+state.user.id)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+state.user.id},function(p){
      var n=p.new;
      if(!state.notifs.some(function(x){return x.id===n.id})){
        state.notifs.unshift(n);
        playSound();vib(20);
        showIsland(n.text,'bell','b');
        notifySystem('КМ·Инженер',n.text);
        if(state.tab==='home')render();
      }
    })
    .subscribe();
}

// РЕЗЕРВ: если сокет умер — опрос каждые 5 секунд (всё равно «видно»)
setInterval(function(){
  if(state.page==='chatroom'&&state.activeChat)loadMessages(state.activeChat.id);
},5000);

var _origSA=subscribeAll;
subscribeAll=function(){_origSA();ensureGlobalRT()};

var _origCR=renderChatRoom;
renderChatRoom=function(view){
  _origCR(view);
  if(state.activeChat){
    ensureRT(state.activeChat.id);
    markChatRead(state.activeChat.id);
    var inp=view.querySelector('#msgInput');
    if(inp)inp.addEventListener('input',function(){sendTyping(state.activeChat.id)});
    var subEl=view.querySelector('.chat-hd small');
    if(subEl){window._chatSubEl=subEl;window._chatSubOrig=subEl.textContent}
  }
};

var _origRM=renderMessages;
renderMessages=function(box){
  _origRM(box);
  var rows=box.querySelectorAll('.mrow');
  state.activeChatMessages.forEach(function(m,i){
    var row=rows[i];if(!row)return;
    var bub=row.querySelector('.bub');if(!bub)return;
    if(m.sender_id===state.user.id){
      var tm=row.querySelector('.tm');
      if(tm){
        var read=(m.read_by||[]).length>0;
        tm.textContent=(read?'✓✓ ':'✓ ')+fmtTime(m.time);
        if(read)tm.style.color='#7dffb0';
      }
    }
    var r=m.reactions||{};
    var keys=Object.keys(r);
    if(keys.length){
      var rw=h('div',{style:{display:'flex',gap:'4px',marginTop:'6px',flexWrap:'wrap'}});
      keys.forEach(function(k){
        var mine=(r[k]||[]).indexOf(String(state.user.id))>=0;
        rw.appendChild(h('button',{class:'press',style:{
          fontSize:'11px',fontWeight:'700',padding:'2px 8px',borderRadius:'12px',
          background:mine?'rgba(10,132,255,.25)':'rgba(120,150,190,.18)',
          border:mine?'1px solid rgba(10,132,255,.4)':'1px solid transparent',
          color:'inherit'
        },onclick:function(ev){ev.stopPropagation();toggleReaction(m,k)}},k+' '+r[k].length));
      });
      bub.appendChild(rw);
    }
    attachLongPress(bub,function(){showReactionPicker(m)});
  });
};
})();