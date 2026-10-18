/**
 * COSMOS LessonContentProvider
 * Project: Our Visible Universe Academy
 * Scope: Prompt 13 Intelligent Voice Narration Engine
 *
 * Ingests approved module lesson materials across all 24 modules and transforms
 * them into strictly typed, ordered NarrationSegments with phonetic pronunciation,
 * stable semantic IDs, equation speech expansions, and 3D visualization linkages.
 */

import type { LearningLevel } from "../academy/types";
import { ACADEMY_MODULES } from "../academy/registry";
import { MODULE_01_SUBLESSONS } from "../academy/lessons/module-01-our-place";
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
import { MODULE_14_SUBLESSONS, BLACK_HOLE_PRESETS } from "../academy/lessons/module-14-black-holes";
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
import { generateSpokenText, inferEpistemicStatus } from "./phonetics";
import type {
  CosmosLanguage,
  CosmosVisualizationReference,
  NarrationSegment,
} from "./cosmos-types";

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
 * Maps sublessons across all 24 modules to specific 3D scene cameras and objects.
 */
function resolveVisualizationReference(
  moduleId: string,
  sublessonId: string,
  sublessonTitle: string,
): CosmosVisualizationReference {
  const normTitle = sublessonTitle.toLowerCase();

  switch (moduleId) {
    case "01":
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

    case "02":
      return {
        sceneId: "virtual_planetarium",
        targetObject: normTitle.includes("polaris") ? "Polaris" : "Constellations",
        cameraAction: "orbit",
        scaleRegime: "stellar",
      };

    case "03":
      return {
        sceneId: "cosmic_distances_ruler",
        targetObject: "Light-Year Scale",
        cameraAction: "zoom_out",
        scaleRegime: "galactic",
      };

    case "04":
      return {
        sceneId: "light_travel_simulation",
        targetObject: "Speed of Light Pulse",
        cameraAction: "focus",
        scaleRegime: "stellar",
      };

    case "05":
      return {
        sceneId: "sun_earth_moon_sim",
        targetObject: normTitle.includes("moon") ? "Moon" : "Earth Tilt",
        cameraAction: "orbit",
        scaleRegime: "planetary",
      };

    case "06":
      return {
        sceneId: "solar_system_3d",
        targetObject: normTitle.includes("jupiter")
          ? "Jupiter"
          : normTitle.includes("saturn")
            ? "Saturn"
            : normTitle.includes("mars")
              ? "Mars"
              : "Planetary Orbits",
        cameraAction: "focus",
        scaleRegime: "planetary",
      };

    case "07":
      return {
        sceneId: "sun_simulator_3d",
        targetObject: "Solar Corona",
        cameraAction: "zoom_in",
        scaleRegime: "stellar",
      };

    case "08":
      return {
        sceneId: "orbital_mechanics_lab",
        targetObject: "Keplerian Ellipse",
        cameraAction: "orbit",
        scaleRegime: "planetary",
      };

    case "09":
      return {
        sceneId: "hr_diagram_spectra",
        targetObject: "Stellar Classification",
        cameraAction: "focus",
        scaleRegime: "stellar",
      };

    case "10":
      return {
        sceneId: "stellar_evolution_3d",
        targetObject: normTitle.includes("supernova") ? "Supernova Remnant" : "Main Sequence Star",
        cameraAction: "zoom_in",
        scaleRegime: "stellar",
      };

    case "11":
      return {
        sceneId: "nebula_3d_explorer",
        targetObject: normTitle.includes("orion") ? "Orion Nebula" : "Emission Nebula",
        cameraAction: "orbit",
        scaleRegime: "stellar",
      };

    case "12":
      return {
        sceneId: "exoplanet_observatory_3d",
        targetObject: "Transit Light Curve",
        cameraAction: "focus",
        scaleRegime: "planetary",
      };

    case "13":
      return {
        sceneId: "galaxy_assembly_3d",
        targetObject: normTitle.includes("andromeda") ? "Andromeda Galaxy" : "Spiral Disk",
        cameraAction: "orbit",
        scaleRegime: "galactic",
      };

    case "14":
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

    case "15":
      return {
        sceneId: "cosmic_structure_3d",
        targetObject: "Cosmic Web Scaffolding",
        cameraAction: "zoom_out",
        scaleRegime: "cosmological",
      };

    case "16":
      return {
        sceneId: "dark_matter_rotation_lab",
        targetObject: "Galactic Dark Matter Halo",
        cameraAction: "orbit",
        scaleRegime: "galactic",
      };

    case "17":
      return {
        sceneId: "cosmic_expansion_observatory",
        targetObject: "Cosmic Microwave Background",
        cameraAction: "zoom_out",
        scaleRegime: "cosmological",
      };

    case "18":
      return {
        sceneId: "expanding_spacetime_3d",
        targetObject: "Cosmological Redshift",
        cameraAction: "fly_to",
        scaleRegime: "cosmological",
      };

    case "19":
      return {
        sceneId: "historical_cosmology_comparator",
        targetObject: "Heliocentric Transition",
        cameraAction: "orbit",
        scaleRegime: "planetary",
      };

    case "20":
      return {
        sceneId: "future_universe_timeline",
        targetObject: "Degenerate & Black Hole Eras",
        cameraAction: "zoom_out",
        scaleRegime: "cosmological",
      };

    case "21":
      return {
        sceneId: "virtual_observatory_lab",
        targetObject: "JWST & Hubble Focal Arrays",
        cameraAction: "focus",
        scaleRegime: "stellar",
      };

    case "22":
      return {
        sceneId: "space_missions_lab",
        targetObject: "Interplanetary Trajectory",
        cameraAction: "fly_to",
        scaleRegime: "planetary",
      };

    case "23":
      return {
        sceneId: "habitable_world_lab",
        targetObject: "Exoplanetary Biosphere",
        cameraAction: "focus",
        scaleRegime: "planetary",
      };

    case "24":
      return {
        sceneId: "cosmic_physics_lab",
        targetObject: "Capston Quantitative Experiment",
        cameraAction: "reset",
        scaleRegime: "cosmological",
      };

    default:
      return {
        sceneId: `module_${moduleId}_visualization`,
        targetObject: sublessonTitle,
        cameraAction: "focus",
      };
  }
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
    "Hubble constant",
    "cosmological redshift",
    "cosmic microwave background",
    "recombination",
    "nucleosynthesis",
    "transit photometry",
    "radial velocity",
    "blackbody radiation",
    "Hertzsprung-Russell diagram",
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

/**
 * Resolves content for the specified learning level across different sublesson schema formats.
 */
function resolveContentForLevel(sub: any, level: LearningLevel): any {
  const cByLevel = sub.contentByLevel;
  if (cByLevel) {
    if (cByLevel[level]) return cByLevel[level];
    if (level === "junior" && (cByLevel.beginner || cByLevel.Beginner)) {
      return cByLevel.beginner || cByLevel.Beginner;
    }
    if (
      level === "explorer" &&
      (cByLevel.intermediate || cByLevel.Intermediate || cByLevel.scholar)
    ) {
      return cByLevel.intermediate || cByLevel.Intermediate || cByLevel.scholar;
    }
    if (
      level === "astronomer" &&
      (cByLevel.advanced || cByLevel.Advanced || cByLevel.astrophysicist)
    ) {
      return cByLevel.advanced || cByLevel.Advanced || cByLevel.astrophysicist;
    }
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

/**
 * Splits text into natural semantic paragraphs / sentences (15 to 45 words per segment).
 */
function splitIntoSemanticSegments(text: string, maxWords = 45): string[] {
  if (!text || !text.trim()) return [];

  // Split by double newlines or list items
  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const segments: string[] = [];

  for (const block of blocks) {
    // If block is a markdown header, treat as discrete segment
    if (block.startsWith("#")) {
      const headerText = block.replace(/^#+\s*/, "").trim();
      if (headerText) segments.push(headerText);
      continue;
    }

    const words = block.split(/\s+/);
    if (words.length <= maxWords) {
      segments.push(block);
    } else {
      // Split into sentences using punctuation boundaries
      const sentenceRegex = /[^.!?]+[.!?]+(?:\s+|$)/g;
      const sentences = block.match(sentenceRegex) || [block];
      let current = "";

      for (const s of sentences) {
        const candidate = (current + " " + s).trim();
        if (candidate.split(/\s+/).length > maxWords && current) {
          segments.push(current.trim());
          current = s;
        } else {
          current = candidate;
        }
      }

      if (current.trim()) {
        segments.push(current.trim());
      }
    }
  }

  return segments;
}

export class LessonContentProvider {
  /**
   * Retrieves all verified NarrationSegments for a specific module and learning level.
   * Guarantees complete instructional recitation without skipping titles, summaries,
   * equations, or learning objectives.
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
      const subNumber = sub.number || sIdx + 1;
      const subId = sub.id || `sublesson-${subNumber}`;
      const subTitle = sub.title || `Lesson ${subNumber}`;
      const contentForLevel = resolveContentForLevel(sub, level);

      const visRef = resolveVisualizationReference(moduleId, subId, subTitle);
      const sectionEntries: { key: string; text: string; spokenText?: string }[] = [];

      // 1. PRIMARY REQUIREMENT: Never skip the Lesson Title
      const titleSpoken =
        language === "hi" ? `पाठ ${subNumber}: ${subTitle}` : `Lesson ${subNumber}: ${subTitle}`;
      sectionEntries.push({
        key: "title",
        text: subTitle,
        spokenText: generateSpokenText(titleSpoken, language),
      });

      // 2. Learning Objectives / Key Concepts
      if (Array.isArray(sub.learningObjectives) && sub.learningObjectives.length > 0) {
        for (let oIdx = 0; oIdx < sub.learningObjectives.length; oIdx++) {
          const obj = sub.learningObjectives[oIdx];
          if (typeof obj === "string" && obj.trim()) {
            sectionEntries.push({
              key: `objective-${oIdx + 1}`,
              text: obj.trim(),
              spokenText: generateSpokenText(`Learning objective: ${obj.trim()}`, language),
            });
          }
        }
      } else if (sub.keyConcepts) {
        let conceptsList: string[] = [];
        if (Array.isArray(sub.keyConcepts)) {
          conceptsList = sub.keyConcepts;
        } else if (typeof sub.keyConcepts === "object") {
          conceptsList =
            sub.keyConcepts[level] || sub.keyConcepts.explorer || sub.keyConcepts.junior || [];
        }
        for (let cIdx = 0; cIdx < conceptsList.length; cIdx++) {
          const concept = conceptsList[cIdx];
          if (typeof concept === "string" && concept.trim()) {
            sectionEntries.push({
              key: `concept-${cIdx + 1}`,
              text: concept.trim(),
              spokenText: generateSpokenText(`Key concept: ${concept.trim()}`, language),
            });
          }
        }
      }

      // 3. Sublesson Summary / Lead Paragraphs
      if (typeof sub.summary === "string" && sub.summary.trim()) {
        const summaryParts = splitIntoSemanticSegments(sub.summary.trim(), 40);
        summaryParts.forEach((part, pIdx) => {
          sectionEntries.push({
            key: `summary-${pIdx + 1}`,
            text: part,
          });
        });
      }

      // 4. Instructional Body Content & Explanations
      if (typeof contentForLevel === "string" && contentForLevel.trim().length > 0) {
        const contentParts = splitIntoSemanticSegments(contentForLevel.trim(), 45);
        contentParts.forEach((part, pIdx) => {
          sectionEntries.push({
            key: `explanation-${pIdx + 1}`,
            text: part,
          });
        });
      } else if (typeof contentForLevel === "object" && contentForLevel !== null) {
        const orderedContentKeys = [
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
          "experimentInstructions",
        ];

        for (const k of orderedContentKeys) {
          const val = contentForLevel[k];
          if (typeof val === "string" && val.trim().length > 0) {
            const parts = splitIntoSemanticSegments(val.trim(), 45);
            parts.forEach((part, pIdx) => {
              sectionEntries.push({
                key: `${k}-${pIdx + 1}`,
                text: part,
              });
            });
          }
        }

        // Handle paragraphs / details arrays if present
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
      }

      // 5. Scientific Math, Equations & Deep Dives
      if (sub.mathOrPhysicsDeepDive) {
        if (typeof sub.mathOrPhysicsDeepDive === "string") {
          sectionEntries.push({
            key: "deepDive",
            text: sub.mathOrPhysicsDeepDive.trim(),
          });
        } else if (typeof sub.mathOrPhysicsDeepDive === "object") {
          const { title, description, formula } = sub.mathOrPhysicsDeepDive;
          const deepDiveText =
            `${title || "Physics Deep Dive"}: ${description || ""} ${formula ? `Formula: ${formula}` : ""}`.trim();
          sectionEntries.push({
            key: "deepDive",
            text: deepDiveText,
          });
        }
      }

      // 6. Cosmic Curiosities & Fun Facts
      if (typeof sub.didYouKnow === "string" && sub.didYouKnow.trim()) {
        sectionEntries.push({
          key: "didYouKnow",
          text: sub.didYouKnow.trim(),
        });
      }

      // 7. Interactive Experiment / Activity Prompts
      if (typeof sub.activityPrompt === "string" && sub.activityPrompt.trim()) {
        sectionEntries.push({
          key: "activityPrompt",
          text: sub.activityPrompt.trim(),
        });
      } else if (typeof sub.interactiveActivity === "object" && sub.interactiveActivity !== null) {
        const act = sub.interactiveActivity;
        const actText =
          `${act.title || "Interactive Activity"}: ${act.instructions || act.description || ""}`.trim();
        if (actText) {
          sectionEntries.push({
            key: "activityPrompt",
            text: actText,
          });
        }
      }

      // Build validated NarrationSegment array
      for (let eIdx = 0; eIdx < sectionEntries.length; eIdx++) {
        const entry = sectionEntries[eIdx];
        const displayText = entry.text;
        const spokenText = entry.spokenText || generateSpokenText(displayText, language);
        const epistemicStatus = inferEpistemicStatus(displayText, entry.key);
        const keyTerminology = extractTerminology(displayText);

        // Word count based duration estimation (~140 words per minute)
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
