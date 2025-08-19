import { useEffect } from "react";

export const selectedDateTime = (journeyData) => {
  if (!journeyData?.date) return null;
  const [y, m, d] = journeyData.date.slice(0, 10).split("-").map(Number);
  const hh = Number(journeyData.hour ?? 0);
  const mm = Number(journeyData.minute ?? 0);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

export const isBetween = (target, start, end) =>
  target.getTime() >= start.getTime() && target.getTime() <= end.getTime();

export const matchYearlyWindow = (target, fromISO, toISO) => {
  const f = new Date(fromISO);
  const t = new Date(toISO);

  const fy = target.getFullYear();
  const fThis = new Date(
    fy, f.getMonth(), f.getDate(),
    f.getHours(), f.getMinutes(), 0, 0
  );
  const tThis = new Date(
    fy, t.getMonth(), t.getDate(),
    t.getHours(), t.getMinutes(), 0, 0
  );

  if (tThis.getTime() >= fThis.getTime()) {
    return isBetween(target, fThis, tThis);
  }

  const endOfYear = new Date(fy, 11, 31, 23, 59, 59, 999);
  const startOfYear = new Date(fy, 0, 1, 0, 0, 0, 0);
  return isBetween(target, fThis, endOfYear) || isBetween(target, startOfYear, tThis);
};

export const matchOneOffWindow = (target, fromISO, toISO) => {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  return isBetween(target, from, to);
};

export const isRestrictedHit = (target, r) => {
  if (!r || r.status !== "Active") return false;
  if (!r.from || !r.to) return false;

  const recurring = (r.recurring || r.reccuring || "").toLowerCase();
  if (recurring === "yearly") return matchYearlyWindow(target, r.from, r.to);
  return matchOneOffWindow(target, r.from, r.to);
};

export const findRestrictionHit = (journeyData, restrictions) => {
  const dt = selectedDateTime(journeyData);
  if (!dt || !Array.isArray(restrictions) || restrictions.length === 0) return null;
  return restrictions.find((r) => isRestrictedHit(dt, r)) || null;
};

export const formatRestrictionWindow = (r) => ({
  from: new Date(r.from).toLocaleString(),
  to: new Date(r.to).toLocaleString(),
});

export const useBookingRestrictionWatcher = (journeyData, restrictions, onHit) => {
  useEffect(() => {
    const hit = findRestrictionHit(journeyData, restrictions);
    if (hit && typeof onHit === "function") {
      const labels = formatRestrictionWindow(hit);
      onHit(hit, labels);
    }
  }, [journeyData?.date, journeyData?.hour, journeyData?.minute, restrictions]);
};
