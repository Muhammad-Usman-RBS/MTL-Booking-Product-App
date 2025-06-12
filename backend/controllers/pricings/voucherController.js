import Voucher from "../../models/pricings/Voucher.js";

// Get All Vouchers
export const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 });

        const updatedVouchers = vouchers.map(voucher => {
            const today = new Date();
            const validity = new Date(voucher.validity);
            let status = voucher.status;

            if (voucher.status !== "Deleted") {
                status = (validity < today) ? "Expired" : "Active";
            }

            return { ...voucher.toObject(), status };
        });

        res.status(200).json(updatedVouchers);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch vouchers", error: err.message });
    }
};

// Create Voucher
export const createVoucher = async (req, res) => {
    try {
        const { voucher, quantity, applicable, validity, discountType, discountValue } = req.body;

        const today = new Date();
        const isExpired = new Date(validity) < today;
        const status = isExpired ? "Expired" : "Active";

        const newVoucher = new Voucher({
            voucher,
            quantity,
            applicable,
            validity,
            discountType,
            discountValue,
            status
        });

        await newVoucher.save();
        res.status(201).json(newVoucher);
    } catch (err) {
        res.status(500).json({ message: "Failed to create", error: err.message });
    }
};

// Update Voucher
export const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { voucher, quantity, applicable, validity, discountType, discountValue } = req.body;

        const today = new Date();
        const isExpired = new Date(validity) < today;
        const status = isExpired ? "Expired" : "Active";

        const updated = await Voucher.findByIdAndUpdate(
            id,
            { voucher, quantity, applicable, validity, discountType, discountValue, status },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Voucher not found" });

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: "Failed to update", error: err.message });
    }
};

// Delete Voucher
export const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Voucher.findByIdAndUpdate(
            id,
            { status: "Deleted" },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Voucher not found" });

        res.status(200).json({ message: "Voucher marked as Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete", error: err.message });
    }
};
