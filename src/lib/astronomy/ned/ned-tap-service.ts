/**
 * NASA/IPAC Extragalactic Database (NED) TAP & Query Client
 *
 * Grounded in:
 * - NED Table Access Protocol (TAP) 1.0 Interface
 * - ADQL (Astronomical Data Query Language 2.0)
 * - Official URL: https://ned.ipac.caltech.edu/tap/sync
 * - NED Best Redshift & Extragalactic Distance Database (NED-D)
 *
 * Sourced under NASA Open Data Policy (JPL / Caltech contract NAS 7-03001).
 */

export interface NedTapQueryParams {
  raDeg?: number;
  decDeg?: number;
  coneRadiusArcmin?: number;
  minZ?: number;
  maxZ?: number;
  maxRecords?: number;
  catalogPrefix?: string;
}

export interface NedTapObjectRecord {
  objname: string;
  prefname?: string;
  ra: number;
  dec: number;
  z: number | null;
  z_err: number | null;
  z_qual?: string;
  objtype: string;
  morphology?: string;
  major_diam_arcmin?: number | null;
  minor_diam_arcmin?: number | null;
  pos_angle_deg?: number | null;
  inclination_deg?: number | null;
  dist_mod?: number | null;
  dist_mpc?: number | null;
  dist_err_mpc?: number | null;
  dist_method?: string | null;
  mag_b?: number | null;
  mag_v?: number | null;
  mag_k?: number | null;
  host_cluster?: string | null;
  ref_bibcode?: string | null;
}

/**
 * Builds valid ADQL queries for the NASA/IPAC Extragalactic Database TAP service
 */
export function buildNedAdqlQuery(params: NedTapQueryParams): string {
  const limit = params.maxRecords ?? 50;
  const whereClauses: string[] = [
    "objtype = 'G' OR objtype = 'GPair' OR objtype = 'GGroup' OR objtype = 'QSO'",
  ];

  if (
    params.raDeg !== undefined &&
    params.decDeg !== undefined &&
    params.coneRadiusArcmin !== undefined
  ) {
    const radiusDeg = params.coneRadiusArcmin / 60;
    whereClauses.push(
      `1 = CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', ${params.raDeg.toFixed(5)}, ${params.decDeg.toFixed(5)}, ${radiusDeg.toFixed(5)}))`,
    );
  }

  if (params.minZ !== undefined) {
    whereClauses.push(`z >= ${params.minZ}`);
  }
  if (params.maxZ !== undefined) {
    whereClauses.push(`z <= ${params.maxZ}`);
  }
  if (params.catalogPrefix) {
    whereClauses.push(`objname LIKE '${params.catalogPrefix}%'`);
  }

  return `SELECT TOP ${limit} objname, ra, dec, z, z_err, objtype, morphology FROM ned_objdir WHERE ${whereClauses.join(" AND ")}`;
}

/**
 * Generates official TAP POST payload for https://ned.ipac.caltech.edu/tap/sync
 */
export function buildNedTapRequest(adql: string): { url: string; body: URLSearchParams } {
  const url = "https://ned.ipac.caltech.edu/tap/sync";
  const body = new URLSearchParams();
  body.append("REQUEST", "doQuery");
  body.append("LANG", "ADQL");
  body.append("FORMAT", "json");
  body.append("QUERY", adql);
  return { url, body };
}

/**
 * Catalog deduplication utility for extragalactic objects.
 * Deduplicates objects by comparing coordinates (within angular tolerance)
 * and canonical aliases.
 */
export class GalaxyDeduplicator {
  private seenCoordinates: Array<{ ra: number; dec: number; id: string }> = [];
  private aliasToCanonical = new Map<string, string>();

  /**
   * Registers an alias mapping to a canonical ID
   */
  public registerAliases(canonicalId: string, aliases: string[]): void {
    for (const a of aliases) {
      const normalized = a.trim().toUpperCase().replace(/\s+/g, " ");
      this.aliasToCanonical.set(normalized, canonicalId);
    }
  }

  /**
   * Resolves any name/alias to its canonical primary identifier
   */
  public resolveCanonical(name: string): string | null {
    const normalized = name.trim().toUpperCase().replace(/\s+/g, " ");
    return this.aliasToCanonical.get(normalized) ?? null;
  }

  /**
   * Checks if an object at (ra, dec) matches an existing record within toleranceArcsec
   */
  public findMatchByCoordinates(ra: number, dec: number, toleranceArcsec = 30): string | null {
    const tolDeg = toleranceArcsec / 3600;
    for (const item of this.seenCoordinates) {
      const dRa = (ra - item.ra) * Math.cos((dec * Math.PI) / 180);
      const dDec = dec - item.dec;
      const dist = Math.sqrt(dRa * dRa + dDec * dDec);
      if (dist < tolDeg) {
        return item.id;
      }
    }
    return null;
  }

  /**
   * Adds coordinate record
   */
  public addCoordinate(ra: number, dec: number, id: string): void {
    this.seenCoordinates.push({ ra, dec, id });
  }

  public clear(): void {
    this.seenCoordinates = [];
    this.aliasToCanonical.clear();
  }
}

export const galaxyDeduplicator = new GalaxyDeduplicator();
