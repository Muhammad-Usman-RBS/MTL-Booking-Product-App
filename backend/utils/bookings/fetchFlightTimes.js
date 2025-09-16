import axios from "axios";

// Airline name -> ICAO codes mapping
const airlineMap = {
  "british airways": "BAW",
  "emirates": "UAE",
  "qatar airways": "QTR",
  "american airlines": "AAL",
  "lufthansa": "DLH",
  "air france": "AFR",
  "etihad airways": "ETD",
  "turkish airlines": "THY",
  "singapore airlines": "SIA",
  "virgin atlantic": "VIR",
  // Add more as needed
};

async function fetchFlightTimes(query) {
  try {
    let url = "";
    let userInput = query.trim();

    // Check if user typed a flight number (starts with letters + digits, e.g. BA6)
    if (/^[A-Za-z]{2,3}\d+$/i.test(userInput)) {
      url = `${process.env.FLIGHTAWARE_BASE_URL}/${userInput}`;
    } else {
      // If it's airline name, map it to ICAO code
      const code = airlineMap[userInput.toLowerCase()];
      if (!code) {
        console.warn("⚠️ Airline not in mapping table:", userInput);
        return null;
      }
      // Use flight search endpoint with airline code
      url = `${process.env.FLIGHTAWARE_BASE_URL}/search?query=-airline ${code}`;
    }

    console.log("🔍 Fetching from URL:", url);

    const response = await axios.get(url, {
      headers: {
        "Accept": "application/json",
        "x-apikey": process.env.FLIGHTAWARE_API_KEY,
      },
    });

    const flightData = response.data.flights?.[0];
    if (!flightData) {
      console.warn("⚠️ No flight data found for:", query);
      return null;
    }

    const parsedData = {
      airline: flightData?.airline_name || "N/A",
      flightNumber: flightData?.ident || query,
      scheduled: flightData?.scheduled_in ? new Date(flightData.scheduled_in) : null,
      estimated: flightData?.estimated_in ? new Date(flightData.estimated_in) : null,
      actual: flightData?.actual_in ? new Date(flightData.actual_in) : null,
      origin: flightData?.origin?.code_iata || null,
      destination: flightData?.destination?.code_iata || null,
    };

    console.log("📦 Parsed Flight Data:", parsedData);
    return parsedData;
  } catch (err) {
    console.error("❌ Error fetching flight data:", err.response?.data || err.message);
    return null;
  }
}

export default fetchFlightTimes;
