import mongoose from "mongoose";

const termsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    content: {
      type: String,
      required: [true, "Please provide the content"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      enum: [
        "superadmin",
        "clientadmin",
        "driver",
        "customer",
        "associateadmin",
      ],
    },
    targetAudience: {
      type: [String],
      default: [],
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);
export default mongoose.model("TermsAndConditions", termsSchema);