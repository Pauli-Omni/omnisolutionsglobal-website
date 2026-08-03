(function () {
  'use strict';

  // CRITICAL: DO NOT HARDCODE LANGUAGES. ALWAYS USE GLOBAL I18N SYSTEM. PARSE ABBREVIATIONS VIA PAULI-METHOD ONLY.

  var AUDIO_BASE = '/assets/audio/narration/ozgs/';
  var TAG_BY_LOCALE = {
    de: 'de-DE',
    en: 'en-US',
    th: 'th-TH',
    pl: 'pl-PL',
    ru: 'ru-RU',
    zh: 'zh-CN'
  };

  function t(key) {
    if (window.OSGI18n && typeof OSGI18n.t === 'function') return OSGI18n.t(key);
    if (window.i18next) return i18next.t(key);
    return key;
  }

  function currentLocale() {
    var lng = (window.i18next && i18next.language) || 'en';
    if (window.OSGI18nConfig && typeof OSGI18nConfig.uiPickerBase === 'function') {
      return OSGI18nConfig.uiPickerBase(lng);
    }
    return String(lng).split('-')[0].toLowerCase();
  }

  function audioUrlForLocale(locale) {
    var tag = TAG_BY_LOCALE[locale] || 'en-US';
    return AUDIO_BASE + tag + '.mp3?v=' + encodeURIComponent(window.OSG_BUILD_ID || '2026.07.30.01');
  }

  function initPlayer() {
    var audio = document.getElementById('ozgs-audio');
    var btn = document.getElementById('ozgs-audio-toggle');
    var progress = document.getElementById('ozgs-audio-progress');
    if (!audio || !btn) return;

    function setPlaying(playing) {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-label', t(playing ? 'ozgs.pauseAria' : 'ozgs.playAria'));
      btn.setAttribute('data-i18n-aria', playing ? 'ozgs.pauseAria' : 'ozgs.playAria');
    }

    function bindSource() {
      var locale = currentLocale();
      var preferred = audioUrlForLocale(locale);
      var fallback = audioUrlForLocale('en');
      audio.removeAttribute('src');
      audio.src = preferred;
      audio.load();
      audio.onerror = function () {
        if (audio.src.indexOf('en-US.mp3') >= 0) return;
        audio.src = fallback;
        audio.load();
      };
      setPlaying(false);
      if (progress) progress.style.width = '0%';
    }

    btn.addEventListener('click', function () {
      if (audio.paused) {
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            setPlaying(true);
          }).catch(function () {
            setPlaying(false);
          });
        } else {
          setPlaying(true);
        }
      } else {
        audio.pause();
        setPlaying(false);
      }
    });

    audio.addEventListener('timeupdate', function () {
      if (!progress || !audio.duration) return;
      var pct = Math.max(0, Math.min(100, (audio.currentTime / audio.duration) * 100));
      progress.style.width = pct.toFixed(2) + '%';
    });
    audio.addEventListener('ended', function () {
      setPlaying(false);
      if (progress) progress.style.width = '0%';
    });

    bindSource();
    if (window.i18next && typeof i18next.on === 'function') {
      i18next.on('languageChanged', function () {
        audio.pause();
        bindSource();
      });
    }
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function initWaitlist() {
    var form = document.getElementById('ozgs-waitlist-form');
    var msg = document.getElementById('ozgs-waitlist-msg');
    if (!form) return;

    function showMsg(text, ok) {
      if (!msg) return;
      msg.hidden = false;
      msg.textContent = text;
      msg.classList.toggle('is-ok', !!ok);
      msg.classList.toggle('is-err', !ok);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (document.getElementById('ozgs-email') || {}).value || '';
      var name = (document.getElementById('ozgs-name') || {}).value || '';
      var organisation = (document.getElementById('ozgs-org') || {}).value || '';
      if (!isEmail(email)) {
        showMsg(t('ozgs.waitlistEmailInvalid'), false);
        return;
      }

      var waitlistUrl = (typeof window.osgApiUrl === 'function')
        ? window.osgApiUrl('/api/ozgs/waitlist')
        : '/api/ozgs/waitlist';
      fetch(waitlistUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(email).trim(),
          name: String(name).trim(),
          organisation: String(organisation).trim(),
          locale: currentLocale(),
          source: 'homepage-ozgs'
        })
      }).then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, body: body };
        });
      }).then(function (result) {
        if (!result.ok) {
          showMsg(t('ozgs.waitlistError'), false);
          return;
        }
        form.reset();
        showMsg(t('ozgs.waitlistSuccess'), true);
      }).catch(function () {
        showMsg(t('ozgs.waitlistError'), false);
      });
    });
  }

  function init() {
    if (document.body.getAttribute('data-page') !== 'home') return;
    if (!document.getElementById('ozgs')) return;
    initPlayer();
    initWaitlist();
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(document.getElementById('ozgs'));
    }
  }

  window.OSGOzgs = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
