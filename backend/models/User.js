import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },

  role: {
    type: String,
    enum: ['superadmin', 'clientadmin', 'driver', 'customer'], // Only these roles are allowed
    default: 'customer',                                       // Default role is 'customer'
  },

  status: {
    type: String,
    enum: ['Active', 'Pending', 'Verified', 'Suspended', 'Finished', 'Delete Pending'],
    default: 'Active',
  },

  permissions: [{ type: String }],
  profileImage: { type: String },

  // Reference to the Company model (optional, used for Client Admins or Drivers)
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

  // Login history array to track access times and locations
  loginHistory: [{
    loginAt: { type: Date, default: Date.now },                // Timestamp of login
    systemIpAddress: String,                                   // IP address of login source
    location: String                                           // Geolocation or city name, optional
  }]
});

export default mongoose.model('User', userSchema);
