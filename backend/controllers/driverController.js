import Driver from "../models/Driver.js";

export const createDriver = async (req, res) => {
    try {
        const {
            motExpiryDate,
            employeeNumber,
            status,
            firstName,
            surName,
            driverPrivateHireLicenseExpiry,
            privateHireCardNo,
            dateOfBirth,
            carRegistration,
            email,
            address,
            vehicleTypes,
            carMake,
            carModal,
            carColor,
            carPrivateHireLicense,
            carPrivateHireLicenseExpiry,
            carInsuranceExpiry,
            contact,
            driverLicense,
            driverLicenseExpiry,
            NationalInsurance,
            availability,
        } = req.body;

        let parsedAvailability = [];

        try {
            const arr = typeof availability === "string" ? JSON.parse(availability) : availability;

            if (Array.isArray(arr)) {
                parsedAvailability = arr
                    .filter((a) => a.from && a.to)
                    .map((a) => ({
                        from: new Date(a.from),
                        to: new Date(a.to),
                    }));
            }
        } catch (err) {
            parsedAvailability = [];
        }


        const buildUploadedField = (fieldName) => {
            const file = req.files[fieldName]?.[0];
            return file ? file.path : null;
        };
        const newDriver = new Driver({
            DriverData: {
                employeeNumber,
                status,
                firstName,
                surName,
                dateOfBirth,
                privateHireCardNo,
                email,
                address,
                contact,
                driverLicense,
                driverLicenseExpiry,
                driverPrivateHireLicenseExpiry,
                NationalInsurance,
                availability: parsedAvailability,
            },
            VehicleData: {
                carRegistration,
                carMake,
                carModal,
                carColor,
                vehicleTypes: vehicleTypes?.split(",") || [],
                carPrivateHireLicense,
                carPrivateHireLicenseExpiry,
                carInsuranceExpiry,
                motExpiryDate,
            },
            UploadedData: {
                driverPicture: buildUploadedField("driverPicture"),
                privateHireCard: buildUploadedField("privateHireCard"),
                dvlaCard: buildUploadedField("dvlaCard"),
                carPicture: buildUploadedField("carPicture"),
                privateHireCarPaper: buildUploadedField("privateHireCarPaper"),
                driverPrivateHirePaper: buildUploadedField("driverPrivateHirePaper"),
                insurance: buildUploadedField("insurance"),
                motExpiry: buildUploadedField("motExpiry"),
                V5: buildUploadedField("V5"),
            },
        });
        await newDriver.save();

        res.status(201).json({
            message: "Driver profile created successfully",
            driver: newDriver,
        });
    } catch (err) {
        console.error("Error creating driver:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.status(200).json({ success: true, drivers });
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getDriverById = async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }
        res.status(200).json({ message: "Driver fetched successfully", driver });
    } catch (error) {
        console.error("Error in getDriverById controller:", error);
        return res.status(500).json({
            message: "Server error while fetching driver",
            error: error.message,
        });
    }
};

export const updateDriverById = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            motExpiryDate,
            employeeNumber,
            status,
            firstName,
            surName,
            driverPrivateHireLicenseExpiry,
            privateHireCardNo,
            dateOfBirth,
            carRegistration,
            email,
            address,
            vehicleTypes,
            carMake,
            carModal,
            carColor,
            carPrivateHireLicense,
            carPrivateHireLicenseExpiry,
            carInsuranceExpiry,
            contact,
            driverLicense,
            driverLicenseExpiry,
            NationalInsurance,
            availability,
        } = req.body;

        let parsedAvailability = [];

        try {
            const arr = typeof availability === "string" ? JSON.parse(availability) : availability;

            if (Array.isArray(arr)) {
                parsedAvailability = arr
                    .filter((a) => a.from && a.to)
                    .map((a) => ({
                        from: new Date(a.from),
                        to: new Date(a.to),
                    }));
            }
        } catch (err) {
            parsedAvailability = [];
        }

        const buildUploadedField = (fieldName, existingValue) => {
            const file = req.files?.[fieldName]?.[0];
            return file ? file.path : existingValue || null;
        };

        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
        }

        // Update driver data
        driver.DriverData = {
            employeeNumber,
            status,
            firstName,
            surName,
            dateOfBirth,
            privateHireCardNo,
            email,
            address,
            contact,
            driverLicense,
            driverLicenseExpiry,
            driverPrivateHireLicenseExpiry,
            NationalInsurance,
            availability: parsedAvailability,
        };

        // Update vehicle data
        driver.VehicleData = {
            carRegistration,
            carMake,
            carModal,
            carColor,
            vehicleTypes: vehicleTypes?.split(",") || [],
            carPrivateHireLicense,
            carPrivateHireLicenseExpiry,
            carInsuranceExpiry,
            motExpiryDate,
        };

        // Update uploaded data
        driver.UploadedData = {
            driverPicture: buildUploadedField("driverPicture", driver.UploadedData?.driverPicture),
            privateHireCard: buildUploadedField("privateHireCard", driver.UploadedData?.privateHireCard),
            dvlaCard: buildUploadedField("dvlaCard", driver.UploadedData?.dvlaCard),
            carPicture: buildUploadedField("carPicture", driver.UploadedData?.carPicture),
            privateHireCarPaper: buildUploadedField("privateHireCarPaper", driver.UploadedData?.privateHireCarPaper),
            driverPrivateHirePaper: buildUploadedField("driverPrivateHirePaper", driver.UploadedData?.driverPrivateHirePaper),
            insurance: buildUploadedField("insurance", driver.UploadedData?.insurance),
            motExpiry: buildUploadedField("motExpiry", driver.UploadedData?.motExpiry),
            V5: buildUploadedField("V5", driver.UploadedData?.V5),
        };

        await driver.save();

        res.status(200).json({
            message: "Driver profile updated successfully",
            driver,
        });
    } catch (err) {
        console.error("Error updating driver:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteDriverById = async (req, res) => {
    try {
        const { id } = req.params;

        const driver = await Driver.findById(id);

        if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
        }

        if (driver.DriverData.status === "Deleted") {
            await Driver.findByIdAndDelete(id);
            return res.status(200).json({ message: "Driver permanently deleted" });
        } else {
            driver.DriverData.status = "Deleted";
            await driver.save();
            return res
                .status(200)
                .json({ message: "Driver status set to 'Deleted'" });
        }
    } catch (err) {
        console.error("Error deleting driver:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
