export type NamedGalaxy = {
  name: string;
  type: string;
  // galactic coords
  l: number; // deg
  b: number; // deg
  distance: number; // light-years
  // Rendered disk diameter in ly (roughly true size, floored so distant
  // giants are still visible as pixels)
  size: number;
  color: string;
  inclination?: number; // deg, tilt of disk from face-on
  posAngle?: number; // deg, orientation of major axis in sky
};

export const NEARBY_GALAXIES: NamedGalaxy[] = [
  { name: "Large Magellanic Cloud", type: "Irregular", l: 280.5, b: -32.9, distance: 163_000, size: 14_000, color: "#c9d6ff", inclination: 35 },
  { name: "Small Magellanic Cloud", type: "Irregular", l: 302.8, b: -44.3, distance: 200_000, size: 7_000, color: "#cfd8ff", inclination: 40 },
  { name: "Sagittarius Dwarf", type: "Dwarf Elliptical", l: 5.6, b: -14.1, distance: 65_000, size: 10_000, color: "#ffe0b0" },
  { name: "Canis Major Dwarf", type: "Dwarf Irregular", l: 240.0, b: -8.0, distance: 25_000, size: 5_000, color: "#ffd8a0" },
  { name: "Andromeda (M31)", type: "Spiral", l: 121.2, b: -21.6, distance: 2_537_000, size: 220_000, color: "#e8ecff", inclination: 77, posAngle: 35 },
  { name: "Triangulum (M33)", type: "Spiral", l: 133.6, b: -31.3, distance: 2_730_000, size: 60_000, color: "#d8e4ff", inclination: 54, posAngle: 22 },
  { name: "NGC 205 (M110)", type: "Dwarf Elliptical", l: 120.7, b: -21.1, distance: 2_690_000, size: 17_000, color: "#ffe4c8" },
  { name: "IC 10", type: "Starburst Irregular", l: 119.0, b: -3.3, distance: 2_200_000, size: 5_000, color: "#ffc0d0" },
  { name: "NGC 6822 (Barnard)", type: "Irregular", l: 25.3, b: -18.4, distance: 1_630_000, size: 7_000, color: "#ffd8b0" },
  { name: "Leo I", type: "Dwarf Spheroidal", l: 226.0, b: 49.1, distance: 820_000, size: 3_000, color: "#ffe8c8" },
  { name: "Leo II", type: "Dwarf Spheroidal", l: 220.2, b: 67.2, distance: 690_000, size: 2_000, color: "#ffe8c8" },
  { name: "Draco Dwarf", type: "Dwarf Spheroidal", l: 86.4, b: 34.7, distance: 260_000, size: 2_500, color: "#ffe8c8" },
  { name: "Sculptor Dwarf", type: "Dwarf Spheroidal", l: 287.5, b: -83.2, distance: 290_000, size: 2_800, color: "#ffe8c8" },
  { name: "Fornax Dwarf", type: "Dwarf Spheroidal", l: 237.1, b: -65.7, distance: 460_000, size: 3_000, color: "#ffe8c8" },
  { name: "NGC 300", type: "Spiral", l: 299.2, b: -79.4, distance: 6_100_000, size: 60_000, color: "#dde6ff", inclination: 42 },
  { name: "NGC 55", type: "Barred Spiral", l: 332.9, b: -75.7, distance: 6_500_000, size: 70_000, color: "#dde6ff", inclination: 78 },
  { name: "Centaurus A (NGC 5128)", type: "Lenticular", l: 309.5, b: 19.4, distance: 13_000_000, size: 60_000, color: "#ffc898", inclination: 60 },
  { name: "M81 (Bode's Galaxy)", type: "Spiral", l: 142.1, b: 40.9, distance: 12_000_000, size: 90_000, color: "#dae4ff", inclination: 62 },
  { name: "M82 (Cigar Galaxy)", type: "Starburst", l: 141.4, b: 40.6, distance: 12_000_000, size: 37_000, color: "#ffd0c0", inclination: 80, posAngle: 65 },
  { name: "NGC 253 (Sculptor Galaxy)", type: "Spiral", l: 97.4, b: -88.0, distance: 11_400_000, size: 90_000, color: "#dfe8ff", inclination: 78 },
  { name: "M83", type: "Barred Spiral", l: 314.6, b: 32.0, distance: 15_000_000, size: 55_000, color: "#e0eaff", inclination: 24 },
  { name: "M94", type: "Spiral", l: 123.4, b: 76.0, distance: 16_000_000, size: 50_000, color: "#e2ecff", inclination: 35 },
  { name: "M101 (Pinwheel)", type: "Spiral", l: 102.0, b: 59.8, distance: 21_000_000, size: 170_000, color: "#e5efff", inclination: 18 },
  { name: "M51 (Whirlpool)", type: "Spiral", l: 104.9, b: 68.6, distance: 23_000_000, size: 76_000, color: "#e0ebff", inclination: 22, posAngle: 10 },
  { name: "M104 (Sombrero)", type: "Lenticular", l: 298.5, b: 51.1, distance: 29_000_000, size: 50_000, color: "#ffd8b0", inclination: 84, posAngle: 90 },
  { name: "NGC 1300", type: "Barred Spiral", l: 209.6, b: -52.4, distance: 61_000_000, size: 110_000, color: "#dde8ff", inclination: 45 },
  { name: "M87 (Virgo A)", type: "Elliptical", l: 283.8, b: 74.5, distance: 53_000_000, size: 240_000, color: "#ffe0b0" },
  { name: "M49", type: "Elliptical", l: 286.9, b: 70.2, distance: 56_000_000, size: 160_000, color: "#ffe0b0" },
  { name: "M60", type: "Elliptical", l: 291.2, b: 74.3, distance: 55_000_000, size: 120_000, color: "#ffe0b0" },
  { name: "NGC 4038/4039 (Antennae)", type: "Interacting", l: 286.2, b: 42.5, distance: 45_000_000, size: 90_000, color: "#ffcadd" },
  { name: "Ursa Minor Dwarf", type: "Dwarf Spheroidal", l: 105.0, b: 44.8, distance: 225_000, size: 2_000, color: "#ffe8c8" },
  { name: "Carina Dwarf", type: "Dwarf Spheroidal", l: 260.1, b: -22.2, distance: 330_000, size: 1_600, color: "#ffe8c8" },
  { name: "Sextans Dwarf", type: "Dwarf Spheroidal", l: 243.5, b: 42.3, distance: 280_000, size: 2_200, color: "#ffe8c8" },
  { name: "Phoenix Dwarf", type: "Dwarf Irregular", l: 272.2, b: -68.9, distance: 1_440_000, size: 2_000, color: "#ffe0c0" },
  { name: "WLM", type: "Dwarf Irregular", l: 75.9, b: -73.6, distance: 3_040_000, size: 8_000, color: "#dfe6ff" },
  { name: "NGC 185", type: "Dwarf Elliptical", l: 120.8, b: -14.5, distance: 2_050_000, size: 8_000, color: "#ffe4c8" },
  { name: "NGC 147", type: "Dwarf Spheroidal", l: 119.8, b: -14.3, distance: 2_530_000, size: 9_000, color: "#ffe4c8" },
  { name: "M32", type: "Compact Elliptical", l: 121.2, b: -22.0, distance: 2_490_000, size: 6_500, color: "#ffe0b8" },
  { name: "IC 1613", type: "Dwarf Irregular", l: 129.7, b: -60.6, distance: 2_380_000, size: 10_000, color: "#dde8ff" },
  { name: "Maffei 1", type: "Elliptical", l: 136.0, b: -0.6, distance: 9_800_000, size: 75_000, color: "#ffd8a8" },
  { name: "NGC 2403", type: "Spiral", l: 150.6, b: 29.2, distance: 8_000_000, size: 50_000, color: "#dde6ff", inclination: 62 },
  { name: "M64 (Black Eye)", type: "Spiral", l: 315.7, b: 84.4, distance: 17_000_000, size: 54_000, color: "#e6dcff", inclination: 60 },
  { name: "M106", type: "Spiral", l: 138.3, b: 68.8, distance: 23_700_000, size: 135_000, color: "#dfeaff", inclination: 67 },
  { name: "M66", type: "Barred Spiral", l: 241.5, b: 64.4, distance: 36_000_000, size: 95_000, color: "#e0eaff", inclination: 60 },
  { name: "M65", type: "Spiral", l: 241.3, b: 64.4, distance: 35_000_000, size: 90_000, color: "#e0eaff", inclination: 74 },
  { name: "M100", type: "Spiral", l: 271.1, b: 76.9, distance: 55_000_000, size: 107_000, color: "#e3eeff", inclination: 30 },
  { name: "M61", type: "Barred Spiral", l: 292.0, b: 65.0, distance: 52_500_000, size: 100_000, color: "#e1ecff", inclination: 20 },
  { name: "NGC 5866", type: "Lenticular", l: 92.0, b: 52.5, distance: 44_000_000, size: 60_000, color: "#ffdcb0", inclination: 88 },
  { name: "NGC 1316 (Fornax A)", type: "Lenticular", l: 240.2, b: -56.7, distance: 62_000_000, size: 160_000, color: "#ffdcb0" },
  { name: "NGC 1365", type: "Barred Spiral", l: 238.0, b: -54.6, distance: 56_000_000, size: 200_000, color: "#dde8ff", inclination: 55 },
  { name: "NGC 5253", type: "Dwarf Starburst", l: 314.9, b: 30.1, distance: 10_900_000, size: 16_000, color: "#ffd0a0" },
  { name: "NGC 6946 (Fireworks)", type: "Spiral", l: 95.7, b: 11.7, distance: 25_200_000, size: 90_000, color: "#e2edff", inclination: 33 },
  { name: "NGC 7331", type: "Spiral", l: 93.7, b: -20.7, distance: 40_000_000, size: 120_000, color: "#dfe9ff", inclination: 70 },
  { name: "M77 (Cetus A)", type: "Barred Spiral", l: 172.1, b: -51.9, distance: 47_000_000, size: 170_000, color: "#ffe6d0", inclination: 40 },
  { name: "NGC 3628", type: "Spiral", l: 240.9, b: 64.8, distance: 35_000_000, size: 100_000, color: "#dde6ff", inclination: 87 },
  { name: "Coma Cluster (NGC 4889)", type: "Elliptical", l: 58.1, b: 87.9, distance: 321_000_000, size: 300_000, color: "#ffe0b0" },
  { name: "Perseus Cluster (NGC 1275)", type: "Elliptical", l: 150.6, b: -13.3, distance: 237_000_000, size: 200_000, color: "#ffd8b8" },
  { name: "Hercules A", type: "Radio Elliptical", l: 23.5, b: 27.9, distance: 2_100_000_000, size: 500_000, color: "#ffcfa0" },
  { name: "NGC 4565 (Needle)", type: "Edge-on Spiral", l: 230.8, b: 86.4, distance: 46_000_000, size: 200_000, color: "#e2ecff", inclination: 88, posAngle: 45 },

  // ---- Local Group & nearby dwarfs ----
  { name: "NGC 3109", type: "Dwarf Irregular", l: 262.1, b: 23.1, distance: 4_300_000, size: 25_000, color: "#dfe6ff", inclination: 80 },
  { name: "Antlia Dwarf", type: "Dwarf Spheroidal", l: 263.1, b: 22.3, distance: 4_000_000, size: 3_000, color: "#ffe8c8" },
  { name: "Aquarius Dwarf (DDO 210)", type: "Dwarf Irregular", l: 34.0, b: -31.3, distance: 3_200_000, size: 1_500, color: "#ffe0c0" },
  { name: "Tucana Dwarf", type: "Dwarf Spheroidal", l: 322.9, b: -47.4, distance: 3_200_000, size: 1_600, color: "#ffe8c8" },
  { name: "Cetus Dwarf", type: "Dwarf Spheroidal", l: 101.4, b: -72.9, distance: 2_500_000, size: 3_000, color: "#ffe8c8" },
  { name: "Pegasus Dwarf (DDO 216)", type: "Dwarf Irregular", l: 94.8, b: -43.5, distance: 3_000_000, size: 5_000, color: "#ffe0c0" },
  { name: "Sextans A", type: "Dwarf Irregular", l: 246.2, b: 39.9, distance: 4_300_000, size: 5_000, color: "#dfe6ff" },
  { name: "Sextans B", type: "Dwarf Irregular", l: 233.2, b: 43.8, distance: 4_400_000, size: 6_000, color: "#dfe6ff" },
  { name: "Boötes I Dwarf", type: "Dwarf Spheroidal", l: 358.1, b: 69.6, distance: 197_000, size: 1_000, color: "#ffe8c8" },
  { name: "Hercules Dwarf", type: "Dwarf Spheroidal", l: 28.7, b: 36.9, distance: 460_000, size: 1_200, color: "#ffe8c8" },
  { name: "Canes Venatici I", type: "Dwarf Spheroidal", l: 74.3, b: 79.8, distance: 720_000, size: 2_200, color: "#ffe8c8" },
  { name: "Ursa Major II", type: "Dwarf Spheroidal", l: 152.5, b: 37.4, distance: 100_000, size: 900, color: "#ffe8c8" },

  // ---- Nearby star-forming and starburst systems ----
  { name: "IC 342 (Hidden Galaxy)", type: "Spiral", l: 138.2, b: 10.6, distance: 11_000_000, size: 75_000, color: "#e0eaff", inclination: 25 },
  { name: "NGC 4945", type: "Spiral", l: 305.3, b: 13.3, distance: 13_000_000, size: 70_000, color: "#ffd8b8", inclination: 85 },
  { name: "NGC 1569", type: "Dwarf Starburst", l: 143.7, b: 11.2, distance: 11_000_000, size: 5_000, color: "#ffd0a0" },
  { name: "NGC 4449", type: "Irregular", l: 136.8, b: 72.4, distance: 12_500_000, size: 20_000, color: "#ffd8c0" },
  { name: "Holmberg II", type: "Dwarf Irregular", l: 144.3, b: 32.7, distance: 11_000_000, size: 25_000, color: "#dfe6ff" },
  { name: "NGC 2366", type: "Dwarf Irregular", l: 146.4, b: 28.5, distance: 10_000_000, size: 15_000, color: "#dfe6ff" },
  { name: "NGC 7793", type: "Spiral", l: 4.5, b: -77.2, distance: 12_700_000, size: 30_000, color: "#dde6ff", inclination: 50 },
  { name: "NGC 247", type: "Spiral", l: 113.9, b: -83.6, distance: 11_000_000, size: 70_000, color: "#dde6ff", inclination: 74 },

  // ---- Classic Messier spirals & lenticulars ----
  { name: "M74 (Phantom)", type: "Spiral", l: 138.6, b: -45.7, distance: 32_000_000, size: 95_000, color: "#e4eeff", inclination: 6 },
  { name: "M63 (Sunflower)", type: "Spiral", l: 105.9, b: 74.3, distance: 29_000_000, size: 98_000, color: "#e3edff", inclination: 55 },
  { name: "M95", type: "Barred Spiral", l: 233.2, b: 57.0, distance: 33_000_000, size: 90_000, color: "#e0eaff", inclination: 45 },
  { name: "M96", type: "Spiral", l: 234.4, b: 57.6, distance: 31_000_000, size: 100_000, color: "#e0eaff", inclination: 50 },
  { name: "M105", type: "Elliptical", l: 233.5, b: 57.6, distance: 32_000_000, size: 55_000, color: "#ffe0b0" },
  { name: "M108", type: "Barred Spiral", l: 148.4, b: 56.4, distance: 46_000_000, size: 110_000, color: "#dde8ff", inclination: 80 },
  { name: "M109", type: "Barred Spiral", l: 148.6, b: 64.9, distance: 83_000_000, size: 180_000, color: "#dde8ff", inclination: 55 },
  { name: "M84", type: "Lenticular", l: 278.2, b: 74.5, distance: 60_000_000, size: 110_000, color: "#ffdcb0" },
  { name: "M85", type: "Lenticular", l: 250.6, b: 76.5, distance: 60_000_000, size: 125_000, color: "#ffdcb0" },
  { name: "M86", type: "Lenticular", l: 279.2, b: 74.5, distance: 52_000_000, size: 150_000, color: "#ffdcb0" },
  { name: "M89", type: "Elliptical", l: 288.4, b: 74.8, distance: 50_000_000, size: 90_000, color: "#ffe0b0" },
  { name: "M90", type: "Spiral", l: 289.4, b: 74.9, distance: 59_000_000, size: 165_000, color: "#e1ecff", inclination: 65 },
  { name: "M58", type: "Barred Spiral", l: 291.0, b: 73.3, distance: 68_000_000, size: 120_000, color: "#e1ecff", inclination: 40 },
  { name: "M59", type: "Elliptical", l: 290.9, b: 74.2, distance: 60_000_000, size: 90_000, color: "#ffe0b0" },
  { name: "M98", type: "Spiral", l: 270.0, b: 77.0, distance: 44_000_000, size: 160_000, color: "#dfe9ff", inclination: 74 },
  { name: "M99 (Coma Pinwheel)", type: "Spiral", l: 272.0, b: 76.0, distance: 50_000_000, size: 85_000, color: "#e3eeff", inclination: 20 },

  // ---- Edge-on and barred showpieces ----
  { name: "NGC 891", type: "Edge-on Spiral", l: 140.4, b: -17.4, distance: 30_000_000, size: 120_000, color: "#e2ecff", inclination: 89, posAngle: 22 },
  { name: "NGC 4631 (Whale)", type: "Edge-on Spiral", l: 142.8, b: 84.2, distance: 30_000_000, size: 140_000, color: "#e2ecff", inclination: 86, posAngle: 86 },
  { name: "NGC 4656 (Hockey Stick)", type: "Irregular", l: 142.0, b: 83.0, distance: 30_000_000, size: 90_000, color: "#dfe6ff", inclination: 82 },
  { name: "NGC 5907 (Splinter)", type: "Edge-on Spiral", l: 91.6, b: 51.1, distance: 50_000_000, size: 150_000, color: "#e2ecff", inclination: 88, posAngle: 155 },
  { name: "NGC 3115 (Spindle)", type: "Lenticular", l: 247.8, b: 36.8, distance: 32_000_000, size: 60_000, color: "#ffdcb0", inclination: 86 },
  { name: "NGC 2841", type: "Spiral", l: 167.0, b: 44.1, distance: 46_000_000, size: 150_000, color: "#dfe9ff", inclination: 68 },
  { name: "NGC 2903", type: "Barred Spiral", l: 208.7, b: 44.5, distance: 30_000_000, size: 80_000, color: "#e0eaff", inclination: 65 },
  { name: "NGC 4725", type: "Barred Spiral", l: 57.0, b: 88.0, distance: 40_000_000, size: 100_000, color: "#e0eaff", inclination: 45 },
  { name: "NGC 6744", type: "Barred Spiral", l: 330.0, b: -26.1, distance: 30_000_000, size: 175_000, color: "#e1ecff", inclination: 44 },
  { name: "NGC 1097", type: "Barred Spiral", l: 226.9, b: -64.7, distance: 45_000_000, size: 130_000, color: "#dde8ff", inclination: 46 },
  { name: "NGC 1291", type: "Barred Lenticular", l: 247.5, b: -57.0, distance: 33_000_000, size: 60_000, color: "#ffdcb0", inclination: 30 },
  { name: "NGC 5195", type: "Dwarf Barred", l: 105.0, b: 68.7, distance: 23_000_000, size: 25_000, color: "#ffdcc0" },
  { name: "NGC 4993", type: "Lenticular", l: 308.4, b: 39.3, distance: 140_000_000, size: 60_000, color: "#ffdcb0" },

  // ---- Interacting pairs and distant giants ----
  { name: "NGC 2207 / IC 2163", type: "Interacting", l: 224.0, b: -15.0, distance: 80_000_000, size: 140_000, color: "#ffcadd" },
  { name: "NGC 4676 (Mice)", type: "Interacting", l: 180.0, b: 85.0, distance: 290_000_000, size: 100_000, color: "#ffcadd" },
  { name: "Arp 273", type: "Interacting", l: 125.0, b: -11.0, distance: 300_000_000, size: 130_000, color: "#ffcadd" },
  { name: "NGC 6240", type: "Interacting", l: 20.7, b: 27.3, distance: 400_000_000, size: 100_000, color: "#ffc8c0" },
  { name: "Cartwheel Galaxy", type: "Lenticular", l: 316.0, b: -70.0, distance: 500_000_000, size: 150_000, color: "#d8e6ff", inclination: 30 },
  { name: "Malin 1", type: "Spiral", l: 316.0, b: 76.0, distance: 1_190_000_000, size: 650_000, color: "#dbe6ff", inclination: 38 },
  { name: "Cygnus A", type: "Radio Elliptical", l: 76.2, b: 5.8, distance: 760_000_000, size: 300_000, color: "#ffcfa0" },
  { name: "3C 273 (Quasar Host)", type: "Elliptical", l: 289.9, b: 64.4, distance: 2_400_000_000, size: 200_000, color: "#ffd8a0" },
];

