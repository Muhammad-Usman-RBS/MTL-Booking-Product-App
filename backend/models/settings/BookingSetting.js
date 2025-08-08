import mongoose from "mongoose";

const BookingSettingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    unique: true,
  },
  operatingCountry: {
    type: String,
  },
  timezone: {
    type: String,
  },
  currency: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("BookingSetting", BookingSettingSchema);
