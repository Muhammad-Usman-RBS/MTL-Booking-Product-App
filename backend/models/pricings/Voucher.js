import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
    voucher: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true },
    applicable: [{ type: String, default: "All Users" }],
    validity: { type: Date, required: true },
    discountType: { type: String, enum: ["Percentage"], default: "Percentage" },
    discountValue: { type: Number, required: true },
    applied: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Expired"], default: "Active" },
}, { timestamps: true });

export default mongoose.model("Voucher", voucherSchema);
