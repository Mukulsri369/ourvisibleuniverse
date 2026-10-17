import React, { useState, useEffect } from "react";
import {
  X,
  Compass,
  Telescope,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Calendar,
  AlertTriangle,
  Split,
  Eye,
  CheckCircle2,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OBSERVATION_REGISTRY,
  getObservationEvidence,
  getAllObservationTargets,
} from "@/lib/astronomy/observation/asset-registry";
import {
  type CelestialObservationEvidence,
  type WavelengthBand,
  type TelescopeImageRecord,
} from "@/lib/astronomy/observation/types";
import { AladinObservationViewer } from "./AladinObservationViewer";
import { ProjectionDifferenceInspector } from "./ProjectionDifferenceInspector";

interface ObservationEvidenceModalProps {
  open: boolean;
  onClose: () => void;
  initialTargetId?: string | null;
}

type ObservationTab =
  | "survey_aladin"
  | "side_by_side"
  | "multi_wavelength"
  | "projection_depth"
  | "uncertainties"
  | "history";

export function ObservationEvidenceModal({
  open,
  onClose,
  initialTargetId,
}: ObservationEvidenceModalProps) {
  const allTargets = getAllObservationTargets();
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    initialTargetId || allTargets[0].targetId,
  );
  const [activeTab, setActiveTab] = useState<ObservationTab>("survey_aladin");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [colorMode, setColorMode] = useState<"natural" | "composite">("composite");

  // Keep selected target in sync when initialTargetId changes
  useEffect(() => {
    if (initialTargetId) {
      const match = getObservationEvidence(initialTargetId);
      if (match) {
        setSelectedTargetId(match.targetId);
      }
    }
  }, [initialTargetId]);

  if (!open) return null;

  const evidence: CelestialObservationEvidence =
    getObservationEvidence(selectedTargetId) || allTargets[0];
  const activeImage: TelescopeImageRecord | undefined =
    evidence.telescopeImages[selectedImageIndex] || evidence.telescopeImages[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-950 text-slate-100 rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* 1. Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-900/90 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Telescope className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Observation Layer
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  Real Telescope Imagery & HiPS Surveys
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Observational Evidence & Multi-Wavelength Explorer
              </h2>
            </div>
          </div>

          {/* Target Quick Switcher & Close Button */}
          <div className="flex items-center gap-2">
            <select
              value={selectedTargetId}
              onChange={(e) => {
                setSelectedTargetId(e.target.value);
                setSelectedImageIndex(0);
              }}
              className="bg-slate-900 border border-white/20 text-xs rounded-xl px-3 py-1.5 font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              {allTargets.map((t) => (
                <option key={t.targetId} value={t.targetId}>
                  {t.targetName}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* 2. Object Summary & Astrometric Anchor Banner */}
        <div className="px-5 py-3 bg-slate-900/50 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shrink-0">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-300">
            <div>
              <span className="text-slate-500">Target:</span>{" "}
              <strong className="text-white font-sans text-sm">{evidence.targetName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Class:</span>{" "}
              <span className="text-cyan-300">{evidence.category}</span>
            </div>
            <div>
              <span className="text-slate-500">Distance:</span>{" "}
              <span className="text-white font-bold">
                {evidence.distanceLy.toLocaleString()} ly
              </span>
              {evidence.distanceUncertaintyLy && (
                <span className="text-slate-400"> ± {evidence.distanceUncertaintyLy} ly</span>
              )}
            </div>
            <div>
              <span className="text-slate-500">Coord:</span>{" "}
              <span className="text-slate-200">
                {evidence.raHms}, {evidence.decDms}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Galactic:</span>{" "}
              <span className="text-slate-300">
                l = {evidence.galacticL.toFixed(2)}°, b = {evidence.galacticB.toFixed(2)}°
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
              [OBSERVATION] 2D Telescope Flux
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
              [MODEL] 3D Kinematic Model
            </span>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-white/10 overflow-x-auto shrink-0 bg-slate-950">
          <button
            onClick={() => setActiveTab("survey_aladin")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === "survey_aladin"
                ? "bg-slate-900 text-cyan-400 border-cyan-500/30 border-b-2 border-b-slate-900 -mb-px"
                : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <Telescope className="size-3.5" />
            <span>Aladin Lite & Sky Surveys</span>
          </button>

          <button
            onClick={() => setActiveTab("side_by_side")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === "side_by_side"
                ? "bg-slate-900 text-cyan-400 border-cyan-500/30 border-b-2 border-b-slate-900 -mb-px"
                : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <Split className="size-3.5" />
            <span>Real Observation vs 3D Reconstruction</span>
          </button>

          <button
            onClick={() => setActiveTab("multi_wavelength")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === "multi_wavelength"
                ? "bg-slate-900 text-cyan-400 border-cyan-500/30 border-b-2 border-b-slate-900 -mb-px"
                : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Wavelength Coverage (5 Bands)</span>
          </button>

          <button
            onClick={() => setActiveTab("projection_depth")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === "projection_depth"
                ? "bg-slate-900 text-cyan-400 border-cyan-500/30 border-b-2 border-b-slate-900 -mb-px"
                : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="size-3.5" />
            <span>2D Alignment vs 3D Depth</span>
          </button>

          <button
            onClick={() => setActiveTab("uncertainties")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === "uncertainties"
                ? "bg-slate-900 text-cyan-400 border-cyan-500/30 border-b-2 border-b-slate-900 -mb-px"
                : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>Measurement Uncertainties</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === "history"
                ? "bg-slate-900 text-cyan-400 border-cyan-500/30 border-b-2 border-b-slate-900 -mb-px"
                : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="size-3.5" />
            <span>Observational History</span>
          </button>
        </div>

        {/* 4. Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-6">
          {/* TAB 1: Aladin Lite & Live Sky Surveys */}
          {activeTab === "survey_aladin" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <div className="lg:col-span-2 h-[560px]">
                <AladinObservationViewer evidence={evidence} selectedImage={activeImage} />
              </div>

              {/* Sidebar with Image Gallery & Filter Specs */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Telescope Images ({evidence.telescopeImages.length})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Verified NASA/ESA
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {evidence.telescopeImages.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          selectedImageIndex === idx
                            ? "bg-cyan-950/40 border-cyan-400 text-white"
                            : "bg-slate-950/50 border-white/10 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {img.thumbUrl && (
                          <img
                            src={img.thumbUrl}
                            alt={img.title}
                            className="size-10 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold font-mono truncate">{img.title}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {img.telescope} • {img.wavelengthBand.toUpperCase()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter and Instrument Details */}
                {activeImage && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 text-xs">
                    <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      Active Image Filters & Calibration
                    </div>
                    <div className="text-slate-300 font-mono text-[11px] space-y-1">
                      <div>
                        <strong>Telescope:</strong> {activeImage.telescope}
                      </div>
                      {activeImage.instrument && (
                        <div>
                          <strong>Instrument:</strong> {activeImage.instrument}
                        </div>
                      )}
                      <div>
                        <strong>Observation Epoch:</strong>{" "}
                        {activeImage.observationDate || "Archival"}
                      </div>
                      <div>
                        <strong>FOV:</strong> {activeImage.fovArcmin} arcmin
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        Imaging Filters:
                      </span>
                      {activeImage.filters.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 font-mono text-[11px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`size-2 rounded-full ${
                                f.falseColorChannel === "blue"
                                  ? "bg-blue-400"
                                  : f.falseColorChannel === "green"
                                    ? "bg-emerald-400"
                                    : f.falseColorChannel === "red"
                                      ? "bg-red-400"
                                      : "bg-amber-400"
                              }`}
                            />
                            <span>{f.name}</span>
                          </div>
                          <span className="text-slate-400">{f.centralWavelengthNm} nm</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                      {activeImage.description}
                    </p>

                    <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 flex justify-between items-center">
                      <span>Attribution: {activeImage.attribution}</span>
                      <a
                        href={activeImage.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        Source <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Side-by-Side: Real Observation vs 3D Reconstruction */}
          {activeTab === "side_by_side" && (
            <div className="space-y-6">
              {/* Epistemic Constitution Warning */}
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-300">
                    Scientific Epistemic Principle: 2D Photograph vs 3D Volumetric Model
                  </span>
                  <p className="text-[11px] leading-relaxed text-amber-100/90">
                    A 2D astronomical photograph represents integrated line-of-sight flux. It must
                    never be directly converted into a 3D volume without kinematic spectroscopy
                    (Doppler velocity mapping), light-echo geometry, or relativistic simulations.
                    Below, compare the empirical 2D observation directly against the
                    physics-grounded 3D reconstruction.
                  </p>
                </div>
              </div>

              {/* Side-by-Side Dual Viewport Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel: Real Observation */}
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        [OBSERVATION]
                      </span>
                      <h3 className="text-sm font-bold text-white">Empirical Telescope Capture</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {activeImage?.telescope || "Telescope Array"}
                    </span>
                  </div>

                  <div className="relative flex-1 min-h-[360px] rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5">
                    {activeImage?.imageUrl ? (
                      <img
                        src={activeImage.imageUrl}
                        alt={activeImage.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-500 font-mono">
                        No direct image asset available
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 backdrop-blur-md">
                      FOV: {activeImage?.fovArcmin || evidence.angularDiameterArcmin} arcmin
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="font-bold text-emerald-400">
                      {evidence.epistemicObservation.title}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {evidence.epistemicObservation.description}
                    </p>
                  </div>
                </div>

                {/* Right Panel: 3D Reconstruction */}
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        [MODEL / RECONSTRUCTION]
                      </span>
                      <h3 className="text-sm font-bold text-white">3D Scientific Model</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Method: {evidence.reconstruction3D.volumetricModelType}
                    </span>
                  </div>

                  {/* 3D Simulated Interactive Canvas / Graphic */}
                  <div className="relative flex-1 min-h-[360px] rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Atom
                      className="size-16 text-cyan-400 animate-spin"
                      style={{ animationDuration: "20s" }}
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-cyan-300">
                        Volumetric Model: {evidence.reconstruction3D.method}
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Rendered in the active 3D universe using double-precision floating-origin
                        coordinates.
                      </p>
                    </div>

                    <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl text-[11px] font-mono text-purple-200/90 text-left max-w-md">
                      <strong className="text-purple-300">Limitations:</strong>{" "}
                      {evidence.reconstruction3D.scientificLimitations}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="font-bold text-purple-400">
                      {evidence.epistemicReconstruction.title}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {evidence.epistemicReconstruction.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Multi-Wavelength Survey Coverage */}
          {activeTab === "multi_wavelength" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Detailed survey coverage across 5 astronomical wavelength regimes for{" "}
                <strong className="text-white">{evidence.targetName}</strong>. Highlights where
                wavelength observations are unavailable due to physical opacity or lack of emission.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(["optical", "infrared", "ultraviolet", "radio", "xray"] as WavelengthBand[]).map(
                  (band) => {
                    const s = evidence.surveys[band];
                    return (
                      <div
                        key={band}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          s.available
                            ? "bg-slate-900 border-white/10"
                            : "bg-red-950/20 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`size-2.5 rounded-full ${
                                s.available ? "bg-emerald-400" : "bg-red-400"
                              }`}
                            />
                            <h4 className="text-sm font-bold font-mono capitalize text-white">
                              {band} Band
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              s.available
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                : "bg-red-500/10 text-red-300 border-red-500/20"
                            }`}
                          >
                            {s.available ? "COVERED" : "UNAVAILABLE"}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs font-mono">
                          <div className="text-slate-300 font-bold">{s.surveyName}</div>
                          {s.hipsId && (
                            <div className="text-[10px] text-cyan-400 truncate">
                              HiPS: {s.hipsId}
                            </div>
                          )}
                          {s.energyRange && (
                            <div className="text-[11px] text-slate-400">
                              Wavelength / Energy: {s.energyRange}
                            </div>
                          )}
                          {s.typicalResolutionArcsec && (
                            <div className="text-[11px] text-slate-400">
                              Spatial Resolution: ≈ {s.typicalResolutionArcsec}″
                            </div>
                          )}
                        </div>

                        {!s.available && s.unavailableReason && (
                          <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-[11px] text-red-200 leading-relaxed font-sans">
                            <strong>Scientific Rationale:</strong> {s.unavailableReason}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 font-mono">
                          {s.attribution}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 2D Alignment vs 3D Depth Inspector */}
          {activeTab === "projection_depth" && <ProjectionDifferenceInspector />}

          {/* TAB 5: Measurement Uncertainties & Catalog Values */}
          {activeTab === "uncertainties" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Peer-reviewed astrophysical parameters for{" "}
                <strong className="text-white">{evidence.targetName}</strong> with explicit
                confidence intervals and documented measurement techniques.
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-white/10 text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Parameter</th>
                      <th className="py-3 px-4">Nominal Value</th>
                      <th className="py-3 px-4">Uncertainty</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Technique</th>
                      <th className="py-3 px-4">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 text-[11px]">
                    {evidence.measurementUncertainties.map((u, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white">{u.parameter}</td>
                        <td className="py-3 px-4 text-cyan-300">
                          {u.nominalValue} {u.unit}
                        </td>
                        <td className="py-3 px-4 text-amber-300 font-bold">{u.uncertainty}</td>
                        <td className="py-3 px-4 text-slate-400">{u.confidenceInterval}</td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs">
                          {u.measurementTechnique}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs">{u.referenceCitation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Observational History & Discovery Milestones */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                  <BookOpen className="size-4" />
                  <span>Discovery & Historical Context</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                  <p>
                    <strong>Discoverer:</strong>{" "}
                    {evidence.observationalHistory.discoverer || "Historical consensus"} (
                    {evidence.observationalHistory.discoveryYear || "Ancient"})
                  </p>
                  {evidence.observationalHistory.originalInstrument && (
                    <p>
                      <strong>Original Instrument:</strong>{" "}
                      {evidence.observationalHistory.originalInstrument}
                    </p>
                  )}
                  <p className="text-slate-400">{evidence.observationalHistory.discoveryContext}</p>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Major Scientific Milestones
                </h4>
                <div className="relative pl-6 border-l border-white/10 space-y-4">
                  {evidence.observationalHistory.milestones.map((m, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-cyan-400 border-2 border-slate-950" />
                      <div className="text-xs font-mono font-bold text-cyan-400">{m.year}</div>
                      <div className="text-xs text-slate-300">{m.event}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Literature References */}
              {evidence.observationalHistory.verifiedReferences.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Key Peer-Reviewed Literature
                  </h4>
                  <div className="space-y-2">
                    {evidence.observationalHistory.verifiedReferences.map((ref, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs font-mono space-y-1"
                      >
                        <div className="text-white font-bold">{ref.title}</div>
                        <div className="text-slate-400 text-[11px]">
                          {ref.authors} ({ref.year}) • {ref.journal}
                        </div>
                        {ref.bibcode && (
                          <div className="text-[10px] text-cyan-400">
                            ADS Bibcode: {ref.bibcode}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Footer with External Database Cross-Links & Legal Disclaimer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>External Observational Catalogs:</span>
            <Button asChild variant="outline" size="sm" className="h-6 text-[10px] border-white/10">
              <a href={evidence.simbadQueryUrl} target="_blank" rel="noopener noreferrer">
                CDS SIMBAD <ExternalLink className="size-2.5 ml-1" />
              </a>
            </Button>
            {evidence.nedQueryUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-6 text-[10px] border-white/10"
              >
                <a href={evidence.nedQueryUrl} target="_blank" rel="noopener noreferrer">
                  NASA / IPAC NED <ExternalLink className="size-2.5 ml-1" />
                </a>
              </Button>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-500">
            Aladin Lite v3 (GPL v3) • NASA/ESA/STScI • ESO • IVOA HiPS Standard
          </div>
        </div>
      </div>
    </div>
  );
}
