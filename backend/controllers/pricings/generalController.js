import GeneralModel from "../../models/pricings/GeneralModel.js";

// GET General Pricing for Logged-in User's Company
export const getGeneralPricing = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res
        .status(400)
        .json({ message: "Company ID is missing from user data." });
    }

    const pricing = await GeneralModel.findOne({ type: "general", companyId });

    if (!pricing) {
      return res
        .status(404)
        .json({ message: "General pricing not found for this company." });
    }

    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pricing", error });
  }
};

// UPDATE or CREATE General Pricing for Logged-in User's Company
export const updateGeneralPricing = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const updatedBy = req.user?._id;

    if (!companyId || !updatedBy) {
      return res.status(400).json({ message: "Missing company or user ID." });
    }

    const {
      pickupAirportPrice,
      dropoffAirportPrice,
      minAdditionalDropOff,
      childSeatPrice,
      cardPaymentType,
      cardPaymentAmount,
    } = req.body;

    const data = {
      type: "general",
      companyId,
      updatedBy,
      pickupAirportPrice,
      dropoffAirportPrice,
      minAdditionalDropOff,
      childSeatPrice,
      cardPaymentType,
      cardPaymentAmount,
    };

    let pricing = await GeneralModel.findOne({ type: "general", companyId });

    if (pricing) {
      pricing = await GeneralModel.findOneAndUpdate(
        { type: "general", companyId },
        data,
        { new: true }
      );
    } else {
      pricing = await GeneralModel.create(data);
    }

    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Failed to update pricing", error });
  }
};

// PUBLIC API for General Pricing (No authentication required)
export const getGeneralPricingWidget = async (req, res) => {
  try {
    const companyId = req.query.companyId || req.query.company;

    if (!companyId || companyId.length !== 24) {
      return res
        .status(400)
        .json({ message: "Valid companyId is required in query params" });
    }

    // Fetch general pricing for the provided companyId
    const pricing = await GeneralModel.findOne({ companyId, type: "general" });

    if (!pricing) {
      return res
        .status(404)
        .json({ message: "General pricing not found for this company." });
    }

    // Return the pricing details
    res.status(200).json(pricing);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to fetch widget general pricing",
        error: err.message,
      });
  }
};
