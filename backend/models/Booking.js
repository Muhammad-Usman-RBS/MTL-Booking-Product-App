import mongoose from "mongoose";

// Journey Subdocument
const JourneySchema = new mongoose.Schema({
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  additionalDropoff1: { type: String },
  additionalDropoff2: { type: String },

  pickupDoorNumber: { type: String },
  dropoffDoorNumber0: { type: String },
  dropoffDoorNumber1: { type: String },
  dropoffDoorNumber2: { type: String },

  terminal: { type: String },
  dropoff_terminal_0: { type: String },
  dropoff_terminal_1: { type: String },
  dropoff_terminal_2: { type: String },

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
    default: null,
  },

  distanceText: { type: String },
  durationText: { type: String },
}, { _id: false });

// Vehicle Info Subdocument
const VehicleInfoSchema = new mongoose.Schema({
  vehicleName: { type: String, required: true },
  passenger: { type: Number, default: 0 },
  childSeat: { type: Number, default: 0 },
  handLuggage: { type: Number, default: 0 },
  checkinLuggage: { type: Number, default: 0 },
}, { _id: false });

// Passenger Subdocument
const PassengerSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
}, { _id: false });

// Status Audit Entry Subdocument
const StatusAuditSchema = new mongoose.Schema({
  updatedBy: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { _id: false });

// Booking Schema
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
  vehicle: {
    type: VehicleInfoSchema,
    required: true,
  },
  passenger: {
    type: PassengerSchema,
    required: false,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  status: { type: String, default: "No Show" },

  // ✅ NEW: Status Change Audit
  statusAudit: {
    type: [StatusAuditSchema],
    default: [],
  },

  source: { type: String },
  referrer: { type: String },
}, { timestamps: true });

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
