import mongoose from 'mongoose';

// ✅ Define the validation function first
function arrayLimit(val) {
    return val.length <= 10;
}

const vehicleSchema = new mongoose.Schema({
    priority: { type: Number, default: 0 },
    vehicleName: { type: String, required: true },
    image: { type: String },
    passengers: { type: Number, default: 0 },
    smallLuggage: { type: Number, default: 0 },
    largeLuggage: { type: Number, default: 0 },
    childSeat: { type: Number, default: 0 },
    priceType: { type: String },
    price: { type: Number, default: 0 },

    // ✅ Features array with limit validation
    features: {
        type: [String],
        validate: [arrayLimit, '{PATH} exceeds the limit of 10'],
    },

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Vehicle', vehicleSchema);
