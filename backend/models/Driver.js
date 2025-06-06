import mongoose from "mongoose";

const DriverDataSchema = new mongoose.Schema({
    employeeNumber: String,
    status: String,
    firstName: { type: String, },
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
            from: { type: Date, },
            to: { type: Date, },
        },
    ]
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
    driverPicture: {
        url: String,
        name: String,
    },
    privateHireCard: {
        url: String,
        name: String,
    },
    dvlaCard: {
        url: String,
        name: String,
    },
    carPicture: {
        url: String,
        name: String,
    },
    privateHireCarPaper: {
        url: String,
        name: String,
    },
    driverPrivateHirePaper: {
        url: String,
        name: String,
    },
    insurance: {
        url: String,
        name: String,
    },
    motExpiry: {
        url: String,
        name: String,
    },
    V5: {
        url: String,
        name: String,
    }
}, { _id: false });

const DriverProfileSchema = new mongoose.Schema({
    DriverData: DriverDataSchema,
    VehicleData: VehicleDataSchema,
    UploadedData: UploadedDataSchema,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DriverProfile", DriverProfileSchema)