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
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
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

  const statusOption = ["Paid", "Unpaid"];

  if (!item) return null;

  const isDev = process.env.NODE_ENV !== "production";
  const invoiceUrl = `${
    isDev ? "http://localhost:3000" : "https://www.megatransfers.com"
  }/dashboard/invoices/edit/${item?._id}`;

  const handleDownload = () => {
    const element = document.getElementById("invoiceToDownload");

    element.classList.add("pdf-mode");

    setTimeout(() => {
      void element.offsetHeight;

      downloadPDF("invoiceToDownload", `Invoice-${item?.invoiceNumber}.pdf`);

      setTimeout(() => {
        element.classList.remove("pdf-mode");
      }, 500);
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
            className="p-2.5 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
        <div id="invoiceToDownload" className="invoice-container">
          <div className="invoice-header">
            <div className="company-info">
              <img
                src={IMAGES.dashboardLargeLogo}
                alt="Logo"
                className="company-logo"
              />
              <p className="company-name">{company.companyName}</p>
              <p>VAT Number - 442612419</p>
              <p>
                {[company.address, company.city, company.state, company.zip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>Website: {company.website}</p>
              <a href={`mailto:${company.email}`} className="email-link">
                {company.email}
              </a>
              <p>Contact: {company.contactName}</p>
            </div>

            <div className="invoice-info">
              <h2 className="invoice-title">INVOICE</h2>
              <p
                className={`invoice-status ${
                  status.toLowerCase() === "paid" ? "paid" : ""
                }`}
              >
                {status}
              </p>
              <p className="invoice-no">#{item?.invoiceNumber}</p>
              <div className="invoice-dates">
                <p>
                  Invoice Date: {new Date(item?.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Due Date:{" "}
                  {item?.items?.[0]?.date
                    ? new Date(item.items[0].date).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div className="bill-to">
                <p>
                  <strong>Bill To</strong>
                </p>
                <div>
                  <span>{item.customer?.name}</span>

                  <a
                    href={`mailto:${item.customer?.email}`}
                    className="email-link"
                  >
                    {item.customer?.email}
                  </a>
                  <span>+{item.customer?.phone || ""}</span>
                </div>
              </div>
              <p>{item?.phone}</p>
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
                {item.items.map((ride, index) => (
                  <tr key={ride.bookingId || index}>
                    <td>{index + 1}</td>
                    <td>
                      {ride.bookingId}
                      <br />
                      <small>
                        Pickup: {ride.pickup}, Dropoff: {ride.dropoff}
                      </small>
                    </td>
                    <td className="nowrap">
                      {(() => {
                        const taxAmount = ride.totalAmount - ride.fare;
                        const taxPercent = (taxAmount / ride.fare) * 100;
                        if (!ride.fare || taxAmount <= 0) return "No Tax";
                        return `${taxPercent.toFixed(0)}%`;
                      })()}
                    </td>
                    <td>£{ride.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="totals">
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
            <p className="balance">
              Grand Total: £
              {item.items.reduce((acc, i) => acc + i.totalAmount, 0).toFixed(2)}
            </p>
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

export default InvoiceDetails;
