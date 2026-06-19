(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'about') return;

  var root = document.documentElement;
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    root.style.setProperty('--about-shine-x', (y * 0.12) + 'px');
    root.style.setProperty('--about-shine-y', (y * 0.08) + 'px');
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
