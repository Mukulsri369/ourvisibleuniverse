# Cosmic Learning Academy: Authoritative Secure Learning Database Architecture

**Document Reference:** `docs/academy-secure-learning-database.md`  
**Curriculum Scope:** 24 Modules Across 6 Celestial Stages  
**Database Dialect:** PostgreSQL 15+ with Row Level Security (RLS) & Cryptographic Verification

---

## 1. Architectural Design Summary

The **Cosmic Learning Academy** data infrastructure provides a tamper-proof, local-first, cloud-synchronized learning architecture. It strictly separates student interaction into three unambiguous tiers:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             LEARNER EXPERIENCE TIERS                             │
├────────────────────────────────┬──────────────────────────┬──────────────────────┤
│  State A: Client Progress      │ State B: Lab Evidence    │ State C: Authoritative│
│  (Unverified Local-First)      │ (Activity Telemetry)     │ (Server-Verified)    │
├────────────────────────────────┼──────────────────────────┼──────────────────────┤
│ • Scroll depth & bookmarks     │ • 3D orbit calculations  │ • Official completions│
│ • Local reading timers         │ • Transit light curves   │ • 6 Stage badges     │
│ • UI state & preferences       │ • HR diagram placements  │ • Master certificates│
│ • Offline action queueing      │ • Spectrograph readings  │ • Cryptographic HMAC │
│ • Free guest exploration       │ • Physics lab telemetry  │ • Strict audit log   │
└────────────────────────────────┴──────────────────────────┴──────────────────────┘
```

### Core Architectural Guarantees:

1. **Free Exploration Without Barriers:** Anonymous visitors can explore lessons and labs without an account. Local progress is saved in browser storage.
2. **Account Linking & No Duplicates:** Existing `Our Visible Universe` users sign in directly with their credentials—no separate account is ever created.
3. **Zero Client Authority on Credentials:** Browsers and mobile clients cannot write to `academy_verified_completions`, `academy_stage_achievements`, or `academy_certificates`. Only server-side RPC functions running with elevated `service_role` privileges can award passing scores, verified completion, stage badges, and certificates after evaluating canonical answers.
4. **Idempotent Operations:** Assessment submissions and completions utilize unique idempotency keys (`comp_{userId}_{moduleId}`) preventing double-granting or race-condition exploits.
5. **Offline Resiliency:** When a learner loses connectivity, telemetry and lesson progress are enqueued in `localStorage` and flushed automatically upon reconnection.

---

## 2. Complete Database Schema Definitions

The architecture defines 14 cohesive relational tables registered under PostgreSQL migration `0004_create_secure_learning_database.sql`:

### 2.1 Curriculum Hierarchy & Catalog Tables

- **`public.academy_courses`**: Top-level curriculum entity (`cosmic_journey`). Stores total stages (6) and total modules (24).
- **`public.academy_course_versions`**: Semantic versioning for curricula (e.g. `1.0.0`), storing curriculum metadata, active flags, and final examination passing threshold (80.0%).
- **`public.academy_modules`**: The authoritative registry of the 24 modules across 6 stages with titles, celestial coordinates, subtitles, and time estimates.
- **`public.academy_module_versions`**: Versioning per module, defining completion rules and minimum assessment score thresholds (80.0%).
- **`public.academy_lessons`**: Sublesson structure under each module with learning objectives and interactive visualizer assignments.

### 2.2 Learner State & Progression Tables

- **`public.student_profiles`**: Student callsign/display name, certificate display name, selected learning level (`junior`, `explorer`, `astronomer`), COPPA/GDPR-K child safety status, and public UUID (`STU-XXXXXX`).
- **`public.academy_enrollments`**: Course enrollment records referencing `auth.users(id)` and `academy_courses(id)`.
- **`public.academy_lesson_progress`**: High-frequency reading state, scroll depths (0–100%), active reading time in seconds, and bookmarks.
- **`public.academy_activity_evidence`**: Laboratory telemetry records storing parameters, calculated values, and timestamps from 3D simulations (e.g., Keplerian orbit eccentricity, transit depth, CMB temperature fluctuation).

### 2.3 Authoritative Verification & Credential Tables

- **`public.academy_assessment_attempts`**: Server-graded quiz records storing assigned question IDs, client duration, candidate answers, authoritative score, and pass/fail result.
- **`public.academy_verified_completions`**: Privileged table recording official module completion. Foreign keys point to the qualifying assessment attempt and validated activity evidence IDs.
- **`public.academy_stage_achievements`**: Progressive stage badges (Stages 1 through 6) awarded automatically when all 4 modules in a stage achieve verified completion.
- **`public.academy_certificate_eligibility`**: Tracks graduation state once all 24 modules and required stages are certified.
- **`public.academy_certificates`**: Official digital certificate record containing public certificate number (`OVU-YYYY-XXXXXX`), recipient name, learning level, final score, issue date, status (`active`/`revoked`), and SHA-256 HMAC verification hash.
- **`public.academy_audit_log`**: Comprehensive compliance log capturing actor ID, actor role, mutation action, entity ID, previous/new state, and idempotency key.

---

## 3. Migration Scripts & Rollback Procedures

### Forward Migration: `drizzle/migrations/0004_create_secure_learning_database.sql`

- Creates all 14 tables with strict `CHECK` constraints and `CASCADE`/`RESTRICT` foreign keys.
- Enables Row Level Security on every table.
- Provisions performance indexes for fast student lookups.
- Seeds the canonical `cosmic_journey` course and all 24 modules with initial lessons.
- Registered in `drizzle/migrations/meta/_journal.json` as index `4`.

### Rollback Procedure: `drizzle/migrations/0004_down_secure_learning_database.sql`

```sql
-- Safe Rollback Procedure: Drops newly added learning tables in reverse dependency order
DROP TABLE IF EXISTS public.academy_audit_log CASCADE;
DROP TABLE IF EXISTS public.academy_certificates CASCADE;
DROP TABLE IF EXISTS public.academy_certificate_eligibility CASCADE;
DROP TABLE IF EXISTS public.academy_stage_achievements CASCADE;
DROP TABLE IF EXISTS public.academy_verified_completions CASCADE;
DROP TABLE IF EXISTS public.academy_assessment_attempts CASCADE;
DROP TABLE IF EXISTS public.academy_activity_evidence CASCADE;
DROP TABLE IF EXISTS public.academy_lesson_progress CASCADE;
DROP TABLE IF EXISTS public.academy_enrollments CASCADE;
DROP TABLE IF EXISTS public.academy_lessons CASCADE;
DROP TABLE IF EXISTS public.academy_module_versions CASCADE;
DROP TABLE IF EXISTS public.academy_modules CASCADE;
DROP TABLE IF EXISTS public.academy_course_versions CASCADE;
DROP TABLE IF EXISTS public.academy_courses CASCADE;
```

---

## 4. Progress Management Integration

The UI layer interacts seamlessly via the standard `useAcademyProgress` hook in `src/lib/academy/progress.ts`:

1. **Local-First Fallback:** On client boot, cached progress from `localStorage` (`cosmic_academy_user_progress_v1`) provides instantaneous zero-latency rendering.
2. **Cloud Sync:** When a user signs in, `useAcademyProgress` queries `getAuthoritativeProgress` via TanStack Start server functions. Local and cloud states merge without overwriting newer progress.
3. **Offline Queue:** Unsent telemetry and reading markers are stored in `cosmic_academy_offline_queue_v1` and retried automatically when `window.navigator.onLine` fires.
4. **Authoritative Assessment Flow:**
   - Student answers knowledge check questions in `KnowledgeCheck.tsx`.
   - Client calls `submitAuthoritativeAssessment(moduleId, answers)`.
   - Server computes canonical score from authoritative answer keys.
   - If `percentage >= 80%`, the server awards verified completion and returns feedback.
   - UI updates state and displays celebration toast.

---

## 5. Authoritative Validation Logic

Server-side verification logic resides in `src/lib/academy/learning.server.ts`:

### Assessment Grading Algorithm:

1. Lookup canonical question bank for target module (`01` through `24`).
2. Evaluate submitted answer indices against correct answer indices.
3. Compute exact percentage score: $\text{score} = \left(\frac{N_{\text{correct}}}{N_{\text{total}}}\right) \times 100$.
4. Check threshold: $\text{passed} = (\text{percentage} \ge 80.0\%)$.
5. Insert attempt record into `public.academy_assessment_attempts`.
6. If passed:
   - Insert/upsert into `public.academy_verified_completions` with idempotency key.
   - Check if all 4 modules in the current stage are verified. If so, award stage achievement badge in `public.academy_stage_achievements`.
   - Check if all 24 modules are verified. If so, mark student eligible for final graduation certificate in `public.academy_certificate_eligibility`.
   - Record audit event in `public.academy_audit_log`.

### Tamper-Proof Cryptographic Certificate Verification:

```typescript
const payload = [
  certificateNumber,
  userId,
  studentPublicId,
  courseVersion,
  issueDate,
  finalScore.toFixed(2),
].join("::");

const verificationHash = crypto
  .createHmac("sha256", process.env.CERTIFICATE_HMAC_SECRET)
  .update(payload)
  .digest("hex");
```

---

## 6. Row Level Security (RLS) Policy Matrix

| Table Name                        |         Public / Anon          |          Authenticated Learner           | Privileged `service_role` |
| :-------------------------------- | :----------------------------: | :--------------------------------------: | :-----------------------: |
| `academy_courses`                 |             SELECT             |                  SELECT                  |            ALL            |
| `academy_course_versions`         |        SELECT (active)         |             SELECT (active)              |            ALL            |
| `academy_modules`                 |             SELECT             |                  SELECT                  |            ALL            |
| `academy_module_versions`         |        SELECT (active)         |             SELECT (active)              |            ALL            |
| `academy_lessons`                 |             SELECT             |                  SELECT                  |            ALL            |
| `student_profiles`                |      SELECT (public only)      |       SELECT / UPDATE (own record)       |            ALL            |
| `academy_enrollments`             |              None              |     SELECT / INSERT (own `user_id`)      |            ALL            |
| `academy_lesson_progress`         |              None              | SELECT / INSERT / UPDATE (own `user_id`) |            ALL            |
| `academy_activity_evidence`       |              None              |     SELECT / INSERT (own `user_id`)      |            ALL            |
| `academy_assessment_attempts`     |              None              |          SELECT (own `user_id`)          |       INSERT / ALL        |
| `academy_verified_completions`    |              None              |          SELECT (own `user_id`)          |   INSERT / UPDATE / ALL   |
| `academy_stage_achievements`      |              None              |          SELECT (own `user_id`)          |   INSERT / UPDATE / ALL   |
| `academy_certificate_eligibility` |              None              |          SELECT (own `user_id`)          |   INSERT / UPDATE / ALL   |
| `academy_certificates`            | SELECT (active by number/hash) |           SELECT (own records)           |   INSERT / UPDATE / ALL   |
| `academy_audit_log`               |              None              |  SELECT (where `actor_id = auth.uid()`)  |       INSERT / ALL        |

---

## 7. Verification Test Plan

```
[Test Case TC-01] Free Guest Exploration
- Action: Unauthenticated learner opens Module 01, reads lesson, completes simulation.
- Expected: Progress saved in localStorage; no authentication prompt blocks reading.

[Test Case TC-02] Student Account Registration
- Action: Learner navigates to /auth?role=student, creates account.
- Expected: student_profiles row generated with unique public ID (STU-XXXXXX); guest progress offered for sync.

[Test Case TC-03] Client-Side Tamper Prevention
- Action: Malicious user executes direct Supabase client call:
  supabase.from('academy_verified_completions').insert({ module_id: '01', user_id: auth.uid() })
- Expected: Rejected with HTTP 403 / RLS policy violation. Only service_role can write.

[Test Case TC-04] Authoritative Server Grading
- Action: Learner submits quiz answers with 85% score via submitAssessmentForGrading server function.
- Expected: Attempt created; score calculated on server; verified completion awarded; audit logged.

[Test Case TC-05] Progressive Stage Badge Award
- Action: Learner achieves verified completion on Modules 01, 02, 03, and 04.
- Expected: Stage 1 badge ("Cosmic Novice / Observational Pioneer") automatically awarded in academy_stage_achievements.

[Test Case TC-06] Certificate Eligibility
- Action: Learner completes all 24 modules across all 6 stages.
- Expected: academy_certificate_eligibility marked true; eligible for verified graduation examination.

[Test Case TC-07] Public Certificate Verification
- Action: External viewer visits certificate verification URL using certificate number or SHA-256 hash.
- Expected: Certificate details verified if active; returns 404 or revoked badge if invalid.
```
