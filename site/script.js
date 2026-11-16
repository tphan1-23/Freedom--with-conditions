/* Small progressive enhancements. The site works fully without this file. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Reading progress bar ---------- */
  var bar = document.getElementById("progress");
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = pct + "%";
  }

  /* ---------- Back-to-top button ---------- */
  var top = document.createElement("button");
  top.className = "to-top";
  top.type = "button";
  top.setAttribute("aria-label", "Back to top");
  top.innerHTML = "&uarr;";
  top.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  document.body.appendChild(top);

  function onScroll() {
    updateProgress();
    top.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (el.classList.contains("card") ? (i % 4) * 70 : 0) + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Count-up numbers on the home page ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    el.textContent = "0";
    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      var start = null;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
    obs.observe(el);
  });

  /* ---------- Section dots (wide screens) ---------- */
  var heads = Array.prototype.slice.call(document.querySelectorAll("main section[id^='s'] > h2"));
  if (heads.length > 2) {
    var dots = document.createElement("nav");
    dots.className = "dots";
    dots.setAttribute("aria-label", "Sections on this page");
    var links = heads.map(function (h) {
      var a = document.createElement("a");
      a.href = "#" + h.parentElement.id;
      var label = h.textContent.replace(/^\d+\s*/, "");
      a.setAttribute("aria-label", label);
      a.innerHTML = "<span>" + label.replace(/</g, "&lt;") + "</span>";
      dots.appendChild(a);
      return a;
    });
    document.body.appendChild(dots);

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = heads.indexOf(e.target.querySelector("h2"));
          links.forEach(function (l, i) { l.classList.toggle("on", i === idx); });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    heads.forEach(function (h) { spy.observe(h.parentElement); });
  }

  /* ---------- Click-to-enlarge images ---------- */
  var box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.innerHTML = '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
                  '<img alt=""><p class="lb-cap"></p>';
  document.body.appendChild(box);
  var lbImg = box.querySelector("img");
  var lbCap = box.querySelector(".lb-cap");

  function closeBox() { box.classList.remove("open"); document.body.classList.remove("noscroll"); }
  document.querySelectorAll("figure img").forEach(function (img) {
    img.tabIndex = 0;
    img.title = "Click to enlarge";
    function open() {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      var cap = img.parentElement.querySelector("figcaption");
      lbCap.textContent = cap ? cap.textContent.replace(/\s*Image source\s*$/, "") : "";
      box.classList.add("open");
      document.body.classList.add("noscroll");
    }
    img.addEventListener("click", open);
    img.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
  });
  box.addEventListener("click", function (e) { if (e.target !== lbImg) closeBox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBox(); });

  /* ---------- Sources search ---------- */
  var filter = document.getElementById("filter");
  if (filter) {
    var items = Array.prototype.slice.call(document.querySelectorAll("main .src li"));
    var empty = document.getElementById("nomatch");
    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (li) {
        var hit = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
        li.hidden = !hit;
        if (hit) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  }
})();
