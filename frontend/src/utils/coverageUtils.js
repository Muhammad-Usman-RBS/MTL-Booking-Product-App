/** Ray-casting: check if a point lies inside a polygon */
export function pointInPolygon(point, polygon = []) {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return false;
  if (!Array.isArray(polygon) || polygon.length < 3) return false;

  const x = point.lng, y = point.lat;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = Number(polygon[i].lng), yi = Number(polygon[i].lat);
    const xj = Number(polygon[j].lng), yj = Number(polygon[j].lat);
    const intersect =
      ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Normalize as you already do (unchanged) */
export function normalizeCoverageRules(coveragesResp) {
  const arr = Array.isArray(coveragesResp)
    ? coveragesResp
    : Array.isArray(coveragesResp?.data)
    ? coveragesResp.data
    : [];

  return arr.map((c) => ({
    type: (c.type || "Both").toLowerCase(),          // pickup | dropoff | both
    coverage: (c.coverage || "Allow").toLowerCase(), // allow | block
    category: (c.category || "").toLowerCase(),      // zone | postcode
    value: String(c.value || "").trim(),
    zoneCoordinates: Array.isArray(c.zoneCoordinates)
      ? c.zoneCoordinates.map(pt => ({
          lat: Number(pt.lat),
          lng: Number(pt.lng),
        }))
      : [],
  }));
}
/** Outward code helper (unchanged) */
export function outwardFromText(txt = "") {
  const m = String(txt).toUpperCase().match(/([A-Z]{1,2}\d[A-Z\d]?)/);
  return m ? m[1] : "";
}

/** Single-rule match. Accept optional coords for polygon check */
export function matchesRule(text, rule, coords /* {lat,lng}? */) {
  if (!text || !rule) return false;
  const t = String(text).toLowerCase();

  if (rule.category === "zone") {
    // If we have coordinates for the typed/selected place, do polygon test.
    if (
      coords &&
      Array.isArray(rule.zoneCoordinates) &&
      rule.zoneCoordinates.length >= 3
    ) {
      return pointInPolygon(coords, rule.zoneCoordinates);
    }
    // Fallback to string contains when coords not available
    return t.includes(String(rule.value).toLowerCase());
  }

  if (rule.category === "postcode") {
    const outward = outwardFromText(text);
    return outward === String(rule.value || "").toUpperCase();
  }

  return false;
}

/** Decide coverage: now accepts optional coords */
export function decideCoverage(text, scope, coverageRules = [], coords) {
  if (!text) return { allowed: true, reason: "empty", hits: [] };
  const lowerScope = String(scope || "").toLowerCase();

  const scoped = coverageRules.filter(
    (r) => r.type === "both" || r.type === lowerScope
  );

  const hits = scoped.filter((r) => matchesRule(text, r, coords));
  if (hits.length === 0) return { allowed: true, reason: "no-rules", hits };

  const hasBlock = hits.some((h) => h.coverage === "block");
  if (hasBlock) return { allowed: false, reason: "blocked", hits };

  return { allowed: true, reason: "allowed", hits };
}
