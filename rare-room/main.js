/* Dawn Treader Books, concept A: The Rare Room */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Opening hours (Ann Arbor time) ---------- */
  var HOURS = { 0: [11, 18], 1: [11, 20], 2: [11, 20], 3: [11, 20], 4: [11, 20], 5: [11, 20], 6: [11, 20] };
  function ampm(h) { return h === 12 ? '12pm' : h > 12 ? (h - 12) + 'pm' : h + 'am'; }
  function detroitNow() {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day: day, mins: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
  }
  (function hours() {
    var now;
    try { now = detroitNow(); } catch (e) { return; }
    var h = HOURS[now.day], open = h[0] * 60, close = h[1] * 60, text;
    if (now.mins >= open && now.mins < close) text = 'Open now until ' + ampm(h[1]);
    else if (now.mins < open) text = 'Opens today at ' + ampm(h[0]);
    else text = 'Closed now, opens tomorrow at ' + ampm(HOURS[(now.day + 1) % 7][0]);
    $$('[data-open-status]').forEach(function (el) { el.textContent = text; });
    var row = $('[data-hours] tr[data-day="' + now.day + '"]');
    if (row) row.classList.add('is-today');
  })();

  /* ---------- Mobile menu ---------- */
  var toggle = $('.nav__toggle'), menu = $('#menu');
  function setMenu(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });

  /* ---------- Gift certificate (demo) ---------- */
  var gift = $('[data-gift]');
  if (gift) {
    gift.addEventListener('change', function () {
      var v = gift.querySelector('input:checked').value;
      $('[data-amount]', gift).textContent = '$' + v;
      $('[data-gift-note]', gift).textContent = '';
    });
    gift.addEventListener('submit', function (e) {
      e.preventDefault();
      $('[data-gift-note]', gift).textContent = 'Design preview: checkout is connected in the build phase.';
    });
  }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (hasGsap && !reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -64, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (target.matches('section')) target.setAttribute('tabindex', '-1');
    });
  });

  /* ---------- Nav: solid after the hero, tucks away while reading ---------- */
  var nav = $('[data-nav]'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    var menuOpen = toggle && toggle.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('is-hidden', !menuOpen && y > window.innerHeight * .9 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Year counter shared by both layouts ---------- */
  var yearEls = $$('[data-year]').filter(function (el) { return el.matches('.shelves__year'); });
  var shownYear = null;
  function showYear(y) {
    y = Math.round(y);
    if (y === shownYear) return;
    shownYear = y;
    yearEls.forEach(function (el) { el.textContent = y; });
  }

  var root = document.documentElement;
  if (!hasGsap) { root.classList.remove('js', 'intro-pending'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Hero: the lamp ---------- */
  var hero = $('.hero');
  var lamp = { x: .5, y: .4, tx: .5, ty: .4, auto: !finePointer, t0: performance.now(), idle: 0, visible: true };
  if (!reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      lamp.tx = (e.clientX - r.left) / r.width;
      lamp.ty = (e.clientY - r.top) / r.height;
      lamp.auto = false;
      clearTimeout(lamp.idle);
      lamp.idle = setTimeout(function () { lamp.auto = true; lamp.t0 = performance.now() - 1500; }, finePointer ? 6000 : 2500);
    });
    new IntersectionObserver(function (es) { lamp.visible = es[0].isIntersecting; }).observe(hero);
    gsap.ticker.add(function () {
      if (!lamp.visible) return;
      if (lamp.auto) {
        var t = (performance.now() - lamp.t0) / 1000;
        lamp.tx = .5 + Math.sin(t * .32) * .3;
        lamp.ty = .42 + Math.sin(t * .51 + 1) * .17;
      }
      lamp.x += (lamp.tx - lamp.x) * .07;
      lamp.y += (lamp.ty - lamp.y) * .07;
      hero.style.setProperty('--lx', (lamp.x * 100).toFixed(2) + '%');
      hero.style.setProperty('--ly', (lamp.y * 100).toFixed(2) + '%');
    });
  }

  /* Split an element's text into word spans (optionally with an inner span for masked reveals). */
  function splitWords(el, inner) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      if (inner) {
        var s = document.createElement('span');
        s.textContent = w;
        outer.appendChild(s);
      } else {
        outer.textContent = w;
      }
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return $$('.w', el);
  }

  /* ---------- Hero: split the title into words for the reveal ---------- */
  var title = $('.hero__title');
  if (!reduce) splitWords(title, true);

  /* ---------- Hero: gilt glint layer over the emblem ---------- */
  var emblemSvg = $('.hero__emblem svg');
  var glint = null;
  if (emblemSvg) {
    glint = $('.dt-draw__fill', emblemSvg).cloneNode();
    glint.setAttribute('fill', 'url(#glint)');
    glint.setAttribute('class', 'dt-glint');
    emblemSvg.appendChild(glint);
  }

  /* ---------- Hero: opening sequence ---------- */
  if (reduce) {
    gsap.set('.hero .dt-draw__fill', { opacity: 1 });
    gsap.set('.hero .dt-draw__line', { opacity: 0 });
    root.classList.remove('intro-pending');
  } else {
    var lines = $$('.hero .dt-draw__line');
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.fromTo('.hero__glow', { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'power1.inOut' }, 0)
      .fromTo('.hero__shelves', { opacity: 0 }, { opacity: .62, duration: 2.6, ease: 'power1.inOut' }, .2)
      .to(lines, { strokeDashoffset: 0, duration: 2.6, ease: 'power1.inOut', stagger: { amount: .9 } }, .3)
      .to('.hero .dt-draw__fill', { opacity: 1, duration: 1.4, ease: 'power1.inOut' }, 2.1)
      .to(lines, { opacity: 0, duration: 1.2 }, 2.6)
      .fromTo('.hero__title .w > span', { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: 'power3.out', stagger: .07 }, 1.5)
      .fromTo(['.hero__sub', '.hero__actions', '.hero__imprint'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, stagger: .14 }, 2.3)
      .fromTo('.nav', { opacity: 0 }, { opacity: 1, duration: 1 }, 2.6);
    root.classList.remove('intro-pending');
    if (glint) {
      tl.fromTo('#glint', { attr: { gradientTransform: 'translate(-1400 0)' } }, { attr: { gradientTransform: 'translate(1400 0)' }, duration: 1.8, ease: 'power2.inOut' }, 3);
      // the glint again whenever the emblem is hovered, like light moving across gold tooling
      $('.hero__emblem').addEventListener('pointerenter', function () {
        if (tl.isActive()) return;
        gsap.fromTo('#glint', { attr: { gradientTransform: 'translate(-1400 0)' } }, { attr: { gradientTransform: 'translate(1400 0)' }, duration: 1.4, ease: 'power2.inOut', overwrite: true });
      });
    }

    // drifting out of the title page as you scroll
    gsap.to('.hero__inner', {
      yPercent: -12, opacity: .2, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- Story: the paragraph inks in as you read ---------- */
  var ink = $('[data-ink]');
  if (ink && !reduce) {
    gsap.fromTo(splitWords(ink, false), { opacity: .14 }, {
      opacity: 1, ease: 'none', stagger: .06,
      scrollTrigger: { trigger: ink, start: 'top 82%', end: 'bottom 48%', scrub: .4 }
    });
  }

  /* ---------- Five centuries ---------- */
  var plates = $$('.plate');
  var years = plates.map(function (p) { return parseInt(p.dataset.year, 10); });
  var mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', function () {
    var section = $('.shelves'), rail = $('[data-rail]');
    var distance = function () { return Math.max(0, rail.scrollWidth - window.innerWidth); };
    var centers = [];
    function measure() {
      centers = plates.map(function (p) { return p.offsetLeft + $('.shelves__track').offsetLeft + p.offsetWidth / 2; });
    }
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    var railTween = gsap.to(rail, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + distance(); },
        pin: true,
        scrub: reduce ? true : .7,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          // the year follows whichever plate is passing the reading line
          var line = self.progress * distance() + window.innerWidth * .42;
          if (line <= centers[0]) return showYear(years[0]);
          for (var i = 0; i < centers.length - 1; i++) {
            if (line < centers[i + 1]) {
              var f = (line - centers[i]) / (centers[i + 1] - centers[i]);
              return showYear(years[i] + (years[i + 1] - years[i]) * f);
            }
          }
          showYear(years[years.length - 1]);
        }
      }
    });

    // plates lift off the shelf a touch as they pass the middle
    if (!reduce) {
      plates.forEach(function (p) {
        gsap.fromTo($('.plate__art', p), { y: 24, rotate: -1.2 }, {
          y: 0, rotate: 0, ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: railTween, start: 'left 95%', end: 'left 45%', scrub: true }
        });
      });
    }
    return function () { ScrollTrigger.removeEventListener('refreshInit', measure); };
  });

  mm.add('(max-width: 899px)', function () {
    plates.forEach(function (p, i) {
      ScrollTrigger.create({
        trigger: p,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: function (self) {
          if (!self.isActive) return;
          var from = { v: shownYear || years[0] };
          gsap.to(from, { v: years[i], duration: reduce ? 0 : .8, ease: 'power2.out', overwrite: true, onUpdate: function () { showYear(from.v); } });
        }
      });
    });
  });

  /* ---------- Quiet entrances for the photographs ---------- */
  if (!reduce) {
    gsap.fromTo('.week__photo img', { clipPath: 'inset(12% 12% 12% 12%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: '.week', start: 'top 85%', end: 'top 25%', scrub: .5 }
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
