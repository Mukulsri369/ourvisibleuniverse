// Selection rules, adopted literature values and labelled components for the cosmic-structure
// fields built by build-structure-data.ts. Every adopted value carries its citation.

export const SURVEY_SOURCES = [
  {
    id: "2mrs",
    name: "2MASS Redshift Survey (2MRS)",
    citation: "Huchra et al. (2012), ApJS 199, 26; VizieR J/ApJS/199/26",
    url: "https://vizier.cfa.harvard.edu/viz-bin/VizieR?-source=J/ApJS/199/26",
    acknowledgement:
      "This research has made use of the 2MASS Redshift Survey (Huchra et al. 2012) and of the VizieR catalogue access tool, CDS, Strasbourg, France.",
  },
  {
    id: "sdss",
    name: "Sloan Digital Sky Survey DR17",
    citation: "Abdurro'uf et al. (2022), ApJS 259, 35",
    url: "https://www.sdss4.org/dr17/",
    acknowledgement:
      "Funding for the Sloan Digital Sky Survey IV has been provided by the Alfred P. Sloan Foundation, the U.S. Department of Energy Office of Science, and the Participating Institutions. SDSS-IV acknowledges support and resources from the Center for High Performance Computing at the University of Utah. The SDSS website is www.sdss4.org.",
  },
  {
    id: "6dfgs",
    name: "6dF Galaxy Survey DR3",
    citation: "Jones et al. (2009), MNRAS 399, 683; VizieR VII/259",
    url: "https://vizier.cfa.harvard.edu/viz-bin/VizieR?-source=VII/259",
    acknowledgement:
      "This research has made use of the 6dF Galaxy Survey (Jones et al. 2004, 2009) and of the VizieR catalogue access tool, CDS, Strasbourg, France.",
  },
  {
    id: "simbad",
    name: "SIMBAD",
    citation: "Wenger et al. (2000), A&AS 143, 9",
    url: "https://simbad.cds.unistra.fr/simbad/",
    acknowledgement:
      "This research has made use of the SIMBAD database, operated at CDS, Strasbourg, France.",
  },
] as const;

// SDSS DR17 spectroscopic galaxies with photometry, in RA slices to stay well under the
// SkyServer row limit. Boxes are deliberately wider than each structure's selection.
export const SDSS_BOXES = {
  virgo: { ra: [172, 203], dec: [-2, 25], z: [-0.004, 0.0095] },
  coma: { ra: [170, 208], dec: [14, 38], z: [0.0133, 0.0334] },
  sgw: { ra: [140, 240], dec: [-8, 16], z: [0.05, 0.1] },
  bootes: { ra: [190, 255], dec: [22, 68], z: [0.025, 0.08] },
};
// 6dFGS DR3 (southern sky) for the Shapley Supercluster; quality 3-4 redshifts only.
export const SIXDF_BOXES: Record<
  string,
  { ra: [number, number]; dec: [number, number]; cz: [number, number]; radiusDeg?: number }
> = {
  shapley: { ra: [182, 218], dec: [-45, -17], cz: [8000, 19000] },
  // Cone of 26° around the Norma Cluster (6dFGS has no galaxies at |b| < 10°).
  norma: { ra: [243.594, 243.594], dec: [-60.869, -60.869], cz: [2500, 7500], radiusDeg: 26 },
};

export type CatalogueId = "2mrs" | "sdss" | "6dfgs";

/** A literature-defined cluster or cloud placed at an adopted distance instead of its redshift. */
export type FixedGroup = {
  name: string;
  centre: [number, number]; // RA, Dec (deg)
  radiusDeg: number;
  cz: [number, number]; // heliocentric km/s
  distanceMpc: number;
  depthRmsMpc: number; // rms line-of-sight depth used to spread members by velocity order
  anchor?: string; // OVU atlas galaxy whose catalogue distance the group is aligned to
  source: string;
};

export type StructureDefinition = {
  id: string;
  catalogues: { id: CatalogueId; box?: string }[];
  /** Sky region: a cone (centre + radius) or an RA/Dec box. */
  region:
    | { kind: "cone"; centre: [number, number]; radiusDeg: number }
    | { kind: "box"; ra: [number, number]; dec: [number, number] }
    | { kind: "sphere"; radiusMpc: number };
  cz: [number, number];
  /** Show a slab this many Mpc thick through the centre, across the view (void display). */
  slabMpc?: number;
  /** Minimum heliocentric cz kept outside fixed groups (the Local Volume stays with the atlas). */
  minFieldCz?: number;
  fof: { perpMpc: number; losKmS: number; minMembers: number };
  fixedGroups?: FixedGroup[];
  /** Friends-of-friends group containing this atlas galaxy is centred on its catalogue distance. */
  anchors?: string[];
  components: { simbad: string; name: string; role: string; source: string }[];
  notes: string[];
};

const VIRGO_GROUPS: FixedGroup[] = [
  {
    name: "Virgo main body",
    centre: [187.70593, 12.39112],
    radiusDeg: 8,
    cz: [-1000, 1900],
    distanceMpc: 16.5,
    depthRmsMpc: 0.6,
    anchor: "M87 (Virgo A)",
    source:
      "Mean SBF distance 16.5 ± 0.1 (random) ± 1.1 (systematic) Mpc and rms depth 0.6 Mpc: Mei et al. (2007), ApJ 655, 144",
  },
  {
    name: "W′ cloud",
    centre: [186.11762, 7.31752],
    radiusDeg: 1.5,
    cz: [600, 1600],
    distanceMpc: 23,
    depthRmsMpc: 0.6,
    source: "Five ACSVCS galaxies at ~23 Mpc form the W′ cloud: Mei et al. (2007), ApJ 655, 144",
  },
];

export const STRUCTURE_DEFINITIONS: StructureDefinition[] = [
  {
    id: "virgo_cluster",
    catalogues: [{ id: "sdss", box: "virgo" }, { id: "2mrs" }],
    region: { kind: "cone", centre: [187.70593, 12.39112], radiusDeg: 12 },
    cz: [-1000, 2800],
    fof: { perpMpc: 0.5, losKmS: 350, minMembers: 4 },
    fixedGroups: VIRGO_GROUPS,
    components: [
      {
        simbad: "M 87",
        name: "M87 · subcluster A",
        role: "Central giant elliptical of the main subcluster",
        source: "Binggeli, Tammann & Sandage (1987), AJ 94, 251",
      },
      {
        simbad: "M 49",
        name: "M49 · subcluster B",
        role: "Brightest Virgo galaxy, centre of the southern subcluster",
        source: "Binggeli, Tammann & Sandage (1987), AJ 94, 251",
      },
      {
        simbad: "M 86",
        name: "M86 group",
        role: "Giant elliptical approaching us at about 240 km/s",
        source: "SIMBAD radial velocity",
      },
      {
        simbad: "M 84",
        name: "Markarian's Chain (M84–M86)",
        role: "Curved chain of bright galaxies",
        source: "Markarian (1961)",
      },
      {
        simbad: "M 60",
        name: "M60",
        role: "Giant elliptical in the eastern cluster",
        source: "Binggeli, Tammann & Sandage (1987), AJ 94, 251",
      },
      {
        simbad: "NGC 4365",
        name: "W′ cloud (NGC 4365)",
        role: "Background cloud at about 23 Mpc",
        source: "Mei et al. (2007), ApJ 655, 144",
      },
      {
        simbad: "NGC 4261",
        name: "W cloud (NGC 4261)",
        role: "Background cloud at about twice Virgo's distance",
        source: "Gavazzi et al. (1999), MNRAS 304, 595",
      },
    ],
    notes: [
      "Main-body and W′-cloud members are placed at the cluster distances measured by Mei et al. (2007); their order along the line of sight follows their velocities, so individual depths are a reconstruction.",
      "Galaxies at 1,900–2,800 km/s (the W and M clouds) keep their redshift distances, consistent with the ~32 Mpc found for those clouds (Gavazzi et al. 1999).",
    ],
  },
  {
    id: "coma_cluster",
    catalogues: [{ id: "sdss", box: "coma" }, { id: "2mrs" }],
    region: { kind: "box", ra: [170, 208], dec: [14, 38] },
    cz: [4000, 10000],
    fof: { perpMpc: 0.5, losKmS: 400, minMembers: 5 },
    anchors: ["Coma Cluster (NGC 4889)"],
    components: [
      {
        simbad: "NGC 4874",
        name: "NGC 4874",
        role: "One of the two giant ellipticals at the Coma core",
        source: "SIMBAD",
      },
      {
        simbad: "NGC 4839",
        name: "NGC 4839 group",
        role: "Infalling group 40′ south-west of the core",
        source: "Colless & Dunn (1996), ApJ 458, 435",
      },
      {
        simbad: "NGC 4911",
        name: "NGC 4911",
        role: "Spiral galaxy falling through the cluster",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1367",
        name: "Abell 1367 (Leo Cluster)",
        role: "Cluster linked to Coma by a filament in the CfA2 Great Wall",
        source: "Geller & Huchra (1989), Science 246, 897",
      },
    ],
    notes: [
      "Late-type galaxies are falling into a virialised core dominated by early types (Colless & Dunn 1996).",
    ],
  },
  {
    id: "great_attractor",
    catalogues: [{ id: "6dfgs", box: "norma" }, { id: "2mrs" }],
    region: { kind: "cone", centre: [243.59375, -60.86861], radiusDeg: 25 },
    cz: [2500, 7500],
    fof: { perpMpc: 0.8, losKmS: 500, minMembers: 4 },
    components: [
      {
        simbad: "ESO 137-6",
        name: "ESO 137-006",
        role: "Central cD galaxy of the Norma Cluster",
        source: "Woudt et al. (2008), MNRAS 383, 445",
      },
      {
        simbad: "ESO 137-1",
        name: "ESO 137-001",
        role: "Jellyfish galaxy losing its gas to the hot cluster medium",
        source: "SIMBAD",
      },
      {
        simbad: "CIZA J1324.7-5736",
        name: "CIZA J1324.7−5736",
        role: "X-ray cluster at the Great Attractor's redshift",
        source: "Ebeling, Mullis & Tully (2002), ApJ 580, 774",
      },
    ],
    notes: [
      "Galaxies are missing near the Galactic plane (|b| < 5°): Milky Way dust hides them, so the survey has a real gap there (Huchra et al. 2012).",
    ],
  },
  {
    id: "perseus_pisces",
    catalogues: [{ id: "2mrs" }],
    region: { kind: "box", ra: [0, 70], dec: [10, 56] },
    cz: [3000, 8000],
    fof: { perpMpc: 0.8, losKmS: 500, minMembers: 4 },
    anchors: ["Perseus Cluster (NGC 1275)"],
    components: [
      {
        simbad: "NGC 1275",
        name: "Perseus Cluster (Abell 426)",
        role: "Richest cluster of the chain, around NGC 1275",
        source: "SIMBAD",
      },
      { simbad: "NGC 708", name: "Abell 262", role: "Cluster around NGC 708", source: "SIMBAD" },
      {
        simbad: "ACO 347",
        name: "Abell 347",
        role: "Galaxy cluster in the chain",
        source: "SIMBAD",
      },
      {
        simbad: "NGC 507",
        name: "NGC 507 group",
        role: "Rich group in the Pisces part of the chain",
        source: "SIMBAD",
      },
      {
        simbad: "NGC 383",
        name: "NGC 383 group (Pisces)",
        role: "Group around the radio galaxy NGC 383",
        source: "SIMBAD",
      },
    ],
    notes: [
      "The chain crosses the Zone of Avoidance east of the Perseus Cluster, where 2MRS has a gap.",
    ],
  },
  {
    id: "sloan_great_wall",
    catalogues: [{ id: "sdss", box: "sgw" }, { id: "2mrs" }],
    region: { kind: "box", ra: [140, 240], dec: [-8, 16] },
    // z 0.063-0.090, the redshift range of the wall's superclusters (Einasto et al. 2011, 2016).
    cz: [18900, 27000],
    fof: { perpMpc: 0.5, losKmS: 400, minMembers: 5 },
    components: [
      {
        simbad: "ACO 1650",
        name: "Abell 1650",
        role: "Rich cluster (z = 0.084)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1651",
        name: "Abell 1651",
        role: "Rich cluster (z = 0.085)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1663",
        name: "Abell 1663",
        role: "Galaxy cluster (z = 0.084)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1750",
        name: "Abell 1750",
        role: "Merging cluster (z = 0.086)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1773",
        name: "Abell 1773",
        role: "Galaxy cluster (z = 0.077)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1809",
        name: "Abell 1809",
        role: "Galaxy cluster (z = 0.079)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1424",
        name: "Abell 1424",
        role: "Galaxy cluster (z = 0.076)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1516",
        name: "Abell 1516",
        role: "Galaxy cluster (z = 0.076)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1205",
        name: "Abell 1205",
        role: "Galaxy cluster (z = 0.076)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 1066",
        name: "Abell 1066",
        role: "Galaxy cluster (z = 0.069)",
        source: "SIMBAD",
      },
    ],
    notes: [
      "The wall's richest parts are the superclusters SCl 126 and SCl 111 (Einasto et al. 2011, A&A 532, A5).",
    ],
  },
  {
    id: "shapley_supercluster",
    catalogues: [{ id: "6dfgs", box: "shapley" }, { id: "2mrs" }],
    region: { kind: "box", ra: [185, 215], dec: [-42, -20] },
    cz: [9000, 18500],
    fof: { perpMpc: 0.6, losKmS: 450, minMembers: 4 },
    components: [
      {
        simbad: "ACO 3558",
        name: "Abell 3558",
        role: "Dominant cluster of the Shapley core",
        source: "Proust et al. (2006), A&A 447, 133",
      },
      {
        simbad: "ACO 3562",
        name: "Abell 3562",
        role: "Cluster in the Shapley core",
        source: "Proust et al. (2006), A&A 447, 133",
      },
      {
        simbad: "ACO 3556",
        name: "Abell 3556",
        role: "Cluster in the Shapley core",
        source: "Proust et al. (2006), A&A 447, 133",
      },
      {
        simbad: "ACO 3571",
        name: "Abell 3571 complex",
        role: "Slightly nearer complex at ~12,000 km/s",
        source: "Proust et al. (2006), A&A 447, 133",
      },
      {
        simbad: "ACO 3528",
        name: "Abell 3528 complex",
        role: "Northern cluster complex (with A3530, A3532)",
        source: "Proust et al. (2006), A&A 447, 133",
      },
      {
        simbad: "ACO 1736",
        name: "Abell 1736",
        role: "Galaxy cluster (z = 0.045)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 3559",
        name: "Abell 3559",
        role: "Galaxy cluster (z = 0.047)",
        source: "SIMBAD",
      },
      {
        simbad: "ACO 3560",
        name: "Abell 3560",
        role: "Galaxy cluster (z = 0.049)",
        source: "SIMBAD",
      },
    ],
    notes: [
      "The main plane at ~14,500 km/s fills a 12° × 30° region (30 × 75 h⁻¹ Mpc) (Proust et al. 2006).",
    ],
  },
  {
    id: "bootes_void",
    catalogues: [{ id: "sdss", box: "bootes" }, { id: "2mrs" }],
    // A sphere about twice the void's radius, so the void and its walls are seen from outside.
    region: { kind: "sphere", radiusMpc: 100 },
    slabMpc: 70,
    cz: [7495, 22485],
    fof: { perpMpc: 0.5, losKmS: 400, minMembers: 5 },
    components: [],
    notes: [
      "Centre from Kirshner et al. (1987), ApJ 314, 493 (via SIMBAD); radius ~46 Mpc as used by Pandey et al. (2021), arXiv:2107.01774.",
    ],
  },
  {
    id: "laniakea_boundary",
    catalogues: [{ id: "2mrs" }],
    region: { kind: "sphere", radiusMpc: 100 },
    cz: [-1000, 12000],
    minFieldCz: 1000,
    fof: { perpMpc: 0.6, losKmS: 450, minMembers: 4 },
    fixedGroups: VIRGO_GROUPS.slice(0, 1),
    components: [
      {
        simbad: "ACO 3627",
        name: "Great Attractor · Norma Cluster",
        role: "Richest cluster in Laniakea's basin of attraction",
        source: "Kraan-Korteweg et al. (1996), Nature 379, 519",
      },
      {
        simbad: "M 87",
        name: "Virgo Cluster",
        role: "Heart of our Local Supercluster",
        source: "Tully et al. (2014), Nature 513, 71",
      },
      {
        simbad: "ACO 3526",
        name: "Centaurus Cluster",
        role: "Part of the Hydra–Centaurus supercluster",
        source: "Tully et al. (2014), Nature 513, 71",
      },
      {
        simbad: "ACO 1060",
        name: "Hydra Cluster",
        role: "Part of the Hydra–Centaurus supercluster",
        source: "Tully et al. (2014), Nature 513, 71",
      },
      {
        simbad: "NGC 1399",
        name: "Fornax Cluster",
        role: "Southern cluster inside Laniakea",
        source: "Tully et al. (2014), Nature 513, 71",
      },
      {
        simbad: "NGC 3268",
        name: "Antlia Cluster",
        role: "Cluster inside Laniakea",
        source: "Tully et al. (2014), Nature 513, 71",
      },
      {
        simbad: "NGC 6876",
        name: "Pavo–Indus",
        role: "Filament feeding the Great Attractor",
        source: "Tully et al. (2014), Nature 513, 71",
      },
    ],
    notes: [
      "Laniakea is defined by where galaxy flows diverge (Tully et al. 2014); OVU has no machine-readable copy of that watershed surface, so no boundary is drawn. The field shows every 2MRS galaxy within 100 Mpc of the Great Attractor region.",
      "Galaxies below 1,000 km/s outside Virgo are left to the atlas, because their redshift distances are unreliable.",
    ],
  },
];
