import mongoose from "mongoose";

const generalPricingSchema = new mongoose.Schema(
  {
    pickupAirportPrice: { type: Number, default: 2, required: true },
    dropoffAirportPrice: { type: Number, default: 2, required: true },
    minAdditionalDropOff: { type: Number, default: 10, required: true },
    childSeatPrice: { type: Number, default: 5, required: true },
    invoiceTaxPercent: { type: Number, required: true },
    cardPaymentType: {
      type: String,
      enum: ["Card, Bank", "Cash"],
      default: "Card, Bank",
      required: true,
    },
    cardPaymentAmount: { type: Number, default: 0, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);
const GeneralModel = mongoose.model("GeneralPricing", generalPricingSchema);
export default GeneralModel;
