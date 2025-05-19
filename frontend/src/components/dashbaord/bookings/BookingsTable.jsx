import React from "react";
import { useSelector } from "react-redux";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { GripHorizontal } from "lucide-react";

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
}) => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId;

    const { data, isLoading, error } = useGetAllBookingsQuery(companyId);
    const bookings = (data?.bookings || []).filter(
        (booking) => booking?.companyId?.toString() === companyId?.toString()
    );

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading bookings</p>;
    if (!bookings.length) return <p>No bookings found</p>;

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

    const getBadgeColor = (status) => {
        switch (status) {
            case "Accepted":
                return "bg-blue-100 text-blue-800";
            case "On Route":
                return "bg-yellow-100 text-yellow-800";
            case "At Location":
                return "bg-purple-100 text-purple-800";
            case "Ride Started":
                return "bg-orange-100 text-orange-800";
            case "No Show":
                return "bg-red-100 text-red-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
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
                    row[key] = item.passenger || "-";
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
                    const status = item.status || "-";
                    row[key] = (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getBadgeColor(status)}`}>
                            {status}
                        </span>
                    );
                    break;
                case "actions":
                    row[key] = (
                        <div className="relative text-center">
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
                                <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-in">
                                    {actionMenuItems.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (action === "Status Audit") openAuditModal(item.statusAudit);
                                                else if (action === "View") openViewModal(item.view);
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
        passenger: item.passenger || "-",
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
    );
};

export default BookingsTable;
