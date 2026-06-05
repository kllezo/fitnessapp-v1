# AURA Architecture

AURA is built as a high-fidelity single-page web application wrapping rich interactive logic, audio-synthesis, and demographic adaptive engines.

## 1. Technical Stack
- **Structure**: Semantic HTML5 containing modular simulated viewport frames and bottom navigation.
- **Styling**: Vanilla CSS (`app.css`) employing custom HSL-tailored css-variables, backdrop blurs, GPU-accelerated transition properties, and vertical keyframe animations.
- **Logic**: Vanilla Javascript (`app.js`) leveraging structured JSON data models, single-listener document event delegation, and browser native Web APIs.
- **Persistence**: Automated synchronization using serialized state buffers inside local browser state memory (`aura_state_v1`).

## 2. Decoupled Logic Engines
To facilitate scalable future integration with LLM endpoints, the business logic is split into standalone modular JS objects:
- `intelligenceEngine`: Performs Mifflin-St Jeor BMR calculations, target caloric surplus/deficit, and macronutrient targets.
- `trainingEngine`: Automatically configures sets, reps, and movement splits based on daily somatic readiness (35-100 score).
- `progressionEngine`: Identifies load performance trends and outputs progressive overload suggestions.
- `recoveryEngine`: Directs Box Breathing paces and synthesizes continuous deep brown ambient grounding waves.
- `nutritionEngine`: Filters high-protein regional recipes matching stay type, diet preference, and budget ceiling.
- `foodSwapEngine`: Computes protein/caloric preservation ratios to suggest alternative ingredient swaps.
- `groceryEngine`: Extrapolates meal plans into structured checklists and weekly cost estimation brackets.

## 3. Socials & Accountability Architecture
- **Tab Hierarchy**: The Socials screen splits into three panels: `Find Partner`, `Partner`, and `Friends`.
- **Matching State Machine**:
  - **Idle**: Ready to scan. Only the "Find My Match" CTA is shown.
  - **Searching**: Active scan. Displays "Analyzing Compatibility" with a simulated progress bar and cancel button.
  - **Found**: Match proposed. Shows a scorecard matching card with Accept/Decline choices.
  - **Matched**: Established partnership. Swaps the panel view to the `Partner` tab and opens direct chat paths.
- **Persistence Layer**: All match request states and active partnerships are serialized into `aura_state_v1` to restore the correct UI view state upon page refreshes. If the page is refreshed during a simulated search, the background search timer resumes automatically.
- **Unified Inbox & Chats**: All active partnerships and added friends are listed inside the global Inbox drawer. Clicking any row opens a unified scorecard modal with a double sub-tab layout (`Profile` and `Compatibility`) and a chat CTA to access a generalized chat canvas.

## 4. Navigation & Router Stack
The app uses a layout navigation controller displaying a active screen overlay and caching inactive viewports via `.hidden` classes. Navigating triggers hardware-accelerated shimmer delays mimicking API load thresholds.

## 5. UI Layer Constraints
- Responsive phone chassis wrapper containing Simulated iPhone notches, gesture pills, and system headers.
- Gesture-dismissible sheets using touch velocity vector math.
- Backdrop blurred warning overlays for safe reset flows.
- Responsive vertical stacked layouts for training sheet options with custom viewport media queries down to 320px preventing widget clipping.
- Fallback mock data and onboarding layout routing to prevent hidden states when local state variables are empty.
- Global CSS display utility classes to handle screen and panel toggles cleanly.

[SYSTEM] Completed Socials Restructure Final Pass & Workout Bugs Fixes.

[SYSTEM] Completed UX Cleanup & Socials Finalization Pass (Partner Tab cleaned, Active Partnership state added).

[SYSTEM] Completed Socials Restructure, rest timer selector fixes, independent set completion, global difficulty removal, automated history logging, layout alignment fixes, hidden state removals, and global CSS display fixes.

[SYSTEM] Completed Socials & Workout Cleanup Pass (Inbox button removed, Flat Friends list rendered directly below Add Friend, Relocated privacy toggles, reset actions, and friend history list to Profile Settings, added light/dark theme class toggling, and removed global weight/reps sliders in favor of set-level inputs with null guards).