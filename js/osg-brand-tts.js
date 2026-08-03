(function () {
  'use strict';

  var NARRATION_ROOT = 'assets/audio/narration/';
  function speakEndpoint() {
    return (typeof window.osgApiUrl === 'function')
      ? window.osgApiUrl('/api/speak')
      : '/api/speak';
  }
  var SEEK_STEP_SEC = 10;
  /** Brand-voice Thai MP3s (ElevenLabs) play at natural tempo; 1.28 was only for slow system-fallback audio. */
  var RATE_TH = 1.0;
  /** Slight ease for denser scripts / longer compound rhythm. */
  var RATE_ZH = 0.94;
  var RATE_RU = 0.96;
  var RATE_DEFAULT = 1.0;
  var HUB_PAGES = {
    home: true,
    werbe: true,
    impressum: true,
    agb: true,
    about: true,
    presentation: true
  };

  var audioEl = null;
  var playing = false;
  var paused = false;
  var sessionCache = {};
  var activeLangTag = 'en-US';

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

  function playbackRateForTag(langTag) {
    var tag = String(langTag || '').toLowerCase();
    if (tag.indexOf('th') === 0) return RATE_TH;
    if (tag.indexOf('zh') === 0) return RATE_ZH;
    if (tag.indexOf('ru') === 0) return RATE_RU;
    return RATE_DEFAULT;
  }

  function applyRate(el, langTag) {
    if (!el) return;
    var rate = playbackRateForTag(langTag || activeLangTag);
    try {
      el.defaultPlaybackRate = rate;
      el.playbackRate = rate;
    } catch (err) { /* ignore */ }
  }

  function pageContext() {
    var page = document.body.getAttribute('data-page');
    if (!page) return null;
    if (HUB_PAGES[page]) return { pageKey: page, view: 'hub' };
    var view = document.body.getAttribute('data-app-view');
    if (view === 'front' || view === 'desc' || view === 'agb') {
      return { pageKey: page, view: view === 'agb' ? 'desc' : view };
    }
    // Fallback: any product-ish page key still tries front narration.
    if (page && page !== 'opsVoiceCheck') return { pageKey: page, view: 'front' };
    return null;
  }

  function narrationUrl(pageKey, view, langTag) {
    return assetBase() + NARRATION_ROOT + pageKey + '/' + view + '/' + langTag + '.mp3' + buildIdQuery();
  }

  function emitState() {
    document.dispatchEvent(new CustomEvent('osg:ttsState', {
      detail: {
        playing: playing,
        paused: paused,
        currentTime: audioEl ? audioEl.currentTime : 0,
        duration: audioEl && isFinite(audioEl.duration) ? audioEl.duration : 0,
        rate: playbackRateForTag(activeLangTag)
      }
    }));
  }

  function ensureAudio() {
    if (audioEl) return audioEl;
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.addEventListener('ended', function () {
      playing = false;
      paused = false;
      document.dispatchEvent(new CustomEvent('osg:ttsEnded'));
      emitState();
    });
    audioEl.addEventListener('timeupdate', function () {
      emitState();
    });
    audioEl.addEventListener('play', function () {
      playing = true;
      paused = false;
      applyRate(audioEl, activeLangTag);
      document.dispatchEvent(new CustomEvent('osg:ttsPlaying'));
      emitState();
    });
    audioEl.addEventListener('pause', function () {
      if (!audioEl) return;
      if (audioEl.ended || audioEl.currentTime <= 0.05) {
        playing = false;
        paused = false;
      } else {
        playing = false;
        paused = true;
      }
      emitState();
    });
    return audioEl;
  }

  function stop() {
    if (!audioEl) {
      playing = false;
      paused = false;
      emitState();
      return;
    }
    try {
      audioEl.pause();
      audioEl.currentTime = 0;
      audioEl.removeAttribute('src');
      audioEl.load();
    } catch (err) { /* ignore */ }
    playing = false;
    paused = false;
    document.dispatchEvent(new CustomEvent('osg:ttsEnded'));
    emitState();
  }

  function pause() {
    var el = ensureAudio();
    if (!el.src) return;
    try { el.pause(); } catch (err) { /* ignore */ }
    playing = false;
    paused = el.currentTime > 0.05 && !el.ended;
    emitState();
  }

  function resume() {
    var el = ensureAudio();
    if (!el.src) return Promise.reject(new Error('nothing_to_resume'));
    applyRate(el, activeLangTag);
    return el.play().then(function () {
      playing = true;
      paused = false;
      document.dispatchEvent(new CustomEvent('osg:ttsPlaying'));
      emitState();
    });
  }

  function seekBy(seconds) {
    var el = ensureAudio();
    if (!el.src || !isFinite(el.duration) || el.duration <= 0) return;
    // Keep playback going after ±10s — no second Play tap needed.
    var wasPlaying = playing || (!el.paused && !el.ended);
    var next = el.currentTime + Number(seconds || 0);
    if (next < 0) next = 0;
    if (next > el.duration) next = el.duration;
    try { el.currentTime = next; } catch (err) { /* ignore */ }
    if (wasPlaying || paused) {
      applyRate(el, activeLangTag);
      el.play().then(function () {
        playing = true;
        paused = false;
        document.dispatchEvent(new CustomEvent('osg:ttsPlaying'));
        emitState();
      }).catch(function () {
        emitState();
      });
      return;
    }
    emitState();
  }

  function playUrl(url, langTag) {
    activeLangTag = langTag || activeLangTag;
    var el = ensureAudio();
    // Soft restart of the same element without wiping transport mid-load.
    try {
      el.pause();
    } catch (err) { /* ignore */ }
    return new Promise(function (resolve, reject) {
      function cleanup() {
        el.removeEventListener('canplaythrough', onReady);
        el.removeEventListener('error', onError);
      }
      function onReady() {
        cleanup();
        applyRate(el, activeLangTag);
        el.play().then(function () {
          playing = true;
          paused = false;
          document.dispatchEvent(new CustomEvent('osg:ttsPlaying'));
          emitState();
          resolve();
        }).catch(reject);
      }
      function onError() {
        cleanup();
        playing = false;
        paused = false;
        emitState();
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
    activeLangTag = tag;
    return playUrl(narrationUrl(ctx.pageKey, ctx.view, tag), tag);
  }

  function togglePlayPause(locale) {
    var el = ensureAudio();
    // Source of truth: audio element, not stale flags.
    var isPlaying = el && el.src && !el.paused && !el.ended;
    if (isPlaying || playing) {
      pause();
      return Promise.resolve({ action: 'pause' });
    }
    if ((paused || (el && el.src && el.currentTime > 0.05 && el.paused)) && el && el.src) {
      return resume().then(function () { return { action: 'resume' }; });
    }
    return playPageNarration(locale).then(function () { return { action: 'play' }; });
  }

  function fetchSpeakMp3(text, langTag) {
    var cacheKey = langTag + ':' + text.slice(0, 120);
    if (sessionCache[cacheKey]) {
      return Promise.resolve(sessionCache[cacheKey]);
    }
    return fetch(speakEndpoint(), {
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

    // Prefer static page MP3s whenever a page context exists — cloud /api/speak is fallback only.
    if (ctx) {
      return playPageNarration(lang).catch(function () {
        if (!prepared) return Promise.reject(new Error('empty_text'));
        return fetchSpeakMp3(prepared, tag).then(function (blobUrl) {
          return playUrl(blobUrl, tag);
        });
      });
    }

    if (!prepared) return Promise.reject(new Error('empty_text'));

    return fetchSpeakMp3(prepared, tag).then(function (blobUrl) {
      return playUrl(blobUrl, tag);
    }).catch(function (err) {
      // Cloud TTS down → still try page narration if context appears late.
      if (pageContext()) return playPageNarration(lang);
      return Promise.reject(err);
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

  function isPaused() {
    return paused;
  }

  function getState() {
    return {
      playing: playing,
      paused: paused,
      currentTime: audioEl ? audioEl.currentTime : 0,
      duration: audioEl && isFinite(audioEl.duration) ? audioEl.duration : 0,
      rate: playbackRateForTag(activeLangTag),
      langTag: activeLangTag
    };
  }

  window.OSGBrandTts = {
    speak: speak,
    stop: stop,
    pause: pause,
    resume: resume,
    seekBy: seekBy,
    seekBack: function () { seekBy(-SEEK_STEP_SEC); },
    seekForward: function () { seekBy(SEEK_STEP_SEC); },
    togglePlayPause: togglePlayPause,
    playPageNarration: playPageNarration,
    pageContext: pageContext,
    narrationUrl: narrationUrl,
    hasApi: hasApi,
    getSpeakEndpoint: getSpeakEndpoint,
    clearSessionCache: clearSessionCache,
    isPlaying: isPlaying,
    isPaused: isPaused,
    getState: getState,
    playbackRateForTag: playbackRateForTag,
    SEEK_STEP_SEC: SEEK_STEP_SEC,
    RATE_TH: RATE_TH
  };
  window.OSGBrandVoice = window.OSGBrandTts;
})();
