(function () {
  'use strict';

  var _userId = null;
  var _demoQrPayload = null;
  var _previewResult = null;
  var _authSeal = null;

  function tr(key) {
    return window.OSGI18n ? OSGI18n.t(key) : key;
  }

  function speechTag() {
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

  function userId() {
    if (_userId) return _userId;
    try {
      var stored = localStorage.getItem('omniqr-user-id');
      if (stored) {
        _userId = stored;
        return _userId;
      }
    } catch (e) { /* ignore */ }
    _userId = 'web_' + Math.random().toString(36).slice(2, 14);
    try { localStorage.setItem('omniqr-user-id', _userId); } catch (e2) { /* ignore */ }
    return _userId;
  }

  function setLiveStatus(key, vars) {
    var live = document.getElementById('omniqr-pay-live');
    if (!live) return;
    var text = tr(key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
      });
    }
    live.textContent = text;
  }

  function speakStatus(key, vars) {
    if (!window.OSGBrandTts || !OSGBrandTts.speak) return Promise.resolve();
    var text = tr(key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
      });
    }
    return OSGBrandTts.speak(text, speechTag()).catch(function () { /* ignore */ });
  }

  function ensureDemoQr() {
    if (_demoQrPayload) return Promise.resolve(_demoQrPayload);
    return OmniQrPayApi.demoQr().then(function (body) {
      _demoQrPayload = body.qrPayload;
      return _demoQrPayload;
    });
  }

  function clearQrStage(stage) {
    if (!stage) return;
    stage.innerHTML = '';
    stage.removeAttribute('data-i18n');
  }

  function renderQrInStage(stage, payload, amountLabel) {
    clearQrStage(stage);
    var wrap = document.createElement('div');
    wrap.className = 'omniqr-qr-canvas-wrap';
    stage.appendChild(wrap);

    var ariaText = tr('omniqr.payStatusReady', { amount: amountLabel });
    stage.setAttribute('aria-label', ariaText);

    if (typeof QRCode === 'undefined' || !QRCode.toCanvas) {
      var fallback = document.createElement('p');
      fallback.className = 'omniqr-qr-fallback';
      fallback.textContent = ariaText;
      wrap.appendChild(fallback);
      return Promise.resolve();
    }

    var canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'presentation');
    wrap.appendChild(canvas);

    return QRCode.toCanvas(canvas, payload, {
      width: Math.min(220, Math.floor(window.innerWidth * 0.55)),
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    }).catch(function () {
      wrap.innerHTML = '';
      var err = document.createElement('p');
      err.className = 'omniqr-qr-fallback';
      err.textContent = tr('omniqr.payStatusError');
      wrap.appendChild(err);
    });
  }

  function onPayZoneFocus() {
    speakStatus('omniqr.payStatusIdle');
  }

  function loadDemoQr() {
    var stage = document.getElementById('omniqr-qr-stage');
    if (!stage) return;
    stage.setAttribute('data-state', 'loading');
    clearQrStage(stage);
    stage.setAttribute('data-i18n', 'omniqr.qrStagePlaceholder');
    if (window.OSGI18n) OSGI18n.applyToDom();
    setLiveStatus('omniqr.payStatusLoading');

    if (!window.OmniQrPayApi) {
      setLiveStatus('omniqr.payStatusError');
      return;
    }

    _authSeal = null;

    ensureDemoQr().then(function (payload) {
      return OmniQrPayApi.preview(payload).then(function (result) {
        _previewResult = result;
        return { payload: payload, result: result };
      });
    }).then(function (ctx) {
      var amount = ctx.result.preview && ctx.result.preview.amount_thb;
      var amountLabel = amount ? amount.toFixed(2) : '—';
      stage.setAttribute('data-state', 'ready');
      return renderQrInStage(stage, ctx.payload, amountLabel).then(function () {
        setLiveStatus('omniqr.payStatusReady', { amount: amountLabel });
        return speakStatus('omniqr.payStatusReady', { amount: amountLabel });
      });
    }).catch(function () {
      stage.setAttribute('data-state', 'error');
      clearQrStage(stage);
      stage.setAttribute('data-i18n', 'omniqr.qrStagePlaceholder');
      if (window.OSGI18n) OSGI18n.applyToDom();
      setLiveStatus('omniqr.payStatusError');
      speakStatus('omniqr.payStatusError');
    });
  }

  function authorizePayment() {
    var stage = document.getElementById('omniqr-qr-stage');
    if (!stage || !window.OmniQrPayApi) return;
    setLiveStatus('omniqr.payStatusAuthorizing');
    speakStatus('omniqr.payStatusAuthorizing');

    var txId = 'TX-' + Date.now().toString(36).toUpperCase();
    var uid = userId();

    ensureDemoQr().then(function (payload) {
      var authBody = {
        qrPayload: payload,
        userId: uid,
        transactionId: txId
      };
      if (_authSeal) {
        authBody.integritySignature = _authSeal.signature;
        authBody.integrityTimestamp = _authSeal.timestamp;
      }
      return OmniQrPayApi.authorize(authBody);
    }).then(function (result) {
      return OmniQrPayApi.verifySeal({
        transactionId: result.transaction_id,
        amountThb: result.amount_thb,
        userId: result.user_id,
        integrityTimestamp: result.integrity_timestamp,
        integritySignature: result.integrity_hash
      }).then(function (verified) {
        if (!verified.ok) throw new Error('integrity_invalid');
        _authSeal = {
          signature: result.integrity_hash,
          timestamp: result.integrity_timestamp
        };
        return OmniQrPayApi.authorize({
          qrPayload: _demoQrPayload,
          userId: result.user_id,
          transactionId: result.transaction_id,
          integritySignature: result.integrity_hash,
          integrityTimestamp: result.integrity_timestamp
        });
      }).then(function (finalResult) {
        stage.setAttribute('data-state', 'authorized');
        var statusKey = finalResult.payment_live
          ? 'omniqr.payStatusConfirmed'
          : 'omniqr.payStatusAuthRecorded';
        var amountLabel = Number(finalResult.amount_thb).toFixed(2);
        setLiveStatus(statusKey, { amount: amountLabel });
        speakStatus(statusKey, { amount: amountLabel });
      });
    }).catch(function () {
      stage.setAttribute('data-state', 'error');
      setLiveStatus('omniqr.payStatusError');
      speakStatus('omniqr.payStatusError');
    });
  }

  function bindKeyboard() {
    var zone = document.getElementById('omniqr-pay-zone');
    if (!zone) return;
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var target = e.target;
        if (target && target.id === 'omniqr-btn-scan') {
          e.preventDefault();
          loadDemoQr();
        }
        if (target && target.id === 'omniqr-btn-confirm') {
          e.preventDefault();
          authorizePayment();
        }
        if (target && target.id === 'omniqr-btn-speak') {
          e.preventDefault();
          onPayZoneFocus();
        }
      }
    });
  }

  function init() {
    var scanBtn = document.getElementById('omniqr-btn-scan');
    var confirmBtn = document.getElementById('omniqr-btn-confirm');
    var speakBtn = document.getElementById('omniqr-btn-speak');
    var zone = document.getElementById('omniqr-pay-zone');

    if (scanBtn) scanBtn.addEventListener('click', loadDemoQr);
    if (confirmBtn) confirmBtn.addEventListener('click', authorizePayment);
    if (speakBtn) speakBtn.addEventListener('click', onPayZoneFocus);
    if (zone) {
      zone.addEventListener('focusin', function (e) {
        if (e.target === zone) onPayZoneFocus();
      });
    }

    bindKeyboard();
    setLiveStatus('omniqr.payStatusIdle');

    if (window.i18next) {
      i18next.on('languageChanged', function () {
        if (window.OSGI18n) OSGI18n.applyToDom();
        setLiveStatus('omniqr.payStatusIdle');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.OmniQrPayHub = { init: init, speakStatus: speakStatus, loadDemoQr: loadDemoQr };
})();
