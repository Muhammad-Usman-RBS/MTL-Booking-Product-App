import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Company from "../models/Company.js";
import sendEmail from "../utils/sendEmail.js";
import driverModel from "../models/Driver.js";
import Voucher from "../models/pricings/Voucher.js";
import Notification from "../models/Notification.js";
import BookingSetting from "../models/settings/BookingSetting.js";
import fetchFlightTimes from "../utils/bookings/fetchFlightTimes.js";
import { deleteEventFromGoogleCalendar } from "../utils/calendarService.js";
import { autoSendReviewEmail } from "../utils/bookings/autoSendReviewEmail.js";
import { shouldSendCustomerEmail } from "../utils/bookings/checkCustomerPreference.js";
import { driverStatusEmailTemplate } from "../utils/bookings/driverStatusEmailTemplate.js";
import { customerBookingConfirmation } from "../utils/bookings/customerBookingConfirmation.js";
import { driverAssignmentEmailTemplate } from "../utils/bookings/driverAssignmentEmailTemplate.js";
import { clientadminBookingConfirmation } from "../utils/bookings/clientadminBookingConfirmation.js";
import { customerCancellationEmailTemplate } from "../utils/bookings/customerCancellationEmailTemplate.js";

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
      voucher,
      voucherApplied,
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
    let source = "widget";

    if (
      req.user?.role === "clientadmin" ||
      req.user?.role === "associateadmin"
    ) {
      source = "admin";
    }

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

    // 🔹 Currency snapshot logic
    const bookingSetting = await BookingSetting.findOne({ companyId });

    let bookingCurrency = { label: "British Pound", value: "GBP", symbol: "£" };

    if (bookingSetting) {
      if (bookingSetting.currencyApplication === "All Bookings") {
        bookingCurrency = bookingSetting.currency[0];
      } else if (bookingSetting.currencyApplication === "New Bookings Only") {
        // sirf naye bookings ke liye setting wali currency save hogi
        bookingCurrency = bookingSetting.currency[0];
      }
    }

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

      // ✅ currency snapshot
      currency: bookingCurrency,

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
        additionalDropoff3: primaryJourney.additionalDropoff3 ?? null,
        additionalDropoff4: primaryJourney.additionalDropoff4 ?? null,
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
        additionalDropoff3: returnJourney.additionalDropoff3 ?? null,
        additionalDropoff4: returnJourney.additionalDropoff4 ?? null,
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

    if (primaryJourney.flightNumber) {
      const flightInfo = await fetchFlightTimes(primaryJourney.flightNumber);
      if (flightInfo) {
        bookingPayload.primaryJourney.flightArrival = {
          scheduled: flightInfo.scheduled,
          estimated: flightInfo.estimated,
          actual: flightInfo.actual,
        };
        bookingPayload.primaryJourney.flightOrigin = flightInfo.origin;
        bookingPayload.primaryJourney.flightDestination =
          flightInfo.destination;
      }
    }
    if (returnJourney.flightNumber) {
      const flightInfo = await fetchFlightTimes(returnJourney.flightNumber);
      if (flightInfo) {
        bookingPayload.returnJourney.flightArrival = {
          scheduled: flightInfo.scheduled,
          estimated: flightInfo.estimated,
          actual: flightInfo.actual,
        };
        bookingPayload.returnJourney.flightOrigin = flightInfo.origin;
        bookingPayload.returnJourney.flightDestination = flightInfo.destination;
      }
    }

    const savedBooking = await Booking.create(bookingPayload);

    const clientAdminUser = await User.findOne({
      companyId,
      role: "clientadmin",
    })
      .select("name email contact phone profileImage")
      .lean()
      .catch(() => null);

    const companyDoc = await Company.findById(companyId)
      .select(
        "companyName tradingName email contact profileImage address website"
      )
      .lean()
      .catch(() => null);

    try {
      // Build passenger confirmation (with account manager block)
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

      // Send to passenger (only if preference is true)
      if (savedBooking.passenger.email) {
        const allow = await shouldSendCustomerEmail(
          companyId,
          savedBooking.passenger.email
        );
        if (allow) {
          await sendEmail(
            savedBooking.passenger.email.trim(),
            `Booking Confirmation #${savedBooking.bookingId}`,
            { html: confirmationHtml }
          );
        }
      }

      // === Notify the Client Admin (only if booking source is widget) ===
      if (source === "widget") {
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
            html ? { html } : { title, subtitle, data }
          );
        }
      }
    } catch (e) {
      console.error("Error sending booking confirmation email:", e.message);
    }
    try {
      const io = req.app.get("io");
      const currentUser = req.user;
      if (currentUser?.role === "clientadmin") {
        const passengerEmail = savedBooking?.passenger?.email
          ?.trim()
          .toLowerCase();

        if (passengerEmail) {
          const customerUser = await User.findOne({
            companyId: savedBooking.companyId,
            role: "customer",
            email: passengerEmail,
          }).lean();
          if (customerUser) {
            const customerNotif = await Notification.create({
              employeeNumber: String(customerUser._id),
              bookingId: savedBooking.bookingId,
              status: "New",
              primaryJourney: {
                pickup:
                  savedBooking?.primaryJourney?.pickup ||
                  savedBooking?.returnJourney?.pickup ||
                  "",
                dropoff:
                  savedBooking?.primaryJourney?.dropoff ||
                  savedBooking?.returnJourney?.dropoff ||
                  "",
              },
              bookingSentAt: new Date(),
              createdBy: currentUser._id,
              companyId: savedBooking.companyId,
            });
            io.to(`emp:${customerUser._id}`).emit(
              "notification:new",
              customerNotif
            );
          }
        }
      }

      // If current user is customer, notify clientadmin
      if (currentUser?.role === "customer") {
        const clientAdmin = await User.findOne({
          companyId: savedBooking.companyId,
          role: "clientadmin",
        }).lean();
        if (clientAdmin) {
          const adminNotif = await Notification.create({
            employeeNumber: String(clientAdmin._id),
            bookingId: savedBooking.bookingId,
            status: "New",
            primaryJourney: {
              pickup:
                savedBooking?.primaryJourney?.pickup ||
                savedBooking?.returnJourney?.pickup ||
                "",
              dropoff:
                savedBooking?.primaryJourney?.dropoff ||
                savedBooking?.returnJourney?.dropoff ||
                "",
            },
            bookingSentAt: new Date(),
            createdBy: currentUser._id,
            companyId: savedBooking.companyId,
          });
          io.to(`emp:${clientAdmin._id}`).emit("notification:new", adminNotif);
        }
      }
    } catch (notificationError) {
      console.error(
        "Failed to send booking creation notifications:",
        notificationError?.message
      );
    }
    return res.status(201).json({
      success: true,
      message: returnIsValid
        ? "Primary and return journeys booked together."
        : "Primary journey booked.",
      bookings: [savedBooking],
      // expose who will manage this customer (useful for UI)
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
    console.error("createBooking error:", error);
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
    const { bookingData = {} } = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Get the existing booking to compare driver changes
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
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

    // Handle journey data
    if (returnJourneyToggle) {
      const prevReturn =
        existingBooking.returnJourney?.toObject?.() ||
        existingBooking.returnJourney ||
        {};

      updatedPayload.returnJourney = {
        ...prevReturn, // keep old fields (like flightArrival)
        pickup: returnJourney.pickup?.trim() ?? prevReturn.pickup ?? "",
        dropoff: returnJourney.dropoff?.trim() ?? prevReturn.dropoff ?? "",
        additionalDropoff1:
          returnJourney.additionalDropoff1 ??
          prevReturn.additionalDropoff1 ??
          null,
        additionalDropoff2:
          returnJourney.additionalDropoff2 ??
          prevReturn.additionalDropoff2 ??
          null,
        additionalDropoff3:
          returnJourney.additionalDropoff3 ??
          prevReturn.additionalDropoff3 ??
          null,

        additionalDropoff4:
          returnJourney.additionalDropoff4 ??
          prevReturn.additionalDropoff4 ??
          null,

        pickupDoorNumber:
          returnJourney.pickupDoorNumber ?? prevReturn.pickupDoorNumber ?? "",
        terminal: returnJourney.terminal ?? prevReturn.terminal ?? "",
        arrivefrom: returnJourney.arrivefrom ?? prevReturn.arrivefrom ?? "",
        flightNumber:
          returnJourney.flightNumber ?? prevReturn.flightNumber ?? "",
        pickmeAfter: returnJourney.pickmeAfter ?? prevReturn.pickmeAfter ?? "",
        notes: returnJourney.notes ?? prevReturn.notes ?? "",
        internalNotes:
          returnJourney.internalNotes ?? prevReturn.internalNotes ?? "",
        date: returnJourney.date ?? prevReturn.date ?? "",
        hour:
          returnJourney.hour !== undefined
            ? parseInt(returnJourney.hour)
            : prevReturn.hour ?? null,
        minute:
          returnJourney.minute !== undefined
            ? parseInt(returnJourney.minute)
            : prevReturn.minute ?? null,
        fare: returnJourney.fare ?? prevReturn.fare ?? 0,
        hourlyOption:
          returnJourney.hourlyOption ?? prevReturn.hourlyOption ?? null,
        distanceText:
          returnJourney.distanceText ?? prevReturn.distanceText ?? "",
        durationText:
          returnJourney.durationText ?? prevReturn.durationText ?? "",
        voucher,
        voucherApplied,
        ...extractDynamicDropoffFields(returnJourney),
      };

      // Only re-fetch arrivals if flight number changed
      if (
        updatedPayload.returnJourney.flightNumber &&
        updatedPayload.returnJourney.flightNumber !== prevReturn.flightNumber
      ) {
        const flightInfo = await fetchFlightTimes(
          updatedPayload.returnJourney.flightNumber
        );
        if (flightInfo) {
          updatedPayload.returnJourney.flightArrival = {
            scheduled: flightInfo.scheduled,
            estimated: flightInfo.estimated,
            actual: flightInfo.actual,
          };
          updatedPayload.returnJourney.flightOrigin = flightInfo.origin;
          updatedPayload.returnJourney.flightDestination =
            flightInfo.destination;
        }
      }
    }

    if (
      !returnJourneyToggle ||
      (primaryJourney?.pickup && primaryJourney?.dropoff)
    ) {
      updatedPayload.primaryJourney = {
        pickup: primaryJourney.pickup?.trim() ?? "",
        dropoff: primaryJourney.dropoff?.trim() ?? "",
        additionalDropoff1: primaryJourney.additionalDropoff1 ?? null,
        additionalDropoff2: primaryJourney.additionalDropoff2 ?? null,
        additionalDropoff3: primaryJourney.additionalDropoff3 ?? null,
        additionalDropoff4: primaryJourney.additionalDropoff4 ?? null,

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
    // Add this block right after building updatedPayload and before findByIdAndUpdate
    // Handle flight arrival times for updated flight numbers
    if (!returnJourneyToggle && updatedPayload.primaryJourney?.flightNumber) {
      const flightInfo = await fetchFlightTimes(
        updatedPayload.primaryJourney.flightNumber
      );
      if (flightInfo) {
        updatedPayload.primaryJourney.flightArrival = {
          scheduled: flightInfo.scheduled,
          estimated: flightInfo.estimated,
          actual: flightInfo.actual,
        };
        updatedPayload.primaryJourney.flightOrigin = flightInfo.origin;
        updatedPayload.primaryJourney.flightDestination =
          flightInfo.destination;
      }
    }

    if (returnJourneyToggle && updatedPayload.returnJourney?.flightNumber) {
      const flightInfo = await fetchFlightTimes(
        updatedPayload.returnJourney.flightNumber
      );
      if (flightInfo) {
        updatedPayload.returnJourney.flightArrival = {
          scheduled: flightInfo.scheduled,
          estimated: flightInfo.estimated,
          actual: flightInfo.actual,
        };
        updatedPayload.returnJourney.flightOrigin = flightInfo.origin;
        updatedPayload.returnJourney.flightDestination = flightInfo.destination;
      }
    }
    // Handle drivers field - only update if it exists in request
    if (bookingData.hasOwnProperty("drivers")) {
      updatedPayload.drivers = bookingData.drivers;
    }
    // Save to DB first
    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedPayload, {
      new: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ======= DRIVER EMAIL LOGIC (Only if drivers field was provided) =======
    let driverEmailResults = {
      assigned: [],
      unassigned: [],
      emailsSent: [],
    };

    if (bookingData.hasOwnProperty("drivers")) {
      try {
        const company = await Company.findById(companyId).lean();

        // Compare existing drivers with new drivers
        const existingDriverIds = (existingBooking.drivers || []).map((d) => {
          return String(d.driverId || d._id || d);
        });

        const newDriverIds = (bookingData.drivers || []).map((d) => {
          return String(d.driverId || d._id || d);
        });

        const newlyAssigned = newDriverIds.filter(
          (id) => !existingDriverIds.includes(id)
        );
        const unassigned = existingDriverIds.filter(
          (id) => !newDriverIds.includes(id)
        );

        driverEmailResults.assigned = newlyAssigned;
        driverEmailResults.unassigned = unassigned;

        const findDriverById = async (driverId) => {
          // Try direct ID lookup first
          if (mongoose.Types.ObjectId.isValid(driverId)) {
            const driverDoc = await driverModel.findById(driverId).lean();
            if (driverDoc) {
              return driverDoc;
            }
          }
          const driverByEmployeeNumber = await driverModel
            .findOne({
              "DriverData.employeeNumber": driverId,
              companyId: companyId,
            })
            .lean();

          if (driverByEmployeeNumber) {
            return driverByEmployeeNumber;
          }
          return null;
        };

        for (const driverId of newlyAssigned) {
          try {
            const driverDoc = await findDriverById(driverId);

            if (!driverDoc) {
              driverEmailResults.emailsSent.push({
                type: "assigned",
                driverId,
                status: "failed",
                error: "Driver not found",
              });
              continue;
            }

            const driverEmail = driverDoc.DriverData?.email;
            if (!driverEmail) {
              driverEmailResults.emailsSent.push({
                type: "assigned",
                driverId,
                status: "failed",
                error: "No email address",
              });
              continue;
            }
            const assignmentHtml = driverAssignmentEmailTemplate({
              booking: updatedBooking,
              driver: driverDoc,
              vehicle: driverDoc.VehicleData || {},
              company,
              assignmentType: "assigned",
              options: {
                supportEmail: company?.email,
                supportPhone: company?.contact,
                companyName: company?.companyName || company?.tradingName,
                logoUrl: company?.profileImage,
                address: company?.address,
              },
            });

            await sendEmail(
              driverEmail,
              `New Job Assignment - Booking #${updatedBooking.bookingId}`,
              { html: assignmentHtml }
            );

            driverEmailResults.emailsSent.push({
              type: "assigned",
              driverId,
              email: driverEmail,
              driverName: `${driverDoc.DriverData?.firstName || ""} ${
                driverDoc.DriverData?.surName || ""
              }`.trim(),
              status: "sent",
            });
          } catch (emailError) {
            console.error(
              `Failed to send assignment email to driver ${driverId}:`,
              emailError.message
            );
            driverEmailResults.emailsSent.push({
              type: "assigned",
              driverId,
              status: "failed",
              error: emailError.message,
            });
          }
        }

        // ===== Send Unassignment Notifications =====
        for (const driverId of unassigned) {
          try {
            const driverDoc = await findDriverById(driverId);
            if (!driverDoc) continue;

            const employeeNumber = driverDoc?.DriverData?.employeeNumber;
            if (!employeeNumber) {
              continue;
            }

            const notificationPayload = {
              employeeNumber,
              bookingId: updatedBooking.bookingId,
              status: "Unassigned",
              primaryJourney: {
                pickup:
                  updatedBooking?.primaryJourney?.pickup ||
                  updatedBooking?.returnJourney?.pickup,
                dropoff:
                  updatedBooking?.primaryJourney?.dropoff ||
                  updatedBooking?.returnJourney?.dropoff,
              },
              bookingSentAt: new Date(),
              createdBy: req.user?._id || null,
              companyId,
            };

            await Notification.create(notificationPayload);
          } catch (err) {
            console.error(
              `Failed to send unassignment notification for driver ${driverId}:`,
              err.message
            );
          }
        }

        // Log final summary
        const sentEmails = driverEmailResults.emailsSent.filter(
          (e) => e.status === "sent"
        );
        const failedEmails = driverEmailResults.emailsSent.filter(
          (e) => e.status === "failed"
        );
      } catch (driverEmailError) {
        console.error("Driver email process failed:", driverEmailError.message);
        console.error("Full error:", driverEmailError);
      }
    }
    try {
      const [clientAdminUser, companyDoc] = await Promise.all([
        User.findOne({
          companyId: updatedBooking.companyId,
          role: "clientadmin",
        })
          .select("name email contact phone profileImage")
          .lean()
          .catch(() => null),
        Company.findById(updatedBooking.companyId)
          .select(
            "companyName tradingName email contact profileImage address website"
          )
          .lean()
          .catch(() => null),
      ]);

      const confirmationHtml = customerBookingConfirmation({
        booking: updatedBooking,
        company: companyDoc || {},
        clientAdmin: clientAdminUser || {},
        options: {
          supportEmail: clientAdminUser?.email || companyDoc?.email,
          supportPhone:
            clientAdminUser?.contact ||
            clientAdminUser?.phone ||
            companyDoc?.contact,
          website: companyDoc?.website,
          address: companyDoc?.address,
        },
      });

      const targetPassengerEmail = updatedBooking?.passenger?.email?.trim();
      if (targetPassengerEmail) {
        const allow = await shouldSendCustomerEmail(
          updatedBooking.companyId,
          targetPassengerEmail
        );
        if (allow) {
          await sendEmail(
            targetPassengerEmail,
            `Booking Updated #${updatedBooking.bookingId}`,
            { html: confirmationHtml }
          );
        }
      }
    } catch (e) {
      console.error("Error sending updated passenger confirmation:", e.message);
    }
    try {
      const io = req.app.get("io");
      const currentUser = req.user;
      const currRole = currentUser?.role;
      const bookingId = updatedBooking.bookingId;
      const driversWereChanged = bookingData.hasOwnProperty("drivers");
      if (currRole === "clientadmin") {
        if (updatedBooking?.passenger?.email) {
          const customerUser = await User.findOne({
            companyId: updatedBooking.companyId,
            role: "customer",
            email: updatedBooking.passenger.email,
          }).lean();

          if (customerUser?._id) {
            const notif = await Notification.create({
              employeeNumber: String(customerUser._id),
              bookingId,
              status: "Updated",
              primaryJourney: {
                pickup:
                  updatedBooking?.primaryJourney?.pickup ||
                  updatedBooking?.returnJourney?.pickup,
                dropoff:
                  updatedBooking?.primaryJourney?.dropoff ||
                  updatedBooking?.returnJourney?.dropoff,
              },
              bookingSentAt: new Date(),
              createdBy: currentUser?._id,
              companyId: updatedBooking.companyId,
            });

            io.to(`emp:${customerUser._id}`).emit("notification:new", notif);
          }
        }
        if (
          Array.isArray(updatedBooking.drivers) &&
          updatedBooking.drivers.length > 0
        ) {
          for (const drv of updatedBooking.drivers) {
            const drvUserId =
              typeof drv === "object" ? drv.userId || drv._id : drv;
            if (!drvUserId) continue;

            const driverUser = await User.findOne({
              _id: drvUserId,
              companyId: updatedBooking.companyId,
              role: "driver",
            }).lean();

            if (driverUser?._id) {
              if (String(driverUser._id) === String(currentUser._id)) {
              } else {
                const notif = await Notification.create({
                  employeeNumber: String(driverUser._id),
                  bookingId,
                  status: "Updated",
                  primaryJourney: {
                    pickup:
                      updatedBooking?.primaryJourney?.pickup ||
                      updatedBooking?.returnJourney?.pickup,
                    dropoff:
                      updatedBooking?.primaryJourney?.dropoff ||
                      updatedBooking?.returnJourney?.dropoff,
                  },
                  bookingSentAt: new Date(),
                  createdBy: currentUser?._id,
                  companyId: updatedBooking.companyId,
                });

                io.to(`emp:${driverUser._id}`).emit("notification:new", notif);
              }
            }
          }
        }
      } else if (currRole === "customer") {
        // Notify ClientAdmin (but not if current user is the clientAdmin)
        const clientAdmin = await User.findOne({
          companyId: updatedBooking.companyId,
          role: "clientadmin",
        }).lean();

        if (clientAdmin?._id) {
          // Skip if the clientAdmin is the current user updating the booking
          const notif = await Notification.create({
            employeeNumber: String(clientAdmin._id),
            bookingId,
            status: "Updated",
            primaryJourney: {
              pickup:
                updatedBooking?.primaryJourney?.pickup ||
                updatedBooking?.returnJourney?.pickup,
              dropoff:
                updatedBooking?.primaryJourney?.dropoff ||
                updatedBooking?.returnJourney?.dropoff,
            },
            bookingSentAt: new Date(),
            createdBy: currentUser?._id,
            companyId: updatedBooking.companyId,
          });

          io.to(`emp:${clientAdmin._id}`).emit("notification:new", notif);
        }
        if (
          Array.isArray(updatedBooking.drivers) &&
          updatedBooking.drivers.length > 0
        ) {
          for (const drv of updatedBooking.drivers) {
            const drvUserId =
              typeof drv === "object" ? drv.userId || drv._id : drv;
            if (!drvUserId) continue;

            const driverUser = await User.findOne({
              _id: drvUserId,
              companyId: updatedBooking.companyId,
              role: "driver",
            }).lean();

            if (driverUser?._id) {
              // Skip if the driver is the current user updating the booking
              if (String(driverUser._id) === String(currentUser._id)) {
              } else {
                const notif = await Notification.create({
                  employeeNumber: String(driverUser._id),
                  bookingId,
                  status: "Updated",
                  primaryJourney: {
                    pickup:
                      updatedBooking?.primaryJourney?.pickup ||
                      updatedBooking?.returnJourney?.pickup,
                    dropoff:
                      updatedBooking?.primaryJourney?.dropoff ||
                      updatedBooking?.returnJourney?.dropoff,
                  },
                  bookingSentAt: new Date(),
                  createdBy: currentUser?._id,
                  companyId: updatedBooking.companyId,
                });

                io.to(`emp:${driverUser._id}`).emit("notification:new", notif);
              }
            }
          }
        }
      } else {
        if (updatedBooking?.passenger?.email) {
          const customerUser = await User.findOne({
            companyId: updatedBooking.companyId,
            role: "customer",
            email: updatedBooking.passenger.email,
          }).lean();

          if (customerUser?._id) {
            if (String(customerUser._id) === String(currentUser._id)) {
            } else {
              const notif = await Notification.create({
                employeeNumber: String(customerUser._id),
                bookingId,
                status: "Updated",
                primaryJourney: {
                  pickup:
                    updatedBooking?.primaryJourney?.pickup ||
                    updatedBooking?.returnJourney?.pickup,
                  dropoff:
                    updatedBooking?.primaryJourney?.dropoff ||
                    updatedBooking?.returnJourney?.dropoff,
                },
                bookingSentAt: new Date(),
                createdBy: currentUser?._id,
                companyId: updatedBooking.companyId,
              });

              io.to(`emp:${customerUser._id}`).emit("notification:new", notif);
            }
          }
        }

        // Notify ClientAdmin (but not if current user is the clientAdmin)
        const clientAdmin = await User.findOne({
          companyId: updatedBooking.companyId,
          role: "clientadmin",
        }).lean();

        if (clientAdmin?._id) {
          const notif = await Notification.create({
            employeeNumber: String(clientAdmin._id),
            bookingId,
            status: "Updated",
            primaryJourney: {
              pickup:
                updatedBooking?.primaryJourney?.pickup ||
                updatedBooking?.returnJourney?.pickup,
              dropoff:
                updatedBooking?.primaryJourney?.dropoff ||
                updatedBooking?.returnJourney?.dropoff,
            },
            bookingSentAt: new Date(),
            createdBy: currentUser?._id,
            companyId: updatedBooking.companyId,
          });

          io.to(`emp:${clientAdmin._id}`).emit("notification:new", notif);
        }
      }
    } catch (notifyErr) {
      console.error(
        "Error sending socket notifications on booking update:",
        notifyErr.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
      driverChanges: {
        assigned: driverEmailResults.assigned.length,
        unassigned: driverEmailResults.unassigned.length,
        emailsSent: driverEmailResults.emailsSent.filter(
          (e) => e.type === "assigned" || e.type === "unassigned"
        ), // only driver-related emails
      },
    });
  } catch (error) {
    console.error("Error in updateBooking:", error);
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

    if (currentUser?.role === "clientadmin") {
      const s = (status || "").trim().toLowerCase();
      const operationalStatuses = [
        "completed",
        "at location",
        "ride started",
        "no show",
        "on route",
        "late cancel",
      ];

      if (s === "new" || s === "accepted") {
        const driverAcceptedEver = (booking.statusAudit || []).some((e) => {
          const updatedBy = (e?.updatedBy || "").toLowerCase();
          return (
            (e?.status || "").toLowerCase() === "accepted" &&
            (updatedBy.startsWith("driver") ||
              updatedBy.startsWith("clientadmin"))
          );
        });
        if (driverAcceptedEver) {
          return res.status(403).json({
            message:
              "This job has already been accepted. You cannot set status to 'New' or 'Accepted'.",
          });
        }
      }
      if (operationalStatuses.includes(s)) {
        const wasAccepted = (booking.statusAudit || []).some((e) => {
          return (e?.status || "").toLowerCase() === "accepted";
        });

        if (!wasAccepted) {
          return res.status(403).json({
            message: "Booking must be set accepted before updating the status.",
          });
        }
      }
      const current = String(booking?.status || "")
        .trim()
        .toLowerCase();
      if (current === "completed" && s === "cancelled") {
        return res.status(403).json({
          message: "Cannot cancel a booking that is Completed.",
        });
      }
    }

    booking.status = status === "Late Cancel" ? "Late Cancel" : status;

    if (Array.isArray(driverIds)) {
      const fullDriverDocs = await driverModel
        .find({ _id: { $in: driverIds } })
        .lean();
      booking.drivers = fullDriverDocs;
    }

    const fullName =
      currentUser?.fullName || currentUser?.name || "Unknown User";
    const updater = `${currentUser?.role || "user"} | ${fullName}`;
    booking.statusAudit = [
      ...(booking.statusAudit || []),
      { updatedBy: updater, status, date: new Date() },
    ];

    const updatedBooking = await booking.save();

    const normalizedStatus = (status || "").trim();
    const shouldSendDriverEmail = ["On Route", "At Location"].includes(
      normalizedStatus
    );

    if (shouldSendDriverEmail && booking?.passenger?.email) {
      try {
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
            driverInfo = {
              ...(assignedDriver.DriverData || {}),
              driverPicture:
                assignedDriver?.UploadedData?.driverPicture || null,
            };

            vehicleInfo = {
              ...(assignedDriver.VehicleData || {}),
              vehiclePicture: assignedDriver?.UploadedData?.carPicture || null,
            };
          } else {
            // Fallback from inline driver data on booking (if present)
            if (
              firstDriver.name ||
              firstDriver.contact ||
              firstDriver.employeeNumber
            ) {
              driverInfo = {
                firstName: firstDriver.name?.split(" ")[0] || "Driver ",
                surName:
                  firstDriver.name?.split(" ").slice(1).join(" ") || "Details",
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

        // Only send if emailPreference = true
        const allow = await shouldSendCustomerEmail(
          booking.companyId,
          booking.passenger.email
        );
        if (allow) {
          await sendEmail(
            booking.passenger.email.trim(),
            `Driver Update - ${normalizedStatus} | Booking #${booking.bookingId}`,
            { html }
          );
        }
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
        const allow = await shouldSendCustomerEmail(
          booking.companyId,
          booking.passenger.email
        );
        if (allow) {
          if (!booking.reviewEmailScheduledAt && !booking.reviewEmailSent) {
            booking.reviewEmailScheduledAt = new Date();
            await booking.save();
            await autoSendReviewEmail(booking);
          }
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

    // When DRIVER changed status, notify clientadmin (+ optional customer portal user)
    try {
      if (
        isStatusChanged &&
        (currentUser?.role === "driver" || currentUser?.role === "clientadmin")
      ) {
        const clientAdmin = await User.findOne({
          companyId: booking.companyId,
          role: "clientadmin",
        }).lean();
        const adminKey = String(clientAdmin?._id || "");
        const isSelf =
          currentUser?.role === "clientadmin" &&
          String(currentUser?._id) === String(clientAdmin?._id);

        if (adminKey && !isSelf) {
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
        if (isStatusChanged && currentUser?.role === "clientadmin") {
          if (Array.isArray(booking.drivers) && booking.drivers.length > 0) {
            for (const drv of booking.drivers) {
              const drvUserId =
                typeof drv === "object" ? drv.userId || drv._id : drv;
              if (!drvUserId) {
                console.warn("No drvUserId found, skipping this driver");
                continue;
              }
              const driverUser = await User.findOne({
                _id: drvUserId,
                companyId: booking.companyId,
                role: "driver",
              }).lean();
              if (!driverUser) continue;
              try {
                const driverNotif = await Notification.create({
                  employeeNumber: String(driverUser.employeeNumber),
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
                io.to(`emp:${driverUser._id}`).emit(
                  "notification:new",
                  driverNotif
                );
              } catch (e) {
                console.error("Driver notify failed:", e?.message || e);
              }
            }
          } else {
            console.warn("booking.drivers is empty or not an array");
          }
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

export const sendBookingEmail = async (req, res) => {
  const { bookingId, email, type = "confirmation" } = req.body;

  if (!bookingId || !email) {
    return res
      .status(400)
      .json({ message: "Booking ID and email are required." });
  }

  try {
    const booking = await Booking.findById(bookingId)
      .populate("vehicle passenger")
      .lean();
    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    const company = await Company.findById(booking.companyId).lean();
    const clientAdmin = await User.findOne({
      companyId: booking.companyId,
      role: "clientadmin",
    }).lean();

    let subject, html;

    if (type === "cancellation") {
      subject = `Booking Cancellation #${booking.bookingId} - ${
        company?.companyName || "Our Company"
      }`;
      html = customerCancellationEmailTemplate({
        booking,
        company,
        clientAdmin,
        cancelledBy: req.user?.fullName || "Admin",
        cancellationReason: null,
        options: {
          supportEmail: clientAdmin?.email || company?.email,
          supportPhone: clientAdmin?.phone || company?.contact,
          logoUrl: company?.profileImage,
        },
      });
    } else {
      subject = `Booking Confirmation #${booking.bookingId} - ${
        company?.companyName || "Our Company"
      }`;
      html = `
        <h2>Booking Confirmation</h2>
        <p>Dear ${booking.passenger?.name || "Customer"},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
          <li><b>Booking ID:</b> ${booking.bookingId}</li>
          <li><b>Vehicle:</b> ${booking.vehicle?.vehicleName || "N/A"}</li>
          <li><b>Pick Up:</b> ${booking.primaryJourney?.pickup || "-"}</li>
          <li><b>Drop Off:</b> ${booking.primaryJourney?.dropoff || "-"}</li>
          <li><b>Date:</b> ${booking.primaryJourney?.date || "-"}</li>
        </ul>
        <p>Thank you for booking with ${
          company?.companyName || "our company"
        }.</p>
      `;
    }

    // FIXED: ensure sendEmail gets { html }
    if (email) {
      const allow = await shouldSendCustomerEmail(booking.companyId, email);
      if (allow) {
        if (email) {
          const allow = await shouldSendCustomerEmail(booking.companyId, email);
          if (allow) {
            await sendEmail(email, subject, { html });
            res
              .status(200)
              .json({ message: `${type} email sent successfully.` });
          } else {
            return res
              .status(200)
              .json({ message: "Skipped: customer emailPreference = false" });
          }
        }
      } else {
        return res
          .status(200)
          .json({ message: "Skipped: customer emailPreference = false" });
      }
    }
  } catch (err) {
    console.error("Error sending booking email:", err);
    res.status(500).json({ message: "Failed to send booking email." });
  }
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
      const lastNonDeletedEntry = (booking?.statusAudit || [])
        .slice()
        .reverse()
        .find((e) => {
          const status = (e?.status || "").trim().toLowerCase();
          return status !== "deleted";
        });

      booking.status = lastNonDeletedEntry?.status || "New";
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
    console.error("restoreOrDeleteBooking error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
