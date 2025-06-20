import mongoose from "mongoose";

const coverageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Pickup", "Dropoff", "Both"],
      required: true,
    },
    coverage: {
      type: String,
      enum: ["Allow", "Block"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Postcode", "Zone"],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",

    }
  },
  { timestamps: true }
);

export default mongoose.model("Coverage", coverageSchema);
