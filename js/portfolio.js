(function () {
  'use strict';

  function getData() {
    if (!window.OSGAppRegistry) return [];
    return OSGAppRegistry.APPS.map(function (app) {
      return {
        id: app.id,
        file: app.frontFile,
        descFile: app.descFile,
        pageKey: app.pageKey,
        icon: app.icon,
        stores: app.stores,
        storeUrls: app.storeUrls
      };
    });
  }

  function t(key) {
    return window.OSGI18n ? OSGI18n.t(key) : key;
  }

  function buildIconArea(entry) {
    var wrap = document.createElement('div');
    wrap.className = 'portfolio-item-icon';

    var placeholder = document.createElement('div');
    placeholder.className = 'portfolio-item-icon-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    wrap.appendChild(placeholder);

    if (!entry.icon) return wrap;

    var iconImg = document.createElement('img');
    iconImg.className = 'portfolio-item-icon-img';
    iconImg.width = 64;
    iconImg.height = 64;
    iconImg.alt = t('portfolio.' + entry.id + '.name');
    iconImg.loading = 'lazy';
    iconImg.onload = function () {
      placeholder.hidden = true;
      wrap.classList.add('portfolio-item-icon--loaded');
    };
    iconImg.onerror = function () {
      iconImg.remove();
    };
    iconImg.src = entry.icon;
    wrap.appendChild(iconImg);
    return wrap;
  }

  function buildItem(entry, variant) {
    var card = document.createElement('article');
    card.className = 'portfolio-item neo-accent-box portfolio-item--hub';

    card.appendChild(buildIconArea(entry));

    var title = document.createElement('h3');
    title.className = 'portfolio-item-title chrome-silver-text';
    title.textContent = t('portfolio.' + entry.id + '.name');
    card.appendChild(title);

    if (variant === 'grid') {
      var desc = document.createElement('p');
      desc.className = 'portfolio-item-desc';
      desc.textContent = t('portfolio.' + entry.id + '.desc');
      card.appendChild(desc);
    }

    var cta = document.createElement('a');
    cta.className = 'btn btn-neon portfolio-item-cta';
    cta.href = entry.file;
    cta.textContent = t('app.learnMore');
    card.appendChild(cta);

    return card;
  }

  function renderInto(containerId, variant) {
    var list = document.getElementById(containerId);
    if (!list || !window.OSGI18n) return;

    list.innerHTML = '';
    getData().forEach(function (entry) {
      list.appendChild(buildItem(entry, variant));
    });
  }

  function init() {
    renderInto('portfolio-list', 'hub');
    renderInto('apps-portfolio-grid', 'grid');
  }

  window.OSGPortfolio = {
    get DATA() { return getData(); },
    renderInto: renderInto,
    init: init
  };
})();
