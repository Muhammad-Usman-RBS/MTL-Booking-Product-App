import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import InvoiceDetails from "./InvoiceDetails";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useDeleteInvoiceByIdMutation,
  useGetAllInvoicesQuery,
  useUpdateInvoiceMutation,
} from "../../../redux/api/invoiceApi";
import Icons from "../../../assets/icons";
import { toast } from "react-toastify";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useSelector } from "react-redux";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { useLoading } from "../../common/LoadingProvider";

const InvoicesList = () => {
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const { showLoading, hideLoading } = useLoading();

  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useGetAllInvoicesQuery();
  const [updateInvoice] = useUpdateInvoiceMutation();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);
  // currency from booking settings
  const { data: bookingSettingData } = useGetBookingSettingQuery();
  const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
  const currencySymbol = currencySetting?.symbol || "£";

  // Check if customer has VAT (keeping existing logic)
  const isCustomerWithVat =
    (user?.role === "customer" || user?.roles?.includes("customer")) &&
    Boolean(user?.vatnumber || user?.customer?.vatnumber);

  // Read requested mode from URL
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const requestedMode = (() => {
    const m = qs.get("mode");
    if (!m) return null;
    if (m.toLowerCase() === "driver") return "Driver";
    if (m.toLowerCase() === "customer") return "Customer";
    return null;
  })();

  // Role-based default
  const baseInitialMode = (() => {
    if (userRole === "driver") return "Driver";
    if (userRole === "customer") return "Customer";
    return "Customer"; // clientadmin default
  })();

  // FINAL initial mode: URL > role default (VAT guard)
  const [invoiceMode, setInvoiceMode] = useState(() => {
    if (userRole === "clientadmin" && requestedMode) {
      if (requestedMode === "Driver" && isCustomerWithVat) return "Customer";
      return requestedMode;
    }
    return baseInitialMode;
  });

  // Guarded role-based enforcement (don't override URL unless invalid)
  useEffect(() => {
    if (userRole === "driver" && invoiceMode !== "Driver") {
      setInvoiceMode("Driver");
    } else if (userRole === "customer" && invoiceMode !== "Customer") {
      setInvoiceMode("Customer");
    } else if (userRole === "clientadmin") {
      if (isCustomerWithVat && invoiceMode === "Driver") {
        setInvoiceMode("Customer");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isCustomerWithVat]);

  const getTabs = () => {
    if (userRole === "driver" || userRole === "customer") {
      return [];
    }
    return ["Customer", ...(isCustomerWithVat ? [] : ["Driver"])];
  };

  const tabs = getTabs();
  const showTabs = tabs.length > 1;
  const invoices = data?.invoices || [];

  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [deleteInvoiceById] = useDeleteInvoiceByIdMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
  const [scrollToInvoice, setScrollToInvoice] = useState(false);
  const [perPage, setPerPage] = useState(5);

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
    if (userRole === "driver") {
      const driverEmail = user?.email;
      const invoiceDriverEmail = invoice.driver?.email;
      if (
        !driverEmail ||
        !invoiceDriverEmail ||
        driverEmail !== invoiceDriverEmail
      ) {
        return false;
      }
    }

    if (userRole === "customer") {
      const customerEmail = user?.email;
      const invoiceCustomerEmail = invoice?.customer?.email;
      if (
        !customerEmail ||
        !invoiceCustomerEmail ||
        customerEmail.toLowerCase() !== invoiceCustomerEmail.toLowerCase()
      ) {
        return false;
      }
    }
    const query = search.toLowerCase();
    const invoiceNo = invoice.invoiceNumber?.toLowerCase() || "";
    const customerName = invoice.customer?.name || "-";
    const driverName = invoice.driver?.name || "-";
    const source = invoice.items?.[0]?.source || "-";

    return (
      invoiceNo.includes(query) ||
      customerName.toLowerCase().includes(query) ||
      driverName.toLowerCase().includes(query) ||
      source.toLowerCase().includes(query)
    );
  });

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
    ...(userRole === "clientadmin"
      ? [{ label: "Actions", key: "actions" }]
      : []),
  ];
  const tableData = filteredData.map((invoice) => {
    const invoiceNo = invoice.invoiceNumber || "-";
    const customerOrDriverName =
      invoiceMode === "Driver"
        ? invoice.driver?.name
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
      [invoiceMode === "Driver" ? "driver" : "customer"]: customerOrDriverName,
      source,
      date,
      dueDate,
      amount: `${currencySymbol}${amount.toFixed(2)}`,
      status:
        userRole === "clientadmin" ? (
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
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              status === "Paid"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        ),

      // Only include actions for clientadmin
      ...(userRole === "clientadmin"
        ? {
            actions: (
              <>
                <div>
                  <div className="flex gap-2">
                    <Link
                      className="icon-box icon-box-warning"
                      to={`/dashboard/invoices/edit/${invoice._id}`}
                    >
                      <Icons.SquarePen className="size-4 " />
                    </Link>
                    <div className="icon-box icon-box-danger">
                      <Icons.Trash
                        onClick={() => handleDeleteClick(invoice._id)}
                        className="size-4 "
                      />
                    </div>
                  </div>
                </div>
              </>
            ),
          }
        : {}),
    };
  });

  if (isLoading) return <p>Loading invoices...</p>;
  if (isError) return <p>Failed to load invoices.</p>;

  const exportTableData = filteredData.map((item) => {
    const name =
      invoiceMode === "Driver"
        ? item?.driver?.name || "-"
        : item?.customer?.name || "-";
  
    const amount =
      item.items?.reduce((sum, i) => sum + (i.totalAmount || 0), 0) || 0;
  
    return {
      invoiceNo: item.invoiceNumber,
      [invoiceMode === "Driver" ? "driver" : "customer"]: name, // ✅ dynamic
      account: item.items?.[0]?.source || "-",
      date: item.invoiceDate
        ? new Date(item.invoiceDate).toLocaleDateString("en-GB")
        : "-",
      dueDate: item.items?.[0]?.date
        ? new Date(item.items[0].date).toLocaleDateString("en-GB")
        : "-",
      amount: `${currencySymbol}${amount.toFixed(2)}`,
      status: item.status,
    };
  });
  

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

  // Button label & link based on active mode; only for clientadmin
  const createBtn =
    invoiceMode === "Customer"
      ? {
          label: "New Customer Invoice",
          to: "/dashboard/invoices/customer/new",
        }
      : { label: "New Driver Invoice", to: "/dashboard/invoices/driver/new" };

  const canShowCreate = userRole === "clientadmin";

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
        )}

        <CustomTable
          filename={`${invoiceMode}-Invoices-list`}
          emptyMessage="No invoices Found"
          tableHeaders={tableHeaders}
          tableData={tableData}
          exportTableData={exportTableData}
          showSearch={true}
          showRefresh={true}
          showDownload={true}
          showPagination={true}
          showSorting={true}
          search={search}
          setSearch={setSearch}
        />

        {expandedInvoice && (
          <InvoiceDetails
            item={invoices.find((i) => i.invoiceNumber === expandedInvoice)}
          />
        )}
      </div>

      {canShowCreate && (
        <div className="mt-5 flex justify-end">
          <Link to={createBtn.to} className="btn btn-edit">
            {createBtn.label}
          </Link>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default InvoicesList;
