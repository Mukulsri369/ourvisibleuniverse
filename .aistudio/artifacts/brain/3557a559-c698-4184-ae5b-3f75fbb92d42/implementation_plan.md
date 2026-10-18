# Our Visible Universe Academy: Verified Completion Engine

A centralized, server-authoritative educational verification engine for the 24-module Cosmic Learning Academy. Replaces unverified "Mark Complete" shortcuts with rigorous, multi-factor learning validation: required reading comprehension, verified interactive simulation physics outcomes, accessible alternative pathways, and secure server-graded assessments.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed through interactive clarification and govern the implementation:

- **Confirmed Decision 1 (Guest & Offline Learners)**: Activity evidence and progress are securely cached in local offline queues and automatically synchronized with the server-side validator as soon as the student signs in or reconnects.
- **Confirmed Decision 2 (Checklist Placement & Navigation)**: Each module provides a persistent sticky summary drawer along the bottom edge showing real-time eligibility status, paired with a full interactive completion checklist embedded at the conclusion of the lesson.
- **Confirmed Decision 3 (Simulation Guidance & Accessibility)**: Interactive simulation challenges (e.g., Module 08 orbital mechanics) provide adaptive physics hints and dedicated 2D high-contrast accessible alternatives that evaluate with equivalent mathematical rigor.

---

## 1. Overview & Core Concept

- **What It Does**: The Verified Completion Engine establishes an uncheatable, standards-aligned credentialing pipeline for all 24 modules of Our Visible Universe Academy. No module status can be changed to "completed" through simple clicks, local storage tampering, artificial client timers, or AI assistant commands. Verified completion requires a student to demonstrate authentic engagement across three distinct verification states: (1) core instructional section reading, (2) verified activity or simulation challenge outcomes with physics validation, and (3) a passing score ($\ge 70\%$) on the server-graded assessment.
- **Target Audience / Persona**: Astronomy students, self-directed cosmic learners, educators, and certification candidates seeking provable mastery from Earth's cosmic address out to the cosmological horizon.
- **Key Value**: Guarantees educational integrity for progressive stage badges (Stages 1–6) and the final Cosmic Explorer certification, while remaining accessible to all learners through rigorous 2D alternative challenge pathways.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Exploration Phase*: The learner navigates through the module lessons. A subtle, non-intrusive sticky drawer at the bottom indicates live progress (`"2 of 3 Criteria Met"`) with single-line state indicators and direct jump buttons (`"Take Knowledge Check"`, `"Complete Required Activity"`).
  2. *Interactive Challenge Phase*: When entering a 3D simulation (e.g., Module 08 orbital insertion, Module 03 stellar parallax ladder), the student adjusts physical parameters. Upon achieving the physical objective (e.g., stable orbit with eccentricity $e < 0.05$ and specific orbital energy), the system captures physical telemetry and sends it to the server validator.
  3. *Accessible Alternative Flow*: Students unable or preferring not to interact with 3D WebGL canvases can toggle to the Accessible 2D Alternative, which presents equivalent numerical or parametric challenges with identical scientific validation criteria.
  4. *Verification & Certification*: At the conclusion of the module, the full completion checklist displays completed criteria with emerald verification shields, itemized feedback on missing requirements, and a server-issued verified timestamp once awarded.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Refined, publication-grade scientific dark canvas (`slate-950` / `slate-900`) with high-contrast typographic hierarchy and hairline structural borders (`border-white/10`).
  - *Color Palette & Mood*: Dominant neutral deep space canvas (60%), structural slate panels with subtle glassmorphism (30%), and focused emerald/cyan verification accents (10%). No garish neon or candy badges.
  - *Typography & Hierarchy*: Distinctive sans-serif headings (`Plus Jakarta Sans`), readable body text (`DM Sans`), and tabular numerals (`tabular-nums font-mono`) for orbital velocities, parallax angles, and quiz percentages.
  - *Anti-Slop Restraint*: Clean unboxed metadata with dot separators (`·`), no fake compiler tags or pseudo-code comments, and no asymmetric thick left colored borders.
- **Interactive Feedback & Motion**:
  - Smooth 150ms settling micro-interactions on checklist state changes.
  - Sticky drawer expands/collapses cleanly without obscuring primary educational content (capped under 12% viewport height).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Authoritative Evaluation vs. Client-Side Evaluation**
  - *Chosen Approach*: All completion decisions occur strictly on the server (`completion.server.ts` via TanStack Start server functions). Client components receive read-only evaluation snapshots.
  - *Why*: Prevents browser developer tool manipulation, script injections, or localStorage overwrites from awarding unearned certificates.
  - *Alternatives Considered*: Client-side rule evaluation was rejected because arbitrary local state can easily be forged.
- **Decision 2: Measurable Physics Telemetry vs. Activity Visit Tracking**
  - *Chosen Approach*: Activities require measurable, physically validated outcomes (e.g., gravitational parameter calculations, Keplerian orbital velocities, Schwarzschild radius equations) submitted to `validateActivityOutcomeServer`.
  - *Why*: Merely opening or clicking an interactive simulation does not demonstrate conceptual mastery.
  - *Alternatives Considered*: Tracking elapsed interaction time or click counts was rejected because automated timers can be left unattended.
- **Decision 3: Configurable Versioned Rule Registry vs. Fragmented Per-Module Code**
  - *Chosen Approach*: Centralized `MODULE_COMPLETION_RULES` registry in `completion-rules.ts` defining all 24 modules with schema versioning (`1.0.0`), explicit criteria, and alternative mappings.
  - *Why*: Allows curriculum updates, threshold adjustments, and auditability without touching 24 separate component layouts.
  - *Alternatives Considered*: Hardcoding logic in individual module layout files was rejected due to high maintenance overhead and divergence risks.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Cosmic Learning Academy                         │
│                    Verified Completion Architecture                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│          Client Layer               │   │          Offline Cache              │
│ - ModuleXXLayout (Modules 01–24)    │   │ - LocalStorage Activity Evidence    │
│ - Sticky Completion Drawer          │   │ - Auto-Sync Queue on Auth / Online  │
│ - ModuleCompletionChecklist         │   └──────────────────┬──────────────────┘
│ - Accessible 2D Challenge Mode      │                      │
└──────────────────┬──────────────────┘                      │
                   │ Server Function Calls                   │
                   ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     TanStack Start Server Layer                        │
│ - getModuleCompletionStatus({ moduleId })                              │
│ - submitActivityOutcome({ moduleId, activityId, payload })             │
│ - recheckModuleCompletion({ moduleId })                                │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│     Authoritative Engine            │   │      Physics Activity Validator     │
│ - completion.server.ts              │   │ - activity-validator.server.ts      │
│ - Evaluates: Reading + Activity     │   │ - Validates: Keplerian Orbits,      │
│   Evidence + Assessment (>= 70%)    │   │   Parallax, HR Diagrams, Optics,   │
│ - Atomic Completion Award           │   │   Cosmological Redshift & Models    │
│ - Stage Badges Trigger (4 modules)  │   │ - Validates Accessible Alternatives │
└──────────────────┬──────────────────┘   └─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Data Store                           │
│ - academy_verified_completions (user_id, module_id, verified_at)      │
│ - academy_activity_evidence (user_id, activity_id, status: verified)   │
│ - academy_assessment_attempts (user_id, assessment_id, score >= 70%)   │
│ - academy_stage_badges (user_id, stage_id, unlocked_at)               │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

1. **`src/lib/academy/completion-rules.ts`**:
   - Central registry for all 24 modules declaring required sections, activity criteria, assessment passing thresholds ($70\%$), and accessible alternative mappings.
2. **`src/lib/academy/activity-validator.server.ts`**:
   - Server-side physics engine validating telemetry payloads across all simulation domains (orbital mechanics, light lookback, stellar spectra, black hole horizons, cosmic web structures).
3. **`src/lib/academy/completion.server.ts`**:
   - Evaluates full student records, enforces the 3-pillar criteria, and updates `academy_verified_completions` and `academy_stage_badges`.
4. **`src/components/academy/ModuleCompletionChecklist.tsx`**:
   - Renders the end-of-lesson checklist and the compact sticky drawer with responsive actions.
5. **`src/components/academy/ModuleXXLayout.tsx` (Modules 01–24)**:
   - Purged of any legacy manual completion shortcuts. Connects activities and quizzes directly to the completion engine.
6. **`scripts/completion-engine-validation.ts`**:
   - Automated test suite validating all 7 acceptance criteria: anti-shortcut enforcement, reading guards, simulation physics validation, assessment grading, idempotency, cross-student security, and accessibility equality.
