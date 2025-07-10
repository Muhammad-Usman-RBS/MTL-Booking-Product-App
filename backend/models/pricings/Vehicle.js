import mongoose from 'mongoose';

// Define the validation function first
function arrayLimit(val) {
    return val.length <= 10;
}

const slabSchema = new mongoose.Schema(
    {
        from: { type: Number, required: true },
        to: { type: Number, required: true },
        price: { type: Number, required: true }, // Price per mile for this slab
        pricePerMile: { type: Number, required: false }, // new field
    },
    { _id: false } // no need for individual _id in slabs
);

const vehicleSchema = new mongoose.Schema({
    priority: { type: Number, default: 0 },
    vehicleName: { type: String, required: true },
    image: { type: String },
    passengers: { type: Number, default: 0 },
    handLuggage: { type: Number, default: 0 },
    checkinLuggage: { type: Number, default: 0 },
    childSeat: { type: Number, default: 0 },
    priceType: { type: String, default: "Percentage" },
    percentageIncrease: { type: Number, default: 0 },

    // Features array with limit validation
    features: {
        type: [String],
        validate: [arrayLimit, '{PATH} exceeds the limit of 10'],
    },

    slabs: {
        type: [slabSchema],
        default: [],
    },

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Vehicle', vehicleSchema);
