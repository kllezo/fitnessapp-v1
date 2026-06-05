import os

def main():
    # ─── PATCH app.js ───
    filepath = 'app.js'
    print(f"Reading {filepath}...")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. Add Helper functions: getUserById, switchSocialTab, switchScorecardTab, addMockFriend, openChatWithUser
    helpers_code = """
// ─── Socials Restructure Custom Helpers ───
function getUserById(id) {
  if (state.auth.partner && state.auth.partner.id === id) {
    return state.auth.partner;
  }
  if (state.auth.matchedCandidate && state.auth.matchedCandidate.id === id) {
    return state.auth.matchedCandidate;
  }
  if (id === 'm_ravi') {
    return {
      id: 'm_ravi',
      name: 'Ravi V.',
      gender: 'male',
      age: 26,
      country: 'India',
      city: 'Bangalore',
      avatarInitials: 'RV',
      disciplineScore: 84,
      goals: ['muscle-gain', 'discipline'],
      ambition: 'ambitious',
      training: 'gym',
      profession: 'SWE',
      income: '50-100',
      schedule: 'evening',
      lifeGoals: ['discipline', 'career'],
      personality: 'intense',
      trustSignals: { streak: 85, recovery: 78, consistency: 88 },
      compatibilityPct: 82
    };
  }
  return (state.auth.friends || []).find(f => f.id === id);
}

function switchSocialTab(tabName) {
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
      btn.style.color = 'var(--text-1)';
      if (!btn.querySelector('.active-indicator')) {
        const ind = document.createElement('span');
        ind.className = 'active-indicator';
        ind.style.cssText = 'position:absolute; bottom:-9px; left:0; right:0; height:2.5px; background:var(--violet); border-radius:2px;';
        btn.appendChild(ind);
      }
    } else {
      btn.classList.remove('active');
      btn.style.color = 'var(--text-3)';
      btn.querySelector('.active-indicator')?.remove();
    }
  });

  document.querySelectorAll('.social-panel').forEach(panel => {
    if (panel.id === `panel-${tabName}`) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });
}

function switchScorecardTab(tabName) {
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
      btn.style.color = 'var(--text-1)';
      if (!btn.querySelector('.modal-active-indicator')) {
        const ind = document.createElement('span');
        ind.className = 'modal-active-indicator';
        ind.style.cssText = 'position:absolute; bottom:-7px; left:0; right:0; height:2px; background:var(--violet); border-radius:2px;';
        btn.appendChild(ind);
      }
    } else {
      btn.classList.remove('active');
      btn.style.color = 'var(--text-3)';
      btn.querySelector('.modal-active-indicator')?.remove();
    }
  });

  const profilePanel = el('scorecard-panel-profile');
  const compatPanel = el('scorecard-panel-compatibility');
  if (tabName === 'profile') {
    profilePanel?.classList.remove('hidden');
    compatPanel?.classList.add('hidden');
  } else {
    profilePanel?.classList.add('hidden');
    compatPanel?.classList.remove('hidden');
  }
}

function addMockFriend(type) {
  playSound('done');
  
  // Close sheet
  const sheet = el('add-friend-sheet');
  const backdrop = el('add-friend-backdrop');
  if (sheet) {
    sheet.style.transform = 'translateY(100%)';
    if (backdrop) backdrop.classList.remove('visible');
    setTimeout(() => {
      sheet.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
    }, 300);
  }
  
  // Generate a mock friend based on the type
  let newFriend = null;
  const idSuffix = Date.now().toString().slice(-4);
  
  if (type === 'spouse') {
    newFriend = {
      id: 'f_spouse_' + idSuffix,
      name: 'Kavya (Spouse)',
      type: 'spouse',
      gender: 'female',
      age: 24,
      country: 'India',
      city: 'Pune',
      avatarInitials: 'KV',
      disciplineScore: 90,
      goals: ['discipline', 'weight-loss'],
      ambition: 'consistent',
      training: 'home',
      schedule: 'morning',
      active: true,
      streak: 5
    };
  } else if (type === 'family') {
    newFriend = {
      id: 'f_family_' + idSuffix,
      name: 'Amit (Cousin)',
      type: 'family',
      gender: 'male',
      age: 22,
      country: 'India',
      city: 'Delhi',
      avatarInitials: 'AM',
      disciplineScore: 82,
      goals: ['muscle-gain', 'strength'],
      ambition: 'casual',
      training: 'gym',
      schedule: 'evening',
      active: false,
      streak: 2
    };
  } else {
    // gym_buddy / training_buddy
    newFriend = {
      id: 'f_gym_' + idSuffix,
      name: 'Karan S.',
      type: 'training_buddy',
      gender: 'male',
      age: 26,
      country: 'India',
      city: 'Bangalore',
      avatarInitials: 'KS',
      disciplineScore: 94,
      goals: ['strength', 'hybrid'],
      ambition: 'ambitious',
      training: 'gym',
      schedule: 'evening',
      active: true,
      streak: 18
    };
  }
  
  if (!state.auth.friends) state.auth.friends = [];
  state.auth.friends.unshift(newFriend);
  
  addNotification('social', 'Friend Added 👤', `${newFriend.name} has been added to your accountability group.`, todayKey());
  
  renderFriendsUI();
  renderInbox();
  saveToStorage();
  showSaveSuccessFeedback();
}

function openChatWithUser(userId) {
  playSound('tap');
  const chatOverlay = el('chat-screen-overlay');
  if (!chatOverlay) return;

  const user = getUserById(userId);
  if (!user) return;

  state.auth.activeChatUser = userId;
  el('chat-header-name').textContent = user.name;

  // Populate initial simulated messages if none exist
  if (!state.auth.chats[userId]) {
    state.auth.chats[userId] = [
      { sender: 'them', text: `Hey! Aligned with you on the accountability path. Let's compound discipline!`, time: '2h ago' }
    ];
  }

  renderChatMessages();

  chatOverlay.classList.remove('hidden');
  void chatOverlay.offsetWidth;
  chatOverlay.classList.add('visible');
}
"""
    # Insert helper code after state declaration
    content = content.replace("const state = {", helpers_code + "\nconst state = {")

    # 2. Modify startMatchingSearch & resumeMatchingSearch to set mpc subtitle text
    # In resumeMatchingSearch, we will also ensure el('match-pending-card') fields are set
    # Let's inspect target resumeMatchingSearch and patch it.
    target_resume = """function resumeMatchingSearch() {
  if (state.auth.matchTimer) clearTimeout(state.auth.matchTimer);
  
  state.auth.matchTimer = setTimeout(() => {
    state.auth.matchPending = false;"""

    replacement_resume = """function resumeMatchingSearch() {
  if (state.auth.matchTimer) clearTimeout(state.auth.matchTimer);
  
  // Set matching pending details dynamically
  const mpc = el('match-pending-card');
  if (mpc) {
    const title = mpc.querySelector('.mpc-title');
    const sub = mpc.querySelector('.mpc-sub');
    if (title) title.textContent = "Finding your best accountability partner...";
    if (sub) sub.textContent = "This may take up to 24 hours.";
  }
  
  state.auth.matchTimer = setTimeout(() => {
    state.auth.matchPending = false;"""

    content = content.replace(target_resume, replacement_resume)

    # 3. Patch renderSocialsUI to handle State 1: Idle cleanly without automatic Ravi Request triggers
    # Let's see the old state check in renderSocialsUI:
    target_render_socials = """  } else if (state.auth.incomingRequestShown && !state.auth.partnerRequestDeclined) {
    // Incoming request Ravi V.
    incomingCard.classList.remove('hidden');
    if (statusText) {
      statusText.textContent = "Incoming Accountability Request";
      statusText.style.color = '#fb923c';
    }
  } else {
    // State 1: Idle
    findCard.classList.remove('hidden');
    if (statusText) {
      statusText.textContent = "Idle A Ready to Match";
      statusText.style.color = 'var(--text-3)';
    }
  }"""

    replacement_render_socials = """  } else if (state.auth.incomingRequestShown && !state.auth.partnerRequestDeclined && !partner) {
    // Incoming request Ravi V.
    incomingCard.classList.remove('hidden');
    if (statusText) {
      statusText.textContent = "Incoming Accountability Request";
      statusText.style.color = '#fb923c';
    }
  } else {
    // State 1: Idle
    findCard.classList.remove('hidden');
    if (statusText) {
      statusText.textContent = "Idle · Ready to Match";
      statusText.style.color = 'var(--text-3)';
    }
  }"""

    content = content.replace(target_render_socials, replacement_render_socials)

    # Let's clean up renderSocialsUI at the beginning to hide the incoming requests if not shown
    target_render_socials_start = """function renderSocialsUI() {
  const findCard = el('find-partner-card');
  const pendingCard = el('match-pending-card');
  const incomingCard = el('incoming-request-card');
  const statusText = el('find-partner-status-text');
  
  if (!findCard || !pendingCard || !incomingCard) return;
  
  // Hide all find-partner cards by default
  findCard.classList.add('hidden');
  pendingCard.classList.add('hidden');
  incomingCard.classList.add('hidden');"""

    replacement_render_socials_start = """function renderSocialsUI() {
  const findCard = el('find-partner-card');
  const pendingCard = el('match-pending-card');
  const incomingCard = el('incoming-request-card');
  const statusText = el('find-partner-status-text');
  
  if (!findCard || !pendingCard || !incomingCard) return;
  
  // Hide all find-partner cards by default
  findCard.classList.add('hidden');
  pendingCard.classList.add('hidden');
  incomingCard.classList.add('hidden');
  
  // Remove dynamic candidate card if any
  el('aura-match-candidate-card')?.remove();
  
  // Hide the legacy/busy cards to keep the UI clean, minimal and intentional
  el('match-status-card')?.classList.add('hidden');
  el('compatibility-filters-summary-card')?.classList.add('hidden');"""

    # Let's remove any duplicates
    content = content.replace(target_render_socials_start, replacement_render_socials_start)

    # 4. Remove simulated incoming request from onEnterSquad
    target_on_enter_squad = """  // Trigger simulated incoming request
  if (!state.auth.partner && !state.auth.matchPending && !state.auth.incomingRequestShown) {
    state.auth.incomingRequestShown = true;
    setTimeout(() => {
      if (state.currentScreen === 'screen-squad' && !state.auth.partner && !state.auth.matchPending) {
        playSound('chime');
        renderSocialsUI();
        addNotification('social', 'Incoming Request dY ?', 'Ravi V. (82% compatible) wants to be your accountability partner.', todayKey());
        showSaveSuccessFeedback();
      }
    }, 4500);
  }"""
    
    # We will replace it with nothing (or a commented block) to deactivate the automatic trigger
    content = content.replace(target_on_enter_squad, "  // Automatic simulated requests disabled for clean Idle state.")

    # 5. Rewrite sendAccountabilityRequest to match instantly
    target_send_req = """function sendAccountabilityRequest(candidateId) {
  playSound('done');
  
  const candidate = SIMULATED_MATCHES.find(c => c.id === candidateId);
  if (!candidate) return;
  
  const backdrop = el('match-confirm-backdrop');
  if (backdrop) {
    backdrop.classList.remove('hidden');
    void backdrop.offsetWidth;
    backdrop.classList.add('visible');
  }
  
  const reqBtn = el('send-match-request-btn');
  if (reqBtn) {
    reqBtn.textContent = 'o Request Submitted (Pending)';
    reqBtn.disabled = true;
    reqBtn.style.opacity = '0.75';
    reqBtn.style.background = 'var(--surface-3)';
  }
  
  // Simulate Arjun K. accepting your request after 10 seconds!
  setTimeout(() => {
    backdrop?.classList.remove('visible');
    setTimeout(() => backdrop?.classList.add('hidden'), 300);
    
    const user = state.auth.user || { name: 'Praneeth' };
    const pct = calculateCompatibility(user, candidate);
    
    state.auth.partner = {
      ...candidate,
      compatibilityPct: pct
    };
    state.auth.matchedCandidate = null;
    
    addNotification('social', 'Partnership Active! dY ?', `${candidate.name} accepted your accountability request. Let's build consistency together.`, todayKey());
    playSound('chime');
    
    renderSocialsUI();
    switchSocialTab('partner');
    saveToStorage();
  }, 10000);
}"""

    replacement_send_req = """function sendAccountabilityRequest(candidateId) {
  playSound('done');
  
  const candidate = SIMULATED_MATCHES.find(c => c.id === candidateId);
  if (!candidate) return;
  
  const user = state.auth.user || { name: 'Praneeth' };
  const pct = calculateCompatibility(user, candidate);
  
  state.auth.partner = {
    ...candidate,
    compatibilityPct: pct
  };
  state.auth.matchedCandidate = null;
  state.auth.matchPending = false;
  
  addNotification('social', 'Partnership Established 🤝', `You are now matched with ${candidate.name}. Stay consistent!`, todayKey());
  playSound('chime');
  
  renderSocialsUI();
  switchSocialTab('partner');
  saveToStorage();
  showSaveSuccessFeedback();
}"""

    content = content.replace(target_send_req, replacement_send_req)

    # 6. Rewrite inspectPartnerScorecard(user)
    target_inspect = """// "?"?"? Inspect Scorecard "?"?"?
function inspectPartnerScorecard() {
  playSound('tap');
  const backdrop = el('scorecard-backdrop');
  const container = el('scorecard-content');
  const partner = state.auth.partner;
  if (!backdrop || !container || !partner) return;
  
  const formatMap = { gym: 'dY?<,? Gym Mode', home: 'dY? Home Mode', hybrid: 's Hybrid Mode', outdoor: 'dYO, Outdoor Mode' };
  
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; margin-bottom:20px;">
      <div style="width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg, var(--mint), #059669); color:#fff; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800;">
        ${(partner.avatarInitials || partner.name || 'AK').substring(0,2).toUpperCase()}
      </div>
      <div>
        <h3 style="font-size:18px; font-weight:800; color:var(--text-1);">${partner.name}</h3>
        <p style="font-size:11px; color:var(--text-3); margin-top:2px;">${partner.city}, ${partner.country}</p>
      </div>
      <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:4px 12px; border-radius:12px; font-size:11px; font-weight:800; color:var(--mint);">
        ${partner.compatibilityPct}% Compatibility Aligned
      </div>
    </div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px;">
      <div style="background:var(--surface-3); border:1px solid var(--border); padding:10px; border-radius:14px; text-align:center;">
        <span style="font-size:18px; font-weight:800; color:var(--text-1); display:block;">${partner.disciplineScore}</span>
        <span style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.04em;">Discipline Score</span>
      </div>
      <div style="background:var(--surface-3); border:1px solid var(--border); padding:10px; border-radius:14px; text-align:center;">
        <span style="font-size:18px; font-weight:800; color:var(--accent); display:block;">${partner.trustSignals?.streak || 4}d</span>
        <span style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.04em;">Activity Streak</span>
      </div>
    </div>
    
    <div style="background:var(--surface-3); border:1px solid var(--border); border-radius:16px; padding:12px 14px; margin-bottom:20px; display:flex; flex-direction:column; gap:8px;">
      <p style="font-size:9px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:2px;">Demographics & Style</p>
      <div style="display:flex; justify-content:space-between; font-size:12px;">
        <span style="color:var(--text-2);">Profession:</span>
        <span style="font-weight:600; color:var(--text-1);">${partner.profession.toUpperCase()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px;">
        <span style="color:var(--text-2);">Ambition:</span>
        <span style="font-weight:600; color:var(--text-1);">${(partner.ambition || 'consistent').toUpperCase()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px;">
        <span style="color:var(--text-2);">Setup:</span>
        <span style="font-weight:600; color:var(--text-1);">${formatMap[partner.training] || partner.training}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px;">
        <span style="color:var(--text-2);">Schedule:</span>
        <span style="font-weight:600; color:var(--text-1);">${(partner.schedule || 'evening').toUpperCase()}</span>
      </div>
    </div>
  `;
  
  backdrop.classList.remove('hidden');
  void backdrop.offsetWidth;
  backdrop.classList.add('visible');
}"""

    replacement_inspect = """// ─── Inspect Scorecard ───
function inspectPartnerScorecard(user) {
  playSound('tap');
  const backdrop = el('scorecard-backdrop');
  const container = el('scorecard-content');
  if (!backdrop || !container || !user) return;

  state.auth.activeScorecardUser = user;

  const initials = (user.avatarInitials || user.name || 'AK').substring(0, 2).toUpperCase();
  const formatMap = { gym: '🏋️ Gym Mode', home: '🏡 Home Mode', hybrid: '⚡ Hybrid Mode', outdoor: '🏃 Outdoor Mode' };
  
  const activeUser = state.auth.user || {
    goals: ['discipline'],
    disciplineScore: 78,
    ambition: 'consistent',
    training: 'gym',
    schedule: 'evening',
    profession: 'software'
  };
  const pct = user.compatibilityPct || calculateCompatibility(activeUser, user);

  // Generate compatibility reasons dynamically
  const reasons = [];
  if (Math.abs((activeUser.disciplineScore || 78) - (user.disciplineScore || 78)) <= 8) {
    reasons.push("⚡ Highly aligned discipline indices (" + (activeUser.disciplineScore || 78) + " vs " + (user.disciplineScore || 78) + ")");
  }
  const commonGoals = (activeUser.goals || []).filter(g => (user.goals || []).includes(g));
  if (commonGoals.length > 0) {
    reasons.push("🔥 Shared target focus: " + commonGoals.map(g => g.toUpperCase()).join(", "));
  }
  if (activeUser.ambition === user.ambition) {
    reasons.push("🎯 Identical mindset and ambition tier (" + user.ambition + ")");
  }
  if (activeUser.schedule === user.schedule) {
    reasons.push("📅 Synced workout schedules (" + user.schedule + ")");
  }
  if (activeUser.training === user.training) {
    reasons.push("💪 Matching workout setup environment");
  }
  if (reasons.length === 0) {
    reasons.push("🌱 Commits to daily check-ins and CNS-based fatigue pacing.");
  }

  container.innerHTML = `
    <!-- Top Summary -->
    <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; margin-bottom:16px;">
      <div style="width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, var(--mint), #059669); color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800;">
        ${initials}
      </div>
      <div>
        <h3 style="font-size:16px; font-weight:800; color:var(--text-1);">${user.name}</h3>
        <p style="font-size:11px; color:var(--text-3); margin-top:2px;">${user.city || 'Mumbai'}, ${user.country || 'India'}</p>
      </div>
      <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:4px 12px; border-radius:12px; font-size:11px; font-weight:800; color:var(--mint);">
        ${pct}% Compatibility
      </div>
    </div>

    <!-- Sub-tab Sub-navigation -->
    <div class="scorecard-tabs" style="display:flex; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px; gap:14px; margin-bottom:12px;">
      <button class="modal-tab-btn active" data-tab="profile" style="background:none; border:none; color:var(--text-1); font-family:var(--font); font-size:12px; font-weight:700; cursor:pointer; padding:4px 0; position:relative; transition:color 0.2s ease;">
        Profile
        <span class="modal-active-indicator" style="position:absolute; bottom:-7px; left:0; right:0; height:2px; background:var(--violet); border-radius:2px;"></span>
      </button>
      <button class="modal-tab-btn" data-tab="compatibility" style="background:none; border:none; color:var(--text-3); font-family:var(--font); font-size:12px; font-weight:700; cursor:pointer; padding:4px 0; position:relative; transition:color 0.2s ease;">
        Compatibility
      </button>
    </div>

    <!-- Tab Panels Container -->
    <div id="scorecard-panels-wrap" style="min-height:140px; margin-bottom:16px;">
      <!-- PANEL A: PROFILE -->
      <div class="scorecard-panel" id="scorecard-panel-profile">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
          <div style="background:var(--surface-3); border:1px solid var(--border); padding:8px; border-radius:10px; text-align:center;">
            <span style="font-size:16px; font-weight:800; color:var(--text-1); display:block;">${user.disciplineScore || 75}</span>
            <span style="font-size:8.5px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.04em;">Discipline Score</span>
          </div>
          <div style="background:var(--surface-3); border:1px solid var(--border); padding:8px; border-radius:10px; text-align:center;">
            <span style="font-size:16px; font-weight:800; color:var(--accent); display:block;">${user.streak || user.trustSignals?.streak || 0}d</span>
            <span style="font-size:8.5px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.04em;">Activity Streak</span>
          </div>
        </div>
        
        <div style="background:var(--surface-3); border:1px solid var(--border); border-radius:12px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span style="color:var(--text-2);">Profession:</span>
            <span style="font-weight:600; color:var(--text-1);">${(user.profession || 'Other').toUpperCase()}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span style="color:var(--text-2);">Ambition:</span>
            <span style="font-weight:600; color:var(--text-1);">${(user.ambition || 'consistent').toUpperCase()}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span style="color:var(--text-2);">Setup:</span>
            <span style="font-weight:600; color:var(--text-1);">${formatMap[user.training] || user.training || 'Gym'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span style="color:var(--text-2);">Schedule:</span>
            <span style="font-weight:600; color:var(--text-1);">${(user.schedule || 'evening').toUpperCase()}</span>
          </div>
        </div>
      </div>

      <!-- PANEL B: COMPATIBILITY -->
      <div class="scorecard-panel hidden" id="scorecard-panel-compatibility">
        <div style="background:var(--surface-3); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;">
          <p style="font-size:10px; font-weight:700; color:var(--violet); text-transform:uppercase; letter-spacing:0.06em;">Compatibility Reasons</p>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:11px; line-height:1.4;">
            ${reasons.map(r => `<div style="display:flex; gap:6px; align-items:flex-start;"><span>•</span><span>${r}</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Button -->
    <button class="primary-btn" id="scorecard-chat-btn" style="width:100%; margin:0;" data-user-id="${user.id}">
      Start Chat
    </button>
  `;

  backdrop.classList.remove('hidden');
  void backdrop.offsetWidth;
  backdrop.classList.add('visible');
}"""

    content = content.replace(target_inspect, replacement_inspect)

    # 7. Rewrite renderInbox()
    target_inbox = """function renderInbox() {
  const container = el('inbox-scroll');
  if (!container) return;
  container.innerHTML = '';
  
  const partner = state.auth.partner;
  const requests = [];
  
  // Simulated incoming request if not accepted and shown
  if (!partner && state.auth.incomingRequestShown && !state.auth.partnerRequestDeclined) {
    requests.push({
      id: 'm_ravi',
      name: 'Ravi V.',
      compatibilityPct: 82,
      disciplineScore: 84,
      profession: 'SWE'
    });
  }
  
  // Render Pending Requests
  if (requests.length > 0) {
    const title = document.createElement('p');
    title.className = 'section-label';
    title.style.marginBottom = '8px';
    title.textContent = 'Accountability Requests';
    container.appendChild(title);
    
    requests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'inbox-request-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1);">${req.name}</h4>
            <p style="font-size:10px; color:var(--text-3); margin-top:2px;">${req.profession.toUpperCase()} A India</p>
          </div>
          <span style="font-size:14px; font-weight:800; color:#fb923c;">${req.compatibilityPct}% Compat</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="primary-btn" id="inbox-accept-request-btn" style="flex:1; margin:0; padding:6px 12px; font-size:11px; background:linear-gradient(135deg, #fb923c, #f97316);" data-id="${req.id}">Accept</button>
          <button class="ghost-btn" id="inbox-decline-request-btn" style="flex:1; margin:0; padding:6px 12px; font-size:11px;" data-id="${req.id}">Decline</button>
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  // Render Active Chats / Match
  const chatTitle = document.createElement('p');
  chatTitle.className = 'section-label';
  chatTitle.style.cssText = 'margin-top:16px; margin-bottom:8px;';
  chatTitle.textContent = 'Discipline Chats';
  container.appendChild(chatTitle);
  
  if (partner) {
    const card = document.createElement('div');
    card.className = 'inbox-chat-card';
    card.innerHTML = `
      <div class="sm-avatar mint" style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, var(--mint), #059669); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0;">
        ${(partner.avatarInitials || partner.name || 'AK').substring(0,2).toUpperCase()}
      </div>
      <div style="flex:1; min-width:0;">
        <h4 style="font-size:13.5px; font-weight:700; color:var(--text-1);">${partner.name}</h4>
        <p style="font-size:11px; color:var(--text-3); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="inbox-last-msg">Active Partnership Established. Tap to coordinate.</p>
      </div>
      <span style="font-size:10px; color:var(--text-3); font-weight:700;">Active</span>
    `;
    card.addEventListener('click', () => openChatWithPartner());
    container.appendChild(card);
  } else {
    const noChats = document.createElement('div');
    noChats.style.cssText = `text-align:center; padding:30px 16px; background:var(--surface-2); border:1px dashed var(--border); border-radius:18px; margin-top:8px; opacity:0.6;`;
    noChats.innerHTML = `
      <span style="font-size:24px; display:block; margin-bottom:6px;">dY'</span>
      <p style="font-size:12px; font-weight:700; color:var(--text-2);">No Active Chats</p>
      <p style="font-size:10px; color:var(--text-3); margin-top:2px;">Coordinate daily focus after matches are accepted.</p>
    `;
    container.appendChild(noChats);
  }
}"""

    replacement_inbox = """function renderInbox() {
  const container = el('inbox-scroll');
  if (!container) return;
  container.innerHTML = '';
  
  const partner = state.auth.partner;
  const friends = state.auth.friends || [];
  const requests = [];
  
  // Simulated incoming request if not accepted and shown
  if (!partner && state.auth.incomingRequestShown && !state.auth.partnerRequestDeclined) {
    requests.push({
      id: 'm_ravi',
      name: 'Ravi V.',
      compatibilityPct: 82,
      disciplineScore: 84,
      profession: 'SWE'
    });
  }
  
  // Render Pending Requests
  if (requests.length > 0) {
    const title = document.createElement('p');
    title.className = 'section-label';
    title.style.marginBottom = '8px';
    title.textContent = 'Accountability Requests';
    container.appendChild(title);
    
    requests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'inbox-request-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1);">${req.name}</h4>
            <p style="font-size:10px; color:var(--text-3); margin-top:2px;">${req.profession.toUpperCase()} · India</p>
          </div>
          <span style="font-size:14px; font-weight:800; color:#fb923c;">${req.compatibilityPct}% Compat</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="primary-btn" id="inbox-accept-request-btn" style="flex:1; margin:0; padding:6px 12px; font-size:11px; background:linear-gradient(135deg, #fb923c, #f97316);" data-id="${req.id}">Accept</button>
          <button class="ghost-btn" id="inbox-decline-request-btn" style="flex:1; margin:0; padding:6px 12px; font-size:11px;" data-id="${req.id}">Decline</button>
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  // Render Active Chats / Match
  const chatTitle = document.createElement('p');
  chatTitle.className = 'section-label';
  chatTitle.style.cssText = 'margin-top:16px; margin-bottom:8px;';
  chatTitle.textContent = 'Discipline Chats';
  container.appendChild(chatTitle);
  
  let hasChats = false;
  
  if (partner) {
    hasChats = true;
    const card = document.createElement('div');
    card.className = 'inbox-chat-card';
    card.style.cursor = 'pointer';
    
    const msgs = state.auth.chats[partner.id] || [];
    const lastMsgText = msgs.length > 0 ? msgs[msgs.length - 1].text : "Active Partnership Established. Tap to coordinate.";

    card.innerHTML = `
      <div class="sm-avatar mint" style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, var(--mint), #059669); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0;">
        ${(partner.avatarInitials || partner.name || 'AK').substring(0,2).toUpperCase()}
      </div>
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; gap:6px;">
          <h4 style="font-size:13.5px; font-weight:700; color:var(--text-1);">${partner.name}</h4>
          <span style="font-size:9px; background:rgba(139,92,246,0.15); color:var(--violet); font-weight:700; padding:1px 6px; border-radius:6px; text-transform:uppercase;">Partner</span>
        </div>
        <p style="font-size:11px; color:var(--text-3); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="inbox-last-msg-${partner.id}">${lastMsgText}</p>
      </div>
      <span style="font-size:10px; color:var(--mint); font-weight:700;">Active</span>
    `;
    card.addEventListener('click', () => {
      inspectPartnerScorecard(partner);
    });
    container.appendChild(card);
  }

  // Friends
  friends.forEach(friend => {
    hasChats = true;
    const card = document.createElement('div');
    card.className = 'inbox-chat-card';
    card.style.cursor = 'pointer';
    
    const msgs = state.auth.chats[friend.id] || [];
    const lastMsgText = msgs.length > 0 ? msgs[msgs.length - 1].text : "Connect and compound discipline.";
    
    const colorBg = friend.type === 'spouse' 
      ? 'linear-gradient(135deg, #ec4899, #be185d)' 
      : (friend.type === 'family' ? 'linear-gradient(135deg, var(--mint), #059669)' : 'linear-gradient(135deg, var(--violet), #6d28d9)');

    card.innerHTML = `
      <div class="sm-avatar" style="width:40px; height:40px; border-radius:50%; background:${colorBg}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0;">
        ${(friend.avatarInitials || friend.name || 'FR').substring(0,2).toUpperCase()}
      </div>
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; gap:6px;">
          <h4 style="font-size:13.5px; font-weight:700; color:var(--text-1);">${friend.name}</h4>
          <span style="font-size:9px; background:var(--surface-3); color:var(--text-2); font-weight:700; padding:1px 6px; border-radius:6px; text-transform:uppercase;">${friend.type.replace('_', ' ')}</span>
        </div>
        <p style="font-size:11px; color:var(--text-3); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="inbox-last-msg-${friend.id}">${lastMsgText}</p>
      </div>
      <span style="font-size:10px; color:var(--text-3); font-weight:700;">${friend.active ? 'Active' : 'Offline'}</span>
    `;
    card.addEventListener('click', () => {
      inspectPartnerScorecard(friend);
    });
    container.appendChild(card);
  });
  
  if (!hasChats) {
    const noChats = document.createElement('div');
    noChats.style.cssText = `text-align:center; padding:30px 16px; background:var(--surface-2); border:1px dashed var(--border); border-radius:18px; margin-top:8px; opacity:0.6;`;
    noChats.innerHTML = `
      <span style="font-size:24px; display:block; margin-bottom:6px;">💬</span>
      <p style="font-size:12px; font-weight:700; color:var(--text-2);">No Active Chats</p>
      <p style="font-size:10px; color:var(--text-3); margin-top:2px;">Coordinate daily focus with friends and partner.</p>
    `;
    container.appendChild(noChats);
  }
}"""

    content = content.replace(target_inbox, replacement_inbox)

    # 8. Rewrite openChatWithPartner(), renderChatMessages(), and sendChatMessage()
    target_chat_funcs = """// "?"?"? Interactive Partner Chat Screen "?"?"?
function openChatWithPartner() {
  playSound('tap');
  const chatOverlay = el('chat-screen-overlay');
  if (!chatOverlay) return;
  
  const partner = state.auth.partner;
  if (!partner) return;
  
  el('chat-header-name').textContent = partner.name;
  
  // Populate initial simulated messages
  const exKey = partner.id;
  if (!state.auth.chats[exKey]) {
    state.auth.chats[exKey] = [
      { sender: 'them', text: `Hey! Aligned with you on the transformation journey. Let's lock in!`, time: '2h ago' }
    ];
  }
  
  renderChatMessages();
  
  chatOverlay.classList.remove('hidden');
  void chatOverlay.offsetWidth;
  chatOverlay.classList.add('visible');
}

function closeChat() {
  playSound('tap');
  const chatOverlay = el('chat-screen-overlay');
  if (chatOverlay) {
    chatOverlay.classList.remove('visible');
    setTimeout(() => chatOverlay.classList.add('hidden'), 320);
  }
}

function renderChatMessages() {
  const container = el('chat-msg-area');
  const partner = state.auth.partner;
  if (!container || !partner) return;
  
  container.innerHTML = '';
  const messages = state.auth.chats[partner.id] || [];
  
  messages.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${msg.sender === 'you' ? 'you' : 'them'}`;
    bubble.textContent = msg.text;
    container.appendChild(bubble);
  });
  
  // scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
  const input = el('chat-input-field');
  const partner = state.auth.partner;
  if (!input || !partner) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  playSound('done');
  
  const messages = state.auth.chats[partner.id] || [];
  messages.push({ sender: 'you', text: text, time: 'Just now' });
  state.auth.chats[partner.id] = messages;
  
  input.value = '';
  renderChatMessages();
  saveToStorage();
  
  // Simulate accountability partner response after 3 seconds!
  setTimeout(() => {
    if (state.auth.partner) {
      playSound('chime');
      messages.push({ sender: 'them', text: `Strong effort! Synced my check-in too. Keep compounding discipline! dY"`, time: 'Just now' });
      state.auth.chats[partner.id] = messages;
      renderChatMessages();
      saveToStorage();
      
      // Update inbox preview text too
      const preview = el('inbox-last-msg');
      if (preview) preview.textContent = "Partner: Strong effort! Synced my check-in too...";
    }
  }, 3500);
}"""

    replacement_chat_funcs = """// ─── Interactive Chats ───
function openChatWithPartner() {
  const partner = state.auth.partner;
  if (partner) {
    openChatWithUser(partner.id);
  }
}

function closeChat() {
  playSound('tap');
  const chatOverlay = el('chat-screen-overlay');
  if (chatOverlay) {
    chatOverlay.classList.remove('visible');
    setTimeout(() => chatOverlay.classList.add('hidden'), 320);
  }
}

function renderChatMessages() {
  const container = el('chat-msg-area');
  const activeUserId = state.auth.activeChatUser;
  if (!container || !activeUserId) return;
  
  container.innerHTML = '';
  const messages = state.auth.chats[activeUserId] || [];
  
  messages.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${msg.sender === 'you' ? 'you' : 'them'}`;
    bubble.textContent = msg.text;
    container.appendChild(bubble);
  });
  
  container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
  const input = el('chat-input-field');
  const activeUserId = state.auth.activeChatUser;
  if (!input || !activeUserId) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  playSound('done');
  
  const messages = state.auth.chats[activeUserId] || [];
  messages.push({ sender: 'you', text: text, time: 'Just now' });
  state.auth.chats[activeUserId] = messages;
  
  input.value = '';
  renderChatMessages();
  saveToStorage();
  
  // Simulate reply after 3.5 seconds
  setTimeout(() => {
    if (state.auth.activeChatUser === activeUserId) {
      playSound('chime');
      const isPartner = state.auth.partner && state.auth.partner.id === activeUserId;
      const respText = isPartner 
        ? "Strong effort! Synced my check-in too. Keep compounding discipline! 🔥" 
        : "Awesome to connect! Let's crush today's training. 💪";
      
      messages.push({ sender: 'them', text: respText, time: 'Just now' });
      state.auth.chats[activeUserId] = messages;
      renderChatMessages();
      saveToStorage();
      
      const preview = el('inbox-last-msg-' + activeUserId);
      if (preview) preview.textContent = (isPartner ? "Partner: " : "") + respText;
    }
  }, 3500);
}"""

    content = content.replace(target_chat_funcs, replacement_chat_funcs)

    # 9. Modify global event listeners in DOMContentLoaded to:
    # A) Bind click sub-tabs and scorecard tabs click
    # B) Bind add-friend-sheet click buttons
    # C) Resume matching search if matchPending is true on startup.
    # Let's see: we can append event delegations inside the click event listener.
    # We will find the click listener in app.js and append our checks.
    # The click listener starts with:
    # document.addEventListener('click', e => {
    #   const t = e.target;
    
    # We can inject our custom sub-tab, modal-tab, add-friend and scorecard clicks at the top of document.addEventListener('click', e => {
    target_click_start = """document.addEventListener('click', e => {
  const t = e.target;"""

    replacement_click_start = """document.addEventListener('click', e => {
  const t = e.target;

  // Socials sub-tabs click
  const subTabBtn = t.closest('.sub-tab-btn');
  if (subTabBtn) {
    playSound('tap');
    switchSocialTab(subTabBtn.dataset.tab);
    return;
  }

  // Scorecard modal sub-tabs click
  const modalTabBtn = t.closest('.modal-tab-btn');
  if (modalTabBtn) {
    playSound('tap');
    switchScorecardTab(modalTabBtn.dataset.tab);
    return;
  }

  // Open Add Friend Sheet
  if (t.id === 'add-friend-trigger-btn' || t.closest('#add-friend-trigger-btn')) {
    playSound('tap');
    const sheet = el('add-friend-sheet');
    const backdrop = el('add-friend-backdrop');
    if (sheet) {
      sheet.classList.remove('hidden');
      sheet.style.transform = 'translateY(0)';
      if (backdrop) {
        backdrop.classList.remove('hidden');
        void backdrop.offsetWidth;
        backdrop.classList.add('visible');
      }
    }
    return;
  }

  // Close Add Friend Sheet
  if (t.id === 'add-friend-close' || t.closest('#add-friend-close') || t.id === 'add-friend-backdrop') {
    playSound('tap');
    const sheet = el('add-friend-sheet');
    const backdrop = el('add-friend-backdrop');
    if (sheet) {
      sheet.style.transform = 'translateY(100%)';
      if (backdrop) backdrop.classList.remove('visible');
      setTimeout(() => {
        sheet.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
      }, 300);
    }
    return;
  }

  // Add friend options clicks
  const addFriendOptBtn = t.closest('.add-friend-opt-btn');
  if (addFriendOptBtn) {
    const type = addFriendOptBtn.dataset.type;
    if (type === 'existing') {
      playSound('tap');
      el('friend-search-input-wrap')?.classList.toggle('hidden');
    } else {
      addMockFriend(type);
    }
    return;
  }

  // Scorecard Chat CTA click
  if (t.id === 'scorecard-chat-btn' || t.closest('#scorecard-chat-btn')) {
    const btn = t.id === 'scorecard-chat-btn' ? t : t.closest('#scorecard-chat-btn');
    const userId = btn.dataset.userId;
    closePartnerScorecard();
    closeInbox();
    openChatWithUser(userId);
    return;
  }"""

    content = content.replace(target_click_start, replacement_click_start)

    # 10. Let's find friend-search-confirm in click delegation or add it.
    # We will add it below the options click.
    # Actually, we can add it directly in the replacement:
    replacement_click_start_extended = replacement_click_start + """

  // Search and Add Friend ID click
  if (t.id === 'friend-search-confirm' || t.closest('#friend-search-confirm')) {
    const input = el('friend-search-input');
    const val = input ? input.value.trim() : '';
    if (val) {
      playSound('done');
      const name = val.replace('@', '');
      const initials = name.slice(0, 2).toUpperCase();
      const idSuffix = Date.now().toString().slice(-4);
      
      const newFriend = {
        id: 'f_searched_' + idSuffix,
        name: name + ' (Friend)',
        type: 'local_friend',
        gender: 'male',
        age: 25,
        country: 'India',
        city: 'Mumbai',
        avatarInitials: initials || 'FR',
        disciplineScore: 75,
        goals: ['discipline'],
        ambition: 'consistent',
        training: 'gym',
        schedule: 'evening',
        active: false,
        streak: 0
      };
      
      if (!state.auth.friends) state.auth.friends = [];
      state.auth.friends.unshift(newFriend);
      
      if (input) input.value = '';
      el('friend-search-input-wrap')?.classList.add('hidden');
      
      const sheet = el('add-friend-sheet');
      const backdrop = el('add-friend-backdrop');
      if (sheet) {
        sheet.style.transform = 'translateY(100%)';
        if (backdrop) backdrop.classList.remove('visible');
        setTimeout(() => {
          sheet.classList.add('hidden');
          if (backdrop) backdrop.classList.add('hidden');
        }, 300);
      }
      
      addNotification('social', 'Friend Added 👤', `${newFriend.name} has been added via search.`, todayKey());
      renderFriendsUI();
      renderInbox();
      saveToStorage();
      showSaveSuccessFeedback();
    }
    return;
  }"""

    content = content.replace(replacement_click_start, replacement_click_start_extended)

    # 11. Add resume search check in DOMContentLoaded
    target_dom_content = """  // Restore persisted state
  const restored = loadFromStorage();
  if (restored) {
    recalculateSmartProtein();
    if (state.readiness) {
      applyRecoveryTheme(state.readiness);
      buildWorkoutSplit();
      buildFakeHistory();
    }
    updateObProgress();
  }"""

    replacement_dom_content = """  // Restore persisted state
  const restored = loadFromStorage();
  if (restored) {
    recalculateSmartProtein();
    if (state.readiness) {
      applyRecoveryTheme(state.readiness);
      buildWorkoutSplit();
      buildFakeHistory();
    }
    updateObProgress();
    
    // Resume active search if pending
    if (state.auth && state.auth.matchPending) {
      resumeMatchingSearch();
    }
  }"""

    content = content.replace(target_dom_content, replacement_dom_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("app.js patching complete.")

if __name__ == '__main__':
    main()
