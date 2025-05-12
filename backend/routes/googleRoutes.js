import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/search-airports", async (req, res) => {
    try {
        // search-airports
        const query = req.query.input || "airport UK";
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            query
        )}&key=${process.env.GOOGLE_AIRPORT_API}`;

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error("Error fetching Google Places data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

router.get("/search-locations", async (req, res) => {
    try {
        // search-locations
        const query = req.query.input || "Coffee";
        // const location = req.query.location || "Austin, Texas, United States";
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            query
        )}&key=${process.env.GOOGLE_LOCATION_API}`;
        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error("Error fetching SerpAPI data:", error);
        res.status(500).json({ error: "Failed to fetch location data" });
    }
});

export default router;