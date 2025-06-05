import FixedPrice from "../../models/pricings/FixedPrice.js";

// GET ALL
export const getAllFixedPrices = async (req, res) => {
  try {
    const fixedPrices = await FixedPrice.find({ companyId: req.user._id });
    res.json(fixedPrices);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch prices", error: err.message });
  }
};

// CREATE 
export const createFixedPrice = async (req, res) => {
  try {
    const { pickup, dropoff, price, direction } = req.body;

    if (!pickup || !dropoff || !price) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await FixedPrice.findOne({
      pickup,
      dropoff,
      companyId: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        message: "A fixed price for this pickup and dropoff already exists.",
      });
    }

    const entry = await FixedPrice.create({
      pickup,
      dropoff,
      price,
      direction,
      companyId: req.user._id,
    });

    res.status(201).json(entry);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create price", error: err.message });
  }
};

// UPDATE
export const updateFixedPrice = async (req, res) => {
  try {
    const updated = await FixedPrice.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Entry not found." });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update price", error: err.message });
  }
};

// DELETE
export const deleteFixedPrice = async (req, res) => {
  try {
    const deleted = await FixedPrice.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: "Entry not found." });

    res.json({ message: "Entry deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete entry", error: err.message });
  }
};
