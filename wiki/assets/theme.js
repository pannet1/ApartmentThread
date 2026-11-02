(function () {
  var KEY = 'ps-theme';
  var btn = document.getElementById('theme-toggle');

  // Ground-truth theme resolution
  function getSavedTheme() {
    // 1. If <head> script already resolved and set data-theme on <html>, respect it!
    var domAttr = document.documentElement.getAttribute('data-theme');
    if (domAttr === 'dark' || domAttr === 'light') return domAttr;

    // 2. URL search or hash (?theme=dark or #theme=dark)
    try {
      var m = (window.location.search + window.location.hash).match(/theme=(dark|light)/);
      if (m && m[1]) return m[1];
    } catch (e) {}

    // 3. window.name (Persists across page loads in same tab/window, even file://)
    try {
      var wn = window.name || '';
      if (wn === 'dark' || wn === 'light') return wn;
      if (wn.indexOf('dark') !== -1) return 'dark';
      if (wn.indexOf('light') !== -1) return 'light';
    } catch (e) {}

    // 4. localStorage (Safe guard against SecurityError)
    try {
      var ls = localStorage.getItem(KEY);
      if (ls === 'dark' || ls === 'light') return ls;
    } catch (e) {}

    // 5. sessionStorage
    try {
      var ss = sessionStorage.getItem(KEY);
      if (ss === 'dark' || ss === 'light') return ss;
    } catch (e) {}

    // 6. document.cookie
    try {
      if (document.cookie) {
        var cm = document.cookie.match(/(?:^|;\s*)ps-theme=(dark|light)/);
        if (cm && cm[1]) return cm[1];
      }
    } catch (e) {}

    // 7. System media preference fallback
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }

  // Persist theme to all available storage layers
  function saveTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') theme = 'light';

    // 1. DOM attribute
    document.documentElement.setAttribute('data-theme', theme);

    // 2. window.name (Bulletproof for tab navigation, no SecurityError risk)
    try {
      window.name = theme;
    } catch (e) {}

    // 3. Update current URL parameter without page reload
    try {
      if (window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('theme', theme);
        window.history.replaceState(null, '', url.toString());
      }
    } catch (e) {}

    // 4. localStorage
    try { localStorage.setItem(KEY, theme); } catch (e) {}

    // 5. sessionStorage
    try { sessionStorage.setItem(KEY, theme); } catch (e) {}

    // 6. document.cookie
    try {
      document.cookie = 'ps-theme=' + theme + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (e) {}

    // 7. Sync all internal navigation links on the page
    syncInternalLinks(theme);

    // 8. BroadcastChannel for instant cross-tab sync
    try {
      if (window.BroadcastChannel) {
        var bc = new BroadcastChannel('ps-theme-channel');
        bc.postMessage({ theme: theme });
        bc.close();
      }
    } catch (e) {}
  }

  // Rewrite all relative links to carry ?theme= to guarantee cross-page persistence
  function syncInternalLinks(theme) {
    try {
      var links = document.querySelectorAll('a[href]');
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
          continue;
        }
        var urlParts = href.split('#');
        var pathPart = urlParts[0].split('?')[0];
        var hashPart = urlParts[1] ? '#' + urlParts[1] : '';

        if (pathPart.endsWith('.html') || pathPart === '' || !pathPart.includes('.')) {
          var targetBase = pathPart || window.location.pathname.split('/').pop() || 'index.html';
          links[i].setAttribute('href', targetBase + '?theme=' + theme + hashPart);
        }
      }
    } catch (e) {}
  }

  function updateIcon(theme) {
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
      btn.setAttribute('title', 'Switch to light mode');
    } else {
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      btn.setAttribute('title', 'Switch to dark mode');
    }
  }

  // Initialize theme on load
  var current = getSavedTheme();
  saveTheme(current);
  updateIcon(current);

  // Toggle button click handler
  if (btn) {
    btn.addEventListener('click', function () {
      var active = document.documentElement.getAttribute('data-theme') || current;
      var next = (active === 'dark') ? 'light' : 'dark';
      saveTheme(next);
      updateIcon(next);
    });
  }

  // Click delegation to ensure any dynamically clicked link carries the active theme
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
      return;
    }
    var active = document.documentElement.getAttribute('data-theme') || 'light';
    var urlParts = href.split('#');
    var pathPart = urlParts[0].split('?')[0];
    var hashPart = urlParts[1] ? '#' + urlParts[1] : '';
    if (pathPart.endsWith('.html') || pathPart === '' || !pathPart.includes('.')) {
      var targetBase = pathPart || window.location.pathname.split('/').pop() || 'index.html';
      a.setAttribute('href', targetBase + '?theme=' + active + hashPart);
    }
  }, true);

  // Cross-tab synchronization via BroadcastChannel
  try {
    if (window.BroadcastChannel) {
      var rxBc = new BroadcastChannel('ps-theme-channel');
      rxBc.onmessage = function (ev) {
        if (ev.data && (ev.data.theme === 'dark' || ev.data.theme === 'light')) {
          saveTheme(ev.data.theme);
          updateIcon(ev.data.theme);
        }
      };
    }
  } catch (e) {}

  // Cross-tab synchronization via StorageEvent
  window.addEventListener('storage', function (ev) {
    if (ev.key === KEY && (ev.newValue === 'dark' || ev.newValue === 'light')) {
      saveTheme(ev.newValue);
      updateIcon(ev.newValue);
    }
  });

  // Reading progress bar
  var progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = scrolled + '%';
    }, { passive: true });
  }

  // Sidebar navigation state management
  var nav = document.querySelector('.nav-toggle');
  if (nav) {
    var isDesktop = window.matchMedia('(min-width: 901px)').matches;
    var savedNavState = null;
    try {
      savedNavState = sessionStorage.getItem('ps-nav-open');
    } catch (e) {}

    if (isDesktop) {
      // Desktop: Keep navigation open permanently
      nav.setAttribute('open', '');
    } else if (savedNavState !== null) {
      // Mobile / narrow: Respect user's explicit open/close choice
      if (savedNavState === 'true') {
        nav.setAttribute('open', '');
      } else {
        nav.removeAttribute('open');
      }
    } else {
      // First visit on very small phone screens (<= 640px) starts collapsed
      if (window.matchMedia('(max-width: 640px)').matches) {
        nav.removeAttribute('open');
      } else {
        nav.setAttribute('open', '');
      }
    }

    // Persist user's explicit open/collapse preference across page navigations
    nav.addEventListener('toggle', function () {
      try {
        sessionStorage.setItem('ps-nav-open', nav.open ? 'true' : 'false');
      } catch (e) {}
    });

    // Ensure desktop view stays open on window resize
    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 901px)').matches) {
        nav.setAttribute('open', '');
      }
    });
  }
})();