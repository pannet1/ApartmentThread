# Apartment Thread — Agent Instructions & Architectural Rules

> **Single Source of Truth (SSOT), Strict Chronological Navigation, and Deduplication Standards for AI Agents.**

---

## 1. Project Overview & Philosophy

**Apartment Thread** is a pattern-based, local-first home automation wiki and deployment plan for an Indian apartment. The entire system is built around three principles:
1. **100% Local-First / Zero Cloud:** Every automation, thread route, and sensor report runs entirely within the home LAN. Unplugging the router's WAN / internet fiber must cause zero degradation.
2. **Decentralized In-Wall Actuation:** Each room (Hall, Study, Bathroom) has its own dedicated Tinxy 4+1 modular smart switch plate behind standard switchboards, preserving 24/7 manual mechanical rocker override even if the server is powered off.
3. **Low-Power Matter-over-Thread Sensing:** Custom and off-the-shelf low-voltage sensors (Sentinel 24GHz mmWave radar, magnetic reed switches) communicate via IEEE 802.15.4 Thread mesh to an OpenThread Border Router (ESP32-H2) hosted on a single low-power Radxa Zero 3E single-board computer running Home Assistant in Docker.

---

## 2. Information Architecture Paradigm: Architectural Blueprint (Requirements First)

The wiki navigation structure follows an **Architectural Blueprint Sequence** (Requirements &rarr; Components &rarr; Procurement &rarr; Build &rarr; Reference).

Never confuse the top-level wiki navigation with a physical build timeline:
* In a *physical build timeline*, a builder starts with hardware in the lab and writes room automations last.
* In an *Architectural Blueprint*, the wiki deliberately starts with **Room Requirements & Behaviors** so that every hardware selection, BOM line item, and pinout is justified by what the rooms actually require.
* The **internal sub-chains** within Hardware Components (`SRV` &rarr; `BR` &rarr; `PS` &rarr; `DS` &rarr; `SW`) and Installation (`Stage 1` &rarr; `Stage 5`) strictly follow the physical build order.

### The Five Sequential Sections & Content Boundaries:
1. **Room Patterns (`wiki/rooms.html`, `wiki/pattern-hardware.html`)**
   * *Phase: Requirements & Architecture.*
   * Defines what automations are needed per room (Hallway timers, Study mmWave presence, Bathroom door contact) and how room requirements translate to hardware layers.
   * **STRICT BOUNDARY:** Keep this section focused on human problems, state machine transitions, and acceptance test tables (H-01..05, S-01..06, B-01..06). **PROHIBITED:** Never dump raw Home Assistant YAML configurations here. Link forward to Stage 5 Commissioning (`install-commissioning.html#automations`) for deployment YAML.
2. **Hardware Components (`server.html` &rarr; `thread-router.html` &rarr; `sensor.html` &rarr; `door-sensor.html` &rarr; `switch.html`)**
   * *Phase: Hardware Specifications & Pinouts.*
   * **Must strictly follow the physical build order:**
     * `server.html` (`SRV-1`): Radxa Zero 3E host SBC, power, and storage.
     * `thread-router.html` (`BR-1`): M5Stack ESP32-H2 802.15.4 radio on 3.3V UART2.
     * `sensor.html` (`PS-1`): Sentinel mmWave radar (LD2410S + XIAO nRF52840).
     * `door-sensor.html` (`DS-1`): Matter-over-Thread door contact sensor (XIAO ESP32-C6).
     * `switch.html` (`SW-1`): Tinxy 4+1 modular switch plates with fan regulators.
   * **STRICT BOUNDARY:** **PROHIBITED:** Never put multi-step testing sequences, installation checklists, or commissioning procedures on component pages. Link to the corresponding `install-*.html` stage instead.
3. **Planning & Procurement (`bom.html` &rarr; `inventory.html` &rarr; `open.html`)**
   * *Phase: Budget, Sourcing & Verification Gates.*
   * Must precede physical installation! A builder reviews on-hand lab stock (`inventory.html`), verifies procurement budgets and vendor links (`bom.html`), and checks open safety gates (`open.html`) *before* cutting wires or modifying mains boxes.
4. **Installation (`install.html` &rarr; `install-server.html` &rarr; `install-thread.html` &rarr; `install-sensors.html` &rarr; `install-plates.html` &rarr; `install-commissioning.html`)**
   * *Phase: Step-by-Step Physical Build & Flashing.*
   * Five non-negotiable sequential stages:
     * Stage 1: Server Setup (SRV-1) &mdash; Armbian, Docker, Home Assistant container.
     * Stage 2: Thread Border Router (BR-1) &mdash; UART wiring, OTBR container. *Note:* Proves the Thread stack with a bench reference node (Seeed XIAO ESP32-C6 from DS-1), NOT expensive imported retail sensors.
     * Stage 3: Sensor Bench Build (PS-1 & DS-1) &mdash; Firmware flashing, radar UART, reed switch.
     * Stage 4: Switch Plates (SW-1) &mdash; Electrician mains check, Tinxy 4+1 wiring, mechanical rocker test.
     * Stage 5: Mounting & Tuning &mdash; **Holds the executable deployment YAML** in collapsible, copy-paste ready blocks with one-click copy buttons (`#yaml-hall`, `#yaml-study`, `#yaml-bathroom`).
5. **Reference (`mounting.html` &rarr; `sensing.html`)**
   * *Phase: Deep Technical & Physical Reference.*
   * Radar wave propagation, enclosure material shifts, gate tuning, and Radar vs. PIR sensor physics.

### Linear Reading Flow (`.pagenav` Chain)
Every page must have clean `<nav class="pagenav">` links preserving the exact unbroken architectural loop:
```
index.html ──► rooms.html ──► pattern-hardware.html
           ──► server.html ──► thread-router.html ──► sensor.html ──► door-sensor.html ──► switch.html
           ──► bom.html ──► inventory.html ──► open.html
           ──► install.html ──► install-server.html (Stage 1) ──► install-thread.html (Stage 2)
           ──► install-sensors.html (Stage 3) ──► install-plates.html (Stage 4) ──► install-commissioning.html (Stage 5)
           ──► mounting.html ──► sensing.html ──► (loops back to index.html)
```

---

## 3. Deduplication & Single Source of Truth (SSOT) Rules

To eliminate conflicting documentation and prevent maintenance churn, every type of project information has exactly **one authoritative owner**:

| Information Domain | Single Source of Truth (SSOT) | Prohibited Duplication |
| :--- | :--- | :--- |
| **BOM, Pricing & Sourcing** | `wiki/bom.html` & `wiki/assets/state.json` | **DO NOT** maintain price tables in component pages (`sensor.html`, `server.html`, etc.). Link to `bom.html` instead. |
| **Project & Gate State** | `wiki/assets/state.json` (synced via `scripts/sync_state.py`) | **DO NOT** hardcode status numbers (e.g. "9 open", "12 items") into body paragraphs or headings. |
| **Hardware Pinouts & Wiring** | Component specs (`server.html`, `thread-router.html`, `sensor.html`) | **DO NOT** duplicate 30-pin header tables inside `install-*.html`. Link to the component spec anchor. |
| **Automation Logic & State Machines** | `wiki/rooms.html` | **DO NOT** clutter requirements pages with raw YAML code blocks or redefine state machines in installation guides. Link to `install-commissioning.html` for deployment YAML. |
| **Deployment Automations (YAML)** | `wiki/install-commissioning.html` | **DO NOT** duplicate YAML configuration snippets across wiki pages. Maintain collapsible, copy-paste ready blocks in Stage 5. |
| **Testing & Commissioning Steps** | `wiki/install-*.html` (Installation stages) | **DO NOT** put multi-step testing sequences or commissioning procedures in component spec pages (`thread-router.html`, etc.). |
| **Lab Inventory** | `wiki/inventory.html` & `wiki/assets/inventory.json` | **DO NOT** hardcode uncommitted spare parts outside inventory. |

---

## 4. Home Page Dashboard Integrity

The home page (`wiki/index.html`) is a **permanent executive dashboard and project directory**.
* **STRICT PROHIBITION:** Never put volatile project statuses (`ready to buy`, `on bench`, `bench build`, `unblocked`, `in stock`) on the home page.
* Component index rows must describe **permanent architectural specifications and standard catalog BOM budgets** (e.g. `₹2,462` <small>Matter over Thread</small>).
* "Explore the Wiki" directory cards must provide **evergreen functional summaries**, never ephemeral counts like "(2 resolved, 9 open)".
* `scripts/sync_state.py` is explicitly prohibited from modifying `index.html`.

---

## 5. Structural & Formatting Uniformity Standards

Every page in `wiki/` must adhere to these exact structural conventions:

### A. Title Tag Format
Must strictly follow: `<Page Title> &mdash; Apartment Thread`
* Example: `<title>Stage 2 · Thread Border Router &mdash; Apartment Thread</title>`

### B. Breadcrumb Hierarchy
All subpages must use a strict 3-tier breadcrumb:
```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="index.html">Wiki</a> &rsaquo; 
  <span><Sidebar Section Name></span> &rsaquo; 
  <span><Page Title></span>
</nav>
```
The `<Sidebar Section Name>` must match the sidebar `<h4>` heading exactly:
* `Room Patterns`
* `Hardware Components`
* `Planning & Procurement`
* `Installation`
* `Reference`

### C. Sidebar Navigation
Must strictly feature the 5 nav-groups in chronological order with exact badges:
```html
<details class="nav-toggle" open>
  <summary>Contents</summary>
  <div class="nav-group">
    <h4>Room Patterns</h4>
    <a href="rooms.html"><span>All Rooms &amp; Automations</span></a>
    <a href="pattern-hardware.html"><span>Hardware by Pattern</span></a>
  </div>
  <div class="nav-group">
    <h4>Hardware Components</h4>
    <a href="server.html"><span>Server</span><span class="badge badge-ok">SRV</span></a>
    <a href="thread-router.html"><span>Thread Router</span><span class="badge badge-ok">BR</span></a>
    <a href="sensor.html"><span>Presence Sensor</span><span class="badge badge-warn">PS</span></a>
    <a href="door-sensor.html"><span>Door Contact Sensor</span><span class="badge badge-warn">DS</span></a>
    <a href="switch.html"><span>Smart Switch</span><span class="badge badge-warn">SW</span></a>
  </div>
  <div class="nav-group">
    <h4>Planning &amp; Procurement</h4>
    <a href="bom.html"><span>Bill of Materials</span></a>
    <a href="inventory.html"><span>Inventory</span><span class="badge badge-accent">6 pending</span></a>
    <a href="open.html"><span>Open Items</span><span class="badge badge-warn">9 open</span></a>
  </div>
  <div class="nav-group">
    <h4>Installation</h4>
    <a href="install.html"><span>Overview &amp; Sequence</span></a>
    <a href="install-server.html"><span>1 · Server Setup</span><span class="badge badge-ok">SRV</span></a>
    <a href="install-thread.html"><span>2 · Thread Border Router</span><span class="badge badge-ok">BR</span></a>
    <a href="install-sensors.html"><span>3 · Sensor Bench Build</span><span class="badge badge-warn">PS/DS</span></a>
    <a href="install-plates.html"><span>4 · Switch Plates</span><span class="badge badge-warn">SW</span></a>
    <a href="install-commissioning.html"><span>5 · Mounting &amp; Tuning</span><span class="badge badge-warn">TUNE</span></a>
  </div>
  <div class="nav-group">
    <h4>Reference</h4>
    <a href="mounting.html"><span>Radar Placement</span></a>
    <a href="sensing.html"><span>Radar vs PIR</span></a>
  </div>
</details>
```

### D. Semantic Badge Palette
* `.badge-ok`: Completed, verified, or proven hardware / milestone (green).
* `.badge-accent`: Active in-verification, pending decision, or primary focus (tan/accent).
* `.badge-warn`: Open gate, pending bench build, or awaiting electrician check (warm coral).
* `.badge-danger`: Blocks purchase or critical mains hazard (deep red).

---

## 6. Agent Tooling & Verification Constraints

1. **NEVER use the MCP browser tool (`mare-browser`):**
   * Calling `mare-browser` spawns lingering headless Chromium processes that cause memory exhaustion and hang task sessions.
   * All HTML parsing, DOM validation, link checking, and state verification **MUST** be performed via CLI Python scripts.
2. **Automated Verification After Edits:**
   * Whenever files in `wiki/` are modified, always execute:
     ```bash
     python3 scripts/sync_state.py
     ```
   * Always verify link integrity across the repository:
     ```bash
     python3 -c '
     import glob, re, os, sys
     from urllib.parse import urlparse
     files = glob.glob("wiki/*.html")
     anchors = {os.path.basename(f): set(re.findall(r"id=[\"\x27]([^\x27\"\s>]+)[\"\x27]", open(f).read())) for f in files}
     broken = []
     for f in files:
         raw = open(f).read()
         content = re.sub(r"<script.*?</script>", "", raw, flags=re.DOTALL)
         for l in re.findall(r"href=[\"\x27]([^\x27\"\s>]+)[\"\x27]", content):
             if l.startswith(("#", "http://", "https://", "mailto:", "javascript:")):
                 if l.startswith("#") and l[1:] not in anchors[os.path.basename(f)]:
                     broken.append((f, l))
                 continue
             p = urlparse(l)
             tf = os.path.join("wiki", p.path)
             if not os.path.exists(tf) or (p.fragment and p.fragment not in anchors.get(p.path, set())):
                 broken.append((f, l))
     assert not broken, f"Broken links: {broken}"
     print(f"Verified {len(files)} files: 0 broken links.")
     '
     ```
