import mongoose from "mongoose";

const coverageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Pickup", "Dropoff", "Both"],
      required: true,
    },
    coverage: {
      type: String,
      enum: ["Allow", "Block"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Postcode", "Zone"],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    // Add zone coordinates field for when category is "Zone"
    zoneCoordinates: {
      type: [{
        lat: {
          type: Number,
          required: function() {
            return this.category === 'Zone';
          }
        },
        lng: {
          type: Number,
          required: function() {
            return this.category === 'Zone';
          }
        }
      }],
      default: undefined,
      required: function() {
        return this.category === 'Zone';
      }
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    }
  },
  { timestamps: true }
);


export default mongoose.model("Coverage", coverageSchema);