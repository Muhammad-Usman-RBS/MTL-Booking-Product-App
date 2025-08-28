// utils/sendBookingConfirmation.js
import sendEmail from "./sendEmail.js";
import { customerBookingConfirmationTemplate as bookingConfirmationHtml } from "./customerBookingConfirmation.js";
import User from "../models/User.js";

export async function sendBookingConfirmation(booking, { isUpdate = false } = {}) {
  if (!booking?.passenger?.email) return;

  // pull company brand name from clientadmin (optional)
  let companyName = "Your Company";
  try {
    const clientAdmin = await User.findOne({ companyId: booking.companyId, role: "clientadmin" })
      .lean()
      .select("companyName");
    if (clientAdmin?.companyName) companyName = clientAdmin.companyName;
  } catch {}

  const html = bookingConfirmationHtml({ companyName, booking, isUpdate });

  await sendEmail(
    booking.passenger.email.trim(),
    isUpdate ? `Booking #${booking.bookingId} Updated` : `Booking #${booking.bookingId} Confirmed`,
    // reusing your sendEmail({ title, subtitle, data }) signature, but we'll pass raw html instead
    { title: null, subtitle: null, data: { __rawHtml: html } }
  );
}
