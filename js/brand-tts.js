(function () {
  'use strict';

  // CRITICAL: DO NOT HARDCODE LANGUAGES. ALWAYS USE GLOBAL I18N SYSTEM. PARSE ABBREVIATIONS VIA PAULI-METHOD ONLY.

  var MAX_CHUNK = 480;
  var _sessionCache = Object.create(null);

  function config() {
    return window.OSG_VOICE_CONFIG || {};
  }

  function resolveSpeakEndpoint(stream) {
    var cfg = config().brandTtsEndpoint;
    var base = cfg;
    if (!base) {
      var loc = window.location;
      if (!loc || !loc.hostname) return '';
      base = loc.protocol + '//' + loc.host;
    }
    base = base.replace(/\/api\/speak\/?$/, '').replace(/\/$/, '');
    return stream ? base + '/api/speak/stream' : base + '/api/speak';
  }

  function langShort(langTag) {
    var tag = String(langTag || 'de-DE');
    if (tag.indexOf('zh') === 0) return 'zh';
    return tag.split('-')[0].toLowerCase();
  }

  function assetVersion() {
    return (config().assetVersion || '1');
  }

  function ensureScriptModule(attr, srcPath) {
    if (attr === 'data-osg-tts-english-terms' && window.OSGTtsEnglishTerms) return Promise.resolve();
    if (attr === 'data-osg-tts-speech-prep' && window.OSGTtsSpeechPrep) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[' + attr + ']');
      if (existing) {
        existing.addEventListener('load', function () { resolve(); });
        existing.addEventListener('error', reject);
        return;
      }
      var script = document.createElement('script');
      script.src = srcPath + '?v=' + assetVersion();
      script.setAttribute(attr, '1');
      script.onload = function () { resolve(); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function ensureEnglishTermsModule() {
    return ensureScriptModule('data-osg-tts-english-terms', 'js/tts-english-terms.js');
  }

  function ensureSpeechPrepModule() {
    return ensureScriptModule('data-osg-tts-speech-prep', 'js/tts-speech-prep.js');
  }

  function splitChunks(text) {
    var full = String(text || '').trim();
    if (!full) return [];
    if (full.length <= MAX_CHUNK) return [full];

    var parts = full.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [full];
    var chunks = [];
    var buf = '';
    parts.forEach(function (p) {
      var piece = p.trim();
      if (!piece) return;
      if ((buf + ' ' + piece).trim().length > MAX_CHUNK) {
        if (buf) chunks.push(buf.trim());
        buf = piece;
      } else {
        buf = buf ? buf + ' ' + piece : piece;
      }
    });
    if (buf) chunks.push(buf.trim());
    return chunks.length ? chunks : [full];
  }

  function pageContext() {
    var appId = document.body.getAttribute('data-app-id');
    var app = window.OSGAppRegistry ? OSGAppRegistry.getById(appId) : null;
    var pageKey = app ? app.pageKey : (document.body.getAttribute('data-page') || 'page');
    var view = 'front';
    if (document.body.getAttribute('data-app-view') === 'agb') view = 'agb';
    else if (document.body.classList.contains('app-page--desc')) view = 'desc';
    var cfg = window.OSGI18nConfig;
    var fallbackTag = cfg
      ? cfg.speechTagFor(cfg.normalizeLocale(
        window.i18next && i18next.language ? i18next.language : cfg.FALLBACK_LOCALES[0]
      ))
      : 'en-US';
    var langTag = window.OSGWorldLang && OSGWorldLang.getEffectiveSpeechTag
      ? OSGWorldLang.getEffectiveSpeechTag()
      : (window.OSGWorldLang ? OSGWorldLang.getSpeechTag() : fallbackTag);
    return {
      pageKey: pageKey,
      view: view,
      langTag: langTag,
      short: langShort(langTag)
    };
  }

  window.OSGBrandTts = {
    _audio: null,
    _abort: false,

    hasApi: function () {
      return !!resolveSpeakEndpoint(false);
    },

    getSpeakEndpoint: function () {
      return resolveSpeakEndpoint(false);
    },

    stop: function () {
      this._abort = true;
      if (this._audio) {
        this._audio.pause();
        this._audio.currentTime = 0;
        this._audio.src = '';
        this._audio = null;
      }
    },

    clearSessionCache: function () {
      Object.keys(_sessionCache).forEach(function (key) {
        try { URL.revokeObjectURL(_sessionCache[key]); } catch (e) { /* ignore */ }
        delete _sessionCache[key];
      });
    },

    _playUrl: function (url) {
      var self = this;
      return new Promise(function (resolve, reject) {
        if (self._abort) {
          reject(new Error('aborted'));
          return;
        }
        var audio = new Audio(url);
        self._audio = audio;
        audio.onended = function () { resolve(); };
        audio.onerror = function () { reject(new Error('audio')); };
        var p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(reject);
      });
    },

    _fetchDynamicAudio: function (text, langTag, useStream) {
      var endpoint = resolveSpeakEndpoint(!!useStream);
      if (!endpoint) return Promise.reject(new Error('no-api'));

      var ctx = pageContext();
      var cacheKey = ctx.pageKey + '::' + ctx.view + '::' + langTag + '::' + text;
      if (_sessionCache[cacheKey]) {
        return Promise.resolve(_sessionCache[cacheKey]);
      }

      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        cache: 'no-store',
        body: JSON.stringify({
          text: text,
          lang: langTag,
          pageKey: ctx.pageKey,
          view: ctx.view,
          stream: !!useStream
        })
      }).then(function (res) {
        if (res.ok) return res.blob();
        return res.json().catch(function () { return {}; }).then(function (body) {
          var code = body && body.error ? body.error : 'api';
          var err = new Error(code);
          err.code = code;
          throw err;
        });
      }).then(function (blob) {
        var url = URL.createObjectURL(blob);
        _sessionCache[cacheKey] = url;
        return url;
      });
    },

    _flattenSegments: function (segments) {
      var flat = [];
      (segments || []).forEach(function (seg) {
        if (!seg || !seg.text) return;
        splitChunks(seg.text).forEach(function (piece) {
          flat.push({ text: piece, lang: seg.lang });
        });
      });
      return flat;
    },

    _speakChunksDynamic: function (chunks, langTag, hooks) {
      var self = this;
      var useStream = chunks.length === 1;
      var chain = Promise.resolve();
      chunks.forEach(function (chunk, idx) {
        chain = chain.then(function () {
          if (self._abort) throw new Error('aborted');
          if (hooks && hooks.onProgress) hooks.onProgress(idx + 1, chunks.length);
          return self._fetchDynamicAudio(chunk, langTag, useStream && idx === 0).then(function (url) {
            return self._playUrl(url);
          });
        });
      });
      return chain;
    },

    _speakSegmentsDynamic: function (segments, hooks) {
      var self = this;
      var flat = self._flattenSegments(segments);
      if (!flat.length) return Promise.reject(new Error('empty'));
      var useStream = flat.length === 1;
      var chain = Promise.resolve();
      flat.forEach(function (seg, idx) {
        chain = chain.then(function () {
          if (self._abort) throw new Error('aborted');
          if (hooks && hooks.onProgress) hooks.onProgress(idx + 1, flat.length);
          return self._fetchDynamicAudio(seg.text, seg.lang, useStream && idx === 0).then(function (url) {
            return self._playUrl(url);
          });
        });
      });
      return chain;
    },

    speak: function (text, langTag, hooks) {
      var self = this;
      this._abort = false;

      if (!text) {
        if (hooks && hooks.onError) hooks.onError('empty');
        return Promise.reject(new Error('empty'));
      }

      if (!self.hasApi()) {
        if (hooks && hooks.onError) hooks.onError('no-api');
        return Promise.reject(new Error('no-api'));
      }

      if (hooks && hooks.onStart) hooks.onStart('dynamic-clone');
      return ensureSpeechPrepModule().then(function () {
        return ensureEnglishTermsModule();
      }).then(function () {
        var preparedText = window.OSGTtsSpeechPrep && OSGTtsSpeechPrep.pauliExpand
          ? OSGTtsSpeechPrep.pauliExpand(text)
          : text;
        return preparedText;
      }).then(function (preparedText) {
        if (window.OSGTtsEnglishTerms && OSGTtsEnglishTerms.prepareSegments) {
          return OSGTtsEnglishTerms.prepareSegments(preparedText, langTag);
        }
        return [{ text: preparedText, lang: langTag }];
      }).then(function (segments) {
        return self._speakSegmentsDynamic(segments, hooks);
      }).then(function () {
        if (hooks && hooks.onEnd) hooks.onEnd();
      }).catch(function (err) {
        if (self._abort || err.message === 'aborted') return;
        var code = err.code || err.message || 'failed';
        var msg = String(err.message || '');
        if (hooks && hooks.onError) {
          if (code === 'unsupported_language' || /not supported|unsupported_language/i.test(msg)) {
            hooks.onError('lang');
          } else if (code === 'elevenlabs_key_missing') {
            hooks.onError('elevenlabs_key_missing');
          } else if (code === 'xtts_unavailable' || code === 'tts_engine_unavailable' ||
              code === 'no_tts_engine' || code === 'local_reference_missing') {
            hooks.onError('no-brand-voice');
          } else {
            hooks.onError('failed');
          }
        }
        throw err;
      });
    }
  };
})();
