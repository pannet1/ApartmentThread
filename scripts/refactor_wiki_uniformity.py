#!/usr/bin/env python3
"""
Refactor Apartment Thread Wiki for Uniformity & Chronological Sequence:
1. Re-orders Hardware Components chronologically (SRV -> BR -> PS -> DS -> SW).
2. Standardizes section names ('Planning & Procurement' instead of 'Build & Plan').
3. Uniformizes sidebar across all 19 content HTML files.
4. Uniformizes breadcrumb hierarchy (Wiki > Section > Page).
5. Establishes seamless chronological linear pagenav flow.
6. Standardizes page title tags.
"""

import os
import re
from bs4 import BeautifulSoup

WIKI_DIR = "/home/pannet1/ApartmentThread/wiki"

# The 19 content files in canonical chronological navigation sequence
PAGE_ORDER = [
    ("index.html", "Overview", None),
    ("rooms.html", "All Rooms & Automations", "Room Patterns"),
    ("pattern-hardware.html", "Hardware by Pattern", "Room Patterns"),
    ("server.html", "Server (SRV)", "Hardware Components"),
    ("thread-router.html", "Thread Router (BR)", "Hardware Components"),
    ("sensor.html", "Presence Sensor (PS)", "Hardware Components"),
    ("door-sensor.html", "Door Contact Sensor (DS)", "Hardware Components"),
    ("switch.html", "Smart Switch (SW)", "Hardware Components"),
    ("bom.html", "Bill of Materials", "Planning & Procurement"),
    ("inventory.html", "Inventory", "Planning & Procurement"),
    ("open.html", "Open Items", "Planning & Procurement"),
    ("install.html", "Overview & Sequence", "Installation"),
    ("install-server.html", "1 · Server Setup", "Installation"),
    ("install-thread.html", "2 · Thread Border Router", "Installation"),
    ("install-sensors.html", "3 · Sensor Bench Build", "Installation"),
    ("install-plates.html", "4 · Switch Plates", "Installation"),
    ("install-commissioning.html", "5 · Mounting & Tuning", "Installation"),
    ("mounting.html", "Radar Placement", "Reference"),
    ("sensing.html", "Radar vs PIR", "Reference")
]

PAGE_MAP = {p[0]: {"title": p[1], "section": p[2]} for p in PAGE_ORDER}

def generate_sidebar(current_page):
    is_home = (current_page == "index.html")
    brand_current = ' aria-current="page"' if is_home else ''
    
    def cur(page):
        return ' aria-current="page"' if current_page == page else ''

    html = f'''<aside class="sidebar" data-ui><a href="index.html" class="brand"{brand_current}><div class="brand-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 0 1 18 0"/><circle cx="12" cy="12" r="2.5"/><path d="M7.5 12a4.5 4.5 0 0 1 9 0"/></svg></div><div>Apartment Thread<small>Build Wiki · v2.0</small></div></a><details class="nav-toggle" open><summary>Contents</summary>
<div class="nav-group"><h4>Room Patterns</h4><a href="rooms.html"{cur('rooms.html')}><span>All Rooms &amp; Automations</span></a><a href="pattern-hardware.html"{cur('pattern-hardware.html')}><span>Hardware by Pattern</span></a></div>
<div class="nav-group"><h4>Hardware Components</h4><a href="server.html"{cur('server.html')}><span>Server</span><span class="badge badge-ok">SRV</span></a><a href="thread-router.html"{cur('thread-router.html')}><span>Thread Router</span><span class="badge badge-ok">BR</span></a><a href="sensor.html"{cur('sensor.html')}><span>Presence Sensor</span><span class="badge badge-warn">PS</span></a><a href="door-sensor.html"{cur('door-sensor.html')}><span>Door Contact Sensor</span><span class="badge badge-warn">DS</span></a><a href="switch.html"{cur('switch.html')}><span>Smart Switch</span><span class="badge badge-warn">SW</span></a></div>
<div class="nav-group"><h4>Planning &amp; Procurement</h4><a href="bom.html"{cur('bom.html')}><span>Bill of Materials</span></a><a href="inventory.html"{cur('inventory.html')}><span>Inventory</span><span class="badge badge-accent">6 pending</span></a><a href="open.html"{cur('open.html')}><span>Open Items</span><span class="badge badge-warn">9 open</span></a></div>
<div class="nav-group"><h4>Installation</h4><a href="install.html"{cur('install.html')}><span>Overview &amp; Sequence</span></a><a href="install-server.html"{cur('install-server.html')}><span>1 · Server Setup</span><span class="badge badge-ok">SRV</span></a><a href="install-thread.html"{cur('install-thread.html')}><span>2 · Thread Border Router</span><span class="badge badge-ok">BR</span></a><a href="install-sensors.html"{cur('install-sensors.html')}><span>3 · Sensor Bench Build</span><span class="badge badge-warn">PS/DS</span></a><a href="install-plates.html"{cur('install-plates.html')}><span>4 · Switch Plates</span><span class="badge badge-warn">SW</span></a><a href="install-commissioning.html"{cur('install-commissioning.html')}><span>5 · Mounting &amp; Tuning</span><span class="badge badge-warn">TUNE</span></a></div>
<div class="nav-group"><h4>Reference</h4><a href="mounting.html"{cur('mounting.html')}><span>Radar Placement</span></a><a href="sensing.html"{cur('sensing.html')}><span>Radar vs PIR</span></a></div>
</details><div class="sidebar-footer"><div><b>Local-first · India build</b></div><div class="license-pill"><span>Home Assistant</span></div></div></aside>'''
    return html

def generate_breadcrumb(current_page):
    info = PAGE_MAP.get(current_page)
    if not info or not info["section"]:
        return None
    sec = info["section"]
    title = info["title"]
    return f'<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Wiki</a> &rsaquo; <span>{sec}</span> &rsaquo; <span>{title}</span></nav>'

def generate_pagenav(idx):
    prev_idx = idx - 1 if idx > 0 else None
    next_idx = idx + 1 if idx < len(PAGE_ORDER) - 1 else 0  # loop back to home from sensing.html

    prev_link = ""
    if prev_idx is not None:
        p_file, p_title, _ = PAGE_ORDER[prev_idx]
        prev_link = f'<a href="{p_file}"><span class="dir">Previous Page</span>&larr; {p_title}</a>'
    else:
        prev_link = '<span></span>'

    n_file, n_title, _ = PAGE_ORDER[next_idx]
    next_link = f'<a class="next" href="{n_file}"><span class="dir">Next Page</span>{n_title} &rarr;</a>'

    return f'<nav class="pagenav">{prev_link}{next_link}</nav>'

def refactor_file(idx, fname):
    filepath = os.path.join(WIKI_DIR, fname)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update Title tag
    page_info = PAGE_MAP[fname]
    target_title = f"{page_info['title']} &mdash; Apartment Thread"
    content = re.sub(r'<title>.*?</title>', f'<title>{target_title}</title>', content)

    # 2. Replace Sidebar
    new_sidebar = generate_sidebar(fname)
    sidebar_pattern = r'<aside class="sidebar" data-ui>.*?</aside>'
    content = re.sub(sidebar_pattern, new_sidebar, content, flags=re.DOTALL)

    # 3. Replace Breadcrumb (if applicable)
    new_bc = generate_breadcrumb(fname)
    if new_bc:
        if '<nav class="breadcrumb"' in content:
            content = re.sub(r'<nav class="breadcrumb"[^>]*>.*?</nav>', new_bc, content, flags=re.DOTALL)
        else:
            content = re.sub(r'(<main class="main"><div class="doc wide">)', rf'\1{new_bc}', content)

    # 4. Replace Pagenav
    new_pnav = generate_pagenav(idx)
    if '<nav class="pagenav">' in content:
        content = re.sub(r'<nav class="pagenav">.*?</nav>', new_pnav, content, flags=re.DOTALL)
    elif fname != "index.html":
        # insert before footer
        content = re.sub(r'(<footer class="page-footer">)', rf'{new_pnav}\1', content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Refactored {fname:25}: Title, Sidebar, Breadcrumb, Pagenav updated.")

def main():
    for idx, (fname, _, _) in enumerate(PAGE_ORDER):
        refactor_file(idx, fname)
    print("\nAll 19 content files refactored successfully.")

if __name__ == "__main__":
    main()
