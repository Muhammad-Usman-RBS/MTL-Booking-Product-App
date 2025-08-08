import mongoose from "mongoose";

// Currency options schema
const currencySchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
});

// Booking settings schema with currency options
const BookingSettingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    unique: true,
  },

  // First Object
  operatingCountry: {
    type: String,
  },
  timezone: {
    type: String,
  },

  currency: {
    type: [currencySchema], 
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("BookingSetting", BookingSettingSchema);
