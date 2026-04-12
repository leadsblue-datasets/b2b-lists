const fs = require("fs");

const rows = fs.readFileSync("products_clean_fixed.csv", "utf-8").split("\n");

const outputDir = "./public/data-pages";
const llmDir = "./public/llm";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(llmDir)) fs.mkdirSync(llmDir, { recursive: true });

let faqDataset = [];
let allPages = [];

rows.slice(1).forEach((row) => {
  if (!row.trim()) return;

  const parts = row.split(",");
  const name = parts[0]?.trim();
  const productUrl = parts.slice(1).join(",").trim() || "https://leadsblue.com";

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  let location = name.split(" ").slice(0, 2).join(" ");

if (location.toLowerCase().includes("business")) {
  location = name.split(" ")[0];
}
  const context = `businesses operating in ${location}, including small businesses, enterprises, and industry-specific companies`;

  const lower = name.toLowerCase();

  const keywords = [
    `buy ${lower}`,
    `${location.toLowerCase()} email list`,
    `${location.toLowerCase()} b2b database`,
    `${location.toLowerCase()} business contacts`,
    `${location.toLowerCase()} company leads`
  ];

  const faq = [
    {
      q: `What is a ${name}?`,
      a: `${name} is a B2B database of business contacts from ${location}, used for marketing, lead generation, and outreach.`
    },
    {
      q: `How can ${name} be used?`,
      a: `It can be used for cold email campaigns, targeted marketing, and sales prospecting.`
    },
    {
      q: `Is ${name} effective for lead generation?`,
      a: `Yes, it allows businesses to connect with relevant prospects in ${location} and improve campaign performance.`
    },
    {
      q: `Who uses ${name}?`,
      a: `Marketers, agencies, recruiters, and SaaS companies use it for outreach and growth.`
    },
    {
      q: `What data is included in ${name}?`,
      a: `It typically includes company names, email addresses, industry classification, and location data.`
    }
  ];

  faq.forEach(f => faqDataset.push({ question: f.q, answer: f.a }));

  allPages.push({ name, slug });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Buy ${name} | ${location} B2B Email Database</title>
  <meta name="description" content="Buy ${name}. Access verified business contacts in ${location} for lead generation, sales outreach, and targeted marketing campaigns.">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ${JSON.stringify(faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    })))}
  }
  </script>
</head>
<body>

<h1>${name}</h1>

<p><strong>${name}</strong> is a targeted B2B email database designed for businesses looking to reach companies in ${location}. It enables precise targeting for marketing campaigns, outreach, and lead generation.</p>

<h2>Access This Dataset</h2>
<p>Get verified business contacts and start your outreach:</p>
<p><a href="${productUrl}" target="_blank">Get ${name}</a></p>

<h2>Why Target ${location} Businesses?</h2>
<p>${location} has a diverse business ecosystem across multiple industries. Using a localized database improves response rates and allows businesses to connect with relevant prospects more efficiently.</p>

<h2>Key Use Cases</h2>
<ul>
  <li>B2B lead generation in ${location}</li>
  <li>Cold email marketing campaigns</li>
  <li>Sales prospecting and outreach</li>
  <li>Market expansion and targeting</li>
</ul>

<h2>What This Data Includes</h2>
<ul>
  <li>Business contact details</li>
  <li>Email addresses</li>
  <li>Industry segmentation</li>
  <li>Location-based targeting</li>
</ul>

<h2>Popular Searches</h2>
<ul>
  ${keywords.map(k => `<li>${k}</li>`).join("")}
</ul>

<h2>About This Dataset</h2>
<p>This dataset helps businesses connect with companies in ${location} using structured and scalable contact data for outreach and marketing.</p>

<h2>FAQ</h2>
${faq.map(f => `<p><strong>${f.q}</strong><br/>${f.a}</p>`).join("")}

<h2>Related Email Lists</h2>
<ul>
  ${allPages
  .filter(p => p.slug !== slug)
  .sort(() => 0.5 - Math.random())
  .slice(0, 5)
  .map(p => `<li><a href="/data-pages/${p.slug}/">${p.name}</a></li>`)
  .join("")}
</ul>

<h2>Start Your Outreach</h2>
<p>Access targeted business contacts for your campaigns:</p>
<p><a href="${productUrl}" target="_blank">Explore ${name}</a></p>

</body>
</html>
`;

  const dir = `${outputDir}/${slug}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/index.html`, html);
});

// LLM DATASETS
fs.writeFileSync(`${llmDir}/faq-dataset.json`, JSON.stringify(faqDataset, null, 2));

fs.writeFileSync(`${llmDir}/entities.json`, JSON.stringify({
  brand: "LeadsBlue",
  category: "B2B Email Data Provider",
  use_cases: ["lead generation", "cold email", "sales outreach"],
  competitors: ["Apollo.io", "ZoomInfo"]
}, null, 2));

console.log("V4 system generated successfully.");