import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
  useGetAllJobsQuery,
} from "../../../redux/api/jobsApi";
import { useCreateNotificationMutation } from "../../../redux/api/notificationApi";
const ViewDriver = ({ selectedRow, setShowDriverModal, onDriversUpdate }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [createNotification] = useCreateNotificationMutation();

  const { data: jobsData, refetch: refetchJobs } = useGetAllJobsQuery(
    companyId,
    {
      skip: !companyId,
    }
  );

  const [createJob] = useCreateJobMutation();
  const [deleteJob] = useDeleteJobMutation();

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
  useEffect(() => {
    if (!selectedBooking || !allUsers?.drivers) return;
  
    const getIdStr = (v) =>
      v?._id?.toString?.() || v?.$oid || v?.toString?.() || String(v || "");
  
    // 1) If an Accepted job exists for this booking, preselect ONLY that driver
    const acceptedJob = (jobsData?.jobs || []).find((j) => {
      const jBookingId =
        getIdStr(j?.bookingId) || getIdStr(j?.bookingId?._id);
      return (
        j.jobStatus === "Accepted" &&
        jBookingId === getIdStr(selectedBooking?._id)
      );
    });
  
    if (acceptedJob) {
      const acceptedUserId = getIdStr(acceptedJob.driverId);
      const acceptedUser = (allUsers?.drivers || []).find(
        (u) => getIdStr(u._id) === acceptedUserId
      );
  
      if (acceptedUser) {
        // match to the "drivers" collection by email
        const winner = (drivers?.drivers || []).find(
          (d) =>
            d?.DriverData?.email?.toLowerCase().trim() ===
            acceptedUser.email?.toLowerCase().trim()
        );
  
        if (winner) {
          setSelectedDrivers([winner]);
          setPreviouslySelectedDrivers([winner]);
          return; // <-- IMPORTANT: stop here; only the accepted driver stays checked
        }
      }
    }
  
    // 2) Fallback (no accepted job): keep existing behavior (preselect all assigned)
    if (selectedBooking?.drivers) {
      const preSelected = (drivers?.drivers || []).filter((driver) => {
        const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();
        const matchedUser = (allUsers?.drivers || []).find(
          (user) =>
            user.email?.toLowerCase().trim() === driverEmail &&
            user.role?.toLowerCase() === "driver"
        );
  
        return (
          matchedUser &&
          selectedBooking.drivers.some(
            (d) => d.driverId === matchedUser._id || d.userId === matchedUser._id
          )
        );
      });
  
      setSelectedDrivers(preSelected);
      setPreviouslySelectedDrivers(preSelected);
    }
  }, [selectedBooking, drivers, allUsers, jobsData]);
  
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
  const removeDriverJobs = async (removedUserDrivers, allJobs = []) => {
    const status = String(selectedBooking?.status || "")
      .trim()
      .toLowerCase();
    const canDelete =
      status === "new" ||
      status === "already assigned" ||
      status === "cancelled" ||
      status === "rejected";

    if (!canDelete) {
      toast.error(
        `Cannot remove driver(s) when booking status is "${
          selectedBooking?.status || "Unknown"
        }".`
      );
      return false;
    }

    for (const removedUser of removedUserDrivers) {
      try {
        const userId = removedUser._id?.toString();
        if (!userId) continue;

        const bookingId = selectedBooking?._id?.toString();

        const driverJobs = (allJobs || []).filter((job) => {
          const jobBookingId =
            job?.bookingId?._id?.toString?.() ||
            job?.bookingId?.$oid ||
            job?.bookingId?.toString?.();
          const jobDriverId =
            job?.driverId?._id?.toString?.() ||
            job?.driverId?.$oid ||
            job?.driverId?.toString?.();
          return jobBookingId === bookingId && jobDriverId === userId;
        });

        for (const job of driverJobs) {
          const jobId = job?._id?.toString?.();
          if (jobId) {
            await deleteJob(jobId).unwrap();
          }
        }

        toast.success(`Removed job for ${removedUser.fullName || "driver"}`);
      } catch (error) {
        console.error("Failed to remove job:", error);
        toast.error(
          `Failed to remove assignment for ${removedUser.fullName || "driver"}`
        );
        return false;
      }
    }

    try {
      await refetchJobs();
    } catch {}
    return true;
  };

  const handleSendEmail = async () => {
    if (selectedBooking?.status === "Accepted") {
  toast.error(
    "This booking has already been accepted. Please cancel the booking and create a new one to assign it to another driver."
  );
  return;
}
    try {
      const userEmailToIdMap = new Map(
        (allUsers?.drivers || [])
          .filter((user) => user.email && user.role?.toLowerCase() === "driver")
          .map((user) => [user.email.toLowerCase().trim(), user._id])
      );

      const currentDriverIds = new Set(
        selectedDrivers
          .map((driver) => {
            const email = driver?.DriverData?.email?.toLowerCase().trim();
            return userEmailToIdMap.get(email);
          })
          .filter(Boolean)
      );

      const previousDriverIds = new Set(
        previouslySelectedDrivers
          .map((driver) => {
            const email = driver?.DriverData?.email?.toLowerCase().trim();
            return userEmailToIdMap.get(email);
          })
          .filter(Boolean)
      );

      // drivers removed this update (you already have this)
      const removedDrivers = (allUsers?.drivers || []).filter(
        (user) =>
          user.role?.toLowerCase() === "driver" &&
          previousDriverIds.has(user._id) &&
          !currentDriverIds.has(user._id)
      );

      // ✅ drivers added this update (create jobs ONLY for these)
      const addedDrivers = (allUsers?.drivers || []).filter(
        (user) =>
          user.role?.toLowerCase() === "driver" &&
          currentDriverIds.has(user._id) &&
          !previousDriverIds.has(user._id)
      );

      if (removedDrivers.length > 0) {
        const ok = await removeDriverJobs(removedDrivers, jobsData?.jobs || []);
        if (!ok) return; // << early exit fixes the double-toast
      }
      // ✅ Send unassignment notification to removed drivers
await Promise.all(
  removedDrivers.map(async (driverUser) => {
    try {
      const driver = (drivers?.drivers || []).find(
        (d) =>
          d?.DriverData?.email?.toLowerCase().trim() ===
          driverUser.email?.toLowerCase().trim()
      );

      if (!driver) return;

      const employeeNumber = driver?.DriverData?.employeeNumber;
      if (!employeeNumber) {
        toast.warning(
          `${driver?.DriverData?.firstName || "Driver"} has no employee number. Skipped unassignment notification.`
        );
        return;
      }

      const notificationPayload = {
        employeeNumber: employeeNumber,
        bookingId: selectedBooking?.bookingId,
        status: "Unassigned", // 👈 FIXED
        isUnassignment: true,
        primaryJourney: {
          pickup:
            selectedBooking?.primaryJourney?.pickup ||
            selectedBooking?.returnJourney?.pickup,
          dropoff:
            selectedBooking?.primaryJourney?.dropoff ||
            selectedBooking?.returnJourney?.dropoff,
        },
        bookingSentAt: new Date(),
        createdBy: user?._id,
        companyId,
      };

      await createNotification(notificationPayload).unwrap();
      toast.success(
        `Unassignment notification sent to ${driver?.DriverData?.firstName}`
      );
    } catch (error) {
      toast.error(
        `Failed to send unassignment notification to ${driverUser?.firstName}`
      );
    }
  })
);

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
        addedDrivers.map(async (user) => {
          const matchedDriver = (drivers?.drivers || []).find(
            (d) =>
              d?.DriverData?.email?.toLowerCase().trim() ===
              user.email?.toLowerCase().trim()
          );

          const jobPayload = {
            bookingId: booking._id,
            driverId: user._id, // user is the driver "account" id
            assignedBy: user?._id
              ? user?._id
              : (typeof window !== "undefined" ? undefined : undefined) ||
                user?._id, // keep your original assignedBy logic
            companyId,
          };

          try {
            await createJob(jobPayload).unwrap();
            toast.success(
              `Job created for ${
                matchedDriver?.DriverData?.firstName || "driver"
              }`
            );
          } catch (err) {
            toast.error(
              `Failed to create job for ${
                matchedDriver?.DriverData?.firstName || "driver"
              }`
            );
          }
        })
      );
      if (sendEmailChecked) {
        await Promise.all(
          addedDrivers.map(async (user) => {
            const driver = (drivers?.drivers || []).find(
              (d) =>
                d?.DriverData?.email?.toLowerCase().trim() ===
                user.email?.toLowerCase().trim()
            );
            const email = driver?.DriverData?.email;
            if (!email) return;
            await sendBookingEmail({ bookingId: booking._id, email }).unwrap();
            toast.success(`Email sent to ${driver?.DriverData?.firstName}`);
          })
        );
      }
      if (selectedDrivers.length > 0) {
        await Promise.all(
          selectedDrivers.map(async (driver) => {
            const { DriverData } = driver;
      
            // Find the corresponding user account for this driver
            const driverEmail = DriverData?.email?.toLowerCase().trim();
            if (!driverEmail) {
              toast.warning(`${DriverData?.firstName || "Driver"} has no email. Skipped notification.`);
              return;
            }
      
            const correspondingUser = (allUsers?.drivers || []).find(
              (user) =>
                user.email?.toLowerCase().trim() === driverEmail &&
                user.role?.toLowerCase() === "driver" &&
                user.companyId === companyId
            );
            if (!correspondingUser) {
              toast.warning(`${DriverData?.firstName || "Driver"} has no user account. Skipped notification.`);
              return;
            }
      
      
            const notificationPayload = {
              employeeNumber: DriverData.employeeNumber, 
              bookingId: booking.bookingId,
              status: "Assigned",
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
              toast.success(`Assignment notification sent to ${DriverData?.firstName}`);
            } catch (error) {
              toast.error(`Failed to send assignment notification to ${DriverData?.firstName}`);
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

  const findMatchingUser = (driver) => {
    const driverEmployeeNumber = driver?.DriverData?.employeeNumber;
    const driverCompanyId = driver?.DriverData?.companyId || companyId;

    const matchingUser = (allUsers?.drivers || []).find(
      (user) =>
        user.role?.toLowerCase() === "driver" &&
        user.employeeNumber === driverEmployeeNumber &&
        user.companyId === driverCompanyId
    );

    return matchingUser;
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

       {filteredDriver.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    {(drivers?.drivers || []).length === 0 ? (
      <>
        <div className="text-4xl mb-3">👥</div>
        <p className="text-gray-600 font-medium mb-1">No Driver Accounts Found</p>
        <p className="text-gray-500 text-sm text-center">Please create driver accounts to assign bookings</p>
      </>
    ) : showMatching ? (
      <>
        <div className="text-4xl mb-3">🚗</div>
        <p className="text-gray-600 font-medium mb-1">No Matching Drivers</p>
        <p className="text-gray-500 text-sm text-center">No drivers available for this vehicle type</p>
      </>
    ) : (
      <>
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-600 font-medium mb-1">No Results Found</p>
        <p className="text-gray-500 text-sm text-center">Try adjusting your search terms</p>
      </>
    )}
  </div>
) : (
            <>
            <div className="max-h-48 overflow-y-auto pr-1 space-y-3 custom-scroll border border-gray-500 rounded-md">
              {Array.isArray(filteredDriver) &&
                filteredDriver.map((driver, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 p-3    cursor-pointer"
                  >
                    <img
                      src={
                        driver.UploadedData?.driverPicture || IMAGES.dummyImg
                      }
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
                        const matchingUser = findMatchingUser(driver);
                        const isSelected = selectedDrivers.some(
                          (d) =>
                            d._id === driver._id ||
                            d.driverId === driver._id ||
                            d.userId === driver._id
                        );

                        if (isSelected) {
                          // UNCHECK: remove from selection
                          setSelectedDrivers((prev) =>
                            prev.filter(
                              (d) =>
                                !(
                                  d._id === driver._id ||
                                  d.driverId === driver._id ||
                                  d.userId === driver._id
                                )
                            )
                          );
                        } else {
                          setSelectedDrivers((prev) => [...prev, driver]);
                        }
                      }}
                    />
                  </label>
                ))}
        </div>
            </>
          )}

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
