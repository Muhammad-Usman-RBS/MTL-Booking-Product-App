import React, { useState, useMemo } from "react";
import {
  timeFilters,
  statusOptions,
  mockJobs,
} from "../../../constants/dashboardTabsData/data";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";

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
      const matchesStatus =
        statusFilter === "all" || ride.status === statusFilter;
      const matchesSearch =
        searchTerm === "" ||
        ride.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropLocation.toLowerCase().includes(searchTerm.toLowerCase());

      return isWithinPeriod && matchesStatus && matchesSearch;
    });
  }, [selectedPeriod, statusFilter, searchTerm]);

  const totalRides = filteredRides.length;

  const completedRides = filteredRides.filter(
    (ride) => ride.status === "completed"
  ).length;

  const totalEarnings = filteredRides
    .filter((ride) => ride.status === "completed")
    .reduce((sum, ride) => sum + ride.driverFare, 0);

  const averageRating =
    filteredRides.length > 0
      ? filteredRides.reduce((sum, ride) => sum + ride.customerRating, 0) /
        filteredRides.length
      : 0;

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
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            ride.status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
        </span>
      ),
      fare: `$${ride.driverFare}`,
    };
  });

  return (
    <div>
      <div className="mb-8">
        <OutletHeading name={"Previous Rides"} />
      </div>

      {/* Time Period Filter */}
          <div className=" flex lg:flex-row flex-col space-x-3    items-center ">
<div className=" flex flex-col mb-6 lg:mr-3 mr-8 md:mr-2  space-y-3">

  <span className="font-semibold  text-gray-800 text-sm">Filter</span>
            <SelectDateRange
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              />
              </div>

      {/* Filters and Search */}
      <div className="mb-6 ">
          <SelectOption
            options={statusOptions}
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            width="64"
          />


              </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Rides</h3>
            <Icons.Navigation className="w-5 h-5 text-gray-800" />
          </div>
          <p className="text-2xl font-bold text-black">{totalRides}</p>
          <p className="text-xs text-gray-500 mt-1">
            Last {selectedPeriod} days
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Completed Rides
            </h3>
            <Icons.CheckCircle className="w-5 h-5 text-gray-800" />
          </div>
          <p className="text-2xl font-bold text-black">{completedRides}</p>
          <p className="text-xs text-gray-500 mt-1">Completed successfully</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Earnings
            </h3>
            <Icons.DollarSign className="w-5 h-5 text-gray-800" />
          </div>
          <p className="text-2xl font-bold text-black">
            ${totalEarnings}
          </p>
          <p className="text-xs text-gray-500 mt-1">From completed rides</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg. Rating</h3>
            <Icons.Star className="w-5 h-5 text-gray-800  " />
          </div>
          <p className="text-2xl font-bold text-black">
            {averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Customer rating</p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <CustomTable title="Rides History" tableHeaders={tableHeaders} tableData={tableData} />
        {filteredRides.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No rides found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRides;
