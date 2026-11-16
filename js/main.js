/* PK's Catering & Events — site behaviour (no dependencies) */
(function () {
  "use strict";
  window.PK_READY = true; // tells the inline safety net in <head> that this script loaded

  var cfg = window.PK_CONFIG || {};
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var digits = function (v) { return String(v || "").replace(/[^\d]/g, ""); };
  var hasWa = !!digits(cfg.whatsapp);
  var currentFile = (location.pathname.split("/").pop() || "index.html");

  /* ---------- Contact details from js/config.js ---------- */
  function fillContacts() {
    $$("[data-cfg]").forEach(function (el) {
      var val = cfg[el.getAttribute("data-cfg")];
      var wrap = el.closest("[data-cfg-wrap]");
      if (val) { el.textContent = val; if (wrap) wrap.hidden = false; }
      else if (wrap) { wrap.hidden = true; }
    });
    $$("[data-tel]").forEach(function (a) {
      if (cfg.phone) { a.href = "tel:+" + digits(cfg.phone).replace(/^0+/, ""); }
    });
    $$("[data-mail]").forEach(function (a) {
      if (cfg.email) { a.href = "mailto:" + cfg.email; }
    });
    $$("[data-wa]").forEach(function (a) {
      if (hasWa) {
        var text = a.getAttribute("data-wa") || "Hi! I'd like to ask about catering.";
        a.href = "https://wa.me/" + digits(cfg.whatsapp) + "?text=" + encodeURIComponent(text);
        a.target = "_blank"; a.rel = "noopener";
      } else if ((a.getAttribute("href") || "").split("?")[0] === currentFile) {
        // Without a WhatsApp number these links fall back to the quote page — pointless on the quote page itself.
        a.hidden = true;
      }
    });
    $$("[data-social]").forEach(function (a) {
      var url = cfg[a.getAttribute("data-social")];
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
      else if (a.parentNode) { a.parentNode.hidden = true; }
    });
    // Hide the top bar entirely when it has nothing to show.
    var topbar = $(".topbar");
    if (topbar) topbar.hidden = $$("[data-cfg-wrap]", topbar).every(function (w) { return w.hidden; });
    // Hide the contact list on the quote page when it's empty.
    $$(".contact-list").forEach(function (l) { l.hidden = $$("[data-cfg-wrap]", l).every(function (w) { return w.hidden; }); });
    var listEmpty = $$(".contact-list").every(function (l) { return l.hidden; });
    $$("[data-contact-head]").forEach(function (h) { h.hidden = listEmpty && !hasWa; });
    var needSetup = !cfg.phone && !hasWa && !cfg.email;
    $$("[data-setup-note]").forEach(function (n) { n.hidden = !needSetup; });
  }

  /* ---------- Header: mobile nav + scrolled state ---------- */
  function initNav() {
    var header = $(".site-header"), toggle = $(".nav-toggle"), nav = $("#main-nav");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    }
    if (!toggle || !nav) return;
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!nav.classList.contains("is-open")); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) setOpen(false); });
  }

  /* ---------- Accordion ---------- */
  function initAccordion() {
    $$(".acc-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        $$(".acc-trigger", btn.closest(".accordion")).forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
        btn.setAttribute("aria-expanded", String(!open));
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (i) { i.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------- Gallery: filters + lightbox ---------- */
  function initGallery() {
    var grid = $(".gallery");
    if (!grid) return;
    var items = $$(".g-item", grid), filters = $$(".filter");
    var visible = function () { return items.filter(function (i) { return !i.hidden; }); };

    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        filters.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        f.setAttribute("aria-pressed", "true");
        var cat = f.getAttribute("data-filter");
        items.forEach(function (i) { i.hidden = !(cat === "all" || i.getAttribute("data-cat") === cat); });
      });
    });

    var lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb), idx = 0, opener = null;
    function show(n) {
      var list = visible(); if (!list.length) return;
      idx = (n + list.length) % list.length;
      var it = list[idx], img = $("img", it);
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
      lbCap.textContent = (it.getAttribute("data-label") || "") + "  ·  " + (idx + 1) + " / " + list.length;
    }
    function open(item) {
      opener = item; show(visible().indexOf(item));
      lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; $(".lb-close", lb).focus();
    }
    function close() {
      lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = ""; if (opener) opener.focus();
    }
    items.forEach(function (i) { i.addEventListener("click", function () { open(i); }); });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    // Swipe left/right on touch screens
    var startX = null, startY = null;
    lb.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
      startX = startY = null;
    });
  }

  /* ---------- Quote form → WhatsApp / email ---------- */
  function initQuoteForm() {
    var form = $("#quote-form");
    if (!form) return;
    var status = $(".form-status", form), f = form.elements;

    // Pre-fill from links such as quote.html?event=wedding&about=Christmas%20Lunch%20Menu
    var params = new URLSearchParams(location.search);
    var eventMap = { wedding: "Wedding", corporate: "Corporate function", festive: "Festive / seasonal lunch", party: "Birthday or private party", family: "Family function" };
    var ev = eventMap[(params.get("event") || "").toLowerCase()];
    if (ev) f.eventType.value = ev;
    var about = params.get("about");
    if (about && !f.message.value) f.message.value = "I'm interested in: " + about.slice(0, 120) + "\n";

    // No past dates
    var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    f.date.min = t.toISOString().slice(0, 10);

    function setInvalid(el, bad) { el.closest(".field").classList.toggle("invalid", bad); return !bad; }
    function validate() {
      var phone = f.phone.value.trim(), email = f.email.value.trim();
      var checks = [
        [f.name, setInvalid(f.name, !f.name.value.trim())],
        [f.eventType, setInvalid(f.eventType, !f.eventType.value)],
        [f.phone, setInvalid(f.phone, !phone && !email)],
        [f.email, setInvalid(f.email, !!email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))],
        [f.agree, setInvalid(f.agree, !f.agree.checked)]
      ];
      var firstBad = checks.filter(function (c) { return !c[1]; })[0];
      if (firstBad) { firstBad[0].focus(); return false; }
      return true;
    }
    // Clear an error as soon as the field is fixed
    ["name", "eventType", "phone", "email", "agree"].forEach(function (n) {
      f[n].addEventListener(n === "agree" || n === "eventType" ? "change" : "input", function () {
        var fld = f[n].closest(".field");
        if (fld.classList.contains("invalid")) validate();
      });
    });
    function buildMessage() {
      var lines = [
        "Hi " + (cfg.businessName || "there") + ", I'd like a catering quote.",
        "",
        "Name: " + f.name.value.trim(),
        "Event type: " + f.eventType.value
      ];
      if (f.date.value) lines.push("Event date: " + f.date.value);
      if (f.guests.value) lines.push("Guests: " + f.guests.value);
      if (f.venue.value.trim()) lines.push("Venue / area: " + f.venue.value.trim());
      if (f.phone.value.trim()) lines.push("Phone: " + f.phone.value.trim());
      if (f.email.value.trim()) lines.push("Email: " + f.email.value.trim());
      if (f.message.value.trim()) lines.push("", f.message.value.trim());
      return lines.join("\n");
    }
    function say(msg, ok) { status.textContent = msg; status.classList.add("show"); status.classList.toggle("is-ok", !!ok); }
    function copy(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
        }
      } catch (e) { /* fall through */ }
      return Promise.resolve(false);
    }
    function fallback(what, msg) {
      copy(msg).then(function (ok) {
        say(what + " isn't set up on this site yet (add it in js/config.js). " +
          (ok ? "Your request has been copied so you can paste it anywhere." : "Please try the other button, or contact us directly."));
      });
    }
    function sendWhatsApp() {
      if (!validate()) { say("Please fix the highlighted fields."); return; }
      var msg = buildMessage();
      if (hasWa) { window.open("https://wa.me/" + digits(cfg.whatsapp) + "?text=" + encodeURIComponent(msg), "_blank", "noopener"); say("Opening WhatsApp with your request. Just press send!", true); }
      else if (cfg.email) { sendEmail(); }
      else { fallback("WhatsApp", msg); }
    }
    function sendEmail() {
      if (!validate()) { say("Please fix the highlighted fields."); return; }
      var msg = buildMessage();
      if (cfg.email) { window.location.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent("Catering quote request") + "&body=" + encodeURIComponent(msg); say("Opening your email app with your request.", true); }
      else { fallback("Email", msg); }
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); sendWhatsApp(); });
    $("[data-send='mail']", form).addEventListener("click", sendEmail);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
    fillContacts(); initNav(); initAccordion(); initReveal(); initGallery(); initQuoteForm();
  });
})();
