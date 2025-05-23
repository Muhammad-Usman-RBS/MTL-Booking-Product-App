import Booking from "../models/Booking.js";
import Company from "../models/Company.js";
import User from "../models/User.js";

// ✅ Create Booking (standard route)
// export const createBooking = async (req, res) => {
//   try {
//     const {
//       mode = "Transfer",
//       returnJourney = false,
//       companyId,
//       referrer,
//       vehicle = {},
//       journey1 = {},
//       journey2 = {}
//     } = req.body;

//     // Validate companyId
//     if (!companyId || typeof companyId !== "string" || companyId.length !== 24) {
//       return res.status(400).json({ message: "Invalid or missing companyId" });
//     }

//     // Validate vehicle
//     if (!vehicle.vehicleName || typeof vehicle.vehicleName !== "string") {
//       return res.status(400).json({ message: "Vehicle name is required" });
//     }

//     // Required journey1 fields
//     const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
//     for (const field of requiredFields) {
//       if (!journey1[field] || String(journey1[field]).trim() === "") {
//         return res.status(400).json({ message: `Missing required field in journey1: ${field}` });
//       }
//     }

//     // Extract dynamic dropoff fields from journey1
//     const dynamicDropoffFields1 = {};
//     Object.keys(journey1).forEach((key) => {
//       if (key.startsWith("dropoff_terminal_") || key.startsWith("dropoffDoorNumber")) {
//         dynamicDropoffFields1[key] = journey1[key];
//       }
//     });

//     // Extract dynamic dropoff fields from journey2
//     const dynamicDropoffFields2 = {};
//     if (returnJourney) {
//       Object.keys(journey2).forEach((key) => {
//         if (key.startsWith("dropoff_terminal_") || key.startsWith("dropoffDoorNumber")) {
//           dynamicDropoffFields2[key] = journey2[key];
//         }
//       });
//     }

//     const bookingData = {
//       mode,
//       returnJourney,
//       companyId,
//       referrer: referrer || "Manual Entry",
//       source: "admin",
//       status: "Pending",

//       vehicle: {
//         vehicleName: vehicle.vehicleName,
//         passenger: parseInt(vehicle.passenger) || 0,
//         childSeat: parseInt(vehicle.childSeat) || 0,
//         handLuggage: parseInt(vehicle.handLuggage) || 0,
//         checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
//       },

//       journey1: {
//         pickup: journey1.pickup.trim(),
//         dropoff: journey1.dropoff.trim(),
//         additionalDropoff1: journey1.additionalDropoff1 || null,
//         additionalDropoff2: journey1.additionalDropoff2 || null,

//         pickupDoorNumber: journey1.pickupDoorNumber || null,
//         terminal: journey1.terminal || null,

//         arrivefrom: journey1.arrivefrom || null,
//         flightNumber: journey1.flightNumber || null,
//         pickmeAfter: journey1.pickmeAfter || null,

//         notes: journey1.notes || null,
//         internalNotes: journey1.internalNotes || null,

//         date: journey1.date,
//         hour: parseInt(journey1.hour),
//         minute: parseInt(journey1.minute),
//         fare: 0,
//         hourlyOption: journey1.hourlyOption || null,

//         ...dynamicDropoffFields1,
//       },

//       ...(returnJourney && journey2 && {
//         journey2: {
//           pickup: journey2.pickup?.trim() || null,
//           dropoff: journey2.dropoff?.trim() || null,
//           additionalDropoff1: journey2.additionalDropoff1 || null,
//           additionalDropoff2: journey2.additionalDropoff2 || null,

//           pickupDoorNumber: journey2.pickupDoorNumber || null,
//           terminal: journey2.terminal || null,

//           arrivefrom: journey2.arrivefrom || null,
//           flightNumber: journey2.flightNumber || null,
//           pickmeAfter: journey2.pickmeAfter || null,

//           notes: journey2.notes || null,
//           internalNotes: journey2.internalNotes || null,

//           date: journey2.date,
//           hour: parseInt(journey2.hour),
//           minute: parseInt(journey2.minute),
//           fare: 0,
//           hourlyOption: journey2.hourlyOption || null,

//           ...dynamicDropoffFields2,
//         },
//       }),
//     };

//     const booking = await Booking.create(bookingData);

//     res.status(201).json({
//       success: true,
//       message: "Booking created successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("❌ Error in createBooking controller:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };
export const createBooking = async (req, res) => {
  try {
    const {
      mode = "Transfer",
      returnJourney = false,
      companyId,
      referrer,
      vehicle = {},
      journey1 = {},
      journey2 = {}
    } = req.body;

    // Validate companyId
    if (!companyId || typeof companyId !== "string" || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    // Validate vehicle
    if (!vehicle.vehicleName || typeof vehicle.vehicleName !== "string") {
      return res.status(400).json({ message: "Vehicle name is required" });
    }

    // Validate journey1
    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const field of requiredFields) {
      if (!journey1[field] || String(journey1[field]).trim() === "") {
        return res.status(400).json({ message: `Missing required field in journey1: ${field}` });
      }
    }

    // Extract dynamic fields
    const extractDynamicDropoffFields = (journey) => {
      const dynamicFields = {};
      Object.keys(journey || {}).forEach((key) => {
        if (key.startsWith("dropoff_terminal_") || key.startsWith("dropoffDoorNumber")) {
          dynamicFields[key] = journey[key];
        }
      });
      return dynamicFields;
    };

    // Booking 1: journey1
    const booking1Data = {
      mode,
      returnJourney: false,
      companyId,
      referrer: referrer || "Manual Entry",
      source: "admin",
      status: "Pending",
      vehicle: {
        vehicleName: vehicle.vehicleName,
        passenger: parseInt(vehicle.passenger) || 0,
        childSeat: parseInt(vehicle.childSeat) || 0,
        handLuggage: parseInt(vehicle.handLuggage) || 0,
        checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
      },
      journey1: {
        pickup: journey1.pickup.trim(),
        dropoff: journey1.dropoff.trim(),
        additionalDropoff1: journey1.additionalDropoff1 || null,
        additionalDropoff2: journey1.additionalDropoff2 || null,

        pickupDoorNumber: journey1.pickupDoorNumber || null,
        terminal: journey1.terminal || null,

        arrivefrom: journey1.arrivefrom || null,
        flightNumber: journey1.flightNumber || null,
        pickmeAfter: journey1.pickmeAfter || null,

        notes: journey1.notes || null,
        internalNotes: journey1.internalNotes || null,

        date: journey1.date,
        hour: parseInt(journey1.hour),
        minute: parseInt(journey1.minute),
        fare: 0,
        hourlyOption: journey1.hourlyOption || null,

        distanceText: journey1.distanceText || null, // ✅ Save distance
        durationText: journey1.durationText || null, // ✅ Save duration

        ...extractDynamicDropoffFields(journey1),
      }
    };

    const booking1 = await Booking.create(booking1Data);

    let booking2 = null;

    // Booking 2: journey2 (if returnJourney is selected)
    if (returnJourney && journey2 && Object.keys(journey2).length) {
      const booking2Data = {
        mode,
        returnJourney: false,
        companyId,
        referrer: referrer || "Manual Entry",
        source: "admin",
        status: "Pending",
        vehicle: {
          vehicleName: vehicle.vehicleName,
          passenger: parseInt(vehicle.passenger) || 0,
          childSeat: parseInt(vehicle.childSeat) || 0,
          handLuggage: parseInt(vehicle.handLuggage) || 0,
          checkinLuggage: parseInt(vehicle.checkinLuggage) || 0,
        },
        journey1: {
          pickup: journey2.pickup?.trim() || "",
          dropoff: journey2.dropoff?.trim() || "",
          additionalDropoff1: journey2.additionalDropoff1 || null,
          additionalDropoff2: journey2.additionalDropoff2 || null,

          pickupDoorNumber: journey2.pickupDoorNumber || null,
          terminal: journey2.terminal || null,

          arrivefrom: journey2.arrivefrom || null,
          flightNumber: journey2.flightNumber || null,
          pickmeAfter: journey2.pickmeAfter || null,

          notes: journey2.notes || null,
          internalNotes: journey2.internalNotes || null,

          date: journey2.date,
          hour: parseInt(journey2.hour),
          minute: parseInt(journey2.minute),
          fare: 0,
          hourlyOption: journey2.hourlyOption || null,

          distanceText: journey2.distanceText || null,
          durationText: journey2.durationText || null,

          ...extractDynamicDropoffFields(journey2),
        }
      };

      booking2 = await Booking.create(booking2Data);
    }

    return res.status(201).json({
      success: true,
      message: returnJourney ? "Both journeys booked separately" : "Booking created successfully",
      bookings: returnJourney ? [booking1, booking2] : [booking1],
    });
  } catch (error) {
    console.error("❌ Error in createBooking controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get All Bookings for a Company
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

// ✅ Update Booking by ID
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Optional: Validate required fields in journey1
    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const field of requiredFields) {
      if (!updatedData?.journey1?.[field]) {
        return res.status(400).json({ message: `Missing required field in journey1: ${field}` });
      }
    }

    // Sanitize or validate dynamic dropoff fields if needed
    const cleanDynamicFields = (journey = {}) => {
      const dynamicFields = {};
      Object.keys(journey).forEach((key) => {
        if (key.startsWith("dropoffDoorNumber") || key.startsWith("dropoff_terminal_")) {
          dynamicFields[key] = journey[key];
        }
      });
      return dynamicFields;
    };

    // Merge dynamic fields into journey1 and journey2 if present
    if (updatedData.journey1) {
      updatedData.journey1 = {
        ...updatedData.journey1,
        ...cleanDynamicFields(updatedData.journey1),
      };
    }
    if (updatedData.journey2) {
      updatedData.journey2 = {
        ...updatedData.journey2,
        ...cleanDynamicFields(updatedData.journey2),
      };
    }

    const booking = await Booking.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

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

// ✅ Delete Booking by ID
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ success: true, message: "Booking deleted successfully", booking });
  } catch (error) {
    console.error("Error in deleteBooking:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Widget Form Submission
export const submitWidgetForm = async (req, res) => {
  try {
    const {
      companyId,
      referrer,
      mode = "Transfer",
      returnJourney = false,
      vehicle,
      journey1,
      journey2
    } = req.body;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    if (!vehicle?.vehicleName) {
      return res.status(400).json({ message: "Vehicle name is required" });
    }

    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const field of requiredFields) {
      if (!journey1?.[field]) {
        return res.status(400).json({ message: `Missing required field in journey1: ${field}` });
      }
    }

    // Collect dynamic dropoff fields from journey1
    const dynamicDropoffFields1 = {};
    Object.keys(journey1 || {}).forEach((key) => {
      if (key.startsWith("dropoff_terminal_") || key.startsWith("dropoffDoorNumber")) {
        dynamicDropoffFields1[key] = journey1[key];
      }
    });

    // Collect dynamic fields for return journey
    const dynamicDropoffFields2 = {};
    if (returnJourney && journey2) {
      Object.keys(journey2 || {}).forEach((key) => {
        if (key.startsWith("dropoff_terminal_") || key.startsWith("dropoffDoorNumber")) {
          dynamicDropoffFields2[key] = journey2[key];
        }
      });
    }

    const bookingData = {
      mode,
      returnJourney,
      companyId,
      referrer: referrer || "Direct",
      source: "widget",
      status: "No Show",
      vehicle: {
        vehicleName: vehicle.vehicleName,
        passenger: vehicle.passenger || 0,
        childSeat: vehicle.childSeat || 0,
        handLuggage: vehicle.handLuggage || 0,
        checkinLuggage: vehicle.checkinLuggage || 0,
      },
      journey1: {
        pickup: journey1.pickup,
        dropoff: journey1.dropoff,
        additionalDropoff1: journey1.additionalDropoff1 || null,
        additionalDropoff2: journey1.additionalDropoff2 || null,
        pickupDoorNumber: journey1.pickupDoorNumber || null,
        terminal: journey1.terminal || null,
        arrivefrom: journey1.arrivefrom || null,
        flightNumber: journey1.flightNumber || null,
        pickmeAfter: journey1.pickmeAfter || null,
        notes: journey1.notes || null,
        internalNotes: journey1.internalNotes || null,
        date: journey1.date,
        hour: parseInt(journey1.hour),
        minute: parseInt(journey1.minute),
        fare: 0,
        hourlyOption: journey1.hourlyOption || null,
        distanceText: journey1.distanceText || null, // ✅ FIXED
        durationText: journey1.durationText || null, // ✅ FIXED
        ...dynamicDropoffFields1,
      },
      ...(returnJourney && journey2 && {
        journey2: {
          pickup: journey2.pickup,
          dropoff: journey2.dropoff,
          additionalDropoff1: journey2.additionalDropoff1 || null,
          additionalDropoff2: journey2.additionalDropoff2 || null,
          pickupDoorNumber: journey2.pickupDoorNumber || null,
          terminal: journey2.terminal || null,
          arrivefrom: journey2.arrivefrom || null,
          flightNumber: journey2.flightNumber || null,
          pickmeAfter: journey2.pickmeAfter || null,
          notes: journey2.notes || null,
          internalNotes: journey2.internalNotes || null,
          date: journey2.date,
          hour: parseInt(journey2.hour),
          minute: parseInt(journey2.minute),
          fare: 0,
          hourlyOption: journey2.hourlyOption || null,
          distanceText: journey2.distanceText || null,
          durationText: journey2.durationText || null,
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
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

