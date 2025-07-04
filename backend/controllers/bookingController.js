import Booking from "../models/Booking.js";
import sendEmail from "../utils/sendEmail.js";
import DriverProfile from "../models/Driver.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Voucher from "../models/pricings/Voucher.js";

// Create Booking (standard route)
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
    } = req.body;

    if (
      !companyId ||
      typeof companyId !== "string" ||
      companyId.length !== 24
    ) {
      console.log("❌ Invalid companyId:", companyId);

      return res.status(400).json({ message: "Invalid or missing companyId" });
    }



    let validVoucher = null;
    let isVoucherApplied = false;

    if (voucher && voucherApplied) {
      const v = await Voucher.findOne({
        voucher: voucher.toUpperCase(),
        companyId: new mongoose.Types.ObjectId(companyId),
      });
      const today = new Date();
      const isExpired = !v || new Date(v.validity) < today;
      const hasReachedLimit = !v || v.used >= v.quantity;
      const isInactive = !v || v.status === "Deleted" || v.status === "Expired";

      if (!v || isExpired || hasReachedLimit || isInactive) {
        console.warn(`Voucher "${voucher}" is invalid or expired. Skipping.`);
      } else {
        validVoucher = v.voucher;
        isVoucherApplied = true;

        await Voucher.findByIdAndUpdate(v._id, {
          $inc: { used: 1 },
        });
      }
    }

    if (!vehicle.vehicleName || typeof vehicle.vehicleName !== "string") {
      return res.status(400).json({ message: "Vehicle name is required" });
    }

    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const field of requiredFields) {
      if (
        !primaryJourney[field] ||
        String(primaryJourney[field]).trim() === ""
      ) {
        return res.status(400).json({
          message: `Missing required field in primaryJourney: ${field}`,
        });
      }
    }

    const extractDynamicDropoffFields = (journey) => {
      const dynamicFields = {};
      Object.keys(journey || {}).forEach((key) => {
        if (
          key.startsWith("dropoff_terminal_") ||
          key.startsWith("dropoffDoorNumber")
        ) {
          dynamicFields[key] = journey[key];
        }
      });
      return dynamicFields;
    };
    const generateNextBookingId = async () => {
      const lastBooking = await Booking.findOne({})
        .sort({ bookingId: -1 })
        .limit(1);

      if (lastBooking && lastBooking.bookingId) {
        const lastId = parseInt(lastBooking.bookingId, 10);
        return (lastId + 1).toString();
      } else {
        return "50301";
      }
    };
    // Booking 1 (primary)
    const PrimaryBooking = {
      mode,
      companyId,
      returnJourneyToggle,
      referrer: referrer || "Manual Entry",
      source: "admin",
      status: "New",
      vehicle: {
        vehicleName: vehicle.vehicleName,
        passenger: parseInt(vehicle.passenger) || 0,
        childSeat: parseInt(vehicle.childSeat) || 0,
        handLuggage: parseInt(vehicle.handLuggage) || 0,
        checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
      },
      passenger: {
        name: passenger.name || null,
        email: passenger.email || null,
        phone: passenger.phone || null,
      },
      primaryJourney: {
        pickup: primaryJourney.pickup.trim(),
        dropoff: primaryJourney.dropoff.trim(),
        additionalDropoff1: primaryJourney.additionalDropoff1 || null,
        additionalDropoff2: primaryJourney.additionalDropoff2 || null,

        pickupDoorNumber: primaryJourney.pickupDoorNumber || null,
        terminal: primaryJourney.terminal || null,

        arrivefrom: primaryJourney.arrivefrom || null,
        flightNumber: primaryJourney.flightNumber || null,
        pickmeAfter: primaryJourney.pickmeAfter || null,

        notes: primaryJourney.notes || null,
        internalNotes: primaryJourney.internalNotes || null,

        date: primaryJourney.date,
        hour: parseInt(primaryJourney.hour),
        minute: parseInt(primaryJourney.minute),
        fare: primaryJourney.fare,
        hourlyOption: primaryJourney.hourlyOption || null,

        distanceText: primaryJourney.distanceText || null,
        durationText: primaryJourney.durationText || null,

        voucher: validVoucher,
        voucherApplied: isVoucherApplied,

        ...extractDynamicDropoffFields(primaryJourney),
      },
    };
    const nextBookingId = await generateNextBookingId();
    PrimaryBooking.bookingId = nextBookingId;
    const savedPrimaryBooking = await Booking.create(PrimaryBooking);

    // Prepare email data
    const sanitize = (booking) => {
      const { _id, __v, createdAt, companyId, updatedAt, ...clean } =
        booking.toObject();
      return clean;
    };
    if (!returnJourneyToggle || !Object.keys(returnJourney).length) {
      // Send email for only primary booking
      if (PassengerEmail || ClientAdminEmail) {
        const primaryEmailPayload = {
          title: "Booking Confirmation - Primary Booking",
          data: {
            PrimaryBooking: sanitize(savedPrimaryBooking),
          },
        };

        if (PassengerEmail)
          await sendEmail(
            PassengerEmail,
            "Your Booking Details (Primary)",
            primaryEmailPayload
          );
        if (ClientAdminEmail)
          await sendEmail(
            ClientAdminEmail,
            "Your Booking Details (Primary)",
            primaryEmailPayload
          );
      }

      return res.status(201).json({
        success: true,
        message: "Primary journey booked successfully",
        bookings: [sanitize(savedPrimaryBooking)],
      });
    }

    // Booking 2 (return journey)
    if (
      returnJourneyToggle &&
      returnJourney &&
      Object.keys(returnJourney).length
    ) {
      const ReturnBooking = {
        mode,
        companyId,

        returnJourneyToggle,
        referrer: referrer || "Manual Entry",
        source: "admin",
        status: "New",
        vehicle: {
          vehicleName: vehicle.vehicleName,
          passenger: parseInt(vehicle.passenger) || 0,
          childSeat: parseInt(vehicle.childSeat) || 0,
          handLuggage: parseInt(vehicle.handLuggage) || 0,
          checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
        },
        passenger: {
          name: passenger.name || null,
          email: passenger.email || null,
          phone: passenger.phone || null,
        },
        returnJourney: {
          pickup: returnJourney.pickup?.trim() || "",
          dropoff: returnJourney.dropoff?.trim() || "",
          additionalDropoff1: returnJourney.additionalDropoff1 || null,
          additionalDropoff2: returnJourney.additionalDropoff2 || null,

          pickupDoorNumber: returnJourney.pickupDoorNumber || null,
          terminal: returnJourney.terminal || null,

          arrivefrom: returnJourney.arrivefrom || null,
          flightNumber: returnJourney.flightNumber || null,
          pickmeAfter: returnJourney.pickmeAfter || null,

          notes: returnJourney.notes || null,
          internalNotes: returnJourney.internalNotes || null,

          date: returnJourney.date,
          hour: parseInt(returnJourney.hour),
          minute: parseInt(returnJourney.minute),
          fare: returnJourney.fare,
          hourlyOption: returnJourney.hourlyOption || null,

          distanceText: returnJourney.distanceText || null,
          durationText: returnJourney.durationText || null,

          ...extractDynamicDropoffFields(returnJourney),
        },
      };
      const returnBookingId = await generateNextBookingId();
      ReturnBooking.bookingId = returnBookingId;
      const savedReturnBooking = await Booking.create(ReturnBooking);

      // Add to email payload manually
      // Send emails separately
      if (PassengerEmail || ClientAdminEmail) {
        // Primary Journey Email
        const primaryEmailPayload = {
          title: "Booking Confirmation - Primary Journey",
          data: {
            PrimaryBooking: sanitize(savedPrimaryBooking),
          },
        };

        if (PassengerEmail)
          await sendEmail(
            PassengerEmail,
            "Your Booking Details (Primary)",
            primaryEmailPayload
          );
        if (ClientAdminEmail)
          await sendEmail(
            ClientAdminEmail,
            "Your Booking Details (Primary)",
            primaryEmailPayload
          );

        // Return Journey Email
        const returnEmailPayload = {
          title: "Booking Confirmation - Return Journey",
          data: {
            ReturnBooking: sanitize(savedReturnBooking),
          },
        };

        if (PassengerEmail)
          await sendEmail(
            PassengerEmail,
            "Your Booking Details (Return)",
            returnEmailPayload
          );
        if (ClientAdminEmail)
          await sendEmail(
            ClientAdminEmail,
            "Your Booking Details (Return)",
            returnEmailPayload
          );
      }

      return res.status(201).json({
        success: true,
        message: "Both journeys booked separately",
        bookings: [sanitize(savedPrimaryBooking), sanitize(savedReturnBooking)],
      });
    }
  } catch (error) {
    console.error("Error in createBooking controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
    const updatedData = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Optional: Validate required fields in primaryJourney
    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const field of requiredFields) {
      if (!updatedData?.primaryJourney?.[field]) {
        return res.status(400).json({
          message: `Missing required field in primaryJourney: ${field}`,
        });
      }
    }

    // Sanitize or validate dynamic dropoff fields if needed
    const cleanDynamicFields = (journey = {}) => {
      const dynamicFields = {};
      Object.keys(journey).forEach((key) => {
        if (
          key.startsWith("dropoffDoorNumber") ||
          key.startsWith("dropoff_terminal_")
        ) {
          dynamicFields[key] = journey[key];
        }
      });
      return dynamicFields;
    };

    if (updatedData.primaryJourney) {
      updatedData.primaryJourney = {
        ...updatedData.primaryJourney,
        ...cleanDynamicFields(updatedData.primaryJourney),
      };
    }
    if (updatedData.returnJourney) {
      updatedData.returnJourney = {
        ...updatedData.returnJourney,
        ...cleanDynamicFields(updatedData.returnJourney),
      };
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        ...updatedData,
        ...(updatedData.driverIds && { drivers: updatedData.driverIds }),
      },
      { new: true }
    ).populate("drivers");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error in updateBooking:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete Booking by ID
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

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

// Widget Form Submission
export const submitWidgetForm = async (req, res) => {
  try {
    const {
      companyId,
      referrer,
      mode = "Transfer",
      returnJourneyToggle = false,
      vehicle,
      primaryJourney,
      returnJourney,
    } = req.body;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    if (!vehicle?.vehicleName) {
      return res.status(400).json({ message: "Vehicle name is required" });
    }

    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const field of requiredFields) {
      if (!primaryJourney?.[field]) {
        return res.status(400).json({
          message: `Missing required field in primaryJourney: ${field}`,
        });
      }
    }

    const dynamicDropoffFields1 = {};
    Object.keys(primaryJourney || {}).forEach((key) => {
      if (
        key.startsWith("dropoff_terminal_") ||
        key.startsWith("dropoffDoorNumber")
      ) {
        dynamicDropoffFields1[key] = primaryJourney[key];
      }
    });

    // Collect dynamic fields for return journey
    const dynamicDropoffFields2 = {};
    if (returnJourneyToggle && returnJourney) {
      Object.keys(returnJourney || {}).forEach((key) => {
        if (
          key.startsWith("dropoff_terminal_") ||
          key.startsWith("dropoffDoorNumber")
        ) {
          dynamicDropoffFields2[key] = returnJourney[key];
        }
      });
    }

    const bookingData = {
      mode,
      returnJourneyToggle,
      companyId,
      referrer: referrer || "Direct",
      source: "widget",
      status: "New",
      vehicle: {
        vehicleName: vehicle.vehicleName,
        passenger: vehicle.passenger || 0,
        childSeat: vehicle.childSeat || 0,
        handLuggage: vehicle.handLuggage || 0,
        checkinLuggage: vehicle.checkinLuggage || 0,
      },
      primaryJourney: {
        pickup: primaryJourney.pickup,
        dropoff: primaryJourney.dropoff,
        additionalDropoff1: primaryJourney.additionalDropoff1 || null,
        additionalDropoff2: primaryJourney.additionalDropoff2 || null,
        pickupDoorNumber: primaryJourney.pickupDoorNumber || null,
        terminal: primaryJourney.terminal || null,
        arrivefrom: primaryJourney.arrivefrom || null,
        flightNumber: primaryJourney.flightNumber || null,
        pickmeAfter: primaryJourney.pickmeAfter || null,
        notes: primaryJourney.notes || null,
        internalNotes: primaryJourney.internalNotes || null,
        date: primaryJourney.date,
        hour: parseInt(primaryJourney.hour),
        minute: parseInt(primaryJourney.minute),
        fare: primaryJourney.fare,
        hourlyOption: primaryJourney.hourlyOption || null,
        distanceText: primaryJourney.distanceText || null,
        durationText: primaryJourney.durationText || null,
        ...dynamicDropoffFields1,
      },
      ...(returnJourneyToggle &&
        returnJourney && {
          returnJourney: {
            pickup: returnJourney.pickup,
            dropoff: returnJourney.dropoff,
            additionalDropoff1: returnJourney.additionalDropoff1 || null,
            additionalDropoff2: returnJourney.additionalDropoff2 || null,
            pickupDoorNumber: returnJourney.pickupDoorNumber || null,
            terminal: returnJourney.terminal || null,
            arrivefrom: returnJourney.arrivefrom || null,
            flightNumber: returnJourney.flightNumber || null,
            pickmeAfter: returnJourney.pickmeAfter || null,
            notes: returnJourney.notes || null,
            internalNotes: returnJourney.internalNotes || null,
            date: returnJourney.date,
            hour: parseInt(returnJourney.hour),
            minute: parseInt(returnJourney.minute),
            fare: returnJourney.fare,
            hourlyOption: returnJourney.hourlyOption || null,
            distanceText: returnJourney.distanceText || null,
            durationText: returnJourney.durationText || null,
            ...dynamicDropoffFields2,
          },
        }),
    };

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully via widget",
      booking,
    });
  } catch (error) {
    console.error("Error in submitWidgetForm:", error);
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

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (Array.isArray(driverIds)) {
      const fullDriverDocs = await DriverProfile.find({
        _id: { $in: driverIds },
      }).lean();
      booking.drivers = fullDriverDocs;
    }

    booking.status = status;
    booking.statusAudit = [
      ...(booking.statusAudit || []),
      {
        updatedBy: updatedBy || "Unknown",
        status,
        date: new Date(),
      },
    ];

    const updatedBooking = await booking.save();

    // ✅ Driver updated the status
    if (currentUser?.role === "driver" && status) {
      const driverProfile = await DriverProfile.findOne({
        "DriverData.employeeNumber": currentUser.employeeNumber,
        companyId: currentUser.companyId,
      }).lean();

      if (driverProfile) {
        const clientAdmin = await User.findOne({
          companyId: currentUser.companyId,
          role: "clientadmin",
        }).lean();

        const statusStyled = `<span style="color: green;">${status}</span>`;
        const driverName = `"${driverProfile?.DriverData?.firstName || ""} ${
          driverProfile?.DriverData?.surName || ""
        }"`.trim();
        const bookingId = booking.bookingId;

        const title = `Driver ${driverName} changed the status to ${statusStyled} for booking #${bookingId}`;
        const subtitle = `Booking status changed by driver ${driverName} to ${statusStyled}`;
        const data = {
          BookingId: bookingId,
          Status: status,
          DriverName: driverName,
        };

        if (clientAdmin?.email) {
          await sendEmail(clientAdmin.email, "Booking Status Updated", {
            title,
            subtitle,
            data,
          });
        }

        if (booking?.passenger?.email) {
          await sendEmail(
            booking.passenger.email,
            "Your Ride Status Has Been Updated",
            {
              title: `Your Ride Status Has Been Updated by Driver ${driverName}`,
              subtitle,
              data,
            }
          );
        }
      }
    }

    // ✅ Client Admin updated the status
    if (currentUser?.role === "clientadmin" && status) {
      const bookingId = booking.bookingId;
      const statusStyled = `<span style="color: green;">${status}</span>`;

      const firstDriverId = booking.drivers?.[0]?._id || booking.drivers?.[0];
      const assignedDriverProfile = mongoose.Types.ObjectId.isValid(
        firstDriverId
      )
        ? await DriverProfile.findById(firstDriverId).lean()
        : null;

      const driverName = assignedDriverProfile
        ? `"${assignedDriverProfile.DriverData.firstName || ""} ${
            assignedDriverProfile.DriverData.surName || ""
          }"`.trim()
        : `"Assigned Driver"`;

      const driverEmail = assignedDriverProfile?.DriverData?.email;

      const data = {
        BookingId: bookingId,
        Status: status,
        DriverName: driverName,
      };

      // ✅ Log for debugging
      console.log("Passenger email:", booking?.passenger?.email);
      console.log("Driver email:", driverEmail);

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
