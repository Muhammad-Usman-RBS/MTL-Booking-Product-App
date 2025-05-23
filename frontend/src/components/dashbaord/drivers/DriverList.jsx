import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { driversData } from "../../../constants/dashboardTabsData/data";
import Icons from "../../../assets/icons";
import ViewDriver from "./ViewDriver";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const tabOptions = [
  "Active",
  "Suspended",
  "Pending",
  "Deleted",
  "Delete Pending",
];




const DriverList = () => {
  const [activeTab, setActiveTab] = useState("Suspended");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [driverToSendEmail, setDriverToSendEmail] = useState(null);

  const itemsPerPageOptions = [5, 10, 20, "All"];

  const filteredTabData = driversData.filter(
    (item) => item.status === activeTab
  );

  const filteredData = filteredTabData.filter((item) => {
    const query = search.toLowerCase();
    return (
      item?.name?.toLowerCase().includes(query) ||
      item?.email?.toLowerCase().includes(query) ||
      item?.make?.toLowerCase().includes(query) ||
      item?.model?.toLowerCase().includes(query)
    );
  });

  const totalPages =
    perPage === "All" ? 1 : Math.ceil(filteredData.length / perPage);

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage, activeTab]);

  if (selectedDriver) {
    return (
      <ViewDriver
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
      />
    );
  }

  const handleSendEmail = (driver) => {
    setDriverToSendEmail(driver);
    setShowModal(true);
  };

  const tableHeaders = [
    { label: "No.", key: "index" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Make", key: "make" },
    { label: "Model", key: "model" },
    { label: "Reg. No.", key: "regNo" },
    { label: "Documents", key: "documents" },
    { label: "Actions", key: "actions" },
  ];

  const exportTableData = paginatedData.map((item, index) => ({
    index:
      (page - 1) * (perPage === "All" ? filteredData.length : perPage) +
      index +
      1,
    name: item.name,
    email: item.email,
    make: item.make,
    model: item.model,
    regNo: item.regNo,
    documents: item.documents,
  }));

  const tableData = paginatedData.map((item, index) => ({
    ...item,
    index:
      (page - 1) * (perPage === "All" ? filteredData.length : perPage) +
      index +
      1,
    documents: (
      <span
        className={`font-semibold ${item.documents === "Fine" ? "text-green-600" : "text-red-500"
          }`}
      >
        {item.documents}
      </span>
    ),
    actions: (
      <div className="flex gap-2">
        <Icons.Eye
          className="w-8 h-8 rounded-md hover:bg-blue-600 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2"
          onClick={() => setSelectedDriver(item)}
        />
        <Link to="/dashboard/drivers/new">
          <Icons.Pencil className="w-8 h-8 rounded-md hover:bg-yellow-600 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2" />
        </Link>
        <Icons.Send
          className="w-8 h-8 rounded-md hover:bg-blue-500 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2"
          onClick={() => handleSendEmail(item)}
        />
        <Icons.X className="w-8 h-8 rounded-md hover:bg-red-800 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2" />
      </div>
    ),
  }));

  return (
    <div>
      <OutletHeading name="Driver List" />

      <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
        <Link to="/dashboard/drivers/new" className="w-full sm:w-auto">
          <button className="btn btn-reset flex items-center gap-2 w-full sm:w-auto justify-center">
            Create New Driver
          </button>
        </Link>
      </div>

      <div className="w-full overflow-x-auto mb-4">
        <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base px-2">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 whitespace-nowrap transition-all duration-200 ${activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
                }`}
            >
              {tab} ({driversData.filter((d) => d.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        exportTableData={exportTableData}
        showSearch={true}
        showRefresh={true}
        showDownload={true}
        showPagination={true}
        showSorting={true}
      />

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading="SC"
      >
        <div className="p-4">
          <p className="text-sm">
            Would you like to resend <strong>"Driver Welcome Email"</strong> to
            <br />
            <strong>{driverToSendEmail?.email}</strong>?
          </p>
          <p className="text-sm mt-2">
            Driver will be logged out from all devices and new password will be
            sent.
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                setShowModal(false);
              }}
            >
              Send
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default DriverList;
