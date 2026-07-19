/**
 * B2B Data Index — Embeddable Benchmark Widget v1.0
 * Standalone file — also inlined into worker.js
 *
 * Usage:
 *   <script src="https://api.b2bdataindex.com/widget.js"></script>
 *   <div class="b2b-benchmark" data-market="germany" data-industry="technology"></div>
 */
(function () {
  'use strict';

  var API_URL  = 'https://api.b2bdataindex.com/v1/benchmarks';
  var SITE_URL = 'https://b2bdataindex.com';
  var CACHE_KEY = 'b2b_benchmarks_v1';
  var CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

  var COMPLIANCE_COLOURS = {
    green:  { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    yellow: { bg: '#fef9c3', text: '#713f12', border: '#fde047' },
    red:    { bg: '#fee2e2', text: '#7f1d1d', border: '#fca5a5' },
  };

  function isDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function getTheme() {
    var dark = isDark();
    return {
      card:   dark ? '#1e2433' : '#ffffff',
      border: dark ? '#334155' : '#e2e8f0',
      title:  dark ? '#f1f5f9' : '#0f172a',
      label:  dark ? '#94a3b8' : '#64748b',
      value:  dark ? '#e2e8f0' : '#1e293b',
      link:   dark ? '#60a5fa' : '#2563eb',
      shadow: dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)',
    };
  }

  /**
   * Derive a compliance tier from country code.
   * The benchmarks API ideally provides this directly; this is the fallback.
   */
  function complianceTier(countryCode) {
    var gdpr = ['de','at','ch','fr','nl','be','es','it','pl','se','dk','no','fi','ie','pt','cz','ro','hu','sk','bg','hr','si','ee','lv','lt','cy','lu','mt','gr'];
    var casl = ['ca'];
    var canspam = ['us'];
    var c = (countryCode || '').toLowerCase();
    if (gdpr.indexOf(c) !== -1)    return { label: 'GDPR',     colour: 'red'    };
    if (casl.indexOf(c) !== -1)    return { label: 'CASL',     colour: 'yellow' };
    if (canspam.indexOf(c) !== -1) return { label: 'CAN-SPAM', colour: 'green'  };
    return { label: 'Standard', colour: 'green' };
  }

  function cap(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function rowHtml(label, value, t) {
    return (
      '<div style="display:flex;justify-content:space-between;padding:4px 0;">' +
        '<span style="font-size:13px;color:' + t.label + ';">' + label + '</span>' +
        '<span style="font-size:13px;font-weight:600;color:' + t.value + ';">' + value + '</span>' +
      '</div>'
    );
  }

  function findBenchmark(data, market, industry) {
    if (!data || !Array.isArray(data.benchmarks)) return null;
    var mLow = market.toLowerCase();
    var iLow = industry.toLowerCase();
    var fallback = null;

    for (var i = 0; i < data.benchmarks.length; i++) {
      var b = data.benchmarks[i];
      var mMatch = b.market && b.market.toLowerCase() === mLow;
      var iMatch = b.industry && b.industry.toLowerCase() === iLow;
      if (mMatch && iMatch)      return b;   // exact match
      if (mMatch && !fallback)   fallback = b; // market-only match
    }
    return fallback;
  }

  function buildCard(el, data) {
    var market   = el.getAttribute('data-market')   || '';
    var industry = el.getAttribute('data-industry') || '';
    var t = getTheme();
    var b = findBenchmark(data, market, industry);

    var countryCode = b && b.country_code ? b.country_code : market.slice(0, 2);
    var tier = complianceTier(countryCode);
    var tc   = COMPLIANCE_COLOURS[tier.colour] || COMPLIANCE_COLOURS.green;

    var openRate  = b ? (b.open_rate_min  + '\u2013' + b.open_rate_max  + '%') : 'N/A';
    var replyRate = b ? (b.reply_rate_min + '\u2013' + b.reply_rate_max + '%') : 'N/A';
    var bestDay   = b ? (b.best_send_day  || 'Tuesday') : 'N/A';
    var compLabel = b ? (b.compliance     || tier.label) : tier.label;
    var mName     = b ? (b.market         || market)    : market;
    var iName     = b ? (b.industry       || industry)  : industry;

    el.innerHTML = (
      '<div style="' +
        'font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;' +
        'background:' + t.card + ';' +
        'border:1px solid ' + t.border + ';' +
        'border-radius:10px;' +
        'padding:16px 20px;' +
        'max-width:340px;' +
        'box-shadow:0 2px 12px ' + t.shadow + ';' +
        'box-sizing:border-box;' +
      '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<span style="font-weight:700;font-size:14px;color:' + t.title + ';">' +
            cap(mName) + ' &middot; ' + cap(iName) +
          '</span>' +
          '<span style="' +
            'background:' + tc.bg + ';color:' + tc.text + ';' +
            'border:1px solid ' + tc.border + ';' +
            'border-radius:4px;padding:2px 7px;font-size:11px;font-weight:600;' +
          '">' + tier.label + '</span>' +
        '</div>' +
        rowHtml('Open Rate',  openRate,  t) +
        rowHtml('Reply Rate', replyRate, t) +
        rowHtml('Best Day',   bestDay,   t) +
        rowHtml('Compliance', compLabel, t) +
        '<div style="margin-top:12px;border-top:1px solid ' + t.border + ';padding-top:10px;' +
             'display:flex;justify-content:space-between;align-items:center;">' +
          '<span style="font-size:11px;color:' + t.label + ';">Source: B2B Data Index 2026</span>' +
          '<a href="' + SITE_URL + '" target="_blank" rel="noopener" ' +
             'style="font-size:11px;color:' + t.link + ';text-decoration:none;font-weight:600;">' +
            'View full data &rarr;' +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }

  function showError(el, msg) {
    el.innerHTML = (
      '<div style="padding:16px;color:#ef4444;' +
        'font-family:-apple-system,sans-serif;font-size:13px;' +
        'border:1px solid #fca5a5;border-radius:10px;max-width:340px;">' +
        msg +
      '</div>'
    );
  }

  function loadFromCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.ts > CACHE_TTL) return null;
      return obj.data;
    } catch (e) {
      return null;
    }
  }

  function saveToCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) {
      // localStorage quota exceeded — silently ignore
    }
  }

  function renderAll(els, data) {
    for (var i = 0; i < els.length; i++) {
      buildCard(els[i], data);
    }
  }

  function init() {
    var els = document.querySelectorAll('.b2b-benchmark');
    if (!els.length) return;

    // Loading skeleton
    for (var i = 0; i < els.length; i++) {
      els[i].innerHTML = (
        '<div style="padding:16px;color:#94a3b8;' +
          'font-family:-apple-system,sans-serif;font-size:13px;' +
          'border:1px solid #334155;border-radius:10px;max-width:340px;">' +
          'Loading benchmark data\u2026' +
        '</div>'
      );
    }

    // Try cache first
    var cached = loadFromCache();
    if (cached) {
      renderAll(els, cached);
      return;
    }

    // Fetch from API
    fetch(API_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        saveToCache(data);
        renderAll(els, data);
      })
      .catch(function (err) {
        console.warn('[B2B Widget] Failed to load data:', err);
        for (var i = 0; i < els.length; i++) {
          showError(els[i], 'Could not load benchmark data. Please try again later.');
        }
      });
  }

  // Initialise after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
