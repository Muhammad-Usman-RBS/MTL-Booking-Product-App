import Driver from "../models/Driver.js";
import User from "../models/User.js";
import { collectExpiredDocs } from "../utils/settings/cronjobs/expiry.js";

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
      companyId,
    } = req.body;

    let parsedAvailability = [];

    try {
      const existingDriver = await Driver.findOne({
        companyId,
        $or: [
          { "DriverData.employeeNumber": employeeNumber },
          { "DriverData.email": email },
        ],
      });

      if (existingDriver) {
        if (existingDriver.DriverData.employeeNumber === employeeNumber) {
          return res.status(400).json({
            message: "Driver with this employee number already exists",
          });
        }
        if (existingDriver.DriverData.email === email) {
          return res
            .status(400)
            .json({ message: "Driver with this email already exists" });
        }
      }
      if (!employeeNumber || !firstName || !surName) {
        return res.status(400).json({
          message: "Employee Number , First Name and Last Name are required",
        });
      }
      if (!companyId) {
        return res
          .status(500)
          .json({ message: " companyId is invalid or not provided" });
      }
      const arr =
        typeof availability === "string"
          ? JSON.parse(availability)
          : availability;

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
      companyId,
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
    const companyId = req?.user?.companyId;
    if (!companyId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized or missing company" });
    }

    const includeExpiry = String(req.query.includeExpiry || "false") === "true";
    const drivers = await Driver.find({ companyId });

    if (!includeExpiry) {
      return res.status(200).json({ success: true, drivers });
    }

    const annotated = drivers.map((d) => {
      const expiredDocs = collectExpiredDocs(d);
      return {
        ...d.toObject(),
        hasExpired: expiredDocs.length > 0,
        expiredDocs,
      };
    });

    return res.status(200).json({ success: true, drivers: annotated });
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
      const arr =
        typeof availability === "string"
          ? JSON.parse(availability)
          : availability;

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
    const oldEmail = driver?.DriverData?.email;
    const companyId = driver?.companyId;
    if (email && email !== oldEmail) {
      const exists = await Driver.findOne({
        companyId,
        "DriverData.email": email,
        _id: { $ne: id },
      });

      if (exists) {
        return res
          .status(400)
          .json({ message: "A driver already exists with this email" });
      }
    }

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

    driver.UploadedData = {
      driverPicture: buildUploadedField(
        "driverPicture",
        driver.UploadedData?.driverPicture
      ),
      privateHireCard: buildUploadedField(
        "privateHireCard",
        driver.UploadedData?.privateHireCard
      ),
      dvlaCard: buildUploadedField("dvlaCard", driver.UploadedData?.dvlaCard),
      carPicture: buildUploadedField(
        "carPicture",
        driver.UploadedData?.carPicture
      ),
      privateHireCarPaper: buildUploadedField(
        "privateHireCarPaper",
        driver.UploadedData?.privateHireCarPaper
      ),
      driverPrivateHirePaper: buildUploadedField(
        "driverPrivateHirePaper",
        driver.UploadedData?.driverPrivateHirePaper
      ),
      insurance: buildUploadedField(
        "insurance",
        driver.UploadedData?.insurance
      ),
      motExpiry: buildUploadedField(
        "motExpiry",
        driver.UploadedData?.motExpiry
      ),
      V5: buildUploadedField("V5", driver.UploadedData?.V5),
    };

    await driver.save();
    if (oldEmail && oldEmail !== email) {
      const linkedUser = await User.findOne({
        employeeNumber: employeeNumber,
        companyId: companyId,
      });

      if (linkedUser) {
        linkedUser.email = email;
        await linkedUser.save();
      }
    }

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
