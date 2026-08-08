// ADS Sports Eyewear — partner-application backend.
// Receives the JV partner form, creates a lead in the medigap CORE (CRM) and emails the owner.
// Dependency-free Node HTTP server; nginx proxies /api/partner here.
const http = require("http");

const PORT = process.env.PORT || 3120;
const CORE_BASE = process.env.CORE_API_BASE || "https://medigap.plus";
const CORE_KEY = process.env.CORE_KEY || "";
const CORE_SECRET = process.env.CORE_SECRET || "";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "jeff.cline@me.com";
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s, n) => String(s == null ? "" : s).slice(0, n);

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
    const r = await fetch(`${CORE_BASE}/api/core/email`, { method: "POST", headers: h, body: JSON.stringify({ to, subject, html, provider: "google_workspace" }), signal: AbortSignal.timeout(12000) });
    const j = await r.json().catch(() => ({})); return !!(r.ok && (j.ok === undefined || j.ok));
  } catch { return false; }
}

const server = http.createServer((req, res) => {
  const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); res.end(JSON.stringify(obj)); };
  if (req.method === "OPTIONS") { res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST,OPTIONS" }); return res.end(); }
  const url = req.url.replace(/\/+$/, "");
  if (req.method === "GET" && (url === "/api/partner/health" || url === "/health")) return send(200, { ok: true });
  if (req.method !== "POST" || url !== "/api/partner") return send(404, { error: "Not found" });

  let body = "";
  req.on("data", (c) => { body += c; if (body.length > 20000) req.destroy(); });
  req.on("end", async () => {
    let d = {}; try { d = JSON.parse(body || "{}"); } catch { return send(400, { error: "Bad request" }); }
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

    // 1) CRM lead into the JV Core
    const leadOk = await coreLead({ name, email, phone, notes, creatorRef: "adseyewear-partner" });

    // 2) Notify the owner
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
    const emailOk = await coreEmail(OWNER_EMAIL, `🕶️ New ADS Eyewear partner: ${name} (${phone})`, html);

    // Consider it a success if either the CRM or the email got through.
    if (leadOk || emailOk) return send(200, { ok: true });
    return send(502, { error: "We couldn't submit right now — please try again or reach us on Instagram." });
  });
});
server.listen(PORT, "127.0.0.1", () => console.log(`ADS partner service on :${PORT}`));
