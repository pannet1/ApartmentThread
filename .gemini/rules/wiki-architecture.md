# Apartment Thread — Agent Rules & Architecture Guide

> **Single Source of Truth (SSOT), Architectural Blueprint Sequence, and Deduplication Standards for AI Agents.**
> This rule is active for all agents working on the Apartment Thread repository.

---

## 1. Information Architecture Paradigm: Architectural Blueprint (Requirements First)

The wiki navigation structure follows an **Architectural Blueprint Sequence** (Requirements &rarr; Components &rarr; Procurement &rarr; Build &rarr; Reference). 

Agents must **NOT** confuse the top-level wiki navigation with a physical build timeline:
* In a *physical build timeline*, a builder starts with hardware in the lab and writes room automations last.
* In an *Architectural Blueprint*, the wiki deliberately starts with **Room Requirements & Behaviors** so that every hardware selection, BOM line item, and pinout is justified by what the rooms actually require.
* The **internal sub-chains** within Hardware Components (`SRV` &rarr; `BR` &rarr; `PS` &rarr; `DS` &rarr; `SW`) and Installation (`Stage 1` &rarr; `Stage 5`) strictly follow the physical build order.

---

## 2. The Five Navigation Sections & Content Boundaries

Never alter the order of pages or sections into arbitrary groupings. Every page has a distinct phase responsibility:

### Section 1: Room Patterns (`rooms.html` &rarr; `pattern-hardware.html`)
* **Phase:** *Functional Requirements & Behavioral State Machines.*
* **Content:** Defines *what* each room needs to achieve (Hallway timers, Study mmWave presence, Bathroom door contact state machine) and maps room needs to hardware layers.
* **STRICT BOUNDARY:** Keep this section focused on human problems, state machine transitions, and acceptance test tables (H-01..05, S-01..06, B-01..06). **PROHIBITED:** Never dump raw Home Assistant YAML configurations here. Link forward to [Stage 5 Commissioning](wiki/install-commissioning.html#automations) for executable deployment YAML.

### Section 2: Hardware Components (`server.html` &rarr; `thread-router.html` &rarr; `sensor.html` &rarr; `door-sensor.html` &rarr; `switch.html`)
* **Phase:** *Component Technical Specifications & Pinouts.*
* **Content:** Answers *"What is the hardware?"* (Datasheets, 40-pin header pinouts, 3.3V UART logic levels, power consumption ratings, RF transceiver specs).
* **STRICT BOUNDARY:** **PROHIBITED:** Never put multi-step testing sequences, installation checklists, or commissioning procedures on component pages. Link to the corresponding `install-*.html` stage instead.

### Section 3: Planning & Procurement (`bom.html` &rarr; `inventory.html` &rarr; `open.html`)
* **Phase:** *Budget, Sourcing & Verification Gates.*
* **Content:** Reviews on-hand lab stock (`inventory.html`), verifies catalog procurement budgets and active Indian vendor links (`bom.html`), and tracks open safety gates (`open.html`) *before* cutting wires or modifying mains boxes.
* **STRICT BOUNDARY:** `bom.html` and `assets/state.json` are the SOLE Single Source of Truth for pricing and totals.

### Section 4: Installation (`install.html` &rarr; Stages 1 to 5)
* **Phase:** *Step-by-Step Physical Build, Flashing & Commissioning.*
* **Content:** Answers *"How do I assemble, configure, and verify it?"*
* **Five Non-Negotiable Sequential Stages:**
  * **Stage 1 (`install-server.html`):** Server Setup (SRV-1) &mdash; Armbian, Docker, Home Assistant container.
  * **Stage 2 (`install-thread.html`):** Thread Border Router (BR-1) &mdash; UART wiring, OTBR container. *Note:* Proves the Thread stack with a bench reference node (Seeed XIAO ESP32-C6 from DS-1), NOT expensive imported retail sensors.
  * **Stage 3 (`install-sensors.html`):** Sensor Bench Build (PS-1 & DS-1) &mdash; Firmware flashing, radar UART, reed switch.
  * **Stage 4 (`install-plates.html`):** Switch Plates (SW-1) &mdash; Electrician mains check, Tinxy 4+1 wiring, mechanical rocker test.
  * **Stage 5 (`install-commissioning.html`):** Mounting & Tuning &mdash; **Holds the executable deployment YAML** in collapsible, copy-paste ready blocks with one-click copy buttons (`#yaml-hall`, `#yaml-study`, `#yaml-bathroom`).

### Section 5: Reference (`mounting.html` &rarr; `sensing.html`)
* **Phase:** *Deep Technical & Physical Reference.*
* **Content:** Radar wave propagation, enclosure material shifts, gate tuning, and Radar vs. PIR physics.

---

## 3. Strict Linear Reading Flow (`.pagenav` Chain)

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

## 4. Deduplication & Single Source of Truth (SSOT) Map

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

## 5. Home Page Dashboard Invariance

The home page (`wiki/index.html`) is a **permanent executive dashboard and project directory**.
* **STRICT PROHIBITION:** Never put volatile project statuses (`ready to buy`, `on bench`, `bench build`, `unblocked`, `in stock`) on the home page.
* Component index rows must describe **permanent architectural specifications and standard catalog BOM budgets** (e.g. `₹2,462` <small>Matter over Thread</small>).
* "Explore the Wiki" directory cards must provide **evergreen functional summaries**, never ephemeral counts like "(2 resolved, 9 open)".
* `scripts/sync_state.py` is explicitly prohibited from modifying `index.html`.

---

## 6. Structural & Formatting Uniformity Checklist

* **Title Tag Format:** `<Page Title> &mdash; Apartment Thread`
* **Breadcrumb Hierarchy:**
  ```html
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="index.html">Wiki</a> &rsaquo; 
    <span><Sidebar Section Name></span> &rsaquo; 
    <span><Page Title></span>
  </nav>
  ```
  The `<Sidebar Section Name>` must match the sidebar `<h4>` heading exactly:
  `Room Patterns`, `Hardware Components`, `Planning & Procurement`, `Installation`, `Reference`.

---

## 7. Agent Tooling & Verification Constraints

1. **NEVER use the MCP browser tool (`mare-browser`):**
   * Calling `mare-browser` spawns lingering headless Chromium processes that cause memory exhaustion and hang task sessions.
   * All HTML parsing, DOM validation, link checking, and state verification **MUST** be performed via CLI Python scripts.
2. **Automated Verification After Edits:**
   * Whenever files in `wiki/` are modified, always execute:
     ```bash
     python3 scripts/sync_state.py
     ```
   * Always verify link integrity across the repository (must report 0 broken links).
