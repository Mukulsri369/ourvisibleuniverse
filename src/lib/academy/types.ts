export type LearningLevel = "junior" | "explorer" | "astronomer";

export interface LearningLevelInfo {
  id: LearningLevel;
  name: string;
  gradeRange: string;
  targetAudience: string;
  description: string;
  badge: string;
  color: string;
}

export type ModuleStatus = "not_started" | "in_progress" | "completed";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface ScientificSource {
  title: string;
  organization: string;
  url: string;
  note?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  correctAnswer?: number;
  correctAnswerIndex?: number;
  explanation: string;
  hint?: string;
  level?: string;
  difficulty?: string;
  [key: string]: unknown;
}

export interface GradeLevelContent {
  introHook: string;
  coreConcepts: string[];
  explanatoryText: string;
  depthNotes?: string;
  mathExplanation?: string;
  quizQuestions: QuizQuestion[];
  funFacts: string[];
}

export interface LessonContract {
  lessonId: string;
  moduleId: string;
  title: string;
  objectives: string[];
  gradeLevelContent: Record<LearningLevel, GradeLevelContent>;
  visualizationType:
    "cosmic-scale" | "orbit-sim" | "galaxy-3d" | "spectral-lab" | "gravitational-sandbox";
  interactions: string[];
  relatedConcepts: string[];
  completionCriteria: string;
  scientificSources: ScientificSource[];
}

export interface ModuleContract {
  id: string; // e.g. "01"
  slug: string; // e.g. "our-place-in-the-universe"
  number: number; // 1 to 24
  title: string;
  subtitle: string;
  description: string;
  stageId: number; // 1 to 6
  recommendedOrder: number;
  difficultyLevels: DifficultyLevel[];
  learningObjectives: string[];
  prerequisites: string[]; // module ids
  lessons?: LessonContract[];
  route: string; // e.g. "/learn?module=01" or direct route
  estimatedMinutes: number;
  visualAssets: {
    heroImage?: string;
    iconName: string;
    badgeColor: string;
  };
  scientificSources: ScientificSource[];
  status: "ready" | "coming_soon";
  version: string;
}

export interface StageContract {
  id: number; // 1 to 6
  title: string;
  subtitle: string;
  themeColor: string;
  accentGlow: string;
  spaceDestination: string;
  iconName: string;
  description: string;
  modules: ModuleContract[];
}

export interface UserProgress {
  selectedLevel: LearningLevel;
  moduleProgress: Record<
    string,
    {
      status: ModuleStatus;
      percent: number;
      percentComplete?: number;
      lastOpenedAt: string;
      completedAt?: string;
    }
  >;
  completedLessons: string[];
  quizScores: Record<string, { score: number; total: number; attempts: number }>;
  bookmarks: string[];
  lastOpenedModuleId: string | null;
  achievements: string[];
  lastUpdated: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface AcademySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  soundEffects: boolean;
  fontSize: "normal" | "large" | "extra-large";
}

// Loose shapes used by lesson content files.
export type SubLesson = Record<string, any>;
export type LessonModule = Record<string, any>;
