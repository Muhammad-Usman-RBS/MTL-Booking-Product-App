import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IMAGES from "../../../assets/images";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import InvoiceEmailModal from "./InvoiceEmailModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
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

  const downloadPDF = async () => {
    const input = document.getElementById("invoiceToDownload");
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      width: 1200,
      height: 800,
      windowWidth: 1200,
      windowHeight: 800,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4"); // use pt to match pixel-based layout
    pdf.addImage(imgData, "PNG", 0, 0, 595.28, 841.89); // A4 in pt = 595x842
    pdf.save(`Invoice-${item.invoiceNo}.pdf`);
    toast.success("PDF downloaded successfully!");
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
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 mt-8">
          {/* Edit Button */}
          <Link to="/dashboard/edit-invoice">
            <button className="p-2.5 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition">
              <Icons.SquarePen size={16} />
            </button>
          </Link>

          {/* Download Button */}
          <button
            onClick={downloadPDF}
            className="p-2.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
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
          <button className="p-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
            <Icons.Trash size={16} />
          </button>

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
              className="p-2.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition"
            >
              <Icons.Check size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Display */}
        <div id="invoiceToDownload" className="invoice-container">
          <div className="invoice-header">
            <div className="company-info">
              <img
                src={IMAGES.dashboardLargeLogo}
                alt="Logo"
                className="company-logo"
              />
              <p className="company-name">{item.company.name}</p>
              <p>{item.company.address}</p>
              <p>VAT: {item.company.vat}</p>
              <a href={`mailto:${item.company.email}`} className="email-link">
                {item.company.email}
              </a>
              <p>{item.company.phone}</p>
            </div>

            <div className="invoice-info">
              <h2 className="invoice-title">INVOICE</h2>
              <p className="invoice-no">#{item.invoiceNo}</p>
              <p className={`status ${status === "Paid" ? "paid" : "unpaid"}`}>
                {status}
              </p>
              <p>Invoice Date: {item.date}</p>
              <p>Due Date: {item.dueDate}</p>
              <p className="bill-to">Bill To</p>
              <p>{item.customer}</p>
              <a href={`mailto:${item.email}`} className="email-link">
                {item.email}
              </a>
              <p>{item.phone}</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Tax</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {item.rides.map((ride, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div>
                        <strong>
                          {ride.number} - {ride.passenger}
                        </strong>
                        <p className="sub-info">Pickup: {ride.pickup}</p>
                        <p className="sub-info">Drop off: {ride.drop}</p>
                        <p className="sub-info">Date & Time: {ride.datetime}</p>
                      </div>
                    </td>
                    <td>{ride.tax}</td>
                    <td>£{ride.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="totals">
            <p>Sub Total: £{item.subtotal}</p>
            <p>Discount: £{item.discount}</p>
            <p>Deposit: £{item.deposit}</p>
            <p className="balance">Balance Due: £{item.balanceDue}</p>
          </div>

          <div className="invoice-notes">
            <p className="notes-title">Notes</p>
            <p className="notes-text">T&Cs apply. Please call for detail.</p>
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
