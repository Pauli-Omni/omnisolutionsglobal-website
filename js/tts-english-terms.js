(function () {
  'use strict';

  var EN_SPEECH_TAG = 'en-US';
  var CONFIG_URL = '/assets/config/tts-english-terms.json';
  var EN_LOCALE_URL = '/api/i18n/en.json';

  var _terms = null;
  var _loadPromise = null;

  function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeTerm(raw) {
    return String(raw || '').replace(/\s+/g, ' ').trim();
  }

  function addTerm(set, raw) {
    var term = normalizeTerm(raw);
    if (!term) return;
    if (term.length < 2 && !/^(AI|ML|UI|UX|QR|CAM|CAD|iOS|5G)$/i.test(term)) return;

    set.add(term);
    var clean = term.replace(/[®™©]/g, '').replace(/\s+/g, ' ').trim();
    if (clean && clean !== term) set.add(clean);

    var noCountry = clean.replace(/\s+for\s+Tourists\s+in\s+Thailand$/i, '')
      .replace(/\s+Thailand$/i, '')
      .trim();
    if (noCountry && noCountry.length >= 3 && noCountry !== clean) set.add(noCountry);
  }

  function collectFromEnLocale(en, config) {
    var set = new Set();

    if (en.common && en.common.company) {
      addTerm(set, en.common.company);
      addTerm(set, en.common.company.replace(/\s*®.*$/, '').trim());
    }

    if (en.home) {
      addTerm(set, en.home.brandTitle);
    }

    if (en.portfolio) {
      Object.keys(en.portfolio).forEach(function (key) {
        var entry = en.portfolio[key];
        if (entry && entry.name) addTerm(set, entry.name);
      });
    }

    if (window.OSGAppRegistry && OSGAppRegistry.APPS) {
      OSGAppRegistry.APPS.forEach(function (app) {
        var section = en[app.pageKey];
        if (!section) return;
        addTerm(set, section.pageTitle);
        addTerm(set, section.descTitle);
        addTerm(set, section.subtitle);
      });
    }

    (config.techTerms || []).forEach(function (t) { addTerm(set, t); });
    (config.platformTerms || []).forEach(function (t) { addTerm(set, t); });

    return Array.from(set).sort(function (a, b) {
      return b.length - a.length;
    });
  }

  function isEnglishSpeechTag(tag) {
    var base = String(tag || '').toLowerCase().split('-')[0];
    return base === 'en';
  }

  function mergeAdjacentSegments(segments) {
    var out = [];
    segments.forEach(function (seg) {
      var text = normalizeTerm(seg.text);
      if (!text) return;
      var last = out[out.length - 1];
      if (last && last.lang === seg.lang) {
        last.text = normalizeTerm(last.text + ' ' + text);
      } else {
        out.push({ text: text, lang: seg.lang });
      }
    });
    return out;
  }

  function absorbTrailingPunctuation(text, ranges) {
    return ranges.map(function (r) {
      var end = r.end;
      while (end < text.length && /[!.,;:?)]/.test(text.charAt(end))) end++;
      return { start: r.start, end: end };
    });
  }

  function findEnglishRanges(text, terms) {
    var ranges = [];
    terms.forEach(function (term) {
      if (!term || term.length < 2) return;
      var re = new RegExp(escapeRegex(term), 'gi');
      var match;
      while ((match = re.exec(text)) !== null) {
        ranges.push({ start: match.index, end: match.index + match[0].length });
      }
    });
    if (!ranges.length) return [];

    ranges.sort(function (a, b) {
      return a.start - b.start || b.end - a.end;
    });

    var merged = [];
    ranges.forEach(function (r) {
      var last = merged[merged.length - 1];
      if (!last || r.start >= last.end) {
        merged.push({ start: r.start, end: r.end });
      } else {
        last.end = Math.max(last.end, r.end);
      }
    });
    return absorbTrailingPunctuation(text, merged);
  }

  function mergePunctuationOnlySegments(segments) {
    var out = [];
    segments.forEach(function (seg) {
      var text = normalizeTerm(seg.text);
      if (!text) return;
      if (/^[!.,;:?)\]]+$/.test(text) && out.length) {
        out[out.length - 1].text = normalizeTerm(out[out.length - 1].text + ' ' + text);
      } else {
        out.push({ text: text, lang: seg.lang });
      }
    });
    return out;
  }

  function segmentText(text, baseLangTag, terms) {
    var full = normalizeTerm(text);
    if (!full) return [];
    if (isEnglishSpeechTag(baseLangTag)) {
      return [{ text: full, lang: baseLangTag }];
    }

    var ranges = findEnglishRanges(full, terms);
    if (!ranges.length) {
      return [{ text: full, lang: baseLangTag }];
    }

    var segments = [];
    var pos = 0;
    ranges.forEach(function (r) {
      if (pos < r.start) {
        var gap = full.slice(pos, r.start);
        if (gap.trim()) segments.push({ text: gap, lang: baseLangTag });
      }
      segments.push({ text: full.slice(r.start, r.end), lang: EN_SPEECH_TAG });
      pos = r.end;
    });
    if (pos < full.length) {
      var tail = full.slice(pos);
      if (tail.trim()) segments.push({ text: tail, lang: baseLangTag });
    }

    return mergePunctuationOnlySegments(mergeAdjacentSegments(segments));
  }

  function ensureTerms() {
    if (_terms) return Promise.resolve(_terms);
    if (_loadPromise) return _loadPromise;

    _loadPromise = Promise.all([
      fetch(CONFIG_URL, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('tts-terms-config');
        return r.json();
      }),
      fetch(EN_LOCALE_URL, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('tts-terms-en-locale');
        return r.json();
      })
    ]).then(function (results) {
      _terms = collectFromEnLocale(results[1], results[0]);
      return _terms;
    }).catch(function () {
      _terms = [];
      return _terms;
    });

    return _loadPromise;
  }

  window.OSGTtsEnglishTerms = {
    EN_SPEECH_TAG: EN_SPEECH_TAG,
    ensureTerms: ensureTerms,
    segmentText: segmentText,
    prepareSegments: function (text, baseLangTag) {
      return ensureTerms().then(function (terms) {
        return segmentText(text, baseLangTag, terms);
      });
    },
    invalidateCache: function () {
      _terms = null;
      _loadPromise = null;
    }
  };
})();
