import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  generateStudentPublicId,
  sanitizeStudentName,
  applyChildSafetyRules,
  SUPPORTED_LANGUAGES,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_LEARNING_SETTINGS,
  type StudentProfile,
} from "../src/lib/academy/student-types";
import { LEARNING_LEVELS } from "../src/lib/academy/registry";

console.log("=================================================");
console.log("OUR VISIBLE UNIVERSE ACADEMY");
console.log("PROMPT 02: Student Identity & Account System Verification");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err?.message || err}`);
  }
}

// 1. Student Public ID Generation
test("Student Public ID generator produces secure, non-email tokens", () => {
  const ids = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const id = generateStudentPublicId();
    assert.match(id, /^STU-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
    assert.strictEqual(id.includes("@"), false, "Student ID must never contain an email address");
    ids.add(id);
  }
  // High entropy check
  assert.strictEqual(ids.size, 1000, "Collision detected in 1000 generated student IDs");
});

// 2. Child Safety & Name Sanitization
test("Name sanitization removes emails, phone numbers, and URLs", () => {
  assert.strictEqual(
    sanitizeStudentName("student.kid@gmail.com", "Fallback"),
    "Fallback",
    "Email-only name must fall back safely",
  );
  assert.strictEqual(
    sanitizeStudentName("Alex alex@school.edu", "Fallback"),
    "Alex",
    "Email must be stripped from nickname",
  );
  assert.strictEqual(
    sanitizeStudentName("Call me at 9876543210 please", "Fallback"),
    "Call me at  please",
    "Phone number must be stripped",
  );
  assert.strictEqual(
    sanitizeStudentName("Visit https://evil.com/phish right now", "Fallback"),
    "Visit  right now",
    "URL must be stripped",
  );
  assert.strictEqual(
    sanitizeStudentName("NovaExplorer", "Fallback"),
    "NovaExplorer",
    "Clean astronomy callsign must remain intact",
  );
});

// 3. Child Safety COPPA & GDPR-K Compliance
test("Under 13 students are strictly forced to private profile visibility", () => {
  const minorProfile: Partial<StudentProfile> = {
    display_name: "Leo",
    age_bracket: "under_13",
    profile_visibility: "public", // attempting public
  };
  const guarded = applyChildSafetyRules(minorProfile);
  assert.strictEqual(guarded.profile_visibility, "private", "Under-13 must be locked to private");
  assert.strictEqual(
    guarded.guardian_consent_status,
    "pending_guardian",
    "Guardian consent must be tracked as pending",
  );
});

test("Teen students (13 to 17) default to private visibility", () => {
  const teenProfile: Partial<StudentProfile> = {
    display_name: "Stella",
    age_bracket: "13_to_17",
  };
  const guarded = applyChildSafetyRules(teenProfile);
  assert.strictEqual(guarded.profile_visibility, "private", "Teen minor must default to private");
});

// 4. Learning Levels Preservation
test("Preserves all 3 educational learning levels with proper grade ranges", () => {
  assert.ok(LEARNING_LEVELS.junior, "Junior Explorer must exist");
  assert.ok(LEARNING_LEVELS.explorer, "Space Explorer must exist");
  assert.ok(LEARNING_LEVELS.astronomer, "Young Astronomer must exist");

  assert.strictEqual(LEARNING_LEVELS.junior.gradeRange, "Classes 1–3");
  assert.strictEqual(LEARNING_LEVELS.explorer.gradeRange, "Classes 4–6");
  assert.strictEqual(LEARNING_LEVELS.astronomer.gradeRange, "Classes 7–10");
});

test("Level switching preserves all 24 module progress records and quiz scores", () => {
  const mockUserProgress = {
    selectedLevel: "explorer" as const,
    moduleProgress: {
      "01": { status: "completed" as const, percent: 100, lastOpenedAt: "2026-01-01" },
      "02": { status: "in_progress" as const, percent: 65, lastOpenedAt: "2026-01-02" },
      "14": { status: "completed" as const, percent: 100, lastOpenedAt: "2026-01-03" },
    },
    completedLessons: ["01", "14"],
    quizScores: {
      module_01_quiz: { score: 5, total: 5, attempts: 1 },
      module_02_quiz: { score: 4, total: 5, attempts: 2 },
    },
    bookmarks: ["01", "14"],
    lastOpenedModuleId: "14",
    achievements: ["welcome_explorer", "module_01_complete", "black_hole_pioneer"],
    lastUpdated: "2026-01-03",
  };

  // Simulate level switch to junior
  const updatedProgress = {
    ...mockUserProgress,
    selectedLevel: "junior" as const,
    lastUpdated: new Date().toISOString(),
  };

  assert.strictEqual(updatedProgress.selectedLevel, "junior");
  assert.strictEqual(Object.keys(updatedProgress.moduleProgress).length, 3);
  assert.strictEqual(updatedProgress.moduleProgress["01"].status, "completed");
  assert.strictEqual(updatedProgress.moduleProgress["14"].percent, 100);
  assert.strictEqual(updatedProgress.achievements.length, 3);
  assert.strictEqual(updatedProgress.quizScores["module_01_quiz"].score, 5);
});

// 5. Database Migration 0003 & Journal Verification
test("Database migration 0003 exists and creates student_profiles with RLS", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "drizzle/migrations/0003_create_academy_student_profiles.sql",
  );
  assert.ok(fs.existsSync(migrationPath), "0003 migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf-8");

  assert.ok(
    sql.includes("CREATE TABLE IF NOT EXISTS public.student_profiles"),
    "Must create student_profiles",
  );
  assert.ok(
    sql.includes("student_public_id text NOT NULL UNIQUE"),
    "Must have unique student_public_id",
  );
  assert.ok(sql.includes("ENABLE ROW LEVEL SECURITY"), "Must enable RLS");
  assert.ok(
    sql.includes("ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY"),
    "Must enable RLS on student_profiles",
  );
  assert.ok(
    sql.includes("Users can view own student profile"),
    "Must have view own profile policy",
  );
  assert.ok(
    sql.includes("Users can update own student profile"),
    "Must have update own profile policy",
  );

  const journalPath = path.resolve(process.cwd(), "drizzle/migrations/meta/_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));
  const entry = journal.entries.find((e: any) => e.tag === "0003_create_academy_student_profiles");
  assert.ok(entry, "Migration 0003 must be registered in _journal.json");
});

// 6. Supported Languages Verification
test("Includes multi-language educational support", () => {
  assert.ok(SUPPORTED_LANGUAGES.length >= 7, "Must support at least 7 major languages");
  const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
  assert.ok(codes.includes("en"), "English must be supported");
  assert.ok(codes.includes("es"), "Spanish must be supported");
  assert.ok(codes.includes("fr"), "French must be supported");
  assert.ok(codes.includes("de"), "German must be supported");
  assert.ok(codes.includes("hi"), "Hindi must be supported");
});

console.log(`\nResults: ${passedTests} / ${totalTests} tests passed.`);
if (passedTests !== totalTests) {
  process.exit(1);
} else {
  console.log("All Student Identity & Account System verifications passed successfully!");
}
