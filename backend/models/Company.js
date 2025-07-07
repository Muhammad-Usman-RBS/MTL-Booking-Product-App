import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: String,
  contactName: String,
  email: String,
  website: String,
  designation: String,
  contact: String,
  city: String,
  dueDays: Number,
  state: String,
  zip: String,
  passphrase: String,
  country: String,
  designation: String,
  dueDays: Number,
  bookingPayment: String,
  invoicePayment: String,
  showLocations: String,
  address: String,
  invoiceTerms: String,
  profileImage: String,
  cookieConsent: String,
  tradingName: String,
  licenseNo: String,
  licenseReferenceLink: String,
  clientAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },  
  fullName: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export default mongoose.model('Company', companySchema);