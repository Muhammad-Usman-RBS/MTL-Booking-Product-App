import BookingSetting from "../../models/settings/BookingSetting.js";

// GET - fetch setting
export const getBookingSetting = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ message: "Company ID missing or unauthorized" });
    }

    const setting = await BookingSetting.findOne({ companyId });

    if (!setting) {
      return res.status(404).json({ message: "Booking setting not found" });
    }

    res.status(200).json({ success: true, setting });
  } catch (error) {
    console.error("Error fetching booking setting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST - create/update
export const createOrUpdateBookingSetting = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { operatingCountry, timezone } = req.body;

    const updated = await BookingSetting.findOneAndUpdate(
      { companyId },
      { operatingCountry, timezone },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Booking setting updated",
      setting: updated
    });
  } catch (error) {
    console.error("Error updating booking setting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
