import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import IMAGES from "../../../assets/images";
import { useAdminGetAllDriversQuery } from "../../../redux/api/adminApi";
import {
  useGetAllBookingsQuery,
  useSendBookingEmailMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import {
  useCreateJobMutation,
  useDeleteJobMutation,
  useGetDriverJobsQuery,
} from "../../../redux/api/jobsApi";
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

  const { data: jobsData } = useGetDriverJobsQuery(companyId, {
    skip: !companyId,
    pollingInterval: 5000,
  });
  const [createJob] = useCreateJobMutation();

  const [updateBooking] = useUpdateBookingMutation();

  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMatching, setShowMatching] = useState(false);
  const [sendEmailChecked, setSendEmailChecked] = useState(false);
  const [previouslySelectedDrivers, setPreviouslySelectedDrivers] = useState(
    []
  );

  const [sendBookingEmail] = useSendBookingEmailMutation();
  const [deleteJob] = useDeleteJobMutation();

  const { data: drivers = [], isLoading } = useGetAllDriversQuery(companyId, {
    skip: !companyId,
  });

  const { data: bookingData, refetch: refetchBookings } =
    useGetAllBookingsQuery(companyId);

  const { data: allUsers = [] } = useAdminGetAllDriversQuery();
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
  useEffect(() => {
    if (selectedBooking?.drivers) {
      const preSelected = (drivers?.drivers || []).filter((driver) =>
        selectedBooking.drivers.some(
          (d) => d.driverId === driver._id || d.userId === driver._id
        )
      );
      setSelectedDrivers(preSelected);
      setPreviouslySelectedDrivers(preSelected); // Track initially selected drivers
    }
  }, [selectedBooking, drivers]);

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
  useEffect(() => {
    const all = (filteredDriver || []).map((d) => String(d._id));
    const chosen = new Set(
      (selectedDrivers || []).map((d) =>
        String(d._id ?? d.userId ?? d.driverId)
      )
    );

    const allSelected = all.length > 0 && all.every((id) => chosen.has(id));
    if (selectAll !== allSelected) setSelectAll(allSelected);
  }, [filteredDriver, selectedDrivers]);
  const removeDriverJobsAndNotifications = async (removedDrivers) => {
    for (const removedDriver of removedDrivers) {
      try {
        // Find the job for this driver and booking
        const driverJobs =
          jobsData?.jobs?.filter(
            (job) =>
              job.bookingId?.toString() === selectedBooking._id?.toString() &&
              (job.driverId?.toString() === removedDriver._id?.toString() ||
                job.driverId?._id?.toString() === removedDriver._id?.toString())
          ) || [];
        for (const job of driverJobs) {
          console.log(
            "Attempting to delete job:",
            job._id,
            "for booking:",
            selectedBooking?._id,
            "driverId:",
            job.driverId
          );
          await deleteJob(job._id).unwrap();

          console.log(
            `Deleted job ${job._id} for driver ${removedDriver.DriverData?.firstName}`
          );
        }
        // Find and delete notifications
        if (removedDriver.DriverData?.employeeNumber) {
          const { data: notificationsForDriver } = await dispatch(
            notificationApi.endpoints.getUserNotifications.initiate(
              removedDriver.DriverData.employeeNumber
            )
          );

          const matchingNotifications =
            notificationsForDriver?.filter(
              (notif) =>
                notif?.bookingId === selectedBooking.bookingId &&
                notif?.employeeNumber ===
                  removedDriver.DriverData.employeeNumber
            ) || [];

          for (const notification of matchingNotifications) {
            if (notification._id) {
              await deleteNotification(notification._id).unwrap();
              console.log(
                `Deleted notification ${notification._id} for driver ${removedDriver.DriverData?.firstName}`
              );
            }
          }
        }

        toast.success(
          `Removed job and notification for ${
            removedDriver.DriverData?.firstName || "driver"
          }`
        );
      } catch (error) {
        console.error(
          `Failed to remove job/notification for driver ${removedDriver.DriverData?.firstName}:`,
          error
        );
        toast.error(
          `Failed to remove assignment for ${
            removedDriver.DriverData?.firstName || "driver"
          }`
        );
      }
    }
  };
  const handleSendEmail = async () => {
    try {
      const currentDriverIds = new Set(
        selectedDrivers.map((d) => String(d.userId ?? d._id ?? d.driverId))
      );
      console.log(currentDriverIds, "Current Driver IDs");
      const removedDrivers = previouslySelectedDrivers.filter(
        (driver) =>
          !currentDriverIds.has(
            String(driver.userId ?? driver.driverId ?? driver._id)
          )
      );

      console.log(removedDrivers, "Removed Drivers");
      if (removedDrivers.length > 0) {
        await removeDriverJobsAndNotifications(removedDrivers);
      }
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
        // No drivers selected: clear all from booking
        const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;

        await updateBooking({
          id: booking._id,
          updatedData: {
            bookingData: {
              ...restBookingData,
              drivers: [],
            },
          },
        }).unwrap();

        if (typeof refetchBookings === "function") {
          refetchBookings();
        }
        toast.success("All drivers removed from this booking.");
        setPreviouslySelectedDrivers(selectedDrivers);

        setShowDriverModal(false);
        if (onDriversUpdate) {
          onDriversUpdate(selectedRow, selectedDrivers);
        }
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

      if (selectedDrivers.length > 0) {
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
      }

      setShowDriverModal(false);
      if (onDriversUpdate) {
        onDriversUpdate(selectedRow, selectedDrivers);
      }
    } catch (error) {
      toast.error("Something went wrong while assigning drivers.");
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
                  checked={selectedDrivers.some(
                    (d) =>
                      d._id === driver._id ||
                      d.driverId === driver._id ||
                      d.userId === driver._id
                  )}
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
