(function () {
  'use strict';

  var BADGES = {
    ios: {
      img: 'assets/icons/stores/apple-app-store.png',
      labelKey: 'product.storeIos'
    },
    android: {
      img: 'assets/icons/stores/google-play.png',
      labelKey: 'product.storeAndroid'
    },
    huawei: {
      img: 'assets/icons/stores/huawei-appgallery.png',
      labelKey: 'product.storeHuawei'
    },
    samsung: {
      img: 'assets/icons/stores/samsung-galaxy-store.png',
      labelKey: 'product.storeSamsung'
    },
    windows: {
      img: 'assets/icons/stores/microsoft-store.png',
      labelKey: 'product.storeWindows'
    }
  };

  var DEFAULT_STORES = ['ios', 'android', 'huawei', 'samsung'];

  function t(key) {
    return window.OSGI18n ? OSGI18n.t(key) : key;
  }

  function resolveStores(entry) {
    if (entry && entry.stores && entry.stores.length) return entry.stores;
    return DEFAULT_STORES;
  }

  function buildBadge(storeId, url) {
    var meta = BADGES[storeId];
    if (!meta) return null;

    var label = t(meta.labelKey);
    var wrap = document.createElement(url ? 'a' : 'span');
    wrap.className = 'store-badge';
    if (url) {
      wrap.href = url;
      wrap.target = '_blank';
      wrap.rel = 'noopener noreferrer';
    }

    var img = document.createElement('img');
    img.className = 'store-badge-img';
    img.src = meta.img;
    img.alt = label;
    img.width = 120;
    img.height = 40;
    img.loading = 'lazy';
    img.onerror = function () {
      wrap.classList.add('store-badge--missing');
      wrap.setAttribute('title', label);
      img.remove();
      var fallback = document.createElement('span');
      fallback.className = 'store-badge-fallback';
      fallback.textContent = label;
      wrap.appendChild(fallback);
    };

    wrap.appendChild(img);
    return wrap;
  }

  function renderInto(container, entry) {
    if (!container) return;
    container.innerHTML = '';

    var stores = resolveStores(entry);
    var links = (entry && entry.storeUrls) || {};

    stores.forEach(function (storeId) {
      var badge = buildBadge(storeId, links[storeId] || '');
      if (badge) container.appendChild(badge);
    });
  }

  window.OSGStoreBadges = {
    BADGES: BADGES,
    DEFAULT_STORES: DEFAULT_STORES,
    resolveStores: resolveStores,
    renderInto: renderInto
  };
})();
