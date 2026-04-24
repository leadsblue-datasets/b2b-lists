/**
 * B2B Data Index — Cloudflare Worker API Gateway
 * Sits at api.b2bdataindex.com
 * Proxies static JSON, enforces rate limits, logs usage, serves widget + docs
 */

const ORIGIN = 'https://b2bdataindex.com/api/v1';
const FREE_LIMIT = 1000; // calls per month per IP

// ─── Route table ─────────────────────────────────────────────────────────────
const STATIC_ROUTES = {
  '/v1/markets':      'markets.json',
  '/v1/benchmarks':   'benchmarks.json',
  '/v1/compliance':   'compliance.json',
  '/v1/industries':   'industries.json',
  '/v1/schema':       'schema.json',
};

// ─── CORS headers ────────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

// ─── JSON response helper ─────────────────────────────────────────────────────
function jsonResponse(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders(), ...extra },
  });
}

// ─── Rate-limit key helpers ───────────────────────────────────────────────────
function getResetDate() {
  const now = new Date();
  const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return reset.toISOString().split('T')[0];
}

function usageKey(ip) {
  return `ip:${ip}`;
}

function aggregateKey() {
  const d = new Date();
  return `agg:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthKey() {
  const d = new Date();
  return `month:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Get caller IP ───────────────────────────────────────────────────────────
function getIP(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown'
  );
}

// ─── Rate limit check + increment ────────────────────────────────────────────
async function checkAndIncrementRateLimit(kv, ip, endpoint) {
  const key = usageKey(ip);
  const resetDate = getResetDate();
  const raw = await kv.get(key, { type: 'json' });

  let record = raw || { ip, call_count: 0, reset_date: resetDate, endpoints: {} };

  // Reset monthly counter if month rolled over
  if (record.reset_date !== resetDate) {
    record.call_count = 0;
    record.reset_date = resetDate;
    record.endpoints = {};
  }

  const remaining = FREE_LIMIT - record.call_count;
  if (remaining <= 0) {
    return { allowed: false, record, remaining: 0 };
  }

  // Increment
  record.call_count += 1;
  record.last_seen = new Date().toISOString();
  record.endpoints[endpoint] = (record.endpoints[endpoint] || 0) + 1;

  // Persist — TTL 35 days to survive full month
  await kv.put(key, JSON.stringify(record), { expirationTtl: 35 * 24 * 60 * 60 });

  // Aggregate stats
  await incrementAggregate(kv, endpoint);

  return { allowed: true, record, remaining: FREE_LIMIT - record.call_count };
}

async function incrementAggregate(kv, endpoint) {
  const dayKey = aggregateKey();
  const raw = await kv.get(dayKey, { type: 'json' });
  const agg = raw || { date: dayKey, total_calls: 0, endpoints: {} };
  agg.total_calls += 1;
  agg.endpoints[endpoint] = (agg.endpoints[endpoint] || 0) + 1;
  // TTL 90 days for aggregate data
  await kv.put(dayKey, JSON.stringify(agg), { expirationTtl: 90 * 24 * 60 * 60 });

  // Monthly total
  const mKey = monthKey();
  const mRaw = await kv.get(mKey, { type: 'json' });
  const month = mRaw || { month: mKey, total_calls: 0 };
  month.total_calls += 1;
  await kv.put(mKey, JSON.stringify(month), { expirationTtl: 35 * 24 * 60 * 60 });
}

// ─── Rate limit response headers ─────────────────────────────────────────────
function rateLimitHeaders(record, remaining) {
  return {
    'X-RateLimit-Limit':     String(FREE_LIMIT),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset':     record.reset_date,
  };
}

// ─── Proxy a static JSON file from the origin ─────────────────────────────────
async function proxyStatic(path, rlHeaders) {
  const url = `${ORIGIN}/${path}`;
  const upstream = await fetch(url, {
    cf: { cacheEverything: true, cacheTtl: 3600 },
  });

  if (!upstream.ok) {
    return jsonResponse(
      { error: 'Upstream not found', path },
      upstream.status,
      rlHeaders
    );
  }

  const data = await upstream.json();
  return jsonResponse(data, 200, rlHeaders);
}

// ─── /v1/usage — caller's own stats ─────────────────────────────────────────
async function handleUsage(kv, ip) {
  const raw = await kv.get(usageKey(ip), { type: 'json' });
  if (!raw) {
    return jsonResponse({
      ip,
      call_count: 0,
      remaining: FREE_LIMIT,
      reset_date: getResetDate(),
      endpoints: {},
    });
  }
  return jsonResponse({
    ip: raw.ip,
    call_count: raw.call_count,
    remaining: Math.max(0, FREE_LIMIT - raw.call_count),
    reset_date: raw.reset_date,
    last_seen: raw.last_seen,
    endpoints: raw.endpoints,
  });
}

// ─── /v1/stats — public aggregate stats ──────────────────────────────────────
async function handleStats(kv) {
  const dayKey = aggregateKey();
  const mKey = monthKey();
  const [dayRaw, monthRaw] = await Promise.all([
    kv.get(dayKey, { type: 'json' }),
    kv.get(mKey,   { type: 'json' }),
  ]);

  return jsonResponse({
    today: dayRaw
      ? { total_calls: dayRaw.total_calls, endpoints: dayRaw.endpoints }
      : { total_calls: 0, endpoints: {} },
    this_month: monthRaw
      ? { total_calls: monthRaw.total_calls }
      : { total_calls: 0 },
    generated_at: new Date().toISOString(),
  });
}

// ─── / — API root documentation JSON ─────────────────────────────────────────
function handleRoot() {
  return jsonResponse({
    name: 'B2B Data Index API',
    version: '1.0.0',
    base_url: 'https://api.b2bdataindex.com',
    documentation: 'https://api.b2bdataindex.com/docs',
    free_tier: {
      limit: '1,000 calls/month',
      auth: 'None required',
      rate_limit_headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    },
    endpoints: [
      { method: 'GET', path: '/v1/markets',             description: 'All B2B markets' },
      { method: 'GET', path: '/v1/benchmarks',          description: 'Email performance benchmarks by market + industry' },
      { method: 'GET', path: '/v1/compliance',          description: 'Data compliance rules by country' },
      { method: 'GET', path: '/v1/industries',          description: 'Industry taxonomy' },
      { method: 'GET', path: '/v1/intelligence/:slug',  description: 'Deep intelligence report for a market slug' },
      { method: 'GET', path: '/v1/schema',              description: 'Full JSON schema' },
      { method: 'GET', path: '/v1/usage',               description: 'Your API usage this month' },
      { method: 'GET', path: '/v1/stats',               description: 'Public aggregate usage stats' },
    ],
    widget: {
      embed: '<script src="https://api.b2bdataindex.com/widget.js"></script>',
      usage:  '<div class="b2b-benchmark" data-market="germany" data-industry="technology"></div>',
    },
    source: 'https://b2bdataindex.com',
  });
}

// ─── /docs — HTML documentation page ─────────────────────────────────────────
async function handleDocs(env) {
  const html = await env.__STATIC_CONTENT
    ? env.__STATIC_CONTENT.get('docs.html')
    : null;

  // Serve embedded docs HTML (defined at bottom)
  return new Response(DOCS_HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ─── /widget.js ───────────────────────────────────────────────────────────────
async function handleWidget() {
  return new Response(WIDGET_SOURCE, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ─── MAIN FETCH HANDLER ───────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    const method = request.method;

    // OPTIONS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Non-counted routes
    if (path === '/')           return handleRoot();
    if (path === '/docs')       return handleDocs(env);
    if (path === '/widget.js')  return handleWidget();

    // /v1/usage — show usage without counting the call itself
    if (path === '/v1/usage') {
      const ip = getIP(request);
      return handleUsage(env.B2B_USAGE, ip);
    }

    // /v1/stats — aggregate, no counting
    if (path === '/v1/stats') {
      return handleStats(env.B2B_USAGE);
    }

    // All /v1/* routes go through rate limiting
    if (!path.startsWith('/v1/')) {
      return jsonResponse({ error: 'Not found' }, 404);
    }

    const ip = getIP(request);
    const { allowed, record, remaining } = await checkAndIncrementRateLimit(
      env.B2B_USAGE, ip, path
    );

    const rlHeaders = rateLimitHeaders(record, remaining);

    if (!allowed) {
      return jsonResponse(
        {
          error: 'Rate limit exceeded',
          message: `Free tier allows ${FREE_LIMIT} calls/month. Resets on ${record.reset_date}.`,
          docs: 'https://api.b2bdataindex.com/docs',
        },
        429,
        rlHeaders
      );
    }

    // Static proxy routes
    if (STATIC_ROUTES[path]) {
      return proxyStatic(STATIC_ROUTES[path], rlHeaders);
    }

    // /v1/intelligence/:slug
    const intelMatch = path.match(/^\/v1\/intelligence\/([a-z0-9-]+)$/);
    if (intelMatch) {
      const slug = intelMatch[1];
      return proxyStatic(`intelligence/${slug}.json`, rlHeaders);
    }

    return jsonResponse({ error: 'Endpoint not found', docs: 'https://api.b2bdataindex.com/docs' }, 404, rlHeaders);
  },
};

// ─── WIDGET SOURCE (inlined so single worker.js file is self-contained) ───────
const WIDGET_SOURCE = `
/**
 * B2B Data Index — Embeddable Benchmark Widget v1.0
 * Usage: <script src="https://api.b2bdataindex.com/widget.js"><\/script>
 *        <div class="b2b-benchmark" data-market="germany" data-industry="technology"><\/div>
 */
(function () {
  'use strict';

  var API_URL  = 'https://api.b2bdataindex.com/v1/benchmarks';
  var SITE_URL = 'https://b2bdataindex.com';
  var CACHE_KEY = 'b2b_benchmarks_v1';
  var CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
      card:    dark ? '#1e2433' : '#ffffff',
      border:  dark ? '#334155' : '#e2e8f0',
      title:   dark ? '#f1f5f9' : '#0f172a',
      label:   dark ? '#94a3b8' : '#64748b',
      value:   dark ? '#e2e8f0' : '#1e293b',
      link:    dark ? '#60a5fa' : '#2563eb',
      shadow:  dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)',
    };
  }

  function complianceTier(country) {
    var gdpr  = ['de','at','ch','fr','nl','be','es','it','pl','se','dk','no','fi','ie','pt'];
    var casl  = ['ca'];
    var canspam = ['us'];
    var c = (country || '').toLowerCase();
    if (gdpr.indexOf(c) !== -1)    return { level: 'high',   label: 'GDPR', colour: 'red' };
    if (casl.indexOf(c) !== -1)    return { level: 'high',   label: 'CASL', colour: 'yellow' };
    if (canspam.indexOf(c) !== -1) return { level: 'medium', label: 'CAN-SPAM', colour: 'green' };
    return { level: 'medium', label: 'Standard', colour: 'green' };
  }

  function buildCard(el, benchmark) {
    var market   = el.getAttribute('data-market')   || '';
    var industry = el.getAttribute('data-industry') || '';
    var t = getTheme();

    // Find matching benchmark
    var b = null;
    if (benchmark && Array.isArray(benchmark.benchmarks)) {
      for (var i = 0; i < benchmark.benchmarks.length; i++) {
        var row = benchmark.benchmarks[i];
        var mMatch = row.market  && row.market.toLowerCase()   === market.toLowerCase();
        var iMatch = row.industry && row.industry.toLowerCase() === industry.toLowerCase();
        if (mMatch && iMatch) { b = row; break; }
        if (mMatch && !b)     { b = row; }
      }
    }

    var tier = complianceTier(b && b.country_code ? b.country_code : market.slice(0,2));
    var tc   = COMPLIANCE_COLOURS[tier.colour] || COMPLIANCE_COLOURS.green;

    var openRate   = b ? (b.open_rate_min   + '–' + b.open_rate_max   + '%') : 'N/A';
    var replyRate  = b ? (b.reply_rate_min  + '–' + b.reply_rate_max  + '%') : 'N/A';
    var bestDay    = b ? (b.best_send_day   || 'Tuesday') : 'N/A';
    var compLabel  = b ? (b.compliance      || tier.label) : tier.label;
    var marketName = b ? (b.market          || market) : market;
    var indName    = b ? (b.industry        || industry) : industry;

    el.innerHTML =
      '<div style="' +
        'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;' +
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
            cap(marketName) + ' &middot; ' + cap(indName) +
          '</span>' +
          '<span style="' +
            'background:' + tc.bg + ';' +
            'color:' + tc.text + ';' +
            'border:1px solid ' + tc.border + ';' +
            'border-radius:4px;' +
            'padding:2px 7px;' +
            'font-size:11px;font-weight:600;' +
          '">' + tier.label + '</span>' +
        '</div>' +
        row('Open Rate',   openRate,  t) +
        row('Reply Rate',  replyRate, t) +
        row('Best Day',    bestDay,   t) +
        row('Compliance',  compLabel, t) +
        '<div style="margin-top:12px;border-top:1px solid ' + t.border + ';padding-top:10px;display:flex;justify-content:space-between;align-items:center;">' +
          '<span style="font-size:11px;color:' + t.label + ';">Source: B2B Data Index 2026</span>' +
          '<a href="' + SITE_URL + '" target="_blank" rel="noopener" style="font-size:11px;color:' + t.link + ';text-decoration:none;font-weight:600;">View full data &rarr;</a>' +
        '</div>' +
      '</div>';
  }

  function row(label, value, t) {
    return '<div style="display:flex;justify-content:space-between;padding:4px 0;">' +
      '<span style="font-size:13px;color:' + t.label + ';">' + label + '</span>' +
      '<span style="font-size:13px;font-weight:600;color:' + t.value + ';">' + value + '</span>' +
    '</div>';
  }

  function cap(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function loadFromCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.ts > CACHE_TTL) return null;
      return obj.data;
    } catch (e) { return null; }
  }

  function saveToCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); }
    catch (e) { /* quota exceeded — skip */ }
  }

  function init() {
    var els = document.querySelectorAll('.b2b-benchmark');
    if (!els.length) return;

    // Show skeleton while loading
    for (var i = 0; i < els.length; i++) {
      els[i].innerHTML = '<div style="padding:16px;color:#94a3b8;font-family:sans-serif;font-size:13px;">Loading benchmark data...</div>';
    }

    var cached = loadFromCache();
    if (cached) {
      for (var j = 0; j < els.length; j++) buildCard(els[j], cached);
      return;
    }

    fetch(API_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        saveToCache(data);
        for (var k = 0; k < els.length; k++) buildCard(els[k], data);
      })
      .catch(function () {
        for (var l = 0; l < els.length; l++) {
          els[l].innerHTML = '<div style="padding:16px;color:#ef4444;font-family:sans-serif;font-size:13px;">Could not load benchmark data.</div>';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

// ─── DOCS HTML (inlined) ──────────────────────────────────────────────────────
const DOCS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>B2B Data Index API — Documentation</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0f172a;--surface:#1e2433;--border:#334155;
    --text:#e2e8f0;--muted:#94a3b8;--accent:#60a5fa;
    --green:#34d399;--yellow:#fbbf24;--red:#f87171;
    --code:#1e293b;--radius:8px;
  }
  body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;padding:0 16px}
  .wrap{max-width:860px;margin:0 auto;padding:48px 0}
  h1{font-size:28px;font-weight:800;margin-bottom:4px}
  h2{font-size:18px;font-weight:700;margin:40px 0 12px;color:#f1f5f9}
  h3{font-size:14px;font-weight:700;margin:20px 0 8px;color:var(--accent)}
  p{color:var(--muted);margin-bottom:12px;font-size:14px}
  .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:#1d4ed8;color:#bfdbfe;margin-right:6px}
  .badge.get{background:#064e3b;color:#6ee7b7}
  .endpoint{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:12px}
  .endpoint-path{font-family:monospace;font-size:14px;color:#f1f5f9;font-weight:600}
  .endpoint-desc{font-size:13px;color:var(--muted);margin-top:4px}
  pre{background:var(--code);border:1px solid var(--border);border-radius:var(--radius);padding:16px;overflow-x:auto;font-size:12px;line-height:1.7;margin:10px 0}
  code{font-family:'JetBrains Mono','Fira Code',monospace;color:#a5f3fc}
  .copy-wrap{position:relative}
  .copy-btn{position:absolute;top:10px;right:10px;background:#334155;border:none;color:var(--muted);font-size:11px;padding:4px 10px;border-radius:4px;cursor:pointer}
  .copy-btn:hover{background:#475569;color:var(--text)}
  .tag{display:inline-block;padding:1px 7px;border-radius:3px;font-size:11px;font-weight:600;margin-left:8px}
  .tag-free{background:#064e3b;color:#6ee7b7}
  .rl-table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}
  .rl-table th,.rl-table td{padding:8px 12px;border:1px solid var(--border);text-align:left}
  .rl-table th{background:var(--surface);color:var(--muted);font-weight:600}
  .widget-preview{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:340px;margin:12px 0}
  .widget-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
  .widget-label{color:var(--muted)}
  .widget-value{font-weight:600;color:#f1f5f9}
  .widget-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .widget-title{font-weight:700;font-size:14px}
  .compliance-badge{background:#fee2e2;color:#7f1d1d;border:1px solid #fca5a5;border-radius:4px;padding:2px 7px;font-size:11px;font-weight:600}
  .widget-footer{margin-top:12px;border-top:1px solid var(--border);padding-top:10px;display:flex;justify-content:space-between;font-size:11px}
  .widget-source{color:var(--muted)}
  .widget-link{color:var(--accent);text-decoration:none;font-weight:600}
  a{color:var(--accent)}
  .top-badge{display:flex;gap:8px;margin-bottom:24px}
  .stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;display:inline-block;margin-right:12px;margin-bottom:12px}
  .stat-num{font-size:24px;font-weight:800;color:#f1f5f9}
  .stat-label{font-size:12px;color:var(--muted);margin-top:2px}
</style>
</head>
<body>
<div class="wrap">

  <div class="top-badge">
    <span class="tag tag-free">Free Tier</span>
    <span style="font-size:12px;color:var(--muted);line-height:1.8">No API key required · 1,000 calls/month</span>
  </div>

  <h1>B2B Data Index API</h1>
  <p style="font-size:16px;color:var(--text);margin-bottom:8px">Structured B2B email intelligence — benchmarks, compliance, and market data for 40+ countries.</p>
  <p><strong>Base URL:</strong> <code>https://api.b2bdataindex.com</code> &nbsp;·&nbsp; <a href="https://b2bdataindex.com">b2bdataindex.com</a></p>

  <div style="margin:24px 0">
    <div class="stat"><div class="stat-num">40+</div><div class="stat-label">Markets</div></div>
    <div class="stat"><div class="stat-num">1K</div><div class="stat-label">Free calls/mo</div></div>
    <div class="stat"><div class="stat-num">0</div><div class="stat-label">Auth required</div></div>
  </div>

  <!-- ── ENDPOINTS ── -->
  <h2>Endpoints</h2>

  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/markets</span></div>
    <div class="endpoint-desc">All available B2B markets with country codes, regions, and metadata.</div>
  </div>
  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/benchmarks</span></div>
    <div class="endpoint-desc">Email performance benchmarks by market and industry — open rates, reply rates, best send days.</div>
  </div>
  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/compliance</span></div>
    <div class="endpoint-desc">B2B email compliance rules per country — GDPR, CASL, CAN-SPAM, and local regulations.</div>
  </div>
  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/industries</span></div>
    <div class="endpoint-desc">Industry taxonomy used across all benchmark and intelligence data.</div>
  </div>
  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/intelligence/:slug</span></div>
    <div class="endpoint-desc">Deep intelligence report for a specific market slug (e.g. <code>germany</code>, <code>united-states</code>).</div>
  </div>
  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/schema</span></div>
    <div class="endpoint-desc">Full JSON schema for all response objects.</div>
  </div>
  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/usage</span></div>
    <div class="endpoint-desc">Your usage stats for the current month. Not counted against your rate limit.</div>
  </div>
  <div class="endpoint">
    <div><span class="badge get">GET</span><span class="endpoint-path">/v1/stats</span></div>
    <div class="endpoint-desc">Public aggregate API usage stats — total calls today and this month.</div>
  </div>

  <!-- ── CURL EXAMPLES ── -->
  <h2>Example Requests</h2>

  <h3>Fetch all benchmarks</h3>
  <div class="copy-wrap">
    <pre><code>curl https://api.b2bdataindex.com/v1/benchmarks</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <h3>Fetch Germany market intelligence</h3>
  <div class="copy-wrap">
    <pre><code>curl https://api.b2bdataindex.com/v1/intelligence/germany</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <h3>Check your usage</h3>
  <div class="copy-wrap">
    <pre><code>curl https://api.b2bdataindex.com/v1/usage</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <h3>Example benchmark response</h3>
  <div class="copy-wrap">
    <pre><code>{
  "benchmarks": [
    {
      "market": "Germany",
      "country_code": "DE",
      "industry": "Technology",
      "open_rate_min": 12,
      "open_rate_max": 18,
      "reply_rate_min": 1.5,
      "reply_rate_max": 3.5,
      "best_send_day": "Tuesday",
      "compliance": "GDPR + UWG §7"
    }
  ],
  "generated": "2026-01-01T00:00:00Z"
}</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <!-- ── RATE LIMITS ── -->
  <h2>Rate Limits</h2>
  <p>All limits are per IP address and reset on the 1st of each month.</p>
  <table class="rl-table">
    <thead><tr><th>Tier</th><th>Limit</th><th>Auth</th><th>Reset</th></tr></thead>
    <tbody>
      <tr><td>Free</td><td>1,000 calls/month</td><td>None</td><td>Monthly</td></tr>
    </tbody>
  </table>

  <h3>Rate limit response headers</h3>
  <div class="copy-wrap">
    <pre><code>X-RateLimit-Limit:     1000
X-RateLimit-Remaining: 994
X-RateLimit-Reset:     2026-02-01</code></pre>
  </div>

  <h3>429 — Limit exceeded</h3>
  <div class="copy-wrap">
    <pre><code>{
  "error": "Rate limit exceeded",
  "message": "Free tier allows 1,000 calls/month. Resets on 2026-02-01.",
  "docs": "https://api.b2bdataindex.com/docs"
}</code></pre>
  </div>

  <!-- ── WIDGET ── -->
  <h2>Embeddable Widget</h2>
  <p>Drop a live benchmark card onto any website — no API key, no server-side code, caches for 24 hours.</p>

  <h3>1. Add the script</h3>
  <div class="copy-wrap">
    <pre><code>&lt;script src="https://api.b2bdataindex.com/widget.js"&gt;&lt;/script&gt;</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <h3>2. Place a div wherever you want the card</h3>
  <div class="copy-wrap">
    <pre><code>&lt;div class="b2b-benchmark"
     data-market="germany"
     data-industry="technology"&gt;
&lt;/div&gt;</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <h3>Preview</h3>
  <div class="widget-preview">
    <div class="widget-header">
      <span class="widget-title">Germany &middot; Technology Sector</span>
      <span class="compliance-badge">GDPR</span>
    </div>
    <div class="widget-row"><span class="widget-label">Open Rate</span><span class="widget-value">12–18%</span></div>
    <div class="widget-row"><span class="widget-label">Reply Rate</span><span class="widget-value">1.5–3.5%</span></div>
    <div class="widget-row"><span class="widget-label">Best Day</span><span class="widget-value">Tuesday</span></div>
    <div class="widget-row"><span class="widget-label">Compliance</span><span class="widget-value">GDPR + UWG §7</span></div>
    <div class="widget-footer">
      <span class="widget-source">Source: B2B Data Index 2026</span>
      <a href="https://b2bdataindex.com" class="widget-link">View full data &rarr;</a>
    </div>
  </div>

  <h3>Supported attributes</h3>
  <table class="rl-table">
    <thead><tr><th>Attribute</th><th>Required</th><th>Example</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>data-market</code></td><td>Yes</td><td>germany</td><td>Market slug (lowercase)</td></tr>
      <tr><td><code>data-industry</code></td><td>No</td><td>technology</td><td>Industry filter (lowercase)</td></tr>
    </tbody>
  </table>

  <!-- ── PROGRAMMATIC ── -->
  <h2>Programmatic Usage</h2>

  <h3>JavaScript / Fetch</h3>
  <div class="copy-wrap">
    <pre><code>const res  = await fetch('https://api.b2bdataindex.com/v1/benchmarks');
const data = await res.json();
console.log(data.benchmarks[0]);</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <h3>Python</h3>
  <div class="copy-wrap">
    <pre><code>import requests
data = requests.get('https://api.b2bdataindex.com/v1/benchmarks').json()
print(data['benchmarks'][0])</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <h3>LLM / AI tool integration</h3>
  <div class="copy-wrap">
    <pre><code># System prompt addition:
# "You have access to the B2B Data Index API at https://api.b2bdataindex.com.
#  Use GET /v1/benchmarks for email performance data,
#  GET /v1/compliance for legal requirements,
#  GET /v1/intelligence/:slug for country deep-dives."</code></pre>
    <button class="copy-btn" onclick="copy(this)">Copy</button>
  </div>

  <p style="margin-top:40px;font-size:13px;">
    &copy; 2026 <a href="https://b2bdataindex.com">B2B Data Index</a> &mdash;
    The canonical B2B intelligence reference for sales tools, LLMs, and search engines.
  </p>
</div>

<script>
function copy(btn) {
  var pre = btn.parentElement.querySelector('pre');
  navigator.clipboard.writeText(pre.textContent.trim()).then(function() {
    btn.textContent = 'Copied!';
    setTimeout(function(){ btn.textContent = 'Copy'; }, 1800);
  });
}
</script>
</body>
</html>`;
