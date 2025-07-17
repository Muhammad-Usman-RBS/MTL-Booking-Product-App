import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoicesData } from "../../../constants/dashboardTabsData/data";
import InvoiceDetails from "./InvoiceDetails";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useGetAllInvoicesQuery } from "../../../redux/api/invoiceApi";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useGetAllInvoicesQuery();
  const invoices = data?.invoices || [];
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [expandedInvoice, setExpandedInvoice] = useState(null);

  const handleInvoiceClick = (invoiceNo) => {
    setExpandedInvoice((prev) => (prev === invoiceNo ? null : invoiceNo));
  };
  const filteredData = invoices.filter((invoice) => {
    const query = search.toLowerCase();

    const invoiceNo = invoice.invoiceNumber?.toLowerCase() || "";
    const customerName = invoice.customer?.name || "-";
    const account = invoice.companyId?.toString() || "";

    return (
      invoiceNo.includes(query) ||
      customerName.includes(query) ||
      account.includes(query)
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

  const paginatedInvoices =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  const tableData = !filteredData.length
    ? EmptyTableMessage({
        message: "No invoices available. Create a new one.",
        colSpan: tableHeaders.length,
      })
    : paginatedInvoices.map((invoice) => {
        const invoiceNo = invoice.invoiceNumber || "-";
        const customerName = invoice.customers?.[0]?.name || "-";
        const account = invoice.companyId || "-";
        const date = new Date(invoice.createdAt).toLocaleDateString() || "-";
        const dueDate = invoice.dueDate
          ? new Date(invoice.dueDate).toLocaleDateString()
          : "-";
        const amount =
          invoice.items?.reduce((sum, item) => sum + item.totalAmount, 0) || 0;
        const status = invoice.status ;

        return {
          invoiceNo: (
            <span
              className="text-blue-600 font-medium hover:underline cursor-pointer"
              onClick={() => handleInvoiceClick(invoiceNo)}
            >
              {invoiceNo}
            </span>
          ),
          customer: customerName,
          account,
          date,
          dueDate,
          amount: `£${amount.toFixed(2)}`,
          status: (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                status === "paid"
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {status}
            </span>
          ),
        };
      });

  if (isLoading) return <p>Loading invoices...</p>;
  if (isError) return <p>Failed to load invoices.</p>;

  const exportTableData = (
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage)
  ).map((item) => ({
    invoiceNo: item.invoiceNo,
    customer: item.customer,
    account: item.account,
    date: item.date,
    dueDate: item.dueDate,
    amount: `£${item.amount}`,
    status: item.status,
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
        exportTableData={exportTableData}
        showSearch={true}
        showRefresh={true}
        showDownload={true}
        showPagination={true}
        showSorting={true}
      />

      {expandedInvoice && (
        <InvoiceDetails
          item={invoices.find((i) => i.invoiceNumber === expandedInvoice)}
        />
      )}
    </div>
  );
};

export default InvoicesList;
