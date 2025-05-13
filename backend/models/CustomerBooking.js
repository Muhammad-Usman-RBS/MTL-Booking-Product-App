import mongoose from 'mongoose';

const customerBookingSchema = new mongoose.Schema({
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  source: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  status: { type: String, default: "No Show" }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Customer Booking', customerBookingSchema);
