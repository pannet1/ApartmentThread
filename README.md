# Apartment Thread

> Local-first Matter-over-Thread smart home automation system tailored for Indian apartments.

`ApartmentThread` is a zero-cloud, pattern-based home automation deployment architecture. It replaces brittle cloud apps (Tuya/SmartLife) with a resilient, 100% local mesh that suffers zero degradation when internet fiber drops, while preserving standard 24/7 mechanical rocker switch overrides in Indian modular switchboards.

---

## Core Principles

1. **100% Local-First / Zero Cloud:** Every automation, thread route, and sensor report runs strictly inside the home LAN.
2. **Decentralized In-Wall Actuation:** Room switchboards use Tinxy 4+1 modular switch plates with fan speed controllers, keeping manual mechanical switches fully operational even if the server is offline.
3. **Low-Power Matter-over-Thread Sensing:** Custom low-voltage sensors (Sentinel 24GHz mmWave radar, magnetic reed switches) communicate over IEEE 802.15.4 Thread mesh to an OpenThread Border Router (ESP32-H2) hosted on a Radxa Zero 3E SBC running Home Assistant in Docker.

---

## Engineering Wiki & Deployment Guide

The full architectural blueprint, bill of materials, hardware pinouts, and staging sequences are maintained in the [`wiki/`](wiki/) directory:

* **[Wiki Index & Architecture](wiki/index.html)** — System architecture overview and design principles.
* **[Room Patterns & Requirements](wiki/rooms.html)** — Behavior specifications, hallway timers, presence sensing, and state transitions.
* **Hardware Components:**
  * [Host Server (`SRV-1`)](wiki/server.html) — Radxa Zero 3E SBC, Armbian, and Docker runtime.
  * [Thread Border Router (`BR-1`)](wiki/thread-router.html) — M5Stack ESP32-H2 802.15.4 radio on 3.3V UART2.
  * [Presence Sensor (`PS-1`)](wiki/sensor.html) — Sentinel 24GHz mmWave radar (LD2410S + XIAO nRF52840).
  * [Door Contact Sensor (`DS-1`)](wiki/door-sensor.html) — Matter-over-Thread door contact (XIAO ESP32-C6 + MC-38 reed switch).
  * [Modular Switch Plates (`SW-1`)](wiki/switch.html) — In-wall Tinxy 4+1 retrofits with fan regulators.
* **[Bill of Materials (BOM)](wiki/bom.html)** — Complete parts list, pricing, and component procurement links.
* **[Installation Guide](wiki/install.html)** — 5-stage sequential physical build, flashing, and commissioning instructions.
* **[Sensing Reference](wiki/sensing.html)** — mmWave radar wave propagation, enclosure tuning, and radar vs. PIR physics.

---

## License

[MIT](wiki/LICENSE.md)
