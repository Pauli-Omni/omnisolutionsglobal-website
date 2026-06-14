(function () {
  'use strict';

  var STATES = { DEACTIVATED: 'deactivated', PLAYING: 'playing' };

  function speechLangTag() {
    if (window.OSGWorldLang && OSGWorldLang.getEffectiveSpeechTag) {
      return OSGWorldLang.getEffectiveSpeechTag();
    }
    var cfg = window.OSGI18nConfig;
    if (!cfg) return 'en-US';
    var lng = window.i18next && i18next.language
      ? i18next.language
      : cfg.FALLBACK_LOCALES[0];
    return cfg.speechTagFor(cfg.normalizeLocale(lng));
  }

  function stripHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
  }

  var OPS_PATH = '/ops/voice-check.html';

  function isLocalDev() {
    var host = window.location && window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }

  function isFileProtocol() {
    return !!(window.location && window.location.protocol === 'file:');
  }

  var CLOUD_SPEECH_LANGS = { th: 1, vi: 1 };

  function isCloudSpeechLang() {
    var tag = String(speechLangTag() || '').toLowerCase();
    var base = tag.split('-')[0];
    return !!CLOUD_SPEECH_LANGS[base];
  }

  function tVoice(key) {
    if (!window.i18next) return key;
    return i18next.t(key, { opsPath: OPS_PATH, year: new Date().getFullYear() });
  }

  window.OSGVoice = {
    state: STATES.DEACTIVATED,
    _btn: null,
    _bound: false,

    init: function () {
      var btn = document.getElementById('voice-btn');
      if (!btn) return;

      this._btn = btn;
      this.setState(STATES.DEACTIVATED);
      btn.setAttribute('data-voice-provider', 'dynamic-voice-clone');

      if (!window.OSGBrandTts) {
        btn.disabled = true;
        btn.setAttribute('data-i18n-aria', 'voice.unsupported');
        if (window.OSGI18n) OSGI18n.applyToDom();
        return;
      }

      if (this._bound) return;
      this._bound = true;

      btn.addEventListener('click', this._onClick.bind(this));
      this._bindLangModal();
      this._prefetchServerStatus();

      var self = this;
      if (window.i18next && !i18next._osgVoiceLangStop) {
        i18next._osgVoiceLangStop = true;
        i18next.on('languageChanged', function () { self.stop(); });
      }
    },

    setState: function (state) {
      this.state = state;
      if (!this._btn) return;
      this._btn.classList.remove('voice-btn--deactivated', 'voice-btn--playing');
      this._btn.classList.add('voice-btn--' + state);
      this._btn.setAttribute('data-state', state);

      var ariaKey = state === STATES.PLAYING ? 'voice.ariaPlaying' : 'voice.ariaDeactivated';
      this._btn.setAttribute('data-i18n-aria', ariaKey);
      this._btn.setAttribute('aria-pressed', state === STATES.PLAYING ? 'true' : 'false');
      if (window.OSGI18n) OSGI18n.applyToDom();
    },

    _onClick: function () {
      if (this.state === STATES.PLAYING) {
        this.stop();
        return;
      }
      this.speakPageContent();
    },

    getPageText: function () {
      if (document.body.getAttribute('data-app-view') === 'agb' && window.OSGI18n) {
        var agbKeys = [
          'omniqr.terms.s1Title', 'omniqr.terms.s1Text',
          'omniqr.terms.s2Title', 'omniqr.terms.s2Text',
          'omniqr.terms.s3Title', 'omniqr.terms.s3P1', 'omniqr.terms.s3P2',
          'omniqr.terms.s4Title', 'omniqr.terms.s4Text'
        ];
        var agbParts = agbKeys.map(function (key) {
          return stripHtml(OSGI18n.t(key));
        }).filter(function (part) {
          return part && agbKeys.indexOf(part) < 0;
        });
        if (agbParts.length) return agbParts.join(' ');
      }

      var appId = document.body.getAttribute('data-app-id');
      var app = window.OSGAppRegistry ? OSGAppRegistry.getById(appId) : null;

      if (app && window.OSGI18n) {
        var key = document.body.classList.contains('app-page--desc')
          ? app.pageKey + '.pageDesc'
          : app.pageKey + '.frontWerbetext';
        var fromI18n = stripHtml(OSGI18n.t(key));
        if (fromI18n && fromI18n !== key) return fromI18n;
      }

      var front = document.getElementById('app-front-werbetext');
      var desc = document.getElementById('app-desc-body');
      var el = front || desc;
      if (el) {
        return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      }

      var main = document.getElementById('main');
      if (main) {
        return (main.innerText || main.textContent || '').replace(/\s+/g, ' ').trim();
      }

      return '';
    },

    _whenLangReady: function () {
      if (!window.i18next) return Promise.resolve();
      if (i18next.isLanguageChangingTo) {
        return i18next.changeLanguage(i18next.isLanguageChangingTo);
      }
      return Promise.resolve();
    },

    speakPageContent: function () {
      var self = this;

      if (!window.OSGBrandTts) {
        this._notify('voice.unsupported');
        return;
      }

      this._whenLangReady().then(function () {
        if (window.OSGWorldLang && OSGWorldLang.syncSpeechFromUiLocale && window.i18next) {
          OSGWorldLang.syncSpeechFromUiLocale(i18next.language);
        }
        if (window.OSGBrandTts && OSGBrandTts.clearSessionCache) {
          OSGBrandTts.clearSessionCache();
        }
        if (window.OSGI18n) OSGI18n.applyToDom();

        var text = self.getPageText();
        if (!text) {
          self._notify('voice.ttsError');
          return;
        }

        var langTag = speechLangTag();

        return OSGBrandTts.speak(text, langTag, {
          onStart: function () { self.setState(STATES.PLAYING); },
          onEnd: function () { self.setState(STATES.DEACTIVATED); },
          onError: function (code) {
            self.setState(STATES.DEACTIVATED);
            self._notifyError(code);
          }
        });
      }).catch(function () {
        self.setState(STATES.DEACTIVATED);
      });
    },

    stop: function () {
      if (window.OSGBrandTts) OSGBrandTts.stop();
      this.setState(STATES.DEACTIVATED);
    },

    _errorKeyFor: function (code) {
      if (code === 'lang') return 'voice.brandVoiceLangUnsupported';
      if (code === 'connect-failed') {
        return isLocalDev() ? 'voice.brandVoiceConnectFailed' : 'voice.brandVoiceServerError';
      }
      if (code === 'no-api') {
        if (isFileProtocol()) return 'voice.brandVoiceNoApi';
        if (isLocalDev()) return 'voice.brandVoiceLocalHost';
        return 'voice.brandVoiceServerNotReady';
      }
      if (code === 'elevenlabs_key_missing') {
        return isLocalDev() ? 'voice.brandVoiceCloudLangLocal' : 'voice.brandVoiceElevenLabsMissing';
      }
      if (code === 'no-brand-voice') {
        if (isLocalDev() && isCloudSpeechLang()) return 'voice.brandVoiceCloudLangLocal';
        return isLocalDev() ? 'voice.brandVoiceRequired' : 'voice.brandVoiceServerConfig';
      }
      if (code === 'failed') {
        if (isLocalDev() && isCloudSpeechLang()) return 'voice.brandVoiceCloudLangLocal';
        return isLocalDev() ? 'voice.brandVoiceRetry' : 'voice.brandVoiceServerError';
      }
      return isLocalDev() ? 'voice.brandVoiceRetry' : 'voice.brandVoiceServerError';
    },

    _notifyError: function (code) {
      if (!code) return;
      this._notify(this._errorKeyFor(code));
    },

    _prefetchServerStatus: function () {
      var self = this;
      if (isLocalDev() || isFileProtocol() || !this._btn) return;
      if (!window.OSGBrandTts || !OSGBrandTts.hasApi || !OSGBrandTts.hasApi()) {
        this._btn.setAttribute('data-i18n-title', 'voice.brandVoiceServerNotReadyTitle');
        if (window.OSGI18n) OSGI18n.applyToDom();
        return;
      }
      fetch('/api/ops/voice/status', { cache: 'no-store' })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (status) {
          if (!self._btn || !status || status.speakReady) return;
          self._btn.setAttribute('data-i18n-title', 'voice.brandVoiceServerNotReadyTitle');
          if (window.OSGI18n) OSGI18n.applyToDom();
        })
        .catch(function () { /* ignore */ });
    },

    _notify: function (key) {
      if (!key) return;
      window.alert(tVoice(key));
    },

    openLangModal: function () {
      var modal = document.getElementById('voice-lang-modal');
      if (!modal) {
        if (window.OSGVoiceMount) OSGVoiceMount.ensureModal();
        modal = document.getElementById('voice-lang-modal');
      }
      if (!modal) return;

      this.stop();
      modal.hidden = false;
      if (window.OSGI18n) OSGI18n.applyToDom();

      var input = document.getElementById('voice-lang-input');
      if (input) {
        input.value = '';
        setTimeout(function () { input.focus(); }, 50);
      }
    },

    closeLangModal: function () {
      var modal = document.getElementById('voice-lang-modal');
      if (modal) modal.hidden = true;
    },

    applyLangOverride: function (raw) {
      var self = this;
      var result = window.OSGWorldLang
        ? OSGWorldLang.applyUserLanguageInput(raw)
        : { speechTag: null, uiLocale: null };

      if (!result.speechTag) return;

      if (result.uiLocale && window.i18next && window.OSGI18n) {
        i18next.changeLanguage(result.uiLocale).then(function () {
          if (window.OSGWorldLang && OSGWorldLang.syncSpeechFromUiLocale) {
            OSGWorldLang.syncSpeechFromUiLocale(result.uiLocale);
          }
          if (window.OSGBrandTts && OSGBrandTts.clearSessionCache) {
            OSGBrandTts.clearSessionCache();
          }
          OSGI18n.applyToDom();
        });
      } else if (window.OSGI18n) {
        OSGI18n.applyToDom();
      }

      this.closeLangModal();
      if (self.state === STATES.PLAYING) self.stop();
    },

    _bindLangModal: function () {
      var modal = document.getElementById('voice-lang-modal');
      if (!modal || modal.getAttribute('data-bound')) return;
      modal.setAttribute('data-bound', '1');

      var self = this;
      modal.querySelectorAll('[data-voice-lang-close]').forEach(function (el) {
        el.addEventListener('click', function () { self.closeLangModal(); });
      });

      var cancel = document.getElementById('voice-lang-cancel');
      if (cancel) cancel.addEventListener('click', function () { self.closeLangModal(); });

      var submit = document.getElementById('voice-lang-submit');
      var input = document.getElementById('voice-lang-input');
      function doSubmit() {
        if (!input || !input.value.trim()) return;
        self.applyLangOverride(input.value.trim());
      }
      if (submit) submit.addEventListener('click', doSubmit);
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') doSubmit();
          if (e.key === 'Escape') self.closeLangModal();
        });
      }

      modal.querySelectorAll('[data-ui-locale]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var locale = btn.getAttribute('data-ui-locale');
          if (!locale || !window.OSGWorldLang) return;
          var bcp = OSGWorldLang.LOCALE_BCP47[locale];
          if (bcp) self.applyLangOverride(bcp);
        });
      });
    }
  };
})();
