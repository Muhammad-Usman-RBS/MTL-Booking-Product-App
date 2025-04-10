import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import { statementsData } from "../../../constants/statementstab/statementsData";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import ViewModal from "../../../components/dashbaord/statements/ViewModal";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import html2pdf from "html2pdf.js";
import DriverGeneration from "./DriverGeneration";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const DriverStatements = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9999);
  const [selectedStatus, setSelectedStatus] = useState(["All"]);
  const [viewModalData, setViewModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [driverToSendEmail, setDriverToSendEmail] = useState(null);
  const [emailToSend, setEmailToSend] = useState("");
  const [showGeneration, setShowGeneration] = useState(false);

  const driverSet = new Set(statementsData.map((item) => item.driver));
  const statusdriver = [
    { label: "All", count: statementsData.length },
    ...Array.from(driverSet).map((driver) => ({
      label: driver,
      count: statementsData.filter((item) => item.driver === driver).length,
    })),
  ];

  const filteredData = statementsData.filter((item) => {
    const matchesSearch = item.driver
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDriver =
      selectedStatus.includes("All") || selectedStatus.includes(item.driver);

    return matchesSearch && matchesDriver;
  });

  const totalPages =
    perPage === "All" ? 1 : Math.ceil(filteredData.length / perPage);

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage]);

  const handleDownload = (item) => {
    setViewModalData(item);
    setTimeout(() => {
      const element = document.getElementById("invoice-content");
      if (!element) return;

      html2pdf()
        .set({
          margin: 0.5,
          filename: `${item.driver}_statement.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(element)
        .save();
    }, 500);
  };

  const handleSendEmail = (driver) => {
    setDriverToSendEmail(driver);
    setEmailToSend(driver.email || "");
    setShowModal(true);
  };

  const tableHeaders = [
    { label: "Driver", key: "driver" },
    { label: "Period", key: "period" },
    { label: "Bookings", key: "bookings" },
    { label: "Payments", key: "payments" },
    { label: "Cash Collected", key: "cashCollected" },
    { label: "Driver Fare", key: "fare" },
    { label: "Due", key: "due" },
    { label: "Paid(Pending)", key: "paid" },
    { label: "Received(Pending)", key: "received" },
    { label: "Actions", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Eye
          className="w-8 h-8 rounded-md hover:bg-blue-600 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2"
          onClick={() => setViewModalData(item)}
        />
        <Icons.Download
          onClick={() => handleDownload(item)}
          className="w-8 h-8 rounded-md hover:bg-yellow-600 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2"
        />
        <Icons.Send
          className="w-8 h-8 rounded-md hover:bg-blue-500 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2"
          onClick={() => handleSendEmail(item)}
        />
        <Icons.X className="w-8 h-8 rounded-md hover:bg-red-800 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2" />
      </div>
    ),
  }));

  if (showGeneration) {
    return <DriverGeneration setShowGeneration={setShowGeneration} />;
  }

  return (
    <div>
      <OutletHeading name="Driver Statements" />

      <div className="flex flex-col justify-between sm:flex-row gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <button
            className="btn btn-reset"
            onClick={() => setShowGeneration(true)}
          >
            Create
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <SelectedSearch
            selected={selectedStatus}
            setSelected={setSelectedStatus}
            statusList={statusdriver}
            showCount={true}
          />
        </div>
      </div>

      <p className="pb-2">
        Driver Fare: 3399.50 GBP | Due: 3399.50 GBP | Paid: 2438.00 GBP |
        Received: 0.00 GBP
      </p>

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
        isOpen={viewModalData}
        onClose={() => setViewModalData(false)}
        heading="View Invoice"
      >
        {viewModalData && <ViewModal data={viewModalData} />}
      </CustomModal>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading="Send Statement"
      >
        <div className="w-full max-w-md mx-auto p-4 font-sans">
          <div className="bg-gray-100 font-semibold text-sm rounded px-4 py-3 mb-5">
            Period: {driverToSendEmail?.period || "N/A"}
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email:
          </label>
          <input
            type="email"
            value={emailToSend}
            onChange={(e) => setEmailToSend(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5 text-sm"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Send Statement
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default DriverStatements;
