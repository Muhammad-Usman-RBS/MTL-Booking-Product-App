import ExtrasPrice from "../../models/pricings/ExtrasPrice.js";

export const getAllExtras = async (req, res) => {
    try {
        const extras = await ExtrasPrice.find({ companyId: req.user._id });
        res.json(extras);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch extras", error: err.message });
    }
};

export const createExtra = async (req, res) => {
    try {
        const { zone, price } = req.body;

        if (!zone || !price) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const existing = await ExtrasPrice.findOne({
            zone,
            companyId: req.user._id,
        });

        if (existing) {
            return res.status(409).json({ message: "Zone already exists" });
        }

        const entry = await ExtrasPrice.create({
            zone,
            price,
            companyId: req.user._id,
        });

        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ message: "Failed to create", error: err.message });
    }
};

export const updateExtra = async (req, res) => {
    try {
        const updated = await ExtrasPrice.findOneAndUpdate(
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

export const deleteExtra = async (req, res) => {
    try {
        const deleted = await ExtrasPrice.findOneAndDelete({
            _id: req.params.id,
            companyId: req.user._id,
        });
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
};
