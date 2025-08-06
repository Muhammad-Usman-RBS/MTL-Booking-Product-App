import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useFetchAllCompaniesQuery, useSendCompanyEmailMutation, useDeleteCompanyAccountMutation } from "../../../redux/api/companyApi";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import "react-toastify/dist/ReactToastify.css";
import IMAGES from "../../../assets/images";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

const CompanyAccountsList = () => {
  const { data: companies = [], refetch } = useFetchAllCompaniesQuery();
  const timezone = useSelector((state) => state.bookingSetting?.timezone) || "UTC";
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

  const tableData = paginatedData.map((item) => ({
    ...item,
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
        <Icons.Trash
          title="Delete"
          onClick={() => {
            setAccountToDelete(item);
            setShowDeleteModal(true);
          }}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      {!selectedAccount ? (
        <>
          <OutletHeading name="Company Accounts" />
          <Link to="/dashboard/company-accounts/new">
            <button className="btn btn-edit mb-4">Add New</button>
          </Link>

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
          <div className="flex justify-between items-center mb-6">
            <OutletHeading name="Company Account Details" />
            <div className="flex gap-2">
              <button
                onClick={() =>
                  downloadPDF(
                    "invoiceToDownload",
                    `Company-${selectedAccount.companyName}.pdf`
                  )
                }
                className="btn btn-reset"
              >
                Download PDF
              </button>
              <button onClick={handleConfirmSendEmail} className="btn btn-success">
                Send Email
              </button>
              <button
                onClick={() => setSelectedAccount(null)}
                className="btn btn-cancel"
              >
                Close
              </button>
            </div>
          </div>
          <div className="w-full max-w-2xl mx-auto px-4">
            <div
              id="invoiceToDownload"
              className="bg-white px-6 py-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-center mb-6 mt-4">
                <div className="relative w-28 h-28">
                  <img
                    src={
                      selectedAccount.profileImage?.startsWith("http")
                        ? selectedAccount.profileImage
                        : selectedAccount.profileImage
                          ? `http://localhost:5000/${selectedAccount.profileImage}`
                          : IMAGES.dummyImg
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full border-4 border-[var(--main-color)] object-cover shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 bg-[var(--main-color)] p-1 rounded-full border-white border">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {[
                  { label: "Company ID", value: selectedAccount._id },
                  { label: "Company Name", value: selectedAccount.companyName },
                  { label: "Trading Name", value: selectedAccount.tradingName },
                  { label: "Owner Name", value: selectedAccount.fullName },
                  { label: "Company Email", value: selectedAccount.email },
                  { label: "Phone", value: selectedAccount.contact },
                  { label: "Licensed By", value: selectedAccount.licensedBy },
                  { label: "License Number", value: selectedAccount.licenseNumber },
                  { label: "License Referrer Link", value: selectedAccount.referrerLink },
                  { label: "Cookie Consent", value: selectedAccount.cookieConsent },
                  {
                    label: "Created At",
                    value: selectedAccount?.createdAt
                      ? moment(selectedAccount.createdAt).tz(timezone).format("DD/MM/YYYY HH:mm:ss")
                      : "N/A"
                  },
                  { label: "Company Address", value: selectedAccount.address },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-white border border-gray-200 py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {label}
                    </p>
                    <p className="text-gray-800 font-semibold">{value || "N/A"}</p>
                  </div>
                ))}
              </div>
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
