import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: String,
    tradingName: String,
    email: String,
    contact: String,
    licensedBy: String,
    licenseNumber: Number,
    website: String,
    cookieConsent: {
      type: String,
      enum: ["Yes", "No"],
    },

    address: String,
    
    profileImage: String,
    clientAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fullName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
