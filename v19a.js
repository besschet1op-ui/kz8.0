/* ===== КМ·Инженер v19a: QR-сканер, журнал смены, дни рождения ===== */
(function(){
// Догружаем jsQR, если нет
if(!window.jsQR){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';document.head.appendChild(s)}
ICONS.gift='<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>';

// ---------- ДНИ РОЖДЕНИЯ ----------
var BIRTHDAYS={'100123':'1968-03-12','100124':'1972-11-05','100125':'1975-08-21','100126':'1990-09-02','100127':'1985-08-25','100128':'1988-02-14','100129':'1979-12-01','100130':'1992-08-30','100131':'1986-05-18','100132':'1983-10-22','100133':'1995-08-21','100134':'1997-04-09'};
window.bdayInfo=function(e){var s=BIRTHDAYS[e.badge];if(!s)return null;var p=s.split('-');var by=+p[0],m=+p[1],d=+p[2];var t=now();var today=new Date(t.getFullYear(),t.getMonth(),t.getDate());var next=new Date(t.getFullYear(),m-1,d);if(next<today)next=new Date(t.getFullYear()+1,m-1,d);var days=Math.round((next-today)/86400000);return{days:days,turn:next.getFullYear()-by}};
function renderBdaySection(v){
var items=(state.employees||[]).map(function(e){return{e:e,bi:bdayInfo(e)}}).filter(function(x){return x.bi}).sort(function(a,b){return a.bi.days-b.bi.days}).slice(0,4);
if(!items.length)return;
v.appendChild(h('div',{class:'gtitle'},'🎂 ДНИ РОЖДЕНИЯ'));
items.forEach(function(x){v.appendChild(h('div',{class:'bday-card'},
h('span',{class:'cake'},x.bi.days===0?'🎉':'🎂'),
h('div',{},h('b',{},x.e.name),h('small',{},x.bi.days===0?'Сегодня! Исполняется '+x.bi.turn:'через '+x.bi.days+' дн. · исполнится '+x.bi.turn)),
h('span',{class:'days'},x.bi.days===0?'🥳':String(x.bi.days))))});
}
var _rs0=renderStaff;
renderStaff=function(v){_rs0(v);renderBdaySection(v)};
setTimeout(function(){(state.employees||[]).forEach(function(e){var bi=bdayInfo(e);if(bi&&bi.days===0)showIsland('🎂 Сегодня: '+e.name,'gift','w',6000)})},3000);

// ---------- QR-СКАНЕР ----------
var qrStream=null,qrRAF=null;
window.stopQR=function(){if(qrStream)qrStream.getTracks().forEach(function(t){t.stop()});if(qrRAF)cancelAnimationFrame(qrRAF);qrStream=null;qrRAF=null};
function startQR(cv,vd,cb){if(!navigator.mediaDevices){showIsland('Нет камеры','warn','o');return}navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(s){qrStream=s;vd.srcObject=s;vd.setAttribute('playsinline',true);vd.muted=true;vd.play();function tick(){if(vd.readyState===vd.HAVE_ENOUGH_DATA&&window.jsQR){cv.width=vd.videoWidth;cv.height=vd.videoHeight;try{var im=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);var c=jsQR(im.data,im.width,im.height);if(c&&c.data){cb(c.data);return}}catch(e){}}qrRAF=requestAnimationFrame(tick)}tick()}).catch(function(e){showIsland('Камера: '+String(e.message||e).slice(0,40),'warn','o')})}
function handleQR(d,res){res.innerHTML='';var pr=null;PRODUCTS.forEach(function(p){if(d.indexOf(p.serial)>=0||d.indexOf(p.name)>=0)pr=p});var em=null;state.employees.forEach(function(e){if(d.indexOf(e.badge)>=0)em=e});
var c=h('div',{class:'tcard'},h('div',{class:'r1'},h('span',{class:'tag tg-b'},'QR'),h('span',{class:'due'},fmtTime(now()))),h('b',{class:'tt'},d),h('div',{class:'row',style:{gap:'8px',flexWrap:'wrap',marginTop:'10px'}}));
var a=c.querySelector('.row');
if(pr)a.appendChild(h('button',{class:'btn sm b press',onclick:function(){state.page=null;state.tab='factory';prodSection='products';render()}},'⚙️ Изделие'));
if(em)a.appendChild(h('button',{class:'btn sm g press',onclick:function(){state.page=null;if(window.startChatWith)startChatWith(em)}},'💬 Чат'));
a.appendChild(h('button',{class:'btn sm card press',onclick:function(){try{navigator.clipboard.writeText(d)}catch(e){}showIsland('Скопировано','check','g')},'📋'));
a.appendChild(h('button',{class:'btn sm card press',onclick:function(){state.page='qr';render()}},'🔄'));
res.appendChild(c)}
window.renderQRPage=function(app){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){stopQR();state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📷 QR-сканер'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var vd=h('video',{class:'qr-video',muted:true,playsinline:true});
var cv=document.createElement('canvas');
b.appendChild(vd);
b.appendChild(h('div',{class:'txt-sm cl-m txt-c',style:{margin:'10px 0'}},'Наведите на QR-код изделия или табельный номер'));
var res=h('div',{});b.appendChild(res);
pg.appendChild(b);app.appendChild(pg);
startQR(cv,vd,function(d){stopQR();vib(30);showIsland('QR распознан ✅','check','g');handleQR(d,res)});
};

// ---------- ЖУРНАЛ СМЕНЫ ----------
state.shiftCheck=state.shiftCheck||{};state.shiftPhoto=null;
function localShifts(){try{return JSON.parse(localStorage.getItem('km-shifts')||'[]')}catch(e){return[]}}
window.attachShiftPhoto=function(){if(!sbOk){showIsland('Нужен Supabase','warn','o');return}var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async function(){var f=i.files&&i.files[0];if(!f)return;showIsland('Фото…','cloud','b',4000);try{var u=await uploadToStorage(f,'shift/'+Date.now()+'_'+uid()+'_'+f.name.replace(/[^a-zA-Z0-9.\-_]/g,'_'),f.type||'image/jpeg');state.shiftPhoto=u;var e=$('#shPhotoName');if(e)e.textContent='✅'}catch(e){showIsland('Ошибка фото','warn','o')}};i.click()};
window.createShiftLog=async function(){
var n=($('#shNote')||{}).value||'',a=($('#shArea')||{}).value||'';
if(!n.trim()){showIsland('Опишите смену','warn','o');return}
var rec={area:a,note:n.trim(),checklist:state.shiftCheck,photo_url:state.shiftPhoto,author_name:state.user?state.user.name:'—',created_at:new Date().toISOString()};
var ok=false;
if(sbOk&&state.user){try{await sb.from('shift_logs').insert({author_id:state.user.id,author_name:rec.author_name,area:a,note:rec.note,checklist:rec.checklist,photo_url:rec.photo_url});ok=true}catch(e){ok=false}}
if(!ok){var ls=localShifts();ls.unshift(rec);localStorage.setItem('km-shifts',JSON.stringify(ls))}
if(sbOk&&state.user)['e1','e2','e3'].forEach(function(id){sb.from('notifications').insert({user_id:id,text:'📒 Смена: '+a+' — '+rec.author_name,type:'event'})});
state.shiftCheck={};state.shiftPhoto=null;
showIsland('Смена передана ✅','check','g');vib(20);
state.page='shift';render();
};
function drawShiftList(l,rows){
l.innerHTML='';
if(!rows.length){l.appendChild(h('div',{class:'empty'},'Записей нет'));return}
rows.forEach(function(x){
var c=h('div',{class:'tcard'},h('div',{class:'r1'},h('span',{class:'tag tg-v'},x.area||'—'),h('span',{class:'due'},fmtDT(x.created_at))),h('b',{class:'tt'},x.author_name||''),h('div',{class:'desc'},x.note||''));
var bd=Object.keys(x.checklist||{}).filter(function(k){return x.checklist[k]});
if(bd.length){var bw=h('div',{style:{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'8px'}});bd.forEach(function(b2){bw.appendChild(h('span',{class:'tag '+(b2.indexOf('замечан')>=0?'tg-o':'tg-g')},b2))});c.appendChild(bw)}
if(x.photo_url)c.appendChild(h('img',{src:x.photo_url,style:{width:'100%',borderRadius:'12px',marginTop:'6px'},loading:'lazy'}));
l.appendChild(c);
});
}
async function loadShiftLogs(){var l=$('#shiftList');if(!l)return;if(!sbOk){drawShiftList(l,localShifts());return}try{var r=await sb.from('shift_logs').select('*').order('created_at',{ascending:false}).limit(20);if(r.error)throw r.error;drawShiftList(l,r.data||[])}catch(e){drawShiftList(l,localShifts())}}
window.renderShiftPage=function(app){
var pg=h('div',{class:'page on'});
pg.appendChild(h('div',{class:'nav'},h('button',{class:'back press',onclick:function(){state.page=null;render()},html:icon('back')}),h('div',{class:'nav-title'},'📒 Журнал смены'),h('div',{class:'nav-sp'})));
var b=h('div',{style:{padding:'16px',overflowY:'auto',flex:'1'}});
var f=h('div',{class:'card',style:{padding:'14px'}});
var s=h('select',{id:'shArea'});['Л-1','Л-2','Л-3','Л-5','ЧПУ-07','Цех №3','Цех №5'].forEach(function(a){s.appendChild(h('option',{value:a},a))});
f.appendChild(h('div',{class:'fld'},h('label',{},'Участок'),s));
f.appendChild(h('div',{class:'fld'},h('label',{},'Состояние'),h('textarea',{id:'shNote',rows:'3',placeholder:'Что передаёте…'})));
var ch=h('div',{class:'chips',style:{margin:'0 0 12px'}});
['Оборудование ОК','Безопасность ОК','Инструмент ОК','Есть замечания'].forEach(function(c){ch.appendChild(h('button',{class:'chip press'+(state.shiftCheck[c]?' on':''),onclick:function(){state.shiftCheck[c]=!state.shiftCheck[c];render()}},c))});
f.appendChild(ch);
f.appendChild(h('div',{class:'row',style:{gap:'8px',marginBottom:'12px'}},h('button',{class:'btn sm card press',onclick:attachShiftPhoto},'📷 Фото'),h('span',{class:'txt-sm cl-m',id:'shPhotoName'},state.shiftPhoto?'✅':'нет фото')));
f.appendChild(h('button',{class:'btn b full press',onclick:createShiftLog},'✅ Передать смену'));
b.appendChild(f);
b.appendChild(h('div',{class:'gtitle'},'ПОСЛЕДНИЕ'));
b.appendChild(h('div',{id:'shiftList'},h('div',{class:'empty'},'…')));
pg.appendChild(b);app.appendChild(pg);
loadShiftLogs();
};

// ---------- РОУТИНГ СТРАНИЦ ----------
var _rpo=renderPageOverlay;
renderPageOverlay=function(app){
if(state.page==='qr'){renderQRPage(app);return}
if(state.page==='shift'){renderShiftPage(app);return}
stopQR();
_rpo(app);
};
})();