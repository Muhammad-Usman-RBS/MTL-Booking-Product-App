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
      features, // expected from FormData as JSON string
    } = req.body;

    let image = "";

    // ✅ Upload image if file is present
    if (req.file?.path) {
      image = await uploadToCloudinary(req.file.path);
    } else if (imageFromBody) {
      image = imageFromBody;
    }

    // ✅ Validate companyId
    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    // ✅ Parse and sanitize features (ensure it's an array of clean strings)
    let parsedFeatures = [];
    if (features) {
      try {
        const featureArray = typeof features === "string" ? JSON.parse(features) : features;

        if (!Array.isArray(featureArray)) {
          throw new Error("Features must be an array");
        }

        if (featureArray.length > 10) {
          throw new Error("Maximum 10 features allowed");
        }

        parsedFeatures = featureArray
          .map((f) => String(f).trim())  // Force string and trim
          .filter((f) => f.length > 0);  // Remove empty entries
      } catch (err) {
        return res.status(400).json({ message: `Features error: ${err.message}` });
      }
    }

    // ✅ Create and save vehicle with proper features array
    const newVehicle = new Vehicle({
      priority: Number(priority),
      vehicleName,
      passengers: Number(passengers),
      smallLuggage: Number(smallLuggage),
      largeLuggage: Number(largeLuggage),
      childSeat: Number(childSeat),
      price: Number(price),
      priceType,
      image,
      companyId,
      features: parsedFeatures,
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
      image: imageFromBody,
      features, // ✅ expected as a stringified JSON array from FormData
    } = req.body;

    // ✅ Fix FormData array conversion issue
    if (Array.isArray(companyId)) {
      companyId = companyId[0];
    }

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    // ✅ Properly parse and validate features array
    let parsedFeatures = [];
    if (features) {
      try {
        // Parse features only if it's a stringified array
        const featureArray = typeof features === "string" ? JSON.parse(features) : features;

        if (!Array.isArray(featureArray)) {
          throw new Error("Features must be an array");
        }

        if (featureArray.length > 10) {
          throw new Error("Maximum 10 features allowed");
        }

        parsedFeatures = featureArray.map((f) => String(f).trim()).filter(Boolean);
      } catch (err) {
        return res.status(400).json({ message: `Features error: ${err.message}` });
      }
    }

    // ✅ Build the update object
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
      features: parsedFeatures, // ✅ guaranteed to be array of strings
    };

    // ✅ Image handling
    if (req.file?.path) {
      updates.image = await uploadToCloudinary(req.file.path);
    } else if (imageFromBody) {
      updates.image = imageFromBody;
    }

    // ✅ Execute update
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

// Fetches all vehicles for a specific company, sorted by priority.
export const getVehiclesByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    const vehicles = await Vehicle.find({ companyId }).sort({ priority: 1 });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

