import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
    {
      toDate: { type: Date, required: true },
      fromDate: { type: Date, required: true },
      caption: { type: String, required: true },
      discountPrice: { type: Number, default: 0 },
      surchargePrice: { type: Number, default: 0 },
      recurring: { type: String, enum: ["No", "Yearly"], default: "No" },
      status: { type: String, enum: ["Active", "Expired"], default: "Active" },
      category: { type: String, enum: ["Surcharge", "Discount"], required: true },
      companyId: {type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true},
    },
    { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
