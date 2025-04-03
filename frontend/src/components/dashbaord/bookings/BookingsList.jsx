// Updated TableComponent with Full Functionality
import React, { useState, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  GripHorizontal,
  ArrowDownUp,
} from "lucide-react";
import Icons from "../../../assets/icons";
import Images from "../../../assets/images";
import SelectedSearch from "../../../constants/SelectedSearch";
import SelectOption from "../../../constants/SelectOption";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";

const statusList = [
  { label: "Scheduled", count: 41 },
  { label: "Pending", count: 0 },
  { label: "Payment Pending", count: 20 },
  { label: "No Show", count: 177 },
  { label: "Completed", count: 7389 },
  { label: "Cancelled", count: 193 },
  { label: "Rejected", count: 0 },
  { label: "Deleted", count: 0 },
  { label: "All", count: 7820 },
];

const itemsPerPageOptions = [1, 2, 3, 40, "All"];

const sampleData = [
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "\u00a3195",
    drFare: "\u00a30",
    driver: "",
    statusAudit: [
      {
        updatedBy: "Hafiz Amir",
        status: "Assigned to Driver",
        date: "18-08-2024 11:25",
      },
      { updatedBy: "Jeremy", status: "Accepted", date: "18-08-2024 11:28" },
      { updatedBy: "Khizer", status: "On Route", date: "18-08-2024 11:58" },
    ],
  },
  {
    orderNo: "2406075243",
    passenger: "Emily Watson",
    date: "09-06-2024 11:15",
    pickUp: "Oxford Street, London",
    dropOff: "Heathrow Terminal 2",
    vehicle: "Executive Sedan",
    payment: "Cash",
    fare: "\u00a3170",
    drFare: "\u00a320",
    driver: "",
    statusAudit: [
      { updatedBy: "Admin", status: "Assigned", date: "19-08-2024 10:00" },
      { updatedBy: "Emily", status: "Accepted", date: "19-08-2024 10:15" },
    ],
  },
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "\u00a3195",
    drFare: "\u00a30",
    driver: "",
    statusAudit: [
      {
        updatedBy: "System",
        status: "Auto Assigned",
        date: "18-08-2024 09:00",
      },
    ],
  },
  {
    orderNo: "2406075243",
    passenger: "Emily Watson",
    date: "09-06-2024 11:15",
    pickUp: "Oxford Street, London",
    dropOff: "Heathrow Terminal 2",
    vehicle: "Executive Sedan",
    payment: "Cash",
    fare: "\u00a314530",
    drFare: "\u00a320",
    driver: "",
    statusAudit: [
      {
        updatedBy: "Emily",
        status: "Payment Confirmed",
        date: "19-08-2024 10:30",
      },
    ],
  },
  {
    orderNo: "2406075243",
    passenger: "Omar Farooq",
    date: "09-06-2024 11:15",
    pickUp: "Oxford Street, London",
    dropOff: "Saeed",
    vehicle: "Nasir",
    payment: "Usman",
    fare: "\u00a3170",
    drFare: "\u00a320",
    driver: "",
    statusAudit: [
      { updatedBy: "Usman", status: "Scheduled", date: "20-08-2024 13:00" },
      {
        updatedBy: "Omar Farooq",
        status: "Completed",
        date: "20-08-2024 14:00",
      },
    ],
  },
];

const options = [
  "Accepted",
  "On Route",
  "At Location",
  "Ride Started",
  "No Show",
  "Completed",
];

const actionMenuItems = ["View", "Edit", "Status Audit"];

const driverList = [
  "Select Driver",
  "Usman Ahmed",
  "Khizer Khan",
  "Hafiz Amir",
  "Ali Raza",
  "Zain Ul Abideen",
];

const passengerList = [
  "Select Passenger",
  "Jeremy Haywood",
  "Emily Watson",
  "Omar Farooq",
  "Sarah Malik",
  "Daniel James",
];

const TableComponent = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(["Payment Pending"]);
  const [search, setSearch] = useState("");
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(sampleData.length);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPassenger, setSelectedPassenger] = useState("");

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
      item.fare.toLowerCase().includes(searchLower);

    const matchesDriver =
      selectedDriver === "" ||
      selectedDriver === "Select Driver" ||
      item.driver?.toLowerCase() === selectedDriver.toLowerCase();

    const matchesPassenger =
      selectedPassenger === "" ||
      selectedPassenger === "Select Passenger" ||
      item.passenger?.toLowerCase() === selectedPassenger.toLowerCase();

    return matchesSearch && matchesDriver && matchesPassenger;
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

  const downloadTable = () => {
    const doc = new jsPDF();

    // Table headers
    const headers = [
      [
        "Order No.",
        "Passenger",
        "Date & Time",
        "Pick Up",
        "Drop Off",
        "Vehicle",
        "Payment",
        "Fare",
        "DR Fare",
      ],
    ];

    // Export ONLY currently visible rows on screen
    const data = paginatedData.map((row) => [
      row.orderNo,
      row.passenger,
      row.date,
      row.pickUp,
      row.dropOff,
      row.vehicle,
      row.payment,
      row.fare,
      row.drFare,
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20,
      margin: { top: 10, left: 10, right: 10 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        halign: "center",
      },
      bodyStyles: {
        halign: "left",
      },
    });

    doc.save("Bookings-Report.pdf");
  };

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

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
          <div className="flex items-center gap-2 w-full lg:w-auto">
           <Link to="/dashboard/new-booking">
           <button className="btn btn-reset">
              <Icons.Plus size={16} />
            </button>
           </Link>
            <SelectedSearch
              selected={selectedStatus}
              setSelected={setSelectedStatus}
              statusList={statusList}
            />
            <input
              type="text"
              placeholder="Search"
              className="border rounded border-gray-300 px-2 py-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SelectOption
              options={driverList}
              width="40"
              onChange={(e) => setSelectedDriver(e.target.value)}
            />

            <SelectOption
              options={passengerList}
              width="40"
              value={selectedPassenger} // ✅ controlled value
              onChange={(e) => setSelectedPassenger(e.target.value)} // ✅ keeps state in sync
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="btn btn-outline" title="Drivers">
              <Icons.Users size={16} />
            </button>
            <button className="btn btn-outline" title="Maps">
              <Icons.Users size={16} />
            </button>
            <button
              className="border py-2 px-2 rounded cursor-pointer border-gray-300"
              onClick={() => {
                window.location.reload();
              }}
            >
              <Icons.RefreshCcw size={16} />
            </button>
            <select
              className="border py-1 px-2 rounded border-gray-300"
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

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="table-auto w-full border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-xs sm:text-sm text-gray-700">
                {tableHeaders.map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.key && requestSort(col.key)}
                    className={`border px-2 sm:px-4 py-2 text-left whitespace-nowrap ${
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
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.orderNo}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.passenger}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.pickUp}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.dropOff}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.vehicle}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.payment}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.fare}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    {item.drFare}
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap text-center">
                    <div className="w-16">
                      <img
                        src={Images.profileimg}
                        alt="Profile"
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border border-gray-300 mx-auto"
                      />
                    </div>
                  </td>
                  <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                    <SelectOption
                      width="32"
                      options={options}
                      className="w-full"
                    />
                  </td>
                  <td className="px-2 py-2 relative mt-12 text-center">
                    <button
                      onClick={() => handleActionClick(index)}
                      className="p-1 "
                    >
                    <GripHorizontal size={18} />
                    </button>
                    {selectedActionRow === index && (
                      <div className="absolute right-0 z-50 mt-2 w-40 bg-white border rounded shadow">
                        {actionMenuItems.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (action === "Status Audit")
                                openAuditModal(
                                  paginatedData[index].statusAudit
                                );
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
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
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="flex gap-3 items-center">
            <div className="btn btn-outline">Total Records: {totalRecords}</div>
            <div>
              <button
                className="bg-gray-600 text-white p-2 rounded"
                onClick={downloadTable}
              >
                <Icons.Download size={16} />
              </button>
            </div>
          </div>
          <div className="flex gap-2 items-center">
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
              className="border w-12 text-center py-0.5 px-2 rounded border-gray-300"
            />
            <span>of {totalPages}</span>
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
      {/* Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Status Audit</h2>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="text-left px-6 py-3">Updated By</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditData.length > 0 ? (
                    auditData.map((entry, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 font-medium text-gray-800">
                          {entry.updatedBy}
                        </td>
                        <td className="px-6 py-3 text-gray-700">
                          {entry.status}
                        </td>
                        <td className="px-6 py-3 text-gray-500">
                          {entry.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-center text-gray-400"
                      >
                        No audit records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      ;
    </>
  );
};

export default TableComponent;
