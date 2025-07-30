import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetDriverJobsQuery } from "../../../redux/api/jobsApi";
import { useUpdateJobStatusMutation } from "../../../redux/api/jobsApi";
import { useUpdateBookingStatusMutation } from "../../../redux/api/bookingApi";
import { toast } from "react-toastify";
import { statusColors } from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

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

  const [updateJobStatus] = useUpdateJobStatusMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [loadingJobId, setLoadingJobId] = useState(null);
  const [statusMap, setStatusMap] = useState({}); // Track status changes
  const [rejectedJobId, setRejectedJobId] = useState(null);
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
          Error loading bookings:
          {error?.data?.message || error.message || "Unknown error"}
        </div>
      </div>
    );

  const jobs = data?.jobs || [];

  const filteredJobs = jobs.filter((job) => job.jobStatus !== "Rejected");

  const handleJobAction = async (jobId, status) => {
    setLoadingJobId(jobId);

    try {
      const result = await updateJobStatus({ jobId, jobStatus: status });

      if (result.error) {
        throw new Error(
          result.error.data?.message || "Failed to update job status"
        );
      }
      if (status === "Rejected") {
        setRejectedJobId(jobId);
      }
      toast.success(`Job status updated to "${status}" successfully!`);

      await refetch();
    } catch (err) {
      console.error("Error updating job status:", err);
      toast.error(err.message || "Failed to update job status");
    } finally {
      setLoadingJobId(null);
    }
  };
  const handleStatusChange = (jobId, newStatus) => {
    // Update status in statusMap
    setStatusMap((prevState) => ({
      ...prevState,
      [jobId]: newStatus, // Update status map for the specific job
    }));

    // Update the status for booking/job at the backend
    handleBookingAction(jobId, newStatus);
  };
  const handleBookingAction = async (bookingId, status) => {
    setLoadingJobId(bookingId);

    try {
      const result = await updateBookingStatus({
        id: bookingId,
        status: status,
        updatedBy: user._id,
      });

      if (result.error) {
        throw new Error(
          result.error.data?.message || "Failed to update booking status"
        );
      }

      toast.success(`Booking status updated to "${status}" successfully!`);

      setStatusMap((prevState) => ({
        ...prevState,
        [bookingId]: status,
      }));

      await refetch();
    } catch (err) {
      console.error("Error updating booking status:", err);
      toast.error(err.message || "Failed to update booking status");
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <div>
      {filteredJobs.length === 0 ? (
        <div className="col-span-full text-center text-lg font-medium text-gray-500">
          No bookings assigned to you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const booking = job.booking || {};
            const journey =
              booking.primaryJourney || booking.returnJourney || {};
            const currentStatus = statusMap[job._id] || job.jobStatus;

            return (
              <div
                key={job._id}
                className={`bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between`}
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-[var(--dark-gray)]">
                      Booking ID: {booking.bookingId || "—"}
                    </h2>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          statusColors[statusMap[booking._id] || job.jobStatus]
                            ?.bg,
                        color:
                          statusColors[statusMap[booking._id] || job.jobStatus]
                            ?.text,
                      }}
                    >
                      {statusMap[booking._id] || job.jobStatus}
                    </span>
                  </div>

                  <hr className="mb-5 border-gray-200" />

                  {/* Info Section */}
                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex space-y-2 justify-between flex-wrap">
                      <span>
                        <strong>Pickup:</strong> {journey.pickup || "—"}
                      </span>
                      <span>
                        <strong>Dropoff:</strong> {journey.dropoff || "—"}
                      </span>
                    </div>

                    <div className="flex justify-between flex-wrap">
                      <span>
                        <strong>Driver Fare:</strong> £
                        {booking.driverFare || booking.returnDriverFare || "—"}
                      </span>
                      <span>
                        <strong>Driver Fare:</strong> £
                        {booking.driverFare || booking.returnDriverFare || "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <strong className="block mb-1 text-lg mt-4 font-bold text-[var(--dark-gray)]">
                    Passenger Details
                  </strong>
                  {(statusMap[job._id] || job.jobStatus) === "Accepted" ? (
                    booking?.passenger ? (
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 text-sm rounded-lg border border-gray-200 shadow-sm">
                          <div>
                            <strong>Name:</strong> {booking.passenger.name}
                          </div>
                          <div>
                            <strong>Contact:</strong>{" "}
                            {booking.passenger.phone || "N/A"}
                          </div>
                          <div>
                            <strong>Email:</strong>{" "}
                            {booking.passenger.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        No passenger data available
                      </span>
                    )
                  ) : (
                    <span className="text-gray-500">
                      Passenger details will be shown after accepting job
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  {/* Action Area */}
                  {rejectedJobId === job._id ? (
                    <div className="text-red-600  text-sm">
                      The booking was rejected
                    </div>
                  ) : currentStatus === "New" ? (
                    <div className="flex gap-3 pt-2">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        onClick={() => handleJobAction(job._id, "Accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        onClick={() => handleJobAction(job._id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : currentStatus === "Accepted" ||
                    currentStatus === "In Progress" ? (
                    <>
                      <div className="flex items-end justify-between w-full ">
                        <div className="w-1/3 pr-4">
                          <SelectOption
                            label="Current Job Status"
                            value={statusMap[booking._id] || job.jobStatus}
                            onChange={(e) =>
                              handleStatusChange(booking._id, e.target.value)
                            }
                            options={statusOptions.map((status) => ({
                              value: status,
                              label: status,
                            }))}
                          />
                          {loadingJobId === job._id && (
                            <div className="flex items-center mt-2 text-blue-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              Updating status...
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500  text-right w-2/3">
                          <strong className="mr-1">Booking Date:</strong>

                          {new Date(journey.date).toLocaleString() || "—"}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriverPortalHome;
