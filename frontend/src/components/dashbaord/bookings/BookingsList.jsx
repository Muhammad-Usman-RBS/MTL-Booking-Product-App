import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCompanies } from "../../../redux/companySlice";
import { useGetCompanyByIdQuery } from "../../../redux/api/companyApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { actionMenuItems } from "../../../constants/dashboardTabsData/data";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import JourneyDetailsModal from "./JourneyDetailsModal";
import ShortcutkeysModal from "./ShortcutkeysModal";
import BookingsFilters from "./BookingsFilters";
import BookingsTable from "./BookingsTable";
import AuditModal from "./AuditModal";
import ViewDriver from "./ViewDriver";
import NewBooking from "./NewBooking";

const defaultColumns = {
  bookingType: true,
  bookingId: true,
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

const ALL_STATUSES = [
  "New",
  "Accepted",
  "On Route",
  "At Location",
  "Ride Started",
  "Late Cancel",
  "No Show",
  "Completed",
  "Cancel",
  "Reject",
];

const BookingsList = () => {
  const [selectedStatus, setSelectedStatus] = useState(["All"]);
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
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { data: companyData } = useGetCompanyByIdQuery(user?.companyId);
  const { data: bookingData } = useGetAllBookingsQuery(user?.companyId);

  const allBookings = bookingData?.bookings || [];

  const statusCountMap = ALL_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  allBookings.forEach((booking) => {
    const status = booking.status || "Unknown";
    if (statusCountMap.hasOwnProperty(status)) {
      statusCountMap[status]++;
    } else {
      statusCountMap[status] = 1;
    }
  });

  const dynamicStatusList = Object.entries(statusCountMap).map(
    ([label, count]) => ({
      label,
      count,
    })
  );

  dynamicStatusList.push({ label: "All", count: allBookings.length });

  const passengerMap = new Map();
  allBookings.forEach((booking) => {
    const p = booking.passenger;
    if (p && p.name && !passengerMap.has(p.name)) {
      passengerMap.set(p.name, {
        label: p.name,
        value: p.name,
      });
    }
  });
  const passengerList = Array.from(passengerMap.values());

  const vehicleMap = new Map();
  allBookings.forEach((booking) => {
    const v = booking.vehicle;
    if (v && v.vehicleName && !vehicleMap.has(v.vehicleName)) {
      vehicleMap.set(v.vehicleName, {
        label: v.vehicleName,
        value: v.vehicleName,
      });
    }
  });
  const vehicleList = Array.from(vehicleMap.values());

  useEffect(() => {
    if (companyData) {
      dispatch(setCompanies([companyData]));
    }
  }, [companyData]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editBookingData, setEditBookingData] = useState(null);

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
        statusList={dynamicStatusList}
        passengerList={passengerList}
        vehicleList={vehicleList}
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
        setEditBookingData={setEditBookingData}
        setShowEditModal={setShowEditModal}
        selectedStatus={selectedStatus}
        selectedPassengers={selectedPassengers}
        selectedVehicleTypes={selectedVehicleTypes}
        setShowViewModal={setShowViewModal}
        setShowAuditModal={setShowAuditModal}
        setShowDriverModal={setShowDriverModal}
      />

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
        <JourneyDetailsModal viewData={viewData} />
      </CustomModal>

      <CustomModal
        isOpen={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        heading={`${selectedDriver?.name || "Driver Details"}`}
      >
        <ViewDriver />
      </CustomModal>

      <CustomModal
        isOpen={showKeyboardModal}
        onClose={() => setShowKeyboardModal(false)}
        heading="Keyboard Shortcuts"
      >
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
