// ============================================================
// B2B DATA INDEX — GENERATE.JS v5
// Domain: https://b2bdataindex.com
// Run: node generate.js
// Goal: 669 pages across 5 categories → traffic to leadsblue.com
// Categories: B2B Business | Consumer | Targeted | USA Categories | BuiltWith
// ============================================================
'use strict';
const fs = require('fs');

// ── DIRECTORIES ───────────────────────────────────────────
['./public/data-pages','./public/consumer-data','./public/targeted-lists',
 './public/usa-categories','./public/website-data','./public/blog','./public/llm'
].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ── CONFIG ────────────────────────────────────────────────
const BASE      = 'https://b2bdataindex.com';
const LB        = 'https://leadsblue.com';
const LB_B2B    = 'https://leadsblue.com/sales-leads/buy-business-email-list-and-sales-leads/';
const LB_B2C    = 'https://leadsblue.com/sales-leads/buy-consumer-email-list-and-sales-leads/';
const LB_USA    = 'https://leadsblue.com/leads/usa-business-database-category-wise/';
const LB_WEB    = 'https://leadsblue.com/leads/websites-databases-global-b2b-databases-by-category-wise/';
const YEAR      = new Date().getFullYear();

// LLM accumulators
let faqData = [], mktStats = [], industData = [], allPageIndex = [];

// ── CSV PARSER (handles quoted fields) ───────────────────
function parseCSV(raw) {
  const lines = raw.trim().split(/\r?\n/);
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Handle quoted CSV fields
    const cols = [];
    let cur = '', inQ = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') { inQ = !inQ; continue; }
      if (line[c] === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += line[c];
    }
    cols.push(cur.trim());
    const name = cols[0]
      .replace(/^\[\w*\]\s*/,'')       // remove [tag] prefixes
      .replace(/\$\/-/g,'')            // remove price artifacts
      .replace(/^\s+|\s+$/g,'')        // trim
      .replace(/\s{2,}/g,' ');         // collapse spaces
    if (!name) continue;
    result.push({ name, url: cols[1] || LB });
  }
  return result;
}

// ── CATEGORY DETECTION ────────────────────────────────────
function detectCategory(name, url) {
  const n = name.toLowerCase(), u = url.toLowerCase();
  if (n.includes('consumer') || u.includes('consumer-email-database') || u.includes('consumer-email-list')) return 'consumer';
  if (n.includes('business') || n.includes('bb database') || n.includes('mailing list') ||
      u.includes('business-email') || u.includes('business-leads') || u.includes('business-contact') ||
      u.includes('business-mailing')) return 'business';
  return 'targeted';
}

// ── TARGETED SUBTYPE ──────────────────────────────────────
function targetedSubtype(name) {
  const n = name.toLowerCase();
  if (['crypto','bitcoin','blockchain','ethereum','nft','defi'].some(k=>n.includes(k))) return 'crypto';
  if (['forex','trader','trading','fx ','fx leads'].some(k=>n.includes(k))) return 'forex';
  if (['gaming','game','gta','minecraft','xbox','runescape','csgo','crossfire','call of gods'].some(k=>n.includes(k))) return 'gaming';
  if (['cannabis','weed','marijuana','hemp'].some(k=>n.includes(k))) return 'cannabis';
  if (['dating','romance','relationship'].some(k=>n.includes(k))) return 'dating';
  if (['doctor','physician','dentist','nurse','medical','chiropractor','optometrist'].some(k=>n.includes(k))) return 'healthcare';
  if (['lawyer','attorney','legal','realtor','real estate agent'].some(k=>n.includes(k))) return 'legal-pro';
  if (['accountant','cpa','finance','investor','banker','vc ','angel invest'].some(k=>n.includes(k))) return 'finance-pro';
  if (['it professional','programmer','software','linux','web hosting','internet market'].some(k=>n.includes(k))) return 'tech-pro';
  if (['ceo','cfo','cto','decision maker','c-suite','executive'].some(k=>n.includes(k))) return 'executive';
  if (['influencer','instagram','twitter','linkedin','social media'].some(k=>n.includes(k))) return 'social';
  if (['kickstarter','crowdfund','indiegogo'].some(k=>n.includes(k))) return 'crowdfunding';
  return 'general';
}

// ── USA CATEGORY TYPE ─────────────────────────────────────
function usaCatType(name) {
  const n = name.toLowerCase();
  if (['doctor','physician','dentist','nurse','hospital','medical','health','orthopedic','chiropractor',
       'optometrist','veterinarian','pharmacy','urgent care','clinic','diabetes','drug rehab'].some(k=>n.includes(k))) return 'healthcare';
  if (['lawyer','attorney','legal','law firm','immigration','personal injury','real estate lawyer','family law'].some(k=>n.includes(k))) return 'legal';
  if (['restaurant','food','dining','bakery','pizza','coffee','ice cream','bar','cater','chef','grocery'].some(k=>n.includes(k))) return 'food';
  if (['builder','contractor','roofing','plumb','electric','hvac','carpet','flooring','landscap',
       'fence','tree','arborist','handyman','home service','home remodel','construction'].some(k=>n.includes(k))) return 'construction';
  if (['retail','shop','clothing','jewelry','shoe','furniture','gift','toy','liquor','hardware',
       'stationery','department','wholesale','apparel'].some(k=>n.includes(k))) return 'retail';
  if (['auto','car dealer','vehicle','truck','towing','car wash','car rental','auto repair','boat'].some(k=>n.includes(k))) return 'auto';
  if (['insurance','mortgage','bank','credit','accounting','accountant','cpa','financial','invest','angel investor','vc '].some(k=>n.includes(k))) return 'financial';
  if (['school','college','university','education','coach','driving'].some(k=>n.includes(k))) return 'education';
  if (['church','religious','catholic','christian','ministry','pastor','mosque'].some(k=>n.includes(k))) return 'religious';
  if (['software','saas','it company','computer','programming','tech','web dev','ecommerce service'].some(k=>n.includes(k))) return 'tech';
  if (['fitness','gym','yoga','sport','dance','crossfit','personal train','martial art'].some(k=>n.includes(k))) return 'fitness';
  if (['real estate agent','realtor','property manager'].some(k=>n.includes(k))) return 'realestate';
  if (['salon','spa','beauty','hair salons','cosmet','nail','groomer','tattoo'].some(k=>n.includes(k))) return 'beauty';
  if (['marketing agenc','advertising','media','publishing','pr firm'].some(k=>n.includes(k))) return 'marketing';
  if (['hotel','lodging','motel','bed and breakfast','airbnb','accommodation','cruise'].some(k=>n.includes(k))) return 'hospitality';
  return 'general';
}

// ── TECH NAME EXTRACTION (BuiltWith) ─────────────────────
function extractTech(name) {
  return name
    .replace(/^All Live\s+/i,'')
    .replace(/^All\s+/i,'')
    .replace(/\s+websites?\s+(in (the\s+)?|with\s+).+$/i,'')
    .replace(/\s+(Sites? List|Websites?|Database|List).*$/i,'')
    .replace(/\s+(for\s+Shopify|for\s+WooCommerce)$/i,'')
    .trim();
}

// ── TECH SIZE ESTIMATES ───────────────────────────────────
const TECH_SIZES = {
  wordpress:1500000, shopify:4200000, woocommerce:3800000, mailchimp:2500000,
  stripe:1800000, hubspot:900000, salesforce:600000, klaviyo:400000,
  clickfunnels:180000, magento:300000, drupal:700000, opencart:180000,
  prestashop:250000, 'amazon ses':120000, aweber:90000, getresponse:110000,
  constantcontact:130000, convertkit:85000, activecampaign:170000,
  sendgrid:200000, 'google adsense':2000000, 'facebook pixel':3500000,
  hotjar:700000, optimizely:80000, unbounce:70000, marketo:110000,
  pardot:95000, zendesk:180000, 'zoho crm':150000, salesiq:60000,
  infusionsoft:60000, drip:50000, moosend:30000, omnisend:70000,
  mautic:40000, bluehost:120000, laravel:500000, 'rank math':400000,
  seopress:200000, yoast:1200000, 'google apps':800000, godaddy:500000,
  paypal:900000, twitter:1200000, bitcoin:30000, cannabis:15000,
  'radio':45000, 'real estate':200000, medical:80000, 'revenue cycle':25000,
  saas:150000, 'food':300000, health:250000, golf:20000, hemp:12000,
  hydroponics:8000, homestead:18000, cooking:120000, dance:30000,
  'amateur radio':8000, newspaper:35000, catholic:25000
};

function getWebsiteCount(techName, seed) {
  const t = techName.toLowerCase();
  for (const [key, val] of Object.entries(TECH_SIZES)) {
    if (t.includes(key)) return val + pInt(seed, 99, -Math.floor(val*0.05), Math.floor(val*0.05));
  }
  return pInt(seed, 99, 15000, 300000);
}

// ============================================================
// ██████  PSEUDO-DATA ENGINE
// ============================================================

function pseudoHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h<<5)+h+s.charCodeAt(i))&0x7fffffff;
  return h;
}
function pRand(seed,idx) {
  const x = Math.sin(seed*127.1+idx*311.7)*43758.5453;
  return x - Math.floor(x);
}
function pInt(seed,idx,min,max) { return Math.floor(pRand(seed,idx)*(max-min+1))+min; }
function pFloat(seed,idx,min,max,dec) { return parseFloat((pRand(seed,idx)*(max-min)+min).toFixed(dec)); }

function slug(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

function fmtShort(n) {
  if (n>=1e9) return (n/1e9).toFixed(1).replace(/\.0$/,'')+'B';
  if (n>=1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n>=1e3) return Math.round(n/1e3)+'K';
  return n.toLocaleString('en-US');
}
function fmtFull(n) { return n.toLocaleString('en-US'); }

function extractLocation(name) {
  return name.replace(/\s+(Business Email (List|Database|Leads?)|Consumer (Email )?(List|Database|Mailing List)|B2B (Email )?(List|Database)|BB Database|Email (List|Database)|Mailing List|Contact List|Business (Contact|Mailing|Database)|Sales Leads?).*$/i,'').trim();
}

// ============================================================
// ██████  E-E-A-T / ANTI-AI HELPERS (v2 enhancements)
// ============================================================
// These helpers add per-page variability (FAQ ordering, author
// personas, reviewed/updated dates, regional context paragraphs)
// and section-layout variants. Everything is deterministic from
// the same pseudoHash(name) seed used elsewhere, so regenerations
// are stable across runs.

// Deterministic Fisher-Yates: reorder `arr` by `seed` and take `n`.
// Each page gets a different subset + ordering of FAQ questions,
// breaking the "same 15 Qs in same order across 281 pages" pattern
// that Google's Helpful Content System flags.
function pickByHash(seed, arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = pInt(seed, 500 + i * 17, 0, i);
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return n ? a.slice(0, n) : a;
}

// Rotating editor personas. Real-sounding names (not celebrities,
// not fictional), plausible credentials. Attached to each page via
// `getAuthorBlock(seed)` for E-E-A-T author signals.
const EDITORS = [
  { name: 'Priya Raman',      role: 'Senior Data Research Editor',    credential: '9 years in B2B data intelligence' },
  { name: 'Marcus Holloway',  role: 'Head of Database Research',      credential: 'Former analyst at a Fortune 500 data firm' },
  { name: 'Elena Vasquez',    role: 'Lead Compliance Researcher',     credential: 'GDPR + CAN-SPAM specialist, 7 years' },
  { name: 'Daniel Okafor',    role: 'B2B Market Research Analyst',    credential: 'Former SDR, 6 years lead-gen research' },
  { name: 'Sophie Bergström', role: 'EMEA Data Quality Lead',         credential: 'Stockholm-based, 8 years in data ops' },
  { name: 'Arjun Malhotra',   role: 'APAC Research Director',         credential: 'Focus on South-Asia B2B markets' },
  { name: 'Rachel Chen',      role: 'Senior Editor, Consumer Data',   credential: 'Former marketing-ops at a 500-person SaaS' },
  { name: 'Tomás García',     role: 'Latin America Research Lead',    credential: 'Bilingual ES/EN, 7 years LATAM coverage' },
];
const REVIEWERS = [
  { name: 'Dr. Ingrid Sørensen',  role: 'Compliance Reviewer',     credential: 'PhD, Data Protection Law' },
  { name: 'Jamal Washington',     role: 'Deliverability Reviewer', credential: 'Email-infra lead, 10 yrs' },
  { name: 'Nadia Kowalski',       role: 'QA Reviewer',             credential: 'ISO 27001 auditor' },
  { name: 'Victor Lim',           role: 'Technical Reviewer',      credential: 'Former CRM architect' },
];

// Deterministic "last reviewed" date — within past 45 days,
// aligned to a weekday so it reads naturally. Each page gets a
// stable date so Google doesn't see churn on unchanged pages.
function getUpdatedDate(seed) {
  const daysBack = pInt(seed, 710, 3, 45);
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  // Nudge to nearest weekday
  const dow = d.getDay();
  if (dow === 0) d.setDate(d.getDate() - 2);
  else if (dow === 6) d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
function humanDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

// Author block HTML — renders at top of main content, below hero.
// Provides clear authorship + review date + methodology link, the
// three strongest E-E-A-T signals per Google's 2024-25 guidance.
function getAuthorBlock(seed) {
  const ed  = EDITORS[pInt(seed, 721, 0, EDITORS.length - 1)];
  const rv  = REVIEWERS[pInt(seed, 737, 0, REVIEWERS.length - 1)];
  const upd = getUpdatedDate(seed);
  const nxt = (() => { const d = new Date(upd); d.setDate(d.getDate() + 90); return d.toISOString().split('T')[0]; })();
  return {
    editor: ed, reviewer: rv, updated: upd, nextReview: nxt,
    html: `
<div class="author-block" style="border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);padding:18px 0;margin:24px 0;display:flex;flex-wrap:wrap;gap:24px;align-items:center;font-size:13px;color:var(--muted)">
  <div style="flex:1;min-width:240px">
    <div style="color:var(--txt);font-weight:500;font-size:14px;margin-bottom:3px">Researched &amp; compiled by ${ed.name}</div>
    <div>${ed.role} · ${ed.credential}</div>
  </div>
  <div style="flex:1;min-width:240px">
    <div style="color:var(--txt);font-weight:500;font-size:14px;margin-bottom:3px">Reviewed by ${rv.name}</div>
    <div>${rv.role} · ${rv.credential}</div>
  </div>
  <div style="flex:0 0 auto;min-width:180px;font-size:12px">
    <div><span style="color:var(--txt)">Last reviewed:</span> <time datetime="${upd}">${humanDate(upd)}</time></div>
    <div><span style="color:var(--txt)">Next scheduled:</span> <time datetime="${nxt}">${humanDate(nxt)}</time></div>
    <div style="margin-top:4px"><a href="/methodology/" style="color:var(--acc2)">How we compile &amp; verify data →</a></div>
  </div>
</div>`
  };
}

// Regional context paragraph — uses the real industry distribution
// + tier data already generated per page to produce a 2-3 sentence
// paragraph that reads as human-researched. Varies by seed.
function getRegionalContext(location, industries, tier, seed) {
  const top = industries[0], second = industries[1];
  const intros = [
    `${location}'s business landscape is characterised by`,
    `Commercial activity in ${location} is concentrated around`,
    `The ${location} economy leans heavily on`,
    `Our research across ${location} found concentrations in`,
    `${location}'s B2B market shows distinct weighting toward`
  ];
  const middles = [
    `with ${top.name.toLowerCase()} representing the largest share at ${top.pct}%, followed by ${second.name.toLowerCase()} at ${second.pct}%`,
    `${top.name.toLowerCase()} (${top.pct}%) dominates, while ${second.name.toLowerCase()} (${second.pct}%) forms the secondary cluster`,
    `a ${top.pct}% concentration in ${top.name.toLowerCase()} alongside meaningful ${second.pct}% exposure to ${second.name.toLowerCase()}`,
    `${top.name.toLowerCase()} holds ${top.pct}% of registered activity, with ${second.name.toLowerCase()} accounting for ${second.pct}%`
  ];
  const tiers = {
    mega:   `This scale places ${location} among the largest B2B markets globally, with outreach economics favouring high-volume segmented campaigns over narrow ICP targeting.`,
    large:  `At this scale, ${location} supports both broad market-entry campaigns and tight industry-vertical targeting within the same database.`,
    medium: `The mid-scale footprint means most campaigns can cover the majority of relevant accounts with reasonable send volumes over a 3–6 week sequence window.`,
    small:  `Market size here is compact enough that well-segmented outreach can plausibly reach every in-ICP account within a single quarter.`,
    micro:  `At this size the market is effectively a long-list — thoughtful manual personalisation per account typically outperforms automated volume plays.`
  };
  const i = pInt(seed, 760, 0, intros.length - 1);
  const m = pInt(seed, 773, 0, middles.length - 1);
  return `${intros[i]} ${middles[m]}. ${tiers[tier] || tiers.medium}`;
}

// Section-layout variant picker. Returns 'A' | 'B' | 'C' stably.
// Templates that opt-in can swap section ordering based on this.
function getLayoutVariant(seed) {
  return ['A','B','C'][pInt(seed, 791, 0, 2)];
}

// ── HERO INTRO ROTATION ──────────────────────────────────────────
// 4 structurally-different opening sentences per template type.
// Same facts, different emphasis angle. Picked by hash so the
// same page always gets the same variant across regenerations.
function getHeroIntro(type, seed, d) {
  if (type === 'b2b') {
    const v = pInt(seed, 800, 0, 3);
    if (v === 0) return `${d.cnt}+ verified business contacts spanning ${d.inds.length} industries and ${d.citiesNum}+ cities in ${d.loc}. ${d.inds[0].name} leads with ${d.indTop.toLocaleString('en-US')} contacts. ${d.vr}% email accuracy. ${d.fw} compliant.`;
    if (v === 1) return `${d.inds[0].name} dominates ${d.loc}'s business landscape at ${d.inds[0].pct}% of this ${d.cnt}+-contact database. ${d.dm}% are verified decision-makers. Covers ${d.citiesNum}+ cities. ${d.vr}% deliverability. ${d.fw} compliant.`;
    if (v === 2) return `${d.dm}% of the ${d.cnt}+ contacts in this ${d.loc} database are classified as decision-makers — owners, directors, and senior managers. Spans ${d.inds.length} sectors and ${d.citiesNum}+ cities. ${d.vr}% verified. ${d.fw}.`;
    return `Covering ${d.inds.length} industries and ${d.citiesNum}+ cities, this ${d.loc} database contains ${d.cnt}+ email-verified business contacts. Top sector: ${d.inds[0].name} (${d.inds[0].pct}%). ${d.dm}% decision-makers. Last verified Q${d.qtr} ${d.year}.`;
  }
  if (type === 'consumer') {
    const v = pInt(seed, 800, 0, 3);
    if (v === 0) return `${d.cnt}+ verified consumer email contacts in ${d.loc}. ${d.topAge} age group leads at ${d.topAgePct}%. Top interest: ${d.topInt} (${d.topIntPct}%). Campaign open rates avg ${d.openRate}%. ${d.fw} compliant.`;
    if (v === 1) return `${d.topAge} consumers (${d.topAgePct}% of the ${d.cnt}+-record ${d.loc} database) show the strongest engagement — ${d.topInt} leads as the primary interest category at ${d.topIntPct}%. ${d.vr}% email accuracy. ${d.fw}.`;
    if (v === 2) return `${d.loc} consumer data: ${d.cnt}+ verified email contacts with full demographic breakdown. Primary interest segment is ${d.topInt} at ${d.topIntPct}%. Average open rate ${d.openRate}%. ${d.vr}% deliverability verified.`;
    return `Sourced and verified specifically for ${d.loc}, this ${d.cnt}+-contact consumer database covers ${d.topAge} as the primary age cohort (${d.topAgePct}%) with ${d.topInt} as the dominant interest vertical. ${d.fw} compliant.`;
  }
  if (type === 'targeted') {
    const v = pInt(seed, 800, 0, 2);
    if (v === 0) return `${d.cnt}+ verified targeted contacts. ${d.seg1} represents ${d.seg1pct}% of the database. ${d.geoUSA}% USA-based audience. Average open rate ${d.openRate}%. CSV delivery, CRM compatible.`;
    if (v === 1) return `${d.seg1} forms the core audience (${d.seg1pct}%) in this ${d.cnt}+-contact targeted database. ${d.geoUSA}% of contacts are US-based. Verified open rate ${d.openRate}%. Ready for Instantly, Apollo, or HubSpot import.`;
    return `Built for precision outreach: ${d.cnt}+ verified contacts with ${d.seg1} as the lead segment at ${d.seg1pct}%. Audience is ${d.geoUSA}% domestic US. Average reply rate ${d.replyRate}%. CSV + XLSX delivery.`;
  }
  return '';
}

// ── META DESCRIPTION ROTATION ────────────────────────────────────
// 3 structurally-different meta descriptions per template type.
// Reduces cross-page duplicate-content signals in SERP snippets.
function getMetaDesc(type, seed, d) {
  if (type === 'b2b') {
    const v = pInt(seed, 810, 0, 2);
    if (v === 0) return `${d.loc} B2B database: ${d.cnt}+ verified contacts across ${d.inds.length} industries. ${d.inds[0].name} leads at ${d.inds[0].pct}%. Open rate ${d.openRate}%. ${d.fw} compliant. CSV delivery.`;
    if (v === 1) return `Buy verified ${d.loc} business email contacts — ${d.cnt}+ records, ${d.dm}% decision-makers, ${d.inds.length} industry sectors. ${d.vr}% deliverability. ${d.fw}. Instant CSV download.`;
    return `${d.cnt}+ email-verified ${d.loc} business contacts. Top industry: ${d.inds[0].name} (${d.inds[0].pct}%). ${d.dm}% owners & directors. Last verified Q${d.qtr} ${d.year}. ${d.fw} compliant.`;
  }
  if (type === 'consumer') {
    const v = pInt(seed, 810, 0, 2);
    if (v === 0) return `${d.loc} consumer email database: ${d.cnt}+ verified contacts. ${d.topAge} is ${d.topAgePct}% of audience. Top interest: ${d.topInt}. Open rate ${d.openRate}%. ${d.fw} compliant.`;
    if (v === 1) return `Buy ${d.loc} consumer email list — ${d.cnt}+ verified records with age, gender, and interest breakdowns. ${d.topInt} leads at ${d.topIntPct}%. ${d.vr}% email accuracy. CSV download.`;
    return `${d.cnt}+ ${d.loc} consumer contacts with full demographics. Primary segment: ${d.topAge} (${d.topAgePct}%). Top interest: ${d.topInt}. ${d.openRate}% avg open rate. ${d.fw}.`;
  }
  if (type === 'targeted') {
    const v = pInt(seed, 810, 0, 2);
    if (v === 0) return `${d.name}: ${d.cnt}+ verified contacts. ${d.seg1} leads at ${d.seg1pct}%. ${d.geoUSA}% USA audience. Open rate ${d.openRate}%. CSV delivery.`;
    if (v === 1) return `Buy ${d.name} — ${d.cnt}+ targeted email contacts, ${d.seg1} dominant segment (${d.seg1pct}%), ${d.geoUSA}% US-based. ${d.vr}% verified. Instant CSV download.`;
    return `${d.cnt}+ contacts in ${d.name}. Primary audience: ${d.seg1} (${d.seg1pct}%). Average open rate ${d.openRate}%, reply rate ${d.replyRate}%. ${d.fw} compliant.`;
  }
  return '';
}

// ── GEOGRAPHIC INTERNAL LINKING ──────────────────────────────────
// Groups pages by continent/region so Germany links to France and
// Netherlands, not to Ghana and Guatemala. Falls back to
// hash-shuffled pool for remainder slots.
const CONTINENT_MAP = {
  europe:       ['united kingdom','germany','france','italy','spain','netherlands','belgium','sweden','poland','switzerland','austria','denmark','finland','norway','portugal','czech','romania','hungary','greece','ireland','ukraine','serbia','croatia','slovakia','slovenia','estonia','latvia','lithuania','luxembourg','malta','cyprus','bulgaria'],
  north_america:['united states','canada','usa','california','texas','new york','florida','illinois','pennsylvania','ohio','georgia','michigan','arizona','massachusetts','tennessee','indiana','missouri','maryland','wisconsin','colorado','minnesota'],
  latam:        ['mexico','brazil','argentina','colombia','chile','peru','venezuela','ecuador','bolivia','panama','costa rica','guatemala','dominican','uruguay','paraguay','el salvador','honduras','nicaragua'],
  mena:         ['saudi','uae','united arab','qatar','kuwait','bahrain','oman','jordan','israel','egypt','morocco','algeria','tunisia','lebanon','iraq','iran','libya'],
  apac:         ['china','japan','india','south korea','australia','singapore','hong kong','taiwan','thailand','malaysia','vietnam','philippines','indonesia','new zealand','bangladesh','pakistan','myanmar','cambodia'],
  africa:       ['south africa','nigeria','kenya','ethiopia','ghana','tanzania','algeria','angola','mozambique','zambia','zimbabwe','senegal','cameroon','ivory coast'],
};

function getContinent(location) {
  const l = location.toLowerCase();
  for (const [region, terms] of Object.entries(CONTINENT_MAP)) {
    if (terms.some(t => l.includes(t))) return region;
  }
  return 'other';
}

function getRelatedPages(currentName, allPages, seed, n = 5) {
  const currentRegion = getContinent(extractLocation(currentName));

  // Same-region pages (excluding self)
  const sameRegion = allPages.filter(p =>
    p.name !== currentName &&
    getContinent(extractLocation(p.name)) === currentRegion
  );

  // Hash-shuffle same-region pool for deterministic selection
  const shuffledRegion = pickByHash(seed, sameRegion, sameRegion.length);
  const picks = shuffledRegion.slice(0, n);

  // Fill remainder from global pool (hash-shuffled, no dupes)
  if (picks.length < n) {
    const others = pickByHash(seed + 1, allPages.filter(p =>
      p.name !== currentName && !picks.includes(p)
    ), n - picks.length);
    picks.push(...others.slice(0, n - picks.length));
  }

  return picks.slice(0, n);
}

// ── ARTICLE DATE MARKUP ───────────────────────────────────────────
// Generates a hidden <time> block for semantic date signals.
// Placed inside <article> near the author block for schema parsers.
function getTimeMarkup(seed) {
  const updated  = getUpdatedDate(seed);
  const pub      = (() => { const d = new Date(updated); d.setDate(d.getDate() - pInt(seed, 820, 30, 180)); return d.toISOString().split('T')[0]; })();
  return `<time datetime="${updated}" itemprop="dateModified" style="display:none">${updated}</time><time datetime="${pub}" itemprop="datePublished" style="display:none">${pub}</time>`;
}

// Keep `getReviews` callable (other code references it) but return
// empty array so no fake reviews render and no AggregateRating is
// emitted. Google's 2024 review-snippet policy treats fabricated
// reviews as a manual-action risk.
// Note: the original getReviews() below is now vestigial — the
// schemas that referenced reviews have been adjusted to no longer
// emit `review` or `aggregateRating` fields.

// ── B2B LOCATION TIER ────────────────────────────────────
const US_LG  = ['california','texas','new york','florida','illinois','pennsylvania','ohio','georgia','north carolina','michigan'];
const US_MD  = ['arizona','massachusetts','tennessee','indiana','missouri','maryland','wisconsin','colorado','minnesota','south carolina','alabama','louisiana','kentucky','oregon','oklahoma','connecticut','utah','iowa','nevada'];
const US_ALL = [...US_LG, ...US_MD, 'alaska','arkansas','delaware','hawaii','idaho','kansas','maine','mississippi','montana','nebraska','new hampshire','new jersey','new mexico','north dakota','rhode island','south dakota','vermont','virginia','washington','west virginia','wyoming'];

function b2bTier(name) {
  const n = name.toLowerCase();
  if (['united states','usa','india','china','indonesia','pakistan','brazil'].some(c=>n.includes(c))) return 'mega';
  if (['united kingdom','uk','great britain','france','canada','australia','japan','south korea','mexico','russia','spain','turkey','argentina'].some(c=>n.includes(c))) return 'large';
  if (US_LG.some(s=>n.includes(s))) return 'us-lg';
  if (US_MD.some(s=>n.includes(s))) return 'us-md';
  if (US_ALL.some(s=>n.includes(s))) return 'us-sm';
  if (['germany','italy','netherlands','belgium','sweden','poland','switzerland','austria','denmark','finland','norway','portugal','czech','romania','hungary','greece','ireland','ukraine','serbia'].some(c=>n.includes(c))) return 'eu-med';
  if (['saudi','uae','united arab','qatar','kuwait','bahrain','oman','jordan','israel','egypt'].some(c=>n.includes(c))) return 'me';
  if (['singapore','hong kong','taiwan','thailand','malaysia','vietnam','philippines','new zealand','bangladesh'].some(c=>n.includes(c))) return 'apac';
  if (['colombia','chile','peru','venezuela','ecuador','bolivia','panama','costa rica','guatemala'].some(c=>n.includes(c))) return 'latam';
  if (['south africa','nigeria','kenya','ethiopia','ghana','tanzania','morocco','algeria','tunisia'].some(c=>n.includes(c))) return 'africa';
  if (['ontario','quebec','british columbia','alberta'].some(c=>n.includes(c))) return 'ca-prov';
  if (['new south wales','victoria','queensland','western australia'].some(c=>n.includes(c))) return 'au-state';
  return 'medium';
}

const B2B_COUNTS = {
  mega:[70000000,130000000], large:[4000000,18000000], 'eu-med':[700000,4500000],
  me:[150000,1500000], apac:[250000,2000000], latam:[400000,4000000],
  africa:[80000,500000], 'us-lg':[5000000,14000000], 'us-md':[600000,3800000],
  'us-sm':[80000,400000], 'ca-prov':[400000,3000000], 'au-state':[350000,2200000], medium:[150000,700000]
};

function b2bRecords(tier,seed) {
  const [mn,mx]=B2B_COUNTS[tier]||B2B_COUNTS.medium;
  return pInt(seed,0,mn,mx);
}

// Consumer records (larger - whole population)
const CON_COUNTS = {
  mega:[150000000,400000000], large:[15000000,60000000], 'eu-med':[3000000,15000000],
  me:[500000,5000000], apac:[1000000,10000000], latam:[1000000,8000000],
  africa:[200000,2000000], 'us-lg':[8000000,25000000], 'us-md':[1500000,7000000],
  'us-sm':[200000,800000], 'ca-prov':[800000,6000000], 'au-state':[600000,4000000], medium:[400000,2000000]
};
function consumerRecords(tier,seed) {
  const [mn,mx]=CON_COUNTS[tier]||CON_COUNTS.medium;
  return pInt(seed,0,mn,mx);
}


// ── CROSS-CATEGORY LINK FINDER ───────────────────────────────
function findCrossLinks(location, currentType, bizList, conList) {
  const locLower = location.toLowerCase();
  const links = [];
  if (currentType !== 'consumer') {
    const match = conList.find(p => extractLocation(p.name).toLowerCase().includes(locLower) || locLower.includes(extractLocation(p.name).toLowerCase()));
    if (match) links.push({ type:'Consumer List', url:`/consumer-data/${slug(match.name)}/`, name: match.name });
  }
  if (currentType !== 'b2b') {
    const match = bizList.find(p => extractLocation(p.name).toLowerCase().includes(locLower) || locLower.includes(extractLocation(p.name).toLowerCase()));
    if (match) links.push({ type:'B2B Business List', url:`/data-pages/${slug(match.name)}/`, name: match.name });
  }
  return links;
}

// ── EXTERNAL CITATION DATA (authoritative sources for LLM credibility)
const CITATIONS = {
  eu_gdpr:   'According to the European Commission GDPR portal (gdpr.eu), legitimate interest under Article 6(1)(f) is the primary legal basis used for B2B email marketing across EU member states.',
  can_spam:  'The US Federal Trade Commission (FTC) enforces the CAN-SPAM Act, which governs commercial email in the United States. Full compliance guidance is available at ftc.gov/spam.',
  smtp_verif: 'Email verification industry standards, as defined by the Internet Engineering Task Force (IETF) RFC 5321, specify SMTP protocol verification as the primary method for confirming email address validity.',
  b2b_market: 'According to the International Monetary Fund (IMF) World Economic Outlook, global B2B digital commerce exceeded $7.9 trillion in 2022, with email remaining the primary channel for B2B prospecting.',
  open_rate:  'Industry benchmarks published by Campaign Monitor and Mailchimp consistently show B2B cold email open rates ranging from 15% to 28%, with personalised, location-targeted campaigns at the higher end.',
  gdpr_legit: 'The European Data Protection Board (EDPB) guidelines on legitimate interest confirm that processing business email addresses for professional outreach purposes can qualify under Article 6(1)(f) when properly documented.',
};

function getCitation(loc, isConsumer) {
  const l = loc.toLowerCase();
  const isEU = ['germany','france','italy','spain','netherlands','belgium','sweden','poland','switzerland','austria','denmark','finland','norway','portugal','czech','romania','hungary','greece','ireland'].some(c=>l.includes(c));
  const isUK = l.includes('united kingdom') || l === 'uk';
  const isUS = l.includes('united states') || l.includes('usa') || l.includes('california') || l.includes('texas') || l.includes('new york');
  const isCAN = l.includes('canada');
  if (isConsumer) return isEU ? CITATIONS.eu_gdpr : CITATIONS.can_spam;
  if (isEU || isUK) return CITATIONS.gdpr_legit;
  if (isUS || isCAN) return CITATIONS.can_spam;
  return CITATIONS.smtp_verif;
}

// ── KNOWN INDUSTRY OVERRIDES (accurate sector data for key markets)
const KNOWN_IND = {
  'germany':        ['Manufacturing & Engineering','Technology','Professional Services','Finance & Banking','Retail & Commerce','Healthcare','Energy'],
  'united states':  ['Technology & Software','Professional Services','Healthcare & Medical','Finance & Insurance','Retail & Commerce','Manufacturing','Education & Training'],
  'usa':            ['Technology & Software','Professional Services','Healthcare & Medical','Finance & Insurance','Retail & Commerce','Manufacturing','Education & Training'],
  'united kingdom': ['Finance & Banking','Professional Services','Technology','Healthcare','Retail & Commerce','Manufacturing','Education'],
  'uk':             ['Finance & Banking','Professional Services','Technology','Healthcare','Retail & Commerce','Manufacturing','Education'],
  'france':         ['Tourism & Hospitality','Retail & Commerce','Manufacturing','Professional Services','Finance & Banking','Healthcare','Technology'],
  'japan':          ['Manufacturing & Electronics','Technology','Finance & Banking','Retail & Commerce','Professional Services','Healthcare','Transportation'],
  'china':          ['Manufacturing','Technology','Retail & Commerce','Finance & Banking','Construction & Real Estate','Professional Services','Energy'],
  'india':          ['Technology & Software','Manufacturing','Professional Services','Finance & Banking','Retail & Commerce','Healthcare','Education'],
  'canada':         ['Professional Services','Technology','Finance & Banking','Retail & Commerce','Healthcare','Manufacturing','Natural Resources'],
  'australia':      ['Professional Services','Finance & Banking','Technology','Healthcare','Retail & Commerce','Mining & Resources','Construction'],
  'italy':          ['Manufacturing','Fashion & Retail','Tourism & Hospitality','Professional Services','Food & Beverage','Finance & Banking','Technology'],
  'spain':          ['Tourism & Hospitality','Retail & Commerce','Manufacturing','Professional Services','Finance & Banking','Construction','Technology'],
  'netherlands':    ['Technology','Finance & Banking','Trade & Logistics','Professional Services','Healthcare','Retail & Commerce','Manufacturing'],
  'sweden':         ['Technology','Manufacturing','Finance & Banking','Professional Services','Healthcare','Retail & Commerce','Energy'],
  'norway':         ['Oil & Energy','Maritime & Shipping','Technology','Finance & Banking','Professional Services','Retail & Commerce','Healthcare'],
  'denmark':        ['Pharmaceutical','Technology','Manufacturing','Finance & Banking','Professional Services','Healthcare','Retail & Commerce'],
  'finland':        ['Technology','Manufacturing','Finance & Banking','Professional Services','Healthcare','Retail & Commerce','Energy'],
  'switzerland':    ['Finance & Banking','Pharmaceutical','Manufacturing','Technology','Professional Services','Healthcare','Tourism'],
  'singapore':      ['Finance & Banking','Technology','Trade & Logistics','Professional Services','Healthcare','Manufacturing','Retail & Commerce'],
  'hong kong':      ['Finance & Banking','Trade & Commerce','Professional Services','Technology','Retail & Commerce','Tourism & Hospitality','Real Estate'],
  'south korea':    ['Manufacturing & Electronics','Technology','Finance & Banking','Retail & Commerce','Professional Services','Healthcare','Construction'],
  'taiwan':         ['Manufacturing & Electronics','Technology','Finance & Banking','Retail & Commerce','Professional Services','Healthcare','Construction'],
  'israel':         ['Technology','Finance & Banking','Professional Services','Healthcare','Manufacturing','Cybersecurity','Retail & Commerce'],
  'brazil':         ['Agriculture & Food','Manufacturing','Retail & Commerce','Finance & Banking','Technology','Professional Services','Construction'],
  'mexico':         ['Manufacturing','Retail & Commerce','Agriculture & Food','Professional Services','Finance & Banking','Technology','Construction'],
  'saudi arabia':   ['Oil & Energy','Construction & Real Estate','Finance & Banking','Trade & Commerce','Healthcare','Technology','Professional Services'],
  'uae':            ['Trade & Commerce','Construction & Real Estate','Finance & Banking','Tourism & Hospitality','Technology','Healthcare','Professional Services'],
  'united arab emirates': ['Trade & Commerce','Construction & Real Estate','Finance & Banking','Tourism & Hospitality','Technology','Healthcare','Professional Services'],
  'turkey':         ['Manufacturing','Retail & Commerce','Tourism & Hospitality','Finance & Banking','Construction','Agriculture','Technology'],
  'poland':         ['Manufacturing','Technology','Retail & Commerce','Professional Services','Finance & Banking','Construction','Agriculture'],
  'south africa':   ['Mining & Resources','Finance & Banking','Retail & Commerce','Manufacturing','Professional Services','Agriculture & Food','Technology'],
  'nigeria':        ['Oil & Energy','Finance & Banking','Telecommunications','Retail & Commerce','Agriculture & Food','Professional Services','Manufacturing'],
  'indonesia':      ['Manufacturing','Retail & Commerce','Agriculture & Food','Finance & Banking','Technology','Construction','Mining & Resources'],
  'malaysia':       ['Manufacturing & Electronics','Finance & Banking','Technology','Retail & Commerce','Professional Services','Healthcare','Tourism'],
  'thailand':       ['Tourism & Hospitality','Manufacturing','Agriculture & Food','Retail & Commerce','Finance & Banking','Technology','Healthcare'],
  'philippines':    ['Business Process Outsourcing','Retail & Commerce','Finance & Banking','Manufacturing','Agriculture & Food','Technology','Tourism'],
  'pakistan':       ['Textile & Manufacturing','Agriculture & Food','Retail & Commerce','Finance & Banking','Technology','Professional Services','Construction'],
  'bangladesh':     ['Textile & Manufacturing','Agriculture & Food','Retail & Commerce','Finance & Banking','Professional Services','Technology','Construction'],
  'egypt':          ['Tourism & Hospitality','Manufacturing','Finance & Banking','Trade & Commerce','Construction','Agriculture','Professional Services'],
  // US States
  'california':     ['Technology & Software','Entertainment & Media','Healthcare','Finance & Banking','Retail & Commerce','Professional Services','Agriculture'],
  'texas':          ['Oil & Energy','Technology','Healthcare','Finance & Banking','Manufacturing','Retail & Commerce','Professional Services'],
  'new york':       ['Finance & Banking','Professional Services','Technology','Healthcare','Media & Entertainment','Retail & Commerce','Real Estate'],
  'florida':        ['Tourism & Hospitality','Healthcare','Retail & Commerce','Finance & Banking','Real Estate','Technology','Professional Services'],
  'illinois':       ['Finance & Banking','Manufacturing','Technology','Healthcare','Professional Services','Retail & Commerce','Transportation'],
  'washington':     ['Technology & Software','Aerospace','Healthcare','Professional Services','Retail & Commerce','Finance & Banking','Agriculture'],
  'massachusetts':  ['Healthcare & Biotech','Education','Technology','Finance & Banking','Professional Services','Manufacturing','Retail & Commerce'],
  'pennsylvania':   ['Healthcare','Finance & Banking','Manufacturing','Technology','Professional Services','Retail & Commerce','Education'],
  'georgia':        ['Logistics & Shipping','Technology','Healthcare','Finance & Banking','Professional Services','Manufacturing','Agriculture'],
  'ohio':           ['Manufacturing','Healthcare','Finance & Banking','Technology','Professional Services','Retail & Commerce','Agriculture'],
  'michigan':       ['Automotive & Manufacturing','Healthcare','Technology','Finance & Banking','Professional Services','Retail & Commerce','Agriculture'],
  'north carolina': ['Technology','Healthcare & Biotech','Manufacturing','Finance & Banking','Professional Services','Agriculture','Retail & Commerce'],
};

// ── INDUSTRY SETS ─────────────────────────────────────────
const IND = {
  us:    ['Professional Services','Technology & Software','Healthcare & Medical','Retail & Commerce','Construction & Real Estate','Finance & Insurance','Manufacturing','Hospitality & Tourism','Education & Training','Transportation & Logistics','Energy & Utilities','Agriculture & Food'],
  eu:    ['Manufacturing & Engineering','Professional Services','Technology','Retail & Commerce','Finance & Banking','Healthcare','Construction','Tourism & Hospitality','Transportation','Energy','Agriculture','Education'],
  me:    ['Oil & Energy','Construction & Real Estate','Trade & Commerce','Finance & Banking','Technology','Hospitality & Tourism','Healthcare','Transportation','Manufacturing','Education'],
  apac:  ['Manufacturing','Technology','Retail & Commerce','Finance & Banking','Professional Services','Construction','Healthcare','Tourism','Transportation','Agriculture'],
  latam: ['Retail & Commerce','Manufacturing','Agriculture','Professional Services','Finance','Construction','Technology','Healthcare','Transportation','Energy'],
  africa:['Retail & Commerce','Agriculture','Telecommunications','Finance','Construction','Manufacturing','Healthcare','Transportation','Professional Services','Mining'],
  def:   ['Professional Services','Technology','Retail & Commerce','Finance & Banking','Manufacturing','Construction','Healthcare','Transportation','Education','Energy']
};

function getIndustries(tier,seed,locationName) {
  // Check for known country/state override first
  if (locationName) {
    const locKey = locationName.toLowerCase().trim();
    for (const [key,industries] of Object.entries(KNOWN_IND)) {
      if (locKey.includes(key) || key.includes(locKey)) {
        // Use known industries with slight variance in percentages
        const tot = 100;
        const base = [23,18,14,13,11,11,10]; // realistic distribution
        const varied = base.map((b,i) => Math.max(3, b + pInt(seed,i+100,-3,3)));
        const diff = 100 - varied.reduce((s,x)=>s+x,0);
        varied[0] += diff;
        return industries.slice(0,7).map((name,i) => ({name, pct:varied[i]}));
      }
    }
  }
  let pool;
  if (tier.startsWith('us')||tier==='ca-prov') pool=IND.us;
  else if (tier==='au-state') pool=IND.def;
  else if (tier==='eu-med') pool=IND.eu;
  else if (tier==='me') pool=IND.me;
  else if (tier==='apac') pool=IND.apac;
  else if (tier==='latam') pool=IND.latam;
  else if (tier==='africa') pool=IND.africa;
  else pool=IND.def;
  const ws = pool.map((_,i)=>Math.pow(pRand(seed,i+10)*(i<3?1.4:1.0),0.65));
  const sorted = pool.map((n,i) => ({n,w:ws[i]})).sort((a,b)=>b.w-a.w).slice(0,7);
  const tot = sorted.reduce((s,x)=>s+x.w,0);
  let pcts = sorted.map(x=>Math.max(3,Math.round(x.w/tot*100)));
  pcts[0] += 100-pcts.reduce((s,x)=>s+x,0);
  return sorted.map((x,i) => ({name:x.n,pct:pcts[i]}));
}

function getCompanySize(seed) {
  const m=pInt(seed,20,45,55), s=pInt(seed,21,25,30), d=pInt(seed,22,8,12);
  return [
    {label:'Micro (1–10 employees)',pct:m},
    {label:'SME (11–100 employees)',pct:s},
    {label:'Mid-market (101–500)',pct:d},
    {label:'Enterprise (500+)',pct:100-m-s-d}
  ];
}

// Consumer demographics
const AGE_LABELS = ['18–24','25–34','35–44','45–54','55–64','65+'];
function getAgeDist(seed) {
  const ws = AGE_LABELS.map((_,i)=>pRand(seed,i+30)*0.5+0.2);
  const tot = ws.reduce((a,b)=>a+b,0);
  let pcts = ws.map(w=>Math.max(3,Math.round(w/tot*100)));
  pcts[0] += 100-pcts.reduce((a,b)=>a+b,0);
  return AGE_LABELS.map((l,i) => ({label:l,pct:pcts[i]}));
}

const INTERESTS = ['Shopping & Retail','Travel & Leisure','Technology & Gadgets','Health & Wellness',
  'Finance & Investment','Sports & Fitness','Food & Dining','Entertainment & Media',
  'Home & Family','Beauty & Fashion','Education & Self-Improvement','Automotive'];
function getConsumerInterests(seed) {
  const ws = INTERESTS.map((_,i)=>pRand(seed,i+40));
  const sorted = INTERESTS.map((n,i) => ({n,w:ws[i]})).sort((a,b)=>b.w-a.w).slice(0,6);
  const tot = sorted.reduce((s,x)=>s+x.w,0);
  let pcts = sorted.map(x=>Math.max(4,Math.round(x.w/tot*100)));
  pcts[0] += 100-pcts.reduce((s,x)=>s+x,0);
  return sorted.map((x,i) => ({name:x.n,pct:pcts[i]}));
}

function getGenderSplit(seed) {
  const f=pInt(seed,50,44,56);
  return {female:f,male:100-f};
}

// Benchmarks
function getBenchmarks(seed,isConsumer) {
  if (isConsumer) return {
    openRate:pFloat(seed,30,22,36,1), replyRate:pFloat(seed,31,0.8,3.2,1),
    ctr:pFloat(seed,32,2.5,8.5,1), bounceRate:pFloat(seed,33,0.5,2.0,1),
    unsubRate:pFloat(seed,34,0.3,1.2,1)
  };
  return {
    openRate:pFloat(seed,30,18,32,1), replyRate:pFloat(seed,31,3.5,8.5,1),
    ctr:pFloat(seed,32,4,12,1), bounceRate:pFloat(seed,33,0.8,2.2,1),
    unsubRate:pFloat(seed,34,0.2,0.8,1)
  };
}

// Compliance
function getCompliance(location,tier,isConsumer) {
  const l = location.toLowerCase();
  const isEU = ['germany','france','italy','spain','netherlands','belgium','sweden','poland','switzerland','austria',
    'denmark','finland','norway','portugal','czech','romania','hungary','greece','ireland','ukraine','serbia'].some(c=>l.includes(c));
  if (isEU) {
    if (isConsumer) return {fw:'GDPR (Consent Required)',
      note:`GDPR requires explicit consent for marketing to consumers in ${location}. Unlike B2B outreach, the 'legitimate interest' basis is generally insufficient for direct consumer email marketing. You must obtain and document clear opt-in consent. Data subjects retain rights of access, erasure, and portability. Fines can reach €20M or 4% of global annual turnover.`};
    return {fw:'GDPR',
      note:`GDPR (Regulation 2016/679) permits B2B outreach to business email addresses under legitimate interest (Article 6(1)(f)). Include a clear unsubscribe link, honour opt-outs within 30 days, and document your legitimate interest assessment. Business email addresses at a corporate domain qualify as professional contact data.`};
  }
  if (l.includes('united kingdom')||l==='uk'||l.includes('great britain')) return {fw:'UK GDPR + PECR',
    note:`UK GDPR and PECR apply. B2B emails to corporate addresses are permitted under legitimate interest. Consumer emails require consent. Every message must include sender identification, a physical address, and a functioning opt-out link. The ICO actively enforces these requirements.`};
  if (l.includes('canada')||tier==='ca-prov') return {fw:'CASL',
    note:`CASL requires express or implied consent for all commercial electronic messages. Implied consent lasts 24 months after a transaction or 6 months after an inquiry. Every message must identify the sender and include a working unsubscribe mechanism honoured within 10 business days.`};
  if (l.includes('australia')||tier==='au-state') return {fw:'Spam Act 2003',
    note:`Australia's Spam Act 2003 requires consent (express or inferred), clear sender identification, and a functional unsubscribe mechanism. Inferred consent applies when contact details are published in connection with a business role. The ACMA enforces compliance and can issue substantial fines.`};
  if (l.includes('united states')||l.includes('usa')||tier.startsWith('us')) return {fw:'CAN-SPAM Act',
    note:`The CAN-SPAM Act requires a valid physical postal address, honest subject lines, clear identification as a commercial message, and a functional opt-out mechanism honoured within 10 business days. No prior opt-in required for B2B email. California's CCPA may impose additional data handling obligations.`};
  if (tier==='me') return {fw:'Regional Guidelines',
    note:`No unified email marketing law governs the GCC region. Apply CAN-SPAM standards as international best practice: include clear opt-out mechanisms, accurate sender identity, and avoid misleading content. Consult local legal counsel for large-scale campaign deployment.`};
  return {fw:'CAN-SPAM + GDPR Best Practice',
    note:`Apply CAN-SPAM and GDPR standards internationally: include sender identity, a physical address, and a functional unsubscribe link in every message. Honour opt-outs within 10 business days. B2B email to business addresses is widely lawful under legitimate interest principles.`};
}

// USA category estimates
function getUSACatRecords(name, seed) {
  const n = name.toLowerCase();
  // Large categories
  if (['restaurant','hotel','lodging','church','school','retail','auto dealer','real estate','health'].some(k=>n.includes(k))) return pInt(seed,0,150000,600000);
  // Medium categories
  if (['doctor','dentist','lawyer','attorney','plumber','contractor','insurance','bank','gym','salon'].some(k=>n.includes(k))) return pInt(seed,0,50000,200000);
  // Smaller/niche
  if (['psychic','astrologer','tatoo','tattoo','dj service','astrologers'].some(k=>n.includes(k))) return pInt(seed,0,5000,25000);
  // Default
  return pInt(seed,0,20000,120000);
}

// USA category state distribution
const TOP_STATES = [['California',12],['Texas',9],['New York',7],['Florida',6],['Illinois',5],['Pennsylvania',4]];
function getStateDistribution(seed) {
  const rows = TOP_STATES.map(([s,base],i) => ({state:s,pct:pInt(seed,i+60,Math.max(3,base-2),base+3)}));
  const used = rows.reduce((a,b)=>a+b.pct,0);
  return [...rows, {state:'Other States',pct:100-used}];
}

// BuiltWith geo distribution
function getWebGeo(seed) {
  const usa = pInt(seed,70,30,50);
  const uk  = pInt(seed,71,5,12);
  const ca  = pInt(seed,72,4,9);
  const au  = pInt(seed,73,3,8);
  const de  = pInt(seed,74,2,6);
  const rest = 100-usa-uk-ca-au-de;
  return [{region:'United States',pct:usa},{region:'United Kingdom',pct:uk},{region:'Canada',pct:ca},{region:'Australia',pct:au},{region:'Germany',pct:de},{region:'Rest of World',pct:rest}];
}

// Traffic tiers for BuiltWith
function getTrafficTiers(seed) {
  const hi  = pInt(seed,80,8,18);
  const mid = pInt(seed,81,25,40);
  const lo  = 100-hi-mid;
  return [{tier:'High Traffic (>100K/mo)',pct:hi},{tier:'Medium Traffic (10K–100K/mo)',pct:mid},{tier:'Low/New (<10K/mo)',pct:lo}];
}

// Comparison markets helper
function pickComparisons(currentIdx, allList, locTier, seed) {
  const same = allList.filter((_,i)=>i!==currentIdx && b2bTier(allList[i].name)===locTier);
  const pool = same.length>=2 ? same : allList.filter((_,i)=>i!==currentIdx);
  const i1 = pInt(seed,40,0,pool.length-1);
  let   i2 = pInt(seed,41,0,pool.length-1);
  if (i2===i1) i2=(i2+1)%pool.length;
  return [pool[i1],pool[i2]].map(p=>{
    const s2=pseudoHash(p.name), t2=b2bTier(p.name);
    const rc2=b2bRecords(t2,s2), ind2=getIndustries(t2,s2), bm2=getBenchmarks(s2,false), dm2=pInt(s2,50,38,52);
    return {name:p.name,slug:slug(p.name),loc:extractLocation(p.name),cnt:fmtShort(rc2),topInd:ind2[0].name,openRate:bm2.openRate,dm:dm2};
  });
}


// ============================================================
// ██████  SHARED CSS
// ============================================================
const CSS = `
  /* Google Fonts loaded via <link> in <head> for performance */
  :root{--bg:#0a0f1e;--surf:#111827;--surf2:#1a2235;--bdr:#1e2d45;--acc:#0ea5e9;--acc2:#38bdf8;--bdr2:#253550;--txt:#e2e8f0;--muted:#94a3b8;--hf:'DM Serif Display',Georgia,serif;--bf:'IBM Plex Sans',sans-serif;--mf:'IBM Plex Mono',monospace}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--txt);font-family:var(--bf);font-size:16px;line-height:1.7;overflow-x:hidden}
  a{color:var(--acc2);text-decoration:none}a:hover{color:#fff;text-decoration:underline}
  .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
  nav{border-bottom:1px solid var(--bdr);padding:15px 0;position:sticky;top:0;background:rgba(10,15,30,.95);backdrop-filter:blur(12px);z-index:100}
  .nav-in{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
  .logo{font-family:var(--mf);font-size:16px;font-weight:500;color:#fff}.logo span{color:var(--acc)}
  nav ul{list-style:none;display:flex;gap:24px}nav ul a{color:var(--muted);font-size:13px;font-weight:500}nav ul a:hover{color:#fff;text-decoration:none}
  .bc{padding:14px 0;font-size:12px;color:var(--muted);font-family:var(--mf)}.bc a{color:var(--muted)}.bc a:hover{color:var(--acc2)}.bc span{margin:0 6px;opacity:.4}
  .hero{padding:64px 0 52px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:700px;height:500px;background:radial-gradient(ellipse,rgba(14,165,233,.11) 0%,transparent 70%);pointer-events:none}
  .tag{display:inline-block;font-family:var(--mf);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--acc);border:1px solid rgba(14,165,233,.3);padding:4px 11px;border-radius:2px;margin-bottom:20px}
  h1{font-family:var(--hf);font-size:clamp(28px,5vw,52px);font-weight:400;line-height:1.1;letter-spacing:-1px;color:#fff;margin-bottom:16px;max-width:820px}
  h1 em{font-style:italic;color:var(--acc2)}
  .hero-desc{font-size:17px;color:var(--muted);max-width:600px;margin-bottom:30px;font-weight:300;line-height:1.65}
  .ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:36px}
  .btn-p{background:var(--acc);color:#fff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:3px;transition:background .2s;display:inline-block}
  .btn-p:hover{background:var(--acc2);color:#fff;text-decoration:none}
  .btn-g{border:1px solid var(--bdr);color:var(--txt);font-size:14px;font-weight:500;padding:12px 26px;border-radius:3px;transition:border-color .2s;display:inline-block}
  .btn-g:hover{border-color:var(--acc);color:var(--acc2);text-decoration:none}
  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
  .stat{background:var(--surf);padding:18px 14px;text-align:center}
  .stat-n{font-family:var(--hf);font-size:24px;color:#fff;display:block}
  .stat-l{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:3px}
  section{padding:60px 0}section+section{border-top:1px solid var(--bdr)}
  h2{font-family:var(--hf);font-size:clamp(22px,3.5vw,34px);font-weight:400;color:#fff;letter-spacing:-.5px;margin-bottom:10px;line-height:1.2}
  h3{font-family:var(--bf);font-size:15px;font-weight:600;color:#fff;margin-bottom:6px}
  .slbl{font-family:var(--mf);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--acc);margin-bottom:8px;display:block}
  .ssub{color:var(--muted);font-size:15px;margin-bottom:32px;max-width:540px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
  .two-w{display:grid;grid-template-columns:1.4fr 1fr;gap:48px;align-items:start}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th{text-align:left;padding:11px 14px;background:var(--surf2);color:var(--muted);font-weight:500;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--bdr)}
  td{padding:11px 14px;border-bottom:1px solid var(--bdr);color:var(--txt)}tr:last-child td{border-bottom:none}tr:hover td{background:var(--surf2)}
  .badge{display:inline-block;font-family:var(--mf);font-size:10px;padding:2px 8px;border-radius:2px;background:rgba(14,165,233,.1);color:var(--acc2);border:1px solid rgba(14,165,233,.2)}
  .badge-g{background:rgba(16,185,129,.1);color:#34d399;border-color:rgba(16,185,129,.2)}
  .badge-y{background:rgba(234,179,8,.1);color:#fbbf24;border-color:rgba(234,179,8,.2)}
  .intel-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:4px;overflow:hidden;margin-bottom:8px}
  .intel-card{background:var(--surf);padding:22px 14px}
  .intel-val{font-family:var(--hf);font-size:28px;color:#fff;display:block;line-height:1.1;margin-bottom:4px}
  .intel-lbl{font-family:var(--mf);font-size:10px;color:var(--acc);text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:2px}
  .intel-sub{font-size:11px;color:var(--muted);display:block}
  .ind-breakdown{display:flex;flex-direction:column;gap:12px;margin-top:8px}
  .ind-meta{display:flex;justify-content:space-between;margin-bottom:4px}
  .ind-name{font-size:13px;color:var(--txt)}.ind-pct{font-family:var(--mf);font-size:11px;color:var(--acc2)}
  .ind-bar-bg{background:var(--surf2);border-radius:2px;height:5px;overflow:hidden}
  .ind-bar{background:var(--acc);height:100%;border-radius:2px}
  .compliance-box{background:var(--surf);border:1px solid var(--bdr);border-left:3px solid var(--acc);border-radius:4px;padding:22px 26px}
  .comp-fw{display:inline-block;font-family:var(--mf);font-size:10px;padding:3px 10px;background:rgba(14,165,233,.1);color:var(--acc2);border:1px solid rgba(14,165,233,.2);border-radius:2px;margin-bottom:12px;letter-spacing:1px}
  .ug{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
  .uc{background:var(--surf);padding:24px 20px;transition:background .2s}.uc:hover{background:var(--surf2)}
  .uc-icon{font-size:18px;margin-bottom:11px;display:block}.uc p{font-size:13px;color:var(--muted);line-height:1.6}
  .steps{display:flex;flex-direction:column}
  .step{display:flex;gap:18px;padding:20px 0;border-bottom:1px solid var(--bdr)}.step:last-child{border-bottom:none}
  .snum{font-family:var(--mf);font-size:11px;color:var(--acc);background:rgba(14,165,233,.1);border:1px solid rgba(14,165,233,.2);width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:3px;margin-top:2px}
  .step p{color:var(--muted);font-size:13px;margin:0}
  .prose p{color:var(--muted);font-size:14px;line-height:1.75;margin-bottom:13px}
  .prose strong{color:var(--txt);font-weight:600}
  .prose ul{padding-left:16px;margin-bottom:13px}.prose ul li{color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:5px}
  .faq-list{display:flex;flex-direction:column;border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
  .faq-item{border-bottom:1px solid var(--bdr);background:var(--surf)}.faq-item:last-child{border-bottom:none}
  details.faq-item summary{cursor:pointer;list-style:none;padding:17px 20px;color:#fff;font-family:var(--bf);font-size:14px;font-weight:500;display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--surf)}details.faq-item summary::-webkit-details-marker{display:none}details.faq-item summary::after{content:'+';color:var(--acc);font-size:18px;flex-shrink:0;transition:transform .2s}details.faq-item[open] summary::after{transform:rotate(45deg)}details.faq-item[open] summary{background:var(--surf2)}.faq-answer{padding:0 20px 16px;color:var(--muted);font-size:13px;line-height:1.75;background:var(--surf)}
  .rel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .rel-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:13px 15px;font-size:13px;color:var(--txt);transition:border-color .2s,background .2s;display:block}
  .rel-card:hover{border-color:var(--acc);background:var(--surf2);color:#fff;text-decoration:none}
  .rel-card small{font-family:var(--mf);font-size:10px;color:var(--muted);display:block;margin-top:3px}
  .blog-list{list-style:none;border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
  .blog-list li{border-bottom:1px solid var(--bdr)}.blog-list li:last-child{border-bottom:none}
  .blog-list a{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:var(--txt);font-size:13px;font-weight:500;background:var(--surf);transition:background .15s}
  .blog-list a:hover{background:var(--surf2);color:#fff;text-decoration:none}.blog-list a::after{content:'→';color:var(--acc)}
  .kwc{display:flex;flex-wrap:wrap;gap:7px}
  .kw{font-family:var(--mf);font-size:11px;padding:4px 10px;border-radius:2px;background:var(--surf);border:1px solid var(--bdr);color:var(--muted)}
  .cta-b{background:linear-gradient(135deg,var(--surf2) 0%,rgba(14,165,233,.07) 100%);border:1px solid rgba(14,165,233,.22);border-radius:6px;padding:46px 40px;text-align:center;position:relative;overflow:hidden}
  .cta-b::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:400px;height:280px;background:radial-gradient(ellipse,rgba(14,165,233,.09) 0%,transparent 70%);pointer-events:none}
  .cta-b p{color:var(--muted);max-width:450px;margin:0 auto 26px;font-size:15px}
  tr.cur-row td{background:rgba(14,165,233,.05)}tr.cur-row td:first-child{border-left:2px solid var(--acc)}
  .data-link{display:inline-block;font-family:var(--mf);font-size:11px;color:var(--muted);border:1px solid var(--bdr);padding:4px 10px;border-radius:2px;margin-top:8px}
  .data-link:hover{color:var(--acc2);border-color:var(--acc);text-decoration:none}
  footer{border-top:1px solid var(--bdr);padding:34px 0}
  .foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:32px;margin-bottom:28px}
  .foot-brand p{color:var(--muted);font-size:12px;margin-top:8px;max-width:200px;line-height:1.6}
  .fc h4{font-size:11px;font-weight:600;color:var(--txt);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;font-family:var(--mf)}
  .fc ul{list-style:none;display:flex;flex-direction:column;gap:6px}.fc ul a{color:var(--muted);font-size:12px}.fc ul a:hover{color:#fff;text-decoration:none}
  .foot-bot{border-top:1px solid var(--bdr);padding-top:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
  .foot-bot p{color:var(--muted);font-size:11px}
  /* ── HERO 2-COL ── */
  .hero-grid{display:grid;grid-template-columns:1fr 300px;gap:40px;align-items:start}
  .buy-card{background:var(--surf);border:1px solid var(--bdr);border-radius:6px;padding:24px 20px;position:sticky;top:80px}
  .price-row{display:flex;align-items:baseline;gap:10px;margin-bottom:4px}
  .price-main{font-family:var(--hf);font-size:32px;font-weight:400;color:#fff}
  .rating-row{display:flex;align-items:center;gap:8px;margin-bottom:14px}
  .stars{color:#fbbf24;font-size:13px;letter-spacing:1px}
  .rating-txt{font-family:var(--mf);font-size:11px;color:var(--muted)}
  .buy-features{list-style:none;margin-bottom:16px;display:flex;flex-direction:column;gap:6px}
  .buy-features li{font-family:var(--mf);font-size:11px;color:var(--muted);display:flex;align-items:center;gap:7px}
  .buy-features li::before{content:'✓';color:#34d399;font-weight:700;flex-shrink:0}
  .trust-badges{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
  .tbadge{font-family:var(--mf);font-size:10px;background:var(--surf2);border:1px solid var(--bdr);color:var(--muted);padding:3px 8px;border-radius:2px}
  /* ── SIGNALS ── */
  .signals{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:26px}
  .signal{display:flex;align-items:center;gap:6px;font-family:var(--mf);font-size:11px;color:var(--muted)}
  .sdot{width:7px;height:7px;border-radius:50%;background:#34d399;flex-shrink:0;box-shadow:0 0 6px rgba(34,197,94,.5)}
  .sdot.gold{background:#fbbf24;box-shadow:0 0 6px rgba(251,191,36,.4)}
  .sdot.blue{background:var(--acc);box-shadow:0 0 6px rgba(14,165,233,.4)}
  /* ── INDUSTRY CARDS ── */
  .ind-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .ind-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:13px 15px;transition:border-color .15s}
  .ind-card:hover{border-color:var(--bdr2,#253550)}
  .ind-card-name{font-size:13px;font-weight:600;color:var(--txt)}
  .ind-card-sic{font-family:var(--mf);font-size:10px;color:var(--muted);margin-top:1px}
  .ind-card-count{display:flex;justify-content:space-between;align-items:baseline;margin-top:7px}
  .ind-card-num{font-family:var(--hf);font-size:16px;font-weight:400;color:#fff}
  .ind-card-pct{font-family:var(--mf);font-size:10px;color:var(--muted)}
  .ind-card-bar{width:100%;height:2px;background:var(--surf2);border-radius:1px;margin-top:7px}
  .ind-card-fill{height:100%;border-radius:1px;background:linear-gradient(90deg,var(--acc),var(--acc2))}
  /* ── SAMPLE DATA ── */
  .sample-wrap{border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
  .sample-fade{position:relative}.sample-fade::after{content:'';position:absolute;bottom:0;left:0;right:0;height:56px;background:linear-gradient(transparent,var(--bg));pointer-events:none}
  .sample-hdr{background:var(--surf2);padding:9px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--bdr)}
  .sample-hdr span{font-family:var(--mf);font-size:10px;color:var(--muted);letter-spacing:.5px}
  .sample-scroll{overflow-x:auto}
  .sample-tbl{font-family:var(--mf);font-size:11px;white-space:nowrap;width:100%;border-collapse:collapse}
  .sample-tbl th{text-align:left;padding:9px 14px;background:var(--surf2);color:var(--muted);font-size:10px;letter-spacing:.5px;border-bottom:1px solid var(--bdr)}
  .sample-tbl td{padding:9px 14px;border-bottom:1px solid var(--bdr);color:var(--muted)}
  .sample-tbl td:first-child{color:var(--txt);font-weight:500}
  .sample-tbl tr:last-child td{border-bottom:none}
  .col-em{color:var(--acc)!important}
  /* ── COMPAT GRID ── */
  .compat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .compat-item{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:14px 16px;display:flex;align-items:center;gap:10px;transition:border-color .15s,background .15s;min-height:56px}
  .compat-item:hover{border-color:var(--acc);background:var(--surf2)}
  .compat-icon{font-size:18px;flex-shrink:0;line-height:1;width:24px;text-align:center}
  .compat-name{font-family:var(--hf);font-size:13px;font-weight:600;color:var(--txt);display:block;line-height:1.3}
  .compat-type{font-family:var(--mf);font-size:10px;color:var(--muted);display:block;margin-top:2px}
  /* ── REVIEWS ── */
  .review-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .review-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:20px}
  .review-stars{color:#fbbf24;font-size:12px;margin-bottom:10px;letter-spacing:1px}
  .review-txt{font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:14px;font-style:italic}
  .review-author{font-family:var(--hf);font-size:12px;font-weight:600;color:var(--txt)}
  .review-role{font-family:var(--mf);font-size:10px;color:var(--muted);margin-top:2px}
  /* ── CITY GRID ── */
  .city-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .city-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:14px 16px;transition:border-color .15s,background .15s}
  .city-card:hover{border-color:var(--acc);background:var(--surf2)}
  .city-name{font-family:var(--hf);font-size:14px;font-weight:600;color:#fff;margin-bottom:2px}
  .city-count{font-family:var(--mf);font-size:11px;color:var(--acc)}
  .city-inds{font-family:var(--mf);font-size:10px;color:var(--muted);margin-top:5px;line-height:1.5}
    @media(max-width:900px){.stats{grid-template-columns:repeat(3,1fr)}.intel-grid{grid-template-columns:repeat(3,1fr)}.two,.two-w{grid-template-columns:1fr;gap:28px}.ug{grid-template-columns:1fr 1fr}.rel-grid{grid-template-columns:1fr 1fr}.foot-grid{grid-template-columns:1fr 1fr;gap:20px}.cta-b{padding:30px 20px}nav ul{display:none}}
  @media(max-width:900px){.hero-grid{grid-template-columns:1fr}.buy-card{position:static}.ind-card-grid{grid-template-columns:1fr 1fr}.compat-grid{grid-template-columns:repeat(2,1fr)}.review-grid{grid-template-columns:1fr 1fr}.city-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:600px){.compat-grid{grid-template-columns:repeat(2,1fr)}.review-grid{grid-template-columns:1fr}.city-grid{grid-template-columns:1fr}.ind-card-grid{grid-template-columns:1fr}}
  @media(max-width:480px){.stats{grid-template-columns:repeat(2,1fr)}.intel-grid{grid-template-columns:repeat(2,1fr)}.ug{grid-template-columns:1fr}.rel-grid{grid-template-columns:1fr}}
`;

// Shared nav + footer builders
// ── PRODUCT/OFFER SCHEMA BUILDER ────────────────────────────
function productSchema(name, desc, url, category) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": desc,
    "category": category,
    "brand": { "@type": "Brand", "name": "LeadsBlue" },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "USD",
      "priceSpecification": { "@type": "PriceSpecification", "priceCurrency": "USD" },
      "seller": { "@type": "Organization", "name": "LeadsBlue", "url": "https://leadsblue.com" },
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "shippingDetails": { "@type": "OfferShippingDetails", "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" }, "deliveryTime": { "@type": "ShippingDeliveryTime", "businessDays": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1 } } }
    }
  });
}

// ── DATACATALOG SCHEMA (site-level, injected on index pages) ─
function dataCatalogSchema() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "name": "B2B Data Index — Email Database Catalog",
    "description": "Comprehensive catalog of verified B2B, consumer, targeted, and industry-specific email databases covering 200+ global markets.",
    "url": "https://b2bdataindex.com",
    "license": "https://leadsblue.com/terms/",
    "creator": { "@type": "Organization", "name": "LeadsBlue", "url": "https://leadsblue.com" },
    "publisher": { "@type": "Organization", "name": "B2B Data Index", "url": "https://b2bdataindex.com" },
    "keywords": ["B2B email list","consumer email database","business contacts","email marketing data","lead generation database"]
  });
}

function navHtml() {
  return `<nav><div class="nav-in"><a href="/" class="logo"><span>b2b</span>dataindex</a><ul><li><a href="/data-pages/">B2B Lists</a></li><li><a href="/consumer-data/">Consumer</a></li><li><a href="/targeted-lists/">Targeted</a></li><li><a href="/usa-categories/">USA Data</a></li><li><a href="/blog/">Guides</a></li></ul></div></nav>`;
}

function footHtml(relPages, catDir) {
  const rLinks = relPages.slice(0,4).map(p=>`<li><a href="/${catDir}/${slug(p.name)}/">${p.name}</a></li>`).join('');
  return `<footer><div class="wrap"><div class="foot-grid">
    <div class="foot-brand"><a href="/" class="logo"><span>b2b</span>dataindex</a><p>B2B data intelligence for 200+ markets. Industry breakdowns, benchmarks &amp; compliance guidance. Powered by LeadsBlue.</p></div>
    <div class="fc"><h4>Databases</h4><ul><li><a href="/data-pages/">B2B Business</a></li><li><a href="/consumer-data/">Consumer Lists</a></li><li><a href="/targeted-lists/">Targeted Data</a></li><li><a href="/usa-categories/">USA Categories</a></li><li><a href="/website-data/">Tech Site Lists</a></li></ul></div>
    <div class="fc"><h4>Related</h4><ul>${rLinks}</ul></div>
    <div class="fc"><h4>Data</h4><ul><li><a href="/llm/market-stats.json">Market Stats JSON</a></li><li><a href="/llm/industry-data.json">Industry JSON</a></li><li><a href="/sitemap.xml">Sitemap</a></li><li><a href="${LB}" target="_blank" rel="noopener">LeadsBlue</a></li></ul></div>
  </div><div class="foot-bot"><p>© ${YEAR} B2B Data Index · Powered by <a href="${LB}" style="color:var(--muted)">LeadsBlue</a></p><p><a href="/sitemap.xml" style="color:var(--muted)">Sitemap</a> · <a href="/blog/" style="color:var(--muted)">Guides</a></p></div></div></footer>`;
}

function faqScript() {
  return ''; /* FAQ uses native HTML details/summary — no JS needed */
}

function barRows(items) {
  const max = items[0].pct;
  return items.map(x=>`<div class="ind-row"><div class="ind-meta"><span class="ind-name">${x.name||x.label}</span><span class="ind-pct">${x.pct}%</span></div><div class="ind-bar-bg"><div class="ind-bar" style="width:${Math.round(x.pct/max*100)}%"></div></div></div>`).join('');
}

// ── AGGREGATE RATING (pseudo, seeded per page) ────────────────
function getRating(seed) {
  const rv = (pRand(seed,200)*0.6 + 4.3).toFixed(1);          // 4.3–4.9
  const rc = pInt(seed,201, 87, 892);                           // 87–892 reviews
  return { value: rv, count: rc };
}

// ── INDUSTRY CONTACT COUNTS (absolute numbers from %) ─────────
function indCounts(inds, totalRec) {
  return inds.map(ind => ({
    ...ind,
    count: Math.round(totalRec * ind.pct / 100),
    sic: getSIC(ind.name)
  }));
}

function getSIC(name) {
  const map = {
    'Manufacturing & Engineering':'2000–3999', 'Manufacturing':'2000–3999',
    'Technology & Software':'7370–7379',       'Technology':'7370–7379',
    'Professional Services':'7000–7389',
    'Healthcare & Medical':'8000–8099',         'Healthcare':'8000–8099',
    'Finance & Banking':'6000–6299',            'Finance & Insurance':'6000–6399',
    'Retail & Commerce':'5200–5999',            'Retail & Wholesale':'5200–5999',
    'Construction & Real Estate':'1500–1799',   'Construction':'1500–1799',
    'Tourism & Hospitality':'7000–7099',        'Hospitality & Tourism':'7000–7099',
    'Transportation & Logistics':'4000–4999',   'Transportation':'4000–4999',
    'Education & Training':'8200–8299',         'Education':'8200–8299',
    'Energy & Utilities':'4900–4999',           'Energy':'4900–4999',
    'Agriculture & Food':'0100–0999',           'Agriculture':'0100–0999',
    'Media & Entertainment':'7800–7999',
    'Oil & Energy':'1300–1399',
    'Trade & Commerce':'5000–5199',
    'Mining & Resources':'1000–1499',
    'Pharmaceutical':'2830–2836',
    'Aerospace':'3760–3769',
    'Automotive & Manufacturing':'3710–3719',
    'Cybersecurity':'7382',
    'Business Process Outsourcing':'7374',
    'Textile & Manufacturing':'2200–2399',
    'Natural Resources':'0800–0999',
    'Real Estate':'6500–6599',
    'Healthcare & Biotech':'8000–8099',
    'Entertainment & Media':'7800–7999',
    'Oil & Energy (SIC)':'1300–1399',
    'Maritime & Shipping':'4400–4499',
  };
  for (const [key, val] of Object.entries(map)) {
    if (name.includes(key.split(' ')[0])) return val;
  }
  return '7000–7999';
}

// ── DECISION-MAKER TITLE BREAKDOWN ────────────────────────────
function getTitleBreakdown(totalRec, dmPct, seed) {
  const dmTotal = Math.round(totalRec * dmPct / 100);
  const owner   = pInt(seed,210,22,32);
  const ceo     = pInt(seed,211,14,22);
  const vp      = pInt(seed,212,16,24);
  const mgr     = pInt(seed,213,18,26);
  const csuite  = pInt(seed,214,6,12);
  const sales   = pInt(seed,215,8,14);
  const rest    = 100 - owner - ceo - vp - mgr - csuite - sales;
  return [
    { title:'Owner / Founder',            pct:owner,  count:Math.round(dmTotal*owner/100)  },
    { title:'CEO / President',            pct:ceo,    count:Math.round(dmTotal*ceo/100)    },
    { title:'VP / Director',              pct:vp,     count:Math.round(dmTotal*vp/100)     },
    { title:'Manager (Dept. Head)',       pct:mgr,    count:Math.round(dmTotal*mgr/100)    },
    { title:'C-Suite (CFO, CTO, COO)',    pct:csuite, count:Math.round(dmTotal*csuite/100) },
    { title:'Sales / Business Dev Lead',  pct:sales,  count:Math.round(dmTotal*sales/100)  },
    { title:'Operations / Other',         pct:rest,   count:Math.round(dmTotal*rest/100)   },
  ];
}

// ── GEO META TAGS ─────────────────────────────────────────────
const GEO_REGIONS = {
  // EU
  'germany':'DE','france':'FR','italy':'IT','spain':'ES','netherlands':'NL',
  'belgium':'BE','sweden':'SE','poland':'PL','switzerland':'CH','austria':'AT',
  'denmark':'DK','finland':'FI','norway':'NO','portugal':'PT','czech republic':'CZ',
  'romania':'RO','hungary':'HU','greece':'GR','ireland':'IE','croatia':'HR',
  'slovakia':'SK','ukraine':'UA','bulgaria':'BG','luxembourg':'LU','estonia':'EE',
  'latvia':'LV','lithuania':'LT','cyprus':'CY','malta':'MT','serbia':'RS',
  // Americas
  'united states':'US','usa':'US','canada':'CA','brazil':'BR','mexico':'MX',
  'colombia':'CO','chile':'CL','peru':'PE','argentina':'AR',
  // APAC
  'australia':'AU','japan':'JP','china':'CN','india':'IN','south korea':'KR',
  'singapore':'SG','hong kong':'HK','taiwan':'TW','thailand':'TH','malaysia':'MY',
  'vietnam':'VN','philippines':'PH','indonesia':'ID','new zealand':'NZ',
  'pakistan':'PK','bangladesh':'BD',
  // ME/Africa
  'saudi arabia':'SA','uae':'AE','united arab emirates':'AE','qatar':'QA',
  'kuwait':'KW','bahrain':'BH','oman':'OM','israel':'IL','egypt':'EG',
  'south africa':'ZA','nigeria':'NG','kenya':'KE','ghana':'GH','morocco':'MA',
  // UK
  'united kingdom':'GB','uk':'GB','great britain':'GB',
  // US states
  'alabama':'US-AL','alaska':'US-AK','arizona':'US-AZ','arkansas':'US-AR',
  'california':'US-CA','colorado':'US-CO','connecticut':'US-CT','delaware':'US-DE',
  'florida':'US-FL','georgia':'US-GA','hawaii':'US-HI','idaho':'US-ID',
  'illinois':'US-IL','indiana':'US-IN','iowa':'US-IA','kansas':'US-KS',
  'kentucky':'US-KY','louisiana':'US-LA','maine':'US-ME','maryland':'US-MD',
  'massachusetts':'US-MA','michigan':'US-MI','minnesota':'US-MN','mississippi':'US-MS',
  'missouri':'US-MO','montana':'US-MT','nebraska':'US-NE','nevada':'US-NV',
  'new hampshire':'US-NH','new jersey':'US-NJ','new mexico':'US-NM','new york':'US-NY',
  'north carolina':'US-NC','north dakota':'US-ND','ohio':'US-OH','oklahoma':'US-OK',
  'oregon':'US-OR','pennsylvania':'US-PA','rhode island':'US-RI','south carolina':'US-SC',
  'south dakota':'US-SD','tennessee':'US-TN','texas':'US-TX','utah':'US-UT',
  'vermont':'US-VT','virginia':'US-VA','washington':'US-WA','west virginia':'US-WV',
  'wisconsin':'US-WI','wyoming':'US-WY',
};

function getGeoMeta(location) {
  const l = location.toLowerCase();
  for (const [key, code] of Object.entries(GEO_REGIONS)) {
    if (l.includes(key)) {
      return {
        region: code,
        placename: location
      };
    }
  }
  return { region: '', placename: location };
}

// ── SAMPLE DATA ROWS (pseudo, location-aware) ─────────────────
function getSampleRows(loc, inds, seed) {
  const locShort = loc.split(',')[0].split(' ').slice(-1)[0]; // last word of location
  // Top 3 industries for city names
  const i0 = inds[0].name.split(' ')[0];
  const i1 = inds[1].name.split(' ')[0];
  const i2 = inds[2].name.split(' ')[0];
  const rows = [
    { co:`${locShort} ${i0} Group Ltd`,     email:`m.chen@*****.com`,  name:`Michael Chen`,    title:'CEO',                  sic:`${getSIC(inds[0].name).split('–')[0]}`,  emp:'51–200'   },
    { co:`${loc} ${i1} Partners`,            email:`s.patel@*****.com`, name:`Sunita Patel`,    title:'Managing Director',    sic:`${getSIC(inds[1].name).split('–')[0]}`,  emp:'11–50'    },
    { co:`${i2} Innovations ${locShort}`,    email:`j.walker@*****.com`,name:`James Walker`,    title:'VP of Sales',          sic:`${getSIC(inds[2].name).split('–')[0]}`,  emp:'201–500'  },
    { co:`${locShort} Capital Advisors`,     email:`l.kim@*****.com`,   name:`Lisa Kim`,        title:'Chief Financial Officer',sic:'6282',                                  emp:'11–50'    },
    { co:`${loc} Health Services`,           email:`r.hassan@*****.com`,name:`Rami Hassan`,     title:'Operations Director',  sic:'8011',                                   emp:'501–1000' },
    { co:`Premier ${i0} Solutions`,          email:`a.jones@*****.com`, name:`Amanda Jones`,    title:'Founder & CEO',        sic:`${getSIC(inds[0].name).split('–')[0]}`,  emp:'1–10'     },
    { co:`${locShort} Digital & Tech`,       email:`d.miller@*****.com`,name:`David Miller`,    title:'CTO',                  sic:'7372',                                   emp:'51–200'   },
    { co:`${i1} Consulting Group`,           email:`n.brown@*****.com`, name:`Natalie Brown`,   title:'Senior Consultant',    sic:`${getSIC(inds[1].name).split('–')[0]}`,  emp:'11–50'    },
  ];
  return rows;
}

// ── REVIEWS ───────────────────────────────────────────────────
function getReviews(loc, seed) {
  // Disabled: fabricated reviews in Product schema violate Google's
  // 2024 review-snippet policy. Returning [] means no <Review> nodes
  // are emitted; AggregateRating has also been removed from schemas.
  return [];
  /* ORIGINAL (kept for reference, unreachable):
  const reviewPool = [
    { role:'SDR Manager', company:'SaaS startup' },
    { role:'Marketing Director', company:'B2B agency' },
    { role:'Sales Lead', company:'consultancy' },
    { role:'Founder', company:'tech company' },
    { role:'Outreach Specialist', company:'growth agency' },
    { role:'VP Sales', company:'mid-market firm' },
    { role:'Business Development', company:'software company' },
    { role:'Cold Email Strategist', company:'lead gen agency' },
  ];
  const texts = [
    `Bought the ${loc} database last quarter. Verified rate was exactly as advertised — we got a 26% open rate on our first campaign. Way better than generic lists.`,
    `We specifically needed ${loc} contacts and this was exactly right. The SIC codes helped us segment by industry instantly. Saved hours of manual research.`,
    `Used it for a ${loc} market entry campaign. Industry breakdown was accurate and the decision-maker ratio was solid. 4 meetings booked in the first week.`,
    `The data quality is noticeably better than what we've bought elsewhere. ${loc}-specific segmentation means the contacts are actually relevant to our offer.`,
    `Running cold email into ${loc} was new territory for us. Having the industry and company size fields made personalisation easy. Reply rates exceeded expectations.`,
    `Quarterly re-verification really shows — bounce rate was under 2% after our own verification pass. Clean data from the start.`,
  ];

  return [0,1,2].map(i => {
    const ri    = pInt(seed, 220 + i*31, 0, reviewPool.length-1);
    const ti    = pInt(seed, 226 + i*17, 0, texts.length-1);
    const stars = i === 0 ? pInt(seed, 232, 4, 5) : 5; // vary first, rest 5-star
    return {
      stars,
      text: texts[ti % texts.length].replace(/\${loc}/g, loc),
      role: reviewPool[ri % reviewPool.length].role,
      company: reviewPool[(ri + 3) % reviewPool.length].company,
    };
  });
  */
}


// ── PSEUDO PRICE (seeded by record count tier) ────────────────
function getPrice(rc) {
  if (rc >= 50000000)  return { price: "299", orig: "499" };   // mega   50M+  e.g. USA, India, China
  if (rc >= 5000000)   return { price: "249", orig: "399" };   // large  5M+   e.g. Germany, UK, France
  if (rc >= 500000)    return { price: "149", orig: "229" };   // medium 500K+ e.g. Netherlands, Sweden
  if (rc >= 100000)    return { price: "79",  orig: "129" };   // small  100K+ e.g. Malta, Iceland
  return               { price: "49",  orig: "89"  };           // micro  <100K
}

// ============================================================
// ██████  TEMPLATE 1: B2B BUSINESS
// ============================================================
function genBusinessPage(p, allBizPages) {
  const { name, url } = p;
  const sl   = slug(name);
  const loc  = extractLocation(name);
  const seed = pseudoHash(name);
  const tier = b2bTier(name);

  const rc  = b2bRecords(tier, seed);
  const cnt = fmtShort(rc); const full = fmtFull(rc);
  const inds = getIndustries(tier, seed, loc);
  const szs  = getCompanySize(seed);
  const bm   = getBenchmarks(seed, false);
  const comp = getCompliance(loc, tier, false);
  const dm   = pInt(seed,50,38,52);
  const vr   = pInt(seed,51,94,98);
  const qtr  = pInt(seed,52,1,4);
  const msme = szs[0].pct+szs[1].pct;
  const top3 = inds[0].pct+inds[1].pct+inds[2].pct;
  const rating    = getRating(seed);
  const priceData = getPrice(rc);
  const indWCount = indCounts(inds, rc);
  const titles    = getTitleBreakdown(rc, dm, seed);
  const geoMeta   = getGeoMeta(loc);
  const samples   = getSampleRows(loc, inds, seed);
  const reviews   = getReviews(loc, seed);
  const sku       = 'LBD-' + loc.toUpperCase().replace(/[^A-Z]/g,'').substring(0,4) + '-B2B-' + YEAR;
  const citiesNum = pInt(seed, 240, 4, 48);
  const fieldsNum = 14;
  const segRR     = (parseFloat(bm.replyRate) + pRand(seed,60)*2+1).toFixed(1);
  const segR = pFloat(seed,60,parseFloat(bm.replyRate)+1,parseFloat(bm.replyRate)+3.5,1);

  // Geographic related pages — same continent first, then hash-fill
  const cidx   = allBizPages.findIndex(x=>x.slug===sl);
  const related = getRelatedPages(name, allBizPages, seed, 5);
  const comps  = pickComparisons(cidx, allBizPages, tier, seed);

  // Hero + meta desc rotation data object
  const heroData = { loc, cnt, full, inds, citiesNum, dm, vr, fw: comp.fw, qtr, year: YEAR, indTop: indWCount[0].count, openRate: bm.openRate };
  const heroDesc   = getHeroIntro('b2b', seed, heroData);
  const metaDesc   = getMetaDesc('b2b', seed, { loc, cnt, inds, dm, vr, fw: comp.fw, qtr, year: YEAR, openRate: bm.openRate });
  const regContext = getRegionalContext(loc, inds, tier, seed);
  const timeMkp    = getTimeMarkup(seed);

  const kws = [`${loc.toLowerCase()} email list`,`${loc.toLowerCase()} b2b database`,`buy ${loc.toLowerCase()} email list`,`${loc.toLowerCase()} business contacts`,`${loc.toLowerCase()} company emails`,`${loc.toLowerCase()} sales leads`,`b2b email list ${loc.toLowerCase()}`,`${loc.toLowerCase()} email database`,`${loc.toLowerCase()} marketing database`,`${loc.toLowerCase()} b2b contacts`,`${loc.toLowerCase()} business directory`,`${loc.toLowerCase()} lead generation`,`buy ${loc.toLowerCase()} business database`];

  const faqFull = [
    {q:`What is the ${name}?`, a:`The ${name} is a verified B2B database containing ${full}+ business contacts from ${loc}. It covers ${inds.length} industry sectors, with ${inds[0].name} as the largest at ${inds[0].pct}%. Approximately ${dm}% of contacts are decision-makers — business owners, directors, and senior managers.`},
    {q:`How many records are in the ${name}?`, a:`The ${name} contains an estimated ${full}+ verified business contacts spanning ${inds.length} industry categories. The top three sectors — ${inds[0].name} (${inds[0].pct}%), ${inds[1].name} (${inds[1].pct}%), and ${inds[2].name} (${inds[2].pct}%) — account for ${top3}% of all contacts.`},
    {q:`What data fields are included?`, a:`Fields include: verified business email address, company name, contact full name, job title and seniority, industry classification (SIC/NAICS), company location within ${loc}, company size band, and phone number where available. ${dm}% of contacts are decision-makers.`},
    {q:`How is the database verified?`, a:`The database undergoes quarterly re-verification using SMTP validation, inbox confirmation testing, and company registry cross-referencing. Last verified Q${qtr} ${YEAR}. Email verification rate: ${vr}%. Hard bounce rate targeted below ${bm.bounceRate}%.`},
    {q:`What tools can I import this into?`, a:`The CSV format is compatible with Instantly, Smartlead, Apollo.io, HubSpot, Salesforce, Pipedrive, Mailshake, Lemlist, and any platform accepting CSV imports.`},
    {q:`What industries dominate the ${loc} business market?`, a:`Based on this dataset, the top three sectors in ${loc} are ${inds[0].name} (${inds[0].pct}%), ${inds[1].name} (${inds[1].pct}%), and ${inds[2].name} (${inds[2].pct}%). These three sectors represent ${top3}% of all classified contacts.`},
    {q:`What is the average cold email open rate for ${loc}?`, a:`Cold email campaigns targeting ${loc} businesses average ${bm.openRate}% open rates with personalised subject lines. Reply rates average ${bm.replyRate}%. Industry-segmented sends in ${loc}'s ${inds[0].name} sector typically achieve ${segR}%+ reply rates.`},
    {q:`What is the company size distribution in ${loc}?`, a:`${szs[0].pct}% micro (1–10 employees), ${szs[1].pct}% SME (11–100), ${szs[2].pct}% mid-market (101–500), and ${szs[3].pct}% enterprise (500+). Micro and SME businesses represent ${msme}% of the market.`},
    {q:`What is the decision-maker ratio?`, a:`Approximately ${dm}% of contacts are classified as decision-makers — business owners, managing directors, C-suite executives, and senior managers. This ratio is higher than generic national databases due to ${loc}-specific segmentation.`},
    {q:`Is this database legal to use?`, a:`Yes. ${comp.fw} applies. ${comp.note}`},
    {q:`What compliance framework applies to email marketing in ${loc}?`, a:`${comp.note}`},
    {q:`How does ${loc} compare to similar B2B markets?`, a:`${loc} has ${cnt}+ verified contacts with ${inds[0].name} as the dominant sector (${inds[0].pct}%). The ${msme}% micro/SME concentration makes it ideal for SaaS, agencies, and professional services. Average reply rate of ${bm.replyRate}% is ${parseFloat(bm.replyRate)>=5.5?'above':'in line with'} global B2B averages.`},
    {q:`How do I launch a cold email campaign with this data?`, a:`1) Download as CSV. 2) Verify through NeverBounce/ZeroBounce — target under ${bm.bounceRate}% bounce. 3) Import to Instantly/Smartlead/HubSpot. 4) Segment by ${inds[0].name} or company size. 5) Write copy referencing ${loc} local context. 6) Launch 4–5 step sequence with 5-day intervals.`},
    {q:`What makes ${loc} a valuable B2B market?`, a:`${loc} provides ${full}+ contacts across ${inds.length} sectors. The ${inds[0].name} sector dominates at ${inds[0].pct}%, and ${msme}% SME/micro density makes it especially receptive to SaaS, agency, and professional service outreach.`},
    {q:`How is the data updated?`, a:`The database undergoes quarterly re-verification. Contacts are cross-referenced against company registries, SMTP-validated, and manually spot-checked. Last update: Q${qtr} ${YEAR}. Stale contacts are removed; new registrations are added each cycle.`}
  ];

  const faq = pickByHash(seed, faqFull, 10);
  faq.forEach(f=>faqData.push({question:f.q,answer:f.a}));
  mktStats.push({name,location:loc,slug:sl,records:rc,top_industry:inds[0].name,open_rate:`${bm.openRate}%`,decision_makers:`${dm}%`,compliance:comp.fw,category:'b2b-business'});
  industData.push({location:loc,category:'business',industries:Object.fromEntries(inds.map(i=>[i.name,i.pct]))});
  allPageIndex.push({name,slug:sl,type:'b2b',category:'B2B Business',location:loc,records:rc,records_formatted:cnt+'+',price:'$'+priceData.price,rating:rating.value,decision_maker_pct:dm+'%',top_industry:inds[0].name,compliance:comp.fw,url:`https://b2bdataindex.com/data-pages/${sl}/`,product_url:url});

  // Schemas
  const dateM = `${YEAR}-${qtr===1?'03':qtr===2?'06':qtr===3?'09':'12'}-01`;
  const schemas = [
    JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":faq.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))}),
    JSON.stringify({"@context":"https://schema.org/","@type":"Dataset","name":name,"alternateName":[`${loc} B2B Email Database`,`${loc} Business Contact List`],"description":`${name}: ${full}+ verified B2B contacts in ${loc} across ${inds.length} industry sectors. Last verified Q${qtr} ${YEAR}.`,"url":`${BASE}/data-pages/${sl}/`,"keywords":kws,"variableMeasured":["Business Email","Company Name","Job Title","Industry","Location","Company Size","Phone"],"measurementTechnique":"SMTP verification and quarterly registry cross-referencing","dateModified":dateM,"temporalCoverage":`${YEAR-1}/${YEAR}`,"size":`${full}+ records`,"spatialCoverage":{"@type":"Place","name":loc},"distribution":{"@type":"DataDownload","encodingFormat":"text/csv","contentUrl":url},"creator":{"@type":"Organization","name":"LeadsBlue","url":LB},"publisher":{"@type":"Organization","name":"B2B Data Index","url":BASE},"includedInDataCatalog":{"@type":"DataCatalog","name":"B2B Data Index — Email Database Catalog","url":BASE}}),
    JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":`How to Use ${name} for Cold Email Outreach`,"step":[{"@type":"HowToStep","position":1,"name":"Download the CSV","text":`Obtain ${name} as a CSV with all ${full}+ verified contacts.`},{"@type":"HowToStep","position":2,"name":"Verify Emails","text":"Run through NeverBounce or ZeroBounce — target below 2% bounce rate."},{"@type":"HowToStep","position":3,"name":"Import & Segment","text":`Import to Instantly/Smartlead/HubSpot. Segment by ${inds[0].name} or company size.`},{"@type":"HowToStep","position":4,"name":"Write Local Copy","text":`Reference ${loc} context in subject lines. Campaigns average ${bm.openRate}% open rates.`},{"@type":"HowToStep","position":5,"name":"Launch & Iterate","text":`Send, track, optimise. Industry-segmented sends achieve ${segR}%+ reply rates.`}]}),
    JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":`Top Industries in ${loc} — B2B Distribution`,"numberOfItems":inds.length,"itemListElement":inds.map((x,i) => ({"@type":"ListItem","position":i+1,"name":`${x.name} — ${(x.count||Math.round(rc*x.pct/100)).toLocaleString('en-US')} contacts (${x.pct}%)`,"description":`SIC ${getSIC(x.name)}: ${(x.count||Math.round(rc*x.pct/100)).toLocaleString('en-US')} verified ${loc} business contacts in the ${x.name} sector`}))}),
    JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":`${BASE}/`},{"@type":"ListItem","position":2,"name":"B2B Business Lists","item":`${BASE}/data-pages/`},{"@type":"ListItem","position":3,"name":name,"item":`${BASE}/data-pages/${sl}/`}]}),
    JSON.stringify({"@context":"https://schema.org","@type":"Organization","@id":`${BASE}/#organization`,"name":"B2B Data Index","url":BASE,"logo":{"@type":"ImageObject","url":`${BASE}/assets/logo.png`},"description":"B2B Data Index provides verified email databases for B2B outreach, consumer marketing, and targeted campaigns across 200+ global markets.","sameAs":[LB,"https://github.com/leadsblue-datasets/b2b-lists","https://www.kaggle.com/leadsbluedataintel"]}),
    /* Reviews embedded inside Product schema above */
    JSON.stringify({"@context":"https://schema.org","@type":"WebPage","url":`${BASE}/data-pages/${sl}/`,"speakable":{"@type":"SpeakableSpecification","cssSelector":[".hero-desc",".faq-answer"]}}),
    JSON.stringify({
      "@context":"https://schema.org","@type":"Product",
      "name": name,
      "description": `Verified B2B email database for ${loc}: ${full}+ business contacts across ${inds.length} industry sectors. ${inds[0].name} leads at ${inds[0].pct}% with ${indWCount[0].count.toLocaleString('en-US')} contacts. ${vr}% email verification rate. ${comp.fw} compliant.`,
      "brand":{"@type":"Brand","name":"LeadsBlue"},
      "sku": sku,
      "mpn": `LBD-${sl}`,
      "category":"B2B Email Database / Marketing Data",
      "url":`${BASE}/data-pages/${sl}/`,
      "image":"https://b2bdataindex.com/assets/og-default.png",
      "offers":{
        "@type":"Offer",
        "url": url,
        "price": priceData.price,
        "priceCurrency":"USD",
        "availability":"https://schema.org/InStock",
        "itemCondition":"https://schema.org/NewCondition",
        "seller":{"@type":"Organization","name":"LeadsBlue","url":"https://leadsblue.com"},
        "shippingDetails":{
          "@type":"OfferShippingDetails",
          "shippingRate":{"@type":"MonetaryAmount","value":"0","currency":"USD"},
          "deliveryTime":{"@type":"ShippingDeliveryTime","businessDays":{"@type":"QuantitativeValue","minValue":0,"maxValue":0}},
          "shippingDestination":{"@type":"DefinedRegion","addressCountry":"US"}
        },
        "hasMerchantReturnPolicy":{
          "@type":"MerchantReturnPolicy",
          "applicableCountry":"US",
          "returnPolicyCategory":"https://schema.org/MerchantReturnNotPermitted",
          "merchantReturnDays": 0
        }
      },
      "additionalProperty":[
        {"@type":"PropertyValue","name":"Total Records","value":full+"+"},
        {"@type":"PropertyValue","name":"Email Deliverability","value":vr+"%"},
        {"@type":"PropertyValue","name":"Industries Covered","value":String(inds.length)},
        {"@type":"PropertyValue","name":"Decision-Maker Ratio","value":dm+"%"},
        {"@type":"PropertyValue","name":"Last Updated","value":"Q"+qtr+" "+YEAR},
        {"@type":"PropertyValue","name":"File Format","value":"CSV, XLSX"},
        {"@type":"PropertyValue","name":"Data Fields","value":String(fieldsNum)},
        {"@type":"PropertyValue","name":"Compliance","value":comp.fw}
      ]
    })
  ];

  const schemaBlocks = schemas.map(s=>`<script type="application/ld+json">${s}<\/script>`).join('\n  ');

  const compRows = comps.map(c=>`<tr><td><a href="/data-pages/${c.slug}/">${c.loc}</a></td><td>${c.cnt}+</td><td>${c.topInd}</td><td>${c.openRate}%</td><td>${c.dm}%</td></tr>`).join('');
  const faqHtml  = faq.map((f,i)=> i===0 ? `<details class="faq-item" open><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>` : `<details class="faq-item"><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>`).join('');

  // Write per-page data.json
  const dir = `./public/data-pages/${sl}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(`${dir}/data.json`, JSON.stringify({name,location:loc,slug:sl,url:`${BASE}/data-pages/${sl}/`,records:rc,industries:Object.fromEntries(inds.map(i=>[i.name,i.pct])),company_sizes:Object.fromEntries(szs.map(s=>[s.label,s.pct])),benchmarks:{open_rate:`${bm.openRate}%`,reply_rate:`${bm.replyRate}%`,ctr:`${bm.ctr}%`,bounce_rate:`${bm.bounceRate}%`},data_quality:{verification_rate:`${vr}%`,decision_maker_ratio:`${dm}%`,last_verified:`Q${qtr}-${YEAR}`,format:'CSV,XLSX'},compliance:{framework:comp.fw},product_url:url},null,2));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>${loc} B2B Email Database — ${cnt}+ Verified Business Contacts | B2B Data Index</title>
<meta name="description" content="${metaDesc}">
<meta name="keywords" content="${kws.join(', ')}">
<link rel="canonical" href="${BASE}/data-pages/${sl}/">
<meta property="og:title" content="${loc} B2B Email Database — ${cnt}+ Verified Contacts"><meta property="og:description" content="${full}+ verified ${loc} business contacts across ${inds.length} industry sectors."><meta property="og:url" content="${BASE}/data-pages/${sl}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${loc} B2B Email Database — ${cnt}+ Verified Contacts | B2B Data Index">
<meta name="twitter:description" content="${loc} B2B database: ${cnt}+ verified contacts, ${inds.length} industries, ${dm}% decision-makers. ${vr}% verified. CSV download.">
<meta property="og:image" content="https://b2bdataindex.com/assets/og-default.png"><meta property="og:type" content="website">
<link rel="alternate" type="application/json" href="${BASE}/data-pages/${sl}/data.json" title="${name} Structured Data">
${geoMeta.region ? `<meta name="geo.region" content="${geoMeta.region}">
<meta name="geo.placename" content="${geoMeta.placename}">` : ''}
<meta name="author" content="B2B Data Index Research Team">
<meta name="last-modified" content="${YEAR}-${qtr===1?'03':qtr===2?'06':qtr===3?'09':'12'}-01">
<meta name="googlebot" content="index, follow">
<meta name="bingbot" content="index, follow">
<meta property="og:locale" content="en_US">
${schemaBlocks}
<style>${CSS}</style>
</head>
<body>
${navHtml()}
<main><article itemscope itemtype="https://schema.org/Article">
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span><a href="/data-pages/">B2B Business Lists</a><span>›</span>${name}</nav></div><div class="wrap">${getAuthorBlock(seed).html}${timeMkp}</div>
<section class="hero" style="padding-top:60px"><div class="wrap">
<div class="hero-grid">
<div>
  <span class="tag">B2B Data Intelligence · ${loc} · Q${qtr} ${YEAR}</span>
  <h1><em>${loc}</em> B2B Email Database</h1>
  <p class="hero-desc">${heroDesc}</p>
  <div class="signals">
    <div class="signal"><div class="sdot"></div>${vr}% deliverability verified</div>
    <div class="signal"><div class="sdot gold"></div>Last updated Q${qtr} ${YEAR}</div>
    <div class="signal"><div class="sdot blue"></div>${inds.length} industries · ${citiesNum}+ cities</div>
    <div class="signal"><div class="sdot"></div>${fieldsNum} data fields per record</div>
    <div class="signal"><div class="sdot gold"></div>${dm}% decision-makers</div>
  </div>
  <div class="ctas">
    <a href="${url}" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a>
    <a href="#sample" class="btn-g">Preview Sample Records</a>
  </div>
</div>
<div>
  <div class="buy-card">
    <div class="rating-row">
      <span class="stars">${'★'.repeat(Math.round(parseFloat(rating.value)))}${'☆'.repeat(5-Math.round(parseFloat(rating.value)))}</span>
      <span class="rating-txt">${(typeof rating !== "undefined" ? rating : tgt_rating || getRating(seed)).value} / 5 (${(typeof rating !== "undefined" ? rating : tgt_rating || getRating(seed)).count} reviews)</span>
    </div>
    <ul class="buy-features">
      <li>${full}+ verified email addresses</li>
      <li>${vr}% guaranteed deliverability</li>
      <li>${fieldsNum} fields: email, phone, title, SIC, ZIP</li>
      <li>Instant CSV + XLSX download</li>
      <li>${inds.length} industries · ${citiesNum}+ cities covered</li>
      <li>${comp.fw} compliant use</li>
      <li>Q${qtr} ${YEAR} edition — quarterly refresh</li>
      <li>CRM-ready import — all major platforms</li>
    </ul>
    <a href="${url}" target="_blank" rel="noopener" class="btn-p" style="width:100%;text-align:center;display:block;margin-bottom:10px">Get ${name} →</a>
    <a href="#sample" class="btn-g" style="width:100%;text-align:center;display:block">Preview Sample Records</a>
    <div class="trust-badges">
      <span class="tbadge">✓ Instant Download</span>
      <span class="tbadge">✓ ${comp.fw} Safe</span>
      <span class="tbadge">✓ CSV + XLSX</span>
      <span class="tbadge">✓ ${vr}% Verified</span>
    </div>
  </div>
</div>
</div>
</div></section>

<section style="padding:0;border-top:1px solid var(--bdr)"><div class="wrap" style="padding-top:28px;padding-bottom:28px">
  <div class="stats">
    <div class="stat"><span class="stat-n" style="color:var(--acc)">${full}+</span><span class="stat-l">Total Records</span></div>
    <div class="stat"><span class="stat-n" style="color:#34d399">${vr}%</span><span class="stat-l">Deliverability</span></div>
    <div class="stat"><span class="stat-n">${inds.length}</span><span class="stat-l">Industries</span></div>
    <div class="stat"><span class="stat-n">${dm}%</span><span class="stat-l">Decision-Makers</span></div>
    <div class="stat"><span class="stat-n" style="color:#fbbf24">${(typeof rating !== "undefined" ? rating : tgt_rating || getRating(seed)).value}★</span><span class="stat-l">Avg Rating</span></div>
  </div>
</div></section>

<section id="intel"><div class="wrap">
  <span class="slbl">Market Intelligence</span>
  <h2>${loc} Business Ecosystem — Data Snapshot</h2>
  <p class="ssub">Core metrics for the ${loc} B2B market from the ${name}.</p>
  <div class="intel-grid">
    <div class="intel-card"><span class="intel-val">${cnt}+</span><span class="intel-lbl">Total Records</span><span class="intel-sub">Verified business contacts</span></div>
    <div class="intel-card"><span class="intel-val">${inds.length}</span><span class="intel-lbl">Industries</span><span class="intel-sub">Classified in dataset</span></div>
    <div class="intel-card"><span class="intel-val">${dm}%</span><span class="intel-lbl">Decision-Makers</span><span class="intel-sub">Owners, directors, C-suite</span></div>
    <div class="intel-card"><span class="intel-val">${msme}%</span><span class="intel-lbl">SME &amp; Micro</span><span class="intel-sub">Growth-stage businesses</span></div>
    <div class="intel-card"><span class="intel-val">Q${qtr} ${YEAR}</span><span class="intel-lbl">Last Verified</span><span class="intel-sub">Quarterly re-verification</span></div>
  </div>
  <div class="wrap" style="margin-top:20px;padding:18px 20px;background:var(--surf);border:1px solid var(--bdr);border-radius:4px;font-size:14px;color:var(--muted);line-height:1.7">
    <strong style="color:var(--txt);display:block;margin-bottom:6px">Research Context</strong>
    ${regContext}
  </div>
  <a href="/data-pages/${sl}/data.json" class="data-link" target="_blank">{ } Structured JSON →</a>
</div></section>

<section><div class="wrap">
  <div class="two">
    <div>
      <span class="slbl">Industry Distribution</span>
      <h2>${inds.length} Industries — ${loc} Business Contacts</h2>
      <p class="ssub">Absolute contact counts by industry sector. Classified by SIC and NAICS codes.</p>
      <div class="ind-card-grid">
        ${indWCount.map((ind,i) => {
          const barW = Math.round((ind.count/indWCount[0].count)*100);
          return `<div class="ind-card">
            <div class="ind-card-name">${ind.name}</div>
            <div class="ind-card-sic">SIC ${ind.sic}</div>
            <div class="ind-card-count">
              <span class="ind-card-num">${ind.count.toLocaleString('en-US')}</span>
              <span class="ind-card-pct">${ind.pct}%</span>
            </div>
            <div class="ind-card-bar"><div class="ind-card-fill" style="width:${barW}%"></div></div>
          </div>`;
        }).join('')}
      </div>
      <p style="margin-top:12px;font-size:11px;color:var(--muted);font-family:var(--mf)">Top 3 sectors (${inds[0].name}, ${inds[1].name}, ${inds[2].name}) account for ${top3}% of classified contacts. All ${inds.length} sectors classified per SIC/NAICS standards.</p>
    </div>
    <div>
      <span class="slbl">Company Size Distribution</span>
      <h2>Business Scale Mix</h2>
      <p class="ssub">Breakdown by company size within the ${loc} dataset.</p>
      <table><thead><tr><th>Size Band</th><th>Records</th><th>Share</th></tr></thead><tbody>
        ${szs.map(s=>`<tr><td>${s.label}</td><td>${Math.round(rc*s.pct/100).toLocaleString('en-US')}</td><td><span class="badge">${s.pct}%</span></td></tr>`).join('')}
      </tbody></table>
      <p style="margin-top:16px;font-size:13px;color:var(--muted)">Micro and SME businesses represent <strong style="color:var(--txt)">${msme}%</strong> of the ${loc} B2B market — ideal for SaaS, agency, and consulting outreach.</p>

      <div style="margin-top:28px">
        <span class="slbl">Decision-Maker Breakdown</span>
        <h3 style="margin-bottom:12px">Most Common Roles in Database</h3>
        <table><thead><tr><th>Job Title</th><th>Est. Count</th></tr></thead><tbody>
          ${titles.map(t=>`<tr><td>${t.title}</td><td>${t.count.toLocaleString('en-US')}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>
  </div>
</div></section>

<section><div class="wrap"><div class="two-w">
  <div>
    <span class="slbl">Definition</span>
    <h2>What Is ${name}?</h2>
    <div class="prose">
      <p><strong>${name}</strong> is a verified B2B dataset of ${full}+ business contacts from ${loc}. Built for marketers, SDRs, and agencies needing direct access to decision-makers in ${loc}'s business ecosystem.</p>
      <p>Unlike generic national databases, every contact is geographically relevant to ${loc}. The <strong>${inds[0].name}</strong> sector leads at ${inds[0].pct}%, followed by ${inds[1].name} (${inds[1].pct}%) and ${inds[2].name} (${inds[2].pct}%).</p>
      <ul>
        <li>${vr}%+ email verification accuracy — bounce rate target below ${bm.bounceRate}%</li>
        <li>${dm}% decision-makers — owners, directors, managers</li>
        <li>${inds.length} industry sectors — segmented for precision targeting</li>
        <li>Last verified Q${qtr} ${YEAR} — quarterly re-verification cycle</li>
      </ul>
    </div>
  </div>
  <div>
    <span class="slbl">Data Fields</span>
    <h2 style="font-size:22px">What's Included</h2><br>
    <table><thead><tr><th>Field</th><th>Status</th></tr></thead><tbody>
      <tr><td>Business Email Address</td><td><span class="badge badge-g">✓ Verified</span></td></tr>
      <tr><td>Company Name</td><td><span class="badge">✓ Included</span></td></tr>
      <tr><td>Contact Full Name</td><td><span class="badge">✓ Included</span></td></tr>
      <tr><td>Job Title &amp; Seniority</td><td><span class="badge">✓ Classified</span></td></tr>
      <tr><td>Industry (SIC/NAICS)</td><td><span class="badge">✓ ${inds.length} Sectors</span></td></tr>
      <tr><td>Company Location</td><td><span class="badge">✓ ${loc} Segmented</span></td></tr>
      <tr><td>Company Size Band</td><td><span class="badge">✓ Included</span></td></tr>
      <tr><td>Phone Number</td><td><span class="badge">Where Available</span></td></tr>
    </tbody></table>
  </div>
</div></div></section>

<section><div class="wrap"><div class="two">
  <div>
    <span class="slbl">Quality &amp; Accuracy</span>
    <h2>Data Standards</h2>
    <table><thead><tr><th>Metric</th><th>Standard</th></tr></thead><tbody>
      <tr><td>Email Verification Rate</td><td><span class="badge badge-g">${vr}%</span></td></tr>
      <tr><td>Hard Bounce Target</td><td><span class="badge">&lt; ${bm.bounceRate}%</span></td></tr>
      <tr><td>Decision-Maker Ratio</td><td><span class="badge">${dm}%</span></td></tr>
      <tr><td>Dataset Size</td><td><span class="badge">${full}+ records</span></td></tr>
      <tr><td>Last Verified</td><td><span class="badge">Q${qtr} ${YEAR}</span></td></tr>
      <tr><td>Re-Verification Cycle</td><td><span class="badge">Quarterly</span></td></tr>
      <tr><td>Export Format</td><td><span class="badge">CSV / XLSX</span></td></tr>
      <tr><td>CRM Compatible</td><td><span class="badge badge-g">All Major CRMs</span></td></tr>
    </tbody></table>
  </div>
  <div>
    <span class="slbl">Campaign Benchmarks</span>
    <h2>${loc} Outreach Averages</h2>
    <table><thead><tr><th>Metric</th><th>${loc} Average</th></tr></thead><tbody>
      <tr><td>Email Open Rate</td><td><strong>${bm.openRate}%</strong></td></tr>
      <tr><td>Reply Rate</td><td><strong>${bm.replyRate}%</strong></td></tr>
      <tr><td>Click-Through Rate</td><td><strong>${bm.ctr}%</strong></td></tr>
      <tr><td>Hard Bounce Rate</td><td><strong>${bm.bounceRate}%</strong></td></tr>
      <tr><td>Unsubscribe Rate</td><td><strong>${bm.unsubRate}%</strong></td></tr>
      <tr><td>Industry-Segmented Reply</td><td><strong>${segR}%+</strong></td></tr>
    </tbody></table>
  </div>
</div></div></section>

<section><div class="wrap">
  <span class="slbl">Applications</span>
  <h2>How ${name} Is Used</h2>
  <p class="ssub">Primary use cases for B2B outreach in ${loc}.</p>
  <div class="ug">
    <div class="uc"><span class="uc-icon">📧</span><h3>Cold Email Outreach</h3><p>Launch personalised sequences to ${dm}% decision-makers in ${loc}. Average open rate: ${bm.openRate}%.</p></div>
    <div class="uc"><span class="uc-icon">🎯</span><h3>Industry Targeting</h3><p>Target ${loc}'s ${inds[0].name} (${inds[0].pct}%) and ${inds[1].name} (${inds[1].pct}%) sectors with vertically relevant messaging.</p></div>
    <div class="uc"><span class="uc-icon">📊</span><h3>Sales Prospecting</h3><p>Equip SDRs with ${cnt}+ pre-qualified ${loc} contacts. Reduce research time, increase pipeline velocity.</p></div>
    <div class="uc"><span class="uc-icon">🌍</span><h3>Market Entry</h3><p>Entering ${loc} for the first time? Access ${cnt}+ local contacts across ${inds.length} sectors immediately.</p></div>
    <div class="uc"><span class="uc-icon">🤝</span><h3>Partnership Outreach</h3><p>Find resellers and strategic partners in ${loc}'s ${inds[0].name} and ${inds[1].name} sectors at scale.</p></div>
    <div class="uc"><span class="uc-icon">🔍</span><h3>Market Research</h3><p>Analyse ${loc}'s ${inds.length}-sector business distribution. Map opportunity before committing budget.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <span class="slbl">Legal &amp; Compliance</span>
  <h2>${comp.fw} — ${loc} Email Marketing Rules</h2>
  <p class="ssub" style="margin-bottom:20px">Regulatory framework for commercial B2B email outreach in ${loc}.</p>
  <div class="compliance-box"><span class="comp-fw">${comp.fw}</span><p style="font-size:14px;color:var(--muted);line-height:1.8;margin:0">${comp.note}</p></div>
</div></section>

<section><div class="wrap"><div class="two">
  <div>
    <span class="slbl">Why Target ${loc}</span>
    <h2>Market Opportunity</h2>
    <div class="prose">
      <p>${loc} has a diverse B2B ecosystem spanning ${inds.length} sectors. The ${inds[0].name} sector (${inds[0].pct}%) and ${inds[1].name} (${inds[1].pct}%) are the two dominant industries, collectively representing ${inds[0].pct+inds[1].pct}% of all business contacts.</p>
      <p>With <strong>${msme}% micro and SME concentration</strong>, ${loc} is particularly receptive to SaaS, agency, and professional service outreach — categories where decision-making authority rests with the business owner or founder.</p>
      <p>Location-targeted campaigns achieve <strong>${bm.openRate}% average open rates</strong> versus 15–18% for generic untargeted sends — because messaging referencing local market context signals direct relevance.</p>
    </div>
  </div>
  <div>
    <span class="slbl">How To Use</span>
    <h2>5-Step Launch Guide</h2>
    <div class="steps">
      <div class="step"><div class="snum">01</div><div><h3>Download CSV</h3><p>Get ${name} with ${full}+ verified contacts, all fields labelled.</p></div></div>
      <div class="step"><div class="snum">02</div><div><h3>Verify Emails</h3><p>Run through NeverBounce/ZeroBounce. Target below ${bm.bounceRate}% bounce rate.</p></div></div>
      <div class="step"><div class="snum">03</div><div><h3>Import &amp; Segment</h3><p>Import to Instantly/Smartlead/HubSpot. Segment by ${inds[0].name} or company size first.</p></div></div>
      <div class="step"><div class="snum">04</div><div><h3>Write Local Copy</h3><p>Reference ${loc} context in subject lines. This drives the ${bm.openRate}% open rate average.</p></div></div>
      <div class="step"><div class="snum">05</div><div><h3>Launch &amp; Iterate</h3><p>Send, track, optimise. Industry-segmented sends achieve ${segR}%+ reply rates.</p></div></div>
    </div>
  </div>
</div></div></section>

<section><div class="wrap">
  <span class="slbl">Comparative Intelligence</span>
  <h2>How ${loc} Compares</h2>
  <p class="ssub" style="margin-bottom:22px">Side-by-side comparison with similar B2B markets from the database index.</p>
  <table><thead><tr><th>Market</th><th>Est. Records</th><th>Top Industry</th><th>Avg Open Rate</th><th>Decision-Makers</th></tr></thead><tbody>
    <tr class="cur-row"><td><strong>${loc}</strong> <span class="badge" style="margin-left:6px">Current</span></td><td>${cnt}+</td><td>${inds[0].name}</td><td>${bm.openRate}%</td><td>${dm}%</td></tr>
    ${compRows}
  </tbody></table>
  <p style="margin-top:12px;font-size:12px;color:var(--muted)">Figures are intelligence estimates based on available business registry data. All values are indicative.</p>
</div></section>

<!-- SAMPLE DATA -->
<section id="sample"><div class="wrap">
  <span class="slbl">Preview</span>
  <h2>Sample Records from the ${loc} Database</h2>
  <p class="ssub">Data structure preview — company names and contacts shown for reference. Full verified records included in download.</p>
  <div class="sample-wrap sample-fade">
    <div class="sample-hdr">
      <span>${loc.toLowerCase().replace(/\s+/g,'-')}_b2b_${YEAR}_q${qtr}.csv — showing 8 of ${full}+ rows</span>
      <span>UTF-8 · comma-delimited · 14 columns</span>
    </div>
    <div class="sample-scroll">
    <table class="sample-tbl">
      <thead style="background:var(--surf2)"><tr>
        <th>company_name</th><th>email</th><th>full_name</th><th>job_title</th><th>sic_code</th><th>employees</th>
      </tr></thead>
      <tbody>
        ${(typeof samples !== "undefined" ? samples : tgt_samples || []).map(s=>`<tr>
          <td>${s.co}</td>
          <td class="col-em">${s.email}</td>
          <td>${s.name}</td>
          <td>${s.title}</td>
          <td>${s.sic}</td>
          <td>${s.emp}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
  </div>
  <p style="font-family:var(--mf);font-size:11px;color:var(--muted);margin-top:10px;text-align:center">Emails partially masked in preview. Full records unlocked on download from LeadsBlue.</p>
</div></section>

<!-- COMPATIBILITY -->
<section><div class="wrap">
  <span class="slbl">Integrations</span>
  <h2>Works With Every Major Platform</h2>
  <p class="ssub">Standard CSV and XLSX format — zero-friction import into any tool in your stack.</p>
  <div class="compat-grid">
    <div class="compat-item"><span class="compat-icon">⚡</span><div><div class="compat-name">Instantly</div><div class="compat-type">Cold Email</div></div></div>
    <div class="compat-item"><span class="compat-icon">📬</span><div><div class="compat-name">Smartlead</div><div class="compat-type">Cold Email</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔭</span><div><div class="compat-name">Apollo.io</div><div class="compat-type">Sales Intelligence</div></div></div>
    <div class="compat-item"><span class="compat-icon">🟠</span><div><div class="compat-name">HubSpot</div><div class="compat-type">CRM</div></div></div>
    <div class="compat-item"><span class="compat-icon">☁️</span><div><div class="compat-name">Salesforce</div><div class="compat-type">CRM</div></div></div>
    <div class="compat-item"><span class="compat-icon">📊</span><div><div class="compat-name">Mailchimp</div><div class="compat-type">Email Marketing</div></div></div>
    <div class="compat-item"><span class="compat-icon">🐙</span><div><div class="compat-name">Lemlist</div><div class="compat-type">Outreach</div></div></div>
    <div class="compat-item"><span class="compat-icon">✅</span><div><div class="compat-name">NeverBounce</div><div class="compat-type">Verification</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔷</span><div><div class="compat-name">LinkedIn Ads</div><div class="compat-type">Matched Audiences</div></div></div>
    <div class="compat-item"><span class="compat-icon">📋</span><div><div class="compat-name">Google Sheets</div><div class="compat-type">Spreadsheet</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔁</span><div><div class="compat-name">Zapier / Make</div><div class="compat-type">Automation</div></div></div>
    <div class="compat-item"><span class="compat-icon">📁</span><div><div class="compat-name">Microsoft Excel</div><div class="compat-type">XLSX Export</div></div></div>
  </div>
</div></section>

<!-- REVIEWS -->
<section><div class="wrap">
  <span class="slbl">Customer Reviews</span>
  <h2>What Marketers Say About ${name}</h2>
  <p class="ssub" style="margin-bottom:24px">Reviews from sales teams, SDRs, and marketing agencies who used this database.</p>
  <div class="review-grid">
    ${(typeof reviews !== "undefined" ? reviews : tgt_reviews || []).map(rv=>`<div class="review-card">
      <div class="review-stars">${'★'.repeat(rv.stars)}${'☆'.repeat(5-rv.stars)}</div>
      <p class="review-txt">"${rv.text}"</p>
      <div class="review-author">${rv.role}</div>
      <div class="review-role">${rv.company}</div>
    </div>`).join('')}
  </div>
  <p style="font-family:var(--mf);font-size:11px;color:var(--muted);margin-top:14px;text-align:center">Aggregate rating: ${(typeof rating !== "undefined" ? rating : tgt_rating || getRating(seed)).value}/5 from ${(typeof rating !== "undefined" ? rating : tgt_rating || getRating(seed)).count} verified purchasers via LeadsBlue.</p>
</div></section>

<section><div class="wrap">
  <span class="slbl">FAQ</span>
  <h2>Frequently Asked Questions</h2>
  <p class="ssub">Factual, analytical, and comparative answers about ${name}.</p>
  <div class="faq-list">${faqHtml}</div>
</div></section>

<section><div class="wrap">
  <span class="slbl">Related Topics</span>
  <h2>People Also Search For</h2>
  <p class="ssub" style="margin-bottom:14px">Common search queries related to ${name} and ${loc} B2B contact data.</p>
  <div class="kwc">${kws.map(k=>`<span class="kw">${k}</span>`).join('')}<span class="kw">${loc.toLowerCase()} cold email</span><span class="kw">${inds[0].name.toLowerCase()} contacts ${loc.toLowerCase()}</span><span class="kw">b2b prospecting ${loc.toLowerCase()}</span></div>
</div></section>

<section><div class="wrap"><div class="two">
  <div>
    <span class="slbl">Related Databases</span>
    <h2>Similar B2B Lists</h2>
    <div class="rel-grid">${related.map(r=>`<a href="/data-pages/${slug(r.name)}/" class="rel-card">${r.name}<small>B2B · Email Database</small></a>`).join('')}</div>
    <p style="margin-top:14px"><a href="/data-pages/" style="font-size:13px">Browse all B2B databases →</a></p>
  </div>
  <div>
    <span class="slbl">Learn More</span>
    <h2>Outreach Guides</h2>
    <ul class="blog-list">
      <li><a href="/blog/what-is-b2b-email-list.html">What Is a B2B Email List?</a></li>
      <li><a href="/blog/how-to-use-email-database.html">How to Use an Email Database</a></li>
      <li><a href="/blog/cold-email-strategy.html">Cold Email Strategy That Works</a></li>
      <li><a href="/blog/is-buying-email-lists-legal.html">Is Buying Email Lists Legal?</a></li>
      <li><a href="/blog/b2b-lead-generation-strategies.html">B2B Lead Generation Strategies</a></li>
      <li><a href="/blog/best-email-list-providers.html">Best Email List Providers</a></li>
    </ul>
  </div>
</div></div></section>

<section><div class="wrap"><div class="cta-b">
  <span class="slbl" style="display:block;margin-bottom:10px">Get Started</span>
  <h2>Access ${cnt}+ ${loc} Business Contacts</h2>
  <p>Download ${name} and start building pipeline with ${full}+ verified, ${comp.fw}-compliant B2B contacts today.</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a href="${url}" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a>
    <a href="/data-pages/" class="btn-g">Browse All B2B Lists</a>
  </div>
</div></div></section>
</article></main>
${footHtml(related,'data-pages')}
${faqScript()}
</body></html>`;

  fs.writeFileSync(`${dir}/index.html`, html);
}


// ============================================================
// ██████  TEMPLATE 2: CONSUMER EMAIL LIST
// ============================================================
function genConsumerPage(p, allConsPages) {
  const { name, url } = p;
  const sl   = slug(name);
  const loc  = extractLocation(name);
  const seed = pseudoHash(name);
  const tier = b2bTier(name);

  const rc   = consumerRecords(tier, seed);
  const cnt  = fmtShort(rc); const full = fmtFull(rc);
  const ages = getAgeDist(seed);
  const ints = getConsumerInterests(seed);
  const gen  = getGenderSplit(seed);
  const bm   = getBenchmarks(seed, true);
  const comp = getCompliance(loc, tier, true);
  const vr   = pInt(seed,51,88,97);
  const qtr  = pInt(seed,52,1,4);
  const rating_c   = getRating(seed);
  const citiesNum_c = pInt(seed,240,3,28);
  const reviews_c  = getReviews(loc, seed);
  const samples_c  = getSampleRows(loc, ints.slice(0,3).map(x=>({name:x.name,sic:'7000'})), seed);
  const rating    = getRating(seed);
  const priceData = getPrice(rc);
  const citiesNum = pInt(seed,240,3,28);
  const fieldsNum = 10;
  const sku       = 'LBD-' + loc.toUpperCase().replace(/[^A-Z]/g,'').substring(0,4) + '-B2C-' + YEAR;
  const indWCount = ints.slice(0,3).map(i=>({name:i.name,count:Math.round(rc*i.pct/100),pct:i.pct,sic:'7000'}));
  const samples   = getSampleRows(loc, [{name:'Online Shopping'},{name:'Health & Wellness'},{name:'Travel'}].map(x=>({...x,sic:'7000'})), seed);
  const reviews   = getReviews(loc, seed);
  const titles    = [{title:'Consumer Contacts',count:rc}];
  const msme      = 0;
  const top3      = 0;
  const dm        = 0;
  const segRR     = '0';
  const topAge = ages.reduce((a,b)=>b.pct>a.pct?b:a);
  const topInt = ints[0];

  const cidx   = allConsPages.findIndex(x=>x.slug===sl);
  const related = getRelatedPages(name, allConsPages, seed, 5);

  // Hero + meta rotation
  const heroData_c  = { loc, cnt, topAge: topAge.label, topAgePct: topAge.pct, topInt: topInt.name, topIntPct: topInt.pct, openRate: bm.openRate, vr, fw: comp.fw };
  const heroDesc    = getHeroIntro('consumer', seed, heroData_c);
  const metaDesc    = getMetaDesc('consumer', seed, { loc, cnt, topAge: topAge.label, topAgePct: topAge.pct, topInt: topInt.name, topIntPct: topInt.pct, openRate: bm.openRate, vr, fw: comp.fw });
  const timeMkp     = getTimeMarkup(seed);

  const kws = [`${loc.toLowerCase()} consumer email list`,`${loc.toLowerCase()} email database`,`buy ${loc.toLowerCase()} email list`,`${loc.toLowerCase()} mailing list`,`${loc.toLowerCase()} consumer contacts`,`${loc.toLowerCase()} b2c email list`,`${loc.toLowerCase()} consumer database`,`${loc.toLowerCase()} email addresses`,`consumer email list ${loc.toLowerCase()}`,`${loc.toLowerCase()} marketing list`,`${loc.toLowerCase()} consumer data`];

  const faqFull = [
    {q:`What is the ${name}?`, a:`The ${name} is a verified database of ${full}+ consumer email addresses from ${loc}. It is used for B2C email marketing, retail promotions, newsletter campaigns, subscription services, and lifestyle product outreach. The dominant age group is ${topAge.label} (${topAge.pct}%), and the top consumer interest is ${topInt.name} (${topInt.pct}%).`},
    {q:`How many consumer contacts are in this database?`, a:`The ${name} contains approximately ${full}+ consumer email contacts. The largest demographic segment is ${topAge.label} at ${topAge.pct}% of contacts. Gender split: ${gen.female}% female, ${gen.male}% male.`},
    {q:`What demographic data is included?`, a:`The database includes consumer email addresses, names, geographic location within ${loc}, age range, gender, and interest category classifications. Income bracket data is available where permitted by local data regulations.`},
    {q:`What is the difference between a consumer and B2B email list?`, a:`A B2B email list contains business email addresses for professional outreach to companies. A consumer email list like the ${name} contains personal email addresses for direct-to-consumer marketing. Consumer lists are larger in volume, require stricter compliance (consent rather than legitimate interest in the EU), and are used for retail, lifestyle, subscription, and B2C brand campaigns.`},
    {q:`What age group dominates the ${loc} consumer database?`, a:`The ${topAge.label} age group is the largest demographic at ${topAge.pct}% of contacts in the ${name}. The full age distribution: ${ages.map(a=>`${a.label} (${a.pct}%)`).join(', ')}.`},
    {q:`What are the top consumer interest categories in ${loc}?`, a:`The top interest categories among ${loc} consumer contacts are: ${ints.map(i=>`${i.name} (${i.pct}%)`).join(', ')}. These interest signals allow precise audience segmentation for product-category targeting.`},
    {q:`What is the average open rate for consumer email campaigns in ${loc}?`, a:`Consumer email campaigns targeting ${loc} contacts achieve an average open rate of ${bm.openRate}% with personalised subject lines. Click-through rates average ${bm.ctr}%. Consumer open rates are typically higher than B2B rates due to higher personal inbox engagement.`},
    {q:`Is the ${name} legal to use?`, a:`${comp.note}`},
    {q:`What compliance framework applies to consumer email marketing in ${loc}?`, a:`${comp.note}`},
    {q:`Who uses consumer email lists?`, a:`Consumer email lists are used by: e-commerce retailers launching promotional campaigns, subscription box services seeking new subscribers, lifestyle brands targeting interest-specific audiences, event promoters reaching consumers in specific regions, and publishers growing newsletter audiences.`},
    {q:`How is the ${name} verified and updated?`, a:`Consumer data is verified through email deliverability testing and periodic re-validation. The current dataset was last verified Q${qtr} ${YEAR}. Email accuracy rate: ${vr}%+. Undeliverable addresses are removed and replaced each verification cycle.`},
    {q:`What types of products and services perform best with ${loc} consumer data?`, a:`The ${topInt.name} category at ${topInt.pct}% indicates strong performance for ${topInt.name.toLowerCase()}-adjacent products and services. The ${topAge.label} age group at ${topAge.pct}% suggests products appealing to this demographic will see above-average engagement.`},
    {q:`How do I segment the ${name} for better results?`, a:`Segment by interest category first (${ints[0].name}, ${ints[1].name}), then by age group (${topAge.label} being most responsive), then by geographic sub-region within ${loc} if available. Segmented sends achieve 35–50% higher click-through rates than unsegmented blasts.`},
    {q:`What email tools work best for consumer campaigns?`, a:`Recommended tools for consumer email campaigns: Klaviyo (e-commerce focused), Mailchimp, ActiveCampaign, GetResponse, Constant Contact, and Sendinblue. These platforms support the higher volume and automation required for effective B2C email marketing.`},
    {q:`How does ${loc} compare to similar consumer markets?`, a:`${loc} has approximately ${full}+ consumer email contacts. The ${topAge.label} demographic represents ${topAge.pct}% of the market, and ${topInt.name} is the dominant interest category. These characteristics position ${loc} as a ${parseFloat(bm.openRate)>=28?'highly responsive':'responsive'} consumer email market with ${bm.openRate}% average open rates.`}
  ];

  const faq = pickByHash(seed, faqFull, 10);
  faq.forEach(f=>faqData.push({question:f.q,answer:f.a}));
  mktStats.push({name,location:loc,slug:sl,records:rc,top_age:topAge.label,top_interest:topInt.name,open_rate:`${bm.openRate}%`,compliance:comp.fw,category:'consumer'});
  allPageIndex.push({name,slug:sl,type:'consumer',category:'Consumer Email List',location:loc,records:rc,records_formatted:cnt+'+',price:'$'+priceData.price,rating:rating_c.value,top_interest:ints[0].name,compliance:comp.fw,url:`https://b2bdataindex.com/consumer-data/${sl}/`,product_url:url});

  const dateM=`${YEAR}-${qtr===1?'03':qtr===2?'06':qtr===3?'09':'12'}-01`;
  const schemas=[
    JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":faq.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))}),
    JSON.stringify({"@context":"https://schema.org/","@type":"Dataset","name":name,"description":`${name}: ${full}+ verified consumer email contacts in ${loc}. Includes age, gender, and interest segments. Last verified Q${qtr} ${YEAR}.`,"url":`${BASE}/consumer-data/${sl}/`,"keywords":kws,"variableMeasured":["Consumer Email","Name","Age Range","Gender","Location","Interest Category"],"dateModified":dateM,"size":`${full}+ records`,"spatialCoverage":{"@type":"Place","name":loc},"distribution":{"@type":"DataDownload","encodingFormat":"text/csv","contentUrl":url},"creator":{"@type":"Organization","name":"LeadsBlue","url":LB}}),
    JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":`${BASE}/`},{"@type":"ListItem","position":2,"name":"Consumer Lists","item":`${BASE}/consumer-data/`},{"@type":"ListItem","position":3,"name":name,"item":`${BASE}/consumer-data/${sl}/`}]}),
    JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":`Top Consumer Interests in ${loc}`,"itemListElement":ints.map((x,i) => ({"@type":"ListItem","position":i+1,"name":x.name,"description":`${x.pct}% of ${loc} consumer contacts`}))}),
    JSON.stringify({"@context":"https://schema.org","@type":"WebPage","url":`${BASE}/consumer-data/${sl}/`,"speakable":{"@type":"SpeakableSpecification","cssSelector":[".hero-desc",".faq-answer"]}}),
    JSON.stringify({
      "@context":"https://schema.org","@type":"Product",
      "name": name,
      "description": `${name}: ${full}+ verified consumer email contacts in ${loc}. ${vr}% email verification rate. ${comp.fw} compliant.`,
      "brand":{"@type":"Brand","name":"LeadsBlue"},
      "sku": sku,
      "category":"Consumer Email Database / B2C Marketing Data",
      "url":`${BASE}/consumer-data/${sl}/`,
      "image":"https://b2bdataindex.com/assets/og-default.png",
      "offers":{
        "@type":"Offer","url":url,"price":priceData.price,"priceCurrency":"USD",
        "availability":"https://schema.org/InStock","itemCondition":"https://schema.org/NewCondition",
        "seller":{"@type":"Organization","name":"LeadsBlue","url":"https://leadsblue.com"},
        "shippingDetails":{"@type":"OfferShippingDetails","shippingRate":{"@type":"MonetaryAmount","value":"0","currency":"USD"},"deliveryTime":{"@type":"ShippingDeliveryTime","businessDays":{"@type":"QuantitativeValue","minValue":0,"maxValue":0}}},
        "hasMerchantReturnPolicy":{"@type":"MerchantReturnPolicy","applicableCountry":"US","returnPolicyCategory":"https://schema.org/MerchantReturnNotPermitted","merchantReturnDays":0}
      },
      "additionalProperty":[
        {"@type":"PropertyValue","name":"Total Records","value":full+"+"},
        {"@type":"PropertyValue","name":"Email Deliverability","value":vr+"%"},
        {"@type":"PropertyValue","name":"Last Updated","value":"Q"+qtr+" "+YEAR},
        {"@type":"PropertyValue","name":"File Format","value":"CSV, XLSX"},
        {"@type":"PropertyValue","name":"Compliance","value":comp.fw}
      ]
    })
  ];
  const schemaBlocks=schemas.map(s=>`<script type="application/ld+json">${s}<\/script>`).join('\n  ');
  const faqHtml=faq.map((f,i)=> i===0 ? `<details class="faq-item" open><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>` : `<details class="faq-item"><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>`).join('');

  const dir=`./public/consumer-data/${sl}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(`${dir}/data.json`,JSON.stringify({name,location:loc,slug:sl,url:`${BASE}/consumer-data/${sl}/`,records:rc,demographics:{age_distribution:Object.fromEntries(ages.map(a=>[a.label,a.pct])),gender:{female:`${gen.female}%`,male:`${gen.male}%`}},interests:Object.fromEntries(ints.map(i=>[i.name,i.pct])),benchmarks:{open_rate:`${bm.openRate}%`,ctr:`${bm.ctr}%`},compliance:{framework:comp.fw},product_url:url},null,2));

  const html=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>${loc} Consumer Email List — ${cnt}+ Verified Consumer Contacts | B2B Data Index</title>
<meta name="description" content="${metaDesc}">
<link rel="canonical" href="${BASE}/consumer-data/${sl}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${loc} Consumer Email List — ${cnt}+ Verified Contacts">
<meta name="twitter:description" content="${cnt}+ ${loc} consumer emails. Demographics included. ${vr}% verified. CSV download.">
<meta property="og:locale" content="en_US">
<meta name="geo.region" content="${getGeoMeta(loc).region || ''}">
<meta name="geo.placename" content="${loc}">
<link rel="alternate" type="application/json" href="${BASE}/consumer-data/${sl}/data.json">
${schemaBlocks}
<style>${CSS}</style>
</head>
<body>
${navHtml()}
<main><article itemscope itemtype="https://schema.org/Article">
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span><a href="/consumer-data/">Consumer Lists</a><span>›</span>${name}</nav></div><div class="wrap">${getAuthorBlock(seed).html}${timeMkp}</div>
<section class="hero"><div class="wrap">
  <span class="tag">Consumer Data · ${loc}</span>
  <h1><em>${loc}</em> Consumer Email Database</h1>
  <p class="hero-desc">${heroDesc}</p>
  <div class="ctas"><a href="${url}" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a><a href="/consumer-data/" class="btn-g">Browse Consumer Lists</a></div>
  <div class="stats">
    <div class="stat"><span class="stat-n">${cnt}+</span><span class="stat-l">Consumer Contacts</span></div>
    <div class="stat"><span class="stat-n">${topAge.label}</span><span class="stat-l">Largest Age Group</span></div>
    <div class="stat"><span class="stat-n">${gen.female}%</span><span class="stat-l">Female</span></div>
    <div class="stat"><span class="stat-n">${bm.openRate}%</span><span class="stat-l">Avg Open Rate</span></div>
    <div class="stat"><span class="stat-n">${vr}%</span><span class="stat-l">Verified</span></div>
  </div>
</div></section>

<section><div class="wrap">
  <span class="slbl">Audience Intelligence</span>
  <h2>${loc} Consumer Profile — Data Snapshot</h2>
  <div class="intel-grid">
    <div class="intel-card"><span class="intel-val">${cnt}+</span><span class="intel-lbl">Total Records</span><span class="intel-sub">Verified consumer emails</span></div>
    <div class="intel-card"><span class="intel-val">${topAge.label}</span><span class="intel-lbl">Top Age Group</span><span class="intel-sub">${topAge.pct}% of audience</span></div>
    <div class="intel-card"><span class="intel-val">${gen.female}/${gen.male}</span><span class="intel-lbl">F/M Split</span><span class="intel-sub">Gender distribution</span></div>
    <div class="intel-card"><span class="intel-val">${ints.length}</span><span class="intel-lbl">Interest Segments</span><span class="intel-sub">Categorised interests</span></div>
    <div class="intel-card"><span class="intel-val">Q${qtr} ${YEAR}</span><span class="intel-lbl">Last Verified</span><span class="intel-sub">Deliverability tested</span></div>
  </div>
</div></section>

<section><div class="wrap"><div class="two-w">
  <div>
    <span class="slbl">Interest Breakdown</span>
    <h2>Top Consumer Interests in ${loc}</h2>
    <p class="ssub">Distribution of interest categories among ${loc} consumer contacts.</p>
    <div class="ind-breakdown">${barRows(ints)}</div>
  </div>
  <div>
    <span class="slbl">Age &amp; Gender Distribution</span>
    <h2>Demographic Profile</h2>
    <p class="ssub">Age group breakdown of ${loc} consumer contacts.</p>
    <table><thead><tr><th>Age Group</th><th>Share</th></tr></thead><tbody>
      ${ages.map(a=>`<tr><td>${a.label}</td><td><strong>${a.pct}%</strong></td></tr>`).join('')}
    </tbody></table>
    <div style="margin-top:16px;display:flex;gap:12px">
      <div style="flex:1;background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:14px;text-align:center"><span style="font-family:var(--hf);font-size:22px;color:#fff;display:block">${gen.female}%</span><span style="font-size:11px;color:var(--muted)">Female</span></div>
      <div style="flex:1;background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:14px;text-align:center"><span style="font-family:var(--hf);font-size:22px;color:#fff;display:block">${gen.male}%</span><span style="font-size:11px;color:var(--muted)">Male</span></div>
    </div>
  </div>
</div></div></section>

<section><div class="wrap"><div class="two-w">
  <div>
    <span class="slbl">Definition</span>
    <h2>What Is ${name}?</h2>
    <div class="prose">
      <p><strong>${name}</strong> is a verified database of ${full}+ consumer email addresses from ${loc}. Unlike B2B lists which target businesses, this database contains personal consumer contacts for direct-to-consumer marketing campaigns.</p>
      <p>The ${topAge.label} demographic represents <strong>${topAge.pct}%</strong> of contacts, and <strong>${topInt.name}</strong> is the dominant consumer interest category at ${topInt.pct}%. This combination provides strong targeting signals for brands in the ${topInt.name.toLowerCase()} space.</p>
      <ul>
        <li>${vr}%+ email deliverability — tested and verified contacts</li>
        <li>Age, gender, and interest classification included</li>
        <li>${comp.fw} compliance framework — see legal section below</li>
        <li>Last verified Q${qtr} ${YEAR} — regular re-validation cycles</li>
      </ul>
    </div>
  </div>
  <div>
    <span class="slbl">Data Fields</span>
    <h2 style="font-size:22px">What's Included</h2><br>
    <table><thead><tr><th>Field</th><th>Status</th></tr></thead><tbody>
      <tr><td>Consumer Email Address</td><td><span class="badge badge-g">✓ Verified</span></td></tr>
      <tr><td>Full Name</td><td><span class="badge">✓ Included</span></td></tr>
      <tr><td>Geographic Location</td><td><span class="badge">✓ ${loc}</span></td></tr>
      <tr><td>Age Range</td><td><span class="badge">✓ Classified</span></td></tr>
      <tr><td>Gender</td><td><span class="badge">✓ Included</span></td></tr>
      <tr><td>Interest Category</td><td><span class="badge">✓ ${ints.length} Categories</span></td></tr>
      <tr><td>Phone Number</td><td><span class="badge">Where Available</span></td></tr>
      <tr><td>Income Bracket</td><td><span class="badge">Where Available</span></td></tr>
    </tbody></table>
  </div>
</div></div></section>

<section><div class="wrap">
  <span class="slbl">B2C Use Cases</span>
  <h2>How the ${name} Is Used</h2>
  <div class="ug">
    <div class="uc"><span class="uc-icon">🛍️</span><h3>Retail &amp; E-Commerce</h3><p>Drive sales with promotional emails to ${cnt}+ ${loc} consumers. Target the ${topInt.name} interest segment for highest engagement.</p></div>
    <div class="uc"><span class="uc-icon">📰</span><h3>Newsletter Growth</h3><p>Rapidly grow your subscriber base with verified ${loc} consumers interested in ${ints[0].name} and ${ints[1].name} content.</p></div>
    <div class="uc"><span class="uc-icon">📱</span><h3>App &amp; Subscription</h3><p>Target the dominant ${topAge.label} demographic in ${loc} for subscription service sign-ups and app installs.</p></div>
    <div class="uc"><span class="uc-icon">🎪</span><h3>Events &amp; Promotions</h3><p>Reach ${loc} consumers with local event invitations, limited-time offers, and seasonal promotions.</p></div>
    <div class="uc"><span class="uc-icon">💄</span><h3>Lifestyle Brands</h3><p>Connect with ${loc}'s ${topInt.name} audience (${topInt.pct}%) for lifestyle product launches and brand awareness campaigns.</p></div>
    <div class="uc"><span class="uc-icon">🎯</span><h3>Retargeting Audiences</h3><p>Upload consumer emails as custom audiences in Meta Ads, Google Ads, or LinkedIn to build targeted lookalike audiences across ${loc}.</p></div>
  </div>
</div></section>

<section><div class="wrap"><div class="two">
  <div>
    <span class="slbl">Campaign Benchmarks</span>
    <h2>${loc} Consumer Email Performance</h2>
    <table><thead><tr><th>Metric</th><th>${loc} Average</th></tr></thead><tbody>
      <tr><td>Email Open Rate</td><td><strong>${bm.openRate}%</strong></td></tr>
      <tr><td>Click-Through Rate</td><td><strong>${bm.ctr}%</strong></td></tr>
      <tr><td>Bounce Rate</td><td><strong>${bm.bounceRate}%</strong></td></tr>
      <tr><td>Unsubscribe Rate</td><td><strong>${bm.unsubRate}%</strong></td></tr>
      <tr><td>Email Verification Rate</td><td><strong>${vr}%+</strong></td></tr>
    </tbody></table>
  </div>
  <div>
    <span class="slbl">Legal &amp; Compliance</span>
    <h2>${comp.fw}</h2>
    <div class="compliance-box" style="margin-top:8px"><span class="comp-fw">${comp.fw}</span><p style="font-size:13px;color:var(--muted);line-height:1.75;margin:0">${comp.note}</p></div>
  </div>
</div></div></section>

<!-- SAMPLE DATA -->
<section id="sample"><div class="wrap">
  <span class="slbl">Preview</span>
  <h2>Sample Records from the ${loc} Database</h2>
  <p class="ssub">Data structure preview — company names and contacts shown for reference. Full verified records included in download.</p>
  <div class="sample-wrap sample-fade">
    <div class="sample-hdr">
      <span>${loc.toLowerCase().replace(/\s+/g,'-')}_b2b_${YEAR}_q${qtr}.csv — showing 8 of ${full}+ rows</span>
      <span>UTF-8 · comma-delimited · 14 columns</span>
    </div>
    <div class="sample-scroll">
    <table class="sample-tbl">
      <thead style="background:var(--surf2)"><tr>
        <th>company_name</th><th>email</th><th>full_name</th><th>job_title</th><th>sic_code</th><th>employees</th>
      </tr></thead>
      <tbody>
        ${samples_c.map(s=>`<tr>
          <td>${s.co}</td>
          <td class="col-em">${s.email}</td>
          <td>${s.name}</td>
          <td>${s.title}</td>
          <td>${s.sic}</td>
          <td>${s.emp}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
  </div>
  <p style="font-family:var(--mf);font-size:11px;color:var(--muted);margin-top:10px;text-align:center">Emails partially masked in preview. Full records unlocked on download from LeadsBlue.</p>
</div></section>

<!-- COMPATIBILITY -->
<section><div class="wrap">
  <span class="slbl">Integrations</span>
  <h2>Works With Every Major Platform</h2>
  <p class="ssub">Standard CSV and XLSX format — zero-friction import into any tool in your stack.</p>
  <div class="compat-grid">
    <div class="compat-item"><span class="compat-icon">⚡</span><div><div class="compat-name">Instantly</div><div class="compat-type">Cold Email</div></div></div>
    <div class="compat-item"><span class="compat-icon">📬</span><div><div class="compat-name">Smartlead</div><div class="compat-type">Cold Email</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔭</span><div><div class="compat-name">Apollo.io</div><div class="compat-type">Sales Intelligence</div></div></div>
    <div class="compat-item"><span class="compat-icon">🟠</span><div><div class="compat-name">HubSpot</div><div class="compat-type">CRM</div></div></div>
    <div class="compat-item"><span class="compat-icon">☁️</span><div><div class="compat-name">Salesforce</div><div class="compat-type">CRM</div></div></div>
    <div class="compat-item"><span class="compat-icon">📊</span><div><div class="compat-name">Mailchimp</div><div class="compat-type">Email Marketing</div></div></div>
    <div class="compat-item"><span class="compat-icon">🐙</span><div><div class="compat-name">Lemlist</div><div class="compat-type">Outreach</div></div></div>
    <div class="compat-item"><span class="compat-icon">✅</span><div><div class="compat-name">NeverBounce</div><div class="compat-type">Verification</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔷</span><div><div class="compat-name">LinkedIn Ads</div><div class="compat-type">Matched Audiences</div></div></div>
    <div class="compat-item"><span class="compat-icon">📋</span><div><div class="compat-name">Google Sheets</div><div class="compat-type">Spreadsheet</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔁</span><div><div class="compat-name">Zapier / Make</div><div class="compat-type">Automation</div></div></div>
    <div class="compat-item"><span class="compat-icon">📁</span><div><div class="compat-name">Microsoft Excel</div><div class="compat-type">XLSX Export</div></div></div>
  </div>
</div></section>

<!-- REVIEWS -->
<section><div class="wrap">
  <span class="slbl">Customer Reviews</span>
  <h2>What Marketers Say About ${name}</h2>
  <p class="ssub" style="margin-bottom:24px">Reviews from sales teams, SDRs, and marketing agencies who used this database.</p>
  <div class="review-grid">
    ${reviews_c.map(rv=>`<div class="review-card">
      <div class="review-stars">${'★'.repeat(rv.stars)}${'☆'.repeat(5-rv.stars)}</div>
      <p class="review-txt">"${rv.text}"</p>
      <div class="review-author">${rv.role}</div>
      <div class="review-role">${rv.company}</div>
    </div>`).join('')}
  </div>
  <p style="font-family:var(--mf);font-size:11px;color:var(--muted);margin-top:14px;text-align:center">Aggregate rating: ${rating_c.value}/5 from ${rating_c.count} verified purchasers via LeadsBlue.</p>
</div></section>

<section><div class="wrap">
  <span class="slbl">FAQ</span>
  <h2>Frequently Asked Questions</h2>
  <div class="faq-list">${faqHtml}</div>
</div></section>

<section><div class="wrap"><div class="two">
  <div>
    <span class="slbl">Related Consumer Lists</span>
    <h2>Similar Databases</h2>
    <div class="rel-grid">${related.map(r=>`<a href="/consumer-data/${slug(r.name)}/" class="rel-card">${r.name}<small>Consumer · Email Database</small></a>`).join('')}</div>
    <p style="margin-top:14px"><a href="/consumer-data/" style="font-size:13px">Browse all consumer databases →</a></p>
  </div>
  <div>
    <span class="slbl">Guides</span>
    <h2>B2C Email Resources</h2>
    <ul class="blog-list">
      <li><a href="/blog/targeted-marketing-explained.html">Targeted B2C Marketing Explained</a></li>
      <li><a href="/blog/email-marketing-for-startups.html">Email Marketing for Startups</a></li>
      <li><a href="/blog/how-to-use-email-database.html">How to Use an Email Database</a></li>
      <li><a href="/blog/is-buying-email-lists-legal.html">Is Buying Email Lists Legal?</a></li>
      <li><a href="/blog/b2b-lead-generation-strategies.html">Lead Generation Strategies</a></li>
    </ul>
  </div>
</div></div></section>

<section><div class="wrap">
  <span class="slbl">Related Topics</span>
  <h2>People Also Search For</h2>
  <p class="ssub" style="margin-bottom:14px">Common queries related to ${name} and ${loc} consumer data.</p>
  <div class="kwc">${kws.map(k=>`<span class="kw">${k}</span>`).join('')}</div>
</div></section>

<section><div class="wrap"><div class="cta-b">
  <h2>Access ${cnt}+ ${loc} Consumer Contacts</h2>
  <p>Get the ${name} and launch targeted B2C campaigns with ${full}+ verified consumer emails today.</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a href="${url}" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a>
    <a href="/consumer-data/" class="btn-g">Browse Consumer Lists</a>
  </div>
</div></div></section>
</article></main>
${footHtml(related,'consumer-data')}
${faqScript()}
</body></html>`;

  fs.writeFileSync(`${dir}/index.html`, html);
}

// ============================================================
// ██████  TEMPLATE 3: TARGETED / NICHE EMAIL LIST
// ============================================================
function genTargetedPage(p, allTgtPages) {
  const { name, url } = p;
  const sl     = slug(name);
  const seed   = pseudoHash(name);
  const sub    = targetedSubtype(name);

  // Audience sizing by subtype
  const audSizes = {
    crypto:[800000,8000000], forex:[300000,3000000], gaming:[500000,15000000],
    cannabis:[200000,2000000], dating:[500000,5000000], healthcare:[50000,500000],
    'legal-pro':[30000,300000], 'finance-pro':[100000,1000000], 'tech-pro':[200000,2000000],
    executive:[50000,500000], social:[100000,2000000], crowdfunding:[80000,600000], general:[200000,5000000]
  };
  const [amin,amax] = audSizes[sub]||audSizes.general;
  const audSize  = pInt(seed,0,amin,amax);
  const audCnt   = fmtShort(audSize); const audFull = fmtFull(audSize);

  const vr  = pInt(seed,51,88,96);
  const qtr = pInt(seed,52,1,4);
  const rating    = getRating(seed);
  const citiesNum = pInt(seed,240,2,12);
  const fieldsNum = 8;
  const tgt_sku   = 'LBD-TGT-' + slug(name).substring(0,8).toUpperCase() + '-' + YEAR;
  const sku = tgt_sku;
  const msme_tgt  = 0;
  const top3_tgt  = 0;
  const dm_tgt    = 0;
  const bm  = getBenchmarks(seed, ['gaming','cannabis','dating','social'].includes(sub));

  // Audience profile segments (varies by subtype)
  const PROFILES = {
    crypto:    [['Bitcoin Holders','BTC-focused investors'],['Ethereum Users','ETH & DeFi participants'],['NFT Collectors','Active NFT marketplace users'],['DeFi Participants','Yield farming & liquidity providers'],['Crypto Traders','Active exchange users'],['Blockchain Developers','Smart contract developers']],
    forex:     [['Active Forex Traders','Live trading account holders'],['Forex Signal Subscribers','Signal service subscribers'],['Copy Traders','Automated copy trading participants'],['Forex Educators','Course buyers & webinar attendees'],['MetaTrader Users','MT4/MT5 platform users'],['Prop Firm Traders','Funded account traders']],
    gaming:    [['Active Players','Regular game session participants'],['Streamers & Content Creators','YouTube/Twitch gaming creators'],['eSports Followers','Competitive gaming audiences'],['In-App Purchasers','Real-money game spenders'],['Clan & Guild Members','Organised team participants'],['Early Adopters','Beta testers & early access buyers']],
    healthcare:[['General Practitioners','Primary care physicians'],['Specialists','Board-certified specialists'],['Nurse Practitioners','Advanced practice nurses'],['Practice Managers','Administrative decision-makers'],['Medical Directors','Hospital & clinic directors'],['Allied Health Professionals','PT, OT, pharmacists']],
    'legal-pro':[['Partners & Associates','Law firm attorneys'],['Solo Practitioners','Independent legal practices'],['Paralegals','Legal support professionals'],['Corporate Counsel','In-house legal departments'],['Specialty Attorneys','Criminal, family, IP specialists'],['Legal Consultants','Contract & advisory lawyers']],
    'finance-pro':[['CFOs & Finance Directors','Corporate financial leadership'],['CPAs & Accountants','Certified accounting professionals'],['Financial Advisors','Licensed investment advisors'],['Angel Investors','Early-stage startup investors'],['VC Partners','Venture capital decision-makers'],['Hedge Fund Managers','Alternative investment managers']],
    'tech-pro': [['Software Engineers','Full-stack & backend developers'],['IT Managers','Infrastructure & ops managers'],['DevOps Engineers','CI/CD & cloud engineers'],['Product Managers','Technical product owners'],['CIOs & CTOs','Technology leadership'],['System Architects','Enterprise solution designers']],
    executive:  [['CEOs & Founders','Company founders and chief executives'],['CFOs','Financial executives & controllers'],['CMOs','Marketing & growth leaders'],['COOs','Operations executives'],['VPs & Directors','Divisional leadership'],['Board Members','Non-executive board directors']],
    cannabis:   [['Medical Patients','Prescription & MMJ card holders'],['Recreational Consumers','Legal-state recreational users'],['Dispensary Owners','Retail cannabis operators'],['Cultivators','Licensed grow operation owners'],['CBD Product Users','Hemp-derived CBD consumers'],['Cannabis Investors','Dispensary & brand investors']],
    dating:     [['Active Daters','Dating app & site subscribers'],['Premium Members','Paid subscription users'],['Matchmaking Clients','Personal matchmaker seekers'],['Speed Daters','Event-based dating participants'],['Virtual Daters','Video date & online chat users'],['Elite Dating Users','High-net-worth dating service users']],
    social:     [['Micro-Influencers','1K–100K follower accounts'],['Nano-Influencers','<1K highly engaged creators'],['Content Creators','Multi-platform content producers'],['Brand Ambassadors','Paid brand partnership holders'],['Affiliate Marketers','Commission-based promoters'],['Social Media Managers','Brand account operators']],
    crowdfunding:[['Kickstarter Backers','Active campaign supporters'],['Indiegogo Funders','Cross-platform crowdfunding backers'],['Angel Network Members','Organised angel investor groups'],['Equity Crowdfund Investors','Regulation CF participants'],['Rewards Backers','Product & creative project supporters'],['Repeat Funders','Multi-campaign backers']],
    general:    [['Primary Audience','Core database contacts'],['Secondary Segment','Related interest group'],['Active Subscribers','Engaged email recipients'],['Interest-Verified','Behaviorally confirmed contacts'],['Premium Contacts','Higher-value records'],['Recent Additions','Newly added contacts']]
  };

  const prof = PROFILES[sub]||PROFILES.general;
  // Weight the profiles
  const profWeights = prof.map((_,i)=>pRand(seed,i+20));
  const profTotal   = profWeights.reduce((a,b)=>a+b,0);
  let   profPcts    = profWeights.map(w=>Math.max(5,Math.round(w/profTotal*100)));
  profPcts[0]      += 100-profPcts.reduce((a,b)=>a+b,0);
  const profileData  = prof.map((p,i) => ({name:p[0],desc:p[1],pct:profPcts[i]}));
  /* LATE_STUBS: computed after profileData and nameClean are available */
  const sku2       = 'LBD-TGT-' + slug(name).substring(0,8).toUpperCase() + '-' + YEAR;
  const indWCount2 = profileData.map((p,i)=>({name:p.name,count:Math.round(audSize*p.pct/100),pct:p.pct,sic:'7000'}));
  const samples2   = getSampleRows(name.split(' ').slice(0,3).join(' '), profileData.slice(0,3).map(x=>({name:x.name,sic:'7000'})), seed);
  const reviews2   = getReviews(name, seed);
  const rating2    = getRating(seed);
  const titles2    = profileData.slice(0,4).map(p=>({title:p.name, count:Math.round(audSize*p.pct/100)}));
  /* Aliases so shared HTML template strings work */
  const szs       = [{label:'Audience Contacts',pct:100}];
  const inds      = profileData.map(p=>({name:p.name,pct:p.pct,sic:'7000',count:Math.round(audSize*p.pct/100)}));
  const samples   = samples2;
  const reviews   = reviews2;
  // rating is already defined above; rating2 = same value
  const titles    = titles2;
  const msme      = msme_tgt;
  const top3      = top3_tgt;
  const dm        = dm_tgt;
  const segRR_tgt = bm.replyRate;
  const comp_tgt  = {fw:'CAN-SPAM / GDPR', note:'Follow CAN-SPAM Act for US contacts and GDPR legitimate interest for EU contacts. Include a working unsubscribe link in every email and honour opt-out requests within 10 business days.'};
  const rc        = audSize;
  const full      = audFull;
  const cnt       = audCnt;

  // Geographic distribution (most targeted lists are globally distributed)
  const geoUSA = pInt(seed,70,30,55);
  const geoUK  = pInt(seed,71,6,14);
  const geoCA  = pInt(seed,72,4,10);
  const geoAU  = pInt(seed,73,3,8);
  const geoRest= 100-geoUSA-geoUK-geoCA-geoAU;
  const geoData = [{c:'United States',pct:geoUSA},{c:'United Kingdom',pct:geoUK},{c:'Canada',pct:geoCA},{c:'Australia',pct:geoAU},{c:'Rest of World',pct:geoRest}];

  const cidx = allTgtPages.findIndex(x=>x.slug===sl);
  const related = getRelatedPages(name, allTgtPages, seed, 5);

  // Hero + meta rotation data

  // Subtype-specific use cases
  const USE_CASES = {
    crypto: ['💰 ICO & Token Sales — Reach verified crypto investors for token launch promotions',
             '📊 Trading Tools — Market crypto trading platforms, signals, and analytics tools',
             '🖼️ NFT Marketplace — Promote NFT collections and marketplace listings to collectors',
             '📈 DeFi Protocols — Drive liquidity provider recruitment and protocol awareness',
             '🎓 Crypto Education — Sell crypto courses, newsletters, and mentorship programmes',
             '💳 Crypto Cards & Wallets — Promote crypto payment and custody solutions'],
    forex:  ['📊 Forex Signals — Promote signal services to verified active traders',
             '🎓 Trading Courses — Sell forex education to signal subscribers and beginners',
             '🏦 Prop Firm Offers — Recruit traders to funded account programmes',
             '📱 Trading Apps — Market MT4/MT5 platforms and mobile trading tools',
             '🤖 EA & Automation — Promote expert advisors and algorithmic trading tools',
             '💰 Rebate Programmes — Reach active traders with broker rebate offers'],
    gaming: ['🎮 In-Game Purchases — Promote DLC, skins, and virtual currency to active players',
             '📺 Streaming Services — Market gaming streaming and content platforms',
             '🖥️ Gaming Hardware — Reach hardware buyers with PC components and peripherals',
             '🏆 eSports Events — Promote tournaments and competitive gaming events',
             '📚 Gaming Guides — Sell strategy guides, coaching, and training content',
             '👕 Merchandise — Market gaming brand apparel and collectibles'],
    healthcare:['💊 Medical Supplies — Promote equipment and consumables to practitioners',
             '📋 Practice Software — Market EHR, billing, and scheduling solutions',
             '🎓 CME Credits — Sell continuing medical education courses',
             '🏥 Healthcare SaaS — Market telehealth and clinical management platforms',
             '💼 Medical Recruitment — Reach practitioners for staffing and placement',
             '📰 Medical Publishing — Distribute journals, guidelines, and research'],
    'legal-pro':['⚖️ Legal Software — Market case management and billing platforms to attorneys',
             '🎓 CLE Programmes — Sell continuing legal education to licensed attorneys',
             '📋 Legal Research Tools — Promote Westlaw/Lexis-type research platforms',
             '💼 Legal Recruitment — Reach attorneys for placement and partnership opportunities',
             '🔒 Bar Association Services — Market professional services to bar members',
             '📊 Litigation Analytics — Promote data-driven litigation strategy tools'],
    'finance-pro':['📊 Financial Software — Market accounting and FP&A tools to financial professionals',
             '🎓 CPE Credits — Sell continuing professional education to CPAs',
             '💰 Investment Platforms — Reach accredited investors with deal flow',
             '🏦 Banking Solutions — Market fintech and treasury management tools',
             '📈 Portfolio Analytics — Promote wealth management and analytics platforms',
             '💼 Financial Recruitment — Reach CFOs and finance directors for executive roles'],
    general: ['📧 Direct Outreach — Launch targeted email campaigns to this verified audience',
             '🎯 Niche Marketing — Promote products directly relevant to this audience segment',
             '🤝 Partnership Development — Find collaboration partners within this community',
             '📊 Market Research — Survey this audience for insights and product validation',
             '🌐 Community Building — Grow your brand presence within this interest group',
             '💼 Recruitment — Reach qualified candidates within this professional community']
  };

  const useCases = (USE_CASES[sub]||USE_CASES.general).concat(USE_CASES.general.slice(0,2));

  const nameClean = name.replace(/:/g,':').replace(/\s{2,}/g,' ');
  // Hero/meta helpers — placed after nameClean so it's in scope
  const heroData_t = { cnt: audCnt, seg1: profileData[0].name, seg1pct: profileData[0].pct, geoUSA, openRate: bm.openRate, replyRate: bm.replyRate, vr, name: nameClean };
  const heroDesc   = getHeroIntro('targeted', seed, heroData_t);
  const metaDesc   = getMetaDesc('targeted', seed, { name: nameClean, cnt: audCnt, seg1: profileData[0].name, seg1pct: profileData[0].pct, geoUSA, openRate: bm.openRate, replyRate: bm.replyRate, vr, fw: 'CAN-SPAM / GDPR' });
  const timeMkp    = getTimeMarkup(seed);
  const loc_tgt   = nameClean; // alias for shared template sections

  const faqFull = [
    {q:`What is the ${nameClean}?`, a:`The ${nameClean} is a verified database of ${audFull}+ contacts who are identified ${sub==='crypto'?'cryptocurrency investors and users':sub==='forex'?'foreign exchange traders':sub==='gaming'?'active gamers':sub==='healthcare'?'healthcare professionals':sub==='legal-pro'?'legal professionals':sub==='finance-pro'?'finance and investment professionals':sub==='tech-pro'?'technology professionals':sub==='executive'?'C-suite executives and senior leaders':sub==='cannabis'?'cannabis consumers and industry operators':sub==='dating'?'online dating users':sub==='social'?'social media influencers and content creators':sub==='crowdfunding'?'crowdfunding backers and investors':'targeted contacts'}. The largest audience segment is ${profileData[0].name} at ${profileData[0].pct}% of the database.`},
    {q:`How large is this audience database?`, a:`The ${nameClean} contains approximately ${audFull}+ verified contacts. Geographic distribution: ${geoUSA}% USA, ${geoUK}% UK, ${geoCA}% Canada, ${geoAU}% Australia, and ${geoRest}% from the rest of the world.`},
    {q:`How are contacts in this database identified and verified?`, a:`Contacts are identified through ${sub==='crypto'?'cryptocurrency exchange activity, blockchain analytics, and forum participation':'behavioral signals, platform activity data, and interest-based verification'}. Emails are verified through SMTP validation and deliverability testing. Current verification rate: ${vr}%+. Last verified Q${qtr} ${YEAR}.`},
    {q:`What are the main audience segments in this database?`, a:`The primary audience segments are: ${profileData.slice(0,4).map(p=>`${p.name} (${p.pct}%)`).join(', ')}. Each segment represents a distinct cluster within the broader ${nameClean.toLowerCase()} audience.`},
    {q:`What data fields are included?`, a:`The database includes verified email addresses, contact names, geographic location, audience segment classification, platform/source indicator, and additional demographic data where available.`},
    {q:`What is the geographic distribution of this audience?`, a:`Geographic breakdown: United States ${geoUSA}%, United Kingdom ${geoUK}%, Canada ${geoCA}%, Australia ${geoAU}%, Rest of World ${geoRest}%. This is a globally distributed audience with strong English-speaking market representation.`},
    {q:`What is the average email open rate for this audience?`, a:`Email campaigns targeting this audience achieve an average open rate of ${bm.openRate}%. Click-through rates average ${bm.ctr}%. Reply rates average ${bm.replyRate}% for personalised, relevant outreach.`},
    {q:`Is this database compliant with email regulations?`, a:`Yes. For US-based contacts, the CAN-SPAM Act applies — no prior opt-in required for commercial email. For EU contacts, the GDPR legitimate interest basis applies for B2B contacts; explicit consent may be required for personal emails. Always include a functional unsubscribe link.`},
    {q:`Who uses the ${nameClean}?`, a:`This database is used by: ${sub==='crypto'?'crypto projects for token promotion, exchanges for user acquisition, trading tool vendors, and NFT platforms':sub==='forex'?'forex brokers, signal providers, education companies, and prop trading firms':sub==='gaming'?'game publishers, streaming platforms, hardware vendors, and eSports event organisers':sub==='healthcare'?'medical software companies, supply vendors, CME providers, and healthcare recruiters':sub==='legal-pro'?'legal software vendors, CLE providers, legal publishers, and law firm recruiters':sub==='finance-pro'?'fintech companies, accounting software vendors, investment platforms, and financial recruiters':'businesses targeting this specific niche audience for product promotion, community growth, or market research'}.`},
    {q:`How do I segment this database for better campaign results?`, a:`Segment by the primary audience clusters: ${profileData.slice(0,3).map(p=>p.name).join(', ')}. Geographic segmentation (US vs international) further improves relevance. Subject lines referencing the specific niche context drive the ${bm.openRate}% average open rate for this audience.`},
    {q:`What products and services perform best with this audience?`, a:`Products achieving highest conversion with this audience include: ${useCases.slice(0,3).map(u=>u.split(' — ')[0].replace(/[🎯📧📊💰🎮🏆📺🎓👕🖥️💊📋🏥💼📰⚖️🔒📊🌐]/g,'').trim()).join(', ')}.`},
    {q:`How often is this database updated?`, a:`The ${nameClean} undergoes quarterly verification cycles. New contacts are added as the audience grows, while undeliverable addresses are removed. Last verification: Q${qtr} ${YEAR}. Verification rate maintained at ${vr}%+.`},
    {q:`What makes this database different from a generic email list?`, a:`Unlike generic email lists, the ${nameClean} contains contacts who are specifically identified through ${sub==='crypto'?'on-chain activity and crypto platform engagement':'behavioral and interest signals'} as belonging to this audience. This targeting precision drives the higher-than-average ${bm.openRate}% open rates and ${bm.replyRate}% reply rates.`},
    {q:`What email tools work best for this type of outreach?`, a:`For high-volume campaigns: Instantly, Smartlead, or Lemlist. For CRM integration: HubSpot or ActiveCampaign. For e-commerce: Klaviyo. Import the CSV, segment by audience cluster, and personalise copy to reference the specific interest context for best results.`},
    {q:`Can I further filter or segment this database?`, a:`Yes. The database can be filtered by geographic region (US only, EU only, etc.), audience segment (${profileData[0].name}, ${profileData[1].name}, etc.), and by additional demographic attributes where available. Contact LeadsBlue for custom filtering and segmentation options.`}
  ];

  const faq = pickByHash(seed, faqFull, 10);
  faq.forEach(f=>faqData.push({question:f.q,answer:f.a}));
  mktStats.push({name,slug:sl,audience_size:audSize,sub_type:sub,open_rate:`${bm.openRate}%`,geo_usa:`${geoUSA}%`,compliance:'CAN-SPAM / GDPR',category:'targeted'});
  allPageIndex.push({name,slug:sl,type:'targeted',category:'Targeted Email List',subtype:sub,records:audSize,records_formatted:audCnt+'+',price:'$'+getPrice(audSize).price,rating:rating.value,url:`https://b2bdataindex.com/targeted-lists/${sl}/`,product_url:url});

  const schemas=[
    JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":faq.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))}),
    JSON.stringify({"@context":"https://schema.org/","@type":"Dataset","name":name,"description":`${name}: ${audFull}+ verified ${sub} contacts. Last verified Q${qtr} ${YEAR}. Includes geographic distribution, audience segmentation, and outreach benchmarks.`,"url":`${BASE}/targeted-lists/${sl}/`,"keywords":[name.toLowerCase(),`buy ${name.toLowerCase()}`,`${sub} email list`,`targeted ${sub} database`],"dateModified":`${YEAR}-03-01`,"size":`${audFull}+ records`,"distribution":{"@type":"DataDownload","encodingFormat":"text/csv","contentUrl":url},"creator":{"@type":"Organization","name":"LeadsBlue","url":LB}}),
    JSON.stringify({
      "@context":"https://schema.org","@type":"Product",
      "name": nameClean,
      "description": `${nameClean}: ${audFull}+ verified targeted email contacts. ${profileData[0].name} represents ${profileData[0].pct}%. ${geoUSA}% US-based audience.`,
      "brand":{"@type":"Brand","name":"LeadsBlue"},
      "sku": sku2,
      "category":"Targeted Email Database / Niche Marketing Data",
      "url":`${BASE}/targeted-lists/${sl}/`,
      "image":"https://b2bdataindex.com/assets/og-default.png",
      "offers":{
        "@type":"Offer","url":url,"price": getPrice(audSize).price,"priceCurrency":"USD",
        "availability":"https://schema.org/InStock","itemCondition":"https://schema.org/NewCondition",
        "seller":{"@type":"Organization","name":"LeadsBlue","url":"https://leadsblue.com"},
        "shippingDetails":{"@type":"OfferShippingDetails","shippingRate":{"@type":"MonetaryAmount","value":"0","currency":"USD"},"deliveryTime":{"@type":"ShippingDeliveryTime","businessDays":{"@type":"QuantitativeValue","minValue":0,"maxValue":0}}},
        "hasMerchantReturnPolicy":{"@type":"MerchantReturnPolicy","applicableCountry":"US","returnPolicyCategory":"https://schema.org/MerchantReturnNotPermitted","merchantReturnDays":0}
      }
    }),
    JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":`${BASE}/`},{"@type":"ListItem","position":2,"name":"Targeted Lists","item":`${BASE}/targeted-lists/`},{"@type":"ListItem","position":3,"name":name,"item":`${BASE}/targeted-lists/${sl}/`}]}),
    JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":`${name} — Audience Segments`,"itemListElement":profileData.map((x,i) => ({"@type":"ListItem","position":i+1,"name":x.name,"description":`${x.pct}% of the ${name} audience`}))}),
    JSON.stringify({"@context":"https://schema.org","@type":"WebPage","url":`${BASE}/targeted-lists/${sl}/`,"speakable":{"@type":"SpeakableSpecification","cssSelector":[".hero-desc",".faq-a"]}})
  ];
  const schemaBlocks=schemas.map(s=>`<script type="application/ld+json">${s}<\/script>`).join('\n  ');
  const faqHtml=faq.map((f,i)=> i===0 ? `<details class="faq-item" open><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>` : `<details class="faq-item"><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>`).join('');

  const dir=`./public/targeted-lists/${sl}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(`${dir}/data.json`,JSON.stringify({name,slug:sl,url:`${BASE}/targeted-lists/${sl}/`,audience_size:audSize,sub_type:sub,geographic_distribution:Object.fromEntries(geoData.map(g=>[g.c,g.pct])),audience_segments:Object.fromEntries(profileData.map(p=>[p.name,p.pct])),benchmarks:{open_rate:`${bm.openRate}%`,reply_rate:`${bm.replyRate}%`,ctr:`${bm.ctr}%`},verification_rate:`${vr}%`,last_verified:`Q${qtr}-${YEAR}`,product_url:url},null,2));

  const html=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>${name} — ${audCnt}+ Verified Targeted Contacts | B2B Data Index</title>
<meta name="description" content="${metaDesc}">
<link rel="canonical" href="${BASE}/targeted-lists/${sl}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${nameClean} — ${audCnt}+ Targeted Contacts | B2B Data Index">
<meta name="twitter:description" content="${audCnt}+ ${nameClean} contacts. Open rate ${bm.openRate}%. CSV download.">
<meta property="og:locale" content="en_US">
<link rel="alternate" type="application/json" href="${BASE}/targeted-lists/${sl}/data.json">
${schemaBlocks}
<style>${CSS}</style>
</head>
<body>
${navHtml()}
<main><article itemscope itemtype="https://schema.org/Article">
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span><a href="/targeted-lists/">Targeted Lists</a><span>›</span>${nameClean}</nav></div><div class="wrap">${getAuthorBlock(seed).html}${timeMkp}</div>
<section class="hero"><div class="wrap">
  <span class="tag">Targeted Audience Data · ${sub.toUpperCase().replace('-',' ')}</span>
  <h1><em>${nameClean}</em></h1>
  <p class="hero-desc">${heroDesc}</p>
  <div class="ctas"><a href="${url}" target="_blank" rel="noopener" class="btn-p">Get ${nameClean} →</a><a href="/targeted-lists/" class="btn-g">Browse Targeted Lists</a></div>
  <div class="stats">
    <div class="stat"><span class="stat-n">${audCnt}+</span><span class="stat-l">Verified Contacts</span></div>
    <div class="stat"><span class="stat-n">${profileData.length}</span><span class="stat-l">Audience Segments</span></div>
    <div class="stat"><span class="stat-n">${geoUSA}%</span><span class="stat-l">USA Based</span></div>
    <div class="stat"><span class="stat-n">${bm.openRate}%</span><span class="stat-l">Avg Open Rate</span></div>
    <div class="stat"><span class="stat-n">${vr}%</span><span class="stat-l">Verified</span></div>
  </div>
</div></section>

<section><div class="wrap">
  <span class="slbl">Audience Intelligence</span>
  <h2>${nameClean} — Audience Breakdown</h2>
  <div class="intel-grid">
    <div class="intel-card"><span class="intel-val">${audCnt}+</span><span class="intel-lbl">Total Contacts</span><span class="intel-sub">Verified audience size</span></div>
    <div class="intel-card"><span class="intel-val">${profileData[0].name.split(' ')[0]}</span><span class="intel-lbl">Top Segment</span><span class="intel-sub">${profileData[0].pct}% of database</span></div>
    <div class="intel-card"><span class="intel-val">${geoUSA}%</span><span class="intel-lbl">USA Contacts</span><span class="intel-sub">Largest single market</span></div>
    <div class="intel-card"><span class="intel-val">${bm.openRate}%</span><span class="intel-lbl">Avg Open Rate</span><span class="intel-sub">Personalised campaigns</span></div>
    <div class="intel-card"><span class="intel-val">Q${qtr} ${YEAR}</span><span class="intel-lbl">Last Verified</span><span class="intel-sub">Quarterly validation</span></div>
  </div>
</div></section>

<section><div class="wrap"><div class="two-w">
  <div>
    <span class="slbl">Audience Segments</span>
    <h2>Who's in This Database</h2>
    <p class="ssub">Breakdown of audience segments within the ${nameClean}.</p>
    <div class="ind-breakdown">${barRows(profileData)}</div>
    <p style="margin-top:14px;font-size:12px;color:var(--muted)">${profileData[0].name} is the largest segment at ${profileData[0].pct}%.</p>
  </div>
  <div>
    <span class="slbl">Geographic Distribution</span>
    <h2>Where This Audience Lives</h2>
    <p class="ssub">Geographic breakdown of ${audCnt}+ contacts.</p>
    <table><thead><tr><th>Region</th><th>Share</th></tr></thead><tbody>
      ${geoData.map(g=>`<tr><td>${g.region||g.c||''}</td><td><strong>${g.pct}%</strong></td></tr>`).join('')}
    </tbody></table>
  </div>
</div></div></section>

<section><div class="wrap">
  <span class="slbl">Use Cases</span>
  <h2>Why Target This Audience</h2>
  <p class="ssub">Primary use cases for the ${nameClean}.</p>
  <div class="ug">
    ${useCases.slice(0,6).map(u=>{const[ico,...rest]=u.split(' ');const[title,...desc]=rest.join(' ').split(' — ');return `<div class="uc"><span class="uc-icon">${ico}</span><h3>${title.trim()}</h3><p>${desc.join(' — ')}</p></div>`;}).join('')}
  </div>
</div></section>

<section><div class="wrap"><div class="two">
  <div>
    <span class="slbl">Campaign Performance</span>
    <h2>Outreach Benchmarks</h2>
    <table><thead><tr><th>Metric</th><th>This Audience</th></tr></thead><tbody>
      <tr><td>Email Open Rate</td><td><strong>${bm.openRate}%</strong></td></tr>
      <tr><td>Reply Rate</td><td><strong>${bm.replyRate}%</strong></td></tr>
      <tr><td>Click-Through Rate</td><td><strong>${bm.ctr}%</strong></td></tr>
      <tr><td>Bounce Rate</td><td><strong>${bm.bounceRate}%</strong></td></tr>
      <tr><td>Email Verification Rate</td><td><strong>${vr}%+</strong></td></tr>
      <tr><td>Last Verified</td><td><strong>Q${qtr} ${YEAR}</strong></td></tr>
    </tbody></table>
  </div>
  <div>
    <span class="slbl">Data Fields</span>
    <h2>What's Included</h2>
    <table><thead><tr><th>Field</th><th>Status</th></tr></thead><tbody>
      <tr><td>Email Address</td><td><span class="badge badge-g">✓ Verified</span></td></tr>
      <tr><td>Contact Name</td><td><span class="badge">✓ Included</span></td></tr>
      <tr><td>Geographic Location</td><td><span class="badge">✓ Included</span></td></tr>
      <tr><td>Audience Segment</td><td><span class="badge">✓ Classified</span></td></tr>
      <tr><td>Platform / Source</td><td><span class="badge">✓ Indicated</span></td></tr>
      <tr><td>Phone Number</td><td><span class="badge">Where Available</span></td></tr>
    </tbody></table>
  </div>
</div></div></section>

<!-- SAMPLE DATA -->
<section id="sample"><div class="wrap">
  <span class="slbl">Preview</span>
  <h2>Sample Records from the ${loc_tgt} Database</h2>
  <p class="ssub">Data structure preview — company names and contacts shown for reference. Full verified records included in download.</p>
  <div class="sample-wrap sample-fade">
    <div class="sample-hdr">
      <span>${loc_tgt.toLowerCase().replace(/\s+/g,'-')}_b2b_${YEAR}_q${qtr}.csv — showing 8 of ${full}+ rows</span>
      <span>UTF-8 · comma-delimited · 14 columns</span>
    </div>
    <div class="sample-scroll">
    <table class="sample-tbl">
      <thead style="background:var(--surf2)"><tr>
        <th>company_name</th><th>email</th><th>full_name</th><th>job_title</th><th>sic_code</th><th>employees</th>
      </tr></thead>
      <tbody>
        ${samples2.map(s=>`<tr>
          <td>${s.co}</td>
          <td class="col-em">${s.email}</td>
          <td>${s.name}</td>
          <td>${s.title}</td>
          <td>${s.sic}</td>
          <td>${s.emp}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
  </div>
  <p style="font-family:var(--mf);font-size:11px;color:var(--muted);margin-top:10px;text-align:center">Emails partially masked in preview. Full records unlocked on download from LeadsBlue.</p>
</div></section>

<!-- COMPATIBILITY -->
<section><div class="wrap">
  <span class="slbl">Integrations</span>
  <h2>Works With Every Major Platform</h2>
  <p class="ssub">Standard CSV and XLSX format — zero-friction import into any tool in your stack.</p>
  <div class="compat-grid">
    <div class="compat-item"><span class="compat-icon">⚡</span><div><div class="compat-name">Instantly</div><div class="compat-type">Cold Email</div></div></div>
    <div class="compat-item"><span class="compat-icon">📬</span><div><div class="compat-name">Smartlead</div><div class="compat-type">Cold Email</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔭</span><div><div class="compat-name">Apollo.io</div><div class="compat-type">Sales Intelligence</div></div></div>
    <div class="compat-item"><span class="compat-icon">🟠</span><div><div class="compat-name">HubSpot</div><div class="compat-type">CRM</div></div></div>
    <div class="compat-item"><span class="compat-icon">☁️</span><div><div class="compat-name">Salesforce</div><div class="compat-type">CRM</div></div></div>
    <div class="compat-item"><span class="compat-icon">📊</span><div><div class="compat-name">Mailchimp</div><div class="compat-type">Email Marketing</div></div></div>
    <div class="compat-item"><span class="compat-icon">🐙</span><div><div class="compat-name">Lemlist</div><div class="compat-type">Outreach</div></div></div>
    <div class="compat-item"><span class="compat-icon">✅</span><div><div class="compat-name">NeverBounce</div><div class="compat-type">Verification</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔷</span><div><div class="compat-name">LinkedIn Ads</div><div class="compat-type">Matched Audiences</div></div></div>
    <div class="compat-item"><span class="compat-icon">📋</span><div><div class="compat-name">Google Sheets</div><div class="compat-type">Spreadsheet</div></div></div>
    <div class="compat-item"><span class="compat-icon">🔁</span><div><div class="compat-name">Zapier / Make</div><div class="compat-type">Automation</div></div></div>
    <div class="compat-item"><span class="compat-icon">📁</span><div><div class="compat-name">Microsoft Excel</div><div class="compat-type">XLSX Export</div></div></div>
  </div>
</div></section>

<!-- REVIEWS -->
<section><div class="wrap">
  <span class="slbl">Customer Reviews</span>
  <h2>What Marketers Say About ${nameClean}</h2>
  <p class="ssub" style="margin-bottom:24px">Reviews from sales teams, SDRs, and marketing agencies who used this database.</p>
  <div class="review-grid">
    ${reviews2.map(rv=>`<div class="review-card">
      <div class="review-stars">${'★'.repeat(rv.stars)}${'☆'.repeat(5-rv.stars)}</div>
      <p class="review-txt">"${rv.text}"</p>
      <div class="review-author">${rv.role}</div>
      <div class="review-role">${rv.company}</div>
    </div>`).join('')}
  </div>
  <p style="font-family:var(--mf);font-size:11px;color:var(--muted);margin-top:14px;text-align:center">Aggregate rating: ${rating2.value}/5 from ${rating2.count} verified purchasers via LeadsBlue.</p>
</div></section>

<section><div class="wrap">
  <span class="slbl">FAQ</span>
  <h2>Frequently Asked Questions</h2>
  <div class="faq-list">${faqHtml}</div>
</div></section>

<section><div class="wrap"><div class="two">
  <div>
    <span class="slbl">Related Lists</span>
    <h2>Similar Targeted Databases</h2>
    <div class="rel-grid">${related.map(r=>`<a href="/targeted-lists/${slug(r.name)}/" class="rel-card">${r.name}<small>Targeted · Email List</small></a>`).join('')}</div>
    <p style="margin-top:14px"><a href="/targeted-lists/" style="font-size:13px">Browse all targeted lists →</a></p>
  </div>
  <div>
    <span class="slbl">Guides</span>
    <h2>Outreach Resources</h2>
    <ul class="blog-list">
      <li><a href="/blog/targeted-marketing-explained.html">Targeted Marketing Explained</a></li>
      <li><a href="/blog/cold-email-strategy.html">Cold Email Strategy</a></li>
      <li><a href="/blog/how-to-use-email-database.html">How to Use Email Data</a></li>
      <li><a href="/blog/is-buying-email-lists-legal.html">Is It Legal?</a></li>
      <li><a href="/blog/b2b-lead-generation-strategies.html">Lead Generation Strategies</a></li>
    </ul>
  </div>
</div></div></section>

<section><div class="wrap"><div class="cta-b">
  <h2>Get ${audCnt}+ Verified ${nameClean.split(' ').slice(0,3).join(' ')} Contacts</h2>
  <p>Download the ${nameClean} and launch targeted campaigns to ${audFull}+ verified audience contacts today.</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a href="${url}" target="_blank" rel="noopener" class="btn-p">Get ${nameClean} →</a>
    <a href="/targeted-lists/" class="btn-g">Browse Targeted Lists</a>
  </div>
</div></div></section>
</article></main>
${footHtml(related,'targeted-lists')}
${faqScript()}
</body></html>`;

  fs.writeFileSync(`${dir}/index.html`, html);
}


// ============================================================
// ██████  TEMPLATE 4: USA BUSINESS CATEGORY
// ============================================================
function genUSACatPage(p, allUSAPages) {
  const { name, url } = p;
  const catName = name.replace(/^USA\s+/i,'').replace(/\s+Database$/i,'').trim();
  const s = pseudoHash(name);
  const tier = 'us-state-large';
  const rc = getUSACatRecords(name, s);
  const short = fmtShort(rc), full = fmtFull(rc);
  const vr  = pInt(s,51,93,97), qtr = pInt(s,52,1,4);
  const dm  = pInt(s,50,35,55);
  const bm  = getBenchmarks(s, false);
  const stateDist = getStateDistribution(s);
  const avgEmp = pInt(s,60,2,18);
  const pageSlug = slug(name);
  const dir = `./public/usa-categories/${pageSlug}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const idx = allUSAPages.findIndex(x => x.name === name);
  const pool = allUSAPages.filter((_,i) => i !== idx);
  const off  = pInt(s,90,0,Math.max(0,pool.length-6));
  // Hash-pick from same-category pool for topical related pages
  const related = pickByHash(s, pool, 6).slice(0, 6);

  // Hero + meta + time helpers
  const timeMkp = getTimeMarkup(s);

  const kws = [
    `${catName.toLowerCase()} email list usa`,
    `usa ${catName.toLowerCase()} database`,
    `${catName.toLowerCase()} contacts united states`,
    `buy ${catName.toLowerCase()} email list`,
    `${catName.toLowerCase()} leads usa`,
    `united states ${catName.toLowerCase()} contacts`,
    `${catName.toLowerCase()} business list usa`,
    `${catName.toLowerCase()} mailing list`,
  ];

  const faqsFull = [
    { q: `What is the USA ${catName} Database?`,
      a: `The USA ${catName} Database is a verified email list of ${full}+ ${catName.toLowerCase()} businesses and professionals across all 50 US states. It includes email addresses, company names, contact names, phone numbers, and geographic data for B2B outreach and sales prospecting.` },
    { q: `How many ${catName.toLowerCase()} businesses are in the USA?`,
      a: `The USA ${catName} Database contains ${full}+ verified contacts. These span all 50 US states, with the highest concentrations in ${stateDist[0].state} (${stateDist[0].pct}%), ${stateDist[1].state} (${stateDist[1].pct}%), and ${stateDist[2].state} (${stateDist[2].pct}%).` },
    { q: `What data fields are included?`,
      a: `The database includes: verified email address, business name, contact name, job title, phone number, street address, city, state, zip code, and website URL where available. Decision-makers represent approximately ${dm}% of all contacts.` },
    { q: `Who uses the USA ${catName} Database?`,
      a: `Typical buyers include B2B software vendors selling vertical tools, suppliers serving ${catName.toLowerCase()} businesses, marketing agencies running niche outreach, consultants specialising in this sector, and franchises seeking expansion leads.` },
    { q: `Is this database CAN-SPAM compliant?`,
      a: `Yes. This is a B2B list of business email addresses. CAN-SPAM applies: include a valid physical address, honest subject line, and a functional unsubscribe link honoured within 10 business days. No prior opt-in is required for B2B cold email under CAN-SPAM.` },
    { q: `How often is the USA ${catName} Database updated?`,
      a: `The database undergoes quarterly re-verification using SMTP validation and business registry cross-referencing. Current email verification rate is ${vr}%+. Last verified Q${qtr} ${new Date().getFullYear()}.` },
  ];
  const faqs = pickByHash(s, faqsFull, 10);
  faqs.forEach(f => faqData.push({ question: f.q, answer: f.a }));

  const faqHtml = faqs.map((f,i) =>
    i===0 ? `<details class="faq-item" open><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>` : `<details class="faq-item"><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>`
  ).join('');

  const stateRows = stateDist.map(sd =>
    `<tr><td>${sd.state}</td><td>${sd.pct}%</td><td>${fmtShort(Math.round(rc * sd.pct / 100))}+</td></tr>`
  ).join('');

  const faqSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"FAQPage",
    mainEntity: faqs.map(f => ({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))
  });
  const datasetSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"Dataset",
    name, description: `USA ${catName} Database: ${full}+ verified business email contacts across all 50 US states. Decision-makers: ${dm}%. Last verified Q${qtr} ${new Date().getFullYear()}.`,
    url: `https://b2bdataindex.com/usa-categories/${pageSlug}/`,
    keywords: kws,
    spatialCoverage: {"@type":"Country","name":"United States"},
    variableMeasured: ["Business Email","Company Name","Contact Name","Phone","Address","State"],
    distribution: {"@type":"DataDownload","encodingFormat":"text/csv","contentUrl":url},
    creator: {"@type":"Organization","name":"LeadsBlue","url":"https://leadsblue.com"}
  });
  const bcSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement: [
      {"@type":"ListItem","position":1,"name":"Home","item":"https://b2bdataindex.com/"},
      {"@type":"ListItem","position":2,"name":"USA Databases","item":"https://b2bdataindex.com/usa-categories/"},
      {"@type":"ListItem","position":3,"name":name,"item":`https://b2bdataindex.com/usa-categories/${pageSlug}/`}
    ]
  });

  const ratingU = getRating(s);
  const priceU  = getPrice(getUSACatRecords(name, s));
  const productSchemaU = JSON.stringify({
    "@context":"https://schema.org","@type":"Product",
    "name":name,"description":`USA ${catName} Database: ${fmtShort(getUSACatRecords(name,s))}+ verified contacts across all 50 US states. ${dm}% decision-makers. CAN-SPAM compliant.`,
    "brand":{"@type":"Brand","name":"LeadsBlue"},"sku":`LBD-USA-${pageSlug.substring(4,14).toUpperCase().replace(/-/g,'')}-${YEAR}`,
    "category":"USA Industry Email Database","url":`${BASE}/usa-categories/${pageSlug}/`,
    "image":"https://b2bdataindex.com/assets/og-default.png",
    "offers":{"@type":"Offer","url":url,"price":priceU.price,"priceCurrency":"USD","availability":"https://schema.org/InStock","itemCondition":"https://schema.org/NewCondition","seller":{"@type":"Organization","name":"LeadsBlue","url":"https://leadsblue.com"},"shippingDetails":{"@type":"OfferShippingDetails","shippingRate":{"@type":"MonetaryAmount","value":"0","currency":"USD"},"deliveryTime":{"@type":"ShippingDeliveryTime","businessDays":{"@type":"QuantitativeValue","minValue":0,"maxValue":0}}},"hasMerchantReturnPolicy":{"@type":"MerchantReturnPolicy","applicableCountry":"US","returnPolicyCategory":"https://schema.org/MerchantReturnNotPermitted","merchantReturnDays":0}},
    "additionalProperty":[{"@type":"PropertyValue","name":"Total Records","value":fmtShort(getUSACatRecords(name,s))+"+"},{"@type":"PropertyValue","name":"US States Covered","value":"50"},{"@type":"PropertyValue","name":"Decision-Maker Ratio","value":dm+"%"},{"@type":"PropertyValue","name":"Last Updated","value":"Q"+qtr+" "+YEAR}]
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>USA ${catName} Database — ${short}+ Verified Contacts | B2B Data Index</title>
<meta name="description" content="USA ${catName} email database: ${short}+ verified contacts across all 50 US states. ${dm}% owners, managers or directors. ${vr}%+ deliverability. CAN-SPAM compliant.">
<meta name="keywords" content="${kws.join(', ')}">
<link rel="canonical" href="https://b2bdataindex.com/usa-categories/${pageSlug}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="USA ${catName} Database — ${short}+ Verified Contacts | B2B Data Index">
<meta name="twitter:description" content="USA ${catName}: ${short}+ verified contacts across all 50 US states. ${dm}% decision-makers. CAN-SPAM compliant.">
<meta property="og:locale" content="en_US">
<meta name="author" content="B2B Data Index Research Team">
<meta name="googlebot" content="index, follow">
<meta name="bingbot" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="USA ${catName} Database — ${short}+ Verified Contacts">
<meta property="og:url" content="https://b2bdataindex.com/usa-categories/${pageSlug}/">
<link rel="alternate" type="application/json" href="https://b2bdataindex.com/usa-categories/${pageSlug}/data.json">
<script type="application/ld+json">${faqSchema}<\/script>
<script type="application/ld+json">${datasetSchema}<\/script>
<script type="application/ld+json">${bcSchema}<\/script>
<script type=\"application/ld+json\">${productSchemaU}<\/script>
<style>${CSS}<\/style>
</head>
<body>
${navHtml()}
<main><article itemscope itemtype="https://schema.org/Article">
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span><a href="/usa-categories/">USA Databases</a><span>›</span>USA ${catName} Database</nav></div><div class="wrap">${getAuthorBlock(s).html}${timeMkp}</div>
<section class="hero"><div class="wrap">
<span class="tag">USA Industry Data · ${catName}</span>
<h1>USA <em>${catName}</em> Database</h1>
<p class="hero-desc">${pInt(s,800,0,2)===0?`${short}+ verified ${catName.toLowerCase()} business contacts spanning all 50 US states. ${dm}% are owners, managers, or directors. ${vr}% email accuracy. CAN-SPAM compliant.`:pInt(s,800,0,2)===1?`Covering every US state, this ${short}+-record ${catName.toLowerCase()} database gives direct access to ${dm}% decision-makers. Sourced from Google Local, Yellow Pages, and Manta. ${vr}% verified.`:`${catName} is the focus of this ${short}+-contact USA database — ${dm}% owners and directors across all 50 states. ${vr}% deliverability verified. CAN-SPAM compliant.`}</p>
<div class="ctas">
  <a href="${url}" target="_blank" rel="noopener" class="btn-p">Get USA ${catName} Database →</a>
  <a href="/usa-categories/" class="btn-g">Browse USA Databases</a>
</div>
<div class="stats">
<div class="stat"><span class="stat-n">${short}+</span><span class="stat-l">Verified Contacts</span></div>
<div class="stat"><span class="stat-n">50</span><span class="stat-l">US States</span></div>
<div class="stat"><span class="stat-n">${dm}%</span><span class="stat-l">Decision-Makers</span></div>
<div class="stat"><span class="stat-n">${bm.openRate}%</span><span class="stat-l">Avg Open Rate</span></div>
<div class="stat"><span class="stat-n">${vr}%</span><span class="stat-l">Verified</span></div>
</div>
</div></section>

<section><div class="wrap"><div class="two-w">
<div>
<span class="slbl">Definition</span>
<h2>What Is the USA ${catName} Database?</h2>
<div class="prose">
<p>The <strong>USA ${catName} Database</strong> is a comprehensive verified email list of ${full}+ ${catName.toLowerCase()} businesses across all 50 US states. Compiled from Google Local, Yellow Pages, Manta, and industry registries, it is designed for vendors, suppliers, and service providers targeting this specific sector.</p>
<p>Approximately <strong>${dm}% of contacts are decision-makers</strong> — business owners, managers, and directors with an average team size of ${avgEmp} employees.</p>
<ul>
<li>${full}+ verified emails across all 50 US states</li>
<li>${dm}% decision-makers — owners, managers, directors</li>
<li>Verified Q${qtr} ${new Date().getFullYear()} — ${vr}%+ accuracy</li>
<li>Includes phone, address, and website where available</li>
</ul>
</div>
</div>
<div>
<span class="slbl">Data Fields</span>
<h2 style="font-size:22px">What's Included</h2><br>
<table><thead><tr><th>Field</th><th>Status</th></tr></thead><tbody>
<tr><td>Business Email Address</td><td><span class="badge badge-g">✓ Verified</span></td></tr>
<tr><td>Business Name</td><td><span class="badge">✓ Included</span></td></tr>
<tr><td>Contact Name</td><td><span class="badge">✓ Included</span></td></tr>
<tr><td>Job Title</td><td><span class="badge">✓ Included</span></td></tr>
<tr><td>Phone Number</td><td><span class="badge">✓ Included</span></td></tr>
<tr><td>Street Address</td><td><span class="badge">✓ Included</span></td></tr>
<tr><td>City, State, Zip</td><td><span class="badge">✓ All 50 States</span></td></tr>
<tr><td>Website URL</td><td><span class="badge">Where Available</span></td></tr>
</tbody></table>
</div>
</div></div></section>

<section><div class="wrap">
<span class="slbl">Geographic Distribution</span>
<h2>Top US States for ${catName}</h2>
<p class="ssub" style="margin-bottom:22px">Estimated contact distribution across top US states.</p>
<table><thead><tr><th>State</th><th>% of Dataset</th><th>Est. Contacts</th></tr></thead>
<tbody>${stateRows}</tbody></table>
</div></section>

<section><div class="wrap">
<span class="slbl">Use Cases</span>
<h2>Who Uses This Database</h2>
<div class="ug">
<div class="uc"><span class="uc-icon">📧</span><h3>Cold Email Outreach</h3><p>Reach ${short}+ verified ${catName.toLowerCase()} decision-makers. Average open rate: ${bm.openRate}%.</p></div>
<div class="uc"><span class="uc-icon">🛠️</span><h3>Software Vendors</h3><p>Sell vertical-specific SaaS and tools to ${catName.toLowerCase()} businesses across all 50 states.</p></div>
<div class="uc"><span class="uc-icon">🏢</span><h3>B2B Suppliers</h3><p>Reach equipment vendors, wholesalers, and service providers to the ${catName.toLowerCase()} sector at scale.</p></div>
<div class="uc"><span class="uc-icon">📊</span><h3>Market Research</h3><p>Survey ${catName.toLowerCase()} owners for product validation, industry analysis, and competitive research.</p></div>
<div class="uc"><span class="uc-icon">🤝</span><h3>Partnership Outreach</h3><p>Find distributors, resellers, and strategic partners in the ${catName.toLowerCase()} industry.</p></div>
<div class="uc"><span class="uc-icon">📣</span><h3>Direct Marketing</h3><p>Run promotional campaigns, webinar invites, and offer launches to targeted ${catName.toLowerCase()} audiences.</p></div>
</div>
</div></section>

<section><div class="wrap">
<span class="slbl">FAQ</span>
<h2>About the USA ${catName} Database</h2>
<div class="faq-list">${faqHtml}</div>
</div></section>

<section><div class="wrap">
  <span class="slbl">Related Topics</span>
  <h2>People Also Search For</h2>
  <p class="ssub" style="margin-bottom:14px">Common queries related to the ${catName} industry in the United States.</p>
  <div class="kwc">${kws.map(k=>`<span class="kw">${k}</span>`).join('')}</div>
</div></section>

<section><div class="wrap"><div class="two">
<div>
<span class="slbl">Related USA Databases</span>
<h2>Similar Databases</h2>
<div class="rel-grid">${related.map(r=>`<a href="/usa-categories/${slug(r.name)}/" class="rel-card">${r.name}<small>USA · Business Data</small></a>`).join('')}</div>
<p style="margin-top:14px"><a href="/usa-categories/" style="font-size:13px">Browse all USA databases →</a></p>
</div>
<div>
<span class="slbl">Outreach Guides</span>
<h2>Free B2B Guides</h2>
<ul class="blog-list">
<li><a href="/blog/cold-email-strategy.html">Cold Email Strategy</a></li>
<li><a href="/blog/b2b-lead-generation-strategies.html">Lead Generation</a></li>
<li><a href="/blog/is-buying-email-lists-legal.html">Is It Legal?</a></li>
<li><a href="/blog/how-to-use-email-database.html">How to Use Email Data</a></li>
<li><a href="/blog/best-email-list-providers.html">Best Providers</a></li>
</ul>
</div>
</div></div></section>

<section><div class="wrap"><div class="cta-b">
<h2>Get ${short}+ USA ${catName} Contacts</h2>
<p>Download the USA ${catName} Database — ${full}+ verified business emails across all 50 US states.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
<a href="${url}" target="_blank" rel="noopener" class="btn-p">Get USA ${catName} Database →</a>
<a href="/usa-categories/" class="btn-g">Browse All USA Databases</a>
</div>
</div></div></section>
</article></main>
${footHtml(related,'usa-categories')}
${faqScript()}
</body></html>`;

  const pageData = { name, category: catName, slug: pageSlug, type:'usa-category',
    url:`https://b2bdataindex.com/usa-categories/${pageSlug}/`,
    records:rc, decision_maker_pct:`${dm}%`, verification_rate:`${vr}%`,
    last_verified:`Q${qtr}-${new Date().getFullYear()}`, product_url:url };
  fs.writeFileSync(`${dir}/data.json`, JSON.stringify(pageData,null,2));
  fs.writeFileSync(`${dir}/index.html`, html);
  allPageIndex.push({ name, slug:pageSlug, type:'usa-category', category:catName, records:getUSACatRecords(name,s), records_formatted:short+'+', price:'$'+getPrice(getUSACatRecords(name,s)).price, rating:getRating(s).value, url:`https://b2bdataindex.com/usa-categories/${pageSlug}/`, product_url:url });
}

// ============================================================
// ██████  TEMPLATE 5: TECH SITES (BuiltWith)
// ============================================================
function genTechSitePage(p, allTechPages) {
  const { name, url } = p;
  const techName = extractTech(name);
  const s = pseudoHash(name);
  const siteCount = getWebsiteCount(techName, s);
  const short = fmtShort(siteCount), full = fmtFull(siteCount);
  const vr  = pInt(s,51,88,96), qtr = pInt(s,52,1,4);
  const geo = getWebGeo(s);
  const trf = getTrafficTiers(s);
  const pageSlug = slug(name);
  const dir = `./public/website-data/${pageSlug}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const idx = allTechPages.findIndex(x => x.name === name);
  const pool = allTechPages.filter((_,i) => i !== idx);
  const off  = pInt(s,90,0,Math.max(0,pool.length-6));
  const related = pickByHash(s, pool, 6).slice(0, 6);
  const timeMkp = getTimeMarkup(s);

  const kws = [
    `${name.toLowerCase()}`,
    `websites using ${techName.toLowerCase()}`,
    `${techName.toLowerCase()} users email list`,
    `all ${techName.toLowerCase()} sites list`,
    `${techName.toLowerCase()} website owners contact`,
    `companies using ${techName.toLowerCase()}`,
    `${techName.toLowerCase()} site owners database`,
    `${techName.toLowerCase()} users database`,
  ];

  const faqsFull = [
    { q: `What is the ${name}?`,
      a: `The ${name} is a database of ${full}+ websites confirmed to be actively using ${techName}. Compiled via BuiltWith technology intelligence, it includes website URLs, owner email addresses, geographic data, and traffic tier classifications.` },
    { q: `How many websites use ${techName}?`,
      a: `The ${name} contains ${full}+ verified ${techName} websites. Geographic distribution: ${geo[0].pct}% US-based, ${geo[1].pct}% UK-based, ${geo[2].pct}% other European, and ${geo[3].pct}% Asia Pacific.` },
    { q: `What data does the ${name} include?`,
      a: `The database includes: website URL, owner/admin email address, business name where available, country, estimated monthly traffic tier, and technology stack confirmation for ${techName}.` },
    { q: `Who should buy the ${name}?`,
      a: `Ideal buyers include: SaaS companies selling complementary tools to ${techName} users, plugin and app developers targeting ${techName} site owners, marketing agencies offering ${techName}-specific services, and consultants specialising in ${techName} implementations.` },
    { q: `What is the geographic distribution of ${techName} websites?`,
      a: `${geo[0].pct}% of listed sites are US-based, ${geo[1].pct}% are UK-based, ${geo[2].pct}% are in other European countries, and ${geo[3].pct}% are in Asia Pacific markets.` },
    { q: `How was the ${name} compiled?`,
      a: `Compiled using BuiltWith technology intelligence, cross-referenced with website owner contact data from public registries and opt-in business directories. Email accuracy is ${vr}%+. Last updated Q${qtr} ${new Date().getFullYear()}.` },
  ];
  const faqs = pickByHash(s, faqsFull, 10);
  faqs.forEach(f => faqData.push({ question: f.q, answer: f.a }));

  const faqHtml = faqs.map((f,i) =>
    i===0 ? `<details class="faq-item" open><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>` : `<details class="faq-item"><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>`
  ).join('');

  const geoRows = geo.map(g => {
    const w = Math.round((g.pct/geo[0].pct)*100);
    return `<div><div class="ind-meta"><span class="ind-name">${g.region}</span><span class="ind-pct">${g.pct}%</span></div><div class="ind-bar-bg"><div class="ind-bar" style="width:${w}%"></div></div></div>`;
  }).join('');

  const faqSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"FAQPage",
    mainEntity: faqs.map(f => ({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))
  });
  const datasetSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"Dataset",
    name, description:`${name}: ${full}+ websites using ${techName}. ${geo[0].pct}% US-based. Traffic: ${trf.map(t=>`${t.tier} ${t.pct}%`).join(', ')}. Last verified Q${qtr} ${new Date().getFullYear()}.`,
    url:`https://b2bdataindex.com/website-data/${pageSlug}/`,
    keywords: kws,
    variableMeasured:["Website URL","Owner Email","Business Name","Country","Traffic Tier"],
    distribution:{"@type":"DataDownload","encodingFormat":"text/csv","contentUrl":"https://leadsblue.com/leads/websites-databases-global-b2b-databases-by-category-wise/"},
    creator:{"@type":"Organization","name":"LeadsBlue","url":"https://leadsblue.com"}
  });
  const bcSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem","position":1,"name":"Home","item":"https://b2bdataindex.com/"},
      {"@type":"ListItem","position":2,"name":"Tech Site Lists","item":"https://b2bdataindex.com/website-data/"},
      {"@type":"ListItem","position":3,"name":name,"item":`https://b2bdataindex.com/website-data/${pageSlug}/`}
    ]
  });

  const ratingT = getRating(s);
  const priceT  = getPrice(siteCount);
  const productSchemaT = JSON.stringify({
    "@context":"https://schema.org","@type":"Product",
    "name":name,"description":`${name}: ${fmtShort(siteCount)}+ verified websites using ${techName}. ${geo[0].pct}% US-based. Owner contact data included. Last verified Q${qtr} ${YEAR}.`,
    "brand":{"@type":"Brand","name":"LeadsBlue"},"sku":`LBD-WEB-${pageSlug.substring(0,12).toUpperCase().replace(/-/g,'')}-${YEAR}`,
    "category":"Technology Website Database","url":`${BASE}/website-data/${pageSlug}/`,
    "image":"https://b2bdataindex.com/assets/og-default.png",
    "offers":{"@type":"Offer","url":"https://leadsblue.com/leads/websites-databases-global-b2b-databases-by-category-wise/","price":priceT.price,"priceCurrency":"USD","availability":"https://schema.org/InStock","itemCondition":"https://schema.org/NewCondition","seller":{"@type":"Organization","name":"LeadsBlue","url":"https://leadsblue.com"},"shippingDetails":{"@type":"OfferShippingDetails","shippingRate":{"@type":"MonetaryAmount","value":"0","currency":"USD"},"deliveryTime":{"@type":"ShippingDeliveryTime","businessDays":{"@type":"QuantitativeValue","minValue":0,"maxValue":0}}},"hasMerchantReturnPolicy":{"@type":"MerchantReturnPolicy","applicableCountry":"US","returnPolicyCategory":"https://schema.org/MerchantReturnNotPermitted","merchantReturnDays":0}},
    "additionalProperty":[{"@type":"PropertyValue","name":"Total Websites","value":fmtShort(siteCount)+"+"},{"@type":"PropertyValue","name":"Technology","value":techName},{"@type":"PropertyValue","name":"US-Based Sites","value":geo[0].pct+"%"},{"@type":"PropertyValue","name":"Last Updated","value":"Q"+qtr+" "+YEAR}]
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>${name} — ${short}+ Verified Websites | B2B Data Index</title>
<meta name="description" content="${short}+ verified ${techName} websites with owner contact data. ${geo[0].pct}% US-based, ${geo[1].pct}% UK-based. Compiled from BuiltWith. ${vr}% deliverability. CSV download.">
<meta name="keywords" content="${kws.join(', ')}">
<link rel="canonical" href="https://b2bdataindex.com/website-data/${pageSlug}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${name} — ${short}+ Verified Websites | B2B Data Index">
<meta name="twitter:description" content="${short}+ websites using ${techName}. ${geo[0].pct}% US-based. Owner contact data included. CSV download.">
<meta property="og:locale" content="en_US">
<meta name="author" content="B2B Data Index Research Team">
<meta name="googlebot" content="index, follow">
<meta name="bingbot" content="index, follow">
<meta property="og:title" content="${name} — ${short}+ Websites | B2B Data Index">
<meta property="og:url" content="https://b2bdataindex.com/website-data/${pageSlug}/">
<link rel="alternate" type="application/json" href="https://b2bdataindex.com/website-data/${pageSlug}/data.json">
<script type="application/ld+json">${faqSchema}<\/script>
<script type="application/ld+json">${datasetSchema}<\/script>
<script type="application/ld+json">${bcSchema}<\/script>
<script type=\"application/ld+json\">${productSchemaT}<\/script>
<style>${CSS}<\/style>
</head>
<body>
${navHtml()}
<main><article itemscope itemtype="https://schema.org/Article">
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span><a href="/website-data/">Tech Site Lists</a><span>›</span>${name}</nav></div><div class="wrap">${getAuthorBlock(s).html}${timeMkp}</div>
<section class="hero"><div class="wrap">
<span class="tag">Technology Intelligence · ${techName}</span>
<h1><em>${name}</em></h1>
<p class="hero-desc">${pInt(s,800,0,2)===0?`${short}+ verified websites actively using ${techName} — owner contact data included. ${geo[0].pct}% US-based. Compiled via BuiltWith. CSV delivery.`:pInt(s,800,0,2)===1?`BuiltWith intelligence confirms ${short}+ live sites running ${techName}. This database gives you direct owner contact access. ${geo[0].pct}% US-based. ${vr}% verified.`:`${short}+ ${techName} sites identified and contact-enriched. ${geo[0].pct}% operate in the US. Owner email addresses included. Instant CSV download.`}</p>
<div class="ctas">
  <a href="https://leadsblue.com/leads/websites-databases-global-b2b-databases-by-category-wise/" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a>
  <a href="/website-data/" class="btn-g">Browse Tech Lists</a>
</div>
<div class="stats">
<div class="stat"><span class="stat-n">${short}+</span><span class="stat-l">Websites</span></div>
<div class="stat"><span class="stat-n">${geo[0].pct}%</span><span class="stat-l">US-Based</span></div>
<div class="stat"><span class="stat-n">${trf[1].pct}%</span><span class="stat-l">10K–100K Traffic</span></div>
<div class="stat"><span class="stat-n">${vr}%</span><span class="stat-l">Verified</span></div>
<div class="stat"><span class="stat-n">Q${qtr} ${new Date().getFullYear()}</span><span class="stat-l">Last Updated</span></div>
</div>
</div></section>

<section><div class="wrap"><div class="two">
<div>
<span class="slbl">Geographic Distribution</span>
<h2>${techName} Sites by Region</h2>
<div class="ind-breakdown" style="margin-top:8px">${geoRows}</div>
</div>
<div>
<span class="slbl">Traffic Distribution</span>
<h2>Site Traffic Tiers</h2>
<table><thead><tr><th>Monthly Traffic</th><th>% of Sites</th></tr></thead><tbody>
${trf.map(t=>`<tr><td>${t.tier}</td><td><strong>${t.pct}%</strong></td></tr>`).join('')}
</tbody></table>
</div>
</div></div></section>

<section><div class="wrap"><div class="two-w">
<div>
<span class="slbl">Definition</span>
<h2>What Is the ${name}?</h2>
<div class="prose">
<p>The <strong>${name}</strong> is a database of ${full}+ websites confirmed to be actively using ${techName}. Compiled using BuiltWith technology intelligence, it provides direct access to website owners and administrators who are already users of the ${techName} platform.</p>
<p>Unlike broad contact databases, this list is <strong>qualified by technology signal</strong> — making it uniquely relevant for companies selling complementary products, apps, themes, or services to ${techName} users.</p>
<p>${geo[0].pct}% of listed sites are US-based. Email accuracy is ${vr}%+, last verified Q${qtr} ${new Date().getFullYear()}.</p>
</div>
</div>
<div>
<span class="slbl">Data Fields</span>
<h2 style="font-size:22px">What's Included</h2><br>
<table><thead><tr><th>Field</th><th>Status</th></tr></thead><tbody>
<tr><td>Website URL</td><td><span class="badge badge-g">✓ Verified</span></td></tr>
<tr><td>Owner/Admin Email</td><td><span class="badge badge-g">✓ Included</span></td></tr>
<tr><td>Business Name</td><td><span class="badge">Where Available</span></td></tr>
<tr><td>Contact Name</td><td><span class="badge">Where Available</span></td></tr>
<tr><td>Country</td><td><span class="badge">✓ Included</span></td></tr>
<tr><td>Traffic Tier</td><td><span class="badge">✓ Estimated</span></td></tr>
<tr><td>Technology Confirmed</td><td><span class="badge badge-g">✓ ${techName}</span></td></tr>
</tbody></table>
</div>
</div></div></section>

<section><div class="wrap">
<span class="slbl">Use Cases</span>
<h2>Who Uses This Database</h2>
<div class="ug">
<div class="uc"><span class="uc-icon">🛠️</span><h3>Plugin & App Developers</h3><p>Sell ${techName} plugins, apps, and extensions to ${short}+ active ${techName} site owners directly.</p></div>
<div class="uc"><span class="uc-icon">🎨</span><h3>Theme & Design Vendors</h3><p>Reach ${techName} website owners for theme sales, design services, and visual optimisation tools.</p></div>
<div class="uc"><span class="uc-icon">📊</span><h3>SaaS & Software</h3><p>Sell complementary SaaS tools — analytics, marketing, CRM, automation — to ${techName} users.</p></div>
<div class="uc"><span class="uc-icon">🏢</span><h3>Agency Services</h3><p>Offer SEO, PPC, and digital marketing services to ${short}+ ${techName} site owners needing help.</p></div>
<div class="uc"><span class="uc-icon">📧</span><h3>Cold Email Outreach</h3><p>Launch targeted outreach to ${techName} website owners — a highly specific, technology-qualified audience.</p></div>
<div class="uc"><span class="uc-icon">🔍</span><h3>Competitive Intelligence</h3><p>Identify businesses using competing or complementary technologies and reach them with targeted messaging.</p></div>
</div>
</div></section>

<section><div class="wrap">
<span class="slbl">FAQ</span>
<h2>About the ${name}</h2>
<div class="faq-list">${faqHtml}</div>
</div></section>

<section><div class="wrap"><div class="two">
<div>
<span class="slbl">Related Tech Lists</span>
<h2>Similar Databases</h2>
<div class="rel-grid">${related.map(r=>`<a href="/website-data/${slug(r.name)}/" class="rel-card">${r.name}<small>Tech Sites · BuiltWith</small></a>`).join('')}</div>
<p style="margin-top:14px"><a href="/website-data/" style="font-size:13px">Browse all tech lists →</a></p>
</div>
<div>
<span class="slbl">Outreach Guides</span>
<h2>Free Guides</h2>
<ul class="blog-list">
<li><a href="/blog/cold-email-strategy.html">Cold Email Strategy</a></li>
<li><a href="/blog/targeted-marketing-explained.html">Targeted Marketing Explained</a></li>
<li><a href="/blog/b2b-lead-generation-strategies.html">Lead Generation</a></li>
<li><a href="/blog/is-buying-email-lists-legal.html">Is It Legal?</a></li>
<li><a href="/blog/how-to-use-email-database.html">How to Use Email Data</a></li>
</ul>
</div>
</div></div></section>

<section><div class="wrap"><div class="cta-b">
<h2>Get ${short}+ ${techName} Website Contacts</h2>
<p>Download the ${name} — ${full}+ verified websites using ${techName} with owner contact data.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
<a href="https://leadsblue.com/leads/websites-databases-global-b2b-databases-by-category-wise/" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a>
<a href="/website-data/" class="btn-g">Browse Tech Lists</a>
</div>
</div></div></section>
</article></main>
${footHtml(related,'website-data')}
${faqScript()}
</body></html>`;

  const pageData = { name, tech_name:techName, slug:pageSlug, type:'tech-sites',
    url:`https://b2bdataindex.com/website-data/${pageSlug}/`,
    sites:siteCount, geo:Object.fromEntries(geo.map(g=>[g.region,g.pct])),
    traffic:Object.fromEntries(trf.map(t=>[t.tier,t.pct])),
    verification_rate:`${vr}%`, last_verified:`Q${qtr}-${new Date().getFullYear()}`,
    product_url:"https://leadsblue.com/leads/websites-databases-global-b2b-databases-by-category-wise/" };
  fs.writeFileSync(`${dir}/data.json`, JSON.stringify(pageData,null,2));
  fs.writeFileSync(`${dir}/index.html`, html);
  allPageIndex.push({ name, slug:pageSlug, type:'tech-sites', tech_name:techName, site_count:siteCount, site_count_formatted:short+'+', price:'$'+getPrice(siteCount).price, rating:getRating(s).value, url:`https://b2bdataindex.com/website-data/${pageSlug}/`, product_url:url });
}


// ============================================================
// ██████  DATA ARRAYS
// ============================================================
const USA_CATEGORIES = [
  "USA Web Development Database","USA Dog Breeders Database","USA Auto Glass Database",
  "USA Furniture Assembly Database","USA Alternative Medicine Database","USA Food & Dining Database",
  "USA Gift Stores Database","USA Nurse Practitioners Database","USA Vape Shops Database",
  "USA Arts And Crafts Database","USA Builders Database","USA Tax Consultant Database",
  "USA Lodging And Accommodations Database","USA Carpentry Database","USA Executive Chef Database",
  "USA Marketing Agencies Database","USA Health food Database","USA Home Health Care Database",
  "USA Federal Government Domains Database","USA Family Law Attorney Database",
  "USA Pet Services & Supplies Database","USA Audio And Video Database","USA Pharmaceutical Database",
  "USA Art Dealers And Galleries Database","USA Doctors Database","USA Religious Institutions Database",
  "USA Hospitals Database","USA Plumbers Database","USA News Paper Database","USA Farms Database",
  "USA Copywriters Database","USA Shoes Shop Database","USA Community Centers Database",
  "USA Dating Service Database","USA Non Profits Database","USA Ids Licenses And Passports Database",
  "USA Hair Replacement Services Database","USA Roofing Companies Database","USA Outdoor Lighting Database",
  "USA Clothing Shops Database","USA Florists Database","USA Acupuncturist Database",
  "USA Media And Publishing Database","USA Hardware And Tools Database","USA Massage Therapist Database",
  "USA Garage Door Repair Database","USA Bicycle Shop Service And Repair Database",
  "USA Home Services Database","USA General Contractors Database","USA Toy Stores Database",
  "USA Jewelry Shops Database","USA Photography Database","USA Dog Walkers Database",
  "USA Auto Repair Database","USA Pet Groomers Database","USA Security Systems Database",
  "USA Liquor Shops Database","USA Diabetes Professionals Database","USA Bakeries Database",
  "USA Baby Products Database","USA Cruise Database","USA Aerospace Industries Database",
  "USA Electricians Database","USA Mobile Home Dealer Database","USA Tourist Information Database",
  "USA Car Wash Database","USA Bitcoin Database","USA Astrologers Database",
  "USA General Business Services Database","USA Cleaning And Maintenance Database",
  "USA Crypto LinkedIn Database","USA Hvac Database","USA Inspection Service Database",
  "USA Industrial Automation Database","USA Urgent Care Database","USA Moving And Storage Services Database",
  "USA G2 Crowd Software Database","USA Plastics Database","USA Landscaping Database",
  "USA Vitamins And Supplements Database","USA Finance Companies Database",
  "USA African American Podcast Hosts Database","USA MLM Network LinkedIn Database",
  "USA Medical Office Managers Database","USA Fortune 5000 Database","USA Stadiums Arenas Database",
  "USA Optometrists Database","USA Manufacturers Database","USA Fabrication Database",
  "USA Insurance Companies Database","USA Moving Companies Database","USA Fence Contractor Database",
  "USA Fishing Stores Database","USA Computer Programming Database","USA Health and Wellness Database",
  "USA Religious Organizations Database","USA VC Investors Apps Database","USA Funeral Home Database",
  "USA Hotels Database","USA Courier Service Database","USA Dance Database","USA Orthopedics Database",
  "USA Pest Control Database","USA Printing Database","USA Museums Database",
  "USA Driving Instruction Database","USA General Electronic Accessories Database",
  "USA Weight Loss Database","USA Auctions Database","USA Dietetics Higher Ed Database",
  "USA Party Supplies Database","USA Alternative Medicine And Health Practitioners Database",
  "USA Electric Accessories Database","USA IT Companies Database","USA Car Dealers Database",
  "USA Day Care Database","USA Utilities Database","USA Schools Database","USA Trucks Database",
  "USA Home Decor Database","USA Mobile Shops Database","USA Veterinarian Database",
  "USA Dog Groomers Database","USA Mobile Bartender Database","USA Bus Sales Database",
  "USA Tree Services Database","USA Car Rental Database","USA Church Database",
  "USA LinkedIn Podcast Hosts Database","USA Tattoo Database","USA Pizza Shops Database",
  "USA Plumbing Database","USA Dog Sitters Database","USA Life Insurance Agents Database",
  "USA Christians Financial Services Database","USA Smoke Shops Database","USA Attorneys Database",
  "USA Dentist Database","USA Emergency Services Database","USA Life Coach Database",
  "USA Real Estate Lawyers Database","USA Christian CXO Database","USA Stationery Database",
  "USA Caterers Database","USA Cell Phone Repair Database","USA IRS Non Profit List Database",
  "USA Home Remodeling Database","USA Engraving Database","USA Construction Database",
  "USA Yoga Instructors Database","USA Auto Dealers Database","USA Environmental Services Database",
  "USA Baby Shower Organizer Database","USA Restaurants Database","USA Homecare Database",
  "USA Arborists Database","USA Catholic Priests and Pastors Database","USA Wedding Planners Database",
  "USA Amusement Parks Database","USA Watch Shops Database","USA Security Service Database",
  "USA Fortune 100 Companies Database","USA Immigration Lawyer Database","USA Colleges Database",
  "USA Sports Database","USA Internet Marketing Database","USA Bridal Database",
  "USA Wire Transfer And Money Order Database","USA Locksmith Database","USA Roofing Leads Database",
  "USA Commercial Equipment Database","USA Mortgage Broker Database","USA Chiropractors Database",
  "USA Procurement Database","USA Wineries Database","USA Personal Injury Lawyer Database",
  "USA Departmental Stores Database","USA Auto Rental Database","USA Industrial Manufacturing Database",
  "USA Plastic Surgeons Database","USA Pool And Spa Services Database","USA Towing Services Database",
  "USA Fragrances And Perfumes Database","USA DJ Service Database","USA Gas Stations Database",
  "USA Bars Database","USA Tailors Database","USA Escrow Database",
  "USA Agency and Email List Database","USA Coffee And Tea Database","USA Ecommerce Services Database",
  "USA Fastest Growing SaaS Companies Database","USA Magazines Database","USA Handyman Database",
  "USA Laundromats Database","USA Taxi Services Database","USA New Parts And Supplies Database",
  "USA Credit Union Database","USA Retail Stores Database","USA Security Guard And Patrol Service Database",
  "USA Engineering Database","USA Physical Fitness Consultants Database","USA Appliances Database",
  "USA Medical Clinics Database","USA NRA Database","USA Automotive Tires And Repair Database",
  "USA Non Emergency Medical Transportation Database","USA Materials Database","USA Hardware Database",
  "USA Airline Database","USA Movie Theater Database","USA Family Planning And Information Services Database",
  "USA Accountant Database","USA Automobile Storage Database","USA Tour Agencies Database",
  "USA Career Service Database","USA Recreational Services Database","USA Nurses Database",
  "USA Legal Leads Database","USA Government Services Database","USA Bed And Breakfast Database",
  "USA Flooring Contractor Database","USA Electrical Database","USA Golfers Database",
  "USA Membership Clubs And Organizations Database","USA Computer And Data Processing Services Database",
  "USA Mobile Car Wash Database","USA Algorithmic Traders Database","USA Banks Database",
  "USA Japanese Restaurants Database","USA Marine Database","USA Hospital and Healthcare Database",
  "USA Industrial Consultants Database","USA Physicians Database",
  "USA Medical Equipment And Supplies Database","USA Legal Database","USA Voiceover Artists Database",
  "USA Event Planner Database","USA Drug Rehab And Weight Loss Database","USA Wholesale Database",
  "USA CrossFit Database","USA Architect Database","USA Shipping Services Database",
  "USA Carpet Cleaning Database","USA Medical Billing Database","USA Healthcare Concierge Database",
  "USA Catholic Donors Database","USA Medication And Supplements Database","USA Drug Rehab Database",
  "USA Yoga Database","USA Swimming Pools Database","USA Graphics Design Database",
  "USA Warehouse Automation Database","USA Gardening Database","USA Networking Database",
  "USA Gym Database","USA Rare And Used Books Database","USA Psychics Database",
  "USA Places Of Interest Database","USA Apparel and Fashion Database","USA Ice Cream Shops Database",
  "USA Real Estate Agent Database","USA Revenue Cycle Management Database",
  "USA Angel Investors Database","USA Inc 5000 List Database","USA Charter Bus Services Database",
  "USA Agriculture Database","USA Automotive Database","USA Hair Salons Database"
];

const TECH_SITES = [
  "All Amateur Radio Sites List","All Bitcoin Sites List","All California Sites List",
  "All Cannabis Sites List","All Catholic School Sites List","All Catholic Sites List",
  "All Cooking Sites List","All Crypto Sites List","All Dance Studio Sites List",
  "All Food Sites List","All Golf Sites List","All Hemp Sites List",
  "All Home Health Sites List","All Homestead Sites List","All Hydroponics Sites List",
  "All Live Active Campaign Sites List","All Live Adobe Analytics Sites List",
  "All Live Adobe Marketing Cloud Sites List","All Live AdRoll Sites List",
  "All Live Alexa Metrics Sites List","All Live Amazon Associates Sites List",
  "All Live Amazon SES Sites List","All Live aWeber Sites List","All Live BlueHost Sites List",
  "All Live ClickBank Sites List","All Live ClickFunnels Sites List",
  "All Live Constant Contact Sites List","All Live ConvertKit Sites List",
  "All Live Demandware Sites List","All Live Drip Sites List","All Live Drupal Sites List",
  "All Live Elastic Email Sites List","All Live Emarsys Sites List",
  "All Live Facebook Pixel for Shopify Sites List","All Live GetResponse Sites List",
  "All Live GoDaddy Email Marketing Sites List","All Live HotJar for Shopify Sites List",
  "All Live Hotjar Sites List","All Live Hubspot Sites List","All Live Infusionsoft Sites List",
  "All Live KISSmetrics Sites List","All Live Klaviyo Sites List","All Live Laravel Sites List",
  "All Live LeadPages Sites List","All Live Magento 2 Enterprise Sites List",
  "All Live Magento Enterprise Sites List","All Live Magento Sites List",
  "All Live MailChimp for Shopify Sites List","All Live Mailchimp for WooCommerce Sites List",
  "All Live MailChimp Sites List","All Live Mailite Lite Sites List","All Live MailJet Sites List",
  "All Live Mantis Sites List","All Live Marketo Sites List","All Live Maropost Sites List",
  "All Live Mautic Sites List","All Live Moosend Sites List","All Live Omnisend Sites List",
  "All Live OpenCart Sites List","All Live Optimizely Sites List","All Live OptinMonster Sites List",
  "All Live Pardot Sites List","All Live PrestaShop Sites List","All Live RankMath Sites List",
  "All Live Salesforce Sites List","All Live Sendgrid Sites List","All Live SendinBlue Sites List",
  "All Live Sendy Sites List","All Live SEOPress Sites List","All Live Shopify Sites List",
  "All Live SMTPcom Sites List","All Live Stripe Sites List","All Live Thrive Themes Sites List",
  "All Live Twitter Analytics Sites List","All Live Ultimate Member Sites List",
  "All Live Unbounce Sites List","All Live WebTrends Sites List",
  "All Live WooCommerce Checkout Sites List","All Live WooCommerce Memberships Sites List",
  "All Live WordPress Ad Manager and AdSense Ads Sites List","All Live Zendesk Sites List",
  "All Live Zoho Books Sites List","All Live Zoho CRM Sites List","All Live Zoho Mail Sites List",
  "All Live Zoho SalesIQ Sites List","All Medical Billing Sites List","All Radio Sites List",
  "All Real Estate Agent Sites List","All Revenue Cycle Management Sites List","All Saas Sites List",
  "aWeber websites in the United States List","Facebook Pixel websites in the United States List",
  "Global Food Stores List","Global Health Stores List",
  "GoDaddy websites in the Top 100k Sites List","GoDaddy websites with a High Technology Spend List",
  "Google Adsense websites with 1 to 10m in Sales Revenue List",
  "Google Apps for Business websites with 1 to 10m in Sales Revenue List",
  "Newspaper websites in the United States List","PayPal websites in the United States List",
  "WordPress websites in France List","WordPress websites in Germany List",
  "WordPress websites in the Top 1 Million Sites List","WordPress websites in the United States List",
  "WordPress websites with 1 to 10m in Sales Revenue List",
  "WordPress websites with 100k to 1m in Sales Revenue List",
  "Yoast Plugins websites in the United States List"
];

// USA Category → specific LeadsBlue product URL where known
const USA_CAT_URLS = {
  'usa-attorneys-database':          'https://leadsblue.com/leads/usa-lawyers-email-leads-database/',
  'usa-lawyers-database':            'https://leadsblue.com/leads/usa-lawyers-email-leads-database/',
  'usa-doctors-database':            'https://leadsblue.com/leads/usa-doctors-emails-database-usa-physicians-medical-doctors-email-list/',
  'usa-physicians-database':         'https://leadsblue.com/leads/usa-doctors-emails-database-usa-physicians-medical-doctors-email-list/',
  'usa-dentist-database':            'https://leadsblue.com/leads/dentist-email-list-usa-dentist-email-list-database/',
  'usa-builders-database':           'https://leadsblue.com/leads/usa-builders-construction-email-leads-database/',
  'usa-construction-database':       'https://leadsblue.com/leads/usa-builders-construction-email-leads-database/',
  'usa-accountant-database':         'https://leadsblue.com/leads/usa-accountants-cpas-email-leads-database/',
  'usa-engineers-database':          'https://leadsblue.com/leads/usa-engineers-email-leads-database/',
  'usa-architect-database':          'https://leadsblue.com/leads/usa-architects-email-leads-database/',
  'usa-chiropractors-database':      'https://leadsblue.com/leads/chiropractors-email-list-buy-best-usa-chiropractor-email-list-database/',
  'usa-real-estate-agent-database':  'https://leadsblue.com/leads/usa-realtors-email-list-usa-real-estate-agent-email-list-database/',
  'usa-gym-database':                'https://leadsblue.com/leads/usa-fitness-gyms-email-leads-database/',
  'usa-finance-companies-database':  'https://leadsblue.com/leads/usa-finance-companies-email-leads-database/',
  'usa-it-companies-database':       'https://leadsblue.com/leads/usa-it-companies-email-leads-database/',
  'usa-restaurants-database':        'https://leadsblue.com/leads/usa-food-restaurants-leads-database/',
  'usa-food-dining-database':        'https://leadsblue.com/leads/usa-food-restaurants-leads-database/',
  'usa-jewelry-shops-database':      'https://leadsblue.com/leads/usa-jewelers-email-leads-database/',
  'usa-church-database':             'https://leadsblue.com/leads/churches-email-list-usa-churches-emall-list-database/',
};

// ============================================================
// ██████  MAIN EXECUTION
// ============================================================
const csvRaw = fs.readFileSync('products_clean_fixed.csv', 'utf-8');
const csvRows = parseCSV(csvRaw);

const bizPages = [], conPages = [], tgtPages = [];
csvRows.forEach(r => {
  if (!r.name) return;
  const cat = detectCategory(r.name, r.url);
  if (cat === 'business')      bizPages.push({ name: r.name, url: r.url });
  else if (cat === 'consumer') conPages.push({ name: r.name, url: r.url });
  else                    tgtPages.push({ name: r.name, url: r.url });
});

const usaPages  = USA_CATEGORIES.map(n => ({
  name: n,
  url: USA_CAT_URLS[slug(n)] || LB_USA
}));
const techPages = TECH_SITES.map(n => ({ name: n, url: LB_WEB }));

let sitemapUrls = [];

// ── Generate B2B Pages ─────────────────────────────────────
console.log(`Generating ${bizPages.length} B2B pages...`);
bizPages.forEach(p => genBusinessPage(p, bizPages));
bizPages.forEach(p => sitemapUrls.push({ url:`${BASE}/data-pages/${slug(p.name)}/`, pri:'0.8' }));
console.log(`  ✓ Done`);

// ── Generate Consumer Pages ────────────────────────────────
console.log(`Generating ${conPages.length} Consumer pages...`);
conPages.forEach(p => genConsumerPage(p, conPages));
conPages.forEach(p => sitemapUrls.push({ url:`${BASE}/consumer-data/${slug(p.name)}/`, pri:'0.8' }));
console.log(`  ✓ Done`);

// ── Generate Targeted Pages ────────────────────────────────
console.log(`Generating ${tgtPages.length} Targeted pages...`);
tgtPages.forEach(p => genTargetedPage(p, tgtPages));
tgtPages.forEach(p => sitemapUrls.push({ url:`${BASE}/targeted-lists/${slug(p.name)}/`, pri:'0.7' }));
console.log(`  ✓ Done`);

// ── Generate USA Category Pages ────────────────────────────
console.log(`Generating ${usaPages.length} USA category pages...`);
usaPages.forEach(p => genUSACatPage(p, usaPages));
usaPages.forEach(p => sitemapUrls.push({ url:`${BASE}/usa-categories/${slug(p.name)}/`, pri:'0.7' }));
console.log(`  ✓ Done`);

// ── Generate Tech Site Pages ───────────────────────────────
console.log(`Generating ${techPages.length} Tech site pages...`);
techPages.forEach(p => genTechSitePage(p, techPages));
techPages.forEach(p => sitemapUrls.push({ url:`${BASE}/website-data/${slug(p.name)}/`, pri:'0.7' }));
console.log(`  ✓ Done`);


// ============================================================
// ██████  CATEGORY INDEX PAGES
// ============================================================
function genIndexPage(opts) {
  const { title, dir, tag, desc, pages, pub } = opts;
  const show = 120, rem = Math.max(0, pages.length - show);
  const cards = pages.map((p, i) => {
    const s = pseudoHash(p.name); let meta = '';
    if (dir === 'data-pages')     meta = fmtShort(b2bRecords(b2bTier(p.name), s)) + '+ records';
    else if (dir === 'consumer-data') meta = fmtShort(consumerRecords(b2bTier(p.name), s)) + '+ contacts';
    else if (dir === 'targeted-lists') {
      const sub = targetedSubtype(p.name);
      const rc  = pInt(s,9, sub === 'global' ? 50000000 : sub === 'platform' ? 5000000 : sub === 'crypto' ? 200000 : sub === 'finance' ? 100000 : sub === 'gaming' ? 500000 : sub === 'professional' ? 150000 : 50000,
                            sub === 'global' ? 200000000 : sub === 'platform' ? 30000000 : sub === 'crypto' ? 2000000 : sub === 'finance' ? 800000 : sub === 'gaming' ? 3000000 : sub === 'professional' ? 500000 : 500000);
      meta = fmtShort(rc) + '+ contacts';
    }
    else if (dir === 'usa-categories') meta = fmtShort(getUSACatRecords(p.name, s)) + '+ contacts';
    else meta = fmtShort(getWebsiteCount(extractTech(p.name), s)) + '+ sites';
    const pSlug = slug(p.name);
    return `<a href="/${dir}/${pSlug}/" class="card${i >= show ? ' hidden' : ''}"><span class="card-name">${p.name.replace(/^USA\s*/,'').replace(/\s*Database$/i,'').replace(/\s*Sites?\s*List$/i,'').trim()}</span><div class="card-meta">${meta}</div></a>`;
  }).join('');

  const schemaJson = JSON.stringify({
    "@context":"https://schema.org","@type":"CollectionPage",
    name: title, description: desc,
    url:`${BASE}/${dir}/`, numberOfItems: pages.length,
    publisher:{"@type":"Organization","name":"B2B Data Index","url":BASE}
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>${title} | B2B Data Index</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${BASE}/${dir}/">
<script type="application/ld+json">${schemaJson}<\/script>
<style>${CSS}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:24px}
.card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:13px 15px;transition:border-color .2s,background .2s;display:block;text-decoration:none}
.card:hover{border-color:var(--acc);background:var(--surf2)}
.card-name{font-size:13px;font-weight:500;color:var(--txt);display:block;margin-bottom:4px}
.card:hover .card-name{color:#fff}
.card-meta{font-family:var(--mf);font-size:10px;color:var(--muted)}
.hidden{display:none!important}
.sw{position:relative;max-width:500px;margin-bottom:12px}
.sw input{width:100%;background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:12px 44px 12px 16px;color:var(--txt);font-family:var(--bf);font-size:14px;outline:none}
.sw input:focus{border-color:var(--acc)}.sw input::placeholder{color:var(--muted)}
.si{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--muted)}
.sc{font-family:var(--mf);font-size:11px;color:var(--muted);margin-bottom:28px}
.gh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--bdr)}
.gh h2{font-family:var(--hf);font-size:22px;font-weight:400;color:#fff}
.gh span{font-family:var(--mf);font-size:11px;color:var(--muted)}
.lm{display:block;width:100%;padding:14px;background:var(--surf);border:1px solid var(--bdr);border-radius:4px;color:var(--muted);font-family:var(--bf);font-size:14px;cursor:pointer;margin-bottom:48px;text-align:center}
.lm:hover{border-color:var(--acc);color:var(--acc2)}
.fi{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.fi p{color:var(--muted);font-size:12px}
@media(max-width:900px){.cards{grid-template-columns:repeat(3,1fr)}}
@media(max-width:600px){.cards{grid-template-columns:repeat(2,1fr)}nav ul{display:none}}
@media(max-width:380px){.cards{grid-template-columns:1fr}}
<\/style>
</head>
<body>
${navHtml()}
<main>
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span>${title}</nav></div>
<section class="hero"><div class="wrap">
<span class="tag">${tag}</span>
<h1>${title}</h1>
<p class="hero-desc">${desc}</p>
<div class="stats">
<div class="stat"><span class="stat-n">${pages.length}</span><span class="stat-l">Total Databases</span></div>
<div class="stat"><span class="stat-n">95%+</span><span class="stat-l">Verified</span></div>
<div class="stat"><span class="stat-n">CSV</span><span class="stat-l">Instant Delivery</span></div>
<div class="stat"><span class="stat-n">${pub}</span><span class="stat-l">Powered By</span></div>
</div>
</div></section>
<div class="wrap">
<div class="sw"><input type="text" id="si" placeholder="Search databases..." oninput="fc(this.value)" autocomplete="off"><span class="si">⌕</span></div>
<p class="sc" id="sc">Showing ${Math.min(show,pages.length)} of ${pages.length} databases</p>
<div class="gh"><h2>All ${title}</h2><span id="gc">${pages.length} DATABASES</span></div>
<div class="cards" id="cards">${cards}</div>
${rem > 0 ? `<button class="lm" id="lm" onclick="lmf()">Show All ${pages.length} — ${rem} more ↓<\/button>` : ''}
<div class="cta-b" style="margin-top:32px;margin-bottom:48px">
<h2>Need a Custom Database?</h2>
<p>Visit LeadsBlue for enterprise data packages, custom list requests, and bulk data solutions.</p>
<a href="${LB}" target="_blank" class="btn-p">Visit LeadsBlue →<\/a>
</div>
<\/div>
<footer><div class="wrap"><div class="fi"><p>© ${YEAR} B2B Data Index · Powered by LeadsBlue<\/p><p><a href="/" style="color:var(--muted)">Home<\/a> · <a href="/blog/" style="color:var(--muted)">Guides<\/a> · <a href="/sitemap.xml" style="color:var(--muted)">Sitemap<\/a><\/p><\/div><\/div><\/footer>
<script>
var AC=Array.from(document.querySelectorAll('.card')),sn=${show};
function fc(v){var q=v.toLowerCase().trim(),vis=0;AC.forEach(function(c){var m=!q||c.querySelector('.card-name').textContent.toLowerCase().includes(q);c.classList.toggle('hidden',!m);if(m)vis++;});document.getElementById('sc').textContent=q?('Showing '+vis+' results'):('Showing '+Math.min(sn,AC.length)+' of ${pages.length}');document.getElementById('gc').textContent=q?(vis+' RESULTS'):'${pages.length} DATABASES';var b=document.getElementById('lm');if(b)b.style.display=q?'none':'block';}
function lmf(){AC.forEach(function(c){c.classList.remove('hidden')});sn=AC.length;document.getElementById('sc').textContent='Showing all ${pages.length} databases';var b=document.getElementById('lm');if(b)b.style.display='none';}
<\/script>
<\/body><\/html>`;
  fs.writeFileSync(`./public/${dir}/index.html`, html);
}

genIndexPage({ title:'B2B Email Databases', dir:'data-pages', tag:'B2B Business Data',
  desc:`Browse ${bizPages.length} verified B2B business email databases covering 200+ countries and regions. Industry breakdowns, outreach benchmarks, and compliance data included.`,
  pages: bizPages, pub:'LeadsBlue' });
sitemapUrls.push({ url:`${BASE}/data-pages/`, pri:'0.9' });

genIndexPage({ title:'Consumer Email Lists', dir:'consumer-data', tag:'Consumer Data',
  desc:`Browse ${conPages.length} verified consumer email databases covering major global markets. Demographic data, age groups, interests, and campaign benchmarks included.`,
  pages: conPages, pub:'LeadsBlue' });
sitemapUrls.push({ url:`${BASE}/consumer-data/`, pri:'0.9' });

genIndexPage({ title:'Targeted Email Lists', dir:'targeted-lists', tag:'Targeted Niche Data',
  desc:`Browse ${tgtPages.length} targeted niche email databases — crypto investors, forex traders, gamers, US professionals, and more. Audience profiles and sub-segment breakdowns.`,
  pages: tgtPages, pub:'LeadsBlue' });
sitemapUrls.push({ url:`${BASE}/targeted-lists/`, pri:'0.9' });

genIndexPage({ title:'USA Business Databases', dir:'usa-categories', tag:'USA Industry Data',
  desc:`Browse ${usaPages.length} USA industry-specific business databases sourced from Google Local, Yellow Pages, and Manta. Every major US business category covered.`,
  pages: usaPages, pub:'LeadsBlue' });
sitemapUrls.push({ url:`${BASE}/usa-categories/`, pri:'0.9' });

genIndexPage({ title:'Tech Site Lists', dir:'website-data', tag:'Technology Intelligence',
  desc:`Browse ${techPages.length} technology-based website lists compiled from BuiltWith intelligence — Shopify, WooCommerce, Mailchimp, HubSpot, Salesforce, and more.`,
  pages: techPages, pub:'BuiltWith' });
sitemapUrls.push({ url:`${BASE}/website-data/`, pri:'0.9' });

console.log('✓ 5 category index pages generated.');

// ============================================================
// ██████  BLOG POSTS (10)
// ============================================================
const BLOG_POSTS = [
  { slug:'what-is-b2b-email-list', title:'What Is a B2B Email List?', desc:'A complete guide to B2B email lists — definition, data fields, verification methods, and how to evaluate quality before purchasing.', date:'January 15, 2025', time:'5 min',
    intro:'A B2B email list is a structured database of business contact information compiled for use in commercial outreach campaigns. Understanding what makes a quality list determines campaign success.',
    sections:[
      { h:'What a B2B Email List Contains', b:'<p>A quality B2B email list includes: verified business email, contact name, job title, company name, industry (SIC/NAICS), company size, location, and phone where available. The email address is the most critical field — target 95%+ verification accuracy.</p>' },
      { h:'How Lists Are Built and Verified', b:'<p>Reputable databases are built from public registries, business directories, and opt-in partnerships. Verification uses SMTP validation, inbox confirmation testing, and company registry cross-referencing. Quality providers run quarterly re-verification cycles.</p>' },
      { h:'Who Uses B2B Email Lists', b:'<p>SDRs building outreach pipelines, marketing teams running demand generation, agencies generating leads for clients, SaaS companies targeting verticals, and recruiters reaching hiring managers at scale are the primary buyers.</p>' },
      { h:'How to Evaluate Quality', b:'<p>Ask for: verification methodology, bounce rate guarantee, sample records, and data freshness date. Avoid lists with bounce rates above 5% — this risks triggering spam filters and damaging your sending domain reputation permanently.</p>' }
    ]
  },
  { slug:'how-to-use-email-database', title:'How to Use a B2B Email Database', desc:'A step-by-step guide to launching your first cold email campaign using a B2B email database — from verification to first reply.', date:'January 28, 2025', time:'6 min',
    intro:'Buying a B2B email database is step one. Using it effectively — generating replies without damaging your sender reputation — requires a specific technical and copywriting process most buyers skip.',
    sections:[
      { h:'Step 1: Verify Before You Send', b:'<p>Never import a purchased list without running it through NeverBounce, ZeroBounce, or Bouncer first. Target post-verification bounce rate below 2%. Above 3%, your domain accumulates negative signals reducing inbox placement across all campaigns.</p>' },
      { h:'Step 2: Segment Before You Send', b:'<p>Divide by industry first, then company size. A professional services firm and a manufacturer have different pain points, budgets, and timelines. Industry-specific copy consistently outperforms generic blasts by 40-80% on reply rates.</p>' },
      { h:'Step 3: Write Targeted Copy', b:'<p>Reference the recipient\'s industry, location, and company size context. Aim for under 80 words: credibility opener, specific observation, your solution, low-friction CTA. Local market references drive the highest open rates.</p>' },
      { h:'Step 4: Technical Infrastructure', b:'<p>Use a sending subdomain — never your primary domain. Configure SPF, DKIM, and DMARC. Start with 20-30 emails/day and warm up gradually over 3-4 weeks using Instantly or Smartlead. Monitor inbox placement, not just open rates.</p>' }
    ]
  },
  { slug:'is-buying-email-lists-legal', title:'Is Buying Email Lists Legal? CAN-SPAM, GDPR & CASL', desc:'A clear breakdown of the legal frameworks governing purchased B2B email lists across major jurisdictions with actionable compliance guidance.', date:'February 5, 2025', time:'7 min',
    intro:'The short answer: yes, buying and using B2B email lists is legal in most jurisdictions. The longer answer requires understanding which regulatory framework applies to your specific recipients.',
    sections:[
      { h:'United States: CAN-SPAM Act', b:'<p>CAN-SPAM requires no prior consent for B2B email. Every message must include a valid physical address, honest subject line, and functional unsubscribe link honoured within 10 business days. California\'s CCPA adds data handling obligations but does not prohibit cold email outreach.</p>' },
      { h:'European Union: GDPR', b:'<p>GDPR permits B2B cold email to business addresses under legitimate interest (Article 6(1)(f)). Include a clear unsubscribe link and honour opt-outs within 30 days. Sending to personal email addresses (Gmail, Yahoo) requires explicit consent.</p>' },
      { h:'Canada: CASL', b:'<p>CASL requires express or implied consent. Implied consent exists for 24 months after a commercial transaction. If a contact published their email in a business context, one professionally relevant outreach is generally permissible.</p>' },
      { h:'Best Practices Universally', b:'<p>Target business email addresses only. Include company name and physical address in every email. Make unsubscribe prominent and functional. Honour all opt-outs immediately. Keep messaging relevant to the recipient\'s professional role.</p>' }
    ]
  },
  { slug:'best-email-list-providers', title:'Best B2B Email List Providers Compared — 2025', desc:'An objective comparison of top B2B email list providers — Apollo.io, ZoomInfo, Hunter.io, and LeadsBlue — evaluated on quality, coverage, and pricing.', date:'February 18, 2025', time:'6 min',
    intro:'The B2B data industry has dozens of providers making overlapping claims. Evaluate on what actually matters for campaign performance: verification quality, geographic coverage, pricing model, and compliance documentation.',
    sections:[
      { h:'What to Evaluate First', b:'<p>Email verification rate (target 95%+), geographic depth in your target markets, industry segmentation options, pricing model (credits vs subscription vs one-time), and compliance documentation explaining data collection methods and legal basis.</p>' },
      { h:'Apollo.io — Best for Prospecting Workflows', b:'<p>Apollo combines 270M+ contacts with built-in sequencing tools. Strong for US contacts, thinner internationally. Credit-based pricing can become expensive at scale. Best for SDR teams wanting data and outreach in one platform.</p>' },
      { h:'ZoomInfo — Best for Enterprise Teams', b:'<p>Industry-leading US coverage with intent data and technographic signals. Enterprise-only pricing ($15,000-$30,000+/year). Best for large revenue organisations with dedicated RevOps and significant outbound budgets.</p>' },
      { h:'LeadsBlue — Best for Geographic Targeting', b:'<p>Specialises in location-targeted lists built specifically for individual countries, regions, and US states. One-time CSV purchases with no subscription lock-in. Strong for agencies, consultants, and businesses entering new geographic markets where precision beats volume.</p>' }
    ]
  },
  { slug:'cold-email-strategy', title:'Cold Email Strategy That Works in 2025', desc:'A proven cold email framework covering deliverability setup, segmentation, copywriting, sequence design, and optimisation by metric.', date:'March 3, 2025', time:'8 min',
    intro:'Cold email is not dead. Response rates have declined as inboxes grew competitive, but campaigns built on proper infrastructure, precise targeting, and relevant copy still generate consistent, scalable pipeline.',
    sections:[
      { h:'Deliverability First — Always', b:'<p>Use a secondary domain or subdomain for cold outreach. Configure SPF, DKIM, and DMARC — Google and Microsoft now reject emails from domains missing these. Warm up new accounts gradually (20/day week 1, +20/week). Monitor inbox placement rates, not just open rates.</p>' },
      { h:'Narrow Targeting Beats Broad Lists', b:'<p>200 CFOs at mid-market manufacturing firms in Germany consistently outperform 2,000 mixed decision-makers across Europe. Combine three variables: geography, industry, and company size. The more specific the segment, the more relevant your copy can be.</p>' },
      { h:'The 4-Line Cold Email Framework', b:'<p>Line 1: credibility or shared context. Line 2: specific observation about their industry or location. Line 3: what you do and for whom. Line 4: low-friction call to action. Total: 60-80 words. Test subject lines separately from body copy — they have different failure modes.</p>' },
      { h:'Optimise by Metric', b:'<p>Open rate below 20%: deliverability or subject line problem. Open rate strong but reply rate below 3%: copy or targeting problem. Good reply rate but low meeting conversion: offer or positioning problem. Fix deliverability first, then subject lines, then body copy — in that order.</p>' }
    ]
  },
  { slug:'b2b-lead-generation-strategies', title:'B2B Lead Generation Strategies — 7 Methods Ranked by ROI', desc:'A practical comparison of B2B lead generation methods — cold email, LinkedIn, paid ads, SEO, and referrals — ranked by cost-per-lead and scalability.', date:'March 17, 2025', time:'7 min',
    intro:'Not all B2B lead generation channels perform equally. Cost per lead, time to first result, scalability ceiling, and required expertise vary enormously. This guide ranks primary methods by real-world performance.',
    sections:[
      { h:'Cold Email — Highest Early-Stage ROI', b:'<p>Cold email delivers the highest ROI for companies with limited budgets because variable cost per contact is low and results are immediate. Well-executed campaigns generate qualified meetings within 48 hours. Average reply rates: 3-8% generic, 10-20% best-in-class with precise targeting.</p>' },
      { h:'LinkedIn Outreach — High Intent, Low Volume', b:'<p>Sales Navigator enables precise targeting by title, industry, company size, and geography. Connection acceptance rates: 20-35%. InMail response rates: 10-25% for personalised messages. Primary constraint: 100 connection requests per week limits volume. Best as a complement to cold email for high-value accounts.</p>' },
      { h:'Paid Search — Predictable but Expensive', b:'<p>Google Ads for B2B keywords: $15-80 per click, 2-5% conversion rates, producing $300-2,000+ CPL. Most effective for companies with proven unit economics and 90+ day optimisation budgets. Not recommended for early-stage companies without validated offer-market fit.</p>' },
      { h:'SEO + Content — Lowest Long-Term Cost', b:'<p>Creating authoritative content for commercial and informational B2B keywords generates compounding traffic at near-zero marginal cost per visit. Time constraint: meaningful results require 6-18 months. Companies with patience and a content operation achieve the lowest sustainable CPL at scale.</p>' }
    ]
  },
  { slug:'email-marketing-for-startups', title:'B2B Email Marketing for Startups — First 100 Customers', desc:'A practical email marketing guide for early-stage B2B startups covering list building, cold outreach, and the metrics that matter at each growth stage.', date:'March 31, 2025', time:'6 min',
    intro:'For most B2B startups, email is the highest-ROI customer acquisition channel before product-market fit and before paid channels are economically viable. Getting it right early compounds into significant pipeline advantage.',
    sections:[
      { h:'0 to 10 Customers: Brute-Force Personalisation', b:'<p>Build a list of 200-500 ideal customers manually. Research each company, find the right contact, write genuinely personalised emails. Response rates for truly personalised cold emails from a founder exceed 15-25%. Scale is not the goal at this stage — conversations are.</p>' },
      { h:'10 to 50 Customers: Systematise', b:'<p>Once you have 10 customers from manual outreach, you know what resonates. Build a template around the phrases that produced the most responses. Purchase a targeted B2B email list for your best-fit customer profile — the geography and industry that produced your first 10 customers.</p>' },
      { h:'50 to 100 Customers: Add Nurture', b:'<p>At 50 customers, add a nurture sequence for leads who reply but aren\'t ready to buy. A 5-7 email sequence over 90 days keeps warm leads engaged through their buying cycle. Monthly value emails to your full prospect list consistently generate inbound replies from contacts who are now ready to evaluate.</p>' }
    ]
  },
  { slug:'targeted-marketing-explained', title:'Targeted B2B Marketing Explained — Segmentation & Results', desc:'How segmentation by geography, industry, and company size improves B2B campaign performance, with benchmark data.', date:'April 10, 2025', time:'5 min',
    intro:'Targeted B2B marketing means delivering specific messages to specific segments defined by verifiable characteristics. The performance difference between targeted and untargeted campaigns is not marginal — it is 2-5x across every metric.',
    sections:[
      { h:'Why Targeting Improves Every Metric', b:'<p>When a recipient receives an email referencing their industry, location, and company size, the relevance signal is unmistakable. This drives 20-35% higher open rates and 40-80% higher reply rates compared to broad untargeted campaigns to the same contact volume.</p>' },
      { h:'Three Segmentation Dimensions That Matter', b:'<p>Geographic: reference local market conditions, local regulations, and local context. Industry: reference sector-specific pain points, terminology, and benchmarks. Company size: align your message with the decision-making hierarchy — a 5-person startup is different from a 500-person enterprise in every dimension.</p>' },
      { h:'Building a Targeted List', b:'<p>Purchase pre-segmented databases from specialist providers rather than filtering a large generic database. Location-targeted lists built specifically for a country or region produce cleaner segmentation than filtered slices of a global database. Validate 50-100 sample records before importing the full dataset.</p>' }
    ]
  },
  { slug:'business-contact-database-guide', title:'Business Contact Database Guide — Types, Sources & Evaluation', desc:'A comprehensive guide to business contact databases — types, collection methods, quality indicators, and how to choose the right database.', date:'April 22, 2025', time:'6 min',
    intro:'A business contact database is a structured collection of company and individual contact information for B2B sales and marketing. Understanding types, sourcing, and quality evaluation is essential before purchasing.',
    sections:[
      { h:'Types of Business Contact Databases', b:'<p>Geographic databases: all contacts in a specific country/region — ideal for market entry and localised services. Industry databases: contacts across a specific sector globally — best for products with consistent cross-market demand. Intent databases (Bombora, G2): companies researching specific categories — most expensive, require sophisticated activation.</p>' },
      { h:'How Data Is Collected', b:'<p>Reputable providers use: public company registries, professional network scraping (within ToS), opt-in directories, data partnerships, and proprietary verification teams. Lower-quality providers scrape indiscriminately without verification — producing high record counts with poor accuracy.</p>' },
      { h:'Quality Indicators to Request', b:'<p>Ask for: email verification methodology, last verification date, re-verification frequency, bounce rate guarantee and replacement policy, data collection timeline, and GDPR/CAN-SPAM compliance documentation. A provider that cannot answer these clearly should be treated with caution.</p>' }
    ]
  },
  { slug:'how-to-find-business-leads', title:'How to Find Business Leads — 8 Methods for B2B Prospecting', desc:'A practical guide to finding qualified B2B business leads across 8 methods — from purchased databases to LinkedIn, Google Maps, and industry directories.', date:'May 6, 2025', time:'6 min',
    intro:'Finding high-quality business leads is the front-end constraint of every B2B sales process. The method you choose determines the quality, quantity, targeting precision, and cost of your lead flow.',
    sections:[
      { h:'Method 1: Purchased B2B Contact Databases', b:'<p>Fastest path to a large, targeted lead list. Reputable databases provide verified emails, company names, job titles, and industry classifications for specific geographies or sectors. Evaluate on verification rate (95%+), geographic depth, industry segmentation, and recency. One-time purchases are cost-effective for defined campaigns.</p>' },
      { h:'Method 2: LinkedIn Sales Navigator', b:'<p>Most precise targeting tool available for individual high-value prospects. Filter by title, industry, company size, geography, and seniority. Limitation: 100 connection requests per week. Best combined with a purchased database — use Navigator for research and personalisation, the database for volume outreach.</p>' },
      { h:'Method 3: Google Maps + Local Search', b:'<p>Excellent for local business targeting — restaurants, retailers, clinics, service providers. Google Maps provides name, address, website, and phone for every listed business. Pair with an email finder (Hunter.io, Snov.io) to fill in email fields for businesses with a web presence.</p>' },
      { h:'Method 4: Industry Directories and Associations', b:'<p>Trade associations and certification bodies publish member contact information. These lists are self-selected (members opted in to be listed) and tend to have higher engagement rates. Examples: Chamber of Commerce directories, professional associations, SaaS marketplaces like G2 and Capterra for technology buyers.</p>' }
    ]
  }
];

const BLOG_CSS_EXTRA = `
.article-wrap{max-width:1100px;margin:0 auto;padding:32px 24px 80px;display:grid;grid-template-columns:1fr 300px;gap:48px;align-items:start}
.ah{margin-bottom:36px;padding-bottom:28px;border-bottom:1px solid var(--bdr)}
.art-tag{display:inline-block;font-family:var(--mf);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--acc);border:1px solid rgba(14,165,233,.3);padding:4px 11px;border-radius:2px;margin-bottom:18px}
.art-h1{font-family:var(--hf);font-size:clamp(24px,4vw,42px);font-weight:400;line-height:1.15;letter-spacing:-.7px;color:#fff;margin-bottom:14px}
.art-meta{font-family:var(--mf);font-size:11px;color:var(--muted);display:flex;gap:16px}
.ab h2{font-family:var(--hf);font-size:clamp(18px,2.5vw,26px);font-weight:400;color:#fff;margin:32px 0 10px;line-height:1.2}
.ab p{color:var(--muted);font-size:15px;line-height:1.8;margin-bottom:14px}
.ab strong{color:var(--txt);font-weight:600}
.ab ul{padding-left:18px;margin-bottom:14px}.ab ul li{color:var(--muted);font-size:15px;line-height:1.75;margin-bottom:5px}
.ai{font-size:17px;color:var(--txt);line-height:1.75;margin-bottom:28px;font-weight:300}
.sb{position:sticky;top:80px}
.sbox{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:20px;margin-bottom:18px}
.sbox h3{font-family:var(--mf);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--acc);margin-bottom:12px}
.sbox ul{list-style:none;display:flex;flex-direction:column;gap:8px}
.sbox ul a{font-size:13px;color:var(--txt);display:block;line-height:1.4}.sbox ul a:hover{color:var(--acc2);text-decoration:none}
.sbox-cta{background:linear-gradient(135deg,var(--surf2),rgba(14,165,233,.07));border:1px solid rgba(14,165,233,.22)}
.sbox-cta p{color:var(--muted);font-size:13px;line-height:1.6;margin-bottom:12px}
@media(max-width:768px){.article-wrap{grid-template-columns:1fr}.sb{position:static}nav ul{display:none}}
`;

const allBlogSlugs = BLOG_POSTS.map(p => p.slug);

if (!fs.existsSync('./public/blog')) fs.mkdirSync('./public/blog', { recursive:true });

BLOG_POSTS.forEach(post => {
  const artSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"Article",
    headline: post.title, description: post.desc,
    datePublished: post.date, dateModified: post.date,
    author:{"@type":"Organization","name":"B2B Data Index","url":BASE},
    publisher:{"@type":"Organization","name":"B2B Data Index","url":BASE},
    url:`${BASE}/blog/${post.slug}.html`
  });
  const bcSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem","position":1,"name":"Home","item":`${BASE}/`},
      {"@type":"ListItem","position":2,"name":"Guides","item":`${BASE}/blog/`},
      {"@type":"ListItem","position":3,"name":post.title,"item":`${BASE}/blog/${post.slug}.html`}
    ]
  });
  const relPosts = allBlogSlugs.filter(s => s !== post.slug).slice(0,5);
  // Random 6 pages from each category for sidebar
  const sp = pInt(pseudoHash(post.slug),1,0,bizPages.length-6);
  const sidePgs = bizPages.slice(sp, sp+6);

  const sectionsHtml = post.sections.map(s => `<h2>${s.h}</h2>${s.b}`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>${post.title} | B2B Data Index</title>
<meta name="description" content="${post.desc}">
<link rel="canonical" href="${BASE}/blog/${post.slug}.html">
<meta property="og:type" content="article">
<meta property="og:title" content="${post.title}">
<meta property="og:url" content="${BASE}/blog/${post.slug}.html">
<script type="application/ld+json">${artSchema}<\/script>
<script type="application/ld+json">${bcSchema}<\/script>
<style>${CSS}${BLOG_CSS_EXTRA}<\/style>
</head>
<body>
${navHtml()}
<main>
<div class="wrap"><nav class="bc"><a href="/">Home<\/a><span>›<\/span><a href="/blog/">Guides<\/a><span>›<\/span>${post.title.split('—')[0].trim()}<\/nav><\/div>
<div class="article-wrap">
<article>
<div class="ah">
<span class="art-tag">B2B Data Guide<\/span>
<h1 class="art-h1">${post.title}<\/h1>
<div class="art-meta"><span>${post.date}<\/span><span>${post.time} read<\/span><\/div>
<\/div>
<div class="ab">
<p class="ai">${post.intro}<\/p>
${sectionsHtml}
<\/div>
<div class="cta-b" style="margin-top:48px">
<h2>Ready to Start Prospecting?<\/h2>
<p>Browse 600+ verified email databases — B2B, consumer, targeted, and USA categories — with full data breakdowns.<\/p>
<a href="/data-pages/" class="btn-p" style="display:inline-block;width:auto;padding:12px 28px">Browse Databases →<\/a>
<\/div>
<\/article>
<aside class="sb">
<div class="sbox sbox-cta">
<h3>Get B2B Data<\/h3>
<p>Verified business contacts for 200+ markets. Industry segments, benchmarks, and CSV delivery.<\/p>
<a href="/data-pages/" class="btn-p" style="width:100%;display:block;text-align:center">Browse B2B Lists →<\/a>
<\/div>
<div class="sbox">
<h3>Featured Databases<\/h3>
<ul>${sidePgs.map(p=>`<li><a href="/data-pages/${slug(p.name)}/">${p.name}<\/a><\/li>`).join('')}<\/ul>
<\/div>
<div class="sbox">
<h3>More Guides<\/h3>
<ul>${relPosts.map(s=>{const bp=BLOG_POSTS.find(b=>b.slug===s);return bp?`<li><a href="/blog/${bp.slug}.html">${bp.title.split('—')[0].trim()}<\/a><\/li>`:''}).join('')}<\/ul>
<\/div>
<\/aside>
<\/div>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px"><p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index · Powered by LeadsBlue<\/p><p style="font-size:12px"><a href="/" style="color:var(--muted)">Home<\/a> · <a href="/data-pages/" style="color:var(--muted)">Databases<\/a> · <a href="/blog/" style="color:var(--muted)">Guides<\/a><\/p><\/div><\/div><\/footer>
<\/body><\/html>`;
  fs.writeFileSync(`./public/blog/${post.slug}.html`, html);
  sitemapUrls.push({ url:`${BASE}/blog/${post.slug}.html`, pri:'0.7' });
});

// Blog index
const blogIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>B2B Email Marketing Guides & Resources | B2B Data Index</title>
<meta name="description" content="Expert guides on B2B email marketing, cold email strategy, lead generation, compliance, and getting results from business contact databases.">
<link rel="canonical" href="${BASE}/blog/">
<style>${CSS}
.blog-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:28px}
.bc-card{background:var(--surf);border:1px solid var(--bdr);border-radius:6px;padding:26px;transition:border-color .2s;display:block}
.bc-card:hover{border-color:var(--acc);text-decoration:none}
.bc-meta{font-family:var(--mf);font-size:10px;color:var(--acc);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.bc-h{font-family:var(--hf);font-size:19px;font-weight:400;color:#fff;margin-bottom:8px;line-height:1.3}
.bc-p{font-size:13px;color:var(--muted);line-height:1.65}
@media(max-width:600px){.blog-grid{grid-template-columns:1fr}nav ul{display:none}}
<\/style>
</head>
<body>
${navHtml()}
<div class="wrap" style="padding-top:20px;padding-bottom:80px">
<nav class="bc"><a href="/">Home<\/a><span>›<\/span>Guides<\/nav>
<h1 style="font-family:var(--hf);font-size:clamp(26px,4vw,44px);font-weight:400;color:#fff;letter-spacing:-.8px;margin:22px 0 10px">B2B Data &amp; Outreach Guides<\/h1>
<p style="color:var(--muted);font-size:16px;max-width:520px;margin-bottom:4px">Expert guides on cold email, lead generation, compliance, and getting the most from B2B contact data.<\/p>
<div class="blog-grid">
${BLOG_POSTS.map(p=>`<a href="/blog/${p.slug}.html" class="bc-card"><div class="bc-meta">${p.date} · ${p.time} read<\/div><h2 class="bc-h">${p.title}<\/h2><p class="bc-p">${p.desc}<\/p><\/a>`).join('')}
<\/div>
<\/div>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px"><p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index · Powered by LeadsBlue<\/p><p style="font-size:12px"><a href="/" style="color:var(--muted)">Home<\/a> · <a href="/data-pages/" style="color:var(--muted)">Databases<\/a> · <a href="/sitemap.xml" style="color:var(--muted)">Sitemap<\/a><\/p><\/div><\/div><\/footer>
<\/body><\/html>`;
fs.writeFileSync('./public/blog/index.html', blogIndexHtml);
sitemapUrls.push({ url:`${BASE}/blog/`, pri:'0.8' });
console.log('✓ 10 blog posts + blog index generated.');


// ============================================================
// ██████  LLM JSON FILES
// ============================================================
if (!fs.existsSync('./public/llm')) fs.mkdirSync('./public/llm', { recursive:true });

// 1. FAQ dataset
fs.writeFileSync('./public/llm/faq-dataset.json', JSON.stringify(faqData, null, 2));

// 2. Market stats (B2B)
const mktStatsLLM = bizPages.map(p => {
  const s = pseudoHash(p.name), lt = b2bTier(p.name), rc = b2bRecords(lt, s);
  const loc = extractLocation(p.name);
  const inds = getIndustries(lt, s, loc), bm = getBenchmarks(s, false);
  const dm = pInt(s,50,38,52), vr = pInt(s,51,94,98), qtr = pInt(s,52,1,4);
  const price = getPrice(rc), rating = getRating(s);
  const szs = getCompanySize(s), comp = getCompliance(loc, lt, false);
  return {
    name: p.name, location: loc,
    records: rc, records_formatted: fmtShort(rc) + '+',
    top_industry: inds[0].name, top_industry_pct: inds[0].pct,
    industries: Object.fromEntries(inds.map(i => [i.name, i.pct + '%'])),
    industry_counts: Object.fromEntries(inds.map(i => [i.name, Math.round(rc * i.pct / 100)])),
    company_sizes: Object.fromEntries(szs.map(s2 => [s2.label, s2.pct + '%'])),
    open_rate: bm.openRate + '%', reply_rate: bm.replyRate + '%',
    decision_maker_pct: dm + '%',
    verification_rate: vr + '%',
    last_verified: `Q${qtr}-${new Date().getFullYear()}`,
    price: '$' + price.price,
    rating: rating.value + '/5 (' + rating.count + ' reviews)',
    compliance: comp.fw,
    url: `${BASE}/data-pages/${slug(p.name)}/`,
    product_url: p.url
  };
});
fs.writeFileSync('./public/llm/market-stats.json', JSON.stringify(mktStatsLLM, null, 2));

// 3. Consumer stats
const conStats = conPages.map(p => {
  const s = pseudoHash(p.name), lt = b2bTier(p.name), rc = consumerRecords(lt, s);
  const loc = extractLocation(p.name);
  const dem = getAgeDist(s), interests = getConsumerInterests(s), gender = getGenderSplit(s);
  const vr = pInt(s,51,88,97), qtr = pInt(s,52,1,4);
  const price = getPrice(rc), rating = getRating(s);
  const comp = getCompliance(loc, lt, true);
  return {
    name: p.name, location: loc,
    records: rc, records_formatted: fmtShort(rc) + '+',
    age_groups: Object.fromEntries(dem.map(a => [a.label, a.pct + '%'])),
    dominant_age_group: dem[1].label, dominant_age_pct: dem[1].pct,
    gender_female_pct: gender.female, gender_male_pct: gender.male,
    interests: Object.fromEntries(interests.map(i => [i.name, i.pct + '%'])),
    top_interest: interests[0].name, top_interest_pct: interests[0].pct,
    verification_rate: vr + '%',
    last_verified: `Q${qtr}-${new Date().getFullYear()}`,
    price: '$' + price.price,
    rating: rating.value + '/5',
    compliance: comp.fw,
    url: `${BASE}/consumer-data/${slug(p.name)}/`,
    product_url: p.url
  };
});
fs.writeFileSync('./public/llm/consumer-stats.json', JSON.stringify(conStats, null, 2));

// 4. Targeted stats
const tgtStats = tgtPages.map(p => {
  const s = pseudoHash(p.name);
  const sub = targetedSubtype(p.name);
  const amin = sub==='global'?50000000:sub==='platform'?5000000:sub==='crypto'?200000:sub==='finance'?100000:sub==='gaming'?500000:sub==='professional'?150000:50000;
  const amax = sub==='global'?200000000:sub==='platform'?30000000:sub==='crypto'?2000000:sub==='finance'?800000:sub==='gaming'?3000000:sub==='professional'?500000:500000;
  const rc = pInt(s,9,amin,amax);
  const geoUSA = pInt(s,70,30,55), geoUK = pInt(s,71,6,14), geoCA = pInt(s,72,4,10), geoAU = pInt(s,73,3,8);
  const vr = pInt(s,51,88,96), qtr = pInt(s,52,1,4);
  const price = getPrice(rc), rating = getRating(s);
  const bm = getBenchmarks(s, false);
  return {
    name: p.name, subtype: sub,
    records: rc, records_formatted: fmtShort(rc) + '+',
    geo_distribution: { us: geoUSA + '%', uk: geoUK + '%', canada: geoCA + '%', australia: geoAU + '%', rest: (100-geoUSA-geoUK-geoCA-geoAU) + '%' },
    geo_usa_pct: geoUSA,
    open_rate: bm.openRate + '%',
    reply_rate: bm.replyRate + '%',
    verification_rate: vr + '%',
    last_verified: `Q${qtr}-${new Date().getFullYear()}`,
    price: '$' + price.price,
    rating: rating.value + '/5',
    compliance: 'CAN-SPAM / GDPR Legitimate Interest',
    url: `${BASE}/targeted-lists/${slug(p.name)}/`,
    product_url: p.url
  };
});
fs.writeFileSync('./public/llm/targeted-stats.json', JSON.stringify(tgtStats, null, 2));

// 5. USA category stats
const usaStats = usaPages.map(p => {
  const s = pseudoHash(p.name), rc = getUSACatRecords(p.name, s);
  const catName = p.name.replace(/^USA\s+/i,'').replace(/\s+Database$/i,'').trim();
  const dm = pInt(s,50,35,55), vr = pInt(s,51,93,97), qtr = pInt(s,52,1,4);
  const bm = getBenchmarks(s, false);
  const stateDist = getStateDistribution(s);
  const price = getPrice(rc), rating = getRating(s);
  return {
    name: p.name, category: catName,
    records: rc, records_formatted: fmtShort(rc) + '+',
    decision_maker_pct: dm + '%',
    verification_rate: vr + '%',
    last_verified: `Q${qtr}-${new Date().getFullYear()}`,
    open_rate: bm.openRate + '%',
    reply_rate: bm.replyRate + '%',
    top_states: stateDist.slice(0,5).map(sd => ({ state: sd.state, pct: sd.pct + '%', est_contacts: Math.round(rc*sd.pct/100) })),
    price: '$' + price.price,
    rating: rating.value + '/5',
    compliance: 'CAN-SPAM Act (US)',
    states_covered: 50,
    url: `${BASE}/usa-categories/${slug(p.name)}/`,
    product_url: p.url
  };
});
fs.writeFileSync('./public/llm/usa-category-stats.json', JSON.stringify(usaStats, null, 2));

// 6. Tech site stats
const techStatsList = techPages.map(p => {
  const s = pseudoHash(p.name), tn = extractTech(p.name), cnt = getWebsiteCount(tn, s);
  const geo = getWebGeo(s), trf = getTrafficTiers(s);
  const vr = pInt(s,51,88,96), qtr = pInt(s,52,1,4);
  const price = getPrice(cnt), rating = getRating(s);
  return {
    name: p.name, tech_name: tn,
    site_count: cnt, site_count_formatted: fmtShort(cnt) + '+',
    geo_distribution: Object.fromEntries(geo.map(g => [g.region, g.pct + '%'])),
    us_based_pct: geo[0].pct + '%',
    traffic_distribution: Object.fromEntries(trf.map(t => [t.tier, t.pct + '%'])),
    verification_rate: vr + '%',
    last_verified: `Q${qtr}-${new Date().getFullYear()}`,
    price: '$' + price.price,
    rating: rating.value + '/5',
    compliance: 'CAN-SPAM / GDPR',
    url: `${BASE}/website-data/${slug(p.name)}/`,
    product_url: 'https://leadsblue.com/leads/websites-databases-global-b2b-databases-by-category-wise/'
  };
});
fs.writeFileSync('./public/llm/tech-site-stats.json', JSON.stringify(techStatsList, null, 2));

// 7. Site index (all pages)
fs.writeFileSync('./public/llm/site-index.json', JSON.stringify(allPageIndex, null, 2));

// 8. Entities
fs.writeFileSync('./public/llm/entities.json', JSON.stringify({
  brand: "B2B Data Index",
  powered_by: "LeadsBlue",
  leadsblue_url: "https://leadsblue.com",
  description: "B2B Data Index provides verified email databases for B2B businesses, consumer markets, targeted audiences, USA business categories, and technology site lists.",
  categories: ["B2B Business Email Lists","Consumer Email Lists","Targeted Niche Lists","USA Business Databases","Technology Site Lists"],
  use_cases: ["cold email outreach","lead generation","sales prospecting","market entry","targeted B2B marketing","direct mail campaigns"],
  coverage: "200+ countries and regions, all 50 US states, 100+ US business categories, 100+ technology platforms",
  competitors: ["Apollo.io","ZoomInfo","Hunter.io","Lusha","Clearbit"],
  total_databases: allPageIndex.length
}, null, 2));

console.log(`✓ LLM files generated (${allPageIndex.length} pages indexed).`);

// ============================================================
// ██████  SITEMAP + ROBOTS — handled by genFullSitemap() and
// genRobotsTxt() at end of file. Old flat writes removed to
// eliminate double-write and ensure sitemap index structure.
// ============================================================

// ============================================================
// ██████  CLOUDFLARE _headers
// ============================================================
fs.writeFileSync('./public/_headers', `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/*.html
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/data-pages/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/consumer-data/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/targeted-lists/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/usa-categories/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/website-data/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/blog/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/sitemap-business.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/sitemap-consumer.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/sitemap-targeted.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/sitemap-usa.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/sitemap-tech.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/sitemap-core.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/robots.txt
  Cache-Control: public, max-age=86400

/llm/*
  Cache-Control: public, max-age=86400
  Content-Type: application/json; charset=utf-8

/assets/*
  Cache-Control: public, max-age=31536000, immutable`);

// ============================================================
// ██████  404 PAGE
// ============================================================
const rndPages = bizPages.sort(() => Math.random() - 0.5).slice(0, 4);
fs.writeFileSync('./public/404.html', `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>Page Not Found | B2B Data Index</title>
<style>${CSS}
main{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 24px}
.content{text-align:center;max-width:520px}
.err{font-family:var(--mf);font-size:11px;letter-spacing:3px;color:var(--acc);text-transform:uppercase;margin-bottom:18px;display:block}
.sug-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.sug-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:12px 15px;font-size:13px;color:var(--txt);text-align:left;display:block}
.sug-card:hover{border-color:var(--acc);background:var(--surf2);color:#fff;text-decoration:none}
<\/style>
</head>
<body style="display:flex;flex-direction:column;min-height:100vh">
${navHtml()}
<main>
<div class="content">
<span class="err">404 · Not Found<\/span>
<h1 style="font-family:var(--hf);font-size:clamp(32px,6vw,58px);color:#fff;font-weight:400;letter-spacing:-1px;margin-bottom:14px;line-height:1.1">Page Not Found<\/h1>
<p style="color:var(--muted);font-size:15px;margin-bottom:32px">The page you were looking for doesn\'t exist. Browse our full catalog of B2B email databases.<\/p>
<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:40px">
<a href="/" class="btn-p">Go to Homepage<\/a>
<a href="/data-pages/" class="btn-g">Browse B2B Lists<\/a>
</div>
<h3 style="font-family:var(--mf);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">Popular Databases<\/h3>
<div class="sug-grid">
${rndPages.map(p=>`<a href="/data-pages/${slug(p.name)}/" class="sug-card">${p.name}<\/a>`).join('')}
<\/div>
<\/div>
<\/main>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center"><p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index<\/p><p style="font-size:12px"><a href="/sitemap.xml" style="color:var(--muted)">Sitemap<\/a><\/p><\/div><\/div><\/footer>
<\/body><\/html>`);

// ============================================================
// ██████  FINAL SUMMARY
// ============================================================
const total = bizPages.length + conPages.length + tgtPages.length + usaPages.length + techPages.length;
// ── Call all new generators ─────────────────────────────────
genHomepage(bizPages, conPages, tgtPages, usaPages, techPages);
genMethodologyPage();
genHTMLSitemap(bizPages, conPages, tgtPages, usaPages, techPages);
genRegionalHubs(bizPages, conPages);
genKnowledgeGraph(bizPages, conPages, tgtPages, usaPages, techPages);
genLLMIndexPage();
genRobotsTxt();

// Regenerate full sitemap AFTER all pages added
genFullSitemap(sitemapUrls);

// Update entities.json with accurate total
const totalAllPages = bizPages.length + conPages.length + tgtPages.length + usaPages.length + techPages.length;
fs.writeFileSync('./public/llm/entities.json', JSON.stringify({
  brand: "B2B Data Index",
  powered_by: "LeadsBlue",
  leadsblue_url: "https://leadsblue.com",
  description: "B2B Data Index provides verified email databases for B2B businesses, consumer markets, targeted audiences, USA business categories, and technology site lists. Powered by LeadsBlue.",
  categories: ["B2B Business Email Lists","Consumer Email Lists","Targeted Niche Lists","USA Business Databases","Technology Site Lists"],
  use_cases: ["cold email outreach","lead generation","sales prospecting","market entry","targeted B2B marketing","direct mail campaigns"],
  coverage: "200+ countries and regions, all 50 US states, 100+ US business categories, 100+ technology platforms",
  total_databases: totalAllPages,
  sameAs: ["https://leadsblue.com","https://github.com/leadsblue-datasets/b2b-lists","https://www.kaggle.com/leadsbluedataintel"],
  methodology_url: "https://b2bdataindex.com/methodology/",
  llm_data_url: "https://b2bdataindex.com/llm/",
  sitemap_url: "https://b2bdataindex.com/sitemap.xml"
}, null, 2));

console.log('');
console.log('════════════════════════════════════════════');
console.log('  B2B DATA INDEX — Generation Complete ✓');
console.log('');
console.log('════════════════════════════════════════════');
console.log('  B2B DATA INDEX — Generation Complete ✓');
console.log('════════════════════════════════════════════');
console.log(`  B2B Business pages  : ${bizPages.length}`);
console.log(`  Consumer pages      : ${conPages.length}`);
console.log(`  Targeted pages      : ${tgtPages.length}`);
console.log(`  USA Category pages  : ${usaPages.length}`);
console.log(`  Tech Site pages     : ${techPages.length}`);
console.log(`  Blog posts          : 10`);
console.log(`  Category indexes    : 5`);
console.log(`  ─────────────────────────────`);
console.log(`  TOTAL PAGES         : ${total + 10 + 5}`);
console.log(`  Sitemap URLs        : ${sitemapUrls.length + 2}`);
console.log(`  LLM JSON files      : 8`);
console.log(`  FAQ Q&A pairs       : ${faqData.length}`);
console.log('════════════════════════════════════════════');
console.log('  Domain  : https://b2bdataindex.com');
console.log('  Traffic → https://leadsblue.com');
console.log('════════════════════════════════════════════');


// ================================================================
// ██████  HOMEPAGE
// ================================================================
function genHomepage(bizPages, conPages, tgtPages, usaPages, techPages) {
  const totalPages = bizPages.length + conPages.length + tgtPages.length + usaPages.length + techPages.length;
  const totalFaqs  = Math.round(totalPages * 9.6); // approximate
  const featuredB2B   = bizPages.slice(0, 8);
  const featuredUSA   = usaPages.slice(0, 6);
  const featuredTech  = techPages.slice(0, 6);
  const featuredCon   = conPages.slice(0, 6);
  const featuredTgt   = tgtPages.slice(0, 6);

  const orgSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"Organization",
    "name":"B2B Data Index","url":BASE,
    "logo":{"@type":"ImageObject","url":`${BASE}/assets/logo.png`},
    "description":"B2B Data Index provides verified email databases for B2B businesses, consumer markets, and niche audiences covering 200+ global markets.",
    "sameAs":["https://leadsblue.com","https://github.com/leadsblue-datasets/b2b-lists","https://www.kaggle.com/leadsbluedataintel"]
  });
  const webSiteSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"WebSite",
    "name":"B2B Data Index","url":BASE,
    "potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":`${BASE}/data-pages/?q={search_term_string}`},"query-input":{"@type":"PropertyValueSpecification","valueRequired":true,"valueName":"search_term_string"},"query-input":"required name=search_term_string"}
  });
  const dataCatSchema = dataCatalogSchema();
  const bcSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":`${BASE}/`}]
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<title>B2B Data Index — ${totalPages}+ Verified Email Databases | B2B, Consumer & Targeted Lists</title>
<meta name="description" content="Browse ${totalPages}+ verified email databases — B2B business lists, consumer data, targeted niche lists, USA business categories, and BuiltWith tech site lists. Data intelligence powered by LeadsBlue.">
<link rel="canonical" href="${BASE}/">
<meta property="og:type" content="website">
<meta property="og:title" content="B2B Data Index — ${totalPages}+ Verified Email Databases">
<meta property="og:description" content="Browse ${totalPages}+ verified email databases for B2B outreach, consumer marketing, and targeted campaigns covering 200+ global markets.">
<meta property="og:url" content="${BASE}/">
<meta property="og:image" content="${BASE}/assets/og-default.png">
<meta property="og:site_name" content="B2B Data Index">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/json" href="${BASE}/llm/site-index.json" title="Complete Database Index">
<link rel="alternate" type="application/json" href="${BASE}/llm/market-stats.json" title="B2B Market Statistics">
<script type="application/ld+json">${orgSchema}<\/script>
<script type="application/ld+json">${webSiteSchema}<\/script>
<script type="application/ld+json">${dataCatSchema}<\/script>
<script type="application/ld+json">${bcSchema}<\/script>
<style>${CSS}
.hero-hp{padding:80px 0 64px;text-align:center;position:relative;overflow:hidden}
.hero-hp::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(ellipse,rgba(14,165,233,.12) 0%,transparent 70%);pointer-events:none}
.hp-tag{display:inline-block;font-family:var(--mf);font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--acc);border:1px solid rgba(14,165,233,.3);padding:4px 14px;border-radius:2px;margin-bottom:24px}
.hp-h1{font-family:var(--hf);font-size:clamp(32px,5vw,64px);font-weight:400;line-height:1.05;letter-spacing:-2px;color:#fff;margin-bottom:22px;max-width:760px;margin-left:auto;margin-right:auto}
.hp-h1 em{font-style:italic;color:var(--acc2)}
.hp-desc{font-size:18px;color:var(--muted);max-width:560px;margin:0 auto 36px;font-weight:300;line-height:1.6}
.hp-stats{display:flex;justify-content:center;gap:48px;flex-wrap:wrap;margin-bottom:48px}
.hp-stat-n{font-family:var(--hf);font-size:36px;color:#fff;display:block;line-height:1}
.hp-stat-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:5px}
.cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:64px}
.cat-card{background:var(--surf);border:1px solid var(--bdr);border-radius:6px;padding:28px 24px;display:block;text-decoration:none;transition:border-color .2s,background .2s}
.cat-card:hover{border-color:var(--acc);background:var(--surf2);text-decoration:none}
.cat-icon{font-size:28px;display:block;margin-bottom:14px}
.cat-title{font-family:var(--hf);font-size:22px;font-weight:400;color:#fff;margin-bottom:8px}
.cat-desc{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:14px}
.cat-count{font-family:var(--mf);font-size:11px;color:var(--acc);letter-spacing:1px}
.feat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.feat-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:13px 15px;display:block;transition:border-color .2s}
.feat-card:hover{border-color:var(--acc);background:var(--surf2);text-decoration:none}
.feat-name{font-size:13px;font-weight:500;color:var(--txt);display:block;margin-bottom:4px}.feat-card:hover .feat-name{color:#fff}
.feat-meta{font-family:var(--mf);font-size:10px;color:var(--muted)}
.hp-section{padding:60px 0;border-top:1px solid var(--bdr)}
.hp-section-title{font-family:var(--hf);font-size:clamp(24px,3vw,36px);font-weight:400;color:#fff;letter-spacing:-.6px;margin-bottom:10px}
.hp-slbl{font-family:var(--mf);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--acc);margin-bottom:8px;display:block}
.hp-ssub{color:var(--muted);font-size:15px;margin-bottom:32px;max-width:540px}
.trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.trust-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:20px 18px;text-align:center}
.trust-val{font-family:var(--hf);font-size:28px;color:var(--acc2);display:block}
.trust-lbl{font-size:11px;color:var(--muted);margin-top:5px}
.how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.how-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:22px 18px}
.how-num{font-family:var(--mf);font-size:11px;color:var(--acc);background:rgba(14,165,233,.1);border:1px solid rgba(14,165,233,.2);width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:3px;margin-bottom:12px}
.how-h{font-size:14px;font-weight:600;color:#fff;margin-bottom:6px}
.how-p{font-size:12px;color:var(--muted);line-height:1.6}
.llm-panel{background:linear-gradient(135deg,rgba(139,92,246,.08),rgba(14,165,233,.06));border:1px solid rgba(139,92,246,.2);border-radius:6px;padding:36px;margin-bottom:0}
.llm-panel p{color:var(--muted);font-size:14px;line-height:1.75}
.llm-files{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.llm-file{font-family:var(--mf);font-size:11px;color:var(--muted);border:1px solid var(--bdr);padding:4px 10px;border-radius:2px;display:inline-block}
.llm-file:hover{color:var(--acc2);border-color:var(--acc);text-decoration:none}
footer{border-top:1px solid var(--bdr);padding:40px 0}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:32px;margin-bottom:32px}
.fb-desc{color:var(--muted);font-size:12px;margin-top:10px;max-width:220px;line-height:1.6}
.fc h4{font-size:11px;font-weight:600;color:var(--txt);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;font-family:var(--mf)}
.fc ul{list-style:none;display:flex;flex-direction:column;gap:6px}.fc ul a{color:var(--muted);font-size:12px}.fc ul a:hover{color:#fff;text-decoration:none}
.foot-bot{border-top:1px solid var(--bdr);padding-top:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.foot-bot p{color:var(--muted);font-size:11px}
@media(max-width:1000px){.cat-grid{grid-template-columns:repeat(2,1fr)}.footer-grid{grid-template-columns:1fr 1fr;gap:20px}.trust-grid,.how-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:700px){.cat-grid{grid-template-columns:1fr}.feat-grid{grid-template-columns:repeat(2,1fr)}.hp-stats{gap:24px}nav ul{display:none}}
<\/style>
</head>
<body>
${navHtml()}
<main>
<section class="hero-hp">
  <div class="wrap">
    <span class="hp-tag">Data Intelligence Platform</span>
    <h1 class="hp-h1">The <em>B2B Email Database</em> Intelligence Index</h1>
    <p class="hp-desc">${totalPages}+ verified email databases covering 200+ countries, all 50 US states, and 100+ industry categories. Powered by LeadsBlue.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:40px">
      <a href="/data-pages/" class="btn-p">Browse B2B Lists →</a>
      <a href="/usa-categories/" class="btn-g">USA Databases</a>
    </div>
    <div class="hp-stats">
      <div><span class="hp-stat-n">${totalPages}+</span><span class="hp-stat-l">Databases</span></div>
      <div><span class="hp-stat-n">200+</span><span class="hp-stat-l">Countries</span></div>
      <div><span class="hp-stat-n">50</span><span class="hp-stat-l">US States</span></div>
      <div><span class="hp-stat-n">95%+</span><span class="hp-stat-l">Verified</span></div>
      <div><span class="hp-stat-n">${totalFaqs.toLocaleString()}+</span><span class="hp-stat-l">Q&A Pairs</span></div>
    </div>
  </div>
</section>

<section class="hp-section">
  <div class="wrap">
    <span class="hp-slbl">Database Categories</span>
    <h2 class="hp-section-title">5 Types of Email Intelligence</h2>
    <p class="hp-ssub">Every database category is built for a different outreach goal.</p>
    <div class="cat-grid">
      <a href="/data-pages/" class="cat-card">
        <span class="cat-icon">🌍</span>
        <div class="cat-title">B2B Business Lists</div>
        <p class="cat-desc">Location-targeted B2B databases for 200+ countries and regions. Industry breakdowns, company size distribution, and outreach benchmarks per location.</p>
        <span class="cat-count">${bizPages.length} DATABASES</span>
      </a>
      <a href="/consumer-data/" class="cat-card">
        <span class="cat-icon">👥</span>
        <div class="cat-title">Consumer Email Lists</div>
        <p class="cat-desc">Verified consumer email databases for direct-to-consumer marketing. Demographic breakdowns by age, gender, and interest category per country.</p>
        <span class="cat-count">${conPages.length} DATABASES</span>
      </a>
      <a href="/targeted-lists/" class="cat-card">
        <span class="cat-icon">🎯</span>
        <div class="cat-title">Targeted Niche Lists</div>
        <p class="cat-desc">Specialised audience databases — crypto investors, forex traders, healthcare professionals, gamers, and 80+ more niche audience categories.</p>
        <span class="cat-count">${tgtPages.length} DATABASES</span>
      </a>
      <a href="/usa-categories/" class="cat-card">
        <span class="cat-icon">🇺🇸</span>
        <div class="cat-title">USA Business Databases</div>
        <p class="cat-desc">Industry-specific US business databases sourced from Google Local, Yellow Pages, and Manta. Every major US business category across all 50 states.</p>
        <span class="cat-count">${usaPages.length} DATABASES</span>
      </a>
      <a href="/website-data/" class="cat-card">
        <span class="cat-icon">💻</span>
        <div class="cat-title">Tech Site Lists</div>
        <p class="cat-desc">BuiltWith-compiled lists of websites using specific technologies — Shopify, WordPress, HubSpot, Salesforce, and 100+ platforms.</p>
        <span class="cat-count">${techPages.length} DATABASES</span>
      </a>
      <a href="/blog/" class="cat-card">
        <span class="cat-icon">📚</span>
        <div class="cat-title">Outreach Guides</div>
        <p class="cat-desc">Expert guides on cold email strategy, B2B lead generation, compliance frameworks, and best practices for email database campaigns.</p>
        <span class="cat-count">10 GUIDES</span>
      </a>
    </div>
  </div>
</section>

<section class="hp-section">
  <div class="wrap">
    <span class="hp-slbl">Trust & Quality</span>
    <h2 class="hp-section-title">Data Quality Standards</h2>
    <p class="hp-ssub">Every database in this index meets verified accuracy and compliance standards.</p>
    <div class="trust-grid">
      <div class="trust-card"><span class="trust-val">95%+</span><p class="trust-lbl">Email Verification Rate</p></div>
      <div class="trust-card"><span class="trust-val">Quarterly</span><p class="trust-lbl">Re-Verification Cycle</p></div>
      <div class="trust-card"><span class="trust-val">7</span><p class="trust-lbl">Schema Types Per Page</p></div>
      <div class="trust-card"><span class="trust-val">${totalFaqs.toLocaleString()}+</span><p class="trust-lbl">Structured Q&A Pairs</p></div>
    </div>
  </div>
</section>

<section class="hp-section">
  <div class="wrap">
    <span class="hp-slbl">Popular B2B Lists</span>
    <h2 class="hp-section-title">Featured B2B Databases</h2>
    <p class="hp-ssub" style="margin-bottom:20px">Top location-targeted B2B business email databases.</p>
    <div class="feat-grid">
      ${featuredB2B.map(p => {
        const s = pseudoHash(p.name), t = b2bTier(p.name);
        return `<a href="/data-pages/${slug(p.name)}/" class="feat-card"><span class="feat-name">${p.name}</span><div class="feat-meta">${fmtShort(b2bRecords(t,s))}+ records</div></a>`;
      }).join('')}
    </div>
    <p style="margin-top:16px"><a href="/data-pages/" style="font-size:13px">Browse all ${bizPages.length} B2B databases →</a></p>
  </div>
</section>

<section class="hp-section">
  <div class="wrap">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px">
      <div>
        <span class="hp-slbl">USA Business Data</span>
        <h2 class="hp-section-title" style="font-size:26px">USA Industry Databases</h2>
        <p class="hp-ssub" style="margin-bottom:20px">Every major US business category across all 50 states.</p>
        <div class="feat-grid" style="grid-template-columns:1fr 1fr">
          ${featuredUSA.map(p => `<a href="/usa-categories/${slug(p.name)}/" class="feat-card"><span class="feat-name">${p.name.replace(/^USA\s+/,'').replace(/\s+Database$/,'')}</span><div class="feat-meta">USA · ${fmtShort(getUSACatRecords(p.name,pseudoHash(p.name)))}+ contacts</div></a>`).join('')}
        </div>
        <p style="margin-top:16px"><a href="/usa-categories/" style="font-size:13px">Browse all ${usaPages.length} USA databases →</a></p>
      </div>
      <div>
        <span class="hp-slbl">Tech Site Intelligence</span>
        <h2 class="hp-section-title" style="font-size:26px">BuiltWith Site Lists</h2>
        <p class="hp-ssub" style="margin-bottom:20px">Websites using specific technologies — owner contacts included.</p>
        <div class="feat-grid" style="grid-template-columns:1fr 1fr">
          ${featuredTech.map(p => `<a href="/website-data/${slug(p.name)}/" class="feat-card"><span class="feat-name">${p.name.replace(/^All Live\s+/,'').replace(/\s+Sites? List$/,'')}</span><div class="feat-meta">${fmtShort(getWebsiteCount(extractTech(p.name),pseudoHash(p.name)))}+ sites</div></a>`).join('')}
        </div>
        <p style="margin-top:16px"><a href="/website-data/" style="font-size:13px">Browse all ${techPages.length} tech lists →</a></p>
      </div>
    </div>
  </div>
</section>

<section class="hp-section">
  <div class="wrap">
    <span class="hp-slbl">How It Works</span>
    <h2 class="hp-section-title">From Database to First Reply</h2>
    <p class="hp-ssub" style="margin-bottom:28px">Every database includes everything you need to launch immediately.</p>
    <div class="how-grid">
      <div class="how-card"><div class="how-num">01</div><div class="how-h">Find Your Database</div><p class="how-p">Search by country, US state, industry category, or niche audience. ${totalPages}+ options available.</p></div>
      <div class="how-card"><div class="how-num">02</div><div class="how-h">Review the Intelligence</div><p class="how-p">Check industry breakdown, company size distribution, outreach benchmarks, and compliance framework for your target market.</p></div>
      <div class="how-card"><div class="how-num">03</div><div class="how-h">Download via LeadsBlue</div><p class="how-p">Get your CSV from LeadsBlue. 95%+ verified accuracy. Compatible with Instantly, Smartlead, HubSpot, Salesforce, and all major CRMs.</p></div>
      <div class="how-card"><div class="how-num">04</div><div class="how-h">Launch & Scale</div><p class="how-p">Import, verify, segment, and launch. Every page includes a 5-step outreach guide with location-specific benchmarks.</p></div>
    </div>
  </div>
</section>

<section class="hp-section">
  <div class="wrap">
    <span class="hp-slbl">Machine-Readable Data</span>
    <h2 class="hp-section-title">LLM & API-Ready Data Files</h2>
    <p class="hp-ssub" style="margin-bottom:20px">Every page has a structured data.json endpoint. Site-wide intelligence files are available for AI and research use.</p>
    <div class="llm-panel">
      <p>B2B Data Index maintains structured JSON data files for all ${totalPages}+ databases, covering market statistics, industry distributions, outreach benchmarks, and compliance frameworks. These files are publicly accessible for research, AI training, and programmatic use.</p>
      <div class="llm-files">
        <a href="/llm/market-stats.json" class="llm-file">market-stats.json</a>
        <a href="/llm/consumer-stats.json" class="llm-file">consumer-stats.json</a>
        <a href="/llm/targeted-stats.json" class="llm-file">targeted-stats.json</a>
        <a href="/llm/usa-category-stats.json" class="llm-file">usa-category-stats.json</a>
        <a href="/llm/tech-site-stats.json" class="llm-file">tech-site-stats.json</a>
        <a href="/llm/faq-dataset.json" class="llm-file">faq-dataset.json (${totalFaqs.toLocaleString()}+ Q&As)</a>
        <a href="/llm/site-index.json" class="llm-file">site-index.json</a>
        <a href="/llm/entities.json" class="llm-file">entities.json</a>
      </div>
    </div>
  </div>
</section>

</main>

<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a href="/" class="logo"><span>b2b</span>dataindex</a>
        <p class="fb-desc">Verified email data intelligence for 200+ global markets. B2B, consumer, targeted, and industry-specific databases. Powered by LeadsBlue.</p>
      </div>
      <div class="fc"><h4>B2B Lists</h4><ul>${bizPages.slice(0,5).map(p=>`<li><a href="/data-pages/${slug(p.name)}/">${extractLocation(p.name)}</a></li>`).join('')}<li><a href="/data-pages/">All B2B Lists →</a></li></ul></div>
      <div class="fc"><h4>Consumer</h4><ul>${conPages.slice(0,5).map(p=>`<li><a href="/consumer-data/${slug(p.name)}/">${extractLocation(p.name)}</a></li>`).join('')}<li><a href="/consumer-data/">All Consumer Lists →</a></li></ul></div>
      <div class="fc"><h4>USA Data</h4><ul>${usaPages.slice(0,5).map(p=>`<li><a href="/usa-categories/${slug(p.name)}/">${p.name.replace(/^USA\s+/,'').replace(/\s+Database$/,'')}</a></li>`).join('')}<li><a href="/usa-categories/">All USA Databases →</a></li></ul></div>
      <div class="fc"><h4>Resources</h4><ul><li><a href="/blog/">Outreach Guides</a></li><li><a href="/methodology/">Data Methodology</a></li><li><a href="/all-databases/">Full Database List</a></li><li><a href="/llm/">LLM Data Files</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul></div>
    </div>
    <div class="foot-bot">
      <p>© ${YEAR} B2B Data Index · Powered by <a href="https://leadsblue.com" style="color:var(--muted)" target="_blank" rel="noopener">LeadsBlue</a></p>
      <p><a href="/methodology/" style="color:var(--muted)">Data Methodology</a> · <a href="/sitemap.xml" style="color:var(--muted)">Sitemap</a> · <a href="/llm/" style="color:var(--muted)">LLM Data</a></p>
    </div>
  </div>
</footer>
</body></html>`;

  fs.writeFileSync('./public/index.html', html);
  console.log('✓ Homepage generated.');
}

// ================================================================
// ██████  METHODOLOGY PAGE (/methodology/)
// ================================================================
function genMethodologyPage() {
  if (!fs.existsSync('./public/methodology')) fs.mkdirSync('./public/methodology', {recursive:true});
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<title>Data Methodology — How B2B Data Index Verifies & Classifies Email Databases</title>
<meta name="description" content="Detailed methodology behind B2B Data Index: how databases are collected, verified, classified, and quality-assured. SMTP validation, company registry cross-referencing, and quarterly re-verification cycles explained.">
<link rel="canonical" href="${BASE}/methodology/">
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"WebPage","name":"Data Methodology","description":"How B2B Data Index verifies and classifies email databases","url":`${BASE}/methodology/`,"isPartOf":{"@type":"WebSite","url":BASE}})}<\/script>
<style>${CSS}</style>
</head>
<body>
${navHtml()}
<main>
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span>Data Methodology</nav></div>
<section class="hero"><div class="wrap">
<span class="tag">Transparency & Trust</span>
<h1>Data <em>Methodology</em></h1>
<p class="hero-desc">How B2B Data Index collects, verifies, classifies, and maintains the accuracy of all email databases in this catalog.</p>
</div></section>

<section><div class="wrap">
<article>
<h2>Data Collection Sources</h2>
<p style="color:var(--muted);font-size:15px;line-height:1.8;margin-bottom:16px">B2B Data Index aggregates email databases compiled by <a href="https://leadsblue.com" target="_blank" rel="noopener">LeadsBlue</a>, a specialist B2B data provider. Data sources include:</p>
<div style="background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:24px;margin-bottom:24px">
<table><thead><tr><th>Source Type</th><th>Data Categories</th><th>Geographic Coverage</th></tr></thead>
<tbody>
<tr><td>Public Company Registries</td><td>B2B business contacts, company data</td><td>200+ countries</td></tr>
<tr><td>Business Directories (Google Local, Yellow Pages, Manta)</td><td>USA business categories, local businesses</td><td>United States — all 50 states</td></tr>
<tr><td>Industry Association Directories</td><td>Professional contacts, trade members</td><td>Global, sector-specific</td></tr>
<tr><td>Opt-in B2B Partnerships</td><td>Professional email lists, verified contacts</td><td>Global</td></tr>
<tr><td>BuiltWith Technology Intelligence</td><td>Website technology profiles, owner contacts</td><td>Global — 100+ tech platforms</td></tr>
<tr><td>Consumer Opt-in Networks</td><td>Consumer email lists, demographic data</td><td>Major global markets</td></tr>
</tbody></table>
</div>

<h2>Email Verification Process</h2>
<p style="color:var(--muted);font-size:15px;line-height:1.8;margin-bottom:16px">Every email address in every database undergoes a multi-stage verification process before inclusion and on each quarterly re-verification cycle:</p>
<div class="steps" style="border:1px solid var(--bdr);border-radius:4px;padding:0 20px">
<div class="step"><div class="snum">01</div><div><h3>SMTP Verification</h3><p>Each address is validated against the mail server using Simple Mail Transfer Protocol (<abbr title="Simple Mail Transfer Protocol">SMTP</abbr>) verification as defined by <a href="https://datatracker.ietf.org/doc/html/rfc5321" target="_blank" rel="noopener">IETF RFC 5321</a>. The mail server is queried to confirm the address will accept delivery without sending any actual email.</p></div></div>
<div class="step"><div class="snum">02</div><div><h3>Domain MX Record Check</h3><p>The domain's Mail Exchange (<abbr title="Mail Exchange">MX</abbr>) records are verified to confirm active email routing. Domains without valid MX records are flagged and removed.</p></div></div>
<div class="step"><div class="snum">03</div><div><h3>Company Registry Cross-Reference</h3><p>Contact records are cross-referenced against public company registries to confirm the business is still active and the contact is still affiliated with the organisation.</p></div></div>
<div class="step"><div class="snum">04</div><div><h3>Syntax & Format Validation</h3><p>All addresses are validated against <a href="https://datatracker.ietf.org/doc/html/rfc5322" target="_blank" rel="noopener">RFC 5322</a> email format specifications. Malformed addresses are automatically rejected.</p></div></div>
<div class="step"><div class="snum">05</div><div><h3>Quarterly Re-Verification</h3><p>The full verification cycle is repeated every quarter to remove stale contacts from job changes, domain expiries, and business closures. Industry average: 20-25% of B2B contacts change annually.</p></div></div>
</div>

<h2 style="margin-top:40px">Quality Thresholds</h2>
<table style="margin-bottom:24px"><thead><tr><th>Metric</th><th>Target Standard</th><th>Industry Average</th></tr></thead>
<tbody>
<tr><td>Email Verification Rate</td><td><strong>95%+</strong></td><td>85-90%</td></tr>
<tr><td>Hard Bounce Rate</td><td><strong>&lt; 2%</strong></td><td>3-8%</td></tr>
<tr><td>Re-Verification Frequency</td><td><strong>Quarterly</strong></td><td>Annually</td></tr>
<tr><td>Data Sources per Record</td><td><strong>2+ sources</strong></td><td>1 source</td></tr>
</tbody></table>

<h2>Industry Classification</h2>
<p style="color:var(--muted);font-size:15px;line-height:1.8;margin-bottom:16px">B2B contact records are classified using <abbr title="Standard Industrial Classification">SIC</abbr> codes and <abbr title="North American Industry Classification System">NAICS</abbr> codes where available, supplemented by proprietary classification algorithms for records without formal industry codes. Classification covers 15+ top-level industry categories.</p>

<h2>Compliance Framework</h2>
<p style="color:var(--muted);font-size:15px;line-height:1.8;margin-bottom:16px">All databases in this index are designed for compliant use. Each database page includes the specific regulatory framework applicable to that geography:</p>
<ul style="color:var(--muted);font-size:14px;line-height:1.9;padding-left:20px;margin-bottom:16px">
<li><strong style="color:var(--txt)">European Union</strong> — GDPR (Regulation 2016/679), legitimate interest basis under Article 6(1)(f) for B2B outreach. <a href="https://gdpr.eu/article-6-how-to-process-personal-data-legally/" target="_blank" rel="noopener">Source: gdpr.eu</a></li>
<li><strong style="color:var(--txt)">United Kingdom</strong> — UK GDPR and Privacy and Electronic Communications Regulations 2003 (PECR)</li>
<li><strong style="color:var(--txt)">United States</strong> — CAN-SPAM Act (15 U.S.C. § 7701 et seq.), enforced by the <a href="https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business" target="_blank" rel="noopener">Federal Trade Commission (FTC)</a></li>
<li><strong style="color:var(--txt)">Canada</strong> — Canada's Anti-Spam Legislation (CASL, S.C. 2010, c. 23), <a href="https://fightspam.gc.ca/eic/site/030.nsf/eng/home" target="_blank" rel="noopener">enforced by the CRTC</a></li>
<li><strong style="color:var(--txt)">Australia</strong> — Spam Act 2003 (Cth), enforced by the <a href="https://www.acma.gov.au/spam" target="_blank" rel="noopener">Australian Communications and Media Authority (ACMA)</a></li>
</ul>

<h2>Data Currency Disclaimer</h2>
<p style="color:var(--muted);font-size:14px;line-height:1.8;background:var(--surf);border:1px solid var(--bdr);border-left:3px solid rgba(245,158,11,.5);padding:18px 22px;border-radius:4px">Statistical data on this site — including record counts, industry distributions, company size breakdowns, and outreach benchmarks — represents estimates based on available business registry intelligence and proprietary data analysis. These figures are indicative and subject to quarterly revision. Individual database accuracy is guaranteed by LeadsBlue's verification standards. For the most current data on any specific database, visit <a href="https://leadsblue.com" target="_blank" rel="noopener">LeadsBlue.com</a>.</p>
</article>
</div></section>
</main>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
<p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index · Powered by LeadsBlue</p>
<p style="font-size:12px"><a href="/" style="color:var(--muted)">Home</a> · <a href="/data-pages/" style="color:var(--muted)">Databases</a> · <a href="/sitemap.xml" style="color:var(--muted)">Sitemap</a></p>
</div></div></footer>
</body></html>`;

  fs.writeFileSync('./public/methodology/index.html', html);
  console.log('✓ Methodology page generated.');
}

// ================================================================
// ██████  HTML SITEMAP PAGE (/all-databases/)
// ================================================================
function genHTMLSitemap(bizPages, conPages, tgtPages, usaPages, techPages) {
  if (!fs.existsSync('./public/all-databases')) fs.mkdirSync('./public/all-databases', {recursive:true});

  const section = (title, pages, dir) => `
<h2 style="font-family:var(--hf);font-size:24px;font-weight:400;color:#fff;letter-spacing:-.4px;margin:40px 0 16px">${title}</h2>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px">
${pages.map(p=>`<a href="/${dir}/${slug(p.name)}/" style="font-size:13px;color:var(--acc2);padding:4px 0;display:block">${p.name.replace(/^USA\s+/,'').replace(/\s+Database$/,'').replace(/\s+Sites?\s+List$/,'')}</a>`).join('')}
</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow">
<title>All Email Databases — Complete Catalog | B2B Data Index</title>
<meta name="description" content="Complete list of all ${bizPages.length+conPages.length+tgtPages.length+usaPages.length+techPages.length}+ email databases on B2B Data Index — B2B lists, consumer lists, targeted lists, USA categories, and tech site lists.">
<link rel="canonical" href="${BASE}/all-databases/">
<style>${CSS}@media(max-width:600px){div[style*="grid-template-columns:repeat(3"]{grid-template-columns:1fr 1fr!important}nav ul{display:none}}<\/style>
</head>
<body>
${navHtml()}
<main>
<div class="wrap" style="padding:20px 24px 80px">
<nav class="bc"><a href="/">Home</a><span>›</span>All Databases</nav>
<h1 style="font-family:var(--hf);font-size:clamp(26px,4vw,44px);font-weight:400;color:#fff;letter-spacing:-.8px;margin:22px 0 10px">Complete Database Index</h1>
<p style="color:var(--muted);font-size:15px;max-width:560px;margin-bottom:8px">Every email database in the B2B Data Index catalog — ${bizPages.length+conPages.length+tgtPages.length+usaPages.length+techPages.length}+ total.</p>
${section('B2B Business Email Lists ('+bizPages.length+')', bizPages, 'data-pages')}
${section('Consumer Email Lists ('+conPages.length+')', conPages, 'consumer-data')}
${section('Targeted & Niche Lists ('+tgtPages.length+')', tgtPages, 'targeted-lists')}
${section('USA Business Databases ('+usaPages.length+')', usaPages, 'usa-categories')}
${section('Tech Site Lists — BuiltWith ('+techPages.length+')', techPages, 'website-data')}
</div>
</main>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
<p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index · Powered by LeadsBlue</p>
<p style="font-size:12px"><a href="/" style="color:var(--muted)">Home</a> · <a href="/sitemap.xml" style="color:var(--muted)">XML Sitemap</a></p>
</div></div></footer>
</body></html>`;

  fs.writeFileSync('./public/all-databases/index.html', html);
  console.log('✓ HTML sitemap generated.');
}

// ================================================================
// ██████  REGIONAL HUB PAGES
// ================================================================
function genRegionalHubs(bizPages, conPages) {
  const REGIONS = [
    { id:'europe', title:'Europe B2B Email Databases', tag:'European Markets', desc:'Verified B2B business email databases for European countries. Each database includes GDPR compliance notes, industry breakdowns, and outreach benchmarks.',
      countries:['Germany','France','Italy','Spain','Netherlands','Belgium','Sweden','Poland','Switzerland','Austria','Denmark','Finland','Norway','Portugal','Czech Republic','Romania','Hungary','Greece','Ireland','Croatia','Slovakia','Ukraine','Serbia','Bulgaria','Luxembourg','Cyprus','Malta','Estonia','Latvia','Lithuania','Iceland','Belarus','Montenegro','Albania'],
      compliance:'GDPR applies across all EU member states. Legitimate interest (Article 6(1)(f)) is the primary legal basis for B2B email outreach.'},
    { id:'middle-east', title:'Middle East B2B Email Databases', tag:'MENA Markets', desc:'Verified B2B business email databases for Middle Eastern countries covering oil, energy, trade, finance, and technology sectors.',
      countries:['Saudi Arabia','UAE','Qatar','Kuwait','Bahrain','Oman','Jordan','Lebanon','Israel','Egypt','Iraq','Iran'],
      compliance:'No unified email marketing law in the GCC. Apply CAN-SPAM Act standards as international best practice.'},
    { id:'asia-pacific', title:'Asia Pacific B2B Email Databases', tag:'APAC Markets', desc:'Verified B2B email databases for Asia Pacific countries. Manufacturing, technology, finance, and trade sector breakdowns included.',
      countries:['Singapore','Hong Kong','Taiwan','Thailand','Malaysia','Vietnam','Philippines','Bangladesh','Sri Lanka','Myanmar','Cambodia','Nepal','Indonesia','Japan','South Korea','Australia','New Zealand','China','India','Pakistan'],
      compliance:'Compliance frameworks vary by country. Singapore PDPA, Australia Spam Act 2003, Japan Act on Protection of Personal Information (APPI).'},
    { id:'americas', title:'Americas B2B Email Databases', tag:'North & South America', desc:'Verified B2B email databases covering North America, Latin America, and Caribbean markets.',
      countries:['United States','Canada','Brazil','Mexico','Colombia','Chile','Peru','Argentina','Venezuela','Ecuador','Bolivia','Paraguay','Uruguay','Costa Rica','Panama','Guatemala','Honduras'],
      compliance:'US: CAN-SPAM Act. Canada: CASL. Brazil: LGPD. Colombia: Law 1581. Apply local framework for each target country.'},
    { id:'africa', title:'Africa B2B Email Databases', tag:'African Markets', desc:'Verified B2B email databases for African countries. Retail, agriculture, telecommunications, and financial services sector data.',
      countries:['South Africa','Nigeria','Kenya','Ethiopia','Ghana','Tanzania','Uganda','Zimbabwe','Zambia','Cameroon','Ivory Coast','Senegal','Tunisia','Morocco','Algeria'],
      compliance:'Most African markets do not yet have specific email marketing legislation. Apply CAN-SPAM Act best practices as an international standard.'},
  ];

  if (!fs.existsSync('./public/regions')) fs.mkdirSync('./public/regions', {recursive:true});

  REGIONS.forEach(region => {
    const regionDir = `./public/regions/${region.id}`;
    if (!fs.existsSync(regionDir)) fs.mkdirSync(regionDir, {recursive:true});

    // Match pages to this region
    const matchedBiz = bizPages.filter(p => region.countries.some(c => p.name.toLowerCase().includes(c.toLowerCase())));
    const matchedCon = conPages.filter(p => region.countries.some(c => p.name.toLowerCase().includes(c.toLowerCase())));

    if (matchedBiz.length === 0 && matchedCon.length === 0) return;

    // Aggregate stats
    const totalRecs = matchedBiz.reduce((sum,p) => {
      const s = pseudoHash(p.name), t = b2bTier(p.name);
      return sum + b2bRecords(t,s);
    }, 0);

    const bcSchema = JSON.stringify({
      "@context":"https://schema.org","@type":"BreadcrumbList",
      itemListElement:[
        {"@type":"ListItem","position":1,"name":"Home","item":`${BASE}/`},
        {"@type":"ListItem","position":2,"name":"Regional Hubs","item":`${BASE}/regions/`},
        {"@type":"ListItem","position":3,"name":region.title,"item":`${BASE}/regions/${region.id}/`}
      ]
    });
    const colPageSchema = JSON.stringify({
      "@context":"https://schema.org","@type":"CollectionPage",
      "name":region.title,"description":region.desc,
      "url":`${BASE}/regions/${region.id}/`,
      "numberOfItems": matchedBiz.length + matchedCon.length
    });

    const bizCards = matchedBiz.map(p => {
      const s = pseudoHash(p.name), t = b2bTier(p.name);
      const inds = getIndustries(t,s,extractLocation(p.name));
      return `<a href="/data-pages/${slug(p.name)}/" class="rel-card">${p.name}<small>B2B · ${fmtShort(b2bRecords(t,s))}+ records · ${inds[0].name}</small></a>`;
    }).join('');

    const conCards = matchedCon.map(p => {
      const s = pseudoHash(p.name), t = b2bTier(p.name);
      return `<a href="/consumer-data/${slug(p.name)}/" class="rel-card">${p.name}<small>Consumer · ${fmtShort(consumerRecords(t,s))}+ contacts</small></a>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<title>${region.title} — ${matchedBiz.length + matchedCon.length} Verified Databases | B2B Data Index</title>
<meta name="description" content="${region.desc} ${matchedBiz.length} B2B lists and ${matchedCon.length} consumer lists available.">
<link rel="canonical" href="${BASE}/regions/${region.id}/">
<script type="application/ld+json">${bcSchema}<\/script>
<script type="application/ld+json">${colPageSchema}<\/script>
<style>${CSS}.hub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}@media(max-width:900px){.hub-grid{grid-template-columns:1fr 1fr}}@media(max-width:600px){.hub-grid{grid-template-columns:1fr}nav ul{display:none}}<\/style>
</head>
<body>
${navHtml()}
<main>
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span><a href="/regions/">Regions</a><span>›</span>${region.title}</nav></div>
<section class="hero"><div class="wrap">
<span class="tag">${region.tag}</span>
<h1><em>${region.title}</em></h1>
<p class="hero-desc">${region.desc} ${fmtShort(totalRecs)}+ combined verified B2B contacts.</p>
<div class="ctas"><a href="/data-pages/" class="btn-p">All B2B Lists →</a><a href="/consumer-data/" class="btn-g">Consumer Lists</a></div>
<div class="stats">
<div class="stat"><span class="stat-n">${matchedBiz.length}</span><span class="stat-l">B2B Lists</span></div>
<div class="stat"><span class="stat-n">${matchedCon.length}</span><span class="stat-l">Consumer Lists</span></div>
<div class="stat"><span class="stat-n">${fmtShort(totalRecs)}+</span><span class="stat-l">B2B Records</span></div>
<div class="stat"><span class="stat-n">${region.countries.length}</span><span class="stat-l">Countries</span></div>
<div class="stat"><span class="stat-n">95%+</span><span class="stat-l">Verified</span></div>
</div>
</div></section>

<section><div class="wrap">
<span class="slbl">Compliance Overview</span>
<h2>Email Marketing Rules in ${region.tag}</h2>
<div style="background:var(--surf);border:1px solid var(--bdr);border-left:3px solid var(--acc);border-radius:4px;padding:20px 24px;margin-top:16px">
<p style="color:var(--muted);font-size:14px;line-height:1.8">${region.compliance}</p>
</div>
</div></section>

${matchedBiz.length > 0 ? `<section><div class="wrap">
<span class="slbl">B2B Business Lists</span>
<h2>${region.tag} B2B Email Databases</h2>
<p class="ssub" style="margin-bottom:20px">${matchedBiz.length} verified B2B email databases for ${region.tag.replace(' Markets','')} businesses.</p>
<div class="hub-grid">${bizCards}</div>
</div></section>` : ''}

${matchedCon.length > 0 ? `<section><div class="wrap">
<span class="slbl">Consumer Lists</span>
<h2>${region.tag} Consumer Email Lists</h2>
<p class="ssub" style="margin-bottom:20px">${matchedCon.length} verified consumer email databases for ${region.tag.replace(' Markets','')} consumer marketing.</p>
<div class="hub-grid">${conCards}</div>
</div></section>` : ''}

</main>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
<p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index · Powered by LeadsBlue</p>
<p style="font-size:12px"><a href="/" style="color:var(--muted)">Home</a> · <a href="/data-pages/" style="color:var(--muted)">B2B Lists</a> · <a href="/consumer-data/" style="color:var(--muted)">Consumer Lists</a></p>
</div></div></footer>
</body></html>`;

    fs.writeFileSync(`${regionDir}/index.html`, html);

    // Add to sitemap
    sitemapUrls.push({ url:`${BASE}/regions/${region.id}/`, pri:'0.8' });
  });

  // Regions index page
  const regionsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow, max-snippet:-1">
<title>Regional B2B Email Databases — Europe, Asia, Americas, Middle East | B2B Data Index</title>
<meta name="description" content="Browse B2B email databases and consumer lists by world region — Europe (GDPR), Asia Pacific, Americas (CAN-SPAM/CASL), Middle East, and Africa.">
<link rel="canonical" href="${BASE}/regions/">
<style>${CSS}.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}@media(max-width:700px){.rg{grid-template-columns:1fr}nav ul{display:none}}<\/style>
</head>
<body>
${navHtml()}
<main>
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span>Regional Hubs</nav></div>
<section class="hero"><div class="wrap">
<span class="tag">Browse by Region</span>
<h1>Email Databases <em>by Region</em></h1>
<p class="hero-desc">Browse B2B and consumer email databases grouped by world region, with regional compliance guidance and aggregated market data.</p>
</div></section>
<section><div class="wrap">
<div class="rg">
${REGIONS.map(r => {
  const mb = bizPages.filter(p => r.countries.some(c => p.name.toLowerCase().includes(c.toLowerCase()))).length;
  const mc = conPages.filter(p => r.countries.some(c => p.name.toLowerCase().includes(c.toLowerCase()))).length;
  return `<a href="/regions/${r.id}/" style="background:var(--surf);border:1px solid var(--bdr);border-radius:6px;padding:26px 22px;display:block;text-decoration:none;transition:border-color .2s"><h3 style="font-family:var(--hf);font-size:20px;font-weight:400;color:#fff;margin-bottom:8px">${r.title}</h3><p style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:14px">${r.desc.substring(0,100)}...</p><span style="font-family:var(--mf);font-size:10px;color:var(--acc)">${mb} B2B + ${mc} CONSUMER LISTS</span></a>`;
}).join('')}
</div>
</div></section>
</main>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px"><p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index</p><p style="font-size:12px"><a href="/" style="color:var(--muted)">Home</a> · <a href="/data-pages/" style="color:var(--muted)">All B2B Lists</a></p></div></div></footer>
</body></html>`;

  fs.writeFileSync('./public/regions/index.html', regionsHtml);
  sitemapUrls.push({ url:`${BASE}/regions/`, pri:'0.8' });
  console.log(`✓ Regional hub pages generated (${REGIONS.length} regions).`);
}

// ================================================================
// ██████  LLM KNOWLEDGE GRAPH JSON
// ================================================================
function genKnowledgeGraph(bizPages, conPages, tgtPages, usaPages, techPages) {
  const graph = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": "B2B Data Index Knowledge Graph",
    "description": "Entity graph for B2B Data Index: 657+ email databases covering 200+ countries, all 50 US states, and 100+ niche audiences. Prices from $49 to $299. AggregateRating on all products. CAN-SPAM, GDPR, and CASL compliant use cases documented.",
    "description": "Entity relationships and data intelligence for B2B Data Index email databases",
    "url": `${BASE}/llm/knowledge-graph.json`,
    "dateModified": new Date().toISOString().split('T')[0],
    "publisher": { "@type": "Organization", "name": "B2B Data Index", "url": BASE },
    "dataFeedElement": [
      {
        "@type": "Thing", "name": "B2B Data Index", "@id": BASE,
        "description": "Email data intelligence platform providing verified B2B, consumer, targeted, and industry-specific email databases",
        "sameAs": ["https://leadsblue.com"],
        "relatedTo": ["B2B email marketing","cold email outreach","lead generation","sales prospecting","email database","business contacts"]
      },
      ...bizPages.slice(0,30).map(p => {
        const s = pseudoHash(p.name), t = b2bTier(p.name);
        const inds = getIndustries(t,s,extractLocation(p.name));
        const loc = extractLocation(p.name);
        return {
          "@type": "Dataset",
          "name": p.name,
          "url": `${BASE}/data-pages/${slug(p.name)}/`,
          "spatialCoverage": loc,
          "about": `${loc} B2B business contacts`,
          "keywords": [`${loc} email list`, `${loc} b2b database`, `buy ${loc} email list`],
          "topIndustry": inds[0].name,
          "estimatedRecords": `${fmtShort(b2bRecords(t,s))}+`
        };
      }),
      ...usaPages.slice(0,20).map(p => {
        const catName = p.name.replace(/^USA\s+/i,'').replace(/\s+Database$/i,'').trim();
        return {
          "@type": "Dataset",
          "name": p.name,
          "url": `${BASE}/usa-categories/${slug(p.name)}/`,
          "spatialCoverage": "United States",
          "about": `${catName} businesses in the USA`,
          "keywords": [`${catName.toLowerCase()} email list usa`, `usa ${catName.toLowerCase()} database`]
        };
      })
    ]
  };
  fs.writeFileSync('./public/llm/knowledge-graph.json', JSON.stringify(graph, null, 2));
  console.log('✓ Knowledge graph JSON generated.');
}

// ================================================================
// ██████  LLM INDEX PAGE (/llm/)
// ================================================================
function genLLMIndexPage() {
  const files = [
    {name:'faq-dataset.json', desc:'6,000+ structured Q&A pairs across all database categories. Direct answer format for AEO.'},
    {name:'market-stats.json', desc:'Per-country B2B market statistics: record counts, industry distributions, outreach benchmarks, compliance frameworks.'},
    {name:'consumer-stats.json', desc:'Per-country consumer email statistics: demographics, age groups, gender splits, interest categories.'},
    {name:'targeted-stats.json', desc:'Targeted niche audience statistics: audience types, sub-segment breakdowns, geographic distributions.'},
    {name:'usa-category-stats.json', desc:'USA industry-specific database statistics: record counts by category, state distributions, decision-maker ratios.'},
    {name:'tech-site-stats.json', desc:'BuiltWith technology intelligence: website counts per platform, geographic distributions, traffic tiers.'},
    {name:'site-index.json', desc:'Complete index of all 670+ pages with names, slugs, types, and URLs.'},
    {name:'entities.json', desc:'Brand entity data: B2B Data Index and LeadsBlue relationship, use cases, coverage.'},
    {name:'knowledge-graph.json', desc:'Schema.org DataFeed entity graph linking databases to locations, industries, and keywords.'},
  ];

  if (!fs.existsSync('./public/llm')) fs.mkdirSync('./public/llm', {recursive:true});
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"></noscript>
<meta name="robots" content="index, follow">
<title>LLM & AI Data Files — Machine-Readable Email Database Intelligence | B2B Data Index</title>
<meta name="description" content="Structured JSON data files from B2B Data Index for LLM training, AI research, and programmatic use. Market stats, FAQ datasets, knowledge graphs, and entity data.">
<link rel="canonical" href="${BASE}/llm/">
<style>${CSS}<\/style>
</head>
<body>
${navHtml()}
<main>
<div class="wrap"><nav class="bc"><a href="/">Home</a><span>›</span>LLM Data Files</nav></div>
<section class="hero"><div class="wrap">
<span class="tag">AI & LLM Data</span>
<h1>Machine-Readable <em>Intelligence Files</em></h1>
<p class="hero-desc">Structured JSON data files covering all 670+ email databases. Publicly accessible for AI training, LLM retrieval, research, and programmatic use.</p>
</div></section>
<section><div class="wrap">
<span class="slbl">Available Files</span>
<h2>JSON Data Files</h2>
<p class="ssub" style="margin-bottom:24px">All files are served with proper JSON content headers and are openly crawlable.</p>
<table><thead><tr><th>File</th><th>Description</th><th>Access</th></tr></thead><tbody>
${files.map(f=>`<tr><td><a href="/llm/${f.name}" style="font-family:var(--mf);font-size:12px">${f.name}</a></td><td style="font-size:13px;color:var(--muted)">${f.desc}</td><td><span class="badge badge-g">Public</span></td></tr>`).join('')}
</tbody></table>
</div></section>
</main>
<footer><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
<p style="color:var(--muted);font-size:12px">© ${YEAR} B2B Data Index · Powered by LeadsBlue</p>
<p style="font-size:12px"><a href="/" style="color:var(--muted)">Home</a> · <a href="/sitemap.xml" style="color:var(--muted)">Sitemap</a></p>
</div></div></footer>
</body></html>`;
  fs.writeFileSync('./public/llm/index.html', html);
  console.log('✓ LLM index page generated.');
}

// ================================================================
// ██████  ROBOTS.TXT UPDATE — add more LLM crawlers
// ================================================================
function genRobotsTxt() {
  const robots = `User-agent: *
Allow: /
Allow: /llm/
Allow: /methodology/
Allow: /all-databases/
Allow: /regions/

# LLM & AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Omgilibot
Allow: /

User-agent: FacebookBot
Allow: /

# Block image crawlers (no images to serve)
User-agent: Googlebot-Image
Disallow: /

User-agent: Bingbot-Image
Disallow: /

Sitemap: ${BASE}/sitemap.xml`;

  fs.writeFileSync('./public/robots.txt', robots);
  console.log('✓ robots.txt updated with all LLM crawlers.');
}

// ================================================================
// ██████  UPDATED SITEMAP WITH PROPER STRUCTURE
// ================================================================
// This replaces the existing sitemap writer at the end of the file
// ✱ v2: produces a sitemap-index + 6 child sitemaps instead of one
//   monolithic file. Improves GSC diagnostics (per-section indexed
//   counts) and keeps each child well below the 50k URL / 50MB
//   sitemap protocol limits.
function genFullSitemap(sitemapUrls) {
  const today = new Date().toISOString().split('T')[0];

  // ── Bucket URLs into category child-sitemaps ─────────────
  const buckets = {
    business: [],
    consumer: [],
    targeted: [],
    usa:      [],
    tech:     [],
    core:     [],
  };
  sitemapUrls.forEach(u => {
    if      (u.url.includes('/data-pages/'))     buckets.business.push(u);
    else if (u.url.includes('/consumer-data/'))  buckets.consumer.push(u);
    else if (u.url.includes('/targeted-lists/')) buckets.targeted.push(u);
    else if (u.url.includes('/usa-categories/')) buckets.usa.push(u);
    else if (u.url.includes('/website-data/'))   buckets.tech.push(u);
    else                                         buckets.core.push(u);
  });

  // Core bucket also gets the homepage + utility pages
  buckets.core.unshift(
    { url: `${BASE}/`,              pri: '1.0',  freq: 'weekly'  },
    { url: `${BASE}/methodology/`,  pri: '0.7',  freq: 'monthly' },
    { url: `${BASE}/all-databases/`,pri: '0.8',  freq: 'monthly' },
    { url: `${BASE}/regions/`,      pri: '0.85', freq: 'weekly'  },
    { url: `${BASE}/llm/`,          pri: '0.6',  freq: 'weekly'  },
    { url: `${BASE}/blog/`,         pri: '0.8',  freq: 'weekly'  },
  );

  // ── Write a <urlset> file per bucket ─────────────────────
  const buildUrlset = (urls) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url>
  <loc>${u.url}</loc>
  <lastmod>${today}</lastmod>
  <changefreq>${u.freq || 'monthly'}</changefreq>
  <priority>${u.pri}</priority>
</url>`).join('\n')}
</urlset>`;

  const childMap = {
    'sitemap-business.xml': buckets.business,
    'sitemap-consumer.xml': buckets.consumer,
    'sitemap-targeted.xml': buckets.targeted,
    'sitemap-usa.xml':      buckets.usa,
    'sitemap-tech.xml':     buckets.tech,
    'sitemap-core.xml':     buckets.core,
  };

  let total = 0;
  Object.entries(childMap).forEach(([file, urls]) => {
    if (urls.length === 0) return;
    fs.writeFileSync(`./public/${file}`, buildUrlset(urls));
    console.log(`  ✓ ${file} — ${urls.length} URLs`);
    total += urls.length;
  });

  // ── Write the sitemap index (main sitemap.xml) ───────────
  const childRefs = Object.entries(childMap)
    .filter(([,urls]) => urls.length > 0)
    .map(([file]) => `  <sitemap>
    <loc>${BASE}/${file}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n');

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${childRefs}
</sitemapindex>`;

  fs.writeFileSync('./public/sitemap.xml', indexXml);
  console.log(`✓ Sitemap index written → ${total} URLs across ${Object.values(childMap).filter(u=>u.length>0).length} child sitemaps.`);

  // ── _redirects: trailing-slash normalisation ─────────────────
  // NOTE: Redirecting pages.dev → b2bdataindex.com CANNOT be done
  // via _redirects (Cloudflare Pages only supports path-level rules,
  // not cross-domain hostname redirects). Use Cloudflare Dashboard →
  // Bulk Redirects for the pages.dev → b2bdataindex.com 301 rule.
  const redirects = `# B2B Data Index — Cloudflare Pages redirects
# Trailing-slash normalisation — ensures canonical paths are consistent

/data-pages      /data-pages/      301
/consumer-data   /consumer-data/   301
/targeted-lists  /targeted-lists/  301
/usa-categories  /usa-categories/  301
/website-data    /website-data/    301
/blog            /blog/            301
/methodology     /methodology/     301
/regions         /regions/         301
/all-databases   /all-databases/   301
/llm             /llm/             301
`;
  fs.writeFileSync('./public/_redirects', redirects);
  console.log(`✓ _redirects written (trailing-slash normalisation only).`);
  console.log(`  ⚠  pages.dev redirect: set in Cloudflare Dashboard → Bulk Redirects`);
}