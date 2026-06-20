(function () {
  'use strict';

  /**
   * Master app registry — sidebar order, front/desc routes, icons.
   * name/desc → assets/locales/*.json unter portfolio.{id}
   * frontWerbetext → {pageKey}.frontWerbetext (App-Vorderseite)
   */
  var APPS = [
    {
      id: 'pauliBestprice',
      pageKey: 'pauli',
      frontFile: 'pauli-bestprice-thailand.html',
      descFile: 'pauli-bestprice-thailand-beschreibung.html',
      icon: 'assets/icons/apps/pauli-bestprice.png'
    },
    {
      id: 'omnicadAiCam',
      pageKey: 'omnicad',
      frontFile: 'omnicad-ai-cam.html',
      descFile: 'omnicad-ai-cam-beschreibung.html',
      icon: 'assets/icons/apps/omnicad-ai-cam.png',
      stores: ['windows', 'ios', 'android']
    },
    {
      id: 'omnigateAiMaster',
      pageKey: 'omnigate',
      frontFile: 'omnigate-master.html',
      descFile: 'omnigate-master-beschreibung.html',
      icon: 'assets/icons/apps/omnigate-ai-master.png'
    },
    {
      id: 'omniqrAiPay',
      pageKey: 'omniqr',
      frontFile: '/omniqr-ai-for-tourist-of-thailand/index.html',
      descFile: '/omniqr-ai-for-tourist-of-thailand/beschreibung.html',
      icon: '/assets/icons/apps/omniqr-ai-pay.png'
    },
    {
      id: 'omnifixAiDokument',
      pageKey: 'omnifix',
      frontFile: 'omnifix-ai.html',
      descFile: 'omnifix-ai-beschreibung.html',
      icon: 'assets/icons/apps/omnifix-ai-dokument.png'
    },
    {
      id: 'omnibotKiProfit',
      pageKey: 'omnibot',
      frontFile: 'omnibot-ki-profit.html',
      descFile: 'omnibot-ki-profit-beschreibung.html',
      icon: 'assets/icons/apps/omnibot-ki-profit.png'
    },
    {
      id: 'omniaiQrGenerator',
      pageKey: 'omniaiQr',
      frontFile: 'omniai-qr-generator.html',
      descFile: 'omniai-qr-generator-beschreibung.html',
      icon: 'assets/icons/apps/omniai-qr-generator.png'
    },
    {
      id: 'omnitalkAiLive',
      pageKey: 'omnitalk',
      frontFile: 'omnitalk-ai-live.html',
      descFile: 'omnitalk-ai-live-beschreibung.html',
      icon: 'assets/icons/apps/omnitalk-ai-live.png'
    }
  ];

  function getById(id) {
    return APPS.find(function (a) { return a.id === id; }) || null;
  }

  function getByPageKey(pageKey) {
    return APPS.find(function (a) { return a.pageKey === pageKey; }) || null;
  }

  window.OSGAppRegistry = {
    APPS: APPS,
    getById: getById,
    getByPageKey: getByPageKey
  };
})();
