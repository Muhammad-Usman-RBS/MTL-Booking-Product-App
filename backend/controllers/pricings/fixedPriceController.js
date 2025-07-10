import FixedPrice from "../../models/pricings/FixedPrice.js";

// Get All Fixed Prices (Authenticated)
export const getAllFixedPrices = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const fixedPrices = await FixedPrice.find({ companyId });
    res.json(fixedPrices);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch prices", error: err.message });
  }
};

// Create Fixed Price
export const createFixedPrice = async (req, res) => {
  try {
    const { pickup, pickupCoordinates, dropoff, dropoffCoordinates, price, direction } = req.body;
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    if (!pickup || !dropoff || !price || !pickupCoordinates || !dropoffCoordinates) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await FixedPrice.findOne({ pickup, dropoff, companyId });

    if (existing) {
      return res.status(409).json({
        message: "A fixed price for this pickup and dropoff already exists.",
      });
    }

    const entry = await FixedPrice.create({
      pickup,
      pickupCoordinates: pickupCoordinates.map((c) => ({ lat: c.lat, lng: c.lng })),
      dropoff,
      dropoffCoordinates: dropoffCoordinates.map((c) => ({ lat: c.lat, lng: c.lng })),
      price,
      direction,
      companyId,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Failed to create price", error: err.message });
  }
};

// Update Fixed Price
export const updateFixedPrice = async (req, res) => {
  try {
    const { pickup, pickupCoordinates, dropoff, dropoffCoordinates, price, direction } = req.body;
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const updateData = {
      pickup,
      pickupCoordinates: pickupCoordinates?.map((c) => ({ lat: c.lat, lng: c.lng })) || [],
      dropoff,
      dropoffCoordinates: dropoffCoordinates?.map((c) => ({ lat: c.lat, lng: c.lng })) || [],
      price,
      direction,
    };

    const updated = await FixedPrice.findOneAndUpdate(
      { _id: req.params.id, companyId },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Entry not found." });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update price", error: err.message });
  }
};

// Delete Fixed Price
export const deleteFixedPrice = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const deleted = await FixedPrice.findOneAndDelete({
      _id: req.params.id,
      companyId,
    });

    if (!deleted) return res.status(404).json({ message: "Entry not found." });

    res.json({ message: "Entry deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete entry", error: err.message });
  }
};

// Get Fixed Prices by Company ID (Public Widget)
export const getFixedPricesByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const fixedPrices = await FixedPrice.find({ companyId });
    res.json(fixedPrices);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fixed prices", error: err.message });
  }
};
