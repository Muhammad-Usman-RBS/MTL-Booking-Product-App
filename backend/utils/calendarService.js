import axios from "axios";
import { google } from "googleapis";
import Booking from "../models/Booking.js";

const getValidAccessToken = async (clientAdmin, oAuth2Client) => {
  const { access_token, refresh_token } = clientAdmin.googleCalendar;

  oAuth2Client.setCredentials({
    access_token,
    refresh_token,
  });

  try {
    // Test if token is valid
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    await oauth2.userinfo.get();
    return access_token;
  } catch (error) {
    // Token expired, refresh it
    console.log("🔄 Refreshing expired access token...");

    try {
      const { credentials } = await oAuth2Client.refreshAccessToken();

      // Update clientAdmin's tokens in database
      clientAdmin.googleCalendar.access_token = credentials.access_token;
      if (credentials.refresh_token) {
        clientAdmin.googleCalendar.refresh_token = credentials.refresh_token;
      }
      await clientAdmin.save();

      console.log("✅ Access token refreshed successfully");
      return credentials.access_token;
    } catch (refreshError) {
      console.error("❌ Token refresh failed:", refreshError);
      throw new Error(
        "Failed to refresh Google Calendar token. User may need to reconnect."
      );
    }
  }
};
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
export const createEventOnGoogleCalendar = async ({ booking, clientAdmin }) => {
  const {
    access_token,
    refresh_token,
    calendarId = "primary",
  } = clientAdmin.googleCalendar || {};

  if (!access_token || !refresh_token) {
    throw new Error("Google Calendar is not connected for this client.");
  }

  

  const validAccessToken = await getValidAccessToken(clientAdmin, oAuth2Client);
  oAuth2Client.setCredentials({
    access_token: validAccessToken,
    refresh_token,
  });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  // ✅ Choose the correct journey based on returnJourneyToggle
  const journey = booking.returnJourneyToggle
    ? booking.returnJourney
    : booking.primaryJourney;

  if (!journey?.date) {
    throw new Error("Journey date is missing.");
  }

  const bookingDate = new Date(journey.date);
  const year = bookingDate.getUTCFullYear();
  const month = String(bookingDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(bookingDate.getUTCDate()).padStart(2, "0");
  const hour = String(journey.hour || 0).padStart(2, "0");
  const minute = String(journey.minute || 0).padStart(2, "0");

  const pickupLocation = journey.pickup;

  try {
    // ✅ Geocode pickup location to get timezone
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      pickupLocation
    )}&key=${process.env.GOOGLE_API_KEY}`;
    const geocodeResponse = await axios.get(geocodeUrl);

    if (geocodeResponse?.data?.results?.length > 0) {
      const location = geocodeResponse.data.results[0].geometry.location;
      const lat = location.lat;
      const lng = location.lng;

      const timeZoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(
        bookingDate.getTime() / 1000
      )}&key=${process.env.GOOGLE_API_KEY}`;
      const timeZoneResponse = await axios.get(timeZoneUrl);
      const timeZone = timeZoneResponse.data?.timeZoneId || "Europe/London";

      const startDateTime = `${year}-${month}-${day}T${hour}:${minute}:00`;
      const startDate = new Date(`${startDateTime}Z`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endDateTime = endDate.toISOString().slice(0, 19);

      const event = {
        summary: `Booking #${booking.bookingId} TimeZone: ${timeZone}`,
        description: `Passenger: ${booking.passenger.name}\nPickup: ${pickupLocation}\nDropoff: ${journey.dropoff}\nTimeZone: ${timeZone}`,
        location: pickupLocation,
        start: {
          dateTime: startDateTime,
          timeZone: timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timeZone,
        },
      };

      const response = await calendar.events.insert({
        calendarId,
        resource: event,
      });

      await Booking.findByIdAndUpdate(booking._id, {
        googleCalendarEventId: response.data.id,
      });

      console.log(`✅ Event created on calendar for ${clientAdmin.email}`);
      return response.data.id;
    } else {
      throw new Error("Location not found.");
    }
  } catch (error) {
    console.error("❌ Error creating event:", error);
    throw new Error("Failed to create event on Google Calendar.");
  }
};

// calendarService.js
export const updateEventOnGoogleCalendar = async ({ booking, clientAdmin }) => {
  const {
    access_token,
    refresh_token,
    calendarId = "primary",
  } = clientAdmin.googleCalendar || {};

  if (!access_token || !refresh_token) {
    throw new Error("Google Calendar is not connected for this client.");
  }


  const validAccessToken = await getValidAccessToken(clientAdmin, oAuth2Client);
  oAuth2Client.setCredentials({
    access_token: validAccessToken,
    refresh_token,
  });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  // ✅ Use returnJourney if toggle is true, else primaryJourney
  const journey = booking.returnJourneyToggle
    ? booking.returnJourney
    : booking.primaryJourney;

  if (!journey?.date) {
    throw new Error("Journey date is missing.");
  }

  const bookingDate = new Date(journey.date);
  const year = bookingDate.getUTCFullYear();
  const month = String(bookingDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(bookingDate.getUTCDate()).padStart(2, "0");
  const hour = String(journey.hour || 0).padStart(2, "0");
  const minute = String(journey.minute || 0).padStart(2, "0");

  const pickupLocation = journey.pickup;

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    pickupLocation
  )}&key=${process.env.GOOGLE_API_KEY}`;
  const geocodeResponse = await axios.get(geocodeUrl);

  if (!geocodeResponse?.data?.results?.length) {
    throw new Error("Location not found for Google Calendar event update.");
  }

  const location = geocodeResponse.data.results[0].geometry.location;
  const lat = location.lat;
  const lng = location.lng;

  const timeZoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(
    bookingDate.getTime() / 1000
  )}&key=${process.env.GOOGLE_API_KEY}`;
  const timeZoneResponse = await axios.get(timeZoneUrl);
  const timeZone = timeZoneResponse.data?.timeZoneId || "Europe/London";

  const startDateTime = `${year}-${month}-${day}T${hour}:${minute}:00`;
  const startDate = new Date(`${startDateTime}Z`);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const endDateTime = endDate.toISOString().slice(0, 19);

  const event = {
    summary: `Booking #${booking.bookingId} TimeZone: ${timeZone}`,
    description: `Passenger: ${booking.passenger.name}\nPickup: ${pickupLocation}\nDropoff: ${journey.dropoff}\nTimeZone: ${timeZone}`,
    location: pickupLocation,
    start: {
      dateTime: startDateTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timeZone,
    },
  };

  if (!booking.googleCalendarEventId) {
    throw new Error("No Google Calendar event ID found for this booking.");
  }

  const response = await calendar.events.update({
    calendarId,
    eventId: booking.googleCalendarEventId,
    resource: event,
  });

  console.log(
    `🔄 Google Calendar event updated for booking ${booking.bookingId}`
  );
  return response.data.id;
};

export const deleteEventFromGoogleCalendar = async ({ eventId, clientAdmin }) => {
  const {
    access_token,
    refresh_token,
    calendarId = "primary",
  } = clientAdmin.googleCalendar || {};

  if (!access_token || !refresh_token) {
    throw new Error("Google Calendar is not connected for this client.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const validAccessToken = await getValidAccessToken(clientAdmin, oAuth2Client);
  oAuth2Client.setCredentials({
    access_token: validAccessToken,
    refresh_token,
  });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  try {
    await calendar.events.delete({
      calendarId,
      eventId: eventId,
    });

    console.log(`✅ Event deleted from calendar for ${clientAdmin.email}`);
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    throw new Error("Failed to delete event from Google Calendar.");
  }
};
