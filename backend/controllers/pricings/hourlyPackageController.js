import HourlyPackage from '../../models/pricings/HourlyPackage.js';

// Create a new hourly package (Dynamic vehicle fields)
export const createHourlyPackage = async (req, res) => {
    try {
        const { distance, hours, companyId, ...rest } = req.body;

        // Separate vehicleRates from other known fields
        const vehicleRates = {};
        Object.keys(rest).forEach((key) => {
            const value = parseFloat(rest[key]);
            if (!isNaN(value)) {
                vehicleRates[key] = value;
            }
        });

        // Create new package
        const newHourlyPackage = new HourlyPackage({
            distance,
            hours,
            companyId,
            vehicleRates, // This is the required field
        });

        const savedPackage = await newHourlyPackage.save();

        res.status(201).json({ message: "Added successfully", savedPackage });

    } catch (error) {
        console.error("HourlyPackage creation error:", error);
        res.status(500).json({
            message: "Error creating hourly package",
            error: error.message,
        });
    }
};


// Get all hourly packages by companyId
export const getAllHourlyPackages = async (req, res) => {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }

        const packages = await HourlyPackage.find({ companyId });
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hourly packages', error: error.message });
    }
};

// Get a specific hourly package by ID
export const getHourlyPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const hourlyPackage = await HourlyPackage.findById(id);

        if (!hourlyPackage) {
            return res.status(404).json({ message: 'Hourly package not found' });
        }

        res.status(200).json(hourlyPackage);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hourly package', error: error.message });
    }
};

// Update an hourly package by ID
export const updateHourlyPackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { distance, hours, companyId, ...rest } = req.body;

        // Construct vehicleRates from dynamic fields
        const vehicleRates = {};
        Object.keys(rest).forEach((key) => {
            const value = parseFloat(rest[key]);
            if (!isNaN(value)) {
                vehicleRates[key] = value;
            }
        });

        const updatePayload = {
            distance,
            hours,
            companyId,
            vehicleRates,
        };

        const updatedPackage = await HourlyPackage.findByIdAndUpdate(id, updatePayload, {
            new: true,
        });

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Hourly package not found' });
        }

        res.status(200).json(updatedPackage);

    } catch (error) {
        console.error("HourlyPackage update error:", error);
        res.status(500).json({ message: 'Error updating hourly package', error: error.message });
    }
};

// Delete an hourly package by ID
export const deleteHourlyPackage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPackage = await HourlyPackage.findByIdAndDelete(id);

        if (!deletedPackage) {
            return res.status(404).json({ message: 'Hourly package not found' });
        }

        res.status(200).json({ message: 'Hourly package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hourly package', error: error.message });
    }
};
