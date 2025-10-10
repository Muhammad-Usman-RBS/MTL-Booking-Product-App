import axios from "axios";

const airlineMap = {
  "british airways": "BAW",
  emirates: "UAE",
  "qatar airways": "QTR",
  "american airlines": "AAL",
  lufthansa: "DLH",
  "air france": "AFR",
  "etihad airways": "ETD",
  "turkish airlines": "THY",
  "singapore airlines": "SIA",
  "virgin atlantic": "VIR",
  "klm royal dutch airlines": "KLM",
  "cathay pacific": "CPA",
  "japan airlines": "JAL",
  "ana all nippon airways": "ANA",
  "thai airways": "THA",
  "malaysia airlines": "MAS",
  "china eastern airlines": "CES",
  "china southern airlines": "CSN",
  "air china": "CCA",
  "korean air": "KAL",
  "asiana airlines": "AAR",
  aeroflot: "AFL",
  "air india": "AIC",
  indigo: "IGO",
  spicejet: "SEJ",
  easyjet: "EZY",
  ryanair: "RYR",
  "southwest airlines": "SWA",
  "delta air lines": "DAL",
  "united airlines": "UAL",
  "alaska airlines": "ASA",
  "aer lingus": "EIN",
  iberia: "IBE",
  "austrian airlines": "AUA",
  "swiss international air lines": "SWR",
  finnair: "FIN",
  "norwegian air shuttle": "NAX",
  "saudi arabian airlines": "SVA",
  egyptair: "MSR",
  "ethiopian airlines": "ETH",
  "kenya airways": "KQA",
  "south african airways": "SAA",
  "latam airlines": "LAN",
  avianca: "AVA",
  aeromexico: "AMX",
  westjet: "WJA",
  "air canada": "ACA",
  "philippine airlines": "PAL",
  "garuda indonesia": "GIA",
  "sri lankan airlines": "ALK",
  "oman air": "OMA",
  "kuwait airways": "KAC",
  "pakistan international airlines": "PIA",
  "bangkok airways": "BKP",
  "fiji airways": "FJI",
  "air new zealand": "ANZ",
};

function normalizeFlightNumber(input) {
  return input.replace(/\s+/g, "").toUpperCase();
}
async function fetchFlightTimes(query) {
  try {
    let url = "";
    let userInput = query.trim();
    const normalizedInput = normalizeFlightNumber(userInput);
    if (/^[A-Z]{2,3}\d+$/i.test(normalizedInput)) {
      url = `${process.env.FLIGHTAWARE_BASE_URL}/${normalizedInput}`;
    } else {
      const code = airlineMap[userInput.toLowerCase()];
      if (!code) {
        return null;
      }
      url = `${process.env.FLIGHTAWARE_BASE_URL}/search?query=-airline ${code}`;
    }
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "x-apikey": process.env.FLIGHTAWARE_API_KEY,
      },
    });
    const flightData = response.data.flights?.[0];
    if (!flightData) {
      return null;
    }
    const parsedData = {
      airline: flightData?.airline_name || "N/A",
      flightNumber: flightData?.ident || normalizedInput,
      scheduled: flightData?.scheduled_in
        ? new Date(flightData.scheduled_in)
        : null,
      estimated: flightData?.estimated_in
        ? new Date(flightData.estimated_in)
        : null,
      actual: flightData?.actual_in ? new Date(flightData.actual_in) : null,
      origin: flightData?.origin?.code_iata || null,
      destination: flightData?.destination?.code_iata || null,
    };
    return parsedData;
  } catch (err) {
    return null;
  }
}
export default fetchFlightTimes;