import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import {
  useGetAllVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
} from "../../../redux/api/vouchersApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Static user options
const userOptions = [
  { label: "All Users", count: 100 },
  { label: "user1@email.com", count: 1 },
  { label: "user2@email.com", count: 1 },
  { label: "user3@email.com", count: 1 },
];

// Format readable date string
const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  return date.toLocaleString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Vouchers = () => {
  const { data = [], isLoading } = useGetAllVouchersQuery();
  const [createVoucher] = useCreateVoucherMutation();
  const [updateVoucher] = useUpdateVoucherMutation();
  const [deleteVoucher] = useDeleteVoucherMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleEdit = (item) => {
    setSelectedItem({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteVoucher(id).unwrap();
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateOrCreate = async () => {
    try {
      const validityDate = new Date(selectedItem.validity);
      const now = new Date();
      const status = validityDate < now ? "Expired" : "Active";

      const payload = {
        ...selectedItem,
        voucher: selectedItem.voucher?.toUpperCase(),
        discountType: "Percentage",
        discountValue: Number(selectedItem.discountValue || 0),
        quantity: Number(selectedItem.quantity || 0),
        status,
      };

      if (selectedItem._id) {
        await updateVoucher({ id: selectedItem._id, updatedData: payload }).unwrap();
        toast.success("Updated successfully");
      } else {
        await createVoucher(payload).unwrap();
        toast.success("Created successfully");
      }

      setShowModal(false);
    } catch {
      toast.error("Failed to save");
    }
  };

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

  const filteredData =
    statusFilter === "All Status"
      ? data
      : data.filter((item) =>
          statusFilter === "Expired"
            ? new Date(item.validity) < new Date()
            : item.status === statusFilter
        );

  const tableHeaders = [
    { label: "Voucher", key: "voucher" },
    { label: "Quantity", key: "quantity" },
    {
      label: "Applicable",
      key: "applicable",
      render: (item) => item.applicable?.join(", "),
    },
    {
      label: "Discount (%)",
      key: "discountValue",
      render: (item) => `${(item.discountValue || 0).toFixed(2)}%`,
    },
    {
      label: "Validity",
      key: "validity",
      render: (item) => formatDate(item.validity),
    },
    { label: "Applied", key: "applied" },
    { label: "Used", key: "used" },
    {
      label: "Status",
      key: "status",
      render: (item) => {
        const isExpired = new Date(item.validity) < new Date();
        return isExpired ? "Expired" : item.status;
      },
    },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => setDeleteItemId(item._id)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

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
            options={["All Status", "Active", "Expired", "Deleted"]}
          />
        </div>

        <CustomTable
          tableHeaders={tableHeaders}
          tableData={tableData}
          showPagination
          showSorting
          loading={isLoading}
        />
      </div>

      <DeleteModal
        isOpen={!!deleteItemId}
        onConfirm={async () => {
          await handleDelete(deleteItemId);
          setDeleteItemId(null);
        }}
        onCancel={() => setDeleteItemId(null)}
      />

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={`Edit ${selectedItem?.voucher || "New Voucher"}`}
      >
        <div className="mx-auto p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium">Voucher</label>
            <input
              type="text"
              className="custom_input uppercase"
              value={selectedItem?.voucher || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  voucher: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              min={0}
              className="custom_input"
              value={selectedItem?.quantity || 0}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  quantity: parseInt(e.target.value) || 0,
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
              value={
                selectedItem?.validity
                  ? new Date(selectedItem.validity).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, validity: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Discount Type</label>
            <input
              type="text"
              className="custom_input bg-gray-100 cursor-not-allowed"
              value="Percentage"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Discount Value (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className="custom_input"
              value={selectedItem?.discountValue || 0}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  discountValue: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn btn-cancel">
              Cancel
            </button>
            <button onClick={handleUpdateOrCreate} className="btn btn-reset">
              {selectedItem?._id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default Vouchers;
