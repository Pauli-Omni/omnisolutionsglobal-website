(function () {
  'use strict';

  var SPEAKER_SVG =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
    '<path d="M11 5 6 9H3v6h3l5 4V5z"/>' +
    '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
    '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
    '</svg>';

  var _pageLeaveBound = false;

  function stopAllSpeech() {
    if (window.OSGVoice && typeof OSGVoice.stop === 'function') {
      OSGVoice.stop();
    }
    if (window.OSGBrandTts && typeof OSGBrandTts.stop === 'function') {
      OSGBrandTts.stop();
    }
    if (window.speechSynthesis && typeof speechSynthesis.cancel === 'function') {
      speechSynthesis.cancel();
    }
  }

  function bindPageLeave() {
    if (_pageLeaveBound) return;
    _pageLeaveBound = true;
    window.addEventListener('pagehide', stopAllSpeech);
    window.addEventListener('beforeunload', stopAllSpeech);
  }

  function mountVoiceButton(host) {
    if (!host || host.querySelector('#voice-btn')) return;

    host.innerHTML =
      '<button type="button" id="voice-btn" class="voice-btn voice-btn--deactivated omniqr-agb-voice-btn" ' +
      'data-state="deactivated" data-i18n-aria="omniqr.terms.readAloudAria" aria-pressed="false">' +
      SPEAKER_SVG +
      '<span class="omniqr-agb-voice-btn__label" data-i18n="omniqr.terms.readAloud"></span>' +
      '</button>';

    if (window.OSGI18n) OSGI18n.applyToDom();
    if (window.OSGVoice) OSGVoice.init();
  }

  function mount() {
    if (document.body.getAttribute('data-app-view') !== 'agb') return;

    var host = document.getElementById('omniqr-agb-voice-slot');
    if (!host) return;

    mountVoiceButton(host);
    bindPageLeave();
  }

  window.OmniQrTermsVoice = { mount: mount, stopAllSpeech: stopAllSpeech };
})();
