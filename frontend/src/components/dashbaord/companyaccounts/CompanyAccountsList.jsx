// ✅ Updated CompanyAccountsList.jsx using RTK Query

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useFetchAllCompaniesQuery, useSendCompanyEmailMutation } from "../../../redux/api/companyApi";
import IMAGES from "../../../assets/images";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import "react-toastify/dist/ReactToastify.css";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";

const tabs = ["active", "pending", "suspended", "deleted"];

const CompanyAccountsList = () => {
  const navigate = useNavigate();
  const { data: companies = [], refetch } = useFetchAllCompaniesQuery();
  const [sendEmail] = useSendCompanyEmailMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [emailToSend, setEmailToSend] = useState("");

  // Automatically refetch when component mounts
  useEffect(() => {
    refetch();
  }, []);

  const handleConfirmSendEmail = async () => {
    try {
      const { email, ...companyData } = selectedAccount;
      await sendEmail({ email, company: companyData }).unwrap();
      toast.success("Email sent successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Email send error:", error);
      toast.error("Failed to send email.");
    }
  };

  const filteredData = companies.filter(
    (item) =>
      (item.status || "").toLowerCase() === selectedTab.toLowerCase() &&
      Object.values(item).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  const tableHeaders = [
    { label: "Company Name", key: "companyName" },
    { label: "Owner Name", key: "fullName" },
    { label: "Company Email", key: "email" },
    { label: "Primary Contact", key: "contactName" },
    { label: "Phone", key: "contact" },
    { label: "Due", key: "dueDays" },
    { label: "Created", key: "createdAt" },
    { label: "Action", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Eye
          title="View"
          onClick={() => setSelectedAccount(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-blue-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Pencil
          title="Edit"
          onClick={() => navigate(`/dashboard/company-accounts/edit/${item._id}`)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  const tabCounts = tabs.reduce((acc, tab) => {
    acc[tab] = companies.filter((item) => (item.status || "").toLowerCase() === tab.toLowerCase()).length;
    return acc;
  }, {});

  const InfoRow = ({ label, value }) => (
    <p
      style={{
        margin: "6px 0",
        fontSize: "14px",
        color: "#374151",
        wordBreak: "break-word",
      }}
    >
      <strong
        style={{
          display: "inline-block",
          width: "160px",
          color: "#1f2937",
          fontWeight: "600",
        }}
      >
        {label}:
      </strong>
      <span>{value || "-"}</span>
    </p>
  );

  return (
    <>
      {!selectedAccount ? (
        <>
          <OutletHeading name="Company Accounts" />
          <Link to="/dashboard/company-accounts/new">
            <button className="btn btn-edit mb-4">Add New</button>
          </Link>

          <div className="flex gap-4 text-sm font-medium border-b mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setPage(1);
                }}
                className={`pb-2 ${selectedTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-500"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tabCounts[tab] || 0})
              </button>
            ))}
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
        </>
      ) : (
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <OutletHeading name="Account Details" />
            <div className="flex gap-2">
              <button
                onClick={() =>
                  downloadPDF("invoiceToDownload", `Invoice-${selectedAccount.companyName}.pdf`)
                }
                className="btn btn-reset"
              >
                Download PDF
              </button>
              <button onClick={handleConfirmSendEmail} className="btn btn-success">
                Send Email
              </button>

              <button onClick={() => setSelectedAccount(null)} className="btn btn-cancel">Close</button>
            </div>
          </div>

          <div
            id="invoiceToDownload"
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              maxWidth: "1000px",
              margin: "auto",
              fontFamily: "sans-serif",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <img
                src={
                  selectedAccount.profileImage?.startsWith("http")
                    ? selectedAccount.profileImage
                    : selectedAccount.profileImage
                      ? `http://localhost:5000/${selectedAccount.profileImage}`
                      : IMAGES.dummyImg
                }
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "10%",
                  objectFit: "cover",
                  border: "2px solid #ccc",
                }}
                alt="Profile"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              <div>
                <InfoRow label="Company" value={selectedAccount.companyName} />
                <InfoRow label="Company Email" value={selectedAccount.email} />
                <InfoRow label="Primary Contact" value={selectedAccount.contactName} />
                <InfoRow label="Phone" value={selectedAccount.contact} />
                <InfoRow label="Website" value={selectedAccount.website} />
                <InfoRow label="City" value={selectedAccount.city} />
                <InfoRow label="State" value={selectedAccount.state} />
                <InfoRow label="Country" value={selectedAccount.country} />
                <InfoRow label="Zip" value={selectedAccount.zip} />
              </div>
              <div>
                <InfoRow label="Owner Name" value={selectedAccount.fullName} />
                <InfoRow label="Designation" value={selectedAccount.designation} />
                <InfoRow label="Status" value={selectedAccount.status} />
                <InfoRow label="Passphrase" value={selectedAccount.passphrase} />
                <InfoRow label="Due Days" value={selectedAccount.dueDays} />
                <InfoRow label="Invoice Terms" value={selectedAccount.invoiceTerms} />
                <InfoRow label="Invoice Payment" value={selectedAccount.invoicePayment} />
                <InfoRow label="Address" value={selectedAccount.address} />
                <InfoRow label="Booking Payment" value={selectedAccount.bookingPayment} />
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomModal isOpen={showModal} onClose={() => setShowModal(false)} heading="Send Email">
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            value={emailToSend}
            onChange={(e) => setEmailToSend(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <div className="flex justify-end mt-4">
            <button onClick={() => setShowModal(false)} className="btn btn-success">Send Email</button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default CompanyAccountsList;
