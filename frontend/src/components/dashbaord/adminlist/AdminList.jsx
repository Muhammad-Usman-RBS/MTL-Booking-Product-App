import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Icons from "../../../assets/icons";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useDeleteClientAdminMutation,
  useFetchClientAdminsQuery,
  useUpdateClientAdminMutation,
  useUpdateClientAdminStatusMutation,
} from "../../../redux/api/adminApi";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";

const tabs = ["Active", "Pending", "Suspended", "Deleted"];

const AdminList = () => {
  const user = useSelector((state) => state.auth.user);
  const { data: adminsListData = [], refetch } = useFetchClientAdminsQuery();
  const { data: driversList = [] } = useGetAllDriversQuery(user?.companyId, {
    skip: !user?.companyId,
  });

  const [updateAdmin] = useUpdateClientAdminMutation();
  const [deleteAdmin] = useDeleteClientAdminMutation();
  const [changeStatus] = useUpdateClientAdminStatusMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9999);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(() => {
    refetch();
  }, []);

  const handleStatusChange = async (adminId, newStatus) => {
    try {
      await changeStatus({ adminId, newStatus }).unwrap();
      toast.success(`User status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteClick = (adminId) => {
    setDeleteUserId(adminId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAdmin(deleteUserId).unwrap();
      toast.success("User deleted successfully");
      refetch();
      setDeleteModalOpen(false);
      setDeleteUserId(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete user");
      setDeleteModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteUserId(null);
  };

  const tabCounts = tabs.reduce((acc, tab) => {
    acc[tab] = adminsListData.filter((item) => item.status === tab).length;
    return acc;
  }, {});

  const filteredData = adminsListData.filter(
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
    { label: "Type", key: "role" },
    { label: "Name", key: "fullName" },
    { label: "Email", key: "email" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    role: item.role || "N/A",
    fullName: item.fullName || "N/A",
    email: item.email || "N/A",
    status: item.status || "N/A",
    actions: (
      <div className="flex gap-2">
        <div className="flex flex-wrap gap-1">
          {(() => {
            let allowedStatusChanges = [];

            if (item.status === "Active") {
              allowedStatusChanges = ["Suspended", "Deleted"];
            } else if (item.status === "Suspended") {
              allowedStatusChanges = ["Active", "Deleted"];
            } else if (item.status === "Deleted") {
              allowedStatusChanges = ["Active", "Suspended"];
            } else if (item.status === "Pending") {
              allowedStatusChanges = ["Active", "Suspended", "Deleted"];
            }

            const getButtonStyle = (status) => {
              switch (status) {
                case "Active":
                  return "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
                case "Suspended":
                  return "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200";
                case "Deleted":
                  return "bg-red-100 text-red-700 border-red-300 hover:bg-red-200";
                default:
                  return "bg-gray-100 text-gray-700 border-[var(--light-gray)] hover:bg-gray-200";
              }
            };

            return allowedStatusChanges.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(item._id, status)}
                className={`px-3 py-1 text-xs rounded-md border font-medium transition ${getButtonStyle(
                  status
                )}`}
              >
                {status}
              </button>
            ));
          })()}
        </div>
        <Link to={`/dashboard/admin-list/edit/${item._id}`}>
          <Icons.Pencil
            title="Edit"
            className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
          />
        </Link>
        {selectedTab === "Deleted" && (
          <Icons.Trash
            title="Delete"
            onClick={() => handleDeleteClick(item._id)}
            className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
          />
        )}
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Admins List" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
          <Link
            to="/dashboard/admin-list/create-admin-user"
            className="w-full sm:w-auto"
          >
            <button className="btn btn-edit flex items-center gap-2 w-full sm:w-auto justify-center">
              Add New
            </button>
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
                    : "text-[var(--dark-gray)] hover:text-blue-500"
                }`}
              >
                {tab} ({tabCounts[tab] || 0})
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
          totalCount={filteredData.length}
        />
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default AdminList;
