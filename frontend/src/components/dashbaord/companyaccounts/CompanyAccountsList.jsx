import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { useFetchAllCompaniesQuery, useSendCompanyEmailMutation, useDeleteCompanyAccountMutation } from "../../../redux/api/companyApi";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";
import "react-toastify/dist/ReactToastify.css";
import IMAGES from "../../../assets/images";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

const CompanyAccountsList = () => {
  const { data: companies = [], refetch } = useFetchAllCompaniesQuery();
  const timezone =
    useSelector((state) => state.bookingSetting?.timezone) || "UTC";
  const user = useSelector((state) => state.auth?.user); // ✅ login user
  const navigate = useNavigate();
  const [sendEmail] = useSendCompanyEmailMutation();
  const [deleteCompany] = useDeleteCompanyAccountMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  useEffect(() => {
    refetch();
  }, []);

  const handleConfirmSendEmail = async () => {
    try {
      const { email, ...companyData } = selectedAccount;
      await sendEmail({ email, company: companyData }).unwrap();
      toast.success("Email sent successfully!");
      setSelectedAccount(null);
    } catch (error) {
      console.error("Email send error:", error);
      toast.error("Failed to send email.");
    }
  };

  const filteredData = companies.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  const tableHeaders = [
    { label: "Company ID", key: "_id" },
    { label: "Company Name", key: "companyName" },
    { label: "Owner Name", key: "fullName" },
    { label: "Company Email", key: "email" },
    { label: "Phone", key: "contact" },
    { label: "Created At", key: "createdAt" },
    { label: "Action", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => {
    const canDelete = !(
      user?.role === "clientadmin" &&
      String(item?.clientAdminId?._id || item?.clientAdminId) === String(user._id)
    );

    return {
      ...item,
      contact: item.contact?.startsWith("+") ? item.contact : `+${item.contact}`,
      createdAt: item.createdAt
        ? moment(item.createdAt).tz(timezone).format("DD/MM/YYYY HH:mm:ss")
        : "N/A",

      actions: (
        <div className="flex gap-2">
          <Icons.Eye
            title="View"
            onClick={() => setSelectedAccount(item)}
            className="w-8 h-8 p-2 rounded-md hover:bg-blue-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
          />
          <Icons.Pencil
            title="Edit"
            onClick={() =>
              navigate(`/dashboard/company-accounts/edit/${item._id}`)
            }
            className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
          />
          {canDelete && (
            <Icons.Trash
              title="Delete"
              onClick={() => {
                setAccountToDelete(item);
                setShowDeleteModal(true);
              }}
              className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
            />
          )}
        </div>
      ),
    };
  });


  return (
    <>
      {!selectedAccount ? (
        <>
          <OutletBtnHeading
            name="Company Accounts"
            buttonLabel="+ Add New"
            buttonLink="/dashboard/company-accounts/new"
            buttonBg="btn btn-reset"
          />

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
        <>
          <OutletBtnHeading
            name="Company Account Details"
            buttonLabel="Send Email"
            buttonBg="btn btn-primary"
            onButtonClick={handleConfirmSendEmail}
          />
          <div id="invoiceToDownload" style={{ width: "100%", padding: "16px", backgroundColor: "#ffffff" }}>
            {/* Profile image */}
            <div style={{ display: "flex", marginBottom: "24px" }}>
              <div style={{ position: "relative", width: "112px", height: "112px" }}>
                <img
                  src={
                    selectedAccount.profileImage?.startsWith("http")
                      ? selectedAccount.profileImage
                      : selectedAccount.profileImage
                        ? `http://localhost:5000/${selectedAccount.profileImage}`
                        : IMAGES.dummyImg
                  }
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "4px solid #2563EB", // main-color
                    objectFit: "cover",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#2563EB", // main-color
                    padding: "4px",
                    border: "2px solid #fff",
                    borderRadius: "4px",
                  }}
                >
                  <svg
                    style={{ width: "16px", height: "16px", color: "#fff" }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              {[
                { label: "Company ID", value: selectedAccount._id },
                { label: "Company Name", value: selectedAccount.companyName },
                { label: "Trading Name", value: selectedAccount.tradingName },
                { label: "Owner Name", value: selectedAccount.fullName },
                { label: "Company Email", value: selectedAccount.email },
                {
                  label: "Phone",
                  value: selectedAccount.contact?.startsWith("+")
                    ? selectedAccount.contact
                    : `+${selectedAccount.contact}`,
                },
                { label: "License Number", value: selectedAccount.licenseNumber },
                { label: "License Referrer Link", value: selectedAccount.referrerLink },
                { label: "Cookie Consent", value: selectedAccount.cookieConsent },
                {
                  label: "Created At",
                  value: selectedAccount?.createdAt
                    ? moment(selectedAccount.createdAt).tz(timezone).format("DD/MM/YYYY HH:mm:ss")
                    : "N/A",
                },
                { label: "Company Address", value: selectedAccount.address },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                    wordBreak: "break-word",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: "#6b7280",
                      letterSpacing: "0.05em",
                      marginBottom: "4px",
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ color: "#1f2937", fontWeight: 600, fontSize: "14px" }}>
                    {value || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  downloadPDF(
                    "invoiceToDownload",
                    `Company-${selectedAccount.companyName || "Account"}.pdf`
                  )
                }
                className="btn btn-reset"
              >
                Download PDF
              </button>
              <button
                onClick={() => setSelectedAccount(null)}
                className="btn btn-cancel"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteCompany(accountToDelete._id).unwrap();
            toast.success("Company deleted successfully!");
            setShowDeleteModal(false);
            setAccountToDelete(null);
          } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete company.");
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setAccountToDelete(null);
        }}
      />
    </>
  );
};

export default CompanyAccountsList;
