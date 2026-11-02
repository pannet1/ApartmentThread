/**
 * Apartment Thread — State Awareness Engine
 * Single source of truth for Project Verification Items, Inventory, and Stage Milestones.
 * Automatically synchronizes sidebar counts, section subtitles, and table states across all pages.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'apartment_thread_state_v2';

  var DEFAULT_STATE = {
    project: "Apartment Thread",
    version: "2.0",
    updated_at: "2026-11-02T03:00:00+05:30",
    stages: {
      stage1: { name: "Server Setup", badge: "SRV", status: "complete" },
      stage2: { name: "Thread Border Router", badge: "BR", status: "complete" },
      stage3: { name: "Sensor Bench Build", badge: "PS/DS", status: "in_progress" },
      stage4: { name: "Switch Plates", badge: "SW", status: "pending" },
      stage5: { name: "Mounting & Tuning", badge: "Commission", status: "pending" }
    },
    inventory: [
      { id: "INV-01", name: "ESP32-S3 DevKit-N16R8", status: "Pending", cost_inr: 599 },
      { id: "INV-02", name: "W5500 SPI Ethernet", status: "Pending", cost_inr: 309 },
      { id: "INV-03", name: "400 Points Half Breadboard", status: "Pending", cost_inr: 30 },
      { id: "INV-04", name: "Tactile Push Button Pack", status: "Pending", cost_inr: 17 },
      { id: "INV-05", name: "220 ohm Resistor Pack", status: "Pending", cost_inr: 39 },
      { id: "INV-06", name: "Jumper Wires M2M/M2F/F2F", status: "Pending", cost_inr: 106 }
    ],
    open_items: [
      {
        id: "O-07",
        section: "thread",
        title: "Border router stack deployment & online state",
        doubt: "Factory esp_ot_rcp verified on ESP32-H2 over UART2 (/dev/ttyS2, 460,800 baud). otbr container running with network state leader and active dataset generated.",
        evidence: "Commissioning a test Matter-over-Thread device into Home Assistant closes this item permanently.",
        blocks: "Any sensor reporting",
        blocks_purchase: false,
        status: "proven",
        status_label: "PROVEN",
        stage: 2
      },
      {
        id: "O-08",
        section: "thread",
        title: "Thread operational dataset & HA adoption",
        doubt: "Thread operational dataset & HA adoption. Home Assistant successfully adopted ApartmentThread as the Preferred Network via OpenThread Border Router integration (REST endpoint http://127.0.0.1:8081). Dataset persisted in HA storage.",
        evidence: "Adopted in Home Assistant — closed on live hardware.",
        blocks: "—",
        blocks_purchase: false,
        status: "closed",
        status_label: "CLOSED",
        stage: 2
      },
      {
        id: "O-09",
        section: "thread",
        title: "Concurrent Server & Border Router load stability",
        doubt: "Radxa Zero 3E running Home Assistant and border-router service simultaneously. Baseline memory proven: Debian 13 Minimal + HA Container uses ~564 MiB total, leaving ~460 MiB on 1 GB (~1.4 GiB on 2 GB). Host/container USB serial contention untested.",
        evidence: "24 h load, memory and USB serial log with both services and ESP32-H2 active.",
        blocks: "Long-term stability",
        blocks_purchase: false,
        status: "in_verification",
        status_label: "IN VERIFICATION",
        stage: 1
      },
      {
        id: "O-10",
        section: "devices",
        title: "Tinxy 4+1 local ESP control path",
        doubt: "Espressif ESP8266 microcontroller with native ESPHome UART firmware, Tasmota, or Tinxy Local API. Verified 100% offline control with no vendor cloud or developer tokens.",
        evidence: "Each relay and fan node toggles from HA with the WAN cable out (<50ms latency), state matching the physical contact.",
        blocks: "BLOCKS PURCHASE switch plates",
        blocks_purchase: true,
        status: "open",
        status_label: "OPEN",
        stage: 4
      },
      {
        id: "O-11",
        section: "devices",
        title: "Neutral at each room's switchboard",
        doubt: "Neutral at each room's switchboard — required for in-wall smart switch operation.",
        evidence: "Electrician's confirmation at each room box (Hall, Study, Bathroom).",
        blocks: "BLOCKS PURCHASE switch plates",
        blocks_purchase: true,
        status: "open",
        status_label: "OPEN",
        stage: 4
      },
      {
        id: "O-12",
        section: "devices",
        title: "DIY Matter-over-Thread door sensor verification",
        doubt: "Option 1 (XIAO ESP32-C6 + MC-38 reed switch). Verify sub-80ms response over Thread to prevent stepping into darkness, and map entity state (off = closed, on = open).",
        evidence: "Entity flips instantaneously (<80ms) on physical open/close in Home Assistant.",
        blocks: "Bathroom pattern",
        blocks_purchase: false,
        status: "open",
        status_label: "OPEN",
        stage: 3
      },
      {
        id: "O-13",
        section: "devices",
        title: "Mains isolation and bathroom moisture protection",
        doubt: "Confirm door sensor operates 100% isolated from 230V mains (never connect reed switch to Tinxy switchboard). Mount sensor body on exterior door jamb away from shower spray.",
        evidence: "Sensor installed on exterior frame with safe low-voltage / wireless isolation.",
        blocks: "Bathroom pattern",
        blocks_purchase: false,
        status: "open",
        status_label: "OPEN",
        stage: 3
      },
      {
        id: "O-14",
        section: "behaviour",
        title: "Live entity ID verification in HA",
        doubt: "Every entity ID in the register is a placeholder until HA creates the devices.",
        evidence: "Real entity IDs pasted into the automations, verified to change on physical action.",
        blocks: "Enabling rules",
        blocks_purchase: false,
        status: "open",
        status_label: "OPEN",
        stage: 5
      },
      {
        id: "O-15",
        section: "behaviour",
        title: "Supplier pricing & cart verification",
        doubt: "Hardware pricing verified on Indian suppliers; in-cart inventory checks needed prior to checkout.",
        evidence: "Cart showing current prices and stock at robu.in and robocraze.com.",
        blocks: "Procurement",
        blocks_purchase: false,
        status: "open",
        status_label: "OPEN",
        stage: 1
      },
      {
        id: "O-16",
        section: "behaviour",
        title: "Enclosure material RF shift verification",
        doubt: "Enclosure material and mounting shift RF behaviour; distance gates tuned on the bench may not hold on the wall.",
        evidence: "Re-run the 10-minute field test after the enclosure is fitted.",
        blocks: "Final placement",
        blocks_purchase: false,
        status: "open",
        status_label: "OPEN",
        stage: 5
      },
      {
        id: "O-17",
        section: "behaviour",
        title: "Hall timer clock persistence on WAN offline restart",
        doubt: "The hall timer rule depends on the clock. Correct time after a restart with the WAN down is untested.",
        evidence: "Test H-05 with the WAN disconnected.",
        blocks: "Hall pattern",
        blocks_purchase: false,
        status: "open",
        status_label: "OPEN",
        stage: 1
      },
      {
        id: "O-18",
        section: "behaviour",
        title: "Mechanical manual switch override proof",
        doubt: "Manual override is asserted, not demonstrated — including whether automation fights a hand press.",
        evidence: "Every load operated from its wall switch with Home Assistant stopped.",
        blocks: "Enabling rules",
        blocks_purchase: false,
        status: "open",
        status_label: "OPEN",
        stage: 4
      }
    ]
  };

  // Safe Storage Access (Local Storage + window.name fallback for file:// URLs)
  function loadPersistedState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    try {
      if (window.name && window.name.indexOf('APT_STATE:') === 0) {
        return JSON.parse(window.name.substring(10));
      }
    } catch (e) {}

    return null;
  }

  function savePersistedState(state) {
    var serialized = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {}

    try {
      window.name = 'APT_STATE:' + serialized;
    } catch (e) {}
  }

  var activeState = (function () {
    var saved = loadPersistedState();
    if (!saved || !saved.open_items) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    // Merge saved status into current structure
    var merged = JSON.parse(JSON.stringify(DEFAULT_STATE));
    var savedMap = {};
    saved.open_items.forEach(function (it) { savedMap[it.id] = it; });
    merged.open_items.forEach(function (it) {
      if (savedMap[it.id]) {
        it.status = savedMap[it.id].status;
        it.status_label = savedMap[it.id].status_label;
      }
    });
    if (saved.inventory) merged.inventory = saved.inventory;
    return merged;
  })();

  function computeStats() {
    var items = activeState.open_items;
    var total = items.length;
    var closed = 0;
    var proven = 0;
    var in_verification = 0;
    var open = 0;
    var blocks_purchase = 0;

    var sections = {
      thread: { total: 0, closed: 0, proven: 0, in_verification: 0, open: 0, blocks_purchase: 0 },
      devices: { total: 0, closed: 0, proven: 0, in_verification: 0, open: 0, blocks_purchase: 0 },
      behaviour: { total: 0, closed: 0, proven: 0, in_verification: 0, open: 0, blocks_purchase: 0 }
    };

    items.forEach(function (it) {
      var s = it.status;
      if (s === 'closed') closed++;
      else if (s === 'proven') proven++;
      else if (s === 'in_verification') in_verification++;
      else open++;

      if (it.blocks_purchase && (s === 'open' || s === 'in_verification')) {
        blocks_purchase++;
      }

      var sec = sections[it.section];
      if (sec) {
        sec.total++;
        if (s === 'closed') sec.closed++;
        else if (s === 'proven') sec.proven++;
        else if (s === 'in_verification') sec.in_verification++;
        else sec.open++;
        if (it.blocks_purchase && (s === 'open' || s === 'in_verification')) {
          sec.blocks_purchase++;
        }
      }
    });

    var resolved = closed + proven;
    var percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

    var invPending = 0;
    if (activeState.inventory) {
      activeState.inventory.forEach(function (it) {
        if (it.status === 'Pending') invPending++;
      });
    }

    return {
      total: total,
      closed: closed,
      proven: proven,
      in_verification: in_verification,
      open: open,
      resolved: resolved,
      percentage: percentage,
      blocks_purchase: blocks_purchase,
      inventory_pending: invPending,
      sections: sections
    };
  }

  // Update Sidebar Across All Pages
  function updateSidebarBadges() {
    var stats = computeStats();

    // 1. Open Items sidebar link badge
    var openLinks = document.querySelectorAll('a[href="open.html"], a[href$="/open.html"], a[href*="open.html"]');
    openLinks.forEach(function (link) {
      var badge = link.querySelector('.badge');
      if (badge) {
        if (stats.open > 0) {
          badge.textContent = stats.open + ' open';
          badge.className = 'badge badge-warn';
        } else {
          badge.textContent = 'All verified';
          badge.className = 'badge badge-ok';
        }
      }
    });

    // 2. Inventory sidebar link badge
    var invLinks = document.querySelectorAll('a[href="inventory.html"], a[href$="/inventory.html"], a[href*="inventory.html"]');
    invLinks.forEach(function (link) {
      var badge = link.querySelector('.badge');
      if (badge && stats.inventory_pending !== undefined) {
        badge.textContent = stats.inventory_pending + ' pending';
        badge.className = 'badge badge-accent';
      }
    });
  }

  // Next status cycle: open -> in_verification -> closed -> open
  function cycleStatus(current) {
    if (current === 'open') return { status: 'in_verification', status_label: 'IN VERIFICATION' };
    if (current === 'in_verification' || current === 'proven') return { status: 'closed', status_label: 'CLOSED' };
    return { status: 'open', status_label: 'OPEN' };
  }

  function getBadgeClass(status) {
    if (status === 'closed' || status === 'proven') return 'badge-ok';
    if (status === 'in_verification') return 'badge-accent';
    return 'badge-warn';
  }

  // Section Subtitle Formatter
  function formatSectionSubtitle(sec) {
    var parts = [];
    if (sec.closed > 0) parts.push(sec.closed + ' closed');
    if (sec.proven > 0) parts.push(sec.proven + ' proven');
    if (sec.in_verification > 0) parts.push(sec.in_verification + ' in verification');
    if (sec.open > 0) parts.push(sec.open + ' open' + (sec.blocks_purchase > 0 ? ' (' + sec.blocks_purchase + ' blocks purchase)' : ''));
    if (parts.length === 0) return 'All verified';
    return parts.join(' &middot; ');
  }

  // Open Items Page Hydration
  function hydrateOpenItemsPage() {
    var mainDoc = document.querySelector('.doc');
    if (!mainDoc || !window.location.pathname.match(/open\.html/)) return;

    var stats = computeStats();

    // 1. Update Lede Paragraph
    var lede = document.querySelector('.lede');
    if (lede) {
      lede.innerHTML = 'Engineering verification gates tracking claims to hard physical proof. ' +
        'Currently <strong>' + stats.open + ' open</strong> (' + stats.blocks_purchase + ' blocking purchase), ' +
        '<strong>' + stats.in_verification + ' in verification</strong>, and ' +
        '<strong>' + stats.resolved + ' resolved</strong> out of ' + stats.total + ' total project gates.';
    }

    // 2. Insert or update Metrics Dashboard
    var existingDashboard = document.getElementById('state-dashboard');
    if (!existingDashboard) {
      existingDashboard = document.createElement('div');
      existingDashboard.id = 'state-dashboard';
      existingDashboard.className = 'state-dashboard';

      var infoBox = document.querySelector('.box.info');
      if (infoBox && infoBox.parentNode) {
        infoBox.parentNode.insertBefore(existingDashboard, infoBox.nextSibling);
      }
    }

    existingDashboard.innerHTML =
      '<div class="state-metrics">' +
        '<div class="state-metric"><span class="state-metric-val">' + stats.total + '</span><span class="state-metric-lbl">Total Gates</span></div>' +
        '<div class="state-metric"><span class="state-metric-val" style="color:var(--ok);">' + stats.resolved + '</span><span class="state-metric-lbl">Resolved / Proven</span></div>' +
        '<div class="state-metric"><span class="state-metric-val" style="color:var(--accent);">' + stats.in_verification + '</span><span class="state-metric-lbl">In Verification</span></div>' +
        '<div class="state-metric"><span class="state-metric-val" style="color:var(--danger);">' + stats.open + '</span><span class="state-metric-lbl">Open Items</span></div>' +
        '<div class="state-metric"><span class="state-metric-val" style="color:#ef4444;">' + stats.blocks_purchase + '</span><span class="state-metric-lbl">Blocks Purchase</span></div>' +
      '</div>' +
      '<div class="state-progress-wrap">' +
        '<div class="state-progress-meta"><span>Gate Resolution Progress</span><span>' + stats.resolved + ' of ' + stats.total + ' (' + stats.percentage + '%)</span></div>' +
        '<div class="state-progress-bar"><div class="state-progress-fill" style="width:' + stats.percentage + '%;"></div></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;margin-top:0.25rem;">' +
        '<div class="state-filters" id="state-filters">' +
          '<button class="filter-btn active" data-filter="all">All (' + stats.total + ')</button>' +
          '<button class="filter-btn" data-filter="open">Open (' + stats.open + ')</button>' +
          '<button class="filter-btn" data-filter="in_verification">In Verification (' + stats.in_verification + ')</button>' +
          '<button class="filter-btn" data-filter="resolved">Resolved (' + stats.resolved + ')</button>' +
          '<button class="filter-btn" data-filter="blocks">Blocks Purchase (' + stats.blocks_purchase + ')</button>' +
        '</div>' +
        '<div class="state-toolbar">' +
          '<button class="btn-quiet" id="btn-reset-state" style="font-size:0.8rem;padding:0.25rem 0.6rem;">Reset to Default</button>' +
          '<button class="btn-quiet" id="btn-export-state" style="font-size:0.8rem;padding:0.25rem 0.6rem;">Copy State JSON</button>' +
        '</div>' +
      '</div>';

    // 3. Update Section Headers
    var secHeaders = {
      thread: document.querySelector('#thread'),
      devices: document.querySelector('#devices'),
      behaviour: document.querySelector('#behaviour')
    };

    var secNames = {
      thread: 'SRV-1 & BR-1 &mdash; Server and Thread router',
      devices: 'SW-1 &mdash; Tinxy switch plates and bathroom input',
      behaviour: 'Cross-cutting &mdash; behaviour and data'
    };

    Object.keys(secHeaders).forEach(function (secKey) {
      var h2 = secHeaders[secKey];
      if (!h2) return;
      var secStats = stats.sections[secKey];
      if (!secStats) return;

      var subtitleHtml = formatSectionSubtitle(secStats);
      var badgeClass = (secStats.open === 0 && secStats.in_verification === 0) ? 'badge-ok' : 'badge-warn';
      h2.innerHTML = secNames[secKey] + ' <span class="badge ' + badgeClass + '" id="' + secKey + '-status-badge">' + subtitleHtml + '</span>';
    });

    // 4. Update Table Rows & Interactive Badges
    activeState.open_items.forEach(function (item) {
      var rawId = item.id.toLowerCase().replace(/-/g, '');
      var row = document.getElementById(rawId) || document.getElementById(item.id.toLowerCase());
      if (!row) return;

      row.dataset.status = item.status;
      row.dataset.blocksPurchase = item.blocks_purchase ? 'true' : 'false';

      var badgeClass = getBadgeClass(item.status);

      // Find or build status badge in row
      var idCell = row.querySelector('td.num') || row.children[0];
      if (idCell) {
        idCell.innerHTML = '<strong>' + item.id + '</strong><br>' +
          '<button class="badge ' + badgeClass + ' badge-interactive" data-item-id="' + item.id + '" title="Click to cycle status: Open → In Verification → Closed" style="margin-top:4px;border:none;cursor:pointer;">' +
          item.status_label +
          '</button>';
      }
    });

    // Event Listener: Status Badge Cycling
    document.querySelectorAll('.badge-interactive').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var itemId = btn.getAttribute('data-item-id');
        var item = activeState.open_items.find(function (x) { return x.id === itemId; });
        if (!item) return;

        var next = cycleStatus(item.status);
        item.status = next.status;
        item.status_label = next.status_label;

        savePersistedState(activeState);
        hydrateOpenItemsPage();
        updateSidebarBadges();
      };
    });

    // Event Listener: Filtering
    var activeFilter = 'all';
    document.querySelectorAll('.state-filters .filter-btn').forEach(function (btn) {
      btn.onclick = function () {
        document.querySelectorAll('.state-filters .filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        applyFilter(activeFilter);
      };
    });

    function applyFilter(filter) {
      document.querySelectorAll('tr[id^="o"]').forEach(function (tr) {
        var status = tr.dataset.status;
        var blocks = tr.dataset.blocksPurchase === 'true';
        var visible = true;

        if (filter === 'open') visible = (status === 'open');
        else if (filter === 'in_verification') visible = (status === 'in_verification');
        else if (filter === 'resolved') visible = (status === 'closed' || status === 'proven');
        else if (filter === 'blocks') visible = (blocks && status !== 'closed' && status !== 'proven');

        tr.style.display = visible ? '' : 'none';
      });
    }

    // Reset Button
    var btnReset = document.getElementById('btn-reset-state');
    if (btnReset) {
      btnReset.onclick = function () {
        if (confirm('Reset all verification gates to factory defaults?')) {
          activeState = JSON.parse(JSON.stringify(DEFAULT_STATE));
          savePersistedState(activeState);
          hydrateOpenItemsPage();
          updateSidebarBadges();
        }
      };
    }

    // Export Button
    var btnExport = document.getElementById('btn-export-state');
    if (btnExport) {
      btnExport.onclick = function () {
        var jsonStr = JSON.stringify(activeState, null, 2);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(jsonStr).then(function () {
            alert('Project state JSON copied to clipboard!');
          });
        } else {
          prompt('Copy state JSON:', jsonStr);
        }
      };
    }
  }

  // Public API
  global.ApartmentState = {
    getState: function () { return activeState; },
    getStats: computeStats,
    updateItemStatus: function (id, status, label) {
      var item = activeState.open_items.find(function (x) { return x.id === id; });
      if (item) {
        item.status = status;
        if (label) item.status_label = label;
        savePersistedState(activeState);
        updateSidebarBadges();
        if (window.location.pathname.match(/open\.html/)) hydrateOpenItemsPage();
      }
    },
    resetState: function () {
      activeState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      savePersistedState(activeState);
      updateSidebarBadges();
      if (window.location.pathname.match(/open\.html/)) hydrateOpenItemsPage();
    }
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateSidebarBadges();
      hydrateOpenItemsPage();
    });
  } else {
    updateSidebarBadges();
    hydrateOpenItemsPage();
  }

})(window);
