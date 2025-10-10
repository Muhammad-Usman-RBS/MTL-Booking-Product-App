import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobStatus: {
      type: String,
      enum: ["New", "Accepted", "Rejected", "Already Assigned"],
      default: "New",
    },
    driverRejectionNote: {
      type: String,
      default: null,
    },
    history: [
      {
        status: {
          type: String,
          enum: ["New", "Accepted", "Rejected", "Already Assigned"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
      },
    ],

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Job = mongoose.model("Job", jobSchema);
export default Job;