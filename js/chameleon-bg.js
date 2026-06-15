(function () {
  'use strict';

  /** Optional Sora-2 background loop — only if assets/video/chameleon-bg.mp4 exists (HTTP 200). */
  var VIDEO_SRC = '/assets/video/chameleon-bg.mp4';

  function mountVideoLayer(container) {
    if (!container || container.querySelector('.chameleon-bg__video')) return;

    var video = document.createElement('video');
    video.className = 'chameleon-bg__video';
    video.src = VIDEO_SRC;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'metadata';

    container.insertBefore(video, container.firstChild);
  }

  function init() {
    var container = document.querySelector('.chameleon-bg');
    if (!container) return;

    fetch(VIDEO_SRC, { method: 'HEAD' })
      .then(function (res) {
        if (res.ok) mountVideoLayer(container);
      })
      .catch(function () { /* no video asset — CSS-only background */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
