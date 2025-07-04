import Booking from "../models/Booking.js";
import sendEmail from "../utils/sendEmail.js";
import DriverProfile from "../models/Driver.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Voucher from "../models/pricings/Voucher.js";

export const createBooking = async (req, res) => {
  try {
    const {
      mode = "Transfer",
      companyId,
      referrer,
      vehicle = {},
      passenger = {},
      journeyDetails = [],
      PassengerEmail,
      ClientAdminEmail,
      voucher,
      voucherApplied,
    } = req.body;

    if (!companyId || typeof companyId !== "string" || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    if (!Array.isArray(journeyDetails) || journeyDetails.length === 0) {
      return res.status(400).json({ message: "At least one journey is required" });
    }

    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const journey of journeyDetails) {
      for (const field of requiredFields) {
        if (!journey[field] || String(journey[field]).trim() === "") {
          return res.status(400).json({ message: `Missing field ${field} in journey` });
        }
      }
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
        console.warn(`Voucher \"${voucher}\" is invalid or expired.`);
      } else {
        validVoucher = v.voucher;
        isVoucherApplied = true;
        await Voucher.findByIdAndUpdate(v._id, { $inc: { used: 1 } });
      }
    }

    const generateNextBookingId = async () => {
      const lastBooking = await Booking.findOne({})
        .sort({ bookingId: -1 })
        .limit(1);
      return lastBooking?.bookingId ? (parseInt(lastBooking.bookingId, 10) + 1).toString() : "50301";
    };

    const bookingData = {
      mode,
      companyId,
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
      journeyDetails: journeyDetails.map(j => ({
        ...j,
        fare: j.fare || null,
        voucher: validVoucher,
        voucherApplied: isVoucherApplied,
        hour: parseInt(j.hour),
        minute: parseInt(j.minute),
        date: new Date(j.date),
      })),
    };

    bookingData.bookingId = await generateNextBookingId();
    const savedBooking = await Booking.create(bookingData);

    const sanitize = (booking) => {
      const { _id, __v, createdAt, updatedAt, companyId, ...rest } = booking.toObject();
      return rest;
    };

    if (PassengerEmail || ClientAdminEmail) {
      const emailPayload = {
        title: "Booking Confirmation",
        data: sanitize(savedBooking),
      };
      if (PassengerEmail) await sendEmail(PassengerEmail, "Your Booking Confirmation", emailPayload);
      if (ClientAdminEmail) await sendEmail(ClientAdminEmail, "Booking Confirmation", emailPayload);
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookings: [sanitize(savedBooking)],
    });
  } catch (err) {
    console.error("❌ Error in createBooking:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

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
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // ✅ Validate journeyDetails array
    if (!Array.isArray(updatedData.journeyDetails) || updatedData.journeyDetails.length === 0) {
      return res.status(400).json({
        message: "journeyDetails array is required with at least one entry.",
      });
    }

    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (let i = 0; i < updatedData.journeyDetails.length; i++) {
      const journey = updatedData.journeyDetails[i];
      for (const field of requiredFields) {
        if (!journey?.[field]) {
          return res.status(400).json({
            message: `Missing required field "${field}" in journeyDetails[${i}]`,
          });
        }
      }
    }

    // ✅ Clean dynamic fields
    const cleanDynamicFields = (journey = {}) => {
      const dynamicFields = {};
      Object.keys(journey).forEach((key) => {
        if (key.startsWith("dropoffDoorNumber") || key.startsWith("dropoff_terminal_")) {
          dynamicFields[key] = journey[key];
        }
      });
      return dynamicFields;
    };

    updatedData.journeyDetails = updatedData.journeyDetails.map((journey) => ({
      ...journey,
      ...cleanDynamicFields(journey),
    }));

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
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

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
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

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

    const bookingId = booking.bookingId;
    const statusStyled = `<span style="color: green;">${status}</span>`;
    let driverName = "Assigned Driver";
    let driverEmail = "";

    if (currentUser?.role === "driver") {
      const driverProfile = await DriverProfile.findOne({
        "DriverData.employeeNumber": currentUser.employeeNumber,
        companyId: currentUser.companyId,
      }).lean();

      if (driverProfile) {
        driverName = `"${driverProfile.DriverData.firstName} ${driverProfile.DriverData.surName}"`;
        const clientAdmin = await User.findOne({
          companyId: currentUser.companyId,
          role: "clientadmin",
        }).lean();

        if (clientAdmin?.email) {
          await sendEmail(clientAdmin.email, "Booking Status Updated", {
            title: `Driver ${driverName} changed the status to ${statusStyled} for booking #${bookingId}`,
            subtitle: `Booking status changed by driver ${driverName}`,
            data: { BookingId: bookingId, Status: status, DriverName: driverName },
          });
        }

        if (booking?.passenger?.email) {
          await sendEmail(
            booking.passenger.email,
            "Your Ride Status Has Been Updated",
            {
              title: `Your Ride Status Has Been Updated by ${driverName}`,
              subtitle: `Booking #${bookingId} status is now ${status}`,
              data: { BookingId: bookingId, Status: status, DriverName: driverName },
            }
          );
        }
      }
    }

    if (currentUser?.role === "clientadmin") {
      const firstDriver = booking.drivers?.[0];
      if (firstDriver) {
        const assignedDriver = await DriverProfile.findById(firstDriver?._id || firstDriver).lean();
        if (assignedDriver) {
          driverName = `"${assignedDriver.DriverData.firstName} ${assignedDriver.DriverData.surName}"`;
          driverEmail = assignedDriver.DriverData.email;
        }
      }

      const data = { BookingId: bookingId, Status: status, DriverName: driverName };

      if (booking?.passenger?.email) {
        await sendEmail(
          booking.passenger.email,
          "Ride Status Updated by Admin",
          {
            title: `Ride Status Updated for Booking #${bookingId}`,
            subtitle: `Status changed to ${statusStyled}`,
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
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

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

    const passengerMap = new Map();
    bookings.forEach((booking) => {
      const p = booking.passenger;
      if (p && (p.name || p.email || p.phone)) {
        const key = `${p.name}-${p.email}-${p.phone}`;
        if (!passengerMap.has(key)) {
          passengerMap.set(key, {
            name: p.name || "Unnamed",
            email: p.email || "",
            phone: p.phone || "",
            _id: p._id || key,
          });
        }
      }
    });

    res.status(200).json({ success: true, passengers: Array.from(passengerMap.values()) });
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
  const { bookingId, email } = req.body;

  if (!bookingId || !email) {
    return res.status(400).json({ message: "Booking ID and email are required." });
  }

  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Add miles to distanceText where necessary
    if (Array.isArray(booking.journeyDetails)) {
      booking.journeyDetails = booking.journeyDetails.map(journey => {
        if (journey?.distanceText?.includes("km")) {
          const km = parseFloat(journey.distanceText);
          if (!isNaN(km)) {
            const miles = (km * 0.621371).toFixed(2);
            journey.distanceText = `${km} km (${miles} miles)`;
          }
        }
        return journey;
      });
    }

    const { _id, createdAt, updatedAt, __v, statusAudit, ...cleanedBooking } = booking;

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

export const submitWidgetForm = async (req, res) => {
  try {
    const {
      companyId,
      referrer,
      mode = "Transfer",
      vehicle,
      journeyDetails = [],
    } = req.body;

    // Validate company ID
    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    // Validate vehicle
    if (!vehicle?.vehicleName) {
      return res.status(400).json({ message: "Vehicle name is required" });
    }

    // Validate journeys
    if (!Array.isArray(journeyDetails) || journeyDetails.length === 0) {
      return res.status(400).json({ message: "At least one journey is required." });
    }

    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (let i = 0; i < journeyDetails.length; i++) {
      const journey = journeyDetails[i];
      for (const field of requiredFields) {
        if (!journey?.[field]) {
          return res.status(400).json({
            message: `Missing required field "${field}" in journey ${i + 1}`,
          });
        }
      }
    }

    // Extract dropoff door numbers or terminal info from each journey
    const updatedJourneys = journeyDetails.map((journey) => {
      const dynamicDropoffFields = {};
      Object.keys(journey || {}).forEach((key) => {
        if (
          key.startsWith("dropoff_terminal_") ||
          key.startsWith("dropoffDoorNumber")
        ) {
          dynamicDropoffFields[key] = journey[key];
        }
      });

      return {
        ...journey,
        ...dynamicDropoffFields,
        hour: parseInt(journey.hour),
        minute: parseInt(journey.minute),
      };
    });

    const booking = await Booking.create({
      mode,
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
      journeyDetails: updatedJourneys,
    });

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully via widget",
      booking,
    });
  } catch (error) {
    console.error("Error in submitWidgetForm:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
