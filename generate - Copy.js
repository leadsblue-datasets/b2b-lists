const fs = require("fs");

const rows = fs.readFileSync("products_clean_fixed.csv", "utf-8").split("\n");

const outputDir = "./public/data-pages";
const llmDir = "./public/llm";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(llmDir)) fs.mkdirSync(llmDir, { recursive: true });

let faqDataset = [];
let allPages = [];

const baseUrl = "https://leadsblue.com";
const today = new Date().toISOString().split("T")[0];

const validRows = rows.slice(1).filter(row => row.trim());

validRows.forEach((row) => {
  const parts = row.split(",");
  const name = parts[0]?.trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  allPages.push({ name, slug });
});

validRows.forEach((row) => {
  if (!row.trim()) return;

  const parts = row.split(",");
  const name = parts[0]?.trim();
  const productUrl = parts.slice(1).join(",").trim() || "https://leadsblue.com";

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const location = name.split(" ")[0];
  const context = `businesses operating in ${location}, including small businesses, enterprises, and industry-specific companies`;

  const lower = name.toLowerCase();

  const keywords = [
    `buy ${lower}`,
    `${location.toLowerCase()} email list`,
    `${location.toLowerCase()} b2b database`,
    `${location.toLowerCase()} business contacts`,
    `${location.toLowerCase()} company leads`
  ];

  // EXPANDED FAQ — 8 questions for richer schema + AEO coverage
  const faq = [
    {
      q: `What is a ${name}?`,
      a: `${name} is a verified B2B database of business contacts from ${location}, used for cold email outreach, lead generation, sales prospecting, and targeted marketing campaigns. It includes company names, verified email addresses, job titles, industry classifications, and location data.`
    },
    {
      q: `How can ${name} be used?`,
      a: `It can be used for cold email campaigns, targeted B2B marketing, sales prospecting, market expansion into ${location}, partner outreach, and recruiting decision-makers. Import the list into tools like Instantly, Smartlead, or any CRM to launch outreach sequences.`
    },
    {
      q: `Is ${name} effective for lead generation?`,
      a: `Yes. ${name} allows businesses to connect directly with verified decision-makers in ${location}, bypassing gatekeepers and improving campaign performance. Location-targeted data consistently outperforms generic lists in open and reply rates.`
    },
    {
      q: `Who uses ${name}?`,
      a: `Marketers, sales development representatives (SDRs), agencies, SaaS companies, recruiters, and consultants use ${name} for outreach and growth. Any business targeting companies in ${location} benefits from access to verified, segmented contact data.`
    },
    {
      q: `What data is included in ${name}?`,
      a: `${name} typically includes verified business email addresses, company names, contact names, job titles, industry classification (SIC/NAICS), company size, geographic location within ${location}, and phone numbers where available.`
    },
    {
      q: `Is buying ${name} legal?`,
      a: `Yes. Purchasing and using a B2B email list is legal in most jurisdictions when used responsibly. For US contacts, comply with CAN-SPAM requirements including a valid unsubscribe mechanism and accurate sender information. For EU contacts, rely on the legitimate interest basis under GDPR. Always target business email addresses and keep messaging relevant to the recipient's professional role.`
    },
    {
      q: `How do I use ${name} for cold email outreach?`,
      a: `After downloading ${name}, run the list through an email verifier to remove invalid addresses. Import into your cold email tool, segment by industry or company size if needed, write personalised copy referencing ${location}, and launch a sequence of 3-5 emails spaced 4-7 days apart. Monitor open and reply rates to iterate on messaging.`
    },
    {
      q: `How is ${name} different from other B2B databases?`,
      a: `${name} is specifically segmented for ${location}, making it far more targeted than generic national or global databases. Location-specific lists improve deliverability, relevance, and reply rates because recipients receive messaging tailored to their local market context.`
    }
  ];

  faq.forEach(f => faqDataset.push({ question: f.q, answer: f.a }));

  // Related pages — calculated before template
  const currentIndex = allPages.findIndex(p => p.slug === slug);
  const related = allPages.slice(currentIndex + 1, currentIndex + 6);
  if (related.length < 5) {
    related.push(...allPages.slice(0, 5 - related.length));
  }

  // Schema blocks built before template to avoid nesting issues
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  }, null, 2);

  const webPageSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Buy " + name + " | " + location + " B2B Email Database",
    "description": "Buy " + name + ". Access verified business contacts in " + location + " for lead generation, sales outreach, and targeted marketing campaigns.",
    "url": "https://leadsblue.com/data-pages/" + slug + "/",
    "isPartOf": { "@type": "WebSite", "name": "LeadsBlue", "url": "https://leadsblue.com" },
    "about": {
      "@type": "Dataset",
      "name": name,
      "description": name + " is a B2B database of verified business contacts from " + location + " for marketing and outreach.",
      "keywords": keywords.join(", "),
      "spatialCoverage": location,
      "publisher": { "@type": "Organization", "name": "LeadsBlue", "url": "https://leadsblue.com" }
    }
  }, null, 2);

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://leadsblue.com/" },
      { "@type": "ListItem", "position": 2, "name": "All Email Lists", "item": "https://leadsblue.com/data-pages/" },
      { "@type": "ListItem", "position": 3, "name": name, "item": "https://leadsblue.com/data-pages/" + slug + "/" }
    ]
  }, null, 2);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buy ${name} | ${location} B2B Email Database | LeadsBlue</title>
  <meta name="description" content="Buy ${name}. Access verified business contacts in ${location} for lead generation, cold email outreach, and targeted B2B marketing campaigns. 95%+ deliverability.">
  <meta name="keywords" content="${keywords.join(", ")}, buy b2b email list, business email database, ${location.toLowerCase()} business leads, company contacts ${location.toLowerCase()}">
  <link rel="canonical" href="https://leadsblue.com/data-pages/${slug}/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Buy ${name} | ${location} B2B Email Database">
  <meta property="og:description" content="Verified B2B business contacts in ${location} for cold email, lead generation, and targeted outreach. Download and start prospecting today.">
  <meta property="og:url" content="https://leadsblue.com/data-pages/${slug}/">
  <meta property="og:site_name" content="LeadsBlue">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Buy ${name} | LeadsBlue">
  <meta name="twitter:description" content="Verified B2B contacts in ${location} for outreach and lead generation.">
  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${webPageSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    :root{--bg:#0a0f1e;--surf:#111827;--surf2:#1a2235;--bdr:#1e2d45;--acc:#0ea5e9;--acc2:#38bdf8;--txt:#e2e8f0;--muted:#94a3b8;--hf:'DM Serif Display',Georgia,serif;--bf:'IBM Plex Sans','Helvetica Neue',sans-serif;--mf:'IBM Plex Mono',monospace}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:var(--bg);color:var(--txt);font-family:var(--bf);font-size:16px;line-height:1.7;overflow-x:hidden}
    a{color:var(--acc2);text-decoration:none}
    a:hover{color:#fff;text-decoration:underline}
    .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
    /* NAV */
    nav{border-bottom:1px solid var(--bdr);padding:15px 0;position:sticky;top:0;background:rgba(10,15,30,0.93);backdrop-filter:blur(12px);z-index:100}
    .nav-in{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
    .logo{font-family:var(--mf);font-size:17px;font-weight:500;color:#fff}.logo span{color:var(--acc)}
    nav ul{list-style:none;display:flex;gap:24px}
    nav ul a{color:var(--muted);font-size:13px;font-weight:500;transition:color .2s}
    nav ul a:hover{color:#fff;text-decoration:none}
    /* BREADCRUMB */
    .bc{padding:14px 0;font-size:12px;color:var(--muted);font-family:var(--mf)}
    .bc a{color:var(--muted)}.bc a:hover{color:var(--acc2)}
    .bc span{margin:0 6px;opacity:.4}
    /* HERO */
    .hero{padding:64px 0 56px;position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:700px;height:500px;background:radial-gradient(ellipse,rgba(14,165,233,.11) 0%,transparent 70%);pointer-events:none}
    .tag{display:inline-block;font-family:var(--mf);font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--acc);border:1px solid rgba(14,165,233,.3);padding:4px 11px;border-radius:2px;margin-bottom:22px}
    h1{font-family:var(--hf);font-size:clamp(32px,5vw,58px);font-weight:400;line-height:1.1;letter-spacing:-1px;color:#fff;margin-bottom:20px;max-width:780px}
    h1 em{font-style:italic;color:var(--acc2)}
    .hero-desc{font-size:17px;color:var(--muted);max-width:580px;margin-bottom:32px;font-weight:300;line-height:1.65}
    .ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px}
    .btn-p{background:var(--acc);color:#fff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:3px;transition:background .2s,transform .15s;display:inline-block}
    .btn-p:hover{background:var(--acc2);color:#fff;text-decoration:none;transform:translateY(-1px)}
    .btn-g{border:1px solid var(--bdr);color:var(--txt);font-size:14px;font-weight:500;padding:12px 26px;border-radius:3px;transition:border-color .2s,color .2s;display:inline-block}
    .btn-g:hover{border-color:var(--acc);color:var(--acc2);text-decoration:none}
    /* STATS */
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
    .stat{background:var(--surf);padding:22px 18px;text-align:center}
    .stat-n{font-family:var(--hf);font-size:28px;color:#fff;display:block}
    .stat-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:3px}
    /* SECTIONS */
    section{padding:64px 0}
    section+section{border-top:1px solid var(--bdr)}
    h2{font-family:var(--hf);font-size:clamp(24px,3.5vw,36px);font-weight:400;color:#fff;letter-spacing:-.6px;margin-bottom:10px;line-height:1.2}
    h3{font-family:var(--bf);font-size:16px;font-weight:600;color:#fff;margin-bottom:7px}
    .slbl{font-family:var(--mf);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--acc);margin-bottom:8px;display:block}
    .ssub{color:var(--muted);font-size:15px;margin-bottom:36px;max-width:540px}
    /* TWO COL */
    .two{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
    .two-w{display:grid;grid-template-columns:1.4fr 1fr;gap:52px;align-items:start}
    /* TABLE */
    table{width:100%;border-collapse:collapse;font-size:14px}
    th{text-align:left;padding:11px 15px;background:var(--surf2);color:var(--muted);font-weight:500;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--bdr)}
    td{padding:12px 15px;border-bottom:1px solid var(--bdr);color:var(--txt)}
    tr:hover td{background:var(--surf2)}
    .badge{display:inline-block;font-family:var(--mf);font-size:10px;padding:2px 8px;border-radius:2px;background:rgba(14,165,233,.1);color:var(--acc2);border:1px solid rgba(14,165,233,.2)}
    /* USE CASES */
    .ug{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
    .uc{background:var(--surf);padding:26px 22px;transition:background .2s}
    .uc:hover{background:var(--surf2)}
    .uc-icon{font-size:20px;margin-bottom:12px;display:block}
    .uc p{font-size:13px;color:var(--muted);line-height:1.6}
    /* STEPS */
    .steps{display:flex;flex-direction:column}
    .step{display:flex;gap:20px;padding:22px 0;border-bottom:1px solid var(--bdr)}
    .step:last-child{border-bottom:none}
    .snum{font-family:var(--mf);font-size:11px;color:var(--acc);background:rgba(14,165,233,.1);border:1px solid rgba(14,165,233,.2);width:34px;height:34px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:3px;margin-top:2px}
    .step p{color:var(--muted);font-size:13px;margin:0}
    /* PROSE */
    .prose p{color:var(--muted);font-size:14px;line-height:1.75;margin-bottom:14px}
    .prose strong{color:var(--txt);font-weight:600}
    .prose ul{padding-left:16px;margin-bottom:14px}
    .prose ul li{color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:5px}
    /* FAQ */
    .faq-list{display:flex;flex-direction:column;border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
    .faq-item{border-bottom:1px solid var(--bdr);background:var(--surf)}
    .faq-item:last-child{border-bottom:none}
    .faq-q{width:100%;text-align:left;background:none;border:none;padding:18px 22px;color:#fff;font-family:var(--bf);font-size:14px;font-weight:500;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:14px}
    .faq-q:hover{background:var(--surf2)}
    .chev{color:var(--acc);font-size:18px;flex-shrink:0;transition:transform .2s;line-height:1}
    .faq-q.open .chev{transform:rotate(45deg)}
    .faq-a{display:none;padding:0 22px 18px;color:var(--muted);font-size:13px;line-height:1.75}
    .faq-a.open{display:block}
    /* RELATED CARDS */
    .rel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .rel-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:14px 16px;font-size:13px;color:var(--txt);transition:border-color .2s,background .2s;display:block}
    .rel-card:hover{border-color:var(--acc);background:var(--surf2);color:#fff;text-decoration:none}
    .rel-card small{font-family:var(--mf);font-size:10px;color:var(--muted);display:block;margin-top:3px}
    /* BLOG */
    .blog-list{list-style:none;border:1px solid var(--bdr);border-radius:4px;overflow:hidden}
    .blog-list li{border-bottom:1px solid var(--bdr)}
    .blog-list li:last-child{border-bottom:none}
    .blog-list a{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;color:var(--txt);font-size:13px;font-weight:500;background:var(--surf);transition:background .15s,color .15s}
    .blog-list a:hover{background:var(--surf2);color:#fff;text-decoration:none}
    .blog-list a::after{content:'→';color:var(--acc);font-size:13px}
    /* KW CLOUD */
    .kwc{display:flex;flex-wrap:wrap;gap:7px}
    .kw{font-family:var(--mf);font-size:11px;padding:4px 10px;border-radius:2px;background:var(--surf);border:1px solid var(--bdr);color:var(--muted)}
    /* CTA BANNER */
    .cta-b{background:linear-gradient(135deg,var(--surf2) 0%,rgba(14,165,233,.07) 100%);border:1px solid rgba(14,165,233,.22);border-radius:6px;padding:48px 40px;text-align:center;position:relative;overflow:hidden}
    .cta-b::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:400px;height:280px;background:radial-gradient(ellipse,rgba(14,165,233,.09) 0%,transparent 70%);pointer-events:none}
    .cta-b p{color:var(--muted);max-width:460px;margin:0 auto 28px;font-size:15px}
    /* FOOTER */
    footer{border-top:1px solid var(--bdr);padding:36px 0}
    .footer-in{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px;margin-bottom:32px}
    .footer-brand p{color:var(--muted);font-size:12px;margin-top:10px;max-width:200px;line-height:1.6}
    .fc h4{font-size:11px;font-weight:600;color:var(--txt);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;font-family:var(--mf)}
    .fc ul{list-style:none;display:flex;flex-direction:column;gap:7px}
    .fc ul a{color:var(--muted);font-size:12px;transition:color .15s}
    .fc ul a:hover{color:#fff;text-decoration:none}
    .foot-bot{border-top:1px solid var(--bdr);padding-top:20px;display:flex;justify-content:space-between;align-items:center}
    .foot-bot p{color:var(--muted);font-size:11px}
    /* RESPONSIVE */
    @media(max-width:768px){.stats{grid-template-columns:repeat(2,1fr)}.ug{grid-template-columns:1fr}.two,.two-w{grid-template-columns:1fr;gap:28px}.rel-grid{grid-template-columns:1fr 1fr}.footer-in{grid-template-columns:1fr 1fr;gap:24px}.cta-b{padding:32px 22px}nav ul{display:none}}
    @media(max-width:480px){.rel-grid{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}}
  </style>
</head>
<body>

<nav>
  <div class="nav-in">
    <a href="/" class="logo">Leads<span>Blue</span></a>
    <ul>
      <li><a href="/data-pages/">All Lists</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/#faq">FAQ</a></li>
    </ul>
  </div>
</nav>

<div class="wrap">
  <nav class="bc" aria-label="breadcrumb">
    <a href="/">Home</a><span>›</span>
    <a href="/data-pages/">Email Lists</a><span>›</span>
    ${name}
  </nav>
</div>

<!-- HERO -->
<section class="hero">
  <div class="wrap">
    <span class="tag">B2B Email Database · ${location}</span>
    <h1>Buy <em>${name}</em></h1>
    <p class="hero-desc">Verified business contacts in ${location} for cold email outreach, lead generation, and targeted B2B marketing. 95%+ deliverability. CSV delivery. Ready to import.</p>
    <div class="ctas">
      <a href="${productUrl}" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a>
      <a href="/data-pages/" class="btn-g">Browse All Lists</a>
    </div>
    <div class="stats">
      <div class="stat"><span class="stat-n">95%+</span><span class="stat-l">Deliverability</span></div>
      <div class="stat"><span class="stat-n">CSV</span><span class="stat-l">Instant Delivery</span></div>
      <div class="stat"><span class="stat-n">B2B</span><span class="stat-l">Business Contacts</span></div>
      <div class="stat"><span class="stat-n">${location}</span><span class="stat-l">Location Targeted</span></div>
    </div>
  </div>
</section>

<!-- WHAT IS + DATA TABLE -->
<section>
  <div class="wrap">
    <div class="two-w">
      <div>
        <span class="slbl">Definition</span>
        <h2>What Is ${name}?</h2>
        <p class="ssub">A location-targeted B2B contact database built for outreach in ${location}.</p>
        <div class="prose">
          <p><strong>${name}</strong> is a verified B2B database of business contacts sourced from ${location}. It is designed for marketers, sales teams, and agencies that need to reach decision-makers — company owners, managers, and executives — operating within ${location}.</p>
          <p>Unlike generic national databases, this list is <strong>segmented specifically for ${location}</strong>, meaning every contact is relevant to your local market focus. Targeting a defined geography dramatically improves open and reply rates compared to broad untargeted lists.</p>
          <p>LeadsBlue verifies every database before delivery to ensure high deliverability and minimal bounce rates. The list ships as a ready-to-import CSV compatible with Instantly, Smartlead, Mailshake, Apollo, HubSpot, and any CRM.</p>
          <ul>
            <li>Verified email addresses — 95%+ deliverability guaranteed</li>
            <li>Segmented for ${location} — relevant, local contacts</li>
            <li>Ready-to-import CSV — works with every major tool</li>
            <li>Includes decision-makers — owners, managers, directors</li>
          </ul>
        </div>
      </div>
      <div>
        <span class="slbl">Data Fields</span>
        <h2 style="font-size:24px;">What's Included</h2>
        <br>
        <table>
          <thead><tr><th>Field</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Business Email Address</td><td><span class="badge">✓ Verified</span></td></tr>
            <tr><td>Company Name</td><td><span class="badge">✓ Included</span></td></tr>
            <tr><td>Contact Name</td><td><span class="badge">✓ Included</span></td></tr>
            <tr><td>Job Title / Role</td><td><span class="badge">✓ Included</span></td></tr>
            <tr><td>Industry / SIC Code</td><td><span class="badge">✓ Classified</span></td></tr>
            <tr><td>Company Location (${location})</td><td><span class="badge">✓ Segmented</span></td></tr>
            <tr><td>Company Size Range</td><td><span class="badge">✓ Included</span></td></tr>
            <tr><td>Phone Number</td><td><span class="badge">Where Available</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<!-- USE CASES -->
<section>
  <div class="wrap">
    <span class="slbl">Applications</span>
    <h2>How ${name} Is Used</h2>
    <p class="ssub">From cold outreach to market expansion — here's how businesses use this data.</p>
    <div class="ug">
      <div class="uc">
        <span class="uc-icon">📧</span>
        <h3>Cold Email Outreach</h3>
        <p>Launch personalised cold email sequences to verified decision-makers in ${location}. Build pipeline fast without manual prospecting.</p>
      </div>
      <div class="uc">
        <span class="uc-icon">🎯</span>
        <h3>Targeted B2B Marketing</h3>
        <p>Run campaigns precisely segmented to ${location}. Higher relevance means higher open rates and more qualified leads per send.</p>
      </div>
      <div class="uc">
        <span class="uc-icon">📈</span>
        <h3>Sales Prospecting</h3>
        <p>Equip your SDR team with pre-qualified ${location} contacts. Reduce research time and increase meaningful sales conversations.</p>
      </div>
      <div class="uc">
        <span class="uc-icon">🌍</span>
        <h3>Market Expansion</h3>
        <p>Entering ${location} for the first time? Get immediate access to local business contacts without months of organic list building.</p>
      </div>
      <div class="uc">
        <span class="uc-icon">🤝</span>
        <h3>Partnership Outreach</h3>
        <p>Find potential partners, resellers, or distributors within ${location}. Location-targeted data makes this precise and fast.</p>
      </div>
      <div class="uc">
        <span class="uc-icon">💼</span>
        <h3>Recruiting & Talent</h3>
        <p>Reach hiring managers and executives in ${location} for executive placement, staffing, or HR outreach campaigns.</p>
      </div>
    </div>
  </div>
</section>

<!-- WHY TARGET + HOW TO USE -->
<section>
  <div class="wrap">
    <div class="two">
      <div>
        <span class="slbl">Market Context</span>
        <h2>Why Target ${location} Businesses?</h2>
        <div class="prose" style="margin-top:8px;">
          <p>${location} has a diverse and active business ecosystem spanning multiple industries including professional services, retail, manufacturing, technology, and more. A localised database gives you direct access to this market.</p>
          <p>Using a <strong>location-targeted email list for ${location}</strong> improves campaign performance because your messaging can reference the local market, local challenges, and local context — signals that generic outreach cannot replicate.</p>
          <p>Businesses that target ${location} with a verified, segmented list consistently report <strong>higher reply rates, better deliverability, and lower unsubscribe rates</strong> compared to untargeted approaches. The specificity of ${name} is its core advantage.</p>
          <p>Whether you're a local business expanding your reach, or a national brand targeting ${location} as a new market, this database gives you the contact foundation to start conversations at scale.</p>
        </div>
      </div>
      <div>
        <span class="slbl">How To Use</span>
        <h2>5 Steps to Launch Your Campaign</h2>
        <div class="steps" style="margin-top:8px;">
          <div class="step">
            <div class="snum">01</div>
            <div><h3>Download the List</h3><p>Get ${name} as a CSV file, ready to import into any tool.</p></div>
          </div>
          <div class="step">
            <div class="snum">02</div>
            <div><h3>Verify Emails</h3><p>Run through NeverBounce or ZeroBounce to protect your sender reputation.</p></div>
          </div>
          <div class="step">
            <div class="snum">03</div>
            <div><h3>Import to Your Tool</h3><p>Import into Instantly, Smartlead, HubSpot, Apollo, or your CRM.</p></div>
          </div>
          <div class="step">
            <div class="snum">04</div>
            <div><h3>Write Targeted Copy</h3><p>Reference ${location} in your messaging to signal local relevance.</p></div>
          </div>
          <div class="step">
            <div class="snum">05</div>
            <div><h3>Launch &amp; Iterate</h3><p>Send, track open and reply rates, optimise, then scale.</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section>
  <div class="wrap">
    <span class="slbl">FAQ</span>
    <h2>Frequently Asked Questions</h2>
    <p class="ssub">Everything you need to know about ${name}.</p>
    <div class="faq-list">
      ${faq.map(f => `<div class="faq-item">
        <button class="faq-q" onclick="tf(this)">${f.q}<span class="chev">+</span></button>
        <div class="faq-a">${f.a}</div>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- POPULAR SEARCHES -->
<section>
  <div class="wrap">
    <span class="slbl">Popular Searches</span>
    <h2>People Also Search For</h2>
    <p class="ssub" style="margin-bottom:20px;">Keywords related to ${name} and ${location} B2B data.</p>
    <div class="kwc">
      ${keywords.map(k => `<span class="kw">${k}</span>`).join("")}
      <span class="kw">${location.toLowerCase()} business email list</span>
      <span class="kw">buy ${location.toLowerCase()} leads</span>
      <span class="kw">${location.toLowerCase()} company database</span>
      <span class="kw">b2b contacts ${location.toLowerCase()}</span>
      <span class="kw">${location.toLowerCase()} sales leads</span>
      <span class="kw">targeted email list ${location.toLowerCase()}</span>
    </div>
  </div>
</section>

<!-- RELATED LISTS + BLOG -->
<section>
  <div class="wrap">
    <div class="two">
      <div>
        <span class="slbl">Related Lists</span>
        <h2>Similar Email Databases</h2>
        <p class="ssub" style="margin-bottom:20px;">Other location-targeted B2B databases you may find useful.</p>
        <div class="rel-grid">
          ${related.map(p => `<a href="/data-pages/${p.slug}/" class="rel-card">${p.name}<small>B2B · Email List</small></a>`).join("")}
        </div>
        <p style="margin-top:16px;"><a href="/data-pages/" style="font-size:13px;">Browse all 200+ email lists →</a></p>
      </div>
      <div>
        <span class="slbl">Learn More</span>
        <h2>B2B Outreach Guides</h2>
        <p class="ssub" style="margin-bottom:20px;">Free guides to maximise your campaign results.</p>
        <ul class="blog-list">
          <li><a href="/blog/what-is-b2b-email-list.html">What Is a B2B Email List?</a></li>
          <li><a href="/blog/how-to-use-email-database.html">How to Use an Email Database</a></li>
          <li><a href="/blog/cold-email-strategy.html">Cold Email Strategy That Works</a></li>
          <li><a href="/blog/is-buying-email-lists-legal.html">Is Buying Email Lists Legal?</a></li>
          <li><a href="/blog/b2b-lead-generation-strategies.html">B2B Lead Generation Strategies</a></li>
          <li><a href="/blog/how-to-find-business-leads.html">How to Find Business Leads</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- CTA BANNER -->
<section>
  <div class="wrap">
    <div class="cta-b">
      <span class="slbl" style="display:block;margin-bottom:12px;">Get Started</span>
      <h2>Ready to Reach ${location} Businesses?</h2>
      <p>Download ${name} and start building your pipeline with verified, local B2B contacts today.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="${productUrl}" target="_blank" rel="noopener" class="btn-p">Get ${name} →</a>
        <a href="/data-pages/" class="btn-g">Browse All Lists</a>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="footer-in">
      <div class="footer-brand">
        <a href="/" class="logo">Leads<span>Blue</span></a>
        <p>Verified B2B email databases for lead generation, cold outreach, and targeted marketing. 200+ countries covered.</p>
      </div>
      <div class="fc">
        <h4>Browse</h4>
        <ul>
          <li><a href="/data-pages/">All Email Lists</a></li>
          ${related.slice(0, 4).map(p => `<li><a href="/data-pages/${p.slug}/">${p.name}</a></li>`).join("")}
        </ul>
      </div>
      <div class="fc">
        <h4>Guides</h4>
        <ul>
          <li><a href="/blog/cold-email-strategy.html">Cold Email Strategy</a></li>
          <li><a href="/blog/b2b-lead-generation-strategies.html">Lead Generation</a></li>
          <li><a href="/blog/is-buying-email-lists-legal.html">Is It Legal?</a></li>
          <li><a href="/blog/best-email-list-providers.html">Best Providers</a></li>
        </ul>
      </div>
      <div class="fc">
        <h4>Company</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/data-pages/">Catalog</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/sitemap.xml">Sitemap</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bot">
      <p>© 2025 LeadsBlue. All rights reserved.</p>
      <p>Buy ${name} · ${location} B2B Email Database · LeadsBlue</p>
    </div>
  </div>
</footer>

<script>
function tf(btn){
  var a=btn.nextElementSibling,open=a.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(function(x){x.classList.remove('open')});
  document.querySelectorAll('.faq-q').forEach(function(x){x.classList.remove('open')});
  if(!open){a.classList.add('open');btn.classList.add('open')}
}
</script>
</body>
</html>`;

  const dir = `${outputDir}/${slug}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/index.html`, html);
});

// -------------------------------------------------------
// FEATURE 1 — BROWSE INDEX PAGE
// -------------------------------------------------------
const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <title>All B2B Email Lists | LeadsBlue</title>
  <meta name="description" content="Browse all available B2B email lists and business contact databases by location. Find targeted leads for your outreach campaigns.">
</head>
<body>

<h1>Browse All Email Lists</h1>
<p>Explore our full collection of location-targeted B2B email databases for lead generation and outreach.</p>

<ul>
  ${allPages.map(p => `<li><a href="/data-pages/${p.slug}/">${p.name}</a></li>`).join("\n  ")}
</ul>

</body>
</html>`;

fs.writeFileSync(`${outputDir}/index.html`, indexHtml);
console.log(`Index page generated with ${allPages.length} entries.`);

// -------------------------------------------------------
// FEATURE 2 — SITEMAP
// -------------------------------------------------------
// baseUrl and today defined at top of file

const blogFiles = [
  "what-is-b2b-email-list.html",
  "how-to-use-email-database.html",
  "is-buying-email-lists-legal.html",
  "best-email-list-providers.html",
  "cold-email-strategy.html",
  "b2b-lead-generation-strategies.html",
  "email-marketing-for-startups.html",
  "targeted-marketing-explained.html",
  "business-contact-database-guide.html",
  "how-to-find-business-leads.html"
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/data-pages/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>
${blogFiles.map(f => `  <url>
    <loc>${baseUrl}/blog/${f}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.6</priority>
  </url>`).join("\n")}
${allPages.map(p => `  <url>
    <loc>${baseUrl}/data-pages/${p.slug}/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>`).join("\n")}
</urlset>`;

fs.writeFileSync("./public/sitemap.xml", sitemapXml);
const totalUrls = 3 + blogFiles.length + allPages.length;
console.log(`Sitemap generated with ${totalUrls} URLs (${allPages.length} data pages + ${blogFiles.length} blog posts).`);

// -------------------------------------------------------
// FEATURE 3 — BLOG PAGE GENERATION
// -------------------------------------------------------
const blogDir = "./public/blog";
if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

// Helper: pick N random unique entries from allPages
function randomPages(n) {
  const shuffled = [...allPages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// Helper: render internal links block
function internalLinks(pages) {
  return `<ul>\n${pages.map(p => `  <li><a href="/data-pages/${p.slug}/">${p.name}</a></li>`).join("\n")}\n</ul>`;
}

// Helper: wrap a blog post in full SEO-optimised HTML
function blogPage({ file, title, metaDesc, body }) {
  const headline = title.split(" | ")[0].trim();

  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": metaDesc,
    "url": baseUrl + "/blog/" + file,
    "datePublished": today,
    "dateModified": today,
    "author": { "@type": "Organization", "name": "LeadsBlue", "url": baseUrl },
    "publisher": { "@type": "Organization", "name": "LeadsBlue", "url": baseUrl },
    "mainEntityOfPage": { "@type": "WebPage", "@id": baseUrl + "/blog/" + file }
  });

  const bcSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl + "/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": baseUrl + "/blog/" },
      { "@type": "ListItem", "position": 3, "name": headline, "item": baseUrl + "/blog/" + file }
    ]
  });

  const sidePages = [...allPages].sort(() => Math.random() - 0.5).slice(0, 6);

  const otherPosts = [
    { f: "what-is-b2b-email-list.html",         t: "What Is a B2B Email List?" },
    { f: "how-to-use-email-database.html",       t: "How to Use an Email Database" },
    { f: "cold-email-strategy.html",             t: "Cold Email Strategy That Works" },
    { f: "is-buying-email-lists-legal.html",     t: "Is Buying Email Lists Legal?" },
    { f: "b2b-lead-generation-strategies.html",  t: "B2B Lead Generation Strategies" },
    { f: "email-marketing-for-startups.html",    t: "Email Marketing for Startups" },
    { f: "targeted-marketing-explained.html",    t: "Targeted Marketing Explained" },
    { f: "business-contact-database-guide.html", t: "Business Contact Database Guide" },
    { f: "best-email-list-providers.html",       t: "Best Email List Providers 2025" },
    { f: "how-to-find-business-leads.html",      t: "How to Find Business Leads" }
  ].filter(p => p.f !== file).slice(0, 5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="${baseUrl}/blog/${file}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${baseUrl}/blog/${file}">
  <meta property="og:site_name" content="LeadsBlue">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDesc}">
  <script type="application/ld+json">${articleSchema}</script>
  <script type="application/ld+json">${bcSchema}</script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    :root{--bg:#0a0f1e;--surf:#111827;--surf2:#1a2235;--bdr:#1e2d45;--acc:#0ea5e9;--acc2:#38bdf8;--txt:#e2e8f0;--muted:#94a3b8;--hf:'DM Serif Display',Georgia,serif;--bf:'IBM Plex Sans','Helvetica Neue',sans-serif;--mf:'IBM Plex Mono',monospace}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:var(--bg);color:var(--txt);font-family:var(--bf);font-size:16px;line-height:1.7;overflow-x:hidden}
    a{color:var(--acc2);text-decoration:none}
    a:hover{color:#fff;text-decoration:underline}
    .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
    nav.top{border-bottom:1px solid var(--bdr);padding:15px 0;position:sticky;top:0;background:rgba(10,15,30,0.93);backdrop-filter:blur(12px);z-index:100}
    .nav-in{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
    .logo{font-family:var(--mf);font-size:17px;font-weight:500;color:#fff;text-decoration:none}.logo span{color:var(--acc)}
    nav.top ul{list-style:none;display:flex;gap:24px}
    nav.top ul a{color:var(--muted);font-size:13px;font-weight:500;transition:color .2s}
    nav.top ul a:hover{color:#fff;text-decoration:none}
    .bc{padding:14px 0;font-size:12px;color:var(--muted);font-family:var(--mf)}
    .bc a{color:var(--muted)}.bc a:hover{color:var(--acc2)}.bc span{margin:0 6px;opacity:.4}
    .art-tag{display:inline-block;font-family:var(--mf);font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--acc);border:1px solid rgba(14,165,233,.3);padding:4px 11px;border-radius:2px;margin-bottom:18px}
    .art-hero{padding:52px 0 40px;border-bottom:1px solid var(--bdr);position:relative;overflow:hidden}
    .art-hero::before{content:'';position:absolute;top:-150px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(14,165,233,.08) 0%,transparent 70%);pointer-events:none}
    .art-hero h1{font-family:var(--hf);font-size:clamp(28px,4.5vw,50px);font-weight:400;line-height:1.12;letter-spacing:-.8px;color:#fff;max-width:760px;margin-bottom:14px}
    .art-hero p{font-size:16px;color:var(--muted);max-width:620px;font-weight:300;line-height:1.65}
    .art-meta{display:flex;gap:20px;margin-top:18px;align-items:center}
    .art-meta span{font-family:var(--mf);font-size:11px;color:var(--muted);letter-spacing:.5px}
    .art-meta .dot{color:var(--bdr)}
    .art-layout{display:grid;grid-template-columns:1fr 320px;gap:56px;align-items:start;padding:52px 0 64px}
    .art-body h2{font-family:var(--hf);font-size:clamp(22px,3vw,30px);font-weight:400;color:#fff;letter-spacing:-.4px;margin:40px 0 12px;line-height:1.2}
    .art-body h2:first-of-type{margin-top:0}
    .art-body h3{font-family:var(--bf);font-size:17px;font-weight:600;color:#fff;margin:28px 0 8px}
    .art-body p{color:var(--muted);font-size:15px;line-height:1.8;margin-bottom:16px}
    .art-body strong{color:var(--txt);font-weight:600}
    .art-body ul,.art-body ol{padding-left:20px;margin-bottom:18px}
    .art-body ul li,.art-body ol li{color:var(--muted);font-size:15px;line-height:1.75;margin-bottom:7px}
    .art-body ul li a{color:var(--acc2)}
    .art-body ul li a:hover{color:#fff}
    .art-body>ul:not(.plain){list-style:none;padding-left:0;border:1px solid var(--bdr);border-radius:4px;overflow:hidden;margin-bottom:24px}
    .art-body>ul:not(.plain) li{border-bottom:1px solid var(--bdr);background:var(--surf)}
    .art-body>ul:not(.plain) li:last-child{border-bottom:none}
    .art-body>ul:not(.plain) li a{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;color:var(--txt);font-size:14px;font-weight:500;transition:background .15s,color .15s}
    .art-body>ul:not(.plain) li a::after{content:'→';color:var(--acc);font-size:13px}
    .art-body>ul:not(.plain) li a:hover{background:var(--surf2);color:#fff;text-decoration:none}
    .art-side{position:sticky;top:80px}
    .side-block{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;overflow:hidden;margin-bottom:16px}
    .side-block-head{padding:12px 16px;background:var(--surf2);border-bottom:1px solid var(--bdr);font-family:var(--mf);font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
    .side-block ul{list-style:none}
    .side-block ul li{border-bottom:1px solid var(--bdr)}
    .side-block ul li:last-child{border-bottom:none}
    .side-block ul li a{display:block;padding:11px 16px;color:var(--txt);font-size:13px;transition:background .15s,color .15s}
    .side-block ul li a:hover{background:var(--surf2);color:#fff;text-decoration:none}
    .side-cta{background:linear-gradient(135deg,var(--surf2),rgba(14,165,233,.08));border:1px solid rgba(14,165,233,.2);border-radius:4px;padding:22px;text-align:center}
    .side-cta p{color:var(--muted);font-size:13px;margin:8px 0 16px;line-height:1.6}
    .side-cta h4{color:#fff;font-size:15px;font-weight:600}
    .btn-p{background:var(--acc);color:#fff;font-size:13px;font-weight:600;padding:11px 22px;border-radius:3px;transition:background .2s;display:inline-block}
    .btn-p:hover{background:var(--acc2);color:#fff;text-decoration:none}
    .btn-g{border:1px solid var(--bdr);color:var(--txt);font-size:13px;font-weight:500;padding:10px 20px;border-radius:3px;transition:border-color .2s,color .2s;display:inline-block;margin-top:8px}
    .btn-g:hover{border-color:var(--acc);color:var(--acc2);text-decoration:none}
    .cta-b{background:linear-gradient(135deg,var(--surf2) 0%,rgba(14,165,233,.07) 100%);border:1px solid rgba(14,165,233,.22);border-radius:6px;padding:48px 40px;text-align:center}
    .cta-b h2{font-family:var(--hf);font-size:clamp(24px,3vw,34px);font-weight:400;color:#fff;letter-spacing:-.5px;margin-bottom:10px}
    .cta-b p{color:var(--muted);max-width:460px;margin:0 auto 28px;font-size:15px}
    footer{border-top:1px solid var(--bdr);padding:36px 0}
    .footer-in{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px;margin-bottom:28px}
    .fbrand p{color:var(--muted);font-size:12px;margin-top:10px;max-width:200px;line-height:1.6}
    .fc h4{font-size:11px;font-weight:600;color:var(--txt);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;font-family:var(--mf)}
    .fc ul{list-style:none;display:flex;flex-direction:column;gap:7px}
    .fc ul a{color:var(--muted);font-size:12px;transition:color .15s}
    .fc ul a:hover{color:#fff;text-decoration:none}
    .foot-bot{border-top:1px solid var(--bdr);padding-top:18px;display:flex;justify-content:space-between}
    .foot-bot p{color:var(--muted);font-size:11px}
    @media(max-width:900px){.art-layout{grid-template-columns:1fr;gap:36px}.art-side{position:static}}
    @media(max-width:768px){nav.top ul{display:none}.footer-in{grid-template-columns:1fr 1fr;gap:22px}.cta-b{padding:32px 22px}}
  </style>
</head>
<body>

<nav class="top">
  <div class="nav-in">
    <a href="/" class="logo">Leads<span>Blue</span></a>
    <ul>
      <li><a href="/data-pages/">All Lists</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/#faq">FAQ</a></li>
    </ul>
  </div>
</nav>

<div class="wrap">
  <nav class="bc" aria-label="breadcrumb">
    <a href="/">Home</a><span>›</span>
    <a href="/blog/">Blog</a><span>›</span>
    ${headline}
  </nav>
</div>

<div class="art-hero">
  <div class="wrap">
    <span class="art-tag">B2B Marketing Guide</span>
    <h1>${headline}</h1>
    <p>${metaDesc}</p>
    <div class="art-meta">
      <span>LeadsBlue</span>
      <span class="dot">·</span>
      <span>${today}</span>
      <span class="dot">·</span>
      <span>B2B Email Data</span>
    </div>
  </div>
</div>

<div class="wrap art-layout">
  <article class="art-body">
    ${body}
  </article>

  <aside class="art-side">
    <div class="side-cta">
      <h4>Ready to Start Outreach?</h4>
      <p>Browse 200+ verified B2B email databases by country and industry.</p>
      <a href="/data-pages/" class="btn-p">Browse All Lists →</a><br>
      <a href="/" class="btn-g">LeadsBlue Home</a>
    </div>

    <div class="side-block" style="margin-top:16px;">
      <div class="side-block-head">Popular Lists</div>
      <ul>
        ${sidePages.map(p => `<li><a href="/data-pages/${p.slug}/">${p.name}</a></li>`).join("")}
      </ul>
    </div>

    <div class="side-block">
      <div class="side-block-head">More Guides</div>
      <ul>
        ${otherPosts.map(p => `<li><a href="/blog/${p.f}">${p.t}</a></li>`).join("")}
      </ul>
    </div>
  </aside>
</div>

<div class="wrap" style="padding-bottom:64px;">
  <div class="cta-b">
    <h2>Find the Right B2B Email List</h2>
    <p>Browse 200+ location-targeted business contact databases and start building your pipeline today.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/data-pages/" class="btn-p">Browse All Email Lists →</a>
      <a href="/blog/" class="btn-g">Read More Guides</a>
    </div>
  </div>
</div>

<footer>
  <div class="wrap">
    <div class="footer-in">
      <div class="fbrand">
        <a href="/" class="logo">Leads<span>Blue</span></a>
        <p>Verified B2B email databases for lead generation, cold outreach, and targeted marketing. 200+ countries covered.</p>
      </div>
      <div class="fc">
        <h4>Browse</h4>
        <ul>
          <li><a href="/data-pages/">All Email Lists</a></li>
          ${sidePages.slice(0, 4).map(p => `<li><a href="/data-pages/${p.slug}/">${p.name}</a></li>`).join("")}
        </ul>
      </div>
      <div class="fc">
        <h4>Guides</h4>
        <ul>
          <li><a href="/blog/cold-email-strategy.html">Cold Email Strategy</a></li>
          <li><a href="/blog/b2b-lead-generation-strategies.html">Lead Generation</a></li>
          <li><a href="/blog/is-buying-email-lists-legal.html">Is It Legal?</a></li>
          <li><a href="/blog/best-email-list-providers.html">Best Providers</a></li>
        </ul>
      </div>
      <div class="fc">
        <h4>Company</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/data-pages/">Catalog</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/sitemap.xml">Sitemap</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bot">
      <p>© 2025 LeadsBlue. All rights reserved.</p>
      <p>${headline} · LeadsBlue B2B Data Blog</p>
    </div>
  </div>
</footer>

</body>
</html>`;
}

const blogPosts = [

  // 1
  {
    file: "what-is-b2b-email-list.html",
    title: "What Is a B2B Email List? | LeadsBlue",
    metaDesc: "Learn what a B2B email list is, how it works, and why it is essential for modern lead generation and sales outreach.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>What Is a B2B Email List?</h1>
<p>A B2B email list is a curated database of business contacts — including company names, email addresses, job titles, and industry details — used by marketers and sales teams to reach potential customers directly.</p>

<h2>Why B2B Email Lists Matter</h2>
<p>Unlike consumer marketing, B2B outreach targets decision-makers: CEOs, procurement managers, department heads, and founders. Having access to a verified email list dramatically shortens the sales cycle by removing the guesswork of finding the right contact.</p>
<p>Businesses that invest in quality data consistently outperform those relying on organic traffic alone. A targeted email database lets you reach hundreds of relevant prospects in a single campaign.</p>

<h2>What Does a B2B Email List Contain?</h2>
<p>A well-structured B2B email list typically includes:</p>
<ul>
  <li>Business name and website</li>
  <li>Decision-maker email address</li>
  <li>Industry or SIC code classification</li>
  <li>Company size and employee count</li>
  <li>Geographic location</li>
  <li>Phone number (where available)</li>
</ul>

<h2>How Are Email Lists Built?</h2>
<p>Reputable providers build lists through a combination of public business registries, web crawling, opt-in directories, and manual verification. The goal is accuracy — an outdated or unverified list leads to high bounce rates and damaged sender reputation.</p>

<h2>B2B vs B2C Email Lists</h2>
<p>B2C lists target individual consumers, whereas B2B lists focus on company contacts. B2B emails tend to have lower volume but significantly higher value per contact, since each prospect represents a potential business deal rather than a single purchase.</p>

<h2>When Should You Use One?</h2>
<p>B2B email lists are ideal for:</p>
<ul>
  <li>Launching a new product to a target industry</li>
  <li>Expanding into a new geographic market</li>
  <li>Running cold outreach as part of a sales pipeline</li>
  <li>Supplementing inbound leads during slow periods</li>
</ul>

<h2>Choosing the Right List</h2>
<p>Always prioritize lists that are verified, regularly updated, and segmented by industry or location. Generic, untargeted lists produce poor results. Location-specific lists — like those covering a single country or state — tend to perform better because the messaging can be tailored precisely.</p>

<h2>Explore Available Email Lists</h2>
<p>Browse location-targeted B2B databases to find contacts relevant to your market:</p>
${internalLinks(links)}

<h2>Start Your Outreach Today</h2>
<p>Ready to connect with verified business contacts? Explore the full catalog at <a href="/data-pages/">LeadsBlue Email Lists</a> and find the right database for your next campaign.</p>
`;
    }
  },

  // 2
  {
    file: "how-to-use-email-database.html",
    title: "How to Use a B2B Email Database Effectively",
    metaDesc: "Step-by-step guide on how to use a B2B email database for cold outreach, lead generation, and sales prospecting.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>How to Use a B2B Email Database Effectively</h1>
<p>Buying a B2B email database is only the first step. How you use it determines whether you get results or wasted spend. This guide walks through best practices for turning a raw contact list into a high-performing outreach system.</p>

<h2>Step 1: Segment Your List Before Sending</h2>
<p>Never send a single generic email to your entire database. Segment by industry, company size, location, or job title. Segmented campaigns consistently achieve higher open and reply rates because the message feels relevant rather than broadcast.</p>

<h2>Step 2: Write a Strong Cold Email</h2>
<p>A cold email that works has three components:</p>
<ul>
  <li><strong>A specific subject line</strong> — avoid clickbait; reference something real about the recipient's industry or location</li>
  <li><strong>A short opening</strong> — two sentences maximum explaining why you are reaching out</li>
  <li><strong>A clear CTA</strong> — one ask, one link, one action</li>
</ul>

<h2>Step 3: Clean Your List First</h2>
<p>Before importing into your email tool, run the list through an email verification service. Remove invalid, catch-all, and role-based addresses. This protects your sender reputation and improves deliverability from the very first send.</p>

<h2>Step 4: Use a Dedicated Sending Domain</h2>
<p>Never send cold outreach from your primary business domain. Set up a subdomain or secondary domain, warm it up over two to three weeks, and use it exclusively for prospecting. This protects your main domain from spam filters.</p>

<h2>Step 5: Follow Up Consistently</h2>
<p>Most replies come from follow-up emails, not the first touch. Plan a sequence of three to five emails spaced four to seven days apart. Each follow-up should add new value rather than simply repeating the original ask.</p>

<h2>Step 6: Track and Optimise</h2>
<p>Monitor open rates, click rates, and reply rates per segment. If a particular industry or location is responding well, double down on it. If a segment is silent, adjust the messaging before sending more volume.</p>

<h2>Step 7: Stay Compliant</h2>
<p>Include an unsubscribe option in every email. Respect opt-out requests immediately. Familiarise yourself with CAN-SPAM, GDPR, and any local regulations applicable to your target geography.</p>

<h2>Recommended Lists for Your Next Campaign</h2>
${internalLinks(links)}

<h2>Ready to Build Your Pipeline?</h2>
<p>Find verified, location-targeted B2B contact databases at <a href="/data-pages/">LeadsBlue</a> and launch your next outreach campaign with confidence.</p>
`;
    }
  },

  // 3
  {
    file: "is-buying-email-lists-legal.html",
    title: "Is Buying Email Lists Legal? What You Need to Know",
    metaDesc: "Find out whether buying B2B email lists is legal, what regulations apply, and how to stay compliant with GDPR and CAN-SPAM.",
    body: () => {
      const links = randomPages(3);
      return `
<h1>Is Buying Email Lists Legal?</h1>
<p>This is one of the most common questions from marketers new to B2B outreach. The short answer: buying email lists is legal in most jurisdictions, but how you use them is what determines compliance.</p>

<h2>The Difference Between B2B and B2C Email Law</h2>
<p>Most email regulations — including GDPR in Europe — draw a meaningful distinction between marketing to consumers and marketing to businesses. B2B cold email is generally treated more permissively, provided it targets business email addresses and is relevant to the recipient's professional role.</p>

<h2>CAN-SPAM (United States)</h2>
<p>The CAN-SPAM Act does not prohibit cold email. It requires that you:</p>
<ul>
  <li>Use accurate sender information and subject lines</li>
  <li>Include a physical mailing address</li>
  <li>Provide a working unsubscribe mechanism</li>
  <li>Honor opt-out requests within ten business days</li>
</ul>
<p>Purchasing a list and emailing those contacts is permitted as long as these requirements are met.</p>

<h2>GDPR (European Union)</h2>
<p>GDPR is stricter. For B2B email in the EU, the most commonly cited lawful basis is "legitimate interest." This means your outreach must be relevant to the recipient's job function, and you must include an easy way to opt out. Purchasing lists from compliant providers who have documented their data sources helps establish this basis.</p>

<h2>CASL (Canada)</h2>
<p>Canada's Anti-Spam Law is one of the strictest globally. Cold B2B email is only permitted where implied consent exists — for example, if the contact's email address is publicly listed for business purposes. Always verify whether Canadian contacts meet this standard before emailing.</p>

<h2>Best Practices for Staying Compliant</h2>
<ul>
  <li>Only email business addresses, never personal ones</li>
  <li>Keep your messaging relevant to the recipient's industry or role</li>
  <li>Always include an unsubscribe link</li>
  <li>Remove opt-outs immediately from your list</li>
  <li>Source lists from providers who document their data collection methods</li>
</ul>

<h2>Browse Compliant B2B Databases</h2>
${internalLinks(links)}

<h2>Final Word</h2>
<p>Buying and using a B2B email list is legal when done responsibly. The key is targeting relevant contacts, being transparent in your outreach, and making it easy to opt out. Explore our full range of verified lists at <a href="/data-pages/">LeadsBlue</a>.</p>
`;
    }
  },

  // 4
  {
    file: "best-email-list-providers.html",
    title: "Best B2B Email List Providers in 2025",
    metaDesc: "Compare the best B2B email list providers for lead generation, cold outreach, and sales prospecting in 2025.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>Best B2B Email List Providers in 2025</h1>
<p>Choosing the right data provider is one of the highest-leverage decisions in any outreach strategy. Poor data means wasted time, high bounce rates, and damaged sender reputation. Great data means faster pipelines and higher conversion rates.</p>

<h2>What to Look for in a Provider</h2>
<p>Before choosing a provider, evaluate them on these criteria:</p>
<ul>
  <li><strong>Verification rate</strong> — what percentage of contacts are actively verified?</li>
  <li><strong>Update frequency</strong> — how often is the database refreshed?</li>
  <li><strong>Segmentation options</strong> — can you filter by location, industry, company size, or job title?</li>
  <li><strong>Data source transparency</strong> — where does the data come from?</li>
  <li><strong>Pricing model</strong> — per record, per list, or subscription?</li>
</ul>

<h2>Types of Providers</h2>

<h3>Location-Based Providers</h3>
<p>These specialize in contact databases for specific countries, states, or cities. They are ideal when your product or service is region-specific or when you are expanding into a new geographic market. LeadsBlue offers an extensive catalog of location-targeted lists covering hundreds of regions.</p>

<h3>Industry-Based Providers</h3>
<p>These providers let you target by vertical — healthcare, finance, manufacturing, SaaS, and so on. Useful when your offering solves a problem specific to one sector.</p>

<h3>All-in-One Platforms</h3>
<p>Platforms like Apollo.io and ZoomInfo combine prospecting tools with contact data. They are powerful but can be expensive for small teams who only need list exports.</p>

<h2>How to Evaluate a List Before Buying</h2>
<ul>
  <li>Request a sample and verify a handful of emails manually</li>
  <li>Check the date the list was last updated</li>
  <li>Look for delivery guarantees or replacement policies on bad data</li>
</ul>

<h2>Explore Available Lists by Location</h2>
<p>Looking for contacts in a specific region? Browse these targeted databases:</p>
${internalLinks(links)}

<h2>Start Prospecting</h2>
<p>Browse the full catalog of verified, location-segmented B2B contact lists at <a href="/data-pages/">LeadsBlue</a> and find the right fit for your campaign.</p>
`;
    }
  },

  // 5
  {
    file: "cold-email-strategy.html",
    title: "Cold Email Strategy That Actually Works in 2025",
    metaDesc: "Learn a proven cold email strategy for B2B outreach including subject lines, follow-ups, and how to build a high-converting sequence.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>Cold Email Strategy That Actually Works</h1>
<p>Cold email remains one of the highest-ROI channels in B2B sales — when done correctly. The difference between a campaign that gets replies and one that gets flagged as spam comes down to strategy, not volume.</p>

<h2>Start With the Right List</h2>
<p>No amount of copywriting will fix a bad list. Your contacts should be verified, relevant to your offer, and segmented by a meaningful attribute — location, industry, or company size. Spray-and-pray email blasts are a relic; precision targeting is the standard now.</p>

<h2>Write Subject Lines That Get Opens</h2>
<p>Your subject line is the only thing standing between your email and the trash folder. Best practices:</p>
<ul>
  <li>Keep it under eight words</li>
  <li>Reference something specific — a location, an industry problem, a mutual connection</li>
  <li>Avoid spam trigger words: free, guaranteed, urgent, act now</li>
  <li>Test two or three variants and measure open rates</li>
</ul>

<h2>Structure Your Opening Line</h2>
<p>Skip the "I hope this email finds you well." Open with context — why you are emailing this specific person, at this specific company, right now. One sentence is enough. Make it about them, not you.</p>

<h2>State Your Value Clearly</h2>
<p>In two to three sentences, explain what you do and what outcome it delivers. Be concrete. "We help logistics companies reduce invoice processing time by 40%" beats "We offer innovative software solutions for your business."</p>

<h2>One CTA Only</h2>
<p>Every cold email should have exactly one call to action. Options that work well in B2B:</p>
<ul>
  <li>"Would a 15-minute call this week make sense?"</li>
  <li>"Want me to send over a case study relevant to your industry?"</li>
  <li>"Does this sound like a fit for your team?"</li>
</ul>

<h2>Build a Follow-Up Sequence</h2>
<p>Plan at least four follow-ups. Most positive replies come at touch three or four. Each follow-up should:</p>
<ul>
  <li>Be shorter than the previous email</li>
  <li>Add a new angle, piece of information, or social proof</li>
  <li>Never guilt-trip or be passive-aggressive</li>
</ul>

<h2>Track, Test, Iterate</h2>
<p>Run A/B tests on subject lines, CTAs, and opening lines. Small improvements compound quickly across hundreds of contacts.</p>

<h2>Find Targeted Contacts for Your Campaign</h2>
${internalLinks(links)}

<h2>Launch Your Campaign</h2>
<p>A great strategy needs great data. Browse verified B2B contact lists by region at <a href="/data-pages/">LeadsBlue</a> and start building your sequence today.</p>
`;
    }
  },

  // 6
  {
    file: "b2b-lead-generation-strategies.html",
    title: "Top B2B Lead Generation Strategies for 2025",
    metaDesc: "Discover the most effective B2B lead generation strategies including cold email, content marketing, and data-driven outreach.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>Top B2B Lead Generation Strategies for 2025</h1>
<p>Generating a consistent flow of qualified B2B leads is the single biggest challenge for most sales and marketing teams. Here are the strategies that are working right now — and how to combine them for maximum effect.</p>

<h2>1. Cold Email Outreach</h2>
<p>When built on verified, targeted contact data, cold email delivers some of the best cost-per-lead numbers of any channel. The key is personalization at scale — segment your list tightly and tailor your messaging to each segment's specific pain points.</p>

<h2>2. LinkedIn Outreach</h2>
<p>LinkedIn is the most direct channel for reaching decision-makers in most B2B verticals. Connection requests with a personalized note, followed by a value-driven message, consistently outperform generic InMails. Combine LinkedIn with email for a multi-touch sequence.</p>

<h2>3. Content Marketing and SEO</h2>
<p>Publishing guides, case studies, and comparison pages that target long-tail search queries generates inbound leads at zero marginal cost per click. It is slower to build but compounds over time, making it an essential long-term investment alongside outbound channels.</p>

<h2>4. Retargeting</h2>
<p>Retargeting website visitors with display or social ads keeps your brand in front of warm prospects who have already shown interest. Pair retargeting with email follow-ups for a unified nurture experience.</p>

<h2>5. Referral Programs</h2>
<p>Existing customers are your most credible source of new leads. A structured referral program — with clear incentives and an easy submission process — turns happy clients into a low-cost sales channel.</p>

<h2>6. Purchased Contact Databases</h2>
<p>For companies entering new markets or scaling quickly, buying a verified B2B database provides immediate access to hundreds or thousands of targeted prospects. The critical success factor is list quality — outdated or inaccurate data produces poor results regardless of how good your messaging is.</p>

<h2>Combining Strategies for Maximum Impact</h2>
<p>The most effective lead generation programs layer multiple channels. A typical high-performing stack looks like: targeted email list → cold email sequence → LinkedIn follow-up → retargeting ad → nurture content. Each touchpoint reinforces the others and keeps your brand visible throughout the buying journey.</p>

<h2>Explore Targeted Contact Databases</h2>
${internalLinks(links)}

<h2>Build Your Pipeline</h2>
<p>Access verified B2B contact data to fuel your lead generation strategy. Browse the full catalog at <a href="/data-pages/">LeadsBlue</a>.</p>
`;
    }
  },

  // 7
  {
    file: "email-marketing-for-startups.html",
    title: "Email Marketing for Startups: A Practical B2B Guide",
    metaDesc: "How startups can use B2B email marketing and contact databases to generate leads fast without a large marketing budget.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>Email Marketing for Startups: A Practical B2B Guide</h1>
<p>Startups face a unique challenge: they need leads fast, but have limited budgets and brand recognition. B2B email marketing — when done right — is one of the few channels that can deliver pipeline quickly without requiring massive spend.</p>

<h2>Why Email Works for Startups</h2>
<p>Email has a low barrier to entry. You do not need creative production budgets, media buys, or a large team. A well-researched contact list, a thoughtful email, and a reliable sending tool is enough to start generating conversations. For early-stage companies, that speed matters enormously.</p>

<h2>Step 1: Define Your Ideal Customer Profile</h2>
<p>Before you touch any email tool, get precise about who you are targeting. Define by industry, company size, geography, job title, and specific pain point. The tighter your ICP, the more relevant your messaging — and the higher your reply rate.</p>

<h2>Step 2: Acquire Targeted Contact Data</h2>
<p>Rather than spending months building a list from scratch, startups can accelerate by purchasing a verified B2B database segmented to their ICP. This gives you immediate access to hundreds of qualified contacts to test messaging against.</p>

<h2>Step 3: Write Startup-Specific Messaging</h2>
<p>Use your startup status to your advantage. Prospects expect polished messaging from large enterprises — a concise, direct, human email from a founder often stands out. Lead with the problem you solve, not your company's story.</p>

<h2>Step 4: Start Small, Learn Fast</h2>
<p>Send to a small segment first — 50 to 100 contacts. Measure open and reply rates. Identify what is working before scaling. This approach conserves your domain reputation and lets you optimise before committing to a large send.</p>

<h2>Step 5: Build a Simple Nurture Sequence</h2>
<p>Not every prospect is ready to buy immediately. A three-email follow-up sequence — spaced one week apart — keeps you visible without being aggressive. Include a piece of useful content in each follow-up to provide value regardless of whether they reply.</p>

<h2>Tools That Work for Startups</h2>
<ul>
  <li>Instantly or Smartlead for cold email sequencing</li>
  <li>Apollo or Hunter for additional prospecting</li>
  <li>NeverBounce or ZeroBounce for list verification</li>
  <li>Google Workspace for sending domain setup</li>
</ul>

<h2>Find Contacts for Your Target Market</h2>
${internalLinks(links)}

<h2>Get Started Today</h2>
<p>Browse location and industry-targeted B2B contact databases at <a href="/data-pages/">LeadsBlue</a> and start building your first outreach campaign.</p>
`;
    }
  },

  // 8
  {
    file: "targeted-marketing-explained.html",
    title: "Targeted Marketing Explained: How to Reach the Right Business Contacts",
    metaDesc: "Learn what targeted marketing means in a B2B context and how to use contact databases to reach the right prospects.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>Targeted Marketing Explained</h1>
<p>Targeted marketing means delivering your message to a specific, defined audience rather than broadcasting it to everyone and hoping the right people see it. In a B2B context, it is the difference between sending 10,000 generic emails and sending 500 highly relevant ones — the latter almost always wins.</p>

<h2>What Makes Marketing "Targeted"?</h2>
<p>Targeting happens along several dimensions:</p>
<ul>
  <li><strong>Geographic</strong> — reaching businesses in a specific country, state, or city</li>
  <li><strong>Industry</strong> — focusing on one vertical where your solution has the clearest fit</li>
  <li><strong>Company size</strong> — distinguishing between SMBs, mid-market, and enterprise</li>
  <li><strong>Job title</strong> — ensuring your message reaches the actual decision-maker, not a gatekeeper</li>
  <li><strong>Technographic</strong> — targeting companies using specific tools or platforms</li>
</ul>

<h2>Why Generic Marketing Fails in B2B</h2>
<p>B2B buyers are sophisticated and time-poor. A message that does not immediately signal relevance gets deleted. Decision-makers receive dozens of cold emails per week — only the ones that feel specifically written for their situation earn a reply.</p>

<h2>How Contact Databases Enable Targeted Marketing</h2>
<p>A high-quality B2B contact database gives you the raw material for precision targeting. Instead of building your audience slowly through content or advertising, you can immediately identify and reach verified contacts that match your ideal customer profile — segmented by location, industry, and role.</p>

<h2>Building a Targeted Campaign</h2>

<h3>1. Define the Segment</h3>
<p>Start by choosing one specific audience to focus on. Resist the temptation to target everyone at once. A campaign aimed at "finance managers at mid-sized logistics companies in Texas" will dramatically outperform one aimed at "businesses that might need our software."</p>

<h3>2. Craft Segment-Specific Messaging</h3>
<p>Write emails that reference the specific challenges your chosen segment faces. Name their industry, reference common pain points, and position your offer in terms they recognise.</p>

<h3>3. Measure and Expand</h3>
<p>Once a segment is performing, replicate the approach in adjacent markets — a similar industry, a neighbouring geography, or a related job title.</p>

<h2>Explore Location-Targeted Lists</h2>
${internalLinks(links)}

<h2>Start Targeting the Right Contacts</h2>
<p>Find verified, segmented B2B contact data at <a href="/data-pages/">LeadsBlue</a> and build campaigns that reach exactly the right businesses.</p>
`;
    }
  },

  // 9
  {
    file: "business-contact-database-guide.html",
    title: "Business Contact Database: Complete Guide for B2B Marketers",
    metaDesc: "Everything you need to know about business contact databases — what they include, how to choose one, and how to use them for outreach.",
    body: () => {
      const links = randomPages(5);
      return `
<h1>Business Contact Database: Complete Guide for B2B Marketers</h1>
<p>A business contact database is a structured collection of information about companies and their key personnel. For B2B marketers and sales teams, it is the foundation of every outreach program — the raw material from which campaigns, pipelines, and revenue are built.</p>

<h2>What a Business Contact Database Contains</h2>
<p>The specific fields vary by provider, but a comprehensive database typically includes:</p>
<ul>
  <li>Company name, website, and industry classification</li>
  <li>Physical address and registered location</li>
  <li>Primary contact name and job title</li>
  <li>Business email address (verified)</li>
  <li>Phone number</li>
  <li>Employee count and estimated revenue range</li>
</ul>

<h2>How Databases Are Compiled</h2>
<p>Reputable providers aggregate data from multiple sources: company registration records, professional directories, publicly listed contact pages, and opt-in data partnerships. The best providers layer automated verification on top — checking that email addresses are active and deliverable before including them.</p>

<h2>Data Quality: The Most Important Factor</h2>
<p>A database is only as useful as its accuracy. Key quality indicators to evaluate:</p>
<ul>
  <li><strong>Bounce rate</strong> — a well-verified list should yield fewer than 5% hard bounces</li>
  <li><strong>Update frequency</strong> — contacts change jobs; lists should be refreshed at least quarterly</li>
  <li><strong>Source transparency</strong> — reputable providers document where data comes from</li>
</ul>

<h2>Choosing the Right Database for Your Use Case</h2>

<h3>Expanding into a New Region</h3>
<p>Choose a location-specific database that covers your target geography. Entries should include local business registration data where applicable.</p>

<h3>Targeting a Specific Industry</h3>
<p>Look for databases with industry classification (SIC or NAICS codes) so you can filter precisely to your vertical.</p>

<h3>High-Volume Prospecting</h3>
<p>For large outreach programs, prioritise databases that offer bulk exports and are compatible with common email sequencing tools.</p>

<h2>Integrating a Database into Your Workflow</h2>
<ol>
  <li>Download and verify the list</li>
  <li>Segment by your target criteria</li>
  <li>Import into your email sequencing tool</li>
  <li>Write segment-specific copy</li>
  <li>Launch, measure, and iterate</li>
</ol>

<h2>Browse Available Databases</h2>
${internalLinks(links)}

<h2>Find Your Database</h2>
<p>Explore a comprehensive catalog of verified, location-targeted business contact databases at <a href="/data-pages/">LeadsBlue</a>.</p>
`;
    }
  },

  // 10
  {
    file: "how-to-find-business-leads.html",
    title: "How to Find Business Leads: A Practical B2B Guide",
    metaDesc: "Learn the most effective ways to find business leads for B2B sales, including contact databases, LinkedIn, content marketing, and cold email.",
    body: () => {
      const links = randomPages(4);
      return `
<h1>How to Find Business Leads</h1>
<p>Finding qualified business leads is the starting point of every B2B sales process. There is no shortage of methods — the challenge is identifying which ones deliver the best quality leads for your specific offer and target market.</p>

<h2>Method 1: Purchase a Verified B2B Contact Database</h2>
<p>The fastest way to access a large volume of targeted contacts is to buy a verified email list segmented to your ideal customer profile. Quality providers offer databases filtered by country, industry, company size, and job function. This approach bypasses the slow process of building a list organically and gives you immediate access to testable prospects.</p>

<h2>Method 2: LinkedIn Sales Navigator</h2>
<p>LinkedIn's advanced search allows you to filter prospects by title, industry, location, company size, and seniority. You can then reach out directly via connection request or InMail. The drawback is cost and volume — LinkedIn outreach does not scale as quickly as email, but it complements it well as a follow-up channel.</p>

<h2>Method 3: Content Marketing and Inbound SEO</h2>
<p>Publishing content that ranks for the search terms your prospects use brings inbound leads to you. This requires patience — it typically takes three to six months to see meaningful organic traffic — but the leads generated tend to have high intent and convert at better rates than cold contacts.</p>

<h2>Method 4: Referrals and Partnerships</h2>
<p>Existing customers and strategic partners are often the highest-quality source of leads. A formal referral program with clear incentives turns your current relationships into a scalable acquisition channel.</p>

<h2>Method 5: Trade Shows and Events</h2>
<p>Industry events concentrate your target audience in one place. A well-prepared presence — with a clear value proposition and a defined follow-up process — can generate a significant batch of warm leads in a short period.</p>

<h2>Method 6: Cold Calling</h2>
<p>Often dismissed, cold calling remains effective in industries where decision-makers are difficult to reach by email. It works best when combined with email outreach as part of a multi-touch sequence rather than used in isolation.</p>

<h2>Choosing the Right Method for Your Business</h2>
<p>The best lead generation strategy depends on your sales cycle length, average deal size, team capacity, and target market. Most high-performing B2B teams combine at least two or three methods — typically a purchased contact database for outbound volume, LinkedIn for targeted follow-up, and content for long-term inbound growth.</p>

<h2>Browse Contact Databases by Location</h2>
${internalLinks(links)}

<h2>Start Finding Leads Today</h2>
<p>Access a catalog of verified, location-segmented B2B contact lists at <a href="/data-pages/">LeadsBlue</a> and build your lead generation program on a foundation of quality data.</p>
`;
    }
  }

];

// Generate each blog page
blogPosts.forEach(({ file, title, metaDesc, body }) => {
  const content = blogPage({ file, title, metaDesc, body: body() });
  fs.writeFileSync(`${blogDir}/${file}`, content);
});

console.log(`Blog generated: ${blogPosts.length} pages written to /public/blog/`);

// -------------------------------------------------------
// BLOG INDEX PAGE — /public/blog/index.html
// -------------------------------------------------------
const blogMeta = [
  { f: "what-is-b2b-email-list.html",         t: "What Is a B2B Email List?",                d: "Learn what a B2B email list is, how it works, and why it is essential for lead generation." },
  { f: "how-to-use-email-database.html",       t: "How to Use a B2B Email Database",          d: "Step-by-step guide to using a B2B database for cold outreach and sales prospecting." },
  { f: "is-buying-email-lists-legal.html",     t: "Is Buying Email Lists Legal?",             d: "Understand the legal landscape for B2B email lists including CAN-SPAM and GDPR compliance." },
  { f: "best-email-list-providers.html",       t: "Best B2B Email List Providers in 2025",    d: "Compare the top B2B email list providers for lead generation and cold outreach in 2025." },
  { f: "cold-email-strategy.html",             t: "Cold Email Strategy That Actually Works",  d: "Proven cold email strategy for B2B outreach including subject lines and follow-up sequences." },
  { f: "b2b-lead-generation-strategies.html",  t: "Top B2B Lead Generation Strategies",       d: "The most effective B2B lead generation strategies including cold email and targeted outreach." },
  { f: "email-marketing-for-startups.html",    t: "Email Marketing for Startups",             d: "How startups can use B2B email marketing and contact databases to generate leads fast." },
  { f: "targeted-marketing-explained.html",    t: "Targeted Marketing Explained",             d: "How to use contact databases to reach the right business contacts with precise targeting." },
  { f: "business-contact-database-guide.html", t: "Business Contact Database Guide",          d: "Everything you need to know about business contact databases for B2B marketers." },
  { f: "how-to-find-business-leads.html",      t: "How to Find Business Leads",               d: "Practical methods for finding B2B leads including databases, LinkedIn, and cold email." }
];

const blogIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B2B Email Marketing Blog | Guides & Strategies | LeadsBlue</title>
  <meta name="description" content="Free B2B email marketing guides covering cold email strategy, lead generation, email list legality, and how to use business contact databases effectively.">
  <link rel="canonical" href="${baseUrl}/blog/">
  <meta property="og:title" content="B2B Email Marketing Blog | LeadsBlue">
  <meta property="og:description" content="Free guides on B2B email lists, cold outreach strategy, and lead generation.">
  <meta property="og:url" content="${baseUrl}/blog/">
  <meta property="og:site_name" content="LeadsBlue">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "LeadsBlue B2B Marketing Blog",
    "description": "Guides and strategies for B2B email marketing, cold outreach, and lead generation.",
    "url": baseUrl + "/blog/",
    "publisher": { "@type": "Organization", "name": "LeadsBlue", "url": baseUrl },
    "blogPost": blogMeta.map(p => ({
      "@type": "BlogPosting",
      "headline": p.t,
      "description": p.d,
      "url": baseUrl + "/blog/" + p.f,
      "datePublished": today
    }))
  })}</script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    :root{--bg:#0a0f1e;--surf:#111827;--surf2:#1a2235;--bdr:#1e2d45;--acc:#0ea5e9;--acc2:#38bdf8;--txt:#e2e8f0;--muted:#94a3b8;--hf:'DM Serif Display',Georgia,serif;--bf:'IBM Plex Sans','Helvetica Neue',sans-serif;--mf:'IBM Plex Mono',monospace}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--bg);color:var(--txt);font-family:var(--bf);font-size:16px;line-height:1.7;overflow-x:hidden}
    a{color:var(--acc2);text-decoration:none}a:hover{color:#fff;text-decoration:underline}
    .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
    nav{border-bottom:1px solid var(--bdr);padding:15px 0;position:sticky;top:0;background:rgba(10,15,30,0.93);backdrop-filter:blur(12px);z-index:100}
    .nav-in{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
    .logo{font-family:var(--mf);font-size:17px;font-weight:500;color:#fff;text-decoration:none}.logo span{color:var(--acc)}
    nav ul{list-style:none;display:flex;gap:24px}
    nav ul a{color:var(--muted);font-size:13px;font-weight:500}nav ul a:hover{color:#fff;text-decoration:none}
    .bc{padding:14px 0;font-size:12px;color:var(--muted);font-family:var(--mf)}
    .bc a{color:var(--muted)}.bc span{margin:0 6px;opacity:.4}
    .hero{padding:64px 0 52px;position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;top:-150px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(14,165,233,.1) 0%,transparent 70%);pointer-events:none}
    .tag{display:inline-block;font-family:var(--mf);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--acc);border:1px solid rgba(14,165,233,.3);padding:4px 11px;border-radius:2px;margin-bottom:20px}
    h1{font-family:var(--hf);font-size:clamp(32px,5vw,52px);font-weight:400;line-height:1.1;letter-spacing:-.8px;color:#fff;margin-bottom:14px}
    .hero p{font-size:16px;color:var(--muted);max-width:560px;font-weight:300}
    .posts{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:4px;overflow:hidden;margin:48px 0}
    .post{background:var(--surf);padding:28px 24px;transition:background .2s;display:flex;flex-direction:column}
    .post:hover{background:var(--surf2)}
    .post-num{font-family:var(--mf);font-size:10px;color:var(--acc);margin-bottom:14px;letter-spacing:1px}
    .post h2{font-family:var(--hf);font-size:20px;font-weight:400;color:#fff;line-height:1.25;margin-bottom:10px}
    .post p{color:var(--muted);font-size:13px;line-height:1.65;flex:1;margin-bottom:18px}
    .post a.read{font-family:var(--mf);font-size:11px;color:var(--acc);letter-spacing:1px;text-transform:uppercase}
    .post a.read:hover{color:#fff;text-decoration:none}
    footer{border-top:1px solid var(--bdr);padding:32px 0;margin-top:20px}
    .foot-in{display:flex;justify-content:space-between;align-items:center}
    .foot-in p{color:var(--muted);font-size:12px}
    @media(max-width:768px){.posts{grid-template-columns:1fr}nav ul{display:none}}
  </style>
</head>
<body>
<nav>
  <div class="nav-in">
    <a href="/" class="logo">Leads<span>Blue</span></a>
    <ul>
      <li><a href="/data-pages/">All Lists</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/#faq">FAQ</a></li>
    </ul>
  </div>
</nav>
<div class="wrap">
  <nav class="bc"><a href="/">Home</a><span>›</span>Blog</nav>
</div>
<section class="hero">
  <div class="wrap">
    <span class="tag">B2B Marketing Resources</span>
    <h1>B2B Email Marketing Blog</h1>
    <p>Free guides on cold email strategy, lead generation, B2B databases, and outreach best practices from the LeadsBlue team.</p>
  </div>
</section>
<div class="wrap">
  <div class="posts">
    ${blogMeta.map((p, i) => `<div class="post">
      <span class="post-num">0${i + 1}</span>
      <h2>${p.t}</h2>
      <p>${p.d}</p>
      <a href="/blog/${p.f}" class="read">Read Guide →</a>
    </div>`).join("")}
  </div>
  <p style="text-align:center;margin-bottom:56px;">
    <a href="/data-pages/" style="display:inline-block;background:var(--acc);color:#fff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:3px;">Browse B2B Email Lists →</a>
  </p>
</div>
<footer>
  <div class="wrap">
    <div class="foot-in">
      <p>© 2025 LeadsBlue · B2B Email Data Provider</p>
      <p><a href="/" style="color:var(--muted)">Home</a> · <a href="/data-pages/" style="color:var(--muted)">Lists</a> · <a href="/sitemap.xml" style="color:var(--muted)">Sitemap</a></p>
    </div>
  </div>
</footer>
</body>
</html>`;

fs.writeFileSync(`${blogDir}/index.html`, blogIndexHtml);
console.log("Blog index page generated.");

// -------------------------------------------------------
// ROBOTS.TXT
// -------------------------------------------------------
const robotsTxt = `User-agent: *
Allow: /
Allow: /llm/

# LLM & AI Crawler Data
User-agent: GPTBot
Allow: /llm/
Allow: /data-pages/
Allow: /blog/

User-agent: anthropic-ai
Allow: /llm/
Allow: /data-pages/
Allow: /blog/

User-agent: PerplexityBot
Allow: /llm/
Allow: /data-pages/
Allow: /blog/

Sitemap: ${baseUrl}/sitemap.xml`;

fs.writeFileSync("./public/robots.txt", robotsTxt);
console.log("robots.txt generated.");

// -------------------------------------------------------
// CLOUDFLARE _headers
// -------------------------------------------------------
const headersFile = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/*.html
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/data-pages/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/blog/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=86400

/robots.txt
  Cache-Control: public, max-age=86400

/assets/*
  Cache-Control: public, max-age=31536000, immutable`;

fs.writeFileSync("./public/_headers", headersFile);
console.log("_headers file generated.");

// -------------------------------------------------------
// CUSTOM 404 PAGE
// -------------------------------------------------------
const randomFour = [...allPages].sort(() => Math.random() - 0.5).slice(0, 4);
const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found | LeadsBlue</title>
  <meta name="description" content="The page you were looking for could not be found. Browse our full catalog of B2B email lists.">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    :root{--bg:#0a0f1e;--surf:#111827;--surf2:#1a2235;--bdr:#1e2d45;--acc:#0ea5e9;--acc2:#38bdf8;--txt:#e2e8f0;--muted:#94a3b8;--hf:'DM Serif Display',Georgia,serif;--bf:'IBM Plex Sans','Helvetica Neue',sans-serif;--mf:'IBM Plex Mono',monospace}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--bg);color:var(--txt);font-family:var(--bf);min-height:100vh;display:flex;flex-direction:column}
    a{color:var(--acc2);text-decoration:none}a:hover{color:#fff}
    nav{border-bottom:1px solid var(--bdr);padding:15px 24px;display:flex;align-items:center;justify-content:space-between}
    .logo{font-family:var(--mf);font-size:17px;color:#fff}.logo span{color:var(--acc)}
    nav ul{list-style:none;display:flex;gap:22px}
    nav ul a{color:var(--muted);font-size:13px}nav ul a:hover{color:#fff;text-decoration:none}
    main{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 24px;position:relative;overflow:hidden}
    main::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:500px;background:radial-gradient(ellipse,rgba(14,165,233,.07) 0%,transparent 70%);pointer-events:none}
    .content{text-align:center;max-width:560px}
    .err-code{font-family:var(--mf);font-size:11px;letter-spacing:3px;color:var(--acc);text-transform:uppercase;margin-bottom:20px;display:block}
    h1{font-family:var(--hf);font-size:clamp(36px,6vw,64px);color:#fff;font-weight:400;letter-spacing:-1px;margin-bottom:16px;line-height:1.1}
    .content p{color:var(--muted);font-size:15px;margin-bottom:36px;line-height:1.7}
    .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
    .btn-p{background:var(--acc);color:#fff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:3px;transition:background .2s}
    .btn-p:hover{background:var(--acc2);color:#fff;text-decoration:none}
    .btn-g{border:1px solid var(--bdr);color:var(--txt);font-size:14px;font-weight:500;padding:12px 24px;border-radius:3px}
    .btn-g:hover{border-color:var(--acc);color:var(--acc2);text-decoration:none}
    .suggestions h3{font-family:var(--mf);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
    .sug-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
    .sug-card{background:var(--surf);border:1px solid var(--bdr);border-radius:4px;padding:12px 16px;font-size:13px;color:var(--txt);text-align:left;transition:border-color .2s,background .2s}
    .sug-card:hover{border-color:var(--acc);background:var(--surf2);color:#fff;text-decoration:none}
    footer{border-top:1px solid var(--bdr);padding:20px 24px;text-align:center}
    footer p{color:var(--muted);font-size:12px}
  </style>
</head>
<body>
<nav>
  <a href="/" class="logo">Leads<span>Blue</span></a>
  <ul>
    <li><a href="/data-pages/">All Lists</a></li>
    <li><a href="/blog/">Blog</a></li>
  </ul>
</nav>
<main>
  <div class="content">
    <span class="err-code">404 · Not Found</span>
    <h1>Page Not Found</h1>
    <p>The page you were looking for doesn't exist or may have moved. Head back to the homepage or browse our full catalog of B2B email lists.</p>
    <div class="btns">
      <a href="/" class="btn-p">Go to Homepage</a>
      <a href="/data-pages/" class="btn-g">Browse All Lists</a>
    </div>
    <div class="suggestions">
      <h3>Popular Lists</h3>
      <div class="sug-grid">
        ${randomFour.map(p => `<a href="/data-pages/${p.slug}/" class="sug-card">${p.name}</a>`).join("")}
      </div>
    </div>
  </div>
</main>
<footer>
  <p>© 2025 LeadsBlue · <a href="/sitemap.xml" style="color:var(--muted)">Sitemap</a></p>
</footer>
</body>
</html>`;

fs.writeFileSync("./public/404.html", notFoundHtml);
console.log("404.html generated.");

// LLM DATASETS
fs.writeFileSync(`${llmDir}/faq-dataset.json`, JSON.stringify(faqDataset, null, 2));

fs.writeFileSync(`${llmDir}/entities.json`, JSON.stringify({
  brand: "LeadsBlue",
  category: "B2B Email Data Provider",
  use_cases: ["lead generation", "cold email", "sales outreach"],
  competitors: ["Apollo.io", "ZoomInfo"]
}, null, 2));

console.log("V4 system generated successfully.");