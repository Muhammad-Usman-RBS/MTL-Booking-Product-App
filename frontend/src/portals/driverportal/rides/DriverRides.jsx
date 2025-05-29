import React, { useState, useMemo } from "react";
import {
  timeFilters,
  statusOptions,
  mockJobs,
} from "../../../constants/dashboardTabsData/data";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const DriverRides = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter rides based on selected period and filters
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

  // Calculate statistics
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <OutletHeading name={"Previous Rides"} />
      </div>

      {/* Time Period Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {timeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedPeriod(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === filter.value
                  ? "bg-black text-white"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              <Icons.Calendar className="w-4 h-4 inline mr-2" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Icons.Filter className="w-4 h-4 text-black" />
            <span className="font-medium text-black">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-black bg-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Icons.Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by customer or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-black bg-white"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Rides</h3>
            <Icons.Navigation className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-black">{totalRides}</p>
          <p className="text-xs text-gray-500 mt-1">
            Last {selectedPeriod} days
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <Icons.MapPin className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-black">{completedRides}</p>
          <p className="text-xs text-gray-500 mt-1">Successful rides</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Earned</h3>
            <Icons.Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-black">
            ${totalEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">From completed rides</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Rating</h3>
            <Icons.Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-black">
            {averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Customer rating</p>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-4">
        {filteredRides.map((ride) => {
          const { date, time } = formatDateTime(ride.acceptedAt);
          return (
            <div
              key={ride.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Icons.User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-black">
                      {ride.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icons.Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      {ride.customerRating}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{date}</div>
                  <div className="text-sm text-gray-500">{time}</div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ride.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : ride.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <Icons.MapPin className="w-4 h-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="text-black font-medium">
                        {ride.pickupLocation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icons.MapPin className="w-4 h-4 text-red-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Drop</p>
                      <p className="text-black font-medium">
                        {ride.dropLocation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="text-black font-medium">{ride.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-black font-medium">
                      {ride.estimatedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Your Fare</p>
                    <p className="text-black font-medium">
                      ${ride.driverFare.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Payment</p>
                    <p className="text-black font-medium">
                      ${ride.totalPayment.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {ride.extraGuidance && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Note: </span>
                    {ride.extraGuidance}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRides.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No rides found for the selected filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverRides;
