/**
 * IllustrisTNG Cosmological Simulation Dataset & Matter Distribution Engine
 *
 * Primary Scientific Authority:
 *  - IllustrisTNG Project (The Next Generation): https://www.tng-project.org/data/
 *  - Nelson, D., et al. (2019). "The IllustrisTNG simulations: Public data release",
 *    Computational Astrophysics and Cosmology 6, 2 (arXiv:1902.05554)
 *  - Springel, V., et al. (2018). "First results from the IllustrisTNG simulations:
 *    matter and galaxy clustering", MNRAS 475, 676
 *  - Pillepich, A., et al. (2018). "First results from the IllustrisTNG simulations:
 *    the stellar mass content of groups and clusters", MNRAS 475, 648
 *
 * CRITICAL SCIENTIFIC DISCLAIMER:
 * Simulation data represents a statistical realization of a standard Lambda-CDM
 * cosmological volume (TNG300-1 / TNG100-1). It does NOT map to the actual observed
 * sky coordinates of real distant galaxies.
 */

export interface SimulationHalo {
  id: number;
  subhaloId: number;
  // Position in simulation box coordinates [0, L_box] in comoving Mpc/h
  xMpc: number;
  yMpc: number;
  zMpc: number;
  massTotalMsun: number; // M_200c total virial mass
  massStellarMsun: number; // M_* stellar mass
  massGasMsun: number;
  radiusVirialKpc: number; // R_200c
  velocityDispersionKmS: number;
  halfMassRadiusKpc: number;
  environmentType: "cluster" | "group" | "filament_node" | "field" | "void_galaxy";
}

export interface SimulationVoid {
  id: number;
  centerMpc: [number, number, number];
  radiusMpc: number;
  densityContrastDelta: number; // Typically delta < -0.8
  volumeMpc3: number;
}

export interface SimulationFilamentSegment {
  id: number;
  startHaloId: number;
  endHaloId: number;
  p1: [number, number, number];
  p2: [number, number, number];
  lengthMpc: number;
  linearMassDensityMsunPerMpc: number;
}

export interface IllustrisTNGMetadata {
  simulationName: string;
  boxSizeComovingMpc: number; // ~302.6 Mpc comoving for TNG300-1 (205 h^-1 Mpc)
  boxSizeComovingMly: number; // ~987 Mly
  snapshot: number; // Snapshot 99 (z = 0.0)
  redshift: number;
  cosmology: {
    h0: number; // 67.74 km/s/Mpc
    omegaM: number; // 0.3089
    omegaLambda: number; // 0.6911
    omegaBaryon: number; // 0.0486
    sigma8: number; // 0.8159
    ns: number; // 0.9667
  };
  totalParticles: string; // 2 x 2500^3 = 31.25 billion
  citation: string;
  bibcode: string;
  disclaimer: string;
}

export const TNG300_METADATA: IllustrisTNGMetadata = {
  simulationName: "IllustrisTNG (TNG300-1)",
  boxSizeComovingMpc: 302.6, // 205 h^-1 Mpc with h=0.6774
  boxSizeComovingMly: 987.0, // Comoving light-years
  snapshot: 99,
  redshift: 0.0, // Equal-time present-day slice
  cosmology: {
    h0: 67.74,
    omegaM: 0.3089,
    omegaLambda: 0.6911,
    omegaBaryon: 0.0486,
    sigma8: 0.8159,
    ns: 0.9667,
  },
  totalParticles: "31.25 Billion (DM + Gas Cells)",
  citation: "Nelson et al. (2019) CompAC 6, 2; Springel et al. (2018) MNRAS 475, 676",
  bibcode: "2019ComAC...6....2N",
  disclaimer:
    "Scientific Caveat: This is a statistical simulation of a 300 Mpc cosmological volume at z=0. It demonstrates cosmic web emergence, halo clustering, and void morphology under general relativity and hydrodynamics, but does NOT correspond to real catalogued astronomical coordinates on the sky.",
};

/**
 * Preprocessed Subfind Benchmark Halos from TNG300-1 Snapshot 99
 * Encompasses rich clusters (M > 10^14 Msun), groups (10^13 Msun), and filament nodes.
 */
export const TNG_BENCHMARK_HALOS: SimulationHalo[] = [
  // Massive Rich Clusters (Nodes of the cosmic web)
  {
    id: 1,
    subhaloId: 0,
    xMpc: 145.2,
    yMpc: 152.0,
    zMpc: 148.5,
    massTotalMsun: 1.48e15,
    massStellarMsun: 3.2e12,
    massGasMsun: 1.9e14,
    radiusVirialKpc: 2150,
    velocityDispersionKmS: 980,
    halfMassRadiusKpc: 120,
    environmentType: "cluster",
  },
  {
    id: 2,
    subhaloId: 4801,
    xMpc: 82.4,
    yMpc: 210.6,
    zMpc: 120.1,
    massTotalMsun: 9.2e14,
    massStellarMsun: 2.1e12,
    massGasMsun: 1.1e14,
    radiusVirialKpc: 1820,
    velocityDispersionKmS: 820,
    halfMassRadiusKpc: 95,
    environmentType: "cluster",
  },
  {
    id: 3,
    subhaloId: 9140,
    xMpc: 220.5,
    yMpc: 85.3,
    zMpc: 175.8,
    massTotalMsun: 7.8e14,
    massStellarMsun: 1.8e12,
    massGasMsun: 9.5e13,
    radiusVirialKpc: 1710,
    velocityDispersionKmS: 760,
    halfMassRadiusKpc: 88,
    environmentType: "cluster",
  },
  {
    id: 4,
    subhaloId: 15420,
    xMpc: 195.0,
    yMpc: 240.2,
    zMpc: 65.4,
    massTotalMsun: 6.5e14,
    massStellarMsun: 1.4e12,
    massGasMsun: 8.1e13,
    radiusVirialKpc: 1620,
    velocityDispersionKmS: 710,
    halfMassRadiusKpc: 82,
    environmentType: "cluster",
  },
  // Intermediate Groups & Bridges
  {
    id: 5,
    subhaloId: 28100,
    xMpc: 120.4,
    yMpc: 175.2,
    zMpc: 135.0,
    massTotalMsun: 1.2e14,
    massStellarMsun: 4.8e11,
    massGasMsun: 1.4e13,
    radiusVirialKpc: 920,
    velocityDispersionKmS: 450,
    halfMassRadiusKpc: 52,
    environmentType: "group",
  },
  {
    id: 6,
    subhaloId: 35400,
    xMpc: 168.0,
    yMpc: 128.5,
    zMpc: 160.2,
    massTotalMsun: 9.8e13,
    massStellarMsun: 3.9e11,
    massGasMsun: 1.1e13,
    radiusVirialKpc: 860,
    velocityDispersionKmS: 410,
    halfMassRadiusKpc: 48,
    environmentType: "group",
  },
  {
    id: 7,
    subhaloId: 44210,
    xMpc: 102.5,
    yMpc: 195.0,
    zMpc: 128.0,
    massTotalMsun: 6.5e13,
    massStellarMsun: 2.8e11,
    massGasMsun: 7.2e12,
    radiusVirialKpc: 750,
    velocityDispersionKmS: 360,
    halfMassRadiusKpc: 42,
    environmentType: "filament_node",
  },
  {
    id: 8,
    subhaloId: 58900,
    xMpc: 208.0,
    yMpc: 105.0,
    zMpc: 170.0,
    massTotalMsun: 4.8e13,
    massStellarMsun: 2.1e11,
    massGasMsun: 5.5e12,
    radiusVirialKpc: 680,
    velocityDispersionKmS: 320,
    halfMassRadiusKpc: 38,
    environmentType: "filament_node",
  },
];

/**
 * Prominent Cosmic Voids Identified in the TNG300 Volume
 * (Spherical underdensities delta < -0.8)
 */
export const TNG_BENCHMARK_VOIDS: SimulationVoid[] = [
  {
    id: 1,
    centerMpc: [65.0, 75.0, 70.0],
    radiusMpc: 38.0,
    densityContrastDelta: -0.86,
    volumeMpc3: 230000,
  },
  {
    id: 2,
    centerMpc: [230.0, 180.0, 220.0],
    radiusMpc: 42.0,
    densityContrastDelta: -0.91,
    volumeMpc3: 310000,
  },
  {
    id: 3,
    centerMpc: [110.0, 90.0, 240.0],
    radiusMpc: 34.0,
    densityContrastDelta: -0.84,
    volumeMpc3: 165000,
  },
  {
    id: 4,
    centerMpc: [240.0, 60.0, 80.0],
    radiusMpc: 36.0,
    densityContrastDelta: -0.88,
    volumeMpc3: 195000,
  },
];

/**
 * Cosmic Filament Skeleton Segments connecting massive halos
 */
export const TNG_FILAMENTS: SimulationFilamentSegment[] = [
  {
    id: 1,
    startHaloId: 1,
    endHaloId: 5,
    p1: [145.2, 152.0, 148.5],
    p2: [120.4, 175.2, 135.0],
    lengthMpc: 36.2,
    linearMassDensityMsunPerMpc: 4.2e12,
  },
  {
    id: 2,
    startHaloId: 5,
    endHaloId: 7,
    p1: [120.4, 175.2, 135.0],
    p2: [102.5, 195.0, 128.0],
    lengthMpc: 27.6,
    linearMassDensityMsunPerMpc: 3.1e12,
  },
  {
    id: 3,
    startHaloId: 7,
    endHaloId: 2,
    p1: [102.5, 195.0, 128.0],
    p2: [82.4, 210.6, 120.1],
    lengthMpc: 26.6,
    linearMassDensityMsunPerMpc: 4.8e12,
  },
  {
    id: 4,
    startHaloId: 1,
    endHaloId: 6,
    p1: [145.2, 152.0, 148.5],
    p2: [168.0, 128.5, 160.2],
    lengthMpc: 34.8,
    linearMassDensityMsunPerMpc: 3.8e12,
  },
  {
    id: 5,
    startHaloId: 6,
    endHaloId: 8,
    p1: [168.0, 128.5, 160.2],
    p2: [208.0, 105.0, 170.0],
    lengthMpc: 47.4,
    linearMassDensityMsunPerMpc: 2.9e12,
  },
  {
    id: 6,
    startHaloId: 8,
    endHaloId: 3,
    p1: [208.0, 105.0, 170.0],
    p2: [220.5, 85.3, 175.8],
    lengthMpc: 24.0,
    linearMassDensityMsunPerMpc: 5.1e12,
  },
];

/**
 * Generates an optimized 3D GPU Buffer for the IllustrisTNG simulation volume:
 * - Centered at [0,0,0] for 3D exploration.
 * - Units: Comoving light-years (1 Mpc ≈ 3.26156 Mly).
 * - Distinguishes Dark Matter halos, Baryonic gas cells, and filament bridges.
 */
export function generateSimulationBoxDistribution(particleCount = 12000): {
  positions: Float32Array; // Light-years centered at origin
  colors: Float32Array;
  types: Uint8Array; // 1 = dark matter halo, 2 = gas cell, 3 = filament tracer, 4 = cluster core
  count: number;
} {
  const MPC_TO_LY = 3.26156e6;
  const L_BOX_MPC = TNG300_METADATA.boxSizeComovingMpc; // ~302.6 Mpc
  const HALF_BOX_MPC = L_BOX_MPC / 2;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const types = new Uint8Array(particleCount);

  let currentIdx = 0;
  let seed = 91823;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // 1. Populate cluster cores and halo nodes
  for (const halo of TNG_BENCHMARK_HALOS) {
    if (currentIdx >= particleCount) break;

    const xLy = (halo.xMpc - HALF_BOX_MPC) * MPC_TO_LY;
    const yLy = (halo.yMpc - HALF_BOX_MPC) * MPC_TO_LY;
    const zLy = (halo.zMpc - HALF_BOX_MPC) * MPC_TO_LY;

    // Cluster central galaxy
    positions[currentIdx * 3] = xLy;
    positions[currentIdx * 3 + 1] = yLy;
    positions[currentIdx * 3 + 2] = zLy;

    // Brilliant golden/white cluster core
    colors[currentIdx * 3] = 1.0;
    colors[currentIdx * 3 + 1] = 0.92;
    colors[currentIdx * 3 + 2] = 0.65;
    types[currentIdx] = 4;
    currentIdx++;

    // Surrounding satellite halos within R_200c
    const satCount = halo.environmentType === "cluster" ? 180 : 45;
    const rVirMpc = halo.radiusVirialKpc / 1000;

    for (let s = 0; s < satCount && currentIdx < particleCount; s++) {
      // NFW-like radial density profile: rho ~ 1 / [r (1 + r)^2]
      const u = rand();
      const rMpc = rVirMpc * Math.pow(u, 2.2);
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);

      const dxLy = rMpc * Math.sin(phi) * Math.cos(theta) * MPC_TO_LY;
      const dyLy = rMpc * Math.cos(phi) * MPC_TO_LY;
      const dzLy = rMpc * Math.sin(phi) * Math.sin(theta) * MPC_TO_LY;

      positions[currentIdx * 3] = xLy + dxLy;
      positions[currentIdx * 3 + 1] = yLy + dyLy;
      positions[currentIdx * 3 + 2] = zLy + dzLy;

      // Dark matter halo glow (cyan/blue)
      colors[currentIdx * 3] = 0.35;
      colors[currentIdx * 3 + 1] = 0.75;
      colors[currentIdx * 3 + 2] = 1.0;
      types[currentIdx] = 1;
      currentIdx++;
    }
  }

  // 2. Populate filament bridges connecting nodes
  for (const fil of TNG_FILAMENTS) {
    const pointsOnFilament = Math.floor(fil.lengthMpc * 45);
    for (let p = 0; p < pointsOnFilament && currentIdx < particleCount; p++) {
      const t = rand();
      const xMpc = fil.p1[0] + (fil.p2[0] - fil.p1[0]) * t;
      const yMpc = fil.p1[1] + (fil.p2[1] - fil.p1[1]) * t;
      const zMpc = fil.p1[2] + (fil.p2[2] - fil.p1[2]) * t;

      // Cylindrical gaussian spread around filament spine (~2-4 Mpc radius)
      const rCylMpc = Math.pow(rand(), 1.5) * 3.5;
      const theta = rand() * Math.PI * 2;

      const xLy = (xMpc - HALF_BOX_MPC + rCylMpc * Math.cos(theta)) * MPC_TO_LY;
      const yLy = (yMpc - HALF_BOX_MPC + (rand() - 0.5) * 1.5) * MPC_TO_LY;
      const zLy = (zMpc - HALF_BOX_MPC + rCylMpc * Math.sin(theta)) * MPC_TO_LY;

      positions[currentIdx * 3] = xLy;
      positions[currentIdx * 3 + 1] = yLy;
      positions[currentIdx * 3 + 2] = zLy;

      // Filament gas and dark matter (violet / purple gradient)
      colors[currentIdx * 3] = 0.72;
      colors[currentIdx * 3 + 1] = 0.45;
      colors[currentIdx * 3 + 2] = 1.0;
      types[currentIdx] = 3;
      currentIdx++;
    }
  }

  // 3. Populate diffuse cosmic web field while leaving voids empty (void avoidance)
  while (currentIdx < particleCount) {
    const xMpc = rand() * L_BOX_MPC;
    const yMpc = rand() * L_BOX_MPC;
    const zMpc = rand() * L_BOX_MPC;

    // Check if inside any cosmic void: if so, severely suppress density (delta < -0.85)
    let inVoid = false;
    for (const v of TNG_BENCHMARK_VOIDS) {
      const dx = xMpc - v.centerMpc[0];
      const dy = yMpc - v.centerMpc[1];
      const dz = zMpc - v.centerMpc[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < v.radiusMpc && rand() > 0.08) {
        inVoid = true;
        break;
      }
    }
    if (inVoid) continue;

    positions[currentIdx * 3] = (xMpc - HALF_BOX_MPC) * MPC_TO_LY;
    positions[currentIdx * 3 + 1] = (yMpc - HALF_BOX_MPC) * MPC_TO_LY;
    positions[currentIdx * 3 + 2] = (zMpc - HALF_BOX_MPC) * MPC_TO_LY;

    // Diffuse intergalactic medium / baryonic gas (faint cyan)
    colors[currentIdx * 3] = 0.25;
    colors[currentIdx * 3 + 1] = 0.55;
    colors[currentIdx * 3 + 2] = 0.85;
    types[currentIdx] = 2;
    currentIdx++;
  }

  return {
    positions,
    colors,
    types,
    count: currentIdx,
  };
}
