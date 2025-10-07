import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useGetDriverJobsQuery } from "../../../redux/api/jobsApi";
import { useUpdateJobStatusMutation } from "../../../redux/api/jobsApi";
import { useUpdateBookingStatusMutation } from "../../../redux/api/bookingApi";
import { toast } from "react-toastify";
import {
  driverportalstatusOptions,
  SCHEDULED_SET,
  sortList,
  statusColors,
} from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../constants/constantscomponents/ConfirmModal";
import { useLoading } from "../../../components/common/LoadingProvider";

const DriverPortalHome = ({ propJob, setIsBookingModalOpen }) => {
  const user = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");

  const { showLoading, hideLoading } = useLoading();
  const companyId = user?.companyId;
  const driverId = user?._id;
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useGetDriverJobsQuery(
    { companyId, driverId },
    {
      skip: !companyId || !driverId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const [updateJobStatus] = useUpdateJobStatusMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [loadingJobId, setLoadingJobId] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [sortBy, setSortBy] = useState("bookingid-asc");
  const [statusFilter, setStatusFilter] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingJobId, setPendingJobId] = useState(null);
  const modalMode = !!(propJob && propJob.length > 0);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [showLoading, hideLoading, isLoading]);
  useEffect(() => {
    const onFocus = async () => {
      if (!modalMode) {
        await refetch();
        setStatusMap({});
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  const resolveRealJobId = useCallback(
    (maybeJobId) => {
      const asStr = String(maybeJobId);

      const apiExact = (data?.jobs || []).find((j) => String(j._id) === asStr);
      if (apiExact) {
        return apiExact._id;
      }

      const apiByBookingId = (data?.jobs || []).find(
        (j) => String(j.bookingId) === asStr
      );
      if (apiByBookingId) {
        return apiByBookingId._id;
      }

      const propExact = (propJob || []).find((j) => String(j._id) === asStr);
      if (propExact) {
        return propExact._id;
      }

      const propByBookingId = (propJob || []).find(
        (j) => String(j.bookingId) === asStr
      );
      if (propByBookingId) {
        return propByBookingId._id;
      }

      return asStr;
    },
    [data?.jobs, propJob]
  );
  const jobs = useMemo(() => {
    const apiJobs = data?.jobs || [];
    if (propJob?.length > 0) {
      return propJob.map((job) => {
        const safeId = String(job?._id);
        const apiMatch =
          apiJobs.find((j) => String(j.bookingId) === String(job?.bookingId)) ||
          apiJobs.find((j) => String(j._id) === String(job?._id));

        return {
          _id: safeId,
          bookingId: String(job?.bookingId || apiMatch?.bookingId || ""),
          jobStatus:
            job?.jobStatus ||
            job?.jobstatus ||
            job?.status ||
            apiMatch?.jobStatus ||
            "New",
          booking: apiMatch?.booking || job?.booking || job,
          driverId: job?.driverId || apiMatch?.driverId,
        };
      });
    }

    return apiJobs.map((j) => ({
      ...j,
      _id: String(j?._id || j?.id || j?.jobId || ""),
      bookingId: String(j?.bookingId || ""),
      jobStatus: j?.jobStatus || j?.jobstatus || j?.status || "New",
    }));
  }, [propJob, data?.jobs]);

  const getCurrentStatus = (job, map) => {
    const id = String(job?._id);
    const jobStatus = job?.jobStatus ?? "New";
    const bookingStatus = job?.booking?.status?.trim();

    if (bookingStatus === "deleted") return "Deleted";
    if (jobStatus === "Accepted" && bookingStatus) {
      return bookingStatus;
    }
    return map[id] || jobStatus;
  };

  const statusOptions = useMemo(() => {
    return SCHEDULED_SET.map((status) => ({
      label: status,
      value: status,
      count: jobs.filter((job) => getCurrentStatus(job, statusMap) === status)
        .length,
    }));
  }, [jobs, statusMap]);

  const convertKmToMiles = (text) => {
    if (!text || typeof text !== "string") return "—";
    if (text.includes("km")) {
      const km = parseFloat(text.replace("km", "").trim());
      if (!isNaN(km)) return `${(km * 0.621371).toFixed(2)} miles`;
    }
    return text;
  };

  const handleJobAction = async (jobId, status) => {
    const realJobId = resolveRealJobId(jobId);

    setLoadingJobId(realJobId);
    try {
      const result = await updateJobStatus({
        jobId: String(realJobId),
        jobStatus: status,
      });

      if (result.error) {
        if (result.error.status === 409) {
          toast.error("Job already accepted by another driver");
          if (!modalMode) {
            await refetch();
          }
          return;
        }
        throw new Error(
          result.error.data?.message || "Failed to update job status"
        );
      }

      setStatusMap((prev) => ({ ...prev, [String(realJobId)]: status }));
      toast.success(`Job status updated to "${status}" successfully!`);
      if (typeof setIsBookingModalOpen === "function") {
        setIsBookingModalOpen(false);
        navigate("/dashboard/home");
        window.location.reload();
      }
      const job =
        (data?.jobs || []).find((j) => String(j._id) === String(realJobId)) ||
        (propJob || []).find((j) => String(j._id) === String(realJobId)) ||
        (data?.jobs || []).find(
          (j) => String(j.bookingId) === String(realJobId)
        ) ||
        (propJob || []).find((j) => String(j.bookingId) === String(realJobId));

      const bookingId = job?.bookingId || job?.booking?._id;
      if (bookingId) {
        if (status === "Accepted") {
          await updateBookingStatus({
            id: bookingId,
            status: "Accepted",
            updatedBy: `${user.role} | ${user.fullName}`,
          }).unwrap();

          const otherJobs = (data?.jobs || []).filter(
            (j) =>
              String(j.bookingId) === String(bookingId) &&
              String(j._id) !== String(realJobId)
          );

          for (const otherJob of otherJobs) {
            try {
              await updateJobStatus({
                jobId: String(otherJob._id),
                jobStatus: "Already Assigned",
              });
            } catch (e) {
              console.warn(
                "[handleJobAction] failed to set 'Already Assigned' for:",
                otherJob._id,
                e
              );
            }
          }
        } else if (status === "Rejected") {
          await updateBookingStatus({
            id: bookingId,
            status: "Rejected",
            updatedBy: `${user.role} | ${user.fullName}`,
          }).unwrap();
        }
      } else {
        console.warn(
          "[handleJobAction] No bookingId found for job:",
          realJobId
        );
      }
      if (!modalMode) {
        await refetch();
      }
    } catch (err) {
      console.error("[handleJobAction] error:", err);
      toast.error(err.message || "Failed to update job status");
    } finally {
      setLoadingJobId(null);
    }
  };
  const finalizeCompletion = async (jobId) => {
    try {
      const job = jobs.find((j) => String(j._id) === String(jobId));
      const bookingId = job?.booking?._id;

      if (!bookingId) throw new Error("Booking ID not found");

      const bookingResult = await updateBookingStatus({
        id: bookingId,
        status: "Completed",
        updatedBy: `${user.role} | ${user.fullName}`,
      });

      if (bookingResult.error) {
        throw new Error(
          bookingResult.error.data?.message || "Failed to update booking status"
        );
      }

      setStatusMap((prev) => ({ ...prev, [jobId]: "Completed" }));
      toast.success(`Status updated to "Completed" successfully!`);

      if (!modalMode) {
        await refetch();
      }
    } catch (err) {
      console.error("[finalizeCompletion] error:", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setLoadingJobId(jobId);
    try {
      const job = jobs.find((j) => String(j._id) === String(jobId));
      if (!job) throw new Error("Job not found");

      if (newStatus === "Completed") {
        setPendingJobId(jobId);
        setShowConfirmModal(true);
        return;
      }

      const bookingId = job?.booking?._id;
      if (!bookingId) throw new Error("Booking ID not found");

      const isLockedByAdmin =
        String(job?.booking?.status).toLowerCase() === "accepted" &&
        String(job?.jobStatus).toLowerCase() !== "accepted";

      const isAlreadyAssigned =
        String(job?.jobStatus).toLowerCase() === "already assigned";

      if (isLockedByAdmin || isAlreadyAssigned) {
        toast.info("This job is already assigned to another driver.");
        setLoadingJobId(null);
        return;
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

      setStatusMap((prev) => ({ ...prev, [jobId]: newStatus }));
      toast.success(`Status updated to "${newStatus}" successfully!`);

      if (!modalMode) {
        await refetch();
      }
    } catch (err) {
      console.error("[handleStatusChange] error:", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoadingJobId(null);
    }
  };
  const getJourneyDateTime = (job) => {
    const booking = job.booking || {};
    const primary = booking?.primaryJourney || {};
    const ret = booking?.returnJourney || {};

    // Choose journey: if returnJourneyToggle is true and return has a date, use return
    const journey = booking?.returnJourneyToggle && ret?.date ? ret : primary;

    if (!journey?.date) return null;

    const baseDate = new Date(journey.date);
    if (isNaN(baseDate)) return null;

    // ✅ Extract hour/minute from the correct journey
    const hour = typeof journey.hour === "number" ? journey.hour : 0;
    const minute = typeof journey.minute === "number" ? journey.minute : 0;

    baseDate.setHours(hour);
    baseDate.setMinutes(minute);
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    return baseDate;
  };

  const filteredAndSortedJobs = useMemo(() => {
    if (modalMode) return jobs;

    let filtered = jobs;

    if (statusFilter.length > 0) {
      filtered = filtered.filter((job) => {
        const currentStatus = getCurrentStatus(job, statusMap);
        return statusFilter.includes(currentStatus);
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((job) => {
        const journeyDateTime = getJourneyDateTime(job);
        if (!journeyDateTime) return false;
        return journeyDateTime >= start && journeyDateTime <= end;
      });
    }
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((job) => {
        const bookingId = job?.booking?.bookingId || "";
        const pickup = (
          job.booking?.primaryJourney?.pickup ||
          job.booking?.returnJourney?.pickup ||
          ""
        ).toLowerCase();
        const flightNumber = (
          job?.booking?.returnJourneyToggle
            ? job?.booking?.returnJourney?.flightNumber
            : job?.booking?.primaryJourney?.flightNumber
        )
          ?.trim()
          ?.toLowerCase();
        const dropoff = (
          job.booking?.primaryJourney?.dropoff ||
          job.booking?.returnJourney?.dropoff ||
          ""
        ).toLowerCase();

        return (
          bookingId.includes(lowerSearch) ||
          pickup.includes(lowerSearch) ||
          flightNumber.includes(lowerSearch) ||
          dropoff.includes(lowerSearch)
        );
      });
    }
    filtered.sort((a, b) => {
      if (sortBy === "date-asc" || sortBy === "date-desc") {
        const dateA = getJourneyDateTime(a);
        const dateB = getJourneyDateTime(b);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return sortBy === "date-asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "status-asc") {
        return getCurrentStatus(a, statusMap).localeCompare(
          getCurrentStatus(b, statusMap)
        );
      } else if (sortBy === "status-desc") {
        return getCurrentStatus(b, statusMap).localeCompare(
          getCurrentStatus(a, statusMap)
        );
      } else if (sortBy === "bookingid-asc") {
        return Number(a.bookingId) - Number(b.bookingId);
      } else if (sortBy === "bookingid-desc") {
        return Number(b.bookingId) - Number(a.bookingId);
      }
      return 0;
    });

    return filtered;
  }, [
    modalMode,
    jobs,
    statusFilter,
    startDate,
    endDate,
    sortBy,
    statusMap,
    searchTerm,
  ]);

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

  return (
    <>
      {!propJob && (
        <>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Job..."
                  className="custom_input"
                />
              </div>
              <div>
                <SelectDateRange
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                />
              </div>

              <div>
                <SelectedSearch
                  selected={statusFilter}
                  setSelected={setStatusFilter}
                  statusList={statusOptions}
                  placeholder="All Status"
                  showCount={true}
                />
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border lg:p-2 p-1.5 rounded w-full bg-white cursor-pointer "
                >
                  {sortList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter([]);
                    setStartDate(null);
                    setEndDate(null);
                    setSortBy("date-desc");
                    setSearchTerm("");
                  }}
                  className="btn btn-primary "
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {filteredAndSortedJobs.length === 0 ? (
        <div className="col-span-full text-center text-lg font-medium text-gray-500">
          {jobs.length === 0
            ? "No bookings assigned to you yet."
            : "No bookings match your filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAndSortedJobs.map((job) => {
            const booking = job.booking || {};
            const journey = booking?.returnJourneyToggle
              ? booking?.returnJourney || {}
              : booking?.primaryJourney || {};

            const currentStatus = getCurrentStatus(job, statusMap);
            const acceptedByAdmin =
              String(booking?.status).toLowerCase() === "accepted" &&
              String(job?.jobStatus).toLowerCase() !== "accepted";
            const locked =
              acceptedByAdmin ||
              String(currentStatus).toLowerCase() === "already assigned";
            const driverIdStr = String(
              job?.driverId?._id ?? job?.driverId ?? ""
            );
            const userIdStr = String(user?._id ?? "");
            return (
              <div
                key={job._id}
                className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-lg  w-full transition-transform `}
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="lg:text-xl text-md sm:text-sm font-bold text-[var(--dark-gray)]">
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
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <strong className="block mb-3 text-lg font-bold text-[var(--dark-gray)]">
                      Booking Details:&nbsp;
                    </strong>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong className="mr-1 text-[var(--dark-gray)]">
                          Booking Type:&nbsp;
                        </strong>
                        {booking?.returnJourneyToggle ? "Return" : "Primary"}
                      </div>
                      <div>
                        <strong className="mr-1 text-[var(--dark-gray)]">
                          Distance:&nbsp;
                        </strong>
                        {convertKmToMiles(journey?.distanceText) || "—"}
                      </div>
                      <div>
                        <strong className="mr-1 text-[var(--dark-gray)]">
                          Payment:&nbsp;
                        </strong>
                        {booking.paymentMethod || "—"}
                      </div>
                      <div>
                        <strong className="text-[var(--dark-gray)]">
                          Driver Fare:&nbsp;
                        </strong>
                        £
                        {booking?.returnJourneyToggle
                          ? booking.returnDriverFare
                          : booking.driverFare || "—"}
                      </div>
                      {(booking?.returnJourney?.notes ||
                        booking?.primaryJourney?.notes) && (
                        <div>
                          <strong className="text-[var(--dark-gray)]">
                            Notes:&nbsp;
                          </strong>
                          {booking?.returnJourneyToggle
                            ? booking?.returnJourney?.notes
                            : booking?.primaryJourney?.notes || "—"}
                        </div>
                      )}
                    </div>
                  </div>
                  {booking?.status !== "New" &&
                  booking?.status !== "Cancelled" &&
                  currentStatus !== "Rejected" ? (
                    <div>
                      <strong className="block mb-3 text-lg font-bold text-[var(--dark-gray)]">
                        Passenger Details:
                      </strong>
                      {
                        <div className="text-sm space-y-2">
                          <div>
                            <strong className="text-[var(--dark-gray)]">
                              Name:&nbsp;
                            </strong>
                            {booking?.passenger?.name}
                          </div>
                          <div>
                            <strong className="text-[var(--dark-gray)]">
                              Contact:&nbsp;
                            </strong>
                            +{booking?.passenger?.phone || "N/A"}
                          </div>
                          <div>
                            <strong className="text-[var(--dark-gray)]">
                              Email:&nbsp;
                            </strong>
                            {booking?.passenger?.email || "N/A"}
                          </div>
                        </div>
                      }
                    </div>
                  ) : (
                    <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-300 p-4 text-center text-yellow-800 text-sm font-medium">
                      Passenger details are hidden. They&apos;ll appear once the
                      job is <span className="font-semibold">accepted</span>.
                    </div>
                  )}
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
                    ) : booking?.status?.toLowerCase().trim() === "deleted" ? (
                      <>
                        <p className="text-orange-600 text-sm bg-orange-100 px-3 py-1.5 rounded border border-orange-200 w-fit max-w-full">
                          Booking was already Deleted
                        </p>
                      </>
                    ) : currentStatus === "Rejected" ? (
                      <div className="text-red-600 font-semibold w-fit max-w-full text-sm bg-red-50 p-3 rounded-lg border border-red-200">
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
                    ) : locked ? (
                      <div className="text-orange-600 text-sm bg-orange-100 px-3 py-1.5 rounded border border-orange-200 w-fit max-w-full">
                        This job is already assigned to another driver.
                      </div>
                    ) : (
                      driverIdStr === userIdStr &&
                      currentStatus !== "Rejected" &&
                      currentStatus !== "Already Assigned" && (
                        <div>
                          {currentStatus === "Completed" ? (
                            <div className="text-green-600 text-sm bg-green-100 px-3 py-1.5 rounded border border-green-200 w-fit max-w-full">
                              This booking is already marked as{" "}
                              <strong>Completed</strong>.
                            </div>
                          ) : (
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
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className="text-right text-sm text-gray-500 w-full md:w-auto">
                    <strong className="mr-1">Booking Date:</strong>
                    {journey.date
                      ? `${new Date(journey.date).toLocaleDateString()}, ${
                          journey.hour
                        }:${String(journey.minute).padStart(2, "0")}`
                      : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={async () => {
          setShowConfirmModal(false);
          if (pendingJobId) {
            await finalizeCompletion(pendingJobId);
            setPendingJobId(null);
          }
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingJobId(null);
        }}
      />
    </>
  );
};

export default DriverPortalHome;
