import mongoose from "mongoose";

const JourneySchema = new mongoose.Schema({
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  additionalDropoff1: { type: String },
  additionalDropoff2: { type: String },

  doorNumber: { type: String },
  arrivefrom: { type: String },
  flightNumber: { type: String },
  pickmeAfter: { type: String },

  notes: { type: String },
  internalNotes: { type: String },

  date: { type: Date, required: true },
  hour: { type: Number, required: true },
  minute: { type: Number, required: true },

  fare: { type: Number, default: 0 },
  hourlyOption: {
    type: String,
    enum: ["40 miles 4 hours", "60 miles 6 hours", "80 miles 8 hours"],
    default: null,
  }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ["Transfer", "Hourly"],
    required: true,
  },
  returnJourney: {
    type: Boolean,
    required: true,
  },
  journey1: {
    type: JourneySchema,
    required: true,
  },
  journey2: {
    type: JourneySchema,
    required: function () {
      return this.returnJourney;
    },
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  status: { type: String, default: "No Show" },
  source: { type: String },
  referrer: { type: String },
}, { timestamps: true });

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
