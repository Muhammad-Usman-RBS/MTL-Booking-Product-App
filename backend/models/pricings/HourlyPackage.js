import mongoose from "mongoose";

const hourlyPackageSchema = new mongoose.Schema({
    distance: {
        type: Number,
        required: true
    },
    hours: {
        type: Number,
        required: true
    },
    standardSaloon: {
        type: Number,
        required: true
    },
    executiveSaloon: {
        type: Number,
        required: true
    },
    vipSaloon: {
        type: Number,
        required: true
    },
    luxuryMPV: {
        type: Number,
        required: true
    },
    eightPassengerMPV: {
        type: Number,
        required: true
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

}, { timestamps: true });

const HourlyPackage = mongoose.model('HourlyPackage', hourlyPackageSchema);

export default HourlyPackage;