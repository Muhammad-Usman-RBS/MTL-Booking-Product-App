import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    priority: { type: Number, default: 0 },
    vehicleName: { type: String, required: true },
    image: { type: String }, // Cloudinary image URL
    passengers: { type: Number, default: 0 },
    smallLuggage: { type: Number, default: 0 },
    largeLuggage: { type: Number, default: 0 },
    childSeat: { type: Number, default: 0 },
    priceType: { type: String, enum: ["Percentage", "Amount"], default: "Amount" },
    price: { type: Number, default: 0 },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Vehicle", vehicleSchema);
