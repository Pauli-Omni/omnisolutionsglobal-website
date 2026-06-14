(function () {
  'use strict';

  var PORTAL_VIDEO_SRC = '/assets/video/portal-loop.mp4';

  function initPortalVideo() {
    var portal = document.getElementById('portal-overlay');
    var video = document.getElementById('portal-brand-video');
    var fallback = document.getElementById('portal-logo-slot');
    if (!portal || !video) return;

    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.controls = false;
    video.disablePictureInPicture = true;
    video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
    video.setAttribute('aria-hidden', 'true');

    function showVideo() {
      portal.classList.add('portal-has-video');
      if (fallback) fallback.setAttribute('hidden', '');
      video.removeAttribute('hidden');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () { /* autoplay policy */ });
      }
    }

    function showFallback() {
      portal.classList.remove('portal-has-video');
      video.setAttribute('hidden', '');
      video.setAttribute('data-fallback', '1');
      if (fallback) fallback.removeAttribute('hidden');
      if (window.OSGHome && window.OSGHome.initPortalFallbackLogo) {
        OSGHome.initPortalFallbackLogo();
      }
    }

    video.addEventListener('loadeddata', showVideo);
    video.addEventListener('error', showFallback);

    fetch(PORTAL_VIDEO_SRC, { method: 'HEAD' })
      .then(function (res) {
        if (!res.ok) {
          showFallback();
          return;
        }
        video.src = PORTAL_VIDEO_SRC;
        video.load();
      })
      .catch(showFallback);
  }

  function initPortalSparks() {
    var portal = document.getElementById('portal-overlay');
    var layer = document.getElementById('portal-sparks');
    if (!portal || !layer) return;

    var lastSpark = 0;

    portal.addEventListener('mousemove', function (e) {
      if (portal.classList.contains('portal-hidden')) return;
      var now = Date.now();
      if (now - lastSpark < 48) return;
      lastSpark = now;

      var rect = portal.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var spark = document.createElement('span');
      spark.className = 'portal-spark';
      spark.style.left = x + 'px';
      spark.style.top = y + 'px';
      spark.style.setProperty('--spark-angle', String(Math.floor(Math.random() * 360)) + 'deg');
      layer.appendChild(spark);
      spark.addEventListener('animationend', function () {
        spark.remove();
      });
    });
  }

  window.OSGPortalVideo = {
    init: function () {
      initPortalVideo();
      initPortalSparks();
    }
  };
})();
