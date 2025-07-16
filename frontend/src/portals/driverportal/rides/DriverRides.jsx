import React, { useState, useMemo } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import {
  statusOptions,
  mockJobs,
} from "../../../constants/dashboardTabsData/data";

const DriverRides = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const filteredRides = useMemo(() => {
    const daysAgo = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return mockJobs.filter((ride) => {
      if (!ride.acceptedAt) return false;
      const rideDate = new Date(ride.acceptedAt);
      const isWithinPeriod = rideDate >= cutoffDate;
      const matchesStatus = statusFilter === "all" || ride.status === statusFilter;
      const matchesSearch =
        searchTerm === "" ||
        ride.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropLocation.toLowerCase().includes(searchTerm.toLowerCase());

      return isWithinPeriod && matchesStatus && matchesSearch;
    });
  }, [selectedPeriod, statusFilter, searchTerm]);

  const totalRides = filteredRides.length;
  const completedRides = filteredRides.filter((ride) => ride.status === "completed").length;
  const totalEarnings = filteredRides
    .filter((ride) => ride.status === "completed")
    .reduce((sum, ride) => sum + ride.driverFare, 0);
  const averageRating =
    filteredRides.length > 0
      ? filteredRides.reduce((sum, ride) => sum + ride.customerRating, 0) / filteredRides.length
      : 0;

  const statusStyles = {
    completed: "px-3 py-1 text-xs rounded-md border font-medium transition bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
    pending: "px-3 py-1 text-xs rounded-md border font-medium transition bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
    cancelled: "px-3 py-1 text-xs rounded-md border font-medium transition bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
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

  const tableData = filteredRides.map((ride) => {
    const date = new Date(ride.acceptedAt);
    return {
      id: ride.id,
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      customerName: ride.customerName,
      pickupLocation: ride.pickupLocation,
      dropLocation: ride.dropLocation,
      status: (
        <span className={statusStyles[ride.status] || statusStyles["pending"]}>
          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
        </span>
      ),
      fare: `$${ride.driverFare}`,
    };
  });

  return (
    <>
      <div className="mb-6">
        <OutletHeading name="Rides" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-end mb-8">
        <div className="flex flex-col gap-2 w-full lg:w-1/3">
          <span className="font-semibold text-gray-800 text-sm">Date Range</span>
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
        <StatCard title="Total Rides" value={totalRides} icon={<Icons.Navigation />} subtitle={`Last ${selectedPeriod} days`} />
        <StatCard title="Completed Rides" value={completedRides} icon={<Icons.CheckCircle />} subtitle="Completed successfully" />
        <StatCard title="Total Earnings" value={`$${totalEarnings}`} icon={<Icons.DollarSign />} subtitle="From completed rides" />
        <StatCard title="Avg. Rating" value={averageRating.toFixed(1)} icon={<Icons.Star />} subtitle="Customer rating" />
      </div>

      <div className="mt-12">
        <CustomTable title="Rides History" tableHeaders={tableHeaders} tableData={tableData} />
        {filteredRides.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No rides found for the selected filters.</p>
          </div>
        )}
      </div>
    </>
  );
};

const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-[var(--dark-gray)]">{title}</h3>
      <div className="text-gray-800">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-black">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);

export default DriverRides;
