// models/LocationCategory.js
import mongoose from "mongoose";
const FieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Optional", "Required"],
    default: "Optional",
  },
  inputType: {
    type: String,
    enum: ["Text Value", "Select Box"],
    default: "Text Value",
  },
  selectValues: {
    type: [String], // Store as array of strings for cleaner access
    default: [],
  },
});

const LocationCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pickupFields: [FieldSchema],
    dropoffFields: [FieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model("LocationCategory", LocationCategorySchema);
