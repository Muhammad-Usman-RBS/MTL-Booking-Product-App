import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver"
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    jobStatus: {
        type: String,
        enum: ["New", "Accepted", "Rejected"],
        default: "New"
    },
    history: [
        {
            status: {
                type: String,
                enum: ["New", "Accepted", "Rejected", "Reassigned"]
            },
            date: {
                type: Date,
                default: Date.now
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            reason: String
        }
    ]
}, {
    timestamps: true
});

const Job = mongoose.model("Job", jobSchema);
export default Job;