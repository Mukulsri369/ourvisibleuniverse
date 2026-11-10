/**
 * First difference between two JSON values, as a path and the two values, or null when
 * they agree. Numbers may differ by `relative` (default 1e-12 of the larger magnitude):
 * ECMAScript leaves `**`, Math.pow, Math.exp and Math.log implementation-approximated,
 * so different engines and Node versions can disagree in the last bits of derived values
 * (a few parts in 1e15 for the nearby catalogue's distance-modulus conversions).
 * Everything else — strings, booleans, null, object keys and array lengths — must match
 * exactly, and so must non-finite numbers. Key order is ignored, as in deepStrictEqual.
 */
export function jsonDifference(
  a: unknown,
  b: unknown,
  relative = 1e-12,
  path = "$",
): string | null {
  if (typeof a === "number" && typeof b === "number") {
    if (Object.is(a, b)) return null;
    const scale = Math.max(Math.abs(a), Math.abs(b));
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= relative * scale
      ? null
      : `${path}: ${a} vs ${b}`;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return `${path}: array vs non-array`;
    if (a.length !== b.length) return `${path}: length ${a.length} vs ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const difference = jsonDifference(a[i], b[i], relative, `${path}[${i}]`);
      if (difference) return difference;
    }
    return null;
  }
  if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a).sort(),
      keysB = Object.keys(b).sort();
    if (keysA.join("\0") !== keysB.join("\0"))
      return `${path}: keys {${keysA.join(", ")}} vs {${keysB.join(", ")}}`;
    for (const key of keysA) {
      const difference = jsonDifference(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        relative,
        `${path}.${key}`,
      );
      if (difference) return difference;
    }
    return null;
  }
  return Object.is(a, b) ? null : `${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
}
