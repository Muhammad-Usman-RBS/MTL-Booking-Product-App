import Discount from "../../models/pricings/Discount.js";

// Get All
export const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.status(200).json(discounts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch discounts", error: err.message });
    }
};

// Create
export const createDiscount = async (req, res) => {
    try {
        const newDiscount = new Discount(req.body);
        await newDiscount.save();
        res.status(201).json(newDiscount);
    } catch (err) {
        res.status(500).json({ message: "Failed to create", error: err.message });
    }
};

// Update
export const updateDiscount = async (req, res) => {
    try {
        const updated = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Discount not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: "Failed to update", error: err.message });
    }
};

// Delete
export const deleteDiscount = async (req, res) => {
    try {
        const deleted = await Discount.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Discount not found" });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete", error: err.message });
    }
};
