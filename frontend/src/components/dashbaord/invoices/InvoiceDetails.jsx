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
                className={`p-2.5 text-white rounded-md transition ${
                  status === selectedStatus
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
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  status?.toLowerCase() === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                Status: {status}
              </span>
            </div>
          )}
        </div>

        <div id="invoiceToDownload" className="invoice-container">
          <div className="invoice-header">
            <div className="company-info">
              {company.profileImage && (
                <img
                  src={company.profileImage}
                  alt="Logo"
                  className="company-logo"
                />
              )}
              <p className="company-name">{company.companyName}</p>
              {item?.customer?.vatnumber && (
                <p>VAT Number - {item?.customer?.vatnumber}</p>
              )}
              <p>
                {[company.address, company.city, company.state, company.zip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>Website: {company.website}</p>
              <a href={`mailto:${company.email}`} className="email-link">
                {company.email}
              </a>
              <p>Contact: +{company.contact}</p>
            </div>

            <div className="invoice-info">
              <h2 className="invoice-title">INVOICE</h2>
              <p
                className={`invoice-status ${
                  status.toLowerCase() === "paid" ? "paid" : "unpaid"
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
              <div className="bill-to div">
                <p className="bill-to">Bill To</p>
                <div>
                  <span>
                    {invoiceType === "driver"
                      ? item.driver?.name
                      : item.customer?.name}
                  </span>
                  <a
                    href={`mailto:${
                      invoiceType === "driver"
                        ? item.driver?.email
                        : item.customer?.email
                    }`}
                    className="email-link"
                  >
                    {invoiceType === "driver"
                      ? item.driver?.email
                      : item.customer?.email}
                  </a>
                  <span>
                    +
                    {invoiceType === "driver"
                      ? item.driver?.phone
                      : item.customer?.phone}
                  </span>
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
                        Pickup: {ride.pickup},<br /> Dropoff: {ride.dropoff}
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
                    <td>
                      {currencySymbol}
                      {ride.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="totals">
            <p>
              Sub Total: {currencySymbol}
              {item.items.reduce((acc, i) => acc + i.fare, 0).toFixed(2)}
            </p>
            <p>
              <strong>{taxDisplay}</strong>
              {currencySymbol}
              {totalTax.toFixed(2)}
            </p>
            <p className="balance">
              Grand Total: {currencySymbol}
              {item.items.reduce((acc, i) => acc + i.totalAmount, 0).toFixed(2)}
            </p>
          </div>

          <div className="invoice-notes">
            <p className="notes-title">Notes</p>
            <p className="notes-text">T&Cs apply. Please call for detail.</p>
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
