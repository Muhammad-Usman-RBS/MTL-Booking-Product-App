

import mongoose from "mongoose";

const themeSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true }, 
  name: {type: String , default: "Custom Theme"},
  isDefault: {
    type: Boolean,
    default: false
  },
  lastApplied: { type: Boolean, default: false },
  themeSettings: {
    bg: {
      type: String,
      default: "#ffffff",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    text: {
      type: String,
      default: "#000000",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    primary: {
      type: String,
      default: "#1e90ff",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    hover: {
      type: String,
      default: "#ff6347",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    active: {
      type: String,
      default: "#32cd32",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    
  },
  isActive: { type: Boolean, default: true }, // newest gets active flag
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});


const Theme = mongoose.model("Theme", themeSchema);
export default Theme;
