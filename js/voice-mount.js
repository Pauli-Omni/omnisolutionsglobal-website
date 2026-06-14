(function () {
  'use strict';

  var SPEAKER_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
    '<path d="M11 5 6 9H3v6h3l5 4V5z"/>' +
    '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
    '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
    '</svg>';

  function ensureModal() {
    var existing = document.getElementById('voice-lang-modal');
    if (existing) return existing;

    var modal = document.createElement('div');
    modal.id = 'voice-lang-modal';
    modal.className = 'voice-lang-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="voice-lang-modal-backdrop" data-voice-lang-close></div>' +
      '<div class="voice-lang-modal-panel neo-accent-box">' +
        '<h2 class="voice-lang-modal-title chrome-silver-text" data-i18n="voice.langModalTitle"></h2>' +
        '<p class="voice-lang-modal-hint chrome-silver-text" data-i18n="voice.langWorldHint"></p>' +
        '<div class="voice-lang-quick" role="group" aria-labelledby="voice-lang-quick-label">' +
          '<span id="voice-lang-quick-label" class="voice-lang-modal-label chrome-silver-text" data-i18n="voice.langQuickLabel"></span>' +
          '<div class="voice-lang-quick-grid" id="voice-lang-quick-grid"></div>' +
        '</div>' +
        '<label class="voice-lang-modal-label chrome-silver-text" for="voice-lang-input" data-i18n="voice.langInputLabel"></label>' +
        '<input type="text" id="voice-lang-input" class="voice-lang-input" autocomplete="off" data-i18n-placeholder="voice.langPlaceholder">' +
        '<div class="voice-lang-modal-actions">' +
          '<button type="button" class="btn btn-outline-neon" id="voice-lang-cancel" data-i18n="voice.langCancel"></button>' +
          '<button type="button" class="btn btn-neon" id="voice-lang-submit" data-i18n="voice.langSubmit"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var grid = modal.querySelector('#voice-lang-quick-grid');
    if (grid && window.OSGI18nConfig) {
      OSGI18nConfig.SUPPORTED_LOCALES.forEach(function (locale) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'voice-lang-quick-btn';
        btn.setAttribute('data-ui-locale', locale);
        btn.textContent = OSGI18nConfig.LOCALE_NATIVE_LABELS[locale] || locale.toUpperCase();
        grid.appendChild(btn);
      });
    }

    return modal;
  }

  function mount() {
    var slot = document.getElementById('app-voice-slot');
    if (!slot || slot.querySelector('#voice-btn')) return;

    slot.innerHTML =
      '<div class="app-voice-toolbar">' +
        '<button type="button" id="voice-btn" class="voice-btn voice-btn--deactivated" data-state="deactivated" data-i18n-aria="voice.ariaDeactivated" aria-pressed="false">' +
          SPEAKER_SVG +
        '</button>' +
        '<button type="button" id="voice-lang-switch" class="voice-lang-switch chrome-silver-text" data-i18n="voice.changeLang"></button>' +
        '<span class="voice-world-lang-note chrome-silver-text" data-i18n="voice.worldLangNote"></span>' +
      '</div>';

    ensureModal();

    if (window.OSGI18n) OSGI18n.applyToDom();
    if (window.OSGVoice) OSGVoice.init();

    var langBtn = document.getElementById('voice-lang-switch');
    if (langBtn) langBtn.addEventListener('click', function () {
      if (window.OSGVoice) OSGVoice.openLangModal();
    });
  }

  window.OSGVoiceMount = { mount: mount, ensureModal: ensureModal };
})();
