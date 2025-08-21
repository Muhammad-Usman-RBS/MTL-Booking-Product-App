import express from "express";
import mongoose from "mongoose";
import Driver from "../../models/Driver.js";
import sendEmail from "../../utils/sendEmail.js";
import CronJob from "../../models/settings/CronJob.js";
import { updateCompanyCronJob } from "../../utils/settings/cronjobs/driverDocumentsExpiration.js";

// Check if date is expired
const isExpired = (dateValue) => {
  const d = dateValue ? new Date(dateValue) : null;
  if (!d || isNaN(d)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d <= today;
};

// Get expired documents for a driver
const getExpiredDocs = (driver) => {
  const expired = {};
  
  if (isExpired(driver?.DriverData?.driverLicenseExpiry)) {
    expired["Driver License"] = driver.DriverData.driverLicenseExpiry;
  }
  if (isExpired(driver?.DriverData?.driverPrivateHireLicenseExpiry)) {
    expired["Private Hire License"] = driver.DriverData.driverPrivateHireLicenseExpiry;
  }
  if (isExpired(driver?.VehicleData?.carPrivateHireLicenseExpiry)) {
    expired["Car Private Hire License"] = driver.VehicleData.carPrivateHireLicenseExpiry;
  }
  if (isExpired(driver?.VehicleData?.carInsuranceExpiry)) {
    expired["Car Insurance"] = driver.VehicleData.carInsuranceExpiry;
  }
  if (isExpired(driver?.VehicleData?.motExpiryDate)) {
    expired["MOT Certificate"] = driver.VehicleData.motExpiryDate;
  }
  
  return expired;
};

// Check if email was sent in last 24 hours
const canSendEmail = (driver, expiredDocs) => {
  const lastSent = driver?.Notifications?.docExpiry?.lastSentAt;
  if (!lastSent) return true;
  
  const now = new Date();
  const hoursSinceLastSent = (now - new Date(lastSent)) / (1000 * 60 * 60);
  
  return hoursSinceLastSent >= 24;
};

// Check if current time is within allowed window
const isWithinTimeWindow = (timeRange) => {
  if (!timeRange) return false;
  
  const [start, end] = timeRange.split(/–|-/).map(t => t.trim());
  if (!start || !end) return false;
  
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  
  if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
    return false;
  }
  
  const now = new Date();
  // Use local server time (Pakistan timezone expected)
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTime = currentHour * 60 + currentMin;
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  console.log('Backend time check:', {
    currentTime: `${currentHour}:${currentMin.toString().padStart(2, '0')}`,
    window: timeRange,
    startTime,
    endTime,
    currentTimeMin: currentTime,
    isWithin: currentTime >= startTime && currentTime < endTime
  });
  
  if (endTime > startTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    return currentTime >= startTime || currentTime < endTime;
  }
};

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

        // Validate companyId format
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ 
                message: "Invalid companyId format" 
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
            autoAllocation: autoAllocation || {
                enabled: false,
                timing: { hours: "0 hours", period: "before pickup time" },
                notifications: { sms: false, email: true }
            },
            reviews: reviews || {
                enabled: true,
                timing: { hours: "1 hours" },
                notifications: { sms: false, email: true }
            },
            driverDocumentsExpiration: driverDocumentsExpiration || {
                enabled: false,
                timing: { dailyTime: "16:00 - 17:00" },
                notifications: { sms: false, email: false }
            },
            driverStatement: driverStatement || {
                enabled: false,
                timing: { frequency: "Weekly", day: "Monday", time: "01:00 - 02:00" },
                notifications: { sms: false, email: false }
            },
            createdBy,
            updatedBy: createdBy,
            history: [{
                action: "created",
                updatedBy: createdBy,
                changes: { message: "Cron job configuration created" },
                timestamp: new Date()
            }]
        });

        const savedCronJob = await newCronJob.save();
        await savedCronJob.populate(['createdBy', 'updatedBy'], 'name email');

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
        
        if (!companyId) {
            return res.status(400).json({ 
                message: "Missing companyId parameter" 
            });
        }

        // Validate companyId format
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ 
                message: "Invalid companyId format" 
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
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        const cronJobs = await CronJob.find({})
            .populate("companyId", "name")
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email")
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .sort({ updatedAt: -1 })
            .lean();

        const total = await CronJob.countDocuments();

        return res.status(200).json({
            success: true,
            message: "All cron jobs fetched successfully",
            cronJobs,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
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

        if (!cronJobId) {
            return res.status(400).json({ message: "Missing cronJobId" });
        }

        if (!mongoose.Types.ObjectId.isValid(cronJobId)) {
            return res.status(400).json({ message: "Invalid cronJobId format" });
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
        if (autoAllocation !== undefined) changes.autoAllocation = autoAllocation;
        if (reviews !== undefined) changes.reviews = reviews;
        if (driverDocumentsExpiration !== undefined) changes.driverDocumentsExpiration = driverDocumentsExpiration;
        if (driverStatement !== undefined) changes.driverStatement = driverStatement;

        // Prepare update object
        const updateObj = {
            updatedBy,
            updatedAt: new Date(),
            $push: {
                history: {
                    action: "updated",
                    updatedBy,
                    changes,
                    timestamp: new Date()
                }
            }
        };

        if (autoAllocation !== undefined) updateObj.autoAllocation = autoAllocation;
        if (reviews !== undefined) updateObj.reviews = reviews;
        if (driverDocumentsExpiration !== undefined) updateObj.driverDocumentsExpiration = driverDocumentsExpiration;
        if (driverStatement !== undefined) updateObj.driverStatement = driverStatement;

        // Update cron job
        const updatedCronJob = await CronJob.findByIdAndUpdate(
            cronJobId,
            updateObj,
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

        if (!companyId) {
            return res.status(400).json({ message: "Missing companyId" });
        }

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Invalid companyId format" });
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
                autoAllocation: autoAllocation || {
                    enabled: false,
                    timing: { hours: "0 hours", period: "before pickup time" },
                    notifications: { sms: false, email: true }
                },
                reviews: reviews || {
                    enabled: true,
                    timing: { hours: "1 hours" },
                    notifications: { sms: false, email: true }
                },
                driverDocumentsExpiration: driverDocumentsExpiration || {
                    enabled: false,
                    timing: { dailyTime: "16:00 - 17:00" },
                    notifications: { sms: false, email: false }
                },
                driverStatement: driverStatement || {
                    enabled: false,
                    timing: { frequency: "Weekly", day: "Monday", time: "01:00 - 02:00" },
                    notifications: { sms: false, email: false }
                },
                createdBy: updatedBy,
                updatedBy,
                history: [{
                    action: "created",
                    updatedBy,
                    changes: { message: "Cron job configuration created" },
                    timestamp: new Date()
                }]
            });

            const savedCronJob = await newCronJob.save();
            await savedCronJob.populate(['createdBy', 'updatedBy'], 'name email');
            
            return res.status(201).json({
                success: true,
                message: "Cron job configuration created successfully",
                cronJob: savedCronJob,
            });
        }

        // Track changes for history
        const changes = {};
        if (autoAllocation !== undefined) changes.autoAllocation = autoAllocation;
        if (reviews !== undefined) changes.reviews = reviews;
        if (driverDocumentsExpiration !== undefined) changes.driverDocumentsExpiration = driverDocumentsExpiration;
        if (driverStatement !== undefined) changes.driverStatement = driverStatement;

        // Prepare update object
        const updateObj = {
            updatedBy,
            updatedAt: new Date(),
            $push: {
                history: {
                    action: "updated",
                    updatedBy,
                    changes,
                    timestamp: new Date()
                }
            }
        };

        if (autoAllocation !== undefined) updateObj.autoAllocation = autoAllocation;
        if (reviews !== undefined) updateObj.reviews = reviews;
        if (driverDocumentsExpiration !== undefined) updateObj.driverDocumentsExpiration = driverDocumentsExpiration;
        if (driverStatement !== undefined) updateObj.driverStatement = driverStatement;

        // Update existing cron job
        const updatedCronJob = await CronJob.findOneAndUpdate(
            { companyId },
            updateObj,
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

        if (!cronJobId) {
            return res.status(400).json({ message: "Missing cronJobId" });
        }

        if (!mongoose.Types.ObjectId.isValid(cronJobId)) {
            return res.status(400).json({ message: "Invalid cronJobId format" });
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
    const { feature, enabled } = req.body;
    const updatedBy = req.body.updatedBy || req.user?._id;

    // ---- validations ----
    if (!companyId) return res.status(400).json({ message: "Missing companyId" });
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid companyId format" });
    }
    if (!feature || typeof enabled !== "boolean") {
      return res.status(400).json({ message: "Missing fields: feature, enabled" });
    }
    if (!updatedBy || !mongoose.Types.ObjectId.isValid(updatedBy)) {
      return res.status(400).json({ message: "Invalid updatedBy" });
    }

    const validFeatures = ["autoAllocation", "reviews", "driverDocumentsExpiration", "driverStatement"];
    if (!validFeatures.includes(feature)) {
      return res
        .status(400)
        .json({ message: "Invalid feature. Valid features: " + validFeatures.join(", ") });
    }

    // ---- fetch existing (if any) ----
    let existingCronJob = await CronJob.findOne({ companyId });

    // ---- create default config if none exists ----
    if (!existingCronJob) {
      const defaultConfig = {
        autoAllocation: {
          enabled: false,
          timing: { hours: "0 hours", period: "before pickup time" },
          notifications: { sms: false, email: true },
        },
        reviews: {
          enabled: true,
          timing: { hours: "1 hours" },
          notifications: { sms: false, email: true },
        },
        driverDocumentsExpiration: {
          enabled: false,
          timing: { dailyTime: "16:00 - 17:00" },
          notifications: { sms: false, email: false },
        },
        driverStatement: {
          enabled: false,
          timing: { frequency: "Weekly", day: "Monday", time: "01:00 - 02:00" },
          notifications: { sms: false, email: false },
        },
      };

      // apply requested toggle
      defaultConfig[feature].enabled = enabled;

      // if it's the doc-expiry feature, mirror the email flag with enabled
      if (feature === "driverDocumentsExpiration") {
        defaultConfig.driverDocumentsExpiration.notifications.email = enabled;
        // make sure we have a reasonable default daily time
        if (!defaultConfig.driverDocumentsExpiration.timing?.dailyTime) {
          defaultConfig.driverDocumentsExpiration.timing = { dailyTime: "16:00 - 17:00" };
        }
      }

      const created = await new CronJob({
        companyId,
        ...defaultConfig,
        createdBy: updatedBy,
        updatedBy,
        history: [
          {
            action: "created",
            updatedBy,
            changes: { message: "Cron job configuration created with feature toggle" },
            timestamp: new Date(),
          },
        ],
      }).save();

      await created.populate(["createdBy", "updatedBy"], "name email");

      // reschedule single company
      try {
        await updateCompanyCronJob(companyId);
      } catch (e) {
        console.error("Reschedule error:", e);
      }

      return res.status(201).json({
        success: true,
        message: `Cron job created and ${feature} ${enabled ? "enabled" : "disabled"} successfully`,
        cronJob: created,
      });
    }

    // ---- update existing config ----
    const setFields = {
      [`${feature}.enabled`]: enabled,
      updatedBy,
      updatedAt: new Date(),
      $push: {
        history: {
          action: enabled ? "enabled" : "disabled",
          updatedBy,
          changes: { feature, enabled },
          timestamp: new Date(),
        },
      },
    };

    // If toggling driverDocumentsExpiration, also mirror notifications.email and ensure timing
    if (feature === "driverDocumentsExpiration") {
      setFields[`${feature}.notifications.email`] = enabled;
      // only set a default time when enabling and it's missing/empty
      const needsDefaultTime =
        enabled &&
        (!existingCronJob.driverDocumentsExpiration?.timing?.dailyTime ||
          String(existingCronJob.driverDocumentsExpiration?.timing?.dailyTime).trim() === "");
      if (needsDefaultTime) {
        setFields[`${feature}.timing.dailyTime`] = "16:00 - 17:00";
      }
    }

    const updatedCronJob = await CronJob.findOneAndUpdate(
      { companyId },
      setFields,
      { new: true, runValidators: true }
    ).populate("createdBy updatedBy", "name email");

    // reschedule single company
    try {
      await updateCompanyCronJob(companyId);
    } catch (e) {
      console.error("Reschedule error:", e);
    }

    return res.status(200).json({
      success: true,
      message: `${feature} ${enabled ? "enabled" : "disabled"} successfully`,
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

// POST: Run driver document expiry process immediately
export const runNow = async (req, res) => {
  try {
    const { companyId, sendEmails = false } = req.body;
    console.log('API called with:', { companyId, sendEmails });

    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    // Get cron job settings
    const cronSettings = await CronJob.findOne({ companyId });
    const timeWindow = cronSettings?.driverDocumentsExpiration?.timing?.dailyTime;
    const isEnabled = cronSettings?.driverDocumentsExpiration?.enabled;

    console.log('Cron settings:', { timeWindow, isEnabled });

    if (!isEnabled) {
      return res.status(400).json({ error: "Driver document expiration feature is not enabled" });
    }

    // Check if within time window
    if (!isWithinTimeWindow(timeWindow)) {
      return res.status(400).json({
        error: `Outside allowed time window (${timeWindow || 'Not configured'})`,
        currentTime: new Date().toLocaleTimeString(),
        timeWindow
      });
    }

    const drivers = await Driver.find({ companyId });
    console.log(`Found ${drivers.length} drivers for company ${companyId}`);

    let emailsSent = 0;
    const results = [];

    for (const driver of drivers) {
      const expiredDocs = getExpiredDocs(driver);
      if (Object.keys(expiredDocs).length === 0) continue;

      const driverEmail = driver?.DriverData?.email;
      const driverName = `${driver?.DriverData?.firstName || ""} ${driver?.DriverData?.surName || ""}`.trim();

      console.log(`Driver ${driverName} has expired docs:`, Object.keys(expiredDocs));

      if (!driverEmail) {
        console.log(`Skipping ${driverName} - no email address`);
        continue;
      }

      if (!canSendEmail(driver, expiredDocs)) {
        console.log(`Skipping ${driverName} - email sent within 24 hours`);
        results.push({ email: driverEmail, name: driverName, status: "skipped_throttle", expiredDocs: Object.keys(expiredDocs) });
        continue;
      }

      if (sendEmails) {
        try {
          console.log(`Sending email to ${driverEmail}`);
          await sendEmail(driverEmail, "Document Expiry Alert", {
            title: "Your documents have expired",
            subtitle: "Please renew the following documents:",
            data: expiredDocs
          });

          driver.Notifications = driver.Notifications || {};
          driver.Notifications.docExpiry = { lastSentAt: new Date() };
          await driver.save();

          emailsSent++;
          results.push({ email: driverEmail, name: driverName, status: "sent", expiredDocs: Object.keys(expiredDocs) });
          console.log(`Email sent successfully to ${driverEmail}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${driverEmail}:`, emailError);
          results.push({ email: driverEmail, name: driverName, status: "failed", error: emailError.message, expiredDocs: Object.keys(expiredDocs) });
        }
      } else {
        results.push({ email: driverEmail, name: driverName, status: "would_send", expiredDocs: Object.keys(expiredDocs) });
      }
    }

    console.log(`Process complete: ${emailsSent} emails sent, ${results.length} total candidates`);

    res.json({
      success: true,
      timeWindow,
      emailsSent,
      totalCandidates: results.length,
      results
    });
  } catch (error) {
    console.error("Document expiry email error:", error);
    res.status(500).json({ error: error.message });
  }
};
