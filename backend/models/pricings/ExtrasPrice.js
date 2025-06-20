import mongoose from "mongoose";

const extrasPriceSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
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
        coordinates: [
            {
                lat: { type: Number },
                lng: { type: Number },
            }
        ],
    },
    { timestamps: true }
);

const ExtrasPrice = mongoose.model("ExtrasPrice", extrasPriceSchema);
export default ExtrasPrice;
