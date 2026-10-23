/*
  Mounts the traced Dawn Treader marks into any element with data-shape.
  Shapes are registered by wordmark.js / emblem.js / ship.js (window.DT_SHAPES).

    <span data-shape="wordmark"></span>        stacked DAWN / TREADER / BOOKS
    <span data-shape="wordmark-line"></span>   one-line lockup for nav bars
    <span data-shape="ship"></span>            filled ship
    <span data-shape="emblem-draw"></span>     ship in its oval, with a stroke layer for draw-on animation

  Everything is drawn in currentColor unless a gradient id is given with data-fill="url(#id)".
*/
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var S = window.DT_SHAPES || {};

  function svg(w, h, cls) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (cls) s.setAttribute('class', cls);
    return s;
  }

  function path(d, attrs) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    for (var k in attrs) p.setAttribute(k, attrs[k]);
    return p;
  }

  var build = {
    wordmark: function (el) {
      var w = S.wordmark, s = svg(w.w, w.h, 'dt-wordmark');
      ['dawn', 'treader', 'books'].forEach(function (k) {
        s.appendChild(path(w.lines[k].d, { fill: el.dataset.fill || 'currentColor', 'class': 'dt-wordmark__' + k }));
      });
      return s;
    },

    'wordmark-line': function (el) {
      var w = S.wordmark, gap = 46, x = 0, h = 0, groups = [];
      ['dawn', 'treader', 'books'].forEach(function (k) {
        var b = w.lines[k].box;
        groups.push({ k: k, tx: x - b[0], ty: -b[1] });
        x += (b[2] - b[0]) + gap;
        h = Math.max(h, b[3] - b[1]);
      });
      var s = svg(Math.ceil(x - gap), Math.ceil(h), 'dt-wordmark-line');
      groups.forEach(function (g) {
        var p = path(w.lines[g.k].d, { fill: el.dataset.fill || 'currentColor' });
        p.setAttribute('transform', 'translate(' + g.tx + ' ' + g.ty + ')');
        s.appendChild(p);
      });
      return s;
    },

    ship: function (el) {
      var sh = S.ship, s = svg(sh.w, sh.h, 'dt-ship');
      s.appendChild(path(sh.subs.join(''), { fill: el.dataset.fill || 'currentColor' }));
      return s;
    },

    emblem: function (el) {
      var e = S.emblem, s = svg(e.w, e.h, 'dt-emblem');
      s.appendChild(path(e.subs.join(''), { fill: el.dataset.fill || 'currentColor' }));
      return s;
    },

    'emblem-draw': function (el) {
      var e = S[el.dataset.source || 'emblem'], s = svg(e.w, e.h, 'dt-draw');
      var fill = path(e.subs.join(''), { fill: el.dataset.fill || 'currentColor', 'class': 'dt-draw__fill' });
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'dt-draw__lines');
      g.setAttribute('fill', 'none');
      e.lines.forEach(function (i) {
        g.appendChild(path(e.subs[i], { pathLength: '1', 'class': 'dt-draw__line' }));
      });
      s.appendChild(fill);
      s.appendChild(g);
      return s;
    }
  };

  function mount(root) {
    (root || document).querySelectorAll('[data-shape]:not([data-mounted])').forEach(function (el) {
      var fn = build[el.dataset.shape];
      if (!fn) return;
      el.appendChild(fn(el));
      el.setAttribute('data-mounted', '');
    });
  }

  window.DTBrand = { mount: mount };
  mount();
})();
