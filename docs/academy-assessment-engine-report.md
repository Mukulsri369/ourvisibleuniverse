# Cosmic Learning Academy: Secure Assessment Engine Architecture & Security Report

**Document Reference:** `docs/academy-assessment-engine-report.md`  
**System Milestone:** Prompt 04 — Centralized Secure Assessment Engine  
**Target Platform:** 24-Module Cosmic Learning Academy + Cosmic Explorer Final Examination  
**Security Tier:** Server-Authoritative Grading, Zero-Knowledge Client Payloads, Anti-Replay Idempotency

---

## 1. Executive Summary

Prior to this implementation, the 24 modules of Cosmic Learning Academy utilized disparate client-evaluated quiz components with correct answer indices and scientific explanations directly compiled into client-side JavaScript bundles. Furthermore, several module layouts invoked client progress callbacks (`onUpdateModuleProgress(moduleId, 100, "completed")`) regardless of actual quiz performance, enabling browser-controlled claims of module mastery.

**Prompt 04 establishes a centralized, server-authoritative assessment engine:**

1. **Server-Side Question Bank (`src/lib/academy/assessment-bank.server.ts`)**: Normalized questions for all 24 modules and the cross-stage Capstone Final Examination.
2. **Zero-Knowledge Question Delivery (`startAssessmentAttempt`)**: Clients receive only question text and shuffled/ordered options. Correct answers and scientific explanations are strictly absent.
3. **Server-Side Grading & Verification (`src/lib/academy/assessment.server.ts`)**: Scores are calculated exclusively on the backend from candidate choices. Official verified completions and progressive stage badges are issued only when server criteria are satisfied.
4. **Standardized Assessment Policies**:
   - **Default Module Passing Threshold:** **70.0%**.
   - **Final Course Certification Threshold:** **80.0%**.
   - **Practice Mode vs. Official Assessment Mode:** Practice drills provide immediate learning feedback but can never issue verified completions or stage badges.
5. **Universal Component Upgrade (`<UnifiedAssessmentEngine />` & `<KnowledgeCheck />`)**: All 24 modules now consume an accessible, keyboard-navigable assessment engine supporting level adaptation across Junior Explorer, Space Explorer, and Young Astronomer.

---

## 2. Audit & Verification of Known Issues

| Known Vulnerability / Flaw                 | Pre-Audit Vulnerability State                                                                                                                         | Remediated State in Prompt 04                                                                                                                                                               |
| :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Unconditional Module Completion**        | Multiple module layouts called `onUpdateModuleProgress(id, 100, "completed")` upon finishing the quiz regardless of whether the score was 0% or 100%. | Module completion is now gated behind server verification. Client callbacks cannot mark `isVerified = true`. Only server-evaluated attempts with score $\ge 70\%$ create verified records.  |
| **Exposed Answers in Bundled Code**        | `MODULE_XX_QUIZ` definitions contained `correctIndex` and `explanation` in client-accessible arrays.                                                  | Questions are held in `assessment-bank.server.ts`. When `startAssessmentAttempt` is invoked, correct answers and explanations are stripped before network serialization.                    |
| **Inconsistent Grading Rules**             | Modules used varying passing scores (some required 100%, some 80%, some had no score check).                                                          | Standardized policy: 70% for all 24 module knowledge checks, 80% for the Capstone Final Examination.                                                                                        |
| **Inconsistent Quiz Component Interfaces** | Different layouts passed `onComplete`, `onCompleteQuiz`, or `onFinishQuiz`, with conflicting prop signatures.                                         | `<UnifiedAssessmentEngine />` and upgraded `<KnowledgeCheck />` handle all legacy signatures while routing submissions through secure server functions.                                     |
| **Browser-Claimed Certification**          | Client code could forge completion payloads to bypass assessments.                                                                                    | Database Row Level Security (RLS) strictly disallows student inserts to `academy_verified_completions`. Submissions are authenticated, timestamped, rate-limited, and graded on the server. |

---

## 3. Question Data Model

Every question in the canonical bank conforms to the following immutable structure:

```typescript
export interface CanonicalAssessmentQuestion {
  id: string; // Immutable ID, e.g. "q_01_exp_01"
  moduleId: string; // Module "01" through "24", or "exam"
  level: LearningLevel; // "junior" | "explorer" | "astronomer"
  difficulty: QuestionDifficulty; // "introductory" | "intermediate" | "advanced"
  type: QuestionType; // "single_choice" | "multi_choice" | "true_false"
  questionText: string; // Scientifically precise astronomical question
  options: string[]; // Approved choices
  correctAnswer: number | number[]; // SERVER-ONLY: Index of correct option(s)
  explanation: string; // SERVER-ONLY: Returned only in post-grading feedback
  sourceReference: string; // Primary astronomical reference (IAU, NASA ADS, Gaia, SDSS)
  version: string; // Semantic version, e.g. "1.0.0"
  isActive: boolean; // Administrative toggle
  relevantLessonId?: string; // Sublesson linked for remediation review
}
```

### Client-Facing Public Question Projection:

When sent to the browser via `startAssessmentAttempt`, the object is sanitized to `ClientAssessmentQuestion`:

```typescript
{
  id: "q_01_exp_01",
  moduleId: "01",
  level: "explorer",
  difficulty: "intermediate",
  type: "single_choice",
  questionText: "In which spiral arm of the Milky Way galaxy does our Solar System reside?",
  options: ["Perseus Arm", "Scutum-Centaurus Arm", "Orion-Cygnus Arm", "Norma Arm"],
  relevantLessonId: "01-core"
  // correctAnswer, correctIndex, explanation, sourceReference ARE COMPLETELY OMITTED
}
```

---

## 4. Authoritative Grading Workflow

```
┌──────────────┐                  ┌───────────────────────────────┐                  ┌───────────────────────────┐
│ Student UI   │                  │ TanStack Start Server Fn      │                  │ PostgreSQL / Supabase RLS │
└──────┬───────┘                  └──────────────┬────────────────┘                  └─────────────┬─────────────┘
       │                                         │                                                 │
       │ 1. startAssessmentAttempt(moduleId)     │                                                 │
       │────────────────────────────────────────>│                                                 │
       │                                         │ 2. Select questions & strip answers             │
       │                                         │    from assessment-bank.server.ts               │
       │ 3. Return sanitized questions           │                                                 │
       │<────────────────────────────────────────│                                                 │
       │                                         │                                                 │
       │ 4. Learner answers questions            │                                                 │
       │    (Full keyboard & ARIA radiogroup)    │                                                 │
       │                                         │                                                 │
       │ 5. submitAssessmentAttempt(answers)     │                                                 │
       │────────────────────────────────────────>│                                                 │
       │                                         │ 6. Rate-limit & Replay check                    │
       │                                         │ 7. Calculate canonical score                    │
       │                                         │ 8. Record in academy_assessment_attempts        │
       │                                         │────────────────────────────────────────────────>│
       │                                         │                                                 │
       │                                         │ 9. If passed (>= 70%) & official:               │
       │                                         │    - Insert academy_verified_completions        │
       │                                         │    - Check stage completion (4/4 modules)       │
       │                                         │    - Award academy_stage_achievements           │
       │                                         │    - Audit log event                            │
       │                                         │────────────────────────────────────────────────>│
       │ 10. Return score, percentage, feedback, │                                                 │
       │     explanations & review lessons       │                                                 │
       │<────────────────────────────────────────│                                                 │
```

---

## 5. Security & Anti-Abuse Measures

1. **Replay Protection**:
   Submissions include an `idempotencyKey` derived from `attemptId`. If the same submission key is received twice, the engine retrieves the previously graded attempt from `academy_assessment_attempts` and returns the existing score without double-granting completions or stage badges.
2. **Rate Limiting & Minimum Elapsed Time**:
   Submissions completed faster than the configured minimum threshold (`DEFAULT_ASSESSMENT_POLICY.minDurationSeconds = 5s`) are rejected to deter automated bot scripts.
3. **Session Level Lock**:
   A student's assessment level is locked at attempt generation (`activeLevelRef.current = currentLevel`). The student cannot switch levels mid-attempt to mix questions.
4. **Practice Mode Isolation**:
   Interactive practice drills run with `mode = "practice"`. Even with 100% scores, practice mode is strictly prohibited from mutating `academy_verified_completions` or `academy_stage_achievements`.

---

## 6. Accessibility (a11y) Implementation

The `<UnifiedAssessmentEngine />` component adheres to WCAG 2.1 AA specifications:

- **Radiogroup Semantics**: Option containers implement `role="radiogroup"` with child buttons having `role="radio"` and explicit `aria-checked` states.
- **Keyboard Navigation**: Learners can select answers via Space or Enter keys, with clear high-contrast focus rings (`focus-within:border-cyan-500/50`).
- **Screen Reader Live Regions**: Post-grading feedback uses `aria-live="polite"` so screen-reader users hear their score and scientific explanations without focus disruption.
- **Zero-Pill Visual Constitution**: The component avoids cluttered pill tags, using clean astronomical gradients, crisp borders (`border-white/10`), and legible typographic hierarchy.

---

## 7. Verification Test Suite Results

The automated test script (`scripts/assessment-engine-validation.ts`, runnable via `npm run test:assessment`) verified all required acceptance criteria:

```
=================================================
OUR VISIBLE UNIVERSE ACADEMY
PROMPT 04: Secure Assessment Engine Verification
=================================================
  ✓ All 24 modules possess canonical questions across learning levels
  ✓ Client questions payload strictly omits correctAnswer and explanation
  ✓ Final Capstone Examination spans all 6 stages without leaking answers
  ✓ A failed assessment (< 70%) does not create a pass
  ✓ A qualifying assessment (>= 70%) creates a verified pass
  ✓ Practice mode questions must never award official verified certificate credentials
  ✓ Replayed assessment submission returns previous attempt and blocks duplicate awards
  ✓ Assessment policy conforms to 70% module and 80% final exam thresholds

=================================================
Summary: 8 / 8 Assessment Engine Tests Passed
=================================================
```
