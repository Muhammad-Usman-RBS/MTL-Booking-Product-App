import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import { statementsPayment } from "../../../constants/dashboardTabsData/data";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import AddDriverPayment from "./AddDriverPayment";
import ViewPaymentModal from "./ViewPaymentModal";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const DriverPayments = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedStatus, setSelectedStatus] = useState(["All"]);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Completed");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const driverSet = new Set(
    statementsPayment[selectedTab].map((item) => item.driver)
  );

  const statusdriver = [
    { label: "All", count: statementsPayment[selectedTab].length },
    ...Array.from(driverSet).map((driver) => ({
      label: driver,
      count: statementsPayment[selectedTab].filter(
        (item) => item.driver === driver
      ).length,
    })),
  ];

  const filteredData = statementsPayment[selectedTab].filter((item) => {
    const matchesDriver =
      selectedStatus.includes("All") || selectedStatus.includes(item.driver);

    const matchesSearch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesDriver && matchesSearch;
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

  const handlePaymentClick = () => setShowNewPayment(true);
  const handleClosePayment = () => setShowNewPayment(false);
  const handleViewDetails = (payment) => setSelectedPayment(payment);
  const handleCloseModal = () => setSelectedPayment(null);

  const tableHeaders = [
    { label: "Driver", key: "driver" },
    { label: "Statement", key: "statement" },
    { label: "Title", key: "title" },
    { label: "Description", key: "desciption" },
    { label: "Type", key: "type" },
    { label: "Amount", key: "amount" },
    { label: "Actions", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    statement: (
      <button onClick={() => handleViewDetails(item)} className="text-blue-500">
        {item.statement}
      </button>
    ),
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          className="w-8 h-8 rounded-md hover:bg-blue-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2"
          onClick={handlePaymentClick}
        />
        <Icons.X className="w-8 h-8 rounded-md hover:bg-red-800 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2" />
      </div>
    ),
  }));

  if (showNewPayment) {
    return <AddDriverPayment setShowNewPayment={handleClosePayment} />;
  }

  return (
    <div>
      <OutletHeading name="Driver Payments" />

      {/* Controls */}
      <div className="flex flex-col mt-4 justify-between sm:flex-row gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <button onClick={handlePaymentClick} className="btn btn-back">
            Add New
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

      {/* Tabs */}
      <div className="w-full overflow-x-auto mb-4">
        <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base px-2">
          {["Pending", "Completed", "Deleted"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-2 whitespace-nowrap transition-all duration-200 ${
                selectedTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-[var(--dark-gray)] hover:text-blue-500"
              }`}
            >
              {tab} ({statementsPayment[tab].length})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        showSearch={true}
        showRefresh={true}
        showDownload={true}
        showPagination={true}
        showSorting={true}
      />

      {/* Modal */}
      {selectedPayment && (
        <ViewPaymentModal data={selectedPayment} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default DriverPayments;
