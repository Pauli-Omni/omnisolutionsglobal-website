(function () {
  'use strict';

  if (window.__OMNIQR_CHROME_BOOTED__) return;
  window.__OMNIQR_CHROME_BOOTED__ = true;

  var ROOT_ID = 'omniqr-chrome-root';
  var WELCOME_KEY = 'omniqr-welcome-dismissed';

  function t(key, opts) {
    try {
      if (window.i18next && typeof i18next.t === 'function') {
        return i18next.t(key, opts || {});
      }
    } catch (e) { /* ignore */ }
    return key;
  }

  function applyI18n() {
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom();
    }
  }

  function termsBodyHtml() {
    if (window.OmniQrTermsView) {
      return OmniQrTermsView.sectionsHtml('h3');
    }
    return '';
  }

  function termsFooterHtml() {
    if (window.OmniQrTermsView) {
      return OmniQrTermsView.footerActionsHtml({ showFullPageLink: true });
    }
    return '';
  }

  function parseDeviceDiagnostics() {
    var ua = navigator.userAgent || '';
    var device = 'Unknown device';
    var os = 'Unknown OS';

    if (/iPhone/.test(ua)) {
      device = 'iPhone';
      var ios = ua.match(/iPhone OS ([\d_]+)/) || ua.match(/OS ([\d_]+) like Mac OS X/);
      os = ios ? 'iOS ' + ios[1].replace(/_/g, '.') : 'iOS';
    } else if (/iPad/.test(ua)) {
      device = 'iPad';
      var ipados = ua.match(/CPU OS ([\d_]+)/);
      os = ipados ? 'iPadOS ' + ipados[1].replace(/_/g, '.') : 'iPadOS';
    } else if (/Android/.test(ua)) {
      var android = ua.match(/Android ([\d.]+)/);
      os = android ? 'Android ' + android[1] : 'Android';
      var model = ua.match(/;\s([^;)]+)\sBuild\//);
      device = model ? model[1].trim() : 'Android device';
    } else if (/Windows NT/.test(ua)) {
      var win = ua.match(/Windows NT ([\d.]+)/);
      os = win ? 'Windows ' + win[1] : 'Windows';
      device = navigator.platform || 'PC';
    } else if (/Mac OS X/.test(ua)) {
      var mac = ua.match(/Mac OS X ([\d_]+)/);
      os = mac ? 'macOS ' + mac[1].replace(/_/g, '.') : 'macOS';
      device = 'Mac';
    } else if (/CrOS/.test(ua)) {
      os = 'Chrome OS';
      device = 'Chromebook';
    }

    return {
      deviceModel: device,
      osVersion: os,
      userAgent: ua.slice(0, 512)
    };
  }

  function ensureRoot() {
    var existing = document.getElementById(ROOT_ID);
    if (existing) return existing;

    var root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'omniqr-chrome-root';
    root.innerHTML =
      '<button type="button" id="omniqr-menu-btn" class="omniqr-menu-btn" ' +
        'aria-haspopup="true" aria-expanded="false" data-i18n-aria="omniqr.terms.menuAria">' +
        '<span class="omniqr-menu-btn__bars" aria-hidden="true"></span>' +
      '</button>' +
      '<nav id="omniqr-app-menu" class="omniqr-app-menu" hidden aria-label="OmniQR navigation">' +
        '<a href="index.html" class="omniqr-app-menu__link" data-i18n="omniqr.terms.menuHome"></a>' +
        '<a href="beschreibung.html" class="omniqr-app-menu__link" data-i18n="omniqr.terms.menuDesc"></a>' +
        '<a href="agb.html" class="omniqr-app-menu__link omniqr-app-menu__link--legal" data-i18n="omniqr.terms.navLabel" data-i18n-aria="omniqr.terms.navAria"></a>' +
        '<button type="button" class="omniqr-app-menu__link omniqr-app-menu__link--btn" id="omniqr-menu-support" data-i18n="omniqr.terms.menuSupport"></button>' +
      '</nav>' +
      '<button type="button" id="omniqr-support-fab" class="omniqr-support-fab" data-i18n="omniqr.support.fabLabel" data-i18n-aria="omniqr.support.fabAria"></button>' +
      '<div id="omniqr-welcome-modal" class="omniqr-modal omniqr-modal--welcome" hidden role="dialog" aria-modal="true" aria-labelledby="omniqr-welcome-title">' +
        '<div class="omniqr-modal-backdrop" data-omniqr-close="welcome"></div>' +
        '<div class="omniqr-modal-panel omniqr-modal-panel--welcome neo-accent-box">' +
          '<div class="omniqr-modal-head">' +
            '<h2 id="omniqr-welcome-title" class="omniqr-modal-title chrome-silver-text" data-i18n="omniqr.terms.welcomeTitle"></h2>' +
            '<button type="button" class="omniqr-modal-close" data-omniqr-close="welcome" data-i18n-aria="omniqr.support.closeAria">&times;</button>' +
          '</div>' +
          '<p class="omniqr-welcome-lead chrome-silver-text" data-i18n="omniqr.terms.welcomeLead"></p>' +
          '<div class="omniqr-welcome-actions">' +
            '<a href="agb.html" class="btn btn-neon omniqr-welcome-agb" data-i18n="omniqr.terms.welcomeAgbBtn" data-i18n-aria="omniqr.terms.welcomeAgbAria"></a>' +
            '<button type="button" class="btn btn-outline-neon" data-omniqr-close="welcome" data-i18n="omniqr.terms.welcomeContinue" data-i18n-aria="omniqr.terms.welcomeContinueAria"></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="omniqr-support-modal" class="omniqr-modal" hidden role="dialog" aria-modal="true" aria-labelledby="omniqr-support-title">' +
        '<div class="omniqr-modal-backdrop" data-omniqr-close="support"></div>' +
        '<div class="omniqr-modal-panel neo-accent-box">' +
          '<div class="omniqr-modal-head">' +
            '<h2 id="omniqr-support-title" class="omniqr-modal-title chrome-silver-text" data-i18n="omniqr.support.modalTitle"></h2>' +
            '<button type="button" class="omniqr-modal-close" data-omniqr-close="support" data-i18n-aria="omniqr.support.closeAria">&times;</button>' +
          '</div>' +
          '<form id="omniqr-support-form" class="omniqr-support-form" novalidate>' +
            '<label class="omniqr-field-label chrome-silver-text" for="omniqr-support-name" data-i18n="omniqr.support.nameLabel"></label>' +
            '<input type="text" id="omniqr-support-name" class="omniqr-input" required autocomplete="name" maxlength="120" data-i18n-placeholder="omniqr.support.namePlaceholder">' +
            '<label class="omniqr-field-label chrome-silver-text" for="omniqr-support-phone" data-i18n="omniqr.support.phoneLabel"></label>' +
            '<input type="tel" id="omniqr-support-phone" class="omniqr-input" autocomplete="tel" maxlength="40" data-i18n-placeholder="omniqr.support.phonePlaceholder">' +
            '<label class="omniqr-field-label chrome-silver-text" for="omniqr-support-message" data-i18n="omniqr.support.messageLabel"></label>' +
            '<textarea id="omniqr-support-message" class="omniqr-textarea" rows="5" required maxlength="2000" data-i18n-placeholder="omniqr.support.messagePlaceholder"></textarea>' +
            '<p id="omniqr-support-status" class="omniqr-form-status chrome-silver-text" hidden></p>' +
            '<div class="omniqr-modal-actions">' +
              '<button type="button" class="btn btn-outline-neon" data-omniqr-close="support" data-i18n="omniqr.support.cancelBtn"></button>' +
              '<button type="submit" class="btn btn-neon" id="omniqr-support-submit" data-i18n="omniqr.support.submitBtn"></button>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>' +
      '<div id="omniqr-terms-modal" class="omniqr-modal" hidden role="dialog" aria-modal="true" aria-labelledby="omniqr-terms-title">' +
        '<div class="omniqr-modal-backdrop" data-omniqr-close="terms"></div>' +
        '<div class="omniqr-modal-panel omniqr-modal-panel--wide neo-accent-box">' +
          '<div class="omniqr-modal-head">' +
            '<h2 id="omniqr-terms-title" class="omniqr-modal-title chrome-silver-text" data-i18n="omniqr.terms.modalTitle"></h2>' +
            '<button type="button" class="omniqr-modal-close" data-omniqr-close="terms" data-i18n-aria="omniqr.terms.closeAria">&times;</button>' +
          '</div>' +
          '<div class="omniqr-terms-body chrome-silver-text" id="omniqr-terms-modal-body"></div>' +
          '<div id="omniqr-terms-modal-actions"></div>' +
          '<div class="omniqr-modal-actions">' +
            '<button type="button" class="btn btn-neon" data-omniqr-close="terms" data-i18n="omniqr.terms.acceptBtn"></button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    var modalBody = document.getElementById('omniqr-terms-modal-body');
    var modalActions = document.getElementById('omniqr-terms-modal-actions');
    if (modalBody) modalBody.innerHTML = termsBodyHtml();
    if (modalActions) modalActions.innerHTML = termsFooterHtml();

    applyI18n();
    if (window.OmniQrTermsView) {
      OmniQrTermsView.bindPdfDownload(root);
    }
    return root;
  }

  function setMenuOpen(open) {
    var menu = document.getElementById('omniqr-app-menu');
    var btn = document.getElementById('omniqr-menu-btn');
    if (!menu || !btn) return;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function setModalOpen(kind, open) {
    var idMap = {
      support: 'omniqr-support-modal',
      terms: 'omniqr-terms-modal',
      welcome: 'omniqr-welcome-modal'
    };
    var modal = document.getElementById(idMap[kind]);
    if (!modal) return;
    modal.hidden = !open;
    if (open) {
      applyI18n();
      if (kind === 'terms' && window.OmniQrTermsView) {
        OmniQrTermsView.bindPdfDownload(modal);
      }
      var focusTarget = null;
      if (kind === 'support') focusTarget = document.getElementById('omniqr-support-name');
      else if (kind === 'welcome') focusTarget = modal.querySelector('.omniqr-welcome-agb');
      else focusTarget = modal.querySelector('.omniqr-modal-close');
      if (focusTarget) setTimeout(function () { focusTarget.focus(); }, 40);
    }
    if (kind === 'welcome' && !open) {
      try { sessionStorage.setItem(WELCOME_KEY, '1'); } catch (e) { /* ignore */ }
    }
  }

  function maybeShowWelcome() {
    if (document.body.getAttribute('data-app-view') !== 'front') return;
    try {
      if (sessionStorage.getItem(WELCOME_KEY) === '1') return;
    } catch (e) { /* ignore */ }
    setModalOpen('welcome', true);
  }

  function resetSupportStatus() {
    var status = document.getElementById('omniqr-support-status');
    if (status) {
      status.hidden = true;
      status.textContent = '';
      status.classList.remove('is-error', 'is-success');
    }
  }

  function showSupportStatus(text, isError) {
    var status = document.getElementById('omniqr-support-status');
    if (!status) return;
    status.textContent = text;
    status.hidden = false;
    status.classList.toggle('is-error', !!isError);
    status.classList.toggle('is-success', !isError);
  }

  function bindEvents() {
    ensureRoot();

    document.addEventListener('click', function (ev) {
      var menuBtn = ev.target.closest('#omniqr-menu-btn');
      if (menuBtn) {
        var menu = document.getElementById('omniqr-app-menu');
        setMenuOpen(menu && menu.hidden);
        return;
      }

      if (!ev.target.closest('#omniqr-app-menu') && !ev.target.closest('#omniqr-menu-btn')) {
        setMenuOpen(false);
      }

      var menuSupport = ev.target.closest('#omniqr-menu-support');
      if (menuSupport) {
        setMenuOpen(false);
        resetSupportStatus();
        setModalOpen('support', true);
        return;
      }

      var fab = ev.target.closest('#omniqr-support-fab');
      if (fab) {
        resetSupportStatus();
        setModalOpen('support', true);
        return;
      }

      var closeBtn = ev.target.closest('[data-omniqr-close]');
      if (closeBtn) {
        var kind = closeBtn.getAttribute('data-omniqr-close');
        if (kind === 'support') resetSupportStatus();
        setModalOpen(kind, false);
      }

      var termsLink = ev.target.closest('[data-omniqr-terms-open]');
      if (termsLink) {
        ev.preventDefault();
        setModalOpen('terms', true);
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        setMenuOpen(false);
        setModalOpen('support', false);
        setModalOpen('terms', false);
        setModalOpen('welcome', false);
        resetSupportStatus();
      }
    });

    var form = document.getElementById('omniqr-support-form');
    if (form && !form.__omniqrBound) {
      form.__omniqrBound = true;
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        resetSupportStatus();

        var nameEl = document.getElementById('omniqr-support-name');
        var phoneEl = document.getElementById('omniqr-support-phone');
        var messageEl = document.getElementById('omniqr-support-message');
        var submitBtn = document.getElementById('omniqr-support-submit');

        var name = nameEl ? nameEl.value.trim() : '';
        var message = messageEl ? messageEl.value.trim() : '';

        if (!name) {
          showSupportStatus(t('omniqr.support.nameRequired'), true);
          if (nameEl) nameEl.focus();
          return;
        }
        if (!message) {
          showSupportStatus(t('omniqr.support.messageRequired'), true);
          if (messageEl) messageEl.focus();
          return;
        }

        if (!window.OmniQrPayApi || typeof OmniQrPayApi.submitSupport !== 'function') {
          showSupportStatus(t('omniqr.support.error'), true);
          return;
        }

        if (submitBtn) submitBtn.disabled = true;
        showSupportStatus(t('omniqr.support.sending'), false);

        OmniQrPayApi.submitSupport({
          name: name,
          phone: phoneEl ? phoneEl.value.trim() : '',
          message: message,
          diagnostics: parseDeviceDiagnostics()
        }).then(function (res) {
          form.reset();
          showSupportStatus(t('omniqr.support.success', { ticket: res.ticketNumber || '' }), false);
        }).catch(function () {
          showSupportStatus(t('omniqr.support.error'), true);
        }).finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
      });
    }
  }

  function afterI18nReady() {
    applyI18n();
    if (document.body.getAttribute('data-app-view') === 'agb' && window.OmniQrTermsView) {
      OmniQrTermsView.mountTermsPage();
    }
    maybeShowWelcome();
  }

  function boot() {
    if (!document.body || document.body.getAttribute('data-page') !== 'omniqr') return;

    if (document.body.getAttribute('data-app-view') === 'agb') {
      document.body.classList.add('omniqr-page--agb');
    }

    ensureRoot();
    bindEvents();

    if (window.i18next && i18next.isInitialized) {
      afterI18nReady();
    } else {
      document.addEventListener('osg:i18nReady', afterI18nReady, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('i18next:languageChanged', applyI18n);

  window.OmniQrChrome = {
    openSupport: function () { setModalOpen('support', true); },
    openTerms: function () { setModalOpen('terms', true); },
    openWelcome: function () { setModalOpen('welcome', true); }
  };
})();
