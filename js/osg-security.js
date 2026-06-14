(function () {
  'use strict';

  if (window.__OSG_SECURITY_BOOTED__) return;
  window.__OSG_SECURITY_BOOTED__ = true;

  var NODE_ID = 'SAMKO-MAIN';
  var LATENCY_MS = '0.002';
  var tarpitActive = false;
  var i18nApplied = false;

  function t(key, opts) {
    try {
      if (window.i18next && typeof i18next.t === 'function') {
        return i18next.t(key, opts || {});
      }
    } catch (e) { /* ignore */ }
    return key;
  }

  function applyI18n() {
    if (i18nApplied) return;
    if (!document.getElementById('osg-security-container')) return;

    try {
      if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
        OSGI18n.applyToDom();
      }
      var latency = document.getElementById('osg-security-latency');
      if (latency) {
        latency.textContent = t('security.latencyLine', { latency: LATENCY_MS, node: NODE_ID });
      }
      var probe = t('security.badgeLabel');
      if (probe && probe !== 'security.badgeLabel') i18nApplied = true;
    } catch (e) { /* ignore */ }
  }

  function toggleSecurityModal() {
    var modal = document.getElementById('osg-security-modal');
    if (!modal) return;
    modal.classList.toggle('is-open');
    var open = modal.classList.contains('is-open');
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function startTarpit(statusEl) {
    if (tarpitActive) return;
    tarpitActive = true;
    if (statusEl) statusEl.textContent = t('security.tarpitActive');

    window.setInterval(function () {
      try {
        var garbage = '';
        for (var i = 0; i < 100000; i += 1) {
          garbage += btoa(Math.random().toString() + btoa(garbage || ''));
        }
        if (garbage) console.log(garbage.charAt(0));
      } catch (e) { /* ignore btoa edge cases */ }
    }, 5);
  }

  function triggerIntrusionAlert() {
    if (document.getElementById('osg-intrusion-modal')) return;

    var overlay = document.createElement('div');
    overlay.id = 'osg-intrusion-modal';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'osg-intrusion-title');

    var box = document.createElement('div');
    box.className = 'osg-intrusion-modal__box';
    var logId = 'OSG-' + Math.floor(100000 + Math.random() * 900000);

    box.innerHTML =
      '<div class="osg-intrusion-modal__icon" aria-hidden="true">⚠️</div>' +
      '<h3 id="osg-intrusion-title" class="osg-intrusion-modal__title"></h3>' +
      '<div class="osg-intrusion-modal__subtitle" data-i18n="security.intrusionSubtitle"></div>' +
      '<p class="osg-intrusion-modal__notice" data-i18n-html="security.intrusionNotice"></p>' +
      '<p class="osg-intrusion-modal__warning" data-i18n="security.intrusionWarning"></p>' +
      '<div class="osg-intrusion-modal__log">' +
        '<div>• ' + t('security.targetStatus') + '</div>' +
        '<div>• ' + t('security.networkStatus') + ': <span style="color:#ffffff;font-weight:bold;">' + t('security.networkTracked') + '</span></div>' +
        '<div>• ' + t('security.logIdLabel') + ': ' + logId + '</div>' +
        '<div>• ' + t('security.nodeResponse') + '</div>' +
      '</div>' +
      '<div id="tarpit-status" class="osg-intrusion-modal__tarpit"></div>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    var titleEl = box.querySelector('#osg-intrusion-title');
    if (titleEl) titleEl.textContent = t('security.intrusionTitle');
    i18nApplied = false;
    applyI18n();

    var statusDiv = document.getElementById('tarpit-status');
    if (statusDiv) statusDiv.textContent = t('security.tarpitInit');
    window.setTimeout(function () { startTarpit(statusDiv); }, 1500);
  }

  function onDocumentClick(event) {
    var container = document.getElementById('osg-security-container');
    var modal = document.getElementById('osg-security-modal');
    if (!container || !modal || !modal.classList.contains('is-open')) return;
    if (!container.contains(event.target)) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function onContextMenu(e) {
    e.preventDefault();
    triggerIntrusionAlert();
  }

  function onKeyDown(e) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
      (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'I')) ||
      (e.metaKey && e.altKey && (e.key === 'u' || e.key === 'U'))
    ) {
      e.preventDefault();
      triggerIntrusionAlert();
    }
  }

  function onCopy(e) {
    e.preventDefault();
    triggerIntrusionAlert();
  }

  function bindEvents() {
    if (!document.getElementById('osg-security-container')) return;

    var badge = document.getElementById('osg-secure-badge');
    var closeBtn = document.getElementById('osg-security-close');

    if (badge && !badge.__osgBound) {
      badge.__osgBound = true;
      badge.addEventListener('click', toggleSecurityModal);
      badge.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSecurityModal();
        }
      });
    }

    if (closeBtn && !closeBtn.__osgBound) {
      closeBtn.__osgBound = true;
      closeBtn.addEventListener('click', toggleSecurityModal);
    }

    if (!document.documentElement.__osgDocBound) {
      document.documentElement.__osgDocBound = true;
      document.addEventListener('click', onDocumentClick, false);
      document.addEventListener('contextmenu', onContextMenu, false);
      document.addEventListener('keydown', onKeyDown, false);
      document.addEventListener('copy', onCopy, false);
      document.addEventListener('osg:i18nReady', applyI18n, false);
      if (window.i18next && !i18next.__osgSecurityLang) {
        i18next.__osgSecurityLang = true;
        i18next.on('languageChanged', applyI18n);
        if (i18next.isInitialized) applyI18n();
      }
    }
  }

  function boot() {
    try {
      bindEvents();
      applyI18n();
    } catch (e) { /* zero-footprint: never block page boot */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.OSGSecurity = {
    toggleModal: toggleSecurityModal,
    triggerIntrusion: triggerIntrusionAlert,
    refreshI18n: applyI18n
  };
  window.toggleSecurityModal = toggleSecurityModal;
  window.triggerIntrusionAlert = triggerIntrusionAlert;
})();
