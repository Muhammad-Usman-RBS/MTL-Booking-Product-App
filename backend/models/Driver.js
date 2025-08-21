// models/Driver.js

import mongoose from "mongoose";

// Define the schema
const DriverDataSchema = new mongoose.Schema({
  employeeNumber: String,
  status: String,
  firstName: { type: String },
  surName: String,
  dateOfBirth: Date,
  NationalInsurance: String,
  privateHireCardNo: String,
  email: String,
  address: String,
  contact: String,
  driverLicense: String,
  driverLicenseExpiry: Date,
  driverPrivateHireLicenseExpiry: Date,
  availability: [
    {
      from: { type: Date },
      to: { type: Date },
    },
  ],
  Notifications: {
    docExpiry: {
      lastSentAt: { type: Date },
      lastDocsHash: { type: String },
    },
  },
}, { _id: false });

const VehicleDataSchema = new mongoose.Schema({
  carRegistration: String,
  carMake: String,
  carModal: String,
  carColor: String,
  vehicleTypes: [String],
  carPrivateHireLicense: String,
  carPrivateHireLicenseExpiry: Date,
  carInsuranceExpiry: Date,
  motExpiryDate: Date,
}, { _id: false });

const UploadedDataSchema = new mongoose.Schema({
  driverPicture: String,
  privateHireCard: String,
  dvlaCard: String,
  carPicture: String,
  privateHireCarPaper: String,
  driverPrivateHirePaper: String,
  insurance: String,
  motExpiry: String,
  V5: String
}, { _id: false });

const DriverProfileSchema = new mongoose.Schema({
  DriverData: DriverDataSchema,
  VehicleData: VehicleDataSchema,
  UploadedData: UploadedDataSchema,
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company", // Reference to company model
  },
  createdAt: { type: Date, default: Date.now },
});

// Register model with the name 'Driver' (case-sensitive)
export default mongoose.model("driver", DriverProfileSchema);




// import mongoose from "mongoose";

// const DriverDataSchema = new mongoose.Schema({
//     employeeNumber: String,
//     status: String,
//     firstName: { type: String, },
//     surName: String,
//     dateOfBirth: Date,
//     NationalInsurance: String,
//     privateHireCardNo: String,
//     email: String,
//     address: String,
//     contact: String,
//     driverLicense: String,
//     driverLicenseExpiry: Date,
//     driverPrivateHireLicenseExpiry: Date,
//     availability: [
//         {
//             from: { type: Date, },
//             to: { type: Date, },
//         },
//     ]
// }, { _id: false });

// const VehicleDataSchema = new mongoose.Schema({
//     carRegistration: String,
//     carMake: String,
//     carModal: String,
//     carColor: String,
//     vehicleTypes: [String],
//     carPrivateHireLicense: String,
//     carPrivateHireLicenseExpiry: Date,
//     carInsuranceExpiry: Date,
//     motExpiryDate: Date,
// }, { _id: false });

// const UploadedDataSchema = new mongoose.Schema({
//     driverPicture: String,
//     privateHireCard: String,
//     dvlaCard: String,
//     carPicture: String,
//     privateHireCarPaper: String,
//     driverPrivateHirePaper: String,
//     insurance: String,
//     motExpiry: String,
//     V5: String
// }, { _id: false });

// const DriverProfileSchema = new mongoose.Schema({
//     DriverData: DriverDataSchema,
//     VehicleData: VehicleDataSchema,
//     UploadedData: UploadedDataSchema,
//     companyId: {
//     type: mongoose.Schema.Types.ObjectId,
//         ref:"Company",
//     },
//     createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("driver", DriverProfileSchema)