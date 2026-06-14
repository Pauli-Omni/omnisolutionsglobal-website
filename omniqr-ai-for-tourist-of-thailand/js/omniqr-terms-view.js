(function () {
  'use strict';

  var PDF_PATH = '/omniqr-ai-for-tourist-of-thailand/legal/AGB_OmniQR_AI_Th_2026.pdf';
  var PDF_FILENAME = 'AGB_OmniQR_AI_Th_2026.pdf';

  var DOWNLOAD_ICON =
    '<svg class="omniqr-pdf-btn__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';

  function t(key, opts) {
    try {
      if (window.i18next && typeof i18next.t === 'function') {
        return i18next.t(key, opts || {});
      }
    } catch (e) { /* ignore */ }
    return key;
  }

  function sectionsHtml(headingTag) {
    var tag = headingTag || 'h2';
    return (
      '<section class="omniqr-terms-section">' +
        '<' + tag + ' data-i18n="omniqr.terms.s1Title"></' + tag + '>' +
        '<p data-i18n="omniqr.terms.s1Text"></p>' +
      '</section>' +
      '<section class="omniqr-terms-section">' +
        '<' + tag + ' data-i18n="omniqr.terms.s2Title"></' + tag + '>' +
        '<p data-i18n="omniqr.terms.s2Text"></p>' +
      '</section>' +
      '<section class="omniqr-terms-section">' +
        '<' + tag + ' data-i18n="omniqr.terms.s3Title"></' + tag + '>' +
        '<p data-i18n="omniqr.terms.s3P1"></p>' +
        '<p data-i18n="omniqr.terms.s3P2"></p>' +
      '</section>' +
      '<section class="omniqr-terms-section">' +
        '<' + tag + ' data-i18n="omniqr.terms.s4Title"></' + tag + '>' +
        '<p data-i18n="omniqr.terms.s4Text"></p>' +
      '</section>'
    );
  }

  function stickyActionsHtml() {
    return (
      '<div class="omniqr-agb-sticky-actions" id="omniqr-agb-sticky-actions" data-i18n-aria="omniqr.terms.actionBarAria">' +
        '<div id="omniqr-agb-voice-slot" class="omniqr-agb-voice-slot"></div>' +
        '<button type="button" class="omniqr-pdf-btn omniqr-pdf-btn--sticky" id="omniqr-agb-pdf-btn" ' +
        'data-i18n-aria="omniqr.terms.pdfDownloadAria">' +
        DOWNLOAD_ICON + '<span class="omniqr-pdf-btn__label" data-i18n="omniqr.terms.pdfDownload"></span>' +
        '</button>' +
      '</div>'
    );
  }

  function footerActionsHtml(options) {
    var opts = options || {};
    var parts = '<div class="omniqr-terms-actions">';

    if (!opts.stickyPdf) {
      parts +=
        '<button type="button" class="omniqr-pdf-btn" id="omniqr-agb-pdf-btn" ' +
        'data-i18n-aria="omniqr.terms.pdfDownloadAria">' +
        DOWNLOAD_ICON + '<span class="omniqr-pdf-btn__label" data-i18n="omniqr.terms.pdfDownload"></span>' +
        '</button>';
    }

    parts += '<p class="omniqr-terms-pdf-hint chrome-silver-text" data-i18n="omniqr.terms.pdfHint"></p>';

    if (opts.showBack) {
      parts +=
        '<a href="index.html" class="btn btn-outline-neon omniqr-terms-back" ' +
        'data-i18n="common.backHomeHub"></a>';
    }

    if (opts.showFullPageLink) {
      parts +=
        '<a href="agb.html" class="btn btn-outline-neon omniqr-terms-fullpage" ' +
        'data-i18n="omniqr.terms.readFullPage" data-i18n-aria="omniqr.terms.readFullPageAria"></a>';
    }

    parts += '</div>';
    return parts;
  }

  function triggerPdfDownload(btn) {
    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-busy');
    }

    fetch(PDF_PATH, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('pdf_fetch_failed');
        return res.blob();
      })
      .then(function (blob) {
        var objectUrl = URL.createObjectURL(blob);
        var anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = PDF_FILENAME;
        anchor.rel = 'noopener';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 4000);
      })
      .catch(function () {
        window.alert(t('omniqr.terms.pdfError'));
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('is-busy');
        }
      });
  }

  function bindPdfDownload(root) {
    var scope = root || document;
    var btn = scope.querySelector('#omniqr-agb-pdf-btn');
    if (!btn || btn.__omniqrPdfBound) return;
    btn.__omniqrPdfBound = true;
    btn.addEventListener('click', function () {
      triggerPdfDownload(btn);
    });
  }

  function mountStickyActions() {
    if (!document.body.classList.contains('omniqr-page--agb')) return;
    if (document.getElementById('omniqr-agb-sticky-actions')) return;
    document.body.insertAdjacentHTML('beforeend', stickyActionsHtml());
    if (window.OSGI18n) OSGI18n.applyToDom();
    bindPdfDownload(document);
    if (window.OmniQrTermsVoice) OmniQrTermsVoice.mount();
  }

  function mountTermsPage() {
    var body = document.getElementById('omniqr-terms-page-body') || document.querySelector('.omniqr-terms-body');
    var actionsHost = document.getElementById('omniqr-terms-actions');
    var isAgbPage = document.body.getAttribute('data-app-view') === 'agb';

    if (body && !body.__omniqrMounted) {
      body.innerHTML = sectionsHtml('h2');
      body.__omniqrMounted = true;
    }
    if (actionsHost && !actionsHost.__omniqrMounted) {
      actionsHost.innerHTML = footerActionsHtml({ showBack: true, stickyPdf: isAgbPage });
      actionsHost.__omniqrMounted = true;
    }
    if (isAgbPage) mountStickyActions();
    if (window.OSGI18n) OSGI18n.applyToDom();
    bindPdfDownload(document);
  }

  window.OmniQrTermsView = {
    PDF_PATH: PDF_PATH,
    PDF_FILENAME: PDF_FILENAME,
    sectionsHtml: sectionsHtml,
    footerActionsHtml: footerActionsHtml,
    bindPdfDownload: bindPdfDownload,
    stickyActionsHtml: stickyActionsHtml,
    mountStickyActions: mountStickyActions,
    mountTermsPage: mountTermsPage,
    triggerPdfDownload: triggerPdfDownload
  };
})();
