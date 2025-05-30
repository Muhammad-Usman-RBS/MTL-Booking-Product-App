import React, { useState, useMemo } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import Icons from "../../../assets/icons";
import {
  jobTypes,
  mockJobs,
  statusOptions,

} from "../../../constants/dashboardTabsData/data";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";

const DriverEarnings = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const filteredEarnings = useMemo(() => {
    const transformedJobsToEarnings = mockJobs.map((job) => ({
      id: job.id,
      date: job.acceptedAt ?? new Date().toISOString(),
      amount: job.driverShare,
      jobType:
        job.pickupLocation && job.dropLocation
          ? "pick-drop"
          : job.pickupLocation
          ? "pickup-only"
          : "drop-only",
      status: job.status === "scheduled" ? "pending" : "completed",
      tripDistance: parseFloat(job.distance),
    }));

    const daysAgo = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return transformedJobsToEarnings.filter((earning) => {
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

  const tableHeaders = [
    { label: "Date", key: "date" },
    { label: "Service Type", key: "jobType" },
    { label: "Distance", key: "tripDistance" },
    { label: "Status", key: "status" },
    { label: "Amount", key: "amount" },
  ];
  const tableData = filteredEarnings.map((earning) => ({
    id: earning.id,
    date: new Date(earning.date).toLocaleDateString(),
    jobType: earning.jobType,
    tripDistance: `${earning.tripDistance} km`,
    status: (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          earning.status === "completed"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
      </span>
    ),
    amount: `$${earning.amount.toFixed(2)}`,
  }));

  return (
    <div>
      <div className="mb-8">
        <OutletHeading name={"Earnings"} />
      </div>

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


      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Earnings
            </h3>
            <Icons.DollarSign className="w-5 h-5 text-gray-400 " />
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
            <Icons.TrendingUp className="w-5 h-5 text-gray-400" />
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
            <Icons.Eye className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-black">{totalTrips}</p>
          <p className="text-xs text-gray-500 mt-1">Completed services</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Distance Covered
            </h3>
            <Icons.Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-black">{totalDistance} km</p>
          <p className="text-xs text-gray-500 mt-1">Total distance</p>
        </div>
      </div>

      <div className="mt-12">
        <CustomTable
          title="Service History"
          tableHeaders={tableHeaders}
          tableData={tableData}
        />
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
