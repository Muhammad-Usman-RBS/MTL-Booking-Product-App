import express from "express";
import fetch from "node-fetch";
import { google } from "googleapis";
import User from "../models/User.js";
import BookingSetting from "../models/settings/BookingSetting.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

// ✅ Initialize oAuth2Client here
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Local Airport Terminal Data
const airportTerminals = {
  // Heathrow (LHR)
  heathrow: [
    {
      name: "London Heathrow Airport (LHR), Terminal 1",
      formatted_address:
        "Heathrow Airport, Terminal 1, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 2",
      formatted_address:
        "Heathrow Airport, Terminal 2, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 3",
      formatted_address:
        "Heathrow Airport, Terminal 3, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 4",
      formatted_address:
        "Heathrow Airport, Terminal 4, Stratford Rd, Hounslow TW6 3XA, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 5",
      formatted_address: "Heathrow Airport, Terminal 5, Longford TW6 2GA, UK",
    },
  ],
  lhr: [
    {
      name: "London Heathrow Airport (LHR), Terminal 1",
      formatted_address:
        "Heathrow Airport, Terminal 1, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 2",
      formatted_address:
        "Heathrow Airport, Terminal 2, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 3",
      formatted_address:
        "Heathrow Airport, Terminal 3, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 4",
      formatted_address:
        "Heathrow Airport, Terminal 4, Stratford Rd, Hounslow TW6 3XA, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 5",
      formatted_address: "Heathrow Airport, Terminal 5, Longford TW6 2GA, UK",
    },
  ],

  // Gatwick (LGW)
  gatwick: [
    {
      name: "London Gatwick Airport (LGW), North Terminal",
      formatted_address: "Gatwick Airport, North Terminal, Horley RH6 0NP, UK",
    },
    {
      name: "London Gatwick Airport (LGW), South Terminal",
      formatted_address: "Gatwick Airport, South Terminal, Horley RH6 0NP, UK",
    },
  ],
  lgw: [
    {
      name: "London Gatwick Airport (LGW), North Terminal",
      formatted_address: "Gatwick Airport, North Terminal, Horley RH6 0NP, UK",
    },
    {
      name: "London Gatwick Airport (LGW), South Terminal",
      formatted_address: "Gatwick Airport, South Terminal, Horley RH6 0NP, UK",
    },
  ],

  // Stansted (STN)
  stansted: [
    {
      name: "London Stansted Airport (STN), Main Terminal",
      formatted_address:
        "Stansted Airport, Bassingbourn Rd, Stansted CM24 1QW, UK",
    },
  ],
  stn: [
    {
      name: "London Stansted Airport (STN), Main Terminal",
      formatted_address:
        "Stansted Airport, Bassingbourn Rd, Stansted CM24 1QW, UK",
    },
  ],

  // Luton (LTN)
  luton: [
    {
      name: "London Luton Airport (LTN), Main Terminal",
      formatted_address: "Luton Airport, Airport Way, Luton LU2 9LY, UK",
    },
  ],
  ltn: [
    {
      name: "London Luton Airport (LTN), Main Terminal",
      formatted_address: "Luton Airport, Airport Way, Luton LU2 9LY, UK",
    },
  ],

  // City Airport (LCY)
  city: [
    {
      name: "London City Airport (LCY), Main Terminal",
      formatted_address: "City Airport, Hartmann Rd, London E16 2PX, UK",
    },
  ],
  lcy: [
    {
      name: "London City Airport (LCY), Main Terminal",
      formatted_address: "City Airport, Hartmann Rd, London E16 2PX, UK",
    },
  ],

  // Manchester (MAN)
  manchester: [
    {
      name: "Manchester Airport (MAN), Terminal 1",
      formatted_address:
        "Manchester Airport, Terminal 1, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 2",
      formatted_address:
        "Manchester Airport, Terminal 2, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 3",
      formatted_address:
        "Manchester Airport, Terminal 3, Manchester M90 1QX, UK",
    },
  ],
  man: [
    {
      name: "Manchester Airport (MAN), Terminal 1",
      formatted_address:
        "Manchester Airport, Terminal 1, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 2",
      formatted_address:
        "Manchester Airport, Terminal 2, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 3",
      formatted_address:
        "Manchester Airport, Terminal 3, Manchester M90 1QX, UK",
    },
  ],

  // Birmingham (BHX)
  birmingham: [
    {
      name: "Birmingham Airport (BHX), Main Terminal",
      formatted_address: "Birmingham Airport, Birmingham B26 3QJ, UK",
    },
  ],
  bhx: [
    {
      name: "Birmingham Airport (BHX), Main Terminal",
      formatted_address: "Birmingham Airport, Birmingham B26 3QJ, UK",
    },
  ],

  // Edinburgh (EDI)
  edinburgh: [
    {
      name: "Edinburgh Airport (EDI), Main Terminal",
      formatted_address: "Edinburgh Airport, Edinburgh EH12 9DN, UK",
    },
  ],
  edi: [
    {
      name: "Edinburgh Airport (EDI), Main Terminal",
      formatted_address: "Edinburgh Airport, Edinburgh EH12 9DN, UK",
    },
  ],

  // Glasgow (GLA)
  glasgow: [
    {
      name: "Glasgow Airport (GLA), Main Terminal",
      formatted_address: "Glasgow Airport, Paisley PA3 2SW, UK",
    },
  ],
  gla: [
    {
      name: "Glasgow Airport (GLA), Main Terminal",
      formatted_address: "Glasgow Airport, Paisley PA3 2SW, UK",
    },
  ],

  // Bristol (BRS)
  bristol: [
    {
      name: "Bristol Airport (BRS), Main Terminal",
      formatted_address: "Bristol Airport, Bristol BS48 3DY, UK",
    },
  ],
  brs: [
    {
      name: "Bristol Airport (BRS), Main Terminal",
      formatted_address: "Bristol Airport, Bristol BS48 3DY, UK",
    },
  ],

  // Belfast (BFS/BHD)
  belfast: [
    {
      name: "Belfast International Airport (BFS), Main Terminal",
      formatted_address: "Belfast International Airport, Crumlin BT29 4AB, UK",
    },
    {
      name: "Belfast City Airport (BHD), Main Terminal",
      formatted_address:
        "George Best Belfast City Airport, Belfast BT3 9JH, UK",
    },
  ],
  bfs: [
    {
      name: "Belfast International Airport (BFS), Main Terminal",
      formatted_address: "Belfast International Airport, Crumlin BT29 4AB, UK",
    },
  ],
  bhd: [
    {
      name: "Belfast City Airport (BHD), Main Terminal",
      formatted_address:
        "George Best Belfast City Airport, Belfast BT3 9JH, UK",
    },
  ],

  // Leeds (LBA)
  leeds: [
    {
      name: "Leeds Bradford Airport (LBA), Main Terminal",
      formatted_address: "Leeds Bradford Airport, Leeds LS19 7TU, UK",
    },
  ],
  lba: [
    {
      name: "Leeds Bradford Airport (LBA), Main Terminal",
      formatted_address: "Leeds Bradford Airport, Leeds LS19 7TU, UK",
    },
  ],

  // East Midlands (EMA)
  eastmidlands: [
    {
      name: "East Midlands Airport (EMA), Main Terminal",
      formatted_address: "East Midlands Airport, Derby DE74 2SA, UK",
    },
  ],
  ema: [
    {
      name: "East Midlands Airport (EMA), Main Terminal",
      formatted_address: "East Midlands Airport, Derby DE74 2SA, UK",
    },
  ],

  // Newcastle (NCL)
  newcastle: [
    {
      name: "Newcastle Airport (NCL), Main Terminal",
      formatted_address:
        "Newcastle International Airport, Newcastle upon Tyne NE13 8BZ, UK",
    },
  ],
  ncl: [
    {
      name: "Newcastle Airport (NCL), Main Terminal",
      formatted_address:
        "Newcastle International Airport, Newcastle upon Tyne NE13 8BZ, UK",
    },
  ],
};

// Helper function to get avoid routes settings for a company
const getAvoidRoutesSettings = async (req) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return { highways: false, tolls: false, ferries: false };

    const setting = await BookingSetting.findOne({ companyId });
    return setting?.avoidRoutes || { highways: false, tolls: false, ferries: false };
  } catch (error) {
    console.error("Error fetching avoid routes settings:", error);
    return { highways: false, tolls: false, ferries: false };
  }
};

// Helper function to check if location involves avoided routes
const checkLocationForAvoidedRoutes = (location, avoidRoutes) => {
  if (!location || typeof location !== 'string') return { hasWarnings: false, warnings: [] };
  
  const locationLower = location.toLowerCase();
  const warnings = [];

  // Check highways/motorways
  if (avoidRoutes.highways && (
    locationLower.includes('motorway') || 
    locationLower.includes('highway') || 
    locationLower.includes('freeway') ||
    locationLower.includes('m1') || locationLower.includes('m25') || 
    locationLower.includes('m40') || locationLower.includes('a1') ||
    locationLower.includes('ring road') || locationLower.includes('bypass') ||
    /\bm\d+\b/.test(locationLower) || // Match M1, M25, etc.
    /\ba\d+\b/.test(locationLower)    // Match A1, A40, etc.
  )) {
    warnings.push('highways');
  }

  // Check tolls
  if (avoidRoutes.tolls && (
    locationLower.includes('toll') || 
    locationLower.includes('congestion charge') ||
    locationLower.includes('dartford') || locationLower.includes('severn bridge') ||
    locationLower.includes('london bridge') || locationLower.includes('tower bridge') ||
    locationLower.includes('congestion zone')
  )) {
    warnings.push('tolls');
  }

  // Check ferries
  if (avoidRoutes.ferries && (
    locationLower.includes('ferry') || 
    locationLower.includes('port') ||
    locationLower.includes('harbour') || locationLower.includes('harbor') ||
    locationLower.includes('pier') ||
    (locationLower.includes('terminal') && locationLower.includes('ferry'))
  )) {
    warnings.push('ferries');
  }

  return {
    hasWarnings: warnings.length > 0,
    warnings: warnings
  };
};

// HYBRID API (Local first, Google fallback) with avoid routes checking
router.get("/autocomplete", async (req, res) => {
  try {
    const queryRaw = req.query.input || "";
    const query = queryRaw.toLowerCase().replace(/[\s,-]+/g, "");

    // Get avoid routes settings
    const avoidRoutes = await getAvoidRoutesSettings(req);

    const matchedKey = Object.keys(airportTerminals).find((key) => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
      return query.includes(normalizedKey) || normalizedKey.includes(query);
    });

    if (matchedKey) {
      const results = airportTerminals[matchedKey].map((item) => {
        const routeCheck = checkLocationForAvoidedRoutes(item.formatted_address, avoidRoutes);
        return {
          name: item.name,
          formatted_address: item.formatted_address,
          source: "airport-local",
          routeWarnings: routeCheck.hasWarnings ? routeCheck.warnings : null,
        };
      });
      return res.json({ predictions: results, avoidRoutes });
    }

    // If not found locally → fallback to Google
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      queryRaw
    )}&components=country:gb&key=${process.env.GOOGLE_API_KEY}`;
    const autocompleteResponse = await fetch(autocompleteUrl);
    const autocompleteData = await autocompleteResponse.json();

    const predictions = autocompleteData?.predictions?.slice(0, 5) || [];

    const detailedResults = await Promise.all(
      predictions.map(async (prediction) => {
        const placeId = prediction.place_id;
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address&key=${process.env.GOOGLE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        const fullAddress = detailsData.result?.formatted_address || prediction.description;
        const routeCheck = checkLocationForAvoidedRoutes(fullAddress, avoidRoutes);

        return {
          name:
            detailsData.result?.name ||
            prediction.structured_formatting?.main_text,
          formatted_address: fullAddress,
          source: prediction.types?.includes("airport")
            ? "airport-google"
            : "location",
          routeWarnings: routeCheck.hasWarnings ? routeCheck.warnings : null,
        };
      })
    );

    return res.json({ predictions: detailedResults, avoidRoutes });
  } catch (error) {
    console.error("Autocomplete API error:", error);
    res.status(500).json({ error: "Failed to fetch autocomplete data." });
  }
});

// Distance API with avoid routes integration
router.get("/distance", async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ error: "Origin and destination are required" });
    }

    // Get avoid routes settings
    const avoidRoutes = await getAvoidRoutesSettings(req);
    
    // Build avoid parameter for Google API
    const avoidParams = [];
    if (avoidRoutes.highways) avoidParams.push('highways');
    if (avoidRoutes.tolls) avoidParams.push('tolls');
    if (avoidRoutes.ferries) avoidParams.push('ferries');
    
    const avoidQuery = avoidParams.length > 0 ? `&avoid=${avoidParams.join('|')}` : '';

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}${avoidQuery}&key=${
      process.env.GOOGLE_API_KEY
    }`;
    
    const response = await fetch(url);
    const data = await response.json();

    const element = data?.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      return res
        .status(400)
        .json({ error: "Invalid distance matrix response" });
    }

    const distanceText = element.distance?.text || null;
    const distanceValue = element.distance?.value || null;
    const durationText = element.duration?.text || null;

    // Check both origin and destination for route warnings
    const originCheck = checkLocationForAvoidedRoutes(origin, avoidRoutes);
    const destinationCheck = checkLocationForAvoidedRoutes(destination, avoidRoutes);

    res.json({ 
      distanceText, 
      distanceValue, 
      durationText,
      avoidRoutes,
      routeWarnings: {
        origin: originCheck.hasWarnings ? originCheck.warnings : null,
        destination: destinationCheck.hasWarnings ? destinationCheck.warnings : null,
      }
    });
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

// POSTCODE SUGGESTION API with route checking
router.get("/postcode-suggestions", async (req, res) => {
  try {
    const query = req.query.input || "";
    if (!query) {
      return res.json({ postcodes: [] });
    }

    // Get avoid routes settings
    const avoidRoutes = await getAvoidRoutesSettings(req);

    const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&components=country:gb&types=postal_code&key=${
      process.env.GOOGLE_API_KEY
    }`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    // Extract only valid UK postcode format and check for route warnings
    const postcodes =
      data?.predictions
        ?.map((pred) => {
          const match = pred.description.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/);
          if (!match) return null;
          
          const routeCheck = checkLocationForAvoidedRoutes(pred.description, avoidRoutes);
          
          return {
            postcode: match[0],
            description: pred.description,
            routeWarnings: routeCheck.hasWarnings ? routeCheck.warnings : null,
          };
        })
        .filter(Boolean) || [];

    res.json({ postcodes, avoidRoutes });
  } catch (error) {
    console.error("Postcode Suggestions API error:", error);
    res.status(500).json({ error: "Failed to fetch postcode suggestions" });
  }
});

// GEOCODE API - Convert address to lat/lng with route checking
router.get("/geocode", async (req, res) => {
  try {
    const address = req.query.address;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Get avoid routes settings
    const avoidRoutes = await getAvoidRoutesSettings(req);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return res.status(400).json({ error: "Failed to geocode address" });
    }

    const location = data.results[0].geometry.location; // { lat, lng }
    const formattedAddress = data.results[0].formatted_address;
    
    // Check for route warnings
    const routeCheck = checkLocationForAvoidedRoutes(formattedAddress, avoidRoutes);

    res.json({ 
      location, 
      formatted_address: formattedAddress,
      avoidRoutes,
      routeWarnings: routeCheck.hasWarnings ? routeCheck.warnings : null,
    });
  } catch (error) {
    console.error("Geocode API error:", error);
    res.status(500).json({ error: "Failed to geocode address" });
  }
});

router.get("/auth/google", (req, res) => {
  try {
    const { state } = req.query;
    if (!state) return res.status(400).send("Missing state param");

    const decodedState = Buffer.from(state, "base64").toString();
    const { redirectUri, transactionId } = JSON.parse(decodedState);

    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    res.redirect(url);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).send("Failed to initiate Google OAuth.");
  }
});

router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!state) {
      return res.status(400).send("❌ Missing state parameter.");
    }

    const decodedState = Buffer.from(state, "base64").toString();
    const { redirectUri, transactionId, email } = JSON.parse(decodedState);

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const userEmail = userInfo?.email || email;

    let user = await User.findOne({
      googleAuthTransactionId: transactionId,
      email: userEmail,
    });

    if (!user) {
      user = await User.findOne({ email: userEmail });

      if (!user) {
        console.error("❌ User not found for email:", userEmail);
        return res
          .status(404)
          .send("User not found. Please ensure your account has been created.");
      }

      if (user.googleAuthTransactionId !== transactionId) {
        console.error("❌ Invalid transaction ID for user:", userEmail);
        return res
          .status(400)
          .send("Invalid or expired authentication request.");
      }
    }

    user.googleCalendar = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      calendarId: "primary",
    };
    user.googleAuthTransactionId = null;
    await user.save();

    return res.redirect(
      `${redirectUri}/dashboard/admin-list/create-admin-user?googleConnected=true&email=${userEmail}&access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`
    );
  } catch (error) {
    console.error("❌ Google callback error:", error.message);
    res.status(500).send("❌ Failed to connect Google Calendar.");
  }
});

router.post("/send-google-auth-link", async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Missing email or role" });
  }
  const transactionId = uuidv4();
  const redirectUri = process.env.BASE_URL_FRONTEND;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(404).json({
      message: "User not found. Please ensure the user has been created first.",
    });
  }

  existingUser.googleAuthTransactionId = transactionId;
  await existingUser.save();

  if (!redirectUri) {
    return res.status(500).json({ message: "Missing frontend redirect URI" });
  }

  try {
    const statePayload = Buffer.from(
      JSON.stringify({ redirectUri, transactionId, email })
    ).toString("base64");
    const authUrl = `${
      process.env.BASE_URL
    }/api/google/auth/google?state=${encodeURIComponent(statePayload)}`;

    const emailContent = {
      title: "Connect to Google Calendar",
      subtitle: "Please click the link below to connect your Google Calendar.",
      data: {
        email,
        role,
        authUrl,
      },
    };

    await sendEmail(email, "Google Calendar Connection", emailContent);

    res.status(200).json({ message: "Google auth link sent successfully." });
  } catch (error) {
    console.error("Error sending Google auth link:", error);
    res.status(500).json({ message: "Failed to send the Google auth link." });
  }
});

export default router;