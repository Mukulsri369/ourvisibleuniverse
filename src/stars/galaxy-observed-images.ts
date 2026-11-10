/**
 * Telescope images registered to the sky by their own embedded AVM (Astronomy
 * Visualization Metadata) World Coordinate System. Values are copied verbatim from
 * each JPEG's XMP packet; scripts/galaxy-observed-layer-validation.ts re-reads the
 * files and fails if they diverge.
 *
 * An image records one direction of view: from the Solar System. The observed layer
 * samples it along each point's sightline from the Sun, so the view from Earth's
 * direction reproduces the published image. Depth, far sides and views away from
 * that direction remain reconstructions and fade back to the 3D model.
 */
export type AvmRegistration = {
  frame: "ICRS";
  projection: "TAN";
  /** RA, Dec (degrees) at the reference pixel. */
  referenceValue: [number, number];
  /** FITS pixel coordinates (1-based, y increasing upward) of the reference point. */
  referencePixel: [number, number];
  /** Full-resolution image width and height that the WCS describes. */
  referenceDimension: [number, number];
  /** Degrees per pixel; a negative x scale means east is to the left. */
  scale: [number, number];
  /** Position angle of the image y-axis, degrees east of north (FITS CROTA2). */
  rotation: number;
};

export type ObservedGalaxyImage = {
  /** Galaxy model key. */
  key: string;
  url: string;
  /** Local file dimensions (a uniformly scaled copy of the registered original). */
  width: number;
  height: number;
  avm: AvmRegistration;
  /**
   * "disk": project onto the measured disk plane (moderate inclination, so views near
   * Earth's direction stay well-posed). "sky": a sheet perpendicular to the sightline
   * for edge-on, interacting or grouped systems, where a disk deprojection is undefined.
   */
  surface: "disk" | "sky";
  /** What the colours represent. */
  light: "optical" | "optical-infrared composite" | "infrared, assigned colours";
  source: string;
  credit: string;
  /**
   * "embedded": the AVM above is the file's own XMP. "published": the file carries no
   * spatial AVM; the values are the publisher's catalogue record for the image, and
   * `landmarks` measured in this file check them.
   */
  avmSource: "embedded" | "published";
  /** Compact features: catalogue ICRS position and measured light centroid in this file. */
  landmarks?: {
    name: string;
    ra: number;
    dec: number;
    /** 0-based pixel indices in the local file, x right, y down. */
    pixel: [number, number];
    toleranceUv: number;
  }[];
  /**
   * A documented correction of one embedded AVM value: the field, the file's verbatim
   * value and the evidence. `landmarks` measured in this file must confirm the result.
   */
  correction?: { field: "scale[0]"; embedded: number; reason: string };
};

export const OBSERVED_GALAXY_IMAGES: readonly ObservedGalaxyImage[] = [
  {
    key: "m81",
    url: "/textures/galaxies/m81.jpg",
    width: 4000,
    height: 2688,
    surface: "disk",
    light: "optical-infrared composite",
    source: "https://esahubble.org/images/heic0710a/",
    credit:
      "NASA, ESA and the Hubble Heritage Team (STScI/AURA). Acknowledgment: A. Zezas and J. Huchra (Harvard-Smithsonian Center for Astrophysics)",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [148.891068953, 69.0722560785],
      referencePixel: [11310, 7600],
      referenceDimension: [22620, 15200],
      scale: [-0.0000138880823301, 0.0000138880823301],
      rotation: 113.97999999999999,
    },
  },
  {
    key: "m51",
    url: "/textures/galaxies/m51.jpg",
    width: 4000,
    height: 2776,
    surface: "disk",
    light: "optical",
    source: "https://esahubble.org/images/heic0506a/",
    credit: "NASA, ESA, S. Beckwith (STScI), and The Hubble Heritage Team (STScI/AURA)",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [202.468074158, 47.213174399],
      referencePixel: [5739.5, 3983.5],
      referenceDimension: [11477, 7965],
      scale: [-0.0000138852130116, 0.0000138852130116],
      rotation: -91.90815078800014,
    },
  },
  {
    key: "m101",
    url: "/textures/galaxies/m101.jpg",
    width: 4000,
    height: 3127,
    surface: "disk",
    light: "optical",
    source: "https://esahubble.org/images/heic0602a/",
    credit:
      "European Space Agency & NASA. Hubble data: K.D. Kuntz (GSFC), F. Bresolin (University of Hawaii), J. Trauger (JPL), J. Mould (NOAO), Y.-H. Chu (University of Illinois). Processing: Davide De Martin (ESA/Hubble). CFHT image: J.-C. Cuillandre/Coelum. NOAO image: G. Jacoby, B. Bohannan, M. Hanna/NOAO/AURA/NSF",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [210.894624886, 54.3010132646],
      referencePixel: [3685, 2881],
      referenceDimension: [15852, 12392],
      scale: [-0.0000138767541849, 0.0000138767541849],
      rotation: -3.5400000000000014,
    },
  },
  {
    key: "m104",
    url: "/textures/galaxies/m104.jpg",
    width: 4000,
    height: 2242,
    surface: "sky",
    light: "optical",
    source: "https://esahubble.org/images/opo0328a/",
    credit: "NASA/ESA and The Hubble Heritage Team (STScI/AURA)",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [189.997030464, -11.6227458432],
      referencePixel: [5737, 3215.5],
      referenceDimension: [11472, 6429],
      scale: [-0.0000139062501049, 0.0000139062501049],
      rotation: -5.019999999999993,
    },
  },
  {
    key: "m82",
    url: "/textures/galaxies/m82.jpg",
    width: 4000,
    height: 3116,
    surface: "sky",
    light: "optical",
    source: "https://esahubble.org/images/heic0604a/",
    credit:
      "NASA, ESA and the Hubble Heritage Team (STScI/AURA). Acknowledgment: J. Gallagher (University of Wisconsin), M. Mountain (STScI) and P. Puxley (NSF)",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [148.9791469, 69.681713],
      referencePixel: [4751, 3701],
      referenceDimension: [9500, 7400],
      scale: [-0.0000138805562484, 0.0000138939775733],
      rotation: 50.1,
    },
  },
  {
    key: "antennae",
    url: "/textures/galaxies/antennae.jpg",
    width: 3915,
    height: 3885,
    surface: "sky",
    light: "optical",
    source: "https://esahubble.org/images/heic0615a/",
    credit:
      "NASA, ESA, and the Hubble Heritage Team (STScI/AURA)-ESA/Hubble Collaboration. Acknowledgement: B. Whitmore (STScI) and James Long (ESA/Hubble)",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [180.470327069, -18.8804907083],
      referencePixel: [1957.5, 1942.5],
      referenceDimension: [3915, 3885],
      scale: [-0.0000139317732232, 0.0000139317732232],
      rotation: -30.619999999999976,
    },
  },
  {
    key: "tadpole",
    url: "/textures/galaxies/tadpole.jpg",
    width: 4000,
    height: 3484,
    surface: "sky",
    light: "optical",
    source: "https://esahubble.org/images/heic0206a/",
    credit: "NASA, Holland Ford (JHU), the ACS Science Team and ESA",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [241.549528353, 55.4310035116],
      referencePixel: [2180, 1899],
      referenceDimension: [4360, 3798],
      scale: [-0.0000138130784358, 0.0000138130784358],
      rotation: 144.7000000000002,
    },
  },
  {
    key: "cartwheel",
    url: "/textures/galaxies/cartwheel.jpg",
    width: 4000,
    height: 3682,
    surface: "disk",
    light: "infrared, assigned colours",
    source: "https://esawebb.org/images/weic2211a/",
    credit: "NASA, ESA, CSA, STScI",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [9.42321092732, -33.71306150293],
      referencePixel: [2356.29149583846, 2187.12454242374],
      referenceDimension: [4685, 4312],
      scale: [-0.00000833313, 0.00000833313],
      rotation: 27.97402144102,
    },
  },
  {
    key: "hoags-object",
    url: "/textures/galaxies/hoag.jpg",
    width: 1521,
    height: 1489,
    surface: "disk",
    light: "optical",
    source: "https://esahubble.org/images/opo0221a/",
    credit: "NASA/ESA and The Hubble Heritage Team (STScI/AURA)",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [229.310593728, 21.5855958451],
      referencePixel: [761.5, 745.5],
      referenceDimension: [1521, 1489],
      scale: [-0.0000138204112762, 0.0000138204112762],
      rotation: 19.3027406348248,
    },
  },
  {
    key: "catalog-ngc-1300",
    url: "/textures/galaxies/ngc1300.jpg",
    width: 4000,
    height: 2282,
    surface: "disk",
    light: "optical",
    source: "https://esahubble.org/images/opo0501a/",
    credit: "NASA, ESA, and The Hubble Heritage Team (STScI/AURA)",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [49.9192536, -19.4120509],
      referencePixel: [3319.5, 1894.5],
      referenceDimension: [6637, 3787],
      // East to the left; the file's own x scale is positive (see `correction`).
      scale: [-0.0000139017404438, 0.0000138905317193],
      rotation: -29.9,
    },
    correction: {
      field: "scale[0]",
      embedded: 0.0000139017404438,
      reason:
        "The embedded x scale is positive (a mirrored, east-right frame). Read that way, the " +
        "catalogued nucleus falls 5.9 arcsec from the nucleus light peak in this file and the " +
        "bar and disk lie at PA ~137 deg. With east to the left (same scale magnitude and " +
        "rotation) the nucleus lands within 0.3 arcsec of the peak and the major axis at " +
        "PA ~103 deg, inside the published 87-106 deg (England 1989; Lindblad et al. 1997; " +
        "LEDA as adopted by Atkinson et al. 2005, arXiv:astro-ph/0502573).",
    },
    landmarks: [
      {
        name: "NGC 1300 nucleus",
        ra: 49.9208,
        dec: -19.4111,
        pixel: [1963.3, 1077.9],
        toleranceUv: 0.003,
      },
    ],
  },
  {
    key: "stephans-quintet",
    url: "/textures/galaxies/quintet.jpg",
    width: 4000,
    height: 3835,
    surface: "sky",
    light: "infrared, assigned colours",
    source: "https://esawebb.org/images/weic2208a/",
    credit: "NASA, ESA, CSA, and STScI",
    avmSource: "embedded",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [338.99822512414, 33.95839892526],
      referencePixel: [6077.86560792786, 6000.62105317815],
      referenceDimension: [12654, 12132],
      scale: [-0.0000083459, 0.0000083459],
      rotation: -62.019562298659984,
    },
  },
  // Local Group. This file carries no spatial AVM, so the values are the published
  // record for the image (ESO; full AVM via the AstroPix mirror). Light centroids of
  // the nucleus and H II regions measured in the local file check them.
  {
    key: "m33",
    url: "/textures/galaxies/m33.jpg",
    width: 4000,
    height: 3355,
    surface: "disk",
    light: "optical",
    source: "https://www.eso.org/public/images/eso1424a/",
    credit: "ESO",
    avmSource: "published",
    avm: {
      frame: "ICRS",
      projection: "TAN",
      referenceValue: [23.4671516274, 30.6739356771],
      referencePixel: [9529.0, 7991.5],
      referenceDimension: [19058, 15983],
      scale: [-0.0000594772254824, 0.0000594772254824],
      rotation: 90,
    },
    landmarks: [
      {
        name: "M33 nucleus",
        ra: 23.4621,
        dec: 30.6599,
        pixel: [2046.6, 1662.2],
        toleranceUv: 0.003,
      },
      {
        name: "NGC 595",
        ra: 23.3908333,
        dec: 30.6922222,
        pixel: [1927.8, 1456.0],
        toleranceUv: 0.005,
      },
      {
        name: "NGC 604 (extended H II region)",
        ra: 23.6369583,
        dec: 30.7835,
        pixel: [1589.6, 2209.0],
        toleranceUv: 0.009,
      },
    ],
  },
];

export const OBSERVED_IMAGE_BY_KEY = new Map(OBSERVED_GALAXY_IMAGES.map((i) => [i.key, i]));
