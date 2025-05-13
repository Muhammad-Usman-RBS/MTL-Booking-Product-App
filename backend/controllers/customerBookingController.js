import CustomerBooking from "../models/CustomerBooking.js";
import Company from "../models/Company.js";

export const submitWidgetForm = async (req, res) => {
  const { pickup, dropoff, companyId, referrer } = req.body;

  try {
    if (!pickup || !dropoff || !companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Missing or invalid required fields." });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found." });

    const customerBooking = new CustomerBooking({
      pickup,
      dropoff,
      source: referrer || "Direct",
      status: "No Show",
      companyId
    });

    await customerBooking.save();

    res.status(201).json({ message: "Customer submitted successfully", booking: customerBooking });
  } catch (error) {
    console.error("Widget submit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
