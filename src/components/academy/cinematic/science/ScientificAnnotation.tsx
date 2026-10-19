/**
 * COSMOS World-Anchored Scientific Annotation & Focus Outline System
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 19 (Scientific Label and Outline Effects)
 *
 * Implements:
 * - High-contrast, unboxed/clean typographic callouts (Zero-Pill discipline)
 * - Learning-level filtering (junior: priority 1 only; explorer: 1 & 2; astronomer: all + equations)
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

export interface ScientificAnnotationLayerProps {
  scene: CinematicSceneDescriptor;
  chapterAnnotations?: CinematicScientificAnnotation[];
  enabled: boolean;
  learningLevel?: LearningLevel;
  highlightedObjectIds?: string[];
  selectedObjectId?: string | null;
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
}: ScientificAnnotationLayerProps) {
  const sourceAnnotations =
    chapterAnnotations && chapterAnnotations.length > 0 ? chapterAnnotations : scene.annotations;
  const visibleAnnotations = React.useMemo(
    () => filterAnnotationsForLearningLevel(sourceAnnotations, learningLevel),
    [sourceAnnotations, learningLevel],
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
              opacity={0.75}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

      {/* World-Anchored Scientific Callout Labels */}
      {enabled &&
        visibleAnnotations.map((ann) => {
          const isEmphasized =
            ann.objectId === selectedObjectId || highlightedObjectIds.includes(ann.objectId);

          return (
            <Html
              key={ann.annotationId}
              position={ann.worldPosition}
              center
              distanceFactor={15}
              zIndexRange={[10, 0]}
            >
              <div
                data-testid={`scene-annotation-${ann.annotationId}`}
                className={`pointer-events-none select-none bg-[#050914]/90 backdrop-blur-md border px-2.5 py-1 text-[11px] font-mono text-slate-100 whitespace-nowrap shadow-lg transition-colors ${
                  isEmphasized ? "border-cyan-400" : "border-cyan-400/40"
                }`}
              >
                <span className="text-cyan-400 font-bold block">{ann.label}</span>
                <span className="text-slate-200 text-[10px] block">{ann.value}</span>
                {learningLevel === "astronomer" && ann.formulaLatex && (
                  <span className="text-amber-300/90 text-[10px] block mt-0.5">
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
