// push.js — пуши + перевод голоса в текст
var VAPID_PUBLIC_KEY = 'BG2CGhCgW0qj8agahh4LfOgkD0yK-EwHIb77NJgCzIBCXojGZ6wPnkuCyDot6CeIKvrx84MQgcd7RtPj4yZzYLQ';

function urlBase64ToUint8Array(s) {
  var padding = '='.repeat((4 - s.length % 4) % 4);
  var b64 = (s + padding).replace(/\-/g, '+').replace(/_/g, '/');
  var raw = window.atob(b64);
  var arr = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function subscribePush() {
  if (!sbOk || !state.user) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    var p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('p256dh'))));
    var authKey = btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('auth'))));
    await sb.from('push_subscriptions').upsert(
      { user_id: state.user.id, endpoint: sub.endpoint, p256dh: p256dh, auth: authKey },
      { onConflict: 'endpoint' }
    );
    showIsland('Push-уведомления включены', 'bell', 'g');
  } catch (e) { console.error('Push:', e); }
}

// Автоподписка на пуши после входа
var _origRender = render;
render = function () {
  _origRender();
  if (state.user && sbOk && !state._pushDone) {
    state._pushDone = true;
    subscribePush();
  }
};

// ---------- ПЕРЕВОД ГОЛОСА В ТЕКСТ (кнопка 🎤 в чате) ----------
var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = null, isDictating = false, baseText = '';

if (SpeechRec) {
  recognition = new SpeechRec();
  recognition.lang = 'ru-RU';
  recognition.interimResults = true;
  recognition.onresult = function (e) {
    var text = '';
    for (var i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
    var inp = document.querySelector('#msgInput');
    if (inp) inp.value = (baseText ? baseText + ' ' : '') + text;
  };
  recognition.onend = function () {
    isDictating = false;
    state.recording = false;
    render();
  };
  recognition.onerror = function (e) {
    isDictating = false;
    state.recording = false;
    if (e.error === 'not-allowed') showIsland('Доступ к микрофону запрещён', 'warn', 'o');
    render();
  };
}

// 🎤 теперь диктует текст вместо записи аудио
var _origStartRec = startRecording, _origStopRec = stopRecording;

startRecording = async function () {
  if (!recognition) return _origStartRec();
  baseText = (document.querySelector('#msgInput') || { value: '' }).value || '';
  isDictating = true;
  state.recording = true;
  render();
  try { recognition.start(); showIsland('Говорите…', 'mic', 'b', 2000); } catch (e) {}
};

stopRecording = function () {
  if (isDictating) { try { recognition.stop(); } catch (e) {} return; }
  _origStopRec();
};