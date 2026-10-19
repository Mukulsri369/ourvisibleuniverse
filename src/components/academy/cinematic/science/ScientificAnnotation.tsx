/**
 * COSMOS World-Anchored Scientific Annotation & Focus Outline System
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 Section 19 & Prompt 16 Sections 28 & 29 (Collision Avoidance & Zero-Pill Typography)
 *
 * Implements:
 * - High-contrast, clean typographic callouts with tabular numerals (`tabular-nums`)
 * - Deterministic priority ranking & spatial collision separation (`resolveCollisionFreeAnnotations`)
 * - Learning-level & viewport-budget filtering so labels never crowd small screens
 * - Smooth 3D focus ring around highlighted or selected celestial objects
 */

import React from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { LearningLevel } from "@/lib/academy/types";
import type {
  CinematicSceneDescriptor,
  CinematicScientificAnnotation,
} from "@/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";
import { resolveCollisionFreeAnnotations } from "@/lib/cosmos/cinematic/CinematicPanelManager";

export interface ScientificAnnotationLayerProps {
  scene: CinematicSceneDescriptor;
  chapterAnnotations?: CinematicScientificAnnotation[];
  enabled: boolean;
  learningLevel?: LearningLevel;
  highlightedObjectIds?: string[];
  selectedObjectId?: string | null;
  maxVisibleAnnotations?: number;
}

export function filterAnnotationsForLearningLevel(
  annotations: CinematicScientificAnnotation[],
  level: LearningLevel = "explorer",
): CinematicScientificAnnotation[] {
  if (level === "junior") {
    return annotations.filter((a) => a.priority === 1).slice(0, 3);
  }
  if (level === "explorer") {
    return annotations.filter((a) => a.priority <= 2);
  }
  return annotations;
}

export function ScientificAnnotation({
  scene,
  chapterAnnotations,
  enabled,
  learningLevel = "explorer",
  highlightedObjectIds = [],
  selectedObjectId = null,
  maxVisibleAnnotations = 6,
}: ScientificAnnotationLayerProps) {
  const sourceAnnotations =
    chapterAnnotations && chapterAnnotations.length > 0 ? chapterAnnotations : scene.annotations;

  const placedAnnotations = React.useMemo(
    () =>
      resolveCollisionFreeAnnotations({
        annotations: sourceAnnotations,
        learningLevel,
        highlightedObjectIds,
        selectedObjectId,
        maxVisible: maxVisibleAnnotations,
      }),
    [
      sourceAnnotations,
      learningLevel,
      highlightedObjectIds,
      selectedObjectId,
      maxVisibleAnnotations,
    ],
  );

  return (
    <group>
      {/* 3D Focus Outline Rings around highlighted or student-selected objects */}
      {scene.objects.map((obj) => {
        const isFocused =
          obj.objectId === selectedObjectId || highlightedObjectIds.includes(obj.objectId);
        if (!isFocused) return null;

        return (
          <mesh
            key={`outline-${obj.objectId}`}
            position={obj.position}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[obj.radius * 1.18, obj.radius * 1.24, 48]} />
            <meshBasicMaterial
              color="#38bdf8"
              side={THREE.DoubleSide}
              transparent
              opacity={0.78}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

      {/* World-Anchored Collision-Managed Scientific Callout Labels */}
      {enabled &&
        placedAnnotations.map((ann) => {
          const [wx, wy, wz] = ann.worldPosition;
          const adjustedPosition: [number, number, number] = [
            wx,
            wy + ann.verticalOffsetUnits,
            wz,
          ];

          return (
            <Html
              key={ann.annotationId}
              position={adjustedPosition}
              center
              distanceFactor={15}
              zIndexRange={[10, 0]}
            >
              <div
                data-testid={`scene-annotation-${ann.annotationId}`}
                data-annotation-priority={ann.priority}
                className={`pointer-events-none select-none bg-[#03050A]/90 backdrop-blur-md border px-2.5 py-1.5 text-[11px] font-mono tabular-nums text-slate-100 whitespace-nowrap shadow-xl transition-colors ${
                  ann.isEmphasized
                    ? "border-cyan-400 shadow-cyan-950/60"
                    : "border-slate-400/30"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${
                      ann.isEmphasized ? "bg-cyan-400" : "bg-sky-400/70"
                    }`}
                  />
                  <span className="text-cyan-300 font-semibold tracking-tight">{ann.label}</span>
                </div>
                <span className="text-slate-100 text-[11px] block pl-3">{ann.value}</span>
                {learningLevel === "astronomer" && ann.formulaLatex && (
                  <span className="text-amber-300/95 text-[10px] block pl-3 mt-0.5">
                    {ann.formulaLatex}
                  </span>
                )}
              </div>
            </Html>
          );
        })}
    </group>
  );
}
