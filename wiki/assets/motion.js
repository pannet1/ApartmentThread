/* Motion layer: entrances, index with preview, control feedback, one moving picture.
   Transform and opacity only. Honours prefers-reduced-motion. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { document.documentElement.classList.add('no-motion'); }

  /* ---- staggered entrances ---- */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < revealables.length; i++) revealables[i].classList.add('in');
  } else {
    var groups = new Map();
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        var el = entries[e].target;
        if (!entries[e].isIntersecting) continue;
        var parent = el.parentElement;
        var n = groups.get(parent) || 0;
        el.style.setProperty('--rd', Math.min(n, 6) * 70 + 'ms');
        groups.set(parent, n + 1);
        el.classList.add('in');
        io.unobserve(el);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var j = 0; j < revealables.length; j++) io.observe(revealables[j]);
    // anything still hidden after 2.5s is shown, so nothing is ever lost
    setTimeout(function () {
      for (var k = 0; k < revealables.length; k++) revealables[k].classList.add('in');
    }, 2500);
  }

  /* ---- signature: index with preview ---- */
  var list = document.getElementById('component-index');
  var preview = document.getElementById('index-preview');
  if (list && preview && !reduced) {
    var rows = list.querySelectorAll('.index-row');
    var frame = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
    var place = function (row) {
      var r = row.getBoundingClientRect();
      var w = 240, h = w * 5 / 4;
      var x = Math.min(window.innerWidth - w - 24, r.right - w);
      var y = Math.min(window.innerHeight - h - 24, Math.max(16, r.top + r.height / 2 - h / 2));
      frame.tx = x; frame.ty = y;
      if (!frame.raf) frame.raf = requestAnimationFrame(tick);
    };
    var tick = function () {
      frame.x += (frame.tx - frame.x) * 0.18;
      frame.y += (frame.ty - frame.y) * 0.18;
      preview.style.transform = 'translate(' + Math.round(frame.x) + 'px,' + Math.round(frame.y) + 'px)';
      if (Math.abs(frame.tx - frame.x) > 0.5 || Math.abs(frame.ty - frame.y) > 0.5) {
        frame.raf = requestAnimationFrame(tick);
      } else { frame.raf = 0; }
    };
    var show = function (row) {
      var src = row.getAttribute('data-img');
      var img = preview.querySelector('img');
      if (src) {
        if (!img) {
          preview.innerHTML = '<img alt="">';
          img = preview.querySelector('img');
        }
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      } else if (img) {
        preview.innerHTML = '<span class="idx-none">No photograph yet</span>';
      }
      frame.x = frame.tx; frame.y = frame.ty;
      place(row);
      preview.classList.add('on');
    };
    var hide = function () { preview.classList.remove('on'); };
    for (var r = 0; r < rows.length; r++) {
      rows[r].addEventListener('mouseenter', function (ev) { show(ev.currentTarget); });
      rows[r].addEventListener('focus', function (ev) { show(ev.currentTarget); });
      rows[r].addEventListener('mouseleave', hide);
      rows[r].addEventListener('blur', hide);
    }
    list.addEventListener('mouseleave', hide);
  }

  /* ---- drag row progress ---- */
  var strip = document.getElementById('moments');
  var bar = document.querySelector('#moments-progress i');
  if (strip && bar) {
    var update = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var pct = max > 4 ? (strip.scrollLeft / max) * 100 : 100;
      bar.style.width = Math.max(6, pct) + '%';
    };
    strip.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---- rolling total ---- */
  var fig = document.getElementById('total-figure');
  if (fig && !reduced && 'IntersectionObserver' in window) {
    var value = parseInt(fig.getAttribute('data-value'), 10);
    var roll = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      roll.disconnect();
      var start = performance.now(), dur = 900;
      var step = function (now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        fig.textContent = '₹' + Math.round(value * eased).toLocaleString('en-IN');
        if (t < 1) requestAnimationFrame(step);
        else fig.textContent = '₹' + value.toLocaleString('en-IN');
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    roll.observe(fig);
  }
})();
