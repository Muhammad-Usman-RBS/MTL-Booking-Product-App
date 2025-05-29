import React, { useState, useMemo } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import Icons from "../../../assets/icons";
import {
  jobTypes,
  mockEarningsData,
  timeFilters,
} from "../../../constants/dashboardTabsData/data";

const DriverEarnings = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter earnings based on selected period and filters
  const filteredEarnings = useMemo(() => {
    const daysAgo = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return mockEarningsData.filter((earning) => {
      const earningDate = new Date(earning.date);
      const isWithinPeriod = earningDate >= cutoffDate;
      const matchesJobType =
        jobTypeFilter === "all" || earning.jobType === jobTypeFilter;
      const matchesStatus =
        statusFilter === "all" || earning.status === statusFilter;

      return isWithinPeriod && matchesJobType && matchesStatus;
    });
  }, [selectedPeriod, jobTypeFilter, statusFilter]);

  // Calculate statistics
  const totalEarnings = filteredEarnings.reduce(
    (sum, earning) => sum + earning.amount,
    0
  );

  const averagePerJob =
    filteredEarnings.length > 0 ? totalEarnings / filteredEarnings.length : 0;
  const totalTrips = filteredEarnings.length;
  const totalDistance = filteredEarnings.reduce(
    (sum, earning) => sum + earning.tripDistance,
    0
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <OutletHeading name={"Earnings"} />
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

      {/* Additional Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Icons.Filter className="w-4 h-4 text-black" />
            <span className="font-medium text-black">Filters:</span>
          </div>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-black bg-white"
          >
            {jobTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-black bg-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <button className="px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
            <Icons.Download className="w-4 h-4 inline mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Earnings
            </h3>
            <Icons.DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-black">
            ${totalEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last {selectedPeriod} days
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Average Per Job
            </h3>
            <Icons.TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-black">
            ${averagePerJob.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Per service</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Services
            </h3>
            <Icons.Eye className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-black">{totalTrips}</p>
          <p className="text-xs text-gray-500 mt-1">Completed services</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Distance Covered
            </h3>
            <Icons.Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-black">
            {totalDistance.toFixed(1)} km
          </p>
          <p className="text-xs text-gray-500 mt-1">Total distance</p>
        </div>
      </div>

      {/* Earnings List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Service History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEarnings.map((earning) => (
                <tr key={earning.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {new Date(earning.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        earning.jobType === "pick-drop"
                          ? "bg-blue-100 text-blue-800"
                          : earning.jobType === "pickup-only"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {earning.jobType === "pick-drop"
                        ? "Pick & Drop"
                        : earning.jobType === "pickup-only"
                        ? "Pickup Only"
                        : "Drop Only"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {earning.tripDistance} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        earning.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {earning.status.charAt(0).toUpperCase() +
                        earning.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    ${earning.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEarnings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No earnings found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverEarnings;
