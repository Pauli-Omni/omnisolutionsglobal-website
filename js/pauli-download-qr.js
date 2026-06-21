(function () {
  'use strict';

  var DEFAULT_DOWNLOAD_URL = 'https://pauli-best-price-api.onrender.com/download';

  function t(key, fb) {
    if (window.OSGI18n) {
      var v = OSGI18n.t(key);
      if (v && v !== key) return v;
    }
    return fb || key;
  }

  function resolveDownloadUrl() {
    var app = window.OSGAppRegistry && OSGAppRegistry.getById('pauliBestprice');
    if (app && app.downloadHubUrl) return app.downloadHubUrl;
    if (window.OSG_PAULI_DOWNLOAD_URL) return window.OSG_PAULI_DOWNLOAD_URL;
    return DEFAULT_DOWNLOAD_URL;
  }

  function renderQr(canvas, url) {
    if (!canvas || !window.QRCode) return;
    QRCode.toCanvas(
      canvas,
      url,
      {
        width: Math.min(220, Math.max(160, canvas.clientWidth || 200)),
        margin: 2,
        color: { dark: '#1c0638', light: '#f6f0dc00' },
      },
      function () {}
    );
  }

  function wireDownloadBtn(canvas) {
    var btn = document.getElementById('pauli-download-qr-btn');
    if (!btn || !canvas) return;
    btn.addEventListener('click', function () {
      if (!canvas.toBlob) return;
      canvas.toBlob(function (blob) {
        if (!blob) return;
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'pauli-bestprice-download-qr.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
          URL.revokeObjectURL(a.href);
        }, 4000);
      });
    });
  }

  function initRoot(rootId) {
    var root = document.getElementById(rootId);
    if (!root) return;
    var canvas = root.querySelector('.pauli-download-qr-canvas');
    var openLink = root.querySelector('.pauli-download-open-link');
    var url = resolveDownloadUrl();
    if (openLink) {
      openLink.href = url;
      openLink.setAttribute('target', '_blank');
      openLink.setAttribute('rel', 'noopener noreferrer');
    }
    if (canvas) {
      canvas.setAttribute('aria-label', t('pauli.downloadQrAria', 'Pauli download QR code'));
      renderQr(canvas, url);
      wireDownloadBtn(canvas);
    }
  }

  function boot() {
    initRoot('home-pauli-download');
    initRoot('pauli-front-download');
  }

  function bindLangRefresh() {
    if (!window.i18next || i18next._osgPauliQrBound) return;
    i18next._osgPauliQrBound = true;
    i18next.on('languageChanged', boot);
  }

  window.OSGPauliDownloadQr = { boot: boot, resolveDownloadUrl: resolveDownloadUrl };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      boot();
      bindLangRefresh();
    });
  } else {
    boot();
    bindLangRefresh();
  }
})();
