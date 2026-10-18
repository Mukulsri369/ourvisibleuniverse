/**
 * COSMOS LessonContentProvider
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Structured Lesson Content Layer
 *
 * Ingests approved module lesson materials and transforms them into
 * strictly typed, ordered NarrationSegments with phonetic pronunciation
 * and 3D visualization linkages.
 */

import type { LearningLevel } from "../academy/types";
import { ACADEMY_MODULES } from "../academy/registry";
import { MODULE_01_SUBLESSONS } from "../academy/lessons/module-01-our-place";
import { MODULE_14_SUBLESSONS, BLACK_HOLE_PRESETS } from "../academy/lessons/module-14-black-holes";
import { generateSpokenText, inferEpistemicStatus } from "./phonetics";
import type {
  CosmosLanguage,
  CosmosVisualizationReference,
  NarrationSegment,
} from "./cosmos-types";

// Dynamic module loaders for all 24 modules
import { MODULE_02_SUBLESSONS } from "../academy/lessons/module-02-night-sky";
import { MODULE_03_SUBLESSONS } from "../academy/lessons/module-03-cosmic-scale";
import { MODULE_04_SUBLESSONS } from "../academy/lessons/module-04-light-time";
import { MODULE_05_SUBLESSONS } from "../academy/lessons/module-05-earth-moon";
import { MODULE_06_SUBLESSONS } from "../academy/lessons/module-06-solar-system";
import { MODULE_07_SUBLESSONS } from "../academy/lessons/module-07-the-sun";
import { MODULE_08_SUBLESSONS } from "../academy/lessons/module-08-gravity-orbits";
import { MODULE_09_SUBLESSONS } from "../academy/lessons/module-09-stars";
import { MODULE_10_SUBLESSONS } from "../academy/lessons/module-10-evolution";
import { MODULE_11_SUBLESSONS } from "../academy/lessons/module-11-nebulae";
import { MODULE_12_SUBLESSONS } from "../academy/lessons/module-12-exoplanets";
import { MODULE_13_SUBLESSONS } from "../academy/lessons/module-13-galaxies";
import { MODULE_15_SUBLESSONS } from "../academy/lessons/module-15-cosmic-web";
import { MODULE_16_SUBLESSONS } from "../academy/lessons/module-16-dark-matter-energy";
import { MODULE_17_SUBLESSONS } from "../academy/lessons/module-17-big-bang";
import { MODULE_18_SUBLESSONS } from "../academy/lessons/module-18-expanding-universe";
import { MODULE_19_SUBLESSONS } from "../academy/lessons/module-19-history-cosmology";
import { MODULE_20_SUBLESSONS } from "../academy/lessons/module-20-future-universe";
import { MODULE_21_SUBLESSONS } from "../academy/lessons/module-21-telescopes";
import { MODULE_22_SUBLESSONS } from "../academy/lessons/module-22-space-missions";
import { MODULE_23_SUBLESSONS } from "../academy/lessons/module-23-astrobiology";
import { MODULE_24_SUBLESSONS } from "../academy/lessons/module-24-cosmic-lab";

const COURSE_ID = "cosmic-journey";
const COURSE_VERSION = "1.0.0";

const ALL_MODULE_SUBLESSONS: Record<string, any[]> = {
  "01": MODULE_01_SUBLESSONS,
  "02": MODULE_02_SUBLESSONS,
  "03": MODULE_03_SUBLESSONS,
  "04": MODULE_04_SUBLESSONS,
  "05": MODULE_05_SUBLESSONS,
  "06": MODULE_06_SUBLESSONS,
  "07": MODULE_07_SUBLESSONS,
  "08": MODULE_08_SUBLESSONS,
  "09": MODULE_09_SUBLESSONS,
  "10": MODULE_10_SUBLESSONS,
  "11": MODULE_11_SUBLESSONS,
  "12": MODULE_12_SUBLESSONS,
  "13": MODULE_13_SUBLESSONS,
  "14": MODULE_14_SUBLESSONS,
  "15": MODULE_15_SUBLESSONS,
  "16": MODULE_16_SUBLESSONS,
  "17": MODULE_17_SUBLESSONS,
  "18": MODULE_18_SUBLESSONS,
  "19": MODULE_19_SUBLESSONS,
  "20": MODULE_20_SUBLESSONS,
  "21": MODULE_21_SUBLESSONS,
  "22": MODULE_22_SUBLESSONS,
  "23": MODULE_23_SUBLESSONS,
  "24": MODULE_24_SUBLESSONS,
};

/**
 * Maps sublessons to specific 3D scene cameras and objects.
 */
function resolveVisualizationReference(
  moduleId: string,
  sublessonId: string,
  sublessonTitle: string,
): CosmosVisualizationReference {
  const normTitle = sublessonTitle.toLowerCase();

  if (moduleId === "01") {
    if (normTitle.includes("earth")) {
      return {
        sceneId: "solar_system",
        targetObject: "Earth",
        cameraAction: "focus",
        scaleRegime: "planetary",
      };
    }
    if (normTitle.includes("solar system") || normTitle.includes("sun")) {
      return {
        sceneId: "solar_system",
        targetObject: "Sun",
        cameraAction: "orbit",
        scaleRegime: "stellar",
      };
    }
    if (normTitle.includes("milky way") || normTitle.includes("galaxy")) {
      return {
        sceneId: "milky_way",
        targetObject: "Milky Way",
        cameraAction: "zoom_out",
        scaleRegime: "galactic",
      };
    }
    if (normTitle.includes("local group") || normTitle.includes("andromeda")) {
      return {
        sceneId: "local_group",
        targetObject: "M31 Andromeda",
        cameraAction: "fly_to",
        scaleRegime: "galactic",
      };
    }
    return {
      sceneId: "cosmic_scale",
      targetObject: "Observable Universe",
      cameraAction: "zoom_out",
      scaleRegime: "cosmological",
    };
  }

  if (moduleId === "14") {
    if (normTitle.includes("sagittarius a") || normTitle.includes("milky way")) {
      return {
        sceneId: "black_hole_lensing",
        targetObject: "Sagittarius A*",
        cameraAction: "orbit",
        scaleRegime: "stellar",
        parameters: { massSolar: 4297000, diskColor: "#f97316" },
      };
    }
    if (normTitle.includes("m87")) {
      return {
        sceneId: "black_hole_lensing",
        targetObject: "M87*",
        cameraAction: "zoom_in",
        scaleRegime: "galactic",
        parameters: { massSolar: 6500000000, diskColor: "#ea580c" },
      };
    }
    if (normTitle.includes("cygnus x-1")) {
      return {
        sceneId: "compact_object_lab",
        targetObject: "Cygnus X-1",
        cameraAction: "focus",
        scaleRegime: "stellar",
        parameters: { massSolar: 21.2, diskColor: "#06b6d4" },
      };
    }
    if (normTitle.includes("neutron star") || normTitle.includes("white dwarf")) {
      return {
        sceneId: "compact_object_comparison",
        targetObject: "Neutron Star vs White Dwarf",
        cameraAction: "orbit",
        scaleRegime: "planetary",
      };
    }
    return {
      sceneId: "black_hole_lensing",
      targetObject: "Stellar-Mass Black Hole",
      cameraAction: "focus",
      scaleRegime: "stellar",
      parameters: { massSolar: 10 },
    };
  }

  // Generic fallback visualization based on module theme
  return {
    sceneId: `module_${moduleId}_visualization`,
    targetObject: sublessonTitle,
    cameraAction: "focus",
  };
}

/**
 * Extracts key scientific terminology from a text snippet.
 */
function extractTerminology(text: string): string[] {
  const candidates = [
    "Kármán line",
    "vacuum",
    "magnetosphere",
    "geodynamo",
    "habitable zone",
    "baryonic matter",
    "dark matter",
    "dark energy",
    "Casimir effect",
    "spacetime",
    "general relativity",
    "event horizon",
    "Schwarzschild radius",
    "singularity",
    "accretion disk",
    "relativistic jet",
    "gravitational lensing",
    "Chandrasekhar limit",
    "Tolman-Oppenheimer-Volkoff",
    "TOV",
    "electron degeneracy",
    "neutron degeneracy",
    "Pauli exclusion principle",
    "supernova",
    "photodisintegration",
    "electron capture",
    "neutrino",
    "adiabatic index",
    "Local Group",
    "Laniakea",
    "Great Attractor",
    "Hubble flow",
    "particle horizon",
    "comoving distance",
    "light-year",
    "astronomical unit",
    "parsec",
  ];

  const terms: string[] = [];
  const lower = text.toLowerCase();

  for (const c of candidates) {
    if (lower.includes(c.toLowerCase()) && !terms.includes(c)) {
      terms.push(c);
    }
  }

  return terms;
}

function resolveContentForLevel(sub: any, level: LearningLevel): any {
  const cByLevel = sub.contentByLevel;
  if (cByLevel) {
    if (cByLevel[level]) return cByLevel[level];
    if (level === "junior" && (cByLevel.beginner || cByLevel.Beginner))
      return cByLevel.beginner || cByLevel.Beginner;
    if (
      level === "explorer" &&
      (cByLevel.intermediate || cByLevel.Intermediate || cByLevel.scholar)
    )
      return cByLevel.intermediate || cByLevel.Intermediate || cByLevel.scholar;
    if (
      level === "astronomer" &&
      (cByLevel.advanced || cByLevel.Advanced || cByLevel.astrophysicist)
    )
      return cByLevel.advanced || cByLevel.Advanced || cByLevel.astrophysicist;
    if (cByLevel.explorer) return cByLevel.explorer;
  }

  const c = sub.content;
  if (!c) return sub;
  if (typeof c === "string") return c;
  if (c[level]) return c[level];

  if (level === "junior") {
    const val = c.junior ?? c.beginner ?? c.Beginner;
    if (val !== undefined) return val;
  } else if (level === "explorer") {
    const val = c.explorer ?? c.intermediate ?? c.Intermediate ?? c.scholar;
    if (val !== undefined) return val;
  } else if (level === "astronomer") {
    const val = c.astronomer ?? c.advanced ?? c.Advanced ?? c.astrophysicist;
    if (val !== undefined) return val;
  }

  return c.explorer ?? c.intermediate ?? c.Intermediate ?? c.scholar ?? c;
}

export class LessonContentProvider {
  /**
   * Retrieves all verified NarrationSegments for a specific module and learning level.
   */
  public static getSegmentsForModule(
    moduleId: string,
    level: LearningLevel,
    language: CosmosLanguage = "en",
  ): NarrationSegment[] {
    const rawSublessons = ALL_MODULE_SUBLESSONS[moduleId];
    if (!rawSublessons || !Array.isArray(rawSublessons)) {
      return [];
    }

    const moduleMeta = ACADEMY_MODULES.find((m) => m.id === moduleId);
    const references = (moduleMeta?.scientificSources || []).map(
      (s) => `${s.title} (${s.organization || "Verified Source"}${s.url ? ` - ${s.url}` : ""})`,
    );

    const segments: NarrationSegment[] = [];
    let sequenceNumber = 1;

    for (let sIdx = 0; sIdx < rawSublessons.length; sIdx++) {
      const sub = rawSublessons[sIdx];
      const subId = sub.id || `sublesson-${sIdx + 1}`;
      const subTitle = sub.title || `Lesson ${sIdx + 1}`;
      const contentForLevel = resolveContentForLevel(sub, level);

      if (!contentForLevel) continue;

      const visRef = resolveVisualizationReference(moduleId, subId, subTitle);
      const sectionEntries: { key: string; text: string }[] = [];

      if (typeof contentForLevel === "string" && contentForLevel.trim().length > 0) {
        if (typeof sub.summary === "string" && sub.summary.trim()) {
          sectionEntries.push({ key: "summary", text: sub.summary.trim() });
        }
        sectionEntries.push({ key: "explanation", text: contentForLevel.trim() });
        if (typeof sub.didYouKnow === "string" && sub.didYouKnow.trim()) {
          sectionEntries.push({ key: "didYouKnow", text: sub.didYouKnow.trim() });
        }
        if (typeof sub.mathOrPhysicsDeepDive === "string" && sub.mathOrPhysicsDeepDive.trim()) {
          sectionEntries.push({ key: "deepDive", text: sub.mathOrPhysicsDeepDive.trim() });
        }
      } else if (typeof contentForLevel === "object" && contentForLevel !== null) {
        // Extract sections based on sublesson data structure
        const sectionKeys = [
          "summary",
          "lead",
          "keyIdea",
          "takeaway",
          "explanation",
          "deepDive",
          "didYouKnow",
          "mathOrAnalogy",
          "mathematics",
          "activityPrompt",
          "interactivePrompt",
        ];

        for (const sectionKey of sectionKeys) {
          const textVal = contentForLevel[sectionKey];
          if (typeof textVal === "string" && textVal.trim().length > 0) {
            sectionEntries.push({ key: sectionKey, text: textVal.trim() });
          }
        }

        // If standard keys yielded nothing, fallback to paragraphs, details, keyConcepts
        if (sectionEntries.length === 0) {
          if (Array.isArray(contentForLevel.paragraphs)) {
            contentForLevel.paragraphs.forEach((p: any, idx: number) => {
              if (typeof p === "string" && p.trim()) {
                sectionEntries.push({ key: `paragraph-${idx + 1}`, text: p.trim() });
              }
            });
          }
          if (Array.isArray(contentForLevel.details)) {
            contentForLevel.details.forEach((d: any, idx: number) => {
              if (typeof d === "string" && d.trim()) {
                sectionEntries.push({ key: `detail-${idx + 1}`, text: d.trim() });
              }
            });
          }
          if (
            Array.isArray(contentForLevel.keyConcepts) &&
            contentForLevel.keyConcepts.length > 0
          ) {
            const joined = contentForLevel.keyConcepts.filter(Boolean).join(". ");
            if (joined) {
              sectionEntries.push({ key: "keyConcepts", text: joined });
            }
          }
          if (typeof sub.summary === "string" && sub.summary.trim()) {
            sectionEntries.push({ key: "summary", text: sub.summary.trim() });
          }
        }
      }

      for (const entry of sectionEntries) {
        const displayText = entry.text;
        const spokenText = generateSpokenText(displayText, language);
        const epistemicStatus = inferEpistemicStatus(displayText, entry.key);
        const keyTerminology = extractTerminology(displayText);

        // Estimate read time: ~140 words per minute
        const wordCount = displayText.split(/\s+/).length;
        const estimatedSeconds = Math.max(3, Math.round((wordCount / 140) * 60));

        segments.push({
          courseId: COURSE_ID,
          courseVersion: COURSE_VERSION,
          moduleId,
          moduleVersion: moduleMeta?.version || "1.0.0",
          lessonId: subId,
          sectionId: entry.key,
          segmentId: `${moduleId}-${subId}-${entry.key}`,
          sequenceNumber: sequenceNumber++,
          displayText,
          spokenText,
          language,
          learningLevel: level,
          scientificReferences: references,
          visualizationReference: visRef,
          epistemicStatus,
          keyTerminology,
          estimatedDurationSeconds: estimatedSeconds,
        });
      }
    }

    return segments;
  }

  /**
   * Retrieves segments scoped to a single sublesson.
   */
  public static getSegmentsForSublesson(
    moduleId: string,
    sublessonId: string,
    level: LearningLevel,
    language: CosmosLanguage = "en",
  ): NarrationSegment[] {
    const all = this.getSegmentsForModule(moduleId, level, language);
    return all.filter((s) => s.lessonId === sublessonId);
  }

  /**
   * Fetches a single segment by its unique identifier.
   */
  public static getSegmentById(
    segmentId: string,
    level: LearningLevel = "explorer",
    language: CosmosLanguage = "en",
  ): NarrationSegment | null {
    const parts = segmentId.split("-");
    const moduleId = parts[0];
    if (!moduleId) return null;

    const segments = this.getSegmentsForModule(moduleId, level, language);
    return segments.find((s) => s.segmentId === segmentId) || null;
  }

  /**
   * Returns list of all 24 module IDs supported by COSMOS.
   */
  public static getAllSupportedModules(): string[] {
    return Object.keys(ALL_MODULE_SUBLESSONS);
  }

  /**
   * Returns approved module metadata from the registry.
   */
  public static getModuleMetadata(moduleId: string) {
    return ACADEMY_MODULES.find((m) => m.id === moduleId) || null;
  }

  /**
   * Returns available black hole presets for Module 14 visualizations.
   */
  public static getModule14BlackHolePresets() {
    return BLACK_HOLE_PRESETS;
  }
}
