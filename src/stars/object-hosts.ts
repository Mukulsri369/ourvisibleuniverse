import { EXTRAGALACTIC_HII_TARGETS } from "./extragalactic-hii";
/** Catalogue membership, independent of camera distance. Unknown hosts stay unassigned. */
export const MILKY_WAY = "Milky Way";
export const ANDROMEDA = "Andromeda (M31)";
export const EXTRA_HOSTS: Record<
  string,
  { name: string; type: string; source: string; unresolved?: boolean }
> = {
  "3c279": {
    name: "3C 279 host",
    type: "Elliptical host",
    source: "https://doi.org/10.1051/0004-6361/200912820",
  },
  mrk231: {
    name: "Markarian 231",
    type: "Interacting galaxy",
    source: "https://ned.ipac.caltech.edu/byname?objname=MRK%200231",
  },
  ton618: {
    name: "TON 618 host (unresolved)",
    type: "Unresolved host galaxy",
    unresolved: true,
    source: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=TON+618",
  },
  hlx1: {
    name: "ESO 243-49",
    type: "Edge-on lenticular galaxy",
    source: "https://science.nasa.gov/asset/hubble/black-hole-eso-243-49-hlx-1/",
  },
  gw170817: {
    name: "NGC 4993",
    type: "Lenticular galaxy",
    source: "https://gcn.nasa.gov/circulars/events/grb-170817a",
  },
  "phoenix-a": {
    name: "Phoenix A",
    type: "Elliptical galaxy",
    source: "https://chandra.harvard.edu/photo/2012/phoenix/",
  },
};
const mwIds =
  "m42 m16 carina pleiades_nebula witch_head horsehead barnard68 m57 helix cats_eye butterfly m1 veil cas_a crab-pulsar vela b1919 psr-j0437 rx-j1856 sgr1806 swift-j1818 gaiabh1 gaiabh3 cygx1 v404-cyg grs1915 sgr-a siriusb procyon-b cas-a betelgeuse eta-car uyscuti wr104 vycma rigel antares polaris mira ttauri tabby algol proxima luhman16 vanmaanen methuselah regulus psr-b1257 rosette m8 m20".split(
    " ",
  );
export const OBJECT_HOSTS: Record<string, string | null> = Object.fromEntries(
  mwIds.map((id) => [id, MILKY_WAY]),
);
Object.assign(OBJECT_HOSTS, {
  ...Object.fromEntries(EXTRAGALACTIC_HII_TARGETS.map((t) => [t.id, t.host])),
  "3c273": "3C 273 (Quasar Host)",
  m87star: "M87 (Virgo A)",
  sn1987a: "Large Magellanic Cloud",
  r136a1: "Large Magellanic Cloud",
  tarantula: "Large Magellanic Cloud",
  gw150914: null,
  gw190521: null,
  ...Object.fromEntries(Object.entries(EXTRA_HOSTS).map(([id, g]) => [id, g.name])),
});
export function objectHost(id: string) {
  return OBJECT_HOSTS[id] ?? null;
}
export function starHost(name: string) {
  if (/^(R136|WOH G64|S Dor)/i.test(name)) return "Large Magellanic Cloud";
  if (/^HD 5980/i.test(name)) return "Small Magellanic Cloud";
  if (/^B324/i.test(name)) return "Triangulum (M33)";
  if (/^PA-99-N2/i.test(name)) return ANDROMEDA;
  return MILKY_WAY;
}
