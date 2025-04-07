import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoicesData } from "../../../constants/invoicestab/invoicesData";
import Icons from "../../../assets/icons";
import InvoiceDetails from "./InvoiceDetails";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [expandedInvoice, setExpandedInvoice] = useState(null);

  const handleInvoiceClick = (invoiceNo) => {
    setExpandedInvoice((prev) => (prev === invoiceNo ? null : invoiceNo));
  };

  const itemsPerPageOptions = [5, 10, 20, "All"];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <Icons.ArrowDownUp className="inline w-4 h-4 ml-1 text-gray-400" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <Icons.ArrowDownUp className="inline w-4 h-4 ml-1 text-gray-600" />
    ) : (
      <Icons.ArrowDownUp className="inline w-4 h-4 ml-1 text-gray-600" />
    );
  };

  const filteredData = invoicesData.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.invoiceNo.toLowerCase().includes(query) ||
      item.customer.toLowerCase().includes(query) ||
      item.account.toLowerCase().includes(query)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
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

  const tableHeaders = [
    { label: "Invoice", key: "invoiceNo" },
    { label: "Customer", key: "customer" },
    { label: "Account", key: "account" },
    { label: "Date", key: "date" },
    { label: "Due Date", key: "dueDate" },
    { label: "Amount", key: "amount" },
    { label: "Status", key: "status" },
  ];

  return (
    <div className="ps-2 pe-2 md:ps-6 md:pe-6">
      <h2 className="text-2xl font-bold mb-4">Invoices List</h2>
      <hr className="mb-6" />

      <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-6 mb-4">
        <Link to="/dashboard/new-invoice" className="w-full sm:w-auto">
          <button className="btn btn-reset flex items-center gap-2 w-full sm:w-auto justify-center">
            Create New Invoice
          </button>
        </Link>

        <input
          type="text"
          placeholder="Search"
          className="border rounded border-gray-300 px-3 py-2 w-full sm:w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="p-4 space-y-4">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-[900px] md:min-w-full table-fixed border border-gray-200 text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                {tableHeaders.map((col) => (
                  <th
                    key={col.key}
                    className="border px-2 py-2 text-left cursor-pointer select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {getSortIcon(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border hover:bg-gray-50 transition">
                  <td
                    className="px-2 py-2 text-blue-600 font-medium hover:underline cursor-pointer"
                    onClick={() => handleInvoiceClick(item.invoiceNo)}
                  >
                    {item.invoiceNo}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.customer}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.account}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    {item.dueDate}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap font-semibold">
                    £{item.amount}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === "Paid"
                          ? "bg-green-500 text-white"
                          : item.status === "Unpaid"
                          ? "bg-gray-500 text-white"
                          : "bg-black text-white"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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

        {expandedInvoice && (
          <InvoiceDetails
            item={invoicesData.find((i) => i.invoiceNo === expandedInvoice)}
          />
        )}
      </div>
    </div>
  );
};

export default InvoicesList;
