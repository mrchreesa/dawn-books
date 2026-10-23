/* Dawn Treader Books, concept B: The Voyage */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Opening hours (Ann Arbor time) ---------- */
  var HOURS = { 0: [11, 18], 1: [11, 20], 2: [11, 20], 3: [11, 20], 4: [11, 20], 5: [11, 20], 6: [11, 20] };
  function ampm(h) { return h === 12 ? '12pm' : h > 12 ? (h - 12) + 'pm' : h + 'am'; }
  (function hours() {
    var parts;
    try {
      parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    } catch (e) { return; }
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    var mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
    var h = HOURS[day], text, open = mins >= h[0] * 60 && mins < h[1] * 60;
    if (open) text = 'Open now until ' + ampm(h[1]);
    else if (mins < h[0] * 60) text = 'Opens today at ' + ampm(h[0]);
    else text = 'Closed now, opens tomorrow at ' + ampm(HOURS[(day + 1) % 7][0]);
    $$('[data-open-status]').forEach(function (el) { el.textContent = text; });
    if (!open) root.classList.add('is-closed');
    var row = $('[data-hours] tr[data-day="' + day + '"]');
    if (row) row.classList.add('is-today');
  })();

  /* ---------- Menu ---------- */
  var lenis = null;
  var toggle = $('.nav__toggle'), menu = $('#menu');
  function setMenu(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });

  /* ---------- Gift certificate (demo) ---------- */
  var gift = $('[data-gift]');
  if (gift) {
    gift.addEventListener('change', function () {
      var v = '$' + gift.querySelector('input:checked').value;
      $('[data-amount]', gift).textContent = v;
      $('[data-amount-big]', gift).textContent = v;
      $('[data-gift-note]', gift).textContent = '';
    });
    gift.addEventListener('submit', function (e) {
      e.preventDefault();
      $('[data-gift-note]', gift).textContent = 'Design preview: checkout is connected in the build phase.';
    });
  }

  /* ---------- Book of the week deck: buttons, drag, tilt ---------- */
  var deck = $('[data-deck]');
  if (deck) {
    var prev = $('[data-deck-prev]'), next = $('[data-deck-next]');
    var step = function () { var c = deck.querySelector('.card'); return c ? c.getBoundingClientRect().width + 18 : 280; };
    var sync = function () {
      prev.disabled = deck.scrollLeft < 4;
      next.disabled = deck.scrollLeft > deck.scrollWidth - deck.clientWidth - 4;
    };
    prev.addEventListener('click', function () { deck.scrollBy({ left: -step() * 2, behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { deck.scrollBy({ left: step() * 2, behavior: reduce ? 'auto' : 'smooth' }); });
    deck.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();

    if (finePointer) {
      var drag = null;
      deck.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        drag = { x: e.clientX, left: deck.scrollLeft, moved: false };
      });
      window.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; deck.classList.add('is-dragging'); }
        if (drag.moved) deck.scrollLeft = drag.left - dx;
      });
      window.addEventListener('pointerup', function () {
        if (drag && drag.moved) {
          deck.classList.remove('is-dragging');
          // let scroll-snap settle on the nearest card
          deck.scrollBy({ left: 1, behavior: 'smooth' });
        }
        drag = null;
      });
      if (!reduce) {
        $$('.card', deck).forEach(function (card) {
          card.addEventListener('pointermove', function (e) {
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
            card.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
            card.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
          });
          card.addEventListener('pointerleave', function () {
            card.style.setProperty('--ry', '0deg');
            card.style.setProperty('--rx', '0deg');
          });
        });
      }
    }
  }

  /* ---------- Stars ---------- */
  var stars = $('[data-stars]');
  function drawStars() {
    if (!stars) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = stars.clientWidth, h = stars.clientHeight;
    stars.width = w * dpr; stars.height = h * dpr;
    var ctx = stars.getContext('2d');
    ctx.scale(dpr, dpr);
    var seed = 7;
    var rand = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var n = Math.round(w * h / 2600);
    for (var i = 0; i < n; i++) {
      var x = rand() * w, y = Math.pow(rand(), 1.4) * h, r = rand() < .08 ? 1.4 : rand() * .9 + .3;
      ctx.globalAlpha = (.35 + rand() * .65) * (1 - y / h * .6);
      ctx.fillStyle = rand() < .15 ? '#ffe2b8' : '#ffffff';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  drawStars();

  if (!hasGsap) { root.classList.remove('js', 'intro-pending'); root.classList.add('no-route'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
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
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -40, duration: 1.6 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Nav: light once we're past the sea ---------- */
  var nav = $('[data-nav]'), hero = $('.hero'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    var heroEnd = hero.offsetTop + hero.offsetHeight - 60;
    nav.classList.toggle('is-light', y > heroEnd);
    var menuOpen = toggle && toggle.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('is-hidden', !menuOpen && y > heroEnd + 200 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Hero: split the headline ---------- */
  var title = $('.hero__title');
  if (!reduce) {
    var words = title.textContent.trim().split(/\s+/);
    title.setAttribute('aria-label', words.join(' '));
    title.textContent = '';
    words.forEach(function (w, i) {
      var o = document.createElement('span'), s = document.createElement('span');
      o.className = 'w'; o.setAttribute('aria-hidden', 'true');
      s.textContent = w; o.appendChild(s); title.appendChild(o);
      if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- Hero: opening sequence (the ship sails in) ---------- */
  if (!reduce) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('.ship__sail', { x: function () { return -window.innerWidth * .55; } }, { x: 0, duration: 3.2, ease: 'power2.out' }, 0)
      .fromTo('.sun__disc', { scale: .82, opacity: .6 }, { scale: 1, opacity: 1, duration: 3, ease: 'sine.out' }, 0)
      .fromTo('.hero__title .w > span', { yPercent: 115 }, { yPercent: 0, duration: 1.2, stagger: .08 }, .5)
      .fromTo(['.hero__sub', '.hero__actions', '.hero__status'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, stagger: .12 }, 1.1)
      .fromTo('.nav', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.4);
  }
  root.classList.remove('intro-pending');

  /* ---------- Hero: scroll from night to dawn ---------- */
  var stage = $('[data-stage]');
  if (!reduce) {
    var narrow = window.matchMedia('(max-width: 700px)').matches;
    var dawn = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: .6 }
    });
    dawn.to('.sky--dawn', { opacity: 1, duration: .75 }, 0)
      .to('.stars', { opacity: .05, duration: .6 }, 0)
      .fromTo('[data-sun]', { yPercent: -12 }, { yPercent: -150, duration: 1 }, 0)
      .to('[data-glitter]', { opacity: .9, duration: .6 }, .2)
      .fromTo(stage, {
        '--w1': '#1b2457', '--w2': '#121a45', '--w3': '#0b1232', '--sea-top': '#18214f', '--sea-bot': '#070b24'
      }, {
        '--w1': '#9a7aa3', '--w2': '#54508c', '--w3': '#2a2e63', '--sea-top': '#c68790', '--sea-bot': '#1f2453', duration: .8
      }, 0)
      .fromTo('[data-ship]', { '--ship-x': narrow ? '28vw' : '50vw', '--ship-s': 1 }, { '--ship-x': narrow ? '60vw' : '70vw', '--ship-s': 1.14, duration: 1 }, 0)
      .to('.hero__copy', { yPercent: -10, duration: .3 }, .7);
  }

  /* ---------- The chart route ---------- */
  var chart = $('[data-chart]'), svg = $('[data-route]');
  var ghost = $('[data-route-ghost]'), line = $('[data-route-line]'), reveal = $('[data-route-reveal]');
  var ship = $('[data-route-ship]'), pins = $$('[data-pin]');
  var route = { samples: [], total: 0, pinY: [], ready: false };
  var shipPos = { len: 0, x: 0, y: 0 };

  function centerIn(el, box) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  }
  function catmull(pts) {
    var d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ' ' + (p1.y + (p2.y - p0.y) / 6).toFixed(1) +
        ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ' ' + (p2.y - (p3.y - p1.y) / 6).toFixed(1) +
        ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }
  function buildRoute() {
    var box = chart.getBoundingClientRect();
    var w = box.width, h = box.height;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var centers = pins.map(function (p) { return centerIn(p, box); });
    var wide = w > 860;
    var channel = pins[0].parentElement ? parseFloat(getComputedStyle(pins[0].parentElement).gridTemplateColumns.split(' ')[1]) : 100;
    var sway = wide ? Math.min(46, (channel || 100) * .3) : 7;
    var pts = [{ x: centers[0].x, y: 0 }];
    centers.forEach(function (c, i) {
      var prevPt = pts[pts.length - 1];
      var dir = i % 2 ? 1 : -1;
      pts.push({ x: c.x + sway * dir, y: prevPt.y + (c.y - prevPt.y) * .5 });
      pts.push(c);
    });
    var d = catmull(pts);
    ghost.setAttribute('d', d); line.setAttribute('d', d); reveal.setAttribute('d', d);
    var total = line.getTotalLength();
    reveal.style.strokeDasharray = total + ' ' + total;
    var n = Math.max(200, Math.round(total / 8)), samples = [];
    for (var i = 0; i <= n; i++) {
      var L = total * i / n, p = line.getPointAtLength(L);
      samples.push({ L: L, x: p.x, y: p.y });
    }
    route = { samples: samples, total: total, pinY: centers.map(function (c) { return c.y; }), ready: true };
    updateRoute(true);
  }
  function sampleAtY(y) {
    var s = route.samples;
    if (y <= s[0].y) return 0;
    for (var i = 1; i < s.length; i++) {
      if (s[i].y >= y) {
        var a = s[i - 1], b = s[i], f = (y - a.y) / ((b.y - a.y) || 1);
        return a.L + (b.L - a.L) * f;
      }
    }
    return route.total;
  }
  function pointAt(L) {
    var s = route.samples, idx = Math.min(s.length - 1, Math.max(0, Math.round(L / route.total * (s.length - 1))));
    return s[idx];
  }
  function updateRoute(jump) {
    if (!route.ready) return;
    var top = chart.getBoundingClientRect().top;
    var target = sampleAtY(window.innerHeight * .58 - top);
    shipPos.len = jump ? target : shipPos.len + (target - shipPos.len) * .14;
    var L = shipPos.len;
    reveal.style.strokeDashoffset = (route.total - L).toFixed(1);
    var p = pointAt(L), ahead = pointAt(Math.min(route.total, L + 30));
    ship.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
    if (Math.abs(ahead.x - p.x) > 1.5) ship.classList.toggle('is-west', ahead.x < p.x);
    pins.forEach(function (pin, i) { pin.classList.toggle('is-reached', route.pinY[i] <= p.y + 2); });
  }

  if (reduce) {
    root.classList.add('no-route');
  } else {
    var rebuild = function () { requestAnimationFrame(buildRoute); };
    if (window.ResizeObserver) new ResizeObserver(rebuild).observe(chart);
    window.addEventListener('load', rebuild);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
    buildRoute();
    gsap.ticker.add(function () { updateRoute(false); });
  }

  /* ---------- The compass rose turns as you travel ---------- */
  if (!reduce) {
    gsap.to('[data-rose]', {
      rotate: 200, ease: 'none',
      scrollTrigger: { trigger: chart, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); drawStars(); });
  window.addEventListener('resize', function () { clearTimeout(drawStars.t); drawStars.t = setTimeout(drawStars, 200); });
})();
