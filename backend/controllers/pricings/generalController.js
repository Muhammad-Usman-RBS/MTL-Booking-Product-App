import GeneralModel from "../../models/pricings/GeneralModel.js";

// GET General Pricing
export const getGeneralPricing = async (req, res) => {
  try {
    const pricing = await GeneralModel.findOne({ type: "general" });
    if (!pricing) {
      return res.status(404).json({ message: "General pricing not found" });
    }
    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pricing", error });
  }
};

// UPDATE or CREATE General Pricing
export const updateGeneralPricing = async (req, res) => {
  try {
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
      updatedBy: req.user?._id,
      pickupAirportPrice,
      dropoffAirportPrice,
      minAdditionalDropOff,
      childSeatPrice,
      cardPaymentType,
      cardPaymentAmount,
    };

    let pricing = await GeneralModel.findOne({ type: "general" });

    if (pricing) {
      pricing = await GeneralModel.findOneAndUpdate({ type: "general" }, data, { new: true });
    } else {
      pricing = await GeneralModel.create(data);
    }

    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Failed to update pricing", error });
  }
};
