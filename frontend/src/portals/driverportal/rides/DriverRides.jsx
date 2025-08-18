import React, { useState, useMemo } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import {
  statusOptions,
  mockJobs,
  SCHEDULED_SET,
} from "../../../constants/dashboardTabsData/data";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useSelector } from "react-redux";
import DriverStatCard from "../../../constants/constantscomponents/DriverStatCards";

const DriverRides = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId;

  const {
    data: bookings = [],
    isLoading,
    error,
  } = useGetAllBookingsQuery(companyId, {
    skip: !companyId,
  });
  const allBookings = bookings?.bookings ?? [];
  const getJourneyDateTime = (b) => {
    const j = b?.returnJourneyToggle ? b?.returnJourney : b?.primaryJourney;
    if (!j?.date || j.hour == null || j.minute == null) return null;
    const dt = new Date(j.date);
    dt.setHours(j.hour, j.minute, 0, 0);
    return dt;
  };

  const isDriverOnBooking = (b) => {
    const loggedInId = (user?._id || user?.id)?.toString();
    if (!loggedInId || !Array.isArray(b?.drivers)) return false;

    return b.drivers.some((d) => {
      const val = typeof d === "object" ? d._id || d.userId || d.driverId : d;
      return val?.toString?.() === loggedInId;
    });
  };

  const filteredRides = useMemo(() => {
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

    return allBookings
      .filter((b) => b?.companyId?.toString?.() === companyId?.toString())
      .filter(isDriverOnBooking)
      .filter((b) => {
        if (statusFilter === "all") return true;

        const normalized = (b.status || "").trim().toLowerCase();
        if (statusFilter === "scheduled") {
          return SCHEDULED_SET.has(normalized);
        }
        return normalized === statusFilter.toLowerCase();
      })

      .filter((b) => {
        const dt = getJourneyDateTime(b) ;
        if (start && dt < start) return false;
        if (end && dt > end) return false;
        return true;
      })
      .map((b) => {
        const dt = getJourneyDateTime(b) ;
        return {
          id: b._id,
          date: dt.toLocaleDateString(),
          time: dt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          customerName: b.passenger?.name ?? "-",
          pickupLocation:
            b.primaryJourney?.pickup || b.returnJourney?.pickup || "-",
          dropLocation:
            b.primaryJourney?.dropoff || b.returnJourney?.dropoff || "-",
          statusRaw: b.status || "New",
          fareRaw: b.driverFare ?? 0,
        };
      });
  }, [allBookings, companyId, user?._id, startDate, endDate, statusFilter]);

  const daysSelected = useMemo(() => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diff = Math.max(
        1,
        Math.round(
          (e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0)) / 86400000
        ) + 1
      );
      return diff;
    } catch {
      return null;
    }
  }, [startDate, endDate]);
  const totalRides = filteredRides.length;
  const completedRides = filteredRides.filter(
    (r) => (r.statusRaw || "").toLowerCase() === "completed"
  ).length;
  const totalEarnings = filteredRides
    .filter((r) => (r.statusRaw || "").toLowerCase() === "completed")
    .reduce((sum, r) => sum + (r.fareRaw || 0), 0);
  const averageRating = 0;
  const statusStyles = {
    completed:
      "px-3 py-1 text-xs rounded-md border font-medium transition bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
    pending:
      "px-3 py-1 text-xs rounded-md border font-medium transition bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
    cancelled:
      "px-3 py-1 text-xs rounded-md border font-medium transition bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
  };

  const tableHeaders = [
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Customer", key: "customerName" },
    { label: "Pickup", key: "pickupLocation" },
    { label: "Drop", key: "dropLocation" },
    { label: "Status", key: "status" },
    { label: "Fare", key: "fare" },
  ];

  const tableData = filteredRides.map((ride) => ({
    id: ride.id,
    date: ride.date,
    time: ride.time,
    customerName: ride.customerName,
    pickupLocation: ride.pickupLocation,
    dropLocation: ride.dropLocation,
    status: (
      <span
        className={
          statusStyles[ride.statusRaw.toLowerCase()] || statusStyles["pending"]
        }
      >
        {ride.statusRaw}
      </span>
    ),
    fare: `£${ride.fareRaw}`,
  }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading rides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error loading rides. Please try again.</p>
      </div>
    );
  }
  return (
    <>
      <div className="mb-6">
        <OutletHeading name="Rides" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-end mb-8">
        <div className="flex flex-col gap-2 w-full lg:w-1/3">
          <span className="font-semibold text-gray-800 text-sm">
            Date Range
          </span>
          <SelectDateRange
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
        <div className="flex flex-col gap-2 w-full lg:w-1/3">
          <SelectOption
            options={statusOptions}
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            width="full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <DriverStatCard
          title="Total Rides"
          value={totalRides}
          icon={<Icons.Navigation />}
          subtitle={
            daysSelected
              ? `Selected ${daysSelected} day${daysSelected > 1 ? "s" : ""}`
              : ""
          }
        />
        <DriverStatCard
          title="Completed Rides"
          value={completedRides}
          icon={<Icons.CheckCircle />}
          subtitle="Completed successfully"
        />
      </div>

      <div className="mt-12">
        <CustomTable
          title="Rides History"
          tableHeaders={tableHeaders}
          tableData={tableData}
        />
        {filteredRides.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No rides found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DriverRides;
