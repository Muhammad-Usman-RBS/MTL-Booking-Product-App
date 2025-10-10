import mongoose from "mongoose";

const bookingSettingSchema = new mongoose.Schema(
  {
    operatingCountry: { type: String, default: "United Kingdom" },
    timezone: { type: String, default: "Europe/London" },
    currency: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        symbol: { type: String, required: true },
      },
    ],
    currencyApplication: {
      type: String,
      enum: ["All Bookings", "New Bookings Only"],
      default: "New Bookings Only",
    },
    googleApiKeys: {
      browser: { type: String, default: "" },
      server: { type: String, default: "" },
      android: { type: String, default: "" },
      ios: { type: String, default: "" },
    },
    avoidRoutes: {
      highways: { type: Boolean, default: false },
      tolls: { type: Boolean, default: false },
      ferries: { type: Boolean, default: false },
    },
    distanceUnit: {
      type: String,
      enum: ["Miles", "KMs"],
      default: "Miles",
    },
    hourlyPackage: {
      type: Boolean,
      default: false,
    },
    advanceBookingMin: {
      value: { type: Number, default: 12 },
      unit: { type: String, enum: ["Hours"], default: "Hours" },
    },
    cancelBookingWindow: {
      value: { type: Number, default: 6 },
      unit: { type: String, enum: ["Hours", "Days"], default: "Hours" },
    },
    cancelBookingTerms: {
      type: String,
      default: "",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
const BookingSetting = mongoose.model("BookingSetting", bookingSettingSchema);
export default BookingSetting;