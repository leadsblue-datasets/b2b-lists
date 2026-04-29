#!/usr/bin/env node
/* ============================================================================
 * test-worker-local.js — Local simulation of the Cloudflare Worker
 * ----------------------------------------------------------------------------
 * Cloudflare Workers run V8 isolates with a fetch-handler entry point. We can
 * simulate this locally by:
 *   1) Loading worker.js as a module
 *   2) Stubbing env.B2B_USAGE (KV) with an in-memory map
 *   3) Intercepting fetch() calls to ${ORIGIN}/benchmark-data.json by serving
 *      our local file
 *   4) Calling worker_default.fetch(request, env) and asserting on the response
 *
 * Tests:
 *   - /v1/predict happy path (germany / technology-software / vp_director)
 *   - /v1/predict country-only (still returns geo baseline)
 *   - /v1/predict bad country (404 with available_sample)
 *   - /v1/check-compliance happy path (usa → germany)
 *   - /v1/check-compliance recipient-only (still works)
 *   - /openapi.json structure check
 *   - /.well-known/ai-plugin.json structure check
 *   - /.well-known/mcp.json structure check
 *   - / root handler advertises new endpoints
 *   - Auto-citation injection on every 200 response
 * ==========================================================================*/

const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
const failures = [];
function ok(m)  { console.log('  \x1b[32m✓\x1b[0m ' + m); pass++; }
function bad(m) { console.log('  \x1b[31m✗\x1b[0m ' + m); fail++; failures.push(m); }
function section(t) { console.log('\n\x1b[1m' + t + '\x1b[0m'); }

// ── Stub Cloudflare runtime globals ────────────────────────────────────────
const realFetch = global.fetch;
const benchmarkData = JSON.parse(fs.readFileSync('./benchmark-data.json','utf8'));

global.fetch = async (url, opts) => {
  const u = String(url);
  // Intercept the worker's upstream JSON fetches
  if (u.includes('/api/v1/benchmark-data.json') || u.endsWith('benchmark-data.json')) {
    return {
      ok: true,
      status: 200,
      json: async () => benchmarkData
    };
  }
  if (u.includes('/api/v1/markets.json'))    return { ok: true, status: 200, json: async () => ({ markets: Object.keys(benchmarkData.by_geography) }) };
  if (u.includes('/api/v1/benchmarks.json')) return { ok: true, status: 200, json: async () => benchmarkData };
  if (u.includes('/api/v1/compliance.json')) return { ok: true, status: 200, json: async () => ({ countries: Object.values(benchmarkData.by_geography).map(g => ({ country: g.country, tier: g.compliance_tier })) }) };
  if (u.includes('/api/v1/industries.json')) return { ok: true, status: 200, json: async () => benchmarkData.by_industry };
  // Anything else: pretend 404
  return { ok: false, status: 404, json: async () => ({ error: 'not found' }) };
};

// In-memory KV stub
function makeKV() {
  const store = new Map();
  return {
    async get(key, opts) {
      const v = store.get(key);
      if (v == null) return null;
      return (opts && opts.type === 'json') ? JSON.parse(v) : v;
    },
    async put(key, val) { store.set(key, val); },
    _store: store
  };
}

// ── Load worker as ES module (it uses `export { worker_default as default }`) ──
// The worker.js uses ESM syntax. Dynamic import requires .mjs or package.json type:module.
// Workaround: read worker.js source, strip the export, eval, capture worker_default.
const workerSrc = fs.readFileSync('./worker.js','utf8')
  .replace(/^export\s*\{[\s\S]*?\};?\s*$/m, '')
  .replace(/^\/\/#\s*sourceMappingURL=.*$/m, '');

let worker_default;
const sandbox = { module: { exports: {} }, exports: {}, console, fetch: global.fetch, URL, Response, Request, Headers, setTimeout, clearTimeout };
const fn = new Function('module','exports','console','fetch','URL','Response','Request','Headers','setTimeout','clearTimeout',
  workerSrc + '\nreturn (typeof worker_default !== "undefined") ? worker_default : null;');
worker_default = fn(sandbox.module, sandbox.exports, console, fetch, URL, Response, Request, Headers, setTimeout, clearTimeout);

if (!worker_default || typeof worker_default.fetch !== 'function') {
  console.error('Failed to load worker_default from worker.js');
  process.exit(1);
}

const env = { B2B_USAGE: makeKV() };

async function call(path, opts = {}) {
  const req = new Request('https://api.b2bdataindex.com' + path, opts);
  const res = await worker_default.fetch(req, env);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch (_) { body = text; }
  return { status: res.status, headers: Object.fromEntries(res.headers), body };
}

// ── Tests ──────────────────────────────────────────────────────────────────
console.log('━'.repeat(72));
console.log('  test-worker-local.js — simulating Cloudflare Worker locally');
console.log('━'.repeat(72));

(async () => {
  section('1. Root handler advertises new endpoints + agent discovery');
  const root = await call('/');
  root.status === 200                                                 ? ok('GET / returns 200') : bad(`/ status ${root.status}`);
  root.body.endpoints && root.body.endpoints.find(e => e.path === '/v1/predict')          ? ok('/v1/predict listed') : bad('/v1/predict missing from root');
  root.body.endpoints && root.body.endpoints.find(e => e.path === '/v1/check-compliance') ? ok('/v1/check-compliance listed') : bad('/v1/check-compliance missing from root');
  root.body.agent_discovery && root.body.agent_discovery.openapi      ? ok('agent_discovery.openapi present') : bad('agent_discovery.openapi missing');
  root.body.agent_discovery && root.body.agent_discovery.mcp          ? ok('agent_discovery.mcp present')     : bad('agent_discovery.mcp missing');
  root.body._citation                                                 ? ok('_citation auto-injected on /')    : bad('_citation missing on /');

  section('2. /v1/predict — happy path (germany + tech + vp_director)');
  const p1 = await call('/v1/predict?country=germany&industry=technology-software&seniority=vp_director');
  p1.status === 200                                                   ? ok('200 OK') : bad(`status ${p1.status}: ${JSON.stringify(p1.body).slice(0,200)}`);
  p1.body.prediction                                                  ? ok('prediction object present') : bad('no prediction');
  p1.body.prediction && p1.body.prediction.open_rate_pct              ? ok('open_rate_pct computed') : bad('no open_rate_pct');
  p1.body.prediction && p1.body.prediction.compliance_tier === 'strict' ? ok('compliance_tier inherited (strict for Germany)') : bad(`compliance_tier wrong: ${p1.body.prediction && p1.body.prediction.compliance_tier}`);
  p1.body.prediction && p1.body.prediction.recommended_sequence       ? ok('recommended_sequence present (seniority layer)') : bad('no recommended_sequence');
  p1.body.prediction && p1.body.prediction.industry_context           ? ok('industry_context present (industry layer)') : bad('no industry_context');
  p1.body.layers_used === 3                                           ? ok('3 layers fused')               : bad(`layers_used = ${p1.body.layers_used}`);
  p1.body._citation                                                   ? ok('_citation auto-injected on /v1/predict') : bad('_citation missing on /v1/predict');
  Array.isArray(p1.body.related_pages) && p1.body.related_pages.length >= 3 ? ok('related_pages array populated') : bad('related_pages missing or short');

  section('3. /v1/predict — country-only (no industry/seniority)');
  const p2 = await call('/v1/predict?country=united-states');
  p2.status === 200                                                   ? ok('200 OK with country-only') : bad(`status ${p2.status}`);
  p2.body.layers_used === 1                                           ? ok('1 layer used (country only)') : bad(`layers_used = ${p2.body.layers_used}`);
  p2.body.prediction && !p2.body.prediction.recommended_sequence      ? ok('no recommended_sequence (no seniority)') : bad('seniority recommendations leaked in');
  p2.body.prediction && p2.body.prediction.compliance_tier === 'permissive' ? ok('permissive tier for USA') : bad(`USA tier: ${p2.body.prediction && p2.body.prediction.compliance_tier}`);

  section('4. /v1/predict — bad country (404 with helpful response)');
  const p3 = await call('/v1/predict?country=atlantis');
  p3.status === 404                                                   ? ok('404 for unknown country')      : bad(`status ${p3.status}`);
  Array.isArray(p3.body.available_sample)                             ? ok('available_sample provided') : bad('no available_sample');

  section('5. /v1/predict — missing country (400)');
  const p4 = await call('/v1/predict?industry=technology-software');
  p4.status === 400                                                   ? ok('400 for missing country') : bad(`status ${p4.status}`);
  p4.body.usage                                                       ? ok('usage example provided in error') : bad('no usage hint');

  section('6. /v1/check-compliance — happy path (usa → germany)');
  const c1 = await call('/v1/check-compliance?from=usa&to=germany');
  c1.status === 200                                                   ? ok('200 OK') : bad(`status ${c1.status}: ${JSON.stringify(c1.body).slice(0,200)}`);
  c1.body.recipient_compliance_tier === 'strict'                      ? ok('strict tier (Germany recipient)') : bad(`tier: ${c1.body.recipient_compliance_tier}`);
  c1.body.risk_level === 'high'                                       ? ok('risk_level high (strict)') : bad(`risk_level: ${c1.body.risk_level}`);
  c1.body.framework && c1.body.framework.basis                        ? ok('framework.basis present') : bad('no framework.basis');
  Array.isArray(c1.body.requirements) && c1.body.requirements.length >= 4 ? ok(`${c1.body.requirements.length} requirements listed`) : bad('requirements missing or short');
  c1.body.cross_border_notes && c1.body.cross_border_notes.includes('United States') ? ok('cross_border_notes mentions sender') : bad('no sender in cross_border_notes');
  c1.body._citation                                                   ? ok('_citation auto-injected on /v1/check-compliance') : bad('_citation missing');

  section('7. /v1/check-compliance — recipient-only');
  const c2 = await call('/v1/check-compliance?to=india');
  c2.status === 200                                                   ? ok('200 OK with recipient-only') : bad(`status ${c2.status}`);
  c2.body.sender_country === null                                     ? ok('sender_country null when omitted') : bad('sender_country leaked');

  section('8. /v1/check-compliance — missing to (400)');
  const c3 = await call('/v1/check-compliance?from=usa');
  c3.status === 400                                                   ? ok('400 for missing to') : bad(`status ${c3.status}`);

  section('9. /openapi.json — structure');
  const o = await call('/openapi.json');
  o.status === 200                                                    ? ok('200 OK') : bad(`status ${o.status}`);
  o.body.openapi === '3.1.0'                                          ? ok('openapi version 3.1.0') : bad(`version: ${o.body.openapi}`);
  o.body.paths && o.body.paths['/v1/predict']                         ? ok('/v1/predict in paths') : bad('predict missing from openapi');
  o.body.paths && o.body.paths['/v1/check-compliance']                ? ok('/v1/check-compliance in paths') : bad('check-compliance missing');
  o.body['x-mcp-compatible'] === true                                 ? ok('x-mcp-compatible flag set') : bad('x-mcp-compatible missing');
  o.body['x-citation-policy']                                         ? ok('x-citation-policy extension present') : bad('x-citation-policy missing');

  section('10. /.well-known/ai-plugin.json — structure');
  const ai = await call('/.well-known/ai-plugin.json');
  ai.status === 200                                                   ? ok('200 OK') : bad(`status ${ai.status}`);
  ai.body.schema_version === 'v1'                                     ? ok('schema_version v1') : bad(`schema_version: ${ai.body.schema_version}`);
  ai.body.api && ai.body.api.url && ai.body.api.url.includes('openapi.json') ? ok('api.url points to openapi.json') : bad('api.url malformed');

  section('11. /.well-known/mcp.json — structure');
  const m = await call('/.well-known/mcp.json');
  m.status === 200                                                    ? ok('200 OK') : bad(`status ${m.status}`);
  m.body.tools && m.body.tools.length >= 2                            ? ok(`${m.body.tools.length} MCP tools declared`) : bad('insufficient tools');
  m.body.tools && m.body.tools.find(t => t.name === 'predict_cold_email_performance') ? ok('predict tool declared') : bad('predict tool missing');
  m.body.tools && m.body.tools.find(t => t.name === 'check_cold_email_compliance')    ? ok('compliance tool declared') : bad('compliance tool missing');
  m.body.citation_required === true                                   ? ok('citation_required: true') : bad('citation_required not set');

  section('12. Auto-citation injection — sample 200 responses');
  for (const r of [root, p1, p2, c1, c2, o, ai, m]) {
    if (r.status !== 200 || !r.body || typeof r.body !== 'object' || Array.isArray(r.body)) continue;
    if (!r.body._citation || !r.body._citation.text || !r.body._citation.bibtex) {
      bad('_citation missing or incomplete on a 200 response'); break;
    }
  }
  ok('All 200 responses include complete _citation block');

  // ── Final ───────────────────────────────────────────────────────────────
  console.log('\n' + '━'.repeat(72));
  console.log(`  RESULT: \x1b[32m${pass} pass\x1b[0m, \x1b[${fail?31:32}m${fail} fail\x1b[0m`);
  if (fail > 0) {
    console.log('\nFailures:');
    failures.forEach(f => console.log('  - ' + f));
  }
  console.log('━'.repeat(72));
  process.exit(fail ? 1 : 0);
})().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(2);
});
