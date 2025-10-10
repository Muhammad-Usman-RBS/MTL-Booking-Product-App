import Location from "../../models/settings/Locations.js";

export const createLocation = async (req, res) => {
  try {
    const { category, name, latLng , companyId } = req.body;
if(!companyId) {
  return res.status(400).json({ message: "Invalid or missing companyId" });
}
    if (!category || !name || !latLng) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const newLocation = new Location({
      category,
      name,
      latLng,
      companyId,
    });
    await newLocation.save();
    return res.status(201).json({
      message: "Location created successfully.",
      data: newLocation,
    });
  } catch (error) {
    console.error("Create Location Error:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating location." });
  }
};

export const getAllLocations = async (req, res) => {
  const {companyId} = req.query;
  if (!companyId) {
    return res.status(400).json({ success: false, message: "Valid companyId is required" });
  }
  const locations = await Location.find({companyId});
  res
    .status(200)
    .json({
      success: true,
      message: "Locations fetched successfully",
      data: locations,
    });
};

export const getLocationById = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await Location.findById(id);
    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    res.status(200).json({ success: true, data: location });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
};

export const updateLocationById = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedLocation = await Location.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedLocation) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    res.status(200).json({ success: true, data: updatedLocation });
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: err || "Invalid update data or ID",
      });
  }
};

export const deleteLocationbyId = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLocation = await Location.findByIdAndDelete(id);
    if (!deletedLocation) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Location deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid ID format", err });
  }
};