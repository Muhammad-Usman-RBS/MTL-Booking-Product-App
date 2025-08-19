import Booking from "../models/Booking.js";
import sendEmail from "../utils/sendEmail.js";
import driverModel from "../models/Driver.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";
import Voucher from "../models/pricings/Voucher.js";
import { createEventOnGoogleCalendar, deleteEventFromGoogleCalendar } from "../utils/calendarService.js";
import ReviewSetting from "../models/settings/ReviewSetting.js";
import { compileReviewTemplate } from "../utils/reviewPlaceholders.js";
import sendReviewEmail from "../utils/sendReviewEmail.js";

// Craete Booking (Dashboard/Widget)
export const createBooking = async (req, res) => {
  try {
    const {
      mode = "Transfer",
      returnJourneyToggle,
      companyId,
      referrer,
      vehicle = {},
      passenger = {},
      primaryJourney = {},
      returnJourney = {},
      PassengerEmail,
      ClientAdminEmail,
      voucher,
      voucherApplied,

      // New fields
      paymentMethod = "Cash",
      cardPaymentReference = null,
      paymentGateway = null,
      journeyFare = 0,
      driverFare = 0,
      returnJourneyFare = 0,
      returnDriverFare = 0,
      emailNotifications = {},
      appNotifications = {},
    } = req.body;

    if (
      !companyId ||
      typeof companyId !== "string" ||
      companyId.length !== 24
    ) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    // Voucher logic
    let validVoucher = null;
    let isVoucherApplied = false;

    if (voucher && voucherApplied) {
      const v = await Voucher.findOne({
        voucher: voucher.toUpperCase(),
        companyId: new mongoose.Types.ObjectId(companyId),
      });

      const today = new Date();
      if (
        v &&
        new Date(v.validity) >= today &&
        v.used < v.quantity &&
        v.status === "Active"
      ) {
        validVoucher = v.voucher;
        isVoucherApplied = true;
        await Voucher.findByIdAndUpdate(v._id, { $inc: { used: 1 } });
      }
    }

    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];

    if (!returnJourneyToggle) {
      for (const field of requiredFields) {
        if (!primaryJourney[field]) {
          return res
            .status(400)
            .json({ message: `Missing field in primaryJourney: ${field}` });
        }
      }
    } else {
      for (const field of requiredFields) {
        if (!returnJourney[field]) {
          return res
            .status(400)
            .json({ message: `Missing field in returnJourney: ${field}` });
        }
      }
    }

    const extractDynamicDropoffFields = (journey) => {
      const fields = {};
      Object.keys(journey || {}).forEach((key) => {
        if (
          key.startsWith("dropoff_terminal_") ||
          key.startsWith("dropoffDoorNumber")
        ) {
          fields[key] = journey[key] ?? "";
        }
      });
      return fields;
    };

    const generateNextBookingId = async () => {
      const lastBooking = await Booking.findOne()
        .sort({ bookingId: -1 })
        .limit(1);
      return lastBooking?.bookingId
        ? (parseInt(lastBooking.bookingId, 10) + 1).toString()
        : "50301";
    };

    const bookingId = await generateNextBookingId();
    const source =
      req.body.source ||
      (referrer?.toLowerCase()?.includes("widget") ? "widget" : "admin");

    const baseVehicleInfo = {
      vehicleName: vehicle.vehicleName ?? null,
      passenger: parseInt(vehicle.passenger) || 0,
      childSeat: parseInt(vehicle.childSeat) || 0,
      handLuggage: parseInt(vehicle.handLuggage) || 0,
      checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
    };

    const basePassengerInfo = {
      name: passenger.name ?? null,
      email: passenger.email ?? null,
      phone: passenger.phone ?? null,
    };

    const returnIsValid =
      returnJourneyToggle &&
      returnJourney &&
      requiredFields.every((f) => returnJourney[f]);

    // Build base booking payload
    const bookingPayload = {
      bookingId,
      mode,
      companyId,
      returnJourneyToggle: !!returnJourneyToggle,
      referrer: referrer || "Manual Entry",
      source,
      status: "New",
      vehicle: baseVehicleInfo,
      passenger: basePassengerInfo,

      // New fields
      paymentMethod,
      cardPaymentReference,
      paymentGateway,
      journeyFare: Number(journeyFare) || 0,
      driverFare: Number(driverFare) || 0,
      returnJourneyFare: Number(returnJourneyFare) || 0,
      returnDriverFare: Number(returnDriverFare) || 0,
      emailNotifications: {
        admin: !!emailNotifications.admin,
        customer: !!emailNotifications.customer,
      },
      appNotifications: {
        customer: !!appNotifications.customer,
      },
    };

    // Add primaryJourney
    if (!returnJourneyToggle) {
      bookingPayload.primaryJourney = {
        pickup: primaryJourney.pickup?.trim() ?? "",
        dropoff: primaryJourney.dropoff?.trim() ?? "",
        additionalDropoff1: primaryJourney.additionalDropoff1 ?? null,
        additionalDropoff2: primaryJourney.additionalDropoff2 ?? null,
        pickupDoorNumber: primaryJourney.pickupDoorNumber ?? "",
        terminal: primaryJourney.terminal ?? "",
        arrivefrom: primaryJourney.arrivefrom ?? "",
        flightNumber: primaryJourney.flightNumber ?? "",
        pickmeAfter: primaryJourney.pickmeAfter ?? "",
        notes: primaryJourney.notes ?? "",
        internalNotes: primaryJourney.internalNotes ?? "",
        date: primaryJourney.date ?? "",
        hour:
          primaryJourney.hour !== undefined
            ? parseInt(primaryJourney.hour)
            : null,
        minute:
          primaryJourney.minute !== undefined
            ? parseInt(primaryJourney.minute)
            : null,
        fare: primaryJourney.fare ?? 0,
        hourlyOption: primaryJourney.hourlyOption ?? null,
        distanceText: primaryJourney.distanceText ?? "",
        durationText: primaryJourney.durationText ?? "",
        voucher: validVoucher,
        voucherApplied: isVoucherApplied,
        ...extractDynamicDropoffFields(primaryJourney),
      };
    }

    // Add returnJourney if valid
    if (returnIsValid) {
      bookingPayload.returnJourney = {
        pickup: returnJourney.pickup?.trim() ?? "",
        dropoff: returnJourney.dropoff?.trim() ?? "",
        additionalDropoff1: returnJourney.additionalDropoff1 ?? null,
        additionalDropoff2: returnJourney.additionalDropoff2 ?? null,
        pickupDoorNumber: returnJourney.pickupDoorNumber ?? "",
        terminal: returnJourney.terminal ?? "",
        arrivefrom: returnJourney.arrivefrom ?? "",
        flightNumber: returnJourney.flightNumber ?? "",
        pickmeAfter: returnJourney.pickmeAfter ?? "",
        notes: returnJourney.notes ?? "",
        internalNotes: returnJourney.internalNotes ?? "",
        date: returnJourney.date ?? "",
        hour:
          returnJourney.hour !== undefined
            ? parseInt(returnJourney.hour)
            : null,
        minute:
          returnJourney.minute !== undefined
            ? parseInt(returnJourney.minute)
            : null,
        fare: returnJourney.fare ?? 0,
        hourlyOption: returnJourney.hourlyOption ?? null,
        distanceText: returnJourney.distanceText ?? "",
        durationText: returnJourney.durationText ?? "",
        ...extractDynamicDropoffFields(returnJourney),
      };
    }

    // Save booking
    const savedBooking = await Booking.create(bookingPayload);

    const clientAdmin = await User.findOne({
      companyId,
      role: "clientadmin",
    }).lean();

    try {
      if (
        clientAdmin?.googleCalendar?.access_token &&
        savedBooking?.primaryJourney?.date
      ) {
        await createEventOnGoogleCalendar({
          booking: savedBooking,
          clientAdmin,
        });
      }
    } catch (calendarError) {
      console.error(
        "⚠️ Calendar event creation failed:",
        calendarError.message
      );
    }

    const sanitize = (booking) => {
      const { _id, __v, createdAt, updatedAt, companyId, ...clean } =
        booking.toObject();
      return clean;
    };

    const emailData = {
      title: "Booking Confirmation",
      data: { Booking: sanitize(savedBooking) },
    };

    if (PassengerEmail) {
      await sendEmail(PassengerEmail, "Your Booking Confirmation", emailData);
    }
    if (ClientAdminEmail) {
      await sendEmail(ClientAdminEmail, "New Booking Received", emailData);
    }

    return res.status(201).json({
      success: true,
      message: returnIsValid
        ? "Primary and return journeys booked together."
        : "Primary journey booked.",
      bookings: [sanitize(savedBooking)],
    });
  } catch (error) {
    console.error("❌ createBooking error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Bookings for a Company
export const getAllBookings = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    const bookings = await Booking.find({ companyId });

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update Booking by ID
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingData = {}, PassengerEmail, ClientAdminEmail } = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const {
      mode = "Transfer",
      returnJourneyToggle,
      companyId,
      referrer = "Manual Entry",
      vehicle = {},
      passenger = {},
      primaryJourney = {},
      returnJourney = {},
      paymentMethod,
      cardPaymentReference = null,
      paymentGateway = null,
      journeyFare = 0,
      driverFare = 0,
      returnJourneyFare = 0,
      returnDriverFare = 0,
      emailNotifications = {},
      appNotifications = {},
      voucher,
      voucherApplied,
    } = bookingData;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    const extractDynamicDropoffFields = (journey = {}) => {
      const fields = {};
      Object.keys(journey).forEach((key) => {
        if (
          key.startsWith("dropoff_terminal_") ||
          key.startsWith("dropoffDoorNumber")
        ) {
          fields[key] = journey[key] ?? "";
        }
      });
      return fields;
    };

    const updatedPayload = {
      mode,
      returnJourneyToggle: !!returnJourneyToggle,
      companyId,
      referrer,
      vehicle: {
        vehicleName: vehicle.vehicleName ?? null,
        passenger: parseInt(vehicle.passenger) || 0,
        childSeat: parseInt(vehicle.childSeat) || 0,
        handLuggage: parseInt(vehicle.handLuggage) || 0,
        checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
      },
      passenger: {
        name: passenger.name ?? null,
        email: passenger.email ?? null,
        phone: passenger.phone ?? null,
      },
      paymentMethod,
      cardPaymentReference,
      paymentGateway,
      journeyFare: Number(journeyFare),
      driverFare: Number(driverFare),
      returnJourneyFare: Number(returnJourneyFare),
      returnDriverFare: Number(returnDriverFare),
      emailNotifications: {
        admin: !!emailNotifications.admin,
        customer: !!emailNotifications.customer,
      },
      appNotifications: {
        customer: !!appNotifications.customer,
      },
    };

    // ✅ Add returnJourney if returnJourneyToggle is true
    if (returnJourneyToggle) {
      updatedPayload.returnJourney = {
        pickup: returnJourney.pickup?.trim() ?? "",
        dropoff: returnJourney.dropoff?.trim() ?? "",
        additionalDropoff1: returnJourney.additionalDropoff1 ?? null,
        additionalDropoff2: returnJourney.additionalDropoff2 ?? null,
        pickupDoorNumber: returnJourney.pickupDoorNumber ?? "",
        terminal: returnJourney.terminal ?? "",
        arrivefrom: returnJourney.arrivefrom ?? "",
        flightNumber: returnJourney.flightNumber ?? "",
        pickmeAfter: returnJourney.pickmeAfter ?? "",
        notes: returnJourney.notes ?? "",
        internalNotes: returnJourney.internalNotes ?? "",
        date: returnJourney.date ?? "",
        hour:
          returnJourney.hour !== undefined
            ? parseInt(returnJourney.hour)
            : null,
        minute:
          returnJourney.minute !== undefined
            ? parseInt(returnJourney.minute)
            : null,
        fare: returnJourney.fare ?? 0,
        hourlyOption: returnJourney.hourlyOption ?? null,
        distanceText: returnJourney.distanceText ?? "",
        durationText: returnJourney.durationText ?? "",
        voucher,
        voucherApplied,
        ...extractDynamicDropoffFields(returnJourney),
      };
    }

    // ✅ Only add primaryJourney if not editing return only
    if (
      !returnJourneyToggle ||
      (primaryJourney?.pickup && primaryJourney?.dropoff)
    ) {
      updatedPayload.primaryJourney = {
        pickup: primaryJourney.pickup?.trim() ?? "",
        dropoff: primaryJourney.dropoff?.trim() ?? "",
        additionalDropoff1: primaryJourney.additionalDropoff1 ?? null,
        additionalDropoff2: primaryJourney.additionalDropoff2 ?? null,
        pickupDoorNumber: primaryJourney.pickupDoorNumber ?? "",
        terminal: primaryJourney.terminal ?? "",
        arrivefrom: primaryJourney.arrivefrom ?? "",
        flightNumber: primaryJourney.flightNumber ?? "",
        pickmeAfter: primaryJourney.pickmeAfter ?? "",
        notes: primaryJourney.notes ?? "",
        internalNotes: primaryJourney.internalNotes ?? "",
        date: primaryJourney.date ?? "",
        hour:
          primaryJourney.hour !== undefined
            ? parseInt(primaryJourney.hour)
            : null,
        minute:
          primaryJourney.minute !== undefined
            ? parseInt(primaryJourney.minute)
            : null,
        fare: primaryJourney.fare ?? 0,
        hourlyOption: primaryJourney.hourlyOption ?? null,
        distanceText: primaryJourney.distanceText ?? "",
        durationText: primaryJourney.durationText ?? "",
        voucher,
        voucherApplied,
        ...extractDynamicDropoffFields(primaryJourney),
      };
    }

    if (bookingData.drivers) {
      updatedPayload.drivers = bookingData.drivers;
    }

    // 🔄 Save to DB
    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedPayload, {
      new: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const sanitize = (booking) => {
      const { _id, __v, createdAt, updatedAt, companyId, ...clean } =
        booking.toObject();
      return clean;
    };

    const emailData = {
      title: "Booking Updated",
      data: { Booking: sanitize(updatedBooking) },
    };

    if (PassengerEmail) {
      await sendEmail(PassengerEmail, "Your Booking Was Updated", emailData);
    }

    if (ClientAdminEmail) {
      await sendEmail(ClientAdminEmail, "Booking Updated", emailData);
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: sanitize(updatedBooking),
    });
  } catch (error) {
    console.error("❌ Error in updateBooking:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.googleCalendarEventId) {
      try {
        const clientAdmin = await User.findOne({
          companyId: booking.companyId,
          role: "clientadmin",
        }).lean();

        if (clientAdmin?.googleCalendar?.access_token) {
          await deleteEventFromGoogleCalendar({
            eventId: booking.googleCalendarEventId,
            clientAdmin: clientAdmin,
          });
        }
      } catch (calendarError) {
        console.error("Error deleting from Google Calendar:", calendarError);
      }
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      booking,
    });
  } catch (error) {
    console.error("Error in deleteBooking:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy, driverIds } = req.body;
    const currentUser = req.user;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Fetch the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update the booking status
    booking.status = status === "Late Cancel" ? "Late Cancel" : status;

    // Optionally, update driver details if needed
    if (Array.isArray(driverIds)) {
      const fullDriverDocs = await driverModel
        .find({
          _id: { $in: driverIds },
        })
        .lean();
      booking.drivers = fullDriverDocs;
    }

    const fullName = currentUser.fullName || currentUser.name || "Unknown User";
    const updater = `${currentUser?.role} | ${fullName}`;

    booking.statusAudit = [
      ...(booking.statusAudit || []),
      {
        updatedBy: updater,
        status,
        date: new Date(),
      },
    ];
    // Save the updated booking
    const updatedBooking = await booking.save();

    /** AUTO-SEND REVIEW EMAIL when status becomes Completed **/
    try {
      const normalized = (status || "").trim().toLowerCase();
      const isCompleted = normalized === "completed";

      if (isCompleted && !booking.reviewEmailSent && booking?.passenger?.email) {
        const settings = await ReviewSetting.findOne({ companyId: booking.companyId }).lean();
        if (settings) {
          const subj = compileReviewTemplate(settings.subject, booking);

          let body = compileReviewTemplate(settings.template, booking);
          // If template contains !REVIEW_LINK!, replace; else append separate link if present
          if (body.includes("!REVIEW_LINK!")) {
            body = body.replace(/!REVIEW_LINK!/g, settings.reviewLink || "");
          } else if (settings.reviewLink && !body.includes(settings.reviewLink)) {
            body += `\n\n${settings.reviewLink}`;
          }

          await sendReviewEmail(booking.passenger.email, subj, {
            text: body,
            html: body.replace(/\n/g, "<br/>"),
          });

          // mark sent to prevent duplicates
          booking.reviewEmailSent = true;
          await booking.save();
        }
      }
    } catch (e) {
      console.error("Review email auto-send failed:", e.message);
    }

    // Driver updated the status
    if (currentUser?.role === "driver" && status) {
      const driver = await driverModel
        .findOne({
          "DriverData.employeeNumber": currentUser.employeeNumber,
          companyId: currentUser.companyId,
        })
        .lean();

      if (driver) {
        const clientAdmin = await User.findOne({
          companyId: currentUser.companyId,
          role: "clientadmin",
        }).lean();

        const statusStyled = `<span style="color: green;">${status}</span>`;
        const driverName = `"${driver?.DriverData?.firstName || ""} ${driver?.DriverData?.surName || ""
          }"`.trim();
        const bookingId = booking.bookingId;

        const title = `Driver ${driverName} changed the status to ${statusStyled} for booking #${bookingId}`;
        const subtitle = `Booking status changed by driver ${driverName} to ${statusStyled}`;
        const data = {
          BookingId: bookingId,
          Status: status,
          DriverName: driverName,
        };

        await sendEmailsAsync(
          clientAdmin?.email,
          booking?.passenger?.email,
          driver?.DriverData?.email,
          driverName,
          statusStyled,
          bookingId
        );
      }
    }

    // Client Admin updated the status
    if (currentUser?.role === "clientadmin" && status) {
      const bookingId = booking.bookingId;
      const statusStyled = `<span style="color: green;">${status}</span>`;

      const firstDriverId = booking.drivers?.[0]?._id || booking.drivers?.[0];
      const assignedDriver = mongoose.Types.ObjectId.isValid(firstDriverId)
        ? await driverModel.findById(firstDriverId).lean()
        : null;

      const driverName = assignedDriver
        ? `"${assignedDriver.DriverData.firstName || ""} ${assignedDriver.DriverData.surName || ""
          }"`.trim()
        : `"Assigned Driver"`;

      const driverEmail = assignedDriver?.DriverData?.email;

      const data = {
        BookingId: bookingId,
        Status: status,
        DriverName: driverName,
      };

      // Send email notifications for the passenger and driver
      if (booking?.passenger?.email) {
        await sendEmail(
          booking.passenger.email,
          "Ride Status Updated by Admin",
          {
            title: `Ride Status Updated for Booking #${bookingId}`,
            subtitle: `The status of your booking has been changed to ${statusStyled} by the admin.`,
            data,
          }
        );
      }

      if (driverEmail) {
        await sendEmail(driverEmail, "Ride Status Updated by Admin", {
          title: `Booking #${bookingId} Status Updated`,
          subtitle: `Admin changed your assigned ride status to ${statusStyled}.`,
          data,
        });
      }
    }

    res.status(200).json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error("Error updating status:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get All Passengers
export const getAllPassengers = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Missing companyId from authenticated user",
      });
    }

    const bookings = await Booking.find({ companyId }, "passenger");

    // Extract passengers from bookings
    let passengerMap = new Map();

    bookings.forEach((booking) => {
      const p = booking.passenger;
      if (p && (p.name || p.email || p.phone)) {
        const key = `${p.name}-${p.email}-${p.phone}`;
        if (!passengerMap.has(key)) {
          passengerMap.set(key, {
            name: p.name || "Unnamed",
            email: p.email || "",
            phone: p.phone || "",
            _id: p._id || key, // fallback _id
          });
        }
      }
    });

    const passengers = Array.from(passengerMap.values());
    res.status(200).json({ success: true, passengers });
  } catch (error) {
    console.error("getAllPassengers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch passengers",
      error: error.message,
    });
  }
};

// Send Booking Data
export const sendBookingEmail = async (req, res) => {
  const { bookingId, email } = req.body;

  if (!bookingId || !email) {
    return res
      .status(400)
      .json({ message: "Booking ID and email are required." });
  }

  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const addMilesToDistanceText = (journey) => {
      if (journey?.distanceText && journey.distanceText.includes("km")) {
        const km = parseFloat(journey.distanceText);
        if (!isNaN(km)) {
          const miles = km * 0.621371;
          journey.distanceText = `${km} km (${miles} miles)`;
        }
      }
    };

    addMilesToDistanceText(booking.primaryJourney);
    if (booking.returnJourneyToggle && booking.returnJourney) {
      addMilesToDistanceText(booking.returnJourney);
    }

    const plainBooking = JSON.parse(JSON.stringify(booking));
    const { _id, statusAudit, createdAt, updatedAt, __v, ...cleanedBooking } =
      JSON.parse(JSON.stringify(booking));
    await sendEmail(email, "Your Booking Confirmation", {
      title: "Booking Confirmation",
      subtitle: "Here are your booking details:",
      data: cleanedBooking,
    });

    res.status(200).json({ message: "Booking email sent successfully." });
  } catch (err) {
    console.error("Error sending booking email:", err);
    res.status(500).json({ message: "Failed to send booking email." });
  }
};
const sendEmailsAsync = async (
  clientAdminEmail,
  passengerEmail,
  driverEmail,
  driverName,
  status,
  bookingId
) => {
  const emailPromises = [];

  // Send email to client admin
  if (clientAdminEmail) {
    const clientAdminEmailPromise = sendEmail(
      clientAdminEmail,
      "Booking Status Updated",
      {
        title: `Driver ${driverName} changed the status to ${status} for booking #${bookingId}`,
        subtitle: `Booking status changed by driver ${driverName} to ${status}`,
        data: { BookingId: bookingId, Status: status, DriverName: driverName },
      }
    );
    emailPromises.push(clientAdminEmailPromise);
  }

  // Send email to passenger
  if (passengerEmail) {
    const passengerEmailPromise = sendEmail(
      passengerEmail,
      "Your Ride Status Has Been Updated",
      {
        title: `Your Ride Status Has Been Updated by Driver ${driverName}`,
        subtitle: `Booking status changed to ${status} by driver ${driverName}`,
        data: { BookingId: bookingId, Status: status, DriverName: driverName },
      }
    );
    emailPromises.push(passengerEmailPromise);
  }

  // Send email to the driver
  if (driverEmail) {
    const driverEmailPromise = sendEmail(
      driverEmail,
      "Ride Status Updated by Admin",
      {
        title: `Booking #${bookingId} Status Updated`,
        subtitle: `Admin changed your assigned ride status to ${status}.`,
        data: { BookingId: bookingId, Status: status, DriverName: driverName },
      }
    );
    emailPromises.push(driverEmailPromise);
  }

  // Wait for all email promises to finish in parallel
  await Promise.all(emailPromises);
};

// Restore & Delete
export const restoreOrDeleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, updatedBy } = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (action === "restore") {
      booking.status = "New"; // or your default active status
    } else if (action === "delete") {
      await Booking.findByIdAndDelete(id);
      return res.status(200).json({ message: "Booking permanently deleted" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Add audit
    booking.statusAudit = [
      ...(booking.statusAudit || []),
      {
        updatedBy: updatedBy || "Unknown",
        status: booking.status,
        date: new Date(),
      },
    ];

    await booking.save();

    res
      .status(200)
      .json({ message: `Booking ${action}d successfully`, booking });
  } catch (error) {
    console.error("❌ restoreOrDeleteBooking error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
