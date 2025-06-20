import mongoose from "mongoose";
const bookingRestrictionSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
    trim: true,
  },
  recurring: {
    type: String,
    enum: ["No", "Yearly"],
    default: "No",
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date, 
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
}, {
  timestamps: true,
});

export default mongoose.model("BookingRestriction", bookingRestrictionSchema);
