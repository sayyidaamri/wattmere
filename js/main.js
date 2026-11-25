/* Wattmere — all interactions, vanilla JS, no dependencies */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on scroll ---------- */
  var rv = $$(".rv");
  if (reduced || !("IntersectionObserver" in window)) rv.forEach(function (e) { e.classList.add("in"); });
  else {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    rv.forEach(function (e) { ro.observe(e); });
  }

  /* ---------- mega menu ---------- */
  var scrim = $(".scrim"), navB = $$(".nav-i[aria-controls]");
  function closeMega() {
    navB.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    $$(".mega").forEach(function (m) { m.classList.remove("on"); });
    if (scrim) scrim.classList.remove("on");
  }
  navB.forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      closeMega();
      if (!open) {
        b.setAttribute("aria-expanded", "true");
        var hb = Math.round($(".hdr").getBoundingClientRect().bottom) + "px";
        document.getElementById(b.getAttribute("aria-controls")).style.top = hb; scrim.style.top = hb;
        document.getElementById(b.getAttribute("aria-controls")).classList.add("on");
        scrim.classList.add("on");
      }
    });
  });
  if (scrim) scrim.addEventListener("click", closeMega);

  /* ---------- mobile menu ---------- */
  var burger = $(".burger"), mm = $(".mm");
  function setMM(on) {
    if (!mm) return;
    mm.classList.toggle("on", on);
    burger.setAttribute("aria-expanded", on);
    burger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
    document.documentElement.style.overflow = on ? "hidden" : "";
    $(".i-bars", burger).style.display = on ? "none" : "";
    $(".i-x", burger).style.display = on ? "" : "none";
  }
  if (burger) {
    burger.addEventListener("click", function () { setMM(!mm.classList.contains("on")); });
    $$(".mm-b[aria-expanded]", mm).forEach(function (b) {
      b.addEventListener("click", function () {
        var o = b.getAttribute("aria-expanded") === "true";
        $$(".mm-b[aria-expanded]", mm).forEach(function (x) { x.setAttribute("aria-expanded", "false"); x.nextElementSibling.classList.remove("on"); });
        if (!o) { b.setAttribute("aria-expanded", "true"); b.nextElementSibling.classList.add("on"); }
      });
    });
    matchMedia("(min-width:1024px)").addEventListener("change", function () { setMM(false); closeMega(); });
  }

  /* ---------- modals ---------- */
  function closeModals() { $$(".mdl.on").forEach(function (m) { m.classList.remove("on"); }); }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-modal]");
    if (o) { e.preventDefault(); var m = document.getElementById(o.getAttribute("data-modal")); if (m) { m.classList.add("on"); var x = $(".x", m); if (x) x.focus({ preventScroll: true }); } return; }
    if (e.target.closest("[data-close]") || (e.target.classList && e.target.classList.contains("mdl"))) closeModals();
    var sw = e.target.closest(".sw button");
    if (sw && !sw.disabled) sw.setAttribute("aria-pressed", sw.getAttribute("aria-pressed") !== "true");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMega(); closeModals(); setMM(false); } });

  /* ---------- accordions (one open per group) ---------- */
  $$("[data-acc]").forEach(function (g) {
    $$(".acc-b", g).forEach(function (b) {
      b.addEventListener("click", function () {
        var open = b.getAttribute("aria-expanded") === "true";
        $$(".acc-b", g).forEach(function (x) { x.setAttribute("aria-expanded", "false"); x.nextElementSibling.classList.remove("on"); });
        if (!open) { b.setAttribute("aria-expanded", "true"); b.nextElementSibling.classList.add("on"); }
      });
    });
  });

  /* ---------- product films: timed scenes, only while on screen ---------- */
  $$(".stage[data-film]").forEach(function (st) {
    var sc = $$(".scn", st), i = 0, t = null, vis = false, paused = st.hasAttribute("data-paused") || reduced;
    var pp = $(".pp", st);
    function apply() {
      sc.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      sc.forEach(function (s, k) { if (k !== i) s.classList.remove("go"); });
      if (!paused) { var cur = sc[i]; cur.classList.remove("go"); void cur.offsetWidth; cur.classList.add("go"); }
    }
    function tick() {
      clearTimeout(t);
      if (paused || !vis) return;
      t = setTimeout(function () { i = (i + 1) % sc.length; apply(); tick(); }, +sc[i].getAttribute("data-d") || 3000);
    }
    function ui() { st.classList.toggle("paused", paused); if (pp) pp.setAttribute("aria-label", paused ? "Play animation" : "Pause animation"); }
    ui(); sc[0] && sc[0].classList.add("on");
    if (pp) pp.addEventListener("click", function () { paused = !paused; ui(); apply(); tick(); });
    new IntersectionObserver(function (e) {
      var was = vis; vis = e[0].isIntersecting;
      if (vis && !was && !paused) apply();
      tick();
    }, { threshold: 0.25 }).observe(st);
  });

  /* ---------- autonomy level slider ---------- */
  $$(".lvl").forEach(function (L) {
    var pos = [0.107, 0.365, 0.6235, 1], n = 0;
    var tr = $(".lvl-t", L), fill = $(".lvl-f i", L), k = $(".lvl-k", L), dots = $$(".lvl-d", L), cards = $$(".lvl-cd", L), vis = $$(".lvl-s", L), tx = $$(".lvl-x>div", L), pv = $(".rb.p", L), nx = $(".rb.n", L), w = 0;
    dots.forEach(function (d, i) { d.style.left = (i === 3 ? 99.4 : pos[i] * 100) + "%"; });
    function place() { k.style.transform = "translateX(" + (w * (n === 3 ? 0.994 : pos[n])).toFixed(1) + "px)"; }
    function set(i) {
      n = Math.max(0, Math.min(3, i));
      fill.style.clipPath = "inset(0 " + (100 - pos[n] * 100) + "% 0 0 round 99px)"; place();
      dots.forEach(function (d, j) { d.classList.toggle("past", j < n); });
      cards.forEach(function (c, j) { c.setAttribute("aria-pressed", j === n); });
      vis.forEach(function (c, j) { c.classList.toggle("on", j === n); });
      tx.forEach(function (c, j) { c.classList.toggle("on", j === n); });
      pv.disabled = n === 0; nx.disabled = n === 3;
    }
    new ResizeObserver(function (e) { w = e[0].contentRect.width; place(); }).observe(tr);
    w = tr.clientWidth;
    dots.forEach(function (d, i) { d.addEventListener("click", function () { set(i); }); });
    cards.forEach(function (d, i) { d.addEventListener("click", function () { set(i); }); });
    pv.addEventListener("click", function () { set(n - 1); }); nx.addEventListener("click", function () { set(n + 1); });
    tr.addEventListener("click", function (e) {
      if (e.target.closest(".lvl-d")) return;
      var r = tr.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, b = 0;
      pos.forEach(function (p, i) { if (Math.abs(p - x) < Math.abs(pos[b] - x)) b = i; }); set(b);
    });
    set(0);
  });

  /* ---------- carousels (click, keys, swipe) ---------- */
  $$("[data-car]").forEach(function (root) {
    var t = $(".car-t", root), s = $$(".car-s", t), i = 0, pv = $(".cp", root), nx = $(".cn", root), live = $(".sr", root);
    function go(n) {
      i = Math.max(0, Math.min(s.length - 1, n));
      t.style.transform = "translateX(" + -100 * i + "%)";
      pv.disabled = i === 0; nx.disabled = i === s.length - 1;
      s.forEach(function (x, k) { x.inert = k !== i; });
      if (live) live.textContent = "Slide " + (i + 1) + " of " + s.length;
    }
    pv.addEventListener("click", function () { go(i - 1); }); nx.addEventListener("click", function () { go(i + 1); });
    var x0 = null, y0 = 0;
    t.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    t.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(i + (dx < 0 ? 1 : -1));
    }, { passive: true });
    go(0);
  });

  /* ---------- footer show more ---------- */
  $$(".fc button").forEach(function (b) {
    b.addEventListener("click", function () {
      var ul = b.parentNode.querySelector("ul"), first = $$("li[hidden]", ul)[0];
      $$("li", ul).forEach(function (l) { l.hidden = false; });
      b.hidden = true; if (first) $("a", first).focus({ preventScroll: true });
    });
  });

  /* ---------- tabs ---------- */
  $$("[data-tabs]").forEach(function (g) {
    var b = $$("[role=tab]", g), p = $$(".tp>div", g);
    b.forEach(function (x, i) {
      x.addEventListener("click", function () {
        b.forEach(function (y, j) { y.setAttribute("aria-selected", j === i); });
        p.forEach(function (y, j) { y.classList.toggle("on", j === i); });
      });
    });
  });

  /* ---------- count-up numbers ---------- */
  $$("[data-count]").forEach(function (el) {
    var end = +el.getAttribute("data-count"), suf = el.getAttribute("data-suf") || "", fin = end.toLocaleString("en-US") + suf;
    if (reduced) { el.textContent = fin; return; }
    el.style.minHeight = "1em";
    new IntersectionObserver(function (e, o) {
      if (!e[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now();
      (function f(t) { var p = Math.min(1, (t - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - p, 4))); el.textContent = v.toLocaleString("en-US") + (p === 1 ? suf : ""); if (p < 1) requestAnimationFrame(f); })(t0);
    }, { threshold: 0.4 }).observe(el);
  });

  /* ---------- forms: client-side validation only, nothing is sent ---------- */
  function check(field) {
    var wrap = field.closest("[data-f]"); if (!wrap) return true;
    var v = field.value.trim(), ok = !field.required || v !== "";
    if (ok && field.type === "email" && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    wrap.classList.toggle("bad", !ok); return ok;
  }
  $$("form[data-form]").forEach(function (f) {
    var steps = $$("[data-step]", f), dots = $$(".dots i", f), n = 0;
    function show(i) { n = i; steps.forEach(function (s, j) { s.hidden = j !== i; }); dots.forEach(function (d, j) { d.classList.toggle("on", j === i); }); }
    if (steps.length) show(0);
    f.setAttribute("novalidate", "");
    $$("input,select,textarea", f).forEach(function (x) { x.addEventListener("blur", function () { if (x.value) check(x); }); x.addEventListener("input", function () { var w = x.closest(".bad"); if (w) check(x); var b = $("[data-need]", f); if (b) b.disabled = !x.value; }); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var scope = steps.length ? steps[n] : f, bad = $$("input,select,textarea", scope).filter(function (x) { return !check(x); });
      if (bad.length) { bad[0].focus(); return; }
      if (steps.length && n < steps.length - 1) { show(n + 1); var q = $("input,select", steps[n]); if (q) q.focus({ preventScroll: true }); return; }
      var d = $("[data-done]", f) || (f.parentNode && $("[data-done]", f.parentNode));
      if (d) { $$("[data-body]", f).forEach(function (x) { x.hidden = true; }); d.hidden = false; }
    });
  });

  /* ---------- pricing ---------- */
  var price = $("[data-pricing]");
  if (price) {
    var r = $("input[type=range]", price), per = "year", cur = "USD";
    var tiers = [["25", 0], ["50", 1], ["100", 1.9], ["250", 4.2], ["500", 7.6], ["1K", 13.5], ["2.5K", 29], ["5K", 52]];
    var sym = { USD: "$", EUR: "€", GBP: "£" }, fx = { USD: 1, EUR: 0.92, GBP: 0.79 };
    var draw = function () {
      var t = tiers[+r.value], mult = 1 + t[1];
      r.setAttribute("aria-valuetext", t[0] + " points");
      $("[data-pts]", price).textContent = t[0];
      $$("[data-base]", price).forEach(function (e) {
        var v = +e.getAttribute("data-base") * mult * (per === "year" ? 1 : 1.5) * fx[cur];
        e.textContent = sym[cur] + (v === 0 ? "0" : v >= 100 ? Math.round(v).toLocaleString("en-US") : (+e.getAttribute("data-base") % 1 ? (Math.ceil(v) - 0.01).toFixed(2) : Math.round(v)));
      });
    };
    r.addEventListener("input", draw);
    $$("input[name=per]", price).forEach(function (x) { x.addEventListener("change", function () { per = x.value; draw(); }); });
    $("select", price).addEventListener("change", function (e) { cur = e.target.value; draw(); });
    $$(".ptabs button", price).forEach(function (b, i, all) {
      b.addEventListener("click", function () { all.forEach(function (x) { x.setAttribute("aria-selected", x === b); }); $$("[data-plan]", price).forEach(function (p) { p.hidden = p.getAttribute("data-plan") !== b.getAttribute("data-k"); }); });
    });
    draw();
  }
  $$("[data-fold]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = document.getElementById(b.getAttribute("data-fold")), on = f.classList.toggle("on");
      b.setAttribute("aria-expanded", on); b.firstElementChild.textContent = on ? "– Hide plan features" : "+ See all plan features";
    });
  });

  /* ---------- equipment directory ---------- */
  var dir = $("[data-dir]");
  if (dir) {
    var items = $$(".eqg>a[data-n]", dir), q = $("input", dir), more = $(".lm", dir), feat = $(".ft", dir), lim = 18, st = { sort: "pop", cat: "", type: "", text: "", letter: "" };
    var cnt = $("[data-cnt]", dir), grid = $(".eqg", dir);
    var render = function () {
      var list = items.filter(function (a) {
        var d = a.dataset;
        return (!st.cat || d.c === st.cat || d.s === st.cat) && (!st.type || d.t.indexOf(st.type) > -1) &&
          (st.sort === "pop" || st.sort === "az" || d.t.indexOf(st.sort) > -1) &&
          (!st.letter || d.n[0].toLowerCase() === st.letter) &&
          (!st.text || (d.n + " " + d.c + " " + d.s + " " + a.textContent).toLowerCase().indexOf(st.text) > -1);
      });
      items.forEach(function (a) { a.hidden = true; });
      list.slice(0, lim).forEach(function (a) { a.hidden = false; grid.appendChild(a); });
      var f = !st.cat && !st.type && !st.text && !st.letter && st.sort === "pop";
      feat.hidden = !f;
      if (f && list[10]) grid.insertBefore(feat, list[10]);
      more.hidden = list.length <= lim;
      cnt.textContent = list.length ? "1–" + Math.min(lim, list.length) + " of " + (f ? "4,000+ by most popular" : list.length + (list.length === 1 ? " match" : " matches")) : "No matches";
      $(".empty", dir).hidden = list.length > 0;
    };
    q.addEventListener("input", function () { st.text = q.value.trim().toLowerCase(); lim = 18; render(); });
    more.addEventListener("click", function () { lim += 18; render(); });
    $$("[data-sort]", dir).forEach(function (b) { b.addEventListener("click", function () { st.sort = b.dataset.sort; st.letter = ""; $$("[data-sort]", dir).forEach(function (x) { x.classList.toggle("on", x === b); }); lim = 18; render(); }); });
    $$(".cat", dir).forEach(function (b) {
      b.addEventListener("click", function () {
        var o = b.getAttribute("aria-expanded") === "true";
        $$(".cat", dir).forEach(function (x) { x.setAttribute("aria-expanded", "false"); x.classList.remove("on"); x.nextElementSibling.hidden = true; });
        b.setAttribute("aria-expanded", !o); b.nextElementSibling.hidden = o; b.classList.toggle("on", !o); $$(".sub button", dir).forEach(function (x) { x.classList.remove("on"); });
        st.cat = o ? "" : b.dataset.c; lim = 18; render();
      });
    });
    $$(".sub button", dir).forEach(function (b) { b.addEventListener("click", function () { $$(".sub button", dir).forEach(function (x) { x.classList.toggle("on", x === b); }); st.cat = b.dataset.s; lim = 18; render(); }); });
    $$(".eqt button", dir).forEach(function (b, i, all) { b.addEventListener("click", function () { all.forEach(function (x) { x.setAttribute("aria-selected", x === b); }); st.type = b.dataset.t; lim = 18; render(); }); });
    var h = location.hash.slice(1).toLowerCase();
    var fromHash = function () { var l = location.hash.slice(1).toLowerCase(); if (/^[a-z]$/.test(l)) { st.letter = l; render(); $(".eqm", dir).scrollIntoView(); } else if (l.indexOf("cat-") === 0) { var c = $$(".cat", dir).filter(function (x) { return x.dataset.k === l.slice(4); })[0]; if (c && c.getAttribute("aria-expanded") !== "true") c.click(); } };
    addEventListener("hashchange", fromHash); render(); if (h) fromHash();
  }

  /* ---------- filters (stories, playbooks, triggers) + load more ---------- */
  $$("[data-filter]").forEach(function (g) {
    var btn = $$("[data-v]", g), it = $$("[data-k]", g);
    btn.forEach(function (b) {
      b.addEventListener("click", function () {
        btn.forEach(function (x) { x.classList.toggle("on", x === b); });
        var v = b.dataset.v; it.forEach(function (x) { x.hidden = v !== "all" && (" " + x.dataset.k + " ").indexOf(" " + v + " ") < 0; });
      });
    });
  });
  $$("[data-more]").forEach(function (b) {
    b.addEventListener("click", function () { $$("#" + b.dataset.more + ">[hidden]").slice(0, 8).forEach(function (x) { x.hidden = false; }); if (!$("#" + b.dataset.more + ">[hidden]")) b.hidden = true; });
  });
  $$("[data-search]").forEach(function (i) {
    var list = $$("#" + i.dataset.search + ">*");
    i.addEventListener("input", function () { var v = i.value.toLowerCase(); list.forEach(function (x) { x.hidden = v !== "" && x.textContent.toLowerCase().indexOf(v) < 0; }); });
  });
  $$("[data-scrollx]").forEach(function (b) { b.addEventListener("click", function () { var t = $(b.dataset.scrollx), end = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4; t.scrollTo({ left: end ? 0 : t.scrollLeft + 524, behavior: reduced ? "auto" : "smooth" }); }); });

  /* ---------- copy buttons ---------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var txt = b.dataset.copy === "url" ? location.href : b.parentNode.querySelector(".code").textContent, done = function () { if (b.dataset.copy === "url") { b.setAttribute("aria-label", "Link copied"); b.style.color = "var(--accent)"; } else b.textContent = "Copied"; setTimeout(function () { if (b.dataset.copy === "url") b.style.color = ""; else b.textContent = "Copy"; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
    });
  });
  $$(".bar [data-x]").forEach(function (b) { b.addEventListener("click", function () { b.closest(".bar").hidden = true; }); });

  /* ---------- scroll-linked: reading progress + section nav, one rAF, read then write ---------- */
  var pg = $(".pg"), gn = $$(".gnav aside a[href^='#']");
  if (pg || gn.length) {
    var max = 1, last = -1, tops = [], queued = false, active = -1;
    var measure = function () { max = document.documentElement.scrollHeight - innerHeight; tops = gn.map(function (a) { var t = document.getElementById(a.hash.slice(1)); return t ? t.getBoundingClientRect().top + scrollY - 160 : 1e9; }); };
    var frame = function () {
      queued = false; var y = scrollY;
      if (pg) { var p = Math.round(Math.min(1, y / max) * 1000) / 1000; if (p !== last) { last = p; pg.style.transform = "scaleX(" + p + ")"; } }
      if (gn.length) { var a = -1; for (var j = 0; j < tops.length; j++) if (tops[j] <= y) a = j; if (a !== active) { if (gn[active]) gn[active].classList.remove("on"); if (gn[a]) gn[a].classList.add("on"); active = a; } }
    };
    addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener("resize", measure); addEventListener("load", function () { measure(); frame(); }); measure(); frame();
  }
})();
