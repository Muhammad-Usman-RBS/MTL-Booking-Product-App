import Job from "../models/Job.js";
import Booking from "../models/Booking.js";
import driver from "../models/Driver.js";
import mongoose from "mongoose";

// ✅ POST: Create a new job
export const createJob = async (req, res) => {
  try {
    const { bookingId, driverId, assignedBy, companyId } = req.body;

    if (!bookingId || !driverId || !assignedBy || !companyId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newJob = new Job({
      bookingId,
      driverId,
      assignedBy,
      companyId,
      jobStatus: "New",
    });
    const savedJob = await newJob.save();

    return res.status(201).json({
      success: true,
      message: "Job created",
      job: savedJob,
    });
  } catch (error) {
    console.error("Job creation error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ GET: All jobs for a company with embedded booking details
export const getAllJobs = async (req, res) => {
  console.log("api called");
  try {
    const companyId = req?.user?.companyId;
    if (!companyId || companyId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    const jobs = await Job.find({ companyId }).populate("driverId").lean();

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for this company" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Jobs fetched successfully", jobs });
  } catch (err) {
    console.error("Error fetching all jobs:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ✅ GET: All jobs for a specific driver in a company (Fully Populated Booking Info)
export const getDriverJobs = async (req, res) => {
  try {
    const { companyId, driverId } = req.query;

    if (!companyId || !driverId) {
      return res.status(400).json({ message: "Missing companyId or driverId" });
    }

    const jobs = await Job.find({
      companyId: companyId,
      driverId: new mongoose.Types.ObjectId(driverId),
    })
      .populate("driverId")
      .lean();

    // populate booking
    const enrichedJobs = await Promise.all(
      jobs.map(async (job) => {
        const booking = await Booking.findById(job.bookingId).lean();
        return {
          ...job,
          bookingId: booking?._id,
          booking: booking || {},
          primaryJourney: booking?.primaryJourney || {},
          returnJourney: booking?.returnJourney || {}, // Ensure returnJourney is included
        };
      })
    );

    return res.status(200).json({ success: true, jobs: enrichedJobs });
  } catch (err) {
    console.error("🔥 Error in getDriverJobs:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ✅ PUT: Update job status - FIXED VERSION
export const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params; // Get the jobId from the route parameter
    const { jobStatus, driverRejectionNote, newDriverId } = req.body; // Get jobStatus, driverRejectionNote, and newDriverId from the request body

    if (!jobId || jobId.length !== 24) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const job = await Job.findById(jobId).populate("driverId"); // Find the job by its ID and populate driver details

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // If the job status is "Rejected", remove the driver from the job
    if (jobStatus === "Rejected") {
      job.driverId = null; // Remove the driverId
      job.driverRejectionNote = driverRejectionNote || "No reason provided"; // Store the rejection note
    }

    // If a new driver is being assigned, update the driverId
    if (newDriverId && jobStatus !== "Rejected") {
      job.driverId = newDriverId; // Assign the new driver
    }

    job.jobStatus = jobStatus; // Update the job's status

    await job.save(); // Save the updated job

    // Return response with updated job details, and driver's info (for rejected jobs)
    return res.status(200).json({
      success: true,
      message:
        jobStatus === "Rejected"
          ? "Job status updated to Rejected"
          : "Job status updated",
      job,
      driver: job.driverId, // Return the driver's details
      driverRejectionNote: job.driverRejectionNote, // Return the rejection note if it's set
    });
  } catch (err) {
    console.error("Error updating job status:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
