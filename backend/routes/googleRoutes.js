// backend/routes/googleRoutes.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/autocomplete", async (req, res) => {
    try {
        const query = req.query.input || "";
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query
        )}&components=country:gb&key=${process.env.GOOGLE_LOCATION_API}`;

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error("Autocomplete API error:", error);
        res.status(500).json({ error: "Failed to fetch autocomplete data" });
    }
});

export default router;
