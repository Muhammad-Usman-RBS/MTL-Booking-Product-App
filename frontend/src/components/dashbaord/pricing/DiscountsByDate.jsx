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

// ✅ Fixed: Format input for datetime-local field (preserve exact local time)
const formatInputDateTime = (isoDate) => {
  if (!isoDate) return "";

  // Parse the ISO date but use UTC methods to avoid timezone conversion
  const date = new Date(isoDate);

  // Use UTC methods to get the exact stored time
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// ✅ Fixed: Convert datetime-local to ISO without timezone shift
const toISOStringWithLocalTime = (value) => {
  if (!value) return null;

  // Parse the datetime-local value manually to avoid timezone conversion
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Create date object using local time components
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // Convert to ISO string manually to preserve exact time
  const pad = (n) => n.toString().padStart(2, '0');
  const isoYear = date.getFullYear();
  const isoMonth = pad(date.getMonth() + 1);
  const isoDay = pad(date.getDate());
  const isoHours = pad(date.getHours());
  const isoMinutes = pad(date.getMinutes());
  const isoSeconds = pad(date.getSeconds());

  return `${isoYear}-${isoMonth}-${isoDay}T${isoHours}:${isoMinutes}:${isoSeconds}.000Z`;
};

// ✅ Fixed: Format display value for table (show exact saved time with AM/PM)
const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";

  // Parse ISO date and display local components
  const date = new Date(isoDate);

  const pad = (n) => n.toString().padStart(2, "0");
  const year = date.getUTCFullYear(); // Use UTC to avoid timezone conversion
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  // Convert 24-hour to 12-hour format with AM/PM
  let hours = date.getUTCHours();
  const minutes = pad(date.getUTCMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const displayHours = pad(hours);

  return `${year}-${month}-${day} ${displayHours}:${minutes} ${ampm}`;
};

const DiscountsByDate = () => {
  const { data = [], isLoading, isError } = useGetAllDiscountsQuery();
  const [createDiscount] = useCreateDiscountMutation();
  const [updateDiscount] = useUpdateDiscountMutation();
  const [deleteDiscount] = useDeleteDiscountMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deleteItemId, setDeleteItemId] = useState(null);

  // ✅ Attach dynamic status using UTC comparison to match saved format
  const processedData = data.map((item) => {
    const today = new Date();
    const toDate = new Date(item.toDate);
    const dynamicStatus = toDate < today ? "Expired" : "Active";
    return { ...item, dynamicStatus };
  });

  // ✅ Filter based on status dropdown
  const filteredData =
    statusFilter === "All Status"
      ? processedData
      : processedData.filter((item) => item.dynamicStatus === statusFilter);

  // ✅ Edit existing item - properly format dates for datetime-local input
  const handleEdit = (item) => {
    setSelectedItem({
      ...item,
      fromDate: formatInputDateTime(item.fromDate),
      toDate: formatInputDateTime(item.toDate),
    });
    setShowModal(true);
  };

  // ✅ Add new item
  const handleAddNew = () => {
    setSelectedItem({
      caption: "",
      recurring: "No",
      fromDate: "",
      toDate: "",
      category: "Surcharge",
      discountPrice: 0,
      status: "Active",
      priceType: "Percentage",
    });
    setShowModal(true);
  };

  // ✅ Save item (create or update) - preserve exact time
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!selectedItem.caption || !selectedItem.fromDate || !selectedItem.toDate) {
        toast.error("Please fill all required fields");
        return;
      }

      const now = new Date();
      const toDateForComparison = new Date(selectedItem.toDate);
      const isExpired = toDateForComparison < now;

      const payload = {
        caption: selectedItem.caption,
        recurring: selectedItem.recurring,
        fromDate: toISOStringWithLocalTime(selectedItem.fromDate),
        toDate: toISOStringWithLocalTime(selectedItem.toDate),
        category: selectedItem.category,
        discountPrice: parseFloat(selectedItem.discountPrice) || 0,
        status: isExpired ? "Expired" : "Active",
        priceType: "Percentage",
      };

      console.log("Saving payload:", payload); // Debug log

      if (selectedItem._id) {
        await updateDiscount({ id: selectedItem._id, updatedData: payload }).unwrap();
        toast.success("Updated successfully");
      } else {
        await createDiscount(payload).unwrap();
        toast.success("Created successfully");
      }

      setShowModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  // ✅ Delete item
  const handleDelete = async (id) => {
    try {
      await deleteDiscount(id).unwrap();
      toast.success("Deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  // ✅ Table configuration
  const tableHeaders = [
    { label: "Caption", key: "caption" },
    { label: "Recurring", key: "recurring" },
    { label: "From", key: "fromDate" },
    { label: "To", key: "toDate" },
    { label: "Category", key: "category" },
    { label: "Discount Price (%)", key: "discountPrice" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
    ...item,
    fromDate: formatDate(item.fromDate),
    toDate: formatDate(item.toDate),
    discountPrice: `${item.discountPrice?.toFixed(2) || "0.00"}%`,
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

        {isLoading ? (
          <div>Loading discounts...</div>
        ) : isError ? (
          <div className="text-red-500">Failed to load discounts.</div>
        ) : (
          <CustomTable
            tableHeaders={tableHeaders}
            tableData={tableData}
            showPagination={true}
            showSorting={true}
          />
        )}
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
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        heading={`${selectedItem?._id ? "Edit" : "Add"} Entry`}
      >
        <div className="mx-auto w-96 p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.caption || ""}
              onChange={(e) => setSelectedItem({ ...selectedItem, caption: e.target.value })}
              placeholder="Enter caption"
            />
          </div>

          <SelectOption
            label="Recurring"
            width="full"
            value={selectedItem?.recurring || "No"}
            onChange={(e) => setSelectedItem({ ...selectedItem, recurring: e.target.value })}
            options={["No", "Yearly"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              className="custom_input"
              value={selectedItem?.fromDate || ""}
              onChange={(e) => setSelectedItem({ ...selectedItem, fromDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              To Date <span className="text-red-500">*</span>
            </label>
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
            value={selectedItem?.category || "Surcharge"}
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
            <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="custom_input"
              value={selectedItem?.discountPrice || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, discountPrice: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.00"
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
            <button
              onClick={handleSave}
              className="btn btn-reset"
            >
              {selectedItem?._id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default DiscountsByDate;