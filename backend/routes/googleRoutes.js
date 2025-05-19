import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// --- Autocomplete API ---
router.get("/autocomplete", async (req, res) => {
  try {
    const query = req.query.input || "";
    if (!query) {
      return res.status(400).json({ error: "Query input is required" });
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&components=country:gb&key=${process.env.GOOGLE_LOCATION_API}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.predictions) {
      return res.status(500).json({ error: "Invalid autocomplete response" });
    }

    res.json(data);
  } catch (error) {
    console.error("Autocomplete API error:", error);
    res.status(500).json({ error: "Failed to fetch autocomplete data" });
  }
});

// --- Distance Matrix API ---
router.get("/distance", async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required" });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&key=${process.env.GOOGLE_LOCATION_API}`;

    const response = await fetch(url);
    const data = await response.json();

    const element = data?.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      return res.status(400).json({ error: "Invalid distance matrix response" });
    }

    const distanceText = element.distance?.text || null;
    const distanceValue = element.distance?.value || null; // in meters
    const durationText = element.duration?.text || null;

    res.json({
      distanceText, // e.g., "69.6 km"
      distanceValue, // e.g., 69600 (meters)
      durationText,  // e.g., "1 hour 2 mins"
    });
  } catch (error) {
    console.error("Distance API error:", error);
    res.status(500).json({ error: "Failed to fetch distance data" });
  }
});

export default router;
