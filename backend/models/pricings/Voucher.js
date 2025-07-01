import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    voucher: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true },
    validity: { type: Date, required: true },
    discountType: { type: String, enum: ["Percentage"], default: "Percentage" },
    discountValue: { type: Number, required: true },
    used: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Expired"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Voucher", voucherSchema);
