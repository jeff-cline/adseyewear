// ADS Sports Eyewear — site backend (dependency-free Node HTTP).
// Handles: the JV partner application, the SEO guide-page lead form, the public per-page
// CTA config, and the God admin panel that swaps each page's CTA to a vendor / el.ag link.
// nginx proxies /api/ here (see nginx vhost). Core CRM + Zapmail email via medigap.plus.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3120;
const CORE_BASE = process.env.CORE_API_BASE || "https://medigap.plus";
const CORE_KEY = process.env.CORE_KEY || "";
const CORE_SECRET = process.env.CORE_SECRET || "";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "jeff.cline@me.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdsGod!2026";
const ADMIN_SECRET = process.env.ADMIN_SECRET || crypto.createHash("sha256").update("ads-cta-" + ADMIN_PASSWORD).digest("hex");
const CTA_FILE = path.join(__dirname, "cta-config.json");

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s, n) => String(s == null ? "" : s).slice(0, n);

/* ---- CTA config store ------------------------------------------------------ */
function loadCta() {
  try { return JSON.parse(fs.readFileSync(CTA_FILE, "utf8")); } catch { return {}; }
}
function saveCta(obj) {
  fs.writeFileSync(CTA_FILE, JSON.stringify(obj, null, 2));
}

/* ---- Admin auth (stateless HMAC token) ------------------------------------- */
const adminToken = () => crypto.createHmac("sha256", ADMIN_SECRET).update("god:v1").digest("hex");
function checkAuth(req) {
  const h = req.headers["authorization"] || "";
  const tok = h.replace(/^Bearer\s+/i, "").trim();
  const want = adminToken();
  if (!tok || tok.length !== want.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(tok), Buffer.from(want)); } catch { return false; }
}

/* ---- Core CRM + email ------------------------------------------------------ */
function coreHeaders() {
  if (!CORE_KEY || !CORE_SECRET) return null;
  return { "x-core-key": CORE_KEY, "x-core-secret": CORE_SECRET, "content-type": "application/json" };
}
async function coreLead(lead) {
  const h = coreHeaders(); if (!h) return false;
  try {
    const r = await fetch(`${CORE_BASE}/api/core/lead`, { method: "POST", headers: h, body: JSON.stringify(lead), signal: AbortSignal.timeout(9000) });
    return r.ok;
  } catch { return false; }
}
async function coreEmail(to, subject, html) {
  const h = coreHeaders(); if (!h) return false;
  try {
    const r = await fetch(`${CORE_BASE}/api/core/email`, { method: "POST", headers: h, body: JSON.stringify({ to, subject, html, provider: "zapmail" }), signal: AbortSignal.timeout(15000) });
    const j = await r.json().catch(() => ({})); return !!(r.ok && (j.ok === undefined || j.ok));
  } catch { return false; }
}

/* ---- helpers --------------------------------------------------------------- */
function readBody(req, max = 20000) {
  return new Promise((resolve) => {
    let b = ""; req.on("data", (c) => { b += c; if (b.length > max) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { resolve(null); } });
  });
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };
  if (req.method === "OPTIONS") { res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" }); return res.end(); }

  const u = new URL(req.url, "http://x");
  const url = u.pathname.replace(/\/+$/, "") || "/";

  if (req.method === "GET" && (url === "/api/partner/health" || url === "/health")) return send(200, { ok: true });

  /* -- Public: per-page CTA config (client fetches this to swap CTAs live) -- */
  if (req.method === "GET" && url === "/api/cta") {
    const p = u.searchParams.get("p") || "";
    const all = loadCta();
    const cfg = all[p];
    if (cfg && cfg.enabled && cfg.href) return send(200, { href: cfg.href, label: cfg.label || "", note: cfg.note || "", newtab: cfg.newtab !== false });
    return send(200, {});
  }

  /* -- Admin: login -> token -- */
  if (req.method === "POST" && url === "/api/admin/login") {
    const d = await readBody(req) || {};
    if (clip(d.password, 200) === ADMIN_PASSWORD) return send(200, { ok: true, token: adminToken() });
    return send(401, { error: "Incorrect password." });
  }

  /* -- Admin: read full CTA config -- */
  if (req.method === "GET" && url === "/api/admin/cta") {
    if (!checkAuth(req)) return send(401, { error: "Unauthorized" });
    return send(200, { ok: true, config: loadCta() });
  }

  /* -- Admin: save one page's CTA (or clear it) -- */
  if (req.method === "POST" && url === "/api/admin/cta") {
    if (!checkAuth(req)) return send(401, { error: "Unauthorized" });
    const d = await readBody(req) || {};
    const p = clip(d.page, 300).trim();
    if (!p) return send(400, { error: "Missing page." });
    const all = loadCta();
    if (d.clear) { delete all[p]; }
    else {
      all[p] = {
        enabled: d.enabled !== false,
        href: clip(d.href, 500).trim(),
        label: clip(d.label, 80).trim(),
        note: clip(d.note, 160).trim(),
        newtab: d.newtab !== false,
        updated: new Date().toISOString(),
      };
    }
    saveCta(all);
    return send(200, { ok: true, config: all });
  }

  /* -- Public: SEO guide-page lead form -- */
  if (req.method === "POST" && url === "/api/lead") {
    const d = await readBody(req);
    if (!d) return send(400, { error: "Bad request" });
    const first = clip(d.firstName, 80).trim(), last = clip(d.lastName, 80).trim();
    const phone = clip(d.phone, 40).trim();
    const city = clip(d.city, 80).trim(), state = clip(d.state, 30).trim(), zip = clip(d.zip, 12).trim();
    const page = clip(d.page, 300).trim(), keyword = clip(d.keyword, 160).trim(), pageTitle = clip(d.pageTitle, 200).trim();
    if (!first || !last || !phone) return send(400, { error: "Please add your first name, last name and phone number." });

    const name = `${first} ${last}`.trim();
    const loc = [city, state, zip].filter(Boolean).join(", ");
    const notes = [
      `ADS Sports Eyewear — guide-page info request`,
      `Interest / keyword: ${keyword || "—"}`,
      `Page: ${pageTitle || page}`,
      `URL: https://adseyewear.com${page}`,
      `Location: ${loc || "—"}`,
    ].join("\n");

    // respond fast, then push CRM + email in the background
    send(200, { ok: true });
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <h2 style="font-family:Arial;color:#ea5a1e;margin:0 0 8px">New adseyewear.com lead 🕶️</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><b>Name</b></td><td>${esc(name)}</td></tr>
        <tr><td><b>Phone</b></td><td>${esc(phone)}</td></tr>
        <tr><td><b>Location</b></td><td>${esc(loc) || "—"}</td></tr>
        <tr><td><b>Interest / keyword</b></td><td>${esc(keyword) || "—"}</td></tr>
        <tr><td><b>Page</b></td><td>${esc(pageTitle || page)}</td></tr>
      </table>
      <p style="margin:12px 0 4px"><a href="https://adseyewear.com${esc(page)}">https://adseyewear.com${esc(page)}</a></p>
      <p style="color:#888;font-size:12px">SEO guide lead · source keyword shows which ranking page produced it.</p></div>`;
    coreLead({ name, phone, notes, creatorRef: "adseyewear-seo", source: `adseyewear:${keyword || page}` }).catch(() => {});
    coreEmail(OWNER_EMAIL, `🕶️ adseyewear lead: ${name} — "${keyword || page}"`, html).catch(() => {});
    return;
  }

  /* -- Existing: JV partner application -- */
  if (req.method === "POST" && url === "/api/partner") {
    const d = await readBody(req);
    if (!d) return send(400, { error: "Bad request" });
    const first = clip(d.firstName, 80).trim(), last = clip(d.lastName, 80).trim();
    const phone = clip(d.phone, 40).trim(), email = clip(d.email, 160).trim();
    const city = clip(d.city, 80), state = clip(d.state, 30), zip = clip(d.zip, 12);
    const businesses = clip(d.businesses, 300), businessName = clip(d.businessName, 160), pitch = clip(d.pitch, 4000);
    if (!first || !last || !phone || !pitch) return send(400, { error: "Missing required fields." });

    const name = `${first} ${last}`.trim();
    const loc = [city, state, zip].filter(Boolean).join(", ");
    const notes = [
      `ADS Sports Eyewear — Operating Partner Application`,
      `Location: ${loc || "—"}`,
      `Businesses owned: ${businesses || "—"}`,
      `Business name: ${businessName || "—"}`,
      `Why a great partner: ${pitch}`,
    ].join("\n");

    send(200, { ok: true });
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <h2 style="font-family:Arial;color:#ea5a1e;margin:0 0 8px">New ADS Eyewear partner application</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><b>Name</b></td><td>${esc(name)}</td></tr>
        <tr><td><b>Phone</b></td><td>${esc(phone)}</td></tr>
        <tr><td><b>Email</b></td><td>${esc(email) || "—"}</td></tr>
        <tr><td><b>Location</b></td><td>${esc(loc) || "—"}</td></tr>
        <tr><td><b>Businesses owned</b></td><td>${esc(businesses) || "—"}</td></tr>
        <tr><td><b>Business name</b></td><td>${esc(businessName) || "—"}</td></tr>
      </table>
      <p style="margin:14px 0 4px"><b>Why they'd be a great partner:</b></p>
      <p style="white-space:pre-wrap;background:#f6f4ef;padding:12px;border-radius:8px">${esc(pitch)}</p>
      <p style="color:#888;font-size:12px">Submitted via adseyewear.com/partner.html</p></div>`;
    coreLead({ name, email, phone, notes, creatorRef: "adseyewear-partner" }).catch(() => {});
    coreEmail(OWNER_EMAIL, `🕶️ New ADS Eyewear partner: ${name} (${phone})`, html).catch(() => {});
    return;
  }

  return send(404, { error: "Not found" });
});
server.listen(PORT, "127.0.0.1", () => console.log(`ADS site service on :${PORT}`));
