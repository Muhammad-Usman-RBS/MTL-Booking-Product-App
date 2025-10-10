import mongoose from "mongoose";

const hourlyPackageSchema = new mongoose.Schema(
  {
    distance: { type: Number, required: true },
    hours: { type: Number, required: true },
    vehicleRates: { type: Map, of: Number, required: true },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);
const HourlyPackage = mongoose.model("HourlyPackage", hourlyPackageSchema);
export default HourlyPackage;
