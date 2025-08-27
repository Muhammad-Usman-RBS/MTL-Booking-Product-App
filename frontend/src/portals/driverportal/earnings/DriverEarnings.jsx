import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import Icons from "../../../assets/icons";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import {
  SCHEDULED_SET,
  statusOptions,
} from "../../../constants/dashboardTabsData/data";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import DriverStatCard from "../../../constants/constantscomponents/DriverStatCards";

const CURRENCY = "£";

const getJourneyDateTime = (b) => {
  const j = b?.returnJourneyToggle ? b?.returnJourney : b?.primaryJourney;
  if (!j?.date || j.hour == null || j.minute == null) return null;
  const dt = new Date(j.date);
  dt.setHours(j.hour, j.minute, 0, 0);
  return dt;
};

const parseDistanceMiles = (txt) => {
  if (!txt || typeof txt !== "string") return 0;
  const num = parseFloat(txt.replace(/[^\d.]/g, ""));
  if (Number.isNaN(num)) return 0;
  const lower = txt.toLowerCase();
  if (lower.includes("km")) return num * 0.621371;
  return num;
};

const DriverEarnings = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const user = useSelector((s) => s?.auth?.user);
  const companyId = user?.companyId;

  const {
    data: bookingsRes,
    isLoading,
    error,
    refetch,
  } = useGetAllBookingsQuery(companyId, { skip: !companyId });
  const allBookings = bookingsRes?.bookings ?? [];

  const isDriverOnBooking = (b) => {
    const loggedInId = (user?._id || user?.id)?.toString?.();
    if (!loggedInId || !Array.isArray(b?.drivers)) return false;
    return b.drivers.some((d) => {
      const val = typeof d === "object" ? d._id || d.userId || d.driverId : d;
      return val?.toString?.() === loggedInId;
    });
  };

  const earnings = useMemo(() => {
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

    return allBookings
      .filter((b) => b?.companyId?.toString?.() === companyId?.toString?.())
      .filter(isDriverOnBooking)
      .filter((b) => {
        const normalized = (b.status || "").trim().toLowerCase();

        if (statusFilter === "all") return true;

        if (statusFilter === "Completed") {
          return normalized === "completed";
        }

        if (statusFilter === "Cancelled") {
          return normalized === "cancel";
        }

        if (statusFilter === "Scheduled") {
          const SCHEDULED_STATUSES = [
            "accepted",
            "on route",
            "at location",
            "ride started",
            "late cancel",
            "no show",
          ];
          return SCHEDULED_STATUSES.includes(normalized);
        }

        return false;
      })

      .filter((b) => {
        const dt = getJourneyDateTime(b);
        if (start && dt < start) return false;
        if (end && dt > end) return false;
        return true;
      })
      .map((b) => {
        const dt = getJourneyDateTime(b);
        const distMiles =
          parseDistanceMiles(b?.primaryJourney?.distanceText) +
          parseDistanceMiles(b?.returnJourney?.distanceText);

        const driverAmount =
          (Number(b?.driverFare) || 0) + (Number(b?.returnDriverFare) || 0);

        return {
          id: b._id,
          dateObj: dt,
          date: dt.toLocaleDateString(),
          status: b.status || "New",
          amount: driverAmount,
          tripDistanceMiles: Number(distMiles.toFixed(2)),
          jobType: (b?.mode || "Transfer").toLowerCase(),
        };
      });
  }, [allBookings, companyId, user?._id, startDate, endDate, statusFilter]);

  const completedOnly = useMemo(
    () =>
      earnings.filter((e) => (e.status || "").toLowerCase() === "completed"),
    [earnings]
  );

  useEffect(() => {
    const onFocus = async () => {
      if (!error && !isLoading) {
        await refetch();
      }
    };
  
    window.addEventListener("focus", onFocus);
  
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [error, isLoading, refetch]);

  const totalEarnings = useMemo(
    () => completedOnly.reduce((s, e) => s + (e.amount || 0), 0),
    [completedOnly]
  );
  const averagePerJob = completedOnly.length
    ? totalEarnings / completedOnly.length
    : 0;
  const totalTrips = earnings.length;
  const totalDistanceMiles = useMemo(
    () => earnings.reduce((s, e) => s + (e.tripDistanceMiles || 0), 0),
    [earnings]
  );

  const tableHeaders = [
    { label: "Date", key: "date" },
    { label: "Service Type", key: "jobType" },
    { label: "Distance", key: "tripDistance" },
    { label: "Status", key: "status" },
    { label: "Amount", key: "amount" },
  ];

  const statusChip = (status) => {
    const s = (status || "").toLowerCase();
    const base =
      "px-3 py-1 text-xs rounded-md border font-medium transition whitespace-nowrap";
    if (s === "completed") {
      return `${base} bg-green-100 text-green-700 border-green-300 hover:bg-green-200`;
    }
    if (s === "cancelled") {
      return `${base} bg-red-100 text-red-700 border-red-300 hover:bg-red-200`;
    }
    return `${base} bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200`;
  };

  const tableData = useMemo(
    () =>
      earnings
        .sort((a, b) => b.dateObj - a.dateObj)
        .map((e) => ({
          id: e.id,
          date: e.date,
          jobType: e.jobType,
          tripDistance: `${e.tripDistanceMiles} mi`,
          status: <span className={statusChip(e.status)}>{e.status}</span>,
          amount: `${CURRENCY}${(e.amount || 0).toFixed(2)}`,
        })),
    [earnings]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading earnings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">
          Error loading earnings. Please try again.
        </p>
      </div>
    );
  }

  const daysSelected = (() => {
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
  })();

  return (
    <>
      <div className="mb-6">
        <OutletHeading name="Earnings" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-end mb-8">
        <div className="flex flex-col gap-2 w-full lg:w-1/3">
          <span className="font-semibold text-gray-800 text-sm">
            Date Filter
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

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <DriverStatCard
          title="Total Earnings"
          value={`${CURRENCY}${totalEarnings.toFixed(2)}`}
          subtitle={
            daysSelected
              ? `Selected ${daysSelected} day${daysSelected > 1 ? "s" : ""}`
              : ""
          }
          icon={<Icons.DollarSign className="w-5 h-5 text-gray-400" />}
        />

        <DriverStatCard
          title="Distance Covered"
          value={`${totalDistanceMiles.toFixed(2)} mi`}
          subtitle="Primary + return"
          icon={<Icons.Calendar className="w-5 h-5 text-gray-400" />}
        />
      </div>

      {/* Table */}
      <div className="mt-12">
        <CustomTable
          title="Service History"
          tableHeaders={tableHeaders}
          tableData={tableData}
          showSearch
          showSorting
          showPagination
          showDownload
        />
        {earnings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No earnings found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DriverEarnings;
