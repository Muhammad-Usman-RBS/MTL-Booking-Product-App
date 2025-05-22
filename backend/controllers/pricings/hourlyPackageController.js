import HourlyPackage from '../../models/pricings/HourlyPackage.js';

// Create a new hourly package
export const createHourlyPackage = async (req, res) => {
    try {
        const { distance, hours, standardSaloon, executiveSaloon, vipSaloon, luxuryMPV, eightPassengerMPV, companyId } = req.body;

        const newHourlyPackage = new HourlyPackage({
            distance,
            hours,
            standardSaloon,
            executiveSaloon,
            vipSaloon,
            luxuryMPV,
            eightPassengerMPV,
            companyId
        });

        const savedPackage = await newHourlyPackage.save();
        res.status(201).json({ message: "Added successfully", savedPackage });
    } catch (error) {
        res.status(500).json({ message: 'Error creating hourly package', error: error.message });
    }
};

// Get all hourly packages
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
        const updates = req.body;

        const updatedPackage = await HourlyPackage.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Hourly package not found' });
        }

        res.status(200).json(updatedPackage);
    } catch (error) {
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