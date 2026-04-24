# B2B API — Deployment Instructions (Windows)
# ═══════════════════════════════════════════════

## PREREQUISITES
─────────────────
1. Node.js 18+ installed  →  https://nodejs.org
2. Cloudflare account with b2bdataindex.com zone added
3. A Cloudflare API token (or use `wrangler login`)

Open Command Prompt or PowerShell for all steps below.

────────────────────────────────────────────────────────────────────
STEP 1 — Copy the /b2b-api/ folder
────────────────────────────────────────────────────────────────────
Place the /b2b-api/ folder wherever you keep projects, e.g.:
  C:\projects\b2b-api\

Verify it contains:
  worker.js
  widget.js          (standalone reference copy)
  wrangler.toml
  package.json
  DEPLOY.md          (this file)

────────────────────────────────────────────────────────────────────
STEP 2 — Install Wrangler
────────────────────────────────────────────────────────────────────
cd C:\projects\b2b-api
npm install

────────────────────────────────────────────────────────────────────
STEP 3 — Authenticate with Cloudflare
────────────────────────────────────────────────────────────────────
npx wrangler login

A browser tab opens. Log in to your Cloudflare account.
You only need to do this once per machine.

────────────────────────────────────────────────────────────────────
STEP 4 — Create the KV namespace
────────────────────────────────────────────────────────────────────
npx wrangler kv:namespace create "B2B_USAGE"

OUTPUT EXAMPLE:
  ✅ Created namespace "B2B_USAGE"
  Add the following to your wrangler.toml:
  [[kv_namespaces]]
  binding = "B2B_USAGE"
  id = "abc123def456..."

COPY the `id` value, then open wrangler.toml and replace:
  id = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"
with the real ID from the output above.

(Optional) Create a preview namespace for local dev:
  npx wrangler kv:namespace create "B2B_USAGE" --preview
  → add the preview_id to wrangler.toml as shown in the comments

────────────────────────────────────────────────────────────────────
STEP 5 — Add the DNS route in Cloudflare Dashboard
────────────────────────────────────────────────────────────────────
The wrangler.toml already declares the route:
  api.b2bdataindex.com/*

Cloudflare will create this route automatically on first deploy IF
b2bdataindex.com is active in your Cloudflare account.

If you get a "zone not found" error:
  1. Go to Cloudflare Dashboard → b2bdataindex.com → Workers Routes
  2. Add route:  api.b2bdataindex.com/*  → Worker: b2b-api

Also ensure api.b2bdataindex.com has a DNS record:
  Type:    AAAA
  Name:    api
  Value:   100::    (Cloudflare Workers proxy placeholder)
  Proxy:   ON (orange cloud)

────────────────────────────────────────────────────────────────────
STEP 6 — Test locally (optional)
────────────────────────────────────────────────────────────────────
npx wrangler dev

Then open:  http://localhost:8787/
            http://localhost:8787/v1/benchmarks
            http://localhost:8787/docs
            http://localhost:8787/widget.js

Note: KV calls work against your real KV namespace in dev mode.

────────────────────────────────────────────────────────────────────
STEP 7 — Deploy to production
────────────────────────────────────────────────────────────────────
npx wrangler deploy

OUTPUT:
  Uploaded b2b-api (x.xx sec)
  Published b2b-api (x.xx sec)
    https://api.b2bdataindex.com/*

────────────────────────────────────────────────────────────────────
STEP 8 — Verify live endpoints
────────────────────────────────────────────────────────────────────
curl https://api.b2bdataindex.com/
curl https://api.b2bdataindex.com/v1/benchmarks
curl https://api.b2bdataindex.com/v1/markets
curl https://api.b2bdataindex.com/v1/intelligence/germany
curl https://api.b2bdataindex.com/v1/usage
curl https://api.b2bdataindex.com/docs
curl https://api.b2bdataindex.com/widget.js

All should return data with X-RateLimit-* headers.

────────────────────────────────────────────────────────────────────
USEFUL WRANGLER COMMANDS
────────────────────────────────────────────────────────────────────
View live logs:
  npx wrangler tail

List KV keys (replace ID):
  npx wrangler kv:key list --namespace-id=YOUR_KV_ID

Read a specific KV key (IP usage):
  npx wrangler kv:key get "ip:1.2.3.4" --namespace-id=YOUR_KV_ID

Read aggregate stats:
  npx wrangler kv:key get "agg:2026-01-25" --namespace-id=YOUR_KV_ID

────────────────────────────────────────────────────────────────────
EMBED THE WIDGET ON ANY WEBSITE
────────────────────────────────────────────────────────────────────
Paste this anywhere in the <body> of any HTML page:

  <script src="https://api.b2bdataindex.com/widget.js"></script>
  <div class="b2b-benchmark"
       data-market="germany"
       data-industry="technology">
  </div>

The widget auto-detects dark/light mode and caches data for 24 hours.

────────────────────────────────────────────────────────────────────
TROUBLESHOOTING
────────────────────────────────────────────────────────────────────
"Could not route to worker":
  → Check DNS record for api.b2bdataindex.com exists and is proxied

"KV namespace not found":
  → Ensure the id in wrangler.toml matches your created namespace

Upstream 404 from /v1/intelligence/:slug:
  → That slug does not have a JSON file at b2bdataindex.com/api/v1/intelligence/[slug].json

CORS errors in browser:
  → All responses already include Access-Control-Allow-Origin: *
  → Check browser console for the actual error message
