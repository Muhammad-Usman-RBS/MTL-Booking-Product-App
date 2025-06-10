import FixedPrice from "../../models/pricings/PostcodePrice.js";

export const getAllPostcodePrices = async (req, res) => {
    try {
        const prices = await FixedPrice.find({ companyId: req.user._id });
        res.json(prices);
    } catch (err) {
        res.status(500).json({ message: "Error fetching prices", error: err.message });
    }
};

export const createPostcodePrice = async (req, res) => {
    try {
        const { pickup, dropoff, price } = req.body;

        if (!pickup || !dropoff || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const exists = await FixedPrice.findOne({ pickup, dropoff, companyId: req.user._id });
        if (exists) {
            return res.status(409).json({ message: "Entry already exists" });
        }

        const created = await FixedPrice.create({ pickup, dropoff, price, companyId: req.user._id });
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ message: "Create failed", error: err.message });
    }
};

export const updatePostcodePrice = async (req, res) => {
    try {
        const updated = await FixedPrice.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user._id },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Not found" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

export const deletePostcodePrice = async (req, res) => {
    try {
        const deleted = await FixedPrice.findOneAndDelete({
            _id: req.params.id,
            companyId: req.user._id,
        });
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
};