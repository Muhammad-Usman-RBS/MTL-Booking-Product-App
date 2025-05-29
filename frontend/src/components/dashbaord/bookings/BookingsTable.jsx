import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    useGetAllBookingsQuery,
    useDeleteBookingMutation,
    useUpdateBookingStatusMutation, // ✅ Import mutation
} from "../../../redux/api/bookingApi";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { GripHorizontal } from "lucide-react";
import SelectStatus from "./SelectStatus";

const BookingsTable = ({
    selectedColumns,
    setSelectedColumns,
    sortConfig,
    setSortConfig,
    selectedActionRow,
    setSelectedActionRow,
    openAuditModal,
    openViewModal,
    openDriverModal,
    actionMenuItems,
    setEditBookingData,
    setShowEditModal,
}) => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId;

    const { data, isLoading, error, refetch } = useGetAllBookingsQuery(companyId);
    const [deleteBooking] = useDeleteBookingMutation();
    const [updateBookingStatus] = useUpdateBookingStatusMutation(); // ✅ Hook

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    const bookings = (data?.bookings || []).filter(
        (booking) => booking?.companyId?.toString() === companyId?.toString()
    );

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading bookings</p>;
    if (!bookings.length) return <p>No bookings found</p>;

    const handleDeleteBooking = async () => {
        try {
            await deleteBooking(selectedDeleteId).unwrap();
            toast.success("Booking deleted successfully");
            setSelectedDeleteId(null);
            setShowDeleteModal(false);
        } catch (err) {
            toast.error("Failed to delete booking");
        }
    };

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

    const formatVehicle = (vehicle) => {
        if (!vehicle || typeof vehicle !== "object") return "-";
        return `${vehicle.vehicleName || "N/A"} | 👥 ${vehicle.passenger || 0} | 🎒 ${vehicle.handLuggage || 0} | 🧳 ${vehicle.checkinLuggage || 0}`;
    };

    const formatPassenger = (passenger) => {
        if (!passenger || typeof passenger !== "object") return "-";
        return `${passenger.name || "N/A"} | 👥 ${passenger.email || 0} | 🎒 ${passenger.phone || 0}`;
    };

    const tableData = bookings.map((item, index) => {
        const row = {};

        tableHeaders.forEach(({ key }) => {
            if (!selectedColumns[key]) return;

            switch (key) {
                case "orderNo":
                    row[key] = item._id;
                    break;
                case "passenger":
                    row[key] = item.passenger
                        ? `${item.passenger.name || "Unnamed"} | ${item.passenger.email || "No Email"} | ${item.passenger.phone || "No Phone"}`
                        : "-";
                    break;
                case "date":
                    row[key] = item.createdAt ? new Date(item.createdAt).toLocaleString() : "-";
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
                            className="cursor-pointer text-blue-600 hover:underline"
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
                                    await updateBookingStatus({ id: item._id, status: newStatus }).unwrap();
                                    toast.success("Status updated successfully");
                                    refetch(); // Force UI update from fresh data
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
                                title="More Actions"
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
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
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

    const exportTableData = bookings.map((item) => ({
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
        status: item.statusAudit?.[item.statusAudit.length - 1]?.status || item.status || "-",
    }));

    return (
        <>
            <CustomTable
                tableHeaders={tableHeaders.filter((header) => selectedColumns[header.key])}
                tableData={tableData}
                exportTableData={exportTableData}
                showSearch={true}
                showRefresh={true}
                showDownload={true}
                showPagination={true}
                showSorting={true}
            />

            <DeleteModal
                isOpen={showDeleteModal}
                onConfirm={handleDeleteBooking}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setSelectedDeleteId(null);
                }}
            />
        </>
    );
};

export default BookingsTable;
