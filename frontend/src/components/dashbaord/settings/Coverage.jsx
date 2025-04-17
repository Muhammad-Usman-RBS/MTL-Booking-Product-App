import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { coverageData } from "../../../constants/dashboardTabsData/data";
import { toast } from "react-toastify";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const Coverage = () => {
  const [data, setData] = useState(coverageData);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updatedData = data.map((entry) =>
      entry.value === selectedItem.originalValue ? selectedItem : entry
    );
    setData(updatedData);
    setShowModal(false);
    toast.success("Coverage Updated!");
  };

  const handleDelete = (value) => {
    setData(data.filter((entry) => entry.value !== value));
    toast.success("Coverage Deleted!");
  };

  const tableHeaders = [
    { label: "Location Type", key: "type" },
    { label: "Coverage", key: "coverage" },
    { label: "Category", key: "category" },
    { label: "Value", key: "value" },
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((entry) => ({
    ...entry,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit({ ...entry, originalValue: entry.value })}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => handleDelete(entry.value)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Coverage Settings" />
        <button className="btn btn-edit mb-4">Add New</button>
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
        heading={`Edit ${selectedItem?.value}`}
      >
        <div className="mx-auto p-4 font-sans space-y-4">
          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location Type
            </label>
            <SelectOption
              label="Type"
              width="full"
              options={["Pickup", "Dropoff", "Both"]}
            />
          </div>

          {/* Coverage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="coverage"
                  value="Allow"
                  checked={selectedItem?.coverage === "Allow"}
                  onChange={() =>
                    setSelectedItem({ ...selectedItem, coverage: "Allow" })
                  }
                />
                Allow
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="coverage"
                  value="Block"
                  checked={selectedItem?.coverage === "Block"}
                  onChange={() =>
                    setSelectedItem({ ...selectedItem, coverage: "Block" })
                  }
                />
                Block
              </label>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>

            <SelectOption
              label="Type"
              width="full"
              options={["Postcode", "Zone"]}
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {selectedItem?.category === "Zone" ? "Zone" : "Postcode"}
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.value || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, value: e.target.value })
              }
            />
          </div>

          {/* Buttons */}
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

export default Coverage;
