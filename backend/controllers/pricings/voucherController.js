import Voucher from "../../models/pricings/Voucher.js";

// Admin: Get All Vouchers
export const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 });

        const updatedVouchers = vouchers.map(voucher => {
            const today = new Date();
            const validity = new Date(voucher.validity);
            let status = voucher.status;

            if (voucher.status !== "Deleted") {
                status = validity < today ? "Expired" : "Active";
            }

            return { ...voucher.toObject(), status };
        });

        res.status(200).json(updatedVouchers);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch vouchers", error: err.message });
    }
};

// Admin: Create New Voucher
export const createVoucher = async (req, res) => {
    try {
        const { voucher, quantity, applicable, validity, discountType, discountValue } = req.body;

        if (!voucher || !quantity || !validity || !discountType || !discountValue) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        const today = new Date();
        const isExpired = new Date(validity) < today;
        const status = isExpired ? "Expired" : "Active";

        const newVoucher = new Voucher({
            voucher: voucher.toUpperCase(),
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
        res.status(500).json({ message: "Failed to create voucher", error: err.message });
    }
};

// Admin: Update Voucher
export const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { voucher, quantity, applicable, validity, discountType, discountValue } = req.body;

        if (!id || !voucher || !quantity || !validity || !discountType || !discountValue) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        const today = new Date();
        const isExpired = new Date(validity) < today;
        const status = isExpired ? "Expired" : "Active";

        const updated = await Voucher.findByIdAndUpdate(
            id,
            {
                voucher: voucher.toUpperCase(),
                quantity,
                applicable,
                validity,
                discountType,
                discountValue,
                status
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Voucher not found" });
        }

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: "Failed to update voucher", error: err.message });
    }
};

// Admin: Delete Voucher (Soft Delete)
export const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Voucher.findByIdAndUpdate(id, { status: "Deleted" }, { new: true });

        if (!updated) return res.status(404).json({ message: "Voucher not found" });

        res.status(200).json({ message: "Voucher marked as Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete voucher", error: err.message });
    }
};

// Widget: Public API to Fetch Voucher by Code
export const getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code || typeof code !== "string") {
            return res.status(400).json({ message: "Voucher code is required." });
        }

        const voucher = await Voucher.findOne({ voucher: code.toUpperCase() });

        if (!voucher) return res.status(404).json({ message: "Voucher not found" });

        const today = new Date();
        const isExpired = new Date(voucher.validity) < today;

        if (voucher.status === "Deleted" || isExpired || voucher.used >= voucher.quantity) {
            return res.status(410).json({ message: "Voucher is no longer valid." });
        }

        res.status(200).json(voucher);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch voucher", error: err.message });
    }
};
