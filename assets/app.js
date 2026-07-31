/* ============================================================
   adhamaboulkheir.io — shared behaviour
   ============================================================ */
(function () {
  'use strict';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky nav ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var stick = function () { nav.classList.toggle('stuck', window.scrollY > 20); };
    stick();
    window.addEventListener('scroll', stick, { passive: true });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  window.revealAll = function () {
    document.querySelectorAll('.rise:not(.on)').forEach(function (el) { io.observe(el); });
  };
  window.revealAll();

  /* ---------- ticker: duplicate track for seamless loop ---------- */
  var track = document.querySelector('.ticker__track');
  if (track && !REDUCED) { track.innerHTML += track.innerHTML; }

  /* ---------- case-study TOC scrollspy ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.cs-toc a'));
  if (tocLinks.length) {
    var targets = tocLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-90px 0px -70% 0px', threshold: 0 });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- hero lattice ---------- */
  var cv = document.getElementById('lattice');
  if (cv && !REDUCED) {
    var ctx = cv.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [], raf = null, mouse = { x: -9999, y: -9999 };

    function build() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var count = Math.max(28, Math.min(120, Math.round((w * h) / 14000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          r: Math.random() * 1.5 + 0.6,
          ph: Math.random() * Math.PI * 2,
          fire: Math.random() < 0.14
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, dx, dy, d2;
      var LINK = 17000;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 < LINK) {
            ctx.strokeStyle = 'rgba(204,242,77,' + (1 - d2 / LINK) * 0.13 + ')';
            ctx.lineWidth = 0.55;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        dx = a.x - mouse.x; dy = a.y - mouse.y;
        var near = dx * dx + dy * dy < 24000;
        var pulse = 0.4 + 0.6 * Math.abs(Math.sin(t / 1500 + a.ph));
        var alpha = (a.fire ? 0.85 : 0.5) * pulse;
        ctx.fillStyle = near
          ? 'rgba(204,242,77,' + Math.min(1, alpha + 0.4) + ')'
          : (a.fire ? 'rgba(204,242,77,' + alpha + ')' : 'rgba(255,255,255,' + alpha * 0.42 + ')');
        ctx.beginPath();
        ctx.arc(a.x, a.y, near ? a.r * 1.9 : a.r, 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    build();
    raf = requestAnimationFrame(frame);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        cancelAnimationFrame(raf); build(); raf = requestAnimationFrame(frame);
      }, 150);
    });

    var hero = cv.closest('.hero');
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(frame); }
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
