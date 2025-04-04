import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoicesData } from "../../../constants/invoicestab/invoicesData";
import Icons from "../../../assets/icons";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalRecords, setTotalRecords] = useState(invoicesData.length);

  const itemsPerPageOptions = [5, 10, 20, "All"];

  const filteredData = invoicesData.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.invoiceNo.toLowerCase().includes(query) ||
      item.customer.toLowerCase().includes(query) ||
      item.account.toLowerCase().includes(query)
    );
  });

  const totalPages =
    perPage === "All" ? 1 : Math.ceil(filteredData.length / perPage);

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setTotalRecords(filteredData.length);
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage]);

  return (
    <>
      <div className="ps-2 pe-2 md:ps-6 md:pe-6">
        <h2 className="text-2xl font-bold mb-4">Invoices List</h2>
        <hr className="mb-6" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-6">
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
                <th className="border px-2 py-2 text-left">Invoice</th>
                <th className="border px-2 py-2 text-left">Customer</th>
                <th className="border px-2 py-2 text-left">Account</th>
                <th className="border px-2 py-2 text-left">Date</th>
                <th className="border px-2 py-2 text-left">Due Date</th>
                <th className="border px-2 py-2 text-left">Amount</th>
                <th className="border px-2 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border hover:bg-gray-50 transition">
                  <td className="px-2 py-2 text-blue-600 font-medium hover:underline cursor-pointer">
                    {item.invoiceNo}
                  </td>
                  <td className="border px-2 py-2 whitespace-nowrap flex items-center gap-2">
                    <span>{item.customer}</span>
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
            Total Records: {totalRecords}
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
    </>
  );
};

export default InvoicesList;
