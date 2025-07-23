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

  otpCode: { type: String },
  otpExpiresAt: { type: Date },

  role: {
    type: String,
    enum: ['superadmin', 'manager', 'clientadmin', 'staffmember', 'associateadmin', 'driver', 'customer', 'demo'], // Full roles
    default: 'customer',
  },

  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended', 'Deleted'],
    default: 'Active',
  },

  permissions: {
    type: [String],
    default: ['Home'],
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

  associateAdminLimit: {
    type: Number,
    enum: [5, 10, 15],
    default: 5,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  employeeNumber: {
    type: String,
    default: null,
  },

  // ✅ Google Calendar credentials per user
  googleCalendar: {
    access_token: { type: String },
    refresh_token: { type: String },
    calendarId: { type: String, default: 'primary' },
  },

}, { timestamps: true });

export default mongoose.model('User', userSchema);
