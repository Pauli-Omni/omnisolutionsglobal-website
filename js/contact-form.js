(function () {
  'use strict';

  var RECOGNITION = window.SpeechRecognition || window.webkitSpeechRecognition;
  var RECIPIENT = (window.OSG_CONTACT_CONFIG && OSG_CONTACT_CONFIG.recipient)
    || 'omnisolutionsglobal.co.ltd@gmail.com';
  var ENDPOINT = (window.OSG_CONTACT_CONFIG && OSG_CONTACT_CONFIG.endpoint)
    || ('https://formsubmit.co/ajax/' + RECIPIENT);

  function t(key) {
    return window.OSGI18n ? OSGI18n.t(key) : key;
  }

  function speechLang() {
    if (window.OSGWorldLang) return OSGWorldLang.getSpeechTag();
    var cfg = window.OSGI18nConfig;
    var lng = window.i18next && i18next.language
      ? i18next.language
      : (cfg ? cfg.FALLBACK_LOCALES[0] : 'en');
    return cfg ? cfg.speechTagFor(cfg.normalizeLocale(lng)) : 'en-US';
  }

  function ensureModal() {
    var existing = document.getElementById('contact-modal');
    if (existing) return existing;

    var modal = document.createElement('div');
    modal.id = 'contact-modal';
    modal.className = 'contact-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'contact-modal-title');
    modal.innerHTML =
      '<div class="contact-modal-backdrop" data-contact-close></div>' +
      '<div class="contact-modal-panel neo-accent-box">' +
        '<h2 id="contact-modal-title" class="contact-modal-title chrome-silver-text" data-i18n="contact.modalTitle"></h2>' +
        '<p class="contact-modal-lead chrome-silver-text" data-i18n="contact.modalDesc"></p>' +
        '<p class="contact-modal-hint chrome-silver-text" data-i18n="contact.worldLangHint"></p>' +
        '<form id="contact-form" class="contact-form" novalidate>' +
          '<label class="contact-field-label chrome-silver-text" for="contact-name" data-i18n="contact.nameOrCompanyLabel"></label>' +
          '<input type="text" id="contact-name" class="contact-input" required autocomplete="name" data-i18n-placeholder="contact.nameOrCompanyPlaceholder">' +
          '<label class="contact-field-label chrome-silver-text" for="contact-phone" data-i18n="contact.phoneLabel"></label>' +
          '<input type="tel" id="contact-phone" class="contact-input" autocomplete="tel" data-i18n-placeholder="contact.phonePlaceholder">' +
          '<label class="contact-field-label chrome-silver-text" for="contact-email" data-i18n="contact.emailLabel"></label>' +
          '<input type="email" id="contact-email" class="contact-input" required autocomplete="email" data-i18n-placeholder="contact.emailPlaceholder">' +
          '<label class="contact-field-label chrome-silver-text" for="contact-message" data-i18n="contact.messageLabel"></label>' +
          '<div class="contact-message-row">' +
            '<textarea id="contact-message" class="contact-textarea" rows="5" required data-i18n-placeholder="contact.messagePlaceholder"></textarea>' +
            '<button type="button" id="contact-dictate-btn" class="contact-dictate-btn" data-i18n="contact.dictateBtn" data-i18n-aria="contact.dictateAria"></button>' +
          '</div>' +
          '<p id="contact-status" class="contact-status chrome-silver-text" hidden></p>' +
          '<div class="contact-modal-actions">' +
            '<button type="button" class="btn btn-outline-neon" id="contact-cancel" data-i18n="contact.cancelBtn"></button>' +
            '<button type="submit" class="btn btn-neon btn-neon--compact" id="contact-send" data-i18n="contact.sendBtn"></button>' +
          '</div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(modal);
    return modal;
  }

  function openModal() {
    var modal = ensureModal();
    modal.hidden = false;
    if (window.OSGI18n) OSGI18n.applyToDom();
    var name = document.getElementById('contact-name');
    if (name) setTimeout(function () { name.focus(); }, 50);
  }

  function closeModal() {
    stopDictation();
    var modal = document.getElementById('contact-modal');
    if (modal) modal.hidden = true;
    resetStatus();
  }

  function resetStatus() {
    var status = document.getElementById('contact-status');
    if (status) {
      status.hidden = true;
      status.textContent = '';
    }
  }

  function showStatus(key) {
    var status = document.getElementById('contact-status');
    if (!status) return;
    status.textContent = t(key);
    status.hidden = false;
  }

  var _recognition = null;
  var _dictating = false;

  function stopDictation() {
    if (_recognition) {
      try { _recognition.stop(); } catch (e) { /* ignore */ }
      _recognition = null;
    }
    _dictating = false;
    var btn = document.getElementById('contact-dictate-btn');
    if (btn) {
      btn.classList.remove('is-listening');
      btn.setAttribute('data-i18n', 'contact.dictateBtn');
      btn.setAttribute('data-i18n-aria', 'contact.dictateAria');
      if (window.OSGI18n) OSGI18n.applyToDom();
    }
  }

  function toggleDictation() {
    if (!RECOGNITION) {
      window.alert(t('contact.dictateUnsupported'));
      return;
    }

    var btn = document.getElementById('contact-dictate-btn');
    var area = document.getElementById('contact-message');
    if (!btn || !area) return;

    if (_dictating) {
      stopDictation();
      return;
    }

    _recognition = new RECOGNITION();
    _recognition.lang = speechLang();
    _recognition.continuous = true;
    _recognition.interimResults = true;

    var baseText = area.value.trim();
    if (baseText) baseText += ' ';

    _recognition.onresult = function (ev) {
      var chunk = '';
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        chunk += ev.results[i][0].transcript;
      }
      area.value = baseText + chunk;
    };

    _recognition.onerror = function () { stopDictation(); };
    _recognition.onend = function () {
      if (_dictating) {
        try { _recognition.start(); } catch (e) { stopDictation(); }
      }
    };

    try {
      _recognition.start();
      _dictating = true;
      btn.classList.add('is-listening');
      btn.setAttribute('data-i18n', 'contact.dictateListening');
      btn.setAttribute('data-i18n-aria', 'contact.dictateStopAria');
      if (window.OSGI18n) OSGI18n.applyToDom();
    } catch (e) {
      stopDictation();
      window.alert(t('contact.dictateUnsupported'));
    }
  }

  function ensureLocation() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) {
        reject(new Error('unsupported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      });
    });
  }

  function submitPayload(loc) {
    var name = document.getElementById('contact-name');
    var phone = document.getElementById('contact-phone');
    var email = document.getElementById('contact-email');
    var message = document.getElementById('contact-message');

    var payload = {
      _subject: 'Website-Kontakt: ' + name.value.trim(),
      _replyto: email.value.trim(),
      _captcha: 'false',
      _template: 'table',
      name_or_company: name.value.trim(),
      phone: phone.value.trim() || t('contact.phoneNotProvided'),
      sender_email: email.value.trim(),
      message: message.value.trim(),
      location: loc.coords.latitude + ', ' + loc.coords.longitude
        + ' (±' + Math.round(loc.coords.accuracy) + ' m)',
      page_language: window.i18next ? i18next.language : 'de',
      page_url: window.location.href
    };

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  function onSubmit(ev) {
    ev.preventDefault();
    stopDictation();
    resetStatus();

    var name = document.getElementById('contact-name');
    var email = document.getElementById('contact-email');
    var message = document.getElementById('contact-message');
    var sendBtn = document.getElementById('contact-send');

    if (!name.value.trim()) {
      window.alert(t('contact.nameOrCompanyRequired'));
      name.focus();
      return;
    }
    if (!email.value.trim()) {
      window.alert(t('contact.emailRequired'));
      email.focus();
      return;
    }
    if (!message.value.trim()) {
      window.alert(t('contact.messageRequired'));
      message.focus();
      return;
    }

    if (sendBtn) sendBtn.disabled = true;
    showStatus('contact.locationWaiting');

    ensureLocation()
      .then(function (loc) {
        showStatus('contact.sending');
        return submitPayload(loc);
      })
      .then(function (res) {
        if (!res.ok) throw new Error('http');
        return res.json().catch(function () { return {}; });
      })
      .then(function () {
        window.alert(t('contact.success'));
        document.getElementById('contact-form').reset();
        closeModal();
      })
      .catch(function (err) {
        if (!err || err.message === 'http') {
          window.alert(t('contact.error'));
        } else {
          window.alert(t('contact.locationRequired'));
        }
      })
      .finally(function () {
        if (sendBtn) sendBtn.disabled = false;
        resetStatus();
      });
  }

  function bindModal() {
    var modal = ensureModal();
    if (modal.getAttribute('data-bound')) return;
    modal.setAttribute('data-bound', '1');

    modal.querySelectorAll('[data-contact-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    var cancel = document.getElementById('contact-cancel');
    if (cancel) cancel.addEventListener('click', closeModal);

    var form = document.getElementById('contact-form');
    if (form) form.addEventListener('submit', onSubmit);

    var dictate = document.getElementById('contact-dictate-btn');
    if (dictate) dictate.addEventListener('click', toggleDictation);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });
  }

  function bindTriggers() {
    document.querySelectorAll('[data-contact-trigger]').forEach(function (el) {
      if (el.getAttribute('data-contact-bound')) return;
      el.setAttribute('data-contact-bound', '1');
      if (el.tagName === 'A') el.setAttribute('href', '#');
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });
  }

  function init() {
    bindModal();
    bindTriggers();
    if (window.i18next && !i18next._osgContactBound) {
      i18next._osgContactBound = true;
      i18next.on('languageChanged', function () {
        if (window.OSGI18n) OSGI18n.applyToDom();
      });
    }
  }

  window.OSGContactForm = { init: init, open: openModal, close: closeModal };
})();
