# OUR VISIBLE UNIVERSE ACADEMY

## Comprehensive Architecture & Security Audit

### Baseline Analysis, Vulnerability Catalog & Implementation Blueprint

---

**Document ID:** `OVU-AUDIT-ACADEMY-2026-v1.0`  
**Repository:** `https://github.com/Mukulsri369/ourvisibleuniverse`  
**Audit Scope:** 24-Module Cosmic Learning Academy, Assessment Engines, Progression Architecture, Supabase Database Integration, COSMOS AI Voice Teacher, and Certification Pipeline.  
**Audit Status:** Complete Source-Level Discovery & Architectural Plan  
**Target Platform:** TanStack Start (React 19, Vite, SSR/SPA), Three.js / React Three Fiber, Supabase (PostgreSQL 14.18 + RLS), Gemini Live API & Google GenAI SDK.

---

## 1. Executive Summary

A comprehensive source-level and architectural security audit of the **Cosmic Learning Academy** was conducted across all 24 astronomical learning modules, the client-side state engine, the visual simulation pipelines, the database configuration, and the certification system.

### Key Audit Findings

1. **Client-Side Progress & Completion Bypass (Critical Severity):**
   - All module progress, quiz scores, and achievements are managed solely in the student's browser via `localStorage` (`cosmic_academy_user_progress_v1` in `src/lib/academy/progress.ts`).
   - Every module layout exposes an unvalidated `handleMarkComplete()` or `onMarkComplete` handler that invokes `onUpdateModuleProgress(module.id, 100, "completed")`.
   - A student can mark any or all 24 modules complete by clicking a single button without reading content, engaging with 3D simulations, or answering a single quiz question.
2. **Client-Side Assessment Scoring (High Severity):**
   - Quizzes are evaluated in the browser within `KnowledgeCheck.tsx`. Correct answers are included in component props and client bundles.
   - Any client can dispatch `useAcademyProgress().recordQuizResult(quizId, score, total)` with arbitrary values.
   - Passing thresholds are inconsistent (some modules require 70%, others require 0%, and some lack pass/fail gates).
3. **Fictitious / Client-Only Certification (High Severity):**
   - The existing `CosmicCertificateModal.tsx` generates an in-browser SVG download with an ad-hoc polynomial hash (`CLA-${Math.abs(...)}`).
   - There is no database record of certificates, no server verification endpoint, no tamper-proof digital signature, and no public verification mechanism.
4. **Isolated Database State:**
   - The Supabase database contains only `access_passes` for payment gating and astronomical catalog tables (`0002_create_astronomical_catalog_tables.sql`).
   - There are zero database tables, views, or RPCs for academy enrollments, verified module progress, quiz submissions, stage achievements, or certificate verification.
5. **Architectural Readiness for COSMOS AI Voice Teacher:**
   - The 24 modules possess structured scientific text (`introHook`, `coreConcepts`, `explanatoryText`, `depthNotes`, `funFacts`), but content is organized in varying TypeScript formats (some nested by grade levels, some flat arrays).
   - Audio processing must be decoupled from the Three.js WebGL render loop via Web Audio API worklets to avoid FPS stutter.

---

## 2. Section A: Course Architecture Analysis (All 24 Modules)

The academy curriculum is organized into **6 progressive stages**, each containing 4 thematic modules. The table below documents the verified file locations, interactive activities, quiz formats, and navigation routes for every module.

| Stage                                   | Mod #  | Module Title & Slug                                                 | Lesson Data File                  | UI Layout Component        | Key 3D / Interactive Activity Components                                                                                | Quiz Data Export                                          |
| :-------------------------------------- | :----- | :------------------------------------------------------------------ | :-------------------------------- | :------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| **Stage 1: Discovering Space**          | **01** | Our Place in the Universe (`our-place-in-the-universe`)             | `module-01-our-place.ts`          | `LessonLayout.tsx`         | `HierarchySequencer.tsx`, `CosmicScaleExplorer.tsx`                                                                     | `MODULE_01_LESSON.gradeLevelContent[level].quizQuestions` |
|                                         | **02** | The Night Sky & Constellations (`the-night-sky-and-constellations`) | `module-02-night-sky.ts`          | `Module02Layout.tsx`       | `VirtualPlanetarium3D.tsx`, `AccessibleSkyChart2D.tsx`, `ConstellationFinderGame.tsx`                                   | `MODULE_02_QUIZ` (flat array)                             |
|                                         | **03** | Cosmic Distances & Scale (`cosmic-distances-and-scale`)             | `module-03-cosmic-scale.ts`       | `Module03Layout.tsx`       | `CosmicScaleExperimentsLab.tsx`, `CosmicZoomVisualizer3D.tsx`, `AccessibleScaleDiagrams.tsx`                            | `MODULE_03_QUIZ` (flat array)                             |
|                                         | **04** | Light, Time & Observation (`light-time-and-cosmic-observation`)     | `module-04-light-time.ts`         | `Module04Layout.tsx`       | `LightTravelSimulation3D.tsx`, `LightExperimentsLab.tsx`, `HowFarIntoThePastChallenge.tsx`                              | `MODULE_04_QUIZ` (flat array)                             |
| **Stage 2: Our Cosmic Neighborhood**    | **05** | Earth, Moon & Seasons (`earth-moon-and-seasons`)                    | `module-05-earth-moon.ts`         | `Module05Layout.tsx`       | `SunEarthMoonSimulation3D.tsx`, `EarthMoonExperimentsLab.tsx`, `LunarPhasePredictionChallenge.tsx`                      | `MODULE_05_QUIZ` (flat array)                             |
|                                         | **06** | The Solar System (`the-solar-system-worlds`)                        | `module-06-solar-system.ts`       | `Module06Layout.tsx`       | `SolarSystemExplorer3D.tsx`, `SolarSystemExperimentsLab.tsx`, `SolarSystemScavengerHunt.tsx`                            | `MODULE_06_QUIZ.explorer` (nested by level)               |
|                                         | **07** | The Sun: Our Living Star (`the-sun-our-living-star`)                | `module-07-the-sun.ts`            | `Module07Layout.tsx`       | `SunSimulator3D.tsx`, `SpaceWeatherActivity.tsx`                                                                        | `MODULE_07_QUIZ` (flat array)                             |
|                                         | **08** | Gravity & Orbital Mechanics (`gravity-and-orbital-mechanics`)       | `module-08-gravity-orbits.ts`     | `Module08Layout.tsx`       | `OrbitalMechanicsLab3D.tsx`, `OrbitalEnergyGraphs.tsx`, `BoundVsUnboundChamber.tsx`, `StableSolarSystemChallenge.tsx`   | `MODULE_08_LESSON.gradeLevelContent[level].quizQuestions` |
| **Stage 3: The Life of Stars**          | **09** | Stars & How They Work (`stars-and-how-they-work`)                   | `module-09-stars.ts`              | `Module09Layout.tsx`       | `StellarMuseum3D.tsx`, `HRDiagramExplorer.tsx`, `BlackbodySpectraLab.tsx`                                               | `MODULE_09_LESSON.gradeLevelContent[level].quizQuestions` |
|                                         | **10** | Stellar Evolution (`stellar-evolution-and-death`)                   | `module-10-stellar-evolution.ts`  | `Module10Layout.tsx`       | `StellarEvolutionLab3D.tsx`, `StellarEvolutionInteractiveLab.tsx`, `StellarOutcomePredictor.tsx`                        | `MODULE_10_QUIZ_QUESTIONS` (flat array)                   |
|                                         | **11** | Nebulae & Star Nurseries (`nebulae-and-star-nurseries`)             | `module-11-nebulae.ts`            | `Module11Layout.tsx`       | `Nebula3DExplorer.tsx`, `StarNurseryCollapseLab.tsx`, `ClusterComparator.tsx`                                           | `MODULE_11_QUIZ_QUESTIONS` (flat array)                   |
|                                         | **12** | Exoplanets & Alien Worlds (`exoplanets-and-alien-worlds`)           | `module-12-exoplanets.ts`         | `Module12Layout.tsx`       | `ExoplanetObservatory3D.tsx`, `ExoplanetDiscoveryLab.tsx`, `HabitableWorldLab.tsx`, `ExoplanetDetectiveGame.tsx`        | `MODULE_12_QUIZ` (flat array)                             |
| **Stage 4: Galaxies & Extreme Objects** | **13** | Galaxies & the Milky Way (`galaxies-and-the-milky-way`)             | `module-13-galaxies.ts`           | `/src/routes/galaxies.tsx` | Dedicated 3D Galaxy Viewer (Three.js Spiral, Barred, Elliptical particle canvas)                                        | `MODULE_13_QUIZ_QUESTIONS.explorer` (nested)              |
|                                         | **14** | Black Holes & Extreme Physics (`black-holes-and-extreme-objects`)   | `module-14-black-holes.ts`        | `Module14Layout.tsx`       | `BlackHoleVisualizer3D.tsx`, `PulsarSimulator.tsx`, `GravitationalWaveChirpLab.tsx`, `CompactObjectComparisonTable.tsx` | `MODULE_14_QUIZ` (flat array)                             |
|                                         | **15** | The Cosmic Web (`the-cosmic-web-large-scale-structure`)             | `module-15-cosmic-web.ts`         | `Module15Layout.tsx`       | `CosmicStructureVisualizer3D.tsx` (filamentary cosmic web visualizer)                                                   | `MODULE_15_QUIZ` (flat array)                             |
|                                         | **16** | Dark Matter & Dark Energy (`dark-matter-and-dark-energy`)           | `module-16-dark-matter-energy.ts` | `Module16Layout.tsx`       | `DarkMatterRotationLab.tsx`, `DarkEnergyCosmologyLab.tsx`, `DarkSectorMythbusters.tsx`                                  | `MODULE_16_QUIZ` (flat array)                             |
| **Stage 5: Understanding the Universe** | **17** | The Big Bang & Early Cosmos (`the-big-bang-and-cosmic-dawn`)        | `module-17-big-bang.ts`           | `Module17Layout.tsx`       | `CosmicTimeMachine3D.tsx`, `CMBExplorerLab.tsx`                                                                         | `MODULE_17_QUIZ` (flat array)                             |
|                                         | **18** | The Expanding Universe (`the-expanding-universe-and-redshift`)      | `module-18-expanding-universe.ts` | `Module18Layout.tsx`       | `CosmicExpansionObservatory3D.tsx`, `RedshiftWavelengthLab.tsx`                                                         | `MODULE_18_QUIZ` (flat array)                             |
|                                         | **19** | History of Cosmology (`history-of-human-cosmology`)                 | `module-19-history-cosmology.ts`  | `Module19Layout.tsx`       | `HistoricalModelComparator.tsx`                                                                                         | `MODULE_19_QUIZ` (flat array)                             |
|                                         | **20** | The Future of the Universe (`the-future-of-the-universe`)           | `module-20-future-universe.ts`    | `Module20Layout.tsx`       | `CosmicFutureTimelineLab.tsx`, `CosmicEnergyBudgetCard.tsx`                                                             | `MODULE_20_QUIZ` (flat array)                             |
| **Stage 6: Become a Space Scientist**   | **21** | Telescopes & Observation (`telescopes-and-observatories`)           | `module-21-telescopes.ts`         | `Module21Layout.tsx`       | `VirtualObservatoryLab.tsx`                                                                                             | `MODULE_21_QUIZ` (flat array)                             |
|                                         | **22** | Space Missions & Robotics (`space-missions-and-exploration`)        | `module-22-space-missions.ts`     | `Module22Layout.tsx`       | `SpaceMuseumLab.tsx`                                                                                                    | `MODULE_22_QUIZ` (flat array)                             |
|                                         | **23** | Astrobiology & Life in Space (`astrobiology-and-search-for-life`)   | `module-23-astrobiology.ts`       | `Module23Layout.tsx`       | Habitable Zone / Biosignature Lab                                                                                       | `MODULE_23_QUIZ` (flat array)                             |
|                                         | **24** | The Cosmic Laboratory (`the-cosmic-laboratory-capstone`)            | `module-24-cosmic-lab.ts`         | `Module24Layout.tsx`       | `CosmicPhysicsLab.tsx`, `CosmicDensityGame.tsx`                                                                         | `MODULE_24_QUIZ` (flat array)                             |

### Navigation & Routing Patterns

1. **Hub Route (`/learn`):** Handled in `src/routes/learn.tsx`, mounting `<AcademyDashboard initialModuleId={search.module} />`.
2. **Module 13 Redirection Exception:** If `initialModuleId === "13"` or a user selects Module 13, `AcademyDashboard` redirects to `/galaxies` via `navigate({ to: "/galaxies" })`.
3. **Module Switching:** All other 23 modules are loaded lazily within `AcademyDashboard.tsx` via `renderActiveModule(moduleId, props)`.
4. **Back to Map Callback:** Each layout component accepts `onBackToMap: () => void`, resetting active state in `AcademyDashboard`.

---

## 3. Section B: Completion Security & Vulnerability Analysis

A rigorous inspection of completion callbacks and state mutations revealed several critical security vulnerabilities:

```
[Student Browser]
       │
       ├─► Clicks "Mark Complete" ─────────────► onUpdateModuleProgress("14", 100, "completed")
       │                                                    │
       │                                                    ▼
       ├─► Bypasses Quiz / Answers               localStorage.setItem(
       │                                           "cosmic_academy_user_progress_v1", ...
       │                                         )
       └─► Invokes useAcademyProgress()                     │
           methods in DevTools console                      ▼
                                                 Unearned Badge Awarded
                                                 + Certificate Unlocked
```

### 1. Manual Completion Shortcuts in UI

In `src/components/academy/ModuleNavigation.tsx` (lines 49-56):

```tsx
{!isCompleted ? (
  <Button
    size="lg"
    onClick={onMarkComplete}
    className="font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 ..."
  >
    <CheckCircle2 className="size-5 mr-2" />
    <span>Mark Module Complete</span>
  </Button>
) : ...}
```

In `LessonLayout.tsx`, `Module04Layout.tsx`, `Module05Layout.tsx`, and `Module14Layout.tsx` through `Module24Layout.tsx`, this `onMarkComplete` prop is wired to `handleMarkComplete()`:

```tsx
const handleMarkComplete = () => {
  onUpdateModuleProgress(module.id, 100, "completed");
};
```

**Impact:** A user can land on any module, click the button without interacting with any content, and immediately receive 100% completion credit.

### 2. Missing Server Validation on Completion Callbacks

In `src/lib/academy/progress.ts`, the hook `useAcademyProgress()` directly writes progress to `localStorage`:

```ts
const setModuleProgress = useCallback(
  (moduleId: string, percent: number, status?: ModuleStatus) => {
    setProgress((prev) => {
      // Calculates status, pushes achievements, and saves to localStorage
      saveStoredProgress(next);
      return next;
    });
  },
  [],
);
```

There is zero server interaction. The server never receives a submission payload, never checks timestamps or session tokens, and never signs or certifies completions.

### 3. Client-Controlled Achievement Unlocks

In `src/lib/academy/progress.ts` (lines 220-264), achievements such as `stellar_astrophysicist`, `black_hole_pioneer`, and `cosmic_web_cartographer` are automatically pushed to the `achievements` array as soon as `resolvedStatus === "completed"`. Because `setModuleProgress` can be executed arbitrarily, all achievements can be unlocked in seconds via simple client-side scripts:

```js
// Vulnerability Proof-of-Concept:
const p = JSON.parse(localStorage.getItem("cosmic_academy_user_progress_v1"));
Object.keys(p.moduleProgress).forEach((id) => {
  p.moduleProgress[id] = {
    status: "completed",
    percent: 100,
    lastOpenedAt: new Date().toISOString(),
  };
});
localStorage.setItem("cosmic_academy_user_progress_v1", JSON.stringify(p));
```

---

## 4. Section C: Assessment Integrity & Standardization Needs

### Current Discrepancies Across Quiz Implementations

1. **Answer Key Representation:**
   - Modules 02, 03, 04, 05, 07, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 use `correctIndex: number`.
   - Historical files or older drafts had `correctAnswerIndex` or `correctAnswer`.
   - In `KnowledgeCheck.tsx` line 89:
     ```tsx
     const isCorrect = userAnswer === q.correctIndex;
     ```
     If a question structure uses an unnormalized field, line 89 fails while line 34 in `calculateScore()` checks `(q as any).correctAnswerIndex`, leading to inconsistent UI feedback vs score tallying.
2. **Passing Threshold Discrepancies:**
   - `LessonLayout.tsx`: `Math.ceil(total * 0.7)` (70% pass threshold).
   - `Module14Layout.tsx`: `Math.ceil(total * 0.7)` (70% pass threshold).
   - `galaxies.tsx`: Weighted calculation `chapterWeight (60%) + quizWeight (40%)`.
   - Other modules: Either lack a passing threshold entirely or award completion regardless of score.
3. **Client-Side Answer Exposure:**
   - All question options, correct indexes, and explanations are bundled in JavaScript files served to the browser (`src/lib/academy/lessons/*.ts`).
   - Any student inspecting network requests or browser memory can inspect the correct options prior to selection.

### Required Standardization for Secure Certification

1. **Canonical Question Schema:**
   ```ts
   export interface CanonicalQuizQuestion {
     id: string;
     moduleId: string;
     stageId: number;
     level: LearningLevel;
     question: string;
     options: [string, string, string, string]; // Exactly 4 options
     correctIndex: number; // Server-only in secure mode
     explanation: string;
     scientificDomain: string;
   }
   ```
2. **Dual-Mode Serving:**
   - _Public Client View:_ Receives question text, options (shuffled), and question ID. Does NOT receive `correctIndex` or `explanation` until submission.
   - _Server Verification Endpoint:_ Accepts array of `{ questionId: string, selectedIndex: number }`, computes score against database question bank, and returns graded results with explanations.
3. **Enforced Passing Threshold:**
   - Module Knowledge Check: Minimum **80%** (e.g. 4/5 or 8/10) to earn "Passed" status for module verification.
   - Final Examination: Minimum **80%** (24/30) across all stages to earn the Cosmic Explorer Certificate.

---

## 5. Section D: Database Architecture & Migration Plan

### Existing Database Inventory

- **Supabase PostgreSQL 14.18** with extensions.
- Tables present:
  - `access_passes`: Stores user subscription/pass credentials.
  - `astronomical_catalogs`, `catalog_batches`, `astronomical_objects`, `object_measurements`, `spatial_tiles`.
- Authentication:
  - Supabase Auth (`auth.users`) integrated via `@supabase/supabase-js` and `@lovable.dev/cloud-auth-js` with Google OAuth and Email/Password.

### Proposed Database Schema for Verified Learning

To support verified learning, assessments, stage badges, and certificates without touching existing tables, 6 new relational tables with Row Level Security (RLS) are required:

```
┌─────────────────────────┐       ┌─────────────────────────┐
│       auth.users        │       │   academy_certificates  │
└────────────┬────────────┘       ├─────────────────────────┤
             │                    │ id (UUID, PK)           │
             ├───────────────────►│ certificate_number (UQ) │
             │ 1:1                │ verification_hash       │
             ▼                    │ user_id (FK)            │
┌─────────────────────────┐       │ callsign                │
│    academy_profiles     │       │ level                   │
├─────────────────────────┤       │ status (active/revoked) │
│ user_id (PK, FK)        │       │ issue_date              │
│ callsign (text)         │       └─────────────────────────┘
│ selected_level (text)   │
│ is_anonymous (boolean)  │
└────────────┬────────────┘
             │
             ├───► 1:N ───► academy_module_progress (user_id, module_id, status, verified_at)
             │
             ├───► 1:N ───► academy_quiz_attempts (user_id, module_id, score, passed, answers_hash)
             │
             ├───► 1:N ───► academy_stage_badges (user_id, stage_id, badge_id, awarded_at)
             │
             └───► 1:N ───► academy_final_exam_attempts (user_id, score, passed, started_at)
```

#### SQL Migration Specification: `0003_create_academy_verified_learning.sql`

```sql
-- 1. Student Academy Profiles (Child-Friendly & Privacy-Compliant)
CREATE TABLE IF NOT EXISTS public.academy_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  callsign text NOT NULL CHECK (char_length(callsign) >= 3 AND char_length(callsign) <= 32),
  selected_level text NOT NULL DEFAULT 'explorer' CHECK (selected_level IN ('junior', 'explorer', 'astronomer')),
  is_callsign_custom boolean NOT NULL DEFAULT false,
  total_modules_completed integer NOT NULL DEFAULT 0,
  final_exam_passed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Verified Module Progress
CREATE TABLE IF NOT EXISTS public.academy_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL CHECK (module_id ~ '^[0-2][0-9]$'),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  percent integer NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  time_spent_seconds integer NOT NULL DEFAULT 0,
  verified_quiz_passed boolean NOT NULL DEFAULT false,
  first_started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

-- 3. Verified Quiz Attempts & Audit Trail
CREATE TABLE IF NOT EXISTS public.academy_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  percentage double precision GENERATED ALWAYS AS (ROUND((score::numeric / total::numeric) * 100, 2)) STORED,
  passed boolean NOT NULL,
  answers_payload jsonb NOT NULL,
  client_duration_seconds integer,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Progressive Stage Badges (Stages 1 through 6)
CREATE TABLE IF NOT EXISTS public.academy_stage_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id integer NOT NULL CHECK (stage_id BETWEEN 1 AND 6),
  badge_id text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, stage_id)
);

-- 5. Final Comprehensive Cosmic Explorer Examination
CREATE TABLE IF NOT EXISTS public.academy_final_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL DEFAULT 30,
  percentage double precision GENERATED ALWAYS AS (ROUND((score::numeric / total::numeric) * 100, 2)) STORED,
  passed boolean NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  duration_seconds integer GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (completed_at - started_at))::integer) STORED
);

-- 6. Canonical Certificate Credentials & Public Verification Table
CREATE TABLE IF NOT EXISTS public.academy_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text UNIQUE NOT NULL, -- e.g. CLA-2026-A8F29E4D
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  callsign text NOT NULL,
  level text NOT NULL CHECK (level IN ('junior', 'explorer', 'astronomer')),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  final_score_percentage double precision NOT NULL,
  verification_hash text NOT NULL, -- HMAC-SHA256 signature
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'superseded')),
  curriculum_version text NOT NULL DEFAULT '1.0.0',
  pdf_storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all academy tables
ALTER TABLE public.academy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_stage_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_final_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;

-- Student Policies
CREATE POLICY "Users read/write own profile" ON public.academy_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read/write own module progress" ON public.academy_module_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read/insert own quiz attempts" ON public.academy_quiz_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users view own badges" ON public.academy_stage_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users view own exam records" ON public.academy_final_exams
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users view own certificates" ON public.academy_certificates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- PUBLIC VERIFICATION POLICY: Anyone (including unauthenticated visitors) can verify a certificate by certificate_number
CREATE POLICY "Public certificate verification" ON public.academy_certificates
  FOR SELECT TO anon, authenticated
  USING (status = 'active');
```

---

## 6. Section E: COSMOS AI Voice Architecture & 3D Integration

### Overview of COSMOS AI Teacher

The objective is to implement a shared, omnipresent AI voice teacher (**COSMOS**) across all 24 modules. COSMOS can:

1. Orally explain concepts at the student's selected grade level (Junior, Explorer, Astronomer).
2. Answer student questions in real-time (speech-to-speech or text-to-speech).
3. Directly manipulate the 3D scene (pointing camera, rotating celestial bodies, activating X-ray/Infrared layers, toggling orbital paths).
4. Pause and resume narration naturally when interrupted.

```
┌────────────────────────────────────────────────────────┐
│                   Student Browser                      │
│                                                        │
│   [Microphone] ──► AudioWorklet (16kHz PCM)            │
│                         │                              │
│                         ▼ WebSocket Stream             │
└─────────────────────────┼──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│         Backend Server (/api/academy/cosmos/session)   │
│                                                        │
│   Session Manager ◄────► Google GenAI Live API Client  │
│   (State & Context)      (Model: gemini-2.5-flash)     │
│         │                                              │
│         ├── System Prompt & Current Module Curriculum  │
│         ├── Available Function Calling Tools           │
│         │     • cosmos_navigate_scene(target, zoom)    │
│         │     • cosmos_highlight_structure(partId)     │
│         │     • cosmos_set_sim_param(param, value)     │
│         │                                              │
│         └── Bi-directional Audio Streaming (PCM 24kHz) │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│                   Student Browser                      │
│                                                        │
│   Incoming Audio ──► Web Audio API Buffer Queue        │
│   Tool Calls     ──► 3D Scene Controller (Event Bus)   │
│                      (Smooth camera pan / LOD toggle)  │
└────────────────────────────────────────────────────────┘
```

### Centralized Narration & Position Tracking

1. **Curriculum Position Marker:**
   A central Zustand store `useCosmosStore` tracks:
   - `activeModuleId`: e.g. `"08"`
   - `activeStep`: e.g. `"step-c-3d-lab"`
   - `playbackState`: `'idle' | 'speaking' | 'listening' | 'paused'`
   - `interruptedAtMs`: number
2. **Text-to-Narration Extraction:**
   Each module's scientific narrative is indexed by step anchors:
   - Step A: `introHook`
   - Step B: `coreConcepts`
   - Step C: `explanatoryText` (with 3D camera cue tags)
   - Step D: `interactiveExperiment` instructions
   - Step E: `mathExplanation` / `depthNotes`
   - Step F: `quizQuestions` guidance

### Gemini Live API & Speech Specifications

- **Model:** `gemini-2.5-flash` with Live bidirectional audio capabilities.
- **Audio Input:** 16kHz, 16-bit Mono Linear PCM.
- **Audio Output:** 24kHz, 1-channel Linear PCM stream.
- **Interruption Handling (Barge-in):**
  - When the client's local Voice Activity Detector (VAD) detects user speech while audio is playing:
    1. Immediately mute local `AudioContext` gain node over 30ms ramp.
    2. Flush queued audio buffers.
    3. Send `{ client_content: { turn_complete: false } }` cancellation frame to the server session.
    4. Save the current narration transcript offset so COSMOS can resume or acknowledge the question seamlessly.
- **Function Calling for 3D Educational Visualizations:**
  ```json
  {
    "name": "cosmos_control_visualization",
    "description": "Adjusts the 3D scene parameters to focus student attention on a celestial body or physical concept.",
    "parameters": {
      "type": "object",
      "properties": {
        "targetBody": {
          "type": "string",
          "enum": ["earth", "moon", "sun", "polaris", "andromeda", "black_hole", "cosmic_web"]
        },
        "cameraDistance": { "type": "number", "description": "Relative camera distance" },
        "visualFilter": {
          "type": "string",
          "enum": ["optical", "infrared", "xray", "gravitational_lensing", "orbit_lines"]
        },
        "simulationSpeed": { "type": "number", "description": "Multiplier for time evolution" }
      },
      "required": ["targetBody"]
    }
  }
  ```

---

## 7. Section F: Certification Architecture & Verification Pipeline

```
[Student Completes 24 Modules]
             │
             ▼
[Validates 6 Stage Badges via Server]
             │
             ▼
[Unlocks Final Comprehensive Exam (30 Questions, 45 Min)]
             │
             ▼
[Score >= 80% (24/30)] ──► Server creates certificate record in database
                                     │
                                     ├─► Generates Unique ID: CLA-2026-X8Y2-Z9W4
                                     ├─► Signs with HMAC-SHA256 (Secret Server Key)
                                     ├─► Embeds QR Code -> https://ourvisibleuniverse.in/verify/CLA-2026-...
                                     └─► Streams Vector-Quality PDF to Student
```

### 1. Six Stage Progressive Badges

A student earns a Stage Achievement Badge only when all 4 modules in that stage are server-verified:

- **Stage 1 (Modules 01–04):** _Cosmic Horizon Pioneer_
- **Stage 2 (Modules 05–08):** _Solar System Navigator_
- **Stage 3 (Modules 09–12):** _Stellar Astrophysicist_
- **Stage 4 (Modules 13–16):** _Galactic Cosmologist_
- **Stage 5 (Modules 17–20):** _Cosmic Chronologist_
- **Stage 6 (Modules 21–24):** _Master Space Scientist_

### 2. Final Cosmic Explorer Examination

- **Prerequisites:** All 6 Stage Badges awarded in `academy_stage_badges`.
- **Structure:** 30 questions dynamically sampled (5 questions per stage) from a curated question bank of 120 questions.
- **Parameters:**
  - 45-minute countdown timer enforced on server.
  - Question options randomized per session seed.
  - Passing grade: **80% (24 of 30)**.
  - Retake cooldown: 1 hour between attempts if failed.

### 3. Cryptographic Certificate Identification & QR Verification

- **Certificate Identifier Format:**
  `CLA-{YEAR}-{8-CHARACTER-ALPHANUMERIC-UPPERCASE}` (e.g. `CLA-2026-F93C-728A`).
- **Tamper-Proof Verification Hash:**
  `HMAC_SHA256(certificate_number + user_id + issue_date + grade_level, CERT_SECRET_KEY)`.
- **Public Verification Endpoint:**
  `/verify/$certificateId` (routed at `/verify/:id`).
  - Publicly accessible without authentication.
  - Displays: Certificate Number, Student Callsign (No PII), Achievement Tier, Date Issued, Verified Stage Badges, Status (Valid / Revoked).
  - Embedded QR code on the certificate resolves directly to this URL.

### 4. PDF Generation & Student Privacy

- Rendered server-side using high-resolution vector layout.
- **Privacy By Design:**
  - Real names, email addresses, and personal student data are NEVER placed on public certificates or stored in public tables.
  - Students choose or customize a celestial callsign (e.g., "Explorer Kepler", "Navigator Nova", "Commander Zenith").
  - Complies with COPPA and global child-privacy standards.

---

## 8. Section G: Performance & 3D WebGL Stability

### Current WebGL Architecture Analysis

The application contains numerous Three.js and `@react-three/fiber` canvas components across the modules (`VirtualPlanetarium3D`, `SunEarthMoonSimulation3D`, `SolarSystemExplorer3D`, `StellarEvolutionLab3D`, `BlackHoleVisualizer3D`, `CosmicStructureVisualizer3D`, `galaxies.tsx`).

1. **Context Exhaustion Prevention:**
   - Browsers enforce a maximum limit of **8 to 16 active WebGL contexts**.
   - If multiple canvas components mount simultaneously or fail to clean up geometries, textures, and render targets upon unmounting, the browser triggers `CONTEXT_LOST_WEBGL`.
   - **Requirement:** Ensure all module layouts unmount their 3D Canvas instances upon step navigation or route change and call `.dispose()` on geometries, materials, and textures.
2. **Audio Processing Decoupling:**
   - Web Audio streaming and microphone analysis must run on the browser's dedicated audio thread using an `AudioWorkletNode`.
   - The audio playback queue must NOT trigger React state updates or cause React re-render cycles. Audio visualizer waveforms must render via `requestAnimationFrame` on an unmanaged 2D canvas or direct CSS transform updates.
3. **Suspense & Code-Splitting:**
   - All 24 module layouts and heavy Three.js visualizers are lazy-loaded via `React.lazy()` with lightweight loading fallbacks (`ModuleLoadingFallback`). This keeps the initial bundle size small and prevents initial load delays.

---

## 9. Section H: Comprehensive Implementation Plan & Dependency Map

The development roadmap is organized into **4 sequential, non-destructive phases**.

```
[Phase 1: Database & Verification Engine]
             │
             ▼
[Phase 2: Secure Assessment Engine & Module Normalization]
             │
             ▼
[Phase 3: Certification Pipeline & Public Verification]
             │
             ▼
[Phase 4: COSMOS AI Voice Teacher & 3D Synchronization]
```

### Phase 1: Database & Verification Engine

- **Objectives:** Deploy database schema for academy profiles, verified progress, quiz attempts, stage badges, and certificates.
- **Required Code Changes:**
  - Create migration file `drizzle/migrations/0003_create_academy_verified_learning.sql`.
  - Update `src/integrations/supabase/types.ts` with newly created tables and RPCs.
  - Implement server API endpoint `/api/academy/progress` (TanStack Start server route) for secure read/write of progress.
- **Existing Components to Reuse:**
  - Supabase client auth middleware (`src/integrations/supabase/client.server.ts`, `auth-middleware.ts`).
- **Security Requirements:** Strict RLS enforcement, authenticated JWT verification on every progress update.
- **Acceptance Criteria:**
  - Authenticated user can query their verified progress.
  - Unauthenticated requests are rejected with 401.

### Phase 2: Secure Assessment Engine & Module Normalization

- **Objectives:** Standardize quiz data schemas across all 24 modules, remove manual completion bypasses, and migrate quiz grading to server endpoints.
- **Required Code Changes:**
  - Normalize all quiz exports in `src/lib/academy/lessons/*.ts` to standard `CanonicalQuizQuestion[]`.
  - Implement server grading route `/api/academy/quiz/submit`.
  - Update `KnowledgeCheck.tsx` to submit selected answers to the server and receive verified scores.
  - Replace the "Mark Complete" bypass buttons with an "Activity Completed" verification gate (requiring 80% quiz score and lab interaction).
  - Implement automatic Stage Badge awards when all 4 modules in a stage reach verified completion.
- **Potential Conflicts:** Must preserve existing offline/preview fallback for users without accounts (saving progress in localStorage as an unverified guest pass).
- **Acceptance Criteria:**
  - No client-side bypass buttons exist.
  - Quizzes are scored authoritatively on the server.
  - Passing scores (>80%) write directly to `academy_module_progress`.

### Phase 3: Certification Pipeline & Public Verification

- **Objectives:** Build the 30-question final comprehensive examination, vector PDF certificate generator, and public verification page.
- **Required Code Changes:**
  - Create `src/routes/verify/$certificateId.tsx` for public verification.
  - Implement server route `/api/academy/exam/start` and `/api/academy/exam/submit`.
  - Implement `/api/academy/certificate/generate` (PDF stream with embedded QR code).
  - Update `CosmicCertificateModal.tsx` to download the verified PDF from the server.
- **Security Requirements:** Cryptographic HMAC signature on certificate numbers; public verification exposes only student callsign and dates (no PII).
- **Acceptance Criteria:**
  - Scanning the certificate QR code opens `/verify/CLA-2026-XXXX` and verifies authenticity.
  - Invalid or tampered certificate IDs return "Invalid or Unrecognized Certificate".

### Phase 4: COSMOS AI Voice Teacher & 3D Synchronization

- **Objectives:** Deploy the real-time AI voice teacher powered by Gemini Live API and synchronize speech with 3D astronomical simulations.
- **Required Code Changes:**
  - Install `@google/genai` SDK.
  - Create backend WebSocket proxy `/api/academy/cosmos/session`.
  - Implement `CosmosVoiceWidget.tsx` with push-to-talk, live waveform, and audio worklet stream.
  - Implement 3D scene dispatch listener for `cosmos_control_visualization` tool calls.
  - Wire interruption handling and audio buffer flushing.
- **Performance Requirements:** Audio processing must maintain 60 FPS in Three.js canvas without memory leaks.
- **Acceptance Criteria:**
  - Student can ask a voice question and receive immediate voice explanation.
  - COSMOS can trigger camera movements or focus switches in the 3D scene.
  - Interruption immediately halts teacher audio.

---

## 10. Audit Conclusions & Next Steps

This audit confirms that the **Our Visible Universe Academy** possesses rich scientific content, excellent 3D visualizers, and an engaging 24-module curriculum. The identified vulnerabilities—primarily client-side progress trusting and manual completion shortcuts—can be resolved through server-authoritative progress tracking, standardized quiz evaluation, cryptographically verified certification, and the real-time COSMOS AI voice teacher.

All proposed enhancements preserve the existing astronomical visualizers, coordinate frameworks, educational content, and user experience without regressions.
