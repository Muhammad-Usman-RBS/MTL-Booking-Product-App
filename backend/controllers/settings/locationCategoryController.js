import LocationCategory from "../../models/settings/LocationCategory.js";
// CREATE Location Category
export const createLocationCategory = async (req, res) => {
  try {
    const { categoryName, pickupFields, dropoffFields } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await LocationCategory.findOne({ categoryName });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new LocationCategory({
      categoryName,
      pickupFields,
      dropoffFields,
    });

    await newCategory.save();

    res.status(201).json({ message: "Location category created", data: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ALL Categories
export  const getAllLocationCategories = async (req, res) => {
  try {
    const categories = await LocationCategory.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET Category By ID
export const getLocationCategoryById = async (req, res) => {
  try {
    const category = await LocationCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE Category
export const updateLocationCategory = async (req, res) => {
  try {
    const { categoryName, pickupFields, dropoffFields } = req.body;

    const updatedCategory = await LocationCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, pickupFields, dropoffFields },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE Category
export const deleteLocationCategory = async (req, res) => {
  try {
    const deleted = await LocationCategory.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
