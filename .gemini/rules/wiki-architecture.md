# Apartment Thread — Agent Rules & Architecture Guide

This rule is active for all agents working on the Apartment Thread repository.

## 1. Single Source of Truth (SSOT) Map
* **BOM & Pricing:** `wiki/bom.html` and `wiki/assets/state.json`. Component pages MUST link to `bom.html` and NOT duplicate price tables.
* **Verification Gates & Project State:** `wiki/assets/state.json`. Never hardcode ad-hoc counts (e.g. "(2 resolved, 9 open)") in body text. Sync statically with `python3 scripts/sync_state.py`.
* **Hardware Pinouts & Schematics:** Component pages (`server.html`, `thread-router.html`, `sensor.html`, `door-sensor.html`, `switch.html`). Installation guides link to component pinouts rather than duplicating 30-pin tables.
* **Automation Logic & State Machines:** `wiki/rooms.html` (HL-01, ST-01, BA-01). Keeps requirements and test criteria clean without raw code clutter.
* **Deployment YAML Automations:** `wiki/install-commissioning.html` (Stage 5). Collapsible, copy-paste ready blocks. Never duplicate raw YAML elsewhere.

## 2. Chronological Sequence of Navigation
All sidebars and linear `.pagenav` links must strictly maintain this sequence:
1. `Room Patterns` (`rooms.html` -> `pattern-hardware.html`)
2. `Hardware Components` in build order (`server.html` [SRV] -> `thread-router.html` [BR] -> `sensor.html` [PS] -> `door-sensor.html` [DS] -> `switch.html` [SW])
3. `Planning & Procurement` (`bom.html` -> `inventory.html` -> `open.html`)
4. `Installation` (`install.html` -> `install-server.html` -> `install-thread.html` -> `install-sensors.html` -> `install-plates.html` -> `install-commissioning.html`)
5. `Reference` (`mounting.html` -> `sensing.html` -> loops to `index.html`)

## 3. Home Page Dashboard Invariance
* `wiki/index.html` is a permanent executive dashboard and directory.
* Never put volatile statuses ("ready to buy", "on bench", "unblocked", "in stock") on `index.html`.
* Descriptions must be functional, and costs must reflect catalog BOM budget.

## 4. Uniformity Checklist
* **Title:** `<Page Title> &mdash; Apartment Thread`
* **Breadcrumb:** `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Wiki</a> &rsaquo; <span><Section Name></span> &rsaquo; <span><Page Title></span></nav>`
* **Section Names:** Strictly `Room Patterns`, `Hardware Components`, `Planning & Procurement`, `Installation`, `Reference`.
* **Tooling:** Never invoke `mare-browser`. Verify with CLI Python scripts.
