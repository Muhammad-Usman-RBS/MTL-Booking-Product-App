import mongoose from "mongoose";

const postcodePriceSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    pickup: {
        type: String,
        required: true,
    },
    dropoff: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const PostcodePrice = mongoose.model("PostcodePrice", postcodePriceSchema);
export default PostcodePrice;