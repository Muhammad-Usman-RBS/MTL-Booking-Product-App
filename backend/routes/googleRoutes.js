import express from "express";
import fetch from "node-fetch";
const router = express.Router();

// Local Airport Terminal Data
const airportTerminals = {
  // Heathrow (LHR)
  heathrow: [
    { name: "London Heathrow Airport (LHR), Terminal 1", formatted_address: "Heathrow Airport, Terminal 1, Cessna Rd, Longford, Hounslow TW6 1AH, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 2", formatted_address: "Heathrow Airport, Terminal 2, Cessna Rd, Longford, Hounslow TW6 1AH, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 3", formatted_address: "Heathrow Airport, Terminal 3, Cessna Rd, Longford, Hounslow TW6 1AH, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 4", formatted_address: "Heathrow Airport, Terminal 4, Stratford Rd, Hounslow TW6 3XA, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 5", formatted_address: "Heathrow Airport, Terminal 5, Longford TW6 2GA, UK" }
  ],
  lhr: [
    { name: "London Heathrow Airport (LHR), Terminal 1", formatted_address: "Heathrow Airport, Terminal 1, Cessna Rd, Longford, Hounslow TW6 1AH, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 2", formatted_address: "Heathrow Airport, Terminal 2, Cessna Rd, Longford, Hounslow TW6 1AH, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 3", formatted_address: "Heathrow Airport, Terminal 3, Cessna Rd, Longford, Hounslow TW6 1AH, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 4", formatted_address: "Heathrow Airport, Terminal 4, Stratford Rd, Hounslow TW6 3XA, UK" },
    { name: "London Heathrow Airport (LHR), Terminal 5", formatted_address: "Heathrow Airport, Terminal 5, Longford TW6 2GA, UK" }
  ],

  // Gatwick (LGW)
  gatwick: [
    { name: "London Gatwick Airport (LGW), North Terminal", formatted_address: "Gatwick Airport, North Terminal, Horley RH6 0NP, UK" },
    { name: "London Gatwick Airport (LGW), South Terminal", formatted_address: "Gatwick Airport, South Terminal, Horley RH6 0NP, UK" }
  ],
  lgw: [
    { name: "London Gatwick Airport (LGW), North Terminal", formatted_address: "Gatwick Airport, North Terminal, Horley RH6 0NP, UK" },
    { name: "London Gatwick Airport (LGW), South Terminal", formatted_address: "Gatwick Airport, South Terminal, Horley RH6 0NP, UK" }
  ],

  // Stansted (STN)
  stansted: [
    { name: "London Stansted Airport (STN), Main Terminal", formatted_address: "Stansted Airport, Bassingbourn Rd, Stansted CM24 1QW, UK" }
  ],
  stn: [
    { name: "London Stansted Airport (STN), Main Terminal", formatted_address: "Stansted Airport, Bassingbourn Rd, Stansted CM24 1QW, UK" }
  ],

  // Luton (LTN)
  luton: [
    { name: "London Luton Airport (LTN), Main Terminal", formatted_address: "Luton Airport, Airport Way, Luton LU2 9LY, UK" }
  ],
  ltn: [
    { name: "London Luton Airport (LTN), Main Terminal", formatted_address: "Luton Airport, Airport Way, Luton LU2 9LY, UK" }
  ],

  // City Airport (LCY)
  city: [
    { name: "London City Airport (LCY), Main Terminal", formatted_address: "City Airport, Hartmann Rd, London E16 2PX, UK" }
  ],
  lcy: [
    { name: "London City Airport (LCY), Main Terminal", formatted_address: "City Airport, Hartmann Rd, London E16 2PX, UK" }
  ],

  // Manchester (MAN)
  manchester: [
    { name: "Manchester Airport (MAN), Terminal 1", formatted_address: "Manchester Airport, Terminal 1, Manchester M90 1QX, UK" },
    { name: "Manchester Airport (MAN), Terminal 2", formatted_address: "Manchester Airport, Terminal 2, Manchester M90 1QX, UK" },
    { name: "Manchester Airport (MAN), Terminal 3", formatted_address: "Manchester Airport, Terminal 3, Manchester M90 1QX, UK" }
  ],
  man: [
    { name: "Manchester Airport (MAN), Terminal 1", formatted_address: "Manchester Airport, Terminal 1, Manchester M90 1QX, UK" },
    { name: "Manchester Airport (MAN), Terminal 2", formatted_address: "Manchester Airport, Terminal 2, Manchester M90 1QX, UK" },
    { name: "Manchester Airport (MAN), Terminal 3", formatted_address: "Manchester Airport, Terminal 3, Manchester M90 1QX, UK" }
  ],

  // Birmingham (BHX)
  birmingham: [
    { name: "Birmingham Airport (BHX), Main Terminal", formatted_address: "Birmingham Airport, Birmingham B26 3QJ, UK" }
  ],
  bhx: [
    { name: "Birmingham Airport (BHX), Main Terminal", formatted_address: "Birmingham Airport, Birmingham B26 3QJ, UK" }
  ],

  // Edinburgh (EDI)
  edinburgh: [
    { name: "Edinburgh Airport (EDI), Main Terminal", formatted_address: "Edinburgh Airport, Edinburgh EH12 9DN, UK" }
  ],
  edi: [
    { name: "Edinburgh Airport (EDI), Main Terminal", formatted_address: "Edinburgh Airport, Edinburgh EH12 9DN, UK" }
  ],

  // Glasgow (GLA)
  glasgow: [
    { name: "Glasgow Airport (GLA), Main Terminal", formatted_address: "Glasgow Airport, Paisley PA3 2SW, UK" }
  ],
  gla: [
    { name: "Glasgow Airport (GLA), Main Terminal", formatted_address: "Glasgow Airport, Paisley PA3 2SW, UK" }
  ],

  // Bristol (BRS)
  bristol: [
    { name: "Bristol Airport (BRS), Main Terminal", formatted_address: "Bristol Airport, Bristol BS48 3DY, UK" }
  ],
  brs: [
    { name: "Bristol Airport (BRS), Main Terminal", formatted_address: "Bristol Airport, Bristol BS48 3DY, UK" }
  ],

  // Belfast (BFS/BHD)
  belfast: [
    { name: "Belfast International Airport (BFS), Main Terminal", formatted_address: "Belfast International Airport, Crumlin BT29 4AB, UK" },
    { name: "Belfast City Airport (BHD), Main Terminal", formatted_address: "George Best Belfast City Airport, Belfast BT3 9JH, UK" }
  ],
  bfs: [
    { name: "Belfast International Airport (BFS), Main Terminal", formatted_address: "Belfast International Airport, Crumlin BT29 4AB, UK" }
  ],
  bhd: [
    { name: "Belfast City Airport (BHD), Main Terminal", formatted_address: "George Best Belfast City Airport, Belfast BT3 9JH, UK" }
  ],

  // Leeds (LBA)
  leeds: [
    { name: "Leeds Bradford Airport (LBA), Main Terminal", formatted_address: "Leeds Bradford Airport, Leeds LS19 7TU, UK" }
  ],
  lba: [
    { name: "Leeds Bradford Airport (LBA), Main Terminal", formatted_address: "Leeds Bradford Airport, Leeds LS19 7TU, UK" }
  ],

  // East Midlands (EMA)
  eastmidlands: [
    { name: "East Midlands Airport (EMA), Main Terminal", formatted_address: "East Midlands Airport, Derby DE74 2SA, UK" }
  ],
  ema: [
    { name: "East Midlands Airport (EMA), Main Terminal", formatted_address: "East Midlands Airport, Derby DE74 2SA, UK" }
  ],

  // Newcastle (NCL)
  newcastle: [
    { name: "Newcastle Airport (NCL), Main Terminal", formatted_address: "Newcastle International Airport, Newcastle upon Tyne NE13 8BZ, UK" }
  ],
  ncl: [
    { name: "Newcastle Airport (NCL), Main Terminal", formatted_address: "Newcastle International Airport, Newcastle upon Tyne NE13 8BZ, UK" }
  ]
};

// HYBRID API (Local first, Google fallback)
router.get("/autocomplete", async (req, res) => {
  try {
    const queryRaw = req.query.input || "";
    const query = queryRaw.toLowerCase().replace(/[\s,-]+/g, "");

    const matchedKey = Object.keys(airportTerminals).find(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
      return query.includes(normalizedKey) || normalizedKey.includes(query);
    });

    if (matchedKey) {
      const results = airportTerminals[matchedKey].map(item => ({
        name: item.name,
        formatted_address: item.formatted_address,
        source: "airport-local"
      }));
      return res.json({ predictions: results });
    }

    // If not found locally → fallback to Google
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(queryRaw)}&components=country:gb&key=${process.env.GOOGLE_LOCATION_API}`;
    const autocompleteResponse = await fetch(autocompleteUrl);
    const autocompleteData = await autocompleteResponse.json();

    const predictions = autocompleteData?.predictions?.slice(0, 5) || [];

    const detailedResults = await Promise.all(predictions.map(async (prediction) => {
      const placeId = prediction.place_id;
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address&key=${process.env.GOOGLE_LOCATION_API}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      return {
        name: detailsData.result?.name || prediction.structured_formatting?.main_text,
        formatted_address: detailsData.result?.formatted_address || prediction.description,
        source: prediction.types?.includes("airport") ? "airport-google" : "location"
      };
    }));

    return res.json({ predictions: detailedResults });
  } catch (error) {
    console.error("Autocomplete API error:", error);
    res.status(500).json({ error: "Failed to fetch autocomplete data." });
  }
});

// Distance API — NO CHANGE (already correct)
router.get("/distance", async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required" });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${process.env.GOOGLE_LOCATION_API}`;
    const response = await fetch(url);
    const data = await response.json();

    const element = data?.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      return res.status(400).json({ error: "Invalid distance matrix response" });
    }

    const distanceText = element.distance?.text || null;
    const distanceValue = element.distance?.value || null;
    const durationText = element.duration?.text || null;

    res.json({ distanceText, distanceValue, durationText });
  } catch (error) {
    console.error("Distance API error:", error);
    res.status(500).json({ error: "Failed to fetch distance data" });
  }
});

// ONLY GOOGLE MAP API KEY
router.get("/map-key", async (req, res) => {
  try {
    const safePublicKey = process.env.GOOGLE_MAP_BROWSER_KEY;
    return res.json({ mapKey: safePublicKey });
  } catch (err) {
    console.error("Failed to fetch map key:", err);
    res.status(500).json({ error: "Failed to retrieve map key" });
  }
});

// POSTCODE SUGGESTION API
router.get("/postcode-suggestions", async (req, res) => {
  try {
    const query = req.query.input || "";
    if (!query) {
      return res.json({ postcodes: [] });
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:gb&types=postal_code&key=${process.env.GOOGLE_LOCATION_API}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    // Extract only valid UK postcode format (first part e.g. RH6, TW6, etc.)
    const postcodes = data?.predictions?.map(pred => {
      const match = pred.description.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/);
      return match ? match[0] : null;
    }).filter(Boolean) || [];

    res.json({ postcodes });

  } catch (error) {
    console.error("Postcode Suggestions API error:", error);
    res.status(500).json({ error: "Failed to fetch postcode suggestions" });
  }
});

// GEOCODE API - Convert address to lat/lng
router.get("/geocode", async (req, res) => {
  try {
    const address = req.query.address;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_LOCATION_API}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return res.status(400).json({ error: "Failed to geocode address" });
    }

    const location = data.results[0].geometry.location; // { lat, lng }
    res.json({ location });

  } catch (error) {
    console.error("Geocode API error:", error);
    res.status(500).json({ error: "Failed to geocode address" });
  }
});

export default router;
