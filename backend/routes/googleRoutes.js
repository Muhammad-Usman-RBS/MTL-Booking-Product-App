import express from "express";
import fetch from "node-fetch";
const router = express.Router();

// Airport terminal data for common UK airports
const airportTerminals = {
  heathrow: [
    "London Heathrow Airport (LHR), Terminal 1",
    "London Heathrow Airport (LHR), Terminal 2",
    "London Heathrow Airport (LHR), Terminal 3",
    "London Heathrow Airport (LHR), Terminal 4",
    "London Heathrow Airport (LHR), Terminal 5"
  ],
  lhr: [
    "London Heathrow Airport (LHR), Terminal 1",
    "London Heathrow Airport (LHR), Terminal 2",
    "London Heathrow Airport (LHR), Terminal 3",
    "London Heathrow Airport (LHR), Terminal 4",
    "London Heathrow Airport (LHR), Terminal 5"
  ],
  gatwick: [
    "London Gatwick Airport (LGW), North Terminal",
    "London Gatwick Airport (LGW), South Terminal"
  ],
  lgw: [
    "London Gatwick Airport (LGW), North Terminal",
    "London Gatwick Airport (LGW), South Terminal"
  ],
  stansted: ["London Stansted Airport (STN), Main Terminal"],
  stn: ["London Stansted Airport (STN), Main Terminal"],
  luton: ["London Luton Airport (LTN), Main Terminal"],
  ltn: ["London Luton Airport (LTN), Main Terminal"],
  city: ["London City Airport (LCY), Main Terminal"],
  lcy: ["London City Airport (LCY), Main Terminal"],
  manchester: [
    "Manchester Airport (MAN), Terminal 1",
    "Manchester Airport (MAN), Terminal 2",
    "Manchester Airport (MAN), Terminal 3"
  ],
  man: [
    "Manchester Airport (MAN), Terminal 1",
    "Manchester Airport (MAN), Terminal 2",
    "Manchester Airport (MAN), Terminal 3"
  ],
  birmingham: ["Birmingham Airport (BHX), Main Terminal"],
  bhx: ["Birmingham Airport (BHX), Main Terminal"],
  edinburgh: ["Edinburgh Airport (EDI), Main Terminal"],
  edi: ["Edinburgh Airport (EDI), Main Terminal"],
  glasgow: ["Glasgow Airport (GLA), Main Terminal"],
  gla: ["Glasgow Airport (GLA), Main Terminal"],
  bristol: ["Bristol Airport (BRS), Main Terminal"],
  brs: ["Bristol Airport (BRS), Main Terminal"],
  belfast: [
    "Belfast International Airport (BFS), Main Terminal",
    "Belfast City Airport (BHD), Main Terminal"
  ],
  bfs: ["Belfast International Airport (BFS), Main Terminal"],
  bhd: ["Belfast City Airport (BHD), Main Terminal"],
  leeds: ["Leeds Bradford Airport (LBA), Main Terminal"],
  lba: ["Leeds Bradford Airport (LBA), Main Terminal"],
  eastmidlands: ["East Midlands Airport (EMA), Main Terminal"],
  ema: ["East Midlands Airport (EMA), Main Terminal"],
  newcastle: ["Newcastle Airport (NCL), Main Terminal"],
  ncl: ["Newcastle Airport (NCL), Main Terminal"],
};

// Autocomplete route using internal airport list or Google Places API
router.get("/autocomplete", async (req, res) => {
  try {
    const queryRaw = req.query.input || "";
    const query = queryRaw.toLowerCase().replace(/\s+/g, "");

    const matchedKey = Object.keys(airportTerminals).find((key) => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
      return (
        query.includes(normalizedKey) ||
        normalizedKey.includes(query) ||
        normalizedKey === query
      );
    });

    if (matchedKey) {
      const results = airportTerminals[matchedKey].map((item) => ({
        name: item.split(",")[0],
        formatted_address: item,
        source: "airport",
      }));
      return res.json({ predictions: results });
    }

    // 🌐 Fallback to Google Places Autocomplete API
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      queryRaw
    )}&components=country:gb&key=${process.env.GOOGLE_LOCATION_API}`;

    const response = await fetch(url);
    const data = await response.json();

    const predictions =
      data?.predictions?.map((p) => ({
        name: p.structured_formatting?.main_text,
        formatted_address: p.description,
        source: p.types?.includes("airport") ? "airport" : "location",
      })) || [];

    return res.json({ predictions });
  } catch (error) {
    console.error("Autocomplete API error:", error);
    res.status(500).json({ error: "Failed to fetch autocomplete data" });
  }
});

// Calculate distance and duration between two locations using Google Distance Matrix API
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
    const distanceValue = element.distance?.value || null;
    const durationText = element.duration?.text || null;

    res.json({
      distanceText,
      distanceValue,
      durationText,
    });
  } catch (error) {
    console.error("Distance API error:", error);
    res.status(500).json({ error: "Failed to fetch distance data" });
  }
});

export default router;
