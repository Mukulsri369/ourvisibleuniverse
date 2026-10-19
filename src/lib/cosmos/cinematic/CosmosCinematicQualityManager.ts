/**
 * COSMOS Cinematic Quality Manager & Adaptive Performance Governor
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Section 21 & Section 22 (HIGH_CINEMATIC, BALANCED, LOW_POWER)
 *
 * Manages rendering quality presets, DPR caps, particle multipliers,
 * and automatic downgrade hysteresis without ever altering authoritative
 * physics calculations or certified student learning outcomes.
 */

import type { CinematicQualityTier } from "../cinematic-storyboard-types";

export interface CinematicQualityProfile {
  tier: CinematicQualityTier;
  label: string;
  shortLabel: string;
  description: string;
  dprRange: [number, number];
  particleBudgetMultiplier: number;
  sphereSegments: number;
  antialias: boolean;
  enableShadows: boolean;
  enableAtmosphericGlow: boolean;
  maxDrawCallsTarget: number;
}

export const CINEMATIC_QUALITY_PROFILES: Record<CinematicQualityTier, CinematicQualityProfile> = {
  HIGH_CINEMATIC: {
    tier: "HIGH_CINEMATIC",
    label: "High Quality (Observatory Grade)",
    shortLabel: "High",
    description:
      "Maximum practical DPR (up to 2.0), full starfield & galaxy particle density, smooth sphere tessellation, and full atmospheric rim lighting.",
    dprRange: [1, 2],
    particleBudgetMultiplier: 1.0,
    sphereSegments: 64,
    antialias: true,
    enableShadows: true,
    enableAtmosphericGlow: true,
    maxDrawCallsTarget: 120,
  },
  BALANCED: {
    tier: "BALANCED",
    label: "Balanced (Recommended)",
    shortLabel: "Balanced",
    description:
      "Balanced rendering resolution (DPR up to 1.5), 65% particle density, and optimized geometry for steady frame pacing across laptops and tablets.",
    dprRange: [1, 1.5],
    particleBudgetMultiplier: 0.65,
    sphereSegments: 36,
    antialias: true,
    enableShadows: false,
    enableAtmosphericGlow: true,
    maxDrawCallsTarget: 75,
  },
  LOW_POWER: {
    tier: "LOW_POWER",
    label: "Low Power (Battery & Accessibility)",
    shortLabel: "Low Power",
    description:
      "Conservative DPR (1.0), 30% particle count, simplified shaders, and reduced GPU load while preserving 100% of scientific telemetry and physics accuracy.",
    dprRange: [1, 1],
    particleBudgetMultiplier: 0.3,
    sphereSegments: 20,
    antialias: false,
    enableShadows: false,
    enableAtmosphericGlow: false,
    maxDrawCallsTarget: 45,
  },
};

const STORAGE_KEY = "cosmos_cinematic_quality_v1";

export class CosmosCinematicQualityManager {
  private static instance: CosmosCinematicQualityManager | null = null;
  private currentTier: CinematicQualityTier = "BALANCED";
  private manualOverride = false;
  private consecutiveLowFrameWindows = 0;
  private lastDowngradeTimestamp = 0;
  private measuredFps: number | null = null;
  private listeners = new Set<(profile: CinematicQualityProfile) => void>();

  private constructor() {
    this.loadSavedPreference();
  }

  public static getInstance(): CosmosCinematicQualityManager {
    if (!this.instance) {
      this.instance = new CosmosCinematicQualityManager();
    }
    return this.instance;
  }

  private loadSavedPreference(): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.tier === "HIGH_CINEMATIC" ||
          parsed.tier === "BALANCED" ||
          parsed.tier === "LOW_POWER"
        ) {
          this.currentTier = parsed.tier;
          this.manualOverride = Boolean(parsed.manualOverride);
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Detect conservative default based on device hints
    if (typeof navigator !== "undefined") {
      const cores = navigator.hardwareConcurrency || 4;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
      if (cores <= 2) {
        this.currentTier = "LOW_POWER";
      } else if (isMobile || cores <= 4) {
        this.currentTier = "BALANCED";
      } else {
        this.currentTier = "BALANCED";
      }
    }
  }

  private savePreference(): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tier: this.currentTier,
          manualOverride: this.manualOverride,
          updatedAt: Date.now(),
        }),
      );
    } catch {
      // Ignore storage quota errors
    }
  }

  public getTier(): CinematicQualityTier {
    return this.currentTier;
  }

  public getProfile(): CinematicQualityProfile {
    return CINEMATIC_QUALITY_PROFILES[this.currentTier];
  }

  public getMeasuredFps(): number | null {
    return this.measuredFps;
  }

  /**
   * Explicitly sets the quality tier from student UI selection.
   */
  public setTier(tier: CinematicQualityTier, isManual = true): CinematicQualityProfile {
    this.currentTier = tier;
    this.manualOverride = isManual;
    this.consecutiveLowFrameWindows = 0;
    this.savePreference();
    this.notify();
    return this.getProfile();
  }

  /**
   * Reports a 1-second measured frame-rate window from the active R3F render loop.
   * Implements anti-oscillation hysteresis:
   * - Requires 3 consecutive windows below 38 FPS before stepping down one tier.
   * - Enforces a minimum 12-second cooldown between automatic downgrades.
   * - Never automatically upgrades within the same session to avoid visual flicker.
   */
  public reportFrameWindow(frameCount: number, elapsedMs: number): CinematicQualityTier {
    if (elapsedMs <= 0) return this.currentTier;
    const fps = Math.round((frameCount * 1000) / elapsedMs);
    this.measuredFps = fps;

    const now = Date.now();
    if (now - this.lastDowngradeTimestamp < 12000) {
      return this.currentTier;
    }

    if (fps < 38) {
      this.consecutiveLowFrameWindows += 1;
      if (this.consecutiveLowFrameWindows >= 3) {
        this.consecutiveLowFrameWindows = 0;
        if (this.currentTier === "HIGH_CINEMATIC") {
          this.currentTier = "BALANCED";
          this.lastDowngradeTimestamp = now;
          this.savePreference();
          this.notify();
        } else if (this.currentTier === "BALANCED" && !this.manualOverride) {
          this.currentTier = "LOW_POWER";
          this.lastDowngradeTimestamp = now;
          this.savePreference();
          this.notify();
        }
      }
    } else {
      this.consecutiveLowFrameWindows = 0;
    }

    return this.currentTier;
  }

  public resetForTesting(): void {
    this.currentTier = "BALANCED";
    this.manualOverride = false;
    this.consecutiveLowFrameWindows = 0;
    this.lastDowngradeTimestamp = 0;
    this.measuredFps = null;
  }

  public subscribe(listener: (profile: CinematicQualityProfile) => void): () => void {
    this.listeners.add(listener);
    listener(this.getProfile());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const profile = this.getProfile();
    for (const listener of this.listeners) {
      try {
        listener(profile);
      } catch (err) {
        console.warn("[CosmosCinematicQualityManager] listener error:", err);
      }
    }
  }
}
