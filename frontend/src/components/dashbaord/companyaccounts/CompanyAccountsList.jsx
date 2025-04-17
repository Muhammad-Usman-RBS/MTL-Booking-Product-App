import React, { useState } from "react";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";
import { companyAccountsData } from "../../../constants/dashboardTabsData/data";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomModal from "../../../constants/constantscomponents/CustomModal";

const tabs = [
  "Active",
  "Pending",
  "Verified",
  "Suspended",
  "Finished",
  "Delete Pending",
];

const CompanyAccountsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [driverToSendEmail, setDriverToSendEmail] = useState(null);
  const [emailToSend, setEmailToSend] = useState("");

  const downloadPDF = (item) => {
    const input = document.getElementById("invoiceToDownload");
    if (!input) {
      console.error("Element with ID 'invoiceToDownload' not found.");
      return;
    }
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${item.invoiceNo || item.company}.pdf`);
      toast.success("PDF downloaded successfully!");
    });
  };

  const handleSendEmail = (driver) => {
    setDriverToSendEmail(driver);
    setEmailToSend(driver.email || "");
    setShowModal(true);
  };

  const tabCounts = tabs.reduce((acc, tab) => {
    acc[tab] = companyAccountsData.filter((item) => item.status === tab).length;
    return acc;
  }, {});

  const filteredData = companyAccountsData.filter(
    (item) =>
      item.status === selectedTab &&
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  const tableHeaders = [
    { label: "Company", key: "company" },
    { label: "Primary Contact", key: "primaryContact" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Due", key: "due" },
    { label: "Created", key: "created" },
    { label: "Action", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Eye
          title="View"
          onClick={() => setSelectedAccount(item)} // ✅ Correct view trigger
          className="w-8 h-8 p-2 rounded-md hover:bg-blue-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Link to="/dashboard/company-accounts/new">
          <Icons.Pencil
            title="Edit"
            className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
          />
        </Link>
        <Icons.Trash
          title="Delete"
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      {!selectedAccount ? (
        <div>
          <OutletHeading name="Company Accounts" />
          <div className="flex flex-col sm:flex-row justify-between gap-4 px-0 mb-4">
            <Link to="/dashboard/company-accounts/new">
              <button className="btn btn-edit">Add New</button>
            </Link>
          </div>

          <div className="w-full overflow-x-auto mb-4 mt-4">
            <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base px-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setSelectedTab(tab);
                    setPage(1);
                  }}
                  className={`pb-2 whitespace-nowrap transition-all duration-200 ${
                    selectedTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  {tab} ({tabCounts[tab]})
                </button>
              ))}
            </div>
          </div>

          <CustomTable
            tableHeaders={tableHeaders}
            tableData={tableData}
            showPagination={true}
            showSorting={true}
            currentPage={page}
            setCurrentPage={setPage}
            perPage={perPage}
          />
        </div>
      ) : (
        <div className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-0 md:gap-4">
            <OutletHeading name="Account Details" />
            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={() => downloadPDF(selectedAccount)}
                className="btn btn-reset w-full md:w-auto"
              >
                Download PDF
              </button>
              <button
                className="btn btn-success w-full md:w-auto"
                onClick={() => handleSendEmail(selectedAccount)}
              >
                Resend Welcome Email
              </button>
              <button
                onClick={() => setSelectedAccount(null)}
                className="btn btn-cancel w-full md:w-auto"
              >
                Close
              </button>
            </div>
          </div>

          <hr className="border-gray-300 -mt-2" />

          <div
            id="invoiceToDownload"
            className="w-full max-w-5xl mx-auto px-4 py-6 text-[#374151] text-sm font-sans"
          >
            <div className="flex justify-center mb-6">
              <img
                src={IMAGES.profileimg}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column */}
              <div className="flex-1 flex flex-col gap-2">
                <p>
                  <strong>Company Name:</strong> {selectedAccount.company}
                </p>
                <p>
                  <strong>Email:</strong> {selectedAccount.email}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedAccount.phone}
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href={selectedAccount.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline break-words"
                  >
                    {selectedAccount.website}
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> {selectedAccount.address}
                </p>
                <p>
                  <strong>City:</strong> {selectedAccount.city}
                </p>
                <p>
                  <strong>State/County:</strong> {selectedAccount.state || "-"}
                </p>
                <p>
                  <strong>Postcode/Zip code:</strong> {selectedAccount.postcode}
                </p>
                <p>
                  <strong>Country:</strong> {selectedAccount.country}
                </p>
              </div>

              {/* Right Column */}
              <div className="flex-1 flex flex-col gap-2">
                <p>
                  <strong>Primary Contact Name:</strong>{" "}
                  {selectedAccount.primaryContact}
                </p>
                <p>
                  <strong>Primary Contact Designation:</strong>{" "}
                  {selectedAccount.designation}
                </p>
                <p>
                  <strong>Tax:</strong> {selectedAccount.tax || "None"}
                </p>
                <p>
                  <strong>Locations Display (Invoice):</strong>{" "}
                  {selectedAccount.locationsDisplay}
                </p>
                <p>
                  <strong>Payment Options (Bookings):</strong>{" "}
                  {selectedAccount.paymentOptionsBooking}
                </p>
                <p>
                  <strong>Payment Options (Invoice Payment):</strong>{" "}
                  {selectedAccount.paymentOptionsInvoice}
                </p>
                <p>
                  <strong>Invoice Due Days:</strong>{" "}
                  {selectedAccount.invoiceDueDays}
                </p>
                <p>
                  <strong>Invoice Terms:</strong>{" "}
                  {selectedAccount.invoiceTerms || "-"}
                </p>
                <p>
                  <strong>Passphrase:</strong>{" "}
                  {selectedAccount.passphrase || "-"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedAccount.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading="Send Email"
      >
        <div className="w-full max-w-md mx-auto p-4 font-sans">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email:
          </label>
          <input
            type="email"
            value={emailToSend}
            onChange={(e) => setEmailToSend(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5 text-sm"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Send Email
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default CompanyAccountsList;
