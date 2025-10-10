import dayjs from "dayjs";

const pad = (n) => String(n ?? "").padStart(2, "0");

export const buildPickupDateTime = (booking) => {
  const j = booking?.primaryJourney ?? {};
  const base = j.date ? dayjs(j.date) : null;
  const hh = Number.isFinite(+j.hour) ? pad(+j.hour) : "00";
  const mm = Number.isFinite(+j.minute) ? pad(+j.minute) : "00";
  if (base) return base.hour(+hh).minute(+mm).format("DD MMM YYYY, HH:mm");
  return `${j.date || "N/A"} ${hh}:${mm}`;
};
export const compileReviewTemplate = (raw, booking) => {
  const p = booking?.passenger || {};
  const orderNo = booking?.bookingId || "";
  const dt = buildPickupDateTime(booking);
  const map = {
    "!ORDER_NO!": orderNo,
    "!PASSENGER_NAME!": p.name || "Passenger",
    "!PICKUP_DATE_TIME!": dt,
    "!PICKUP!": booking?.primaryJourney?.pickup || "",
    "!DROPOFF!": booking?.primaryJourney?.dropoff || "",
  };
  let out = raw;
  Object.entries(map).forEach(([k, v]) => {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(re, String(v ?? ""));
  });
  return out;
};