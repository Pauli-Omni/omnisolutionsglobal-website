(function () {
  'use strict';

  var APP_ICON_SVG = '<svg class="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
    '<rect x="4" y="4" width="16" height="16" rx="3"/>' +
    '<path d="M9 9h6v6H9z"/>' +
    '</svg>';

  var INSERT_BEFORE_SELECTOR = 'a[href="werbe-ecke.html"]';

  function t(key) {
    return window.OSGI18n ? OSGI18n.t(key) : key;
  }

  function buildAppLink(app) {
    var li = document.createElement('li');
    li.className = 'hub-app-nav-item';
    var a = document.createElement('a');
    a.className = 'sidebar-link';
    a.href = app.frontFile;
    a.innerHTML = APP_ICON_SVG + '<span></span>';
    a.querySelector('span').textContent = t('portfolio.' + app.id + '.name');
    li.appendChild(a);
    return li;
  }

  function clearAppLinks(list) {
    list.querySelectorAll('.hub-app-nav-item').forEach(function (el) { el.remove(); });
  }

  function init() {
    var list = document.getElementById('hub-sidebar-list');
    if (!list || !window.OSGAppRegistry) return;

    var anchor = list.querySelector(INSERT_BEFORE_SELECTOR);
    var anchorLi = anchor ? anchor.closest('li') : null;
    clearAppLinks(list);

    OSGAppRegistry.APPS.forEach(function (app) {
      var li = buildAppLink(app);
      if (anchorLi) list.insertBefore(li, anchorLi);
      else list.appendChild(li);
    });
  }

  window.OSGHubSidebar = { init: init };
})();
