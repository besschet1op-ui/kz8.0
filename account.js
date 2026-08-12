// ============ ПАМЯТЬ АККАУНТА + FACE ID + PWA ============

// Восстановление последней вкладки
state.tab = localStorage.getItem('km-tab') || 'home';

// Face ID: если включён — блокируем приложение при запуске
if (localStorage.getItem('km-face') === '1') state.locked = true;

// Ждём, пока основной скрипт поднимет Supabase
function waitSB(ms) {
  return new Promise(function (res) {
    var t = 0;
    var iv = setInterval(function () {
      t += 200;
      if (sbOk && sb) { clearInterval(iv); res(true); }
      else if (t >= ms) { clearInterval(iv); res(false); }
    }, 200);
  });
}

// АВТОВХОД: восстанавливаем сессию Supabase + офлайн-профиль из памяти
(async function () {
  var ok = await waitSB(6000);
  if (ok) {
    try {
      var sess = await sb.auth.getSession();
      if (sess.data.session && !state.user) {
        await loadProfile(sess.data.session.user.id);
        subscribeAll();
        showIsland('С возвращением, ' + (state.user.name || '').split(' ')[1] + '!', 'user', 'b');
      }
    } catch (e) {}
  } else if (!state.user) {
    // Офлайн: достаём профиль из локальной памяти
    try {
      var c = localStorage.getItem('km-profile-cache');
      if (c) {
        state.user = JSON.parse(c);
        showIsland('Офлайн: профиль из памяти', 'cloud', 'o');
      }
    } catch (e) {}
  }
  render();
})();

// ПАМЯТЬ: кешируем профиль и вкладку при каждом render
var _origRenderAcc = render;
render = function () {
  _origRenderAcc();
  try {
    if (state.user && state.user.id && String(state.user.id).length > 8) {
      localStorage.setItem('km-profile-cache', JSON.stringify(state.user));
    }
    localStorage.setItem('km-tab', state.tab);
  } catch (e) {}
};

// При выходе — очищаем память
var _origLogoutAcc = doLogout;
doLogout = async function () {
  localStorage.removeItem('km-profile-cache');
  localStorage.removeItem('km-tab');
  await _origLogoutAcc();
};

// ЛИЧНЫЙ КАБИНЕТ: добавляем разделы Face ID + Установка PWA
var _origProfileAcc = renderProfile;
renderProfile = function (view) {
  _origProfileAcc(view);

  view.appendChild(h('div', { class: 'gtitle' }, 'БЕЗОПАСНОСТЬ'));
  view.appendChild(h('div', { class: 'card' },
    h('button', { class: 'grow', onclick: function () {
      if (state.face) {
        if (confirm('Отключить вход по Face ID?')) {
          localStorage.removeItem('km-face');
          localStorage.removeItem('km-face-id');
          state.face = false;
          showIsland('Face ID отключён', 'user', 'o');
          render();
        }
      } else {
        enableFaceID().then(function () { render(); });
      }
    }},
      h('div', { class: 'ava gray', html: icon('user') }),
      h('div', { style: { flex: '1' } },
        h('b', {}, 'Вход по Face ID'),
        h('small', { class: 'cl-m' }, state.face ? 'Включён — приложение защищено' : 'Выключен')
      ),
      h('div', { class: 'tgl' + (state.face ? ' on' : '') })
    )
  ));

  view.appendChild(h('div', { class: 'gtitle' }, 'ПРИЛОЖЕНИЕ'));
  view.appendChild(h('div', { class: 'card' },
    h('button', { class: 'grow', onclick: function () {
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt = null;
      } else if (isIOS() && !isStandalone()) {
        showIsland('Поделиться → На экран «Домой»', 'plus', 'b', 4000);
      } else if (isStandalone()) {
        showIsland('Приложение уже установлено ✅', 'check', 'g');
      } else {
        showIsland('Откройте меню браузера → Установить', 'plus', 'b', 4000);
      }
    }},
      h('div', { class: 'ava gray', html: icon('cloud') }),
      h('div', { style: { flex: '1' } },
        h('b', {}, 'Установить приложение'),
        h('small', { class: 'cl-m' }, isStandalone() ? 'Работает как приложение ✅' : 'PWA на домашний экран')
      ),
      h('span', { class: 'cl-gr' }, '→')
    ),
    h('div', { class: 'grow' },
      h('div', { class: 'ava gray', html: icon('gear') }),
      h('div', { style: { flex: '1' } },
        h('b', {}, 'Версия'),
        h('small', { class: 'cl-m' }, 'КМ·Инженер 10.9 · PWA · Face ID · Push')
      )
    )
  ));
};