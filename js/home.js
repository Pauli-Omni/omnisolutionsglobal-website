(function () {
  'use strict';

  var TICKET_BASE = 100511;

  var INFINITY_PATH = 'M96 90 C96 58 132 58 160 90 C188 122 224 122 224 90 C224 58 188 58 160 90 C132 122 96 122 96 90 Z';

  function buildAnimatedLogoHTML() {
    return (
      '<div class="osg-logo-anim">' +
        '<div class="osg-logo-aura" aria-hidden="true"></div>' +
        '<svg class="osg-logo-infinity" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<path class="osg-infinity-path" d="' + INFINITY_PATH + '"/>' +
        '</svg>' +
        '<div class="osg-globe osg-globe--top" aria-hidden="true">' +
          '<div class="osg-globe-body"><div class="osg-globe-lines"></div></div>' +
        '</div>' +
        '<div class="osg-globe osg-globe--right" aria-hidden="true">' +
          '<div class="osg-globe-body"><div class="osg-globe-lines"></div></div>' +
        '</div>' +
        '<span class="osg-light-point osg-lp1" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp2" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp3" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp4" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp5" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp6" aria-hidden="true"></span>' +
      '</div>'
    );
  }

  function buildPortalLogoHTML() {
    return (
      '<div class="osg-logo-anim osg-logo-anim--portal">' +
        '<div class="osg-logo-aura osg-logo-aura--portal" aria-hidden="true"></div>' +
        '<svg class="osg-logo-infinity osg-logo-infinity--portal" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<defs>' +
            '<linearGradient id="osg-portal-energy" x1="0%" y1="0%" x2="100%" y2="0%">' +
              '<stop offset="0%" stop-color="#c8d6e4"/>' +
              '<stop offset="45%" stop-color="#00e5ff"/>' +
              '<stop offset="100%" stop-color="#a855f7"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<path class="osg-infinity-path osg-infinity-path--base" d="' + INFINITY_PATH + '"/>' +
          '<path class="osg-infinity-path osg-infinity-path--energy" d="' + INFINITY_PATH + '"/>' +
        '</svg>' +
        '<div class="osg-globe osg-globe--center" aria-hidden="true">' +
          '<div class="osg-globe-body">' +
            '<div class="osg-globe-lines"></div>' +
            '<div class="osg-globe-nodes"></div>' +
            '<div class="osg-globe-arc osg-globe-arc--1"></div>' +
            '<div class="osg-globe-arc osg-globe-arc--2"></div>' +
          '</div>' +
        '</div>' +
        '<span class="osg-light-point osg-lp-portal-1" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp-portal-2" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp-portal-3" aria-hidden="true"></span>' +
        '<span class="osg-light-point osg-lp-portal-4" aria-hidden="true"></span>' +
      '</div>'
    );
  }

  function initAnimatedLogo() {
    document.querySelectorAll('.osg-logo-mount').forEach(function (mount) {
      if (mount.firstElementChild) return;
      if (mount.classList.contains('osg-logo-mount--portal')) return;
      if (mount.classList.contains('osg-logo-mount--splash')) return;
      mount.innerHTML = buildAnimatedLogoHTML();
    });
  }

  function initPortalFallbackLogo() {
    document.querySelectorAll('.osg-logo-mount--portal').forEach(function (mount) {
      if (mount.firstElementChild) return;
      mount.innerHTML = buildPortalLogoHTML();
    });
  }

  function generateTicket() {
    return String(TICKET_BASE + Math.floor(Math.random() * 899489));
  }

  function initContactModal() {
    var modal = document.getElementById('contact-modal');
    var openBtn = document.getElementById('project-request-btn');
    var closeBtn = document.getElementById('contact-modal-close');
    var backdrop = document.getElementById('contact-modal-backdrop');
    var form = document.getElementById('contact-form');
    var formWrap = document.getElementById('contact-form-wrap');
    var successWrap = document.getElementById('contact-success');
    var ticketEl = document.getElementById('contact-ticket');
    if (!modal || !openBtn || !form) return;

    function openModal() {
      modal.removeAttribute('hidden');
      document.body.classList.add('modal-open');
      closeBtn.focus();
    }

    function closeModal() {
      modal.setAttribute('hidden', '');
      document.body.classList.remove('modal-open');
      openBtn.focus();
    }

    function resetForm() {
      form.reset();
      formWrap.hidden = false;
      successWrap.hidden = true;
    }

    openBtn.addEventListener('click', function () {
      resetForm();
      openModal();
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ticket = generateTicket();
      if (ticketEl) ticketEl.textContent = ticket;
      formWrap.hidden = true;
      successWrap.hidden = false;
      if (window.OSGI18n) OSGI18n.applyToDom();
    });
  }

  function initHomeRefs() {
    var track = document.getElementById('home-refs-track');
    if (!track) return;
    var cards = [];
    var i;
    for (i = 1; i <= 6; i += 1) {
      var titleKey = 'home.ref' + i + 'Title';
      var textKey = 'home.ref' + i + 'Text';
      var title = (window.OSGI18n && OSGI18n.t(titleKey)) || '';
      var text = (window.OSGI18n && OSGI18n.t(textKey)) || '';
      if (!title || title === titleKey) continue;
      cards.push(
        '<article class="ref-card">' +
          '<h3 class="chrome-silver-text">' + title + '</h3>' +
          '<p>' + text + '</p>' +
        '</article>'
      );
    }
    if (!cards.length) {
      track.innerHTML = '';
      return;
    }
    // Duplicate for seamless marquee loop
    track.innerHTML = cards.join('') + cards.join('');
  }

  function initHomeAppGrid() {
    var grid = document.getElementById('home-app-grid');
    if (!grid || !window.OSGAppRegistry || !OSGAppRegistry.APPS) return;
    grid.innerHTML = '';
    OSGAppRegistry.APPS.forEach(function (app) {
      var nameKey = 'portfolio.' + app.id + '.name';
      var descKey = 'portfolio.' + app.id + '.desc';
      var name = (window.OSGI18n && OSGI18n.t(nameKey)) || app.brandName || app.id;
      if (name === nameKey) name = app.brandName || app.id;
      var desc = (window.OSGI18n && OSGI18n.t(descKey)) || '';
      if (desc === descKey) desc = '';
      var href = app.frontFile || '#';
      var li = document.createElement('li');
      li.className = 'home-app-grid__item';
      var a = document.createElement('a');
      a.className = 'home-app-tile';
      a.href = href;
      a.setAttribute('aria-label', name);
      var img = document.createElement('img');
      img.className = 'home-app-tile__icon';
      img.src = app.icon;
      img.alt = '';
      img.width = 56;
      img.height = 56;
      img.loading = 'lazy';
      img.decoding = 'async';
      var title = document.createElement('span');
      title.className = 'home-app-tile__name';
      title.textContent = name;
      a.appendChild(img);
      a.appendChild(title);
      if (desc) {
        var sub = document.createElement('span');
        sub.className = 'home-app-tile__desc';
        sub.textContent = desc;
        a.appendChild(sub);
      }
      li.appendChild(a);
      grid.appendChild(li);
    });
  }

  window.OSGHome = {
    initAnimatedLogo: initAnimatedLogo,
    initPortalFallbackLogo: initPortalFallbackLogo,
    initHomeAppGrid: initHomeAppGrid,
    initHomeRefs: initHomeRefs,
    init: function () {
      if (document.body.getAttribute('data-page') !== 'home') return;
      initContactModal();
      initHomeAppGrid();
      initHomeRefs();
      if (window.i18next) {
        i18next.on('languageChanged', function () {
          initHomeAppGrid();
          initHomeRefs();
        });
      }
    }
  };
})();