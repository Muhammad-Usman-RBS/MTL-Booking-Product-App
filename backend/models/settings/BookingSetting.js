import mongoose from "mongoose";

// currency subdoc
const currencySchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  symbol: { type: String, required: true },
}, { _id: false });

// time window subdoc (e.g., advance min/max, cancel window)
const timeWindowSchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ["Minutes", "Hours", "Days", "Weeks", "Months", "Years"], required: true },
}, { _id: false });

const BookingSettingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    unique: true,
  },

  // basics
  operatingCountry: { type: String, default: "United Kingdom" },
  timezone: { type: String, default: "Europe/London" },
  currency: { type: [currencySchema], required: true }, // keep array as you designed

  // maps/api keys
  googleApiKeys: {
    browser: { type: String, default: "" },
    server: { type: String, default: "" },
    android: { type: String, default: "" },
    ios: { type: String, default: "" },
  },

  // routing prefs
  avoidRoutes: {
    highways: { type: Boolean, default: false },
    tolls: { type: Boolean, default: false },
    ferries: { type: Boolean, default: false },
  },

  // distance unit
  distanceUnit: { type: String, enum: ["Miles", "Kilometers"], default: "Miles" },

  // feature toggles
  hourlyPackage: { type: Boolean, default: false },

  // booking windows
  advanceBookingMin: { type: timeWindowSchema, default: { value: 12, unit: "Hours" } },
  advanceBookingMax: { type: timeWindowSchema, default: { value: 2, unit: "Years" } },
  cancelBookingWindow: { type: timeWindowSchema, default: { value: 6, unit: "Hours" } },

  // policy text
  cancelBookingTerms: { type: String, default: "" },

}, { timestamps: true });

export default mongoose.model("BookingSetting", BookingSettingSchema);
