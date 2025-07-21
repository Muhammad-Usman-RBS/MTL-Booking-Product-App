import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GripHorizontal } from "lucide-react";
import SelectStatus from "./SelectStatus";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import {
  useGetAllBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingStatusMutation,
} from "../../../redux/api/bookingApi";
import Icons from "../../../assets/icons";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";

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
  const companyId = user?.companyId;
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });

  const tableHeaders = [
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
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];
  const emptyTableRows = EmptyTableMessage({
    message: "No data to show, create booking",
    colSpan: tableHeaders.length,
  });
  const { data, isLoading, error, refetch } = useGetAllBookingsQuery(companyId);
  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const bookings = (data?.bookings || []).filter(
    (b) => b?.companyId?.toString() === companyId?.toString()
  );

  let filteredBookings = bookings.filter((b) => {
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

        if (key === "d") {
          setSelectedDeleteId(selectedBooking._id);
          setShowDeleteModal(true);
          return;
        }

        if (key === "e") {
          setEditBookingData(selectedBooking);
          setShowEditModal(true);
          return;
        }

        if (event.shiftKey && key === "r") {
          if (!selectedDeleteId) {
            toast.info("No recently deleted booking to restore");
            return;
          }

          try {
            await updateBookingStatus({
              id: selectedDeleteId,
              isDeleted: false,
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();

            toast.success("Booking restored");
            refetch();
            setSelectedDeleteId(null);
          } catch (err) {
            toast.error("Failed to restore booking");
          }
        }
      }

      const statusMap = {
        a: "Accepted",
        o: "On Route",
        l: "At Location",
        r: "Ride Started",
        n: "No Show",
        c: "Completed",
      };

      if (key === "d") {
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
  ]);

  const formatVehicle = (v) =>
    !v || typeof v !== "object"
      ? "-"
      : `${v.vehicleName || "N/A"} | ${v.passenger || 0} | ${v.handLuggage || 0
      } | ${v.checkinLuggage || 0}`;

  const formatPassenger = (p) =>
    !p || typeof p !== "object"
      ? "-"
      : `${p.name || "N/A"} | ${p.email || 0} | ${p.phone || 0}`;

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
          case "date":
            row[key] = item.createdAt
              ? new Date(item.createdAt).toLocaleString()
              : "-";
            break;
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
            row[key] = item.returnJourneyFare !== undefined ? item.returnJourneyFare : "-";
            break;
          case "returnDriverFare":
            row[key] = item.returnDriverFare !== undefined ? item.returnDriverFare : "-";
            break;
          case "driver":
            row[key] =
              Array.isArray(item.drivers) && item.drivers.length > 0 ? (
                <div
                  onClick={() => {
                    setSelectedRow(item._id);
                    openDriverModal(item);
                  }}
                  className="text-sm text-gray-700 space-y-0.5 cursor-pointer"
                >
                  {item.drivers.map((driverId, i) => {
                    const driversArray = assignedDrivers;

                    const driverIdToMatch =
                      typeof driverId === "object" ? driverId._id : driverId;

                    const matchedDriver =
                      Array.isArray(driversArray) &&
                      driversArray.find((d) => {
                        if (!d || !d._id) return false;
                        return d._id.toString() === driverIdToMatch?.toString();
                      });

                    let driverName = "Unnamed";
                    if (matchedDriver) {
                      driverName =
                        matchedDriver.DriverData?.firstName || "Unnamed";
                    } else if (typeof driverId === "object" && driverId.name) {
                      driverName =
                        driverId.name ||
                        driverId.firstName ||
                        driverId.fullName ||
                        "Unnamed";
                    }

                    return <div key={i}>{driverName}</div>;
                  })}
                </div>
              ) : (
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedRow(item._id);
                    openDriverModal(item);
                  }}
                >
                  <Icons.CircleUserRound />
                </button>
              );

            break;
          case "status":
            row[key] = (
              <SelectStatus
                value={item.status || "No Show"}
                onChange={async (newStatus) => {
                  try {
                    await updateBookingStatus({
                      id: item._id,
                      isDeleted: true,

                      status: newStatus,
                      updatedBy: `${user.role} | ${user.fullName}`,
                    }).unwrap();
                    toast.success("Status updated");
                    refetch();
                  } catch (err) {
                    console.error("Status update failed:", err);
                    toast.error("Failed to update status");
                  }
                }}
              />
            );
            break;
          case "actions":
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
                  <GripHorizontal size={18} className="text-[var(--dark-gray)]" />
                </button>
                {selectedActionRow === index && (
                  <div className="mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-in">
                    {actionMenuItems
                      .filter((action) => {
                        // If user is driver, only show View and Status Audit
                        if (user?.role === "driver") {
                          return action === "View" || action === "Status Audit";
                        }
                        // For other roles, show all actions
                        return true;
                      })
                      .map((action, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (action === "Status Audit")
                              openAuditModal(item.statusAudit);
                            else if (action === "View") openViewModal(item);
                            else if (action === "Edit") {
                              const editedData = { ...item };

                              // Set flag to identify return journey mode
                              editedData.__editReturn = !!item.returnJourney;

                              setEditBookingData(editedData);
                              setShowEditModal(true);
                            } else if (action === "Delete") {
                              setSelectedDeleteId(item._id);
                              setShowDeleteModal(true);
                            } else if (action === "Copy Booking") {
                              const copied = { ...item };

                              // Clean IDs
                              delete copied._id;
                              if (copied.passenger?._id) delete copied.passenger._id;
                              if (copied.vehicle?._id) delete copied.vehicle._id;
                              if (copied.primaryJourney?._id) delete copied.primaryJourney._id;
                              if (copied.returnJourney?._id) delete copied.returnJourney._id;

                              copied.bookingId = "";
                              copied.status = "Pending";
                              copied.statusAudit = [];
                              copied.createdAt = new Date().toISOString();
                              copied.drivers = [];

                              copied.__copyMode = true;

                              // ✅ If copying a return booking, convert it to primary for correct form behavior
                              if (item.returnJourney) {
                                copied.primaryJourney = { ...item.returnJourney };
                                delete copied.returnJourney;
                                copied.__copyReturn = false;
                              } else {
                                copied.__copyReturn = false;
                              }

                              setEditBookingData(copied);
                              setShowEditModal(true);
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
            break;
          default:
            row[key] = item[key] || "-";
        }
      });
      return row;
    });
  }

  const exportTableData = filteredBookings.map((item) => ({
    bookingId: item.bookingId,
    bookingType: item?.returnJourney ? "Return" : "Primary",
    passenger: formatPassenger(item.passenger),
    date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
    pickUp: item.primaryJourney?.pickup || "-",
    dropOff: item.primaryJourney?.dropoff || "-",
    vehicle: formatVehicle(item.vehicle),
    payment: item.paymentMethod || "-",
    // fare: item.returnJourney
    //   ? item.returnJourney?.fare || "-"
    //   : item.primaryJourney?.fare || "-",
    journeyFare: item.journeyFare !== undefined ? item.journeyFare : "-",
    driverFare: item.driverFare !== undefined ? item.driverFare : "-",
    returnJourneyFare: item.returnJourneyFare !== undefined ? item.returnJourneyFare : "-",
    returnDriverFare: item.returnDriverFare !== undefined ? item.returnDriverFare : "-",
    driver:
      Array.isArray(item.drivers) && assignedDrivers.length > 0
        ? item.drivers
          .map((driverId) => {
            const driverIdToMatch =
              typeof driverId === "object" ? driverId._id : driverId;
            const matchedDriver = assignedDrivers.find(
              (d) =>
                d && d._id && d._id.toString() === driverIdToMatch?.toString()
            );
            return (
              matchedDriver?.DriverData?.firstName ||
              matchedDriver?.DriverData?.name ||
              matchedDriver?.name ||
              "Unnamed"
            );
          })
          .join(", ")
        : "-",
    status: item.statusAudit?.at(-1)?.status || item.status || "-",
  }));

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

  if (isLoading) {
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
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={tableData}
        exportTableData={exportTableData}
        showSearch
        showRefresh
        showDownload
        showPagination
        showSorting
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteBooking(selectedDeleteId).unwrap();
            toast.success("Booking deleted");
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
