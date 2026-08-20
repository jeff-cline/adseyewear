// Dependency-free spam guard for lead forms. Returns { spam:boolean, reasons:[] }.
// Signals (any → spam): honeypot filled, per-IP rate limit, links/markup in a name,
// spam keywords, multiple links, invalid email, junk phone, absurd lengths.
// Bots that POST the API directly (no honeypot, floods, link-laden bodies) get caught by
// the content + rate-limit rules even without any front-end cooperation.
"use strict";
const RL = new Map(); // ip -> [timestamps]
const SPAM_WORDS = /(viagra|cialis|casino|\bporn\b|escort|\bcrypto\b|bitcoin|\bforex\b|payday|backlink|seo (?:services|expert|agency|company)|guest post|write for us|\bloan\b|\bnude\b|sex ?cam|казино|заработок|порно)/i;
const URLISH = /(https?:\/\/|www\.|\[url|href=|<a\s|\.ru\/|\bt\.me\/|\bbit\.ly\/)/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"] || "";
  return (xff.split(",")[0].trim()) || (req.socket && req.socket.remoteAddress) || "?";
}
function rateHit(ip, limit, windowMs) {
  const now = Date.now();
  const arr = (RL.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now); RL.set(ip, arr);
  if (RL.size > 6000) for (const [k, v] of RL) { if (!v.some((t) => now - t < windowMs)) RL.delete(k); }
  return arr.length > limit;
}

// opts: { nameFields:[], urlFields:[], honeypots:[], maxPerIpHour, maxLinks }
function check(req, data, opts) {
  opts = opts || {};
  data = data || {};
  const nameFields = opts.nameFields || ["firstName", "lastName", "name"];
  const urlFields = new Set(opts.urlFields || ["link", "website_ok"]);
  const honeypots = opts.honeypots || ["company_url", "website", "url", "hp"];
  const reasons = [];

  for (const h of honeypots) if (data[h] && String(data[h]).trim()) reasons.push("honeypot:" + h);
  if (rateHit(clientIp(req), opts.maxPerIpHour || 15, 3600e3)) reasons.push("rate");

  const email = String(data.email || "").trim();
  if (email && !EMAIL_RE.test(email)) reasons.push("email");
  const digits = String(data.phone || "").replace(/\D/g, "");
  if (data.phone && (digits.length < 7 || digits.length > 15)) reasons.push("phone");

  for (const f of nameFields) { const v = String(data[f] || ""); if (v && URLISH.test(v)) reasons.push("url-in:" + f); }

  const blob = Object.keys(data).filter((k) => !urlFields.has(k)).map((k) => String(data[k] || "")).join(" ");
  if (SPAM_WORDS.test(blob)) reasons.push("word");
  if ((blob.match(/https?:\/\//gi) || []).length >= (opts.maxLinks || 2)) reasons.push("links");
  if (blob.length > 8000) reasons.push("long");

  return { spam: reasons.length > 0, reasons, ip: clientIp(req) };
}

module.exports = { check, clientIp };
