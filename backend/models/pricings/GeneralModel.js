import mongoose from "mongoose";

const generalPricingSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "general",
            required: true,
            enum: ["general"],
            unique: true,
        },
        pickupAirportPrice: { type: Number, default: 2 },
        dropoffAirportPrice: { type: Number, default: 2 },
        minAdditionalDropOff: { type: Number, default: 10 },
        childSeatPrice: { type: Number, default: 5 },
        cardPaymentType: {
            type: String,
            enum: ["Card", "Cash"],
            default: "Card",
        },
        cardPaymentAmount: { type: Number, default: 0 },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const GeneralPricing = mongoose.model("GeneralPricing", generalPricingSchema);

export default GeneralPricing;
