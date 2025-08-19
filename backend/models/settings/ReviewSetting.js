import mongoose from "mongoose";

const ReviewSettingSchema = new mongoose.Schema(
    {
        companyId: { type: mongoose.Types.ObjectId, required: true, index: true },
        subject: { type: String, required: true },
        template: { type: String, required: true },
        reviewLink: { type: String, default: "" },
        reviewEmailSent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ReviewSettingSchema.index({ companyId: 1 }, { unique: true });

export default mongoose.model("ReviewSetting", ReviewSettingSchema);
