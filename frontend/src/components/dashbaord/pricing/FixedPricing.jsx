import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { fixedPricingData } from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FixedPricing = () => {
  const [data, setData] = useState(fixedPricingData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.pickup === selectedItem.pickup &&
      item.dropoff === selectedItem.dropoff
        ? selectedItem
        : item
    );
    setData(updated);
    toast.success("Fixed Price Updated!");
    setShowModal(false);
  };

  const handleAddNew = () => {
    setSelectedItem({
      direction: "Both Ways",
      pickup: "",
      dropoff: "",
      price: 0,
    });
    setShowModal(true);
  };

  const tableHeaders = [
    { label: "Pick Up", key: "pickup" },
    { label: "Drop Off", key: "dropoff" },
    { label: "Price (GBP)", key: "price" },
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((item) => ({
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
          onClick={() => {
            const updated = data.filter(
              (d) => d.pickup !== item.pickup || d.dropoff !== item.dropoff
            );
            setData(updated);
            toast.success("Deleted successfully");
          }}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Fixed Pricing" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {/* Fixed Price Adjustment Section */}
          <div className="w-full md:w-auto">
            <label className="block mb-1 text-sm font-medium">
              Increase/Decrease All Fixed Prices
            </label>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="flex w-full sm:w-auto">
                <input
                  type="number"
                  name="minAdditionalDropOff"
                  className="custom_input rounded-l-md"
                />
                <span className="px-4 py-1 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-sm">
                  GBP
                </span>
              </div>
              <button
                className="btn btn-reset w-full sm:w-auto"
                onClick={handleAddNew}
              >
                Update
              </button>
            </div>
          </div>

          {/* Add New Button */}
          <div className="w-full md:w-auto">
            <button
              className="btn btn-edit w-full md:w-auto"
              onClick={handleAddNew}
            >
              Add New
            </button>
          </div>
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
        heading={`Edit ${selectedItem?.pickup || "New Entry"}`}
      >
        <div className="mx-auto p-4 font-sans space-y-4">
          <SelectOption
            label="Direction"
            width="full"
            value={selectedItem?.direction || ""}
            onChange={(val) =>
              setSelectedItem({ ...selectedItem, direction: val })
            }
            options={["Pickup", "Dropoff", "Both Ways"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pick Up
            </label>
            <textarea
              rows={2}
              className="custom_input"
              value={selectedItem?.pickup || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, pickup: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Drop Off
            </label>
            <textarea
              rows={2}
              className="custom_input"
              value={selectedItem?.dropoff || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, dropoff: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (GBP)
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

export default FixedPricing;
