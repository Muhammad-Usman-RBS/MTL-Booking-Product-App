import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema(
  {
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, min: 0, max: 5 },
    lastSentAt: { type: Date, default: Date.now },
    // store temp plain password only till verification
    tempPassword: { type: String },
  },
  { _id: false }
);

const EMAIL_MAX = 254;
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: EMAIL_MAX,
      validate: {
        validator: (v) => EMAIL_RE.test(v || ""),
        message: "Invalid email",
      },
    },
    bookingFilterPreferences: {
      selectedStatus: { type: [String], default: ["All"] },
      selectedColumns: {
        type: [String],
        default: [
          "bookingType",
          "bookingId",
          "passenger",
          "date",
          "pickUp",
          "dropOff",
          "flightNumber",
          "flightOrigin",
          "flightDestination",
          "flightArrivalScheduled",
          "flightArrivalEstimated",
          "vehicle",
          "payment",
          "journeyFare",
          "createdAt",
          "driverFare",
          "returnJourneyFare",
          "returnDriverFare",
          "driver",
          "status",
          "actions",
        ],
      },
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
      enum: [
        "superadmin",
        "clientadmin",
        "staffmember",
        "associateadmin",
        "driver",
        "customer",
        "demo",
      ],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Suspended", "Deleted"],
      default: "Pending",
    },

    permissions: { type: [String], default: ["Home"] },
    emailPreference: { type: Boolean, default: false },

    profileImage: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    associateAdminLimit: { type: Number, enum: [0, 3, 5, 10], default: 0 },
    googleCalendar: {
      access_token: { type: String, select: false },
      refresh_token: { type: String, select: false },
      calendarId: { type: String },
    },
    googleAuthTransactionId: { type: String, default: null, index: true },

    loginHistory: [
      {
        loginAt: { type: Date, default: Date.now },
        systemIpAddress: String,
        location: String,
      },
    ],

    vatnumber: { type: String, default: null },
    employeeNumber: { type: String, default: null },

    verification: { type: VerificationSchema, default: undefined },
    verifiedAt: { type: Date },

    // SuperAdmin company details
    superadminCompanyLogo: { type: String, default: "" },
    superadminCompanyName: { type: String, default: "" },
    superadminCompanyAddress: { type: String, default: "" },
    superadminCompanyPhoneNumber: { type: String, default: "" },
    superadminCompanyEmail: { type: String, default: "" },
    superadminCompanyWebsite: { type: String, default: "" },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);
userSchema.index({ email: 1, companyId: 1 }, { unique: true });
export default mongoose.model("User", userSchema);