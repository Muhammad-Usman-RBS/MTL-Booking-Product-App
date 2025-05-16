import Vehicle from "../../models/pricings/Vehicle.js";
import { cloudinary } from "../../config/cloudinary.js";
import fs from "fs";

// Image Saving Frontend Inside Modal
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
      price,
      priceType,
      companyId,
      image: imageFromBody,
    } = req.body;

    let image = "";

    if (req.file?.path) {
      image = await uploadToCloudinary(req.file.path);
    } else if (imageFromBody) {
      image = imageFromBody; // ✅ use image URL from body
    }

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    const newVehicle = new Vehicle({
      priority,
      vehicleName,
      passengers,
      smallLuggage,
      largeLuggage,
      childSeat,
      price,
      priceType,
      image, // ✅ now properly handled
      companyId,
    });

    const saved = await newVehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Create Vehicle Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getAllVehicles = async (req, res) => {
  try {
    const companyId = req.user.companyId; // ✅ comes from protect middleware

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    const vehicles = await Vehicle.find({ companyId }).sort({ priority: 1 });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// UPDATE
export const updateVehicle = async (req, res) => {
  try {
    let {
      priority,
      vehicleName,
      passengers,
      smallLuggage,
      largeLuggage,
      childSeat,
      price,
      priceType,
      companyId,
      image: imageFromBody, // fallback image string if file not provided
    } = req.body;

    // ✅ Convert companyId to string if it's an array (FormData issue)
    if (Array.isArray(companyId)) {
      companyId = companyId[0];
    }

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    // ✅ Prepare the update payload
    const updates = {
      priority: Number(priority),
      vehicleName,
      passengers: Number(passengers),
      smallLuggage: Number(smallLuggage),
      largeLuggage: Number(largeLuggage),
      childSeat: Number(childSeat),
      price: Number(price),
      priceType,
      companyId,
    };

    // ✅ Handle optional image upload or reuse
    if (req.file?.path) {
      updates.image = await uploadToCloudinary(req.file.path);
    } else if (imageFromBody) {
      updates.image = imageFromBody;
    }

    // ✅ Perform DB update
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update Vehicle Error:", err);
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
