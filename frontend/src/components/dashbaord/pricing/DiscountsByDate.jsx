import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { surchargeDateData } from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DiscountsByDate = () => {
  const [data, setData] = useState(surchargeDateData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Active");

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.caption === selectedItem.caption ? selectedItem : item
    );
    setData(updated);
    toast.success("Discount/Surcharge Updated!");
    setShowModal(false);
  };

  const filteredData =
    statusFilter === "Any Status"
      ? data
      : data.filter((item) => item.status === statusFilter);

  const tableHeaders = [
    { label: "Caption", key: "caption" },
    { label: "Recurring", key: "recurring" },
    { label: "From", key: "fromDate" },
    { label: "To", key: "toDate" },
    { label: "Category", key: "category" },
    { label: "Price (GBP)", key: "price" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
    ...item,
    price: `${item.price.toFixed(2)} ${
      item.priceType === "Percentage" ? "%" : "GBP"
    }`,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
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
        <OutletHeading name="Discount / Surcharge Pricing" />
        <div className="flex justify-between items-center mb-4">
          <button className="btn btn-edit">Add New</button>
          <SelectOption
            label="Status"
            width="40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={["Any Status", "Active", "Expired"]}
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
        heading={`Edit ${selectedItem?.caption || "New Entry"}`}
      >
        <div className="w-96 mx-auto p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.caption || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, caption: e.target.value })
              }
            />
          </div>

          <SelectOption
            label="Recurring"
            width="full"
            value={selectedItem?.recurring || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, recurring: e.target.value })
            }
            options={["No", "Yearly"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Date
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
              To Date
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
            value={selectedItem?.category || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, category: e.target.value })
            }
            options={["Surcharge", "Discount"]}
          />

          <SelectOption
            label="Price Type"
            width="full"
            value={selectedItem?.priceType || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, priceType: e.target.value })
            }
            options={["Percentage", "Amount"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount / Percentage
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedItem?.price || 0}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  price: parseFloat(e.target.value),
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

export default DiscountsByDate;
