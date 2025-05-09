import GeneralPricing from "../../models/pricings/generalModel.js";

export const getGeneralPricing = async (req, res) => {
  try {
    const pricing = await GeneralPricing.findOne({ type: "general" });
    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pricing", error });
  }
};

export const updateGeneralPricing = async (req, res) => {
  try {
    const data = {
      ...req.body,
      type: "general",
      updatedBy: req.user._id,
    };

    let pricing = await GeneralPricing.findOne({ type: "general" });
    if (pricing) {
      pricing = await GeneralPricing.findOneAndUpdate({ type: "general" }, data, { new: true });
    } else {
      pricing = await GeneralPricing.create(data);
    }

    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Failed to update pricing", error });
  }
};
