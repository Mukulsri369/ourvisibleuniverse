import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Grid,
  Ruler,
  Maximize2,
  Info,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type CelestialObservationEvidence,
  type WavelengthBand,
  type TelescopeImageRecord,
} from "@/lib/astronomy/observation/types";
import {
  HIPS_SURVEYS,
  loadAladinLiteScript,
  calculateTransversePhysicalScale,
} from "@/lib/astronomy/observation/aladin-service";

interface AladinObservationViewerProps {
  evidence: CelestialObservationEvidence;
  selectedImage?: TelescopeImageRecord;
  sideBySideMode?: boolean;
}

export function AladinObservationViewer({
  evidence,
  selectedImage,
  sideBySideMode = false,
}: AladinObservationViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const aladinInstanceRef = useRef<any>(null);
  const canvasFallbackRef = useRef<HTMLCanvasElement>(null);

  const [activeBand, setActiveBand] = useState<WavelengthBand>("optical");
  const [fovDeg, setFovDeg] = useState<number>(evidence.aladinFovDefaultDeg || 1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showReticle, setShowReticle] = useState<boolean>(true);
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<"natural" | "composite">("composite");
  const [isAladinLoaded, setIsAladinLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Measurement points on canvas
  const [measurePoints, setMeasurePoints] = useState<Array<{ x: number; y: number }>>([]);
  const [measuredAngularSeparationArcmin, setMeasuredAngularSeparationArcmin] = useState<
    number | null
  >(null);

  const currentSurvey = evidence.surveys[activeBand];

  // Initialize or update Aladin Lite instance
  useEffect(() => {
    let isCancelled = false;

    loadAladinLiteScript()
      .then((success) => {
        if (isCancelled) return;
        if (success && (window as any).A && containerRef.current) {
          try {
            // Clear any existing contents if re-creating
            if (!aladinInstanceRef.current) {
              const aladinDiv = document.createElement("div");
              aladinDiv.id = `aladin-lite-div-${evidence.targetId}`;
              aladinDiv.style.width = "100%";
              aladinDiv.style.height = "100%";
              aladinDiv.style.position = "absolute";
              aladinDiv.style.inset = "0";

              containerRef.current.innerHTML = "";
              containerRef.current.appendChild(aladinDiv);

              const aladin = (window as any).A.aladin(`#${aladinDiv.id}`, {
                survey: currentSurvey.available ? currentSurvey.hipsId : "CDS/P/DSS2/color",
                fov: fovDeg,
                target: `${evidence.raDeg} ${evidence.decDeg}`,
                showReticle: showReticle,
                showGrid: showGrid,
                showZoomControl: false,
                showFullscreenControl: false,
                showLayersControl: false,
              });

              aladinInstanceRef.current = aladin;
              setIsAladinLoaded(true);
            } else {
              // Update target and FOV
              aladinInstanceRef.current.gotoRaDec(evidence.raDeg, evidence.decDeg);
              aladinInstanceRef.current.setFov(fovDeg);
              if (currentSurvey.available) {
                aladinInstanceRef.current.setImageSurvey(currentSurvey.hipsId);
              }
            }
          } catch (err: any) {
            console.warn("Aladin Lite init failed, using high-fidelity fallback viewer", err);
            setIsAladinLoaded(false);
          }
        } else {
          setIsAladinLoaded(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setLoadError(err?.message || "Could not load online Aladin script");
          setIsAladinLoaded(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [evidence.targetId, evidence.raDeg, evidence.decDeg]);

  // Update survey in Aladin when wavelength changes
  useEffect(() => {
    if (aladinInstanceRef.current && currentSurvey.available) {
      try {
        aladinInstanceRef.current.setImageSurvey(currentSurvey.hipsId);
      } catch (e) {
        console.warn("Could not set Aladin survey", e);
      }
    }
  }, [activeBand, currentSurvey]);

  // Update FOV in Aladin
  useEffect(() => {
    if (aladinInstanceRef.current) {
      try {
        aladinInstanceRef.current.setFov(fovDeg);
      } catch (e) {
        // ignore
      }
    }
  }, [fovDeg]);

  // Update Grid / Reticle
  useEffect(() => {
    if (aladinInstanceRef.current) {
      try {
        aladinInstanceRef.current.showGrid(showGrid);
        aladinInstanceRef.current.showReticle(showReticle);
      } catch (e) {
        // ignore
      }
    }
  }, [showGrid, showReticle]);

  // Fallback Canvas Renderer (when Aladin script is unavailable or for custom measurement overlay)
  const drawFallbackCanvas = useCallback(() => {
    const canvas = canvasFallbackRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // If a selected telescope image exists, draw it as empirical background
    const activeImage = selectedImage || evidence.telescopeImages[0];
    if (activeImage && activeImage.imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeImage.imageUrl;
      img.onload = () => {
        ctx.save();
        // Simulate color filter transform if natural vs composite toggled
        if (colorMode === "natural") {
          ctx.filter = "contrast(1.05) brightness(0.95)";
        } else {
          ctx.filter = "contrast(1.3) saturate(1.4)";
        }
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();

        drawOverlays(ctx, width, height);
      };
      img.onerror = () => {
        drawFallbackStarfield(ctx, width, height);
        drawOverlays(ctx, width, height);
      };
    } else {
      drawFallbackStarfield(ctx, width, height);
      drawOverlays(ctx, width, height);
    }
  }, [selectedImage, evidence, colorMode, showGrid, showReticle, fovDeg, measurePoints]);

  function drawFallbackStarfield(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = "#02040a";
    ctx.fillRect(0, 0, width, height);

    // Deep space noise background
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    const seed = Math.floor(evidence.raDeg * 100);
    for (let i = 0; i < 180; i++) {
      const x = ((Math.sin(i * 99 + seed) * 0.5 + 0.5) * width) % width;
      const y = ((Math.cos(i * 33 + seed) * 0.5 + 0.5) * height) % height;
      const r = (Math.sin(i * 12) * 0.5 + 0.5) * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawOverlays(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. Celestial Equatorial Coordinate Grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Concentric circles for FOV
      [0.25, 0.5, 0.75].forEach((frac) => {
        const rad = Math.min(width, height) * 0.5 * frac;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
        ctx.font = "10px monospace";
        const ringFov = (fovDeg * frac * 60).toFixed(1);
        ctx.fillText(`${ringFov}′`, cx + rad + 4, cy - 4);
      });

      // Axis lines
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Center Reticle / Target Crosshair
    if (showReticle) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      const r = 18;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - r - 8, cy);
      ctx.lineTo(cx - r + 4, cy);
      ctx.moveTo(cx + r - 4, cy);
      ctx.lineTo(cx + r + 8, cy);
      ctx.moveTo(cx, cy - r - 8);
      ctx.lineTo(cx, cy - r + 4);
      ctx.moveTo(cx, cy + r - 4);
      ctx.lineTo(cx, cy + r + 8);
      ctx.stroke();
    }

    // 3. Measurement Tool Line & Readout
    if (measurePoints.length > 0) {
      ctx.strokeStyle = "#f59e0b";
      ctx.fillStyle = "#f59e0b";
      ctx.lineWidth = 2;

      measurePoints.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "10px sans-serif";
        ctx.fillText(`P${idx + 1}`, pt.x + 6, pt.y - 6);
      });

      if (measurePoints.length === 2) {
        const [p1, p2] = measurePoints;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const pixelDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const fovPixels = Math.min(width, height);
        const angularDeg = (pixelDist / fovPixels) * fovDeg;
        const angularArcmin = angularDeg * 60;
        const angularArcsec = angularDeg * 3600;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(mx - 60, my - 22, 120, 28);
        ctx.strokeStyle = "#f59e0b";
        ctx.strokeRect(mx - 60, my - 22, 120, 28);

        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          angularArcmin >= 1 ? `${angularArcmin.toFixed(2)}′` : `${angularArcsec.toFixed(1)}″`,
          mx,
          my - 5,
        );
        ctx.textAlign = "start";
      }
    }
  }

  useEffect(() => {
    drawFallbackCanvas();
  }, [drawFallbackCanvas]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!measureMode) return;
    const canvas = canvasFallbackRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (measurePoints.length >= 2) {
      setMeasurePoints([{ x, y }]);
      setMeasuredAngularSeparationArcmin(null);
    } else {
      const next = [...measurePoints, { x, y }];
      setMeasurePoints(next);
      if (next.length === 2) {
        const pixelDist = Math.hypot(next[1].x - next[0].x, next[1].y - next[0].y);
        const fovPixels = Math.min(canvas.width, canvas.height);
        const angularDeg = (pixelDist / fovPixels) * fovDeg;
        setMeasuredAngularSeparationArcmin(angularDeg * 60);
      }
    }
  };

  const scale = calculateTransversePhysicalScale(evidence.distanceLy, fovDeg);

  return (
    <div className="relative flex flex-col w-full h-full min-h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* 1. Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 border-b border-white/10 backdrop-blur-md z-10">
        {/* Multi-Wavelength Survey Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1.5 flex items-center gap-1">
            <Layers className="size-3 text-cyan-400" />
            Survey:
          </span>
          {(["optical", "infrared", "ultraviolet", "radio", "xray"] as WavelengthBand[]).map(
            (band) => {
              const item = evidence.surveys[band];
              const isAvail = item?.available;
              const isActive = activeBand === band;

              return (
                <button
                  key={band}
                  onClick={() => setActiveBand(band)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20"
                      : isAvail
                        ? "bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700 hover:text-white"
                        : "bg-red-950/20 text-slate-400 border-red-500/20 hover:bg-red-950/40"
                  }`}
                  title={isAvail ? item.surveyName : `Unavailable: ${item.unavailableReason}`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isAvail ? (isActive ? "bg-slate-950" : "bg-emerald-400") : "bg-red-400"
                    }`}
                  />
                  <span className="capitalize">{band}</span>
                </button>
              );
            },
          )}
        </div>

        {/* Viewport Toggles: Grid, Reticle, Measure, Color */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={showGrid ? "default" : "outline"}
            className="h-7 text-xs px-2 border-white/15"
            onClick={() => setShowGrid((v) => !v)}
            title="Toggle Celestial Coordinate Grid"
          >
            <Grid className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Grid</span>
          </Button>

          <Button
            size="sm"
            variant={showReticle ? "default" : "outline"}
            className="h-7 text-xs px-2 border-white/15"
            onClick={() => setShowReticle((v) => !v)}
            title="Toggle Center Reticle"
          >
            <Crosshair className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Reticle</span>
          </Button>

          <Button
            size="sm"
            variant={measureMode ? "destructive" : "outline"}
            className="h-7 text-xs px-2 border-white/15"
            onClick={() => {
              setMeasureMode((v) => !v);
              setMeasurePoints([]);
              setMeasuredAngularSeparationArcmin(null);
            }}
            title="Measure Angular Separation"
          >
            <Ruler className="size-3.5 mr-1" />
            <span className="hidden sm:inline">{measureMode ? "Measuring..." : "Ruler"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2 border-white/15"
            onClick={() => setColorMode((v) => (v === "natural" ? "composite" : "natural"))}
            title="Toggle Natural vs Composite Color Palette"
          >
            <Sparkles className="size-3.5 mr-1 text-amber-400" />
            <span className="text-[10px] font-mono uppercase">
              {colorMode === "natural" ? "Natural" : "Composite"}
            </span>
          </Button>
        </div>
      </div>

      {/* 2. Unavailable Survey Warning Banner */}
      {!currentSurvey.available && (
        <div className="bg-red-950/70 border-b border-red-500/30 px-4 py-2.5 flex items-start gap-2.5 text-xs text-red-200 z-10">
          <AlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-red-300">
              No Survey Coverage for {activeBand.toUpperCase()}:
            </span>
            <p className="text-[11px] leading-relaxed text-red-200/90">
              {currentSurvey.unavailableReason ||
                "No emission detected or wavelength is heavily attenuated by dust extinction/opacity."}
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Viewer Canvas / Aladin Container */}
      <div className="relative flex-1 w-full h-full min-h-[380px] bg-black">
        {/* Aladin Lite live container */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {/* High-fidelity Fallback Canvas & Measurement overlay */}
        {(!isAladinLoaded || measureMode) && (
          <canvas
            ref={canvasFallbackRef}
            width={800}
            height={500}
            onClick={handleCanvasClick}
            className={`absolute inset-0 w-full h-full object-cover ${
              measureMode ? "cursor-crosshair z-20 pointer-events-auto" : "pointer-events-none"
            }`}
          />
        )}

        {/* Floating Zoom & Scale Controls (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-20 bg-slate-900/80 p-2 rounded-xl border border-white/15 backdrop-blur-md">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFovDeg((prev) => Math.max(0.001, prev * 0.7))}
              aria-label="Zoom in"
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Zoom In (Decrease FOV)"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              onClick={() => setFovDeg((prev) => Math.min(180, prev * 1.4))}
              aria-label="Zoom out"
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Zoom Out (Increase FOV)"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              onClick={() => {
                setFovDeg(evidence.aladinFovDefaultDeg || 1.0);
                setMeasurePoints([]);
              }}
              aria-label="Reset view"
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Reset View"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>

          <div className="text-[10px] font-mono text-slate-300">
            <div>FOV: {fovDeg >= 1 ? `${fovDeg.toFixed(2)}°` : `${(fovDeg * 60).toFixed(1)}′`}</div>
            <div className="text-cyan-400">
              Span: ≈{" "}
              {scale.widthLy >= 1
                ? `${scale.widthLy.toFixed(1)} ly`
                : `${Math.round(scale.widthAU).toLocaleString()} AU`}
            </div>
          </div>
        </div>

        {/* Celestial Coordinates Readout (Top-Right) */}
        <div className="absolute top-3 right-3 z-20 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md text-[11px] font-mono text-slate-300 space-y-0.5 pointer-events-none">
          <div className="text-cyan-400 font-bold">{evidence.targetName}</div>
          <div>
            RA: {evidence.raHms} ({evidence.raDeg.toFixed(4)}°)
          </div>
          <div>
            Dec: {evidence.decDms} ({evidence.decDeg.toFixed(4)}°)
          </div>
          <div className="text-[10px] text-slate-400">
            Galactic: l = {evidence.galacticL.toFixed(2)}°, b = {evidence.galacticB.toFixed(2)}°
          </div>
        </div>

        {/* Measurement Result Card (when 2 points clicked) */}
        {measuredAngularSeparationArcmin !== null && (
          <div className="absolute bottom-3 right-3 z-20 bg-amber-950/90 border border-amber-500/40 p-3 rounded-xl backdrop-blur-md text-xs text-amber-200 max-w-xs space-y-1 shadow-xl">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Ruler className="size-4" />
              <span>Transverse Separation</span>
            </div>
            <div className="font-mono text-sm font-black text-white">
              {measuredAngularSeparationArcmin >= 1
                ? `${measuredAngularSeparationArcmin.toFixed(2)} arcmin`
                : `${(measuredAngularSeparationArcmin * 60).toFixed(1)} arcsec`}
            </div>
            <p className="text-[11px] text-amber-200/90">
              Physical width at {evidence.distanceLy.toLocaleString()} ly:{" "}
              <strong className="text-white">
                {(
                  evidence.distanceLy *
                  ((measuredAngularSeparationArcmin / 60) * (Math.PI / 180))
                ).toFixed(2)}{" "}
                ly
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* 4. Mandatory Attribution & Source Bar */}
      <div className="p-2.5 bg-slate-900/95 border-t border-white/10 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold">ALADIN LITE v3</span>
          <span>© CDS, CNRS / Université de Strasbourg (GNU GPL v3)</span>
          <span>•</span>
          <span>HiPS Survey: {currentSurvey.surveyName}</span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <a
            href={evidence.simbadQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-0.5"
          >
            SIMBAD <ExternalLink className="size-2.5" />
          </a>
          {evidence.nedQueryUrl && (
            <a
              href={evidence.nedQueryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              NED <ExternalLink className="size-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
