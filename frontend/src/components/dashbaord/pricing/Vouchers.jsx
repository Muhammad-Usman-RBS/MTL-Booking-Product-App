import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useGetAllVouchersQuery, useCreateVoucherMutation, useUpdateVoucherMutation, useDeleteVoucherMutation } from "../../../redux/api/vouchersApi";
import "react-toastify/dist/ReactToastify.css";

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

// Converts ISO string to local datetime string (yyyy-MM-ddTHH:mm)
const toLocalDateTime = (isoDate) => {
  const date = new Date(isoDate);
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in ms
  return new Date(date - tzOffset).toISOString().slice(0, 16);
};

const Vouchers = () => {
  const user = useSelector((state) => state.auth.user);

  const companyId = user?.companyId || "";
  const {
    data: bookingsResponse = {},
    isLoading: bookingsLoading,
  } = useGetAllBookingsQuery(companyId, { skip: !companyId });

  const allBookings = bookingsResponse.bookings || [];

  const {
    data: voucherData = [],
    isLoading,
    refetch,
  } = useGetAllVouchersQuery();

  const [createVoucher] = useCreateVoucherMutation();
  const [updateVoucher] = useUpdateVoucherMutation();
  const [deleteVoucher] = useDeleteVoucherMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleEdit = (item) => {
    const discountValue = parseFloat(item.discountValue?.toString().replace("%", "")) || 0;

    setSelectedItem({
      ...item,
      discountValue,
    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteVoucher(id).unwrap();
      toast.success("Deleted successfully");
      await refetch();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateOrCreate = async () => {
    try {
      const validityDate = new Date(selectedItem.validity);
      const status = validityDate < new Date() ? "Expired" : "Active";

      const payload = {
        voucher: selectedItem.voucher?.toUpperCase(),
        quantity: Number(selectedItem.quantity || 0),
        validity: selectedItem.validity,
        discountType: "Percentage",
        discountValue: Number(selectedItem.discountValue || 0),
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
      setSelectedItem(null);
      await refetch();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleAddNew = () => {
    setSelectedItem({
      voucher: "",
      quantity: 0,
      discountType: "Percentage",
      discountValue: 0,
      validity: "",
      used: 0,
      status: "Active",
    });
    setShowModal(true);
  };

  const processedData = voucherData.map((item) => {
    const isExpired = new Date(item.validity) < new Date();
    const dynamicStatus = item.status === "Deleted" ? "Deleted" : isExpired ? "Expired" : "Active";

    // Count bookings that used this voucher
    const usedCount = allBookings.filter(
      (booking) =>
        booking?.primaryJourney?.voucher?.toUpperCase() === item.voucher?.toUpperCase() &&
        booking?.primaryJourney?.voucherApplied
    ).length;

    return {
      ...item,
      status: dynamicStatus,
      discountValue: `${(item.discountValue || 0).toFixed(2)}%`,
      validity: formatDate(item.validity),
      used: usedCount,
    };
  });

  const filteredData = processedData.filter((item) => {
    if (statusFilter === "All Status") return true;
    return item.status === statusFilter;
  });

  const tableHeaders = [
    { label: "Voucher", key: "voucher" },
    { label: "Quantity", key: "quantity" },
    { label: "Discount (%)", key: "discountValue" },
    { label: "Validity", key: "validity" },
    { label: "Used", key: "used" },
    { label: "Status", key: "status" },
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
            options={["All Status", "Active", "Expired"]}
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
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        heading={selectedItem?._id ? `Edit ${selectedItem.voucher}` : "New Voucher"}
      >
        <div className="mx-auto w-96 p-4 font-sans space-y-4">
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
              value={selectedItem?.quantity}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  quantity: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Validity</label>
            <input
              type="datetime-local"
              className="custom_input"
              value={
                selectedItem?.validity
                  ? toLocalDateTime(selectedItem.validity)
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
              value={selectedItem?.discountValue}
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
              onClick={() => {
                setShowModal(false);
                setSelectedItem(null);
              }}
              className="btn btn-cancel"
            >
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
