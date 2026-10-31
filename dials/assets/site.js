/* Dials website. Progressive enhancement only: without this file every page is complete and static. */
(function () {
  'use strict';

  // App Store link. Leave empty while the app is not live ("Coming soon to the App Store").
  // When the app is live, paste its URL here, for example 'https://apps.apple.com/app/id1234567890'.
  var APP_STORE_URL = '';

  var doc = document.documentElement;
  window.dialsReady = true;
  var reduce = doc.classList.contains('rm');
  var de = (doc.lang || 'en').slice(0, 2) === 'de';
  var DEC = de ? ',' : '.', GRP = de ? '.' : ',';

  // ------------------------------------------------------------ App Store state
  if (APP_STORE_URL) {
    doc.classList.add('is-live');
    document.querySelectorAll('[data-appstore]').forEach(function (a) {
      a.href = APP_STORE_URL;
      if (a.dataset.live) a.textContent = a.dataset.live;
    });
  }

  // The inline head script drops the 'js' class if this file arrives late (slow network).
  // The page has then rendered in its static form; keep it that way.
  if (!doc.classList.contains('js')) return;

  // ------------------------------------------------------------ helpers
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function fmt(v, f) {
    if (f === 'd1') return v.toFixed(1).replace('.', DEC);
    var n = Math.round(v);
    if (f === 'hm') return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
    if (f === 'grp') return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, GRP);
    return String(n);
  }

  // A group holds everything in one render that animates: counters, arcs, markers, stage bars.
  function group(root) {
    var q = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    return {
      nums: q('[data-v]').map(function (el) { return { el: el, v: +el.dataset.v, f: el.dataset.f, last: '' }; }),
      arcs: q('[data-arc]'),
      rots: q('[data-rot]').map(function (el) { return { el: el, r: +el.dataset.rot, cx: el.dataset.cx, cy: el.dataset.cy }; }),
      clips: q('[data-clipw]').map(function (el) { return { el: el, w: +el.dataset.clipw }; }),
    };
  }
  // t can be a number or a function of the element index (for the 70 ms stagger)
  function apply(g, t) {
    var tf = typeof t === 'function' ? t : function () { return t; };
    g.nums.forEach(function (n, i) {
      var s = fmt(n.v * tf(i), n.f);
      if (s !== n.last) { n.el.textContent = s; n.last = s; }
    });
    g.arcs.forEach(function (a, i) {
      a.style.strokeDasharray = '1 2';
      a.style.strokeDashoffset = String(1 - tf(i));
    });
    g.rots.forEach(function (m, i) {
      m.el.setAttribute('transform', 'rotate(' + (-(1 - tf(i)) * m.r).toFixed(2) + ' ' + m.cx + ' ' + m.cy + ')');
    });
    g.clips.forEach(function (c, i) { c.el.setAttribute('width', (c.w * tf(i)).toFixed(2)); });
  }
  function play(g, delay) {
    var DUR = 1500, STAG = 70, t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now + (delay || 0);
      var el = now - t0, done = true;
      apply(g, function (i) {
        var t = clamp((el - i * STAG) / DUR);
        if (t < 1) done = false;
        return easeOut(t);
      });
      if (!done) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var hasIO = 'IntersectionObserver' in window;

  // ------------------------------------------------------------ reveal on scroll
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!reduce && hasIO) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ------------------------------------------------------------ rings fill, numbers count up
  if (!reduce && hasIO) {
    var aio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        aio.unobserve(e.target);
        play(e.target._g, +(e.target.dataset.delay || 0));
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.3 });
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      el._g = group(el);
      apply(el._g, 0);
      aio.observe(el);
    });
  }

  // ------------------------------------------------------------ scroll scenes
  var scenes = [];
  var parallax = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  var fly = document.querySelector('[data-scrolly="fly"]');
  if (fly && !reduce) {
    var WIN = { overview: [0.04, 0.38], hrv: [0.30, 0.62], rhr: [0.38, 0.70], steps: [0.46, 0.78] };
    var flyers = Array.prototype.slice.call(fly.querySelectorAll('.flyer')).map(function (el) {
      var d = el.dataset;
      return { el: el, id: d.fly, x: +d.x, y: +d.y, s: +d.s, w: +d.w, h: +d.h, dx: +d.dx, dy: +d.dy, k: +d.k, g: group(el), slot: fly.querySelector('[data-slot="' + d.fly + '"]') };
    });
    var steps = fly.querySelectorAll('.fly-steps li');
    var note = fly.querySelector('.fly-note');
    scenes.push({ el: fly, update: function (p) {
      flyers.forEach(function (f) {
        var w = WIN[f.id], t = clamp((p - w[0]) / (w[1] - w[0])), e = easeInOut(t);
        var S = f.s * (f.k + (1 - f.k) * e);
        var cx = f.x + (f.w * f.s) / 2, cy = f.y + (f.h * f.s) / 2;
        var tx = cx - (f.w * S) / 2 + f.dx * (1 - e), ty = cy - (f.h * S) / 2 + f.dy * (1 - e);
        f.el.setAttribute('transform', 'translate(' + tx.toFixed(2) + ' ' + ty.toFixed(2) + ') scale(' + S.toFixed(4) + ')');
        f.el.style.opacity = String(clamp(t * 3));
        apply(f.g, clamp((t - 0.35) / 0.65));
        if (f.slot) f.slot.style.opacity = t >= 1 ? '0' : '1';
      });
      var i = p < 0.36 ? 0 : 1;
      steps.forEach(function (li, k) { li.classList.toggle('on', k === i); });
      if (note) note.classList.toggle('on', p > 0.8);
    } });
  }

  var modes = document.querySelector('[data-scrolly="modes"]');
  if (modes && !reduce) {
    var svg = modes.querySelector('[data-mode-fig="0"] svg');
    var tabs = modes.querySelectorAll('.mode-tabs li');
    var names = ['m-full', 'm-tint', 'm-night'];
    var cur = -1;
    scenes.push({ el: modes, update: function (p) {
      var q = clamp((p - 0.08) / 0.84);
      var i = q < 1 / 3 ? 0 : q < 2 / 3 ? 1 : 2;
      if (i !== cur) {
        cur = i;
        names.forEach(function (n, k) { svg.classList.toggle(n, k === i); });
        tabs.forEach(function (li, k) { li.classList.toggle('on', k === i); });
      }
      tabs.forEach(function (li, k) { li.style.setProperty('--f', (clamp(q * 3 - k) * 100).toFixed(1) + '%'); });
    } });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    scenes.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > 2 * vh) return;
      s.update(clamp(-r.top / Math.max(1, r.height - vh)));
    });
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = r.top + r.height / 2 - vh / 2 - (el._py || 0);
      var y = d * +el.dataset.parallax;
      el._py = y;
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  if (scenes.length || parallax.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // ------------------------------------------------------------ faces gallery
  var gal = document.querySelector('.gallery');
  var ctrl = document.querySelector('.g-ctrl');
  if (gal && ctrl) {
    var btns = ctrl.querySelectorAll('.g-btn');
    var step = function () {
      var items = gal.querySelectorAll('.g-item');
      return items.length > 1 ? items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left : gal.clientWidth;
    };
    var sync = function () {
      var max = gal.scrollWidth - gal.clientWidth;
      ctrl.hidden = max < 8;
      btns[0].disabled = gal.scrollLeft < 8;
      btns[1].disabled = gal.scrollLeft > max - 8;
    };
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        gal.scrollBy({ left: +b.dataset.dir * step(), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    gal.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }
})();
