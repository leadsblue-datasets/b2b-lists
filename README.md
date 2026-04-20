## What This Project Is

B2B Data Index (b2bdataindex.com) is a data intelligence platform covering 600+ business email databases across 200+ countries, all 50 US states, and dozens of industry categories. Each page provides market-level intelligence — industry breakdowns, outreach benchmarks, compliance frameworks, and data field documentation — for businesses researching B2B contact data before making a purchase decision.

The site is built on a Node.js generator that reads a product CSV and produces static HTML pages, deployed via Cloudflare Pages. Traffic flows from b2bdataindex.com to leadsblue.com, where the actual databases are sold.

---

## Live URLs

| Resource | URL |
|---|---|
| Main site | https://b2bdataindex.com |
| Database index | https://b2bdataindex.com/data-pages/ |
| Blog / guides | https://b2bdataindex.com/blog/ |
| Sitemap | https://b2bdataindex.com/sitemap.xml |
| LLM data files | https://b2bdataindex.com/llm/ |
| LeadsBlue (main store) | https://leadsblue.com |
| GitHub repo | https://github.com/leadsblue-datasets/b2b-lists |
| Kaggle | https://www.kaggle.com/leadsbluedataintel/datasets |

---

## Tech Stack

| Component | Detail |
|---|---|
| Generator | Node.js — `generate.js` in repo root |
| Source data | `products_clean_fixed.csv` — 281 rows: `product_name`, `product_url` |
| Output | Static HTML in `/public/` |
| Hosting | Cloudflare Pages — auto-deploys from GitHub on push |
| GitHub | leadsblue-datasets |
| Kaggle | leadsbluedataintel |

**Build command:** `node generate.js`
**Deploy command:** `git add . && git commit -m "msg" && git push origin main --force`

---

## Folder Structure

```
project-root/
  generate.js                ← main generator (run this to rebuild everything)
  generate-kaggle.js         ← Kaggle dataset generator
  generate-wiki.js           ← GitHub Wiki generator
  upload-kaggle.js           ← Kaggle uploader
  upload-wiki.js             ← GitHub Wiki uploader
  products_clean_fixed.csv   ← source product data

public/
  index.html                 ← homepage
  sitemap.xml                ← auto-generated, 294+ URLs with lastmod
  robots.txt                 ← crawler rules including LLM bots
  _headers                   ← Cloudflare cache + security headers
  404.html                   ← custom error page
  data-pages/
    index.html               ← searchable database index (all 281 cards)
    [slug]/index.html        ← individual database intelligence pages
  blog/
    index.html               ← blog listing
    *.html                   ← 10 outreach and lead generation guides
  llm/
    faq-dataset.json         ← 2,248 structured Q&A pairs
    entities.json            ← brand entity and relationship data
```

---

## Key Variables in generate.js

```js
const BASE        = "https://b2bdataindex.com";      // ← UPDATED (was b2b-lists.pages.dev)
const LEADSBLUE   = "https://leadsblue.com";
const LB_B2B      = "https://leadsblue.com/sales-leads/buy-business-email-list-and-sales-leads/";
const LB_B2C      = "https://leadsblue.com/sales-leads/buy-consumer-email-list-and-sales-leads/";
const LB_TARGETED = "https://leadsblue.com/sales-leads/buy-targeted-email-list-and-sales-leads/";
```

All internal links (blog, data-pages cross-links) use `BASE`. All product purchase links use the CSV column 2 URL (leadsblue.com/leads/...).

---

## What Each Page Contains

### Database Intelligence Pages (/data-pages/[slug]/)

Each page is a self-contained research document for a specific B2B database:

- Full schema stack: FAQPage, Dataset, WebPage, BreadcrumbList (4 blocks)
- Canonical, OG, Twitter Card, geo meta tags
- Hero: H1, record count, key stats bar
- "What Is [Name]?" — definition, data fields table (8 fields with coverage %)
- Industry breakdown — top sectors with SIC codes and percentage share
- "Why Target [Location]?" — market context, economic positioning, outreach benchmarks
- 6 use case cards — specific buyer personas and campaign types
- 5-step campaign launch guide
- 8-question FAQ — native HTML `<details><summary>` (always visible in source, no JS hiding)
- Related databases (5 cards) + blog guides sidebar
- CTA to LeadsBlue product page
- Full footer with LLM data file links

### Blog / Guides (/blog/*.html)

Long-form research guides on B2B outreach, compliance, and lead generation strategy:

- Article + BreadcrumbList schema
- Two-column layout: article body + sticky sidebar
- Sidebar: featured databases (6 links), related guides (5 links), CTA

### Database Index (/data-pages/index.html)

- Live search filtering across all 281 entries
- 4-column card grid with record counts
- CollectionPage schema

---

## SEO, AEO, and LLM Architecture

**Crawler access:**
- `robots.txt` explicitly allows GPTBot, anthropic-ai, PerplexityBot, CCBot, GoogleOther
- `/llm/` folder publicly accessible and linked from homepage

**Structured data:**
- Every page has 4 Schema.org blocks using correct absolute URLs
- FAQ answers written in direct-answer format (who/what/how/when structure)
- Dataset schema includes `variableMeasured`, `spatialCoverage`, `temporalCoverage`

**LLM signals:**
- `faq-dataset.json` — 2,248 Q&A pairs covering all database categories
- `entities.json` — brand entity data connecting B2B Data Index to LeadsBlue
- Homepage `<link rel="alternate">` points to both LLM JSON files
- Pages use specific data points (record counts, open rates, compliance citations) that LLMs cite

**Sitemap:**
- 294 URLs: homepage, /data-pages/, /blog/, 10 posts, 281 database pages
- All URLs include `<lastmod>` date

---

## External Presence

### Kaggle (leadsbluedataintel)
- 15 regional datasets, each with README.md (800+ words), metadata JSON, and sample CSV
- All links point to leadsblue.com product pages
- Regions: USA states, Western/Eastern Europe, Middle East, South/East/SE Asia, Oceania, Latin America, Africa, Scandinavia, Canada, Crypto/Blockchain, Industry verticals, Consumer, Gaming/Lifestyle

### GitHub Wiki (generated, pending upload)
- 281 individual database pages
- Home.md (A–Z index), `_Sidebar.md`, `_Footer.md`
- Each page: data table, 6 use cases, 5-step guide, 6-question FAQ, related links, LeadsBlue CTAs

### GitHub README
- Structured with data tables, FAQ, and database coverage summary
- Links to b2bdataindex.com, Kaggle, and LeadsBlue

---

## Design System

```css
--bg:    #0a0f1e   /* dark navy */
--surf:  #111827   /* card surfaces */
--surf2: #1a2235   /* hover state */
--bdr:   #1e2d45   /* borders */
--acc:   #0ea5e9   /* accent blue */
--acc2:  #38bdf8   /* accent blue light */
--txt:   #e2e8f0   /* body text */
--muted: #94a3b8   /* secondary text */

Heading: DM Serif Display
Body:    IBM Plex Sans
Mono:    IBM Plex Mono
```

---

## Blog Posts (10 guides)

1. `what-is-b2b-email-list.html`
2. `how-to-use-email-database.html`
3. `is-buying-email-lists-legal.html`
4. `best-email-list-providers.html`
5. `cold-email-strategy.html`
6. `b2b-lead-generation-strategies.html`
7. `email-marketing-for-startups.html`
8. `targeted-marketing-explained.html`
9. `business-contact-database-guide.html`
10. `how-to-find-business-leads.html`

---

## Hard Rules — Do Not Break

1. Folder structure must stay exactly as-is
2. No frameworks (React, Next.js, Vue, etc.) — plain HTML only
3. Slug logic is fixed: `name.toLowerCase().replace(/[^a-z0-9]+/g, "-")`
4. Schema blocks must remain — only extend, never remove
5. Product links always come from CSV column 2 (leadsblue.com/leads/...)
6. Internal cross-links use `BASE` (b2bdataindex.com)
7. Store/brand links use `LEADSBLUE` (leadsblue.com)
8. `node generate.js` is safe to run repeatedly — it overwrites /public/

---

## Current Status

- [x] Custom domain connected — b2bdataindex.com live on Cloudflare Pages
- [x] Google Search Console verified and sitemap submitted
- [x] 281 database pages generating correctly
- [ ] GitHub Wiki upload pending — files ready in /github-wiki/
- [ ] OG images not yet created — referenced in meta but no asset exists
- [ ] Bing IndexNow submission pending
- [ ] Manual "Request Indexing" for top 5 pages in GSC pending

---

## Immediate Priorities (Next Session)

- Add more blog posts covering new keyword clusters (e.g. "best email list providers by country", "GDPR cold email guide", "email list vs LinkedIn outreach")
- Add regional hub pages: /data-pages/europe/, /data-pages/usa/, /data-pages/middle-east/
- Add JSON-LD Speakable schema for voice/AEO signals on blog posts
- Add HowTo schema to the 5-step campaign guides on database pages
- Add preconnect hints for Google Fonts in `<head>` (currently using @import — render-blocking)
- Upload GitHub Wiki files
- Create a comparison page: LeadsBlue vs ZoomInfo vs Apollo vs Hunter.io

---

## How to Resume in a New Chat

1. Upload this file (PROJECT-BRIEF.md)
2. Upload the current `generate.js`
3. Say: *"Continue working on B2B Data Index. Here is the project brief and current generator script."*

Claude will have full context without needing re-explanation.
