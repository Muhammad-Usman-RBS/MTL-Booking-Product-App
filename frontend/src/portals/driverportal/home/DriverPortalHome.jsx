import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetDriverJobsQuery } from "../../../redux/api/jobsApi";
import { useUpdateJobStatusMutation } from "../../../redux/api/jobsApi"; // For updating job status
import { useUpdateBookingStatusMutation } from "../../../redux/api/bookingApi"; // For updating booking status
import { toast } from "react-toastify";

const statusOptions = [
  "Accepted",
  "On Route",
  "At Location",
  "Ride Started",
  "Late Cancel",
  "No Show",
  "Completed",
  "Cancel",
];

const DriverPortalHome = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const driverId = user?.driverId || user?._id;

  const { data, isLoading, error, refetch } = useGetDriverJobsQuery(
    { companyId, driverId },
    { skip: !companyId || !driverId }
  );

  // Use the updateJobStatus mutation for job status and updateBookingStatus mutation for booking status
  const [updateJobStatus, { isLoading: isJobUpdating }] = useUpdateJobStatusMutation();
  const [updateBookingStatus, { isLoading: isBookingUpdating }] = useUpdateBookingStatusMutation();
  const [loadingJobId, setLoadingJobId] = useState(null);

  // Maintain state for job-specific status updates
  const [statusMap, setStatusMap] = useState({});

  // Handle loading and error states
  if (isLoading)
    return (
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading your bookings...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading bookings: {error?.data?.message || error.message || "Unknown error"}
        </div>
      </div>
    );

  const jobs = data?.jobs || [];

  // Filter out rejected jobs
  const filteredJobs = jobs.filter((job) => job.jobStatus !== "Rejected");

  // Handle job status update
  const handleJobAction = async (jobId, status) => {
    setLoadingJobId(jobId);

    try {
      // Use the job API to update the job status
      const result = await updateJobStatus({ jobId, jobStatus: status });

      if (result.error) {
        throw new Error(result.error.data?.message || "Failed to update job status");
      }

      toast.success(`Job status updated to "${status}" successfully!`);

      await refetch(); // Re-fetch jobs to update the list
    } catch (err) {
      console.error("Error updating job status:", err);
      toast.error(err.message || "Failed to update job status");
    } finally {
      setLoadingJobId(null);
    }
  };

  // Handle booking status update (Booking-specific update)
  const handleBookingAction = async (bookingId, status) => {
    setLoadingJobId(bookingId);

    try {
      // Use the booking API to update the booking status
      const result = await updateBookingStatus({
        id: bookingId, // Use the booking ID here
        status: status, // The selected status (from dropdown)
        updatedBy: user._id, // Assuming the user ID is used to track the update
      });

      if (result.error) {
        throw new Error(result.error.data?.message || "Failed to update booking status");
      }

      toast.success(`Booking status updated to "${status}" successfully!`);

      // Update the status for this specific booking
      setStatusMap((prevState) => ({
        ...prevState,
        [bookingId]: status,
      }));

      await refetch(); // Re-fetch jobs to update the list
    } catch (err) {
      console.error("Error updating booking status:", err);
      toast.error(err.message || "Failed to update booking status");
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Assigned Bookings</h2>

      {filteredJobs.length === 0 ? (
        <p>No bookings assigned to you yet.</p>
      ) : (
        <ul className="space-y-4">
          {filteredJobs.map((job) => {
            const booking = job.booking || {}; // Ensure booking object exists
            const journey = booking.primaryJourney || booking.returnJourney || {}; // Ensure primaryJourney exists

            const isAccepted = job.jobStatus === "Accepted";
            const isPending = job.jobStatus === "New";
            const isInProgress = !isPending && !isAccepted && job.jobStatus !== "Rejected";

            return (
              <li key={job._id} className="border p-4 rounded shadow-sm space-y-2">
                <p>
                  <strong>Booking ID:</strong> {booking.bookingId || "—"}
                </p>
                <p>
                  <strong>Pickup:</strong> {journey.pickup || "—"}
                </p>
                <p>
                  <strong>Dropoff:</strong> {journey.dropoff || "—"}
                </p>
                <p>
                  <strong>Date:</strong> {journey.date || "—"}
                </p>
                <p>
                  <strong>Time:</strong> {journey.hour}:{String(journey.minute).padStart(2, "0")}
                </p>
                <p>
                  <strong>Journey Fare:</strong> £{booking.journeyFare || booking.returnfare || "—"}
                </p>
                <p>
                  <strong>Your Driver Fare:</strong> £{booking.driverFare || booking.returnDriverFare || "—"}
                </p>
                <p>
                  <strong>Current Job Status:</strong> {job.jobStatus}
                </p>

                {/* Action Area */}
                {isPending ? (
                  // Show Accept/Reject buttons for new/pending jobs
                  <div className="flex gap-3 pt-2">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      onClick={() => handleJobAction(job._id, "Accepted")}
                      disabled={loadingJobId === job._id || isJobUpdating}
                    >
                      {loadingJobId === job._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Accepting...
                        </>
                      ) : (
                        "Accept"
                      )}
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      onClick={() => handleJobAction(job._id, "Rejected")}
                      disabled={loadingJobId === job._id || isJobUpdating}
                    >
                      {loadingJobId === job._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Rejecting...
                        </>
                      ) : (
                        "Reject"
                      )}
                    </button>
                  </div>
                ) : (isAccepted || isInProgress) ? (
                  // Show status dropdown for accepted jobs or jobs in progress
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-1">Update Status</label>
                    <select
                      className="border px-3 py-2 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      value={statusMap[booking._id] || job.jobStatus} // Use the statusMap for individual job status
                      disabled={loadingJobId === job._id || isJobUpdating}
                      onChange={(e) => handleBookingAction(booking._id, e.target.value)} // Pass the booking ID for booking status update
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {loadingJobId === job._id && (
                      <div className="flex items-center mt-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Updating status...
                      </div>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DriverPortalHome;
