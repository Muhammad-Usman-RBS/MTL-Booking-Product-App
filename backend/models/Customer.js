import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            default: "N/A",
        },
        homeAddress: {
            type: String,
            default: "N/A",
        },
        status: {
            type: String,
            enum: ["Active", "Suspended", "Pending", "Deleted"],
            default: "Active",
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        profile: { type: String, default: "" },
    },
    { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
