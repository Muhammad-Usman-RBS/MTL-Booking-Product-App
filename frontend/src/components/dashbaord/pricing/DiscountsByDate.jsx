import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetAllDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} from "../../../redux/api/discountApi";

// ✅ Date formatting helper
const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString("en-GB", options);
};

const DiscountsByDate = () => {
  const { data = [], isLoading } = useGetAllDiscountsQuery();
  const [createDiscount] = useCreateDiscountMutation();
  const [updateDiscount] = useUpdateDiscountMutation();
  const [deleteDiscount] = useDeleteDiscountMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Active");
  const [deleteItemId, setDeleteItemId] = useState(null);

  // ✅ Calculate dynamic status for all records at once
  const processedData = data.map((item) => {
    const today = new Date();
    const toDate = new Date(item.toDate);
    const dynamicStatus = toDate < today ? "Expired" : "Active";

    return { ...item, dynamicStatus };
  });

  // ✅ Apply filter on dynamic status
  const filteredData =
    statusFilter === "All Status"
      ? processedData
      : processedData.filter((item) => item.dynamicStatus === statusFilter);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiscount(id).unwrap();
      toast.success("Deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const handleUpdateOrCreate = async () => {
    try {
      const today = new Date();
      const toDate = new Date(selectedItem.toDate);
      const calculatedStatus = toDate < today ? "Expired" : "Active";

      const payload = {
        ...selectedItem,
        priceType: "Percentage",
        status: calculatedStatus,
      };

      if (selectedItem._id) {
        await updateDiscount({ id: selectedItem._id, updatedData: payload }).unwrap();
        toast.success("Updated Successfully");
      } else {
        await createDiscount(payload).unwrap();
        toast.success("Created Successfully");
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  const tableHeaders = [
    { label: "Caption", key: "caption" },
    { label: "Recurring", key: "recurring" },
    { label: "From", key: "fromDate" },
    { label: "To", key: "toDate" },
    { label: "Category", key: "category" },
    { label: "Price (%)", key: "price" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
    ...item,
    fromDate: formatDate(item.fromDate),
    toDate: formatDate(item.toDate),
    price: `${item.price.toFixed(2)}%`,
    status: item.dynamicStatus,
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
        <OutletHeading name="Discount / Surcharge Pricing" />
        <div className="flex justify-between items-center mb-4">
          <button
            className="btn btn-edit"
            onClick={() => {
              setSelectedItem({
                caption: "",
                recurring: "No",
                fromDate: "",
                toDate: "",
                category: "Surcharge",
                priceType: "Percentage",
                price: 0,
                status: "Active",
              });
              setShowModal(true);
            }}
          >
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
          showPagination={true}
          showSorting={true}
        />
      </div>

      <DeleteModal
        isOpen={deleteItemId !== null}
        onConfirm={async () => {
          await handleDelete(deleteItemId);
          setDeleteItemId(null);
        }}
        onCancel={() => setDeleteItemId(null)}
      />

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={`Edit ${selectedItem?._id ? selectedItem?.caption : "New Entry"}`}
      >
        <div className="mx-auto p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Caption</label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.caption || ""}
              onChange={(e) => setSelectedItem({ ...selectedItem, caption: e.target.value })}
            />
          </div>

          <SelectOption
            label="Recurring"
            width="full"
            value={selectedItem?.recurring || ""}
            onChange={(e) => setSelectedItem({ ...selectedItem, recurring: e.target.value })}
            options={["No", "Yearly"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="datetime-local"
              className="custom_input"
              value={selectedItem?.fromDate || ""}
              onChange={(e) => setSelectedItem({ ...selectedItem, fromDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="datetime-local"
              className="custom_input"
              value={selectedItem?.toDate || ""}
              onChange={(e) => setSelectedItem({ ...selectedItem, toDate: e.target.value })}
            />
          </div>

          <SelectOption
            label="Category"
            width="full"
            value={selectedItem?.category || ""}
            onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
            options={["Surcharge", "Discount"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Price Type</label>
            <input
              type="text"
              className="custom_input bg-gray-100 cursor-not-allowed"
              value="Percentage"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (%)</label>
            <input
              type="number"
              className="custom_input"
              value={selectedItem?.price || 0}
              onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) })}
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

export default DiscountsByDate;
