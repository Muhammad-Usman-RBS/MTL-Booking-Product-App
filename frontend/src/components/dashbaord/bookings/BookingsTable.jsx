import React, { useState } from "react";
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

const BookingsTable = ({
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
}) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const tableHeaders = [
    { label: "Order No.", key: "orderNo" },
    { label: "Passenger", key: "passenger" },
    { label: "Date & Time", key: "date" },
    { label: "Pick Up", key: "pickUp" },
    { label: "Drop Off", key: "dropOff" },
    { label: "Vehicle", key: "vehicle" },
    { label: "Payment", key: "payment" },
    { label: "Fare", key: "fare" },
    { label: "DR Fare", key: "drFare" },
    { label: "Driver", key: "driver" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const { data, isLoading, error, refetch } = useGetAllBookingsQuery(companyId);
  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  if (!companyId) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter((header) => selectedColumns[header.key])}
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
        tableHeaders={tableHeaders.filter((header) => selectedColumns[header.key])}
        tableData={[]}
        exportTableData={[]}
        emptyMessage="Loading bookings..."
        showSearch
        showRefresh
      />
    );
  }

  const bookings = (data?.bookings || []).filter(
    (b) => b?.companyId?.toString() === companyId?.toString()
  );

  let filteredBookings = bookings.filter((b) => {
    const statusMatch =
      selectedStatus.includes("All") || selectedStatus.length === 0
        ? true
        : selectedStatus.includes(b.status);

    const passengerMatch =
      selectedPassengers.length === 0
        ? true
        : selectedPassengers.includes(b.passenger?.name);

    return statusMatch && passengerMatch;
  });

  filteredBookings.sort((a, b) => {
    let aMatch = 0;
    let bMatch = 0;
    if (selectedVehicleTypes.includes(a.vehicle?.vehicleName)) aMatch++;
    if (selectedVehicleTypes.includes(b.vehicle?.vehicleName)) bMatch++;
    return bMatch - aMatch;
  });

  if (error || bookings.length === 0) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter((header) => selectedColumns[header.key])}
        tableData={[]}
        exportTableData={[]}
        emptyMessage={error ? "Error loading bookings" : "No bookings found"}
        showSearch
        showRefresh
      />
    );
  }

  const formatVehicle = (v) =>
    !v || typeof v !== "object"
      ? "-"
      : `${v.vehicleName || "N/A"} | ${v.passenger || 0} | ${v.handLuggage || 0} | ${v.checkinLuggage || 0}`;

  const formatPassenger = (p) =>
    !p || typeof p !== "object"
      ? "-"
      : `${p.name || "N/A"} | ${p.email || 0} | ${p.phone || 0}`;

  const tableData = filteredBookings.map((item, index) => {
    const row = {};
    tableHeaders.forEach(({ key }) => {
      if (!selectedColumns[key]) return;

      switch (key) {
        case "orderNo":
          row[key] = item._id;
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
          row[key] = item.journey1?.pickup || "-";
          break;
        case "dropOff":
          row[key] = item.journey1?.dropoff || "-";
          break;
        case "vehicle":
          row[key] = item.vehicle?.vehicleName || "-";
          break;
        case "payment":
          row[key] = item.payment || "-";
          break;
        case "fare":
          row[key] = item.fare || "-";
          break;
        case "drFare":
          row[key] = item.drFare || "-";
          break;
        case "driver":
          row[key] = (
            <button
              className="text-blue-600 hover:underline"
              onClick={() => openDriverModal(item.driver)}
            >
              {item.driver || "-"}
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
                  setSelectedActionRow(selectedActionRow === index ? null : index)
                }
                className="p-2 rounded hover:bg-gray-100 transition"
              >
                <GripHorizontal size={18} className="text-gray-600" />
              </button>
              {selectedActionRow === index && (
                <div className="mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-in">
                  {actionMenuItems.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (action === "Status Audit") openAuditModal(item.statusAudit);
                        else if (action === "View") openViewModal(item);
                        else if (action === "Edit") {
                          setEditBookingData(item);
                          setShowEditModal(true);
                        } else if (action === "Delete") {
                          setSelectedDeleteId(item._id);
                          setShowDeleteModal(true);
                        } else if (action === "Copy Booking") {
                          const copied = { ...item };
                          delete copied._id;
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

  const exportTableData = filteredBookings.map((item) => ({
    orderNo: item._id,
    passenger: formatPassenger(item.passenger),
    date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
    pickUp: item.journey1?.pickup || "-",
    dropOff: item.journey1?.dropoff || "-",
    vehicle: formatVehicle(item.vehicle),
    payment: item.payment || "-",
    fare: item.fare || "-",
    drFare: item.drFare || "-",
    driver: item.driver || "-",
    status: item.statusAudit?.at(-1)?.status || item.status || "-",
  }));

  return (
    <>
      <CustomTable
        tableHeaders={tableHeaders.filter((header) => selectedColumns[header.key])}
        tableData={tableData}
        exportTableData={exportTableData}
        showSearch
        showRefresh
        showDownload
        showPagination
        showSorting
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
    </>
  );
};

export default BookingsTable;
