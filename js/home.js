(function () {
  'use strict';

  var TICKET_BASE = 100511;

  function buildAnimatedLogoHTML() {
    return (
      '<div class="osg-logo-anim">' +
        '<div class="osg-logo-aura" aria-hidden="true"></div>' +
        '<svg class="osg-logo-infinity" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<path class="osg-infinity-path" d="M96 90 C96 58 132 58 160 90 C188 122 224 122 224 90 C224 58 188 58 160 90 C132 122 96 122 96 90 Z"/>' +
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

  function initAnimatedLogo() {
    document.querySelectorAll('.osg-logo-mount').forEach(function (mount) {
      if (mount.firstElementChild) return;
      mount.innerHTML = buildAnimatedLogoHTML();
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

  function initSplashScroll() {
    var splash = document.getElementById('home-splash');
    var target = document.getElementById('home-content');
    if (!splash || !target) return;

    function scrollToContent() {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    splash.addEventListener('click', scrollToContent);
    splash.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToContent();
      }
    });
  }

  window.OSGHome = {
    initAnimatedLogo: initAnimatedLogo,
    init: function () {
      if (document.body.getAttribute('data-page') !== 'home') return;
      initContactModal();
      initSplashScroll();
    }
  };
})();
