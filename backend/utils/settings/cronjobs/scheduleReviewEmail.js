import Booking from "../../../models/Booking.js";
import CronJob from "../../../models/settings/CronJob.js";
import ReviewSetting from "../../../models/settings/ReviewSetting.js";
import { compileReviewTemplate } from "../../reviewPlaceholders.js";
import sendReviewEmail from "../../sendReviewEmail.js";

export const hoursToMs = (val) => {
    if (val == null) return 0;
    const str = String(val).trim().toLowerCase();

    // number only? default hours
    if (/^\d+(\.\d+)?$/.test(str)) {
        const n = parseFloat(str);
        return n * 3600 * 1000;
    }

    const num = parseFloat(str.match(/[\d.]+/)?.[0] || "0");
    if (!num) return 0;

    if (str.includes("sec")) return num * 1000;            // "10 sec", "10 seconds"
    if (str.includes("min")) return num * 60 * 1000;       // "2 min", "2 minutes"
    if (str.includes("hour") || str.includes("hr") || str.includes("h")) {
        return num * 3600 * 1000;                            // "1 hour", "1 h"
    }
    // fallback => hours
    return num * 3600 * 1000;
};

export const scheduleReviewEmail = async (booking) => {
    try {
        // safety checks
        const paxEmail = booking?.passenger?.email?.trim();
        if (!paxEmail) return;

        // don't double-schedule if already sent
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

        // delay
        const delayMs = hoursToMs(feature.timing?.hours || "1 hours");
        const when = new Date(Date.now() + delayMs);
        console.log(`Scheduling review email for booking #${booking.bookingId} at ${when.toISOString()}`);

        setTimeout(async () => {
            try {
                // re-fetch latest booking to ensure not already sent / still completed
                const fresh = await Booking.findById(booking._id);
                if (!fresh) return;
                if (fresh.reviewEmailSent) return;

                // optional: ensure still "Completed"
                const normalized = (fresh.status || "").toLowerCase().trim();
                if (normalized !== "completed") return;

                // load company review template
                const settings = await ReviewSetting.findOne({ companyId: fresh.companyId }).lean();
                if (!settings) {
                    console.log("No ReviewSetting found for company:", fresh.companyId.toString());
                    return;
                }
                console.log("Sending review email to:", paxEmail, "subjectTpl:", settings.subject);

                const subj = compileReviewTemplate(settings.subject, fresh);
                let body = compileReviewTemplate(settings.template, fresh);
                if (body.includes("!REVIEW_LINK!")) {
                    body = body.replace(/!REVIEW_LINK!/g, settings.reviewLink || "");
                } else if (settings.reviewLink && !body.includes(settings.reviewLink)) {
                    body += `\n\n${settings.reviewLink}`;
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
        console.error("scheduleReviewEmail failed:", e.message);
    }
};
