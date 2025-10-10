import mongoose from "mongoose";

const paymentOptionSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Paypal", "Stripe", "Invoice", "PaymentLink"],
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    settings: {
      clientId: { type: String },
      clientSecret: { type: String },

      // For Stripe
      publishableKey: { type: String },
      secretKey: { type: String },
      webhookEndpointUrl: { type: String },
      webhookEvents: { type: String },
      webhookSigningSecret: { type: String },

      // For Invoice
      invoicePrefix: { type: String, default: "INV-" },
      invoiceEmailTemplate: { type: String },
      dueDays: { type: Number, default: 30 },
      lateFeePercentage: { type: Number, default: 5 },
      autoReminderDays: { type: String, default: "7, 14, 21" },

      // For Payment Link
      linkExpiryHours: { type: Number, default: 24 },
      successRedirectUrl: { type: String },
      failureRedirectUrl: { type: String },
      paymentLinkTemplate: {
        type: String,
        default: "https://yourdomain.com/pay/{linkId}",
      },
      smsTemplate: { type: String },

      // Generic fields for other payment methods
      apiKey: { type: String },
      apiSecret: { type: String },
      merchantId: { type: String },
      environment: {
        type: String,
        enum: ["sandbox", "live"],
        default: "sandbox",
      },
    },

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
const PaymentOption = mongoose.model("PaymentOption", paymentOptionSchema);
export default PaymentOption;