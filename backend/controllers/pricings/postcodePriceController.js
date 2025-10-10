import FixedPrice from "../../models/pricings/PostcodePrice.js";

export const getAllPostcodePrices = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ message: "Valid companyId is required" });
        }
        const prices = await FixedPrice.find({ companyId });
        res.status(200).json(prices);
    } catch (err) {
        res.status(500).json({ message: "Error fetching postcode prices", error: err.message });
    }
};

export const createPostcodePrice = async (req, res) => {
    try {
        const { pickup, dropoff, price } = req.body;
        const companyId = req.user.companyId;
        if (!pickup || !dropoff || !price || !companyId) {
            return res.status(400).json({ message: "All fields and valid companyId are required" });
        }
        const exists = await FixedPrice.findOne({ pickup, dropoff, companyId });
        if (exists) {
            return res.status(409).json({ message: "This pickup-dropoff pair already exists" });
        }
        const created = await FixedPrice.create({ pickup, dropoff, price, companyId });
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ message: "Failed to create postcode price", error: err.message });
    }
};

export const updatePostcodePrice = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ message: "Valid companyId is required" });
        }
        const updated = await FixedPrice.findOneAndUpdate(
            { _id: req.params.id, companyId },
            req.body,
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Postcode price not found" });
        }
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: "Failed to update postcode price", error: err.message });
    }
};

export const deletePostcodePrice = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ message: "Valid companyId is required" });
        }
        const deleted = await FixedPrice.findOneAndDelete({
            _id: req.params.id,
            companyId,
        });
        if (!deleted) {
            return res.status(404).json({ message: "Postcode price not found" });
        }
        res.status(200).json({ message: "Postcode price deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete postcode price", error: err.message });
    }
};

export const getAllPostcodePricesWidget = async (req, res) => {
    try {
        const companyId = req.query.companyId || req.query.company;
        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ message: "Valid companyId is required in query params" });
        }
        const prices = await FixedPrice.find({ companyId });
        res.status(200).json(prices);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch widget postcode prices", error: err.message });
    }
};