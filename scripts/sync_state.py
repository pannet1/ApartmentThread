#!/usr/bin/env python3
"""
Apartment Thread — State Sync Script
Reads wiki/assets/state.json and synchronizes static HTML across all wiki pages,
ensuring zero discrepancy between state data, subtitles, section headers, and sidebar badges.
"""

import os
import re
import json
import glob

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIKI_DIR = os.path.join(REPO_ROOT, "wiki")
STATE_JSON_PATH = os.path.join(WIKI_DIR, "assets", "state.json")

def load_state():
    with open(STATE_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def compute_stats(state):
    items = state.get("open_items", [])
    total = len(items)
    closed = sum(1 for x in items if x.get("status") == "closed")
    proven = sum(1 for x in items if x.get("status") == "proven")
    in_verification = sum(1 for x in items if x.get("status") == "in_verification")
    open_count = sum(1 for x in items if x.get("status") == "open")
    resolved = closed + proven
    blocks_purchase = sum(1 for x in items if x.get("blocks_purchase") and x.get("status") in ("open", "in_verification"))
    pct = round((resolved / total * 100)) if total > 0 else 0

    sections = {}
    for it in items:
        sec = it.get("section")
        if sec not in sections:
            sections[sec] = {"total": 0, "closed": 0, "proven": 0, "in_verification": 0, "open": 0, "blocks_purchase": 0}
        sections[sec]["total"] += 1
        s = it.get("status")
        if s == "closed":
            sections[sec]["closed"] += 1
        elif s == "proven":
            sections[sec]["proven"] += 1
        elif s == "in_verification":
            sections[sec]["in_verification"] += 1
        else:
            sections[sec]["open"] += 1
        if it.get("blocks_purchase") and s in ("open", "in_verification"):
            sections[sec]["blocks_purchase"] += 1

    return {
        "total": total,
        "closed": closed,
        "proven": proven,
        "in_verification": in_verification,
        "open": open_count,
        "resolved": resolved,
        "blocks_purchase": blocks_purchase,
        "percentage": pct,
        "sections": sections
    }

def format_section_subtitle(sec):
    parts = []
    if sec["closed"] > 0:
        parts.append(f"{sec['closed']} closed")
    if sec["proven"] > 0:
        parts.append(f"{sec['proven']} proven")
    if sec["in_verification"] > 0:
        parts.append(f"{sec['in_verification']} in verification")
    if sec["open"] > 0:
        blocks_text = f" ({sec['blocks_purchase']} blocks purchase)" if sec["blocks_purchase"] > 0 else ""
        parts.append(f"{sec['open']} open{blocks_text}")
    return " &middot; ".join(parts) if parts else "All verified"

def get_status_badge_class(status):
    if status in ("closed", "proven"):
        return "badge-ok"
    if status == "in_verification":
        return "badge-accent"
    return "badge-warn"

def build_dashboard_html(stats):
    return (
        f'<!-- STATE_DASHBOARD_START -->\n'
        f'<div id="state-dashboard" class="state-dashboard">\n'
        f'<div class="state-metrics">\n'
        f'<div class="state-metric"><span class="state-metric-val">{stats["total"]}</span><span class="state-metric-lbl">Total Gates</span></div>\n'
        f'<div class="state-metric"><span class="state-metric-val" style="color:var(--ok);">{stats["resolved"]}</span><span class="state-metric-lbl">Resolved / Proven</span></div>\n'
        f'<div class="state-metric"><span class="state-metric-val" style="color:var(--accent);">{stats["in_verification"]}</span><span class="state-metric-lbl">In Verification</span></div>\n'
        f'<div class="state-metric"><span class="state-metric-val" style="color:var(--danger);">{stats["open"]}</span><span class="state-metric-lbl">Open Items</span></div>\n'
        f'<div class="state-metric"><span class="state-metric-val" style="color:#ef4444;">{stats["blocks_purchase"]}</span><span class="state-metric-lbl">Blocks Purchase</span></div>\n'
        f'</div>\n'
        f'<div class="state-progress-wrap">\n'
        f'<div class="state-progress-meta"><span>Gate Resolution Progress</span><span>{stats["resolved"]} of {stats["total"]} ({stats["percentage"]}%)</span></div>\n'
        f'<div class="state-progress-bar"><div class="state-progress-fill" style="width:{stats["percentage"]}%;"></div></div>\n'
        f'</div>\n'
        f'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;margin-top:0.25rem;">\n'
        f'<div class="state-filters" id="state-filters">\n'
        f'<button class="filter-btn active" data-filter="all">All ({stats["total"]})</button>\n'
        f'<button class="filter-btn" data-filter="open">Open ({stats["open"]})</button>\n'
        f'<button class="filter-btn" data-filter="in_verification">In Verification ({stats["in_verification"]})</button>\n'
        f'<button class="filter-btn" data-filter="resolved">Resolved ({stats["resolved"]})</button>\n'
        f'<button class="filter-btn" data-filter="blocks">Blocks Purchase ({stats["blocks_purchase"]})</button>\n'
        f'</div>\n'
        f'<div class="state-toolbar">\n'
        f'<button class="btn-quiet" id="btn-reset-state" style="font-size:0.8rem;padding:0.25rem 0.6rem;">Reset to Default</button>\n'
        f'<button class="btn-quiet" id="btn-export-state" style="font-size:0.8rem;padding:0.25rem 0.6rem;">Copy State JSON</button>\n'
        f'</div>\n'
        f'</div>\n'
        f'</div>\n'
        f'<!-- STATE_DASHBOARD_END -->'
    )

def sync_wiki():
    state = load_state()
    stats = compute_stats(state)
    print(f"Loaded state: {stats['total']} total gates, {stats['resolved']} resolved, {stats['in_verification']} in verification, {stats['open']} open ({stats['blocks_purchase']} blocking purchase).")

    # 1. Update all wiki HTML files: sidebar badge & script inclusion
    html_files = sorted(glob.glob(os.path.join(WIKI_DIR, "*.html")))
    updated_files = 0

    open_badge_text = f"{stats['open']} open" if stats['open'] > 0 else "All verified"

    for file_path in html_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        orig = content

        # Update sidebar Open Items badge
        content = re.sub(
            r'(<a\s+href="open\.html"(?: aria-current="page")?><span>Open Items</span><span class="badge\s+[^"]*">)[^<]*(</span></a>)',
            rf'\g<1>{open_badge_text}\2',
            content
        )

        # Ensure script tag for state.js is present
        if "assets/state.js" not in content:
            content = re.sub(
                r'(<script src="assets/motion\.js"></script>)',
                r'\1<script src="assets/state.js"></script>',
                content
            )

        if content != orig:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            updated_files += 1

    print(f"Updated sidebar badges and state script in {updated_files} wiki HTML files.")

    # 2. Update wiki/open.html content specifically (Home page index.html is kept clean and static as a permanent dashboard)
    open_html_path = os.path.join(WIKI_DIR, "open.html")
    with open(open_html_path, "r", encoding="utf-8") as f:
        open_content = f.read()

    # Pre-render the lede paragraph
    lede_replacement = (
        f'<p class="lede">Engineering verification gates tracking claims to hard physical proof. '
        f'Currently <strong>{stats["open"]} open</strong> ({stats["blocks_purchase"]} blocking purchase), '
        f'<strong>{stats["in_verification"]} in verification</strong>, and '
        f'<strong>{stats["resolved"]} resolved</strong> out of {stats["total"]} total project gates.</p>'
    )
    open_content = re.sub(r'<p class="lede">.*?</p>', lede_replacement, open_content, flags=re.DOTALL)

    # Ensure Dashboard is inserted right after box info
    dash_html = build_dashboard_html(stats)
    if '<!-- STATE_DASHBOARD_START -->' in open_content:
        open_content = re.sub(
            r'<!-- STATE_DASHBOARD_START -->.*?<!-- STATE_DASHBOARD_END -->',
            dash_html,
            open_content,
            flags=re.DOTALL
        )
    elif 'id="state-dashboard"' in open_content:
        open_content = re.sub(
            r'<div id="state-dashboard".*?(?=\s*<h2\s+id="thread")',
            dash_html + '\n\n',
            open_content,
            flags=re.DOTALL
        )
    else:
        info_box_pattern = r'(<div class="box info">.*?</div>)'
        open_content = re.sub(info_box_pattern, rf'\1\n\n{dash_html}', open_content, flags=re.DOTALL)

    # Pre-render section subtitles
    sec_names = {
        "thread": "SRV-1 & BR-1 &mdash; Server and Thread router",
        "devices": "SW-1 &mdash; Tinxy switch plates and bathroom input",
        "behaviour": "Cross-cutting &mdash; behaviour and data"
    }

    for sec_key, sec_title in sec_names.items():
        if sec_key in stats["sections"]:
            sec_stat = stats["sections"][sec_key]
            sub_text = format_section_subtitle(sec_stat)
            badge_class = "badge-ok" if (sec_stat["open"] == 0 and sec_stat["in_verification"] == 0) else "badge-warn"
            pattern = rf'<h2 id="{sec_key}">.*?</h2>'
            replacement = f'<h2 id="{sec_key}">{sec_title} <span class="badge {badge_class}" id="{sec_key}-status-badge">{sub_text}</span></h2>'
            open_content = re.sub(pattern, replacement, open_content)

    # Pre-render table rows with state badges
    item_map = {it["id"]: it for it in state.get("open_items", [])}
    for item_id, it in item_map.items():
        row_id = item_id.lower().replace("-", "")
        badge_cls = get_status_badge_class(it["status"])
        status_lbl = it.get("status_label", it["status"].upper())

        # Match row start and its first td
        row_pattern = rf'(<tr id="{row_id}"[^>]*>)\s*<td class="num">.*?</td>'
        replacement = (
            rf'\1<td class="num"><strong>{item_id}</strong><br>'
            rf'<button class="badge {badge_cls} badge-interactive" data-item-id="{item_id}" '
            rf'title="Click to cycle status: Open → In Verification → Closed" style="margin-top:4px;border:none;cursor:pointer;">'
            rf'{status_lbl}</button></td>'
        )
        open_content = re.sub(row_pattern, replacement, open_content, flags=re.DOTALL)

    with open(open_html_path, "w", encoding="utf-8") as f:
        f.write(open_content)

    print("wiki/open.html static markup & dashboard successfully synchronized!")

if __name__ == "__main__":
    sync_wiki()
