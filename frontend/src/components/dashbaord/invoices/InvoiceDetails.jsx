import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useGetCompanyByIdQuery } from "../../../redux/api/companyApi";
import {
  useSendInvoiceEmailMutation,
  useUpdateInvoiceMutation,
} from "../../../redux/api/invoiceApi";
import InvoiceEmailModal from "./InvoiceEmailModal";

const InvoiceDetails = ({ item }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipient, setRecipient] = useState(item?.customer?.email || "");
  const [subject, setSubject] = useState(
    `Invoice ${item?.invoiceNumber} created`
  );
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(item?.status);
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [sendInvoiceEmail] = useSendInvoiceEmailMutation();

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const { data: companyData } = useGetCompanyByIdQuery(companyId, {
    skip: !companyId,
  });
  const company = companyData || {};
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

  const statusOption = ["paid", "unpaid"];

  if (!item) return null;

  const isDev = process.env.NODE_ENV !== "production";
  const invoiceUrl = `${
    isDev ? "http://localhost:3000" : "https://www.megatransfers.com"
  }/dashboard/invoices/edit/${item?._id}`;

  const handleDownload = () => {
    setTimeout(() => {
      const element = document.getElementById("invoiceToDownload");
      if (!element) {
        toast.error("Invoice element not found!");
        return;
      }

      void element.offsetHeight;

      downloadPDF("invoiceToDownload", `Invoice-${item?.invoiceNumber}.pdf`);
    }, 500);
  };

  const openModal = () => {
    const msg = `Dear ${
      item?.customer?.name || "Customer"
    },\n\nWe have prepared invoice <b>${
      item?.invoiceNumber
    }</b>.\n\nStatus: ${status}.\n\nView it here: <a href='${invoiceUrl}' target='_blank'>${invoiceUrl}</a>\n\nKind regards,\n${
      company?.companyName || "MTL Team"
    }`;

    setRecipient(item?.email);
    setSubject(`Invoice ${item?.invoiceNumber} created`);
    setMessage(msg);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    try {
      await sendInvoiceEmail({
        recipient,
        subject,
        message,
        invoiceId: item._id,
      }).unwrap();

      toast.success("Email sent successfully!");
      setShowEmailModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send invoice email.");
    }
  };

  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 mt-8">
          {/* Edit Button */}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2.5 cursor-pointer bg-[var(--dark-gray)] text-white rounded-md hover:bg-gray-700 transition"
          >
            <Icons.Download size={16} />
          </button>

          {/* Mail Button */}
          <button
            onClick={openModal}
            className="p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Icons.Mail size={16} />
          </button>

          {/* Delete Button */}

          {/* Status Select + Tick */}
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
              className={`p-2.5 text-white rounded-md transition ${
                status === selectedStatus
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              <Icons.Check size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Display */}
        <div
          id="invoiceToDownload"
          style={{
            padding: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#F1EFEF",
            fontSize: "14px",
            marginTop: "16px",
            maxWidth: "100%",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: "20px",
              gap: "24px",
            }}
          >
            <div className="company-info">
              <img
                src={IMAGES.dashboardLargeLogo}
                alt="Logo"
                style={{ height: "40px", marginBottom: "8px" }}
              />
              <p style={{ fontWeight: "600" }}>{company.companyName}</p>
              <p>VAT Number - 442612419 </p>
              <p>
                {[company.address, company.city, company.state, company.zip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>Website: {company.website}</p>
              <a
                href={`mailto:${company.email}`}
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  wordBreak: "break-word",
                }}
              >
                {company.email}
              </a>
              <p>Contact: {company.contactName}</p>
            </div>

            <div className="invoice-info">
              <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>INVOICE</h2>
              <p
                style={{
                  padding: "3px 10px",
                  display: "inline-block",
                  color: "#fff",
                  fontSize: "12px",
                  borderRadius: "40px",
                  backgroundColor:
                    item?.status === "paid" ? "#15803d" : "#6b7280",
                }}
              >
                {item?.status}
              </p>
              <p style={{ color: "#6b7280" }}>#{item?.invoiceNumber}</p>
              <p>
                Invoice Date: {new Date(item?.createdAt).toLocaleDateString()}
              </p>
              <p>
                Invoice Date: {new Date(item?.createdAt).toLocaleDateString()}
              </p>
              <p>
                Due Date:{" "}
                {item?.items?.[0]?.date
                  ? new Date(item.items[0].date).toLocaleDateString()
                  : "-"}
              </p>

              <div style={{ fontWeight: "bold", marginTop: "10px" }}>
                <p>
                  <strong>Bill To</strong>
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontWeight: "500",
                  }}
                >
                  <span>{item.customer?.name}</span>
                  <a href={`mailto:${item.customer?.email}`}>
                    {item.customer?.email}
                  </a>
                  <span>{item.customer?.phone || ""}</span>
                </div>
              </div>
              <p>{item?.phone}</p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "12px",
              }}
            >
              <thead>
                <tr style={{ background: "black", color: "white" }}>
                  <th
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Tax
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.items.map((ride, index) => (
                  <tr key={ride.bookingId || index}>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        verticalAlign: "top",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        verticalAlign: "top",
                      }}
                    >
                      {ride.bookingId}
                      <br />
                      <small>
                        Pickup: {ride.pickup}, Dropoff: {ride.dropoff}
                      </small>
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        verticalAlign: "top",
                      }}
                    >
                      {ride.tax}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        verticalAlign: "top",
                      }}
                    >
                      £{ride.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: "right", marginTop: "16px" }}>
            <p>
              Sub Total: £
              {item.items.reduce((acc, i) => acc + i.fare, 0).toFixed(2)}
            </p>
            <p>
              Total Tax: £
              {item.items
                .reduce((acc, i) => acc + (i.totalAmount - i.fare), 0)
                .toFixed(2)}
            </p>
            <p style={{ fontWeight: "bold" }}>
              Grand Total: £
              {item.items.reduce((acc, i) => acc + i.totalAmount, 0).toFixed(2)}
            </p>
          </div>

          <div
            style={{
              marginTop: "16px",
              borderTop: "1px solid #ccc",
              paddingTop: "8px",
            }}
          >
            <p style={{ fontWeight: "600" }}>Notes</p>
            <p style={{ color: "#4b5563", fontSize: "13px" }}>
              T&Cs apply. Please call for detail.
            </p>
          </div>
        </div>
      </div>

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
    </>
  );
};

// Table Styles
const thStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  verticalAlign: "top",
};

const subInfoStyle = {
  color: "#6B7280",
  fontSize: "12px",
  margin: 0,
};

export default InvoiceDetails;
