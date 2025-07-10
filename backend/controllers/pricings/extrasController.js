import ExtrasPrice from "../../models/pricings/ExtrasPrice.js";

// Create ExtraPrice
export const createExtra = async (req, res) => {
  try {
    const { zone, price, coordinates } = req.body;
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }
    if (!zone || !price || !coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ message: "Zone, price, and coordinates are required." });
    }

    const existing = await ExtrasPrice.findOne({ zone, companyId });
    if (existing) {
      return res.status(409).json({ message: "This zone already exists." });
    }

    const mappedCoordinates = coordinates.map(coord => ({
      lat: coord.lat,
      lng: coord.lng
    }));

    const entry = await ExtrasPrice.create({
      zone,
      price: Number(price),
      coordinates: mappedCoordinates,
      companyId,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("Create Extra Error:", err);
    res.status(500).json({ message: "Failed to create extra", error: err.message });
  }
};

// Get All Extras
export const getAllExtras = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const extras = await ExtrasPrice.find({ companyId });
    res.json(extras);
  } catch (err) {
    console.error("Get Extras Error:", err);
    res.status(500).json({ message: "Failed to fetch extras", error: err.message });
  }
};

// Update Extra
export const updateExtra = async (req, res) => {
  try {
    const { zone, price, coordinates } = req.body;
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const updateData = { zone, price: Number(price) };
    if (coordinates) {
      updateData.coordinates = coordinates.map(coord => ({
        lat: coord.lat,
        lng: coord.lng
      }));
    }

    const updated = await ExtrasPrice.findOneAndUpdate(
      { _id: req.params.id, companyId },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Extra not found." });

    res.json(updated);
  } catch (err) {
    console.error("Update Extra Error:", err);
    res.status(500).json({ message: "Failed to update extra", error: err.message });
  }
};

// Delete Extra
export const deleteExtra = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const deleted = await ExtrasPrice.findOneAndDelete({
      _id: req.params.id,
      companyId,
    });

    if (!deleted) return res.status(404).json({ message: "Extra not found." });

    res.json({ message: "Deleted successfully." });
  } catch (err) {
    console.error("Delete Extra Error:", err);
    res.status(500).json({ message: "Failed to delete extra", error: err.message });
  }
};

// Get Extras for Widget (public)
export const getExtrasByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required." });
    }

    const extras = await ExtrasPrice.find({ companyId });
    res.json(extras);
  } catch (err) {
    console.error("Widget Extras Error:", err);
    res.status(500).json({ message: "Failed to fetch extras", error: err.message });
  }
};
