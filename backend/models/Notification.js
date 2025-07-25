import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    employeeNumber: {
      type: String,
      required: true,
    },
    bookingId: {
        type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    
    primaryJourney: {
      pickup: { type: String, required: true },
      dropoff: { type: String, required: true },
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
