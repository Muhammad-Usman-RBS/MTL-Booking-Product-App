import fetch from "node-fetch";

export async function getFlightDetails(flightNumber, flightDate) {
  if (!flightNumber) return null;

  try {
    const apiKey = process.env.FLIGHTAWARE_API_KEY;
    const baseUrl = process.env.FLIGHTAWARE_BASE_URL;

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
    console.log("✈️ Flight API RAW Response:", JSON.stringify(data, null, 2));

    const flight = data?.flights?.[0];
    if (!flight) return null;

    // 🔑 Match FlightAware fields
    return {
      origin: flight.origin?.code || null,
      destination: flight.destination?.code || null,
      arrival: {
        scheduled: flight.arrival_times?.scheduled
          ? new Date(flight.arrival_times.scheduled)
          : null,
        estimated: flight.arrival_times?.estimated
          ? new Date(flight.arrival_times.estimated)
          : null,
        actual: flight.arrival_times?.actual
          ? new Date(flight.arrival_times.actual)
          : null,
      },
    };
  } catch (err) {
    console.error("❌ Flight API fetch failed:", err.message);
    return null;
  }
}
