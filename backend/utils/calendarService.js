import { google } from 'googleapis';

export const createEventOnGoogleCalendar = async ({ booking, clientAdmin }) => {
  const { access_token, refresh_token, calendarId = "primary" } = clientAdmin.googleCalendar || {};

  if (!access_token || !refresh_token) {
    throw new Error("Google Calendar is not connected for this client.");
  }

  // ⬇ This will now use the updated redirect URI from your .env file
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({ access_token, refresh_token });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const start = new Date(booking.primaryJourney.date);
  start.setHours(booking.primaryJourney.hour || 0);
  start.setMinutes(booking.primaryJourney.minute || 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour slot

  const event = {
    summary: `Booking #${booking.bookingId}`,
    description: `Passenger: ${booking.passenger.name}\nPickup: ${booking.primaryJourney.pickup}\nDropoff: ${booking.primaryJourney.dropoff}`,
    location: booking.primaryJourney.pickup,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };

  await calendar.events.insert({
    calendarId,
    resource: event,
  });

  console.log(`✅ Event created on calendar for ${clientAdmin.email}`);
};
