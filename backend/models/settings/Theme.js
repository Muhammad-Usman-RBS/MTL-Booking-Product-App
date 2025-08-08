import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  themeSettings: {
    bg: {
      type: String,
      default: "#ffffff",
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Background color must be a valid hex color'
      }
    },
    text: {
      type: String,
      default: "#000000",
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Text color must be a valid hex color'
      }
    },
    primary: {
      type: String,
      default: "#1e90ff",
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Primary color must be a valid hex color'
      }
    },
    hover: {
      type: String,
      default: "#ff6347",
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Hover color must be a valid hex color'
      }
    },
    active: {
      type: String,
      default: "#32cd32",
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Active color must be a valid hex color'
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
themeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Theme = mongoose.model('Theme', themeSchema);

export default Theme;