import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InvoiceDetails from "./InvoiceDetails";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useDeleteInvoiceByIdMutation, useGetAllInvoicesQuery, useUpdateInvoiceMutation } from "../../../redux/api/invoiceApi";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";
import Icons from "../../../assets/icons";
import { toast } from "react-toastify";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useSelector } from "react-redux";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useGetAllInvoicesQuery();
  const [updateInvoice] = useUpdateInvoiceMutation();
  const user = useSelector((state) => state.auth.user);

   // currency from booking settings
  const { data: bookingSettingData } = useGetBookingSettingQuery();
  const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
  const currencySymbol = currencySetting?.symbol || "£";
  const currencyCode = currencySetting?.value || "GBP";

  // Determine user role and appropriate mode
  const getUserRole = () => {
    if (user?.role === "driver" || user?.roles?.includes("driver")) {
      return "driver";
    }
    if (user?.role === "customer" || user?.roles?.includes("customer")) {
      return "customer";
    }
    if (user?.role === "clientadmin" || user?.roles?.includes("clientadmin")) {
      return "clientadmin";
    }
    return "clientadmin"; // default fallback
  };

  const userRole = getUserRole();

  // Set initial invoice mode based on user role
  const getInitialInvoiceMode = () => {
    if (userRole === "driver") return "Driver";
    if (userRole === "customer") return "Customer";
    return "Customer"; // default for clientadmin
  };

  const [invoiceMode, setInvoiceMode] = useState(getInitialInvoiceMode());

  // Check if customer has VAT (keeping existing logic)
  const isCustomerWithVat =
    (user?.role === "customer" || user?.roles?.includes("customer")) &&
    Boolean(user?.vatnumber || user?.customer?.vatnumber);

  // Update invoice mode based on user role
  useEffect(() => {
    if (userRole === "driver") {
      setInvoiceMode("Driver");
    } else if (userRole === "customer") {
      setInvoiceMode("Customer");
    }
    // For clientadmin, keep the current mode or default to Customer
  }, [userRole]);

  // Force mode to Customer if customer with VAT tries to access Driver mode
  useEffect(() => {
    if (isCustomerWithVat && invoiceMode === "Driver") {
      setInvoiceMode("Customer");
    }
  }, [isCustomerWithVat, invoiceMode]);

  // Define tabs based on user role
  const getTabs = () => {
    if (userRole === "driver" || userRole === "customer") {
      return []; // No tabs for driver or customer
    }
    // For clientadmin, show tabs but respect VAT restrictions
    return ["Customer", ...(isCustomerWithVat ? [] : ["Driver"])];
  };

  const tabs = getTabs();
  const showTabs = tabs.length > 1; // Only show tabs if there are multiple options

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
    // Only show Actions column for clientadmin
    ...(userRole === "clientadmin" ? [{ label: "Actions", key: "actions" }] : []),
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
        // amount: `£${amount.toFixed(2)}`,
        amount: `${currencySymbol}${amount.toFixed(2)}`,
        status: userRole === "clientadmin" ? (
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
        ) : (
          // Show only text for customer and driver roles
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${status === "Paid"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}>
            {status}
          </span>
        ),

        // Only include actions for clientadmin
        ...(userRole === "clientadmin" ? {
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
          )
        } : {}),
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
    // amount: `£${item.amount}`,
    amount: `${currencySymbol}${item.amount}`,
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

        {/* Only show tabs for clientadmin with multiple options */}
        {showTabs && (
          <div className="flex items-center justify-center mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setInvoiceMode(tab)}
                className={`px-6 py-2 font-semibold text-sm border cursor-pointer ${invoiceMode === tab
                    ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
                    : "bg-[#f9fafb] text-gray-700 border-gray-300"
                  } ${tab === "Customer" ? "rounded-l-md" : "rounded-r-md"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

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