import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GripHorizontal } from "lucide-react";
import SelectStatus from "./SelectStatus";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { useGetAllBookingsQuery, useDeleteBookingMutation, useUpdateBookingStatusMutation } from "../../../redux/api/bookingApi";
import { useGetAllJobsQuery, useUpdateJobStatusMutation } from "../../../redux/api/jobsApi";
import Icons from "../../../assets/icons";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import moment from "moment-timezone";

const BookingsTable = ({
  assignedDrivers,
  selectedColumns,
  selectedActionRow,
  setSelectedActionRow,
  openAuditModal,
  openViewModal,
  openDriverModal,
  actionMenuItems,
  setEditBookingData,
  setShowEditModal,
  selectedStatus,
  selectedPassengers,
  selectedVehicleTypes,
  setShowViewModal,
  setShowAuditModal,
  setShowDriverModal,
  isAnyModalOpen,
  selectedRow,
  setSelectedRow,
  selectedDrivers,
  startDate,
  endDate,
}) => {
  const user = useSelector((state) => state.auth.user);
  const timezone =
    useSelector((state) => state.timezone?.timezone) || "UTC";
  const companyId = user?.companyId;
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });
  const [page, setPage] = useState(1);
  const [isDeletedTab, setIsDeletedTab] = useState(false);
  const [updateJobStatus] = useUpdateJobStatusMutation();

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
    { label: "Created At", key: "createdAt" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

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
        header.key !== "returnDriverFare" &&
        header.key !== "status"
    );
  }

  const emptyTableRows = EmptyTableMessage({
    message: "No data to show, create booking",
    colSpan: tableHeaders.length,
  });
  const isDriver = user?.role === "driver";

  const {
    data: bookingData = {},
    isLoading: isBookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetAllBookingsQuery(companyId, { skip: !companyId || isDriver });

  const {
    data: jobData = {},
    isLoading: isJobsLoading,
    refetch: refetchJobs,
  } = useGetAllJobsQuery(companyId, { skip: !companyId });
  const { data: driversData = {}, isLoading: isDriversLoading } =
    useGetAllDriversQuery({ skip: !companyId });
  console.log("jobData", jobData);

  const refetch = isDriver ? refetchJobs : refetchBookings;
  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

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
      // Find matching jobs for this booking
      const matchingJobs = jobs.filter(
        (job) => job.bookingId?.toString() === booking._id?.toString()
      );

      if (matchingJobs.length > 0) {
        // Get the latest job status
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

  let filteredBookings = bookings.filter((b) => {
    // First filter by tab (Active/Deleted)
    if (b.status === "Deleted") return false;

    const createdAt = new Date(b.createdAt);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const statusMatch =
      selectedStatus.includes("All") || selectedStatus.length === 0
        ? true
        : selectedStatus.includes(b.status);

    const passengerMatch =
      selectedPassengers.length === 0
        ? true
        : selectedPassengers.includes(b.passenger?.name);

    const driverMatch =
      !Array.isArray(selectedDrivers) || selectedDrivers.length === 0
        ? true
        : Array.isArray(b.drivers)
          ? b.drivers.some((d) => selectedDrivers.includes(d?._id || d))
          : false;

    const dateTime =
      !startDate || !endDate ? true : createdAt >= start && createdAt <= end;

    const result = statusMatch && passengerMatch && driverMatch && dateTime;

    return result;
  });

  if (user?.role === "driver" && user?.employeeNumber) {
    filteredBookings = filteredBookings.filter((booking) => {
      if (!Array.isArray(booking.drivers)) return false;

      return booking.drivers.some((driverId) => {
        const id = typeof driverId === "object" ? driverId._id : driverId;
        const driver = assignedDrivers.find((d) => d._id === id);
        return driver?.DriverData?.employeeNumber === user.employeeNumber;
      });
    });
  }

  filteredBookings.sort((a, b) => {
    let aMatch = 0;
    let bMatch = 0;
    if (selectedVehicleTypes.includes(a.vehicle?.vehicleName)) aMatch++;
    if (selectedVehicleTypes.includes(b.vehicle?.vehicleName)) bMatch++;
    return bMatch - aMatch;
  });

  const hasPrimary = filteredBookings.some((b) => {
    const type = b.returnJourney ? "Return" : "Primary";
    return type === "Primary";
  });

  const hasReturn = filteredBookings.some((b) => {
    const type = b.returnJourney ? "Return" : "Primary";
    return type === "Return";
  });

  const filteredTableHeaders = tableHeaders.filter((header) => {
    const key = header.key;

    if (isDeletedTab && key === "status") return false;
    if (!selectedColumns[key]) return false;

    if (!hasPrimary && (key === "journeyFare" || key === "driverFare"))
      return false;
    if (
      !hasReturn &&
      (key === "returnJourneyFare" || key === "returnDriverFare")
    )
      return false;

    return true;
  });

  useEffect(() => {
    async function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowAuditModal(false);
        setShowViewModal(false);
        setShowDriverModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedActionRow(null);
      }

      const updateStatus = async (id, status) => {
        if (isDriver) {
          await updateJobStatus({ jobId: id, jobStatus: status }).unwrap();
        } else {
          await updateBookingStatus({
            id,
            status,
            updatedBy: `${user.role} | ${user.fullName}`,
          }).unwrap();
        }
      };

      if (isAnyModalOpen || selectedRow == null) return;
      const selectedBooking = filteredBookings.find(
        (b) => b._id === selectedRow
      );
      if (!selectedBooking) return;

      const key = event.key.toLowerCase();

      if (event.shiftKey) {
        if (key === "c") {
          updateBookingStatus({
            id: selectedBooking._id,
            status: "Cancel",
            updatedBy: `${user.role} | ${user.fullName}`,
          })
            .unwrap()
            .then(() => {
              toast.success('Status updated to "Cancel"');
              refetch();
            })
            .catch(() => {
              toast.error("Failed to update status");
            });
          return;
        }
        if (key === "r") {
          const newStatus = "Ride Started";
          updateStatus(selectedBooking._id, newStatus);
          toast.success(`Status updated to "${newStatus}"`);
          refetch();
          return;
        }

        if (key === "d") {
          if (user?.role === "driver") {
            toast.info("Drivers are not allowed to delete bookings");
            return;
          }

          if (isDeletedTab) {
            setSelectedDeleteId(selectedBooking._id);
            setShowDeleteModal(true);
          } else {
            try {
              await updateBookingStatus({
                id: selectedBooking._id,
                status: "Deleted",
                updatedBy: `${user.role} | ${user.fullName}`,
              }).unwrap();
              toast.success("Booking moved to deleted");
              refetch();
            } catch (err) {
              toast.error("Failed to delete booking");
            }
          }
          return;
        }

        if (key === "e") {
          if (user?.role === "driver") {
            toast.info("Drivers are not allowed to edit bookings");
            return;
          }
          if (isDeletedTab) {
            toast.info("This action is disabled in the Deleted tab.");
            return;
          }
          const editedData = { ...selectedBooking };
          editedData.__editReturn = !!selectedBooking.returnJourney;
          setEditBookingData(editedData);
          setShowEditModal(true);
          return;
        }
      }

      const statusMap = {
        a: "Accepted",
        o: "On Route",
        l: "At Location",
        n: "No Show",
        c: "Completed",
      };

      if (key === "d") {
        if (isDeletedTab) {
          toast.info("This action is disabled in the Deleted tab.");
          return;
        }
        openDriverModal(selectedBooking.driver);
      } else if (key === "enter") {
        openViewModal(selectedBooking);
      } else if (key in statusMap) {
        const newStatus = statusMap[key];
        updateBookingStatus({
          id: selectedBooking._id,
          status: newStatus,
          updatedBy: `${user.role} | ${user.fullName}`,
        })
          .unwrap()
          .then(() => {
            toast.success(`Status updated to "${newStatus}"`);
            refetch();
          })
          .catch(() => {
            toast.error("Failed to update status");
          });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedRow,
    filteredBookings,
    user,
    updateBookingStatus,
    openDriverModal,
    openViewModal,
    refetch,
    isAnyModalOpen,
    assignedDrivers,
    selectedDeleteId,
    isDeletedTab,
  ]);

  const formatVehicle = (v) =>
    !v || typeof v !== "object"
      ? "-"
      : `${v.vehicleName || "N/A"} | ${v.passenger || 0} | ${v.handLuggage || 0
      } | ${v.checkinLuggage || 0}`;

  const formatPassenger = (p) =>
    !p || typeof p !== "object"
      ? "-"
      : `${p.name || "N/A"} | ${p.email || 0} | +${p.phone || 0}`;

  const formatDriver = (item) => {
    const allDrivers = driversData?.drivers || [];

    // If role is customer
    if (user?.role === "customer") {
      const drivers = item.drivers || [];

      if (!drivers || drivers.length === 0) {
        // Show icon if no driver assigned
        return (
          <span className="text-[var(--dark-grey)]">
            <Icons.CircleUserRound />
          </span>
        );
      }

      // Show driver name(s) if assigned
      return drivers.map((driver, i) => (
        <div key={i} className="text-sm text-gray-700">
          {driver?.name || "Unnamed Driver"}
        </div>
      ));
    }

    // For drivers or admin
    if (item.jobStatus === "Rejected") {
      let driverName = "Unknown Driver";

      if (item.assignedDriverId) {
        const driver = allDrivers.find(
          (d) =>
            d._id?.toString() === item.assignedDriverId?.toString() &&
            d.companyId?.toString() === companyId?.toString()
        );
        driverName = driver?.fullName || driver?.name || "Unknown Driver";
      } else if (item.drivers && item.drivers.length > 0) {
        driverName = item.drivers
          .map((driver) => driver.name || "Unnamed Driver")
          .join(", ");
      }

      return (
        <div className="text-red-500 italic">
          <div className="font-medium">{driverName} - Rejected</div>
          <div className="text-xs hover:underline text-gray-500 mt-1">
            Click here to Select Driver
          </div>
        </div>
      );
    }

    if (item.jobStatus === "New" && item.drivers && item.drivers.length > 0) {
      const driverNames = item.drivers
        .map((driver) => driver.name || "Unnamed Driver")
        .join(", ");

      return (
        <div className="text-orange-600 italic">
          <div className="font-medium">Booking sent to: {driverNames}</div>
          <div className="text-xs text-gray-500 mt-1">(Awaiting acceptance)</div>
        </div>
      );
    }

    const drivers = item.drivers || [];
    if (drivers.length === 0) {
      return (
        <span className="text-[var(--dark-grey)]">
          <Icons.CircleUserRound />
        </span>
      );
    }

    return drivers.map((driver, i) => (
      <div key={i} className="text-sm text-gray-700">
        {driver.name || "Unnamed Driver"}
      </div>
    ));
  };

  let tableData = [];
  if (!bookings || bookings.length === 0 || filteredBookings.length === 0) {
    tableData = emptyTableRows;
  } else {
    tableData = filteredBookings.map((item, index) => {
      const row = { _id: item._id };
      tableHeaders.forEach(({ key }) => {
        if (!selectedColumns[key]) return;

        switch (key) {
          case "bookingId":
            row[key] = item.bookingId || "";
            break;
          case "bookingType":
            row[key] = item?.returnJourney ? "Return" : "Primary";
            break;
          case "passenger":
            row[key] = formatPassenger(item.passenger);
            break;
          case "date": {
            const journey = item.returnJourney
              ? item.returnJourney
              : item.primaryJourney;
            const rawDate = journey?.date;
            const hour = journey?.hour;
            const minute = journey?.minute;

            if (!rawDate || hour === undefined || minute === undefined) {
              row[key] = "-";
              break;
            }
            const combinedDate = new Date(rawDate);
            combinedDate.setHours(hour);
            combinedDate.setMinutes(minute);
            combinedDate.setSeconds(0);
            combinedDate.setMilliseconds(0);
            const formatted = combinedDate.toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });

            row[key] = formatted;
            break;
          }
          case "pickUp":
            const pickupLocation = item.returnJourney
              ? item.returnJourney?.pickup || "-"
              : item.primaryJourney?.pickup || "-";

            row[key] = (
              <div
                className="w-full max-w-[250px] truncate whitespace-nowrap cursor-default"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    text: pickupLocation,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() =>
                  setTooltip({ show: false, text: "", x: 0, y: 0 })
                }
              >
                {pickupLocation}
              </div>
            );
            break;
          case "dropOff":
            const dropoffLocation = item.returnJourney
              ? item.returnJourney?.dropoff || "-"
              : item.primaryJourney?.dropoff || "-";

            row[key] = (
              <div
                className="w-full max-w-[250px] truncate whitespace-nowrap cursor-default"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    text: dropoffLocation,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() =>
                  setTooltip({ show: false, text: "", x: 0, y: 0 })
                }
              >
                {dropoffLocation}
              </div>
            );
            break;
          case "vehicle":
            row[key] = item.vehicle?.vehicleName || "-";
            break;
          case "payment":
            row[key] = item.paymentMethod || "-";
            break;
          case "journeyFare":
            row[key] = item.journeyFare !== undefined ? item.journeyFare : "-";
            break;
          case "driverFare":
            row[key] = item.driverFare !== undefined ? item.driverFare : "-";
            break;
          case "returnJourneyFare":
            row[key] =
              item.returnJourneyFare !== undefined
                ? item.returnJourneyFare
                : "-";
            break;
          case "returnDriverFare":
            row[key] =
              item.returnDriverFare !== undefined ? item.returnDriverFare : "-";
            break;
          case "createdAt":
            row[key] = item.createdAt
              ? moment(item.createdAt)
                .tz(timezone)
                .format("DD/MM/YYYY HH:mm:ss")
              : "-";
            break;
          case "driver":
            row[key] =
              user?.role === "customer" ? (
                formatDriver(item)
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedRow !== item._id) {
                      setSelectedRow(item._id);
                    }
                    openDriverModal(item);
                  }}
                >
                  {formatDriver(item)}
                </div>
              );
            break;
          case "status":
            row[key] = (
              <SelectStatus
                value={
                  isDriver ? item.jobStatus || "New" : item.status || "No Show"
                }
                onChange={async (newStatus) => {
                  try {
                    if (isDriver) {
                      await updateJobStatus({
                        jobId: item.jobId,
                        jobStatus: newStatus,
                      }).unwrap();
                    } else {
                      await updateBookingStatus({
                        id: item._id,
                        status: newStatus,
                        updatedBy: `${user.role} | ${user.fullName}`,
                      }).unwrap();
                    }

                    toast.success("Status updated");
                    refetch();
                  } catch (err) {
                    toast.error("Failed to update status");
                  }
                }}
              />
            );
            break;
          case "actions":
            if (isDeletedTab) {
              row[key] = (
                <button
                  onClick={async () => {
                    try {
                      await updateBookingStatus({
                        id: item._id,
                        status: "Pending",
                        updatedBy: `${user.role} | ${user.fullName}`,
                      }).unwrap();
                      toast.success("Booking restored successfully");
                      refetch();
                    } catch (err) {
                      toast.error("Failed to restore booking");
                    }
                  }}
                  className="btn btn-reset"
                >
                  Restore
                </button>
              );
            } else {
              row[key] = (
                <div className="text-center">
                  <button
                    onClick={() =>
                      setSelectedActionRow(
                        selectedActionRow === index ? null : index
                      )
                    }
                    className="p-2 rounded hover:bg-gray-100 transition"
                  >
                    <GripHorizontal
                      size={18}
                      className="text-[var(--dark-gray)]"
                    />
                  </button>
                  {selectedActionRow === index && (
                    <div className="mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-in">
                      {actionMenuItems
                        .filter((action) => {
                          if (user?.role === "driver") {
                            return action === "View" || action === "Status Audit";
                          }
                          // Hide the "Delete" action if user is a customer
                          if (user?.role === "customer" && action === "Delete") {
                            return false;
                          }
                          return true;
                        })
                        .map((action, i) => (
                          <button
                            key={i}
                            onClick={async () => {
                              try {
                                if (action === "Status Audit") {
                                  openAuditModal(item.statusAudit);
                                } else if (action === "View") {
                                  openViewModal(item);
                                } else if (action === "Edit") {
                                  if (user?.role === "driver") {
                                    toast.info("Drivers cannot edit bookings");
                                    return;
                                  }

                                  const editedData = { ...item };
                                  editedData.__editReturn =
                                    !!item.returnJourney;
                                  setEditBookingData(editedData);
                                  setShowEditModal(true);
                                } else if (action === "Delete") {
                                  if (isDeletedTab) {
                                    // Permanent delete
                                    setSelectedDeleteId(item._id);
                                    setShowDeleteModal(true);
                                  } else {
                                    // Soft delete
                                    await updateBookingStatus({
                                      id: item._id,
                                      status: "Deleted",
                                      updatedBy: `${user.role} | ${user.fullName}`,
                                    }).unwrap();
                                    toast.success("Booking moved to deleted");
                                    refetch();
                                    setSelectedActionRow(null);
                                  }
                                } else if (action === "Copy Booking") {
                                  const copied = { ...item };

                                  // Remove IDs
                                  delete copied._id;
                                  if (copied.passenger?._id)
                                    delete copied.passenger._id;
                                  if (copied.vehicle?._id)
                                    delete copied.vehicle._id;
                                  if (copied.primaryJourney?._id)
                                    delete copied.primaryJourney._id;
                                  if (copied.returnJourney?._id)
                                    delete copied.returnJourney._id;

                                  copied.bookingId = "";
                                  copied.status = "Pending";
                                  copied.statusAudit = [];
                                  copied.createdAt = new Date().toISOString();
                                  copied.drivers = [];
                                  copied.__copyMode = true;

                                  if (item.returnJourney) {
                                    copied.primaryJourney = {
                                      ...item.returnJourney,
                                    };
                                    delete copied.returnJourney;
                                    copied.__copyReturn = false;
                                  } else {
                                    copied.__copyReturn = false;
                                  }

                                  setEditBookingData(copied);
                                  setShowEditModal(true);
                                }
                              } catch (err) {
                                toast.error("Action failed");
                                console.error(err);
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            {action}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              );
            }
            break;
          default:
            row[key] = item[key] || "-";
        }
      });
      return row;
    });
  }

  const exportTableData = filteredBookings.map((item) => {
    const base = {
      bookingId: item.bookingId,
      bookingType: item?.returnJourney ? "Return" : "Primary",
      passenger: formatPassenger(item.passenger),
      date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
      pickUp: item.primaryJourney?.pickup || "-",
      dropOff: item.primaryJourney?.dropoff || "-",
      vehicle: formatVehicle(item.vehicle),
      payment: item.paymentMethod || "-",
      driverFare: item.driverFare !== undefined ? item.driverFare : "-",
      returnDriverFare:
        item.returnDriverFare !== undefined ? item.returnDriverFare : "-",
      // In BookingsTable.js, replace the driver field in exportTableData with this:

      driver: Array.isArray(item.drivers)
        ? item.drivers
          .map((driver) => {
            // Handle new structure where driver is an object with name/driverInfo
            if (typeof driver === "object") {
              if (driver.name) {
                return driver.name;
              } else if (driver.driverInfo?.firstName) {
                return driver.driverInfo.firstName;
              } else if (driver.driverId) {
                // Try to match with assignedDrivers using driverId
                const matchedDriver = assignedDrivers.find(
                  (d) => d?._id?.toString() === driver.driverId?.toString()
                );
                return (
                  matchedDriver?.DriverData?.firstName ||
                  matchedDriver?.DriverData?.name ||
                  matchedDriver?.name ||
                  "Unnamed"
                );
              }
            } else {
              // Legacy structure - try to match with assignedDrivers
              const driverId = driver;
              const matchedDriver = assignedDrivers.find(
                (d) => d?._id?.toString() === driverId?.toString()
              );
              return (
                matchedDriver?.DriverData?.firstName ||
                matchedDriver?.DriverData?.name ||
                matchedDriver?.name ||
                "Unnamed"
              );
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
  if (!companyId) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage="Invalid company ID"
        showSearch
        showRefresh
      />
    );
  }

  if (isDriver ? isJobsLoading : isBookingsLoading) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage="Loading bookings..."
        showSearch
        showRefresh
      />
    );
  }
  return (
    <>
      <CustomTable
        tableHeaders={filteredTableHeaders}
        tableData={tableData}
        exportTableData={exportTableData}
        showSearch
        showRefresh
        showDownload
        showPagination
        showSorting
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        onRowDoubleClick={(row) => {
          const selectedBooking = filteredBookings.find(
            (b) => b._id === row._id
          );
          if (selectedBooking) {
            openViewModal(selectedBooking);
          }
        }}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            if (isDeletedTab) {
              await deleteBooking(selectedDeleteId).unwrap();
              toast.success("Booking permanently deleted");
            } else {
              await updateBookingStatus({
                id: selectedDeleteId,
                status: "Deleted",
                updatedBy: `${user.role} | ${user.fullName}`,
              }).unwrap();
              toast.success("Booking moved to deleted");
            }
            setShowDeleteModal(false);
            setSelectedDeleteId(null);
            refetch();
          } catch {
            toast.error("Deletion failed");
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedDeleteId(null);
        }}
      />
      {tooltip.show && (
        <div
          className="fixed z-[9999] w-[250px] max-w-sm px-3 py-4 text-[13px] text-[var(--dark-gray)] leading-relaxed bg-white border border-gray-300 rounded-md transition-all duration-300 ease-in-out"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
};

export default BookingsTable;
