import Booking from "../models/Booking.js";
import Company from "../models/Company.js";

// ✅ Create Booking (standard route)
export const createBooking = async (req, res) => {
  try {
    const { mode, returnJourney, journey1, journey2 } = req.body;

    if (!mode || returnJourney === undefined || !journey1) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!journey1.date || journey1.hour === undefined || journey1.minute === undefined) {
      return res.status(400).json({ message: "Journey1 date/hour/minute missing" });
    }

    if (returnJourney) {
      if (!journey2 || !journey2.date || journey2.hour === undefined || journey2.minute === undefined) {
        return res.status(400).json({ message: "Journey2 date/hour/minute missing" });
      }
    }

    const bookingData = {
      mode,
      returnJourney,
      journey1,
      journey2: returnJourney ? journey2 : undefined,
    };

    const booking = await Booking.create(bookingData);

    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error in createBooking controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error in createBooking",
      error: error.message,
    });
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

    const booking = await Booking.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ success: true, message: "Booking updated successfully", booking });
  } catch (error) {
    console.error("Error in updateBooking:", error);
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
      journey1,
      mode = "Transfer",
      returnJourney = false,
    } = req.body;

    // Validate companyId
    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Validate required journey1 fields
    const requiredFields = ["pickup", "dropoff", "date", "hour", "minute"];
    for (const field of requiredFields) {
      if (!journey1?.[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    const booking = await Booking.create({
      mode,
      returnJourney,
      journey1: {
        pickup: journey1.pickup,
        dropoff: journey1.dropoff,
        additionalDropoff1: journey1.additionalDropoff1 || null,
        additionalDropoff2: journey1.additionalDropoff2 || null,
        doorNumber: journey1.doorNumber || null,
        arrivefrom: journey1.arrivefrom || null,
        flightNumber: journey1.flightNumber || null,
        pickmeAfter: journey1.pickmeAfter || null,
        notes: journey1.notes || null,
        internalNotes: journey1.internalNotes || null,
        date: journey1.date,
        hour: journey1.hour,
        minute: journey1.minute,
        fare: 0,
        hourlyOption: journey1.hourlyOption || null,
      },
      companyId,
      referrer: referrer || "Direct",
      source: "widget",
      status: "No Show",
    });

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
