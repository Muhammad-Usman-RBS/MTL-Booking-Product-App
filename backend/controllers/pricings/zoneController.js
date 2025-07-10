import Zone from "../../models/pricings/Zone.js";

// Create Zone
export const createZone = async (req, res) => {
  try {
    const { name, coordinates } = req.body;

    if (!name || !Array.isArray(coordinates) || coordinates.length < 3) {
      return res.status(400).json({ message: "Name and valid coordinates are required." });
    }

    const zone = new Zone({
      name,
      coordinates,
      companyId: req.user._id,
    });

    const savedZone = await zone.save();
    res.status(201).json(savedZone);
  } catch (err) {
    console.error("Create Zone Error:", err);
    res.status(500).json({ message: "Failed to create zone", error: err.message });
  }
};

// Get All Zones
export const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find({ companyId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(zones);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch zones", error: err.message });
  }
};

// Update Zone
export const updateZone = async (req, res) => {
  try {
    const { name, coordinates } = req.body;

    if (!name && !coordinates) {
      return res.status(400).json({ message: "Provide fields to update." });
    }

    if (coordinates && (!Array.isArray(coordinates) || coordinates.length < 3)) {
      return res.status(400).json({ message: "Invalid coordinates." });
    }

    const zone = await Zone.findOne({ _id: req.params.id, companyId: req.user._id });
    if (!zone) return res.status(404).json({ message: "Zone not found." });

    if (name) zone.name = name;
    if (coordinates) zone.coordinates = coordinates;

    const updatedZone = await zone.save();
    res.status(200).json(updatedZone);
  } catch (err) {
    console.error("Update Zone Error:", err);
    res.status(500).json({ message: "Failed to update zone", error: err.message });
  }
};

// Delete Zone
export const deleteZone = async (req, res) => {
  try {
    const deletedZone = await Zone.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user._id,
    });

    if (!deletedZone) {
      return res.status(404).json({ message: "Zone not found." });
    }

    res.status(200).json({ message: "Zone deleted successfully." });
  } catch (err) {
    console.error("Delete Zone Error:", err);
    res.status(500).json({ message: "Failed to delete zone", error: err.message });
  }
};
