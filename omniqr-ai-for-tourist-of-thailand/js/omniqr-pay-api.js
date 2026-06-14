(function () {
  'use strict';

  var API_BASE = '/omniqr-ai-for-tourist-of-thailand/api';

  function headers() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-OSG-Client-Proof': 'omniqr-web-v1'
    };
  }

  function parseJson(res) {
    return res.json().then(function (body) {
      if (!res.ok) throw body;
      return body;
    });
  }

  function preview(qrPayload, marketAmountThb) {
    return fetch(API_BASE + '/preview', {
      method: 'POST',
      headers: headers(),
      cache: 'no-store',
      body: JSON.stringify({
        qrPayload: qrPayload,
        marketAmountThb: marketAmountThb
      })
    }).then(parseJson);
  }

  function authorize(payload) {
    return fetch(API_BASE + '/authorize', {
      method: 'POST',
      headers: headers(),
      cache: 'no-store',
      body: JSON.stringify(payload)
    }).then(parseJson);
  }

  function verifySeal(payload) {
    return fetch(API_BASE + '/verify-seal', {
      method: 'POST',
      headers: headers(),
      cache: 'no-store',
      body: JSON.stringify(payload)
    }).then(parseJson);
  }

  function demoQr() {
    return fetch(API_BASE + '/demo-qr', {
      method: 'GET',
      headers: headers(),
      cache: 'no-store'
    }).then(parseJson);
  }

  function submitSupport(payload) {
    return fetch(API_BASE + '/support', {
      method: 'POST',
      headers: headers(),
      cache: 'no-store',
      body: JSON.stringify(payload)
    }).then(parseJson);
  }

  window.OmniQrPayApi = {
    preview: preview,
    authorize: authorize,
    verifySeal: verifySeal,
    demoQr: demoQr,
    submitSupport: submitSupport
  };
})();
