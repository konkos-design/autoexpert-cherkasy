(function () {
  'use strict';
  var root = document.documentElement;
  var unhide = function () { root.classList.remove('js-anim'); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: solid on scroll, hide on scroll down ---------- */
  var hdr = document.querySelector('.hdr');
  var fab = document.querySelector('.fab');
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-solid', y > 30);
    if (fab) fab.classList.toggle('show', y > 420);
    if (!document.body.classList.contains('menu-open')) {
      hdr.classList.toggle('is-hidden', y > lastY && y > 400);
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mnav');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      mnav.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
      hdr.classList.remove('is-hidden');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) burger.click(); });
  }

  /* ---------- reveal on scroll ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- today in hours table ---------- */
  var d = new Date().getDay();
  document.querySelectorAll('.hours tr[data-d]').forEach(function (tr) {
    if (tr.getAttribute('data-d').split(',').indexOf(String(d)) > -1) tr.classList.add('today');
  });

  /* ---------- draggable strips (free drag, page scroll untouched) ---------- */
  document.querySelectorAll('.drag').forEach(function (el) {
    var down = false, sx = 0, sl = 0, moved = 0, vx = 0, lx = 0, raf;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; lx = e.clientX; sl = el.scrollLeft; vx = 0;
      cancelAnimationFrame(raf); el.classList.add('is-down');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      vx = e.clientX - lx; lx = e.clientX;
      el.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false; el.classList.remove('is-down');
      (function glide() { if (Math.abs(vx) < 0.5) return; el.scrollLeft -= vx; vx *= 0.92; raf = requestAnimationFrame(glide); })();
    });
    el.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ---------- service row hover preview (mouse only) ---------- */
  var peek = document.querySelector('.svc__peek');
  if (peek && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var pimg = peek.querySelector('img'), px = 0, py = 0, tx = 0, ty = 0, run = false;
    function loop() { px += (tx - px) * 0.18; py += (ty - py) * 0.18; peek.style.left = px + 'px'; peek.style.top = py + 'px'; if (run) requestAnimationFrame(loop); }
    document.querySelectorAll('.svc__row[data-img]').forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        pimg.src = row.getAttribute('data-img'); tx = px = e.clientX + 160; ty = py = e.clientY;
        peek.classList.add('on'); if (!run) { run = true; loop(); }
      });
      row.addEventListener('mousemove', function (e) { tx = e.clientX + 160; ty = e.clientY; });
      row.addEventListener('mouseleave', function () { peek.classList.remove('on'); run = false; });
    });
  }

  /* ---------- GSAP: intro + signature moments ---------- */
  if (!window.gsap) { unhide(); return; }
  gsap.registerPlugin(ScrollTrigger);
  var mm = gsap.matchMedia();
  mm.add({ all: 'all', wide: '(min-width: 901px)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
    var c = ctx.conditions;
    if (c.reduce) { unhide(); return; }

    /* home hero */
    if (document.querySelector('.hero')) {
      var carPaths = document.querySelectorAll('.hero__car .st');
      carPaths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.set('.hero h1 .ln > span', { y: 0, yPercent: 125 });
      gsap.set('.hero__cap, .hero__lead, .hero__cta', { opacity: 0, y: 20 });
      gsap.set('.hero__photo-wrap', { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set('.hero__stripe', { scaleX: 0, skewX: -35 });
      gsap.set('.hero__car', { opacity: 1 });
      gsap.set('.hero__car .fl', { opacity: 0 });
      gsap.set('.hero__tag', { opacity: 0, y: 12 });
      unhide();
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.hero__photo-wrap', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut', clearProps: 'clipPath' }, 0)
        .to('.hero__cap', { opacity: 1, y: 0, duration: .7 }, .15)
        .to('.hero h1 .ln > span', { yPercent: 0, duration: 1.05, stagger: .1 }, .2)
        .to('.hero__lead, .hero__cta', { opacity: 1, y: 0, duration: .85, stagger: .1 }, .7)
        .to('.hero__stripe', { scaleX: 1, duration: .9, ease: 'power4.out' }, .95)
        .to('.hero__car .st', { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: .04 }, 1.0)
        .to('.hero__car .fl', { opacity: 1, duration: .7 }, 2.1)
        .to('.hero__car .st', { opacity: 0, duration: .5 }, 2.4)
        .to('.hero__tag', { opacity: 1, y: 0, duration: .6 }, 1.6);
      if (c.wide) {
        gsap.to('.hero__photo img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hero__car', { xPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      }
    }

    /* inner page hero */
    if (document.querySelector('.phero')) {
      gsap.set('.phero h1 .ln > span', { y: 0, yPercent: 125 });
      gsap.set('.crumbs, .phero p.lead, .phero .hero__cta', { opacity: 0, y: 16 });
      if (document.querySelector('.phero__img')) gsap.set('.phero__img', { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set('.phero__line', { scaleX: 0, transformOrigin: 'left' });
      unhide();
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.crumbs', { opacity: 1, y: 0, duration: .6 }, 0)
        .to('.phero h1 .ln > span', { yPercent: 0, duration: 1, stagger: .1 }, .1)
        .to('.phero p.lead, .phero .hero__cta', { opacity: 1, y: 0, duration: .8, stagger: .1 }, .5)
        .to('.phero__line', { scaleX: 1, duration: 1.1, ease: 'power4.inOut' }, .3);
      if (document.querySelector('.phero__img')) tl.to('.phero__img', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut', clearProps: 'clipPath' }, 0);
    }

    /* route line draws with scroll */
    var rl = document.querySelector('.route__line path');
    if (rl && c.wide) {
      var L = rl.getTotalLength(); rl.style.strokeDasharray = L; rl.style.strokeDashoffset = L;
      var steps = gsap.utils.toArray('.step');
      gsap.to(rl, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.route', start: 'top 75%', end: 'bottom 55%', scrub: .6,
        onUpdate: function (s) { steps.forEach(function (st, i) { st.classList.toggle('on', s.progress >= i / (steps.length - .4)); }); } } });
    } else {
      gsap.utils.toArray('.step').forEach(function (st) {
        ScrollTrigger.create({ trigger: st, start: 'top 75%', onEnter: function () { st.classList.add('on'); } });
      });
    }

    /* parallax on stacked photos */
    if (c.wide) {
      gsap.utils.toArray('[data-par]').forEach(function (el) {
        gsap.fromTo(el, { yPercent: -parseFloat(el.dataset.par) }, { yPercent: parseFloat(el.dataset.par), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
  });
  setTimeout(unhide, 3000);
})();
