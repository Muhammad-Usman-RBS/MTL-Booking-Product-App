import React, { useState, useEffect } from "react";
import { GripHorizontal, ArrowDownUp } from "lucide-react";
import { Link } from "react-router-dom";
import SelectedSearch from "../../../constants/SelectedSearch";
import SelectOption from "../../../constants/SelectOption";
import DownloadBookingPDF from "./DownloadBookingPDF";
import CustomModal from "../../../constants/CustomModal";
import JourneyDetailsModal from "./JourneyDetailsModal";
import Icons from "../../../assets/icons";
import {
  sampleData,
  driverList,
  passengerList,
  vehicleList,
  accountList,
  statusList,
  options,
  actionMenuItems,
  itemsPerPageOptions,
} from "../../../constants/bookingstab/bookingData";
import AuditModal from "./AuditModal";
import SelectDateRange from "../../../constants/SelectDateRange";

const TableComponent = () => {
  const [selectedStatus, setSelectedStatus] = useState(["Payment Pending"]);
  const [search, setSearch] = useState("");
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(sampleData.length);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showDiv, setShowDiv] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    return (
      <ArrowDownUp
        className={`inline w-4 h-4 ml-4 ${
          sortConfig.key === key ? "text-gray-600" : "text-gray-400"
        }`}
      />
    );
  };

  const filteredData = sampleData.filter((item) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      item.orderNo.toLowerCase().includes(searchLower) ||
      item.passenger.toLowerCase().includes(searchLower) ||
      item.date.toLowerCase().includes(searchLower) ||
      item.pickUp.toLowerCase().includes(searchLower) ||
      item.dropOff.toLowerCase().includes(searchLower) ||
      item.vehicle.toLowerCase().includes(searchLower) ||
      item.payment.toLowerCase().includes(searchLower) ||
      item.driver.toLowerCase().includes(searchLower) ||
      item.fare.toLowerCase().includes(searchLower);

    const matchesDriver =
      selectedDrivers.length === 0 ||
      selectedDrivers.includes("All") ||
      selectedDrivers.includes(item.driver);

    const matchesPassenger =
      selectedPassengers.length === 0 ||
      selectedPassengers.includes("All") ||
      selectedPassengers.includes(item.passenger);

    const matchesVehicle =
      selectedVehicleTypes.length === 0 ||
      selectedVehicleTypes.includes("All") ||
      selectedVehicleTypes.includes(item.vehicle);

    const matchesAccount =
      selectedAccounts.length === 0 ||
      selectedAccounts.includes("All") ||
      selectedAccounts.includes(item.account);

    return (
      matchesSearch &&
      matchesDriver &&
      matchesPassenger &&
      matchesVehicle &&
      matchesAccount
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";
    return sortConfig.direction === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const totalPages =
    perPage === "All" ? 1 : Math.ceil(sortedData.length / perPage);
  const paginatedData =
    perPage === "All"
      ? sortedData
      : sortedData.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setTotalRecords(filteredData.length);
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage]);

  const tableHeaders = [
    { label: "Order No.", key: "orderNo" },
    { label: "Passenger", key: "passenger" },
    { label: "Date & Time", key: "date" },
    { label: "Pick Up", key: "" },
    { label: "Drop Off", key: "" },
    { label: "Vehicle", key: "vehicle" },
    { label: "Payment", key: "payment" },
    { label: "Fare", key: "fare" },
    { label: "DR Fare", key: "drFare" },
    { label: "Driver", key: "driver" },
    { label: "Status", key: "" },
    { label: "Action", key: "" },
  ];

  const handleActionClick = (index) => {
    setSelectedActionRow(selectedActionRow === index ? null : index);
  };

  const openAuditModal = (audit) => {
    setAuditData(audit || []);
    setShowAuditModal(true);
    setSelectedActionRow(null);
  };

  const openViewModal = (view) => {
    setViewData(view || []);
    setShowViewModal(true);
    setSelectedActionRow(null);
  };

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full">
          {/* Left Section: Buttons, Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
            <div className="flex gap-2">
              <Link to="/dashboard/new-booking">
                <button className="btn btn-reset">
                  <Icons.Plus size={20} />
                </button>
              </Link>

              <button
                onClick={() => setShowDiv(!showDiv)}
                className="btn btn-outline"
                title="Filters"
              >
                <Icons.Filter size={16} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
              <SelectedSearch
                selected={selectedStatus}
                setSelected={setSelectedStatus}
                statusList={statusList}
                showCount={true}
              />

              <input
                type="text"
                placeholder="Search"
                className="border rounded border-gray-300 px-3 py-1 w-full sm:w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <SelectDateRange
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            </div>
          </div>

          {/* Right Section: Refresh & Per Page Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <button
              className="border py-2 px-3 rounded cursor-pointer border-gray-300"
              onClick={() => window.location.reload()}
              title="Reload"
            >
              <Icons.RefreshCcw size={16} />
            </button>

            <select
              className="border py-1 px-3 rounded border-gray-300"
              value={perPage}
              onChange={(e) => {
                const value =
                  e.target.value === "All" ? "All" : Number(e.target.value);
                setPerPage(value);
              }}
            >
              {itemsPerPageOptions.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showDiv && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <SelectedSearch
              selected={selectedDrivers}
              setSelected={setSelectedDrivers}
              statusList={driverList}
              placeholder="Select Driver"
              showCount={false}
            />

            <SelectedSearch
              selected={selectedPassengers}
              setSelected={setSelectedPassengers}
              statusList={passengerList}
              placeholder="Select Passenger"
              showCount={false}
            />

            <SelectedSearch
              selected={selectedVehicleTypes}
              setSelected={setSelectedVehicleTypes}
              statusList={vehicleList}
              placeholder="Select Vehicle"
              showCount={false}
            />

            <SelectedSearch
              selected={selectedAccounts}
              setSelected={setSelectedAccounts}
              statusList={accountList}
              placeholder="Select Account"
              showCount={false}
            />
          </div>
        )}
        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-[900px] md:min-w-full table-fixed border border-gray-200 text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                {tableHeaders.map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.key && requestSort(col.key)}
                    className={`border px-2 py-2 text-left whitespace-nowrap ${
                      col.key
                        ? "cursor-pointer hover:bg-gray-200 transition"
                        : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.key && getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border hover:bg-gray-50 transition">
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.orderNo}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.passenger}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.pickUp}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.dropOff}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.vehicle}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.payment}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.fare}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.drFare}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.driver}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    <SelectOption
                      width="32"
                      options={options}
                      className="w-full"
                    />
                  </td>
                  <td className="px-2 py-2 relative text-center">
                    <button
                      onClick={() => handleActionClick(index)}
                      className="p-2 rounded hover:bg-gray-100 transition"
                      title="More Actions"
                    >
                      <GripHorizontal size={18} className="text-gray-600" />
                    </button>

                    {selectedActionRow === index && (
                      <div className="absolute right-0 z-50 mt-2 w-40 bg-white border rounded shadow">
                        {actionMenuItems.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (action === "Status Audit") {
                                openAuditModal(
                                  paginatedData[index].statusAudit
                                );
                              } else if (action === "View") {
                                openViewModal(paginatedData[index].view);
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 text-sm w-full">
          {/* Left Side: Total Records & PDF */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center w-full sm:w-auto">
            <div className="btn btn-outline w-full sm:w-auto text-center">
              Total Records: {totalRecords}
            </div>
            <div className="w-full sm:w-auto">
              <DownloadBookingPDF data={paginatedData} />
            </div>
          </div>

          {/* Right Side: Pagination */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full sm:w-auto">
            <button
              className="btn btn-reset"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <Icons.SkipBack size={16} />
            </button>

            <input
              type="number"
              value={page}
              onChange={(e) => {
                const newPage = Number(e.target.value);
                if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
              }}
              className="border w-16 text-center py-1 px-2 rounded border-gray-300"
            />
            <span className="text-gray-600">of {totalPages}</span>

            <button
              className="btn btn-reset"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <Icons.SkipForward size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Audit Modal */}
      <CustomModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        heading="Status Audit"
      >
        <AuditModal auditData={auditData} />
      </CustomModal>

      {/* Journey Details Modal */}
      <CustomModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        heading="Journey Details"
      >
        <JourneyDetailsModal />
      </CustomModal>
    </>
  );
};

export default TableComponent;
