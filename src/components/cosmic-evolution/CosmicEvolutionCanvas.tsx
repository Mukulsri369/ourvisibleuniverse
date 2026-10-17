import React, { useRef, useEffect, useMemo } from "react";
import type {
  VisualStageId,
  CosmicEvolutionStage,
} from "@/lib/astronomy/cosmic-evolution/evolution-stages";
import { VISUAL_STAGES_CONFIG } from "@/lib/astronomy/cosmic-evolution/evolution-stages";

interface CosmicEvolutionCanvasProps {
  visualStageId: VisualStageId;
  activeStage: CosmicEvolutionStage;
  currentInterpolatedTimeGyr: number;
  viewingMode: "guided_cinematic" | "interactive_exploration" | "advanced_physics";
  className?: string;
  onCanvasClick?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  phase: number;
  speed: number;
}

export function CosmicEvolutionCanvas({
  visualStageId,
  activeStage,
  currentInterpolatedTimeGyr,
  viewingMode,
  className = "",
  onCanvasClick,
}: CosmicEvolutionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate deterministic particles for stable rendering
  const particles = useMemo(() => {
    const pts: Particle[] = [];
    const count = 350;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 800;
      const y = (Math.random() - 0.5) * 600;
      const vx = (Math.random() - 0.5) * 1.2;
      const vy = (Math.random() - 0.5) * 1.2;
      const size = Math.random() * 3.5 + 1.2;
      const phase = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      pts.push({
        x,
        y,
        vx,
        vy,
        size,
        color: "#ffffff",
        phase,
        speed,
      });
    }
    return pts;
  }, []);

  // WebGL or 2D Canvas rendering loop with high efficiency
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const cx = width / 2;
      const cy = height / 2;

      // Base background fill
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      const cfg = VISUAL_STAGES_CONFIG[visualStageId];

      switch (visualStageId) {
        case "early_plasma": {
          // Relativistic fluid plasma with acoustic waves
          const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.7);
          grad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
          grad.addColorStop(0.25, "rgba(239, 68, 68, 0.85)");
          grad.addColorStop(0.6, "rgba(107, 33, 168, 0.45)");
          grad.addColorStop(1, "rgba(3, 7, 18, 1)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Primordial acoustic waves
          ctx.lineWidth = 1.5;
          const waveCount = 5;
          for (let w = 1; w <= waveCount; w++) {
            const r = (w * 70 + ((frame * 1.5) % 180)) % (Math.min(width, height) * 0.55);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(254, 215, 170, ${Math.max(0, 0.4 - r / 500)})`;
            ctx.stroke();
          }

          // Swarming quarks, gluons, and photons
          particles.slice(0, 180).forEach((p, idx) => {
            const angle = p.phase + frame * 0.03 * p.speed;
            const dist = 50 + (idx % 7) * 45 + Math.sin(frame * 0.05 + idx) * 20;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist * 0.7;

            ctx.fillStyle = idx % 2 === 0 ? "#fef08a" : "#f87171";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#f59e0b";
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          break;
        }

        case "cmb_sky": {
          // CMB Sky with acoustic multipoles (ell ~ 220)
          const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.min(width, height) * 0.55);
          grad.addColorStop(0, "rgba(249, 115, 22, 0.25)");
          grad.addColorStop(0.7, "rgba(14, 165, 233, 0.2)");
          grad.addColorStop(1, "rgba(3, 7, 18, 1)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Simulated all-sky Mollweide / celestial ellipse
          const rx = width * 0.42;
          const ry = height * 0.35;

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.clip();

          // Render acoustic multipole pattern inside celestial ellipse
          const step = 14;
          for (let x = cx - rx; x <= cx + rx; x += step) {
            for (let y = cy - ry; y <= cy + ry; y += step) {
              const dx = (x - cx) / rx;
              const dy = (y - cy) / ry;
              if (dx * dx + dy * dy <= 1) {
                // High-order harmonic oscillation
                const n1 = Math.sin(x * 0.07 + frame * 0.005) * Math.cos(y * 0.07);
                const n2 = Math.sin(x * 0.15 - y * 0.12) * 0.5;
                const tempDelta = n1 + n2; // Simulated ΔT/T ~ 10^-5

                if (tempDelta > 0.2) {
                  ctx.fillStyle = `rgba(239, 68, 68, ${Math.min(0.85, tempDelta * 0.8)})`; // Hot overdensity
                } else if (tempDelta < -0.2) {
                  ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(0.85, Math.abs(tempDelta) * 0.8)})`; // Cold underdensity
                } else {
                  ctx.fillStyle = "rgba(251, 191, 36, 0.35)"; // Mean 2.7255 K
                }
                ctx.fillRect(x - step / 2, y - step / 2, step, step);
              }
            }
          }

          // Elliptical boundary line
          ctx.restore();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Equatorial and prime meridian guide lines
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.beginPath();
          ctx.moveTo(cx - rx, cy);
          ctx.lineTo(cx + rx, cy);
          ctx.moveTo(cx, cy - ry);
          ctx.lineTo(cx, cy + ry);
          ctx.stroke();
          break;
        }

        case "gravitational_growth": {
          // Dark matter mini-halos collapsing under Jeans instability
          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, width, height);

          // Render gravitational potential wells
          const wells = [
            { x: cx - 180, y: cy - 70, mass: 1.4 },
            { x: cx + 160, y: cy + 80, mass: 1.8 },
            { x: cx - 40, y: cy + 120, mass: 1.1 },
            { x: cx + 50, y: cy - 110, mass: 1.5 },
          ];

          wells.forEach((w) => {
            const rad = ctx.createRadialGradient(w.x, w.y, 5, w.x, w.y, 140 * w.mass);
            rad.addColorStop(0, "rgba(96, 165, 250, 0.45)");
            rad.addColorStop(0.5, "rgba(49, 46, 129, 0.25)");
            rad.addColorStop(1, "rgba(2, 6, 23, 0)");
            ctx.fillStyle = rad;
            ctx.beginPath();
            ctx.arc(w.x, w.y, 140 * w.mass, 0, Math.PI * 2);
            ctx.fill();
          });

          // Infalling matter particles
          particles.slice(0, 260).forEach((p, idx) => {
            const nearestWell = wells[idx % wells.length];
            const dx = nearestWell.x - (cx + p.x);
            const dy = nearestWell.y - (cy + p.y);
            const dist = Math.sqrt(dx * dx + dy * dy) + 1;
            const pull = 0.05 * nearestWell.mass;

            // Inward spiral motion
            const px = cx + p.x + (dx / dist) * Math.sin(frame * 0.02 + idx) * 30;
            const py = cy + p.y + (dy / dist) * Math.sin(frame * 0.02 + idx) * 30;

            ctx.fillStyle = "rgba(147, 197, 253, 0.75)";
            ctx.beginPath();
            ctx.arc(px, py, p.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case "first_stars": {
          // Pop III stars igniting with expanding Strömgren UV ionization bubbles
          const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, width * 0.6);
          grad.addColorStop(0, "rgba(8, 47, 73, 0.7)");
          grad.addColorStop(1, "rgba(2, 6, 23, 1)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          const stars = [
            { x: cx - 140, y: cy - 60, r: 80, pulse: 1.2 },
            { x: cx + 130, y: cy - 40, r: 95, pulse: 1.5 },
            { x: cx, y: cy + 80, r: 110, pulse: 1.0 },
            { x: cx - 220, y: cy + 100, r: 70, pulse: 0.9 },
            { x: cx + 240, y: cy + 70, r: 85, pulse: 1.3 },
          ];

          // Draw expanding Strömgren ionization bubbles (H II regions)
          stars.forEach((s, idx) => {
            const bubbleRadius = s.r + Math.sin(frame * 0.03 + idx) * 12;
            const bGrad = ctx.createRadialGradient(s.x, s.y, 5, s.x, s.y, bubbleRadius);
            bGrad.addColorStop(0, "rgba(56, 189, 248, 0.65)");
            bGrad.addColorStop(0.6, "rgba(6, 182, 212, 0.25)");
            bGrad.addColorStop(1, "rgba(2, 6, 23, 0)");
            ctx.fillStyle = bGrad;
            ctx.beginPath();
            ctx.arc(s.x, s.y, bubbleRadius, 0, Math.PI * 2);
            ctx.fill();

            // Ionization front boundary
            ctx.strokeStyle = "rgba(125, 211, 252, 0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Core Pop III star
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#38bdf8";
            ctx.beginPath();
            ctx.arc(s.x, s.y, 4.5 * s.pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          break;
        }

        case "galaxy_assembly": {
          // Turbulent rotating starburst protogalaxy with central quasar jets
          const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.5);
          grad.addColorStop(0, "rgba(112, 26, 117, 0.5)");
          grad.addColorStop(0.5, "rgba(30, 27, 75, 0.35)");
          grad.addColorStop(1, "rgba(2, 6, 23, 1)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Rotating spiral arms & gas streams
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(frame * 0.006);

          for (let arm = 0; arm < 2; arm++) {
            const armAngle = arm * Math.PI;
            ctx.beginPath();
            for (let t = 0; t < 180; t += 4) {
              const r = t * 1.4;
              const theta = armAngle + t * 0.035;
              const x = r * Math.cos(theta);
              const y = r * Math.sin(theta) * 0.5; // Inclined disk perspective
              if (t === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = "rgba(236, 72, 153, 0.45)";
            ctx.lineWidth = 12;
            ctx.stroke();
          }

          // Star clusters in arms
          particles.slice(0, 160).forEach((p, idx) => {
            const r = 25 + (idx % 8) * 22;
            const theta = idx * 0.3 + frame * 0.008;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta) * 0.5;

            ctx.fillStyle = idx % 3 === 0 ? "#facc15" : "#38bdf8";
            ctx.beginPath();
            ctx.arc(x, y, p.size * 0.9, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.restore();

          // Supermassive black hole active quasar relativistic jets (perpendicular to disk)
          const jetLength = 160;
          const jGrad = ctx.createLinearGradient(cx, cy - jetLength, cx, cy + jetLength);
          jGrad.addColorStop(0, "rgba(147, 197, 253, 0.85)");
          jGrad.addColorStop(0.45, "rgba(244, 63, 94, 0.95)");
          jGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
          jGrad.addColorStop(0.55, "rgba(244, 63, 94, 0.95)");
          jGrad.addColorStop(1, "rgba(147, 197, 253, 0.85)");

          ctx.strokeStyle = jGrad;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - jetLength);
          ctx.lineTo(cx, cy + jetLength);
          ctx.stroke();

          // Central brilliant core
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 24;
          ctx.shadowColor = "#f43f5e";
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        }

        case "cosmic_web": {
          // IllustrisTNG multi-snapshot cosmic web: nodes, filaments, and voids
          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, width, height);

          // Simulated filament nodes (halos and clusters)
          const nodes = [
            { x: cx - 220, y: cy - 140, r: 5, color: "#c084fc", mass: "Rich Cluster" },
            { x: cx - 80, y: cy - 60, r: 3.5, color: "#818cf8", mass: "Group" },
            { x: cx + 110, y: cy - 120, r: 4, color: "#818cf8", mass: "Group" },
            { x: cx + 240, y: cy - 30, r: 5.5, color: "#c084fc", mass: "Supercluster Core" },
            { x: cx + 60, y: cy + 50, r: 3, color: "#60a5fa", mass: "Node" },
            { x: cx - 140, y: cy + 120, r: 4.5, color: "#818cf8", mass: "Group" },
            { x: cx + 180, y: cy + 150, r: 5, color: "#c084fc", mass: "Rich Cluster" },
            { x: cx - 30, y: cy + 180, r: 3, color: "#60a5fa", mass: "Node" },
          ];

          // Connect nodes with filament spines
          const filaments = [
            [0, 1],
            [1, 2],
            [2, 3],
            [1, 4],
            [4, 5],
            [4, 6],
            [5, 7],
            [7, 6],
            [0, 5],
          ];

          ctx.lineWidth = 2.5;
          filaments.forEach(([i, j]) => {
            const p1 = nodes[i];
            const p2 = nodes[j];
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, "rgba(129, 140, 248, 0.45)");
            grad.addColorStop(0.5, "rgba(192, 132, 252, 0.65)");
            grad.addColorStop(1, "rgba(129, 140, 248, 0.45)");
            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          });

          // Draw dark matter halos at nodes
          nodes.forEach((n) => {
            const nGrad = ctx.createRadialGradient(n.x, n.y, 2, n.x, n.y, n.r * 6);
            nGrad.addColorStop(0, n.color);
            nGrad.addColorStop(0.4, "rgba(129, 140, 248, 0.4)");
            nGrad.addColorStop(1, "rgba(2, 6, 23, 0)");
            ctx.fillStyle = nGrad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
            ctx.fill();

            // Core point
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
          });

          // Label prominent cosmic void
          ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
          ctx.font = "11px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Underdense Cosmic Void (δ < -0.8)", cx - 60, cy + 30);
          ctx.fillText("Comoving Scale ~ 300 Mpc (TNG300)", cx, height - 20);
          break;
        }

        case "modern_distribution": {
          // Modern galaxy distribution: Observational survey lightcone vs simulation box
          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, width, height);

          // Render observer at center (Milky Way z=0)
          ctx.fillStyle = "#38bdf8";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#0284c7";
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Survey wedges (SDSS cones)
          const coneRadius = Math.min(width, height) * 0.44;
          const wedgeAngles = [
            { start: -Math.PI * 0.35, end: Math.PI * 0.15, label: "SDSS DR18 Northern Cap" },
            { start: Math.PI * 0.65, end: Math.PI * 1.15, label: "SDSS DR18 Southern Cap" },
          ];

          wedgeAngles.forEach((w) => {
            ctx.fillStyle = "rgba(14, 165, 233, 0.08)";
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, coneRadius, w.start, w.end);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
          });

          // Zone of Avoidance (Milky Way obscuration belt)
          ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
          ctx.fillRect(0, cy - 14, width, 28);
          ctx.fillStyle = "rgba(248, 113, 113, 0.5)";
          ctx.font = "10px monospace";
          ctx.textAlign = "left";
          ctx.fillText("Galactic Zone of Avoidance (|b| < 8°)", 16, cy + 3);

          // Real survey points scattered within wedges
          particles.forEach((p, idx) => {
            const angle = Math.atan2(p.y, p.x);
            // Check if inside wedge and outside ZoA
            const inNorth = angle >= -Math.PI * 0.35 && angle <= Math.PI * 0.15;
            const inSouth = angle >= Math.PI * 0.65 || angle <= -Math.PI * 0.85;
            const outOfZoA = Math.abs(p.y) > 16;

            if ((inNorth || inSouth) && outOfZoA) {
              const dist = Math.sqrt(p.x * p.x + p.y * p.y) * 0.65;
              if (dist < coneRadius) {
                const px = cx + (p.x / (Math.sqrt(p.x * p.x + p.y * p.y) + 0.1)) * dist;
                const py = cy + (p.y / (Math.sqrt(p.x * p.x + p.y * p.y) + 0.1)) * dist;

                ctx.fillStyle =
                  idx % 4 === 0 ? "rgba(251, 191, 36, 0.8)" : "rgba(147, 197, 253, 0.75)";
                ctx.beginPath();
                ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });

          // Comoving Horizon circle
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, coneRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Comoving Particle Horizon ~ 46.5 Gly (z = ∞)", cx, cy - coneRadius - 6);
          break;
        }
      }

      // Overlaid visual stage badge
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      const badgeW = 280;
      const badgeH = 46;
      ctx.beginPath();
      ctx.roundRect(14, 14, badgeW, badgeH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = cfg.colorPalette.primary;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(cfg.name, 24, 32);

      ctx.fillStyle = "rgba(203, 213, 225, 0.8)";
      ctx.font = "10px sans-serif";
      ctx.fillText(`Mode: ${activeStage.observedVsSimulatedLabel.slice(0, 38)}...`, 24, 48);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [visualStageId, activeStage, currentInterpolatedTimeGyr, particles]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-2xl border border-white/10 ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onClick={onCanvasClick}
        className="w-full h-full object-cover cursor-pointer block"
      />
    </div>
  );
}
