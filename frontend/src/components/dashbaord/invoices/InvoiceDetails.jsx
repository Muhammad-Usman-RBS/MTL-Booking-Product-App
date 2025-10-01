import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useGetCompanyByIdQuery } from "../../../redux/api/companyApi";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import {
  useSendInvoiceEmailMutation,
  useUpdateInvoiceMutation,
} from "../../../redux/api/invoiceApi";
import InvoiceEmailModal from "./InvoiceEmailModal";

const InvoiceDetails = ({ item }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipient, setRecipient] = useState(item?.customer?.email || "");
  const [subject, setSubject] = useState(
    `Invoice ${item?.invoiceNumber} created`
  );
  const invoiceType = item?.invoiceType;

  // Determine user role
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
    return "clientadmin";
  };

  const userRole = getUserRole();

  const [updateInvoice] = useUpdateInvoiceMutation();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(item?.status);
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [sendInvoiceEmail] = useSendInvoiceEmailMutation();

  const { data: companyData } = useGetCompanyByIdQuery(companyId, {
    skip: !companyId,
  });
  const company = companyData || {};

  const { data: bookingSettingData } = useGetBookingSettingQuery();
  const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
  const currencySymbol = currencySetting?.symbol || "£";

  const handleStatusUpdate = async () => {
    try {
      await updateInvoice({
        id: item._id,
        invoiceData: { status: selectedStatus },
      }).unwrap();
      setStatus(selectedStatus);
      toast.success(`Status updated to "${selectedStatus}"`);
    } catch (error) {
      toast.error("Failed to update invoice status.");
    }
  };

  const statusOption = ["Paid", "Unpaid"];

  if (!item) return null;
  const baseUrl = import.meta.env.DEV
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.VITE_PROD_BASE_URL;
  const invoiceUrl = `${baseUrl}/dashboard/invoices/edit/${item?._id}`;

  const handleDownload = () => {
    const element = document.getElementById("invoiceToDownload");
    element.classList.add("pdf-mode");

    const driverName =
      item.invoiceType === "driver" ? item?.driver?.name : item?.customer?.name;

    const dates = (item?.items || [])
      .map((i) => new Date(i.date))
      .filter((d) => !isNaN(d));

    let datePart = "";
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      const formatDate = (d) =>
        `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getFullYear()}`;

      if (minDate.getTime() === maxDate.getTime()) {
        datePart = formatDate(minDate);
      } else {
        datePart = `${formatDate(minDate)}_to_${formatDate(maxDate)}`;
      }
    }

    const fileName = `INV-${driverName}${datePart ? "/" + datePart : ""}.pdf`;

    setTimeout(() => {
      void element.offsetHeight;
      downloadPDF("invoiceToDownload", fileName);

      setTimeout(() => {
        element.classList.remove("pdf-mode");
      }, 500);
    }, 500);
  };

  const openModal = () => {
    const msg = `Dear ${item?.customer?.name || "Customer"
      },\n\nWe have prepared invoice <b>${item?.invoiceNumber
      }</b>.\n\nStatus: ${status}.\n\nView it here: <a href='${invoiceUrl}' target='_blank'>${invoiceUrl}</a>\n\nKind regards,\n${company?.companyName || "MTL Team"
      }`;

    setRecipient(item?.email);
    setSubject(`Invoice ${item?.invoiceNumber} created`);
    setMessage(msg);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    const toastId = toast.loading("Sending Email...");

    try {
      await sendInvoiceEmail({
        recipient,
        subject,
        message,
        invoiceId: item._id,
      }).unwrap();

      toast.update(toastId, {
        render: "Email sent successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setShowEmailModal(false);
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to send invoice email.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  const totalFare = item.items.reduce((acc, i) => acc + i.fare, 0);
  const totalTax = item.items.reduce(
    (acc, i) => acc + (i.totalAmount - i.fare),
    0
  );

  const effectiveTaxPercent =
    totalFare > 0 ? ((totalTax / totalFare) * 100).toFixed(2) : "0";
  const taxDisplay = totalTax > 0 ? `${effectiveTaxPercent}% Tax: ` : `Tax: `;
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 mt-8">
          <button
            onClick={handleDownload}
            className="icon-box icon-box-outline"
          >
            <Icons.Download size={16} />
          </button>
          {userRole === "clientadmin" && (
            <button onClick={openModal} className="icon-box icon-box-primary">
              <Icons.Mail size={16} />
            </button>
          )}
          {userRole === "clientadmin" ? (
            <div className="flex gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0">
              <div className="w-full sm:w-40">
                <SelectOption
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={statusOption}
                  width="full"
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={status === selectedStatus}
                className={`p-2.5 text-white rounded-md transition ${status === selectedStatus
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                  }`}
              >
                <Icons.Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center mt-2 sm:mt-0">
              <span
                className={`px-3 py-2 rounded-md text-sm font-medium ${status?.toLowerCase() === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}
              >
                Status: {status}
              </span>
            </div>
          )}
        </div>

        <div
          id="invoiceToDownload"
          style={{
            fontFamily: "Arial, sans-serif",
            maxWidth: "900px",
            margin: "20px auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "20px",
            background: "#f9fafb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {company?.profileImage && (
              <img
                src={company.profileImage}
                alt="Logo"
                style={{ height: "60px", marginBottom: "12px" }}
              />
            )}
            <h2 style={{ margin: "0 0 6px 0", fontWeight: "bold", fontSize: "22px", color: "#222" }}>
              INVOICE
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "stretch", // stretch so both sides equal height
              gap: "40px",
              flexWrap: "wrap",
              borderBottom: "2px solid #333",
              paddingTop: "10px",
              paddingBottom: "10px",
              marginBottom: "20px",
              background: "#fafafa",
              borderRadius: "6px",
              minHeight: "200px", // enforce equal height
            }}
          >
            {/* Left Side - Company Info */}
            <div
              style={{
                flex: "1",
                minWidth: "250px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // distribute top/bottom
              }}
            >
              {/* TOP PART */}
              <div>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: "0 0 6px 0",
                    fontSize: "18px",
                    color: "#333",
                  }}
                >
                  {company?.companyName}
                </p>
                {item?.customer?.vatnumber && (
                  <p style={{ margin: "4px 0", fontSize: "13px", color: "#444" }}>
                    <b>VAT Number:</b> {item.customer.vatnumber}
                  </p>
                )}

                <div
                  style={{
                    margin: "8px 0",
                    fontSize: "13px",
                    color: "#444",
                    whiteSpace: "pre-line",
                    lineHeight: "1.5",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "bold",
                      margin: "0 0 6px 0",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    Address:
                  </p>
                  {`${company?.address || ""} 
${company?.city || ""} 
${company?.state || ""} 
${company?.zip || ""}`}
                </div>
              </div>

              {/* BOTTOM PART */}
              <div>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#333",
                  }}
                >
                  Website: {company?.website}
                </p>

                <a
                  href={`mailto:${company?.email}`}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontSize: "13px",
                    display: "block",
                    margin: "4px 0",
                  }}
                >
                  {company?.email}
                </a>

              <div style={{display: "flex", gap: "5px", alignItems: "center"}}>
                  <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#333",
                  }}
                >
                  Contact: 
                </p>
                <span style={{fontSize: "12px"}}>+{company?.contact}</span>
              </div>
              </div>
            </div>

            {/* Right Side - Invoice Info */}
            <div
              style={{
                flex: "1",
                minWidth: "220px",
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // distribute top/bottom
              }}
            >
              {/* TOP PART */}
              <div>
                <p
                  style={{
                    margin: "0 0 6px 0",
                    color: status?.toLowerCase() === "paid" ? "green" : "red",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {status}
                </p>

                <p style={{ margin: "4px 0", fontSize: "13px", color: "#444" }}>
                  #{item?.invoiceNumber}
                </p>
                <p style={{ margin: "4px 0", fontSize: "13px", color: "#444" }}>
                  Invoice Date: {new Date(item?.createdAt).toLocaleDateString()}
                </p>
                <p style={{ margin: "4px 0", fontSize: "13px", color: "#444" }}>
                  Due Date:{" "}
                  {item?.items?.[0]?.date
                    ? new Date(item.items[0].date).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              {/* BOTTOM PART (Bill To) */}
              <div>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: "12px 0 4px 0",
                    fontSize: "14px",
                    color: "#333",
                  }}
                >
                  Bill To
                </p>
                <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#444" }}>
                  {invoiceType === "driver" ? item?.driver?.name : item?.customer?.name}
                </p>
                <a
                  href={`mailto:${invoiceType === "driver" ? item?.driver?.email : item?.customer?.email
                    }`}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontSize: "13px",
                    display: "block",
                    margin: "4px 0",
                  }}
                >
                  {invoiceType === "driver"
                    ? item?.driver?.email
                    : item?.customer?.email}
                </a>
                <p style={{ margin: "4px 0", fontSize: "13px", color: "#444" }}>
                  {invoiceType === "driver"
                    ? item?.driver?.phone
                    : item?.customer?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", marginTop: "20px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <thead>
                <tr style={{ background: "#e0e7ff", color: "#1e3a8a" }}>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                      width: "50px",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "left",
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                      width: "120px",
                    }}
                  >
                    Tax
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "right",
                      width: "150px",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {item?.items?.map((ride, index) => (
                  <tr
                    key={ride.bookingId || index}
                    style={{
                      background: index % 2 === 0 ? "#f9fafb" : "#fff",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      index % 2 === 0 ? "#f9fafb" : "#fff")
                    }
                  >
                    <td
                      style={{
                        padding: "12px",
                        border: "1px solid #e5e7eb",
                        textAlign: "center",
                        color: "#374151",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        border: "1px solid #e5e7eb",
                        textAlign: "left",
                        color: "#374151",
                      }}
                    >
                      <b style={{ fontSize: "14px", color: "#111827" }}>{ride.bookingId}</b>
                      <br />
                      <b style={{ fontSize: "12px", color: "#1e3a8a" }}>Pickup:</b>&nbsp;
                      <small style={{ color: "#555", fontSize: "12px" }}>{ride.pickup}</small>
                      <br />
                      <b style={{ fontSize: "12px", color: "#1e3a8a" }}>Dropoff:</b>&nbsp;
                      <small style={{ color: "#555", fontSize: "12px" }}>{ride.dropoff}</small>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        border: "1px solid #e5e7eb",
                        textAlign: "center",
                        color: "#374151",
                      }}
                    >
                      {(() => {
                        const taxAmount = ride.totalAmount - ride.fare;
                        const taxPercent = (taxAmount / ride.fare) * 100;
                        if (!ride.fare || taxAmount <= 0) return "No Tax";
                        return `${taxPercent.toFixed(0)}%`;
                      })()}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        border: "1px solid #e5e7eb",
                        textAlign: "right",
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {currencySymbol}
                      {ride.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "350px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                background: "#f9fafb",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {/* Sub Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  background: "#f3f4f6",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontSize: "14px", color: "#374151" }}>Sub Total</span>
                <b style={{ fontSize: "14px", color: "#111827" }}>
                  {currencySymbol}
                  {totalFare.toFixed(2)}
                </b>
              </div>

              {/* Tax */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  background: "#f3f4f6",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontSize: "14px", color: "#374151" }}>Tax</span>
                <span style={{ fontSize: "14px", color: "#111827" }}>
                  {currencySymbol}
                  {totalTax.toFixed(2)}
                </span>
              </div>

              {/* Grand Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "#e0e7ff",
                  color: "#1e3a8a",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                <span>Grand Total</span>
                <span>
                  {currencySymbol}
                  {item.items.reduce((acc, i) => acc + i.totalAmount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>


          {/* Notes */}
          <div
            style={{
              marginTop: "30px",
              borderTop: "1px solid #ddd",
              paddingTop: "10px",
              fontSize: "13px",
            }}
          >
            <p style={{ fontWeight: "bold", margin: 0 }}>Notes</p>
            <p style={{ margin: "5px 0", color: "#666" }}>
              T&Cs apply. Please call for detail.
            </p>
          </div>
        </div>

      </div>

      {userRole === "clientadmin" && (
        <CustomModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          heading="Send Invoice"
        >
          <InvoiceEmailModal
            recipient={recipient}
            subject={subject}
            message={message}
            onChangeRecipient={(e) => setRecipient(e.target.value)}
            onChangeSubject={(e) => setSubject(e.target.value)}
            onChangeMessage={(e) => setMessage(e.target.value)}
            onSend={handleSendEmail}
          />
        </CustomModal>
      )}
    </>
  );
};

export default InvoiceDetails;
