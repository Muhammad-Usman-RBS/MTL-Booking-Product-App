import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoicesData } from "../../../constants/dashboardTabsData/data";
import InvoiceDetails from "./InvoiceDetails";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [expandedInvoice, setExpandedInvoice] = useState(null);

  const handleInvoiceClick = (invoiceNo) => {
    setExpandedInvoice((prev) => (prev === invoiceNo ? null : invoiceNo));
  };

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

  const tableData = (
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage)
  ).map((item) => ({
    ...item,
    invoiceNo: (
      <span
        className="text-blue-600 font-medium hover:underline cursor-pointer"
        onClick={() => handleInvoiceClick(item.invoiceNo)}
      >
        {item.invoiceNo}
      </span>
    ),
    amount: `£${item.amount}`,
    status: (
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
    ),
  }));

  return (
    <div>
      <OutletHeading name="Invoices List" />

      <Link to="/dashboard/invoices/new" className="w-full sm:w-auto">
        <button className="btn btn-reset flex items-center gap-2 w-full mb-3 sm:w-auto justify-center">
          Create New Invoice
        </button>
      </Link>

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        showSearch={true}
        showRefresh={true}
        showDownload={true}
        showPagination={true}
        showSorting={true}
      />

      {expandedInvoice && (
        <InvoiceDetails
          item={invoicesData.find((i) => i.invoiceNo === expandedInvoice)}
        />
      )}
    </div>
  );
};

export default InvoicesList;
