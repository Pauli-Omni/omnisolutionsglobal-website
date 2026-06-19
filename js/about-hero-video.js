(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'about') return;

  var video = document.getElementById('about-hero-video');
  if (!video) return;

  function play() {
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { /* autoplay policy */ });
    }
  }

  video.addEventListener('loadeddata', play, { once: true });
  if (video.readyState >= 2) play();
})();
