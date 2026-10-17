/**
 * Validation Suite for Astronomical Observation Layer, Aladin Lite Integration,
 * Sky Survey Coverage, and Celestial Projection-Depth Invariants.
 */

import {
  OBSERVATION_REGISTRY,
  getAllObservationTargets,
  getObservationEvidence,
} from "../src/lib/astronomy/observation/asset-registry";
import {
  calculateAngularSeparationDeg,
  analyzeProjectionDifference,
  formatRaHms,
  formatDecDms,
} from "../src/lib/astronomy/observation/projection-difference";
import {
  icrsToGalacticSpherical,
  galacticToIcrsSpherical,
} from "../src/lib/astronomy/reference-frames";
import { HIPS_SURVEYS } from "../src/lib/astronomy/observation/aladin-service";
import { type WavelengthBand } from "../src/lib/astronomy/observation/types";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

function assertClose(actual: number, expected: number, tolerance: number, message: string) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(
      `  [PASS] ${message} (actual: ${actual.toFixed(4)}, expected: ${expected.toFixed(4)}, diff: ${diff.toExponential(2)})`,
    );
    passCount++;
  } else {
    console.error(
      `  [FAIL] ${message} (actual: ${actual.toFixed(4)}, expected: ${expected.toFixed(4)}, diff: ${diff.toExponential(2)}, tol: ${tolerance})`,
    );
    failCount++;
  }
}

console.log("=== ASTRONOMICAL OBSERVATION LAYER & SKY SURVEY VALIDATION ===\n");

// 1. Astrometric Coordinate Transforms & Bidirectional Invariants
console.log("1. Astrometric Coordinate Systems & Round-Trip Precision:");

const targets = getAllObservationTargets();
assert(
  targets.length >= 5,
  `Registry contains ${targets.length} curated astronomical targets (minimum 5 required)`,
);

targets.forEach((t) => {
  // Test forward transform: ICRS (RA, Dec) -> Galactic (l, b)
  const gal = icrsToGalacticSpherical(t.raDeg, t.decDeg, t.distanceLy);
  assertClose(
    gal.lonDeg,
    t.galacticL,
    0.25,
    `${t.targetName} ICRS -> Galactic longitude l ≈ ${t.galacticL.toFixed(1)}°`,
  );
  assertClose(
    gal.latDeg,
    t.galacticB,
    0.25,
    `${t.targetName} ICRS -> Galactic latitude b ≈ ${t.galacticB.toFixed(1)}°`,
  );

  // Test exact inverse transform: Galactic (l, b) -> ICRS (RA, Dec)
  const icrs = galacticToIcrsSpherical(t.galacticL, t.galacticB, t.distanceLy);
  assertClose(
    icrs.lonDeg,
    t.raDeg,
    0.25,
    `${t.targetName} Galactic -> ICRS RA ≈ ${t.raDeg.toFixed(3)}°`,
  );
  assertClose(
    icrs.latDeg,
    t.decDeg,
    0.25,
    `${t.targetName} Galactic -> ICRS Dec ≈ ${t.decDeg.toFixed(3)}°`,
  );

  // Round-trip precision test (RA, Dec -> l, b -> RA, Dec)
  const roundTrip = galacticToIcrsSpherical(gal.lonDeg, gal.latDeg, t.distanceLy);
  assertClose(
    roundTrip.lonDeg,
    t.raDeg,
    0.001,
    `${t.targetName} RA round-trip error < 0.001° (< 3.6 arcsec)`,
  );
  assertClose(
    roundTrip.latDeg,
    t.decDeg,
    0.001,
    `${t.targetName} Dec round-trip error < 0.001° (< 3.6 arcsec)`,
  );
});

// 2. Sexagesimal Coordinate Formatting
console.log("\n2. Sexagesimal String Formatting (HMS / DMS):");
const testRaHms = formatRaHms(83.82208);
assert(
  testRaHms.startsWith("05h 35m"),
  `Orion RA 83.82208° formats as 05h 35m... (actual: ${testRaHms})`,
);
const testDecDms = formatDecDms(-5.39111);
assert(
  testDecDms.startsWith("-05° 23′"),
  `Orion Dec -5.39111° formats as -05° 23′... (actual: ${testDecDms})`,
);

// 3. Multi-Wavelength Survey Coverage & Unavailable Handling
console.log("\n3. Multi-Wavelength Survey Invariants (Optical, IR, UV, Radio, X-ray):");
const requiredBands: WavelengthBand[] = ["optical", "infrared", "ultraviolet", "radio", "xray"];

targets.forEach((t) => {
  requiredBands.forEach((band) => {
    const survey = t.surveys[band];
    assert(survey !== undefined, `${t.targetName} documents survey coverage for ${band}`);
    if (!survey.available) {
      assert(
        typeof survey.unavailableReason === "string" && survey.unavailableReason.length > 20,
        `${t.targetName} provides explicit scientific rationale for unavailable ${band} survey`,
      );
    } else {
      assert(
        survey.hipsId.startsWith("CDS/P/"),
        `${t.targetName} ${band} references valid IVOA HiPS identifier (${survey.hipsId})`,
      );
    }
  });
});

// Specific Physical Survey Invariants
const sgra = getObservationEvidence("sgra")!;
assert(
  sgra.surveys.optical.available === false,
  "Sgr A* optical observation correctly marked UNAVAILABLE due to dust extinction",
);
assert(
  sgra.surveys.ultraviolet.available === false,
  "Sgr A* UV observation correctly marked UNAVAILABLE",
);
assert(sgra.surveys.radio.available === true, "Sgr A* radio survey (EHT/VLA) marked AVAILABLE");
assert(sgra.surveys.xray.available === true, "Sgr A* X-ray survey (Chandra) marked AVAILABLE");

const betelgeuse = getObservationEvidence("betelgeuse")!;
assert(
  betelgeuse.surveys.xray.available === false,
  "Betelgeuse X-ray survey correctly marked UNAVAILABLE (cool wind, no magnetic corona)",
);
assert(betelgeuse.surveys.optical.available === true, "Betelgeuse optical survey marked AVAILABLE");

// 4. HiPS Survey Registry Invariants
console.log("\n4. HiPS Survey Repository Invariants:");
requiredBands.forEach((band) => {
  const list = HIPS_SURVEYS[band];
  assert(
    Array.isArray(list) && list.length >= 1,
    `HiPS registry includes surveys for ${band} band`,
  );
  list.forEach((s) => {
    assert(
      s.hipsBaseUrl.startsWith("https://alasky.cds.unistra.fr/"),
      `HiPS base URL uses verified CDS endpoint: ${s.id}`,
    );
    assert(s.attribution.length > 0, `Survey ${s.id} documents provider attribution`);
  });
});

// 5. Angular Separation & 2D Projection vs 3D Depth
console.log("\n5. Angular Separation & 3D Depth Demarcation Invariants:");

// North Pole to Equator is 90 degrees
const sep90 = calculateAngularSeparationDeg(0, 90, 0, 0);
assertClose(
  sep90,
  90.0,
  1e-6,
  "Separation between North Pole (Dec=90) and Equator (Dec=0) is exactly 90.0°",
);

// Antipodal separation is 180 degrees
const sep180 = calculateAngularSeparationDeg(0, 0, 180, 0);
assertClose(
  sep180,
  180.0,
  1e-6,
  "Separation between antipodal equatorial points is exactly 180.0°",
);

// Test chance alignment: Alpheratz (foreground star, 97 ly) vs Andromeda M31 (2.54 Mly)
const alpheratzVsM31 = analyzeProjectionDifference(
  { name: "Alpheratz", raDeg: 2.0969, decDeg: 29.0904, distanceLy: 97.0 },
  { name: "Andromeda Galaxy (M31)", raDeg: 10.6847, decDeg: 41.2687, distanceLy: 2_537_000.0 },
);

assert(
  alpheratzVsM31.angularSeparationDeg > 10.0 && alpheratzVsM31.angularSeparationDeg < 20.0,
  `Alpheratz vs M31 angular separation is ~14.3° (actual: ${alpheratzVsM31.angularSeparationDeg.toFixed(2)}°)`,
);
assert(
  alpheratzVsM31.radialDepthSeparationLy > 2_500_000,
  "Radial depth separation between foreground star and M31 is > 2.5 million ly",
);
assert(
  alpheratzVsM31.depthToTransverseRatio > 3_000,
  `Depth to transverse ratio demonstrates extreme line-of-sight depth (${alpheratzVsM31.depthToTransverseRatio.toFixed(0)}×)`,
);

// 6. Telescope Image Records, Provenance & Licensing
console.log("\n6. Telescope Image Records, Provenance & Licensing:");
targets.forEach((t) => {
  assert(
    t.telescopeImages.length >= 1,
    `${t.targetName} contains at least one verified high-resolution telescope image`,
  );
  t.telescopeImages.forEach((img) => {
    assert(
      img.isDirectObservation === true,
      `Image ${img.id} marked as isDirectObservation = true`,
    );
    assert(
      img.attribution.length > 5,
      `Image ${img.id} documents attribution: ${img.attribution.slice(0, 40)}...`,
    );
    assert(img.license.length > 3, `Image ${img.id} documents license: ${img.license}`);
    assert(img.filters.length >= 1, `Image ${img.id} documents scientific imaging filters`);
    assert(img.fovArcmin > 0, `Image ${img.id} defines calibrated FOV (${img.fovArcmin} arcmin)`);
  });
});

// 7. Epistemic Classification & Limitations
console.log("\n7. Epistemic Status & Limitations:");
targets.forEach((t) => {
  assert(
    t.epistemicObservation.status === "OBSERVATION",
    `${t.targetName} empirical capture classified as [OBSERVATION]`,
  );
  assert(
    t.epistemicReconstruction.status === "MODEL",
    `${t.targetName} 3D reconstruction classified as [MODEL]`,
  );
  assert(
    t.reconstruction3D.scientificLimitations.length > 20,
    `${t.targetName} documents explicit volumetric reconstruction limitations`,
  );
});

// 8. Measurement Uncertainty Tables
console.log("\n8. Measurement Uncertainty Documentation:");
targets.forEach((t) => {
  assert(
    t.measurementUncertainties.length >= 2,
    `${t.targetName} documents at least 2 quantified uncertainty parameters`,
  );
  t.measurementUncertainties.forEach((u) => {
    assert(
      u.uncertainty.length > 0,
      `${t.targetName} parameter ${u.parameter} specifies uncertainty (${u.uncertainty})`,
    );
    assert(
      u.referenceCitation.length > 0,
      `${t.targetName} parameter ${u.parameter} cites reference (${u.referenceCitation})`,
    );
  });
});

console.log("\n================ VALIDATION SUMMARY ================");
console.log(`Total Checks Run: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log("🌟 ALL ASTRONOMICAL OBSERVATION LAYER TESTS PASSED WITH 100% SUCCESS!");
  process.exit(0);
} else {
  console.error("❌ SOME TESTS FAILED!");
  process.exit(1);
}
