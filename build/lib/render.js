// adseyewear.com — SEO/AEO guide-page renderer.
// Pure functions: given a page definition, its ranked keywords, and authored content,
// return a complete, self-contained HTML document that reuses the ADS design system.
"use strict";
const { PAGES, CLUSTERS } = require("../pages.config.js");

const SITE = "https://adseyewear.com";
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const jld = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const titleCase = (s) => s.replace(/\b([a-z])/g, (m, c) => c.toUpperCase());

/* Group pages by cluster for the shared Guides dropdown + footer + related links. */
function byCluster() {
  const m = {};
  for (const p of PAGES) (m[p.cluster] || (m[p.cluster] = [])).push(p);
  return m;
}

/* The Guides mega-dropdown, reused on every page and injected into legacy pages. */
function navDropdown() {
  const groups = byCluster();
  const cols = Object.keys(CLUSTERS).map((ck) => {
    const items = (groups[ck] || []).map((p) => `<a href="${p.path}">${esc(p.nav)}</a>`).join("");
    return `<div><h5>${esc(CLUSTERS[ck].title)}</h5>${items}</div>`;
  }).join("");
  return `<div class="submenu">${cols}</div>`;
}

function header() {
  return `<div class="annbar">Free shipping over $99 · This brand is available for a JV partner — <a href="/business-for-sale.html">Own this business →</a></div>
<header class="hdr">
  <div class="container hdr-in">
    <a href="/" class="brand"><img src="/assets/logo.jpg" alt="ADS Sports Eyewear logo"> ADS Sports Eyewear</a>
    <nav class="nav">
      <a href="/shop.html">Shop</a>
      <span class="has-sub"><a href="/guides.html">Guides</a>${navDropdown()}</span>
      <a href="/shop.html">Brands</a>
      <a href="/faq.html">FAQ</a>
    </nav>
    <div class="hdr-cta">
      <a href="/business-for-sale.html" class="saleflag"><span class="dot"></span> Business for sale</a>
      <a href="#lead" class="btn btn-dark js-cta" data-arrow="">Get Info</a>
    </div>
    <button class="menu-btn btn btn-ghost" aria-label="Menu">Menu</button>
  </div>
</header>
<div class="drawer">
  <button class="x" aria-label="Close">×</button>
  <a href="/shop.html">Shop</a>
  <a href="/guides.html">Guides</a>
  <a href="/faq.html">FAQ</a>
  <a href="/business-for-sale.html">Business Opportunity</a>
  <a href="#lead">Get Information</a>
</div>`;
}

function footer() {
  const groups = byCluster();
  const gcols = Object.keys(CLUSTERS).map((ck) => {
    const items = (groups[ck] || []).slice(0, 6).map((p) => `<a href="${p.path}">${esc(p.nav)}</a>`).join("");
    return `<div><h4>${esc(CLUSTERS[ck].title)}</h4>${items}</div>`;
  }).join("");
  return `<footer class="footer">
  <div class="container">
    <div class="footer-grid" style="grid-template-columns:1.6fr 1fr 1fr 1fr">
      <div>
        <div class="brand"><img src="/assets/logo.jpg" alt="ADS Sports Eyewear"> ADS Sports Eyewear</div>
        <p style="max-width:34ch">Premium sport &amp; lifestyle eyewear, prescription sport glasses, ski goggles and color-vision lenses — with expert buying guides.</p>
        <p style="margin-top:10px"><a href="/guides.html" style="color:var(--accent-2)">All guides &amp; resources →</a></p>
      </div>
      ${gcols}
    </div>
    <div class="foot-bottom">
      <span>© 2026 ADS Sports Eyewear. All rights reserved.</span>
      <span>Brand names are trademarks of their respective owners, shown to indicate products &amp; topics covered.</span>
    </div>
  </div>
</footer>`;
}

/* Ordered keyword list (desc by volume) for a page. */
function kwList(page, kwData) {
  const rec = kwData.find((k) => k.path === page.path);
  return rec ? rec.keywords.slice() : [];
}

/* Breadcrumb + its schema. */
function breadcrumb(page) {
  const cl = CLUSTERS[page.cluster];
  const items = [
    { name: "Home", url: SITE + "/" },
    { name: "Guides", url: SITE + "/guides.html" },
    { name: cl.title, url: SITE + "/guides.html#" + page.cluster },
    { name: page.nav, url: SITE + page.path },
  ];
  const html = `<nav class="crumb" aria-label="Breadcrumb"><div class="container"><ol>
    ${items.map((it, i) => i === items.length - 1
      ? `<li aria-current="page">${esc(it.name)}</li>`
      : `<li><a href="${attr(it.url.replace(SITE, "") || "/")}">${esc(it.name)}</a></li>`).join("")}
  </ol></div></nav>`;
  const schema = { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })) };
  return { html, schema };
}

/* Related guides in the same cluster (cross-linking). */
function related(page) {
  const sibs = PAGES.filter((p) => p.cluster === page.cluster && p.key !== page.key).slice(0, 6);
  if (!sibs.length) return "";
  const cards = sibs.map((p) => `<a class="relcard" href="${p.path}">
      <div class="k">${esc(CLUSTERS[p.cluster].title)}</div>
      <h3>${esc(p.nav)}</h3>
      <p>Guide &amp; free info request →</p></a>`).join("");
  return `<section class="container">
    <div class="sec-head"><div><span class="eyebrow">Keep exploring</span><h2>Related guides</h2></div></div>
    <div class="relgrid">${cards}</div>
  </section>`;
}

/* Lead form band (First, Last, City, State, Zip, Phone → /api/lead). */
function leadForm(content) {
  const heading = content.leadHeading || "Get more information — free";
  const sub = content.leadSub || "Tell us where to reach you and we'll follow up with options, pricing and availability. No obligation.";
  return `<div id="cta-ribbon"></div>
<section class="leadband" id="lead">
  <div class="container">
    <div class="lead-in">
      <div>
        <span class="eyebrow" style="color:var(--accent-2)">Free info request</span>
        <h2>${esc(heading)}</h2>
        <p>${esc(sub)}</p>
        <ul class="trust">
          <li>Fast, friendly follow-up from a real eyewear specialist</li>
          <li>Guidance on options, pricing &amp; what fits your prescription</li>
          <li>Your details are never sold — used only to help you</li>
        </ul>
      </div>
      <div class="formwrap">
        <form id="lead-form" novalidate>
          <div class="form-grid">
            <div class="field"><label for="firstName">First name *</label><input id="firstName" name="firstName" autocomplete="given-name" required></div>
            <div class="field"><label for="lastName">Last name *</label><input id="lastName" name="lastName" autocomplete="family-name" required></div>
            <div class="field"><label for="city">City</label><input id="city" name="city" autocomplete="address-level2"></div>
            <div class="field"><label for="state">State</label><input id="state" name="state" autocomplete="address-level1" maxlength="30"></div>
            <div class="field"><label for="zip">ZIP</label><input id="zip" name="zip" autocomplete="postal-code" inputmode="numeric" maxlength="12"></div>
            <div class="field"><label for="phone">Phone *</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
          </div>
          <button type="submit" class="btn btn-solid" style="width:100%;justify-content:center;margin-top:18px">Get More Information</button>
          <div id="lead-msg" class="form-msg"></div>
          <p class="form-note">By submitting you agree to be contacted about your request. See our approach to privacy — we never sell your information.</p>
        </form>
      </div>
    </div>
  </div>
</section>`;
}

/* Render an authored section (h2 + body + h3 subs + optional figure). */
function renderSection(sec) {
  const body = (sec.body || []).join("\n      ");
  const fig = sec.figure ? figure(sec.figure) : "";
  const subs = (sec.subs || []).map((s) =>
    `<h3 id="${slug(s.h3)}">${esc(s.h3)}</h3>\n      ${Array.isArray(s.body) ? s.body.join("\n      ") : s.body}`).join("\n      ");
  return `<h2 id="${slug(sec.h2)}">${esc(sec.h2)}</h2>
      ${body}
      ${fig}
      ${subs}`;
}

function figure(f) {
  const inner = f.svg ? f.svg : `<img src="/assets/img/${attr(f.img)}" alt="${attr(f.alt || "")}" loading="lazy" width="960" height="600">`;
  return `<figure class="figure">${inner}${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ""}</figure>`;
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/* FAQ block + FAQPage schema. */
function faqBlock(faq) {
  if (!faq || !faq.length) return { html: "", schema: null };
  const html = `<section class="container">
    <div class="sec-head" style="justify-content:center;text-align:center"><div><span class="eyebrow">People also ask</span><h2>Frequently asked questions</h2></div></div>
    <div class="faq">
      ${faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join("\n      ")}
    </div>
  </section>`;
  const schema = { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: String(f.a).replace(/<[^>]+>/g, "") } })) };
  return { html, schema };
}

/* Table-of-contents rail from the section headings. */
function toc(content) {
  const links = (content.sections || []).map((s) => `<a href="#${slug(s.h2)}">${esc(s.h2)}</a>`).join("");
  return links;
}

/* The full document. */
function renderPage(page, kwData, content) {
  const kws = kwList(page, kwData);
  const topKw = kws.slice(0, 15).map((k) => k.kw);
  const metaTitle = content.metaTitle || `${titleCase(page.key.replace(/-/g, " "))} | ADS Sports Eyewear`;
  const metaDesc = content.metaDesc || "";
  const canonical = SITE + page.path;
  const heroImg = content.heroImg
    ? `<img src="/assets/img/${attr(content.heroImg)}" alt="${attr(content.heroAlt || content.h1)}" fetchpriority="high" width="800" height="600">`
    : (content.heroSvg || "");
  const crumb = breadcrumb(page);
  const faq = faqBlock(content.faq);
  const totalVol = kws.reduce((a, k) => a + (k.vol || 0), 0);

  const schemas = [
    crumb.schema,
    { "@context": "https://schema.org", "@type": "Article",
      headline: content.h1, description: metaDesc, image: content.heroImg ? `${SITE}/assets/img/${content.heroImg}` : `${SITE}/assets/logo.jpg`,
      author: { "@type": "Organization", name: "ADS Sports Eyewear", url: SITE },
      publisher: { "@type": "Organization", name: "ADS Sports Eyewear", logo: { "@type": "ImageObject", url: `${SITE}/assets/logo.jpg` } },
      mainEntityOfPage: canonical, inLanguage: "en-US" },
    faq.schema,
  ].filter(Boolean);

  const sectionsHtml = (content.sections || []).map(renderSection).join("\n\n      ");
  const kwCloud = kws.length > 3 ? `<section class="container" style="padding-top:0">
    <div class="rail" style="position:static;grid-template-columns:1fr"><div class="box">
      <h4>Popular related searches</h4>
      <div class="kwcloud">${kws.slice(0, 60).map((k) => `<a class="pill js-cta" href="#lead" data-arrow="">${esc(k.kw)}</a>`).join("")}</div>
    </div></div>
  </section>` : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(metaTitle)}</title>
<meta name="description" content="${attr(metaDesc)}">
<meta name="keywords" content="${attr(topKw.join(", "))}">
<link rel="canonical" href="${attr(canonical)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="ADS Sports Eyewear">
<meta property="og:title" content="${attr(content.ogTitle || metaTitle)}">
<meta property="og:description" content="${attr(metaDesc)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${SITE}/assets/${content.heroImg ? "img/" + attr(content.heroImg) : "logo.jpg"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0c0e12">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
${schemas.map((s) => `<script type="application/ld+json">${jld(s)}</script>`).join("\n")}
</head>
<body data-page="${attr(page.path)}" data-keyword="${attr(kws[0] ? kws[0].kw : page.key)}">

${header()}

${crumb.html}

<section class="ghero">
  <div class="container">
    <div>
      <span class="eyebrow">${esc(CLUSTERS[page.cluster].title)}</span>
      <h1>${esc(content.h1)}</h1>
      <p class="lede">${esc(content.heroSub || metaDesc)}</p>
      <div class="ghero-cta">
        <a href="#lead" class="btn btn-solid js-cta" data-arrow="→">Get More Information →</a>
        <a href="#answer" class="btn btn-light">Read the guide</a>
      </div>
      <div class="stat-row">
        <div><b>${kws.length}</b><span>Topics covered</span></div>
        <div><b>${totalVol >= 1000 ? Math.round(totalVol / 1000) + "k" : totalVol}</b><span>Monthly searches</span></div>
        <div><b>Free</b><span>Expert guidance</span></div>
      </div>
    </div>
    ${heroImg ? `<div class="ghero-media">${heroImg}</div>` : ""}
  </div>
</section>

<section class="container">
  <div class="prose-wrap">
    <article class="prose">
      <div id="answer" style="scroll-margin-top:90px"></div>
      ${(content.intro || []).join("\n      ")}

      ${sectionsHtml}
    </article>
    <aside class="rail">
      <div class="box railcta">
        <h4>Get more information</h4>
        <p>Free, no-obligation help choosing the right option for you.</p>
        <a href="#lead" class="btn btn-solid js-cta" style="width:100%;justify-content:center" data-arrow="">Request info</a>
      </div>
      ${content.quickAnswer ? `<div class="box"><h4>Quick answer</h4><div class="answer">${content.quickAnswer}</div></div>` : ""}
      <div class="box"><h4>On this page</h4><nav class="toc">${toc(content)}</nav></div>
    </aside>
  </div>
</section>

${kwCloud}

${leadForm(content)}

${faq.html}

${related(page)}

<section class="container">
  <div class="cta-band">
    <h2>${esc(content.ctaHeading || "Ready for answers you can trust?")}</h2>
    <p>${esc(content.ctaSub || "Get free, personalized guidance from an ADS eyewear specialist — options, pricing and fit, with zero pressure.")}</p>
    <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
      <a href="#lead" class="btn btn-dark js-cta" data-arrow="">Get More Information</a>
      <a href="/guides.html" class="btn btn-light">Browse all guides</a>
    </div>
  </div>
</section>

${footer()}
<script src="/assets/js/main.js"></script>
<script src="/assets/js/guide.js"></script>
</body>
</html>`;
}

module.exports = { renderPage, navDropdown, header, footer, slug, byCluster, esc, SITE };
