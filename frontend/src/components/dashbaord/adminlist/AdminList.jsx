import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Icons from "../../../assets/icons";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";

import {
  useDeleteClientAdminMutation,
  useFetchClientAdminsQuery,
  useUpdateClientAdminStatusMutation,
} from "../../../redux/api/adminApi";
import { useLoading } from "../../common/LoadingProvider";

const tabs = ["Active", "Pending", "Suspended", "Deleted"];

const AdminList = () => {
  const user = useSelector((state) => state.auth.user);
  const { showLoading, hideLoading } = useLoading();
  const {
    data: adminsListData = [],
    refetch,
    isLoading,
  } = useFetchClientAdminsQuery();
  const [deleteAdmin] = useDeleteClientAdminMutation();
  const [changeStatus] = useUpdateClientAdminStatusMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Active");
  const [page, setPage] = useState(1);
  const [perPage] = useState(9999);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(()=> {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [showLoading, hideLoading, isLoading]);
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleStatusChange = async (adminId, newStatus) => {
    try {
      await changeStatus({ adminId, newStatus }).unwrap();
      toast.success(`User status updated to ${newStatus}`);
      refetch();
    }  catch (error) {
      // Check for the specific pending clientadmin error
      if (error?.data?.requiresRecreation) {
        toast.error("Cannot activate pending clientadmin. Please recreate the account from scratch to complete OTP verification.");
      } else {
        toast.error(error?.data?.message || "Failed to update status");
      }
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
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete user");
    } finally {
      setDeleteModalOpen(false);
      setDeleteUserId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteUserId(null);
  };

  const tabCounts = useMemo(
    () =>
      tabs.reduce((acc, tab) => {
        acc[tab] = adminsListData.filter((item) => item.status === tab).length;
        return acc;
      }, {}),
    [adminsListData]
  );

  const filteredData = useMemo(
    () =>
      adminsListData.filter(
        (item) =>
          item.status === selectedTab &&
          Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      ),
    [adminsListData, selectedTab, searchTerm]
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

  const tableData = paginatedData.map((item) => {
    const isOwnAssociateAdmin =
      user?.role === "associateadmin" && user?._id === item._id;

    const getButtonStyle = (status) => {
      switch (status) {
        case "Active":
          return "tab-success";
        case "Suspended":
          return "tab-suspended";
        case "Deleted":
          return "tab-danger";
        default:
          return "bg-gray-100 text-gray-700 border-[var(--light-gray)] hover:bg-gray-200";
      }
    };

    const getAllowedStatusChanges = (status) => {
      switch (status) {
        case "Active":
          return ["Suspended", "Deleted"];
        case "Suspended":
          return ["Active", "Deleted"];
        case "Deleted":
          return ["Active"];
        case "Pending":
          return ["Active",  "Deleted"];
        default:
          return [];
      }
    };

    return {
      role: item.role || "N/A",
      fullName: item.fullName || "N/A",
      email: item.email || "N/A",
      status: item.status || "N/A",
      actions: isOwnAssociateAdmin ? (
        <span className="text-gray-500 italic">
          Only Client Admin can change actions
        </span>
      ) : (
        <div className="flex gap-2">
          <div className="flex flex-wrap gap-1">
            {getAllowedStatusChanges(item.status).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(item._id, status)}
                className={`tab ${getButtonStyle(status)}`}
              >
                {status}
              </button>
            ))}
          </div>
          <Link to={`/dashboard/admin-list/edit/${item._id}`}>
            <div className="icon-box icon-box-outline">
              <Icons.Pencil title="Edit" className="size-4" />
            </div>
          </Link>
          {selectedTab === "Deleted" && (
             <div className="icon-box icon-box-danger">
            <Icons.Trash
              title="Delete"
              onClick={() => handleDeleteClick(item._id)}
              className="size-4"
            />
            </div>

          )}
        </div>
      ),
    };
  });

  return (
    <>
      <div>
        <OutletBtnHeading
          name="Admins List"
          buttonLabel="+ Add New"
          buttonLink="/dashboard/admin-list/add-user"
          buttonBg="btn btn-edit"
        />

        <div className="w-full overflow-x-auto mb-4 mt-4">
          <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setPage(1);
                }}
                className={`pb-2 whitespace-nowrap border-b-2 transition-all duration-200 ${
                  selectedTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-[var(--dark-gray)] hover:text-blue-500"
                }`}
              >
                {tab} ({tabCounts[tab] || 0})
              </button>
            ))}
          </div>
        </div>

        <CustomTable
        filename='Users-list'
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
