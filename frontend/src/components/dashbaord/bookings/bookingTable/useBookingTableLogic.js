import { useMemo } from 'react';
import EmptyTableMessage from "../../../../constants/constantscomponents/EmptyTableMessage";

export const useBookingTableLogic = ({
  user,
  companyId,
  bookingData,
  jobData,
  driversData,
  assignedDrivers,
  selectedStatus,
  selectedPassengers,
  selectedDrivers,
  selectedVehicleTypes,
  selectedColumns,
  startDate,
  endDate,
  isDeletedTab,
  timezone,
  bookingSettingData,
  refetchBookings,
  refetchJobs,
}) => {
  const isDriver = user?.role === "driver";
  const refetch = isDriver ? refetchJobs : refetchBookings;

  const getErrMsg = (e) =>
    e?.data?.message || "Failed to update status";

  const getIdStr = (v) =>
    v?._id?.toString?.() || v?.$oid || v?.toString?.() || String(v || "");

  const allHeaders = [
    { label: "Booking Id", key: "bookingId" },
    { label: "Type", key: "bookingType" },
    { label: "Pick Up", key: "pickUp" },
    { label: "Drop Off", key: "dropOff" },
    { label: "Passenger", key: "passenger" },
    { label: "Date & Time", key: "date" },
    { label: "Vehicle", key: "vehicle" },
    { label: "Payment", key: "payment" },
    { label: "Journey Fare", key: "journeyFare" },
    { label: "Driver Fare", key: "driverFare" },
    { label: "Return Fare", key: "returnJourneyFare" },
    { label: "Return DR Fare", key: "returnDriverFare" },
    { label: "Driver", key: "driver" },

    // ✈️ Flight Details
    { label: "Flight No.", key: "flightNumber" },
    { label: "Arrival (Scheduled)", key: "flightArrivalScheduled" },
    { label: "Arrival (Estimated)", key: "flightArrivalEstimated" },

    { label: "Created At", key: "createdAt" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  // Filter table headers based on user role
  let tableHeaders = allHeaders;
  if (user?.role === "driver") {
    tableHeaders = allHeaders.filter(
      (header) =>
        header.key !== "journeyFare" &&
        header.key !== "returnJourneyFare" &&
        header.key !== "driverFare" &&
        header.key !== "returnDriverFare"
    );
  } else if (user?.role === "customer") {
    tableHeaders = allHeaders.filter(
      (header) =>
        header.key !== "driverFare" &&
        header.key !== "returnDriverFare"
    );
  }

  const emptyTableRows = EmptyTableMessage({
    message: "No data to show, create booking",
    colSpan: tableHeaders.length,
  });

  const isWithinCancelWindow = (booking, cancelWindow) => {
    if (!booking || !cancelWindow) return false;

    const journey = booking.returnJourneyToggle ? booking.returnJourney : booking.primaryJourney;
    if (!journey?.date || journey.hour === undefined || journey.minute === undefined) {
      return false;
    }

    const pickupDate = new Date(journey.date);
    pickupDate.setHours(journey.hour);
    pickupDate.setMinutes(journey.minute);
    pickupDate.setSeconds(0);
    pickupDate.setMilliseconds(0);

    const now = new Date();
    const timeDiffMs = pickupDate.getTime() - now.getTime();

    let windowMs = cancelWindow.value;
    switch (cancelWindow.unit) {
      case "Minutes":
        windowMs *= 60 * 1000;
        break;
      case "Hours":
        windowMs *= 60 * 60 * 1000;
        break;
      case "Days":
        windowMs *= 24 * 60 * 60 * 1000;
        break;
      case "Weeks":
        windowMs *= 7 * 24 * 60 * 60 * 1000;
        break;
      case "Months":
        windowMs *= 30 * 24 * 60 * 60 * 1000;
        break;
      case "Years":
        windowMs *= 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        windowMs *= 60 * 60 * 1000; // default to hours
    }

    return timeDiffMs < windowMs;
  };

  const isCancelledByRole = (item, roles = []) => {
    if (String(item?.status).toLowerCase() !== "cancelled") return false;
    if (!Array.isArray(item?.statusAudit)) return false;

    const entry = item.statusAudit
      .slice()
      .reverse()
      .find((a) => String(a?.status || "").trim().toLowerCase() === "cancelled");

    if (!entry) return false;

    const byRaw = String(entry.updatedBy || "").toLowerCase();
    return roles.some((role) => byRaw.includes(role.toLowerCase()));
  };

  // Process bookings data
  const processedBookings = useMemo(() => {
    let bookings = [];

    if (!isDriver) {
      bookings = (bookingData?.bookings || []).filter(
        (b) => b?.companyId?.toString() === companyId?.toString()
      );

      if (user?.role === "customer" && user?.email) {
        bookings = bookings.filter((b) => b?.passenger?.email === user.email);
      }

      // Merge job data with bookings for non-driver users
      const jobs = (jobData?.jobs || []).filter(
        (j) => j.companyId?.toString() === companyId?.toString()
      );

      bookings = bookings.map((booking) => {
        const matchingJobs = jobs.filter(
          (job) => job.bookingId?.toString() === booking._id?.toString()
        );

        if (matchingJobs.length > 0) {
          const latestJob = matchingJobs.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          return {
            ...booking,
            jobId: latestJob._id,
            jobStatus: latestJob.jobStatus,
            driverRejectionNote: latestJob.driverRejectionNote,
            assignedDriverId: latestJob.driverId,
          };
        }

        return booking;
      });
    } else {
      bookings = (jobData?.jobs || [])
        .filter((j) => j.driverId === user._id || j.driverId?._id === user._id)
        .map((j) => {
          const b = j.bookingId;
          return {
            ...b,
            jobId: j._id,
            jobStatus: j.jobStatus,
            driverRejectionNote: j.driverRejectionNote,
          };
        });
    }

    return bookings;
  }, [bookingData, jobData, user, companyId, isDriver]);

  // Replace the driverMatch logic in your useBookingTableLogic hook with this:
  const filteredBookings = useMemo(() => {
    let filtered = processedBookings.filter((b) => {
      if (b.status === "Deleted" || b.status === "Completed") return false;
      const journey = b.returnJourneyToggle ? b.returnJourney : b.primaryJourney;
      if (!journey?.date) return false;

      const bookingDateStr = new Date(journey.date).toISOString().split("T")[0];
      const startStr = startDate
        ? new Date(startDate).toISOString().split("T")[0]
        : null;
      const endStr = endDate
        ? new Date(endDate).toISOString().split("T")[0]
        : null;

      const dateTime =
        !startStr || !endStr
          ? true
          : bookingDateStr >= startStr && bookingDateStr <= endStr;

      const statusMatch =
        selectedStatus.includes("All") || selectedStatus.length === 0
          ? true
          : selectedStatus.includes(b.status);

      const passengerMatch =
        selectedPassengers.length === 0
          ? true
          : selectedPassengers.includes(b.passenger?.name);

      // 🔧 FIXED DRIVER FILTER LOGIC
      const driverMatch = (() => {
        // If no drivers selected, show all
        if (!Array.isArray(selectedDrivers) || selectedDrivers.length === 0) {
          return true;
        }

        // Check multiple possible driver data structures
        const driverIds = [];

        // 1. Check assignedDriverId from job data
        if (b.assignedDriverId) {
          const driverId = typeof b.assignedDriverId === 'object'
            ? b.assignedDriverId._id || b.assignedDriverId
            : b.assignedDriverId;
          driverIds.push(driverId.toString());
        }

        // 2. Check drivers array
        if (Array.isArray(b.drivers) && b.drivers.length > 0) {
          b.drivers.forEach((driver) => {
            if (typeof driver === "object") {
              // Driver object with _id
              if (driver._id) {
                driverIds.push(driver._id.toString());
              }
              // Driver object with driverId
              if (driver.driverId) {
                const id = typeof driver.driverId === 'object'
                  ? driver.driverId._id || driver.driverId
                  : driver.driverId;
                driverIds.push(id.toString());
              }
            } else {
              // Driver is just an ID string/ObjectId
              driverIds.push(driver.toString());
            }
          });
        }

        // 3. Check direct driver field (if exists)
        if (b.driver) {
          const id = typeof b.driver === 'object'
            ? b.driver._id || b.driver
            : b.driver;
          driverIds.push(id.toString());
        }

        // Remove duplicates
        const uniqueDriverIds = [...new Set(driverIds)];

        // Check if any of the booking's driver IDs match selected drivers
        return uniqueDriverIds.some(driverId =>
          selectedDrivers.some(selectedId =>
            selectedId.toString() === driverId
          )
        );
      })();

      const vehicleMatch =
        selectedVehicleTypes.length === 0
          ? true
          : selectedVehicleTypes.includes(b.vehicle?.vehicleName);

      return statusMatch && passengerMatch && driverMatch && vehicleMatch && dateTime;
    });
    if (selectedStatus.includes("Scheduled")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize to midnight
    
      filtered = filtered.filter((b) => {
        const journey = b.returnJourneyToggle ? b.returnJourney : b.primaryJourney;
        if (!journey?.date) return false;
        const bookingDate = new Date(journey.date);
        return bookingDate >= today;
      });
    }
    // Sorting (optional)
    filtered.sort((a, b) => {
      let aMatch = 0;
      let bMatch = 0;
      if (selectedVehicleTypes.includes(a.vehicle?.vehicleName)) aMatch++;
      if (selectedVehicleTypes.includes(b.vehicle?.vehicleName)) bMatch++;
      return bMatch - aMatch;
    });

    return filtered;
  }, [
    processedBookings,
    selectedStatus,
    selectedPassengers,
    selectedDrivers,
    selectedVehicleTypes,
    startDate,
    endDate,
    user,
    assignedDrivers,
  ]);

  // Check for primary and return journey types
  const hasPrimary = filteredBookings.some((b) => {
    const type = b.returnJourney ? "Return" : "Primary";
    return type === "Primary";
  });

  const hasReturn = filteredBookings.some((b) => {
    const type = b.returnJourney ? "Return" : "Primary";
    return type === "Return";
  });

  // Check if any booking has flight number
  const hasFlightNumber = filteredBookings.some(
    (b) =>
      b?.primaryJourney?.flightNumber ||
      b?.returnJourney?.flightNumber
  );

  // Filter table headers
  const filteredTableHeaders = useMemo(() => {
    return tableHeaders.filter((header) => {
      const key = header.key;

      if (isDeletedTab && key === "status") return false;
      if (!selectedColumns[key]) return false;

      if (!hasPrimary && (key === "journeyFare" || key === "driverFare"))
        return false;
      if (!hasReturn && (key === "returnJourneyFare" || key === "returnDriverFare"))
        return false;

      // 👇 flight fields hide if no flightNumber
      if (
        !hasFlightNumber &&
        (key === "flightNumber" ||
          key === "flightArrivalScheduled" ||
          key === "flightArrivalEstimated")
      ) {
        return false;
      }

      return true;
    });
  }, [tableHeaders, isDeletedTab, selectedColumns, hasPrimary, hasReturn, hasFlightNumber]);

  // Export table data
  const exportTableData = useMemo(() => {
    const formatPassenger = (p) =>
      !p || typeof p !== "object"
        ? "-"
        : `${p.name || "N/A"} | ${p.email || 0} | +${p.phone || 0}`;

    const formatVehicle = (v) =>
      !v || typeof v !== "object"
        ? "-"
        : `${v.vehicleName || "N/A"} | ${v.passenger || 0} | ${v.handLuggage || 0
        } | ${v.checkinLuggage || 0}`;

    return filteredBookings.map((item) => {
      const base = {
        bookingId: item.bookingId,
        bookingType: item?.returnJourney ? "Return" : "Primary",
        passenger: formatPassenger(item.passenger),
        date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
        pickUp: item.primaryJourney?.pickup || "-",
        dropOff: item.primaryJourney?.dropoff || "-",
        vehicle: formatVehicle(item.vehicle),
        payment: item.paymentMethod || "-",
        flightNumber:
          item.primaryJourney?.flightNumber ||
          item.returnJourney?.flightNumber ||
          "-",
        flightArrivalScheduled:
          item.primaryJourney?.flightArrival?.scheduled
            ? new Date(item.primaryJourney.flightArrival.scheduled).toLocaleString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            : item.returnJourney?.flightArrival?.scheduled
              ? new Date(item.returnJourney.flightArrival.scheduled).toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              : "-",
        flightArrivalEstimated:
          item.primaryJourney?.flightArrival?.estimated
            ? new Date(item.primaryJourney.flightArrival.estimated).toLocaleString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            : item.returnJourney?.flightArrival?.estimated
              ? new Date(item.returnJourney.flightArrival.estimated).toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              : "-",
        driverFare: item.driverFare !== undefined ? item.driverFare : "-",
        returnDriverFare:
          item.returnDriverFare !== undefined ? item.returnDriverFare : "-",

        driver: Array.isArray(item.drivers)
          ? item.drivers
            .map((driver) => {
              if (typeof driver === "object") {
                if (driver.driverInfo?.firstName) {
                  return driver.driverInfo.firstName;
                } else if (driver.driverId) {
                  const matchedDriver = assignedDrivers.find(
                    (d) => d?._id?.toString() === driver.driverId?.toString()
                  );
                  return matchedDriver?.DriverData?.firstName || "Unnamed";
                }
              } else {
                const driverId = driver;
                const matchedDriver = assignedDrivers.find(
                  (d) => d?._id?.toString() === driverId?.toString()
                );
                return matchedDriver?.DriverData?.firstName || "Unnamed";
              }
              return "Unnamed";
            })
            .join(", ")
          : "-",
        status: item.statusAudit?.at(-1)?.status || item.status || "-",
      };

      if (user?.role !== "driver") {
        base.journeyFare =
          item.journeyFare !== undefined ? item.journeyFare : "-";
        base.returnJourneyFare =
          item.returnJourneyFare !== undefined ? item.returnJourneyFare : "-";
      }

      return base;
    });
  }, [filteredBookings, assignedDrivers, user]);

  return {
    filteredBookings,
    filteredTableHeaders,
    exportTableData,
    emptyTableRows,
    isDriver,
    refetch,
    getErrMsg,
    getIdStr,
    allHeaders,
    tableHeaders,
    isWithinCancelWindow,
    isCancelledByRole,
    processedBookings,
    hasPrimary,
    hasReturn,
  };
};