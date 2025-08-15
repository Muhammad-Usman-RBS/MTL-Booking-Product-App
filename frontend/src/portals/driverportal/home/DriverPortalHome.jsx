import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetDriverJobsQuery } from "../../../redux/api/jobsApi";
import { useUpdateJobStatusMutation } from "../../../redux/api/jobsApi";
import { useUpdateBookingStatusMutation } from "../../../redux/api/bookingApi";
import { toast } from "react-toastify";
import {
  driverportalstatusOptions,
  statusColors,
} from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const DriverPortalHome = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const driverId = user?._id;

  const { data, isLoading, error, refetch } = useGetDriverJobsQuery(
    { companyId, driverId },
    { skip: !companyId || !driverId }
  );

  const [updateJobStatus] = useUpdateJobStatusMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [loadingJobId, setLoadingJobId] = useState(null);
  const [statusMap, setStatusMap] = useState({});

  const convertKmToMiles = (text) => {
    if (!text || typeof text !== "string") return "—";
    if (text.includes("km")) {
      const km = parseFloat(text.replace("km", "").trim());
      if (!isNaN(km)) return `${(km * 0.621371).toFixed(2)} miles`;
    }
    return text;
  };
  const handleJobAction = async (jobId, status) => {
    setLoadingJobId(jobId);
    try {
      const result = await updateJobStatus({ jobId, jobStatus: status });

      if (result.error) {
        if (result.error.status === 409) {
          toast.error("Job already accepted by another driver");
          await refetch();
          return;
        }
        throw new Error(
          result.error.data?.message || "Failed to update job status"
        );
      }

      setStatusMap((prevState) => ({
        ...prevState,
        [jobId]: status,
      }));

      toast.success(`Job status updated to "${status}" successfully!`);

      try {
        if (status === "Accepted") {
          const job = (data?.jobs || []).find((j) => j._id === jobId);
          const bookingId =
            job?.booking?._id || job?.bookingId?._id || job?.bookingId;

          if (bookingId) {
            await updateBookingStatus({
              id: bookingId,
              status: "Accepted",
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();

            const otherJobs = (data?.jobs || []).filter(
              (j) => j.bookingId === bookingId && j._id !== jobId
            );

            for (const otherJob of otherJobs) {
              try {
                await updateJobStatus({
                  jobId: otherJob._id,
                  jobStatus: "Already Assigned",
                });
              } catch (e) {
                console.warn(
                  `Failed to update other job (${otherJob._id}) to 'Already Assigned':`
                );
              }
            }
          }
        } else if (status === "Rejected") {
          const job = (data?.jobs || []).find((j) => j._id === jobId);
          const bookingId =
            job?.booking?._id || job?.bookingId?._id || job?.bookingId;

          if (bookingId) {
            await updateBookingStatus({
              id: bookingId,
              status: "Rejected",
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();
          }
        }
      } catch (e) {
        console.error("Failed to update booking status:", e);
      }

      await refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update job status");
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setLoadingJobId(jobId);

    try {
      const job = jobs.find((j) => j._id === jobId);
      const bookingId = job?.booking?._id;

      if (!bookingId) {
        throw new Error("Booking ID not found");
      }

      const bookingResult = await updateBookingStatus({
        id: bookingId,
        status: newStatus,
        updatedBy: `${user.role} | ${user.fullName}`,
      });

      if (bookingResult.error) {
        throw new Error(
          bookingResult.error.data?.message || "Failed to update booking status"
        );
      }

      setStatusMap((prevState) => ({
        ...prevState,
        [jobId]: newStatus,
      }));

      toast.success(`Status updated to "${newStatus}" successfully!`);
      await refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoadingJobId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        <span className="ml-2">Loading your bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading bookings:
          {error?.data?.message || error.message || "Unknown error"}
        </div>
      </div>
    );
  }

  const jobs = data?.jobs || [];

  return (
    <div className="container mx-auto px-4">
      {jobs.length === 0 ? (
        <div className="col-span-full text-center text-lg font-medium text-gray-500">
          No bookings assigned to you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => {
            const booking = job.booking || {};
            const isReturnJourney = booking?.returnJourneyToggle === true;
            const journey = isReturnJourney
              ? booking?.returnJourney || {}
              : booking?.primaryJourney || {};

            const getCurrentStatus = (job, map) => {
              const id = String(job?._id);
              if (map[id]) return map[id];
              if (job?.jobStatus === "Accepted" && job?.booking?.status) {
                return job.booking.status;
              }
              return job?.jobStatus ?? "New";
            };

            const currentStatus = getCurrentStatus(job, statusMap);

            const driverIdStr = String(
              job?.driverId?._id ?? job?.driverId ?? ""
            );
            const userIdStr = String(user?._id ?? "");
            return (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg w-full transition-transform hover:scale-[1.01]"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-[var(--dark-gray)]">
                    Booking ID: {booking.bookingId || "—"}
                  </h2>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: statusColors[currentStatus]?.bg,
                      color: statusColors[currentStatus]?.text,
                    }}
                  >
                    {currentStatus}
                  </span>
                </div>

                <hr className="mb-3 border-gray-300" />

                {/* JOURNEY DETAILS */}
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Pickup
                      </h3>
                      <p className="pb-4">
                        <strong>Location:</strong> {journey.pickup || "—"}
                      </p>
                      {journey?.pickupDoorNumber && (
                        <p>
                          <strong>Pickup Door:</strong>
                          {journey.pickupDoorNumber}
                        </p>
                      )}
                      {journey?.terminal && (
                        <p>
                          <strong>Pickup Terminal:</strong> {journey.terminal}
                        </p>
                      )}
                      {journey?.arrivefrom && (
                        <p>
                          <strong>Arriving From:</strong> {journey.arrivefrom}
                        </p>
                      )}
                      {journey?.flightNumber && (
                        <p>
                          <strong>Flight Number:</strong> {journey.flightNumber}
                        </p>
                      )}
                      {journey?.pickmeAfter && (
                        <p>
                          <strong>Pick Me After:</strong> {journey.pickmeAfter}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Dropoff
                      </h3>
                      <p>
                        <strong>Location:</strong> {journey.dropoff || "—"}
                      </p>
                      <div className="mt-4 text-sm text-gray-700">
                        {[
                          "dropoffDoorNumber0",
                          "dropoffDoorNumber1",
                          "dropoffDoorNumber2",
                        ].map(
                          (key, i) =>
                            journey?.[key] && (
                              <div key={key}>
                                <strong>Dropoff Door #{i + 1}:</strong>
                                {journey[key]}
                              </div>
                            )
                        )}
                        {["additionalDropoff1", "additionalDropoff2"].map(
                          (key) =>
                            journey?.[key] && (
                              <div key={key}>
                                <strong>
                                  {key.replace("additional", "Additional")}:
                                </strong>
                                {journey[key]}
                              </div>
                            )
                        )}
                        {[
                          "dropoff_terminal_0",
                          "dropoff_terminal_1",
                          "dropoff_terminal_2",
                        ].map(
                          (key, i) =>
                            journey?.[key] && (
                              <div key={key}>
                                <strong>Dropoff Terminal {i + 1}:</strong>
                                {journey[key]}
                              </div>
                            )
                        )}
                        {booking?.notes && (
                          <div className="md:col-span-2">
                            <strong>Notes:</strong> {booking.notes}
                          </div>
                        )}
                        {booking?.internalNotes && (
                          <div className="md:col-span-2">
                            <strong>Internal Notes:</strong>
                            {booking.internalNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Booking Details */}
                  <div>
                    <strong className="block mb-3 text-lg font-bold text-[var(--dark-gray)]">
                      Booking Details:
                    </strong>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong className="mr-1 text-[var(--dark-gray)]">
                          Booking Type:
                        </strong>
                        {isReturnJourney ? "Return" : "Primary"}
                      </div>
                      <div>
                        <strong className="mr-1 text-[var(--dark-gray)]">
                          Distance:
                        </strong>
                        {convertKmToMiles(journey?.distanceText) || "—"}
                      </div>
                      <div>
                        <strong className="mr-1 text-[var(--dark-gray)]">
                          Payment:
                        </strong>
                        {booking.paymentMethod || "—"}
                      </div>
                      <div>
                        <strong className="text-[var(--dark-gray)]">
                          Driver Fare:
                        </strong>
                        £
                        {isReturnJourney
                          ? booking.returnDriverFare
                          : booking.driverFare || "—"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <strong className="block mb-3 text-lg font-bold text-[var(--dark-gray)]">
                      Passenger Details:
                    </strong>
                    {booking?.status !== "Cancelled" &&
                    currentStatus !== "Rejected" &&
                    driverIdStr === userIdStr &&
                    booking?.passenger ? (
                      <div className="text-sm space-y-2">
                        <div>
                          <strong className="text-[var(--dark-gray)]">
                            Name:
                          </strong>
                          {booking.passenger.name}
                        </div>
                        <div>
                          <strong className="text-[var(--dark-gray)]">
                            Contact:
                          </strong>
                          +{booking.passenger.phone || "N/A"}
                        </div>
                        <div>
                          <strong className="text-[var(--dark-gray)]">
                            Email:
                          </strong>
                          {booking.passenger.email || "N/A"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        Passenger details will be shown after accepting job
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-4">
                  <div className="w-full md:w-2/3">
                    {booking?.status === "Cancelled" ? (
                      <div className="text-orange-600 text-sm bg-orange-100 px-3 py-1.5 rounded border border-orange-200 w-fit max-w-full">
                        {(() => {
                          const auditEntry = booking?.statusAudit?.find(
                            (entry) => entry.status === "Cancelled"
                          );
                          if (
                            auditEntry?.updatedBy?.startsWith("clientadmin")
                          ) {
                            return "Booking was cancelled by clientadmin.";
                          } else if (
                            auditEntry?.updatedBy?.startsWith("customer")
                          ) {
                            const customerName =
                              booking?.passenger?.name || "the customer";
                            return `Booking was cancelled by customer: ${customerName}`;
                          } else {
                            return "This booking has been cancelled.";
                          }
                        })()}
                      </div>
                    ) : currentStatus === "Rejected" ? (
                      <div className="text-red-600 font-semibold text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                        This job has been rejected by you
                      </div>
                    ) : currentStatus === "New" ? (
                      <div className="flex gap-3 pt-2">
                        <button
                          className="btn btn-success"
                          onClick={() => handleJobAction(job._id, "Accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-cancel"
                          onClick={() => handleJobAction(job._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      driverIdStr === userIdStr &&
                      currentStatus !== "Rejected" &&
                      currentStatus !== "Already Assigned" && (
                        <div>
                          <SelectOption
                            width="32"
                            label="Current Job Status"
                            value={currentStatus}
                            onChange={(e) =>
                              handleStatusChange(job._id, e.target.value)
                            }
                            options={driverportalstatusOptions?.map(
                              (status) => ({
                                value: status,
                                label: status,
                              })
                            )}
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="text-right text-sm text-gray-500 w-full md:w-auto">
                    <strong className="mr-1">Booking Date:</strong>
                    {journey.date
                      ? `${new Date(journey.date).toLocaleDateString()}, ${
                          journey.hour
                        }:${journey.minute}`
                      : "—"}
                  </div>
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
