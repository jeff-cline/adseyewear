#!/usr/bin/env node
// adseyewear.com — build all SEO/AEO guide pages, the /guides.html index, and sitemap.xml.
// Usage: node build/generate.js
"use strict";
const fs = require("fs");
const path = require("path");
const { PAGES, CLUSTERS } = require("./pages.config.js");
const { PRODUCTS: SEED_PRODUCTS } = require("./products.config.js");
const R = require("./lib/render.js");

// Products = seed manifest merged with the God-editable runtime store (by id).
// The backend writes build/products.runtime.json when God adds/edits a product.
function loadProducts() {
  const byId = new Map(SEED_PRODUCTS.map((p) => [String(p.id), p]));
  const rf = path.join(__dirname, "products.runtime.json");
  if (fs.existsSync(rf)) {
    try {
      const runtime = JSON.parse(fs.readFileSync(rf, "utf8"));
      for (const p of runtime) {
        if (p && p.id) {
          if (p.deleted) byId.delete(String(p.id));
          else byId.set(String(p.id), Object.assign({}, byId.get(String(p.id)) || {}, p));
        }
      }
    } catch (e) { console.error("products.runtime.json parse error:", e.message); }
  }
  return [...byId.values()];
}
const PRODUCTS = loadProducts();

const ROOT = path.join(__dirname, "..");
const SITE_DIR = path.join(ROOT, "site");
const CONTENT_DIR = path.join(__dirname, "content");
const kwData = JSON.parse(fs.readFileSync(path.join(__dirname, "keywords.json"), "utf8"));

function loadContent(key) {
  const f = path.join(CONTENT_DIR, key + ".json");
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, "utf8"));
}

function writeFileSafe(rel, html) {
  const full = path.join(SITE_DIR, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  return full;
}

let built = 0, skipped = [];
const report = [];
for (const page of PAGES) {
  const content = loadContent(page.key);
  if (!content) { skipped.push(page.key); continue; }
  const html = R.renderPage(page, kwData, content);
  writeFileSafe(page.out, html);
  const rec = kwData.find((k) => k.path === page.path);
  report.push({ key: page.key, path: page.path, out: page.out, keywords: rec ? rec.n : 0, vol: rec ? rec.vol : 0 });
  built++;
}

/* ---- product pages (rebuild old /product/<slug>/<id> URLs) ----------------- */
let productsBuilt = 0;
for (const p of PRODUCTS) {
  writeFileSafe(p.out, R.renderProduct(p));
  productsBuilt++;
}

/* ---- /guides.html : human HTML sitemap of all guides ---------------------- */
function guidesIndex() {
  const groups = R.byCluster();
  const sections = Object.keys(CLUSTERS).map((ck) => {
    const cards = (groups[ck] || []).map((p) => {
      const rec = kwData.find((k) => k.path === p.path);
      return `<a class="relcard" href="${p.path}">
        <div class="k">${R.esc(CLUSTERS[ck].title)}</div>
        <h3>${R.esc(p.nav)}</h3>
        <p>${rec ? rec.n + " topics · " + (rec.vol >= 1000 ? Math.round(rec.vol / 1000) + "k" : rec.vol) + " monthly searches" : "Guide"} →</p></a>`;
    }).join("\n      ");
    return `<section class="container" id="${ck}">
    <div class="sec-head"><div><span class="eyebrow">${R.esc(CLUSTERS[ck].title)}</span><h2>${R.esc(CLUSTERS[ck].title)}</h2><p>${R.esc(CLUSTERS[ck].blurb)}</p></div></div>
    <div class="relgrid">${cards}</div>
  </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eyewear Guides &amp; Resources — Color Blind Glasses, Oakley Lenses, Prescription Sport | ADS Sports Eyewear</title>
<meta name="description" content="Expert guides to color blind glasses & tests, Oakley lens colors, and prescription sport eyewear for cycling, shooting, motorcycle, baseball, skiing and more.">
<link rel="canonical" href="${R.SITE}/guides.html">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:title" content="Eyewear Guides &amp; Resources | ADS Sports Eyewear">
<meta property="og:description" content="Color blind glasses, Oakley lens guides, and prescription sport eyewear — expert answers and free info.">
<meta property="og:url" content="${R.SITE}/guides.html">
<meta property="og:image" content="${R.SITE}/assets/logo.jpg">
<meta name="theme-color" content="#0c0e12">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css?v=3">
</head>
<body data-page="/guides.html">
${R.header()}
<section class="ghero"><div class="container" style="grid-template-columns:1fr;text-align:center">
  <div>
    <span class="eyebrow">Guides &amp; Resources</span>
    <h1>Eyewear guides &amp; answers</h1>
    <p class="lede" style="margin-left:auto;margin-right:auto">Straight answers on color blind glasses, Oakley lenses, and prescription sport eyewear — plus free, no-pressure help choosing what's right for you.</p>
  </div>
</div></section>
${sections}
<section class="container">
  <div class="cta-band">
    <h2>Not sure where to start?</h2>
    <p>Tell us what you're after and an ADS specialist will point you to the right option — free.</p>
    <a href="/guides.html" class="btn btn-dark">Browse guides</a>
  </div>
</section>
${R.footer()}
<script src="/assets/js/main.js"></script>
</body>
</html>`;
}
fs.writeFileSync(path.join(SITE_DIR, "guides.html"), guidesIndex());

/* ---- sitemap.xml : all pages ---------------------------------------------- */
function sitemap() {
  const staticUrls = ["/", "/shop.html", "/faq.html", "/guides.html", "/business-for-sale.html", "/partner.html"];
  const today = "2026-08-19";
  const urls = [];
  for (const u of staticUrls) urls.push({ loc: R.SITE + u, pri: u === "/" ? "1.0" : "0.6", cf: "weekly" });
  for (const p of PAGES) {
    if (skipped.includes(p.key)) continue;
    const rec = kwData.find((k) => k.path === p.path);
    const pri = rec && rec.n >= 40 ? "0.9" : rec && rec.n >= 8 ? "0.8" : "0.7";
    urls.push({ loc: R.SITE + p.path, pri, cf: "weekly" });
  }
  for (const p of PRODUCTS) urls.push({ loc: R.SITE + p.path, pri: "0.7", cf: "weekly" });
  const body = urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pri}</priority></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
fs.writeFileSync(path.join(SITE_DIR, "sitemap.xml"), sitemap());


/* ---- 404.html : branded not-found that recovers dead product URLs ---------- */
function notFoundPage() {
  const groups = R.byCluster();
  // Popular keywords across the top pages, as quick recovery links.
  const topPages = PAGES.map((p) => {
    const rec = kwData.find((k) => k.path === p.path);
    return { p, n: rec ? rec.n : 0, kw: rec && rec.keywords[0] ? rec.keywords[0].kw : p.nav };
  }).sort((a, b) => b.n - a.n);
  const quick = topPages.slice(0, 14).map(({ p, kw }) => `<a class="pill" href="${p.path}">${R.esc(kw)}</a>`).join("");
  const sections = Object.keys(CLUSTERS).map((ck) => {
    const cards = (groups[ck] || []).map((p) => {
      const rec = kwData.find((k) => k.path === p.path);
      const kw = rec && rec.keywords[0] ? rec.keywords[0].kw : p.nav;
      return `<a class="relcard" href="${p.path}"><div class="k">${R.esc(CLUSTERS[ck].title)}</div><h3>${R.esc(p.nav)}</h3><p>${R.esc(kw)} →</p></a>`;
    }).join("");
    return `<section class="container" style="padding-top:10px"><div class="sec-head"><div><span class="eyebrow">${R.esc(CLUSTERS[ck].title)}</span><h2>${R.esc(CLUSTERS[ck].title)}</h2></div></div><div class="relgrid">${cards}</div></section>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — popular eyewear guides | ADS Sports Eyewear</title>
<meta name="robots" content="noindex,follow">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css?v=3">
</head>
<body data-page="/404">
${R.header()}
<section class="ghero"><div class="container" style="grid-template-columns:1fr;text-align:center">
  <div>
    <span class="eyebrow">Page moved or not found</span>
    <h1>We couldn't find that page</h1>
    <p class="lede" style="margin-left:auto;margin-right:auto">The link may be old or the product has moved — but you're in the right place. Jump straight to our most popular guides below, or tell us what you're after and we'll help you find it.</p>
    <div class="ghero-cta" style="justify-content:center"><a href="/guides.html" class="btn btn-solid">Browse all guides</a><a href="/" class="btn btn-light">Go to homepage</a></div>
    <div class="kwcloud" style="justify-content:center;margin-top:26px;max-width:820px;margin-left:auto;margin-right:auto">${quick}</div>
  </div>
</div></section>
${sections}
${R.footer()}
<script src="/assets/js/main.js"></script>
</body>
</html>`;
}
fs.writeFileSync(path.join(SITE_DIR, "404.html"), notFoundPage());

console.log(`Built ${built} guide pages, ${productsBuilt} product pages, /guides.html, /404.html, sitemap.xml`);
if (skipped.length) console.log(`Skipped (no content yet): ${skipped.join(", ")}`);
console.log("\nPER-PAGE KEYWORD REPORT");
report.sort((a, b) => b.keywords - a.keywords).forEach((r) => console.log(`  ${String(r.keywords).padStart(3)} kw · ${String(r.vol).padStart(6)} vol → ${r.path}`));
fs.writeFileSync(path.join(__dirname, "build-report.json"), JSON.stringify(report, null, 1));
