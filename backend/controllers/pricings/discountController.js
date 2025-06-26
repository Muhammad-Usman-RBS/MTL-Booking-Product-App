import Discount from "../../models/pricings/Discount.js";

// Get All Discounts (for current company)
export const getAllDiscounts = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const discounts = await Discount.find({ companyId }).sort({ createdAt: -1 });
    res.status(200).json(discounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch discounts", error: err.message });
  }
};

// Create Discount
export const createDiscount = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const {
      caption,
      recurring,
      fromDate,
      toDate,
      category,
      discountPrice,
      status,
    } = req.body;

    const discount = new Discount({
      caption,
      recurring,
      fromDate: new Date(fromDate).toISOString(), // ✅ Ensures UTC ISO format
      toDate: new Date(toDate).toISOString(),     // ✅ Ensures UTC ISO format
      category,
      discountPrice,
      status,
      companyId,
    });

    await discount.save();
    res.status(201).json(discount);
  } catch (err) {
    res.status(500).json({ message: "Failed to create", error: err.message });
  }
};

// Update Discount
export const updateDiscount = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const {
      caption,
      recurring,
      fromDate,
      toDate,
      category,
      discountPrice,
      status,
    } = req.body;

    const updated = await Discount.findOneAndUpdate(
      { _id: id, companyId },
      {
        caption,
        recurring,
        fromDate: new Date(fromDate).toISOString(), // ✅ Ensures 24h precision
        toDate: new Date(toDate).toISOString(),
        category,
        discountPrice,
        status,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Discount not found." });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
};

// Delete Discount
export const deleteDiscount = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const deleted = await Discount.findOneAndDelete({ _id: id, companyId });

    if (!deleted) {
      return res.status(404).json({ message: "Discount not found." });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
};

// Public API: Get Discounts by companyId (for widget use)
export const getDiscountsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const discounts = await Discount.find({ companyId }).sort({ createdAt: -1 });
    res.status(200).json(discounts);
  } catch (err) {
    console.error("Public Discount Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch discounts", error: err.message });
  }
};

