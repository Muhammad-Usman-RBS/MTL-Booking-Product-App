import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { useGetAllBookingsQuery, useRestoreOrDeleteBookingMutation } from "../../../redux/api/bookingApi";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const DeletedBookings = () => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId;

    const { data, isLoading, refetch } = useGetAllBookingsQuery(companyId);
    const [restoreOrDeleteBooking] = useRestoreOrDeleteBookingMutation();
    const [deletedBookings, setDeletedBookings] = useState([]);

    useEffect(() => {
        if (data?.bookings) {
            const deleted = data.bookings.filter(
                (b) => b.status === "Deleted" && b?.companyId?.toString() === companyId?.toString()
            );
            setDeletedBookings(deleted);
        }
    }, [data, companyId]);

    const tableHeaders = [
        { label: "Booking ID", key: "bookingId" },
        { label: "Passenger", key: "passenger" },
        { label: "Pick Up", key: "pickup" },
        { label: "Drop Off", key: "dropoff" },
        { label: "Date", key: "date" },
        { label: "Status", key: "status" },
        { label: "Actions", key: "actions" },
    ];

    const formatPassenger = (p) =>
        !p || typeof p !== "object"
            ? "-"
            : `${p.name || "N/A"} | ${p.email || "N/A"} | ${p.phone || "N/A"}`;

    const tableData = deletedBookings.map((b) => ({
        _id: b._id,
        bookingId: b.bookingId || "-",
        passenger: formatPassenger(b.passenger),
        pickup: b.primaryJourney?.pickup || "-",
        dropoff: b.primaryJourney?.dropoff || "-",
        date: b.createdAt ? new Date(b.createdAt).toLocaleString() : "-",
        status: b.status || "-",
        actions: (
            <button
                onClick={async () => {
                    try {
                        await restoreOrDeleteBooking({
                            id: b._id,
                            action: "restore",
                            updatedBy: `${user.role} | ${user.fullName}`,
                        }).unwrap();
                        toast.success("Booking restored successfully");
                        refetch();
                    } catch (error) {
                        toast.error("Failed to restore booking");
                    }
                }}
                className="text-blue-600 hover:underline text-sm"
            >
                Restore
            </button>
        ),
    }));

    return (
        <>
            <OutletHeading name="Deleted Bookings " />
            <CustomTable
                tableHeaders={tableHeaders}
                tableData={tableData}
                exportTableData={tableData}
                emptyMessage="No deleted bookings found"
                showSearch
                showRefresh
                showDownload
            />
        </>
    );
};

export default DeletedBookings;
