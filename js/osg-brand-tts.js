(function () {
  'use strict';

  var NARRATION_ROOT = 'assets/audio/narration/';
  var SPEAK_ENDPOINT = '/api/speak';
  var HUB_PAGES = { home: true, werbe: true, impressum: true, agb: true };

  var audioEl = null;
  var playing = false;
  var sessionCache = {};

  function assetBase() {
    if (window.OSGI18nConfig && typeof OSGI18nConfig.assetUrl === 'function') {
      return OSGI18nConfig.assetUrl('');
    }
    var scripts = document.querySelectorAll('script[src*="app.js"], script[src*="osg-brand-tts.js"]');
    var src = scripts.length ? scripts[scripts.length - 1].getAttribute('src') : 'js/app.js';
    return src.replace(/js\/(?:app|osg-brand-tts)\.js.*$/, '');
  }

  function buildIdQuery() {
    var id = window.OSG_BUILD_ID;
    return id ? '?v=' + encodeURIComponent(id) : '';
  }

  function speechTag(locale) {
    if (window.OSGI18nConfig && typeof OSGI18nConfig.speechTagFor === 'function') {
      return OSGI18nConfig.speechTagFor(locale);
    }
    return 'en-US';
  }

  function uiLocale(locale) {
    if (window.OSGI18nConfig && typeof OSGI18nConfig.uiPickerBase === 'function') {
      return OSGI18nConfig.uiPickerBase(locale || (window.i18next && i18next.language));
    }
    return 'en';
  }

  function pageContext() {
    var page = document.body.getAttribute('data-page');
    if (!page) return null;
    if (HUB_PAGES[page]) return { pageKey: page, view: 'hub' };
    var view = document.body.getAttribute('data-app-view');
    if (view === 'front' || view === 'desc') return { pageKey: page, view: view };
    return null;
  }

  function narrationUrl(pageKey, view, langTag) {
    return assetBase() + NARRATION_ROOT + pageKey + '/' + view + '/' + langTag + '.mp3' + buildIdQuery();
  }

  function ensureAudio() {
    if (audioEl) return audioEl;
    audioEl = new Audio();
    audioEl.preload = 'none';
    audioEl.addEventListener('ended', function () {
      playing = false;
      document.dispatchEvent(new CustomEvent('osg:ttsEnded'));
    });
    audioEl.addEventListener('pause', function () {
      if (audioEl && audioEl.currentTime > 0 && !audioEl.ended) return;
      playing = false;
      document.dispatchEvent(new CustomEvent('osg:ttsEnded'));
    });
    return audioEl;
  }

  function stop() {
    if (!audioEl) {
      playing = false;
      return;
    }
    try {
      audioEl.pause();
      audioEl.currentTime = 0;
      audioEl.removeAttribute('src');
      audioEl.load();
    } catch (err) { /* ignore */ }
    playing = false;
    document.dispatchEvent(new CustomEvent('osg:ttsEnded'));
  }

  function playUrl(url) {
    stop();
    var el = ensureAudio();
    return new Promise(function (resolve, reject) {
      function cleanup() {
        el.removeEventListener('canplaythrough', onReady);
        el.removeEventListener('error', onError);
      }
      function onReady() {
        cleanup();
        el.play().then(function () {
          playing = true;
          document.dispatchEvent(new CustomEvent('osg:ttsPlaying'));
          resolve();
        }).catch(reject);
      }
      function onError() {
        cleanup();
        reject(new Error('narration_play_failed'));
      }
      el.addEventListener('canplaythrough', onReady, { once: true });
      el.addEventListener('error', onError, { once: true });
      el.src = url;
      el.load();
    });
  }

  function playPageNarration(locale) {
    var ctx = pageContext();
    if (!ctx) return Promise.reject(new Error('no_page_context'));
    var tag = speechTag(uiLocale(locale));
    return playUrl(narrationUrl(ctx.pageKey, ctx.view, tag));
  }

  function fetchSpeakMp3(text, langTag) {
    var cacheKey = langTag + ':' + text.slice(0, 120);
    if (sessionCache[cacheKey]) {
      return Promise.resolve(sessionCache[cacheKey]);
    }
    return fetch(SPEAK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: text, lang: langTag })
    }).then(function (res) {
      if (!res.ok) throw new Error('speak_http_' + res.status);
      return res.arrayBuffer();
    }).then(function (buf) {
      var blob = new Blob([buf], { type: 'audio/mpeg' });
      var url = URL.createObjectURL(blob);
      sessionCache[cacheKey] = url;
      return url;
    });
  }

  function prepareText(text) {
    var out = String(text || '').trim();
    if (!out) return out;
    if (window.OSGTtsSpeechPrep && typeof OSGTtsSpeechPrep.pauliExpand === 'function') {
      out = OSGTtsSpeechPrep.pauliExpand(out);
    }
    return out;
  }

  function speak(text, lang) {
    var tag = speechTag(lang || uiLocale());
    var prepared = prepareText(text);
    var ctx = pageContext();

    if (ctx && (!prepared || prepared.length < 40)) {
      return playPageNarration(lang);
    }

    if (!prepared) return Promise.reject(new Error('empty_text'));

    return fetchSpeakMp3(prepared, tag).then(function (blobUrl) {
      return playUrl(blobUrl);
    });
  }

  function clearSessionCache() {
    Object.keys(sessionCache).forEach(function (key) {
      try { URL.revokeObjectURL(sessionCache[key]); } catch (err) { /* ignore */ }
    });
    sessionCache = {};
    stop();
  }

  function hasApi() {
    return !!pageContext() || true;
  }

  function getSpeakEndpoint() {
    return SPEAK_ENDPOINT;
  }

  function isPlaying() {
    return playing;
  }

  window.OSGBrandTts = {
    speak: speak,
    stop: stop,
    playPageNarration: playPageNarration,
    pageContext: pageContext,
    narrationUrl: narrationUrl,
    hasApi: hasApi,
    getSpeakEndpoint: getSpeakEndpoint,
    clearSessionCache: clearSessionCache,
    isPlaying: isPlaying
  };
  window.OSGBrandVoice = window.OSGBrandTts;
})();
