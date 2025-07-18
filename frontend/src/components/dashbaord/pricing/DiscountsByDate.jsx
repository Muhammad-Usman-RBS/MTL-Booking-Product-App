import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetAllDiscountsQuery, useCreateDiscountMutation, useUpdateDiscountMutation, useDeleteDiscountMutation } from "../../../redux/api/discountApi";

// Utility Functions
const toISOStringWithTimezone = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString();
};

const formatInputDateTime = (dateStr) => {
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  const processedData = data.map((item) => {
    const dynamicStatus = new Date(item.toDate).getTime() < Date.now() ? "Expired" : "Active";
    return { ...item, dynamicStatus };
  });

  const filteredData =
    statusFilter === "All Status"
      ? processedData
      : processedData.filter((item) => item.dynamicStatus === statusFilter);

  const handleEdit = (item) => {
    setSelectedItem({
      ...item,
      fromDate: formatInputDateTime(item.fromDate),
      toDate: formatInputDateTime(item.toDate),
      discountPrice: item.discountPrice || 0,
      surchargePrice: item.surchargePrice || 0,
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedItem({
      caption: "",
      recurring: "No",
      fromDate: "",
      toDate: "",
      category: "Surcharge",
      discountPrice: 0,
      surchargePrice: 0,
      status: "Active",
      priceType: "Percentage",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
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
        category: selectedItem.category,
        fromDate: toISOStringWithTimezone(selectedItem.fromDate),
        toDate: toISOStringWithTimezone(selectedItem.toDate),
        discountPrice:
          selectedItem.category === "Discount"
            ? parseFloat(selectedItem.discountPrice) || 0
            : 0,
        surchargePrice:
          selectedItem.category === "Surcharge"
            ? parseFloat(selectedItem.surchargePrice) || 0
            : 0,
        status: isExpired ? "Expired" : "Active",
        priceType: "Percentage",
      };

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
      toast.error("Failed to save");
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiscount(id).unwrap();
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete");
      console.error("Delete error:", err);
    }
  };

  const tableHeaders = [
    { label: "Caption", key: "caption" },
    { label: "Recurring", key: "recurring" },
    { label: "From", key: "fromDate" },
    { label: "To", key: "toDate" },
    { label: "Category", key: "category" },
    { label: "Price (%)", key: "priceValue" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => {
    const value = item.category === "Discount" ? item.discountPrice : item.surchargePrice;
    return {
      ...item,
      fromDate: formatDate(item.fromDate),
      toDate: formatDate(item.toDate),
      priceValue: `${value?.toFixed(2) || "0.00"}%`,
      status: item.dynamicStatus,
      actions: (
        <div className="flex gap-2">
          <Icons.Pencil
            title="Edit"
            onClick={() => handleEdit(item)}
            className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
          />
          <Icons.Trash
            title="Delete"
            onClick={() => setDeleteItemId(item._id)}
            className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
          />
        </div>
      ),
    };
  });

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
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, caption: e.target.value })
              }
              placeholder="Enter caption"
            />
          </div>

          <SelectOption
            label="Recurring"
            width="full"
            value={selectedItem?.recurring || "No"}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, recurring: e.target.value })
            }
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
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, fromDate: e.target.value })
              }
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
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, toDate: e.target.value })
              }
            />
          </div>

          <SelectOption
            label="Category"
            width="full"
            value={selectedItem?.category || "Surcharge"}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, category: e.target.value })
            }
            options={["Surcharge", "Discount"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price Type
            </label>
            <input
              type="text"
              className="custom_input bg-gray-100 cursor-not-allowed"
              value="Percentage"
              disabled
            />
          </div>

          {selectedItem?.category === "Discount" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="custom_input"
                value={selectedItem?.discountPrice || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    discountPrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          )}

          {selectedItem?.category === "Surcharge" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Surcharge (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="custom_input"
                value={selectedItem?.surchargePrice || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    surchargePrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          )}

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
            <button onClick={handleSave} className="btn btn-reset">
              {selectedItem?._id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default DiscountsByDate;
