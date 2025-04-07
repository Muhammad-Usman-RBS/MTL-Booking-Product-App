import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IMAGES from "../../../assets/images";
import CustomModal from "../../../constants/CustomModal";
import InvoiceEmailModal from "./InvoiceEmailModal";
import SelectOption from "../../../constants/SelectOption";
import Icons from "../../../assets/icons";
import { Link } from "react-router-dom";

const InvoiceDetails = ({ item }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipient, setRecipient] = useState(item?.email || "");
  const [subject, setSubject] = useState(`Invoice ${item?.invoiceNo} created`);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(item?.status || "UnPaid");
  const [selectedStatus, setSelectedStatus] = useState(status);

  const statusOption = ["Paid", "UnPaid"];

  if (!item) return null;

  const invoiceUrl = `https://www.megatransfers.com/invoice.php?key=S3wy2dBNrKaemCfLDlqGJHnkA10&id=${item.id}`;

  const downloadPDF = () => {
    const input = document.getElementById("invoiceToDownload");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${item.invoiceNo}.pdf`);
      toast.success("PDF downloaded successfully!");
    });
  };

  const openModal = () => {
    const msg = `Dear ${item.customer}\n\nWe have prepared the following invoice for you: # <b>${item.invoiceNo}</b>\n\nInvoice status: ${status}\n\nYou can view the invoice on the following link: <a href='${invoiceUrl}' target='_blank'>${item.invoiceNo}</a>\n\nPlease contact us for more information.\n\nKind Regards,\n\n${item.company.name}`;
    setRecipient(item.email);
    setSubject(`Invoice ${item.invoiceNo} created`);
    setMessage(msg);
    setShowEmailModal(true);
  };

  const handleSendEmail = () => {
    toast.success("Email sent successfully!");
    setShowEmailModal(false);
  };

  const handleStatusUpdate = () => {
    setStatus(selectedStatus);
    toast.success(`Status updated to "${selectedStatus}"`);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <Link to="/dashboard/edit-invoice">
            <button
              style={{
                padding: "10px 16px",
                backgroundColor: "orange",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <Icons.SquarePen size={16} />
            </button>
          </Link>

          <button
            onClick={downloadPDF}
            style={{
              padding: "10px 16px",
              backgroundColor: "#4B5563",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Icons.Download size={16} />
          </button>

          <button
            onClick={openModal}
            style={{
              padding: "10px 16px",
              backgroundColor: "#2563EB",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Icons.Mail size={16} />
          </button>

          <button
            style={{
              padding: "10px 16px",
              backgroundColor: "red",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Icons.Trash size={16} />
          </button>
          {/* Status Select and Tick */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <SelectOption
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOption}
              width="40"
            />
            <button
              onClick={handleStatusUpdate}
              style={{
                padding: "10px 16px",
                backgroundColor: "#10B981",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
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
            backgroundColor: "white",
            fontSize: "14px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <img
                src={IMAGES.dashboardLargeLogo}
                alt="Logo"
                style={{ height: "40px", marginBottom: "8px" }}
              />
              <p style={{ fontWeight: "600" }}>{item.company.name}</p>
              <p>{item.company.address}</p>
              <p>VAT: {item.company.vat}</p>
              <a href={`mailto:${item.company.email}`}>{item.company.email}</a>
              <p>{item.company.phone}</p>
            </div>

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>INVOICE</h2>
              <p style={{ color: "#6B7280" }}>#{item.invoiceNo}</p>
              <p
                style={{
                  color: status === "Paid" ? "#16A34A" : "#DC2626",
                  fontWeight: "600",
                }}
              >
                {status}
              </p>
              <p>Invoice Date: {item.date}</p>
              <p>Due Date: {item.dueDate}</p>
              <p style={{ fontWeight: "bold", marginTop: "10px" }}>Bill To</p>
              <p>{item.customer}</p>
              <a href={`mailto:${item.email}`}>{item.email}</a>
              <p>{item.phone}</p>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "black", color: "white" }}>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Tax</th>
                <th style={thStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {item.rides.map((ride, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>
                    <strong>
                      {ride.number} - {ride.passenger}
                    </strong>
                    <p style={subInfoStyle}>Pickup: {ride.pickup}</p>
                    <p style={subInfoStyle}>Drop off: {ride.drop}</p>
                    <p style={subInfoStyle}>Date & Time: {ride.datetime}</p>
                  </td>
                  <td style={tdStyle}>{ride.tax}</td>
                  <td style={tdStyle}>£{ride.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: "right", marginTop: "16px" }}>
            <p>Sub Total: £{item.subtotal}</p>
            <p>Discount: £{item.discount}</p>
            <p>Deposit: £{item.deposit}</p>
            <p style={{ fontWeight: "bold" }}>
              Balance Due: £{item.balanceDue}
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
            <p style={{ color: "#4B5563", fontSize: "13px" }}>
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
