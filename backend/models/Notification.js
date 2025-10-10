import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    employeeNumber: {
      type: String,
      required: true,
    },
    bookingId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    expiryDetails: {
      driverName: String,
      driverEmployeeNumber: String,
      expiredDocuments: [String],
    },
    primaryJourney: {
      pickup: { type: String, required: false },
      dropoff: { type: String, required: false },
    },
    bookingSentAt: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Notification", notificationSchema);