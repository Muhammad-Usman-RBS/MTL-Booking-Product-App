import Vehicle from "../../models/pricings/Vehicle.js";
import { cloudinary } from "../../config/cloudinary.js";
import fs from "fs";

// ✅ Upload image to Cloudinary
const uploadToCloudinary = async (localPath) => {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: "vehicles",
  });
  fs.unlinkSync(localPath); // remove local file
  return result.secure_url;
};

// ✅ CREATE VEHICLE
export const createVehicle = async (req, res) => {
  try {
    const {
      priority,
      vehicleName,
      passengers,
      smallLuggage,
      largeLuggage,
      childSeat,
      percentageIncrease,
      priceType,
      companyId,
      image: imageFromBody,
      features,
      slabs,
    } = req.body;

    // Validate companyId
    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    // ✅ Parse features
    let parsedFeatures = [];
    if (features) {
      try {
        const arr = typeof features === "string" ? JSON.parse(features) : features;
        if (!Array.isArray(arr)) throw new Error("Features must be an array");
        if (arr.length > 10) throw new Error("Maximum 10 features allowed");
        parsedFeatures = arr.map(f => String(f).trim()).filter(Boolean);
      } catch (err) {
        return res.status(400).json({ message: `Features error: ${err.message}` });
      }
    }

    // ✅ Parse slabs
    let parsedSlabs = [];
    if (slabs) {
      try {
        const slabArray = typeof slabs === "string" ? JSON.parse(slabs) : slabs;
        if (!Array.isArray(slabArray)) throw new Error("Slabs must be an array");
        parsedSlabs = slabArray.map(s => ({
          from: Number(s.from),
          to: Number(s.to),
          price: Number(s.price),
        }));
      } catch (err) {
        return res.status(400).json({ message: `Slabs error: ${err.message}` });
      }
    }

    // ✅ Upload image if present
    let image = "";
    if (req.file?.path) {
      image = await uploadToCloudinary(req.file.path);
    } else if (imageFromBody) {
      image = imageFromBody;
    }

    const newVehicle = new Vehicle({
      priority: Number(priority),
      vehicleName,
      passengers: Number(passengers),
      smallLuggage: Number(smallLuggage),
      largeLuggage: Number(largeLuggage),
      childSeat: Number(childSeat),
      percentageIncrease: Number(percentageIncrease),
      priceType,
      image,
      companyId,
      features: parsedFeatures,
      slabs: parsedSlabs,
    });

    const saved = await newVehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Create Vehicle Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ READ VEHICLES
export const getAllVehicles = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    const vehicles = await Vehicle.find({ companyId }).sort({ priority: 1 });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE VEHICLE
export const updateVehicle = async (req, res) => {
  try {
    let {
      priority,
      vehicleName,
      passengers,
      smallLuggage,
      largeLuggage,
      childSeat,
      percentageIncrease,
      priceType,
      companyId,
      image: imageFromBody,
      features,
      slabs,
    } = req.body;

    if (Array.isArray(companyId)) companyId = companyId[0];

    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    // ✅ Parse features
    let parsedFeatures = [];
    if (features) {
      try {
        const arr = typeof features === "string" ? JSON.parse(features) : features;
        if (!Array.isArray(arr)) throw new Error("Features must be an array");
        if (arr.length > 10) throw new Error("Maximum 10 features allowed");
        parsedFeatures = arr.map(f => String(f).trim()).filter(Boolean);
      } catch (err) {
        return res.status(400).json({ message: `Features error: ${err.message}` });
      }
    }

    // ✅ Parse slabs
    let parsedSlabs = [];
    if (slabs) {
      try {
        const slabArray = typeof slabs === "string" ? JSON.parse(slabs) : slabs;
        if (!Array.isArray(slabArray)) throw new Error("Slabs must be an array");
        parsedSlabs = slabArray.map(s => ({
          from: Number(s.from),
          to: Number(s.to),
          price: Number(s.price),
        }));
      } catch (err) {
        return res.status(400).json({ message: `Slabs error: ${err.message}` });
      }
    }

    // ✅ Image upload
    let image = imageFromBody;
    if (req.file?.path) {
      image = await uploadToCloudinary(req.file.path);
    }

    const updates = {
      priority: Number(priority),
      vehicleName,
      passengers: Number(passengers),
      smallLuggage: Number(smallLuggage),
      largeLuggage: Number(largeLuggage),
      childSeat: Number(childSeat),
      percentageIncrease: Number(percentageIncrease),
      priceType,
      image,
      companyId,
      features: parsedFeatures,
      slabs: parsedSlabs,
    };

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

// ✅ DELETE
export const deleteVehicle = async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET BY COMPANY (Public)
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
