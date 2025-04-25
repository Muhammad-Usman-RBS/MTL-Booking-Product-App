import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import axios from "axios";

const tabs = [
  "Active",
  "Pending",
  "Verified",
  "Suspended",
  "Finished",
  "Delete Pending",
];

const AdminList = () => {
  const [adminsListData, setAdminsListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get("http://localhost:5000/api/create-clientadmin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminsListData(res.data);
    } catch (error) {
      toast.error("Failed to fetch admins");
    }
  };

  const handleEditModal = (admin) => {
    setSelectedAccount(admin);
    setShowModal(true);
  };

  const handleSave = async () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    try {
      if (selectedAccount._id) {
        await axios.put(
          `http://localhost:5000/api/create-clientadmin/${selectedAccount._id}`,
          selectedAccount,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("User updated");
      } else {
        await axios.post(
          "http://localhost:5000/api/create-clientadmin",
          selectedAccount,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("User created");
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
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
                fullName: "",
                email: "",
                role: "clientadmin",
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
        heading="Client Info"
      >
        <div className="space-y-4 ps-6 pe-6">
          <SelectOption
            label="Type"
            value={selectedAccount?.role || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, role: e.target.value })
            }
            options={["clientadmin", "driver", "customer"]}
          />
          <input
            placeholder="Full Name"
            className="custom_input"
            value={selectedAccount?.fullName || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, fullName: e.target.value })
            }
          />
          <input
            placeholder="Email"
            type="email"
            className="custom_input"
            value={selectedAccount?.email || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, email: e.target.value })
            }
          />
          <input
            placeholder="Password"
            type="password"
            className="custom_input"
            value={selectedAccount?.password || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, password: e.target.value })
            }
          />
          <SelectOption
            label="Status"
            value={selectedAccount?.status || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, status: e.target.value })
            }
            options={tabs}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Booking",
                "Driver",
                "Customer",
                "Pricing",
                "Setting",
                "Seo",
                "Invoice",
                "Statement",
                "Airport & City Transfers",
              ].map((perm) => (
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
    </>
  );
};

export default AdminList;
