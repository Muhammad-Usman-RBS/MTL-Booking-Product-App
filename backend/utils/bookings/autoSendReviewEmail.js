import Booking from "../../models/Booking.js";
import CronJob from "../../models/settings/CronJob.js";
import ReviewSetting from "../../models/settings/ReviewSetting.js";
import { compileReviewTemplate } from "./reviewPlaceholders.js";
import sendReviewEmail from "./sendReviewEmail.js";
import { DEFAULT_SUBJECT, DEFAULT_TEMPLATE } from "../bookings/reviewDefaults.js";

// Convert things like "1", "1h", "90m", "30 min", "10 sec" → ms
export const hoursToMs = (val) => {
    if (val == null) return 0;
    const str = String(val).trim().toLowerCase();

    // "1.5" (treat as hours)
    if (/^\d+(\.\d+)?$/.test(str)) {
        const n = parseFloat(str);
        return n * 3600 * 1000;
    }

    const n = parseFloat(str.match(/[\d.]+/)?.[0] || "0");
    if (!n) return 0;

    if (str.includes("sec")) return n * 1000;
    if (str.includes("min")) return n * 60 * 1000;
    if (str.includes("hour") || str.includes("hr") || /\b\d+h\b/.test(str) || str.endsWith("h")) {
        return n * 3600 * 1000;
    }
    // fallback => hours
    return n * 3600 * 1000;
};

export const autoSendReviewEmail = async (booking) => {
    try {
        const paxEmail = booking?.passenger?.email?.trim();
        if (!paxEmail) return;

        // don't schedule if already sent
        if (booking.reviewEmailSent) return;

        // read cron settings
        const cj = await CronJob.findOne({ companyId: booking.companyId }).lean();
        const feature = cj?.reviews || {};
        const enabled = !!feature.enabled;
        const emailOn = !!feature.notifications?.email;

        if (!enabled || !emailOn) {
            console.log("Reviews email disabled by CronJob settings – skipping");
            return;
        }

        // schedule after delay
        const delayMs = hoursToMs(feature.timing?.hours || "1 hours");
        const when = new Date(Date.now() + delayMs);
        console.log(`Scheduling review email for booking #${booking.bookingId} at ${when.toISOString()}`);

        setTimeout(async () => {
            try {
                // re-fetch latest booking
                const fresh = await Booking.findById(booking._id);
                if (!fresh) return;
                if (fresh.reviewEmailSent) return;

                // optional: ensure booking is completed before emailing
                const normalized = (fresh.status || "").toLowerCase().trim();
                if (normalized !== "completed") return;

                // load company review template (with fallbacks)
                const settings = await ReviewSetting.findOne({ companyId: fresh.companyId }).lean();
                const subjectTpl = settings?.subject || DEFAULT_SUBJECT;
                const bodyTpl = settings?.template || DEFAULT_TEMPLATE;
                const link = settings?.reviewLink || "https://g.page/r/CUFVH1EVOz6iEAI/review";

                const subj = compileReviewTemplate(subjectTpl, fresh);
                let body = compileReviewTemplate(bodyTpl, fresh);

                // insert link token or append if missing (avoid duplication)
                if (body.includes("!REVIEW_LINK!")) {
                    body = body.replace(/!REVIEW_LINK!/g, link);
                } else if (link && !body.includes(link)) {
                    body += `\n\n${link}`;
                }

                await sendReviewEmail(paxEmail, subj, {
                    text: body,
                    html: body.replace(/\n/g, "<br/>"),
                });

                fresh.reviewEmailSent = true;
                await fresh.save();
                console.log(`Review email sent (delayed) for booking #${fresh.bookingId}`);
            } catch (e) {
                console.error("Delayed review email failed:", e.message);
            }
        }, delayMs);
    } catch (e) {
        console.error("autoSendReviewEmail failed:", e.message);
    }
};
