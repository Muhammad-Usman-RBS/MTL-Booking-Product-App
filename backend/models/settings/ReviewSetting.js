import mongoose from "mongoose";

const ReviewSettingSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    template: { type: String, required: true },
    reviewLink: { type: String, default: "" },
    reviewEmailSent: { type: Boolean, default: false },

    companyId: { type: mongoose.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
);
export default mongoose.model("ReviewSetting", ReviewSettingSchema);