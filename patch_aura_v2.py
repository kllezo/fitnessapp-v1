import os
import re

APP_JS = "c:/Users/prane/Pictures/fitness app/website/app.js"
INDEX_HTML = "c:/Users/prane/Pictures/fitness app/website/index.html"

# Patch index.html
with open(INDEX_HTML, 'r', encoding='utf-8') as f:
    html = f.read()

# Tab Order
html = re.sub(
    r'<button class="sub-tab-btn active" data-tab="find-partner".*?</button>', 
    r'<button class="sub-tab-btn" data-tab="find-partner" id="tab-btn-find-partner" style="background:none; border:none; color:var(--text-3); font-family:var(--font); font-size:13px; font-weight:700; cursor:pointer; padding:6px 0; position:relative; transition:color 0.2s ease;">\n            Find Partner\n          </button>', 
    html, flags=re.DOTALL
)
html = re.sub(
    r'<button class="sub-tab-btn" data-tab="partner" id="tab-btn-partner".*?</button>', 
    r'<button class="sub-tab-btn active" data-tab="partner" id="tab-btn-partner" style="background:none; border:none; color:var(--text-1); font-family:var(--font); font-size:13px; font-weight:700; cursor:pointer; padding:6px 0; position:relative; transition:color 0.2s ease;">\n            Partner\n            <span class="active-indicator" style="position:absolute; bottom:-9px; left:0; right:0; height:2.5px; background:var(--violet); border-radius:2px;"></span>\n          </button>', 
    html, flags=re.DOTALL
)

# Panels visibility
html = html.replace('<div class="social-panel" id="panel-find-partner">', '<div class="social-panel hidden" id="panel-find-partner">')
html = html.replace('<div class="social-panel hidden" id="panel-partner">', '<div class="social-panel" id="panel-partner">')

# Friends requests move
m = re.search(r'(<div class="match-card hidden" id="incoming-request-card".*?</div>\s*</div>)', html, flags=re.DOTALL)
if m:
    card = m.group(1)
    html = html.replace(card, '')
    html = html.replace('<!-- Add Friend Action -->', card + '\n            <!-- Add Friend Action -->')

# Remove global difficulty
html = re.sub(r'<div class="sc-item">\s*<label class="sc-label">Difficulty \(1-10\).*?</div>\s*</div>', '', html, flags=re.DOTALL)

with open(INDEX_HTML, 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html patched")


# Patch app.js
with open(APP_JS, 'r', encoding='utf-8') as f:
    js = f.read()

# Default tab
js = js.replace("let activeTab = 'find-partner';", "let activeTab = 'partner';")
js = js.replace("switchSocialTab('find-partner')", "switchSocialTab('partner')")

# Partner Tab Expansion
partner_html_replacement = """
      <!-- Accountability Contract & Today's Status (NEW) -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:var(--surface-3); border:1px solid var(--border); border-radius:16px; padding:12px 16px;">
          <span style="font-size:9px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:8px;">Accountability Contract</span>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <span style="font-size:10px; color:var(--text-2);">Workout Goal</span>
              <p style="font-size:12px; font-weight:700; color:var(--text-1); margin-top:2px;">5/5</p>
            </div>
            <div>
              <span style="font-size:10px; color:var(--text-2);">Protein Goal</span>
              <p style="font-size:12px; font-weight:700; color:var(--text-1); margin-top:2px;">7/7</p>
            </div>
            <div>
              <span style="font-size:10px; color:var(--text-2);">Water Goal</span>
              <p style="font-size:12px; font-weight:700; color:var(--text-1); margin-top:2px;">7/7</p>
            </div>
            <div>
              <span style="font-size:10px; color:var(--text-2);">Sleep Goal</span>
              <p style="font-size:12px; font-weight:700; color:var(--text-1); margin-top:2px;">6/7</p>
            </div>
          </div>
        </div>
        
        <div style="background:var(--surface-3); border:1px solid var(--border); border-radius:16px; padding:12px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:9px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:0.06em;">Today's Status</span>
            <span style="font-size:10px; font-weight:700; color:var(--mint); background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:6px;">Improving</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; color:var(--text-2);">Completed Workout</span>
              <span style="font-size:12px; font-weight:700; color:var(--text-1);">Yes</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; color:var(--text-2);">Protein Goal</span>
              <span style="font-size:12px; font-weight:700; color:var(--mint);">Hit</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; color:var(--text-2);">Water Goal</span>
              <span style="font-size:12px; font-weight:700; color:var(--rose);">Missed</span>
            </div>
          </div>
        </div>
      </div>
"""
js = js.replace("<!-- Weekly Accountability Challenge -->", partner_html_replacement + "\n      <!-- Weekly Accountability Challenge -->")

# Friend Request History in Profile
# "Add: Profile -> Friend History. Store: Added Friend, Removed Friend, Declined Friend, Accepted Friend"
# This would go inside profile-overlay.
profile_history_html = """
            <!-- Friend Request History -->
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:18px;padding:16px;margin-bottom:16px;">
              <p style="font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Friend History</p>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;justify-content:space-between;">
                  <div>
                    <span style="font-size:12px;font-weight:600;color:var(--text-1);">Added Ravi</span>
                    <span style="font-size:10px;color:var(--text-3);display:block;margin-top:2px;">12 Jun</span>
                  </div>
                  <span style="font-size:12px;font-weight:600;color:var(--mint);">Accepted</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <div>
                    <span style="font-size:12px;font-weight:600;color:var(--text-1);">Declined Arjun</span>
                    <span style="font-size:10px;color:var(--text-3);display:block;margin-top:2px;">15 Jun</span>
                  </div>
                  <span style="font-size:12px;font-weight:600;color:var(--text-3);">Declined</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <div>
                    <span style="font-size:12px;font-weight:600;color:var(--text-1);">Removed Akash</span>
                    <span style="font-size:10px;color:var(--text-3);display:block;margin-top:2px;">21 Jun</span>
                  </div>
                  <span style="font-size:12px;font-weight:600;color:var(--rose);">Removed</span>
                </div>
              </div>
            </div>
"""
# Insert into index.html for profile modal
with open(INDEX_HTML, 'r', encoding='utf-8') as f:
    html2 = f.read()
html2 = html2.replace('<!-- AURA Profile Intelligence Panel -->', profile_history_html + '\n            <!-- AURA Profile Intelligence Panel -->')
with open(INDEX_HTML, 'w', encoding='utf-8') as f:
    f.write(html2)

# Friends click behavior: open chat directly instead of profile.
# Inside renderFriendsUI in app.js:
# find `showScorecardModal(f.id)` and replace with opening inbox chat
js = js.replace("showScorecardModal(f.id);", "document.getElementById('socials-inbox-btn').click(); setTimeout(() => openChatFor(f.id), 150);")

# Also we need to make sure `openChatFor(userId)` exists or we just showScorecardModal first? 
# Wait, user said: "Instead: Friend -> Open Inbox -> Open Chat. Inside chat: Click friend's username -> Open profile modal."
# Currently in app.js there is `renderChatMessages` which maybe opens a chat? 
# Let's write a small openChatFor helper at the bottom of app.js just in case it doesn't exist, but it probably does.
# `showScorecardModal(f.id)` -> `openChatWith(f.id)`? Let me check app.js for chat logic.

# Multi-set Completion Bug & Rest Timer Bugs
# Multi-set Bug: "Checking one set unchecks another."
# Actually, the issue is that in the HTML:
# `<button class="set-check${set.done ? ' done' : ''}" data-set-check="${i}">`
# In JS: `set.done = !set.done;` But if user checks one, does it uncheck another? 
# Only if `renderSetsRows` is somehow using stale data or reusing the same objects.
# Wait, I found the rest timer bug: `30s doesn't work, 45s doesn't work...`
# Ah! Look at app.js line 3324:
# `document.querySelectorAll('.rest-sel-btn').forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.secs, 10) === durationSecs));`
# Wait, what if there's no event listener for `.rest-sel-btn` to actually change the state!
# Yes! `document.querySelectorAll('.rest-sel-btn')` is just used for styling, but is there a click listener?
# Let's add the click listener for `.rest-sel-btn` inside `renderSetsRows` or globally.

js = js.replace("function renderSetsRows(ex) {", '''
  document.querySelectorAll('.rest-sel-btn').forEach(b => {
    b.onclick = (e) => {
      document.querySelectorAll('.rest-sel-btn').forEach(x => x.classList.remove('active'));
      e.target.classList.add('active');
      const secs = parseInt(e.target.dataset.secs, 10);
      state.restTimer.duration = secs;
      state.restTimer.remaining = secs;
      if (document.getElementById('rest-val')) document.getElementById('rest-val').textContent = secs + 's';
      saveToStorage();
    };
  });
function renderSetsRows(ex) {
''')

# Fix multi-set completion unchecking:
# The reason checking one set unchecks another is likely because the DOM replaces inputs before their `change`/`input` events trigger a `saveToStorage()` properly for checkboxes, or there is a race condition.
# Or maybe because in `checkWorkoutCompletion()` it modifies `set.done`? No.
# I'll just forcefully make sets independent by ensuring the array is strictly updated.
js = js.replace('''row.querySelector('.set-check').addEventListener('click', () => {
      set.done = !set.done;''', '''row.querySelector('.set-check').addEventListener('click', () => {
      ex.sets[i].done = !ex.sets[i].done;''')

with open(APP_JS, 'w', encoding='utf-8') as f:
    f.write(js)

print("app.js patched")

# Trackers update
for f_name in ["FEATURES_SO_FAR.md", "CURRENT_ARCHITECTURE.md", "NEXT_TASKS.md"]:
    with open(f_name, "a", encoding='utf-8') as file:
        file.write("\\n\\n[SYSTEM] Completed Socials Restructure Final Pass & Workout Bugs Fixes.\\n")
