import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        address: { type: String, default: "N/A" },
        homeAddress: { type: String, default: "N/A" },
        profile: { type: String },
        status: {
            type: String,
            enum: ["Active", "Suspended", "Pending", "Deleted"],
            default: "Active",
        },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

        // New fields from the form
        primaryContactName: { type: String, default: "" },
        primaryContactDesignation: { type: String, default: "" },
        website: { type: String, default: "" },
        city: { type: String, default: "" },
        stateCounty: { type: String, default: "" },
        postcode: { type: String, default: "" },
        country: { type: String, default: "" },

        locationsDisplay: { type: String, enum: ["Yes", "No"], default: "Yes" },
        paymentOptionsInvoice: { type: String, default: "" },
        invoiceDueDays: { type: Number, default: 1 },
        invoiceTerms: { type: String, default: "" },
        passphrase: { type: String, default: "" },
        vatnumber: { type: String, default: "" },
    },
    { timestamps: true }
);

const CorporateCustomer = mongoose.model("CorporateCustomer", customerSchema);

export default CorporateCustomer;
