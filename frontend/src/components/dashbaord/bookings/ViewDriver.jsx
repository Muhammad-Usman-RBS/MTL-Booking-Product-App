import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import IMAGES from "../../../assets/images";
import { useCreateJobMutation } from "../../../redux/api/jobsApi";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import { useAdminGetAllDriversQuery } from "../../../redux/api/adminApi";
import { useCreateNotificationMutation } from "../../../redux/api/notificationApi";
import {
  useGetAllBookingsQuery,
  useSendBookingEmailMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";

const ViewDriver = ({ selectedRow, setShowDriverModal, onDriversUpdate }) => {
  const [createNotification] = useCreateNotificationMutation();
  const [createJob] = useCreateJobMutation();

  const [updateBooking] = useUpdateBookingMutation();

  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMatching, setShowMatching] = useState(false);
  const [sendEmailChecked, setSendEmailChecked] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
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

      // Update Booking - Store driver objects with both user ID and driver details
      const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;

      // Create driver objects that contain both user ID and driver information
      const driverObjects = selectedDrivers
        .map((driver) => {
          const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();
          const matchedUser = (allUsers?.drivers || []).find(
            (user) =>
              user.email?.toLowerCase().trim() === driverEmail &&
              user.role?.toLowerCase() === "driver"
          );

          return {
            _id: matchedUser?._id, // User ID for system operations
            userId: matchedUser?._id, // Explicit user ID reference
            driverId: driver._id, // Original driver record ID
            name: driver?.DriverData?.firstName || "Unnamed",
            email: driver?.DriverData?.email,
            employeeNumber: driver?.DriverData?.employeeNumber,
            // Store additional driver info for easy access
            driverInfo: {
              firstName: driver?.DriverData?.firstName,
              email: driver?.DriverData?.email,
              employeeNumber: driver?.DriverData?.employeeNumber,
            },
          };
        })
        .filter((obj) => obj._id); // Only include drivers with valid user IDs

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
      console.log("🧾 Creating Jobs for Drivers...");
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

          console.log("📤 Sending Job Payload:", jobPayload);

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

      // ✅ Send Email Alerts
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

      // ✅ Notifications
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
              {/* {convertKmToMiles(viewData?.primaryJourney?.distanceText)} */}
              {convertKmToMiles(
                selectedBooking?.primaryJourney?.distanceText
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
              value={selectedBooking?.driverFare || ""}
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
                    {driver.VehicleData?.carMake || "N/A"} |{" "}
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
