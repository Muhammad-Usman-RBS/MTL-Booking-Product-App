import React, { useState, useEffect, useRef } from "react";
import { GripHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import JourneyDetailsModal from "./JourneyDetailsModal";
import Icons from "../../../assets/icons";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import {
  sampleData,
  driverList,
  passengerList,
  vehicleList,
  accountList,
  statusList,
  options,
  actionMenuItems,
} from "../../../constants/dashboardTabsData/data";
import AuditModal from "./AuditModal";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const BookingsList = () => {
  const [selectedStatus, setSelectedStatus] = useState(["Payment Pending"]);
  const [search, setSearch] = useState("");
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
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
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage]);

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

  const tableHeaders = [
    { label: "Order No.", key: "orderNo" },
    { label: "Passenger", key: "passenger" },
    { label: "Date & Time", key: "date" },
    { label: "Pick Up", key: "pickUp" },
    { label: "Drop Off", key: "dropOff" },
    { label: "Vehicle", key: "vehicle" },
    { label: "Payment", key: "payment" },
    { label: "Fare", key: "fare" },
    { label: "DR Fare", key: "drFare" },
    { label: "Driver", key: "driver" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const tableData = paginatedData.map((item, index) => ({
    ...item,
    status: <SelectOption width="32" options={options} className="w-full" />,
    actions: (
      <div className="relative text-center">
        <button
          onClick={() =>
            setSelectedActionRow(selectedActionRow === index ? null : index)
          }
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
                  if (action === "Status Audit")
                    openAuditModal(item.statusAudit);
                  else if (action === "View") openViewModal(item.view);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <>
      <OutletHeading name="Bookings List" />

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
          <div className="flex gap-2">
            <Link to="/dashboard/bookings/new">
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

          <SelectedSearch
            selected={selectedStatus}
            setSelected={setSelectedStatus}
            statusList={statusList}
            showCount={true}
          />

          <SelectDateRange
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
      </div>

      {showDiv && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
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

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        showSearch={true}
        showRefresh={true}
        showDownload={true}
        showPagination={true}
        showSorting={true}
      />

      {/* Modals */}
      <CustomModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        heading="Status Audit"
      >
        <AuditModal auditData={auditData} />
      </CustomModal>

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

export default BookingsList;
