import Voucher from "../../models/pricings/Voucher.js";

export const getAllVouchers = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ message: "Invalid or missing companyId." });
        }
        const vouchers = await Voucher.find({
            companyId,
            status: { $ne: "Deleted" },
        });
        const today = new Date();
        const updatedVouchers = vouchers.map((voucher) => {
            const validity = new Date(voucher.validity);
            const isExpired = validity < today;
            const status = voucher.status === "Deleted"
                ? "Deleted"
                : isExpired
                    ? "Expired"
                    : "Active";

            return {
                ...voucher.toObject(),
                status,
            };
        });
        res.status(200).json(updatedVouchers);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch vouchers",
            error: err.message,
        });
    }
};

export const createVoucher = async (req, res) => {
    try {
        const { voucher, quantity, validity, discountType, discountValue } = req.body;
        const companyId = req.user?.companyId;
        if (
            !voucher || !quantity || !validity ||
            !discountType || discountValue === undefined || !companyId
        ) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }
        const isExpired = new Date(validity) < new Date();
        const status = isExpired ? "Expired" : "Active";
        const newVoucher = new Voucher({
            companyId,
            voucher: voucher.toUpperCase(),
            quantity,
            validity,
            discountType,
            discountValue,
            status,
            used: 0,
        });
        await newVoucher.save();
        res.status(201).json(newVoucher);
    } catch (err) {
        res.status(500).json({
            message: "Failed to create voucher",
            error: err.message,
        });
    }
};

export const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { voucher, quantity, validity, discountType, discountValue } = req.body;
        const companyId = req.user?.companyId;
        if (
            !id || !voucher || !quantity || !validity ||
            !discountType || discountValue === undefined || !companyId
        ) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }
        const isExpired = new Date(validity) < new Date();
        const status = isExpired ? "Expired" : "Active";
        const updated = await Voucher.findOneAndUpdate(
            { _id: id, companyId },
            {
                voucher: voucher.toUpperCase(),
                quantity,
                validity,
                discountType,
                discountValue,
                status,
            },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Voucher not found or unauthorized." });
        }
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({
            message: "Failed to update voucher",
            error: err.message,
        });
    }
};

export const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const deleted = await Voucher.findOneAndDelete({ _id: id, companyId });
        if (!deleted) {
            return res.status(404).json({ message: "Voucher not found or unauthorized." });
        }
        res.status(200).json({ message: "Voucher permanently deleted" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete voucher",
            error: err.message,
        });
    }
};

export const getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code || typeof code !== "string") {
            return res.status(400).json({ message: "Voucher code is required." });
        }
        const voucher = await Voucher.findOne({ voucher: code.toUpperCase() });
        if (!voucher) {
            return res.status(404).json({ message: "Voucher not found" });
        }
        const today = new Date();
        const isExpired = new Date(voucher.validity) < today;
        const hasReachedLimit = voucher.used >= voucher.quantity;
        const isInactive = voucher.status === "Deleted" || voucher.status === "Expired";
        if (isExpired || hasReachedLimit || isInactive) {
            return res.status(410).json({ message: "Voucher is no longer valid." });
        }
        res.status(200).json(voucher);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch voucher",
            error: err.message,
        });
    }
};