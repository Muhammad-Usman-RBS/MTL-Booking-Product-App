import Booking from "../models/Booking.js";
import Company from "../models/Company.js";

export const submitWidgetForm = async (req, res) => {
  try {
    const {
      companyId,
      referrer,
      journey1,
      mode = "Transfer",
      returnJourney = false
    } = req.body;

    // Validate companyId
    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Basic field validation for journey1
    const requiredFields = ['pickup', 'dropoff', 'date', 'hour', 'minute'];
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
      status: "No Show"
    });

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully",
      booking
    });

  } catch (error) {
    console.error("Widget submit error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
