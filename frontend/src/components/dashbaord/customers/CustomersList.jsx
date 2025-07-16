import React, { useState, useEffect } from "react";
import { customersData } from "../../../constants/dashboardTabsData/data";
import Icons from "../../../assets/icons";
import ViewCustomer from "./ViewCustomer";
import EditCustomer from "./EditCustomer";
import NewCustomer from "./NewCustomer";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";

const tabOptions = [
  "Active",
  "Suspended",
  "Pending",
  "Deleted",
  "Delete Pending",
];

const CustomersList = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState(null);

  const itemsPerPageOptions = [5, 10, 20, "All"];

  const filteredTabData = customersData.filter(
    (item) => item.status === activeTab
  );

  const filteredData = filteredTabData.filter((item) => {
    const query = search.toLowerCase();
    return (
      item?.name?.toLowerCase().includes(query) ||
      item?.email?.toLowerCase().includes(query)
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

  const tableHeaders = [
    { label: "No.", key: "index" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Last Login", key: "lastLogin" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const tableData = paginatedData.map((item, index) => ({
    ...item,
    index:
      (page - 1) * (perPage === "All" ? filteredData.length : perPage) +
      index +
      1,
    actions: (
      <div className="flex gap-2">
        <Icons.Eye
          className="w-8 h-8 rounded-md hover:bg-blue-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-gray-300 p-2"
          onClick={() => setSelectedCustomer(item)}
        />
        <Icons.Pencil
          className="w-8 h-8 rounded-md hover:bg-yellow-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-gray-300 p-2"
          onClick={() => setEditCustomer(item)}
        />
        <Icons.X className="w-8 h-8 rounded-md hover:bg-red-800 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-gray-300 p-2" />
      </div>
    ),
  }));

  return (
    <div>
      <OutletHeading name="Customer List" />

      <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
        <button
          onClick={() => setNewCustomer(true)}
          className="btn btn-reset flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          Add New Customer
        </button>
      </div>

      <div className="w-full overflow-x-auto mb-4">
        <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base px-2">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-[var(--dark-gray)] hover:text-blue-500"
              }`}
            >
              {tab} ({customersData.filter((c) => c.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        showPagination={true}
        showSorting={true}
        currentPage={page}
        setCurrentPage={setPage}
        perPage={perPage}
      />

      {selectedCustomer && (
        <ViewCustomer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {editCustomer && (
        <EditCustomer
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
        />
      )}

      {newCustomer && (
        <NewCustomer
          isOpen={newCustomer}
          onClose={() => setNewCustomer(null)}
        />
      )}
    </div>
  );
};

export default CustomersList;
