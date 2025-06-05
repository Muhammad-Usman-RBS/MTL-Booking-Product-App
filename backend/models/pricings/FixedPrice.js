import mongoose from "mongoose";

const fixedPriceSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pickup: {
    type: [String],
    required: true,
  },
  dropoff: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  direction: {
    type: String,
    enum: ["One Way", "Both Ways"],
    default: "One Way",
  },
}, { timestamps: true });

const FixedPrice = mongoose.model("FixedPrice", fixedPriceSchema);
export default FixedPrice;
