import Booking from "../models/Booking.js";
import sendEmail from "../utils/sendEmail.js";
import driverModel from "../models/Driver.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Voucher from "../models/pricings/Voucher.js";
import {
  createEventOnGoogleCalendar,
  deleteEventFromGoogleCalendar,
} from "../utils/calendarService.js";
import ReviewSetting from "../models/settings/ReviewSetting.js";
import { compileReviewTemplate } from "../utils/bookings/reviewPlaceholders.js";
import sendReviewEmail from "../utils/bookings/sendReviewEmail.js";
import Notification from "../models/Notification.js";
import CronJob from "../models/settings/CronJob.js";
import { autoSendReviewEmail } from "../utils/bookings/autoSendReviewEmail.js";
import Company from "../models/Company.js";
import { driverStatusEmailTemplate } from "../utils/bookings/driverStatusEmailTemplate.js";
import { customerBookingConfirmation } from "../utils/bookings/customerBookingConfirmation.js";
import { clientadminBookingConfirmation } from "../utils/bookings/clientadminBookingConfirmation.js";

// Create Booking (Dashboard/Widget)
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

    // ✅ Fetch Client Admin (account manager) for this company
    const clientAdminUser = await User.findOne({
      companyId,
      role: "clientadmin",
    })
      .select("name email contact phone profileImage")
      .lean()
      .catch(() => null);

    // ✅ Also fetch the Company document for brand info
    const companyDoc = await Company.findById(companyId)
      .select(
        "companyName tradingName email contact profileImage address website"
      )
      .lean()
      .catch(() => null);

    try {
      // ✅ Build passenger confirmation (with account manager block)
      const confirmationHtml = customerBookingConfirmation({
        booking: savedBooking,
        company: companyDoc || {},
        clientAdmin: clientAdminUser || {},
        options: {
          // Prefer Client Admin as frontline contact
          supportEmail: clientAdminUser?.email || companyDoc?.email,
          supportPhone:
            clientAdminUser?.contact ||
            clientAdminUser?.phone ||
            companyDoc?.contact,
          website: companyDoc?.website,
          address: companyDoc?.address,
        },
      });

      // Send to passenger
      if (savedBooking.passenger.email) {
        await sendEmail(
          savedBooking.passenger.email.trim(),
          `Booking Confirmation #${savedBooking.bookingId}`,
          { html: confirmationHtml }
        );
      }

      // Notify the Client Admin (fallback to company email) — using generic table template
      const adminEmail = clientAdminUser?.email || companyDoc?.email;
      if (adminEmail) {
        const { subject, title, subtitle, data, html } =
          clientadminBookingConfirmation({
            booking: savedBooking,
            company: companyDoc || {},
            clientAdmin: clientAdminUser || {},
          });

        await sendEmail(
          adminEmail,
          subject,
          html ? { html } : { title, subtitle, data } // prefer html if you later add one
        );
      }

      console.log("Booking confirmation emails sent");
    } catch (e) {
      console.error("Error sending booking confirmation email:", e.message);
    }

    return res.status(201).json({
      success: true,
      message: returnIsValid
        ? "Primary and return journeys booked together."
        : "Primary journey booked.",
      bookings: [savedBooking],
      // ✅ expose who will manage this customer (useful for UI)
      clientAdmin: clientAdminUser
        ? {
            name: clientAdminUser.name || "",
            email: clientAdminUser.email || "",
            phone: clientAdminUser.contact || clientAdminUser.phone || "",
          }
        : null,
      company: companyDoc
        ? {
            name: companyDoc.companyName || companyDoc.tradingName || "",
            email: companyDoc.email || "",
            phone: companyDoc.contact || "",
            address: companyDoc.address || "",
            website: companyDoc.website || "",
          }
        : null,
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

    // Validate booking ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Fetch the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Guard: Prevent 'clientadmin' from reverting to "New" or "Accepted" after a driver accepts
    if (currentUser?.role === "clientadmin") {
      const s = (status || "").trim().toLowerCase();
      if (s === "new" || s === "accepted") {
        const driverAcceptedEver = (booking.statusAudit || []).some((e) => {
          return (
            (e?.status || "").toLowerCase() === "accepted" &&
            (e?.updatedBy || "").toLowerCase().startsWith("driver")
          );
        });
        if (driverAcceptedEver) {
          return res.status(403).json({
            message:
              "A driver has already accepted this job. You cannot set status to 'New' or 'Accepted'.",
          });
        }
      }
    }
  
if (req.user?.role === "clientadmin") {
  const current = String(booking?.status || "").trim().toLowerCase();
  const next = String(status || "").trim().toLowerCase();

  if (current === "completed" && (next === "cancelled" )) {
    return res.status(403).json({
      message: "Cannot cancel a booking that is Completed.",
    });
  }
}


    // Apply status update
    booking.status = status === "Late Cancel" ? "Late Cancel" : status;

    // Update driver information if any
    if (Array.isArray(driverIds)) {
      const fullDriverDocs = await driverModel
        .find({ _id: { $in: driverIds } })
        .lean();
      booking.drivers = fullDriverDocs;
    }

    // Update status audit with current user information
    const fullName =
      currentUser?.fullName || currentUser?.name || "Unknown User";
    const updater = `${currentUser?.role || "user"} | ${fullName}`;
    booking.statusAudit = [
      ...(booking.statusAudit || []),
      { updatedBy: updater, status, date: new Date() },
    ];

    // Save the updated booking
    const updatedBooking = await booking.save();

    // ===== Send Driver Status Emails for "On Route" and "At Location" =====
    const normalizedStatus = (status || "").trim();
    const shouldSendDriverEmail = ["On Route", "At Location"].includes(
      normalizedStatus
    );

    if (shouldSendDriverEmail && booking?.passenger?.email) {
      try {
        // Resolve assigned driver & vehicle info
        const firstDriver = booking.drivers?.[0];
        let driverInfo = null;
        let vehicleInfo = null;

        let assignedDriver = null;
        if (firstDriver) {
          const driverDocId =
            firstDriver.driverId || firstDriver._id || firstDriver;
          if (
            driverDocId &&
            mongoose.Types.ObjectId.isValid(String(driverDocId))
          ) {
            assignedDriver = await driverModel.findById(driverDocId).lean();
          }
          if (!assignedDriver && firstDriver.employeeNumber) {
            assignedDriver = await driverModel
              .findOne({
                "DriverData.employeeNumber": firstDriver.employeeNumber,
                companyId: booking.companyId,
              })
              .lean();
          }

          if (assignedDriver) {
            driverInfo = assignedDriver.DriverData || {};
            vehicleInfo = assignedDriver.VehicleData || {};
          } else {
            // Fallback from inline driver data on booking (if present)
            if (
              firstDriver.name ||
              firstDriver.contact ||
              firstDriver.employeeNumber
            ) {
              driverInfo = {
                firstName: firstDriver.name?.split(" ")[0] || "Your",
                surName:
                  firstDriver.name?.split(" ").slice(1).join(" ") || "Driver",
                contact: firstDriver.contact || "",
                email: firstDriver.email || null,
                privateHireCardNo: firstDriver.pcoLicense || "-",
              };
            }
          }
        }

        // Safe defaults to avoid template errors
        driverInfo = driverInfo || {
          firstName: "Your",
          surName: "Driver",
          contact: "",
          email: null,
          privateHireCardNo: "-",
        };
        vehicleInfo = vehicleInfo || {
          carRegistration: "TBD",
          carMake: "TBD",
          carModel: "TBD",
          carColor: "TBD",
        };

        // Get company info
        const company = await Company.findById(booking.companyId).lean();

        const html = driverStatusEmailTemplate({
          booking: updatedBooking,
          driver: driverInfo,
          vehicle: vehicleInfo,
          status: normalizedStatus,
          company: {
            name: company?.companyName || company?.tradingName || "Our Company",
            email: company?.email || "support@company.com",
            logoUrl: company?.profileImage || null,
            phone: company?.contact || null,
            address: company?.address || null,
            licensedBy: company?.licensedBy || null,
            licenseNumber: company?.licenseNumber || null,
            ...company,
          },
        });

        // Send email to Passenger
        await sendEmail(
          booking.passenger.email.trim(),
          `Driver Update - ${normalizedStatus} | Booking #${booking.bookingId}`,
          { html }
        );
        console.log(`Sent email to passenger for status: ${normalizedStatus}`);
      } catch (emailError) {
        console.error(
          `Failed to send ${normalizedStatus} email:`,
          emailError?.message || emailError
        );
      }
    }

    /** AUTO-SEND REVIEW EMAIL when status becomes Completed **/
    try {
      const normalized = (status || "").trim().toLowerCase();
      if (normalized === "completed" && booking?.passenger?.email) {
        if (!booking.reviewEmailScheduledAt && !booking.reviewEmailSent) {
          booking.reviewEmailScheduledAt = new Date();
          await booking.save();
          await autoSendReviewEmail(booking);
        } else {
          console.log("Review email already scheduled/sent, skipping");
        }
      }
    } catch (e) {
      console.error("Review email schedule failed:", e.message);
    }

    // ========= SOCKET NOTIFICATIONS =========
    const io = req.app.get("io");

    const audit = booking.statusAudit || [];
    const prevStatus =
      audit.length > 1 ? audit[audit.length - 2]?.status : null;
    const currStatus = booking.status;
    const isStatusChanged = prevStatus !== currStatus;

    // Notify assigned drivers when NON-driver changed status
    try {
      if (isStatusChanged && currentUser?.role !== "driver") {
        const employeeNumbers = [];

        for (const d of Array.isArray(booking.drivers) ? booking.drivers : []) {
          if (d?.employeeNumber) {
            employeeNumbers.push(String(d.employeeNumber));
            continue;
          }
          if (d?.DriverData?.employeeNumber) {
            employeeNumbers.push(String(d.DriverData.employeeNumber));
            continue;
          }
          const uid = d?.userId || d?._id;
          if (uid) {
            const u = await User.findById(uid).lean();
            if (u?.employeeNumber)
              employeeNumbers.push(String(u.employeeNumber));
          }
        }

        const uniqEmp = [...new Set(employeeNumbers)].filter(Boolean);
        if (uniqEmp.length) {
          const payloads = uniqEmp.map((en) => ({
            employeeNumber: en,
            bookingId: booking.bookingId,
            status: currStatus,
            primaryJourney: {
              pickup:
                booking?.primaryJourney?.pickup ||
                booking?.returnJourney?.pickup ||
                "",
              dropoff:
                booking?.primaryJourney?.dropoff ||
                booking?.returnJourney?.dropoff ||
                "",
            },
            bookingSentAt: new Date(),
            createdBy: currentUser?._id,
            companyId: booking.companyId,
          }));

          const docs = await Notification.insertMany(payloads, {
            ordered: false,
          });
          for (const n of docs) {
            io.to(`emp:${n.employeeNumber}`).emit("notification:new", n);
          }
        }
      }
    } catch (e) {
      console.error("Driver notify on status change failed:", e?.message);
    }

    // When DRIVER changed status, notify clientadmin (+ optional customer portal user)
    try {
      if (isStatusChanged && currentUser?.role === "driver") {
        const clientAdmin = await User.findOne({
          companyId: booking.companyId,
          role: "clientadmin",
        }).lean();

        const adminKey = String(clientAdmin?._id || "");
        if (adminKey) {
          const adminNotif = await Notification.create({
            employeeNumber: adminKey,
            bookingId: booking.bookingId,
            status: currStatus,
            primaryJourney: {
              pickup:
                booking?.primaryJourney?.pickup ||
                booking?.returnJourney?.pickup ||
                "",
              dropoff:
                booking?.primaryJourney?.dropoff ||
                booking?.returnJourney?.dropoff ||
                "",
            },
            bookingSentAt: new Date(),
            createdBy: currentUser?._id,
            companyId: booking.companyId,
          });
          io.to(`emp:${adminKey}`).emit("notification:new", adminNotif);
        }

        const paxEmail = (booking?.passenger?.email || "").trim().toLowerCase();
        const customerUser = paxEmail
          ? await User.findOne({
              companyId: booking.companyId,
              role: "customer",
              email: paxEmail,
            }).lean()
          : null;

        const custKey = String(customerUser?._id || "");
        if (custKey) {
          const customerNotif = await Notification.create({
            employeeNumber: custKey,
            bookingId: booking.bookingId,
            status: currStatus,
            primaryJourney: {
              pickup:
                booking?.primaryJourney?.pickup ||
                booking?.returnJourney?.pickup ||
                "",
              dropoff:
                booking?.primaryJourney?.dropoff ||
                booking?.returnJourney?.dropoff ||
                "",
            },
            bookingSentAt: new Date(),
            createdBy: currentUser?._id,
            companyId: booking.companyId,
          });
          io.to(`emp:${custKey}`).emit("notification:new", customerNotif);
        }
      }
    } catch (e) {
      console.error(
        "Admin/Customer notify on driver change failed:",
        e?.message
      );
    }

    return res.status(200).json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error("Error updating status:", err);
    return res
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

// import Booking from "../models/Booking.js";
// import sendEmail from "../utils/sendEmail.js";
// import driverModel from "../models/Driver.js";
// import User from "../models/User.js";
// import mongoose from "mongoose";
// import Voucher from "../models/pricings/Voucher.js";
// import { createEventOnGoogleCalendar, deleteEventFromGoogleCalendar } from "../utils/calendarService.js";
// import ReviewSetting from "../models/settings/ReviewSetting.js";
// import { compileReviewTemplate } from "../utils/reviewPlaceholders.js";
// import sendReviewEmail from "../utils/sendReviewEmail.js";
// import Notification from "../models/Notification.js";
// import CronJob from "../models/settings/CronJob.js";
// import { scheduleReviewEmail } from "../utils/settings/cronjobs/scheduleReviewEmail.js"

// // Craete Booking (Dashboard/Widget)
// export const createBooking = async (req, res) => {
//   try {
//     const {
//       mode = "Transfer",
//       returnJourneyToggle,
//       companyId,
//       referrer,
//       vehicle = {},
//       passenger = {},
//       primaryJourney = {},
//       returnJourney = {},
//       PassengerEmail,
//       ClientAdminEmail,
//       voucher,
//       voucherApplied,

//       // New fields
//       paymentMethod = "Cash",
//       cardPaymentReference = null,
//       paymentGateway = null,
//       journeyFare = 0,
//       driverFare = 0,
//       returnJourneyFare = 0,
//       returnDriverFare = 0,
//       emailNotifications = {},
//       appNotifications = {},
//     } = req.body;

//     if (
//       !companyId ||
//       typeof companyId !== "string" ||
//       companyId.length !== 24
//     ) {
//       return res.status(400).json({ message: "Invalid or missing companyId" });
//     }

//     // Voucher logic
//     let validVoucher = null;
//     let isVoucherApplied = false;

//     if (voucher && voucherApplied) {
//       const v = await Voucher.findOne({
//         voucher: voucher.toUpperCase(),
//         companyId: new mongoose.Types.ObjectId(companyId),
//       });

//       const today = new Date();
//       if (
//         v &&
//         new Date(v.validity) >= today &&
//         v.used < v.quantity &&
//         v.status === "Active"
//       ) {
//         validVoucher = v.voucher;
//         isVoucherApplied = true;
//         await Voucher.findByIdAndUpdate(v._id, { $inc: { used: 1 } });
//       }
//     }

//     const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];

//     if (!returnJourneyToggle) {
//       for (const field of requiredFields) {
//         if (!primaryJourney[field]) {
//           return res
//             .status(400)
//             .json({ message: `Missing field in primaryJourney: ${field}` });
//         }
//       }
//     } else {
//       for (const field of requiredFields) {
//         if (!returnJourney[field]) {
//           return res
//             .status(400)
//             .json({ message: `Missing field in returnJourney: ${field}` });
//         }
//       }
//     }

//     const extractDynamicDropoffFields = (journey) => {
//       const fields = {};
//       Object.keys(journey || {}).forEach((key) => {
//         if (
//           key.startsWith("dropoff_terminal_") ||
//           key.startsWith("dropoffDoorNumber")
//         ) {
//           fields[key] = journey[key] ?? "";
//         }
//       });
//       return fields;
//     };

//     const generateNextBookingId = async () => {
//       const lastBooking = await Booking.findOne()
//         .sort({ bookingId: -1 })
//         .limit(1);
//       return lastBooking?.bookingId
//         ? (parseInt(lastBooking.bookingId, 10) + 1).toString()
//         : "50301";
//     };

//     const bookingId = await generateNextBookingId();
//     const source =
//       req.body.source ||
//       (referrer?.toLowerCase()?.includes("widget") ? "widget" : "admin");

//     const baseVehicleInfo = {
//       vehicleName: vehicle.vehicleName ?? null,
//       passenger: parseInt(vehicle.passenger) || 0,
//       childSeat: parseInt(vehicle.childSeat) || 0,
//       handLuggage: parseInt(vehicle.handLuggage) || 0,
//       checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
//     };

//     const basePassengerInfo = {
//       name: passenger.name ?? null,
//       email: passenger.email ?? null,
//       phone: passenger.phone ?? null,
//     };

//     const returnIsValid =
//       returnJourneyToggle &&
//       returnJourney &&
//       requiredFields.every((f) => returnJourney[f]);

//     // Build base booking payload
//     const bookingPayload = {
//       bookingId,
//       mode,
//       companyId,
//       returnJourneyToggle: !!returnJourneyToggle,
//       referrer: referrer || "Manual Entry",
//       source,
//       status: "New",
//       vehicle: baseVehicleInfo,
//       passenger: basePassengerInfo,

//       // New fields
//       paymentMethod,
//       cardPaymentReference,
//       paymentGateway,
//       journeyFare: Number(journeyFare) || 0,
//       driverFare: Number(driverFare) || 0,
//       returnJourneyFare: Number(returnJourneyFare) || 0,
//       returnDriverFare: Number(returnDriverFare) || 0,
//       emailNotifications: {
//         admin: !!emailNotifications.admin,
//         customer: !!emailNotifications.customer,
//       },
//       appNotifications: {
//         customer: !!appNotifications.customer,
//       },
//     };

//     // Add primaryJourney
//     if (!returnJourneyToggle) {
//       bookingPayload.primaryJourney = {
//         pickup: primaryJourney.pickup?.trim() ?? "",
//         dropoff: primaryJourney.dropoff?.trim() ?? "",
//         additionalDropoff1: primaryJourney.additionalDropoff1 ?? null,
//         additionalDropoff2: primaryJourney.additionalDropoff2 ?? null,
//         pickupDoorNumber: primaryJourney.pickupDoorNumber ?? "",
//         terminal: primaryJourney.terminal ?? "",
//         arrivefrom: primaryJourney.arrivefrom ?? "",
//         flightNumber: primaryJourney.flightNumber ?? "",
//         pickmeAfter: primaryJourney.pickmeAfter ?? "",
//         notes: primaryJourney.notes ?? "",
//         internalNotes: primaryJourney.internalNotes ?? "",
//         date: primaryJourney.date ?? "",
//         hour:
//           primaryJourney.hour !== undefined
//             ? parseInt(primaryJourney.hour)
//             : null,
//         minute:
//           primaryJourney.minute !== undefined
//             ? parseInt(primaryJourney.minute)
//             : null,
//         fare: primaryJourney.fare ?? 0,
//         hourlyOption: primaryJourney.hourlyOption ?? null,
//         distanceText: primaryJourney.distanceText ?? "",
//         durationText: primaryJourney.durationText ?? "",
//         voucher: validVoucher,
//         voucherApplied: isVoucherApplied,
//         ...extractDynamicDropoffFields(primaryJourney),
//       };
//     }

//     // Add returnJourney if valid
//     if (returnIsValid) {
//       bookingPayload.returnJourney = {
//         pickup: returnJourney.pickup?.trim() ?? "",
//         dropoff: returnJourney.dropoff?.trim() ?? "",
//         additionalDropoff1: returnJourney.additionalDropoff1 ?? null,
//         additionalDropoff2: returnJourney.additionalDropoff2 ?? null,
//         pickupDoorNumber: returnJourney.pickupDoorNumber ?? "",
//         terminal: returnJourney.terminal ?? "",
//         arrivefrom: returnJourney.arrivefrom ?? "",
//         flightNumber: returnJourney.flightNumber ?? "",
//         pickmeAfter: returnJourney.pickmeAfter ?? "",
//         notes: returnJourney.notes ?? "",
//         internalNotes: returnJourney.internalNotes ?? "",
//         date: returnJourney.date ?? "",
//         hour:
//           returnJourney.hour !== undefined
//             ? parseInt(returnJourney.hour)
//             : null,
//         minute:
//           returnJourney.minute !== undefined
//             ? parseInt(returnJourney.minute)
//             : null,
//         fare: returnJourney.fare ?? 0,
//         hourlyOption: returnJourney.hourlyOption ?? null,
//         distanceText: returnJourney.distanceText ?? "",
//         durationText: returnJourney.durationText ?? "",
//         ...extractDynamicDropoffFields(returnJourney),
//       };
//     }

//     // Save booking
//     const savedBooking = await Booking.create(bookingPayload);

//     const clientAdmin = await User.findOne({
//       companyId,
//       role: "clientadmin",
//     }).lean();

//     try {
//       if (
//         clientAdmin?.googleCalendar?.access_token &&
//         savedBooking?.primaryJourney?.date
//       ) {
//         await createEventOnGoogleCalendar({
//           booking: savedBooking,
//           clientAdmin,
//         });
//       }
//     } catch (calendarError) {
//       console.error(
//         "⚠️ Calendar event creation failed:",
//         calendarError.message
//       );
//     }

//     const sanitize = (booking) => {
//       const { _id, __v, createdAt, updatedAt, companyId, ...clean } =
//         booking.toObject();
//       return clean;
//     };

//     const emailData = {
//       title: "Booking Confirmation",
//       data: { Booking: sanitize(savedBooking) },
//     };

//     if (PassengerEmail) {
//       await sendEmail(PassengerEmail, "Your Booking Confirmation", emailData);
//     }
//     if (ClientAdminEmail) {
//       await sendEmail(ClientAdminEmail, "New Booking Received", emailData);
//     }

//     return res.status(201).json({
//       success: true,
//       message: returnIsValid
//         ? "Primary and return journeys booked together."
//         : "Primary journey booked.",
//       bookings: [sanitize(savedBooking)],
//     });
//   } catch (error) {
//     console.error("❌ createBooking error:", error);
//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// // Get All Bookings for a Company
// export const getAllBookings = async (req, res) => {
//   try {
//     const { companyId } = req.query;

//     if (!companyId || companyId.length !== 24) {
//       return res.status(400).json({ message: "Valid companyId is required" });
//     }

//     const bookings = await Booking.find({ companyId });

//     res.status(200).json({
//       success: true,
//       message: "Bookings fetched successfully",
//       bookings,
//     });
//   } catch (error) {
//     console.error("Error in getAllBookings:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

// // Update Booking by ID
// export const updateBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { bookingData = {}, PassengerEmail, ClientAdminEmail } = req.body;

//     if (!id || id.length !== 24) {
//       return res.status(400).json({ message: "Invalid booking ID" });
//     }

//     const {
//       mode = "Transfer",
//       returnJourneyToggle,
//       companyId,
//       referrer = "Manual Entry",
//       vehicle = {},
//       passenger = {},
//       primaryJourney = {},
//       returnJourney = {},
//       paymentMethod,
//       cardPaymentReference = null,
//       paymentGateway = null,
//       journeyFare = 0,
//       driverFare = 0,
//       returnJourneyFare = 0,
//       returnDriverFare = 0,
//       emailNotifications = {},
//       appNotifications = {},
//       voucher,
//       voucherApplied,
//     } = bookingData;

//     if (!companyId || companyId.length !== 24) {
//       return res.status(400).json({ message: "Invalid or missing companyId" });
//     }

//     const extractDynamicDropoffFields = (journey = {}) => {
//       const fields = {};
//       Object.keys(journey).forEach((key) => {
//         if (
//           key.startsWith("dropoff_terminal_") ||
//           key.startsWith("dropoffDoorNumber")
//         ) {
//           fields[key] = journey[key] ?? "";
//         }
//       });
//       return fields;
//     };

//     const updatedPayload = {
//       mode,
//       returnJourneyToggle: !!returnJourneyToggle,
//       companyId,
//       referrer,
//       vehicle: {
//         vehicleName: vehicle.vehicleName ?? null,
//         passenger: parseInt(vehicle.passenger) || 0,
//         childSeat: parseInt(vehicle.childSeat) || 0,
//         handLuggage: parseInt(vehicle.handLuggage) || 0,
//         checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
//       },
//       passenger: {
//         name: passenger.name ?? null,
//         email: passenger.email ?? null,
//         phone: passenger.phone ?? null,
//       },
//       paymentMethod,
//       cardPaymentReference,
//       paymentGateway,
//       journeyFare: Number(journeyFare),
//       driverFare: Number(driverFare),
//       returnJourneyFare: Number(returnJourneyFare),
//       returnDriverFare: Number(returnDriverFare),
//       emailNotifications: {
//         admin: !!emailNotifications.admin,
//         customer: !!emailNotifications.customer,
//       },
//       appNotifications: {
//         customer: !!appNotifications.customer,
//       },
//     };

//     // ✅ Add returnJourney if returnJourneyToggle is true
//     if (returnJourneyToggle) {
//       updatedPayload.returnJourney = {
//         pickup: returnJourney.pickup?.trim() ?? "",
//         dropoff: returnJourney.dropoff?.trim() ?? "",
//         additionalDropoff1: returnJourney.additionalDropoff1 ?? null,
//         additionalDropoff2: returnJourney.additionalDropoff2 ?? null,
//         pickupDoorNumber: returnJourney.pickupDoorNumber ?? "",
//         terminal: returnJourney.terminal ?? "",
//         arrivefrom: returnJourney.arrivefrom ?? "",
//         flightNumber: returnJourney.flightNumber ?? "",
//         pickmeAfter: returnJourney.pickmeAfter ?? "",
//         notes: returnJourney.notes ?? "",
//         internalNotes: returnJourney.internalNotes ?? "",
//         date: returnJourney.date ?? "",
//         hour:
//           returnJourney.hour !== undefined
//             ? parseInt(returnJourney.hour)
//             : null,
//         minute:
//           returnJourney.minute !== undefined
//             ? parseInt(returnJourney.minute)
//             : null,
//         fare: returnJourney.fare ?? 0,
//         hourlyOption: returnJourney.hourlyOption ?? null,
//         distanceText: returnJourney.distanceText ?? "",
//         durationText: returnJourney.durationText ?? "",
//         voucher,
//         voucherApplied,
//         ...extractDynamicDropoffFields(returnJourney),
//       };
//     }

//     // ✅ Only add primaryJourney if not editing return only
//     if (
//       !returnJourneyToggle ||
//       (primaryJourney?.pickup && primaryJourney?.dropoff)
//     ) {
//       updatedPayload.primaryJourney = {
//         pickup: primaryJourney.pickup?.trim() ?? "",
//         dropoff: primaryJourney.dropoff?.trim() ?? "",
//         additionalDropoff1: primaryJourney.additionalDropoff1 ?? null,
//         additionalDropoff2: primaryJourney.additionalDropoff2 ?? null,
//         pickupDoorNumber: primaryJourney.pickupDoorNumber ?? "",
//         terminal: primaryJourney.terminal ?? "",
//         arrivefrom: primaryJourney.arrivefrom ?? "",
//         flightNumber: primaryJourney.flightNumber ?? "",
//         pickmeAfter: primaryJourney.pickmeAfter ?? "",
//         notes: primaryJourney.notes ?? "",
//         internalNotes: primaryJourney.internalNotes ?? "",
//         date: primaryJourney.date ?? "",
//         hour:
//           primaryJourney.hour !== undefined
//             ? parseInt(primaryJourney.hour)
//             : null,
//         minute:
//           primaryJourney.minute !== undefined
//             ? parseInt(primaryJourney.minute)
//             : null,
//         fare: primaryJourney.fare ?? 0,
//         hourlyOption: primaryJourney.hourlyOption ?? null,
//         distanceText: primaryJourney.distanceText ?? "",
//         durationText: primaryJourney.durationText ?? "",
//         voucher,
//         voucherApplied,
//         ...extractDynamicDropoffFields(primaryJourney),
//       };
//     }

//     if (bookingData.drivers) {
//       updatedPayload.drivers = bookingData.drivers;
//     }

//     // 🔄 Save to DB
//     const updatedBooking = await Booking.findByIdAndUpdate(id, updatedPayload, {
//       new: true,
//     });

//     if (!updatedBooking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const sanitize = (booking) => {
//       const { _id, __v, createdAt, updatedAt, companyId, ...clean } =
//         booking.toObject();
//       return clean;
//     };

//     const emailData = {
//       title: "Booking Updated",
//       data: { Booking: sanitize(updatedBooking) },
//     };

//     if (PassengerEmail) {
//       await sendEmail(PassengerEmail, "Your Booking Was Updated", emailData);
//     }

//     if (ClientAdminEmail) {
//       await sendEmail(ClientAdminEmail, "Booking Updated", emailData);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Booking updated successfully",
//       booking: sanitize(updatedBooking),
//     });
//   } catch (error) {
//     console.error("❌ Error in updateBooking:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const deleteBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const booking = await Booking.findById(id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.googleCalendarEventId) {
//       try {
//         const clientAdmin = await User.findOne({
//           companyId: booking.companyId,
//           role: "clientadmin",
//         }).lean();

//         if (clientAdmin?.googleCalendar?.access_token) {
//           await deleteEventFromGoogleCalendar({
//             eventId: booking.googleCalendarEventId,
//             clientAdmin: clientAdmin,
//           });
//         }
//       } catch (calendarError) {
//         console.error("Error deleting from Google Calendar:", calendarError);
//       }
//     }

//     await Booking.findByIdAndDelete(id);

//     res.status(200).json({
//       success: true,
//       message: "Booking deleted successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("Error in deleteBooking:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

// // Update Booking Status
// export const updateBookingStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, updatedBy, driverIds } = req.body;
//     const currentUser = req.user;

//     if (!id || id.length !== 24) {
//       return res.status(400).json({ message: "Invalid booking ID" });
//     }

//     // Fetch the booking by ID
//     const booking = await Booking.findById(id);
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }
//     if (req.user?.role === "clientadmin") {
//       if (
//         status.trim().toLowerCase() === "new" ||
//         status.trim().toLowerCase() === "accepted"
//       ) {
//         const driverAcceptedEver = (booking.statusAudit || []).some((e) => {
//           return (
//             e?.status?.toLowerCase() === "accepted" &&
//             e?.updatedBy?.toLowerCase()?.startsWith("driver")
//           );
//         });

//         if (driverAcceptedEver) {
//           return res.status(403).json({
//             message:
//               "A driver has already accepted this job. You cannot set status to 'New' or 'Accepted'.",
//           });
//         }
//       }
//     }
//     booking.status = status === "Late Cancel" ? "Late Cancel" : status;
//     if (Array.isArray(driverIds)) {
//       const fullDriverDocs = await driverModel
//         .find({
//           _id: { $in: driverIds },
//         })
//         .lean();
//       booking.drivers = fullDriverDocs;
//     }

//     const fullName = currentUser.fullName || currentUser.name || "Unknown User";
//     const updater = `${currentUser?.role} | ${fullName}`;

//     booking.statusAudit = [
//       ...(booking.statusAudit || []),
//       {
//         updatedBy: updater,
//         status,
//         date: new Date(),
//       },
//     ];
//     // Save the updated booking
//     const updatedBooking = await booking.save();

//     /** AUTO-SEND REVIEW EMAIL when status becomes Completed **/
//     try {
//       const normalized = (status || "").trim().toLowerCase();
//       if (normalized === "completed" && booking?.passenger?.email) {
//         if (!booking.reviewEmailScheduledAt && !booking.reviewEmailSent) {
//           booking.reviewEmailScheduledAt = new Date();
//           await booking.save();
//           await scheduleReviewEmail(booking);
//         } else {
//           console.log("Review email already scheduled/sent, skipping");
//         }
//       }
//     } catch (e) {
//       console.error("Review email schedule failed:", e.message);
//     }

//     // ========= DRIVER NOTIFY ON STATUS CHANGE =========
//     const io = req.app.get("io");

//     const audit = booking.statusAudit || [];
//     const prevStatus =
//       audit.length > 1 ? audit[audit.length - 2]?.status : null;
//     const currStatus = booking.status;
//     const isStatusChanged = prevStatus !== currStatus;
//     try {
//       // 🔒 Notify drivers only when a non-driver updated the status
//       if (isStatusChanged && currentUser?.role !== "driver") {
//         const employeeNumbers = [];

//         for (const d of Array.isArray(booking.drivers) ? booking.drivers : []) {
//           if (d?.employeeNumber) {
//             employeeNumbers.push(String(d.employeeNumber));
//             continue;
//           }
//           if (d?.DriverData?.employeeNumber) {
//             employeeNumbers.push(String(d.DriverData.employeeNumber));
//             continue;
//           }
//           const uid = d?.userId || d?._id;
//           if (uid) {
//             const u = await User.findById(uid).lean();
//             if (u?.employeeNumber)
//               employeeNumbers.push(String(u.employeeNumber));
//           }
//         }

//         const uniqEmp = [...new Set(employeeNumbers)].filter(Boolean);
//         if (uniqEmp.length) {
//           const payloads = uniqEmp.map((en) => ({
//             employeeNumber: en,
//             bookingId: booking.bookingId,
//             status: currStatus,
//             primaryJourney: {
//               pickup:
//                 booking?.primaryJourney?.pickup ||
//                 booking?.returnJourney?.pickup ||
//                 "",
//               dropoff:
//                 booking?.primaryJourney?.dropoff ||
//                 booking?.returnJourney?.dropoff ||
//                 "",
//             },
//             bookingSentAt: new Date(),
//             createdBy: currentUser?._id,
//             companyId: booking.companyId,
//           }));

//           const docs = await Notification.insertMany(payloads, {
//             ordered: false,
//           });
//           for (const n of docs) {
//             io.to(`emp:${n.employeeNumber}`).emit("notification:new", n);
//           }
//         }
//       }
//     } catch (e) {
//       console.error("Driver notify on status change failed:", e?.message);
//     }
//     // ========= END DRIVER NOTIFY =========
//     try {
//       if (isStatusChanged && currentUser?.role === "driver") {
//         // 1) notify clientadmin in-app
//         const clientAdmin = await User.findOne({
//           companyId: booking.companyId,
//           role: "clientadmin",
//         }).lean();
//         const adminKey = String(clientAdmin?._id || "");
//         if (adminKey) {
//           const adminNotif = await Notification.create({
//             employeeNumber: String(adminKey), // 👈 add this
//             bookingId: booking.bookingId,
//             status: currStatus,
//             primaryJourney: {
//               pickup:
//                 booking?.primaryJourney?.pickup ||
//                 booking?.returnJourney?.pickup ||
//                 "",
//               dropoff:
//                 booking?.primaryJourney?.dropoff ||
//                 booking?.returnJourney?.dropoff ||
//                 "",
//             },
//             bookingSentAt: new Date(),
//             createdBy: currentUser?._id,
//             companyId: booking.companyId,
//           });
//           io.to(`emp:${adminKey}`).emit("notification:new", adminNotif);
//         }

//         // 2) (optional) notify customer user if you have one
//         const paxEmail = (booking?.passenger?.email || "").trim().toLowerCase();
//         const customerUser = paxEmail
//           ? await User.findOne({
//               companyId: booking.companyId,
//               role: "customer",
//               email: paxEmail,
//             }).lean()
//           : null;

//         const custKey = String(customerUser?._id || "");
//         if (custKey) {
//           const customerNotif = await Notification.create({
//             employeeNumber: String(custKey), // 👈 add this
//             bookingId: booking.bookingId,
//             status: currStatus,
//             primaryJourney: {
//               pickup:
//                 booking?.primaryJourney?.pickup ||
//                 booking?.returnJourney?.pickup ||
//                 "",
//               dropoff:
//                 booking?.primaryJourney?.dropoff ||
//                 booking?.returnJourney?.dropoff ||
//                 "",
//             },
//             bookingSentAt: new Date(),
//             createdBy: currentUser?._id,
//             companyId: booking.companyId,
//           });
//           io.to(`emp:${custKey}`).emit("notification:new", customerNotif);
//         }
//       }
//     } catch (e) {
//       console.error(
//         "Admin/Customer notify on driver change failed:",
//         e?.message
//       );
//     }
//     // Driver updated the status
//     if (currentUser?.role === "driver" && status) {
//       const driver = await driverModel
//         .findOne({
//           "DriverData.employeeNumber": currentUser.employeeNumber,
//           companyId: currentUser.companyId,
//         })
//         .lean();

//       if (driver) {
//         const clientAdmin = await User.findOne({
//           companyId: currentUser.companyId,
//           role: "clientadmin",
//         }).lean();

//         const statusStyled = `<span style="color: green;">${status}</span>`;
//         const driverName = `"${driver?.DriverData?.firstName || ""} ${
//           driver?.DriverData?.surName || ""
//         }"`.trim();
//         const bookingId = booking.bookingId;

//         const title = `Driver ${driverName} changed the status to ${statusStyled} for booking #${bookingId}`;
//         const subtitle = `Booking status changed by driver ${driverName} to ${statusStyled}`;
//         const data = {
//           BookingId: bookingId,
//           Status: status,
//           DriverName: driverName,
//         };

//         await sendEmailsAsync(
//           clientAdmin?.email,
//           booking?.passenger?.email,
//           null,
//           driverName,
//           statusStyled,
//           bookingId
//         );
//       }
//     }

//     // Client Admin updated the status
//     if (currentUser?.role === "clientadmin" && status) {
//       const bookingId = booking.bookingId;
//       const statusStyled = `<span style="color: green;">${status}</span>`;

//       const firstDriverId = booking.drivers?.[0]?._id || booking.drivers?.[0];
//       const assignedDriver = mongoose.Types.ObjectId.isValid(firstDriverId)
//         ? await driverModel.findById(firstDriverId).lean()
//         : null;

//       const driverName = assignedDriver
//         ? `"${assignedDriver.DriverData.firstName || ""} ${
//             assignedDriver.DriverData.surName || ""
//           }"`.trim()
//         : `"Assigned Driver"`;

//       const driverEmail = assignedDriver?.DriverData?.email;

//       const data = {
//         BookingId: bookingId,
//         Status: status,
//         DriverName: driverName,
//       };

//       // Send email notifications for the passenger and driver
//       if (booking?.passenger?.email) {
//         await sendEmail(
//           booking.passenger.email,
//           "Ride Status Updated by Admin",
//           {
//             title: `Ride Status Updated for Booking #${bookingId}`,
//             subtitle: `The status of your booking has been changed to ${statusStyled} by the admin.`,
//             data,
//           }
//         );
//       }

//       if (driverEmail) {
//         await sendEmail(driverEmail, "Ride Status Updated by Admin", {
//           title: `Booking #${bookingId} Status Updated`,
//           subtitle: `Admin changed your assigned ride status to ${statusStyled}.`,
//           data,
//         });
//       }

//       const paxEmail2 = (booking?.passenger?.email || "").trim().toLowerCase();
//       if (paxEmail2) {
//         const customerUser2 = await User.findOne({
//           companyId: booking.companyId,
//           role: "customer",
//           email: paxEmail2,
//         }).lean();

//         const custKey2 = String(customerUser2?._id || "");
//         if (custKey2) {
//           const customerNotif2 = await Notification.create({
//             employeeNumber: custKey2, // customer portal uses _id as key
//             bookingId: booking.bookingId,
//             status: booking.status, // or use currStatus
//             primaryJourney: {
//               pickup:
//                 booking?.primaryJourney?.pickup ||
//                 booking?.returnJourney?.pickup ||
//                 "",
//               dropoff:
//                 booking?.primaryJourney?.dropoff ||
//                 booking?.returnJourney?.dropoff ||
//                 "",
//             },
//             bookingSentAt: new Date(),
//             createdBy: currentUser?._id,
//             companyId: booking.companyId,
//           });
//           io.to(`emp:${custKey2}`).emit("notification:new", customerNotif2);
//         }
//       }
//     }

//     res.status(200).json({ success: true, booking: updatedBooking });
//   } catch (err) {
//     console.error("Error updating status:", err);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// };

// // Get All Passengers
// export const getAllPassengers = async (req, res) => {
//   try {
//     const companyId = req.user?.companyId;

//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing companyId from authenticated user",
//       });
//     }

//     const bookings = await Booking.find({ companyId }, "passenger");

//     // Extract passengers from bookings
//     let passengerMap = new Map();

//     bookings.forEach((booking) => {
//       const p = booking.passenger;
//       if (p && (p.name || p.email || p.phone)) {
//         const key = `${p.name}-${p.email}-${p.phone}`;
//         if (!passengerMap.has(key)) {
//           passengerMap.set(key, {
//             name: p.name || "Unnamed",
//             email: p.email || "",
//             phone: p.phone || "",
//             _id: p._id || key, // fallback _id
//           });
//         }
//       }
//     });

//     const passengers = Array.from(passengerMap.values());
//     res.status(200).json({ success: true, passengers });
//   } catch (error) {
//     console.error("getAllPassengers error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch passengers",
//       error: error.message,
//     });
//   }
// };

// // Send Booking Data
// export const sendBookingEmail = async (req, res) => {
//   const { bookingId, email } = req.body;

//   if (!bookingId || !email) {
//     return res
//       .status(400)
//       .json({ message: "Booking ID and email are required." });
//   }

//   try {
//     const booking = await Booking.findById(bookingId).lean();
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found." });
//     }

//     const addMilesToDistanceText = (journey) => {
//       if (journey?.distanceText && journey.distanceText.includes("km")) {
//         const km = parseFloat(journey.distanceText);
//         if (!isNaN(km)) {
//           const miles = km * 0.621371;
//           journey.distanceText = `${km} km (${miles} miles)`;
//         }
//       }
//     };

//     addMilesToDistanceText(booking.primaryJourney);
//     if (booking.returnJourneyToggle && booking.returnJourney) {
//       addMilesToDistanceText(booking.returnJourney);
//     }

//     const plainBooking = JSON.parse(JSON.stringify(booking));
//     const { _id, statusAudit, createdAt, updatedAt, __v, ...cleanedBooking } =
//       JSON.parse(JSON.stringify(booking));
//     await sendEmail(email, "Your Booking Confirmation", {
//       title: "Booking Confirmation",
//       subtitle: "Here are your booking details:",
//       data: cleanedBooking,
//     });

//     res.status(200).json({ message: "Booking email sent successfully." });
//   } catch (err) {
//     console.error("Error sending booking email:", err);
//     res.status(500).json({ message: "Failed to send booking email." });
//   }
// };

// const sendEmailsAsync = async (
//   clientAdminEmail,
//   passengerEmail,
//   driverEmail,
//   driverName,
//   status,
//   bookingId
// ) => {
//   const emailPromises = [];

//   // Send email to client admin
//   if (clientAdminEmail) {
//     const clientAdminEmailPromise = sendEmail(
//       clientAdminEmail,
//       "Booking Status Updated",
//       {
//         title: `Driver ${driverName} changed the status to ${status} for booking #${bookingId}`,
//         subtitle: `Booking status changed by driver ${driverName} to ${status}`,
//         data: { BookingId: bookingId, Status: status, DriverName: driverName },
//       }
//     );
//     emailPromises.push(clientAdminEmailPromise);
//   }

//   // Send email to passenger
//   if (passengerEmail) {
//     const passengerEmailPromise = sendEmail(
//       passengerEmail,
//       "Your Ride Status Has Been Updated",
//       {
//         title: `Your Ride Status Has Been Updated by Driver ${driverName}`,
//         subtitle: `Booking status changed to ${status} by driver ${driverName}`,
//         data: { BookingId: bookingId, Status: status, DriverName: driverName },
//       }
//     );
//     emailPromises.push(passengerEmailPromise);
//   }

//   // Send email to the driver
//   if (driverEmail) {
//     const driverEmailPromise = sendEmail(
//       driverEmail,
//       "Ride Status Updated by Admin",
//       {
//         title: `Booking #${bookingId} Status Updated`,
//         subtitle: `Admin changed your assigned ride status to ${status}.`,
//         data: { BookingId: bookingId, Status: status, DriverName: driverName },
//       }
//     );
//     emailPromises.push(driverEmailPromise);
//   }

//   // Wait for all email promises to finish in parallel
//   await Promise.all(emailPromises);
// };

// // Restore & Delete
// export const restoreOrDeleteBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { action, updatedBy } = req.body;

//     if (!id || id.length !== 24) {
//       return res.status(400).json({ message: "Invalid booking ID" });
//     }

//     const booking = await Booking.findById(id);
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (action === "restore") {
//       booking.status = "New"; // or your default active status
//     } else if (action === "delete") {
//       await Booking.findByIdAndDelete(id);
//       return res.status(200).json({ message: "Booking permanently deleted" });
//     } else {
//       return res.status(400).json({ message: "Invalid action" });
//     }

//     // Add audit
//     booking.statusAudit = [
//       ...(booking.statusAudit || []),
//       {
//         updatedBy: updatedBy || "Unknown",
//         status: booking.status,
//         date: new Date(),
//       },
//     ];

//     await booking.save();

//     res
//       .status(200)
//       .json({ message: `Booking ${action}d successfully`, booking });
//   } catch (error) {
//     console.error("❌ restoreOrDeleteBooking error:", error);
//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
