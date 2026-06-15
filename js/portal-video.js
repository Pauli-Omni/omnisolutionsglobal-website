(function () {
  'use strict';

  var heroVideoInited = false;
  var portalInited = false;
  var PORTAL_VIDEO_PLAYBACK_RATE = 0.72;

  function applyPortalVideoPlayback(video) {
    if (!video) return;
    video.defaultPlaybackRate = PORTAL_VIDEO_PLAYBACK_RATE;
    video.playbackRate = PORTAL_VIDEO_PLAYBACK_RATE;
  }

  function tryPlay(video) {
    applyPortalVideoPlayback(video);
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { /* autoplay policy */ });
    }
  }

  function syncPortalSoundButton(video) {
    var btn = document.getElementById('portal-video-sound-btn');
    if (!btn || !video) return;

    var on = !video.muted;
    var ariaKey = on ? 'portal.videoSoundMuteAria' : 'portal.videoSoundUnmuteAria';

    btn.classList.toggle('portal-video-sound-btn--on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('data-i18n-aria', ariaKey);
    if (window.OSGI18n && typeof OSGI18n.t === 'function') {
      btn.setAttribute('aria-label', OSGI18n.t(ariaKey));
    }
  }

  function resetPortalVideoSound(video) {
    if (!video) return;
    video.muted = true;
    syncPortalSoundButton(video);
  }

  function syncHeroVideoVisibility() {
    var portal = document.getElementById('portal-overlay');
    var video = document.getElementById('hero-video');
    if (!video) return;

    var portalOpen = portal
      && !portal.classList.contains('portal-hidden')
      && !portal.classList.contains('portal-reveal');

    if (portalOpen) {
      video.classList.remove('hero-video--hidden');
      tryPlay(video);
    } else {
      video.classList.add('hero-video--hidden');
      resetPortalVideoSound(video);
      video.pause();
    }
  }

  function initPortalVideoSound() {
    var btn = document.getElementById('portal-video-sound-btn');
    var video = document.getElementById('hero-video');
    if (!btn || !video) return;

    btn.addEventListener('click', function () {
      video.muted = !video.muted;
      if (!video.muted) {
        video.volume = 1;
        tryPlay(video);
      }
      syncPortalSoundButton(video);
    });

    if (window.i18next) {
      i18next.on('languageChanged', function () {
        syncPortalSoundButton(video);
      });
    }

    syncPortalSoundButton(video);
  }

  function isPhoneViewport() {
    var w = window.innerWidth || document.documentElement.clientWidth || 0;
    var h = window.innerHeight || document.documentElement.clientHeight || 0;
    var minSide = Math.min(w, h);
    var touch = navigator.maxTouchPoints > 0
      || window.matchMedia('(pointer: coarse)').matches
      || 'ontouchstart' in window;
    return touch && minSide <= 520;
  }

  function syncPhoneVideoFit() {
    if (document.body.getAttribute('data-page') !== 'home') return;
    var w = window.innerWidth || document.documentElement.clientWidth || 0;
    var h = window.innerHeight || document.documentElement.clientHeight || 0;
    var phone = isPhoneViewport();
    var portrait = h >= w;
    document.body.classList.toggle('portal-video-phone-portrait', phone && portrait);
    document.body.classList.toggle('portal-video-phone-landscape', phone && !portrait);
  }

  function initPhoneVideoFit() {
    syncPhoneVideoFit();
    window.addEventListener('resize', syncPhoneVideoFit);
    window.addEventListener('orientationchange', syncPhoneVideoFit);
  }

  function applyMobileVideoLoadHints(video) {
    if (!video) return;
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = conn && conn.saveData;
    var slowNet = conn && typeof conn.effectiveType === 'string'
      && /^(?:slow-)?2g$/i.test(conn.effectiveType);
    if (window.matchMedia('(max-width: 768px)').matches && (saveData || slowNet)) {
      video.preload = 'metadata';
    }
  }

  function initPortalHeroVideo() {
    if (heroVideoInited) return;
    heroVideoInited = true;

    var video = document.getElementById('hero-video');
    if (!video) return;

    applyMobileVideoLoadHints(video);
    initPhoneVideoFit();

    function onVideoError() {
      video.classList.add('hero-video--failed');
      video.pause();
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      video.removeAttribute('autoplay');
      video.classList.add('hero-video--hidden');
      var soundBtnReduced = document.getElementById('portal-video-sound-btn');
      if (soundBtnReduced) soundBtnReduced.hidden = true;
      return;
    }

    initPortalVideoSound();

    video.addEventListener('loadeddata', function () { tryPlay(video); });
    video.addEventListener('canplay', function () { tryPlay(video); });
    video.addEventListener('canplaythrough', function () { tryPlay(video); });
    video.addEventListener('error', onVideoError);
    tryPlay(video);
    syncHeroVideoVisibility();

    var portal = document.getElementById('portal-overlay');
    if (portal && typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(syncHeroVideoVisibility);
      obs.observe(portal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function initPortalSparks() {
    var portal = document.getElementById('portal-overlay');
    var layer = document.getElementById('portal-sparks');
    if (!portal || !layer) return;

    if (window.matchMedia('(max-width: 768px), (pointer: coarse)').matches) return;

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
      if (portalInited) return;
      portalInited = true;
      initPortalHeroVideo();
      initPortalSparks();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortalHeroVideo);
  } else {
    initPortalHeroVideo();
  }

  if (document.body) {
    syncPhoneVideoFit();
  } else {
    document.addEventListener('DOMContentLoaded', syncPhoneVideoFit);
  }
})();
