(function () {
  'use strict';

  var TOKEN_KEY = 'osg-ops-check-token';

  function t(key, vars) {
    if (!window.OSGI18n) return key;
    return OSGI18n.t(key, vars);
  }

  function storedToken() {
    try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }

  function saveToken(value) {
    try { sessionStorage.setItem(TOKEN_KEY, value); } catch (e) { /* ignore */ }
  }

  function clientEndpoint() {
    if (window.OSGBrandTts && OSGBrandTts.getSpeakEndpoint) {
      return OSGBrandTts.getSpeakEndpoint();
    }
    return '';
  }

  function statusClass(status) {
    if (status === 'ok') return 'ops-voice-check__row--ok';
    if (status === 'warn') return 'ops-voice-check__row--warn';
    if (status === 'fail') return 'ops-voice-check__row--fail';
    return '';
  }

  function renderSummary(summary) {
    var el = document.getElementById('ops-voice-summary');
    if (!el || !summary) return;
    el.textContent = [
      t('opsVoiceCheck.summaryPass', { n: summary.pass }),
      t('opsVoiceCheck.summaryWarn', { n: summary.warn }),
      t('opsVoiceCheck.summaryFail', { n: summary.fail })
    ].join(' · ');
  }

  function renderChecks(checks) {
    var list = document.getElementById('ops-voice-checks');
    if (!list) return;
    list.innerHTML = '';
    (checks || []).forEach(function (item) {
      var row = document.createElement('li');
      row.className = 'ops-voice-check__row ' + statusClass(item.status);
      var title = document.createElement('strong');
      title.textContent = t(item.labelKey);
      var detail = document.createElement('span');
      detail.textContent = item.detailKey ? t(item.detailKey, item.detailVars) : '';
      row.appendChild(title);
      row.appendChild(detail);
      list.appendChild(row);
    });
  }

  function renderClient() {
    var apiEl = document.getElementById('ops-client-api');
    var endpointEl = document.getElementById('ops-client-endpoint');
    if (!apiEl || !endpointEl) return;
    var hasApi = window.OSGBrandTts && OSGBrandTts.hasApi && OSGBrandTts.hasApi();
    apiEl.textContent = hasApi ? t('opsVoiceCheck.clientApiYes') : t('opsVoiceCheck.clientApiNo');
    apiEl.className = 'ops-voice-check__pill ' + (hasApi ? 'ops-voice-check__pill--ok' : 'ops-voice-check__pill--fail');
    endpointEl.textContent = clientEndpoint() || t('opsVoiceCheck.clientEndpointMissing');
  }

  function setMessage(key) {
    var msg = document.getElementById('ops-voice-message');
    if (msg) msg.textContent = key ? t(key) : '';
  }

  function fetchReport(probe) {
    var tokenInput = document.getElementById('ops-token-input');
    var token = (tokenInput && tokenInput.value.trim()) || storedToken();
    if (!token) {
      setMessage('opsVoiceCheck.tokenRequired');
      return Promise.resolve();
    }
    saveToken(token);
    setMessage('opsVoiceCheck.loading');
    var url = '/api/ops/voice-check' + (probe ? '?probe=1' : '');
    return fetch(url, {
      cache: 'no-store',
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }
    }).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) {
          if (body && body.detailKey) setMessage(body.detailKey);
          else if (res.status === 401) setMessage('opsVoiceCheck.detail.unauthorized');
          else if (res.status === 503) setMessage('opsVoiceCheck.detail.opsTokenNotConfigured');
          else setMessage('opsVoiceCheck.runFailed');
          return null;
        }
        return body;
      });
    }).then(function (report) {
      if (!report) return;
      setMessage(report.ok ? 'opsVoiceCheck.runOk' : 'opsVoiceCheck.runIssues');
      renderSummary(report.summary);
      renderChecks(report.checks);
      var probeEl = document.getElementById('ops-probe-result');
      if (probeEl && report.probe) {
        probeEl.textContent = report.probe.ok
          ? t('opsVoiceCheck.probeOk', { engine: report.probe.engine || '—', bytes: report.probe.bytes || 0 })
          : t('opsVoiceCheck.probeFail', { error: report.probe.error || '—' });
      }
    }).catch(function () {
      setMessage('opsVoiceCheck.runFailed');
    });
  }

  function init() {
    var tokenInput = document.getElementById('ops-token-input');
    if (tokenInput && storedToken()) tokenInput.value = storedToken();

    renderClient();

    var btnCheck = document.getElementById('ops-run-check');
    var btnProbe = document.getElementById('ops-run-probe');
    if (btnCheck) btnCheck.addEventListener('click', function () { fetchReport(false); });
    if (btnProbe) btnProbe.addEventListener('click', function () { fetchReport(true); });

    fetch('/api/ops/voice/status', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (status) {
        var pub = document.getElementById('ops-public-status');
        if (!pub || !status) return;
        pub.textContent = status.speakReady
          ? t('opsVoiceCheck.publicReady')
          : t('opsVoiceCheck.publicNotReady', { reason: status.reason || '—' });
      })
      .catch(function () { /* ignore */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
