import React, { useState } from "react";
import Icons from "../../../assets/icons";
import { adminsListData } from "../../../constants/dashboardTabsData/data";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const tabs = [
  "Active",
  "Pending",
  "Verified",
  "Suspended",
  "Finished",
  "Delete Pending",
];

const AdminList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEditModal = (admin) => {
    setSelectedAccount(admin);
    setShowModal(true);
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
    { label: "Type", key: "type" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Last Login", key: "lastLogin" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEditModal(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Admins List" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
          <button
            className="btn btn-edit"
            onClick={() =>
              handleEditModal({
                name: "",
                email: "",
                type: "Admin",
                status: "Active",
                password: "",
                permissions: [],
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

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading="Edit Admin"
      >
        <div className="w-96 mx-auto p-4 font-sans space-y-4">
          <SelectOption
            label="Type"
            width="full"
            value={selectedAccount?.type || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, type: e.target.value })
            }
            options={["Admin", "Manager", "Super Admin"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              value={selectedAccount?.name || ""}
              onChange={(e) =>
                setSelectedAccount({ ...selectedAccount, name: e.target.value })
              }
              className="custom_input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              value={selectedAccount?.email || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  email: e.target.value,
                })
              }
              className="custom_input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <input
              type="password"
              value={selectedAccount?.password || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  password: e.target.value,
                })
              }
              className="custom_input"
            />
          </div>

          <SelectOption
            label="Status"
            width="full"
            value={selectedAccount?.status || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, status: e.target.value })
            }
            options={["Active", "Pending", "Suspended"]}
          />

          {/* ✅ Permissions Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-800">
              {[
                "Booking",
                "Driver",
                "Customer",
                "Pricing",
                "Setting",
                "Gallery",
                "Page",
                "Review",
                "Seo",
                "Statement",
                "Invoice",
                "Statistics",
                "Tour",
                "Airport & City Transfers",
              ].map((permission) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedAccount?.permissions?.includes(permission)}
                    onChange={(e) => {
                      const newPermissions = selectedAccount?.permissions || [];
                      const updatedPermissions = e.target.checked
                        ? [...newPermissions, permission]
                        : newPermissions.filter((p) => p !== permission);
                      setSelectedAccount({
                        ...selectedAccount,
                        permissions: updatedPermissions,
                      });
                    }}
                  />
                  <span>{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                toast.success("Admin Updated!");
                setShowModal(false);
              }}
              className="btn btn-reset"
            >
              Update
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default AdminList;
