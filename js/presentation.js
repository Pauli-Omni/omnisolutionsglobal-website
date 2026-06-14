(function () {
  'use strict';

  function buildArcSvg(brandText, arcId) {
    var safe = String(brandText || '');
    return (
      '<svg class="presentation-qr-arc-svg" viewBox="0 0 220 36" aria-hidden="true" focusable="false">' +
        '<defs><path id="' + arcId + '" d="M 12 30 A 98 98 0 0 1 208 30"/></defs>' +
        '<text class="presentation-qr-arc-text">' +
          '<textPath href="#' + arcId + '" startOffset="50%" text-anchor="middle">' + safe + '</textPath>' +
        '</text>' +
      '</svg>'
    );
  }

  function buildProductCard(entry) {
    var card = document.createElement('a');
    card.className = 'presentation-product-card';
    card.href = entry.file;

    if (entry.icon) {
      var iconWrap = document.createElement('div');
      iconWrap.className = 'presentation-product-icon';
      var iconImg = document.createElement('img');
      iconImg.className = 'presentation-product-icon-img';
      iconImg.width = 56;
      iconImg.height = 56;
      iconImg.alt = OSGI18n.t('portfolio.' + entry.id + '.name');
      iconImg.onerror = function () { iconWrap.remove(); };
      iconImg.src = entry.icon;
      iconWrap.appendChild(iconImg);
      card.appendChild(iconWrap);
    }

    var arcWrap = document.createElement('div');
    arcWrap.className = 'presentation-qr-arc';
    arcWrap.innerHTML = buildArcSvg(OSGI18n.t('presentation.brandArc'), 'presentation-arc-' + entry.id);

    var qrBox = document.createElement('div');
    qrBox.className = 'presentation-qr-box';
    if (entry.qrImage) {
      var img = document.createElement('img');
      img.src = entry.qrImage;
      img.alt = OSGI18n.t('product.qrImgAlt');
      img.width = 140;
      img.height = 140;
      img.className = 'presentation-qr-img';
      qrBox.appendChild(img);
    } else {
      var ph = document.createElement('span');
      ph.className = 'presentation-qr-placeholder';
      ph.textContent = OSGI18n.t('product.qrPlaceholder');
      qrBox.appendChild(ph);
    }

    var body = document.createElement('div');
    body.className = 'presentation-product-body';
    var title = document.createElement('h3');
    title.textContent = OSGI18n.t('portfolio.' + entry.id + '.name');
    var desc = document.createElement('p');
    desc.textContent = OSGI18n.t('portfolio.' + entry.id + '.desc');
    body.appendChild(title);
    body.appendChild(desc);

    card.appendChild(arcWrap);
    card.appendChild(qrBox);

    if (window.OSGStoreBadges) {
      var storesWrap = document.createElement('div');
      storesWrap.className = 'presentation-store-badges';
      OSGStoreBadges.renderInto(storesWrap, entry);
      card.appendChild(storesWrap);
    }

    card.appendChild(body);
    return card;
  }

  function renderProducts() {
    var grid = document.getElementById('presentation-products-grid');
    if (!grid || !window.OSGPortfolio || !window.OSGI18n) return;

    grid.innerHTML = '';
    OSGPortfolio.DATA.forEach(function (entry) {
      grid.appendChild(buildProductCard(entry));
    });
  }

  function initSplashScroll() {
    var splash = document.getElementById('splash');
    var target = document.getElementById('products');
    if (!splash || !target) return;

    function go() {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    splash.addEventListener('click', go);
    splash.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  }

  function initPresentation() {
    if (document.body.getAttribute('data-page') !== 'presentation') return;
    if (window.OSGHome) OSGHome.initAnimatedLogo();
    renderProducts();
    initSplashScroll();
    if (window.i18next) {
      i18next.on('languageChanged', function () {
        OSGI18n.applyToDom();
        renderProducts();
      });
    }
  }

  window.OSGPresentation = { init: initPresentation, renderProducts: renderProducts };
})();
