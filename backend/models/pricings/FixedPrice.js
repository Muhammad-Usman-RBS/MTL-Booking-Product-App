import mongoose from "mongoose";

const fixedPriceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    pickup: {
      type: String,
      required: true,
    },
    pickupCoordinates: [
      {
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
    dropoff: {
      type: String,
      required: true,
    },
    dropoffCoordinates: [
      {
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    direction: {
      type: String,
      enum: ["One Way", "Both Ways"],
      default: "One Way",
    },
  },
  { timestamps: true }
);

const FixedPrice = mongoose.model("FixedPrice", fixedPriceSchema);
export default FixedPrice;
