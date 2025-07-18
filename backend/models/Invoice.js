import mongoose from "mongoose";
const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false }
);

const InvoiceItemSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
    },
    pickup: { type: String, required: true },
    dropoff: { type: String, required: true },
    date: { type: Date, required: true },
    fare: { type: Number, required: true },
    notes: { type: String },
    internalNotes: { type: String },
    

    tax: {
      type: String,
      enum: ["No Tax", "Tax"],
      default: "No Tax",
    },
    source: { type: String },
    totalAmount: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    customer: CustomerSchema,
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    discount: Number,
    deposit: Number,
    items: [InvoiceItemSchema],
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", InvoiceSchema);
export default Invoice;
