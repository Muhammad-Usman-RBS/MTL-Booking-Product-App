import mongoose from "mongoose";
const BillToSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    vatnumber: { type: String },
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
    invoiceType: {
      type: String,
      enum: ["customer", "driver"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    customer: BillToSchema,
    driver: BillToSchema,
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    discount: Number,
    deposit: Number,
    items: [InvoiceItemSchema],

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);
const Invoice = mongoose.model("Invoice", InvoiceSchema);
export default Invoice;