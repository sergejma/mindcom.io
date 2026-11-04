/* mindcom. Progressive enhancement only: without this file the page is complete and static. */
(function () {
  'use strict';

  var EASE_OUT = 'cubic-bezier(.23, 1, .32, 1)';
  var EASE_DRAWER = 'cubic-bezier(.32, .72, 0, 1)';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------ nav hairline
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  // ------------------------------------------------------------ headline
  // The sentence in the HTML is "Transforming lives through innovative solutions."
  // The word in front of "solutions" names one field after another and the matching
  // app icons stay lit. It runs once and then leaves the plain sentence.
  var morph = document.querySelector('[data-morph]');
  if (morph && !reduced) {
    var tail = document.querySelector('[data-tail]');
    var line = morph.parentNode;
    var shelf = document.querySelector('[data-shelf]');
    var items = Array.prototype.slice.call(shelf.querySelectorAll('[data-word]'));
    var first = morph.querySelector('.word');
    var current = first ? first.textContent : null;
    var timer;

    var highlight = function (word) {
      shelf.classList.toggle('is-focusing', !!word);
      items.forEach(function (item) { item.classList.toggle('is-on', item.dataset.word === word); });
    };

    var cancelAll = function (el) { el.getAnimations().forEach(function (a) { a.cancel(); }); };

    var show = function (word) {
      if (word === current) return;
      current = word;

      // Read where things are on screen right now, so an interrupted move continues from there.
      var from = tail.getBoundingClientRect().left;
      var old = morph.querySelector('.word');
      if (old) {
        var r = old.getBoundingClientRect();
        var p = line.getBoundingClientRect();
        cancelAll(old);
        old.style.cssText = 'position:absolute;left:' + (r.left - p.left) + 'px;top:' + (r.top - p.top) + 'px';
        old.setAttribute('aria-hidden', 'true');
        line.appendChild(old);
        old.animate(
          [{ opacity: 1, filter: 'blur(0)', transform: 'none' }, { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-.14em)' }],
          { duration: 260, easing: EASE_OUT, fill: 'forwards' }
        );
        // A timer and not onfinish: finish events wait for a rendered frame, which hidden tabs and crawlers never produce.
        setTimeout(function () { old.remove(); }, 280);
      }
      if (word) {
        var next = document.createElement('span');
        next.className = 'word';
        next.textContent = word;
        morph.appendChild(next);
        next.animate(
          [{ opacity: 0, filter: 'blur(8px)', transform: 'translateY(.14em)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }],
          { duration: 520, easing: EASE_OUT }
        );
      }
      cancelAll(tail);
      var dx = from - tail.getBoundingClientRect().left;
      if (dx) tail.animate([{ transform: 'translateX(' + dx + 'px)' }, { transform: 'none' }], { duration: 560, easing: EASE_DRAWER });
      highlight(word);
    };

    var sequence = ['fitness', 'learning', null];
    var step = function (i) {
      if (i >= sequence.length) return;
      timer = setTimeout(function () { show(sequence[i]); step(i + 1); }, 1700);
    };
    if (current) { highlight(current); step(0); }

    // With a mouse, the headline keeps answering to the app under the pointer.
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      items.forEach(function (item) {
        item.addEventListener('pointerenter', function () { clearTimeout(timer); show(item.dataset.word); });
      });
      shelf.addEventListener('pointerleave', function () { clearTimeout(timer); show(null); });
    }
  }

  // ------------------------------------------------------------ app visuals, once
  var risers = document.querySelectorAll('[data-rise]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    risers.forEach(function (el) { io.observe(el); });
  } else {
    risers.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ------------------------------------------------------------ sample question
  var quiz = document.querySelector('[data-quiz]');
  if (quiz) {
    var opts = Array.prototype.slice.call(quiz.querySelectorAll('[data-opt]'));
    var sheet = quiz.parentNode.querySelector('.sheet');
    var title = sheet.querySelector('[data-title]');
    var marks = opts.map(function (o) { return o.querySelector('.opt__mark').textContent; });
    var screen = quiz.parentNode;
    var last = opts[opts.length - 1];

    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (quiz.classList.contains('is-done')) return;
        var right = opt.hasAttribute('data-right');
        quiz.classList.add('is-done');
        opts.forEach(function (o) {
          o.setAttribute('aria-disabled', 'true');
          if (o.hasAttribute('data-right')) { o.classList.add('is-right'); o.querySelector('.opt__mark').textContent = '✓'; }
        });
        if (!right) { opt.classList.add('is-wrong'); opt.querySelector('.opt__mark').textContent = '✕'; }
        title.textContent = right ? 'Richtig.' : 'Nicht ganz. Richtig ist: am 20. Juni.';
        // Keep all answers above the sheet on small screens, the way a native screen scrolls out of its way.
        var over = last.getBoundingClientRect().bottom - (screen.getBoundingClientRect().bottom - sheet.offsetHeight) + 8;
        quiz.style.transform = over > 0 ? 'translateY(' + -over + 'px)' : '';
      });
    });

    sheet.querySelector('[data-again]').addEventListener('click', function () {
      quiz.classList.remove('is-done');
      quiz.style.transform = '';
      opts.forEach(function (o, i) {
        o.classList.remove('is-right', 'is-wrong');
        o.removeAttribute('aria-disabled');
        o.querySelector('.opt__mark').textContent = marks[i];
      });
      opts[0].focus({ preventScroll: true });
    });
  }

  // ------------------------------------------------------------ copy address
  var copy = document.querySelector('[data-copy]');
  if (copy) {
    var copyTimer;
    copy.addEventListener('click', function () {
      var done = function () {
        copy.classList.add('is-done');
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () { copy.classList.remove('is-done'); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(copy.dataset.copy).then(done, function () {});
    });
  }
})();
