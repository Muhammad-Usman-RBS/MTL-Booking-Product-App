import express from "express";
import mongoose from "mongoose";
import ReviewSetting from "../models/settings/ReviewSetting.js";
import Booking from "../models/Booking.js";
import sendReviewEmail from "../utils/sendReviewEmail.js";
import { compileReviewTemplate } from "../utils/reviewPlaceholders.js";

const router = express.Router();

const DEFAULT_SUBJECT = "Share your experience - !ORDER_NO!";
const DEFAULT_TEMPLATE = `Dear !PASSENGER_NAME!,

Thank you for choosing Mega Transfers Limited for your journey !ORDER_NO! on !PICKUP_DATE_TIME!.

We hope the journey was to your satisfaction and we appreciate your suggestions to improve our service.

Would you like to share your experience with us via following link:
!REVIEW_LINK!

We consider all positive and negative feedbacks, it helps us to continuously improve our standards.

If you have any questions or you would like to share any suggestions please email us on Bookings@megatransfers.co.uk.

We are looking forward to seeing you again.

Thank you

Team Mega Transfers`;

// Small helper
const isValidObjectId = (id) => typeof id === "string" && id.length === 24 && mongoose.isValidObjectId(id);

/** █ GET /api/reviews/settings?companyId=... */
router.get("/settings", async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!isValidObjectId(companyId)) {
            return res.status(400).json({ message: "Valid companyId is required" });
        }

        let doc = await ReviewSetting.findOne({ companyId });
        if (!doc) {
            // seed once with sane defaults
            doc = await ReviewSetting.create({
                companyId,
                subject: DEFAULT_SUBJECT,
                template: DEFAULT_TEMPLATE,
                reviewLink: "https://g.page/r/CUFVH1EVOz6iEAI/review",
            });
        }

        res.json({ success: true, settings: doc });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.put("/settings", async (req, res) => {
    try {
        const { companyId, subject, template, reviewLink = "" } = req.body || {};

        if (!isValidObjectId(companyId)) {
            return res.status(400).json({ message: "Valid companyId is required" });
        }
        if (!subject?.trim()) {
            return res.status(400).json({ message: "Subject is required" });
        }
        if (!template?.trim()) {
            return res.status(400).json({ message: "Template is required" });
        }

        const settings = await ReviewSetting.findOneAndUpdate(
            { companyId },
            {
                subject: subject.trim(),
                template: template.trim(),
                reviewLink: reviewLink?.trim() || "",
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, settings });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/send/:bookingId", async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ message: "Valid bookingId is required" });
        }

        const booking = await Booking.findById(bookingId).lean();
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (!booking?.passenger?.email) {
            return res.status(400).json({ message: "Passenger email not found on booking" });
        }

        // prevent duplicate manual sends if already sent earlier
        if (booking.reviewEmailSent) {
            return res.status(409).json({ message: "Review email already sent for this booking" });
        }

        const settings = await ReviewSetting.findOne({ companyId: booking.companyId }).lean();
        if (!settings) {
            return res.status(400).json({ message: "Review settings not configured" });
        }

        const subject = compileReviewTemplate(settings.subject || DEFAULT_SUBJECT, booking);

        let body = compileReviewTemplate(settings.template || DEFAULT_TEMPLATE, booking);
        const link = settings.reviewLink || "https://g.page/r/CUFVH1EVOz6iEAI/review";

        // If template uses token, replace it; otherwise, append (avoid duplicate)
        if (body.includes("!REVIEW_LINK!")) {
            body = body.replace(/!REVIEW_LINK!/g, link);
        } else if (link && !body.includes(link)) {
            body += `\n\n${link}`;
        }

        await sendReviewEmail(booking.passenger.email, subject, {
            text: body,
            html: body.replace(/\n/g, "<br/>"),
        });

        await Booking.findByIdAndUpdate(bookingId, { $set: { reviewEmailSent: true } });

        res.json({ success: true, message: "Review email sent" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

export default router;
