import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
  otpHash: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0, min: 0, max: 5 },
  lastSentAt: { type: Date, default: Date.now },
  // NEW: store temp plain password only till verification
  tempPassword: { type: String },
}, { _id: false });

const EMAIL_MAX = 254;
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: EMAIL_MAX,
    validate: { validator: v => EMAIL_RE.test(v || ""), message: "Invalid email" },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  fullName: { type: String, trim: true, required: true },

  role: {
    type: String,
    enum: ["superadmin", "clientadmin", "staffmember", "associateadmin", "driver", "customer", "demo"],
    default: "customer",
  },
  status: {
    type: String,
    enum: ["Active", "Pending", "Suspended", "Deleted"],
    default: "Pending",
  },

  permissions: { type: [String], default: ["Home"] },

  profileImage: { type: String, default: "" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  associateAdminLimit: { type: Number, enum: [0, 3, 5, 10], default: 0 },

  googleCalendar: {
    access_token: { type: String, select: false },
    refresh_token: { type: String, select: false },
    calendarId: { type: String },
  },
  googleAuthTransactionId: { type: String, default: null, index: true },

  loginHistory: [{
    loginAt: { type: Date, default: Date.now },
    systemIpAddress: String,
    location: String,
  }],

  verification: { type: VerificationSchema, default: undefined },
  verifiedAt: { type: Date },

  // NEW FIELDS for SuperAdmin company details
  superadminCompanyName: { type: String, default: "" },
  superadminCompanyAddress: { type: String, default: "" },
  superadminCompanyPhoneNumber: { type: String, default: "" },
  superadminCompanyEmail: { type: String, default: "" },
  superadminCompanyWebsite: { type: String, default: "" },

}, { timestamps: true });

export default mongoose.model("User", userSchema);
