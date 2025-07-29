import axios from "axios";
import { google } from "googleapis";
import Booking from "../models/Booking.js";

export const createEventOnGoogleCalendar = async ({ booking, clientAdmin }) => {
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

  oAuth2Client.setCredentials({ access_token, refresh_token });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const bookingDate = new Date(booking.primaryJourney.date);
  const year = bookingDate.getUTCFullYear();
  const month = String(bookingDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(bookingDate.getUTCDate()).padStart(2, "0");
  const hour = String(booking.primaryJourney.hour || 0).padStart(2, "0");
  const minute = String(booking.primaryJourney.minute || 0).padStart(2, "0");

  const pickupLocation = booking?.primaryJourney?.pickup;

  try {
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
        description: `Passenger: ${booking.passenger.name}\nPickup: ${pickupLocation}\nDropoff: ${booking.primaryJourney.dropoff} \nTimeZone: ${timeZone}`,
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

export const deleteEventFromGoogleCalendar = async ({
  eventId,
  clientAdmin,
}) => {
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

  oAuth2Client.setCredentials({ access_token, refresh_token });

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
