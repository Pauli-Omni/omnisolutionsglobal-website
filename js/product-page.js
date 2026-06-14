(function () {
  'use strict';

  function loadOptionalImage(img, src, alt, onReady, onFail) {
    if (!img || !src) {
      if (onFail) onFail();
      return;
    }
    img.alt = alt || '';
    img.onload = function () {
      img.removeAttribute('hidden');
      if (onReady) onReady();
    };
    img.onerror = function () {
      img.setAttribute('hidden', '');
      if (onFail) onFail();
    };
    img.src = src;
  }

  function setupUniversalQr(entry) {
    var scanImg = document.getElementById('product-qr-img');
    var scanPlaceholder = document.getElementById('product-qr-placeholder');
    var alt = window.OSGI18n ? OSGI18n.t('product.qrImgAlt') : '';

    if (!entry.qrImage) {
      if (scanImg) scanImg.setAttribute('hidden', '');
      if (scanPlaceholder) scanPlaceholder.removeAttribute('hidden');
      return;
    }

    loadOptionalImage(
      scanImg,
      entry.qrImage,
      alt,
      function () {
        if (scanPlaceholder) scanPlaceholder.setAttribute('hidden', '');
      },
      function () {
        if (scanPlaceholder) scanPlaceholder.removeAttribute('hidden');
      }
    );
  }

  function initProductQr() {
    var pageKey = document.body.getAttribute('data-page');
    var appIconWrap = document.getElementById('product-app-icon');
    var appIconImg = document.getElementById('product-app-icon-img');
    if (!pageKey || !window.OSGPortfolio) return;

    var entry = OSGPortfolio.DATA.find(function (e) {
      return e.pageKey === pageKey;
    });
    if (!entry) return;

    setupUniversalQr(entry);

    if (appIconWrap && appIconImg && entry.icon) {
      loadOptionalImage(
        appIconImg,
        entry.icon,
        OSGI18n ? OSGI18n.t('portfolio.' + entry.id + '.name') : '',
        function () { appIconWrap.removeAttribute('hidden'); },
        function () { appIconWrap.setAttribute('hidden', ''); }
      );
    } else if (appIconWrap) {
      appIconWrap.setAttribute('hidden', '');
    }

    var storeBadges = document.getElementById('product-store-badges');
    if (storeBadges && window.OSGStoreBadges) {
      OSGStoreBadges.renderInto(storeBadges, entry);
    }
  }

  window.OSGProductPage = { init: initProductQr };
})();
