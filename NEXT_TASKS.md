# AURA Next Tasks - Socials Restructure & Matching Flow Fix

Track the progress of restructuring and features development:

- [x] **1. Remove Profile Card from Socials**
  - [x] Remove your name, @username, and View Profile card.
  - [x] Create Profile button in top-right of Socials screen header.
  - [x] Profile button triggers `openProfile()` to display overlay.

- [x] **2. Move Consistency Index to Home**
  - [x] Extract Consistency Index score, Day Streak, Weekly, and Reliability out of Socials.
  - [x] Place on Homepage Dashboard below Advice Card.
  - [x] Call `calculateDisciplineScore()` on entering dashboard.
  - [x] Remove "Consistency Factor" description block.

- [x] **3. Socials Tab Structure**
  - [x] Implement navigation sub-tabs: Find Partner, Partner, Friends.
  - [x] Toggle panel visibility matching active sub-tab.

- [x] **4. Find Partner Tab & Matching Flow Fix**
  - [x] Default Find Partner panel to Idle state (show only "Find My Match" CTA card).
  - [x] Clicking "Find My Match" triggers Preferences modal.
  - [x] Submitting preferences sets match request to Searching state.
  - [x] Searching state shows "Analyzing Compatibility" card with cancellation.
  - [x] After simulated delay, transitions to Found state (Accept/Decline).
  - [x] Implement full state persistence across reloads.

- [x] **5. Partner Tab**
  - [x] Displays partner name, compatibility %, individual streak, discipline score, shared partner streak, weekly accountability challenge, weekly partner review, and last active status.

- [x] **6. Friends Tab**
  - [x] Displays categorised friend lists (Spouse, Family, Training Buddy, Gym Friends, Local Friends).
  - [x] Add "👤+ Add Friend" button opening a selection sheet (Add Existing, Gym Buddy, Family, Spouse).

- [x] **7. Inbox Restructure**
  - [x] Direct all chats (partner and friends) into the Inbox panel list.
  - [x] Clicking an item triggers the scorecard detail modal (Profile info + Compatibility % with reasons) with a "Chat" CTA.
  - [x] Wire ESC key and backdrop clicks to close the Inbox and scorecard modals.
  - [x] Generalize chat screen to support any user (activeChatUser).

- [x] **8. Critical Bug Fixes**
  - [x] Fix app startup crash (duplicate variable declarations of `findCard` and `pendingCard` inside `renderSocialsUI`).
- [x] **9. Socials Polish Pass**
  - [x] Reorder Socials tab: Partner -> Friends -> Find Partner.
  - [x] Format Partner tab metrics (Accountability Contract, Today's Status, Trend, Summary).
  - [x] Restructure Friends tab (Lists, Pending Requests, Add Friend, History).
  - [x] Restructure Find Partner tab (hide Friends/Partner options, restrict matching if already matched).
  - [x] Update friend flow: Clicking friend opens chat directly, clicking username in chat header inspects profile scorecard.
  - [x] Implement automated friend/partner history logs.
- [x] **10. Workout Polish Pass**
  - [x] Remove global difficulty slider and text controls completely.
  - [x] Resolve rest timer selector highlights and driving countdown.
  - [x] Resolve set checklist double-toggling and independent selection states.
- [x] **11. UI Layout & Slider Alignment Pass**
  - [x] Fix Weight & Reps slider knobs extending outside container/viewport bounds.
  - [x] Reorder rest timer selector buttons to logical ascending order (30s, 60s, 90s, 120s) and remove 45s button.
  - [x] Center and contain rest start button inside card bounds.
  - [x] Perform responsive pass (320px, 375px, 390px, 430px widths) with zero horizontal scrolling.
  - [x] Add dynamic friends comparison leaderboard chart/graph at the top of Friends sub-tab with index-based multi-color gradient bars.
- [ ] **12. Future AI & Recovery Integrations**
  - [ ] Implement AI weekly reviews, habit logs, and readiness star ratings.
  - [ ] Connect Recovery Score, Recovery Streak, Fatigue Trend, and Sleep Debt telemetry.

[SYSTEM] Completed Socials Restructure Final Pass & Workout Bugs Fixes.

[SYSTEM] Completed UX Cleanup & Socials Finalization Pass (Partner Tab cleaned, Active Partnership state added).

[SYSTEM] Completed Socials Restructure, rest timer selector fixes, independent set completion, global difficulty removal, automated history logging, and layout alignment fixes.