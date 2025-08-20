import CronJob from "../../models/settings/CronJob.js";
import mongoose from "mongoose";

// POST: Create a new cron job configuration
export const createCronJob = async (req, res) => {
    try {
        const { 
            companyId,
            autoAllocation,
            reviews,
            driverDocumentsExpiration,
            driverStatement,
            createdBy
        } = req.body;

        if (!companyId || !createdBy) {
            return res.status(400).json({ 
                message: "Missing required fields: companyId and createdBy" 
            });
        }

        // Check if cron job already exists for this company
        const existingCronJob = await CronJob.findOne({ companyId });
        if (existingCronJob) {
            return res.status(409).json({
                message: "Cron job configuration already exists for this company"
            });
        }

        const newCronJob = new CronJob({
            companyId,
            autoAllocation: autoAllocation || {},
            reviews: reviews || {},
            driverDocumentsExpiration: driverDocumentsExpiration || {},
            driverStatement: driverStatement || {},
            createdBy,
            history: [{
                action: "created",
                updatedBy: createdBy,
                changes: { message: "Cron job configuration created" }
            }]
        });

        const savedCronJob = await newCronJob.save();

        return res.status(201).json({
            success: true,
            message: "Cron job configuration created successfully",
            cronJob: savedCronJob,
        });
    } catch (error) {
        console.error("Cron job creation error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// GET: Get cron job configuration for a company
export const getCronJob = async (req, res) => {
    try {
        const { companyId } = req.query;
        
        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ 
                message: "Invalid or missing companyId" 
            });
        }

        const cronJob = await CronJob.findOne({ companyId })
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email")
            .lean();

        if (!cronJob) {
            return res.status(404).json({ 
                message: "No cron job configuration found for this company" 
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cron job configuration fetched successfully",
            cronJob
        });
    } catch (err) {
        console.error("Error fetching cron job:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

// GET: Get all cron jobs (for admin)
export const getAllCronJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const cronJobs = await CronJob.find({})
            .populate("companyId", "name")
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ updatedAt: -1 })
            .lean();

        const total = await CronJob.countDocuments();

        return res.status(200).json({
            success: true,
            message: "All cron jobs fetched successfully",
            cronJobs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (err) {
        console.error("Error fetching all cron jobs:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

// PUT: Update cron job configuration
export const updateCronJob = async (req, res) => {
    try {
        const { cronJobId } = req.params;
        const { 
            autoAllocation,
            reviews,
            driverDocumentsExpiration,
            driverStatement,
            updatedBy
        } = req.body;

        if (!cronJobId || cronJobId.length !== 24) {
            return res.status(400).json({ message: "Invalid cronJobId" });
        }

        if (!updatedBy) {
            return res.status(400).json({ message: "updatedBy is required" });
        }

        // Find existing cron job
        const existingCronJob = await CronJob.findById(cronJobId);
        if (!existingCronJob) {
            return res.status(404).json({ message: "Cron job not found" });
        }

        // Track changes for history
        const changes = {};
        if (autoAllocation) changes.autoAllocation = autoAllocation;
        if (reviews) changes.reviews = reviews;
        if (driverDocumentsExpiration) changes.driverDocumentsExpiration = driverDocumentsExpiration;
        if (driverStatement) changes.driverStatement = driverStatement;

        // Update cron job
        const updatedCronJob = await CronJob.findByIdAndUpdate(
            cronJobId,
            {
                ...(autoAllocation && { autoAllocation }),
                ...(reviews && { reviews }),
                ...(driverDocumentsExpiration && { driverDocumentsExpiration }),
                ...(driverStatement && { driverStatement }),
                updatedBy,
                $push: {
                    history: {
                        action: "updated",
                        updatedBy,
                        changes
                    }
                }
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate("createdBy updatedBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Cron job configuration updated successfully",
            cronJob: updatedCronJob,
        });
    } catch (err) {
        console.error("Error updating cron job:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

// PUT: Update cron job by company ID (simpler method for frontend)
export const updateCronJobByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { 
            autoAllocation,
            reviews,
            driverDocumentsExpiration,
            driverStatement,
            updatedBy
        } = req.body;

        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ message: "Invalid companyId" });
        }

        if (!updatedBy) {
            return res.status(400).json({ message: "updatedBy is required" });
        }

        // Find existing cron job by company
        const existingCronJob = await CronJob.findOne({ companyId });
        if (!existingCronJob) {
            // If doesn't exist, create new one
            const newCronJob = new CronJob({
                companyId,
                autoAllocation: autoAllocation || {},
                reviews: reviews || {},
                driverDocumentsExpiration: driverDocumentsExpiration || {},
                driverStatement: driverStatement || {},
                createdBy: updatedBy,
                history: [{
                    action: "created",
                    updatedBy,
                    changes: { message: "Cron job configuration created" }
                }]
            });

            const savedCronJob = await newCronJob.save();
            return res.status(201).json({
                success: true,
                message: "Cron job configuration created successfully",
                cronJob: savedCronJob,
            });
        }

        // Track changes for history
        const changes = {};
        if (autoAllocation) changes.autoAllocation = autoAllocation;
        if (reviews) changes.reviews = reviews;
        if (driverDocumentsExpiration) changes.driverDocumentsExpiration = driverDocumentsExpiration;
        if (driverStatement) changes.driverStatement = driverStatement;

        // Update existing cron job
        const updatedCronJob = await CronJob.findOneAndUpdate(
            { companyId },
            {
                ...(autoAllocation && { autoAllocation }),
                ...(reviews && { reviews }),
                ...(driverDocumentsExpiration && { driverDocumentsExpiration }),
                ...(driverStatement && { driverStatement }),
                updatedBy,
                $push: {
                    history: {
                        action: "updated",
                        updatedBy,
                        changes
                    }
                }
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate("createdBy updatedBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Cron job configuration updated successfully",
            cronJob: updatedCronJob,
        });
    } catch (err) {
        console.error("Error updating cron job by company:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

// DELETE: Delete cron job configuration
export const deleteCronJob = async (req, res) => {
    try {
        const { cronJobId } = req.params;
        const { deletedBy } = req.body;

        if (!cronJobId || cronJobId.length !== 24) {
            return res.status(400).json({ message: "Invalid cronJobId" });
        }

        const cronJob = await CronJob.findByIdAndDelete(cronJobId);

        if (!cronJob) {
            return res.status(404).json({ message: "Cron job not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Cron job configuration deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting cron job:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

// PUT: Enable/Disable specific cron job features
export const toggleCronJobFeature = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { feature, enabled, updatedBy } = req.body;

        if (!companyId || companyId.length !== 24) {
            return res.status(400).json({ message: "Invalid companyId" });
        }

        if (!feature || typeof enabled !== 'boolean' || !updatedBy) {
            return res.status(400).json({ 
                message: "Missing required fields: feature, enabled, updatedBy" 
            });
        }

        const validFeatures = ['autoAllocation', 'reviews', 'driverDocumentsExpiration', 'driverStatement'];
        if (!validFeatures.includes(feature)) {
            return res.status(400).json({ 
                message: "Invalid feature. Valid features: " + validFeatures.join(', ')
            });
        }

        const updateQuery = {
            [`${feature}.enabled`]: enabled,
            updatedBy,
            $push: {
                history: {
                    action: enabled ? "enabled" : "disabled",
                    updatedBy,
                    changes: { feature, enabled }
                }
            }
        };

        const updatedCronJob = await CronJob.findOneAndUpdate(
            { companyId },
            updateQuery,
            { 
                new: true, 
                runValidators: true,
                upsert: true // Create if doesn't exist
            }
        ).populate("createdBy updatedBy", "name email");

        return res.status(200).json({
            success: true,
            message: `${feature} ${enabled ? 'enabled' : 'disabled'} successfully`,
            cronJob: updatedCronJob,
        });
    } catch (err) {
        console.error("Error toggling cron job feature:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};