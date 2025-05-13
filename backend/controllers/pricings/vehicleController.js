import Vehicle from "../../models/pricings/Vehicle.js";
import { cloudinary } from "../../config/cloudinary.js";
import fs from "fs";

// Upload image to Cloudinary (if not using multer-storage-cloudinary directly)
const uploadToCloudinary = async (localPath) => {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: "vehicles",
  });
  fs.unlinkSync(localPath); // Clean up local file
  return result.secure_url;
};

// CREATE
export const createVehicle = async (req, res) => {
  try {
    const {
      priority,
      vehicleName,
      passengers,
      smallLuggage,
      largeLuggage,
      childSeat,
      priceType,
      price,
      companyId,
    } = req.body;

    let image = "";
    if (req.file?.path) {
      image = await uploadToCloudinary(req.file.path);
    }

    const newVehicle = new Vehicle({
      priority,
      vehicleName,
      passengers,
      smallLuggage,
      largeLuggage,
      childSeat,
      priceType,
      price,
      image,
      companyId,
    });

    const saved = await newVehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ priority: 1 });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateVehicle = async (req, res) => {
  try {
    const updates = req.body;

    if (req.file?.path) {
      updates.image = await uploadToCloudinary(req.file.path);
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteVehicle = async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
