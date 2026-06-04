/* ═══════════════════════════════════════════
   AURA — Adaptive Fitness OS
   Full Interactive Engine v3.0
═══════════════════════════════════════════ */

'use strict';

// ─── Global State ──────────────────────────────────────────────────────────
const state = {
  currentScreen: 'screen-splash',
  currentTab: 'home', // home | train | diet | recovery | socials

  auth: {
    loggedIn: false,
    user: null, // Active user details
    users: [],  // Simulated database of local user accounts
    signupStep: 0,
    avatar: null,
    matchingPreferences: {
      gender: 'any',
      age: '23-27',
      ambition: 'consistent',
      goal: 'discipline',
      location: 'country',
      training: 'gym'
    },
    matchingEnabled: true,
    hideCity: false,
    privateProfile: false,
    notificationsEnabled: true,
    matchPending: false,
    matchTimer: null,
    partner: null,
    friends: [], // Circle of accountability friends
    chats: {}, // Simulated conversations database
  },

  notifications: [
    { id: 'n1', type: 'system', title: 'AURA Active ✦', message: 'Welcome to AURA. The discipline shield is online.', time: 'Just now', read: false },
    { id: 'n2', type: 'recovery', title: 'CNS Readiness', message: 'CNS Readiness optimal. Ready for a controlled training session.', time: '2h ago', read: false }
  ],

  onboarding: {
    step: 0,
    goals: [],
    height: 172,
    weight: 70,
    age: 21,
    gymEnv: 'gym',
    sleep: 7,
    diet: 'veg',
    lifestyle: 'hostel',
    budget: 'low',
    identity: 'scholar',
    experience: 'beginner',
    equipment: [],
    customEquipment: '',
  },

  vision: {
    checks: [false, false, false],
  },

  checkIn: {
    step: 0,
    answers: { soreness: null, stress: null, sleep: null, energy: null },
    done: false,
  },

  readiness: 0,
  mvsEnabled: false,

  workout: {
    weekSplit: [
      { day: 'Mon', type: 'Push',   focus: 'Chest · Shoulders',  exercises: null, rest: false },
      { day: 'Tue', type: 'Pull',   focus: 'Back · Biceps',       exercises: null, rest: false },
      { day: 'Wed', type: 'Legs',   focus: 'Quads · Hamstrings',  exercises: null, rest: false },
      { day: 'Thu', type: 'Rest',   focus: 'Active Recovery',     exercises: null, rest: true  },
      { day: 'Fri', type: 'Push',   focus: 'Chest · Triceps',     exercises: null, rest: false },
      { day: 'Sat', type: 'Legs',   focus: 'Lower Body',          exercises: null, rest: false },
      { day: 'Sun', type: 'Rest',   focus: 'Full Rest',           exercises: null, rest: true  },
    ],
    // Today is Saturday → index 5
    todayIndex: 5,
    exercises: [],
    activeExId: null,
    calView: 'today',
    selectedCalDay: null,
    monthOffset: 0,
    history: {}, // { 'YYYY-MM-DD': { logged: true, exercises: [...], notes: '' } }
  },

  nutrition: {
    hostelMode: false,
    budgetMode: false,
    loggedCal: 0,
    loggedProt: 0,
    loggedWater: 0,
    loggedMeals: new Set(),
    targetCal: 2100,
    targetProt: 110,
  },

  recovery: {
    breathingActive: false,
    breathingPhase: 0, // 0 inhale, 1 hold, 2 exhale, 3 hold
    breathingTimer: null,
    phaseSeconds: 0,
    ambientPlaying: false,
    ambientCtx: null,
    ambientNode: null,
    ambientGain: null,
  },

  audio: {
    ctx: null,
  },

  restTimer: {
    running: false,
    intervalId: null,
    remaining: 60,
    duration: 60,
  },

  activeSheet: {
    exId: null,
  },

  energyMode: 'standard', // 'full-push' | 'standard' | 'recovery' | 'mvs'
  sessionStarted: false,
  celebrationShown: false,
  whyIndex: 0,
  whyTimer: null,
  sessionNotes: {},
  prs: {}, // { exId: { weight: maxWeight } } — personal records tracker
};

// ─── Exercise Database ─────────────────────────────────────────────────────
const ADAPTIVE_GYM_DB = {
  push: [
    { id: 'bp',    name: 'Barbell Bench Press', muscle: 'Chest',         icon: '🏋️', defaultWeight: 60, defaultReps: 8 },
    { id: 'ohp',   name: 'Overhead Press',      muscle: 'Shoulders',     icon: '⬆️', defaultWeight: 40, defaultReps: 8 },
    { id: 'dips',  name: 'Weighted Dips',       muscle: 'Triceps',       icon: '🔽', defaultWeight: 10, defaultReps: 10 },
    { id: 'lfl',   name: 'Lateral Raises',      muscle: 'Shoulders',     icon: '↔️', defaultWeight: 8,  defaultReps: 12 },
  ],
  pull: [
    { id: 'row',   name: 'Barbell Row',         muscle: 'Back',          icon: '🏋️', defaultWeight: 50, defaultReps: 8 },
    { id: 'pu',    name: 'Pull-ups',            muscle: 'Back',          icon: '⬆️', defaultWeight: 0,  defaultReps: 8 },
    { id: 'cu',    name: 'Barbell Curl',        muscle: 'Biceps',        icon: '💪', defaultWeight: 25, defaultReps: 10 },
    { id: 'fd',    name: 'Face Pulls',          muscle: 'Rear Delts',    icon: '🎯', defaultWeight: 20, defaultReps: 12 },
  ],
  legs: [
    { id: 'sq',    name: 'Barbell Squat',       muscle: 'Quads • Glutes',icon: '🏋️', defaultWeight: 60, defaultReps: 8 },
    { id: 'rdl',   name: 'Romanian Deadlift',   muscle: 'Hamstrings',    icon: '🔱', defaultWeight: 50, defaultReps: 10 },
    { id: 'lp',    name: 'Leg Press',           muscle: 'Quads',         icon: '⬇️', defaultWeight: 100,defaultReps: 12 },
    { id: 'cr',    name: 'Calf Raises',         muscle: 'Calves',        icon: '👟', defaultWeight: 40, defaultReps: 15 },
  ],
  fullbody: [
    { id: 'dl',    name: 'Conventional Deadlift', muscle: 'Posterior Chain', icon: '🏋️', defaultWeight: 80, defaultReps: 5 },
    { id: 'inc',   name: 'Incline Dumbbell Press', muscle: 'Chest',       icon: '📈', defaultWeight: 20, defaultReps: 10 },
    { id: 'lpd',   name: 'Lat Pulldowns',        muscle: 'Lats',         icon: '⬇️', defaultWeight: 45, defaultReps: 10 },
    { id: 'plk',   name: 'Weighted Plank',       muscle: 'Core',         icon: '🧘', defaultWeight: 10, defaultReps: 60 },
  ],
  cardio: [
    { id: 'trd',   name: 'Interval Sprint Pacing', muscle: 'Cardiovascular', icon: '🏃', defaultWeight: 0, defaultReps: 15 },
    { id: 'kb',    name: 'Kettlebell Swings',    muscle: 'Full Body',     icon: '💣', defaultWeight: 16, defaultReps: 20 },
    { id: 'hkr',   name: 'Hanging Knee Raises',  muscle: 'Core',          icon: '⬆️', defaultWeight: 0, defaultReps: 15 },
  ],
  special: [
    { id: 'sc',    name: 'Hammer Curls',        muscle: 'Arms',          icon: '🔨', defaultWeight: 12, defaultReps: 12 },
    { id: 'tp',    name: 'Tricep Pushdowns',     muscle: 'Triceps',       icon: '🔽', defaultWeight: 20, defaultReps: 15 },
    { id: 'sh',    name: 'Dumbbell Shrugs',      muscle: 'Traps',         icon: '🐂', defaultWeight: 24, defaultReps: 12 },
  ],
  upper: [
    { id: 'db_pr', name: 'Dumbbell Bench Press', muscle: 'Chest',         icon: '🏋️', defaultWeight: 22, defaultReps: 8 },
    { id: 'db_row',name: 'One-Arm Dumbbell Row', muscle: 'Back',          icon: '🔄', defaultWeight: 20, defaultReps: 10 },
    { id: 'db_sp', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders',   icon: '⬆️', defaultWeight: 14, defaultReps: 10 },
    { id: 'db_c',  name: 'Incline Dumbbell Curl', muscle: 'Biceps',        icon: '💪', defaultWeight: 10, defaultReps: 12 },
  ],
  lower: [
    { id: 'gob',   name: 'Goblet Squat',        muscle: 'Quads',         icon: '🥣', defaultWeight: 24, defaultReps: 10 },
    { id: 'leg_ex',name: 'Leg Extensions',       muscle: 'Quads',         icon: '🦵', defaultWeight: 40, defaultReps: 12 },
    { id: 'ham_c', name: 'Lying Leg Curl',       muscle: 'Hamstrings',    icon: '🍗', defaultWeight: 30, defaultReps: 12 },
    { id: 'calves',name: 'Seated Calf Raise',    muscle: 'Calves',        icon: '👟', defaultWeight: 30, defaultReps: 15 },
  ],
};

const ADAPTIVE_HOME_DB = {
  push: [
    { id: 'pu_h',  name: 'Standard Push-ups',   muscle: 'Chest',         icon: '💪', defaultWeight: 0, defaultReps: 15 },
    { id: 'pku',   name: 'Pike Push-ups',        muscle: 'Shoulders',     icon: '🔺', defaultWeight: 0, defaultReps: 10 },
    { id: 'tri',   name: 'Diamond Push-ups',     muscle: 'Triceps',       icon: '💎', defaultWeight: 0, defaultReps: 12 },
    { id: 'dip_c', name: 'Chair Dips',           muscle: 'Triceps',       icon: '🪑', defaultWeight: 0, defaultReps: 15 },
  ],
  pull: [
    { id: 'row_h', name: 'Inverted Bed-sheet Rows', muscle: 'Back',        icon: '🔄', defaultWeight: 0, defaultReps: 12 },
    { id: 'cur_h', name: 'Resistance Band Curl',  muscle: 'Biceps',        icon: '🎗️', defaultWeight: 0, defaultReps: 15 },
    { id: 't_pull',name: 'Towel Lat Pulldowns',  muscle: 'Back',          icon: '🧣', defaultWeight: 0, defaultReps: 15 },
  ],
  legs: [
    { id: 'bsq',   name: 'Bodyweight Deep Squat', muscle: 'Quads',         icon: '🔽', defaultWeight: 0, defaultReps: 20 },
    { id: 'lunge', name: 'Walking Lunges',       muscle: 'Glutes • Quads',icon: '🦵', defaultWeight: 0, defaultReps: 12 },
    { id: 'hip',   name: 'Glute Bridges',        muscle: 'Glutes',        icon: '🏔️', defaultWeight: 0, defaultReps: 15 },
    { id: 'calf_h',name: 'Single-Leg Calf Raise', muscle: 'Calves',        icon: '👟', defaultWeight: 0, defaultReps: 20 },
  ],
  fullbody: [
    { id: 'burp',  name: 'Burpees',             muscle: 'Full Body',     icon: '💥', defaultWeight: 0, defaultReps: 10 },
    { id: 'spu',   name: 'Archer Pushups',       muscle: 'Chest • Arms',  icon: '🏹', defaultWeight: 0, defaultReps: 8 },
    { id: 'h_sq',  name: 'Jump Squats',          muscle: 'Legs',          icon: '🦘', defaultWeight: 0, defaultReps: 12 },
    { id: 'plk_h', name: 'Plank Hold',           muscle: 'Core',          icon: '🧘', defaultWeight: 0, defaultReps: 60 },
  ],
  cardio: [
    { id: 'mc',    name: 'Mountain Climbers',    muscle: 'Cardio • Core', icon: '🧗', defaultWeight: 0, defaultReps: 30 },
    { id: 'jj',    name: 'Jumping Jacks',        muscle: 'Cardio',        icon: '✨', defaultWeight: 0, defaultReps: 50 },
    { id: 'h_knees',name: 'High Knees Run',       muscle: 'Conditioning',  icon: '🏃', defaultWeight: 0, defaultReps: 40 },
    { id: 'cr_t',  name: 'Russian Twists',       muscle: 'Abs',           icon: '🔄', defaultWeight: 0, defaultReps: 20 },
  ],
};

// ─── Today's Why Data ─────────────────────────────────────────────────────
const TODAYS_WHY = {
  scholar: [
    "You are not training for aesthetics. You are training for who you need to become.",
    "Discipline is the quiet architecture of a life built with intention.",
    "Every rep is a vote cast for the version of yourself you are choosing.",
    "Discipline compounds.",
    "Bad days still count.",
    "You wanted confidence."
  ],
  performer: [
    "The work you do when no one is watching defines the version of you everyone will see.",
    "Grit is not loud. It shows up silently, consistently, without applause.",
    "Push until effort becomes reflex. Then it becomes permanent.",
    "Discipline compounds.",
    "Bad days still count.",
    "You wanted confidence."
  ],
  strategist: [
    "Sustainable progress is the most radical act of ambition.",
    "Integration, not obsession. Long arc thinking wins.",
    "Calm is not the absence of intensity — it is its highest form.",
    "Discipline compounds.",
    "Bad days still count.",
    "You wanted confidence."
  ],
};

// Simulated history data
function buildFakeHistory() {
  const today = new Date();
  const h = {};
  const sessions = [
    { offset: 1, type: 'Push',  exNames: ['Barbell Bench Press: 3 sets x 8 reps @ 60kg', 'Overhead Press: 3 sets x 8 reps @ 40kg', 'Lateral Raises: 3 sets x 15 reps @ 8kg'], readiness: 84, discipline: 96, notes: 'Felt very strong on bench today. Shoulder felt stable.', completion: 100 },
    { offset: 2, type: 'Pull',  exNames: ['Barbell Row: 3 sets x 8 reps @ 50kg', 'Pull-ups: 3 sets x 8 reps', 'Barbell Curl: 3 sets x 10 reps @ 25kg'], readiness: 72, discipline: 90, notes: 'Felt tired from college lecture, but pushed through curls.', completion: 100 },
    { offset: 3, type: 'Legs',  exNames: ['Barbell Squat: 3 sets x 8 reps @ 60kg', 'Romanian Deadlift: 3 sets x 10 reps @ 50kg', 'Calf Raises: 3 sets x 20 reps'], readiness: 88, discipline: 95, notes: 'Depth on squat was deep and clean. Felt active.', completion: 100 },
    { offset: 4, type: 'Rest',  exNames: [], readiness: 65, discipline: 85, notes: 'Dedicated active rest. Completed morning box breathing anchors.', completion: 0 },
    { offset: 5, type: 'Push',  exNames: ['Barbell Bench Press: 3 sets x 8 reps @ 62.5kg', 'Overhead Press: 3 sets x 8 reps @ 42.5kg', 'Weighted Dips: 3 sets x 10 reps @ 10kg'], readiness: 94, discipline: 98, notes: 'Awoke fully charged. Progressive overload bench was successful.', completion: 100 },
    { offset: 7, type: 'Pull',  exNames: ['Barbell Row: 3 sets x 8 reps @ 52.5kg', 'Pull-ups: 3 sets x 8 reps', 'Face Pulls: 3 sets x 15 reps @ 20kg'], readiness: 80, discipline: 92, notes: 'Did rows slow with tight lat squeeze. Biceps tight.', completion: 100 },
    { offset: 9, type: 'Legs',  exNames: ['Barbell Squat: 3 sets x 8 reps @ 62.5kg', 'Romanian Deadlift: 3 sets x 10 reps @ 52.5kg', 'Leg Press: 3 sets x 12 reps @ 110kg'], readiness: 86, discipline: 95, notes: 'Leg press sets burned. Mental block conquered.', completion: 100 },
  ];
  for (const s of sessions) {
    const d = new Date(today);
    d.setDate(d.getDate() - s.offset);
    const key = fmtDateKey(d);
    h[key] = {
      logged: s.type !== 'Rest',
      type: s.type,
      exercises: s.exNames,
      readiness: s.readiness,
      discipline: s.discipline,
      notes: s.notes,
      completion: s.completion,
    };
  }
  state.workout.history = h;
}

// ─── Audio ─────────────────────────────────────────────────────────────────
function getAudioCtx() {
  if (!state.audio.ctx) {
    state.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (state.audio.ctx.state === 'suspended') state.audio.ctx.resume();
  return state.audio.ctx;
}

function playSound(type) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'tap') {
      osc.type = 'sine'; osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(); osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'chime') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.start(); osc.stop(ctx.currentTime + 0.7);
    } else if (type === 'tick') {
      osc.type = 'sine'; osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(); osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'done') {
      // Two-tone success
      [880, 1100].forEach((f, i) => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.type = 'triangle'; o2.frequency.value = f;
        g2.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        g2.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.15 + 0.02);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
        o2.start(ctx.currentTime + i * 0.15);
        o2.stop(ctx.currentTime + i * 0.15 + 0.5);
      });
    }
  } catch (e) { /* silent */ }
}

// ─── Router ────────────────────────────────────────────────────────────────
function navigateTo(screenId, opts = {}) {
  const current = document.querySelector('.screen.active');
  const target = document.getElementById(screenId);
  if (!target || target === current) return;

  if (current) current.classList.remove('active');
  target.classList.add('active');
  state.currentScreen = screenId;

  // Nav bar visibility
  const nav = document.getElementById('bottom-nav');
  const noNav = ['screen-splash', 'screen-onboarding', 'screen-checkin'];
  if (noNav.includes(screenId)) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }

  // Active nav tab highlight
  syncNavHighlight(screenId);

  // Lifecycle hooks
  if (screenId === 'screen-dashboard') onEnterDashboard();
  if (screenId === 'screen-workout')   onEnterWorkout();
  if (screenId === 'screen-diet')      onEnterDiet();
  if (screenId === 'screen-recovery')  onEnterRecovery();
  if (screenId === 'screen-squad')     onEnterSquad();
  if (screenId === 'screen-checkin')   startCheckIn();
  if (screenId === 'screen-vision')    onEnterVision();
}

function syncNavHighlight(screenId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = {
    'screen-vision': 'nav-home', 'screen-dashboard': 'nav-home',
    'screen-workout': 'nav-train',
    'screen-diet': 'nav-diet',
    'screen-recovery': 'nav-recovery',
    'screen-squad': 'nav-squad',
  };
  const id = map[screenId];
  if (id) document.getElementById(id)?.classList.add('active');
}

function handleTabClick(id) {
  playSound('tap');
  if (id === 'nav-home') {
    if (state.checkIn.done) {
      navigateTo('screen-dashboard');
    } else {
      navigateTo('screen-vision');
    }
  } else if (id === 'nav-train') {
    navigateTo('screen-workout');
    if (!state.sessionStarted) {
      setTimeout(() => showEnergyModeSelector(), 380);
    }
  } else if (id === 'nav-diet') {
    navigateTo('screen-diet');
  } else if (id === 'nav-recovery') {
    navigateTo('screen-recovery');
  } else if (id === 'nav-squad') {
    navigateTo('screen-squad');
  }
}

// ─── Utility ───────────────────────────────────────────────────────────────
function fmtDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDateDisplay(d) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()}`;
}
function todayKey() { return fmtDateKey(new Date()); }
function el(id) { return document.getElementById(id); }

function formatLastSession(lastStr) {
  if (!lastStr) return '—';
  return lastStr
    .replace(/\s*sets?\s*/gi, '')
    .replace(/\s*reps?\s*/gi, '')
    .trim();
}

function formatDuration(mins) {
  if (mins < 60) return `~${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `~${hrs} hr`;
  return `~${hrs} hr ${remainingMins} min`;
}

function calculateStreak() {
  const history = state.workout.history;
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const key = fmtDateKey(checkDate);
    
    const dayIndex = (state.workout.todayIndex - i + 35) % 7;
    const daySplit = state.workout.weekSplit[dayIndex];
    const isRest = daySplit ? daySplit.rest : false;
    const h = history[key];
    
    if (h && h.logged) {
      streak++;
    } else if (isRest) {
      continue;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  return streak || 4; // default baseline streak to keep psychological momentum
}

function updateStreakUI() {
  const streak = calculateStreak();
  const elements = ['vision-streak-badge', 'dashboard-streak-badge'];
  elements.forEach(id => {
    const elBadge = el(id);
    if (elBadge) {
      elBadge.querySelector('span:last-child').textContent = `${streak}d`;
    }
  });
  const celStreak = el('cel-streak');
  if (celStreak) celStreak.textContent = String(streak);
}

// ─── Status Bar Clock ──────────────────────────────────────────────────────
function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    el('status-time').textContent = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 30000);
}

// ─── Splash ────────────────────────────────────────────────────────────────
function initSplash() {
  setTimeout(() => {
    if (state.auth && state.auth.loggedIn) {
      if (state.checkIn && state.checkIn.done) {
        navigateTo('screen-dashboard');
      } else {
        navigateTo('screen-vision');
      }
    } else {
      navigateTo('screen-auth-login');
    }
  }, 2600);
}

// ─── AUTH & SIGNUP ─────────────────────────────────────────────────────────
const tempSignupData = {
  goals: [],
  ambition: 'casual',
  training: 'gym',
  schedule: 'morning',
  lifeGoals: [],
  personality: 'calm'
};

function initAuth() {
  const fileInp = el('auth-avatar-input');
  const uploadBtn = el('auth-upload-btn');
  const preview = el('auth-avatar-preview');
  
  if (uploadBtn && fileInp) {
    uploadBtn.addEventListener('click', () => fileInp.click());
    fileInp.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          state.auth.avatar = ev.target.result;
          if (preview) {
            preview.innerHTML = '';
            preview.style.backgroundImage = `url(${state.auth.avatar})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
          }
          playSound('chime');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function updateSignupProgress() {
  const steps = document.querySelectorAll('.signup-step');
  const step = state.auth.signupStep || 0;
  
  steps.forEach((s, idx) => {
    s.classList.remove('active', 'exit-left');
    if (idx === step) {
      s.classList.add('active');
    } else if (idx < step) {
      s.classList.add('exit-left');
    }
  });

  const nextBtn = el('signup-next-btn');
  const label = el('signup-step-label');
  const fill = el('signup-progress-fill');
  
  if (label) label.textContent = `${step + 1} / 6`;
  if (fill) fill.style.width = `${((step + 1) / 6) * 100}%`;
  
  if (nextBtn) {
    if (step === 5) {
      nextBtn.textContent = 'Create Profile ✦';
      nextBtn.style.background = 'linear-gradient(135deg, var(--accent), var(--violet))';
    } else {
      nextBtn.textContent = 'Continue';
      nextBtn.style.background = '';
    }
  }
}

function signupNext() {
  const step = state.auth.signupStep || 0;
  playSound('tap');
  
  if (step === 0) {
    const name = el('signup-name')?.value.trim();
    const username = el('signup-username')?.value.trim();
    const email = el('signup-email')?.value.trim();
    const password = el('signup-password')?.value.trim();
    
    if (!name || !username || !email || !password) {
      flashInputWarning('screen-auth-signup');
      return;
    }
  } else if (step === 1) {
    const age = el('signup-age')?.value;
    const gender = el('signup-gender')?.value;
    const country = el('signup-country')?.value;
    
    if (!age || !gender || !country) {
      flashInputWarning('screen-auth-signup');
      return;
    }
  }
  
  if (step < 5) {
    state.auth.signupStep = step + 1;
    updateSignupProgress();
  } else {
    // Register account
    const name = el('signup-name')?.value.trim();
    const username = el('signup-username')?.value.trim();
    const email = el('signup-email')?.value.trim();
    const password = el('signup-password')?.value.trim();
    
    const newUser = {
      name: name,
      username: username.startsWith('@') ? username : `@${username}`,
      email: email,
      password: password,
      age: +el('signup-age')?.value || 21,
      gender: el('signup-gender')?.value || 'male',
      country: el('signup-country')?.value || 'india',
      city: el('signup-city')?.value.trim() || '',
      avatar: state.auth.avatar,
      goals: tempSignupData.goals,
      ambition: tempSignupData.ambition,
      training: tempSignupData.training,
      profession: el('signup-profession')?.value || 'student',
      income: el('signup-income')?.value || 'student',
      schedule: tempSignupData.schedule,
      lifeGoals: tempSignupData.lifeGoals,
      personality: tempSignupData.personality
    };
    
    state.auth.user = newUser;
    state.auth.users.push(newUser);
    state.auth.loggedIn = true;
    
    // Sync onboarding properties
    state.onboarding.goals = tempSignupData.goals.length > 0 ? [...tempSignupData.goals] : ['strength'];
    state.onboarding.age = newUser.age;
    
    // Sync goal pills visually in onboarding screen
    document.querySelectorAll('.goal-card[data-goal]').forEach(c => {
      const g = c.dataset.goal;
      c.classList.toggle('selected', state.onboarding.goals.includes(g));
    });
    
    // Pre-select training environment
    state.onboarding.gymEnv = newUser.training || 'gym';
    document.querySelectorAll('.env-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.env === state.onboarding.gymEnv);
    });
    
    state.onboarding.step = 1; // start onboarding metrics directly
    
    playSound('done');
    saveToStorage();
    navigateTo('screen-onboarding');
    
    // Also trigger Dynamic Island popup alerts
    showSaveSuccessFeedback();
  }
}

function signupBack() {
  const step = state.auth.signupStep || 0;
  playSound('tap');
  if (step > 0) {
    state.auth.signupStep = step - 1;
    updateSignupProgress();
  } else {
    navigateTo('screen-auth-login');
  }
}

function handleLogin() {
  const idInp = el('login-identifier');
  const passInp = el('login-password');
  
  if (!idInp || !passInp) return;
  const identifier = idInp.value.trim();
  const password = passInp.value.trim();
  
  if (!identifier || !password) {
    flashInputWarning('screen-auth-login');
    return;
  }
  
  let foundUser = state.auth.users.find(u => u.username === identifier || u.email === identifier);
  
  if (!foundUser) {
    const randomUsername = identifier.startsWith('@') ? identifier : `@${identifier}`;
    foundUser = {
      name: identifier.split('@')[0],
      username: randomUsername,
      email: identifier.includes('@') ? identifier : `${identifier}@aura.os`,
      password: password,
      age: 21,
      gender: 'male',
      country: 'india',
      city: 'Hyderabad',
      avatar: null,
      goals: ['discipline', 'strength'],
      ambition: 'consistent',
      training: 'gym',
      profession: 'software',
      income: '50-100',
      schedule: 'evening',
      lifeGoals: ['confidence', 'discipline'],
      personality: 'balanced'
    };
    state.auth.users.push(foundUser);
  }
  
  state.auth.user = foundUser;
  state.auth.loggedIn = true;
  state.onboarding.age = foundUser.age;
  
  playSound('done');
  saveToStorage();
  
  if (state.checkIn.done) {
    navigateTo('screen-dashboard');
  } else {
    navigateTo('screen-vision');
  }
}

function flashInputWarning(screenId) {
  playSound('tick');
  const screen = el(screenId);
  if (screen) {
    screen.classList.add('shake-anim');
    setTimeout(() => screen.classList.remove('shake-anim'), 400);
  }
}

// ─── PROFILE SYSTEM ────────────────────────────────────────────────────────
function openProfile() {
  const overlay = el('profile-overlay');
  if (!overlay) return;
  
  playSound('tap');
  
  const user = state.auth.user || {
    name: 'Praneeth',
    username: '@praneeth',
    avatar: null,
    goals: ['discipline', 'strength'],
    ambition: 'consistent',
    training: 'gym',
    profession: 'software',
    income: '50-100',
    schedule: 'evening',
    country: 'india',
    city: 'Hyderabad',
    lifeGoals: ['confidence', 'discipline'],
    personality: 'balanced'
  };

  const avatarEl = el('profile-avatar-large');
  if (avatarEl) {
    if (user.avatar) {
      avatarEl.innerHTML = '';
      avatarEl.style.backgroundImage = `url(${user.avatar})`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    } else {
      avatarEl.style.backgroundImage = '';
      const initials = (user.name || 'P').substring(0, 2).toUpperCase();
      avatarEl.innerHTML = `<span style="font-size:18px;font-weight:800;color:var(--text-1);">${initials}</span>`;
    }
  }

  if (el('profile-display-name')) el('profile-display-name').textContent = user.name;
  if (el('profile-username-display')) el('profile-username-display').textContent = user.username;

  const goalsContainer = el('profile-goals-tags');
  if (goalsContainer) {
    goalsContainer.innerHTML = '';
    const goalsList = user.goals || [];
    const emojiMap = { 'weight-loss': '⚖️', 'muscle-gain': '💪', 'discipline': '🔁', 'athlete': '🏆', 'hybrid': '⚡', 'recovery': '🌿', 'strength': '🏋️' };
    const labelMap = { 'weight-loss': 'Weight Loss', 'muscle-gain': 'Muscle Gain', 'discipline': 'Discipline', 'athlete': 'Athlete', 'hybrid': 'Hybrid', 'recovery': 'Recovery', 'strength': 'Strength' };
    
    goalsList.forEach(g => {
      const pill = document.createElement('span');
      pill.style.cssText = `font-size:10px;font-weight:700;color:var(--text-2);background:var(--surface-3);border:1px solid var(--border);padding:4px 10px;border-radius:12px;display:inline-flex;align-items:center;gap:4px;`;
      pill.innerHTML = `<span>${emojiMap[g] || '✦'}</span> <span>${labelMap[g] || g}</span>`;
      goalsContainer.appendChild(pill);
    });
  }

  const score = state.readiness ? Math.round(50 + (state.readiness - 35) * (50 / 65)) : 78;
  const statusTags = ['Locked In 🔒', 'Consistent 🔁', 'Disciplined 🔥', 'Recovery Focused 🌿'];
  let activeTag = statusTags[1];
  if (score >= 88) activeTag = statusTags[0];
  else if (score >= 75) activeTag = statusTags[2];
  else if (score < 55) activeTag = statusTags[3];
  
  if (el('profile-score-large')) el('profile-score-large').textContent = String(score);
  if (el('profile-status-display')) el('profile-status-display').textContent = activeTag;

  const streak = calculateStreak();
  if (el('profile-streak')) el('profile-streak').textContent = String(streak);
  if (el('profile-weekly')) el('profile-weekly').textContent = '5/7';
  if (el('profile-reliability')) el('profile-reliability').textContent = score >= 88 ? 'A+' : score >= 75 ? 'A' : 'B';

  const formatMap = { gym: '🏋️ Gym Mode', home: '🏠 Home Mode', hybrid: '⚡ Hybrid Mode', outdoor: '🌄 Outdoor Mode' };
  const trainingStyle = formatMap[user.training] || '🏋️ Gym Mode';
  if (el('profile-training-style')) el('profile-training-style').textContent = trainingStyle;
  if (el('profile-ambition')) el('profile-ambition').textContent = (user.ambition || 'consistent').toUpperCase();
  if (el('profile-schedule')) el('profile-schedule').textContent = (user.schedule || 'evening').toUpperCase();
  
  const locationText = state.auth.hideCity ? (user.country || 'India').toUpperCase() : `${user.city || 'Hyderabad'}, ${user.country || 'India'}`;
  if (el('profile-location')) el('profile-location').textContent = locationText;

  // Inline editing for profile name
  const nameEl = el('profile-display-name');
  if (nameEl && !nameEl.dataset.editBound) {
    nameEl.dataset.editBound = 'true';
    nameEl.setAttribute('contenteditable', 'true');
    nameEl.style.cursor = 'text';
    nameEl.addEventListener('blur', () => {
      const newName = nameEl.textContent.trim();
      if (newName && state.auth.user) {
        state.auth.user.name = newName;
        saveToStorage();
        showSaveSuccessFeedback('Profile Updated');
      }
    });
    nameEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nameEl.blur();
      }
    });
  }

  // Inline editing for profile username
  const userEl = el('profile-username-display');
  if (userEl && !userEl.dataset.editBound) {
    userEl.dataset.editBound = 'true';
    userEl.setAttribute('contenteditable', 'true');
    userEl.style.cursor = 'text';
    userEl.addEventListener('blur', () => {
      let newUsername = userEl.textContent.trim();
      if (newUsername) {
        if (!newUsername.startsWith('@')) newUsername = '@' + newUsername;
        if (newUsername.length > 2 && state.auth.user) {
          state.auth.user.username = newUsername;
          saveToStorage();
          showSaveSuccessFeedback('Profile Updated');
        }
      }
    });
    userEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        userEl.blur();
      }
    });
  }

  // Inline editing for profile bio / training quote
  const quoteEl = el('profile-quote');
  if (quoteEl && !quoteEl.dataset.editBound) {
    quoteEl.dataset.editBound = 'true';
    quoteEl.setAttribute('contenteditable', 'true');
    quoteEl.style.cursor = 'text';
    quoteEl.addEventListener('blur', () => {
      const newQuote = quoteEl.textContent.trim();
      if (newQuote && state.auth.user) {
        state.auth.user.bio = newQuote;
        saveToStorage();
        showSaveSuccessFeedback('Profile Updated');
      }
    });
    quoteEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        quoteEl.blur();
      }
    });
  }

  // Simulated avatar image upload
  const avatarLarge = el('profile-avatar-large');
  if (avatarLarge && !avatarLarge.dataset.uploadBound) {
    avatarLarge.dataset.uploadBound = 'true';
    avatarLarge.style.cursor = 'pointer';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    avatarLarge.appendChild(fileInput);
    
    avatarLarge.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          const dataUrl = e.target.result;
          if (state.auth.user) {
            state.auth.user.avatar = dataUrl;
            avatarLarge.style.backgroundImage = `url(${dataUrl})`;
            avatarLarge.style.backgroundSize = 'cover';
            avatarLarge.style.backgroundPosition = 'center';
            avatarLarge.innerHTML = '';
            
            const smallAvatar = el('pqc-avatar') || el('vision-avatar-btn');
            if (smallAvatar) {
              smallAvatar.style.backgroundImage = `url(${dataUrl})`;
              smallAvatar.style.backgroundSize = 'cover';
              smallAvatar.style.backgroundPosition = 'center';
              smallAvatar.innerHTML = '';
            }
            
            saveToStorage();
            showSaveSuccessFeedback('Profile Updated');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  overlay.classList.remove('hidden');
  overlay.style.pointerEvents = 'auto';
  void overlay.offsetWidth;
  overlay.classList.add('visible');

  setTimeout(() => renderProfileReadinessChart(), 400);
}

function closeProfile() {
  playSound('tap');
  const overlay = el('profile-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 380);
  }
}

function renderProfileReadinessChart() {
  const canvas = el('profile-readiness-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  
  const data = [74, 82, 68, 88, 92, 85, state.readiness || 78];
  
  ctx.clearRect(0, 0, width, height);
  
  ctx.beginPath();
  const step = width / (data.length - 1);
  const scaleY = (val) => height - 10 - ((val - 35) / 65) * (height - 20);
  
  ctx.moveTo(0, scaleY(data[0]));
  for (let i = 1; i < data.length; i++) {
    const x = i * step;
    const y = scaleY(data[i]);
    const prevX = (i - 1) * step;
    const prevY = scaleY(data[i - 1]);
    
    const cpX1 = prevX + step / 3;
    const cpY1 = prevY;
    const cpX2 = prevX + (2 * step) / 3;
    const cpY2 = y;
    
    ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
  }
  
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(139,92,246,0.3)';
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(139,92,246,0.15)');
  grad.addColorStop(1, 'rgba(139,92,246,0)');
  ctx.fillStyle = grad;
  ctx.fill();
  
  for (let i = 0; i < data.length; i++) {
    const x = i * step;
    const y = scaleY(data[i]);
    
    ctx.beginPath();
    ctx.arc(x, y, i === data.length - 1 ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = i === data.length - 1 ? 'var(--mint)' : '#8b5cf6';
    ctx.fill();
    ctx.strokeStyle = '#0c0c12';
    ctx.lineWidth = i === data.length - 1 ? 2 : 1.5;
    ctx.stroke();
  }
}


// ─── Onboarding ────────────────────────────────────────────────────────────
const OB_TOTAL = 8;

function initOnboarding() {
  // Wire sliders ↔ number inputs
  bindMetricPair('height-slider', 'height-num', v => {
    state.onboarding.height = +v;
    recalcBMI();
  });
  bindMetricPair('weight-slider', 'weight-num', v => {
    state.onboarding.weight = +v;
    recalcBMI();
  });
  bindMetricPair('age-slider', 'age-num', v => {
    state.onboarding.age = +v;
  });
  bindMetricPair('sleep-slider', 'sleep-num', v => {
    state.onboarding.sleep = +v;
    updateSleepFeedback(+v);
  });

  recalcBMI();
  updateSleepFeedback(7);

  const customEquip = el('ob-equipment-custom');
  if (customEquip) {
    customEquip.addEventListener('input', () => {
      state.onboarding.customEquipment = customEquip.value;
      saveToStorage();
    });
  }

  updateObProgress();
}

function updateSleepFeedback(hrs) {
  const emojiEl = el('sleep-mood-emoji');
  const lblEl = el('sleep-mood-label');
  if (!emojiEl || !lblEl) return;
  let emoji = '😐';
  let label = 'Average Sleep';
  if (hrs <= 5) {
    emoji = '😴';
    label = 'Exhausted — Recovery compromised';
  } else if (hrs === 6) {
    emoji = '🥱';
    label = 'Tired — Rest is sub-optimal';
  } else if (hrs <= 8) {
    emoji = '😐';
    label = 'Average — Standard recovery baseline';
  } else if (hrs <= 9) {
    emoji = '⚡';
    label = 'Energized — Peak neural recovery';
  } else {
    emoji = '🛌';
    label = 'Deep Rest — Long recovery window';
  }
  emojiEl.textContent = emoji;
  lblEl.textContent = label;
}

function bindMetricPair(sliderId, numId, cb) {
  const slider = el(sliderId);
  const num = el(numId);
  if (!slider || !num) return;

  // Slider input: immediately update input text and trigger state callback
  slider.addEventListener('input', () => {
    num.value = slider.value;
    cb(slider.value);
  });

  // Numeric input (while typing): update slider if inside valid range, but do not clamp text
  num.addEventListener('input', () => {
    const val = +num.value;
    if (!isNaN(val) && val >= +slider.min && val <= +slider.max) {
      slider.value = val;
      cb(val);
    }
  });

  // Numeric input blur: perform final validation and clamping
  num.addEventListener('blur', () => {
    const val = +num.value || +slider.min;
    const clamped = Math.min(+slider.max, Math.max(+slider.min, val));
    num.value = clamped;
    slider.value = clamped;
    cb(clamped);
  });

  num.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      num.blur();
    }
  });
}

function recalcBMI() {
  const h = state.onboarding.height / 100;
  const bmi = (state.onboarding.weight / (h * h)).toFixed(1);
  el('bmi-val').textContent = bmi;
  let cat = 'Normal';
  if (bmi < 18.5) cat = 'Underweight';
  else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
  else if (bmi >= 30) cat = 'Obese';
  el('bmi-cat').textContent = cat;
}

function getObSequence() {
  if (state.onboarding.gymEnv === 'home') {
    return [0, 1, 2, 6, 3, 4, 5, 7];
  }
  return [0, 1, 2, 3, 4, 5, 7];
}

function updateObProgress() {
  const seq = getObSequence();
  const currentIndex = seq.indexOf(state.onboarding.step);
  const totalSteps = seq.length;
  
  const pct = (currentIndex / (totalSteps - 1)) * 100;
  el('ob-progress-fill').style.width = pct + '%';
  el('ob-step-label').textContent = `${currentIndex + 1} of ${totalSteps}`;

  document.querySelectorAll('.ob-step').forEach((s, i) => {
    s.classList.remove('active', 'exit-left');
    const idxInSeq = seq.indexOf(i);
    const currIdx = seq.indexOf(state.onboarding.step);
    if (i === state.onboarding.step) {
      s.classList.add('active');
    } else if (idxInSeq !== -1 && idxInSeq < currIdx) {
      s.classList.add('exit-left');
    }
  });

  // Make sure experience cards match state
  document.querySelectorAll('.experience-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.experience === state.onboarding.experience);
  });

  // Make sure equipment cards match state
  const selectedEquip = state.onboarding.equipment || [];
  document.querySelectorAll('.equipment-card').forEach(c => {
    c.classList.toggle('selected', selectedEquip.includes(c.dataset.equipment));
  });

  const customEquip = el('ob-equipment-custom');
  if (customEquip) {
    customEquip.value = state.onboarding.customEquipment || '';
  }

  const nextBtn = el('ob-next-btn');
  const backBtn = el('ob-back-btn');
  backBtn.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';

  if (currentIndex === totalSteps - 1) {
    nextBtn.textContent = 'Awaken AURA ✦';
    nextBtn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
    nextBtn.style.boxShadow = '0 8px 20px -6px rgba(16,185,129,0.4)';
  } else {
    nextBtn.textContent = 'Continue';
    nextBtn.style.background = '';
    nextBtn.style.boxShadow = '';
  }
}

function obNext() {
  playSound('tap');
  const seq = getObSequence();
  const currentIndex = seq.indexOf(state.onboarding.step);
  if (currentIndex === seq.length - 1) {
    finishOnboarding();
    return;
  }
  state.onboarding.step = seq[currentIndex + 1];
  updateObProgress();
}

function obBack() {
  playSound('tap');
  const seq = getObSequence();
  const currentIndex = seq.indexOf(state.onboarding.step);
  if (currentIndex <= 0) return;
  state.onboarding.step = seq[currentIndex - 1];
  updateObProgress();
}

function finishOnboarding() {
  recalculateSmartProtein();
  buildWorkoutSplit();
  buildFakeHistory();
  playSound('done');
  navigateTo('screen-vision');
}

function recalculateSmartProtein() {
  const weight = state.onboarding.weight || 70;
  const height = state.onboarding.height || 172;
  const age = state.onboarding.age || 21;
  const goals = state.onboarding.goals || ['strength'];
  const primGoal = goals[0] || 'strength';
  const budget = state.onboarding.budget || 'low';

  // Realistic daily calorie baseline (BMR)
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  let targetCal = Math.round(bmr * 1.3); // standard active factor
  let targetProt = Math.round(weight * 1.6); // baseline factor

  if (primGoal === 'strength') {
    targetCal = Math.round(bmr * 1.45); // surplus
    targetProt = Math.round(weight * 1.85); // high protein muscle build
  } else if (primGoal === 'weight') {
    targetCal = Math.round(bmr * 1.12); // controlled deficit
    targetProt = Math.round(weight * 2.0); // very high protein fat loss satiety
  } else if (primGoal === 'recovery') {
    targetCal = Math.round(bmr * 1.2); 
    targetProt = Math.round(weight * 1.45);
  }

  // Experience adjustment: Beginners need slightly fewer calories/protein, Experienced need more
  const exp = state.onboarding.experience || 'beginner';
  if (exp === 'beginner') {
    targetProt = Math.round(targetProt * 0.9);
    targetCal = Math.round(targetCal * 0.95);
  } else if (exp === 'experienced') {
    targetProt = Math.round(targetProt * 1.1);
    targetCal = Math.round(targetCal * 1.05);
  }

  // Budget Tier limitations:
  // Low budget enforces realistic protein thresholds to fit affordable whole foods
  if (budget === 'low') {
    targetProt = Math.min(targetProt, 115);
  } else if (budget === 'medium') {
    targetProt = Math.max(80, Math.min(targetProt, 135));
  } else if (budget === 'high') {
    targetProt = Math.max(120, targetProt);
  }

  state.nutrition.targetCal = targetCal;
  state.nutrition.targetProt = targetProt;
}

// ─── Weekly Split Builder ──────────────────────────────────────────────────
function buildWorkoutSplit() {
  const env = state.onboarding.gymEnv; // gym | home
  const goals = state.onboarding.goals.length > 0 ? state.onboarding.goals : ['strength'];
  const primGoal = goals[0]; // e.g. strength, consistency, recovery, weight
  const exp = state.onboarding.experience || 'beginner';

  // Custom adaptive splits
  let split = [];
  if (env === 'gym') {
    if (exp === 'experienced') {
      // Advanced split logic for experienced gym users
      split = [
        { day: 'Mon', type: 'Push',   focus: 'Heavy Pressing (Compound Focus)',  rest: false },
        { day: 'Tue', type: 'Pull',   focus: 'Heavy Pulling (Deadlift/Row Focus)', rest: false },
        { day: 'Wed', type: 'Legs',   focus: 'Squats & Posterior Chain Overload', rest: false },
        { day: 'Thu', type: 'Rest',   focus: 'Active recovery & CNS reset',     rest: true  },
        { day: 'Fri', type: 'Push',   focus: 'Hypertrophy Pressing',             rest: false },
        { day: 'Sat', type: 'Legs',   focus: 'Lower Body Volume',                rest: false },
        { day: 'Sun', type: 'Rest',   focus: 'Full Rest',                        rest: true  },
      ];
    } else if (primGoal === 'strength') {
      split = [
        { day: 'Mon', type: 'Push',   focus: 'Chest • Shoulders',  rest: false },
        { day: 'Tue', type: 'Pull',   focus: 'Back • Biceps',       rest: false },
        { day: 'Wed', type: 'Legs',   focus: 'Quads • Hamstrings',  rest: false },
        { day: 'Thu', type: 'Rest',   focus: 'Active Recovery',     rest: true  },
        { day: 'Fri', type: 'Push',   focus: 'Chest • Triceps',     rest: false },
        { day: 'Sat', type: 'Legs',   focus: 'Lower Body',          rest: false },
        { day: 'Sun', type: 'Rest',   focus: 'Full Rest',           rest: true  },
      ];
    } else if (primGoal === 'weight' || primGoal === 'consistency') {
      split = [
        { day: 'Mon', type: 'FullBody', focus: 'Compound Strength', rest: false },
        { day: 'Tue', type: 'Cardio',   focus: 'Conditioning • Core',rest: false },
        { day: 'Wed', type: 'FullBody', focus: 'Hypertrophy Pacing',rest: false },
        { day: 'Thu', type: 'Rest',     focus: 'Active Recovery',   rest: true  },
        { day: 'Fri', type: 'FullBody', focus: 'Functional Volume',  rest: false },
        { day: 'Sat', type: 'Special',  focus: 'Conditioning • Arms',rest: false },
        { day: 'Sun', type: 'Rest',     focus: 'Full Rest',         rest: true  },
      ];
    } else { // recovery focus
      split = [
        { day: 'Mon', type: 'Upper',    focus: 'Low Intensity Upper',rest: false },
        { day: 'Tue', type: 'Rest',     focus: 'Active Recovery',    rest: true  },
        { day: 'Wed', type: 'Lower',    focus: 'Joint Health • Core',rest: false },
        { day: 'Thu', type: 'Rest',     focus: 'Parasympathetic Rest',rest: true },
        { day: 'Fri', type: 'FullBody', focus: 'Mobility • Aerobic', rest: false },
        { day: 'Sat', type: 'Rest',     focus: 'Parasympathetic Rest',rest: true },
        { day: 'Sun', type: 'Rest',     focus: 'Full Rest',          rest: true  },
      ];
    }
  } else { // home
    split = [
      { day: 'Mon', type: 'Push',   focus: 'Bodyweight Chest',     rest: false },
      { day: 'Tue', type: 'Pull',   focus: 'Bodyweight Back',      rest: false },
      { day: 'Wed', type: 'Legs',   focus: 'Glutes • Quads',       rest: false },
      { day: 'Thu', type: 'Rest',   focus: 'Parasympathetic Rest', rest: true  },
      { day: 'Fri', type: 'Cardio', focus: 'Abs • High Intensity', rest: false },
      { day: 'Sat', type: 'FullBody',focus: 'Home Flow Circuit',   rest: false },
      { day: 'Sun', type: 'Rest',   focus: 'Full Rest',            rest: true  },
    ];
  }

  // Load custom adaptive exercises
  split.forEach(day => {
    if (!day.rest) {
      day.exercises = getAdaptiveExercisesForDay(day.type, env, primGoal);
    }
  });

  state.workout.weekSplit = split;

  // Load today's exercises
  const today = state.workout.weekSplit[state.workout.todayIndex];
  state.workout.exercises = today.rest ? [] : (today.exercises || []);
}

function getAdaptiveExercisesForDay(type, env, goal) {
  let db = env === 'gym' ? ADAPTIVE_GYM_DB : ADAPTIVE_HOME_DB;
  let list = db[type.toLowerCase()] || db['fullbody'] || [];

  const exp = state.onboarding.experience || 'beginner';

  // Volume scaling by experience level
  if (exp === 'beginner') {
    list = list.slice(0, 3); // 3 exercises
  } else if (exp === 'returning') {
    list = list.slice(0, 4); // 4 exercises
  } else {
    list = list.slice(0, 5); // 4-5 exercises
  }

  // Simplify movements for beginners
  if (exp === 'beginner') {
    const BEGINNER_SIMPLIFIER = {
      'bp': { id: 'db_pr', name: 'Dumbbell Bench Press', muscle: 'Chest', icon: '🏋️', defaultWeight: 14, defaultReps: 10 },
      'sq': { id: 'gob', name: 'Goblet Squat', muscle: 'Quads', icon: '🥣', defaultWeight: 16, defaultReps: 10 },
      'dl': { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings', icon: '🔱', defaultWeight: 30, defaultReps: 10 },
      'ohp': { id: 'db_sp', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', icon: '⬆️', defaultWeight: 10, defaultReps: 10 },
      'pu': { id: 'lpd', name: 'Lat Pulldowns', muscle: 'Lats', icon: '⬇️', defaultWeight: 35, defaultReps: 10 },
      'row': { id: 'lpd', name: 'Lat Pulldowns', muscle: 'Lats', icon: '⬇️', defaultWeight: 35, defaultReps: 10 }
    };
    list = list.map(ex => {
      if (BEGINNER_SIMPLIFIER[ex.id]) {
        return { ...BEGINNER_SIMPLIFIER[ex.id] };
      }
      return ex;
    });
  }

  // Home Gym equipment aware adaptive injection
  const equipment = state.onboarding.equipment || [];
  if (env === 'home') {
    if (equipment.includes('dumbbells')) {
      if (type.toLowerCase() === 'push') {
        list = [...list, { id: 'db_floor', name: 'Dumbbell Floor Press', muscle: 'Chest', icon: '🏋️‍♀️', defaultWeight: 12, defaultReps: 10 }];
      } else if (type.toLowerCase() === 'pull') {
        list = [...list, { id: 'db_row_h', name: 'One-Arm Dumbbell Row', muscle: 'Back', icon: '🏋️‍♀️', defaultWeight: 12, defaultReps: 10 }];
      } else if (type.toLowerCase() === 'legs') {
        list = [...list, { id: 'db_sq_h', name: 'Dumbbell Goblet Squat', muscle: 'Quads', icon: '🥣', defaultWeight: 14, defaultReps: 10 }];
      }
    }
    if (equipment.includes('pullup-bar')) {
      if (type.toLowerCase() === 'pull') {
        list = [...list, { id: 'pu_bar', name: 'Pull-up Bar Hang & Pulls', muscle: 'Back', icon: '🪜', defaultWeight: 0, defaultReps: 6 }];
      }
    }
    if (equipment.includes('resistance-bands')) {
      if (type.toLowerCase() === 'pull') {
        list = [...list, { id: 'band_row', name: 'Resistance Band Row', muscle: 'Back', icon: '🎗️', defaultWeight: 0, defaultReps: 15 }];
      }
    }
  }

  // Calculate personalized default baseline reps/weights based on weight & goals
  let baselineWeightFactor = 1;
  let repMultiplier = 1;
  if (goal === 'strength') {
    baselineWeightFactor = 1.25;
    repMultiplier = 0.8; // 6-8 reps instead of 10
  } else if (goal === 'weight') {
    baselineWeightFactor = 0.8;
    repMultiplier = 1.3; // 12-15 reps
  }

  // Experience factor adaptation
  if (exp === 'beginner') {
    baselineWeightFactor *= 0.8;
    repMultiplier *= 0.9;
  } else if (exp === 'experienced') {
    baselineWeightFactor *= 1.2;
    repMultiplier *= 1.1;
  }

  // Somatic alert / Readiness adaptation
  const readiness = state.readiness || 78;
  let readinessWeightFactor = 1.0;
  if (readiness < 50) {
    readinessWeightFactor = 0.85; // scale weights down by 15%
  } else if (readiness >= 85) {
    readinessWeightFactor = 1.05; // recommend slight overload
  }

  return list.map(ex => {
    let w = ex.defaultWeight;
    let r = Math.round(ex.defaultReps * repMultiplier);

    // Scale bodyweight or light exercises appropriately
    if (w > 0) {
      w = Math.round(w * baselineWeightFactor * readinessWeightFactor * (state.onboarding.weight / 70));
      w = Math.round(w / 2.5) * 2.5; // nearest 2.5kg
    }

    return {
      ...ex,
      weight: w,
      reps: r,
      sets: [],
    };
  });
}

// ─── Vision (Home) ─────────────────────────────────────────────────────────
function onEnterVision() {
  const now = new Date();
  el('vision-date-label').textContent = fmtDateDisplay(now);
  // Identity
  const idMap = {
    scholar: { name: 'The Quiet Scholar', emoji: '📖' },
    performer: { name: 'The Resilient Performer', emoji: '🔥' },
    strategist: { name: 'The Calm Strategist', emoji: '🧠' },
  };
  const id = idMap[state.onboarding.identity] || idMap.scholar;
  el('vision-identity-name').textContent = id.name;
  el('vision-identity-badge').textContent = id.emoji;
  updateStreakUI();
  renderWeekStripHome();
}

function renderWeekStripHome() {
  const container = el('week-strip-home');
  if (!container) return;
  container.innerHTML = '';
  const today = new Date();
  state.workout.weekSplit.forEach((day, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - state.workout.todayIndex + i);
    const key = fmtDateKey(d);
    const isToday = i === state.workout.todayIndex;
    const isWorked = state.workout.history[key]?.logged;
    const div = document.createElement('div');
    div.className = `week-day-pill${isToday ? ' today' : ''}${isWorked ? ' done' : ''}${day.rest ? ' rest' : ''}`;
    div.innerHTML = `
      <span class="wdp-day">${day.day}</span>
      <span class="wdp-num">${d.getDate()}</span>
      <div class="wdp-dot"></div>
    `;
    div.addEventListener('click', () => {
      state.workout.selectedCalDay = i;
      navigateTo('screen-workout');
      switchCalView('week');
    });
    container.appendChild(div);
  });
}

// ─── Check-In Wheel Engine ─────────────────────────────────────────────────
const CI_QUESTIONS = [
  { metric: 'sleep',      label: 'Sleep Quality', icon: '🌙', low: 'Awful',       high: 'Rested',
    opts: [{v:1,e:'💤',l:'Awful'},{v:2,e:'😴',l:'Broken'},{v:3,e:'😐',l:'Okay'},{v:4,e:'😌',l:'Good'},{v:5,e:'✨',l:'Perfect'}] },
  { metric: 'energy',     label: 'Energy State',  icon: '⚡', low: 'Drained',    high: 'Peak',
    opts: [{v:1,e:'🪫',l:'Empty'},{v:2,e:'😩',l:'Low'},{v:3,e:'😐',l:'Steady'},{v:4,e:'⚡',l:'Alive'},{v:5,e:'🔋',l:'Peak'}] },
  { metric: 'soreness',   label: 'Soreness',      icon: '💪', low: 'Very sore',  high: 'Fresh',
    opts: [{v:1,e:'💀',l:'Wrecked'},{v:2,e:'🤕',l:'Sore'},{v:3,e:'😐',l:'Okay'},{v:4,e:'😊',l:'Good'},{v:5,e:'⚡',l:'Fresh'}] },
  { metric: 'stress',     label: 'Mental Load',   icon: '🧠', low: 'Overwhelmed', high: 'Calm',
    opts: [{v:1,e:'🌋',l:'Redline'},{v:2,e:'😤',l:'Stressed'},{v:3,e:'😐',l:'Normal'},{v:4,e:'🧘',l:'Centred'},{v:5,e:'🍃',l:'Calm'}] },
  { metric: 'motivation', label: 'Motivation',    icon: '🔥', low: 'Low',        high: 'Fired Up',
    opts: [{v:1,e:'🥱',l:'Drained'},{v:2,e:'📉',l:'Low'},{v:3,e:'😐',l:'Steady'},{v:4,e:'🔥',l:'Driven'},{v:5,e:'⚡',l:'Peak'}] },
];
const CI_METRICS = CI_QUESTIONS.map(q => q.metric);

let ciAnimating = false;

function buildCardHTML(q, index) {
  const savedVal = state.checkIn.answers[q.metric];
  
  // Option emojis
  const btns = `
    <div class="ci-scale-hint"><span>${q.low}</span><span>${q.high}</span></div>
    <div class="ci-emoji-row">
      ${q.opts.map(o => `
        <button class="ci-emoji-btn${savedVal === o.v ? ' selected' : ''}" data-metric="${q.metric}" data-value="${o.v}">
          <span class="ci-btn-emoji">${o.e}</span>
          <span class="ci-btn-label">${o.l}</span>
        </button>`).join('')}
    </div>`;

  return `
    <div class="ci-wheel-card" data-index="${index}">
      <div class="ci-zone-icon">${q.icon}</div>
      <div class="ci-zone-label">${q.label}</div>
      ${btns}
    </div>`;
}

function startCheckIn() {
  if (!state.checkIn.answers) {
    state.checkIn.answers = { sleep: null, energy: null, soreness: null, stress: null, motivation: null };
  }
  
  // Find first unanswered step, or default to 0
  let startingStep = 0;
  for (let i = 0; i < CI_QUESTIONS.length; i++) {
    const q = CI_QUESTIONS[i];
    if (state.checkIn.answers[q.metric] === null) {
      startingStep = i;
      break;
    }
  }
  state.checkIn.step = startingStep;
  state.checkIn.done = false;
  
  const track = el('ci-wheel-track');
  if (track) {
    track.style.opacity = '1';
    track.style.transition = 'none';
    track.style.transform = '';
    track.innerHTML = CI_QUESTIONS.map((q, idx) => buildCardHTML(q, idx)).join('');
  }
  
  ciAnimating = false;
  renderWheelState(false);
  syncCiDots();
}

function renderWheelState(animate) {
  const step = state.checkIn.step;
  const track = el('ci-wheel-track');
  if (!track) return;

  const cards = track.querySelectorAll('.ci-wheel-card');
  cards.forEach((card, index) => {
    card.className = 'ci-wheel-card';
    const isB = index === step;
    const isA = index === step - 1;
    const isC = index === step + 1;
    
    if (isB) card.classList.add('active');
    else if (isA) card.classList.add('prev');
    else if (isC) card.classList.add('next');
    else if (index < step) card.classList.add('far-prev');
    else card.classList.add('far-next');
  });

  // Card height 200px + margin 16px*2 = 232px per slot
  const SLOT = 232;
  const targetOffset = -(step * SLOT + SLOT / 2);
  
  if (!animate) {
    track.style.transition = 'none';
  } else {
    track.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
  }
  
  track.style.transform = `translateY(${targetOffset}px) translateZ(0)`;
  
  if (!animate) {
    void track.offsetHeight; // Force reflow
    track.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
  }
}

function answerCheckIn(metric, value) {
  if (ciAnimating) return;
  state.checkIn.answers[metric] = value;
  playSound('chime');

  const activeCard = el('ci-wheel-track')?.querySelector(`.ci-wheel-card[data-index="${state.checkIn.step}"]`);
  if (activeCard) {
    activeCard.querySelectorAll('.ci-emoji-btn').forEach(btn => {
      btn.classList.toggle('selected', +btn.dataset.value === value);
    });
  }

  ciAnimating = true;

  setTimeout(() => {
    if (state.checkIn.step < CI_QUESTIONS.length - 1) {
      state.checkIn.step++;
      syncCiDots();
      renderWheelState(true);
      // Release animating lock after transition completes
      setTimeout(() => { ciAnimating = false; }, 580);
    } else {
      const track = el('ci-wheel-track');
      if (track) {
        track.style.transition = 'transform 0.4s ease, opacity 0.35s ease';
        track.style.opacity = '0';
      }
      setTimeout(() => {
        state.checkIn.done = true;
        computeReadiness();
        saveToStorage();
        ciAnimating = false;
        navigateTo('screen-dashboard');
      }, 350);
    }
  }, 300);
}

function syncCiDots() {
  document.querySelectorAll('#checkin-dots .ci-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i < state.checkIn.step) dot.classList.add('done');
    else if (i === state.checkIn.step) dot.classList.add('active');
  });
}

function computeReadiness() {
  const { soreness, stress, sleep, energy, motivation } = state.checkIn.answers;
  const vals = [soreness, stress, sleep, energy, motivation].map(Number).filter(v => !isNaN(v) && v > 0);
  if (vals.length === 0) { state.readiness = 78; return; }
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  state.readiness = Math.round(((avg - 1) / 4) * 65 + 35);
  applyRecoveryTheme(state.readiness);
}

function applyRecoveryTheme(readiness) {
  const root = document.documentElement;
  if (!readiness) readiness = 78;
  if (readiness >= 80) {
    // High Readiness - Bright premium violet
    root.style.setProperty('--accent', '#8b5cf6');
    root.style.setProperty('--accent-glow', 'rgba(139,92,246,0.3)');
    root.style.setProperty('--accent-dim', 'rgba(139,92,246,0.15)');
    root.style.setProperty('--bg', '#060608');
  } else if (readiness >= 50) {
    // Recovery Mode - Calming Mint
    root.style.setProperty('--accent', '#10b981');
    root.style.setProperty('--accent-glow', 'rgba(16,185,129,0.3)');
    root.style.setProperty('--accent-dim', 'rgba(16,185,129,0.15)');
    root.style.setProperty('--bg', '#050806');
  } else {
    // Overstressed - Muted desaturated / soft crimson theme
    root.style.setProperty('--accent', '#f43f5e');
    root.style.setProperty('--accent-glow', 'rgba(244,63,94,0.3)');
    root.style.setProperty('--accent-dim', 'rgba(244,63,94,0.15)');
    root.style.setProperty('--bg', '#0b0607');
  }
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function updateRecoveryStateHeader() {
  const r = state.readiness || 78;
  const badge = el('dashboard-recovery-state');
  if (!badge) return;
  badge.className = 'active-badge';
  
  if (state.energyMode === 'recovery' || state.energyMode === 'mvs') {
    badge.textContent = 'Recovery Focused';
    badge.style.color = 'var(--mint)';
    badge.style.background = 'var(--mint-dim)';
    badge.style.borderColor = 'rgba(16,185,129,0.25)';
  } else if (r >= 80) {
    badge.textContent = 'Recovered';
    badge.style.color = 'var(--violet)';
    badge.style.background = 'var(--violet-dim)';
    badge.style.borderColor = 'rgba(139,92,246,0.25)';
  } else if (r >= 50) {
    badge.textContent = 'Stable';
    badge.style.color = 'var(--mint)';
    badge.style.background = 'var(--mint-dim)';
    badge.style.borderColor = 'rgba(16,185,129,0.25)';
  } else {
    badge.textContent = 'Strained';
    badge.style.color = 'var(--rose)';
    badge.style.background = 'rgba(244,63,94,0.1)';
    badge.style.borderColor = 'rgba(244,63,94,0.25)';
  }
}

function onEnterDashboard() {
  el('dashboard-date').textContent = fmtDateDisplay(new Date());
  animateRing(state.readiness || 0);
  updateAdviceCard();
  updateWorkoutCard();
  startWhyRotation();
  updateEngineInsights();
  updateRecoveryStateHeader();
  updateStreakUI();
}

function animateRing(target) {
  const ring = el('ring-prog');
  const val = el('ring-val');
  if (!ring || !val) return;
  const circ = 2 * Math.PI * 68; // r=68
  let cur = 0;
  const step = target / 40;
  ring.style.strokeDasharray = circ;
  ring.style.strokeDashoffset = circ;

  // Flash Dynamic Island
  const di = el('dynamic-island');
  di.classList.add('active');
  setTimeout(() => di.classList.remove('active'), 2000);

  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    const offset = circ - (cur / 100) * circ;
    ring.style.strokeDashoffset = offset;
    val.textContent = Math.round(cur);
    if (cur >= target) clearInterval(t);
  }, 20);
}

function updateAdviceCard() {
  const r = state.readiness;
  const card = el('advice-card');
  const body = el('advice-body');
  if (!card || !body) return;
  const exp = state.onboarding.experience || 'beginner';
  
  if (r === 0) {
    body.textContent = "Complete your daily sync to receive today's readiness assessment.";
    return;
  }
  if (r < 50) {
    card.style.borderColor = 'rgba(244,63,94,0.3)';
    card.style.background = 'rgba(244,63,94,0.04)';
    if (exp === 'experienced') {
      body.textContent = 'Central Nervous System overload detected. High risk of systemic fatigue. Compulsory de-load active: training weights reduced by 15%.';
    } else {
      body.textContent = 'Significant fatigue markers detected. Activate Minimum Viable Success — protect consistency, not intensity.';
    }
  } else if (r < 70) {
    card.style.borderColor = 'rgba(251,191,36,0.2)';
    card.style.background = 'rgba(251,191,36,0.03)';
    body.textContent = 'Moderate readiness. A focused, controlled session is ideal. Honor body cues today.';
  } else if (r < 85) {
    card.style.borderColor = 'rgba(16,185,129,0.2)';
    card.style.background = 'rgba(16,185,129,0.02)';
    body.textContent = "Good readiness. Stick to the plan with full focus. Today's session will build meaningful momentum.";
  } else {
    card.style.borderColor = 'rgba(139,92,246,0.2)';
    card.style.background = 'rgba(139,92,246,0.02)';
    body.textContent = 'Peak state detected. Your reserves are full — push strength boundaries with confidence today.';
  }
}

function updateWorkoutCard() {
  const today = state.workout.weekSplit[state.workout.todayIndex];
  el('tw-tag').textContent = today.type;
  el('tw-name').textContent = today.focus;
  const isMVS = state.mvsEnabled || state.energyMode === 'mvs';
  const exCount = isMVS ? 2 : (today.exercises?.length || 0);
  let mins;
  if (isMVS) mins = 20;
  else if (state.energyMode === 'full-push') mins = exCount * 14;
  else if (state.energyMode === 'recovery') mins = exCount * 7;
  else mins = exCount * 10;
  el('tw-meta').textContent = today.rest
    ? 'Rest day · Active recovery'
    : `${exCount} exercises · ${formatDuration(mins)}`;
}

// ─── Workout Screen ─────────────────────────────────────────────────────────
function updateWorkoutEnergyModeButton() {
  const btn = el('workout-energy-mode-btn');
  if (!btn) return;
  const mode = state.energyMode;
  const icons = { 'full-push': '🔥', standard: '⚡', recovery: '🌿', mvs: '🛡️' };
  btn.textContent = icons[mode] || '⚡';
}

function onEnterWorkout() {
  const today = state.workout.weekSplit[state.workout.todayIndex];
  el('workout-day-label').textContent = `${today.day} · ${today.type}`;
  el('workout-session-title').textContent = today.focus;
  
  // Update estimated session duration under header title
  const isMVS = state.mvsEnabled || state.energyMode === 'mvs';
  const exCount = isMVS ? 2 : (today.exercises?.length || 0);
  let mins;
  if (isMVS) mins = 20;
  else if (state.energyMode === 'full-push') mins = exCount * 14;
  else if (state.energyMode === 'recovery') mins = exCount * 7;
  else mins = exCount * 10;
  
  const metaEl = el('workout-session-meta');
  if (metaEl) {
    metaEl.textContent = today.rest
      ? 'Rest day · Active recovery'
      : `${exCount} exercises · ${formatDuration(mins)}`;
  }
  
  updateWorkoutEnergyModeButton();
  renderWorkoutGrid();
  renderWeekCalendar();
  renderMonthCalendar();
}

function switchCalView(view) {
  state.workout.calView = view;
  document.querySelectorAll('.cal-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.cal-btn').forEach(b => b.classList.remove('active'));
  el(`cal-view-${view}`)?.classList.add('active');
  el(`cal-${view}-btn`)?.classList.add('active');
}

// ─── Workout Grid ──────────────────────────────────────────────────────────
function renderWorkoutGrid() {
  const container = el('workout-grid');
  if (!container) return;
  container.innerHTML = '';

  const today = state.workout.weekSplit[state.workout.todayIndex];
  if (today.rest) {
    container.innerHTML = `
      <div style="grid-column:1/-1; padding:40px 0; text-align:center;">
        <div style="font-size:48px; margin-bottom:12px;">🌿</div>
        <p style="font-size:18px; font-weight:700; color:var(--text-1); margin-bottom:6px;">Rest Day</p>
        <p style="font-size:13px; color:var(--text-2);">Active recovery. Walk, stretch, breathe.</p>
      </div>`;
    return;
  }

  const exercises = state.workout.exercises;
  if (!exercises || exercises.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 16px; background:var(--surface-2); border:1.5px dashed var(--border); border-radius:22px;">
        <span style="font-size:32px; display:block; margin-bottom:10px;">⚡</span>
        <p style="font-size:15px; font-weight:700; color:var(--text-1); margin-bottom:4px;">No Exercises Active</p>
        <p style="font-size:12px; color:var(--text-3);">AURA is dynamically constructing your routine. Check check-in completion.</p>
      </div>`;
    return;
  }

  const displayEx = state.mvsEnabled ? exercises.slice(0, 2) : exercises;

  displayEx.forEach(ex => {
    const card = document.createElement('div');
    const allDone = ex.sets.length > 0 && ex.sets.every(s => s.done);
    card.className = `ex-card${allDone ? ' done' : ''}`;
    card.dataset.exId = ex.id;
    
    // Look up and format last session data
    const lastData = getLastSessionData(ex.id, ex.name);
    const formattedLast = lastData ? formatLastSession(lastData) : '—';
    
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <span class="ex-card-muscle">${ex.muscle}</span>
        <div class="ex-done-ring">
          <svg viewBox="0 0 12 10" fill="none"><polyline points="1,5 4,8 11,1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="ex-card-anim">
        <span style="font-size:40px;">${ex.icon || '🏋️'}</span>
      </div>
      <div>
        <p class="ex-card-name">${ex.name}</p>
        <div class="ex-card-meta">
          <span>3 × ${ex.reps} reps</span>
          <span>${ex.weight ? ex.weight + 'kg' : 'BW'}</span>
        </div>
        <p class="ex-card-last">Last: ${formattedLast}</p>
      </div>
      ${state.prs[ex.id] && state.prs[ex.id].weight > 0 ? '<div class="pr-badge">PR ⚡</div>' : ''}
    `;
    let pressTimer = null;
    let longPressed = false;
    
    const startPress = (e) => {
      longPressed = false;
      pressTimer = setTimeout(() => {
        triggerQuickOverload(ex.id, card);
        longPressed = true;
      }, 650); // 650ms long press threshold
    };
    
    const cancelPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    
    card.addEventListener('mousedown', startPress);
    card.addEventListener('touchstart', startPress, { passive: true });
    
    card.addEventListener('mouseup', cancelPress);
    card.addEventListener('mouseleave', cancelPress);
    card.addEventListener('touchend', cancelPress);
    card.addEventListener('touchcancel', cancelPress);
    
    card.addEventListener('click', (e) => {
      if (longPressed) {
        e.preventDefault();
        e.stopPropagation();
        longPressed = false;
        return;
      }
      openSheet(ex.id);
    });
    
    container.appendChild(card);
  });
  updateVolumeProgressBar();
}

// ─── Week Calendar ─────────────────────────────────────────────────────────
function renderWeekCalendar() {
  const container = el('week-calendar');
  if (!container) return;
  container.innerHTML = '';

  const today = new Date();
  const row = document.createElement('div');
  row.className = 'week-cal-row';

  state.workout.weekSplit.forEach((day, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - state.workout.todayIndex + i);
    const key = fmtDateKey(d);
    const isToday = i === state.workout.todayIndex;
    const h = state.workout.history[key];
    const isFuture = d > today && !isToday;

    const card = document.createElement('div');
    card.className = `wc-day-card${isToday ? ' today' : ''}${day.rest ? ' rest' : ''}`;
    if (isFuture) card.style.opacity = '0.4';

    let badge = day.rest ? '😴' : (isToday ? '▶' : (h?.logged ? '✓' : '·'));
    let badgeClass = day.rest ? 'rest-badge' : (isToday ? 'today-badge' : (h?.logged ? 'done' : ''));

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    card.innerHTML = `
      <div class="wc-card-header">
        <div class="wc-left">
          <div class="wc-date-box">
            <p class="wc-day-name">${days[i]}</p>
            <p class="wc-day-num">${d.getDate()}</p>
          </div>
          <div style="flex:1;">
            <p class="wc-session">${day.type}${isToday ? ' <span style="color:var(--violet);font-size:10px;font-weight:700;background:rgba(139,92,246,0.12);padding:1px 5px;border-radius:6px;margin-left:4px;">TODAY</span>' : ''}</p>
            <p class="wc-meta">${day.focus}</p>
          </div>
        </div>
        <div class="wc-badge ${badgeClass}">${badge}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (isFuture) return;
      
      const isSel = card.classList.contains('selected');
      
      // Close other drawers and clear selection
      document.querySelectorAll('.wc-day-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.wc-inline-details')?.remove();
      });
      
      if (!isSel) {
        card.classList.add('selected');
        state.workout.selectedCalDay = i;
        
        // Render inline details directly inside this card
        const inline = document.createElement('div');
        inline.className = 'wc-inline-details';
        inline.innerHTML = renderHistoryInspectorHTML(d, day, h);
        card.appendChild(inline);
      }
      
      playSound('tap');
    });

    row.appendChild(card);
  });

  container.appendChild(row);
}

function renderHistoryInspectorHTML(date, dayObj, history) {
  if (dayObj && dayObj.rest) {
    return `
      <div class="inspect-header-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span class="inspect-focus" style="font-weight:700; color:var(--text-1); font-size:14px;">🌿 REST DAY</span>
        <span class="inspect-badge rest" style="font-size:10px; font-weight:700; color:var(--text-3); background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:10px;">Active Rest</span>
      </div>
      <p style="font-size:13px; color:var(--text-2); margin-top:8px; line-height:1.5;">
        Scheduled focus: <strong>${dayObj.focus}</strong>. Muscles and central nervous system are repaired during active rest days.
      </p>
      ${history && history.notes ? `
      <div class="inspect-notes-box" style="margin-top:12px; background:var(--surface-3); padding:10px; border-radius:12px; border-left:3px solid var(--text-3);">
        <span class="inspect-notes-lbl" style="font-size:10px; font-weight:600; color:var(--text-3); text-transform:uppercase; display:block; margin-bottom:4px;">Reflections:</span>
        <p class="inspect-notes-txt" style="font-size:12px; font-style:italic; color:var(--text-2); margin:0;">"${history.notes}"</p>
      </div>` : ''}
    `;
  }

  if (!history) {
    return `
      <div class="inspect-empty" style="text-align:center; padding:16px 0;">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🎨</span>
        <p style="font-weight:600; color:var(--text-1); font-size:14px; margin-bottom:4px;">No Logs Recorded</p>
        <p style="font-size:12px; color:var(--text-3); max-width:220px; margin:0 auto;">Scheduled split for this day was <strong>${dayObj ? dayObj.focus : 'Training'}</strong>.</p>
      </div>
    `;
  }

  const readinessBadge = history.readiness >= 80 ? 'violet' : (history.readiness >= 50 ? 'mint' : 'rose');
  const badgeColors = {
    violet: { bg: 'var(--accent-dim)', text: 'var(--accent)', border: 'rgba(139,92,246,0.2)' },
    mint: { bg: 'var(--mint-dim)', text: 'var(--mint)', border: 'rgba(16,185,129,0.2)' },
    rose: { bg: 'rgba(244,63,94,0.1)', text: 'var(--rose)', border: 'rgba(244,63,94,0.2)' }
  };
  const badge = badgeColors[readinessBadge];

  return `
    <div class="inspect-grid" style="display:flex; flex-direction:column; gap:12px;">
      <div class="inspect-summary-row" style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div>
          <span class="inspect-focus" style="font-weight:700; color:var(--text-1); font-size:14px; display:block;">${history.type} Session</span>
          <p class="inspect-completion-lbl" style="font-size:11px; color:var(--mint); font-weight:600; margin-top:2px;">${history.completion}% Complete</p>
        </div>
        <div class="inspect-stats-group" style="display:flex; gap:6px;">
          <div class="inspect-stat-pill" style="display:flex; flex-direction:column; align-items:center; background:var(--surface-3); border:1px solid var(--border); padding:6px 10px; border-radius:12px; min-width:60px;">
            <span class="isp-lbl" style="font-size:8px; font-weight:600; color:var(--text-3); text-transform:uppercase; letter-spacing:0.04em;">Readiness</span>
            <span class="isp-val" style="font-size:12px; font-weight:800; color:${badge.text}; margin-top:2px;">${history.readiness}%</span>
          </div>
          <div class="inspect-stat-pill" style="display:flex; flex-direction:column; align-items:center; background:var(--surface-3); border:1px solid var(--border); padding:6px 10px; border-radius:12px; min-width:60px;">
            <span class="isp-lbl" style="font-size:8px; font-weight:600; color:var(--text-3); text-transform:uppercase; letter-spacing:0.04em;">Discipline</span>
            <span class="isp-val" style="font-size:12px; font-weight:800; color:var(--accent); margin-top:2px;">${history.discipline}</span>
          </div>
        </div>
      </div>

      <div class="inspect-divider" style="height:1px; background:var(--border); margin:4px 0;"></div>

      <div class="inspect-ex-list" style="display:flex; flex-direction:column; gap:6px;">
        <span class="inspect-section-title" style="font-size:10px; font-weight:600; color:var(--text-3); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:2px;">Completed Work</span>
        ${history.exercises.map(e => `
          <div class="inspect-ex-row" style="display:flex; align-items:center; gap:8px;">
            <span class="iex-bullet" style="color:var(--accent); font-size:14px; line-height:1;">•</span>
            <span class="iex-name" style="font-size:13px; color:var(--text-1);">${e}</span>
          </div>
        `).join('')}
      </div>

      ${history.notes ? `
        <div class="inspect-notes-box" style="margin-top:4px; background:var(--surface-3); padding:10px; border-radius:12px; border-left:3px solid var(--accent); border-color:var(--accent);">
          <span class="inspect-notes-lbl" style="font-size:10px; font-weight:600; color:var(--text-3); text-transform:uppercase; display:block; margin-bottom:4px;">Session reflections:</span>
          <p class="inspect-notes-txt" style="font-size:12px; font-style:italic; color:var(--text-2); margin:0;">"${history.notes}"</p>
        </div>
      ` : ''}
    </div>
  `;
}

function showWeekHistory(date, day, history) {
  const card = el('history-card');
  const dateEl = el('hc-date');
  const bodyEl = el('hc-body');
  if (!card || !dateEl || !bodyEl) return;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  dateEl.textContent = `${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()]} · ${months[date.getMonth()]} ${date.getDate()}`;

  bodyEl.innerHTML = renderHistoryInspectorHTML(date, day, history);
  card.classList.remove('hidden');
}

// ─── Month Calendar ─────────────────────────────────────────────────────────
function renderMonthCalendar() {
  const grid = el('month-grid');
  const title = el('month-title');
  if (!grid || !title) return;
  grid.innerHTML = '';

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + state.workout.monthOffset, 1);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  title.textContent = `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const firstDay = viewDate.getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  // Empty cells before month start
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'month-cell empty';
    grid.appendChild(cell);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
    const key = fmtDateKey(thisDate);
    const isToday = fmtDateKey(now) === key;
    const h = state.workout.history[key];
    const isFuture = thisDate > now;

    const cell = document.createElement('div');
    let classes = 'month-cell';
    if (isToday) classes += ' today';
    if (isFuture) classes += ' future';
    if (h?.logged) classes += ' worked';
    cell.className = classes;
    cell.innerHTML = `
      <span class="mc-num">${d}</span>
      ${!isFuture ? '<div class="mc-dot"></div>' : ''}
    `;

    cell.addEventListener('click', () => {
      if (isFuture) return;
      document.querySelectorAll('.month-cell').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      showMonthHistory(thisDate, h);
      playSound('tap');
    });

    grid.appendChild(cell);
  }
}

function showMonthHistory(date, history) {
  const card = el('month-history-card');
  const dateEl = el('month-hc-date');
  const bodyEl = el('month-hc-body');
  if (!card || !dateEl || !bodyEl) return;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  dateEl.textContent = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  if (!history) {
    bodyEl.innerHTML = `
      <div class="inspect-empty" style="text-align:center; padding:12px 0;">
        <span style="font-size:24px; display:block; margin-bottom:6px;">✨</span>
        <p style="font-weight:600; color:var(--text-1); font-size:13px; margin-bottom:2px;">No Logs Found</p>
        <p style="font-size:11px; color:var(--text-3); margin:0;">A clean slate for your progressive journey.</p>
      </div>`;
  } else if (!history.logged) {
    bodyEl.innerHTML = `
      <div class="inspect-empty" style="text-align:center; padding:12px 0;">
        <span style="font-size:24px; display:block; margin-bottom:6px;">🌿</span>
        <p style="font-weight:600; color:var(--text-1); font-size:13px; margin-bottom:2px;">Rest Day</p>
        <p style="font-size:11px; color:var(--text-3); margin:0;">CNS recovery active. Growth compounds during rest.</p>
      </div>`;
  } else {
    bodyEl.innerHTML = `
      <p style="font-size:12px;color:var(--text-2);margin-bottom:8px;">${history.type} Session</p>
      ${history.exercises.map(e => `<p style="font-size:13px;margin-bottom:4px;color:var(--text-1)">· ${e}</p>`).join('')}
    `;
  }
  card.classList.remove('hidden');
}

// ─── Bottom Sheet ──────────────────────────────────────────────────────────
function openSheet(exId) {
  const ex = state.workout.exercises.find(e => e.id === exId);
  if (!ex) return;
  state.activeSheet.exId = exId;

  el('sheet-ex-name').textContent = ex.name;
  el('sheet-ex-muscle').textContent = ex.muscle;

  // Sync sliders & inputs
  el('sc-weight-num').value = ex.weight;
  el('sc-weight-slider').value = ex.weight;
  el('sc-reps-num').value = ex.reps;
  el('sc-reps-slider').value = ex.reps;

  // Sync global difficulty slider
  const defaultDiff = ex.sets.length > 0 ? (ex.sets[0].rpe || 8) : 8;
  el('sc-diff-num').value = defaultDiff;
  el('sc-diff-slider').value = defaultDiff;

  // Init sets if none
  if (ex.sets.length === 0) {
    const r = state.readiness || 78;
    const exp = state.onboarding.experience || 'beginner';
    
    // Base sets by energy mode
    let modeSets = state.energyMode === 'full-push' ? 4 :
                   state.energyMode === 'recovery'   ? 2 : 3;
    
    // Experience-based set scaling
    if (exp === 'beginner') {
      modeSets = Math.min(modeSets, 3);  // cap at 3
    } else if (exp === 'experienced') {
      modeSets = Math.min(modeSets + 1, 5); // up to 5
    }
    
    if (r < 50 && modeSets > 2) {
      modeSets--;
    }
    const modeReps = state.energyMode === 'full-push' ? Math.ceil(ex.reps * 1.15) :
                     state.energyMode === 'recovery'   ? Math.floor(ex.reps * 0.7)  : ex.reps;
    for (let i = 0; i < modeSets; i++) {
      ex.sets.push({ weight: ex.weight, reps: modeReps, rpe: '', done: false });
    }
  }

  // Last session comparison
  const lastData = getLastSessionData(exId, ex.name);
  if (el('ls-val')) el('ls-val').textContent = lastData || '—';

  // Progressive overload suggestion
  const chip    = el('overload-chip');
  const chipTxt = el('overload-text');
  const suggestion = getOverloadSuggestion(ex);
  if (chip && chipTxt && suggestion) {
    chipTxt.textContent = suggestion.text;
    chip.dataset.delta  = suggestion.delta;
    chip.dataset.field  = suggestion.field;
    chip.style.display  = 'flex';
  } else if (chip) {
    chip.style.display = 'none';
  }

  // Restore saved notes
  if (el('sheet-notes')) el('sheet-notes').value = state.sessionNotes[exId] || '';

  // Sync rest selectors active class
  const durationSecs = state.restTimer.duration || 60;
  document.querySelectorAll('.rest-sel-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.secs, 10) === durationSecs);
  });

  renderSetsRows(ex);
  resetRestTimer();

  el('sheet-backdrop').classList.remove('hidden');
  el('sheet-backdrop').classList.add('visible');
  el('bottom-sheet').classList.add('open');
  playSound('tap');
}

function closeSheet() {
  el('sheet-backdrop').classList.remove('visible');
  el('sheet-backdrop').classList.add('hidden');
  el('bottom-sheet').classList.remove('open');
  stopRestTimer();
  state.activeSheet.exId = null;
  playSound('tap');
  renderWorkoutGrid();
}

function renderSetsRows(ex) {
  const container = el('sets-rows');
  if (!container) return;
  container.innerHTML = '';

  const allDone = ex.sets.length > 0 && ex.sets.every(s => s.done);
  const completeBtn = el('exercise-complete-btn');
  if (completeBtn) {
    completeBtn.style.background = allDone
      ? 'linear-gradient(135deg, #059669, #047857)'
      : 'linear-gradient(135deg, var(--mint), #059669)';
    completeBtn.textContent = allDone ? '✓ Exercise Complete!' : 'Mark Exercise Done';
    if (allDone && !completeBtn.dataset.celebrateSet) {
      completeBtn.dataset.celebrateSet = '1';
      completeBtn.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
    }
  }

  ex.sets.forEach((set, i) => {
    const row = document.createElement('div');
    row.className = `set-row${set.done ? ' logged' : ''}`;
    row.innerHTML = `
      <div class="set-row-top">
        <span class="set-num-label">Set ${i + 1}</span>
        <div class="set-row-actions">
          <button class="set-check${set.done ? ' done' : ''}" data-set-check="${i}">
            <svg viewBox="0 0 12 10" fill="none"><polyline points="1,5 4,8 11,1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="set-delete" data-set-delete="${i}">✕</button>
        </div>
      </div>
      <div class="set-row-fields">
        <div class="set-field">
          <span class="set-field-label">Weight (kg)</span>
          <input class="set-input" type="number" value="${set.weight}" min="0" max="300" data-set="${i}" data-field="weight">
        </div>
        <div class="set-field">
          <span class="set-field-label">Reps</span>
          <input class="set-input" type="number" value="${set.reps}" min="1" max="100" data-set="${i}" data-field="reps">
        </div>
        <div class="set-field">
          <span class="set-field-label">Difficulty (1-10)</span>
          <input class="set-input" type="number" value="${set.rpe || ''}" placeholder="—" data-set="${i}" data-field="rpe" min="1" max="10">
        </div>
      </div>
    `;

    // Input sync to state + set edited flags (with snappier real-time input event)
    row.querySelectorAll('.set-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = +input.dataset.set;
        const field = input.dataset.field;
        const exNow = state.workout.exercises.find(e => e.id === state.activeSheet.exId);
        if (exNow) {
          const val = field === 'rpe' ? (+input.value || '') : +input.value;
          exNow.sets[idx][field] = val;
          if (field === 'weight') exNow.sets[idx].weightEdited = true;
          if (field === 'reps') exNow.sets[idx].repsEdited = true;
          if (field === 'rpe') exNow.sets[idx].rpeEdited = true;
          saveToStorage();
        }
      });
    });

    row.querySelector('.set-check').addEventListener('click', () => {
      set.done = !set.done;
      if (set.done && checkForPR(ex, i)) flashPRBadge(ex.id);
      if (set.done) startRestTimer();
      renderSetsRows(ex);
      updateVolumeProgressBar();
      checkWorkoutCompletion();
      saveToStorage();
      
      // Auto-complete only when all sets checked & smooth completion timing
      if (set.done && ex.sets.every(s => s.done)) {
        setTimeout(() => {
          if (state.activeSheet.exId === ex.id) {
            closeSheet();
            showSaveSuccessFeedback("Exercise Complete! ⚡");
          }
        }, 600);
      }
    });

    row.querySelector('.set-delete').addEventListener('click', () => {
      deleteSet(ex.id, i, row);
    });

    container.appendChild(row);
  });
}

// ─── Rest Timer ────────────────────────────────────────────────────────────
function resetRestTimer() {
  stopRestTimer();
  const activeSel = document.querySelector('.rest-sel-btn.active');
  const d = activeSel ? parseInt(activeSel.dataset.secs, 10) : (state.restTimer.duration || 60);
  state.restTimer.duration = d;
  state.restTimer.remaining = d;
  updateRestTimerUI();
  el('rest-action-btn').textContent = 'Start';
  el('rest-action-btn').classList.remove('running');
}

function startRestTimer(secs) {
  stopRestTimer();
  const activeSel = document.querySelector('.rest-sel-btn.active');
  const d = activeSel ? parseInt(activeSel.dataset.secs, 10) : (state.restTimer.duration || secs || 60);
  
  state.restTimer.duration = d;
  state.restTimer.remaining = d;
  state.restTimer.running = true;
  el('rest-action-btn').textContent = 'Skip';
  el('rest-action-btn').classList.add('running');
  
  const ring = el('rr-prog');
  if (ring) ring.classList.add('pulsing');
  
  updateRestTimerUI();

  state.restTimer.intervalId = setInterval(() => {
    state.restTimer.remaining--;
    updateRestTimerUI();
    playSound('tick');
    if (state.restTimer.remaining <= 0) {
      stopRestTimer();
      playSound('done');
      if (ring) ring.classList.remove('pulsing');
      el('rest-action-btn').textContent = 'Start';
      el('rest-action-btn').classList.remove('running');
    }
  }, 1000);
}

function stopRestTimer() {
  if (state.restTimer.intervalId) {
    clearInterval(state.restTimer.intervalId);
    state.restTimer.intervalId = null;
  }
  state.restTimer.running = false;
  const ring = el('rr-prog');
  if (ring) ring.classList.remove('pulsing');
}

function updateRestTimerUI() {
  const prog = el('rr-prog');
  const val = el('rest-val');
  if (!prog || !val) return;
  const circ = 2 * Math.PI * 22; // r=22
  const offset = circ - (state.restTimer.remaining / state.restTimer.duration) * circ;
  prog.style.strokeDasharray = circ;
  prog.style.strokeDashoffset = state.restTimer.remaining === state.restTimer.duration ? circ : offset;
  val.textContent = state.restTimer.remaining > 0 ? state.restTimer.remaining + 's' : '✓';
}

// ─── Diet Screen ───────────────────────────────────────────────────────────
const MEALS = [
  {
    id: 'm1',
    name: 'Dal Chawal & Steamed Veggies',
    cal: 420,
    prot: 12,
    carbs: 78,
    fats: 6,
    sugars: 2,
    serving: '1 bowl (450g)',
    tag: 'veg',
    hostel: true,
    budget: 'low',
    label: 'Lunch',
    costHome: '₹25 - ₹35',
    costOutside: '₹70 - ₹100',
    overview: 'Traditional Indian comfort food. Red lentils and rice create a complete amino acid profile, low in fat and exceptionally digestion-friendly.',
    cooking: '1. Pressure cook red lentils with water, salt, and turmeric.\n2. Steam white rice separately.\n3. Combine and serve with fresh sliced carrots.',
    youtube: 'https://www.youtube.com/results?search_query=healthy+dal+chawal+recipe'
  },
  {
    id: 'm2',
    name: 'Paneer Bhurji & Whole-Wheat Roti',
    cal: 560,
    prot: 26,
    carbs: 58,
    fats: 22,
    sugars: 4,
    serving: '120g paneer + 2 rotis',
    tag: 'veg',
    hostel: false,
    budget: 'medium',
    label: 'Dinner',
    costHome: '₹55 - ₹75',
    costOutside: '₹160 - ₹220',
    overview: 'High-protein vegetarian staple. Casein rich paneer provides slow-release proteins, preventing muscle breakdown overnight.',
    cooking: '1. Crumble 100g of paneer.\n2. Saute onions, tomatoes, and chilies in 1 tsp ghee.\n3. Toss paneer, spices, and coriander. Serve hot with whole-wheat flatbread.',
    youtube: 'https://www.youtube.com/results?search_query=paneer+bhurji+recipe'
  },
  {
    id: 'm3',
    name: 'Egg Bhurji & Wheat Roti',
    cal: 490,
    prot: 28,
    carbs: 48,
    fats: 18,
    sugars: 3,
    serving: '3 eggs bhurji + 2 rotis',
    tag: 'egg',
    hostel: true,
    budget: 'low',
    label: 'Dinner',
    costHome: '₹35 - ₹45',
    costOutside: '₹90 - ₹130',
    overview: 'Ultimate budget recovery food. High biological value eggs provide all essential amino acids and critical healthy fats.',
    cooking: '1. Whisk 3 eggs with chopped onions, green chilies, and salt.\n2. Scramble on a greased pan until cooked.\n3. Serve alongside hot rotis.',
    youtube: 'https://www.youtube.com/results?search_query=indian+egg+bhurji+recipe'
  },
  {
    id: 'm4',
    name: 'Spiced Peanut Poha',
    cal: 380,
    prot: 9,
    carbs: 68,
    fats: 10,
    sugars: 2,
    serving: '1 plate (250g)',
    tag: 'veg',
    hostel: true,
    budget: 'low',
    label: 'Breakfast',
    costHome: '₹15 - ₹20',
    costOutside: '₹40 - ₹60',
    overview: 'Lightweight complex carbohydrates. Poha is easy to digest, while crunchy roasted peanuts provide a steady stream of healthy fats.',
    cooking: '1. Rinse poha in water and drain.\n2. Temper mustard seeds, curry leaves, and green chilies in 1 tsp oil.\n3. Add roasted peanuts, a pinch of turmeric, salt, and toss in poha.',
    youtube: 'https://www.youtube.com/results?search_query=peanut+poha+healthy+recipe'
  },
  {
    id: 'm5',
    name: 'Hostel Milk & Banana Shake',
    cal: 340,
    prot: 16,
    carbs: 58,
    fats: 6,
    sugars: 22,
    serving: '500ml milk + 2 bananas',
    tag: 'veg',
    hostel: true,
    budget: 'low',
    label: 'Fuel / Snack',
    costHome: '₹28 - ₹34',
    costOutside: '₹60 - ₹80',
    overview: 'No-cook high calorie fuel. Exceptional mass-gain energy source requiring absolutely no kitchen equipment.',
    cooking: '1. Peel two ripe bananas.\n2. Hand-mash or blend with 500ml cold toned milk.\n3. Add a pinch of cardamom powder for flavor.',
    youtube: 'https://www.youtube.com/results?search_query=banana+milkshake+healthy'
  },
  {
    id: 'm6',
    name: 'High-Protein Maggi Hack',
    cal: 440,
    prot: 20,
    carbs: 62,
    fats: 12,
    sugars: 3,
    serving: '1 pack + 80g Paneer/Soy',
    tag: 'veg',
    hostel: true,
    budget: 'low',
    label: 'Hostel Special',
    costHome: '₹22 - ₹30',
    costOutside: '₹80 - ₹110',
    overview: 'Quick hostel post-workout carb reload. Soy chunks or paneer blocks transform simple instant noodles into a macro-balanced meal.',
    cooking: '1. Boil Maggi in electric kettle.\n2. Drop in pre-soaked soy chunks or paneer cubes during boiling.\n3. Add the spice tastemaker and simmer till dry.',
    youtube: 'https://www.youtube.com/results?search_query=healthy+high+protein+maggi'
  },
  {
    id: 'm7',
    name: 'Peanut Butter Honey Toast',
    cal: 460,
    prot: 15,
    carbs: 52,
    fats: 20,
    sugars: 12,
    serving: '3 brown breads + 2 tbsp PB',
    tag: 'veg',
    hostel: true,
    budget: 'low',
    label: 'Pre-Workout Snack',
    costHome: '₹18 - ₹24',
    costOutside: '₹70 - ₹90',
    overview: 'Rich monounsaturated fat supply. High in natural arginine amino acids which aid blood flow and muscle pumps.',
    cooking: '1. Toast 3 slices of whole grain bread.\n2. Spread a generous layer of unsweetened peanut butter.\n3. Drizzle raw honey.',
    youtube: 'https://www.youtube.com/results?search_query=peanut+butter+banana+toast'
  },
  {
    id: 'm8',
    name: 'Curd Rice & Roasted Peanuts',
    cal: 410,
    prot: 13,
    carbs: 64,
    fats: 11,
    sugars: 4,
    serving: '1 medium bowl (350g)',
    tag: 'veg',
    hostel: true,
    budget: 'low',
    label: 'Snack',
    costHome: '₹20 - ₹28',
    costOutside: '₹80 - ₹110',
    overview: 'High-absorption cooling recovery. Curd provides active gut-beneficial lactobacillus probiotics enhancing protein digestion.',
    cooking: '1. Mix soft boiled rice with thick fresh curd.\n2. Salt to taste.\n3. Garnish with a quick mustard seeds temper and roasted peanuts.',
    youtube: 'https://www.youtube.com/results?search_query=healthy+south+indian+curd+rice'
  },
  {
    id: 'm9',
    name: 'Premium Air-Fried Tandoori Chicken',
    cal: 290,
    prot: 38,
    carbs: 4,
    fats: 12,
    sugars: 0,
    serving: '180g chicken breast',
    tag: 'nonveg',
    hostel: false,
    budget: 'high',
    label: 'High Protein',
    costHome: '₹80 - ₹110',
    costOutside: '₹250 - ₹350',
    overview: 'Lean recovery gold standard. Virtually pure muscle-building blocks, loaded with B-vitamins and creatine precursors.',
    cooking: '1. Marinate chicken breast in hung curd, ginger-garlic, lemon, and tandoori spices.\n2. Air fry at 200°C for 16 minutes.',
    youtube: 'https://www.youtube.com/results?search_query=air+fryer+tandoori+chicken+breast'
  },
  {
    id: 'm10',
    name: 'Whey Protein Oatmeal Bowl',
    cal: 390,
    prot: 32,
    carbs: 48,
    fats: 6,
    sugars: 4,
    serving: '50g oats + 1 scoop whey',
    tag: 'veg',
    hostel: true,
    budget: 'high',
    label: 'Premium Fuel',
    costHome: '₹95 - ₹120',
    costOutside: '₹220 - ₹280',
    overview: 'Post-workout anabolic fuel. Quick-absorbing whey isolate combined with beta-glucan fibers supporting heart health.',
    cooking: '1. Microwave oats with water for 2 minutes.\n2. Allow to cool slightly (prevents whey curdling).\n3. Stir in 1 scoop of premium whey isolate.',
    youtube: 'https://www.youtube.com/results?search_query=whey+protein+oatmeal+recipe'
  },
  {
    id: 'm11',
    name: 'Soy Chunk Bhurji & Roti',
    cal: 480,
    prot: 34,
    carbs: 56,
    fats: 10,
    sugars: 2,
    serving: '100g soy chunks + 2 rotis',
    tag: 'veg',
    hostel: true,
    budget: 'low',
    label: 'High Protein Lunch',
    costHome: '₹22 - ₹30',
    costOutside: '₹90 - ₹120',
    overview: 'Highest plant protein density. Extremely rich in leucine and arginine, supporting lean nitrogen storage.',
    cooking: '1. Boil and coarsely grind soy chunks.\n2. Stir fry with onion, tomato, and kitchen spices.\n3. Serve hot with whole-wheat rotis.',
    youtube: 'https://www.youtube.com/results?search_query=high+protein+soy+chunk+bhurji'
  },
  {
    id: 'm12',
    name: 'Premium Salmon Fillet & Steamed Rice',
    cal: 610,
    prot: 42,
    carbs: 62,
    fats: 22,
    sugars: 0,
    serving: '150g salmon fillet + 1 cup rice',
    tag: 'nonveg',
    hostel: false,
    budget: 'high',
    label: 'Elite Recovery',
    costHome: '₹380 - ₹480',
    costOutside: '₹750 - ₹1100',
    overview: 'Elite anti-inflammatory nutrition. Omega-3 rich marine fatty acids (EPA/DHA) actively soothe muscle soreness.',
    cooking: '1. Season salmon with salt and pepper.\n2. Pan sear skin-down for 5 mins, flip for 3 mins.\n3. Serve alongside warm steamed rice.',
    youtube: 'https://www.youtube.com/results?search_query=pan+seared+salmon+recipe+healthy'
  }
];


// Simulated match database of compatible peer candidates
const SIMULATED_MATCHES = [
  {
    id: 'm_arjun',
    name: 'Arjun K.',
    gender: 'male',
    age: 24,
    country: 'India',
    city: 'Mumbai',
    avatarInitials: 'AK',
    disciplineScore: 91,
    goals: ['muscle-gain', 'discipline'],
    ambition: 'consistent',
    training: 'gym',
    profession: 'software',
    income: '50-100',
    schedule: 'evening',
    lifeGoals: ['discipline', 'career'],
    personality: 'intense',
    trustSignals: { streak: 92, recovery: 85, consistency: 94 }
  },
  {
    id: 'm_riya',
    name: 'Riya Sharma',
    gender: 'female',
    age: 22,
    country: 'India',
    city: 'Delhi',
    avatarInitials: 'RS',
    disciplineScore: 88,
    goals: ['weight-loss', 'discipline'],
    ambition: 'consistent',
    training: 'home',
    profession: 'student',
    income: 'student',
    schedule: 'morning',
    lifeGoals: ['confidence', 'lifestyle'],
    personality: 'calm',
    trustSignals: { streak: 88, recovery: 90, consistency: 92 }
  },
  {
    id: 'm_karan',
    name: 'Karan V.',
    gender: 'male',
    age: 29,
    country: 'India',
    city: 'Bangalore',
    avatarInitials: 'KV',
    disciplineScore: 94,
    goals: ['athlete', 'discipline'],
    ambition: 'ambitious',
    training: 'hybrid',
    profession: 'founder',
    income: '100+',
    schedule: 'night',
    lifeGoals: ['athletic', 'longevity'],
    personality: 'competitive',
    trustSignals: { streak: 95, recovery: 70, consistency: 96 }
  }
];

function addNotification(type, title, message, time) {
  const notif = {
    id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    type: type,
    title: title,
    message: message,
    time: time || 'Just now',
    read: false
  };
  if (!state.notifications) state.notifications = [];
  state.notifications.unshift(notif);
  renderNotifications();
  updateNotifBadge();
}

function renderNotifications() {
  const list = el('notif-list');
  if (!list) return;
  list.innerHTML = '';
  
  const notifs = state.notifications || [];
  if (notifs.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding:40px 16px; opacity:0.5;">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🔔</span>
        <p style="font-size:13px; font-weight:700; color:var(--text-1); margin-bottom:4px;">All Clear</p>
        <p style="font-size:11px; color:var(--text-3); margin:0;">You have no new notifications.</p>
      </div>`;
    return;
  }
  
  notifs.forEach(n => {
    const item = document.createElement('div');
    item.className = 'notif-item';
    item.dataset.id = n.id;
    
    const dotHtml = n.read ? '<span class="notif-dot read"></span>' : '<span class="notif-dot"></span>';
    
    item.innerHTML = `
      ${dotHtml}
      <div style="flex:1;">
        <p class="notif-item-title">${n.title}</p>
        <p class="notif-item-body">${n.message}</p>
        <p class="notif-item-time">${n.time}</p>
      </div>
    `;
    
    // Click to mark as read
    item.addEventListener('click', () => {
      n.read = true;
      renderNotifications();
      updateNotifBadge();
    });
    
    list.appendChild(item);
  });
}

function updateNotifBadge() {
  const badge = el('notif-badge');
  if (!badge) return;
  
  const unreadCount = (state.notifications || []).filter(n => !n.read).length;
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function calculateCompatibility(p1, p2) {
  let score = 40; // baseline compatibility

  // 1. Discipline Score Similarity (Max 20 points)
  const dDiff = Math.abs((p1.disciplineScore || 78) - (p2.disciplineScore || 78));
  if (dDiff <= 4) score += 20;
  else if (dDiff <= 8) score += 15;
  else if (dDiff <= 15) score += 10;
  else if (dDiff <= 25) score += 5;

  // 2. Goal Alignment (Fitness Goals & Life Goals) (Max 20 points)
  const p1Goals = p1.goals || [];
  const p2Goals = p2.goals || [];
  const commonFitnessGoals = p1Goals.filter(g => p2Goals.includes(g));
  score += Math.min(10, commonFitnessGoals.length * 5);

  const p1Life = p1.lifeGoals || [];
  const p2Life = p2.lifeGoals || [];
  const commonLifeGoals = p1Life.filter(g => p2Life.includes(g));
  score += Math.min(10, commonLifeGoals.length * 4);

  // 3. Consistency/Streak Similarity (Max 15 points)
  const p1Streak = p1.streak || 4;
  const p2Streak = p2.trustSignals?.streak || p2.streak || 4;
  const streakDiff = Math.abs(p1Streak - p2Streak);
  if (streakDiff <= 2) score += 15;
  else if (streakDiff <= 5) score += 10;
  else if (streakDiff <= 8) score += 5;

  // 4. Ambition Level (Max 15 points)
  if (p1.ambition === p2.ambition) {
    score += 15;
  } else {
    // Adjacent ambition levels
    const ambitionOrder = { casual: 0, consistent: 1, ambitious: 2 };
    const a1 = ambitionOrder[p1.ambition || 'consistent'];
    const a2 = ambitionOrder[p2.ambition || 'consistent'];
    if (Math.abs(a1 - a2) === 1) score += 8;
  }

  // 5. Lifestyle & Personality Compatibility (Max 10 points)
  if (p1.personality === p2.personality) {
    score += 10;
  } else {
    // Complementary energies
    const complementary = {
      calm: ['balanced', 'analytical'],
      intense: ['competitive', 'motivational'],
      balanced: ['calm', 'analytical', 'motivational'],
      analytical: ['calm', 'balanced'],
      competitive: ['intense', 'motivational'],
      motivational: ['intense', 'competitive', 'balanced']
    };
    const cList = complementary[p1.personality || 'balanced'] || [];
    if (cList.includes(p2.personality)) score += 6;
  }

  // 6. Availability / Training Schedule (Max 10 points)
  if (p1.schedule === p2.schedule) {
    score += 10;
  } else {
    // Adjacent training times (e.g. afternoon/evening vs morning/night)
    const scheduleOrder = { morning: 0, afternoon: 1, evening: 2, night: 3 };
    const s1 = scheduleOrder[p1.schedule || 'evening'];
    const s2 = scheduleOrder[p2.schedule || 'evening'];
    if (Math.abs(s1 - s2) === 1) score += 5;
  }

  // 7. Location Preference (Max 5 points)
  const locationPref = state.auth.matchingPreferences.location || 'country';
  if (locationPref === 'city' && p1.city && p2.city && p1.city.toLowerCase() === p2.city.toLowerCase()) {
    score += 5;
  } else if (locationPref === 'country' && p1.country && p2.country && p1.country.toLowerCase() === p2.country.toLowerCase()) {
    score += 5;
  } else if (p1.country && p2.country && p1.country.toLowerCase() === p2.country.toLowerCase()) {
    score += 3;
  }

  // 8. Income Range Similarity (Max 5 points) - Internal lifestyle alignment check
  // Helps prevent extreme mismatch (student vs high income) but does not dominate.
  const p1Income = p1.income || 'student';
  const p2Income = p2.income || 'student';
  if (p1Income === p2Income) {
    score += 5;
  } else {
    const incomeOrder = { 'student': 0, '10-25': 1, '25-50': 2, '50-100': 3, '100+': 4 };
    const i1 = incomeOrder[p1Income] !== undefined ? incomeOrder[p1Income] : 0;
    const i2 = incomeOrder[p2Income] !== undefined ? incomeOrder[p2Income] : 0;
    const gap = Math.abs(i1 - i2);
    if (gap === 1) score += 3;
    else if (gap === 2) score += 1;
  }

  return Math.min(99, score);
}

function startMatchingSearch() {
  playSound('tap');
  
  const backdrop = el('match-filter-backdrop');
  if (backdrop) backdrop.classList.add('hidden');
  
  el('find-partner-card')?.classList.add('hidden');
  
  const pendingCard = el('match-pending-card');
  if (pendingCard) {
    pendingCard.classList.remove('hidden');
    pendingCard.classList.add('active');
  }
  
  state.auth.matchPending = true;
  saveToStorage();
  
  if (state.auth.matchTimer) clearTimeout(state.auth.matchTimer);
  
  // 15 seconds delayed premium queue
  state.auth.matchTimer = setTimeout(() => {
    state.auth.matchPending = false;
    
    const user = state.auth.user || {
      goals: ['discipline'],
      disciplineScore: 78,
      ambition: 'consistent',
      training: 'gym',
      schedule: 'evening',
      profession: 'software'
    };
    
    // Calculate compat scores for all candidates
    const scored = SIMULATED_MATCHES.map(candidate => {
      const pct = calculateCompatibility(user, candidate);
      return { ...candidate, compatibilityPct: pct };
    }).sort((a, b) => b.compatibilityPct - a.compatibilityPct);
    
    const bestFit = scored[0];
    state.auth.matchedCandidate = bestFit;
    
    el('match-pending-card')?.classList.add('hidden');
    
    addNotification('match', 'Match Found ✦', `We've found a highly compatible accountability match: ${bestFit.name} (${bestFit.compatibilityPct}% aligned).`, todayKey());
    playSound('chime');
    
    renderMatchCard(bestFit);
    
    saveToStorage();
  }, 15000);
}

function renderMatchCard(candidate) {
  const existing = el('aura-match-candidate-card');
  if (existing) existing.remove();
  
  const container = el('find-partner-card')?.parentElement;
  if (!container) return;
  
  const card = document.createElement('div');
  card.id = 'aura-match-candidate-card';
  card.className = 'match-card';
  card.style.cssText = `background:linear-gradient(135deg, var(--surface-2), rgba(139,92,246,0.08));border:1.5px solid rgba(139,92,246,0.25);border-radius:24px;padding:20px;margin-bottom:20px;position:relative;animation: slideUp 0.45s cubic-bezier(0.1, 0.8, 0.2, 1);`;
  
  const formatMap = { gym: '🏋️ Gym', home: '🏠 Home', hybrid: '⚡ Hybrid', outdoor: '🌄 Outdoor' };
  
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
      <div>
        <span style="font-size:9px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:0.12em;background:rgba(139,92,246,0.1);padding:3px 8px;border-radius:8px;">Compatible Candidate</span>
        <h3 style="font-size:18px;font-weight:800;color:var(--text-1);margin-top:6px;">${candidate.name}</h3>
        <p style="font-size:11px;color:var(--text-3);margin-top:2px;">${candidate.city}, ${candidate.country} · ${candidate.profession.toUpperCase()}</p>
      </div>
      <div style="text-align:right;">
        <span style="font-size:24px;font-weight:900;color:var(--mint);font-family:var(--font-2);">${candidate.compatibilityPct}%</span>
        <p style="font-size:8px;color:var(--text-3);text-transform:uppercase;letter-spacing:0.04em;margin-top:2px;">Alignment</p>
      </div>
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
      <div style="background:var(--surface-3);border:1px solid var(--border);padding:8px;border-radius:12px;text-align:center;">
        <span style="font-size:12px;font-weight:700;color:var(--text-1);display:block;">${candidate.disciplineScore}</span>
        <span style="font-size:9px;color:var(--text-3);">Discipline Index</span>
      </div>
      <div style="background:var(--surface-3);border:1px solid var(--border);padding:8px;border-radius:12px;text-align:center;">
        <span style="font-size:12px;font-weight:700;color:var(--text-1);display:block;">${formatMap[candidate.training] || candidate.training}</span>
        <span style="font-size:9px;color:var(--text-3);">Training Style</span>
      </div>
    </div>

    <div style="margin-bottom:14px;background:rgba(255,255,255,0.02);border:1px solid var(--border);padding:10px 12px;border-radius:14px;">
      <p style="font-size:10px;color:var(--text-3);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Trust Indicators</p>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;color:var(--text-2);">Consistency Stability:</span>
          <span style="font-size:11px;font-weight:700;color:var(--mint);">${candidate.trustSignals.consistency}%</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;color:var(--text-2);">Streak Reliability:</span>
          <span style="font-size:11px;font-weight:700;color:var(--accent);">${candidate.trustSignals.streak}%</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;color:var(--text-2);">Recovery Respect:</span>
          <span style="font-size:11px;font-weight:700;color:var(--violet);">${candidate.trustSignals.recovery}%</span>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:8px;">
      <button class="primary-btn" id="send-match-request-btn" style="flex:2;margin:0;font-size:12px;" data-candidate-id="${candidate.id}">Send Accountability Request →</button>
      <button class="ghost-btn" id="decline-match-candidate-btn" style="flex:1;margin:0;font-size:12px;">Decline</button>
    </div>
  `;
  
  const ref = el('find-partner-card') || el('match-pending-card');
  if (ref) {
    ref.after(card);
  }
}

function sendAccountabilityRequest(candidateId) {
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
    reqBtn.textContent = '✦ Request Submitted (Pending)';
    reqBtn.disabled = true;
    reqBtn.style.opacity = '0.75';
    reqBtn.style.background = 'var(--surface-3)';
  }
  
  // Simulate Arjun K. accepting your request after 10 seconds!
  setTimeout(() => {
    backdrop?.classList.remove('visible');
    setTimeout(() => backdrop?.classList.add('hidden'), 300);
    
    el('aura-match-candidate-card')?.remove();
    
    const user = state.auth.user || { name: 'Praneeth' };
    const pct = calculateCompatibility(user, candidate);
    
    state.auth.partner = {
      ...candidate,
      compatibilityPct: pct
    };
    
    addNotification('social', 'Partnership Active! 🤝', `${candidate.name} accepted your accountability request. Let's build consistency together.`, todayKey());
    playSound('chime');
    
    renderSocialsUI();
    saveToStorage();
  }, 10000);
}

function declineMatchCandidate() {
  playSound('tap');
  el('aura-match-candidate-card')?.remove();
  
  const findCard = el('find-partner-card');
  if (findCard) {
    findCard.classList.remove('hidden');
    const title = findCard.querySelector('.fpc-title');
    const sub = findCard.querySelector('.fpc-sub');
    
    if (title) title.textContent = "Searching for Aligned Partner";
    if (sub) sub.textContent = "That match wasn't aligned this time. We're continuing to scan the network queue for a better fit.";
  }
  
  state.auth.matchedCandidate = null;
  saveToStorage();
}

function acceptIncomingRequest() {
  playSound('done');
  
  const ravi = {
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
  
  state.auth.partner = ravi;
  
  el('incoming-request-card')?.classList.add('hidden');
  
  addNotification('social', 'Partnership Established 🤝', 'Ravi V. is now your accountability partner. Stay consistent!', todayKey());
  playSound('chime');
  
  renderSocialsUI();
  saveToStorage();
}

function declineIncomingRequest() {
  playSound('tap');
  el('incoming-request-card')?.classList.add('hidden');
  addNotification('social', 'Request Declined', 'Declined Ravi V.\'s request. We\'ll continue scanning for partnerships.', todayKey());
  
  renderSocialsUI();
  saveToStorage();
}

function endPartnership() {
  playSound('tap');
  state.auth.partner = null;
  state.auth.incomingRequestShown = false;
  renderSocialsUI();
  saveToStorage();
  addNotification('social', 'Partnership Ended', 'Your accountability partnership has been closed. AURA will continue scanning for your next match.', todayKey());
}

function renderSocialsUI() {
  const findCard = el('find-partner-card');
  const pendingCard = el('match-pending-card');
  const activeCard = el('active-partner-card');
  const incomingCard = el('incoming-request-card');
  
  if (!findCard || !pendingCard || !activeCard || !incomingCard) return;
  
  findCard.classList.add('hidden');
  pendingCard.classList.add('hidden');
  activeCard.classList.add('hidden');
  incomingCard.classList.add('hidden');
  
  const partner = state.auth.partner;
  const pending = state.auth.matchPending;
  const enabled = state.auth.matchingEnabled;
  
  if (!enabled) {
    findCard.classList.remove('hidden');
    const title = findCard.querySelector('.fpc-title');
    const sub = findCard.querySelector('.fpc-sub');
    const btn = el('find-partner-btn');
    if (title) title.textContent = "Matching System Suspended";
    if (sub) sub.textContent = "Enable matching in your privacy configurations below to scan for accountability partner recommendations.";
    if (btn) btn.disabled = true;
    return;
  }
  
  const btn = el('find-partner-btn');
  if (btn) btn.disabled = false;
  
  const title = findCard.querySelector('.fpc-title');
  const sub = findCard.querySelector('.fpc-sub');
  if (title) title.textContent = "Find an Accountability Partner";
  if (sub) sub.textContent = "We match you based on discipline score, goals, schedule, and lifestyle compatibility. Not random. Not instant.";
  
  if (partner) {
    activeCard.classList.remove('hidden');
    
    const initials = (partner.avatarInitials || partner.name || 'AK').substring(0,2).toUpperCase();
    const avatarBadge = el('partner-avatar-badge');
    if (avatarBadge) {
      avatarBadge.textContent = initials;
      avatarBadge.style.background = 'linear-gradient(135deg, var(--mint), #059669)';
      avatarBadge.style.color = '#fff';
    }
    
    if (el('partner-name')) el('partner-name').textContent = partner.name;
    if (el('partner-location')) el('partner-location').textContent = `${partner.city || 'Mumbai'}, ${partner.country || 'India'}`;
    if (el('partner-compat')) el('partner-compat').textContent = `${partner.compatibilityPct || 87}%`;
    if (el('partner-discipline')) el('partner-discipline').textContent = String(partner.disciplineScore || 91);
    
    const formatMap = { gym: 'Gym', home: 'Home', hybrid: 'Hybrid', outdoor: 'Outdoor' };
    const styleStr = `${formatMap[partner.training] || partner.training} · ${(partner.schedule || 'evening').toUpperCase()}`;
    if (el('partner-training')) el('partner-training').textContent = styleStr;
    
  } else if (pending) {
    pendingCard.classList.remove('hidden');
  } else {
    findCard.classList.remove('hidden');
  }
}

function onEnterSquad() {
  renderSocialsUI();
  updateStreakUI();
  calculateDisciplineScore();
  renderProgressChart();
  
  const user = state.auth.user || { name: 'Praneeth' };
  const score = state.readiness ? Math.round(50 + (state.readiness - 35) * (50 / 65)) : 78;
  const statusTags = ['Locked In', 'Consistent', 'Disciplined', 'Recovery Focused'];
  let activeTag = statusTags[1];
  if (score >= 88) activeTag = statusTags[0];
  else if (score >= 75) activeTag = statusTags[2];
  else if (score < 55) activeTag = statusTags[3];
  
  if (el('discipline-score-val')) el('discipline-score-val').textContent = String(score);
  if (el('discipline-status-tag')) el('discipline-status-tag').textContent = activeTag;
  if (el('acc-streak-val')) el('acc-streak-val').textContent = String(calculateStreak());
  if (el('chart-avg')) el('chart-avg').textContent = '91 avg';
  if (el('discipline-expl')) el('discipline-expl').textContent = `Discipline shielding is locked in at ${score}% effectiveness. Peer accountability pacer is aligned.`;
  
  // Populate circle
  if (el('sm-you-avatar')) {
    const initials = (user.name || 'PR').substring(0,2).toUpperCase();
    el('sm-you-avatar').textContent = initials;
    if (user.avatar) {
      el('sm-you-avatar').textContent = '';
      el('sm-you-avatar').style.backgroundImage = `url(${user.avatar})`;
      el('sm-you-avatar').style.backgroundSize = 'cover';
      el('sm-you-avatar').style.backgroundPosition = 'center';
    }
  }
  if (el('sm-you-name')) el('sm-you-name').innerHTML = `${user.name || 'Praneeth'} <span class="sm-you">you</span>`;
  if (el('sm-you-status')) el('sm-you-status').textContent = `Synced today · ${score} index`;
  if (el('sm-you-score')) el('sm-you-score').textContent = String(score);
  
  setTimeout(() => renderDisciplineChart(), 400);
  
  // Trigger simulated incoming request
  if (!state.auth.partner && !state.auth.matchPending && !state.auth.incomingRequestShown) {
    state.auth.incomingRequestShown = true;
    setTimeout(() => {
      if (state.currentScreen === 'screen-squad' && !state.auth.partner && !state.auth.matchPending) {
        playSound('chime');
        el('incoming-request-card')?.classList.remove('hidden');
        addNotification('social', 'Incoming Request 🤝', 'Ravi V. (82% compatible) wants to be your accountability partner.', todayKey());
        showSaveSuccessFeedback();
      }
    }, 4500);
  }
}

function renderDisciplineChart() {
  const canvas = el('discipline-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  
  const data = [85, 90, 82, 88, 96, 92, 95];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  ctx.clearRect(0, 0, width, height);
  
  ctx.font = '700 8.5px var(--font-2)';
  ctx.fillStyle = 'var(--text-3)';
  ctx.textAlign = 'center';
  
  const step = width / (data.length - 1);
  const scaleY = (val) => height - 20 - ((val - 60) / 40) * (height - 35);
  
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  [70, 80, 90, 100].forEach(gridVal => {
    const y = scaleY(gridVal);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  });
  
  ctx.beginPath();
  ctx.moveTo(0, scaleY(data[0]));
  for (let i = 1; i < data.length; i++) {
    const x = i * step;
    const y = scaleY(data[i]);
    const prevX = (i - 1) * step;
    const prevY = scaleY(data[i - 1]);
    
    const cpX1 = prevX + step / 3;
    const cpY1 = prevY;
    const cpX2 = prevX + (2 * step) / 3;
    const cpY2 = y;
    
    ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
  }
  
  ctx.strokeStyle = 'var(--accent)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'var(--accent-glow)';
  ctx.shadowBlur = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  ctx.lineTo(width, height - 15);
  ctx.lineTo(0, height - 15);
  ctx.closePath();
  
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'var(--accent-dim)');
  grad.addColorStop(1, 'rgba(139,92,246,0)');
  ctx.fillStyle = grad;
  ctx.fill();
  
  for (let i = 0; i < data.length; i++) {
    const x = i * step;
    const y = scaleY(data[i]);
    
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = i === data.length - 1 ? 'var(--mint)' : 'var(--accent)';
    ctx.fill();
    ctx.strokeStyle = '#0c0c12';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.fillStyle = 'var(--text-3)';
    ctx.fillText(days[i], x, height - 4);
  }
}

function onEnterDiet() {
  recalculateSmartProtein();
  renderMeals();
  syncMacroUI();
  syncDietFilterPills();
  syncDietFilterDropdowns();
  updateDietTipCard();
}

function updateDietTipCard() {
  const card = el('diet-tip-card');
  const icon = el('diet-tip-icon');
  const title = el('diet-tip-title');
  const text = el('diet-tip-text');
  if (!card || !icon || !title || !text) return;
  
  const exp = state.onboarding.experience || 'beginner';
  
  card.classList.remove('hidden');
  if (exp === 'beginner') {
    icon.textContent = '🌱';
    title.textContent = 'Beginner Nutrition Guide';
    text.textContent = 'Focus on basic protein source consistency (like paneer, dal, or eggs) and clean hydration before moving to complex supplements. Simpler 15-min meals recommended.';
  } else if (exp === 'returning') {
    icon.textContent = '🔄';
    title.textContent = 'Returning Nutrition Guide';
    text.textContent = 'Priority is re-establishing protein consistency to lock in muscle memory. Aim for moderate protein (1.6g/kg) and steady calorie surplus/deficit based on goal.';
  } else {
    icon.textContent = '⚡';
    title.textContent = 'Experienced Nutrition Guide';
    text.textContent = 'Micro-target compound overload windows. CNS fatigue logic active: scale protein to 2.0g/kg to repair deep muscle tissue. Hydrate heavily to flush lactic acid.';
  }
}

function onEnterRecovery() {
  const r = state.readiness || 78;
  const answers = state.checkIn.answers || {};
  const exp = state.onboarding.experience || 'beginner';
  
  if (el('rec-readiness-score')) el('rec-readiness-score').textContent = state.checkIn.done ? `${r}%` : '—';
  if (el('rec-readiness-bar')) el('rec-readiness-bar').style.width = state.checkIn.done ? `${r}%` : '0%';
  
  const statusEl = el('rec-status-badge');
  const msgEl = el('rec-readiness-msg');
  if (statusEl && msgEl) {
    if (!state.checkIn.done) {
      statusEl.textContent = 'Un-synced';
      statusEl.className = 'rec-status-badge';
      statusEl.style.background = 'rgba(255, 255, 255, 0.08)';
      statusEl.style.color = 'var(--text-3)';
      msgEl.textContent = 'Complete your daily sync to generate your recovery score.';
    } else if (r >= 80) {
      statusEl.textContent = 'Optimal';
      statusEl.className = 'rec-status-badge';
      statusEl.style.background = 'var(--mint-dim)';
      statusEl.style.color = 'var(--mint)';
      msgEl.textContent = 'System fully recovered. Ready for compound progressions and high overload capacity.';
    } else if (r >= 50) {
      statusEl.textContent = 'Stable';
      statusEl.className = 'rec-status-badge';
      statusEl.style.background = 'rgba(16,185,129,0.12)';
      statusEl.style.color = 'var(--mint)';
      if (exp === 'experienced') {
        msgEl.textContent = 'CNS load elevated from compound overload. Suggesting active mobility & grounding noise.';
      } else {
        msgEl.textContent = 'CNS indicators stable. Stick to moderate volume pacing, honor local muscle soreness.';
      }
    } else {
      statusEl.textContent = 'Overtaxed';
      statusEl.className = 'rec-status-badge';
      statusEl.style.background = 'rgba(244,63,94,0.12)';
      statusEl.style.color = 'var(--rose)';
      if (exp === 'experienced') {
        msgEl.textContent = 'CNS REDLINE: Central nervous system heavily fatigued. Compulsory de-load suggested. Avoid failure.';
      } else {
        msgEl.textContent = 'CNS fatigue elevated. Parasympathetic priority: scale down intensity, utilize box breathing.';
      }
    }
  }

  const cnsLoadTag = el('cns-load-tag');
  if (cnsLoadTag) {
    if (!state.checkIn.done) {
      cnsLoadTag.textContent = 'Un-synced';
      cnsLoadTag.style.color = 'var(--text-3)';
      cnsLoadTag.style.background = 'rgba(255, 255, 255, 0.08)';
    } else if (r >= 80) {
      cnsLoadTag.textContent = 'Low CNS Load';
      cnsLoadTag.style.color = 'var(--mint)';
      cnsLoadTag.style.background = 'var(--mint-dim)';
    } else if (r >= 50) {
      cnsLoadTag.textContent = 'Moderate Load';
      cnsLoadTag.style.color = 'var(--violet)';
      cnsLoadTag.style.background = 'var(--violet-dim)';
    } else {
      cnsLoadTag.textContent = 'HIGH CNS LOAD 🚨';
      cnsLoadTag.style.color = 'var(--rose)';
      cnsLoadTag.style.background = 'rgba(244,63,94,0.15)';
    }
  }

  const scoreMap = { 1: '💀', 2: '🤕', 3: '😐', 4: '😊', 5: '⚡' };
  const stressMap = { 1: '🌋', 2: '😤', 3: '😐', 4: '🧘', 5: '🍃' };
  const sleepMap = { 1: '💤', 2: '😴', 3: '😐', 4: '😌', 5: '✨' };

  if (el('cns-soreness')) el('cns-soreness').textContent = state.checkIn.done ? scoreMap[answers.soreness] || '😐' : '—';
  if (el('cns-stress')) el('cns-stress').textContent = state.checkIn.done ? stressMap[answers.stress] || '😐' : '—';
  if (el('cns-sleep')) el('cns-sleep').textContent = state.checkIn.done ? sleepMap[answers.sleep] || '😐' : '—';
}

function syncDietFilterDropdowns() {
  const typeSel = el('diet-dropdown-type');
  const budgetSel = el('diet-dropdown-budget');
  const lifeSel = el('diet-dropdown-lifestyle');
  
  if (typeSel) typeSel.value = state.onboarding.diet || 'veg';
  if (budgetSel) budgetSel.value = state.onboarding.budget || 'low';
  if (lifeSel) lifeSel.value = state.onboarding.lifestyle || 'hostel';
}

function syncDietFilterPills() {
  // Sync select dropdowns
  syncDietFilterDropdowns();

  const diet = state.onboarding.diet || 'veg';
  document.querySelectorAll('.diet-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.diet === diet);
  });
  
  const budget = state.onboarding.budget || 'low';
  document.querySelectorAll('.budget-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.budget === budget);
  });

  const lifestyle = state.onboarding.lifestyle || 'hostel';
  document.querySelectorAll('.lifestyle-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lifestyle === lifestyle);
  });
}

function renderMeals() {
  const container = el('meals-container');
  if (!container) return;
  
  // Premium smooth fade transition for meal list updates
  container.style.opacity = '0.3';
  container.style.transform = 'translateY(4px)';
  
  setTimeout(() => {
    container.innerHTML = '';

    const dietPref = state.onboarding.diet || 'veg';
    const budgetPref = state.onboarding.budget || 'low';
    const lifestylePref = state.onboarding.lifestyle || 'hostel';

  const filtered = MEALS.filter(m => {
    if (lifestylePref === 'hostel' && !m.hostel) return false;
    
    if (dietPref === 'veg' && m.tag !== 'veg') return false;
    if (dietPref === 'eggetarian' && m.tag === 'nonveg') return false;

    if (budgetPref === 'low' && m.budget !== 'low') return false;
    if (budgetPref === 'medium' && m.budget === 'high') return false;

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="text-align:center; padding:32px 16px; background:var(--surface-2); border:1.5px dashed var(--border); border-radius:22px; margin-top:12px;">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🥪</span>
        <p style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:4px;">No matching meals found</p>
        <p style="font-size:12px; color:var(--text-3); margin:0;">AURA suggests adjusting budget tiers or lifestyle filters to broaden meal recommendations.</p>
      </div>`;
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
    return;
  }

  filtered.forEach(m => {
    const logged = state.nutrition.loggedMeals.has(m.id);
    const card = document.createElement('div');
    card.className = `meal-card${logged ? ' logged' : ''}`;
    card.style.cursor = 'pointer';
    card.style.transition = 'all var(--dur-fast) var(--ease-spring)';
    
    card.innerHTML = `
      <div class="meal-left" style="flex:1;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span class="meal-tag ${m.tag}">${m.tag === 'veg' ? '🟢 Pure Veg' : m.tag === 'egg' ? '🥚 Eggitarian' : '🔴 Non-Veg'}</span>
          <span style="font-size:9.5px; color:var(--text-3); font-weight:700;">Home: ${m.costHome}</span>
        </div>
        <p class="meal-name" style="font-size:13.5px; font-weight:700; color:var(--text-1);">${m.name}</p>
        <p class="meal-macros" style="font-size:11px; margin-top:3px; color:var(--text-2);"><span>${m.cal} kcal</span> · <span class="p">${m.prot}g protein</span> · ${m.label}</p>
      </div>
      <button class="meal-log-btn" data-meal-id="${m.id}" style="z-index:10; flex-shrink:0;">${logged ? '✓' : '+'}</button>
    `;
    
    card.addEventListener('click', e => {
      if (e.target.closest('.meal-log-btn')) {
        e.stopPropagation();
        toggleMeal(m.id);
        return;
      }
      openFoodSheet(m.id);
    });

    container.appendChild(card);
  });

  // Complete smooth hardware-accelerated transition back to fully visible
  container.style.opacity = '1';
  container.style.transform = 'translateY(0)';
  }, 100);
}

function openFoodSheet(mealId) {
  const m = MEALS.find(x => x.id === mealId);
  if (!m) return;

  el('food-sheet-name').textContent = m.name;
  
  const tagEl = el('food-sheet-tag');
  tagEl.className = `meal-tag ${m.tag}`;
  tagEl.textContent = m.tag === 'veg' ? '🟢 Pure Veg' : m.tag === 'egg' ? '🥚 Eggitarian' : '🔴 Non-Veg';

  el('food-sheet-cal').textContent = m.cal;
  el('food-sheet-prot').textContent = m.prot + 'g';
  el('food-sheet-carbs').textContent = (m.carbs || Math.round(m.cal * 0.45 / 4)) + 'g';
  el('food-sheet-fats').textContent = (m.fats || Math.round(m.cal * 0.3 / 9)) + 'g';

  el('food-sheet-cost-home').textContent = m.costHome;
  el('food-sheet-cost-outside').textContent = m.costOutside;
  el('food-sheet-overview').textContent = m.overview;
  el('food-sheet-cooking').textContent = m.cooking;

  const ytR = el('food-sheet-youtube-wrap');
  if (ytR) {
    ytR.onclick = () => window.open(m.youtube, '_blank');
  }

  el('food-sheet-backdrop').classList.remove('hidden');
  el('food-sheet-backdrop').classList.add('visible');
  el('food-sheet').classList.add('open');
  playSound('tap');
}

function closeFoodSheet() {
  el('food-sheet-backdrop').classList.remove('visible');
  el('food-sheet-backdrop').classList.add('hidden');
  el('food-sheet').classList.remove('open');
  playSound('tap');
}

function toggleMeal(mealId) {
  const m = MEALS.find(x => x.id === mealId);
  if (!m) return;
  const n = state.nutrition;
  if (n.loggedMeals.has(mealId)) {
    n.loggedMeals.delete(mealId);
    n.loggedCal -= m.cal;
    n.loggedProt -= m.prot;
  } else {
    n.loggedMeals.add(mealId);
    n.loggedCal += m.cal;
    n.loggedProt += m.prot;
  }
  playSound('chime');
  syncMacroUI();
  renderMeals();
  saveToStorage();
}

function syncMacroUI() {
  const n = state.nutrition;
  
  el('cal-logged').textContent = Math.round(n.loggedCal);
  el('prot-logged').textContent = Math.round(n.loggedProt) + 'g';
  
  const calPct = Math.min(100, (n.loggedCal / n.targetCal) * 100);
  const protPct = Math.min(100, (n.loggedProt / n.targetProt) * 100);
  el('cal-bar').style.width = calPct + '%';
  el('prot-bar').style.width = protPct + '%';
  
  const ltr = (n.loggedWater / 1000).toFixed(1);
  const targetLtr = 4.0;
  const displayEl = el('water-litres-display');
  if (displayEl) {
    displayEl.textContent = `${ltr}L / ${targetLtr}L`;
  }
  const waterFill = el('water-progress-fill');
  const waterCard = waterFill ? waterFill.closest('.hydration-card') : null;
  if (waterFill) {
    const wPct = Math.min(100, (n.loggedWater / 4000) * 100);
    waterFill.style.width = wPct + '%';
    const completed = n.loggedWater >= 4000;
    if (completed) {
      waterFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      if (waterCard) {
        waterCard.style.borderColor = 'rgba(16,185,129,0.5)';
        waterCard.style.boxShadow = '0 0 18px rgba(16,185,129,0.18)';
      }
      if (displayEl) displayEl.style.color = 'var(--mint)';
      if (!waterCard?.dataset.glowSet) {
        if (waterCard) {
          waterCard.dataset.glowSet = '1';
          waterCard.classList.add('water-complete');
          playSound('chime');
        }
      }
    } else {
      waterFill.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
      if (waterCard) {
        waterCard.style.borderColor = '';
        waterCard.style.boxShadow = '';
        waterCard.dataset.glowSet = '';
        waterCard.classList.remove('water-complete');
      }
      if (displayEl) displayEl.style.color = '#3b82f6';
    }
  }

  updateFuelScore();
}

// ─── Recovery ──────────────────────────────────────────────────────────────
const BREATHING_PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];
const PHASE_DUR = 4; // seconds each

function toggleBreathing() {
  const r = state.recovery;
  if (r.breathingActive) {
    r.breathingActive = false;
    clearInterval(r.breathingTimer);
    r.breathingTimer = null;
    el('breathing-btn').textContent = 'Start Session';
    el('breathing-prompt').textContent = 'Tap to begin';
    el('breathing-ring').classList.remove('expand', 'contract');
  } else {
    r.breathingActive = true;
    r.breathingPhase = 0;
    r.phaseSeconds = 0;
    el('breathing-btn').textContent = 'Stop Session';
    runBreathingPhase();
    r.breathingTimer = setInterval(runBreathingPhase, PHASE_DUR * 1000);
  }
}

function runBreathingPhase() {
  const r = state.recovery;
  const phase = r.breathingPhase % 4;
  const ring = el('breathing-ring');
  const prompt = el('breathing-prompt');
  if (!ring || !prompt) return;
  prompt.textContent = BREATHING_PHASES[phase];
  ring.classList.remove('expand', 'contract');
  void ring.offsetHeight; // force reflow
  if (phase === 0) ring.classList.add('expand');
  else if (phase === 2) ring.classList.add('contract');
  playSound('tick');
  r.breathingPhase++;
}

function toggleAmbient() {
  const r = state.recovery;
  if (r.ambientPlaying) {
    stopAmbient();
  } else {
    startAmbient();
  }
}

function startAmbient() {
  try {
    const ctx = getAudioCtx();
    const bufSize = 2 * ctx.sampleRate;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * w) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start();
    state.recovery.ambientNode = noise;
    state.recovery.ambientGain = gain;
    state.recovery.ambientPlaying = true;
    updateAmbientUI();
  } catch(e) {}
}

function stopAmbient() {
  const r = state.recovery;
  try {
    const ctx = getAudioCtx();
    if (r.ambientGain) {
      r.ambientGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      setTimeout(() => { r.ambientNode?.stop(); }, 800);
    }
  } catch(e) {}
  r.ambientPlaying = false;
  r.ambientNode = null; r.ambientGain = null;
  updateAmbientUI();
}

function updateAmbientUI() {
  const btn = el('ambient-btn');
  const name = el('ambient-name');
  if (!btn || !name) return;
  if (state.recovery.ambientPlaying) {
    btn.classList.add('playing');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    name.textContent = 'Playing Grounding Resonance…';
  } else {
    btn.classList.remove('playing');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>`;
    name.textContent = 'Deep Brown Noise';
  }
}

// ─── Squad / Progress ──────────────────────────────────────────────────────


function calculateDisciplineScore() {
  const history = state.workout.history || {};
  const streak = calculateStreak() || 4;
  const syncDone = state.checkIn.done;
  
  // Calculate baseline consistency score
  let baseScore = 65; 
  
  // 1. Streak compounds (max +20 points)
  baseScore += Math.min(20, streak * 4);
  
  // 2. Daily Sync completed today? (+10 points)
  if (syncDone) baseScore += 10;
  
  // 3. Adherence to recovery (CNS respect): 
  // If readiness was low (<50) and user selected recovery/mvs mode, reward them! (+10 CNS respect points)
  if (state.readiness > 0 && state.readiness < 50 && (state.energyMode === 'recovery' || state.energyMode === 'mvs')) {
    baseScore += 10;
  }
  
  // 4. Workout sets completion percentage (max +15 points)
  let setsPlanned = 0;
  let setsDone = 0;
  state.workout.exercises.forEach(ex => {
    setsPlanned += ex.sets.length || 3;
    setsDone += ex.sets.filter(s => s.done).length;
  });
  if (setsPlanned > 0) {
    baseScore += Math.round((setsDone / setsPlanned) * 15);
  } else {
    // If rest day, reward active rest completion (+15 points)
    baseScore += 15;
  }

  // Cap absolute score bounds at [45, 100]
  const finalScore = Math.min(100, Math.max(45, baseScore));
  
  // Determine status archetype
  let status = 'Consistent';
  let desc = 'Streak compounds, morning check-in updated, and recovery boundaries honored. Maintain locked-in focus to compound your progress.';
  let badgeColor = 'var(--mint)';
  let bgGradient = 'rgba(16, 185, 129, 0.12)';
  let glowColor = 'rgba(16, 185, 129, 0.3)';

  if (finalScore >= 92) {
    status = 'Locked In';
    desc = 'Absolute focus. Every morning habit, daily sync metric, and progressive overload suggest has been executed flawlessly. You are identical with your training routine.';
    badgeColor = 'var(--violet)';
    bgGradient = 'var(--violet-dim)';
    glowColor = 'var(--violet-glow)';
  } else if (finalScore >= 78) {
    status = 'Consistent';
    desc = 'Solid training integrity. Consistency protected across CNS loading constraints. Daily check-in complete. Keep anchoring workouts to guard momentum.';
    badgeColor = '#60a5fa';
    bgGradient = 'rgba(96, 165, 250, 0.12)';
    glowColor = 'rgba(96, 165, 250, 0.3)';
  } else if (finalScore >= 55) {
    status = 'Disciplined';
    desc = 'Standard habit loop. Pushing weight factors steadily but CNS sleep metrics require more respect. Anchor rest days to compound recovery.';
    badgeColor = '#fb923c';
    bgGradient = 'rgba(251, 146, 60, 0.12)';
    glowColor = 'rgba(251, 146, 60, 0.3)';
  } else {
    status = 'Recovery Focused';
    desc = 'Fatigue levels recognized. Muscle tissues and CNS require dedicated relaxation. Sleep and hydration priority active. Progress builds in rest.';
    badgeColor = 'var(--mint)';
    bgGradient = 'rgba(16, 185, 129, 0.12)';
    glowColor = 'rgba(16, 185, 129, 0.3)';
  }

  // Render to UI
  const scoreValEl = el('discipline-score-val');
  const statusTagEl = el('discipline-status-tag');
  const explEl = el('discipline-expl');

  if (scoreValEl) scoreValEl.textContent = finalScore;
  if (statusTagEl) {
    statusTagEl.textContent = status;
    statusTagEl.style.background = badgeColor;
    statusTagEl.style.color = '#000';
    statusTagEl.style.boxShadow = `0 0 12px ${glowColor}`;
  }
  if (explEl) explEl.textContent = desc;

  // Sync with Socials/Squad members list (Praneeth index matches finalScore)
  document.querySelectorAll('.squad-member').forEach(m => {
    const nameEl = m.querySelector('.sm-name');
    if (nameEl && nameEl.textContent.includes('Praneeth')) {
      const scoreEl = m.querySelector('.sm-score');
      if (scoreEl) scoreEl.textContent = finalScore;
      const statusEl = m.querySelector('.sm-status');
      if (statusEl) statusEl.textContent = `Synced today · ${finalScore} index`;
    }
  });

  // Sync squad progress average chart header
  const avgEl = el('chart-avg');
  if (avgEl) {
    const mockAvg = Math.round((finalScore + 90 + 88) / 3);
    avgEl.textContent = `${mockAvg} avg`;
  }
}

function renderProgressChart() {
  const canvas = el('discipline-chart');
  if (!canvas) return;
  const ctx2d = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx2d.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const scores = [65, 72, 80, 75, 88, 91, 95];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const padL = 8, padR = 8, padT = 12, padB = 18;
  const gW = W - padL - padR, gH = H - padT - padB;
  const pts = scores.map((s, i) => ({
    x: padL + (gW / (scores.length - 1)) * i,
    y: padT + gH - ((s - 50) / 50) * gH,
  }));

  // Fill
  const grad = ctx2d.createLinearGradient(0, padT, 0, padT + gH);
  grad.addColorStop(0, 'rgba(139,92,246,0.25)');
  grad.addColorStop(1, 'rgba(139,92,246,0)');
  ctx2d.fillStyle = grad;
  ctx2d.beginPath();
  ctx2d.moveTo(pts[0].x, padT + gH);
  pts.forEach((p, i) => {
    if (i === 0) ctx2d.lineTo(p.x, p.y);
    else { const cx = (pts[i-1].x + p.x) / 2; ctx2d.bezierCurveTo(cx, pts[i-1].y, cx, p.y, p.x, p.y); }
  });
  ctx2d.lineTo(pts[pts.length-1].x, padT + gH);
  ctx2d.closePath(); ctx2d.fill();

  // Stroke
  ctx2d.strokeStyle = '#8b5cf6';
  ctx2d.lineWidth = 2.5;
  ctx2d.shadowColor = 'rgba(139,92,246,0.4)';
  ctx2d.shadowBlur = 8;
  ctx2d.beginPath();
  pts.forEach((p, i) => {
    if (i === 0) ctx2d.moveTo(p.x, p.y);
    else { const cx = (pts[i-1].x + p.x) / 2; ctx2d.bezierCurveTo(cx, pts[i-1].y, cx, p.y, p.x, p.y); }
  });
  ctx2d.stroke();
  ctx2d.shadowBlur = 0;

  // Dots + Labels
  pts.forEach((p, i) => {
    ctx2d.fillStyle = '#8b5cf6';
    ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx2d.fill();
    ctx2d.fillStyle = '#fff';
    ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx2d.fill();
    ctx2d.fillStyle = '#6a6a7a';
    ctx2d.font = `500 9px 'Outfit', sans-serif`;
    ctx2d.textAlign = 'center';
    ctx2d.fillText(days[i], p.x, padT + gH + 13);
  });
}

// ─── Energy Mode ────────────────────────────────────────────────────────────
function showEnergyModeSelector() {
  const backdrop = el('energy-modal-backdrop');
  if (!backdrop) return;
  updateEnergyDurations();
  document.querySelectorAll('.em-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.mode === state.energyMode);
  });
  backdrop.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => backdrop.classList.add('visible')));
}

function hideEnergyModeSelector() {
  const backdrop = el('energy-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('visible');
  setTimeout(() => backdrop.classList.add('hidden'), 340);
}

function setEnergyMode(mode) {
  state.energyMode = mode;
  state.mvsEnabled = (mode === 'mvs');
  document.querySelectorAll('.em-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.mode === mode);
  });
}

function updateEnergyDurations() {
  const count = state.mvsEnabled ? 2 : (state.workout.exercises?.length || 4);
  if (el('em-dur-standard')) el('em-dur-standard').textContent = `~${count * 10} min`;
  if (el('em-dur-full'))     el('em-dur-full').textContent     = `~${count * 14} min`;
  if (el('em-dur-recovery')) el('em-dur-recovery').textContent = `~${count * 7} min`;
}

function confirmEnergyMode() {
  state.sessionStarted = true;
  hideEnergyModeSelector();
  
  const today = state.workout.weekSplit[state.workout.todayIndex];
  const isMVS = state.mvsEnabled || state.energyMode === 'mvs';
  const exCount = isMVS ? 2 : (today.exercises?.length || 0);
  let mins;
  if (isMVS) mins = 20;
  else if (state.energyMode === 'full-push') mins = exCount * 14;
  else if (state.energyMode === 'recovery') mins = exCount * 7;
  else mins = exCount * 10;
  
  const metaEl = el('workout-session-meta');
  if (metaEl) {
    metaEl.textContent = today.rest
      ? 'Rest day · Active recovery'
      : `${exCount} exercises · ${formatDuration(mins)}`;
  }
  
  updateWorkoutEnergyModeButton();
  updateWorkoutCard();
  renderWorkoutGrid();
  saveToStorage();
  playSound('chime');
}

// ─── Workout Completion Celebration ─────────────────────────────────────────
function checkWorkoutCompletion() {
  const exercises = state.workout.exercises;
  if (!exercises || exercises.length === 0) return;
  const active = (state.mvsEnabled || state.energyMode === 'mvs')
    ? exercises.slice(0, 2) : exercises;
  const allDone = active.every(ex => ex.sets.length > 0 && ex.sets.every(s => s.done));
  if (allDone && !state.celebrationShown) {
    state.celebrationShown = true;
    setTimeout(showCelebration, 900);
  }
}

function updateCelebrationStats() {
  let vol = 0;
  let durationMins = 0;
  
  if (state.workout.exercises) {
    state.workout.exercises.forEach(ex => {
      ex.sets.forEach(s => { if (s.done) vol += (s.weight || 0) * (s.reps || 0); });
    });
  }
  
  const baseDuration = state.sessionStartTime
    ? Math.round((Date.now() - state.sessionStartTime) / 60000)
    : 30;
  
  let customCount = 0;
  if (state.workout.exercises) {
    customCount = state.workout.exercises.filter(ex => ex.id.startsWith('custom_')).length;
  }
  durationMins = baseDuration + customCount * 10;
  
  const todayDay = state.workout.weekSplit?.[state.workout.todayIndex];
  const focusLabel = todayDay?.type ? todayDay.type.toUpperCase() : 'WORKOUT';
  
  if (el('cel-focus-label'))  el('cel-focus-label').textContent  = focusLabel;
  if (el('cel-volume'))       el('cel-volume').textContent       = vol > 0 ? String(Math.round(vol)) : '—';
  const baseDisc = 8 + customCount * 2;
  if (el('cel-discipline'))   el('cel-discipline').textContent   = '+' + baseDisc;
  if (el('cel-streak'))       el('cel-streak').textContent       = String(calculateStreak() || 1);
  if (el('cel-duration'))     el('cel-duration').textContent     = String(durationMins);
  
  const btn = el('cel-share-btn');
  if (btn) {
    btn.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:6px;"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>Share Progress`;
  }
}

function showCelebration() {
  const overlay = el('celebration-overlay');
  if (!overlay) return;
  
  updateCelebrationStats();
  
  spawnParticles();
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('visible')));
  playSound('done');
  logTodaySession();
}

function hideCelebration() {
  const overlay = el('celebration-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => {
    overlay.classList.add('hidden');
    state.celebrationShown = false;
  }, 420);
  closeSheet();
  navigateTo('screen-dashboard');
}

function spawnParticles() {
  const container = el('celebration-particles');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['var(--accent)', '#10b981', '#f59e0b', '#60a5fa', '#f43f5e', '#a78bfa'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'cel-particle';
    p.style.cssText = `left:${8 + Math.random() * 84}%;bottom:0;background:${colors[i % colors.length]};animation-delay:${(Math.random() * 0.9).toFixed(2)}s;animation-duration:${(1.8 + Math.random() * 1.4).toFixed(2)}s;`;
    container.appendChild(p);
  }
}

function logTodaySession() {
  const today = todayKey();
  const todayDay = state.workout.weekSplit[state.workout.todayIndex];
  state.workout.history[today] = {
    logged: true,
    type: todayDay.type,
    exercises: state.workout.exercises
      .filter(ex => ex.sets.some(s => s.done))
      .map(ex => {
        const done = ex.sets.filter(s => s.done);
        return `${ex.name}: ${done.length} sets x ${done[0]?.reps || ex.reps} reps${ex.weight ? ' @ ' + ex.weight + 'kg' : ''}`;
      }),
    readiness: state.readiness,
    discipline: 90 + Math.round(Math.random() * 8),
    notes: Object.values(state.sessionNotes).filter(Boolean).join(' | ') || '',
    completion: 100,
  };
  saveToStorage();
}

// ─── Today's Why Rotation ────────────────────────────────────────────────────
function startWhyRotation() {
  const identity = state.onboarding.identity || 'scholar';
  const whys = TODAYS_WHY[identity] || TODAYS_WHY.scholar;
  
  // Dynamically generate dot indicators if needed
  const dotsContainer = el('why-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    whys.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = 'why-dot-ind' + (idx === 0 ? ' active' : '');
      dot.dataset.why = idx;
      dotsContainer.appendChild(dot);
    });
  }

  const idx = state.whyIndex % whys.length;
  if (el('why-text')) el('why-text').textContent = whys[idx];
  updateWhyDots(whys.length, idx);
  if (state.whyTimer) clearInterval(state.whyTimer);
  state.whyTimer = setInterval(() => {
    state.whyIndex = (state.whyIndex + 1) % whys.length;
    animateWhyText(whys[state.whyIndex]);
    updateWhyDots(whys.length, state.whyIndex);
  }, 5500);
}

function animateWhyText(text) {
  const t = el('why-text');
  if (!t) return;
  t.style.opacity = '0';
  t.style.transform = 'translateY(7px)';
  setTimeout(() => {
    t.textContent = text;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
  }, 290);
}

function updateWhyDots(total, active) {
  document.querySelectorAll('.why-dot-ind').forEach((d, i) => {
    d.classList.toggle('active', i === active);
  });
}

// ─── Engine Insights ────────────────────────────────────────────────────────
function toggleEngineInsights() {
  const acc  = el('insights-accordion');
  const body = el('insights-body');
  if (!acc || !body) return;
  const isOpen = acc.classList.contains('open');
  acc.classList.toggle('open', !isOpen);
  body.classList.toggle('hidden', isOpen);
  playSound('tap');
}

function updateEngineInsights() {
  const r    = state.readiness || 78;
  const mode = state.energyMode;
  const cnsMap  = { 'full-push': 'High 🔴', standard: 'Moderate 🟡', recovery: 'Low 🟢', mvs: 'Minimal 🔵' };
  const modeNames = { 'full-push': 'Full Push 🔥', standard: 'Standard ⚡', recovery: 'Recovery 🌿', mvs: 'Min. Viable 🛡️' };
  const recWin = r >= 80 ? '18–22h' : r >= 60 ? '22–28h' : '28–36h';
  if (el('ins-cns'))      el('ins-cns').textContent      = cnsMap[mode]    || 'Moderate 🟡';
  if (el('ins-recovery')) el('ins-recovery').textContent = recWin;
  if (el('ins-energy'))   el('ins-energy').textContent   = modeNames[mode] || 'Standard ⚡';
}

// ─── Last Session Lookup ─────────────────────────────────────────────────────
function getLastSessionData(exId, exName) {
  const history = state.workout.history;
  const today   = todayKey();
  const firstName = (exName || '').split(' ')[0].toLowerCase();
  const keys = Object.keys(history)
    .filter(k => k < today && history[k].logged && history[k].exercises?.length)
    .sort((a, b) => b.localeCompare(a));
  for (const key of keys) {
    const match = history[key].exercises.find(e =>
      typeof e === 'string' && e.toLowerCase().includes(firstName)
    );
    if (match) {
      const colon = match.indexOf(':');
      return colon >= 0 ? match.slice(colon + 1).trim() : match;
    }
  }
  return null;
}

// ─── LocalStorage Persistence ────────────────────────────────────────────────
const STORAGE_KEY = 'aura_state_v1';

function saveToStorage() {
  try {
    const snap = {
      onboarding:   state.onboarding,
      checkIn:      state.checkIn,
      readiness:    state.readiness,
      energyMode:   state.energyMode,
      mvsEnabled:   state.mvsEnabled,
      sessionNotes: state.sessionNotes,
      prs:          state.prs,
      nutrition: {
        ...state.nutrition,
        loggedMeals: [...state.nutrition.loggedMeals],
      },
      workout: {
        history:    state.workout.history,
        weekSplit:  state.workout.weekSplit,
        todayIndex: state.workout.todayIndex,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch(e) { /* silent */ }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (s.onboarding)              state.onboarding   = { ...state.onboarding, ...s.onboarding };
    if (s.checkIn)                 state.checkIn      = { ...state.checkIn, ...s.checkIn };
    if (typeof s.readiness === 'number') state.readiness = s.readiness;
    if (s.energyMode)              state.energyMode   = s.energyMode;
    if (typeof s.mvsEnabled === 'boolean') state.mvsEnabled = s.mvsEnabled;
    if (s.sessionNotes)            state.sessionNotes = s.sessionNotes;
    if (s.prs)                     state.prs          = s.prs;
    if (s.nutrition) {
      state.nutrition = { ...state.nutrition, ...s.nutrition };
      state.nutrition.loggedMeals = new Set(s.nutrition.loggedMeals || []);
    }
    if (s.workout?.history)   state.workout.history   = s.workout.history;
    if (s.workout?.weekSplit) state.workout.weekSplit  = s.workout.weekSplit;
    return true;
  } catch(e) { return false; }
}

// ─── Event Delegation ─────────────────────────────────────────────────────
document.addEventListener('click', e => {
  const t = e.target;

  // Auth & Signup flows
  if (t.id === 'goto-signup-btn' || t.closest('#goto-signup-btn')) {
    state.auth.signupStep = 0;
    updateSignupProgress();
    navigateTo('screen-auth-signup');
    playSound('tap');
  }
  if (t.id === 'goto-login-btn' || t.closest('#goto-login-btn')) {
    navigateTo('screen-auth-login');
    playSound('tap');
  }
  if (t.id === 'signup-back-btn' || t.closest('#signup-back-btn')) {
    signupBack();
  }
  if (t.id === 'signup-next-btn' || t.closest('#signup-next-btn')) {
    signupNext();
  }
  if (t.id === 'login-btn' || t.closest('#login-btn')) {
    handleLogin();
  }

  // Signup step 2: Goal Cards selection
  const signupGoalCard = t.closest('[data-signup-goal]');
  if (signupGoalCard) {
    const val = signupGoalCard.dataset.signupGoal;
    if (tempSignupData.goals.includes(val)) {
      tempSignupData.goals = tempSignupData.goals.filter(g => g !== val);
      signupGoalCard.classList.remove('selected');
    } else {
      tempSignupData.goals.push(val);
      signupGoalCard.classList.add('selected');
    }
    playSound('tap');
  }

  // Signup step 3: Ambition Level selection
  const signupAmbitionCard = t.closest('[data-signup-ambition]');
  if (signupAmbitionCard) {
    document.querySelectorAll('[data-signup-ambition]').forEach(c => c.classList.remove('selected'));
    signupAmbitionCard.classList.add('selected');
    tempSignupData.ambition = signupAmbitionCard.dataset.signupAmbition;
    playSound('tap');
  }

  // Signup step 3: Training Style selection
  const signupTrainingCard = t.closest('[data-signup-training]');
  if (signupTrainingCard) {
    document.querySelectorAll('[data-signup-training]').forEach(c => c.classList.remove('selected'));
    signupTrainingCard.classList.add('selected');
    tempSignupData.training = signupTrainingCard.dataset.signupTraining;
    playSound('tap');
  }

  // Signup step 4: Schedule selection
  const signupScheduleCard = t.closest('[data-signup-schedule]');
  if (signupScheduleCard) {
    document.querySelectorAll('[data-signup-schedule]').forEach(c => c.classList.remove('selected'));
    signupScheduleCard.classList.add('selected');
    tempSignupData.schedule = signupScheduleCard.dataset.signupSchedule;
    playSound('tap');
  }

  // Signup step 5: Life Goals selection (multi-select pills)
  const lifeGoalPill = t.closest('[data-life-goal]');
  if (lifeGoalPill) {
    const val = lifeGoalPill.dataset.lifeGoal;
    if (tempSignupData.lifeGoals.includes(val)) {
      tempSignupData.lifeGoals = tempSignupData.lifeGoals.filter(g => g !== val);
      lifeGoalPill.classList.remove('selected');
    } else {
      tempSignupData.lifeGoals.push(val);
      lifeGoalPill.classList.add('selected');
    }
    playSound('tap');
  }

  // Signup step 5: Personality/Energy selection
  const signupPersonalityCard = t.closest('[data-signup-personality]');
  if (signupPersonalityCard) {
    document.querySelectorAll('[data-signup-personality]').forEach(c => c.classList.remove('selected'));
    signupPersonalityCard.classList.add('selected');
    tempSignupData.personality = signupPersonalityCard.dataset.signupPersonality;
    playSound('tap');
  }

  // Onboarding next/back
  if (t.id === 'ob-next-btn') obNext();
  if (t.id === 'ob-back-btn') obBack();

  // Goal cards
  const goalCard = t.closest('.goal-card');
  if (goalCard) {
    const val = goalCard.dataset.goal;
    if (state.onboarding.goals.includes(val)) {
      state.onboarding.goals = state.onboarding.goals.filter(g => g !== val);
      goalCard.classList.remove('selected');
    } else {
      state.onboarding.goals.push(val);
      goalCard.classList.add('selected');
    }
    playSound('tap');
  }

  // Environment cards (single select)
  const envCard = t.closest('.env-card');
  if (envCard) {
    document.querySelectorAll('.env-card').forEach(c => c.classList.remove('selected'));
    envCard.classList.add('selected');
    state.onboarding.gymEnv = envCard.dataset.env;
    playSound('tap');
  }

  // Diet cards (single select)
  const dietCard = t.closest('.diet-card');
  if (dietCard) {
    document.querySelectorAll('.diet-card').forEach(c => c.classList.remove('selected'));
    dietCard.classList.add('selected');
    state.onboarding.diet = dietCard.dataset.diet;
    playSound('tap');
  }

  // Budget buttons in onboarding
  const budgetBtn = t.closest('.budget-btn');
  if (budgetBtn) {
    document.querySelectorAll('.budget-btn').forEach(b => b.classList.remove('selected'));
    budgetBtn.classList.add('selected');
    state.onboarding.budget = budgetBtn.dataset.budget;
    playSound('tap');
  }

  // Lifestyle cards in onboarding
  const lifestyleCard = t.closest('.lifestyle-card');
  if (lifestyleCard) {
    document.querySelectorAll('.lifestyle-card').forEach(c => c.classList.remove('selected'));
    lifestyleCard.classList.add('selected');
    state.onboarding.lifestyle = lifestyleCard.dataset.lifestyle;
    playSound('tap');
  }

  // Experience level cards in onboarding (single select)
  const experienceCard = t.closest('.experience-card');
  if (experienceCard) {
    document.querySelectorAll('.experience-card').forEach(c => c.classList.remove('selected'));
    experienceCard.classList.add('selected');
    state.onboarding.experience = experienceCard.dataset.experience;
    recalculateSmartProtein();
    buildWorkoutSplit();
    saveToStorage();
    playSound('tap');
  }

  // Equipment cards in onboarding (multi select)
  const equipmentCard = t.closest('.equipment-card');
  if (equipmentCard) {
    const equip = equipmentCard.dataset.equipment;
    if (!state.onboarding.equipment) state.onboarding.equipment = [];
    
    if (state.onboarding.equipment.includes(equip)) {
      state.onboarding.equipment = state.onboarding.equipment.filter(e => e !== equip);
      equipmentCard.classList.remove('selected');
    } else {
      state.onboarding.equipment.push(equip);
      equipmentCard.classList.add('selected');
    }
    buildWorkoutSplit();
    saveToStorage();
    playSound('tap');
  }

  // Custom Logger muscle group selection cards
  const muscleCard = t.closest('.muscle-logger-card');
  if (muscleCard) {
    selectCustomMuscleGroup(muscleCard);
  }

  // Identity cards (single select)
  const idCard = t.closest('.identity-card');
  if (idCard) {
    document.querySelectorAll('.identity-card').forEach(c => c.classList.remove('selected'));
    idCard.classList.add('selected');
    state.onboarding.identity = idCard.dataset.identity;
    playSound('tap');
  }

  // Vision check items
  const checkItem = t.closest('.check-item');
  if (checkItem) {
    const idx = +checkItem.dataset.check;
    state.vision.checks[idx] = !state.vision.checks[idx];
    checkItem.classList.toggle('done', state.vision.checks[idx]);
    playSound('tap');
  }

  // Start check-in
  if (t.id === 'start-checkin-btn') { navigateTo('screen-checkin'); }

  // Check-in emoji answers
  const ciEmojiBtn = t.closest('.ci-emoji-btn');
  if (ciEmojiBtn) {
    const metric = ciEmojiBtn.dataset.metric;
    const value = +ciEmojiBtn.dataset.value;
    answerCheckIn(metric, value);
  }

  // Click on a check-in card to navigate
  const checkInCard = t.closest('.ci-wheel-card');
  if (checkInCard && !checkInCard.classList.contains('active') && !ciAnimating) {
    const cardIdx = +checkInCard.dataset.index;
    const currentMetric = CI_QUESTIONS[state.checkIn.step].metric;
    const isAnswered = state.checkIn.answers[currentMetric] !== null;
    if (cardIdx < state.checkIn.step || (cardIdx === state.checkIn.step + 1 && isAnswered)) {
      state.checkIn.step = cardIdx;
      syncCiDots();
      renderWheelState(true);
      playSound('tap');
      ciAnimating = true;
      setTimeout(() => { ciAnimating = false; }, 550);
    }
  }

  // Bottom nav tabs
  const navBtn = t.closest('.nav-btn');
  if (navBtn) {
    handleTabClick(navBtn.id);
  }

  // Vision avatar / View profile → open profile page overlay
  if (t.id === 'vision-avatar-btn' || t.closest('#vision-avatar-btn') || t.id === 'view-profile-btn' || t.closest('#view-profile-btn')) {
    openProfile();
  }
  if (t.id === 'profile-close-btn' || t.closest('#profile-close-btn')) {
    closeProfile();
  }

  // ── Squad / Accountability Matching Clicks ──
  // Match Preferences Modal Opening
  if (t.id === 'find-partner-btn' || t.closest('#find-partner-btn')) {
    playSound('tap');
    const backdrop = el('match-filter-backdrop');
    if (backdrop) {
      backdrop.classList.remove('hidden');
    }
  }

  // Match Preferences Modal Closing
  if (t.id === 'match-filter-close' || t.closest('#match-filter-close') || t.id === 'match-filter-backdrop') {
    playSound('tap');
    const backdrop = el('match-filter-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
  }

  // Match Preference Pill Selection
  const filterPill = t.closest('.match-filter-pill');
  if (filterPill) {
    playSound('tap');
    const siblingPills = filterPill.parentElement.querySelectorAll('.match-filter-pill');
    siblingPills.forEach(p => p.classList.remove('selected'));
    filterPill.classList.add('selected');
    
    const dataset = filterPill.dataset;
    if (dataset.filterGender) state.auth.matchingPreferences.gender = dataset.filterGender;
    else if (dataset.filterAge) state.auth.matchingPreferences.age = dataset.filterAge;
    else if (dataset.filterAmbition) state.auth.matchingPreferences.ambition = dataset.filterAmbition;
    else if (dataset.filterGoal) state.auth.matchingPreferences.goal = dataset.filterGoal;
    else if (dataset.filterLocation) state.auth.matchingPreferences.location = dataset.filterLocation;
    else if (dataset.filterTraining) state.auth.matchingPreferences.training = dataset.filterTraining;
  }

  // Submit Match preferences modal to trigger search
  if (t.id === 'start-matching-btn' || t.closest('#start-matching-btn')) {
    startMatchingSearch();
  }

  // Cancel match search in waiting state
  if (t.id === 'cancel-match-btn' || t.closest('#cancel-match-btn')) {
    playSound('tap');
    if (state.auth.matchTimer) {
      clearTimeout(state.auth.matchTimer);
      state.auth.matchTimer = null;
    }
    state.auth.matchPending = false;
    el('match-pending-card')?.classList.add('hidden');
    el('find-partner-card')?.classList.remove('hidden');
    saveToStorage();
  }

  // Send request to candidate card
  if (t.id === 'send-match-request-btn' || t.closest('#send-match-request-btn')) {
    const candidateId = t.dataset.candidateId || el('send-match-request-btn').dataset.candidateId;
    sendAccountabilityRequest(candidateId);
  }

  // Decline match candidate
  if (t.id === 'decline-match-candidate-btn' || t.closest('#decline-match-candidate-btn')) {
    declineMatchCandidate();
  }

  // Accept incoming request
  if (t.id === 'accept-request-btn' || t.closest('#accept-request-btn')) {
    acceptIncomingRequest();
  }

  // Decline incoming request
  if (t.id === 'decline-request-btn' || t.closest('#decline-request-btn')) {
    declineIncomingRequest();
  }

  // End partnership
  if (t.id === 'end-partnership-btn' || t.closest('#end-partnership-btn')) {
    endPartnership();
  }

  // Request confirmation OK
  if (t.id === 'match-confirm-ok-btn' || t.closest('#match-confirm-ok-btn')) {
    playSound('tap');
    const backdrop = el('match-confirm-backdrop');
    if (backdrop) {
      backdrop.classList.remove('visible');
      setTimeout(() => backdrop.classList.add('hidden'), 300);
    }
  }

  // Toggle notifications panel
  if (t.id === 'notif-bell-btn' || t.closest('#notif-bell-btn')) {
    playSound('tap');
    const panel = el('notif-panel');
    const backdrop = el('notif-backdrop');
    if (panel) {
      panel.classList.remove('hidden');
      // Mark all read on open
      (state.notifications || []).forEach(n => n.read = true);
      renderNotifications();
      updateNotifBadge();
    }
    if (backdrop) backdrop.classList.remove('hidden');
  }

  // Close notifications panel
  if (t.id === 'notif-panel-close' || t.closest('#notif-panel-close') || t.id === 'notif-backdrop') {
    playSound('tap');
    const panel = el('notif-panel');
    const backdrop = el('notif-backdrop');
    if (panel) panel.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');
  }

  // Today's workout card → train
  const twCard = t.closest('.today-workout-card');
  if (twCard) {
    navigateTo('screen-workout');
    playSound('tap');
    if (!state.sessionStarted) {
      state.sessionStartTime = Date.now();
      setTimeout(() => showEnergyModeSelector(), 380);
    }
  }

  // MVS toggle
  if (t.id === 'mvs-toggle') {
    state.mvsEnabled = t.checked;
    updateWorkoutCard();
    renderWorkoutGrid();
    playSound('tap');
  }

  // Calendar view toggle buttons
  const calBtn = t.closest('.cal-btn');
  if (calBtn && calBtn.dataset.view) { switchCalView(calBtn.dataset.view); playSound('tap'); }

  // Sheet close
  if (t.id === 'sheet-close') closeSheet();
  const backdrop = t.closest('.sheet-backdrop');
  if (backdrop) closeSheet();

  // Set check buttons
  const setCheck = t.closest('[data-set-check]');
  if (setCheck) {
    const idx = +setCheck.dataset.setCheck;
    const ex = state.workout.exercises.find(e => e.id === state.activeSheet.exId);
    if (ex && ex.sets[idx]) {
      ex.sets[idx].done = !ex.sets[idx].done;
      setCheck.classList.toggle('done');
      setCheck.closest('.set-row').classList.toggle('logged', ex.sets[idx].done);
      if (ex.sets[idx].done) {
        playSound('chime');
        startRestTimer(60);
        checkWorkoutCompletion();
        updateVolumeProgressBar();
        // PR detection
        const isPR = checkForPR(ex, idx);
        if (isPR) { flashPRBadge(ex.id); saveToStorage(); }
      } else {
        playSound('tap');
        updateVolumeProgressBar();
      }
    }
  }

  // Energy Mode options
  const emOpt = t.closest('.em-option');
  if (emOpt && emOpt.dataset.mode) {
    setEnergyMode(emOpt.dataset.mode);
    playSound('tap');
  }

  // Energy mode confirm
  if (t.id === 'em-confirm-btn') confirmEnergyMode();

  // Energy modal backdrop dismiss
  if (t.id === 'energy-modal-backdrop') hideEnergyModeSelector();

  // Celebration close
  if (t.id === 'cel-close-btn') { hideCelebration(); playSound('tap'); }
  if (t.id === 'cel-note-btn')  {
    hideCelebration();
    // Re-open last sheet for reflection
    setTimeout(() => {
      const firstEx = state.workout.exercises[0];
      if (firstEx) openSheet(firstEx.id);
    }, 400);
  }

  // Engine Insights accordion
  if (t.id === 'insights-toggle' || t.closest('#insights-toggle')) {
    toggleEngineInsights();
  }

  // Today's Why dot navigation
  const whyDot = t.closest('.why-dot-ind');
  if (whyDot) {
    const idx = +whyDot.dataset.why;
    const identity = state.onboarding.identity || 'scholar';
    const whys = TODAYS_WHY[identity] || TODAYS_WHY.scholar;
    state.whyIndex = idx;
    animateWhyText(whys[idx % whys.length]);
    updateWhyDots(whys.length, idx % whys.length);
    playSound('tap');
  }

  // Add set button
  if (t.id === 'add-set-btn') {
    const ex = state.workout.exercises.find(e => e.id === state.activeSheet.exId);
    if (ex) {
      const last = ex.sets[ex.sets.length - 1] || { weight: ex.weight, reps: ex.reps, rpe: '' };
      ex.sets.push({ weight: last.weight, reps: last.reps, rpe: '', done: false });
      renderSetsRows(ex);
      playSound('tap');
    }
  }

  // Rest timer action
  if (t.id === 'rest-action-btn') {
    if (state.restTimer.running) {
      stopRestTimer();
      el('rest-action-btn').textContent = 'Start';
      el('rest-action-btn').classList.remove('running');
      state.restTimer.remaining = 60;
      state.restTimer.duration = 60;
      updateRestTimerUI();
    } else {
      startRestTimer(60);
    }
    playSound('tap');
  }

  // Hydration tracker quick-add buttons
  if (t.id === 'water-add-250') {
    state.nutrition.loggedWater = (state.nutrition.loggedWater || 0) + 250;
    playSound('chime');
    syncMacroUI();
    saveToStorage();
    showSaveSuccessFeedback('+250ml 💧');
  }
  if (t.id === 'water-add-500') {
    state.nutrition.loggedWater = (state.nutrition.loggedWater || 0) + 500;
    playSound('chime');
    syncMacroUI();
    saveToStorage();
    showSaveSuccessFeedback('+500ml 💧');
  }
  if (t.id === 'water-reset-btn') {
    state.nutrition.loggedWater = 0;
    const wc = el('water-progress-fill')?.closest('.hydration-card');
    if (wc) { wc.dataset.glowSet = ''; wc.classList.remove('water-complete'); }
    playSound('tap');
    syncMacroUI();
    saveToStorage();
  }

  // Diet pill buttons
  const dietPill = t.closest('.diet-pill-btn');
  if (dietPill && dietPill.dataset.diet) {
    playSound('tap');
    state.onboarding.diet = dietPill.dataset.diet;
    syncDietFilterPills();
    recalculateSmartProtein();
    renderMeals();
    syncMacroUI();
    saveToStorage();
  }

  // Budget pill buttons
  const budgetPill = t.closest('.budget-pill-btn');
  if (budgetPill && budgetPill.dataset.budget) {
    playSound('tap');
    state.onboarding.budget = budgetPill.dataset.budget;
    syncDietFilterPills();
    renderMeals();
    saveToStorage();
  }

  // Lifestyle pill buttons
  const lifestylePill = t.closest('.lifestyle-pill-btn');
  if (lifestylePill && lifestylePill.dataset.lifestyle) {
    playSound('tap');
    state.onboarding.lifestyle = lifestylePill.dataset.lifestyle;
    syncDietFilterPills();
    renderMeals();
    saveToStorage();
  }

  // Exercise complete CTA — mark all sets done
  if (t.id === 'exercise-complete-btn' || t.closest('#exercise-complete-btn')) {
    const ex = state.workout.exercises.find(e => e.id === state.activeSheet.exId);
    if (ex) {
      const allAlreadyDone = ex.sets.length > 0 && ex.sets.every(s => s.done);
      if (!allAlreadyDone) {
        ex.sets.forEach(s => { s.done = true; });
        playSound('done');
        renderSetsRows(ex);
        updateVolumeProgressBar();
        checkWorkoutCompletion();
        saveToStorage();
        // Smoothly close sheet after a short delay
        setTimeout(() => {
          if (state.activeSheet.exId === ex.id) {
            closeSheet();
            showSaveSuccessFeedback("Exercise Complete! ⚡");
          }
        }, 500);
      } else {
        // If already all done, close sheet and go to dashboard
        closeSheet();
        playSound('tap');
      }
    }
  }

  // Share progress button
  if (t.id === 'cel-share-btn' || t.closest('#cel-share-btn')) {
    playSound('chime');
    updateCelebrationStats();
    const vol  = el('cel-volume')?.textContent  || '—';
    const str  = el('cel-streak')?.textContent  || '—';
    const dur  = el('cel-duration')?.textContent || '—';
    const disc = el('cel-discipline')?.textContent || '—';
    const focus= el('cel-focus-label')?.textContent || 'Workout';
    const text = `✦ AURA Session Complete\n${focus}\nVolume: ${vol}kg  |  Streak: ${str} days  |  Duration: ${dur}min  |  Discipline: ${disc}\n— AURA Adaptive Fitness OS`;
    navigator.clipboard?.writeText(text).then(() => showSaveSuccessFeedback("Progress Copied!")).catch(() => {});
    const btn = el('cel-share-btn');
    if (btn) { btn.textContent = '✓ Copied to Clipboard'; setTimeout(() => { if(btn) btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:6px;"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>Share Progress'; }, 2000); }
  }

  // Custom food log & estimation action
  if (t.id === 'custom-food-log-btn') {
    const nameInput = el('custom-food-name');
    const gramsInput = el('custom-food-grams');
    const timeSelect = el('custom-food-time');
    
    if (nameInput) {
      const foodName = nameInput.value.trim();
      const grams = parseFloat(gramsInput?.value) || 100;
      const time = timeSelect ? timeSelect.value : 'Snack';
      
      if (foodName) {
        playSound('done');
        
        // Smart macronutrient estimator
        const key = foodName.toLowerCase();
        let estCal = 150; // default kcal/100g
        let estProt = 6;  // default prot/100g
        
        if (key.includes('egg') || key.includes('anda')) {
          estCal = 140; estProt = 13;
        } else if (key.includes('chicken') || key.includes('murgh')) {
          estCal = 165; estProt = 31;
        } else if (key.includes('paneer')) {
          estCal = 265; estProt = 18;
        } else if (key.includes('dal') || key.includes('lentil')) {
          estCal = 116; estProt = 9;
        } else if (key.includes('rice') || key.includes('chawal')) {
          estCal = 130; estProt = 2.7;
        } else if (key.includes('roti') || key.includes('chapati')) {
          estCal = 260; estProt = 9;
        } else if (key.includes('milk') || key.includes('doodh')) {
          estCal = 60; estProt = 3.2;
        } else if (key.includes('oats') || key.includes('oatmeal')) {
          estCal = 389; estProt = 16.9;
        } else if (key.includes('whey') || key.includes('protein')) {
          estCal = 400; estProt = 80;
        } else if (key.includes('fish') || key.includes('salmon')) {
          estCal = 180; estProt = 22;
        }
        
        const finalCal = Math.round((grams / 100) * estCal);
        const finalProt = Math.round((grams / 100) * estProt);
        
        state.nutrition.loggedCal = (state.nutrition.loggedCal || 0) + finalCal;
        state.nutrition.loggedProt = (state.nutrition.loggedProt || 0) + finalProt;
        
        // Clear fields
        nameInput.value = '';
        if (gramsInput) gramsInput.value = '';
        
        syncMacroUI();
        saveToStorage();
        showSaveSuccessFeedback('Food Logged ✦');
        
        // Custom popup indicator on Dynamic Island
        const di = el('dynamic-island');
        if (di) {
          di.classList.remove('active', 'save-success');
          void di.offsetWidth; // force reflow
          di.classList.add('save-success');
          di.style.width = '200px';
          di.setAttribute('style', 'width: 200px !important');
          
          // Inject custom text briefly
          const style = document.createElement('style');
          style.innerHTML = `.dynamic-island.save-success::after { content: '✦ Logged ${finalCal} kcal!' !important; }`;
          document.head.appendChild(style);
          
          setTimeout(() => {
            di.classList.remove('save-success');
            style.remove();
          }, 2200);
        }
      }
    }
  }

  // Custom logger trigger
  if (t.id === 'custom-logger-trigger-btn' || t.closest('#custom-logger-trigger-btn')) {
    openCustomLogger();
  }

  // Custom logger modal close
  if (t.id === 'custom-logger-close-btn' || t.closest('#custom-logger-close-btn') || t.id === 'custom-logger-backdrop') {
    closeCustomLogger();
  }

  // Custom logger muscle pills
  const cMusclePill = t.closest('.cl-muscle-pill');
  if (cMusclePill) {
    document.querySelectorAll('.cl-muscle-pill').forEach(p => p.classList.remove('active'));
    cMusclePill.classList.add('active');
    playSound('tap');
  }

  // Custom logger submit
  if (t.id === 'custom-logger-submit-btn' || t.closest('#custom-logger-submit-btn')) {
    submitCustomExercise();
  }

  // Settings modal open
  if (t.id === 'settings-open-btn' || t.closest('#settings-open-btn')) {
    openSettingsModal();
  }

  // Settings modal close
  if (t.id === 'settings-close-btn' || t.closest('#settings-close-btn') || t.id === 'settings-modal-backdrop') {
    closeSettingsModal();
  }

  // Settings save
  if (t.id === 'settings-save-btn' || t.closest('#settings-save-btn')) {
    saveSettingsModal();
  }

  // Accountability Inbox panel trigger
  if (t.id === 'socials-inbox-btn' || t.closest('#socials-inbox-btn')) {
    openInbox();
  }

  // Close Inbox Panel
  if (t.id === 'inbox-close-btn' || t.closest('#inbox-close-btn')) {
    closeInbox();
  }

  // Chat back button
  if (t.id === 'chat-back-btn' || t.closest('#chat-back-btn')) {
    closeChat();
  }

  // Chat send button
  if (t.id === 'chat-send-btn' || t.closest('#chat-send-btn')) {
    sendChatMessage();
  }

  // Chat profile inspect button
  if (t.id === 'chat-profile-btn' || t.closest('#chat-profile-btn')) {
    inspectPartnerScorecard();
  }

  // Scorecard modal close
  if (t.id === 'scorecard-close-btn' || t.closest('#scorecard-close-btn') || t.id === 'scorecard-backdrop') {
    closePartnerScorecard();
  }

  // Inbox Accept accountability request
  if (t.id === 'inbox-accept-request-btn' || t.closest('#inbox-accept-request-btn')) {
    acceptIncomingRequest();
    renderInbox();
  }

  // Inbox Decline accountability request
  if (t.id === 'inbox-decline-request-btn' || t.closest('#inbox-decline-request-btn')) {
    declineIncomingRequest();
    renderInbox();
  }

  // Food bottom sheet close clicks
  if (t.id === 'food-sheet-close' || t.closest('#food-sheet-close')) {
    closeFoodSheet();
  }
  const foodBackdrop = t.closest('#food-sheet-backdrop');
  if (foodBackdrop) {
    closeFoodSheet();
  }

  // Meal log buttons
  const mealBtn = t.closest('.meal-log-btn');
  if (mealBtn) {
    toggleMeal(mealBtn.dataset.mealId);
  }

  // Breathing toggle
  if (t.id === 'breathing-btn') toggleBreathing();

  // Ambient toggle
  if (t.id === 'ambient-btn') toggleAmbient();

  // Month nav
  if (t.id === 'month-prev') { state.workout.monthOffset--; renderMonthCalendar(); playSound('tap'); }
  if (t.id === 'month-next') { state.workout.monthOffset++; renderMonthCalendar(); playSound('tap'); }

  // Reset button (trigger modal)
  if (t.id === 'reset-btn') {
    showResetModal();
  }

  // Safe Reset Modal buttons
  if (t.id === 'srm-cancel-btn') {
    hideResetModal();
  }
  if (t.id === 'srm-confirm-btn') {
    confirmReset();
  }
  if (t.id === 'srm-export-btn') {
    exportProgress();
  }

  // Undo delete set button
  if (t.id === 'undo-toast-btn') {
    undoDelete();
  }

  // Workout week strip on home screen
  const wdPill = t.closest('.week-day-pill');
  if (wdPill) {
    // handled inline in renderWeekStripHome
  }

  // Workout energy mode button click
  if (t.id === 'workout-energy-mode-btn' || t.closest('#workout-energy-mode-btn')) {
    showEnergyModeSelector();
    playSound('tap');
  }

  // Overload apply button
  if (t.id === 'oc-apply-btn') { applyOverloadSuggestion(); }

  // Quick note tags
  const noteTag = t.closest('.quick-note-tag');
  if (noteTag) {
    const text = noteTag.dataset.noteText;
    const textarea = el('sheet-notes');
    if (textarea && state.activeSheet.exId) {
      const current = textarea.value.trim();
      const newVal = current ? `${current}. ${text}` : text;
      textarea.value = newVal;
      state.sessionNotes[state.activeSheet.exId] = newVal;
      saveToStorage();
      playSound('tap');
    }
  }
});

// ─── Profile Settings Modal ────────────────────────────────────────────────
function openSettingsModal() {
  playSound('tap');
  const overlay = el('settings-overlay');
  if (!overlay) return;
  
  const ob = state.onboarding;
  
  const goalSel = el('settings-goal');
  const dietSel = el('settings-diet');
  const budgetSel = el('settings-budget');
  const lifestyleSel = el('settings-lifestyle');
  const setupSel = el('settings-setup');
  const expSel = el('settings-experience');
  const accSel = el('settings-accountability');
  const notifChk = el('settings-notif-toggle');
  
  if (goalSel) goalSel.value = ob.goals[0] || 'strength';
  if (dietSel) dietSel.value = ob.diet || 'veg';
  if (budgetSel) budgetSel.value = ob.budget || 'low';
  if (lifestyleSel) lifestyleSel.value = ob.lifestyle || 'hostel';
  if (setupSel) setupSel.value = ob.gymEnv || 'gym';
  if (expSel) expSel.value = ob.experience || 'beginner';
  if (accSel) accSel.value = state.auth.matchingEnabled ? 'partner' : 'friends';
  if (notifChk) notifChk.checked = state.auth.notificationsEnabled !== false;
  
  overlay.classList.remove('hidden');
  void overlay.offsetWidth;
  overlay.classList.add('visible');
}

function closeSettingsModal() {
  playSound('tap');
  const overlay = el('settings-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 380);
  }
}

function saveSettingsModal() {
  playSound('done');
  const ob = state.onboarding;
  
  const goalSel = el('settings-goal');
  const dietSel = el('settings-diet');
  const budgetSel = el('settings-budget');
  const lifestyleSel = el('settings-lifestyle');
  const setupSel = el('settings-setup');
  const expSel = el('settings-experience');
  const accSel = el('settings-accountability');
  const notifChk = el('settings-notif-toggle');
  
  if (goalSel) ob.goals = [goalSel.value];
  if (dietSel) ob.diet = dietSel.value;
  if (budgetSel) ob.budget = budgetSel.value;
  if (lifestyleSel) ob.lifestyle = lifestyleSel.value;
  if (setupSel) ob.gymEnv = setupSel.value;
  if (expSel) ob.experience = expSel.value;
  if (accSel) state.auth.matchingEnabled = accSel.value === 'partner';
  if (notifChk) state.auth.notificationsEnabled = notifChk.checked;
  
  // Re-generate splits, macros, and diet recommendations dynamically
  recalculateSmartProtein();
  buildWorkoutSplit();
  syncDietFilterPills();
  syncDietFilterDropdowns();
  renderMeals();
  syncMacroUI();
  saveToStorage();
  
  closeSettingsModal();
  showSaveSuccessFeedback('Saved');
}

// ─── Custom Exercise Logger ────────────────────────────────────────────────
const FAMOUS_EXERCISES = {
  Chest: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Pec Deck Flyes', 'Standard Push-ups'],
  Back: ['Lat Pulldowns', 'One-Arm Dumbbell Row', 'Pull-ups', 'Barbell Row'],
  Biceps: ['Dumbbell Bicep Curl', 'Hammer Curls', 'Incline Dumbbell Curl', 'Preacher Curls'],
  Triceps: ['Tricep Pushdowns', 'Overhead Dumbbell Extension', 'Diamond Push-ups', 'Chair Dips'],
  Shoulders: ['Dumbbell Shoulder Press', 'Lateral Raises', 'Front Raises', 'Overhead Press'],
  Legs: ['Goblet Squat', 'Walking Lunges', 'Romanian Deadlift', 'Leg Press'],
  Arms: ['Hammer Curls', 'Tricep Pushdowns', 'Barbell Curl', 'Close-Grip Bench Press'],
  Cardio: ['Interval Sprint Pacing', 'Kettlebell Swings', 'Mountain Climbers', 'Jumping Jacks']
};

function openCustomLogger() {
  playSound('tap');
  const overlay = el('custom-logger-overlay');
  if (!overlay) return;
  
  // Reset form
  el('custom-logger-inputs-section')?.classList.add('hidden');
  document.querySelectorAll('.muscle-logger-card').forEach(p => p.classList.remove('selected'));
  
  overlay.classList.remove('hidden');
  void overlay.offsetWidth;
  overlay.classList.add('visible');
}

function closeCustomLogger() {
  playSound('tap');
  const overlay = el('custom-logger-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 320);
  }
}

function selectCustomMuscleGroup(cardEl) {
  playSound('tap');
  document.querySelectorAll('.muscle-logger-card').forEach(p => p.classList.remove('selected'));
  cardEl.classList.add('selected');
  
  const muscle = cardEl.dataset.muscle;
  const select = el('custom-logger-ex-select');
  if (!select) return;
  
  select.innerHTML = '';
  const list = FAMOUS_EXERCISES[muscle] || [];
  list.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex;
    opt.textContent = ex;
    select.appendChild(opt);
  });
  
  // Show inputs section
  const section = el('custom-logger-inputs-section');
  if (section) {
    section.classList.remove('hidden');
  }
}

function submitCustomExercise() {
  const muscleCard = document.querySelector('.muscle-logger-card.selected');
  const muscle = muscleCard ? muscleCard.dataset.muscle : 'General';
  const name = el('custom-logger-ex-select')?.value || 'Custom Lift';
  
  const weight = +(el('custom-logger-weight')?.value || 20);
  const reps = +(el('custom-logger-reps')?.value || 10);
  const sets = +(el('custom-logger-sets')?.value || 3);
  const duration = +(el('custom-logger-duration')?.value || 10);
  
  playSound('done');
  
  // Construct exercise and push
  const newEx = {
    id: 'custom_' + Date.now(),
    name: name,
    muscle: muscle,
    icon: '⚡',
    weight: weight,
    reps: reps,
    sets: Array.from({ length: sets }, () => ({ weight: weight, reps: reps, rpe: 8, done: true })),
  };
  
  if (!state.workout.exercises) state.workout.exercises = [];
  state.workout.exercises.push(newEx);
  
  // Log to calories and protein estimation
  const kcal = Math.round(sets * reps * (weight || 10) * 0.05 + 40);
  state.nutrition.loggedCal = (state.nutrition.loggedCal || 0) + kcal;
  
  renderWorkoutGrid();
  updateVolumeProgressBar();
  syncMacroUI();
  updateCelebrationStats();
  
  if (state.workout.history[todayKey()]) {
    logTodaySession();
  }
  
  saveToStorage();
  
  closeCustomLogger();
  showSaveSuccessFeedback("Exercise Added!");
}

// ─── Session Controls Sync ─────────────────────────────────────────────────
document.addEventListener('input', e => {
  const t = e.target;
  if (!state.activeSheet.exId) return;
  const ex = state.workout.exercises.find(e2 => e2.id === state.activeSheet.exId);
  if (!ex) return;

  if (t.id === 'sc-weight-slider') {
    el('sc-weight-num').value = t.value;
    ex.weight = +t.value;
    syncSetWeightDisplay(ex);
    saveToStorage();
  }
  if (t.id === 'sc-weight-num') {
    el('sc-weight-slider').value = t.value;
    ex.weight = +t.value;
    syncSetWeightDisplay(ex);
    saveToStorage();
  }
  if (t.id === 'sc-reps-slider') {
    el('sc-reps-num').value = t.value;
    ex.reps = +t.value;
    // Sync all un-completed set rows reps
    document.querySelectorAll('.set-input[data-field="reps"]').forEach((inp, i) => {
      if (ex.sets[i] && !ex.sets[i].done && !ex.sets[i].repsEdited) {
        inp.value = ex.reps;
        ex.sets[i].reps = ex.reps;
      }
    });
    saveToStorage();
  }
  if (t.id === 'sc-reps-num') {
    el('sc-reps-slider').value = t.value;
    ex.reps = +t.value;
    // Sync all un-completed set rows reps
    document.querySelectorAll('.set-input[data-field="reps"]').forEach((inp, i) => {
      if (ex.sets[i] && !ex.sets[i].done && !ex.sets[i].repsEdited) {
        inp.value = ex.reps;
        ex.sets[i].reps = ex.reps;
      }
    });
    saveToStorage();
  }
  if (t.id === 'sc-diff-slider') {
    el('sc-diff-num').value = t.value;
    // Sync all un-completed set rows difficulty
    document.querySelectorAll('.set-input[data-field="rpe"]').forEach((inp, i) => {
      if (ex.sets[i] && !ex.sets[i].done && !ex.sets[i].rpeEdited) {
        inp.value = t.value;
        ex.sets[i].rpe = +t.value;
      }
    });
    saveToStorage();
  }
  if (t.id === 'sc-diff-num') {
    el('sc-diff-slider').value = t.value;
    // Sync all un-completed set rows difficulty
    document.querySelectorAll('.set-input[data-field="rpe"]').forEach((inp, i) => {
      if (ex.sets[i] && !ex.sets[i].done && !ex.sets[i].rpeEdited) {
        inp.value = t.value;
        ex.sets[i].rpe = +t.value;
      }
    });
    saveToStorage();
  }
});

// Notes autosave on blur
document.addEventListener('blur', e => {
  if (e.target.id === 'sheet-notes' && state.activeSheet.exId) {
    state.sessionNotes[state.activeSheet.exId] = e.target.value.trim();
    saveToStorage();
  }
}, true);

function syncSetWeightDisplay(ex) {
  // Update all un-done set weight inputs
  document.querySelectorAll('.set-input[data-field="weight"]').forEach((inp, i) => {
    if (ex.sets[i] && !ex.sets[i].done && !ex.sets[i].weightEdited) {
      inp.value = ex.weight;
      ex.sets[i].weight = ex.weight;
    }
  });
}

// ─── Drag Gestures ─────────────────────────────────────────────────────────
function initBottomSheetDrag() {
  const sheet = el('bottom-sheet');
  const handle = sheet?.querySelector('.sheet-handle');
  if (!sheet || !handle) return;
  
  let startY = 0;
  let lastY = 0;
  let lastTime = 0;
  let dragVelocity = 0;
  let isDragging = false;
  
  handle.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    lastY = startY;
    lastTime = Date.now();
    isDragging = true;
    sheet.style.transition = 'none';
  }, { passive: true });
  
  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const diffY = currentY - startY;
    
    const timeDelta = currentTime - lastTime;
    if (timeDelta > 0) {
      dragVelocity = (currentY - lastY) / timeDelta;
    }
    
    lastY = currentY;
    lastTime = currentTime;
    
    if (diffY > 0) {
      const visualY = diffY > 400 ? 400 + (diffY - 400) * 0.4 : diffY;
      sheet.style.transform = `translateY(${visualY}px)`;
    }
  }, { passive: true });
  
  document.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    sheet.style.transition = 'transform 380ms cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    const currentY = e.changedTouches[0].clientY;
    const diffY = currentY - startY;
    if (diffY > 140 || dragVelocity > 0.6) {
      closeSheet();
    } else {
      sheet.style.transform = '';
    }
    dragVelocity = 0;
  });
  
  handle.addEventListener('mousedown', e => {
    startY = e.clientY;
    lastY = startY;
    lastTime = Date.now();
    isDragging = true;
    sheet.style.transition = 'none';
  });
  
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const currentTime = Date.now();
    const diffY = e.clientY - startY;
    
    const timeDelta = currentTime - lastTime;
    if (timeDelta > 0) {
      dragVelocity = (e.clientY - lastY) / timeDelta;
    }
    
    lastY = e.clientY;
    lastTime = currentTime;
    
    if (diffY > 0) {
      const visualY = diffY > 400 ? 400 + (diffY - 400) * 0.4 : diffY;
      sheet.style.transform = `translateY(${visualY}px)`;
    }
  });
  
  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    sheet.style.transition = 'transform 380ms cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    const diffY = e.clientY - startY;
    if (diffY > 140 || dragVelocity > 0.6) {
      closeSheet();
    } else {
      sheet.style.transform = '';
    }
    dragVelocity = 0;
  });
}

function initCheckInWheel() {
  const viewport = el('ci-wheel-viewport');
  if (!viewport) return;

  // Mouse wheel scroll up/down
  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    if (ciAnimating) return;
    if (e.deltaY > 0) {
      // Scroll down -> next step (only if current step is already answered)
      const currentMetric = CI_QUESTIONS[state.checkIn.step].metric;
      if (state.checkIn.answers[currentMetric] !== null && state.checkIn.step < CI_QUESTIONS.length - 1) {
        state.checkIn.step++;
        syncCiDots();
        renderWheelState(true);
        playSound('tap');
        ciAnimating = true;
        setTimeout(() => { ciAnimating = false; }, 550);
      }
    } else if (e.deltaY < 0) {
      // Scroll up -> previous step
      if (state.checkIn.step > 0) {
        state.checkIn.step--;
        syncCiDots();
        renderWheelState(true);
        playSound('tap');
        ciAnimating = true;
        setTimeout(() => { ciAnimating = false; }, 550);
      }
    }
  }, { passive: false });

  // Touch swipe up/down
  let touchStartY = 0;
  viewport.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchmove', e => {
    if (ciAnimating) return;
    const touchEndY = e.touches[0].clientY;
    const diffY = touchStartY - touchEndY;
    if (Math.abs(diffY) > 40) {
      if (diffY > 0) {
        // Swipe up -> scroll down -> next step
        const currentMetric = CI_QUESTIONS[state.checkIn.step].metric;
        if (state.checkIn.answers[currentMetric] !== null && state.checkIn.step < CI_QUESTIONS.length - 1) {
          state.checkIn.step++;
          syncCiDots();
          renderWheelState(true);
          playSound('tap');
          touchStartY = touchEndY;
          ciAnimating = true;
          setTimeout(() => { ciAnimating = false; }, 550);
        }
      } else {
        // Swipe down -> scroll up -> prev step
        if (state.checkIn.step > 0) {
          state.checkIn.step--;
          syncCiDots();
          renderWheelState(true);
          playSound('tap');
          touchStartY = touchEndY;
          ciAnimating = true;
          setTimeout(() => { ciAnimating = false; }, 550);
        }
      }
    }
  }, { passive: true });
}

// ─── NEW EXPERIENCE REFINEMENT SYSTEMS ──────────────────────────────────────
let lastDeletedSet = null;
let lastDeletedSetExId = null;
let lastDeletedSetIndex = null;
let undoToastTimeout = null;

function deleteSet(exId, setIndex, rowEl) {
  const ex = state.workout.exercises.find(e => e.id === exId);
  if (!ex || !ex.sets[setIndex]) return;

  playSound('tap');
  
  // Backup for Undo
  lastDeletedSet = { ...ex.sets[setIndex] };
  lastDeletedSetExId = exId;
  lastDeletedSetIndex = setIndex;
  
  // Collapsing transition in CSS
  rowEl.classList.add('collapsing');
  
  setTimeout(() => {
    ex.sets.splice(setIndex, 1);
    
    // Rerender sheet rows
    renderSetsRows(ex);
    updateVolumeProgressBar();
    saveToStorage();
    
    // Show Undo Toast
    showUndoToast();
  }, 280);
}

function showUndoToast() {
  const toast = el('undo-toast');
  if (!toast) return;
  
  toast.classList.remove('visible');
  void toast.offsetWidth; // reflow
  toast.classList.add('visible');
  
  if (undoToastTimeout) clearTimeout(undoToastTimeout);
  undoToastTimeout = setTimeout(() => {
    hideUndoToast();
  }, 6000); // 6s duration
}

function hideUndoToast() {
  const toast = el('undo-toast');
  if (toast) toast.classList.remove('visible');
  lastDeletedSet = null;
  lastDeletedSetExId = null;
  lastDeletedSetIndex = null;
}

function undoDelete() {
  if (!lastDeletedSet || !lastDeletedSetExId) return;
  
  const ex = state.workout.exercises.find(e => e.id === lastDeletedSetExId);
  if (ex) {
    playSound('chime');
    
    // Insert back
    ex.sets.splice(lastDeletedSetIndex, 0, lastDeletedSet);
    
    renderSetsRows(ex);
    updateVolumeProgressBar();
    saveToStorage();
  }
  hideUndoToast();
}

// Safe Reset dialog triggers
function showResetModal() {
  playSound('tap');
  const modal = el('safe-reset-backdrop');
  if (modal) {
    modal.classList.remove('hidden');
    void modal.offsetWidth; // reflow
    modal.classList.add('visible');
  }
}

function hideResetModal() {
  playSound('tap');
  const modal = el('safe-reset-backdrop');
  if (modal) {
    modal.classList.remove('visible');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

function confirmReset() {
  playSound('done');
  
  // Clear persistent
  localStorage.removeItem(STORAGE_KEY);
  
  state.onboarding.step = 0;
  state.onboarding.goals = [];
  state.onboarding.equipment = [];
  state.vision.checks = [false, false, false];
  state.checkIn = { step: 0, answers: { soreness:null,stress:null,sleep:null,energy:null,motivation:null }, done: false };
  state.readiness = 0;
  state.mvsEnabled = false;
  state.nutrition.loggedMeals = new Set();
  state.nutrition.loggedCal = 0;
  state.nutrition.loggedProt = 0;
  state.nutrition.loggedWater = 0;
  state.sessionStarted = false;
  state.celebrationShown = false;
  
  document.querySelectorAll('.ob-step').forEach((s,i) => { s.classList.remove('active','exit-left'); if(i===0) s.classList.add('active'); });
  updateObProgress();
  hideResetModal();
  navigateTo('screen-onboarding');
}

function exportProgress() {
  playSound('chime');
  try {
    const dataStr = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      alert("AURA Setup exported! Progression data copied to clipboard.");
    });
  } catch (err) {
    alert("Export failed: " + err);
  }
}

// Load Simulation Shimmer
function handleTabClick(id) {
  playSound('tap');
  let targetScreen = '';
  if (id === 'nav-home') targetScreen = state.checkIn.done ? 'screen-dashboard' : 'screen-vision';
  else if (id === 'nav-train') targetScreen = 'screen-workout';
  else if (id === 'nav-diet') targetScreen = 'screen-diet';
  else if (id === 'nav-recovery') targetScreen = 'screen-recovery';
  else if (id === 'nav-squad') targetScreen = 'screen-squad';
  
  if (targetScreen) {
    triggerScreenShimmer(targetScreen);
  }
  
  if (id === 'nav-home') {
    if (state.checkIn.done) {
      navigateTo('screen-dashboard');
    } else {
      navigateTo('screen-vision');
    }
  } else if (id === 'nav-train') {
    navigateTo('screen-workout');
    if (!state.sessionStarted) {
      setTimeout(() => showEnergyModeSelector(), 380);
    }
  } else if (id === 'nav-diet') {
    navigateTo('screen-diet');
  } else if (id === 'nav-recovery') {
    navigateTo('screen-recovery');
  } else if (id === 'nav-squad') {
    navigateTo('screen-squad');
  }
}

function triggerScreenShimmer(screenId) {
  const scr = el(screenId);
  if (!scr) return;
  const scrollArea = scr.querySelector('.screen-scroll, .screen-scroll-nopad');
  if (!scrollArea) return;
  
  scrollArea.classList.add('shimmer-active');
  const cards = scrollArea.querySelectorAll('.ex-card, .macro-card, .advice-card, .squad-member, .chart-card, .breathing-card, .ambient-card');
  cards.forEach(c => c.classList.add('shimmer-card'));
  
  setTimeout(() => {
    scrollArea.classList.remove('shimmer-active');
    cards.forEach(c => c.classList.remove('shimmer-card'));
  }, 220); // 220ms loading simmer delay
}

// Long-press exercise cards for quick Progressive Overload
function triggerQuickOverload(exId, cardEl) {
  const ex = state.workout.exercises.find(e => e.id === exId);
  if (!ex) return;
  
  playSound('done');
  
  const delta = ex.weight >= 80 ? 5 : 2.5;
  ex.weight = (ex.weight || 0) + delta;
  
  ex.sets.forEach(s => {
    if (!s.done) s.weight = ex.weight;
  });
  
  saveToStorage();
  
  // Drifting badge animation
  const badge = document.createElement('div');
  badge.className = 'floating-overload-badge';
  badge.textContent = `+${delta}kg load! 🔥`;
  badge.style.left = `${cardEl.offsetWidth / 2 - 40}px`;
  badge.style.top = `20px`;
  cardEl.appendChild(badge);
  
  cardEl.classList.add('pr-flash');
  
  const metaText = cardEl.querySelector('.ex-card-meta span:last-child');
  if (metaText) metaText.textContent = `${ex.weight}kg`;
  
  setTimeout(() => {
    badge.remove();
    cardEl.classList.remove('pr-flash');
  }, 900);
  
  showSaveSuccessFeedback();
}

let toastTimeout = null;
function showToast(message) {
  let toast = el('minimal-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'minimal-toast';
    toast.className = 'minimal-toast';
    const parent = el('phone-frame');
    if (parent) parent.appendChild(toast);
    else document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('visible');
  void toast.offsetWidth;
  toast.classList.add('visible');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 1200); // Snappy premium short duration (1.2 seconds)
}

function showSaveSuccessFeedback(message = "Saved") {
  const di = el('dynamic-island');
  if (di) {
    di.classList.remove('active', 'save-success');
    void di.offsetWidth; // trigger reflow
    di.classList.add('save-success');
    setTimeout(() => {
      di.classList.remove('save-success');
    }, 2200);
  }
  showToast(message);
}

// System Critical Missing Helper Functions
function checkForPR(ex, setIdx) {
  const set = ex.sets[setIdx];
  if (!set || !set.done) return false;
  const weight = +set.weight || 0;
  if (weight <= 0) return false;

  const currentPR = state.prs[ex.id]?.weight || 0;
  if (weight > currentPR) {
    state.prs[ex.id] = {
      weight: weight,
      reps: +set.reps || 0,
      date: todayKey()
    };
    return true;
  }
  return false;
}

function flashPRBadge(exId) {
  playSound('done');
  const card = document.querySelector(`.ex-card[data-ex-id="${exId}"]`);
  if (card) {
    card.classList.add('pr-flash');
    const prBadge = document.createElement('div');
    prBadge.className = 'pr-badge';
    prBadge.textContent = 'PR ⚡';
    if (!card.querySelector('.pr-badge')) {
      card.appendChild(prBadge);
    }
    setTimeout(() => {
      card.classList.remove('pr-flash');
    }, 800);
  }
  showSaveSuccessFeedback();
}

// Render adaptive overlay suggestions
function getOverloadSuggestion(ex) {
  const lastData = getLastSessionData(ex.id, ex.name);
  if (!lastData) return null;
  
  const weightMatch = lastData.match(/(\d+(?:\.\d+)?)\s*kg/i);
  const repsMatch = lastData.match(/(\d+)\s*reps/i);
  
  let lastWeight = weightMatch ? parseFloat(weightMatch[1]) : ex.defaultWeight || 20;
  let lastReps = repsMatch ? parseInt(repsMatch[1], 10) : ex.defaultReps || 10;
  
  const r = state.readiness || 78;
  const exp = state.onboarding.experience || 'beginner';
  
  if (r < 50) {
    return null; 
  }
  
  if (exp === 'beginner') {
    // Slower progression suggestions for beginners
    if (lastWeight > 0) {
      return {
        text: `🌱 Beginner Pace: Try +1.25kg load today`,
        delta: 1.25,
        field: 'weight'
      };
    } else {
      return {
        text: `🌱 Beginner Pace: Try +1 rep today`,
        delta: 1,
        field: 'reps'
      };
    }
  } else if (exp === 'returning') {
    // Balanced reintroduction
    const delta = lastWeight >= 60 ? 2.5 : 1.25;
    return {
      text: `🔄 Balanced Reintroduction: Try +${delta}kg load today`,
      delta: delta,
      field: 'weight'
    };
  } else { // experienced
    // High intensity compound priority overload suggestions
    const delta = lastWeight >= 60 ? 5 : 2.5;
    return {
      text: `🔥 Experienced Overload: Try +${delta}kg load today`,
      delta: delta,
      field: 'weight'
    };
  }
}

function applyOverloadSuggestion() {
  const exId = state.activeSheet.exId;
  const ex = state.workout.exercises.find(e => e.id === exId);
  if (!ex) return;
  
  const suggestion = getOverloadSuggestion(ex);
  if (!suggestion) return;
  
  playSound('chime');
  
  const chip = el('overload-chip');
  if (chip) {
    chip.style.transform = 'scale(0.95)';
    setTimeout(() => { chip.style.transform = ''; chip.style.display = 'none'; }, 200);
  }
  
  if (suggestion.field === 'weight') {
    const lastData = getLastSessionData(exId, ex.name);
    const weightMatch = lastData ? lastData.match(/(\d+(?:\.\d+)?)\s*kg/i) : null;
    const lastWeight = weightMatch ? parseFloat(weightMatch[1]) : ex.weight;
    const newWeight = lastWeight + suggestion.delta;
    
    ex.weight = newWeight;
    el('sc-weight-num').value = newWeight;
    el('sc-weight-slider').value = newWeight;
    
    ex.sets.forEach(set => {
      if (!set.done) set.weight = newWeight;
    });
  } else if (suggestion.field === 'reps') {
    const lastData = getLastSessionData(exId, ex.name);
    const repsMatch = lastData ? lastData.match(/(\d+)\s*reps/i) : null;
    const lastReps = repsMatch ? parseInt(repsMatch[1], 10) : ex.reps;
    const newReps = lastReps + suggestion.delta;
    
    ex.reps = newReps;
    el('sc-reps-num').value = newReps;
    el('sc-reps-slider').value = newReps;
    
    ex.sets.forEach(set => {
      if (!set.done) set.reps = newReps;
    });
  }
  
  renderSetsRows(ex);
  saveToStorage();
}

function updateVolumeProgressBar() {
  const progressFill = el('volume-bar-fill');
  const progressLabel = el('volume-bar-label');
  if (!progressFill || !progressLabel) return;
  
  const exercises = state.workout.exercises;
  if (!exercises || exercises.length === 0) {
    progressFill.style.width = '0%';
    progressLabel.textContent = '0 / 0 sets';
    return;
  }
  
  const activeEx = (state.mvsEnabled || state.energyMode === 'mvs')
    ? exercises.slice(0, 2) : exercises;
    
  let totalSets = 0;
  let completedSets = 0;
  
  activeEx.forEach(ex => {
    const len = ex.sets.length || 3;
    totalSets += len;
    completedSets += ex.sets.filter(s => s.done).length;
  });
  
  const pct = totalSets > 0 ? Math.min(100, (completedSets / totalSets) * 100) : 0;
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${completedSets} / ${totalSets} sets`;
  
  if (pct >= 100) {
    progressFill.classList.add('complete');
    progressLabel.classList.add('complete');
  } else {
    progressFill.classList.remove('complete');
    progressLabel.classList.remove('complete');
  }
}

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  initOnboarding();
  initBottomSheetDrag();
  initCheckInWheel();

  // Restore persisted state
  const restored = loadFromStorage();
  if (restored) {
    recalculateSmartProtein();
    if (state.readiness) {
      applyRecoveryTheme(state.readiness);
      buildWorkoutSplit();
      buildFakeHistory();
    }
    updateObProgress();
  }

  // Bind change event delegation for Diet Filter Dropdowns
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'diet-dropdown-type') {
      state.onboarding.diet = t.value;
      recalculateSmartProtein();
      syncDietFilterPills();
      renderMeals();
      syncMacroUI();
      saveToStorage();
      playSound('tap');
    }
    if (t.id === 'diet-dropdown-budget') {
      state.onboarding.budget = t.value;
      recalculateSmartProtein();
      syncDietFilterPills();
      renderMeals();
      syncMacroUI();
      saveToStorage();
      playSound('tap');
    }
    if (t.id === 'diet-dropdown-lifestyle') {
      state.onboarding.lifestyle = t.value;
      recalculateSmartProtein();
      syncDietFilterPills();
      renderMeals();
      syncMacroUI();
      saveToStorage();
      playSound('tap');
    }
  });

  // Bind inbox backdrop click close listener
  const inboxBackdrop = el('inbox-backdrop');
  if (inboxBackdrop) {
    inboxBackdrop.addEventListener('click', closeInbox);
  }

  // Escape key global panel dismissal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const inbox = el('inbox-panel');
      if (inbox && inbox.classList.contains('visible')) {
        closeInbox();
      }
      const sheet = el('bottom-sheet');
      if (sheet && sheet.classList.contains('open')) {
        closeSheet();
      }
      const energy = el('energy-modal-backdrop');
      if (energy && energy.classList.contains('visible')) {
        hideEnergyModeSelector();
      }
      const settings = el('settings-overlay');
      if (settings && settings.classList.contains('visible')) {
        closeSettingsModal();
      }
      const customLogger = el('custom-logger-overlay');
      if (customLogger && !customLogger.classList.contains('hidden')) {
        closeCustomLogger();
      }
      const foodSheet = el('food-sheet-backdrop');
      if (foodSheet && foodSheet.classList.contains('visible')) {
        closeFoodSheet();
      }
      const scorecard = el('scorecard-backdrop');
      if (scorecard && scorecard.classList.contains('visible')) {
        closePartnerScorecard();
      }
      const resetModal = el('safe-reset-backdrop');
      if (resetModal && resetModal.classList.contains('visible')) {
        hideResetModal();
      }
      const profileOverlay = el('profile-overlay');
      if (profileOverlay && profileOverlay.classList.contains('visible')) {
        closeProfile();
      }
      const matchFilter = el('match-filter-backdrop');
      if (matchFilter && !matchFilter.classList.contains('hidden')) {
        matchFilter.classList.add('hidden');
      }
      const notifPanel = el('notif-panel');
      if (notifPanel && !notifPanel.classList.contains('hidden')) {
        notifPanel.classList.add('hidden');
        const notifBack = el('notif-backdrop');
        if (notifBack) notifBack.classList.add('hidden');
      }
    }
  });

  updateStreakUI();
  initAuth();
  initPrivacyToggles();
  renderNotifications();
  updateNotifBadge();
  initSplash();
});

function initPrivacyToggles() {
  const matchToggle = el('privacy-matching');
  const cityToggle = el('privacy-city');
  const profileToggle = el('privacy-profile');

  if (matchToggle) {
    matchToggle.checked = state.auth.matchingEnabled !== false;
    matchToggle.addEventListener('change', () => {
      state.auth.matchingEnabled = matchToggle.checked;
      renderSocialsUI();
      saveToStorage();
      playSound('tap');
    });
  }

  if (cityToggle) {
    cityToggle.checked = state.auth.hideCity === true;
    cityToggle.addEventListener('change', () => {
      state.auth.hideCity = cityToggle.checked;
      saveToStorage();
      playSound('tap');
    });
  }

  if (profileToggle) {
    profileToggle.checked = state.auth.privateProfile === true;
    profileToggle.addEventListener('change', () => {
      state.auth.privateProfile = profileToggle.checked;
      saveToStorage();
      playSound('tap');
    });
  }
}

// ─── Accountability Inbox Drawer ───
function openInbox() {
  playSound('tap');
  const panel = el('inbox-panel');
  const backdrop = el('inbox-backdrop');
  if (panel) {
    renderInbox();
    panel.classList.remove('hidden');
    if (backdrop) {
      backdrop.classList.remove('hidden');
      void backdrop.offsetWidth;
      backdrop.classList.add('visible');
    }
    void panel.offsetWidth;
    panel.classList.add('visible');
  }
  // Clear inbox badge
  const badge = el('inbox-badge');
  if (badge) badge.classList.add('hidden');
}

function closeInbox() {
  playSound('tap');
  const panel = el('inbox-panel');
  const backdrop = el('inbox-backdrop');
  if (panel) {
    panel.classList.remove('visible');
    if (backdrop) backdrop.classList.remove('visible');
    setTimeout(() => {
      panel.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
    }, 380);
  }
}

function renderInbox() {
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
      <span style="font-size:24px; display:block; margin-bottom:6px;">💬</span>
      <p style="font-size:12px; font-weight:700; color:var(--text-2);">No Active Chats</p>
      <p style="font-size:10px; color:var(--text-3); margin-top:2px;">Coordinate daily focus after matches are accepted.</p>
    `;
    container.appendChild(noChats);
  }
}

// ─── Interactive Partner Chat Screen ───
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
      messages.push({ sender: 'them', text: `Strong effort! Synced my check-in too. Keep compounding discipline! 🔥`, time: 'Just now' });
      state.auth.chats[partner.id] = messages;
      renderChatMessages();
      saveToStorage();
      
      // Update inbox preview text too
      const preview = el('inbox-last-msg');
      if (preview) preview.textContent = "Partner: Strong effort! Synced my check-in too...";
    }
  }, 3500);
}

// ─── Inspect Scorecard ───
function inspectPartnerScorecard() {
  playSound('tap');
  const backdrop = el('scorecard-backdrop');
  const container = el('scorecard-content');
  const partner = state.auth.partner;
  if (!backdrop || !container || !partner) return;
  
  const formatMap = { gym: '🏋️ Gym Mode', home: '🏠 Home Mode', hybrid: '⚡ Hybrid Mode', outdoor: '🌄 Outdoor Mode' };
  
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
}

function closePartnerScorecard() {
  playSound('tap');
  const backdrop = el('scorecard-backdrop');
  if (backdrop) {
    backdrop.classList.remove('visible');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
  }
}


