import os
import re

INDEX_HTML = 'index.html'
APP_JS = 'app.js'

with open(INDEX_HTML, 'r', encoding='utf-8') as f:
    html = f.read()

# Add Active Partnership Exists state to Find Partner Panel
partnership_exists_html = """
            <!-- Active Partnership Exists state (hidden by default) -->
            <div id="active-partnership-card" class="hidden" style="background:var(--surface-2); border:1px solid var(--border); border-radius:20px; padding:20px; text-align:center;">
              <span style="font-size:36px; display:block; margin-bottom:12px;">🏆</span>
              <p style="font-size:14px; font-weight:800; color:var(--text-1);">Active Partnership Exists</p>
              <p style="font-size:12px; color:var(--text-3); margin-top:6px; line-height:1.45;">You are currently matched with an accountability partner. Check the Partner tab for details.</p>
              <button class="primary-btn" id="go-to-partner-tab-btn" style="margin-top:16px;font-size:12px;width:100%;">View Partner</button>
            </div>
"""

# Insert right after <div class="social-panel hidden" id="panel-find-partner">
if 'Active Partnership Exists' not in html:
    html = html.replace('<div class="social-panel hidden" id="panel-find-partner">', '<div class="social-panel hidden" id="panel-find-partner">' + partnership_exists_html)

with open(INDEX_HTML, 'w', encoding='utf-8') as f:
    f.write(html)


with open(APP_JS, 'r', encoding='utf-8') as f:
    js = f.read()

# Make sure renderSocialsUI shows the Active Partnership Exists card if matched.
# Searching for renderSocialsUI or similar matching logic.
# Wait, let's inject a global check in renderSocialsUI or when Socials is opened.
render_socials_injection = """
  // Update Find Partner panel visibility based on partner state
  const findCard = document.getElementById('find-partner-card');
  const activeCard = document.getElementById('active-partnership-card');
  const matchStatus = document.getElementById('match-status-card');
  const compatFilters = document.getElementById('compatibility-filters-summary-card');
  const pendingCard = document.getElementById('match-pending-card');
  if (state.auth.partner) {
    if (findCard) findCard.classList.add('hidden');
    if (matchStatus) matchStatus.classList.add('hidden');
    if (compatFilters) compatFilters.classList.add('hidden');
    if (pendingCard) pendingCard.classList.add('hidden');
    if (activeCard) activeCard.classList.remove('hidden');
  } else {
    if (activeCard) activeCard.classList.add('hidden');
    if (findCard && !state.auth.isSearching) findCard.classList.remove('hidden');
  }
"""

js = js.replace("function renderSocialsUI() {", "function renderSocialsUI() {" + render_socials_injection)

# Add event listener for go-to-partner-tab-btn
js = js.replace("if (t.id === 'find-partner-btn') {", """
  if (t.id === 'go-to-partner-tab-btn') {
    switchSocialTab('partner');
    playSound('tap');
  }
  if (t.id === 'find-partner-btn') {""")

with open(APP_JS, 'w', encoding='utf-8') as f:
    f.write(js)

# Trackers update
for f_name in ["FEATURES_SO_FAR.md", "CURRENT_ARCHITECTURE.md", "NEXT_TASKS.md"]:
    with open(f_name, "a", encoding='utf-8') as file:
        file.write("\\n\\n[SYSTEM] Completed UX Cleanup & Socials Finalization Pass (Partner Tab cleaned, Active Partnership state added).\\n")
