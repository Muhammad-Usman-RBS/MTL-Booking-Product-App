import Zone from "../../models/settings/Zone.js";

// GET ZONES
export const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find({ companyId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch zones",
      error: error.message,
    });
  }
};

// CREATE ZONES
export const createZone = async (req, res) => {
  try {
    const { name, coordinates } = req.body;

    if (!name || !Array.isArray(coordinates) || coordinates.length < 3) {
      return res.status(400).json({
        message: "Invalid input. Name and at least 3 polygon coordinates are required.",
      });
    }

    const zone = new Zone({
      name,
      coordinates,
      companyId: req.user._id,
    });

    const savedZone = await zone.save();
    res.status(201).json(savedZone);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create zone",
      error: error.message,
    });
  }
};

// UPDATE ZONES
export const updateZone = async (req, res) => {
  try {
    const { name, coordinates } = req.body;

    if (!name && !coordinates) {
      return res.status(400).json({ message: "No update fields provided." });
    }

    if (coordinates && (!Array.isArray(coordinates) || coordinates.length < 3)) {
      return res.status(400).json({ message: "Invalid polygon coordinates." });
    }

    const zone = await Zone.findOne({ _id: req.params.id, companyId: req.user._id });

    if (!zone) {
      return res.status(404).json({ message: "Zone not found or unauthorized." });
    }

    if (name) zone.name = name;
    if (coordinates) zone.coordinates = coordinates;

    const updatedZone = await zone.save();
    res.status(200).json(updatedZone);
  } catch (error) {
    console.error("Zone update error:", error);
    res.status(500).json({
      message: "Failed to update zone",
      error: error.message,
    });
  }
};

// DELETE ZONES
export const deleteZone = async (req, res) => {
  try {
    const deletedZone = await Zone.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user._id,
    });

    if (!deletedZone) {
      return res.status(404).json({ message: "Zone not found or unauthorized." });
    }

    res.status(200).json({ message: "Zone deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete zone",
      error: error.message,
    });
  }
};
