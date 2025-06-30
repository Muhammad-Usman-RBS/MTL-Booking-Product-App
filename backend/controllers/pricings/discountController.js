import Discount from "../../models/pricings/Discount.js";

// Get All Discounts for Admin Panel
export const getAllDiscounts = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    let discounts = await Discount.find({ companyId }).sort({ createdAt: -1 });

    const now = new Date();

    // Update expired statuses in DB
    const updatedDiscounts = await Promise.all(
      discounts.map(async (discount) => {
        const toDate = new Date(discount.toDate);
        const newStatus = toDate < now ? "Expired" : "Active";

        if (discount.status !== newStatus) {
          discount.status = newStatus;
          await discount.save(); // update the status in DB
        }

        return discount;
      })
    );

    res.status(200).json(updatedDiscounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch discounts", error: err.message });
  }
};

// Create Discount/Surcharge Entry
export const createDiscount = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const {
      caption,
      recurring = "No",
      fromDate,
      toDate,
      category,
      discountPrice,
      surchargePrice,
      status,
    } = req.body;

    if (
      !caption ||
      !fromDate ||
      !toDate ||
      !category ||
      (discountPrice === undefined && surchargePrice === undefined)
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const dynamicStatus = new Date(toDate).getTime() < Date.now() ? "Expired" : "Active";

    const discount = new Discount({
      caption,
      recurring,
      fromDate: new Date(fromDate).toISOString(),
      toDate: new Date(toDate).toISOString(),
      category,
      discountPrice: category === "Discount" ? parseFloat(discountPrice) : 0,
      surchargePrice: category === "Surcharge" ? parseFloat(surchargePrice) : 0,
      status: status || dynamicStatus,
      companyId,
    });

    await discount.save();
    res.status(201).json(discount);
  } catch (err) {
    res.status(500).json({ message: "Failed to create", error: err.message });
  }
};

// Update Discount/Surcharge
export const updateDiscount = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    if (!companyId || companyId.length !== 24 || !id) {
      return res.status(400).json({ message: "Valid companyId and ID are required." });
    }

    const {
      caption,
      recurring = "No",
      fromDate,
      toDate,
      category,
      discountPrice,
      surchargePrice,
      status,
    } = req.body;

    if (
      !caption ||
      !fromDate ||
      !toDate ||
      !category ||
      (discountPrice === undefined && surchargePrice === undefined)
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const currentDate = new Date();
    const toDateObj = new Date(toDate);
    const dynamicStatus = toDateObj < currentDate ? "Expired" : "Active";

    const updated = await Discount.findOneAndUpdate(
      { _id: id, companyId },
      {
        caption,
        recurring,
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
        category,
        discountPrice: category === "Discount" ? parseFloat(discountPrice) : 0,
        surchargePrice: category === "Surcharge" ? parseFloat(surchargePrice) : 0,
        status: status || dynamicStatus,
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

// Delete Discount/Surcharge
export const deleteDiscount = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    if (!companyId || companyId.length !== 24 || !id) {
      return res.status(400).json({ message: "Valid companyId and ID are required." });
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

// Public API: Get Active Discounts/Surcharges for Widget Use
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
