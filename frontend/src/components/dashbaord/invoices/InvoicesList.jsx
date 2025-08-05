import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InvoiceDetails from "./InvoiceDetails";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useDeleteInvoiceByIdMutation,
  useGetAllInvoicesQuery,
  useUpdateInvoiceMutation,
} from "../../../redux/api/invoiceApi";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";
import Icons from "../../../assets/icons";
import { toast } from "react-toastify";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useGetAllInvoicesQuery();
  const [invoiceMode, setInvoiceMode] = useState("Customer");
  const [updateInvoice] = useUpdateInvoiceMutation();

  const invoices = data?.invoices || [];
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [deleteInvoiceById] = useDeleteInvoiceByIdMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
  const [scrollToInvoice, setScrollToInvoice] = useState(false);

  const handleInvoiceClick = (invoiceNo) => {
    setExpandedInvoice((prev) => (prev === invoiceNo ? null : invoiceNo));
    setScrollToInvoice(true);
  };
  useEffect(() => {
    if (scrollToInvoice) {
      const timeout = setTimeout(() => {
        const target = document.getElementById("invoiceToDownload");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setScrollToInvoice(false);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [expandedInvoice, scrollToInvoice]);
  const filteredData = invoices.filter((invoice) => {
    if (invoice.invoiceType?.toLowerCase() !== invoiceMode.toLowerCase())
      return false;
    const query = search.toLowerCase();
    const invoiceNo = invoice.invoiceNumber?.toLowerCase() || "";
    const customerName = invoice.customer?.name || "-";
    const source = invoice.items?.[0]?.source || "-";

    return (
      invoiceNo.includes(query) ||
      customerName.includes(query) ||
      source.includes(query)
    );
  });

  const totalPages =
    perPage === "All" ? 1 : Math.ceil(filteredData.length / perPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage]);

  const tableHeaders = [
    { label: "Invoice", key: "invoiceNo" },
    {
      label: invoiceMode === "Driver" ? "Driver" : "Customer",
      key: invoiceMode === "Driver" ? "driver" : "customer",
    },
    { label: "Account", key: "source" },
    { label: "Date", key: "date" },
    { label: "Due Date", key: "dueDate" },
    { label: "Amount", key: "amount" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
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
        const customerOrDriverName =
          invoiceMode === "Driver"
            ? invoice.driver?.name ||
              invoice.driver?.DriverData?.firstName ||
              "-"
            : invoice.customer?.name || "-";
        const source = invoice.items?.[0]?.source || "-";
        const date = new Date(invoice.invoiceDate).toLocaleDateString() || "-";
        const dueDate = invoice.items?.[0]?.date
          ? new Date(invoice.items[0].date).toLocaleDateString()
          : "-";
        const amount =
          invoice.items?.reduce((sum, item) => sum + item.totalAmount, 0) || 0;
        const status = invoice.status;

        return {
          invoiceNo: (
            <span
              className="text-blue-600 font-medium hover:underline cursor-pointer"
              onClick={() => handleInvoiceClick(invoiceNo)}
            >
              {invoiceNo}
            </span>
          ),
          [invoiceMode === "Driver" ? "driver" : "customer"]:
            customerOrDriverName,
          source,
          date,
          dueDate,
          amount: `£${amount.toFixed(2)}`,
          status: (
            <SelectOption
              value={status}
              options={["Paid", "Unpaid"]}
              onChange={async (e) => {
                const newStatus = e.target.value;
                try {
                  await updateInvoice({
                    id: invoice._id,
                    invoiceData: { status: newStatus },
                  }).unwrap();
                  toast.success(`Status updated to "${newStatus}"`);
                  refetch();
                } catch (err) {
                  toast.error("Failed to update status");
                }
              }}
            />
          ),

          actions: (
            <>
              <div>
                <div className="flex gap-2">
                  <Link to={`/dashboard/invoices/edit/${invoice._id}`}>
                    <Icons.SquarePen className="w-8 h-8 rounded-md hover:bg-yellow-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2" />
                  </Link>
                  <Icons.Trash
                    onClick={() => handleDeleteClick(invoice._id)}
                    className="w-8 h-8 rounded-md hover:bg-red-800 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2"
                  />
                </div>
              </div>
            </>
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

  const handleDeleteClick = (id) => {
    setDeleteInvoiceId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteInvoiceId) {
        await deleteInvoiceById(deleteInvoiceId);
        toast.success("Invoice Deleted Successfully");
        refetch();
      }
    } catch (error) {
      console.error("Error deleting invoice", error);
      toast.error("Failed to delete invoice");
    } finally {
      setDeleteModalOpen(false);
      setDeleteInvoiceId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteInvoiceId(null);
  };
  return (
    <>
      <div>
        <OutletHeading name="Invoices List" />

        <div className="flex items-center justify-center mb-4">
          {["Customer", "Driver"].map((tab) => (
            <button
              key={tab}
              onClick={() => setInvoiceMode(tab)}
              className={`px-6 py-2 font-semibold text-sm border cursor-pointer ${
                invoiceMode === tab
                  ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
                  : "bg-[#f9fafb] text-gray-700 border-gray-300"
              } ${tab === "Customer" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {tab}
            </button>
          ))}
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

        {expandedInvoice && (
          <InvoiceDetails
            item={invoices.find((i) => i.invoiceNumber === expandedInvoice)}
          />
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default InvoicesList;
