import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { vouchersData } from "../../../constants/dashboardTabsData/data";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch"; // ✅ Add this import
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const userOptions = [
  { label: "All Users", count: 100 },
  { label: "user1@email.com", count: 1 },
  { label: "user2@email.com", count: 1 },
  { label: "user3@email.com", count: 1 },
];

const Vouchers = () => {
  const [data, setData] = useState(vouchersData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Any Status");

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.voucher === selectedItem.voucher ? selectedItem : item
    );
    setData(updated);
    toast.success("Voucher updated!");
    setShowModal(false);
  };

  const filteredData =
    statusFilter === "Any Status"
      ? data
      : data.filter((item) => item.status === statusFilter);

  const tableHeaders = [
    { label: "Voucher", key: "voucher" },
    { label: "Quantity", key: "quantity" },
    {
      label: "Applicable",
      key: "applicable",
      render: (item) => item.applicable?.join(", "),
    },
    {
      label: "Discount",
      key: "discount",
      render: (item) =>
        `${item.discountValue.toFixed(2)} ${
          item.discountType === "Percentage" ? "%" : "GBP"
        }`,
    },
    {
      label: "Validity",
      key: "validity",
      render: (item) => new Date(item.validity).toLocaleString(),
    },
    { label: "Applied", key: "applied" },
    { label: "Used", key: "used" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
    ...item,
    discount: item.discountValue,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => {
            const updated = data.map((d) =>
              d.voucher === item.voucher ? { ...d, status: "Deleted" } : d
            );
            setData(updated);
            toast.success("Voucher marked as deleted");
          }}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  const handleAddNew = () => {
    setSelectedItem({
      voucher: "",
      quantity: 0,
      applicable: ["All Users"],
      discountType: "Percentage",
      discountValue: 0,
      validity: "",
      applied: 0,
      used: 0,
      status: "Active",
    });
    setShowModal(true);
  };

  return (
    <>
      <div>
        <OutletHeading name="Voucher/Coupon" />
        <div className="flex justify-between items-center mb-4">
          <button className="btn btn-edit" onClick={handleAddNew}>
            Add New
          </button>
          <SelectOption
            label="Status"
            width="40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={["Any Status", "Active", "Expired", "Deleted"]}
          />
        </div>

        <CustomTable
          tableHeaders={tableHeaders}
          tableData={tableData}
          showPagination={true}
          showSorting={true}
        />
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={`Edit ${selectedItem?.voucher || "New Voucher"}`}
      >
        <div className="w-96 mx-auto p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium">Voucher</label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.voucher || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, voucher: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              className="custom_input"
              value={selectedItem?.quantity || 0}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  quantity: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Applicable</label>
            <SelectedSearch
              selected={selectedItem?.applicable || []}
              setSelected={(val) =>
                setSelectedItem({ ...selectedItem, applicable: val })
              }
              showCount={false}
              statusList={userOptions}
              placeholder="Select Users"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Validity</label>
            <input
              type="datetime-local"
              className="custom_input"
              value={selectedItem?.validity || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, validity: e.target.value })
              }
            />
          </div>

          <SelectOption
            label="Discount Type"
            width="full"
            value={selectedItem?.discountType || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, discountType: e.target.value })
            }
            options={["Percentage", "Amount"]}
          />

          <div>
            <label className="block text-sm font-medium">Discount Value</label>
            <input
              type="number"
              className="custom_input"
              value={selectedItem?.discountValue || 0}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  discountValue: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-cancel"
            >
              Cancel
            </button>
            <button onClick={handleUpdate} className="btn btn-reset">
              Update
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default Vouchers;
