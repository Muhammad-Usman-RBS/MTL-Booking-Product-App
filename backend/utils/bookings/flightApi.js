import fetch from "node-fetch";

export async function getFlightDetails(flightNumber, flightDate) {
  if (!flightNumber) return null;

  try {
    const apiKey = process.env.FLIGHTAWARE_API_KEY;
    const baseUrl = process.env.FLIGHTAWARE_BASE_URL;

    // format date YYYY-MM-DD
    const dateStr = flightDate
      ? new Date(flightDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const url = `${baseUrl}/${flightNumber}?date=${dateStr}`;

    const response = await fetch(url, {
      headers: { "x-apikey": apiKey },
    });

    if (!response.ok) {
      console.error("❌ Flight API Error:", response.statusText);
      return null;
    }

    const data = await response.json();
    const flight = data?.flights?.[0];
    if (!flight) return null;

    return {
      origin: flight.origin?.airport_code || null,
      destination: flight.destination?.airport_code || null,
      arrival: {
        scheduled: flight.arrival_time?.scheduled
          ? new Date(flight.arrival_time.scheduled)
          : null,
        estimated: flight.arrival_time?.estimated
          ? new Date(flight.arrival_time.estimated)
          : null,
        actual: flight.arrival_time?.actual
          ? new Date(flight.arrival_time.actual)
          : null,
      },
    };
  } catch (err) {
    console.error("❌ Flight API fetch failed:", err.message);
    return null;
  }
}