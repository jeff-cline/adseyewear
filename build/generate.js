#!/usr/bin/env node
// adseyewear.com — build all SEO/AEO guide pages, the /guides.html index, and sitemap.xml.
// Usage: node build/generate.js
"use strict";
const fs = require("fs");
const path = require("path");
const { PAGES, CLUSTERS } = require("./pages.config.js");
const { PRODUCTS } = require("./products.config.js");
const R = require("./lib/render.js");

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

/* ---- admin.html : God-only CTA-swap console -------------------------------- */
function adminPanel() {
  const list = PAGES.map((p) => ({ path: p.path, nav: p.nav, cluster: CLUSTERS[p.cluster].title }));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CTA Admin · ADS Sports Eyewear</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<style>
:root{--ink:#0c0e12;--accent:#ea5a1e;--line:#e4e0d7;--paper:#f6f4ef;--muted:#6b7280}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 "Manrope",system-ui,Segoe UI,Arial,sans-serif}
header{background:var(--ink);color:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
header b{font-weight:700;letter-spacing:.04em}
.wrap{max-width:1040px;margin:0 auto;padding:26px 20px 80px}
h1{font-size:24px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 22px;font-size:14.5px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:22px;margin:0 0 16px;box-shadow:0 10px 30px -22px rgba(0,0,0,.4)}
label{display:block;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;color:#444;font-weight:600;margin:0 0 5px}
input,select{width:100%;font:inherit;font-size:15px;padding:11px 12px;border:1.5px solid var(--line);border-radius:7px;background:var(--paper)}
input:focus,select:focus{outline:none;border-color:var(--accent);background:#fff}
button{font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:7px;padding:11px 18px;background:var(--accent);color:#fff}
button.ghost{background:#fff;border:1.5px solid var(--line);color:#333}
button:disabled{opacity:.5;cursor:default}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pg{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding:14px 0}
.pg:last-child{border-bottom:0}
.pgname{font-weight:600}.pgpath{font-size:12.5px;color:var(--muted);word-break:break-all}
.state{font-size:12px;font-weight:600;padding:4px 10px;border-radius:100px}
.state.lead{background:#eef2f5;color:#33506b}.state.vendor{background:#fdecdd;color:#b3480f}
.msg{padding:11px 14px;border-radius:8px;font-weight:600;margin:12px 0;display:none}
.msg.ok{display:block;background:#e8f6ec;color:#137a3a}.msg.err{display:block;background:#fdecea;color:#b3261e}
dialog{border:0;border-radius:14px;padding:0;max-width:560px;width:92%;box-shadow:0 30px 80px -30px rgba(0,0,0,.6)}
dialog .dc{padding:24px}dialog h3{margin:0 0 4px}dialog .fld{margin:0 0 14px}
.hint{font-size:13px;color:var(--muted)}.center{text-align:center}
#login{max-width:400px;margin:8vh auto}
</style>
</head>
<body>
<header><b>ADS · CTA Admin</b><button class="ghost" id="logout" style="display:none">Log out</button></header>

<div id="login" class="card">
  <h1>God login</h1>
  <p class="sub">Enter the admin password to manage page CTAs.</p>
  <div class="fld"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password"></div>
  <div id="lmsg" class="msg"></div>
  <button id="loginBtn" style="width:100%">Sign in</button>
</div>

<div id="app" class="wrap" style="display:none">
  <h1>Page CTAs</h1>
  <p class="sub">Every guide page's buttons default to the free <b>info-request lead form</b>. Once a page ranks, point its CTAs at a vendor or <b>el.ag</b> affiliate link here — it takes effect <b>instantly</b>, no rebuild. Clear it to send visitors back to the lead form.</p>
  <div id="gmsg" class="msg"></div>
  <div class="card" id="pages"></div>
</div>

<dialog id="dlg"><div class="dc">
  <h3 id="dlgTitle">Edit CTA</h3>
  <p class="pgpath" id="dlgPath"></p>
  <div class="fld"><label>Destination URL (vendor or el.ag link)</label><input id="dHref" placeholder="https://el.ag/xxxxx"></div>
  <div class="row"><div class="fld"><label>Button label</label><input id="dLabel" placeholder="Shop this / Get offer"></div>
  <div class="fld"><label>Open in new tab?</label><select id="dNewtab"><option value="yes">Yes</option><option value="no">No</option></select></div></div>
  <div class="fld"><label>Ribbon note (optional, shown above the form)</label><input id="dNote" placeholder="Now available from our partner →"></div>
  <p class="hint">Leave URL blank &amp; save to reset this page back to the lead form.</p>
  <div style="display:flex;gap:10px;margin-top:16px">
    <button id="dSave" style="flex:1">Save</button>
    <button id="dClear" class="ghost">Reset to lead form</button>
    <button id="dCancel" class="ghost">Cancel</button>
  </div>
</div></dialog>

<script>
const PAGES = ${JSON.stringify(list)};
const S = { token: sessionStorage.getItem("adsAdminTok") || "", cfg: {} };
const $ = (id) => document.getElementById(id);
function msg(el, kind, txt){ el.className = "msg " + kind; el.textContent = txt; }
async function api(path, opts){ opts = opts || {}; opts.headers = Object.assign({ "content-type":"application/json" }, opts.headers||{}); if (S.token) opts.headers.authorization = "Bearer " + S.token; const r = await fetch(path, opts); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, j }; }

async function doLogin(){
  const pw = $("pw").value.trim(); if(!pw) return;
  $("loginBtn").disabled = true;
  const r = await api("/api/admin/login", { method:"POST", body: JSON.stringify({ password: pw }) });
  $("loginBtn").disabled = false;
  if (r.ok && r.j.token){ S.token = r.j.token; sessionStorage.setItem("adsAdminTok", S.token); showApp(); }
  else msg($("lmsg"), "err", (r.j && r.j.error) || "Login failed.");
}
async function showApp(){
  const r = await api("/api/admin/cta");
  if (!r.ok){ logout(); return; }
  S.cfg = r.j.config || {};
  $("login").style.display="none"; $("app").style.display="block"; $("logout").style.display="inline-block";
  render();
}
function render(){
  $("pages").innerHTML = PAGES.map(function(p){
    const c = S.cfg[p.path];
    const on = c && c.enabled && c.href;
    return '<div class="pg"><div><div class="pgname">'+p.nav+'</div><div class="pgpath">'+p.path+(on?' → '+c.href:'')+'</div></div>'+
      '<div style="display:flex;align-items:center;gap:12px">'+
      '<span class="state '+(on?'vendor':'lead')+'">'+(on?'VENDOR / AFFILIATE':'LEAD FORM')+'</span>'+
      '<button class="ghost" data-p="'+encodeURIComponent(p.path)+'">Edit</button></div></div>';
  }).join("");
  document.querySelectorAll('#pages button[data-p]').forEach(function(b){ b.onclick=function(){ openDlg(decodeURIComponent(b.getAttribute("data-p"))); }; });
}
let curPath = "";
function openDlg(pth){
  curPath = pth; const c = S.cfg[pth] || {};
  const p = PAGES.find(function(x){return x.path===pth;});
  $("dlgTitle").textContent = p ? p.nav : "Edit CTA"; $("dlgPath").textContent = pth;
  $("dHref").value = c.href||""; $("dLabel").value = c.label||""; $("dNote").value = c.note||"";
  $("dNewtab").value = (c.newtab===false)?"no":"yes";
  $("dlg").showModal();
}
async function saveDlg(clear){
  const body = { page: curPath };
  if (clear){ body.clear = true; }
  else { body.href=$("dHref").value.trim(); body.label=$("dLabel").value.trim(); body.note=$("dNote").value.trim(); body.newtab=$("dNewtab").value==="yes"; body.enabled = !!body.href; }
  const r = await api("/api/admin/cta", { method:"POST", body: JSON.stringify(body) });
  if (r.ok){ S.cfg = r.j.config || {}; $("dlg").close(); render(); msg($("gmsg"),"ok", clear||!body.href ? "Reset to the lead form." : "CTA saved — live now."); setTimeout(function(){$("gmsg").className="msg";},3000); }
  else msg($("gmsg"),"err",(r.j&&r.j.error)||"Save failed.");
}
function logout(){ S.token=""; sessionStorage.removeItem("adsAdminTok"); $("app").style.display="none"; $("logout").style.display="none"; $("login").style.display="block"; }
$("loginBtn").onclick = doLogin; $("pw").addEventListener("keydown",function(e){ if(e.key==="Enter") doLogin(); });
$("logout").onclick = logout; $("dSave").onclick=function(){saveDlg(false);}; $("dClear").onclick=function(){saveDlg(true);}; $("dCancel").onclick=function(){$("dlg").close();};
if (S.token) showApp();
</script>
</body>
</html>`;
}
fs.writeFileSync(path.join(SITE_DIR, "admin.html"), adminPanel());

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
