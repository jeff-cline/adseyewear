/* ADS Sports Eyewear — guide-page behavior: lead capture + live CTA swap.
   Every SEO/AEO guide page includes this. It (1) submits the "Get More Information"
   lead form to /api/lead with the page + primary keyword as the source, and
   (2) asks /api/cta whether the God admin has pointed this page's CTAs at a vendor
   or el.ag affiliate link yet — if so, it rewrites the CTA buttons live (no rebuild). */
(function () {
  "use strict";
  var page = document.body.getAttribute("data-page") || location.pathname;
  var keyword = document.body.getAttribute("data-keyword") || "";

  /* ---- 1. Live CTA swap ------------------------------------------------- */
  fetch("/api/cta?p=" + encodeURIComponent(page), { headers: { accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) {
      if (!cfg || !cfg.href) return;
      document.querySelectorAll(".js-cta").forEach(function (a) {
        a.setAttribute("href", cfg.href);
        a.removeAttribute("data-scroll");
        if (cfg.newtab) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener sponsored"); }
        if (cfg.label) {
          // keep any trailing arrow the design uses
          a.textContent = cfg.label + (/→\s*$/.test(a.dataset.arrow || "") ? " →" : "");
        }
      });
      if (cfg.note) {
        var rib = document.getElementById("cta-ribbon");
        if (rib) { rib.textContent = cfg.note; rib.style.display = "block"; }
      }
    })
    .catch(function () {});

  /* ---- 2. Smooth-scroll CTAs that still point at the form --------------- */
  document.querySelectorAll('.js-cta[href="#lead"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = document.getElementById("lead");
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });

  /* ---- 3. Lead form ----------------------------------------------------- */
  var form = document.getElementById("lead-form");
  if (!form) return;
  var msg = document.getElementById("lead-msg");
  var btn = form.querySelector('button[type="submit"]');
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      zip: form.zip.value.trim(),
      phone: form.phone.value.trim(),
      page: page,
      keyword: keyword,
      pageTitle: document.title,
    };
    if (!data.firstName || !data.lastName || !data.phone) {
      show("err", "Please add your first name, last name and phone number.");
      return;
    }
    btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…";
    fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          show("ok", "Thanks! Your request is in — we'll reach out shortly with more information.");
          if (window.pc && typeof window.pc.track === "function") { try { window.pc.track("lead", { page: page, keyword: keyword }); } catch (e) {} }
        } else {
          show("err", (res.j && res.j.error) || "Something went wrong. Please call or try again.");
        }
      })
      .catch(function () { show("err", "Network error — please try again."); })
      .finally(function () { btn.disabled = false; btn.textContent = btn.dataset.label || "Get More Information"; });
  });
  function show(kind, text) { if (!msg) return; msg.className = "form-msg " + kind; msg.textContent = text; }
})();
