import cron from "node-cron";
import crypto from "crypto";
import Driver from "../../../models/Driver.js";
import sendEmail from "../../../utils/sendEmail.js";
import CronJob from "../../../models/settings/CronJob.js";
import { collectExpiredDocs } from "../../../utils/settings/cronjobs/expiry.js";

const activeCronJobs = new Map();

function parseDailyWindow(timeStr) {
  const fallback = { hour: 9, minute: 0 };
  if (!timeStr || typeof timeStr !== "string") return fallback;
  const [start] = timeStr.split(/–|-/);
  const [h, m] = (start || "").trim().split(":").map((n) => parseInt(n, 10));
  return Number.isInteger(h) && Number.isInteger(m) ? { hour: h, minute: m } : fallback;
}

function parseDailyWindowRange(timeStr) {
  const fallback = { start: { h: 9, m: 0 }, end: { h: 10, m: 0 } };
  if (!timeStr || typeof timeStr !== "string") return fallback;
  const [startRaw, endRaw] = timeStr.split(/–|-/);
  if (!startRaw || !endRaw) return fallback;
  const [sh, sm] = startRaw.trim().split(":").map((n) => parseInt(n, 10));
  const [eh, em] = endRaw.trim().split(":").map((n) => parseInt(n, 10));
  const ok = (h, m) => Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h < 24 && m >= 0 && m < 60;
  return ok(sh, sm) && ok(eh, em)
    ? { start: { h: sh, m: sm }, end: { h: eh, m: em } }
    : fallback;
}
function getNowHMInTZ(tz = "UTC") {
  const dt = new Date(new Date().toLocaleString("en-GB", { timeZone: tz }));
  return { h: dt.getHours(), m: dt.getMinutes() };
}
function isWithinWindow(dailyTimeStr, tz = "UTC") {
  const { start, end } = parseDailyWindowRange(dailyTimeStr);
  const now = getNowHMInTZ(tz);
  const toMin = (x) => x.h * 60 + x.m;
  const n = toMin(now), s = toMin(start), e = toMin(end);
  if (e === s) return true;
  if (e > s) return n >= s && n < e;
  return n >= s || n < e; 
}
const EXPIRY_FIELD_MAP = {
  driverLicenseExpiry: { label: "Driver License Expiry", path: "DriverData.driverLicenseExpiry" },
  driverPrivateHireLicenseExpiry: { label: "Private Hire License Expiry", path: "DriverData.driverPrivateHireLicenseExpiry" },
  carPrivateHireLicenseExpiry: { label: "Car Private Hire License Expiry", path: "VehicleData.carPrivateHireLicenseExpiry" },
  carInsuranceExpiry: { label: "Car Insurance Expiry", path: "VehicleData.carInsuranceExpiry" },
  motExpiryDate: { label: "MOT Expiry Date", path: "VehicleData.motExpiryDate" },
};

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function fmtDateYMD(v) {
  if (!v) return "";
  const d =
    v instanceof Date
      ? v
      : (typeof v === "string" && !Number.isNaN(Date.parse(v))) ? new Date(v) : null;
  return d ? d.toISOString().slice(0, 10) : String(v);
}

function buildExpiredFieldsObject(driver, expiredKeys) {
  const out = {};
  for (const key of expiredKeys) {
    const meta = EXPIRY_FIELD_MAP[key];
    if (!meta) continue;
    out[meta.label] = fmtDateYMD(getByPath(driver, meta.path));
  }
  return out;
}

function docsHash(arr) {
  return crypto.createHash("sha1").update(arr.slice().sort().join("|")).digest("hex");
}

async function shouldSendAndMark(driverDoc, expiredDocs) {
  const hash = docsHash(expiredDocs);
  const last = driverDoc?.Notifications?.docExpiry;
  const now = new Date();

  if (last?.lastDocsHash === hash && last?.lastSentAt && now - last.lastSentAt < 24 * 60 * 60 * 1000) {
    return false;
  }

  driverDoc.Notifications = driverDoc.Notifications || {};
  driverDoc.Notifications.docExpiry = { lastSentAt: now, lastDocsHash: hash };
  await driverDoc.save();
  return true;
}

async function markDocExpiryLocal(driverDoc, expiredDocs) {
  const hash = docsHash(expiredDocs);
  driverDoc.Notifications = driverDoc.Notifications || {};
  driverDoc.Notifications.docExpiry = { lastSentAt: new Date(), lastDocsHash: hash };
  await driverDoc.save();
}

export async function runOnceForCompany(
  companyId,
  { report = false, dryRun = false, force = false, ignoreWindow = false } = {}
) {
  const out = {
    companyId,
    startedAt: new Date().toISOString(),
    candidates: 0,
    emailsSent: 0,
    drivers: [],
  };

  try {
    const cronSettings = await CronJob.findOne({ companyId }).lean();
    const emailEnabled =
      !!cronSettings?.driverDocumentsExpiration?.enabled &&
      !!cronSettings?.driverDocumentsExpiration?.notifications?.email;
    const tz = process.env.CRON_TIMEZONE || "UTC";
    const dailyTime = cronSettings?.driverDocumentsExpiration?.timing?.dailyTime;
    const within = isWithinWindow(dailyTime, tz);
    if (!ignoreWindow && !within && !report && !dryRun) {
      out.note = "outside_window";
      return out;
    }
    if (!emailEnabled && !report && !dryRun) {
      return out;
    }
    const drivers = await Driver.find({ companyId });
    for (const driver of drivers) {
      try {
        const expiredKeys = collectExpiredDocs(driver);
        if (expiredKeys.length === 0) continue;
        out.candidates++;
        let emailSent = null;
        if (!dryRun && emailEnabled) {
          const email = driver?.DriverData?.email;
          let allowed = true;
          if (!force) {
            allowed = await shouldSendAndMark(driver, expiredKeys);
          }
          if (email && allowed) {
            try {
              const expiredFieldsOnly = buildExpiredFieldsObject(driver, expiredKeys); 
              const expiredPayload = Object.fromEntries(
                Object.entries(expiredFieldsOnly).map(([k, v]) => [k, { expiresOn: v }])
              );
              await sendDriverDocsExpiryEmail({
                to: email,
                driverName: `${driver?.DriverData?.firstName || ""} ${driver?.DriverData?.surName || ""}`.trim(),
                expiredDocs: expiredPayload,
                companyName: "Mega Transfers",
              });
              if (force) {
                try {
                  await markDocExpiryLocal(driver, expiredKeys);
                } catch (markErr) {
                }
              }

              emailSent = true;
              out.emailsSent++;
            } catch (e) {
              emailSent = false;
            }
          }
        }
        if (report) {
          out.drivers.push({
            employeeNumber: driver?.DriverData?.employeeNumber,
            name: `${driver?.DriverData?.firstName || ""} ${driver?.DriverData?.surName || ""}`.trim(),
            email: driver?.DriverData?.email || "",
            expiredDocs: expiredKeys,
            emailSent,
          });
        }
      } catch (perDriverErr) {
        if (report) {
          out.drivers.push({
            employeeNumber: driver?.DriverData?.employeeNumber,
            name: `${driver?.DriverData?.firstName || ""} ${driver?.DriverData?.surName || ""}`.trim(),
            email: driver?.DriverData?.email || "",
            expiredDocs: [],
            emailSent: null,
            error: String(perDriverErr?.message || perDriverErr),
          });
        }
      }
    }
  } catch (error) {
    if (report) out.error = String(error?.message || error);
  }
  out.finishedAt = new Date().toISOString();
  return out;
}
function stopCronJob(companyId) {
  const jobKey = `docExpiry_${companyId}`;
  const existingJob = activeCronJobs.get(jobKey);
  if (existingJob) {
    existingJob.destroy();
    activeCronJobs.delete(jobKey);
  }
}

function scheduleSingleCompany(companyId, dExp) {
  const { hour, minute } = parseDailyWindow(dExp?.timing?.dailyTime);
  const expr = `${minute} ${hour} * * *`;
  const jobKey = `docExpiry_${companyId}`;
  stopCronJob(companyId);
  const task = cron.schedule(
    expr,
    async () => {
      try {
        await runOnceForCompany(companyId);
      } catch (error) {
      }
    },
    {
      scheduled: true,
      timezone: process.env.CRON_TIMEZONE || "UTC",
    }
  );

  activeCronJobs.set(jobKey, task);
}
export async function scheduleDriverDocsJobs() {
  try {
    const companies = await CronJob.find(
      {
        "driverDocumentsExpiration.enabled": true,
        "driverDocumentsExpiration.notifications.email": true,
        "driverDocumentsExpiration.timing.dailyTime": { $exists: true, $ne: "" },
      },
      { companyId: 1, driverDocumentsExpiration: 1 }
    ).lean();
    activeCronJobs.forEach((job, key) => {
      job.destroy();
    });
    activeCronJobs.clear();
    companies.forEach(({ companyId, driverDocumentsExpiration }) => {
      scheduleSingleCompany(companyId, driverDocumentsExpiration);
    });
  } catch (error) {
  }
}
export async function rescheduleDriverDocsJobs() {
  await scheduleDriverDocsJobs();
}

export async function updateCompanyCronJob(companyId) {
  try {
    const cronSettings = await CronJob.findOne({ companyId }).lean();
    const en = !!cronSettings?.driverDocumentsExpiration?.enabled;
    const mail = !!cronSettings?.driverDocumentsExpiration?.notifications?.email;
    const time = cronSettings?.driverDocumentsExpiration?.timing?.dailyTime;
    if (!en || !mail || !time) {
      stopCronJob(companyId);
      return;
    }
    scheduleSingleCompany(companyId, cronSettings.driverDocumentsExpiration);
  } catch (error) {
  }
}