import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import "react-toastify/dist/ReactToastify.css";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { useFetchClientAdminsQuery, useCreateClientAdminMutation, useUpdateClientAdminMutation, useDeleteClientAdminMutation, useUpdateClientAdminStatusMutation } from "../../../redux/api/adminApi";

const tabs = ["Active", "Pending", "Suspended", "Deleted"];

const AdminList = () => {
  const user = useSelector((state) => state.auth.user);
  const { data: adminsListData = [], refetch } = useFetchClientAdminsQuery();

  const [createAdmin] = useCreateClientAdminMutation();
  const [updateAdmin] = useUpdateClientAdminMutation();
  const [deleteAdmin] = useDeleteClientAdminMutation();
  const [changeStatus] = useUpdateClientAdminStatusMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9999);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const handleEditModal = (admin) => {
    setSelectedAccount({
      ...admin,
      associateAdminLimit: parseInt(admin.associateAdminLimit) || 5,
      permissions: admin.permissions || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (user?.role === "demo") {
      toast.error("Demo accounts are not allowed to create users.");
      return;
    }

    if (
      user?.role === "clientadmin" &&
      selectedAccount?.role === "associateadmin" &&
      !selectedAccount._id
    ) {
      const currentCount = adminsListData.filter(
        (a) =>
          a.status !== "Deleted" &&
          ["associateadmin", "staffmember", "driver", "customer"].includes(a.role) &&
          a.createdBy === user._id
      ).length;

      const allowed = user?.associateAdminLimit || 5;

      if (currentCount >= allowed) {
        toast.error(`Limit reached: Only ${allowed} associateadmins allowed.`);
        return;
      }
    }

    try {
      const payload = {
        ...selectedAccount,
        companyId:
          user?.role === "superadmin" && selectedAccount.role === "clientadmin"
            ? null
            : user?.companyId || user?._id,
        createdBy: user?._id,
      };

      if (!["clientadmin", "manager"].includes(payload.role)) {
        delete payload.associateAdminLimit;
      }

      if (selectedAccount._id) {
        await updateAdmin({ adminId: selectedAccount._id, payload }).unwrap();
        toast.success("User updated successfully");
      } else {
        await createAdmin(payload).unwrap();
        toast.success("User created successfully");
      }

      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
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

  const paginatedData = perPage === "All"
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
                case "Active": return "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
                case "Suspended": return "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200";
                case "Deleted": return "bg-red-100 text-red-700 border-red-300 hover:bg-red-200";
                default: return "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200";
              }
            };

            return allowedStatusChanges.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(item._id, status)}
                className={`px-3 py-1 text-xs rounded-md border font-medium transition ${getButtonStyle(status)}`}
              >
                {status}
              </button>
            ));
          })()}
        </div>
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEditModal(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        {selectedTab === "Deleted" && (
          <Icons.Trash
            title="Delete"
            onClick={() => handleDeleteClick(item._id)}
            className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
          />
        )}
      </div>
    )
  }));

  let roleOptions = [];
  if (user?.role === "superadmin") roleOptions = ["clientadmin", "manager", "demo"];
  else if (user?.role === "manager") roleOptions = ["manager", "demo", "driver", "customer"];
  else if (user?.role === "clientadmin") roleOptions = ["associateadmin", "staffmember", "driver", "customer"];
  else if (user?.role === "associateadmin") roleOptions = ["staffmember", "driver", "customer"];
  else if (user?.role === "demo") roleOptions = ["staffmember", "driver", "customer"];

  const getAvailablePermissions = (role) => {
    if (["driver"].includes(role)) {
      return ["Statements", "Bookings", "Drivers", "Settings", "Invoices"]
    } else if (["clientadmin", "associateadmin", "staffmember", "manager"].includes(role)) {
      return [
        "Users",
        "Bookings",
        "Invoices",
        "Drivers",
        "Customers",
        "Company Accounts",
        "Statements",
        "Pricing",
        "Settings",
        "Widget/API",
      ];
    } else {
      return ["Users",
        "Bookings",
        "Invoices",
        "Drivers",
        "Customers",
        "Company Accounts",
        "Statements",
        "Pricing",
        "Settings",
      ];
    }
  };

  return (
    <>
      <div>
        <OutletHeading name="Admins List" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
          <button
            className="btn btn-edit"
            onClick={() =>
              handleEditModal({
                fullName: "",
                email: "",
                role: roleOptions[0],
                status: "Active",
                password: "",
                permissions: [],
                associateAdminLimit: 5,
              })
            }
          >
            Add New
          </button>
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
                className={`pb-2 whitespace-nowrap transition-all duration-200 ${selectedTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
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

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading="User Info"
      >
        <div className="space-y-4 ps-6 pe-6">
          <SelectOption
            label="Type"
            value={selectedAccount?.role || ""}
            onChange={(e) => setSelectedAccount({ ...selectedAccount, role: e.target.value })}
            options={roleOptions}
          />

          <input
            placeholder="Full Name"
            className="custom_input"
            value={selectedAccount?.fullName || ""}
            onChange={(e) => setSelectedAccount({ ...selectedAccount, fullName: e.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            className="custom_input"
            value={selectedAccount?.email || ""}
            onChange={(e) => setSelectedAccount({ ...selectedAccount, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            className="custom_input"
            value={selectedAccount?.password || ""}
            onChange={(e) => setSelectedAccount({ ...selectedAccount, password: e.target.value })}
          />

          {["clientadmin", "manager"].includes(selectedAccount?.role) && (
            <SelectOption
              label="Associate Admin Limit"
              value={selectedAccount?.associateAdminLimit || 5}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  associateAdminLimit: parseInt(e.target.value),
                })
              }
              options={[5, 10, 15].map((num) => ({ label: `${num}`, value: num }))}
            />
          )}

          <SelectOption
            label="Status"
            value={selectedAccount?.status || ""}
            onChange={(e) => setSelectedAccount({ ...selectedAccount, status: e.target.value })}
            options={tabs}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {getAvailablePermissions(selectedAccount?.role).map((perm) => (
                <label key={perm} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={selectedAccount?.permissions?.includes(perm)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...(selectedAccount.permissions || []), perm]
                        : selectedAccount.permissions.filter((p) => p !== perm);
                      setSelectedAccount({ ...selectedAccount, permissions: updated });
                    }}
                  />
                  <span>{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button className="btn btn-reset" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleSave}>
              {selectedAccount?._id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </CustomModal>

      <DeleteModal
        isOpen={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default AdminList;
