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
  try {
    const { companyId } = req.query;
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
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid Driver ID format" });
    }
    if (!companyId || !driverId) {
      return res.status(400).json({ message: "Missing companyId or driverId" });
    }

    const jobs = await Job.find({
      companyId: companyId,
      $or: [
        { driverId: new mongoose.Types.ObjectId(driverId) },
        {
          jobStatus: "Rejected",
          assignedBy: { $exists: true },
          updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      ],
    })
      .populate({
        path: "bookingId",
        model: "Booking",
      })
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
    const { jobId } = req.params;
    const { jobStatus, driverRejectionNote, newDriverId } = req.body;

    if (!jobId || jobId.length !== 24) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    // **CRITICAL: Race condition prevention for acceptance using atomic operations**
    if (jobStatus === "Accepted") {
      // Step 1: Get the current job to find the bookingId
      const currentJob = await Job.findById(jobId);
      if (!currentJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Step 2: Try to atomically update ONLY if no other job is already accepted
      const atomicUpdate = await Job.findOneAndUpdate(
        {
          _id: jobId,
          jobStatus: { $in: ["New"] }, // Only update if status is still "New"
        },
        {
          $set: { jobStatus: "Accepted" },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("driverId");

      // Step 3: Check if the update was successful
      if (!atomicUpdate) {
        // Either job doesn't exist or status was already changed
        const existingJob = await Job.findById(jobId);
        if (existingJob && existingJob.jobStatus !== "New") {
          // Job status was changed by another request - mark as "Already Assigned"
          const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            { jobStatus: "Already Assigned" },
            { new: true }
          ).populate("driverId");

          return res.status(409).json({
            success: false,
            message: "This booking has already been accepted by another driver",
            job: updatedJob,
          });
        }
        return res.status(404).json({ message: "Job not found" });
      }

      // Step 4: Update all other jobs for this booking to "Already Assigned"
      await Job.updateMany(
        {
          bookingId: currentJob.bookingId,
          _id: { $ne: jobId },
          jobStatus: { $ne: "Accepted" },
        },
        { $set: { jobStatus: "Already Assigned" } }
      );

      return res.status(200).json({
        success: true,
        message: "Job accepted successfully",
        job: atomicUpdate,
      });
    }

    if (jobStatus === "Rejected") {
      const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        {
          $set: {
            jobStatus: "Rejected",
            driverRejectionNote: driverRejectionNote || "No reason provided",
          },
        },
        { new: true, runValidators: true }
      ).populate("driverId");

      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      return res.status(200).json({
        success: true,
        message: `Job status updated to ${jobStatus}`,
        job: updatedJob,
        driverRejectionNote: updatedJob.driverRejectionNote,
      });
    }

    // Handle other status updates (like status changes from dropdown)
    const job = await Job.findById(jobId).populate("driverId");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (newDriverId && jobStatus !== "Rejected") {
      job.driverId = newDriverId;
    }

    job.jobStatus = jobStatus;
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${jobStatus}`,
      job,
      driverRejectionNote: job.driverRejectionNote,
    });
  } catch (err) {
    console.error("Error updating job status:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
// export const updateJobStatus = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { jobStatus, driverRejectionNote, newDriverId } = req.body;

//     if (!jobId || jobId.length !== 24) {
//       return res.status(400).json({ message: "Invalid jobId" });
//     }

//     // **CRITICAL: Race condition prevention for acceptance using atomic operations**
//     if (jobStatus === "Accepted") {
//       // Step 1: Get the current job to find the bookingId
//       const currentJob = await Job.findById(jobId);
//       if (!currentJob) {
//         return res.status(404).json({ message: "Job not found" });
//       }

//       // Step 2: Try to atomically update ONLY if no other job is already accepted
//       const atomicUpdate = await Job.findOneAndUpdate(
//         {
//           _id: jobId,
//           jobStatus: { $in: ["New"] }, // Only update if status is still "New"
//         },
//         {
//           $set: { jobStatus: "Accepted" },
//         },
//         {
//           new: true,
//           runValidators: true,
//         }
//       ).populate("driverId");

//       // Step 3: Check if the update was successful
//       if (!atomicUpdate) {
//         // Either job doesn't exist or status was already changed
//         const existingJob = await Job.findById(jobId);
//         if (existingJob && existingJob.jobStatus !== "New") {
//           // Job status was changed by another request - mark as "Already Assigned"
//           const updatedJob = await Job.findByIdAndUpdate(
//             jobId,
//             { jobStatus: "Already Assigned" },
//             { new: true }
//           ).populate("driverId");

//           return res.status(409).json({
//             success: false,
//             message: "This booking has already been accepted by another driver",
//             job: updatedJob,
//           });
//         }
//         return res.status(404).json({ message: "Job not found" });
//       }

//       // Step 4: Update all other jobs for this booking to "Already Assigned"
//       await Job.updateMany(
//         {
//           bookingId: currentJob.bookingId,
//           _id: { $ne: jobId },
//           jobStatus: { $ne: "Accepted" },
//         },
//         { $set: { jobStatus: "Already Assigned" } }
//       );

//       return res.status(200).json({
//         success: true,
//         message: "Job accepted successfully",
//         job: atomicUpdate,
//       });
//     }

//     // Handle other status updates (Rejected, etc.) - existing logic
//     const job = await Job.findById(jobId).populate("driverId");
//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     if (jobStatus === "Rejected") {
//       job.driverId = null;
//       job.driverRejectionNote = driverRejectionNote || "No reason provided";
//     }

//     if (newDriverId && jobStatus !== "Rejected") {
//       job.driverId = newDriverId;
//     }

//     job.jobStatus = jobStatus;
//     await job.save();

//     return res.status(200).json({
//       success: true,
//       message: `Job status updated to ${jobStatus}`,
//       job,
//       driverRejectionNote: job.driverRejectionNote,
//     });
//   } catch (err) {
//     console.error("Error updating job status:", err);
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

export const DeleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { driverId } = req.query || {};

    if (!jobId || jobId.length !== 24) {
      return res.status(400).json({ message: "Invalid id" });
    }

    let job = await Job.findByIdAndDelete(jobId);

    if (!job) {
      const where = { bookingId: jobId };
      if (driverId && driverId.length === 24) where.driverId = driverId;
      job = await Job.findOneAndDelete(where);
    }

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
