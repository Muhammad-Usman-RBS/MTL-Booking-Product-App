import mongoose from "mongoose";
import Zone from "../../models/pricings/Zone.js";
import FixedPrice from "../../models/pricings/FixedPrice.js";

export const createZone = async (req, res) => {
  try {
    const { name, coordinates } = req.body;
    if (!name || !Array.isArray(coordinates) || coordinates.length < 3) {
      return res
        .status(400)
        .json({ message: "Name and valid coordinates are required." });
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
    res
      .status(500)
      .json({ message: "Failed to create zone", error: err.message });
  }
};

export const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find({ companyId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(zones);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch zones", error: err.message });
  }
};

export const updateZone = async (req, res) => {
  try {
    const { name, coordinates } = req.body;
    if (!name && !coordinates) {
      return res.status(400).json({ message: "Provide fields to update." });
    }
    if (
      coordinates &&
      (!Array.isArray(coordinates) || coordinates.length < 3)
    ) {
      return res.status(400).json({ message: "Invalid coordinates." });
    }
    const zone = await Zone.findOne({
      _id: req.params.id,
      companyId: req.user._id,
    });
    if (!zone) return res.status(404).json({ message: "Zone not found." });
    if (name) zone.name = name;
    if (coordinates) zone.coordinates = coordinates;
    const updatedZone = await zone.save();
    res.status(200).json(updatedZone);
  } catch (err) {
    console.error("Update Zone Error:", err);
    res
      .status(500)
      .json({ message: "Failed to update zone", error: err.message });
  }
};

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
    res
      .status(500)
      .json({ message: "Failed to delete zone", error: err.message });
  }
};

const companyFilter = (user) => {
  const ids = [];
  if (user?.companyId && mongoose.Types.ObjectId.isValid(user.companyId))
    ids.push(new mongoose.Types.ObjectId(user.companyId));
  if (user?._id && mongoose.Types.ObjectId.isValid(user._id))
    ids.push(new mongoose.Types.ObjectId(user._id));
  return ids.length ? { $in: ids } : { $exists: true };
};
export const syncZoneToDependents = async (req, res) => {
  try {
    const cf = companyFilter(req.user);
    const zone = await Zone.findOne({
      _id: req.params.id,
      companyId: cf,
    }).lean();
    if (!zone) return res.status(404).json({ message: "Zone not found." });
    const coord = zone.coordinates.map(({ lat, lng }) => ({
      lat: Number(lat),
      lng: Number(lng),
    }));
    await FixedPrice.updateMany(
      { companyId: cf, pickupZone: zone._id },
      { $set: { pickupCoordinates: coord, updatedAt: new Date() } }
    );
    await FixedPrice.updateMany(
      { companyId: cf, dropoffZone: zone._id },
      { $set: { dropoffCoordinates: coord, updatedAt: new Date() } }
    );
    return res.status(200).json({ message: "Zone sync complete" });
  } catch (e) {
    console.error("syncZoneToDependents error:", e);
    return res
      .status(500)
      .json({ message: "Failed to sync zone.", error: e.message });
  }
};

export const syncAllZones = async (req, res) => {
  try {
    const companyId = req.user.companyId || req.user._id;
    const zones = await Zone.find({ companyId }).lean();
    if (!zones.length)
      return res.status(200).json({ message: "No zones to sync." });
    const ops = [];
    for (const z of zones) {
      const coord = normalizeCoords(z.coordinates);
      ops.push(
        {
          updateMany: {
            filter: { companyId, pickupZone: z._id },
            update: {
              $set: { pickupCoordinates: coord, updatedAt: new Date() },
            },
          },
        },
        {
          updateMany: {
            filter: { companyId, dropoffZone: z._id },
            update: {
              $set: { dropoffCoordinates: coord, updatedAt: new Date() },
            },
          },
        },
        {
          updateMany: {
            filter: {
              companyId,
              pickup: z.name,
              pickupZone: { $exists: false },
            },
            update: {
              $set: { pickupCoordinates: coord, updatedAt: new Date() },
            },
          },
        },
        {
          updateMany: {
            filter: {
              companyId,
              dropoff: z.name,
              dropoffZone: { $exists: false },
            },
            update: {
              $set: { dropoffCoordinates: coord, updatedAt: new Date() },
            },
          },
        }
      );
    }

    const result = await FixedPrice.bulkWrite(ops, { ordered: false });
    return res.status(200).json({ message: "All zones synced.", raw: result });
  } catch (err) {
    console.error("Sync all zones error:", err);
    return res
      .status(500)
      .json({ message: "Failed to sync all zones.", error: err.message });
  }
};
