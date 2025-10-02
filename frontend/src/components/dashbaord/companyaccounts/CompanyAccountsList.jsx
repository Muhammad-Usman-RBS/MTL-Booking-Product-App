import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IMAGES from "../../../assets/images";
import Icons from "../../../assets/icons";

import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";

import {
  useFetchAllCompaniesQuery,
  useSendCompanyEmailMutation,
  useDeleteCompanyAccountMutation,
} from "../../../redux/api/companyApi";
import { useLoading } from "../../common/LoadingProvider";

const CompanyAccountsList = () => {
  // API & Hooks
  const {
    data: companies = [],
    refetch,
    isLoading,
  } = useFetchAllCompaniesQuery();
  const { showLoading, hideLoading } = useLoading();
  // Redux States
  const timezone =
    useSelector((state) => state.bookingSetting?.timezone) || "UTC";
  const user = useSelector((state) => state.auth?.user);

  // Navigation
  const navigate = useNavigate();

  // Mutations
  const [sendEmail] = useSendCompanyEmailMutation();
  const [deleteCompany] = useDeleteCompanyAccountMutation();

  // Local States
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  useEffect(() => {
    if (isLoading) {
      showLoading;
    } else {
      hideLoading();
    }
  }, [hideLoading, showLoading, isLoading]);
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
      String(item?.clientAdminId?._id || item?.clientAdminId) ===
        String(user._id)
    );

    return {
      ...item,
      contact: item.contact?.startsWith("+")
        ? item.contact
        : `+${item.contact}`,
      createdAt: item.createdAt
        ? moment(item.createdAt).tz(timezone).format("DD/MM/YYYY HH:mm:ss")
        : "N/A",

      actions: (
        <div className="flex gap-2">
          <div
            onClick={() => setSelectedAccount(item)}
            className="icon-box icon-box-info"
          >
            <Icons.Eye title="View" className="size-4" />
          </div>
          <div
            onClick={() =>
              navigate(`/dashboard/company-accounts/edit/${item._id}`)
            }
            className="icon-box icon-box-warning"
          >
            <Icons.Pencil title="Edit" className="size-4" />
          </div>
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
            buttonBg="btn btn-edit"
          />

          <CustomTable
            filename="Company-Accounts-list"
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
            buttonBg="btn btn-back"
            onButtonClick={handleConfirmSendEmail}
          />
          <div className="flex justify-end items-center mb-6 mt-6">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  downloadPDF(
                    "invoiceToDownload",
                    `Company-${selectedAccount.companyName || "Account"}.pdf`
                  )
                }
                className="btn btn-edit"
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

          <div
            id="invoiceToDownload"
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              background: "linear-gradient(180deg, #f0f9ff, #ffffff)",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e0f2fe",
              boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
            }}
          >
            {/* Profile */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div
                style={{
                  display: "inline-block",
                  position: "relative",
                  width: "120px",
                  height: "120px",
                }}
              >
                <img
                  src={
                    selectedAccount.profileImage?.startsWith("http")
                      ? selectedAccount.profileImage
                      : selectedAccount.profileImage
                      ? `${import.meta.env.VITE_API_BASE_URL}/${
                          selectedAccount.profileImage
                        }`
                      : IMAGES.dummyImg
                  }
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "4px solid #38bdf8",
                    objectFit: "contain",
                    boxShadow: "0 6px 18px rgba(56,189,248,0.4)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "6px",
                    backgroundColor: "#0ea5e9",
                    padding: "6px",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
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
              <h2
                style={{
                  marginTop: "18px",
                  fontSize: "26px",
                  fontWeight: "700",
                  color: "#0c4a6e",
                }}
              >
                {selectedAccount.companyName || "Company Account"}
              </h2>
              <p
                style={{
                  color: "#0369a1",
                  fontSize: "16px",
                  fontWeight: "500",
                  marginTop: "4px",
                }}
              >
                {selectedAccount.tradingName || "Trading Name"}
              </p>
            </div>

            {/* Details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
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
                {
                  label: "License Number",
                  value: selectedAccount.licenseNumber,
                },
                {
                  label: "License Website Link",
                  value: selectedAccount.website,
                },
                {
                  label: "Cookie Consent",
                  value: selectedAccount.cookieConsent,
                },
                {
                  label: "Created At",
                  value: selectedAccount?.createdAt
                    ? moment(selectedAccount.createdAt)
                        .tz(timezone)
                        .format("DD/MM/YYYY HH:mm:ss")
                    : "N/A",
                },
                { label: "Company Address", value: selectedAccount.address },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      color: "#0284c7",
                      marginBottom: "6px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#111827",
                      wordBreak: "break-word",
                      whiteSpace:
                        label === "Company Address" ? "pre-line" : "normal",
                    }}
                  >
                    {value || "N/A"}
                  </div>
                </div>
              ))}
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
