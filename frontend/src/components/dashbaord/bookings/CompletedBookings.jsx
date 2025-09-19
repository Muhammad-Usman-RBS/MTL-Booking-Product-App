import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLoading } from "../../common/LoadingProvider";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const CompletedBookings = () => {
    const user = useSelector((state) => state.auth.user);
    const companyId = user?.companyId;
    const { showLoading, hideLoading } = useLoading();

    const { data, isLoading } = useGetAllBookingsQuery(companyId);
    const [completedBookings, setCompletedBookings] = useState([]);

    // Manage global loading spinner
    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);

    // Filter completed bookings
    useEffect(() => {
        if (data?.bookings) {
            const completed = data.bookings.filter(
                (b) =>
                    b.status === "Completed" &&
                    b?.companyId?.toString() === companyId?.toString()
            );
            setCompletedBookings(completed);
        }
    }, [data, companyId]);

    // All headers
    const allHeaders = [
        { label: "Booking Id", key: "bookingId" },
        { label: "Type", key: "bookingType" },
        { label: "Pick Up", key: "pickUp", className: "min-w-[280px] max-w-[400px] whitespace-normal" },
        { label: "Drop Off", key: "dropOff", className: "min-w-[280px] max-w-[400px] whitespace-normal" },
        { label: "Passenger", key: "passenger" },
        { label: "Date & Time", key: "date" },
        { label: "Vehicle", key: "vehicle" },
        { label: "Payment", key: "payment" },
        { label: "Journey Fare", key: "journeyFare" },
        { label: "Driver Fare", key: "driverFare" },
        { label: "Return Fare", key: "returnJourneyFare" },
        { label: "Return DR Fare", key: "returnDriverFare" },
        { label: "Driver", key: "driver" },
        { label: "Flight No.", key: "flightNumber" },
        { label: "Arrival (Scheduled)", key: "flightArrivalScheduled" },
        { label: "Arrival (Estimated)", key: "flightArrivalEstimated" },
        { label: "Created At", key: "createdAt" },
        { label: "Status", key: "status" },
    ];

    // Formatters
    const formatPassenger = (p) =>
        !p || typeof p !== "object"
            ? "-"
            : `${p.name || "N/A"} | ${p.email || "N/A"} | ${p.phone || "N/A"}`;

    const formatDriver = (d) =>
        !d || typeof d !== "object" ? "-" : d.name || d.fullName || "Unknown Driver";

    const formatVehicle = (v) =>
        !v || typeof v !== "object"
            ? "-"
            : (
                <div className="whitespace-normal leading-5">
                    <div className="font-medium min-w-[180px] max-w-[400px] whitespace-normal">{v.vehicleName || "N/A"}</div>
                    <div className="text-sm text-gray-600">Passengers: {v.passenger || 0}</div>
                    <div className="text-sm text-gray-600">HandLuggage: {v.handLuggage || 0}</div>
                    <div className="text-sm text-gray-600">CheckinLuggage: {v.checkinLuggage || 0}</div>
                </div>
            );

    // Table Data
    const tableData = completedBookings.map((b) => {
        const journey = b.returnJourneyToggle ? b.returnJourney : b.primaryJourney;

        return {
            _id: b._id,
            bookingId: b.bookingId || "-",
            bookingType: b.returnJourney ? "Return" : "Primary",
            pickUp: (
                <div className="min-w-[280px] max-w-[400px] whitespace-normal">
                    {journey?.pickup || "-"}
                </div>
            ),
            dropOff: (
                <div className="min-w-[280px] max-w-[400px] whitespace-normal">
                    {journey?.dropoff || "-"}
                </div>
            ),
            passenger: formatPassenger(b.passenger),
            date:
                journey?.date && journey?.hour !== undefined && journey?.minute !== undefined
                    ? new Date(journey.date).toLocaleString()
                    : "-",
            vehicle: formatVehicle(b.vehicle),
            payment: b.paymentMethod || "-",
            journeyFare: b.journeyFare !== undefined ? b.journeyFare : "-",
            driverFare: b.driverFare !== undefined ? b.driverFare : "-",
            returnJourneyFare:
                b.returnJourneyFare !== undefined ? b.returnJourneyFare : "-",
            returnDriverFare:
                b.returnDriverFare !== undefined ? b.returnDriverFare : "-",
            driver:
                Array.isArray(b.drivers) && b.drivers.length > 0
                    ? b.drivers.map((d) => formatDriver(d)).join(", ")
                    : "-",
            flightNumber: journey?.flightNumber || "-",
            flightArrivalScheduled: journey?.flightArrival?.scheduled
                ? new Date(journey.flightArrival.scheduled).toLocaleString()
                : "-",
            flightArrivalEstimated: journey?.flightArrival?.estimated
                ? new Date(journey.flightArrival.estimated).toLocaleString()
                : "-",
            createdAt: b.createdAt ? new Date(b.createdAt).toLocaleString() : "-",
            status: b.status || "-",
        };
    });

    return (
        <>
            <OutletHeading name="Completed Bookings" />

            <CustomTable
                tableHeaders={allHeaders}
                tableData={tableData}
                exportTableData={tableData}
                emptyMessage="No completed bookings found"
                showSearch
                showRefresh
                showDownload
                showPagination
                showSorting
            />
        </>
    );
};

export default CompletedBookings;
