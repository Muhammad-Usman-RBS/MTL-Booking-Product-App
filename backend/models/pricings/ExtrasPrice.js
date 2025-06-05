import mongoose from "mongoose";

const extrasPriceSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        zone: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const ExtrasPrice = mongoose.model("ExtrasPrice", extrasPriceSchema);
export default ExtrasPrice;
