import React, { useState, useEffect } from "react";
import { customersData } from "../../../constants/customerstab/customersData";
import Icons from "../../../assets/icons";
import ViewCustomer from "./ViewCustomer";
import EditCustomer from "./EditCustomer";
import NewCustomer from "./NewCustomer";

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

  return (
    <>
      <div className="ps-2 pe-2 md:ps-6 md:pe-6">
        <h2 className="text-2xl font-bold mb-4">Customer List</h2>
        <hr className="mb-4" />

        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
          <button
            onClick={() => setNewCustomer(true)}
            className="btn btn-reset flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Add New Customer
          </button>

          <input
            type="text"
            placeholder="Search"
            className="border rounded border-gray-300 px-3 py-2 w-full sm:w-60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base px-2">
            {tabOptions.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {tab} ({customersData.filter((c) => c.status === tab).length})
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-[900px] md:min-w-full table-fixed border border-gray-200 text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border px-2 py-2 text-left">No.</th>
                  <th className="border px-2 py-2 text-left">Name</th>
                  <th className="border px-2 py-2 text-left">Email</th>
                  <th className="border px-2 py-2 text-left">Last Login</th>
                  <th className="border px-2 py-2 text-left">Status</th>
                  <th className="border px-2 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="border hover:bg-gray-50 transition"
                    >
                      <td className="border px-2 py-2">{index + 1}</td>
                      <td className="border px-2 py-2">{item.name}</td>
                      <td className="border px-2 py-2">{item.email}</td>
                      <td className="border px-2 py-2">{item.lastLogin}</td>
                      <td className="border px-2 py-2">{item.status}</td>
                      <td className="border px-2 py-2">
                        <div className="flex gap-2">
                          <Icons.Eye
                            className="w-8 h-8 rounded-md hover:bg-blue-600 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2"
                            onClick={() => setSelectedCustomer(item)}
                          />
                          <Icons.Pencil
                            className="w-8 h-8 rounded-md hover:bg-yellow-600 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2"
                            onClick={() => setEditCustomer(item)}
                          />
                          <Icons.X className="w-8 h-8 rounded-md hover:bg-red-800 hover:text-white text-gray-600 cursor-pointer border border-gray-300 p-2" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 text-sm w-full">
            <div className="btn btn-outline w-full sm:w-auto text-center">
              Total Records: {filteredData.length}
            </div>

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
        </div>
      </div>

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
    </>
  );
};

export default CustomersList;
