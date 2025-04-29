import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,          // removes spaces automatically
    lowercase: true,     // email ko lowercase store karega
  },

  password: {
    type: String,
    required: true,
    minlength: 6,         // Password validation
  },

  fullName: {
    type: String,
    trim: true,
  },

  role: {
    type: String,
    enum: ['superadmin', 'manager', 'clientadmin', 'staffmember', 'driver', 'customer', 'demo'], // ✅ Full roles
    default: 'customer',
  },

  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended', 'Deleted'],
    default: 'Active',
  },

  permissions: {
    type: [String],
    default: [],
  },

  profileImage: {
    type: String,
    default: '',
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  loginHistory: [{
    loginAt: {
      type: Date,
      default: Date.now,
    },
    systemIpAddress: {
      type: String,
    },
    location: {
      type: String,
    },
  }],

}, { timestamps: true });

export default mongoose.model('User', userSchema);
