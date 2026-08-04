(function () {
  'use strict';

  /**
   * Master app registry — sidebar order, front/desc routes, icons.
   * name/desc → assets/locales/*.json unter portfolio.{id}
   * frontWerbetext → {pageKey}.frontWerbetext (App-Vorderseite)
   * Brand names are ALWAYS English (never localized product names).
   */
  var APPS = [
    {
      id: 'omniKingAiTrading',
      pageKey: 'omniKing',
      brandName: 'Omni King AI Trading',
      frontFile: 'omni-king-ai-trading.html',
      descFile: 'omni-king-ai-trading-beschreibung.html',
      icon: 'assets/icons/apps/omni-king-ai-trading.png',
      iconPackZip: 'assets/downloads/omni-king-ai-trading-icons.zip',
      downloadIconPackUrl: 'assets/downloads/omni-king-ai-trading-icons.zip'
    },
    {
      id: 'pauliBestprice',
      pageKey: 'pauli',
      brandName: 'Pauli BestPrice Global',
      frontFile: 'pauli-bestprice-global.html',
      descFile: 'pauli-bestprice-thailand-beschreibung.html',
      icon: 'assets/icons/apps/pauli-bestprice.png',
      marketIcons: {
        th: 'assets/icons/apps/pauli-bestprice-thailand.png',
        de: 'assets/icons/apps/pauli-bestprice-deutschland.png',
        us: 'assets/icons/apps/pauli-bestprice-usa.png',
        nl: 'assets/icons/apps/pauli-bestprice-nederland.png',
        uk: 'assets/icons/apps/pauli-bestprice-uk.png',
        vn: 'assets/icons/apps/pauli-bestprice-vietnam.png'
      },
      // Live download API currently suspended on Render — land on product desc (QR/store) until resumed.
      downloadHubUrl: 'pauli-bestprice-thailand-beschreibung.html'
    },
    {
      id: 'omnicadAiCam',
      pageKey: 'omnicad',
      brandName: 'OmniCAD-AI CAM',
      frontFile: 'omnicad-ai-cam.html',
      descFile: 'omnicad-ai-cam-beschreibung.html',
      icon: 'assets/icons/apps/omnicad-ai-cam.png',
      iconPackZip: 'assets/downloads/omnicad-ai-cam-icons.zip',
      downloadIconPackUrl: 'assets/downloads/omnicad-ai-cam-icons.zip',
      stores: ['windows', 'ios', 'android']
    },
    {
      id: 'omnigateAiMaster',
      pageKey: 'omnigate',
      brandName: 'OmniGate - AI Master',
      frontFile: 'omnigate-master.html',
      descFile: 'omnigate-master-beschreibung.html',
      icon: 'assets/icons/apps/omnigate-ai-master.png'
    },
    {
      id: 'omniqrAiPay',
      pageKey: 'omniqr',
      brandName: 'OmniQR-AI for Tourist of Thailand',
      frontFile: '/omniqr-ai-for-tourist-of-thailand/index.html',
      descFile: '/omniqr-ai-for-tourist-of-thailand/beschreibung.html',
      icon: '/assets/icons/apps/omniqr-ai-pay.png'
    },
    {
      id: 'omnifixAiDokument',
      pageKey: 'omnifix',
      brandName: 'OmniFIX - AI Document Assistant',
      frontFile: 'omnifix-ai.html',
      descFile: 'omnifix-ai-beschreibung.html',
      icon: 'assets/icons/apps/omnifix-ai-dokument.png',
      iconPackZip: 'assets/downloads/omnifix-ai-dokument-icons.zip',
      downloadIconPackUrl: 'assets/downloads/omnifix-ai-dokument-icons.zip'
    },
    {
      id: 'omniaiQrGenerator',
      pageKey: 'omniaiQr',
      brandName: 'OmniAI-QR Code Generator',
      frontFile: 'omniai-qr-generator.html',
      descFile: 'omniai-qr-generator-beschreibung.html',
      icon: 'assets/icons/apps/omniai-qr-generator.png'
    },
    {
      id: 'omnitalkAiLive',
      pageKey: 'omnitalk',
      brandName: 'OmniTalk-AI Live',
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
