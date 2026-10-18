/**
 * Canonical Server-Side Assessment Question Bank
 * Scope: All 24 Modules of Cosmic Learning Academy + Final Capstone Examination.
 * SECURITY NOTICE: Stored strictly on the backend. Never exposed to browser bundles.
 */

import type { LearningLevel } from "./types";
import type {
  CanonicalAssessmentQuestion,
  ClientAssessmentQuestion,
  QuestionDifficulty,
} from "./assessment-types";

// Ingest canonical lesson question sets
import { MODULE_01_LESSON } from "@/lib/academy/lessons/module-01-our-place";
import { MODULE_02_QUIZ } from "@/lib/academy/lessons/module-02-night-sky";
import { MODULE_03_QUIZ } from "@/lib/academy/lessons/module-03-cosmic-scale";
import { MODULE_04_QUIZ } from "@/lib/academy/lessons/module-04-light-time";
import { MODULE_05_QUIZ } from "@/lib/academy/lessons/module-05-earth-moon";
import { MODULE_06_QUIZ } from "@/lib/academy/lessons/module-06-solar-system";
import { MODULE_07_LESSON, MODULE_07_QUIZ } from "@/lib/academy/lessons/module-07-the-sun";
import { MODULE_08_LESSON } from "@/lib/academy/lessons/module-08-gravity-orbits";
import { MODULE_09_LESSON } from "@/lib/academy/lessons/module-09-stars";
import { MODULE_10_QUIZ_QUESTIONS } from "@/lib/academy/lessons/module-10-stellar-evolution";
import { MODULE_11_QUIZ_QUESTIONS } from "@/lib/academy/lessons/module-11-nebulae";
import { MODULE_12_QUIZ } from "@/lib/academy/lessons/module-12-exoplanets";
import { MODULE_13_QUIZ_QUESTIONS } from "@/lib/academy/lessons/module-13-galaxies";
import { MODULE_14_QUIZ } from "@/lib/academy/lessons/module-14-black-holes";
import { MODULE_15_QUIZ } from "@/lib/academy/lessons/module-15-cosmic-web";
import { MODULE_16_QUIZ } from "@/lib/academy/lessons/module-16-dark-matter-energy";
import { MODULE_17_QUIZ } from "@/lib/academy/lessons/module-17-big-bang";
import { MODULE_18_QUIZ } from "@/lib/academy/lessons/module-18-expanding-universe";
import { MODULE_19_QUIZ } from "@/lib/academy/lessons/module-19-history-cosmology";
import { MODULE_20_QUIZ } from "@/lib/academy/lessons/module-20-future-universe";
import { MODULE_21_QUIZ } from "@/lib/academy/lessons/module-21-telescopes";
import { MODULE_22_QUIZ } from "@/lib/academy/lessons/module-22-space-missions";
import { MODULE_23_QUIZ } from "@/lib/academy/lessons/module-23-astrobiology";
import { MODULE_24_QUIZ } from "@/lib/academy/lessons/module-24-cosmic-lab";

function normalizeRawQuestion(
  raw: any,
  moduleId: string,
  level: LearningLevel,
  index: number,
  fallbackDifficulty: QuestionDifficulty = "intermediate",
): CanonicalAssessmentQuestion {
  const id = raw.id || `q_${moduleId.padStart(2, "0")}_${level.slice(0, 3)}_${index + 1}`;
  const questionText =
    raw.question || raw.questionText || raw.title || "Astronomy Concept Question";
  const options = Array.isArray(raw.options)
    ? raw.options
    : ["Option A", "Option B", "Option C", "Option D"];

  let correctAnswer: number = 0;
  if (typeof raw.correctIndex === "number") {
    correctAnswer = raw.correctIndex;
  } else if (typeof raw.correctAnswerIndex === "number") {
    correctAnswer = raw.correctAnswerIndex;
  } else if (typeof raw.correctAnswer === "number") {
    correctAnswer = raw.correctAnswer;
  }

  // Ensure answer bounds
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    correctAnswer = 0;
  }

  const explanation =
    raw.explanation ||
    "Physical observation and peer-reviewed astrophysical principles verify this finding.";

  const sourceReference =
    raw.sourceReference ||
    raw.source ||
    "NASA Astrophysics Data System / International Astronomical Union";

  return {
    id,
    moduleId: moduleId.padStart(2, "0"),
    level,
    difficulty: raw.difficulty || fallbackDifficulty,
    type: raw.type || (raw.options?.length === 2 ? "true_false" : "single_choice"),
    questionText,
    options,
    correctAnswer,
    explanation,
    sourceReference,
    version: raw.version || "1.0.0",
    isActive: raw.isActive ?? true,
    relevantLessonId: raw.relevantLessonId || `${moduleId.padStart(2, "0")}-core`,
  };
}

/**
 * Registry of canonical questions for all 24 modules, categorized by learning level.
 */
function buildCanonicalRepository(): Record<
  string,
  Record<LearningLevel, CanonicalAssessmentQuestion[]>
> {
  const repo: Record<string, Record<LearningLevel, CanonicalAssessmentQuestion[]>> = {};

  // Initialize all 24 modules
  for (let m = 1; m <= 24; m++) {
    const modId = String(m).padStart(2, "0");
    repo[modId] = {
      junior: [],
      explorer: [],
      astronomer: [],
    };
  }

  // -------------------------------------------------------------
  // MODULE 01: Our Place in the Universe
  // -------------------------------------------------------------
  const mod01Grade = (MODULE_01_LESSON as any)?.gradeLevelContent || {};
  const m01Junior = mod01Grade.junior?.quizQuestions || [];
  const m01Explorer = mod01Grade.explorer?.quizQuestions || [];
  const m01Astronomer = mod01Grade.astronomer?.quizQuestions || [];

  repo["01"].junior = m01Junior.map((q: any, i: number) =>
    normalizeRawQuestion(q, "01", "junior", i, "introductory"),
  );
  repo["01"].explorer = m01Explorer.map((q: any, i: number) =>
    normalizeRawQuestion(q, "01", "explorer", i, "intermediate"),
  );
  repo["01"].astronomer = m01Astronomer.map((q: any, i: number) =>
    normalizeRawQuestion(q, "01", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 02: Night Sky & Constellations
  // -------------------------------------------------------------
  const m02Base = MODULE_02_QUIZ as any[];
  repo["02"].junior = m02Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "02", "junior", i, "introductory"));
  repo["02"].explorer = m02Base.map((q, i) =>
    normalizeRawQuestion(q, "02", "explorer", i, "intermediate"),
  );
  repo["02"].astronomer = m02Base.map((q, i) =>
    normalizeRawQuestion(q, "02", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 03: Cosmic Distances & Scale
  // -------------------------------------------------------------
  const m03Base = MODULE_03_QUIZ as any[];
  repo["03"].junior = m03Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "03", "junior", i, "introductory"));
  repo["03"].explorer = m03Base.map((q, i) =>
    normalizeRawQuestion(q, "03", "explorer", i, "intermediate"),
  );
  repo["03"].astronomer = m03Base.map((q, i) =>
    normalizeRawQuestion(q, "03", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 04: Light, Time & Observation
  // -------------------------------------------------------------
  const m04Base = MODULE_04_QUIZ as any[];
  repo["04"].junior = m04Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "04", "junior", i, "introductory"));
  repo["04"].explorer = m04Base.map((q, i) =>
    normalizeRawQuestion(q, "04", "explorer", i, "intermediate"),
  );
  repo["04"].astronomer = m04Base.map((q, i) =>
    normalizeRawQuestion(q, "04", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 05: Earth, Moon & Seasons
  // -------------------------------------------------------------
  const m05Base = MODULE_05_QUIZ as any[];
  repo["05"].junior = m05Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "05", "junior", i, "introductory"));
  repo["05"].explorer = m05Base.map((q, i) =>
    normalizeRawQuestion(q, "05", "explorer", i, "intermediate"),
  );
  repo["05"].astronomer = m05Base.map((q, i) =>
    normalizeRawQuestion(q, "05", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 06: The Solar System Worlds
  // -------------------------------------------------------------
  const m06Record = MODULE_06_QUIZ as Record<LearningLevel, any[]>;
  repo["06"].junior = (m06Record.junior || []).map((q, i) =>
    normalizeRawQuestion(q, "06", "junior", i, "introductory"),
  );
  repo["06"].explorer = (m06Record.explorer || []).map((q, i) =>
    normalizeRawQuestion(q, "06", "explorer", i, "intermediate"),
  );
  repo["06"].astronomer = (m06Record.astronomer || []).map((q, i) =>
    normalizeRawQuestion(q, "06", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 07: The Sun: Our Living Star
  // -------------------------------------------------------------
  const m07Grade = (MODULE_07_LESSON as any)?.gradeLevelContent || {};
  const m07Junior = m07Grade.Beginner?.quizQuestions || MODULE_07_QUIZ?.slice(0, 3) || [];
  const m07Explorer = m07Grade.Intermediate?.quizQuestions || MODULE_07_QUIZ || [];
  const m07Astronomer = m07Grade.Advanced?.quizQuestions || MODULE_07_QUIZ || [];

  repo["07"].junior = m07Junior.map((q: any, i: number) =>
    normalizeRawQuestion(q, "07", "junior", i, "introductory"),
  );
  repo["07"].explorer = m07Explorer.map((q: any, i: number) =>
    normalizeRawQuestion(q, "07", "explorer", i, "intermediate"),
  );
  repo["07"].astronomer = m07Astronomer.map((q: any, i: number) =>
    normalizeRawQuestion(q, "07", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 08: Gravity & Orbital Mechanics
  // -------------------------------------------------------------
  const m08Grade = (MODULE_08_LESSON as any)?.gradeLevelContent || {};
  repo["08"].junior = (m08Grade.junior?.quizQuestions || []).map((q: any, i: number) =>
    normalizeRawQuestion(q, "08", "junior", i, "introductory"),
  );
  repo["08"].explorer = (m08Grade.explorer?.quizQuestions || []).map((q: any, i: number) =>
    normalizeRawQuestion(q, "08", "explorer", i, "intermediate"),
  );
  repo["08"].astronomer = (m08Grade.astronomer?.quizQuestions || []).map((q: any, i: number) =>
    normalizeRawQuestion(q, "08", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 09: Stars & How They Work
  // -------------------------------------------------------------
  const m09Grade = (MODULE_09_LESSON as any)?.gradeLevelContent || {};
  repo["09"].junior = (m09Grade.junior?.quizQuestions || []).map((q: any, i: number) =>
    normalizeRawQuestion(q, "09", "junior", i, "introductory"),
  );
  repo["09"].explorer = (m09Grade.explorer?.quizQuestions || []).map((q: any, i: number) =>
    normalizeRawQuestion(q, "09", "explorer", i, "intermediate"),
  );
  repo["09"].astronomer = (m09Grade.astronomer?.quizQuestions || []).map((q: any, i: number) =>
    normalizeRawQuestion(q, "09", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 10: Stellar Evolution & Death
  // -------------------------------------------------------------
  const m10Base = MODULE_10_QUIZ_QUESTIONS as any[];
  repo["10"].junior = m10Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "10", "junior", i, "introductory"));
  repo["10"].explorer = m10Base.map((q, i) =>
    normalizeRawQuestion(q, "10", "explorer", i, "intermediate"),
  );
  repo["10"].astronomer = m10Base.map((q, i) =>
    normalizeRawQuestion(q, "10", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 11: Nebulae & Star Nurseries
  // -------------------------------------------------------------
  const m11Base = MODULE_11_QUIZ_QUESTIONS as any[];
  repo["11"].junior = m11Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "11", "junior", i, "introductory"));
  repo["11"].explorer = m11Base.map((q, i) =>
    normalizeRawQuestion(q, "11", "explorer", i, "intermediate"),
  );
  repo["11"].astronomer = m11Base.map((q, i) =>
    normalizeRawQuestion(q, "11", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 12: Exoplanets & Alien Worlds
  // -------------------------------------------------------------
  const m12Base = MODULE_12_QUIZ as any[];
  repo["12"].junior = m12Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "12", "junior", i, "introductory"));
  repo["12"].explorer = m12Base.map((q, i) =>
    normalizeRawQuestion(q, "12", "explorer", i, "intermediate"),
  );
  repo["12"].astronomer = m12Base.map((q, i) =>
    normalizeRawQuestion(q, "12", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 13: Galaxies & the Milky Way
  // -------------------------------------------------------------
  const m13Record = MODULE_13_QUIZ_QUESTIONS as any;
  const m13Jr = m13Record?.junior || m13Record?.explorer?.slice(0, 3) || [];
  const m13Exp = m13Record?.explorer || m13Record || [];
  const m13Ast = m13Record?.astronomer || m13Record || [];

  repo["13"].junior = m13Jr.map((q: any, i: number) =>
    normalizeRawQuestion(q, "13", "junior", i, "introductory"),
  );
  repo["13"].explorer = m13Exp.map((q: any, i: number) =>
    normalizeRawQuestion(q, "13", "explorer", i, "intermediate"),
  );
  repo["13"].astronomer = m13Ast.map((q: any, i: number) =>
    normalizeRawQuestion(q, "13", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 14: Black Holes & Extreme Objects
  // -------------------------------------------------------------
  const m14Base = MODULE_14_QUIZ as any[];
  repo["14"].junior = m14Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "14", "junior", i, "introductory"));
  repo["14"].explorer = m14Base.map((q, i) =>
    normalizeRawQuestion(q, "14", "explorer", i, "intermediate"),
  );
  repo["14"].astronomer = m14Base.map((q, i) =>
    normalizeRawQuestion(q, "14", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 15: The Cosmic Web & Large-Scale Structure
  // -------------------------------------------------------------
  const m15Base = MODULE_15_QUIZ as any[];
  repo["15"].junior = m15Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "15", "junior", i, "introductory"));
  repo["15"].explorer = m15Base.map((q, i) =>
    normalizeRawQuestion(q, "15", "explorer", i, "intermediate"),
  );
  repo["15"].astronomer = m15Base.map((q, i) =>
    normalizeRawQuestion(q, "15", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 16: Dark Matter & Dark Energy
  // -------------------------------------------------------------
  const m16Base = MODULE_16_QUIZ as any[];
  repo["16"].junior = m16Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "16", "junior", i, "introductory"));
  repo["16"].explorer = m16Base.map((q, i) =>
    normalizeRawQuestion(q, "16", "explorer", i, "intermediate"),
  );
  repo["16"].astronomer = m16Base.map((q, i) =>
    normalizeRawQuestion(q, "16", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 17: The Big Bang & Early Cosmos
  // -------------------------------------------------------------
  const m17Base = MODULE_17_QUIZ as any[];
  repo["17"].junior = m17Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "17", "junior", i, "introductory"));
  repo["17"].explorer = m17Base.map((q, i) =>
    normalizeRawQuestion(q, "17", "explorer", i, "intermediate"),
  );
  repo["17"].astronomer = m17Base.map((q, i) =>
    normalizeRawQuestion(q, "17", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 18: The Expanding Universe & Redshift
  // -------------------------------------------------------------
  const m18Base = MODULE_18_QUIZ as any[];
  repo["18"].junior = m18Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "18", "junior", i, "introductory"));
  repo["18"].explorer = m18Base.map((q, i) =>
    normalizeRawQuestion(q, "18", "explorer", i, "intermediate"),
  );
  repo["18"].astronomer = m18Base.map((q, i) =>
    normalizeRawQuestion(q, "18", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 19: History of Human Cosmology
  // -------------------------------------------------------------
  const m19Base = MODULE_19_QUIZ as any[];
  repo["19"].junior = m19Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "19", "junior", i, "introductory"));
  repo["19"].explorer = m19Base.map((q, i) =>
    normalizeRawQuestion(q, "19", "explorer", i, "intermediate"),
  );
  repo["19"].astronomer = m19Base.map((q, i) =>
    normalizeRawQuestion(q, "19", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 20: The Future of the Universe
  // -------------------------------------------------------------
  const m20Base = MODULE_20_QUIZ as any[];
  repo["20"].junior = m20Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "20", "junior", i, "introductory"));
  repo["20"].explorer = m20Base.map((q, i) =>
    normalizeRawQuestion(q, "20", "explorer", i, "intermediate"),
  );
  repo["20"].astronomer = m20Base.map((q, i) =>
    normalizeRawQuestion(q, "20", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 21: Telescopes & Astronomical Observation
  // -------------------------------------------------------------
  const m21Base = MODULE_21_QUIZ as any[];
  repo["21"].junior = m21Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "21", "junior", i, "introductory"));
  repo["21"].explorer = m21Base.map((q, i) =>
    normalizeRawQuestion(q, "21", "explorer", i, "intermediate"),
  );
  repo["21"].astronomer = m21Base.map((q, i) =>
    normalizeRawQuestion(q, "21", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 22: Space Missions & Planetary Exploration
  // -------------------------------------------------------------
  const m22Base = MODULE_22_QUIZ as any[];
  repo["22"].junior = m22Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "22", "junior", i, "introductory"));
  repo["22"].explorer = m22Base.map((q, i) =>
    normalizeRawQuestion(q, "22", "explorer", i, "intermediate"),
  );
  repo["22"].astronomer = m22Base.map((q, i) =>
    normalizeRawQuestion(q, "22", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 23: Astrobiology & The Search for Life
  // -------------------------------------------------------------
  const m23Base = MODULE_23_QUIZ as any[];
  repo["23"].junior = m23Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "23", "junior", i, "introductory"));
  repo["23"].explorer = m23Base.map((q, i) =>
    normalizeRawQuestion(q, "23", "explorer", i, "intermediate"),
  );
  repo["23"].astronomer = m23Base.map((q, i) =>
    normalizeRawQuestion(q, "23", "astronomer", i, "advanced"),
  );

  // -------------------------------------------------------------
  // MODULE 24: The Cosmic Laboratory Capstone
  // -------------------------------------------------------------
  const m24Base = MODULE_24_QUIZ as any[];
  repo["24"].junior = m24Base
    .slice(0, 3)
    .map((q, i) => normalizeRawQuestion(q, "24", "junior", i, "introductory"));
  repo["24"].explorer = m24Base.map((q, i) =>
    normalizeRawQuestion(q, "24", "explorer", i, "intermediate"),
  );
  repo["24"].astronomer = m24Base.map((q, i) =>
    normalizeRawQuestion(q, "24", "astronomer", i, "advanced"),
  );

  return repo;
}

// Global initialized cache
let CANONICAL_REPO: Record<string, Record<LearningLevel, CanonicalAssessmentQuestion[]>> | null =
  null;

function getRepo(): Record<string, Record<LearningLevel, CanonicalAssessmentQuestion[]>> {
  if (!CANONICAL_REPO) {
    CANONICAL_REPO = buildCanonicalRepository();
  }
  return CANONICAL_REPO;
}

/**
 * Returns full canonical question definitions (with correct answers) for server-side grading.
 */
export function getCanonicalQuestionsForModule(
  moduleId: string,
  level: LearningLevel = "explorer",
): CanonicalAssessmentQuestion[] {
  const formattedModId = moduleId.padStart(2, "0");
  const repo = getRepo();
  const moduleQuestions = repo[formattedModId];
  if (!moduleQuestions) {
    return [];
  }

  const levelQuestions = moduleQuestions[level] || [];
  if (levelQuestions.length > 0) {
    return levelQuestions;
  }

  // Fallback to explorer if current level questions are empty
  return moduleQuestions.explorer || [];
}

/**
 * Strips correct answers, explanations, and grading keys before sending to student client.
 */
export function getClientQuestionsForModule(
  moduleId: string,
  level: LearningLevel = "explorer",
): ClientAssessmentQuestion[] {
  const canonical = getCanonicalQuestionsForModule(moduleId, level);
  return canonical.map((q) => ({
    id: q.id,
    moduleId: q.moduleId,
    level: q.level,
    difficulty: q.difficulty,
    type: q.type,
    questionText: q.questionText,
    options: q.options,
    relevantLessonId: q.relevantLessonId,
    sourceReference: q.sourceReference,
  }));
}

/**
 * Returns comprehensive Final Capstone Examination questions spanning all 6 celestial stages.
 */
export function getFinalExamQuestions(
  level: LearningLevel = "explorer",
): CanonicalAssessmentQuestion[] {
  const repo = getRepo();
  const examQuestions: CanonicalAssessmentQuestion[] = [];

  // Pick 2 signature questions from key modules across all 6 stages
  // Stage 1 (Mod 01, 04), Stage 2 (Mod 06, 08), Stage 3 (Mod 09, 12), Stage 4 (Mod 14, 16), Stage 5 (Mod 17, 18), Stage 6 (Mod 21, 24)
  const milestoneModules = ["01", "04", "06", "08", "09", "12", "14", "16", "17", "18", "21", "24"];

  for (const modId of milestoneModules) {
    const list = repo[modId]?.[level] || repo[modId]?.explorer || [];
    if (list.length > 0) {
      examQuestions.push(list[0]);
    }
  }

  return examQuestions;
}

export function getClientFinalExamQuestions(
  level: LearningLevel = "explorer",
): ClientAssessmentQuestion[] {
  return getFinalExamQuestions(level).map((q) => ({
    id: q.id,
    moduleId: "exam",
    level: q.level,
    difficulty: q.difficulty,
    type: q.type,
    questionText: q.questionText,
    options: q.options,
    relevantLessonId: q.relevantLessonId,
    sourceReference: q.sourceReference,
  }));
}
