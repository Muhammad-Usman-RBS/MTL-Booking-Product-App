// import React, { useState, useEffect, useRef } from "react";
// import { GripHorizontal } from "lucide-react";
// import { Link } from "react-router-dom";
// import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
// import SelectOption from "../../../constants/constantscomponents/SelectOption";
// import CustomModal from "../../../constants/constantscomponents/CustomModal";
// import JourneyDetailsModal from "./JourneyDetailsModal";
// import Icons from "../../../assets/icons";
// import CustomTable from "../../../constants/constantscomponents/CustomTable";
// import AuditModal from "./AuditModal";
// import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
// import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
// import {
//   sampleData,
//   driverList,
//   passengerList,
//   vehicleList,
//   accountList,
//   statusList,
//   options,
//   actionMenuItems,
// } from "../../../constants/dashboardTabsData/data";
// import ViewDriver from "./ViewDriver";
// import ShortcutkeysModal from "./ShortcutkeysModal";

// const BookingsList = () => {
//   const [selectedStatus, setSelectedStatus] = useState(["Payment Pending"]);
//   const [search, setSearch] = useState("");
//   const [selectedActionRow, setSelectedActionRow] = useState(null);
//   const [showAuditModal, setShowAuditModal] = useState(false);
//   const [auditData, setAuditData] = useState([]);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [viewData, setViewData] = useState([]);
//   const [perPage, setPerPage] = useState("All");
//   const [page, setPage] = useState(1);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
//   const [selectedDrivers, setSelectedDrivers] = useState([]);
//   const [selectedPassengers, setSelectedPassengers] = useState([]);
//   const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
//   const [selectedAccounts, setSelectedAccounts] = useState([]);
//   const [showDiv, setShowDiv] = useState(false);
//   const [showColumnModal, setShowColumnModal] = useState(false);
//   const [showKeyboardModal, setShowKeyboardModal] = useState(false);
//   const [showDriverModal, setShowDriverModal] = useState(false);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [startDate, setStartDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );
//   const [endDate, setEndDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );

//   const openDriverModal = (driverName) => {
//     setSelectedDriver(driverName);
//     setShowDriverModal(true);
//   };

//   const filteredData = sampleData.filter((item) => {
//     const searchLower = search.toLowerCase();
//     const matchesSearch =
//       item.orderNo.toLowerCase().includes(searchLower) ||
//       item.passenger.toLowerCase().includes(searchLower) ||
//       item.date.toLowerCase().includes(searchLower) ||
//       item.pickUp.toLowerCase().includes(searchLower) ||
//       item.dropOff.toLowerCase().includes(searchLower) ||
//       item.vehicle.toLowerCase().includes(searchLower) ||
//       item.payment.toLowerCase().includes(searchLower) ||
//       item.driver.toLowerCase().includes(searchLower);
//     item.fare.toLowerCase().includes(searchLower);

//     const matchesDriver =
//       selectedDrivers.length === 0 ||
//       selectedDrivers.includes("All") ||
//       selectedDrivers.includes(item.driver);

//     const matchesPassenger =
//       selectedPassengers.length === 0 ||
//       selectedPassengers.includes("All") ||
//       selectedPassengers.includes(item.passenger);

//     const matchesVehicle =
//       selectedVehicleTypes.length === 0 ||
//       selectedVehicleTypes.includes("All") ||
//       selectedVehicleTypes.includes(item.vehicle);

//     const matchesAccount =
//       selectedAccounts.length === 0 ||
//       selectedAccounts.includes("All") ||
//       selectedAccounts.includes(item.account);

//     // Matches status filter
//     const matchesStatus =
//       selectedStatus.length === 0 ||
//       selectedStatus.includes("All") ||
//       selectedStatus.includes(
//         item.statusAudit?.[item.statusAudit.length - 1]?.status || ""
//       );

//     return (
//       matchesSearch &&
//       matchesDriver &&
//       matchesPassenger &&
//       matchesVehicle &&
//       matchesAccount
//     );
//   });

//   const sortedData = [...filteredData].sort((a, b) => {
//     if (!sortConfig.key) return 0;
//     const aVal = a[sortConfig.key] || "";
//     const bVal = b[sortConfig.key] || "";
//     return sortConfig.direction === "asc"
//       ? aVal.localeCompare(bVal)
//       : bVal.localeCompare(aVal);
//   });

//   const totalPages =
//     perPage === "All" ? 1 : Math.ceil(sortedData.length / perPage);
//   const paginatedData =
//     perPage === "All"
//       ? sortedData
//       : sortedData.slice((page - 1) * perPage, page * perPage);

//   useEffect(() => {
//     if (page > totalPages) setPage(1);
//   }, [filteredData, perPage]);

//   const openAuditModal = (audit) => {
//     setAuditData(audit || []);
//     setShowAuditModal(true);
//     setSelectedActionRow(null);
//   };

//   const openViewModal = (view) => {
//     setViewData(view || []);
//     setShowViewModal(true);
//     setSelectedActionRow(null);
//   };

//   const tableHeaders = [
//     { label: "Order No.", key: "orderNo" },
//     { label: "Passenger", key: "passenger" },
//     { label: "Date & Time", key: "date" },
//     { label: "Pick Up", key: "pickUp" },
//     { label: "Drop Off", key: "dropOff" },
//     { label: "Vehicle", key: "vehicle" },
//     { label: "Payment", key: "payment" },
//     { label: "Fare", key: "fare" },
//     { label: "DR Fare", key: "drFare" },
//     { label: "Driver", key: "driver" },
//     { label: "Status", key: "status" },
//     { label: "Actions", key: "actions" },
//   ];

//   const [selectedColumns, setSelectedColumns] = useState(() => {
//     const initialState = {};
//     tableHeaders.forEach(({ key }) => {
//       initialState[key] = true;
//     });
//     return initialState;
//   });

//   const exportTableData = paginatedData.map((item) => {
//     const exportRow = {};

//     tableHeaders.forEach(({ key }) => {
//       if (selectedColumns[key]) {
//         if (key === "actions") return;

//         if (key === "status") {
//           exportRow[key] = item.statusAudit?.[item.statusAudit.length - 1]?.status || "-";
//         } else {
//           exportRow[key] = item[key] || "-";
//         }
//       }
//     });

//     return exportRow;
//   });

//   const isClient = typeof window !== "undefined" && window.navigator;

//   const tableData = paginatedData.map((item, index) => {
//     const newRow = {};

//     tableHeaders.forEach(({ key }) => {
//       if (selectedColumns[key]) {
//         const statusValue = item.statusAudit?.[item.statusAudit.length - 1]?.status || "-";

//         if (key === "status") {
//           newRow[key] = isClient
//             ? (
//               <SelectOption
//                 width="32"
//                 options={options}
//                 className="w-full"
//               />
//             )
//             : statusValue;
//         } else if (key === "driver") {
//           newRow[key] = isClient
//             ? (
//               <button
//                 className="cursor-pointer"
//                 onClick={() => openDriverModal(item[key])}
//               >
//                 {item[key]}
//               </button>
//             )
//             : item[key];
//         } else if (key === "actions") {
//           newRow[key] = isClient ? (
//             <div className="relative text-center">
//               <button
//                 onClick={() =>
//                   setSelectedActionRow(
//                     selectedActionRow === index ? null : index
//                   )
//                 }
//                 className="p-2 rounded hover:bg-gray-100 transition"
//                 title="More Actions"
//               >
//                 <GripHorizontal size={18} className="text-gray-600" />
//               </button>
//               {selectedActionRow === index && (
//                 <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-in">
//                   {actionMenuItems.map((action, i) => (
//                     <button
//                       key={i}
//                       onClick={() => {
//                         if (action === "Status Audit") openAuditModal(item.statusAudit);
//                         else if (action === "View") openViewModal(item.view);
//                       }}
//                       className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
//                     >
//                       {action}
//                     </button>
//                   ))}
//                 </div>

//               )}
//             </div>
//           ) : "-";
//         } else {
//           newRow[key] = item[key] || "-";
//         }
//       }
//     });

//     return newRow;
//   });


//   const handleColumnChange = (e, column) => {
//     setSelectedColumns((prev) => ({
//       ...prev,
//       [column]: e.target.checked,
//     }));
//   };

//   return (
//     <>
//       <OutletHeading name="Bookings List" />
//       <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full mb-4">
//         <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
//           <div className="flex gap-2">
//             <Link to="/dashboard/bookings/new">
//               <button className="btn btn-reset">
//                 <Icons.Plus size={20} />
//               </button>
//             </Link>
//             <button
//               onClick={() => setShowDiv(!showDiv)}
//               className="btn btn-outline"
//               title="Filters"
//             >
//               <Icons.Filter size={16} />
//             </button>
//           </div>
//           <div className="w-full sm:w-64">
//             <SelectedSearch
//               selected={selectedStatus}
//               setSelected={setSelectedStatus}
//               statusList={statusList}
//               showCount={true}
//             />
//           </div>
//           <div className="w-full sm:w-64">
//             <SelectDateRange
//               startDate={startDate}
//               endDate={endDate}
//               setStartDate={setStartDate}
//               setEndDate={setEndDate}
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setShowColumnModal(true)}
//               className="btn btn-reset"
//             >
//               <Icons.Columns3 size={20} />
//             </button>
//             <button
//               onClick={() => setShowKeyboardModal(true)}
//               className="btn btn-outline"
//             >
//               <Icons.Keyboard size={16} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {showDiv && (
//         <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
//           <div className="w-full sm:w-64">
//             <SelectedSearch
//               selected={selectedDrivers}
//               setSelected={setSelectedDrivers}
//               statusList={driverList}
//               placeholder="Select Driver"
//               showCount={false}
//             />
//           </div>
//           <div className="w-full sm:w-64">
//             <SelectedSearch
//               selected={selectedPassengers}
//               setSelected={setSelectedPassengers}
//               statusList={passengerList}
//               placeholder="Select Passenger"
//               showCount={false}
//             />
//           </div>
//           <div className="w-full sm:w-64">
//             <SelectedSearch
//               selected={selectedVehicleTypes}
//               setSelected={setSelectedVehicleTypes}
//               statusList={vehicleList}
//               placeholder="Select Vehicle"
//               showCount={false}
//             />
//           </div>
//           <div className="w-full sm:w-64">
//             <SelectedSearch
//               selected={selectedAccounts}
//               setSelected={setSelectedAccounts}
//               statusList={accountList}
//               placeholder="Select Account"
//               showCount={false}
//             />
//           </div>
//         </div>
//       )}

//       <CustomTable
//         tableHeaders={tableHeaders.filter((header) => selectedColumns[header.key])}
//         tableData={tableData}
//         exportTableData={exportTableData} // ✅ NEW
//         showSearch={true}
//         showRefresh={true}
//         showDownload={true}
//         showPagination={true}
//         showSorting={true}
//       />


//       {/* Modals */}
//       <CustomModal
//         isOpen={showAuditModal}
//         onClose={() => setShowAuditModal(false)}
//         heading="Status Audit"
//       >
//         <AuditModal auditData={auditData} />
//       </CustomModal>

//       <CustomModal
//         isOpen={showViewModal}
//         onClose={() => setShowViewModal(false)}
//         heading="Journey Details"
//       >
//         <JourneyDetailsModal />
//       </CustomModal>

//       <CustomModal
//         isOpen={showColumnModal}
//         onClose={() => setShowColumnModal(false)}
//         heading="Column Visibility"
//       >
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
//           {tableHeaders.map(({ label, key }) => (
//             <label
//               key={key}
//               className="flex items-center gap-3 p-2 rounded-md cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 transition"
//             >
//               <input
//                 type="checkbox"
//                 checked={!!selectedColumns[key]}
//                 onChange={(e) => handleColumnChange(e, key)}
//                 className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//               />
//               <span className="text-sm text-gray-800">{label}</span>
//             </label>
//           ))}
//         </div>
//       </CustomModal>

//       <CustomModal
//         isOpen={showKeyboardModal}
//         onClose={() => setShowKeyboardModal(false)}
//         heading="Keyboard Shortcuts"
//       >
//         <ShortcutkeysModal />
//       </CustomModal>

//       <CustomModal
//         isOpen={showDriverModal}
//         onClose={() => setShowDriverModal(false)}
//         heading={`${selectedDriver?.name || "Driver Details"}`}
//       >
//         <ViewDriver />
//       </CustomModal>
//     </>
//   );
// };

// export default BookingsList;











import React, { useState, useEffect } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import BookingsFilters from "./BookingsFilters";
import BookingsTable from "./BookingsTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import AuditModal from "./AuditModal";
import JourneyDetailsModal from "./JourneyDetailsModal";
import ViewDriver from "./ViewDriver";
import ShortcutkeysModal from "./ShortcutkeysModal";
import NewBooking from "./NewBooking"; // ✅ Import NewBooking form

import {
  statusList,
  driverList,
  passengerList,
  vehicleList,
  accountList,
  options,
  actionMenuItems,
} from "../../../constants/dashboardTabsData/data";

const defaultColumns = {
  orderNo: true,
  passenger: true,
  date: true,
  pickUp: true,
  dropOff: true,
  vehicle: true,
  payment: true,
  fare: true,
  drFare: true,
  driver: true,
  status: true,
  actions: true,
};

const BookingsList = () => {
  const [selectedStatus, setSelectedStatus] = useState(["Payment Pending"]);
  const [search, setSearch] = useState("");
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showDiv, setShowDiv] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const [showEditModal, setShowEditModal] = useState(false); // ✅ Edit modal
  const [editBookingData, setEditBookingData] = useState(null); // ✅ Data for edit

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

  const openDriverModal = (driverName) => {
    setSelectedDriver(driverName);
    setShowDriverModal(true);
  };

  // ✅ Initialize from localStorage if available
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const saved = localStorage.getItem("selectedColumns");
    return saved ? JSON.parse(saved) : defaultColumns;
  });

  const handleColumnChange = (key, value) => {
    const updated = { ...selectedColumns, [key]: value };
    setSelectedColumns(updated);
    localStorage.setItem("selectedColumns", JSON.stringify(updated));
  };

  return (
    <>
      <OutletHeading name="Bookings List" />

      <BookingsFilters
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDrivers={selectedDrivers}
        setSelectedDrivers={setSelectedDrivers}
        selectedPassengers={selectedPassengers}
        setSelectedPassengers={setSelectedPassengers}
        selectedVehicleTypes={selectedVehicleTypes}
        setSelectedVehicleTypes={setSelectedVehicleTypes}
        selectedAccounts={selectedAccounts}
        setSelectedAccounts={setSelectedAccounts}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showDiv={showDiv}
        setShowDiv={setShowDiv}
        setShowColumnModal={setShowColumnModal}
        setShowKeyboardModal={setShowKeyboardModal}
      />

      <BookingsTable
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        selectedActionRow={selectedActionRow}
        setSelectedActionRow={setSelectedActionRow}
        openAuditModal={openAuditModal}
        openViewModal={openViewModal}
        openDriverModal={openDriverModal}
        actionMenuItems={actionMenuItems}
        setEditBookingData={setEditBookingData} // ✅ Pass setter
        setShowEditModal={setShowEditModal}     // ✅ Pass modal toggle
      />

      <CustomModal isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} heading="Status Audit">
        <AuditModal auditData={auditData} />
      </CustomModal>

      <CustomModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} heading="Journey Details">
        <JourneyDetailsModal viewData={viewData} />
      </CustomModal>

      <CustomModal isOpen={showDriverModal} onClose={() => setShowDriverModal(false)} heading={`${selectedDriver?.name || "Driver Details"}`}>
        <ViewDriver />
      </CustomModal>

      <CustomModal isOpen={showKeyboardModal} onClose={() => setShowKeyboardModal(false)} heading="Keyboard Shortcuts">
        <ShortcutkeysModal />
      </CustomModal>

      <CustomModal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        heading="Column Visibility"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
          {Object.keys(selectedColumns).map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 p-2 rounded-md cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
              <input
                type="checkbox"
                checked={!!selectedColumns[key]}
                onChange={(e) => handleColumnChange(key, e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-800">{key}</span>
            </label>
          ))}
        </div>
      </CustomModal>

      {/* ✅ EDIT MODAL WITH NewBooking */}
      <CustomModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        heading="Edit Booking"
      >
        <NewBooking
          editBookingData={editBookingData}
          onClose={() => setShowEditModal(false)}
        />
      </CustomModal>
    </>
  );
};

export default BookingsList;
