#!/usr/bin/env node
// adseyewear.com — weave the new guide pages into the legacy site:
//  • homepage Featured-5 (top pages by keyword count) with deep links into each page's sections
//  • a "Guides" item in every legacy page's nav
//  • a Guides column in every legacy footer
// Idempotent: re-runnable, guarded by sentinels.
"use strict";
const fs = require("fs");
const path = require("path");
const { PAGES, CLUSTERS } = require("./pages.config.js");
const R = require("./lib/render.js");

const SITE = path.join(__dirname, "..", "site");
const kwData = JSON.parse(fs.readFileSync(path.join(__dirname, "keywords.json"), "utf8"));
const contentOf = (key) => {
  const f = path.join(__dirname, "content", key + ".json");
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
};

/* Top-5 pages by keyword count. */
const top5 = PAGES.map((p) => {
  const rec = kwData.find((k) => k.path === p.path);
  return { p, n: rec ? rec.n : 0, vol: rec ? rec.vol : 0 };
}).sort((a, b) => b.n - a.n).slice(0, 5);

/* Featured-5 section with deep links into each page's real section anchors. */
function featuredHtml() {
  const cards = top5.map(({ p, n, vol }) => {
    const c = contentOf(p.key);
    const secs = (c && c.sections) ? c.sections.slice(0, 3) : [];
    const deep = secs.map((s) => `<a href="${p.path}#${R.slug(s.h2)}">${R.esc(s.h2)}</a>`).join("");
    const volLabel = vol >= 1000 ? Math.round(vol / 1000) + "k" : vol;
    return `<div class="fcard">
        <a class="fcard-main" href="${p.path}">
          <div class="k">${R.esc(CLUSTERS[p.cluster].title)}</div>
          <h3>${R.esc(c ? c.h1 : p.nav)}</h3>
          <div class="fmeta">${n} keyword topics · ${volLabel} monthly searches</div>
        </a>
        <div class="fdeep">${deep}</div>
        <a class="fgo" href="${p.path}">Read guide &amp; get info →</a>
      </div>`;
  }).join("\n      ");
  return `<!--FEATURED-GUIDES-START-->
<section class="container" id="featured-guides">
  <div class="sec-head"><div><span class="eyebrow">Most-searched guides</span><h2>Featured eyewear guides</h2><p>Our deepest answer hubs — color blind glasses, color vision tests, and Oakley lens buying — each with free, no-pressure help.</p></div><a href="/guides.html" class="btn btn-ghost">All guides</a></div>
  <div class="fgrid">
      ${cards}
  </div>
</section>
<!--FEATURED-GUIDES-END-->`;
}

/* Guides mega-links for legacy footers. */
function footerGuides() {
  const items = PAGES.slice(0, 8).map((p) => `<a href="${p.path}">${R.esc(p.nav)}</a>`).join("");
  return `<!--FOOTER-GUIDES-START--><div><h4>Guides</h4><a href="/guides.html">All guides</a>${items}</div><!--FOOTER-GUIDES-END-->`;
}

function upsertBetween(html, startMark, endMark, block) {
  const re = new RegExp(startMark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + endMark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (re.test(html)) return html.replace(re, block);
  return null; // caller decides insertion point
}

/* Add a Guides link to a <nav class="nav"> if absent. */
function addNavGuides(html) {
  if (/class="nav"[\s\S]*?href="\/guides\.html"/.test(html)) return html;
  return html.replace(/(<nav class="nav">\s*)/, `$1\n      <a href="/guides.html">Guides</a>`);
}

/* Add Guides links to the mobile drawer if present. */
function addDrawerGuides(html) {
  if (/class="drawer"[\s\S]*?href="\/guides\.html"/.test(html)) return html;
  return html.replace(/(<div class="drawer">[\s\S]*?<a href="\/shop\.html">Shop<\/a>)/, `$1\n  <a href="/guides.html">Guides</a>`);
}

/* Insert/replace footer Guides column before the first footer column or after brand block. */
function addFooterGuides(html) {
  const block = footerGuides();
  const replaced = upsertBetween(html, "<!--FOOTER-GUIDES-START-->", "<!--FOOTER-GUIDES-END-->", block);
  if (replaced) return replaced;
  // insert as the first column after the brand/intro div inside .footer-grid
  return html.replace(/(<div class="footer-grid"[^>]*>\s*)(<div>)/, `$1${block}\n      $2`);
}

const LEGACY = ["index.html", "shop.html", "faq.html", "business-for-sale.html", "partner.html", "thank-you.html"];
let touched = [];
for (const f of LEGACY) {
  const fp = path.join(SITE, f);
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, "utf8");
  const before = html;
  html = html.replace(/\/assets\/css\/style\.css(\?v=\d+)?"/g, '/assets/css/style.css?v=3"');
  html = addNavGuides(html);
  html = addDrawerGuides(html);
  html = addFooterGuides(html);
  if (f === "index.html") {
    const feat = featuredHtml();
    const replaced = upsertBetween(html, "<!--FEATURED-GUIDES-START-->", "<!--FEATURED-GUIDES-END-->", feat);
    if (replaced) html = replaced;
    else {
      // insert right after the BRANDS section (first </section> after brand-grid)
      const idx = html.indexOf("</section>", html.indexOf("brand-grid"));
      if (idx !== -1) {
        const cut = idx + "</section>".length;
        html = html.slice(0, cut) + "\n\n" + feat + "\n" + html.slice(cut);
      }
    }
  }
  if (html !== before) { fs.writeFileSync(fp, html); touched.push(f); }
}
console.log("integrate: updated", touched.length, "legacy pages:", touched.join(", ") || "(none)");
console.log("featured-5:", top5.map((t) => `${t.p.key}(${t.n})`).join(", "));
