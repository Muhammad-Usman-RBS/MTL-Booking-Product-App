import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    coordinates: { type: [{ lat: Number, lng: Number }], required: true },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
  },
  { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
