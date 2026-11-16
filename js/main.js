/* PK's Catering & Events — site behaviour (no dependencies) */
(function () {
  "use strict";

  var cfg = window.PK_CONFIG || {};
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var digits = function (v) { return String(v || "").replace(/[^\d]/g, ""); };

  /* ---------- Contact details from js/config.js ---------- */
  function fillContacts() {
    $$("[data-cfg]").forEach(function (el) {
      var val = cfg[el.getAttribute("data-cfg")];
      if (val) { el.textContent = val; el.classList.remove("is-empty"); }
      else { el.textContent = el.getAttribute("data-empty") || "To be added"; el.classList.add("is-empty"); }
    });
    $$("[data-tel]").forEach(function (a) {
      if (cfg.phone) { a.href = "tel:+" + digits(cfg.phone).replace(/^0+/, ""); }
    });
    $$("[data-mail]").forEach(function (a) {
      if (cfg.email) { a.href = "mailto:" + cfg.email; }
    });
    $$("[data-wa]").forEach(function (a) {
      if (digits(cfg.whatsapp)) {
        var text = a.getAttribute("data-wa") || "Hi! I'd like to ask about catering.";
        a.href = "https://wa.me/" + digits(cfg.whatsapp) + "?text=" + encodeURIComponent(text);
        a.target = "_blank"; a.rel = "noopener";
      }
    });
    $$("[data-social]").forEach(function (a) {
      var url = cfg[a.getAttribute("data-social")];
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
      else if (a.parentNode) { a.parentNode.hidden = true; }
    });
    var needSetup = !cfg.phone && !digits(cfg.whatsapp) && !cfg.email;
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
    var close = function () { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) close(); });
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
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lbCap.textContent = it.getAttribute("data-label") || "";
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
  }

  /* ---------- Quote form → WhatsApp / email ---------- */
  function initQuoteForm() {
    var form = $("#quote-form");
    if (!form) return;
    var status = $(".form-status", form);

    function setInvalid(field, bad) { field.closest(".field").classList.toggle("invalid", bad); }
    function validate() {
      var ok = true;
      var name = form.elements.name, type = form.elements.eventType, phone = form.elements.phone, email = form.elements.email, agree = form.elements.agree;
      setInvalid(name, !name.value.trim()); ok = ok && !!name.value.trim();
      setInvalid(type, !type.value); ok = ok && !!type.value;
      var hasContact = phone.value.trim() || email.value.trim();
      setInvalid(phone, !hasContact); ok = ok && !!hasContact;
      if (email.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) { setInvalid(email, true); ok = false; }
      else setInvalid(email, false);
      if (!agree.checked) { agree.focus(); ok = false; }
      return ok;
    }
    function buildMessage() {
      var f = form.elements, lines = [
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
    function say(msg) { status.textContent = msg; status.classList.add("show"); }
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
          (ok ? "Your request has been copied so you can paste it anywhere." : "Please use the other button, or contact us directly."));
      });
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); });
    $("[data-send='wa']", form).addEventListener("click", function () {
      if (!validate()) { say("Please fill in the highlighted fields."); return; }
      var msg = buildMessage();
      if (digits(cfg.whatsapp)) { window.open("https://wa.me/" + digits(cfg.whatsapp) + "?text=" + encodeURIComponent(msg), "_blank", "noopener"); say("Opening WhatsApp with your request…"); }
      else { fallback("WhatsApp", msg); }
    });
    $("[data-send='mail']", form).addEventListener("click", function () {
      if (!validate()) { say("Please fill in the highlighted fields."); return; }
      var msg = buildMessage();
      if (cfg.email) { window.location.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent("Catering quote request") + "&body=" + encodeURIComponent(msg); say("Opening your email app…"); }
      else { fallback("Email", msg); }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
    fillContacts(); initNav(); initAccordion(); initReveal(); initGallery(); initQuoteForm();
  });
})();
