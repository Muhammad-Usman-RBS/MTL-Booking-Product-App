import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickup: String,
  drop: String,
  status: { type: String, default: 'pending' },
});

export default mongoose.model('Booking', bookingSchema);
