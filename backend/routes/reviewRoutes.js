import express from "express";
import mongoose from "mongoose";
import ReviewSetting from "../models/settings/ReviewSetting.js";
import Booking from "../models/Booking.js";
import sendReviewEmail from "../utils/bookings/sendReviewEmail.js";
import { compileReviewTemplate } from "../utils/bookings/reviewPlaceholders.js";
import { DEFAULT_SUBJECT, DEFAULT_TEMPLATE } from "../utils/bookings/reviewDefaults.js";

const router = express.Router();

// Small helper
const isValidObjectId = (id) =>
    typeof id === "string" &&
    id.length === 24 &&
    mongoose.isValidObjectId(id);

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
        // use defaults if not configured (allows manual send even before settings exist)
        const subjectTpl = settings?.subject || DEFAULT_SUBJECT;
        const bodyTpl = settings?.template || DEFAULT_TEMPLATE;
        const link = settings?.reviewLink || "https://g.page/r/CUFVH1EVOz6iEAI/review";

        const subject = compileReviewTemplate(subjectTpl, booking);
        let body = compileReviewTemplate(bodyTpl, booking);

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
