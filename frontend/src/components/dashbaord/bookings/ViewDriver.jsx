import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";
import { useAdminGetAllDriversQuery } from "../../../redux/api/adminApi";
import {
  useGetAllBookingsQuery,
  useSendBookingEmailMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import { useCreateJobMutation, useGetDriverJobsQuery } from "../../../redux/api/jobsApi";
import {
  notificationApi,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
} from "../../../redux/api/notificationApi";
const ViewDriver = ({ selectedRow, setShowDriverModal, onDriversUpdate }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [createNotification] = useCreateNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

const { data: jobsData } = useGetDriverJobsQuery(
  { companyId },
  { 
    skip: !companyId,
    pollingInterval: 5000 
  }
);
  const [createJob] = useCreateJobMutation();

  const [updateBooking] = useUpdateBookingMutation();

  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMatching, setShowMatching] = useState(false);
  const [sendEmailChecked, setSendEmailChecked] = useState(false);

  const [sendBookingEmail] = useSendBookingEmailMutation();

  const { data: drivers = [], isLoading } = useGetAllDriversQuery(companyId, {
    skip: !companyId,
  });

  const { data: bookingData, refetch: refetchBookings } =
    useGetAllBookingsQuery(companyId);

  const { data: allUsers = [], isLoading: isAllUsersLoading } =
    useAdminGetAllDriversQuery();
  const allBookings = bookingData?.bookings || [];

  const selectedBooking = allBookings.find(
    (booking) => booking._id === selectedRow
  );
  const bookingVehicleType =
    selectedBooking?.vehicle?.vehicleName?.trim().toLowerCase() || "";
  const filteredDriver = (drivers?.drivers || []).filter((driver) => {
    const name = driver?.DriverData?.firstName?.toLowerCase() || "";
    const carMake = driver?.VehicleData?.carMake?.toLowerCase() || "";
    const carModel = driver?.VehicleData?.carModal?.toLowerCase() || "";
    const vehicleTypes = driver?.VehicleData?.vehicleTypes || [];
    const matchesSearch =
      name.includes(searchTerm) ||
      carMake.includes(searchTerm) ||
      carModel.includes(searchTerm);

    const matchesVehicle = showMatching
      ? vehicleTypes.some(
          (type) =>
            typeof type === "string" &&
            type.trim().toLowerCase() === bookingVehicleType
        )
      : true;

    return matchesSearch && matchesVehicle;
  });

  {
    isLoading && <p>Loading drivers...</p>;
  }
  const dispatch = useDispatch();
  // Auto-remove drivers who reject jobs
  useEffect(() => {
    if (!selectedBooking?.drivers || !jobsData?.jobs) return;

    const rejectedJobs = jobsData.jobs.filter(
      (job) =>
        job.jobStatus === "Rejected" && job.booking?._id === selectedBooking._id
    );

    if (rejectedJobs.length > 0) {
      rejectedJobs.forEach(async (rejectedJob) => {
        const rejectedDriverId = rejectedJob.driverId;
        const driverToRemove = selectedBooking.drivers.find(
          (d) => d.userId === rejectedDriverId
        );

        if (driverToRemove) {
          try {
            const updatedDrivers = selectedBooking.drivers.filter(
              (d) => d.userId !== rejectedDriverId
            );

            await updateBooking({
              id: selectedBooking._id,
              updatedData: {
                bookingData: {
                  ...selectedBooking,
                  drivers: updatedDrivers,
                },
              },
            }).unwrap();

            // Delete notification if exists
            if (driverToRemove.employeeNumber) {
              const { data: notificationsForDriver } = await dispatch(
                notificationApi.endpoints.getUserNotifications.initiate(
                  driverToRemove.employeeNumber
                )
              );

              const matchingNotification = notificationsForDriver?.find(
                (notif) =>
                  notif?.bookingId === selectedBooking.bookingId &&
                  notif?.employeeNumber === driverToRemove.employeeNumber
              );

              if (matchingNotification?._id) {
                await deleteNotification(matchingNotification._id).unwrap();
              }
            }

            toast.info(
              `${driverToRemove.name} rejected the job and was automatically removed.`
            );
            refetchBookings();
          } catch (error) {
            console.error("Failed to auto-remove rejected driver:", error);
          }
        }
      });
    }
  }, [
    jobsData,
    selectedBooking,
    updateBooking,
    deleteNotification,
    dispatch,
    refetchBookings,
  ]);
  const handleSendEmail = async () => {
    try {
      if (!companyId) {
        toast.error("Company ID is missing. Please log in again.");
        return;
      }

      const booking = allBookings.find((b) => b._id === selectedRow);

      if (!booking?._id) {
        toast.error("Please select a booking first.");
        return;
      }

      if (selectedDrivers.length === 0) {
        toast.info("Please select at least one driver.");
        return;
      }

      for (const driver of selectedDrivers) {
        const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();

        const matchedUser = (allUsers?.drivers || []).find(
          (user) =>
            user.email?.toLowerCase().trim() === driverEmail &&
            user.role?.toLowerCase() === "driver"
        );

        if (!driverEmail || !matchedUser) {
          toast.error(
            `${
              driver?.DriverData?.firstName || "Driver"
            } has no valid user account or driver role. Assignment blocked.`
          );
          return;
        }
      }

      const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;

      const driverObjects = selectedDrivers
        .map((driver) => {
          const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();
          const matchedUser = (allUsers?.drivers || []).find(
            (user) =>
              user.email?.toLowerCase().trim() === driverEmail &&
              user.role?.toLowerCase() === "driver"
          );

          return {
            _id: matchedUser?._id,
            userId: matchedUser?._id,
            driverId: driver._id,
            name: driver?.DriverData?.firstName || "Unnamed",
            email: driver?.DriverData?.email,
            employeeNumber: driver?.DriverData?.employeeNumber,
            contact: driver?.DriverData?.contact,
          };
        })
        .filter((obj) => obj._id);
      await updateBooking({
        id: booking._id,
        updatedData: {
          bookingData: {
            ...restBookingData,
            drivers: driverObjects,
          },
        },
      }).unwrap();

      if (typeof refetchBookings === "function") {
        refetchBookings();
      }

      toast.success("Booking updated with selected drivers.");

      // ✅ Create Jobs
      await Promise.all(
        selectedDrivers.map(async (driver) => {
          const matchedUser = (allUsers?.drivers || []).find(
            (user) =>
              user.email?.toLowerCase().trim() ===
                driver?.DriverData?.email?.toLowerCase().trim() &&
              user.role?.toLowerCase() === "driver"
          );

          const jobPayload = {
            bookingId: booking._id,
            driverId: matchedUser?._id,
            assignedBy: user._id,
            companyId,
          };

          try {
            const jobRes = await createJob(jobPayload).unwrap();
            toast.success(`Job created for ${driver.DriverData?.firstName}`);
          } catch (err) {
            toast.error(
              `Failed to create job for ${driver.DriverData?.firstName}`
            );
          }
        })
      );

      if (sendEmailChecked) {
        await Promise.all(
          selectedDrivers.map(async (driver) => {
            const email = driver?.DriverData?.email;
            if (!email) {
              toast.warning(
                `${
                  driver?.DriverData?.firstName || "Driver"
                } has no email. Skipped.`
              );
              return;
            }

            const payload = {
              bookingId: booking._id,
              email,
            };

            try {
              await sendBookingEmail(payload).unwrap();
              toast.success(`Email sent to ${driver.DriverData?.firstName}`);
            } catch (err) {
              console.error("❌ Email error:", err);
              toast.error(`Failed to send to ${driver.DriverData?.firstName}`);
            }
          })
        );
      }

      await Promise.all(
        selectedDrivers.map(async (driver) => {
          const { DriverData } = driver;

          if (!DriverData?.employeeNumber) {
            toast.warning(
              `${
                DriverData?.firstName || "Driver"
              } has no employee number. Skipped.`
            );
            return;
          }

          const notificationPayload = {
            employeeNumber: DriverData.employeeNumber,
            bookingId: booking.bookingId,
            status: booking.status,
            primaryJourney: {
              pickup:
                booking?.primaryJourney?.pickup ||
                booking?.returnJourney?.pickup,
              dropoff:
                booking?.primaryJourney?.dropoff ||
                booking?.returnJourney?.dropoff,
            },
            bookingSentAt: new Date(),
            createdBy: user?._id,
            companyId,
          };

          try {
            await createNotification(notificationPayload).unwrap();
            toast.success(`Notification sent to ${DriverData?.firstName}`);
          } catch (error) {
            toast.error(`Failed to notify ${DriverData?.firstName}`);
          }
        })
      );

      setShowDriverModal(false);
      if (onDriversUpdate) {
        onDriversUpdate(selectedRow, selectedDrivers);
      }
    } catch (error) {
      toast.error("Something went wrong while assigning drivers.");
    }
  };

  const handleRemoveDriver = async (driverId, employeeNumber, driverName) => {
    try {
      const updatedDrivers = selectedBooking.drivers.filter(
        (d) => d.driverId !== driverId
      );

      await updateBooking({
        id: selectedBooking._id,
        updatedData: {
          bookingData: {
            ...selectedBooking,
            drivers: updatedDrivers,
          },
        },
      }).unwrap();

      if (employeeNumber) {
        const { data: notificationsForDriver } = await dispatch(
          notificationApi.endpoints.getUserNotifications.initiate(
            employeeNumber
          )
        );

        const matchingNotification = notificationsForDriver?.find(
          (notif) =>
            notif?.bookingId === selectedBooking.bookingId &&
            notif?.employeeNumber === employeeNumber
        );

        if (matchingNotification?._id) {
          await deleteNotification(matchingNotification._id).unwrap();
          toast.success(`Notification for ${driverName} deleted.`);
        } else {
          console.warn("No matching notification found to delete.");
        }
      }

      toast.success(`${driverName} removed successfully.`);
      refetchBookings();
    } catch (error) {
      console.error("❌ Failed to remove driver:", error);
      toast.error(`Failed to remove ${driverName}`);
    }
  };

  const convertKmToMiles = (text) => {
    if (!text || typeof text !== "string") return "—";
    if (text.includes("km")) {
      const km = parseFloat(text.replace("km", "").trim());
      if (!isNaN(km)) {
        return `${(km * 0.621371).toFixed(2)} miles`;
      }
    }
    return text;
  };

  return (
    <>
      <div className="p-4 space-y-4 text-sm text-gray-800 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[var(--dark-gray)] mb-1">
              Distance:
            </label>
            <p className="bg-gray-100 px-3 py-1.5 rounded">
              {convertKmToMiles(
                selectedBooking?.primaryJourney?.distanceText ||
                selectedBooking?.returnJourney?.distanceText
              ) || "Select a booking"}
            </p>
          </div>
          <div>
            <label className="block font-semibold text-[var(--dark-gray)] mb-1">
              Fare:
            </label>
            <input
              type="number"
              className="custom_input"
              value={
                selectedBooking?.driverFare ||
                selectedBooking?.returnDriverFare ||
                ""
              }
              readOnly
            />
          </div>
        </div>

        {selectedBooking?.drivers && selectedBooking.drivers.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icons.Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800 text-lg">
                Currently Assigned Drivers
              </h3>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                {selectedBooking.drivers.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedBooking.drivers.map((assignedDriver, index) => {
                // Check if this driver has rejected the job
                const hasRejectedJob = jobsData?.jobs?.some(job =>
                  job.driverId === assignedDriver.userId &&
                  job.booking?._id === selectedBooking._id &&
                  job.jobStatus === "Rejected"
                );

                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg border transition-all ${hasRejectedJob
                        ? 'bg-red-50 border-red-200 opacity-75'
                        : 'bg-white border-gray-200'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {assignedDriver.name || "Unnamed Driver"}
                        </p>
                        {hasRejectedJob && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full animate-pulse">
                            Rejected - Removing...
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {assignedDriver.employeeNumber
                          ? `#${assignedDriver.employeeNumber}`
                          : assignedDriver.email}
                      </p>
                    </div>
                    <Icons.Trash
                      title="Remove Driver"
                      onClick={() =>
                        handleRemoveDriver(
                          assignedDriver.driverId,
                          assignedDriver.employeeNumber,
                          assignedDriver.name
                        )
                      }
                      className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                Drivers who reject jobs will be automatically removed
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => setShowMatching(false)}
            className="btn btn-primary"
          >
            All Drivers
          </button>
          <button
            onClick={() => setShowMatching(true)}
            className="btn btn-reset"
          >
            Matching Drivers
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <input
              type="text"
              placeholder="Search driver"
              className="custom_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-indigo-600"
              checked={selectAll}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectAll(checked);
                if (checked) {
                  setSelectedDrivers(filteredDriver);
                } else {
                  setSelectedDrivers([]);
                }
              }}
            />
            <span>Select All</span>
          </label>
        </div>

        <div className="max-h-48 overflow-y-auto pr-1 space-y-3 custom-scroll border border-gray-500 rounded-md">
          {Array.isArray(filteredDriver) &&
            filteredDriver.map((driver, i) => (
              <label
                key={i}
                className="flex items-center gap-3 p-3    cursor-pointer"
              >
                <img
                  src={driver.UploadedData?.driverPicture || IMAGES.dummyImg}
                  alt={driver.name}
                  className="w-10 h-10 rounded-full object-cover border border-[var(--light-gray)]"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {driver.DriverData?.firstName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {driver.VehicleData?.carMake || "N/A"} |
                    {driver.VehicleData?.carModal || "N/A"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={selectedDrivers.some((d) => d._id === driver._id)}
                  onChange={() => {
                    if (selectedDrivers.some((d) => d._id === driver._id)) {
                      setSelectedDrivers((prev) =>
                        prev.filter((d) => d._id !== driver._id)
                      );
                    } else {
                      setSelectedDrivers((prev) => [...prev, driver]);
                    }
                  }}
                />
              </label>
            ))}
        </div>

        <div>
          <label className="block font-semibold text-[var(--dark-gray)] mb-1">
            Driver Notes:
            <span className="italic text-red-500 underline">Empty</span>
          </label>
        </div>
        <hr />
        <div>
          <label className="block font-semibold text-[var(--dark-gray)] mb-2">
            Alerts
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={sendEmailChecked}
                onChange={(e) => setSendEmailChecked(e.target.checked)}
              />
              <span>Email</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button onClick={handleSendEmail} className="btn btn-edit">
            Update
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewDriver;
