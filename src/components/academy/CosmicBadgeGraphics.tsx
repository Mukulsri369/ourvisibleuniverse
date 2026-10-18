import React from "react";

interface BadgeGraphicProps {
  stageId: number;
  isUnlocked: boolean;
  reducedMotion?: boolean;
  size?: number;
  className?: string;
}

export function CosmicBadgeGraphic({
  stageId,
  isUnlocked,
  reducedMotion = false,
  size = 72,
  className = "",
}: BadgeGraphicProps) {
  switch (stageId) {
    case 1:
      return (
        <EarthAndStarsGraphic
          isUnlocked={isUnlocked}
          reducedMotion={reducedMotion}
          size={size}
          className={className}
        />
      );
    case 2:
      return (
        <PlanetsAndRingsGraphic
          isUnlocked={isUnlocked}
          reducedMotion={reducedMotion}
          size={size}
          className={className}
        />
      );
    case 3:
      return (
        <StellarNurseryGraphic
          isUnlocked={isUnlocked}
          reducedMotion={reducedMotion}
          size={size}
          className={className}
        />
      );
    case 4:
      return (
        <SpiralGalaxyGraphic
          isUnlocked={isUnlocked}
          reducedMotion={reducedMotion}
          size={size}
          className={className}
        />
      );
    case 5:
      return (
        <CosmicHorizonGraphic
          isUnlocked={isUnlocked}
          reducedMotion={reducedMotion}
          size={size}
          className={className}
        />
      );
    case 6:
      return (
        <SpaceScientistGraphic
          isUnlocked={isUnlocked}
          reducedMotion={reducedMotion}
          size={size}
          className={className}
        />
      );
    default:
      return null;
  }
}

/**
 * Stage 1: First Stargazer — Earth and Stars
 */
export function EarthAndStarsGraphic({
  isUnlocked,
  reducedMotion,
  size = 72,
  className = "",
}: {
  isUnlocked: boolean;
  reducedMotion?: boolean;
  size?: number;
  className?: string;
}) {
  const pulseClass = isUnlocked && !reducedMotion ? "animate-pulse" : "";
  const spinSlow = isUnlocked && !reducedMotion ? "animate-[spin_40s_linear_infinite]" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="First Stargazer Earth and Stars Emblem"
    >
      <defs>
        <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isUnlocked ? "#38bdf8" : "#475569"} stopOpacity="0.4" />
          <stop offset="100%" stopColor={isUnlocked ? "#0284c7" : "#1e293b"} stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="earthGrad"
          x1="20"
          y1="20"
          x2="80"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={isUnlocked ? "#38bdf8" : "#334155"} />
          <stop offset="60%" stopColor={isUnlocked ? "#0369a1" : "#1e293b"} />
          <stop offset="100%" stopColor={isUnlocked ? "#0c4a6e" : "#0f172a"} />
        </linearGradient>
        <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isUnlocked ? "#34d399" : "#64748b"} />
          <stop offset="100%" stopColor={isUnlocked ? "#059669" : "#475569"} />
        </linearGradient>
      </defs>

      {/* Atmospheric Glow Circle */}
      <circle cx="50" cy="50" r="46" fill="url(#earthGlow)" className={pulseClass} />

      {/* Constellation Ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={isUnlocked ? "#0ea5e9" : "#334155"}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        opacity={isUnlocked ? "0.7" : "0.3"}
        className={spinSlow}
      />

      {/* Outer Stars */}
      <g opacity={isUnlocked ? "0.9" : "0.3"}>
        <path
          d="M50 8L51.5 13L56.5 14.5L51.5 16L50 21L48.5 16L43.5 14.5L48.5 13Z"
          fill={isUnlocked ? "#bae6fd" : "#64748b"}
        />
        <path
          d="M82 24L83 27L86 28L83 29L82 32L81 29L78 28L81 27Z"
          fill={isUnlocked ? "#7dd3fc" : "#64748b"}
        />
        <path
          d="M18 36L19 39L22 40L19 41L18 44L17 41L14 40L17 39Z"
          fill={isUnlocked ? "#7dd3fc" : "#64748b"}
        />
        <path
          d="M84 72L85 74.5L87.5 75.5L85 76.5L84 79L83 76.5L80.5 75.5L83 74.5Z"
          fill={isUnlocked ? "#38bdf8" : "#475569"}
        />
        <path
          d="M22 78L23 80.5L25.5 81.5L23 82.5L22 85L21 82.5L18.5 81.5L21 80.5Z"
          fill={isUnlocked ? "#38bdf8" : "#475569"}
        />
      </g>

      {/* Earth Body */}
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="url(#earthGrad)"
        stroke={isUnlocked ? "#7dd3fc" : "#475569"}
        strokeWidth={isUnlocked ? "1.8" : "1"}
      />

      {/* Stylized Continents */}
      <g clipPath="url(#earthClip)">
        <clipPath id="earthClip">
          <circle cx="50" cy="50" r="27" />
        </clipPath>
        <path
          d="M42 34C44 32 49 33 52 36C55 39 53 43 50 45C47 47 43 45 40 43C37 41 40 36 42 34Z"
          fill="url(#landGrad)"
          opacity={isUnlocked ? "0.85" : "0.4"}
        />
        <path
          d="M58 48C62 47 66 50 68 54C70 58 66 62 62 63C58 64 56 60 55 56C54 52 54 49 58 48Z"
          fill="url(#landGrad)"
          opacity={isUnlocked ? "0.85" : "0.4"}
        />
        <path
          d="M32 54C34 52 38 53 40 56C42 59 39 63 36 64C33 65 30 62 29 59C28 56 30 55 32 54Z"
          fill="url(#landGrad)"
          opacity={isUnlocked ? "0.85" : "0.4"}
        />
      </g>

      {/* Atmosphere Crescent Rim */}
      <path
        d="M26 40C30 30 40 24 52 24C60 24 67 28 72 34"
        stroke={isUnlocked ? "#e0f2fe" : "#94a3b8"}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={isUnlocked ? "0.9" : "0.3"}
      />
    </svg>
  );
}

/**
 * Stage 2: Solar Navigator — Planets and Orbital Rings
 */
export function PlanetsAndRingsGraphic({
  isUnlocked,
  reducedMotion,
  size = 72,
  className = "",
}: {
  isUnlocked: boolean;
  reducedMotion?: boolean;
  size?: number;
  className?: string;
}) {
  const spinSlow = isUnlocked && !reducedMotion ? "animate-[spin_48s_linear_infinite]" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Solar Navigator Planets and Rings Emblem"
    >
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isUnlocked ? "#f59e0b" : "#475569"} stopOpacity="0.4" />
          <stop offset="100%" stopColor={isUnlocked ? "#b45309" : "#1e293b"} stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="planetGrad"
          x1="30"
          y1="30"
          x2="70"
          y2="70"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={isUnlocked ? "#fbbf24" : "#475569"} />
          <stop offset="50%" stopColor={isUnlocked ? "#d97706" : "#334155"} />
          <stop offset="100%" stopColor={isUnlocked ? "#78350f" : "#0f172a"} />
        </linearGradient>
      </defs>

      {/* Golden Orbital Aura */}
      <circle cx="50" cy="50" r="46" fill="url(#sunGlow)" />

      {/* Outer Orbit Path 1 */}
      <ellipse
        cx="50"
        cy="50"
        rx="44"
        ry="24"
        transform="rotate(-25 50 50)"
        stroke={isUnlocked ? "#f59e0b" : "#334155"}
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity={isUnlocked ? "0.75" : "0.3"}
        className={spinSlow}
      />

      {/* Inner Orbit Path 2 */}
      <ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="18"
        transform="rotate(35 50 50)"
        stroke={isUnlocked ? "#fbbf24" : "#475569"}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        opacity={isUnlocked ? "0.6" : "0.25"}
      />

      {/* Orbiting Moon 1 */}
      <circle
        cx="82"
        cy="34"
        r="4"
        fill={isUnlocked ? "#fef08a" : "#64748b"}
        stroke={isUnlocked ? "#d97706" : "#334155"}
        strokeWidth="1"
      />

      {/* Orbiting Moon 2 */}
      <circle
        cx="22"
        cy="68"
        r="3"
        fill={isUnlocked ? "#fed7aa" : "#475569"}
        stroke={isUnlocked ? "#b45309" : "#334155"}
        strokeWidth="0.8"
      />

      {/* Back Half of Saturnian Rings */}
      <ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="11"
        transform="rotate(-20 50 50)"
        stroke={isUnlocked ? "#fde68a" : "#475569"}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity={isUnlocked ? "0.5" : "0.25"}
      />

      {/* Main Gas Giant Planet Body */}
      <circle
        cx="50"
        cy="50"
        r="19"
        fill="url(#planetGrad)"
        stroke={isUnlocked ? "#fef3c7" : "#64748b"}
        strokeWidth="1.5"
      />

      {/* Planetary Atmosphere Bands */}
      <g clipPath="url(#planetClip)">
        <clipPath id="planetClip">
          <circle cx="50" cy="50" r="18" />
        </clipPath>
        <path
          d="M30 46Q50 52 70 46"
          stroke={isUnlocked ? "#fef08a" : "#64748b"}
          strokeWidth="1.6"
          opacity="0.6"
        />
        <path
          d="M30 52Q50 58 70 52"
          stroke={isUnlocked ? "#92400e" : "#1e293b"}
          strokeWidth="2.2"
          opacity="0.7"
        />
        <path
          d="M32 58Q50 63 68 58"
          stroke={isUnlocked ? "#fef08a" : "#64748b"}
          strokeWidth="1.4"
          opacity="0.5"
        />
      </g>

      {/* Front Half of Primary Rings */}
      <ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="11"
        transform="rotate(-20 50 50)"
        stroke={isUnlocked ? "#fef08a" : "#64748b"}
        strokeWidth="3.2"
        strokeDasharray="56 80"
        strokeDashoffset="12"
        opacity={isUnlocked ? "0.95" : "0.4"}
      />
    </svg>
  );
}

/**
 * Stage 3: Stellar Explorer — Glowing Stellar Nursery
 */
export function StellarNurseryGraphic({
  isUnlocked,
  reducedMotion,
  size = 72,
  className = "",
}: {
  isUnlocked: boolean;
  reducedMotion?: boolean;
  size?: number;
  className?: string;
}) {
  const pulseClass = isUnlocked && !reducedMotion ? "animate-pulse" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Stellar Explorer Glowing Nursery Emblem"
    >
      <defs>
        <radialGradient id="nebulaCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isUnlocked ? "#f472b6" : "#475569"} stopOpacity="0.8" />
          <stop offset="40%" stopColor={isUnlocked ? "#db2777" : "#334155"} stopOpacity="0.5" />
          <stop offset="80%" stopColor={isUnlocked ? "#7e22ce" : "#1e293b"} stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glowing Emission Cloud */}
      <circle cx="50" cy="50" r="44" fill="url(#nebulaCore)" className={pulseClass} />

      {/* Filament Clouds */}
      <path
        d="M20 50C25 35 40 30 52 35C65 40 78 30 82 45C86 60 70 75 52 70C35 65 28 80 18 68C12 60 16 55 20 50Z"
        fill={isUnlocked ? "#ec4899" : "#334155"}
        opacity={isUnlocked ? "0.25" : "0.15"}
      />
      <path
        d="M32 40C38 28 55 25 65 32C75 40 72 58 60 62C48 66 42 55 35 58C28 62 25 50 32 40Z"
        fill={isUnlocked ? "#a855f7" : "#475569"}
        opacity={isUnlocked ? "0.35" : "0.2"}
      />

      {/* Newborn Protostar Flare - Center */}
      <circle cx="50" cy="50" r="9" fill={isUnlocked ? "#fdf2f8" : "#94a3b8"} />
      <circle
        cx="50"
        cy="50"
        r="14"
        fill={isUnlocked ? "#f472b6" : "#64748b"}
        opacity={isUnlocked ? "0.5" : "0.25"}
      />

      {/* Diffraction Spikes */}
      <line
        x1="50"
        y1="16"
        x2="50"
        y2="84"
        stroke={isUnlocked ? "#fbcfe8" : "#64748b"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={isUnlocked ? "0.9" : "0.3"}
      />
      <line
        x1="16"
        y1="50"
        x2="84"
        y2="50"
        stroke={isUnlocked ? "#fbcfe8" : "#64748b"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={isUnlocked ? "0.9" : "0.3"}
      />
      <line
        x1="26"
        y1="26"
        x2="74"
        y2="74"
        stroke={isUnlocked ? "#f472b6" : "#475569"}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity={isUnlocked ? "0.6" : "0.2"}
      />
      <line
        x1="74"
        y1="26"
        x2="26"
        y2="74"
        stroke={isUnlocked ? "#f472b6" : "#475569"}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity={isUnlocked ? "0.6" : "0.2"}
      />

      {/* Secondary Stellar Clusters */}
      <circle cx="28" cy="34" r="2.5" fill={isUnlocked ? "#fdf2f8" : "#64748b"} />
      <circle cx="72" cy="38" r="2" fill={isUnlocked ? "#fdf2f8" : "#64748b"} />
      <circle cx="68" cy="66" r="3" fill={isUnlocked ? "#fdf2f8" : "#64748b"} />
      <circle cx="32" cy="68" r="2" fill={isUnlocked ? "#fdf2f8" : "#64748b"} />
    </svg>
  );
}

/**
 * Stage 4: Galactic Voyager — Spiral Galaxy
 */
export function SpiralGalaxyGraphic({
  isUnlocked,
  reducedMotion,
  size = 72,
  className = "",
}: {
  isUnlocked: boolean;
  reducedMotion?: boolean;
  size?: number;
  className?: string;
}) {
  const spinGalaxy = isUnlocked && !reducedMotion ? "animate-[spin_32s_linear_infinite]" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Galactic Voyager Spiral Galaxy Emblem"
    >
      <defs>
        <radialGradient id="galacticCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isUnlocked ? "#ffffff" : "#94a3b8"} />
          <stop offset="25%" stopColor={isUnlocked ? "#c084fc" : "#64748b"} />
          <stop offset="65%" stopColor={isUnlocked ? "#7e22ce" : "#334155"} stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Galactic Halo */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="url(#galacticCore)"
        opacity={isUnlocked ? "0.7" : "0.3"}
      />

      {/* Rotating Spiral Arms */}
      <g className={spinGalaxy} style={{ transformOrigin: "50px 50px" }}>
        {/* Arm A */}
        <path
          d="M50 50C54 44 64 42 72 48C80 54 82 66 74 76C68 84 54 86 42 84C26 80 14 62 18 42C22 22 42 10 64 12"
          stroke={isUnlocked ? "#d8b4fe" : "#64748b"}
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity={isUnlocked ? "0.9" : "0.35"}
        />
        {/* Arm B */}
        <path
          d="M50 50C46 56 36 58 28 52C20 46 18 34 26 24C32 16 46 14 58 16C74 20 86 38 82 58C78 78 58 90 36 88"
          stroke={isUnlocked ? "#a855f7" : "#475569"}
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity={isUnlocked ? "0.85" : "0.35"}
        />

        {/* Arm Knots & Starbursts */}
        <circle cx="68" cy="46" r="2.5" fill={isUnlocked ? "#f3e8ff" : "#64748b"} />
        <circle cx="75" cy="72" r="3" fill={isUnlocked ? "#e9d5ff" : "#64748b"} />
        <circle cx="28" cy="54" r="2.5" fill={isUnlocked ? "#f3e8ff" : "#64748b"} />
        <circle cx="25" cy="28" r="3" fill={isUnlocked ? "#e9d5ff" : "#64748b"} />
        <circle cx="58" cy="85" r="2" fill={isUnlocked ? "#d8b4fe" : "#64748b"} />
        <circle cx="42" cy="15" r="2" fill={isUnlocked ? "#d8b4fe" : "#64748b"} />
      </g>

      {/* Galactic Bulge Nucleus */}
      <circle cx="50" cy="50" r="8" fill={isUnlocked ? "#ffffff" : "#cbd5e1"} />
      <circle
        cx="50"
        cy="50"
        r="13"
        fill={isUnlocked ? "#c084fc" : "#64748b"}
        opacity={isUnlocked ? "0.6" : "0.25"}
      />
    </svg>
  );
}

/**
 * Stage 5: Cosmic Historian — Expanding Cosmic Horizon
 */
export function CosmicHorizonGraphic({
  isUnlocked,
  reducedMotion,
  size = 72,
  className = "",
}: {
  isUnlocked: boolean;
  reducedMotion?: boolean;
  size?: number;
  className?: string;
}) {
  const pulseClass = isUnlocked && !reducedMotion ? "animate-pulse" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cosmic Historian Expanding Horizon Emblem"
    >
      <defs>
        <radialGradient id="bigBangOrigin" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isUnlocked ? "#ffffff" : "#cbd5e1"} />
          <stop offset="20%" stopColor={isUnlocked ? "#fb7185" : "#64748b"} />
          <stop offset="60%" stopColor={isUnlocked ? "#be123c" : "#334155"} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Horizon Ripple 3 (Oldest CMB Outer Edge) */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={isUnlocked ? "#f43f5e" : "#334155"}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity={isUnlocked ? "0.8" : "0.3"}
        className={pulseClass}
      />

      {/* Horizon Ripple 2 (Galactic Formation Era) */}
      <circle
        cx="50"
        cy="50"
        r="32"
        stroke={isUnlocked ? "#fb7185" : "#475569"}
        strokeWidth="1.8"
        strokeDasharray="5 3"
        opacity={isUnlocked ? "0.85" : "0.35"}
      />

      {/* Horizon Ripple 1 (Recombination CMB) */}
      <circle
        cx="50"
        cy="50"
        r="20"
        stroke={isUnlocked ? "#fda4af" : "#64748b"}
        strokeWidth="2"
        opacity={isUnlocked ? "0.9" : "0.4"}
      />

      {/* Cosmic Expansion Vector Cones */}
      <path
        d="M50 50L84 20M50 50L84 80M50 50L16 20M50 50L16 80"
        stroke={isUnlocked ? "#f43f5e" : "#475569"}
        strokeWidth="1.2"
        opacity={isUnlocked ? "0.6" : "0.2"}
      />

      {/* 13.8 Billion Year Timeline Arrow */}
      <path
        d="M18 50L82 50M74 44L82 50L74 56"
        stroke={isUnlocked ? "#ffe4e6" : "#94a3b8"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Singularity / Primordial Point */}
      <circle cx="50" cy="50" r="7" fill="url(#bigBangOrigin)" />
      <circle cx="50" cy="50" r="3.5" fill={isUnlocked ? "#ffffff" : "#e2e8f0"} />
    </svg>
  );
}

/**
 * Stage 6: Space Scientist — Observatory and Celestial Geometry
 */
export function SpaceScientistGraphic({
  isUnlocked,
  reducedMotion,
  size = 72,
  className = "",
}: {
  isUnlocked: boolean;
  reducedMotion?: boolean;
  size?: number;
  className?: string;
}) {
  const pulseClass = isUnlocked && !reducedMotion ? "animate-pulse" : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Space Scientist Observatory and Geometry Emblem"
    >
      <defs>
        <radialGradient id="laserGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isUnlocked ? "#34d399" : "#475569"} stopOpacity="0.5" />
          <stop offset="100%" stopColor={isUnlocked ? "#059669" : "#1e293b"} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Celestial Coordinate Reticle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke={isUnlocked ? "#10b981" : "#334155"}
        strokeWidth="1"
        opacity={isUnlocked ? "0.6" : "0.25"}
      />
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke={isUnlocked ? "#34d399" : "#334155"}
        strokeWidth="0.8"
        strokeDasharray="3 3"
        opacity={isUnlocked ? "0.5" : "0.2"}
      />

      {/* Astrometry Crosshairs */}
      <line
        x1="50"
        y1="5"
        x2="50"
        y2="95"
        stroke={isUnlocked ? "#10b981" : "#334155"}
        strokeWidth="1"
        opacity={isUnlocked ? "0.5" : "0.2"}
      />
      <line
        x1="5"
        y1="50"
        x2="95"
        y2="50"
        stroke={isUnlocked ? "#10b981" : "#334155"}
        strokeWidth="1"
        opacity={isUnlocked ? "0.5" : "0.2"}
      />

      {/* Laser Guide Star Collimation Beam */}
      <line
        x1="50"
        y1="56"
        x2="78"
        y2="12"
        stroke={isUnlocked ? "#6ee7b7" : "#64748b"}
        strokeWidth="2.5"
        strokeLinecap="round"
        className={pulseClass}
      />
      <circle
        cx="78"
        cy="12"
        r="3.5"
        fill={isUnlocked ? "#a7f3d0" : "#94a3b8"}
        className={pulseClass}
      />

      {/* Observatory Dome Base / Foundation */}
      <path
        d="M26 78H74V84H26V78Z"
        fill={isUnlocked ? "#064e3b" : "#1e293b"}
        stroke={isUnlocked ? "#10b981" : "#475569"}
        strokeWidth="1.5"
      />

      {/* Observatory Dome Hemisphere */}
      <path
        d="M30 78C30 62 40 50 50 50C60 50 70 62 70 78H30Z"
        fill={isUnlocked ? "#047857" : "#334155"}
        stroke={isUnlocked ? "#34d399" : "#64748b"}
        strokeWidth="1.8"
      />

      {/* Open Dome Slit */}
      <path
        d="M47 50C47 50 49 64 49 78H53C53 64 55 50 55 50H47Z"
        fill={isUnlocked ? "#022c22" : "#0f172a"}
        stroke={isUnlocked ? "#a7f3d0" : "#475569"}
        strokeWidth="1.2"
      />

      {/* Celestial Hexagonal Astrometry Lattice */}
      <polygon
        points="50,15 76,30 76,60 50,75 24,60 24,30"
        stroke={isUnlocked ? "#6ee7b7" : "#334155"}
        strokeWidth="1.2"
        fill="none"
        opacity={isUnlocked ? "0.7" : "0.25"}
      />
    </svg>
  );
}
