import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
    {
        caption: { type: String, required: true },
        recurring: { type: String, enum: ["No", "Yearly"], default: "No" },
        fromDate: { type: Date, required: true },
        toDate: { type: Date, required: true },
        category: { type: String, enum: ["Surcharge", "Discount"], required: true },
        discountPrice: { type: Number, required: true },
        status: { type: String, enum: ["Active", "Expired"], default: "Active" },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
