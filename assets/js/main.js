/* Sanjay Construction — site interactions (no dependencies) */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Intro animations start once the page has painted ---------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add("is-loaded"); });
  });

  /* ---------- Scroll-driven bits: header, progress bar, back-to-top, parallax ---------- */
  var header = $(".site-header");
  var progress = $(".progress");
  var toTop = $(".to-top");
  var parallax = reduceMotion ? [] : $$("[data-parallax]");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle("is-scrolled", y > 20);
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var offset = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
      var img = el.querySelector("img");
      if (img) img.style.translate = "0 " + offset.toFixed(1) + "px";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ---------- Mobile navigation ---------- */
  var toggle = $(".nav__toggle");
  var links = document.getElementById("primary-nav");
  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () { setNav(!document.body.classList.contains("nav-open")); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setNav(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) setNav(false); });
  }

  /* ---------- Hero background image slider ---------- */
  var heroSlider = $("[data-hero-slider]");
  if (heroSlider) {
    var slides = $$(".hero__slide", heroSlider);
    var captionEl = $("[data-hero-caption]", heroSlider);
    var sideEl = $("[data-hero-side]", heroSlider);
    var dotsContainer = $("[data-hero-dots]", heroSlider);
    var prevBtn = $("[data-hero-prev]", heroSlider);
    var nextBtn = $("[data-hero-next]", heroSlider);
    var currentSlide = 0;
    var heroTimer = null;
    var INTERVAL = 5500;

    if (slides.length > 1) {
      // Build dots
      dotsContainer.innerHTML = "";
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", function () { goToSlide(i); restartTimer(); });
        dotsContainer.appendChild(dot);
      });

      var kickerEl = $(".hero__kicker", heroSlider);
      var titleLine1 = $(".hero__title .line:nth-child(1) span", heroSlider);
      var titleLine2 = $(".hero__title .line:nth-child(2) span", heroSlider);
      var titleLine3 = $(".hero__title .line:nth-child(3) span", heroSlider);
      var leadEl = $(".hero__lead", heroSlider);
      var expLabelEl = $(".hero__stat--exp .hero__stat-label", heroSlider);

      // Store default text values
      var defaultText = {
        kicker: kickerEl ? kickerEl.innerHTML : "",
        t1: titleLine1 ? titleLine1.innerHTML : "",
        t2: titleLine2 ? titleLine2.innerHTML : "",
        t3: titleLine3 ? titleLine3.innerHTML : "",
        lead: leadEl ? leadEl.innerHTML : "",
        expLabel: expLabelEl ? expLabelEl.innerHTML : ""
      };

      function goToSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (s, i) {
          s.classList.toggle("is-active", i === currentSlide);
        });
        $$(".hero__dot", dotsContainer).forEach(function (d, i) {
          d.classList.toggle("is-active", i === currentSlide);
        });
        var active = slides[currentSlide];
        var isNoText = active.getAttribute("data-no-text") === "true";
        var theme = active.getAttribute("data-theme");

        heroSlider.classList.toggle("is-no-text", isNoText);

        // Remove any previous is-theme-* classes and apply current theme
        Array.prototype.slice.call(heroSlider.classList).forEach(function (cls) {
          if (cls.indexOf("is-theme-") === 0) {
            heroSlider.classList.remove(cls);
          }
        });
        if (theme) {
          heroSlider.classList.add("is-theme-" + theme);
        }

        // Dynamic text content per slide
        if (!isNoText) {
          if (active.dataset.kicker && kickerEl) {
            kickerEl.innerHTML = active.dataset.kicker;
          } else if (kickerEl) {
            kickerEl.innerHTML = defaultText.kicker;
          }

          if (active.dataset.title1 && titleLine1) {
            titleLine1.innerHTML = active.dataset.title1;
            titleLine2.innerHTML = active.dataset.title2 || "";
            titleLine3.innerHTML = active.dataset.title3 || "";
            var line2 = titleLine2 ? titleLine2.closest(".line") : null;
            if (line2) line2.style.display = active.dataset.title2 ? "" : "none";
          } else {
            if (titleLine1) titleLine1.innerHTML = defaultText.t1;
            if (titleLine2) {
              titleLine2.innerHTML = defaultText.t2;
              var line2 = titleLine2.closest(".line");
              if (line2) line2.style.display = "";
            }
            if (titleLine3) titleLine3.innerHTML = defaultText.t3;
          }

          if (active.dataset.lead && leadEl) {
            leadEl.innerHTML = active.dataset.lead;
          } else if (leadEl) {
            leadEl.innerHTML = defaultText.lead;
          }

          if (expLabelEl) {
            if (active.dataset.statExpLabel) {
              expLabelEl.innerHTML = active.dataset.statExpLabel;
            } else {
              expLabelEl.innerHTML = defaultText.expLabel;
            }
          }
        }

        if (captionEl) {
          if (active.dataset.caption) {
            captionEl.style.opacity = "0";
            setTimeout(function () {
              captionEl.innerHTML = active.dataset.caption;
              captionEl.style.opacity = "1";
            }, 200);
          } else {
            captionEl.style.opacity = "0";
          }
        }
        if (sideEl) {
          if (active.dataset.side) {
            sideEl.style.opacity = "0";
            setTimeout(function () {
              sideEl.innerHTML = active.dataset.side;
              sideEl.style.opacity = "1";
            }, 200);
          } else {
            sideEl.style.opacity = "0";
          }
        }
      }

      function nextSlide() { goToSlide(currentSlide + 1); }
      function prevSlide() { goToSlide(currentSlide - 1); }

      function startTimer() {
        if (!reduceMotion && !heroTimer) {
          heroTimer = setInterval(nextSlide, INTERVAL);
        }
      }
      function stopTimer() {
        if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
      }
      function restartTimer() { stopTimer(); startTimer(); }

      if (prevBtn) prevBtn.addEventListener("click", function () { prevSlide(); restartTimer(); });
      if (nextBtn) nextBtn.addEventListener("click", function () { nextSlide(); restartTimer(); });

      // Only pause when hovering directly over the navigation buttons / controls
      var navControls = $(".hero__nav", heroSlider);
      if (navControls) {
        navControls.addEventListener("mouseenter", stopTimer);
        navControls.addEventListener("mouseleave", startTimer);
      }

      // Resume timer on visibility change (tab switch back)
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopTimer();
        else startTimer();
      });

      startTimer();
    }
  }

  /* ---------- Reveal on scroll (with optional stagger) ---------- */
  $$("[data-stagger]").forEach(function (group) {
    $$(".reveal", group).forEach(function (el, i) { el.style.setProperty("--d", (i * 0.12) + "s"); });
  });
  var revealEls = $$(".reveal, .wipe, .steps-x");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var from = parseInt(el.getAttribute("data-from") || "0", 10);
    if (reduceMotion) return;
    var t0 = null, dur = 1600;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { setTimeout(function () { countUp(entry.target); }, 500); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Services carousel (buttons, drag, progress) ---------- */
  $$("[data-carousel]").forEach(function (wrap) {
    var track = $(".carousel__track", wrap);
    var prev = $("[data-prev]", wrap), next = $("[data-next]", wrap);
    var bar = $(".carousel__bar i", wrap);
    function stepSize() { var card = track.children[0]; return card ? card.getBoundingClientRect().width + 20 : 300; }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
      if (bar) {
        var visible = track.clientWidth / track.scrollWidth;
        bar.style.width = (visible * 100) + "%";
        bar.style.transform = "translateX(" + (max > 0 ? (track.scrollLeft / max) * ((1 - visible) / visible) * 100 : 0) + "%)";
      }
    }
    prev.addEventListener("click", function () { track.scrollBy({ left: -stepSize(), behavior: "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: stepSize(), behavior: "smooth" }); });
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();

    // Drag to scroll with a mouse
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add("is-dragging"); }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      setTimeout(function () { track.classList.remove("is-dragging"); }, 0);
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* ---------- Testimonial slider ---------- */
  $$("[data-tslider]").forEach(function (slider) {
    var slides = $$(".tslide", slider);
    var dotsWrap = $(".tslider__dots", slider);
    var idx = 0, timer = null;
    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show testimonial " + (i + 1));
      b.addEventListener("click", function () { show(i); play(); });
      dotsWrap.appendChild(b);
      return b;
    });
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
      dots.forEach(function (d, i) { d.setAttribute("aria-current", String(i === idx)); });
    }
    function play() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { show(idx + 1); }, 6500); }
    $("[data-prev]", slider).addEventListener("click", function () { show(idx - 1); play(); });
    $("[data-next]", slider).addEventListener("click", function () { show(idx + 1); play(); });
    slider.addEventListener("mouseenter", function () { clearInterval(timer); });
    slider.addEventListener("mouseleave", play);
    show(0); play();
  });

  /* ---------- Testimonial carousel (3 / 2 / 1 per view, middle card highlighted) ---------- */
  $$("[data-tcar]").forEach(function (car) {
    var track = $(".tcar__track", car);
    var cards = $$(".tcard", car);
    var dotsWrap = $(".tcar__dots", car);
    var idx = 0, timer = null, DELAY = 6000;
    function perView() { return window.innerWidth >= 1000 ? 3 : window.innerWidth >= 640 ? 2 : 1; }
    function maxIdx() { return Math.max(0, cards.length - perView()); }
    function buildDots() {
      dotsWrap.innerHTML = "";
      for (var k = 0; k <= maxIdx(); k++) {
        var b = document.createElement("button");
        b.type = "button";
        b.tabIndex = -1;
        (function (n) { b.addEventListener("click", function () { go(n); play(); }); })(k);
        dotsWrap.appendChild(b);
      }
    }
    function go(n) {
      var max = maxIdx();
      idx = n > max ? 0 : n < 0 ? max : n;
      track.style.transform = "translateX(" + (-cards[idx].offsetLeft) + "px)";
      var active = idx + Math.floor(perView() / 2);
      cards.forEach(function (c, i) {
        c.classList.toggle("is-active", i === active);
        var visible = i >= idx && i < idx + perView();
        c.setAttribute("aria-hidden", String(!visible));
      });
      $$("button", dotsWrap).forEach(function (d, i) { d.setAttribute("aria-current", String(i === idx)); });
    }
    function play() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { go(idx + 1); }, DELAY); }
    $("[data-prev]", car).addEventListener("click", function () { go(idx - 1); play(); });
    $("[data-next]", car).addEventListener("click", function () { go(idx + 1); play(); });
    car.addEventListener("mouseenter", function () { clearInterval(timer); });
    car.addEventListener("mouseleave", play);
    car.addEventListener("focusin", function () { clearInterval(timer); });
    // Swipe on touch screens
    var sx = null;
    car.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") sx = e.clientX; });
    car.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); play(); }
    });
    var lastPV = perView();
    window.addEventListener("resize", function () {
      if (perView() !== lastPV) { lastPV = perView(); buildDots(); }
      go(Math.min(idx, maxIdx()));
    });
    buildDots(); go(0); play();
  });

  /* ---------- Project filters, pagination and bento layout ---------- */
  var filterBar = $("[data-filters]");
  var cards = $$(".projects-grid .project-card");
  if (filterBar && cards.length) {
    var pager = $("[data-pager]");
    var grid = $(".projects-grid");
    var PER_PAGE = 9;
    var SIZES = ["t-wide", "t-tall", "t-third", "t-half", "t-full", "m-wide", "m-tall", "m-sq"];
    var narrow = window.matchMedia("(max-width: 700px)");
    // Desktop: 6-column grid. Phones: 2-column grid. Each band tiles its rows exactly.
    var LAYOUTS = {
      wide: { bands: [["t-wide", "t-tall", "t-third", "t-third"], ["t-third", "t-third", "t-third"], ["t-half", "t-half"]],
              fallback: { 1: ["t-full"], 2: ["t-half", "t-half"], 3: ["t-third", "t-third", "t-third"] } },
      narrow: { bands: [["m-wide", "m-tall", "m-sq", "m-sq"], ["m-sq", "m-sq", "m-wide"]],
                fallback: { 1: ["m-wide"], 2: ["m-sq", "m-sq"], 3: ["m-sq", "m-sq", "m-wide"] } }
    };
    var state = { filter: "all" };

    function matches(c) { return state.filter === "all" || c.dataset.cat.split(" ").indexOf(state.filter) > -1; }

    // Assign tile sizes so every group of photos tiles the grid without gaps
    function layout(items) {
      var L = narrow.matches ? LAYOUTS.narrow : LAYOUTS.wide;
      var i = 0, b = 0;
      while (i < items.length) {
        var band = L.bands[b % L.bands.length];
        var left = items.length - i;
        var sizes = left >= band.length ? band : L.fallback[Math.min(left, 3)];
        sizes.forEach(function (cls, k) {
          var el = items[i + k];
          if (!el) return;
          SIZES.forEach(function (c) { el.classList.remove(c); });
          el.classList.add(cls);
        });
        i += sizes.length; b++;
      }
    }

    function render(scroll) {
      var list = cards.filter(matches);
      cards.forEach(function (c) {
        c.classList.toggle("is-hidden", list.indexOf(c) === -1);
      });
      layout(list);
      if (doc.classList.contains("motion") && !reduceMotion) {
        list.forEach(function (el, k) {
          el.classList.remove("tile-in");
          void el.offsetWidth;
          el.style.animationDelay = (k * 0.04) + "s";
          el.classList.add("tile-in");
        });
      }
      var label = $("[data-count-label]");
      if (label) label.textContent = list.length;

      if (pager) {
        pager.innerHTML = "";
      }
      if (scroll) {
        var y = filterBar.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }

    $$(".filter", filterBar).forEach(function (btn) {
      var f = btn.getAttribute("data-filter");
      var n = f === "all" ? cards.length : cards.filter(function (c) { return c.dataset.cat.split(" ").indexOf(f) > -1; }).length;
      var span = document.createElement("span");
      span.className = "count";
      span.textContent = n;
      btn.appendChild(span);
    });
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      state.filter = btn.getAttribute("data-filter");
      $$(".filter", filterBar).forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      render(false);
    });
    var hash = location.hash.replace("#", "");
    var preset = hash && $('[data-filter="' + hash + '"]', filterBar);
    if (preset) preset.click(); else render(false);
    if (narrow.addEventListener) narrow.addEventListener("change", function () { render(false); });
  }

  /* ---------- Lightbox ---------- */
  var lb = $(".lightbox");
  if (lb && cards.length) {
    var lbImg = $("img", lb), lbTitle = $("h3", lb), lbTag = $("figcaption span", lb), lbDesc = $("figcaption p", lb);
    var current = 0, lastFocus = null;
    function visible() { return cards.filter(function (c) { return !c.classList.contains("is-hidden"); }); }
    function fill(card) {
      lbImg.src = card.getAttribute("href");
      lbImg.alt = $("img", card).alt;
      lbTitle.textContent = $("h3", card).textContent;
      lbTag.textContent = $(".project-card__tag", card).textContent;
      lbDesc.textContent = $("p", card) ? $("p", card).textContent : "";
    }
    function open(card) {
      current = visible().indexOf(card);
      fill(card);
      lastFocus = document.activeElement;
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $(".lightbox__close", lb).focus();
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    function step(d) { var list = visible(); current = (current + d + list.length) % list.length; fill(list[current]); }
    cards.forEach(function (card) { card.addEventListener("click", function (e) { e.preventDefault(); open(card); }); });
    $(".lightbox__close", lb).addEventListener("click", close);
    $(".lightbox__prev", lb).addEventListener("click", function () { step(-1); });
    $(".lightbox__next", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------- Enquiry form (opens email or WhatsApp with the details) ---------- */
  var form = document.getElementById("enquiry-form");
  if (form) {
    var EMAIL = "info@sanjayconstruction.co.in";
    var WHATSAPP = "919820332265";
    var svc = new URLSearchParams(location.search).get("service");
    if (svc && form.service) {
      Array.prototype.forEach.call(form.service.options, function (o) { if (o.value === svc) form.service.value = svc; });
    }

    function validate() {
      var ok = true;
      $$("[required], input[type=email]", form).forEach(function (input) {
        var field = input.closest(".field");
        var err = $(".field__error", field);
        var v = input.value.trim();
        var msg = "";
        if (!v && input.required) msg = "This field is required.";
        else if (v && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Please enter a valid email address.";
        else if (v && input.type === "tel" && v.replace(/[^\d]/g, "").length < 10) msg = "Please enter a valid phone number.";
        field.classList.toggle("has-error", !!msg);
        input.setAttribute("aria-invalid", String(!!msg));
        if (err) err.textContent = msg;
        if (msg && ok) { input.focus(); ok = false; }
      });
      return ok;
    }

    function compose() {
      var d = new FormData(form);
      var lines = [
        "Name: " + d.get("name"),
        "Phone: " + d.get("phone"),
        "Email: " + (d.get("email") || "-"),
        "Organisation: " + (d.get("company") || "-"),
        "Service: " + (d.get("service") || "-"),
        "Project location: " + (d.get("location") || "-"),
        "",
        d.get("message") || "(No project details added)"
      ];
      return { subject: "Project enquiry — " + (d.get("service") || "General") + " — " + d.get("name"), body: lines.join("\n") };
    }

    var status = $(".form__status", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      var m = compose();
      var via = e.submitter && e.submitter.getAttribute("data-via");
      if (via === "whatsapp") {
        window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(m.subject + "\n\n" + m.body), "_blank", "noopener");
      } else {
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(m.subject) + "&body=" + encodeURIComponent(m.body);
      }
      status.classList.add("is-visible");
    });
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("has-error")) {
        field.classList.remove("has-error");
        e.target.setAttribute("aria-invalid", "false");
        $(".field__error", field).textContent = "";
      }
    });
  }


  /* ==========================================================================
     Motion layer: page transitions, scroll animations, hover effects
     ========================================================================== */
  var motion = doc.classList.contains("motion") && !reduceMotion;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (motion) {
    /* ---- Header tucks away on scroll down ---- */
    var lastY = window.scrollY;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (!header || document.body.classList.contains("nav-open")) return;
      if (y > lastY + 6 && y > 400) header.classList.add("is-tucked");
      else if (y < lastY - 6 || y < 400) header.classList.remove("is-tucked");
      lastY = y;
    }, { passive: true });

    /* ---- Auto-reveal common blocks that weren't marked by hand ---- */
    var AUTO = [
      "main .section-title", "main .proj-more", "main .filters", "main .form", "main .contact-cards > *", "main .hours",
      "main .map", "main .features > *", "main .feature-cards > *", "main .check-list li", "main .quote-item", "main .quote-main",
      "main .srow__body > *", "main .about-x__feats li", "main .about-x__stats > div", "main .commit__item",
      "main .split > *", "main .owner", ".footer__top > div", ".footer__bottom", ".cta-photo .container > *"
    ];
    $$(AUTO.join(",")).forEach(function (el) {
      if (el.closest(".reveal") && !el.classList.contains("reveal")) return; // parent already animates
      el.classList.add("reveal");
    });
    // Stagger siblings inside lists and grids
    [".contact-cards", ".features", ".feature-cards", ".check-list", ".about-x__feats", ".about-x__stats", ".commit__grid",
     ".footer__top", ".quote-list", ".srow__body", ".cta-photo .container", ".form__grid"].forEach(function (sel) {
      $$(sel).forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (child, i) {
          if (!child.style.getPropertyValue("--d")) child.style.setProperty("--d", Math.min(i * 0.08, 0.6) + "s");
        });
      });
    });

    /* ---- Image wipe on feature photos ---- */
    $$(".srow__media, .about-img, .stack__main, .page-hero__visual, .photo-tall, .about3__img").forEach(function (el) {
      el.classList.remove("wipe");
      el.classList.add("img-wipe");
    });

    /* ---- Headings rise word by word ---- */
    function splitWords(el) {
      var i = 0;
      function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var outer = document.createElement("span");
              outer.className = "w";
              var inner = document.createElement("span");
              inner.style.setProperty("--i", i++);
              inner.textContent = part;
              outer.appendChild(inner);
              frag.appendChild(outer);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && !/^(BR|SVG|IMG)$/.test(child.nodeName)) {
            wrap(child);
          }
        });
      }
      wrap(el);
    }
    var headings = $$("main h1, main h2, .cta-photo h2").filter(function (h) {
      return !h.closest(".hero__title, .sr-only, .lightbox, .ptile, .form") && !h.classList.contains("sr-only");
    });
    headings.forEach(splitWords);

    var mio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var t = entry.target;
        if (t.matches("h1, h2")) t.classList.add("words-in"); else t.classList.add("is-in");
        mio.unobserve(t);
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.01 });
    var pending = headings.concat($$(".reveal:not(.is-in), .img-wipe, .label"));
    pending.forEach(function (el) { mio.observe(el); });

    // Safety net: reveal anything already scrolled past, or everything once the page bottom is reached
    function settle() {
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      pending = pending.filter(function (el) {
        var done = el.classList.contains("is-in") || el.classList.contains("words-in");
        if (!done && (atBottom || el.getBoundingClientRect().bottom < 0)) {
          el.classList.add(el.matches("h1, h2") ? "words-in" : "is-in");
          mio.unobserve(el);
          done = true;
        }
        return !done;
      });
    }
    var settleTick = false;
    window.addEventListener("scroll", function () {
      if (settleTick) return;
      settleTick = true;
      requestAnimationFrame(function () { settle(); settleTick = false; });
    }, { passive: true });
    window.addEventListener("load", settle);

    /* ---- Lazy images fade in as they load ---- */
    $$("img[loading='lazy']").forEach(function (img) {
      if (img.closest(".img-wipe")) return;
      if (img.complete && img.naturalWidth) return;
      img.classList.add("fade-load");
      img.addEventListener("load", function () { img.classList.add("is-loaded"); }, { once: true });
      img.addEventListener("error", function () { img.classList.add("is-loaded"); }, { once: true });
    });
  }

  if (motion && finePointer) {
    /* ---- Cursor follower ---- */
    var cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    var cx = -100, cy = -100, tx = -100, ty = -100;
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("is-visible");
      var view = e.target.closest(".ptile, .ftile, .project-card");
      var link = !view && e.target.closest("a, button, [role=tab], input, select, textarea, label");
      cursor.classList.toggle("is-view", !!view);
      cursor.textContent = view ? "View" : "";
      cursor.classList.toggle("is-link", !!link);
    });
    document.addEventListener("mouseleave", function () { cursor.classList.remove("is-visible"); });
    document.addEventListener("mousedown", function () { cursor.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });

    /* ---- Magnetic buttons ---- */
    $$(".btn, .carousel__btn, .to-top").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        btn.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
      });
      btn.addEventListener("mouseleave", function () { btn.style.removeProperty("--mx"); btn.style.removeProperty("--my"); });
    });

    /* ---- Gentle 3D tilt on photo tiles ---- */
    $$(".ptile, .ftile").forEach(function (tile) {
      tile.classList.add("tilt");
      tile.addEventListener("mousemove", function (e) {
        var r = tile.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        tile.classList.add("is-tilting");
        tile.style.setProperty("--ry", (px * 6).toFixed(2) + "deg");
        tile.style.setProperty("--rx", (-py * 6).toFixed(2) + "deg");
      });
      tile.addEventListener("mouseleave", function () {
        tile.classList.remove("is-tilting");
        tile.style.removeProperty("--rx"); tile.style.removeProperty("--ry");
      });
    });
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
