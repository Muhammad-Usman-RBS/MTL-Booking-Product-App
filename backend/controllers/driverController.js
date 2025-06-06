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

        // File paths
        const driverPicturePath = req.files["driverPicture"]?.[0]?.path || null;
        const privateHireCardPath = req.files["privateHireCard"]?.[0]?.path || null;
        const dvlaCardPath = req.files["dvlaCard"]?.[0]?.path || null;
        const carPicturePath = req.files["carPicture"]?.[0]?.path || null;
        const privateHireCarPaperPath =
            req.files["privateHireCarPaper"]?.[0]?.path || null;
        const driverPrivateHirePaperPath =
            req.files["driverPrivateHirePaper"]?.[0]?.path || null;
        const insurancePath = req.files["insurance"]?.[0]?.path || null;
        const motExpiryPath = req.files["motExpiry"]?.[0]?.path || null;
        const V5Path = req.files["V5"]?.[0]?.path || null;
        console.log("req.files:", req.files);

        let parsedAvailability = [];

        if (
            availability &&
            Array.isArray(availability) &&
            availability.length > 0
        ) {
            // Filter out empty availability objects
            const validAvailability = availability.filter(
                (item) =>
                    item.from &&
                    item.to &&
                    item.from.trim() !== "" &&
                    item.to.trim() !== ""
            );

            if (validAvailability.length > 0) {
                parsedAvailability = validAvailability.map((item) => ({
                    from: new Date(item.from),
                    to: new Date(item.to),
                }));
            }
        } else if (typeof availability === "string" && availability.trim() !== "") {
            try {
                const parsed = JSON.parse(availability);
                if (Array.isArray(parsed)) {
                    const validAvailability = parsed.filter(
                        (item) =>
                            item.from &&
                            item.to &&
                            item.from.trim() !== "" &&
                            item.to.trim() !== ""
                    );

                    if (validAvailability.length > 0) {
                        parsedAvailability = validAvailability.map((item) => ({
                            from: new Date(item.from),
                            to: new Date(item.to),
                        }));
                    }
                }
            } catch (err) {
                // If parsing fails, keep parsedAvailability as empty array
                console.log("Failed to parse availability, using empty array");
            }
        }

        // // Check required fields
        // if ( !motExpiryDate ||
        //   !employeeNumber ||
        //   !status ||
        //   !firstName ||
        //   !surName ||
        //   !driverPrivateHireLicenseExpiry ||
        //   !privateHireCardNo ||
        //   !dateOfBirth ||
        //   !carRegistration ||
        //   !email ||
        //   !address ||
        //   !vehicleTypes ||
        //   !carMake ||
        //   !carModal ||
        //   !carColor ||
        //   !carPrivateHireLicense ||
        //   !carPrivateHireLicenseExpiry ||
        //   !carInsuranceExpiry ||
        //   !contact ||
        //   !driverLicense ||
        //   !driverLicenseExpiry ||
        //   !NationalInsurance

        // ) {
        //   return res.status(400).json({ error: "All fields are required" });
        // }


        const buildUploadedField = (fieldName) => {
            const file = req.files[fieldName]?.[0];
            return file ? { url: file.path, name: file.originalname } : null;
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
        return res
            .status(500)
            .json({
                message: "Server error while fetching driver",
                error: error.message,
            });
    }
};

export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();

        const currentDate = new Date();

        // Iterate over all drivers to check if any documents have expired
        const updatedDrivers = await Promise.all(
            drivers.map(async (driver) => {
                const {
                    carPrivateHireLicenseExpiry,
                    carInsuranceExpiry,
                    driverLicenseExpiry,
                    motExpiryDate,
                    driverPrivateHireLicenseExpiry,
                } = driver;

                const isExpired =
                    new Date(carPrivateHireLicenseExpiry) < currentDate ||
                    new Date(carInsuranceExpiry) < currentDate ||
                    new Date(driverLicenseExpiry) < currentDate ||
                    new Date(driverPrivateHireLicenseExpiry) < currentDate ||
                    new Date(motExpiryDate) < currentDate;

                // If expired, update the status to 'Expired' and save it in the database
                if (isExpired && driver.status !== "Expired") {
                    driver.status = "Expired";
                    await driver.save(); // Save the updated status in the database
                }

                return {
                    ...driver.toObject(),
                    status: isExpired ? "Expired" : driver.status,
                };
            })
        );

        res.status(200).json(updatedDrivers);
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ error: "Failed to fetch drivers" });
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

export const updateDriverById = async (req, res) => {
    try {
        const driverId = req.params.id;

        let parsedAvailability = [];
        if (req.body.availability) {
            try {
                const availabilityArray = JSON.parse(req.body.availability);
                if (Array.isArray(availabilityArray)) {
                    parsedAvailability = availabilityArray
                        .filter(item => item.from && item.to)
                        .map(item => ({
                            from: new Date(item.from),
                            to: new Date(item.to),
                        }));
                }
            } catch (err) {
                console.error("Failed to parse availability in update:", err);
            }
        }

        // 2. Parse vehicleTypes
        let vehicleTypes = req.body.vehicleTypes;
        if (typeof vehicleTypes === "string") {
            vehicleTypes = vehicleTypes.split(",").map(v => v.trim());
        }

        // 3. Process uploaded files
        const filePaths = {};
        const fileFields = [
            "driverPicture",
            "privateHireCard",
            "dvlaCard",
            "carPicture",
            "privateHireCarPaper",
            "driverPrivateHirePaper",
            "insurance",
            "motExpiry",
            "V5",
        ];


        // 4. Build update object using dot notation
        const updateFields = {};
        fileFields.forEach((field) => {
            if (req.files && req.files[field]) {
                const file = req.files[field][0];
                updateFields[UploadedData.${ field }] = {
                    url: file.path,
                        name: file.originalname,
          };
            }
        });
        // DriverData
        if (req.body.employeeNumber) updateFields["DriverData.employeeNumber"] = req.body.employeeNumber;
        if (req.body.status) updateFields["DriverData.status"] = req.body.status;
        if (req.body.firstName) updateFields["DriverData.firstName"] = req.body.firstName;
        if (req.body.surName) updateFields["DriverData.surName"] = req.body.surName;
        if (req.body.dateOfBirth) updateFields["DriverData.dateOfBirth"] = req.body.dateOfBirth;
        if (req.body.privateHireCardNo) updateFields["DriverData.privateHireCardNo"] = req.body.privateHireCardNo;
        if (req.body.email) updateFields["DriverData.email"] = req.body.email;
        if (req.body.address) updateFields["DriverData.address"] = req.body.address;
        if (req.body.contact) updateFields["DriverData.contact"] = req.body.contact;
        if (req.body.driverLicense) updateFields["DriverData.driverLicense"] = req.body.driverLicense;
        if (req.body.driverLicenseExpiry) updateFields["DriverData.driverLicenseExpiry"] = req.body.driverLicenseExpiry;
        if (req.body.driverPrivateHireLicenseExpiry) updateFields["DriverData.driverPrivateHireLicenseExpiry"] = req.body.driverPrivateHireLicenseExpiry;
        if (req.body.NationalInsurance) updateFields["DriverData.NationalInsurance"] = req.body.NationalInsurance;
        if (parsedAvailability.length) updateFields["DriverData.availability"] = parsedAvailability;

        // VehicleData
        if (req.body.carRegistration) updateFields["VehicleData.carRegistration"] = req.body.carRegistration;
        if (req.body.carMake) updateFields["VehicleData.carMake"] = req.body.carMake;
        if (req.body.carModal) updateFields["VehicleData.carModal"] = req.body.carModal;
        if (req.body.carColor) updateFields["VehicleData.carColor"] = req.body.carColor;
        if (vehicleTypes?.length) updateFields["VehicleData.vehicleTypes"] = vehicleTypes;
        if (req.body.carPrivateHireLicense) updateFields["VehicleData.carPrivateHireLicense"] = req.body.carPrivateHireLicense;
        if (req.body.carPrivateHireLicenseExpiry) updateFields["VehicleData.carPrivateHireLicenseExpiry"] = req.body.carPrivateHireLicenseExpiry;
        if (req.body.carInsuranceExpiry) updateFields["VehicleData.carInsuranceExpiry"] = req.body.carInsuranceExpiry;
        if (req.body.motExpiryDate) updateFields["VehicleData.motExpiryDate"] = req.body.motExpiryDate;

        // UploadedData
        Object.entries(filePaths).forEach(([key, value]) => {
            updateFields[UploadedData.${ key }] = value;
        });

        // 5. Perform update with $set
        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({ error: "Driver not found" });
        }

        res.status(200).json({
            message: "Driver profile updated successfully",
            driver: updatedDriver,
        });
    } catch (err) {
        console.error("Error updating driver:", err);
        res.status(500).json({ error: "Server error" });
    }
};