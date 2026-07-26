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

  var DEFAULT_STORES = [];

  function resolveStores(entry) {
    // Paul 2026-07-26: no multi-store badge row — single universal download later.
    if (entry && Array.isArray(entry.stores) && entry.stores.length === 0) return [];
    return [];
  }

  function renderInto(container) {
    if (!container) return;
    container.innerHTML = '';
    container.hidden = true;
  }

  window.OSGStoreBadges = {
    BADGES: BADGES,
    DEFAULT_STORES: DEFAULT_STORES,
    resolveStores: resolveStores,
    renderInto: renderInto
  };
})();
