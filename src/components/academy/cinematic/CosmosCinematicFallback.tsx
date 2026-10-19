/**
 * COSMOS Cinematic Accessible Fallback & Error Recovery View
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 5, 20, 23 (Non-3D Schematic Alternative & Error Recovery)
 *
 * Ensures students are NEVER left on an empty black screen if WebGL is unsupported,
 * WebGL context is lost, a 3D asset fails to load, or the student prefers a non-3D
 * high-contrast schematic representation.
 */

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  Compass,
  ShieldCheck,
  Layers,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CinematicErrorState } from "@/lib/cosmos/cinematic/CosmosCinematicPlayerState";
import type { CinematicSceneDescriptor } from "@/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";

interface CosmosCinematicFallbackProps {
  scene: CinematicSceneDescriptor;
  errorState: CinematicErrorState | null;
  activeHighlightedObjects: string[];
  selectedObjectId: string | null;
  onSelectObject: (objectId: string) => void;
  onRetryWebGL: () => void;
  onExitCinematicMode: () => void;
  isNon3DPreference?: boolean;
}

export function CosmosCinematicFallback({
  scene,
  errorState,
  activeHighlightedObjects,
  selectedObjectId,
  onSelectObject,
  onRetryWebGL,
  onExitCinematicMode,
  isNon3DPreference = false,
}: CosmosCinematicFallbackProps) {
  return (
    <div
      role="region"
      aria-label={`Accessible Scientific Schematic for ${scene.title}`}
      className="w-full h-full bg-[#03050A] text-slate-100 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto w-full my-auto space-y-6 py-14">
        {/* Recovery / Accessible Mode Banner */}
        <div className="border border-cyan-500/30 bg-slate-900/90 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-10 bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300">
              {errorState ? (
                <AlertTriangle className="size-5 text-amber-400" />
              ) : (
                <Eye className="size-5 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
                  {isNon3DPreference
                    ? "Accessible 2D Scientific Schematic Active"
                    : errorState?.code || "Interactive 2D Telemetry View"}
                </span>
                <span className="font-mono text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5">
                  Progress & COSMOS Narration Preserved
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{scene.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {errorState
                  ? errorState.message
                  : "High-contrast 2D astronomical schematic and verified physical telemetry table."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {errorState?.recoverable !== false && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryWebGL}
                className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/20 rounded-none"
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                <span>Restore 3D Viewport</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExitCinematicMode}
              className="border-white/20 text-slate-200 hover:bg-white/10 rounded-none"
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              <span>Return to Normal Lesson</span>
            </Button>
          </div>
        </div>

        {/* Interactive 2D Astronomical Diagram & Object Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scene.objects.map((obj) => {
            const isHighlighted = activeHighlightedObjects.includes(obj.objectId);
            const isSelected = selectedObjectId === obj.objectId;
            return (
              <button
                key={obj.objectId}
                type="button"
                onClick={() => onSelectObject(obj.objectId)}
                className={`text-left p-5 border transition-colors ${
                  isSelected || isHighlighted
                    ? "bg-cyan-950/40 border-cyan-400 text-white"
                    : "bg-slate-900/75 border-white/15 text-slate-200 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-3.5 inline-block border border-white/40"
                      style={{ backgroundColor: obj.color }}
                    />
                    <span className="font-bold text-sm text-white">{obj.name}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 text-cyan-300">
                    {obj.category.replace(/_/g, " ")}
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs mt-3 font-mono">
                  {obj.physicalMetrics.mass && (
                    <div>
                      <dt className="text-[10px] text-slate-400 uppercase">Mass</dt>
                      <dd className="text-slate-200">{obj.physicalMetrics.mass}</dd>
                    </div>
                  )}
                  {obj.physicalMetrics.radius && (
                    <div>
                      <dt className="text-[10px] text-slate-400 uppercase">Radius / Scale</dt>
                      <dd className="text-slate-200">{obj.physicalMetrics.radius}</dd>
                    </div>
                  )}
                  {obj.physicalMetrics.distance && (
                    <div>
                      <dt className="text-[10px] text-slate-400 uppercase">Distance / Orbit</dt>
                      <dd className="text-slate-200">{obj.physicalMetrics.distance}</dd>
                    </div>
                  )}
                  {obj.physicalMetrics.temperature && (
                    <div>
                      <dt className="text-[10px] text-slate-400 uppercase">Temperature</dt>
                      <dd className="text-amber-300">{obj.physicalMetrics.temperature}</dd>
                    </div>
                  )}
                  {obj.physicalMetrics.velocity && (
                    <div>
                      <dt className="text-[10px] text-slate-400 uppercase">Velocity</dt>
                      <dd className="text-cyan-300">{obj.physicalMetrics.velocity}</dd>
                    </div>
                  )}
                  {obj.physicalMetrics.equation && (
                    <div>
                      <dt className="text-[10px] text-slate-400 uppercase">Governing Law</dt>
                      <dd className="text-emerald-300">{obj.physicalMetrics.equation}</dd>
                    </div>
                  )}
                </dl>
              </button>
            );
          })}
        </div>

        {/* Epistemic & Scale Integrity Notice */}
        <div className="border border-white/10 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <Layers className="size-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{scene.scaleAdjustmentNotice}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400 shrink-0 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>{scene.observationReference}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
