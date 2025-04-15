import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { locationsData } from "../../../constants/dashboardTabsData/data";
import { toast } from "react-toastify";

const Locations = () => {
  const [data, setData] = useState(locationsData);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.name === selectedItem.name ? selectedItem : item
    );
    setData(updated);
    setShowModal(false);
    toast.success("Location updated!");
  };

  const handleDelete = (name) => {
    setData(data.filter((item) => item.name !== name));
    toast.success("Location deleted!");
  };

  const tableHeaders = [
    { label: "Category", key: "category" },
    { label: "Location", key: "name" },
    { label: "Lat & Lng", key: "latLng" },
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
          onClick={() => handleDelete(item.name)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Locations" />
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
        heading={`Edit ${selectedItem?.name}`}
      >
        <div className="flex justify-center">
          <div className="space-y-4 w-[480px]">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                className="custom_input"
                value={selectedItem?.category || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, category: e.target.value })
                }
              >
                <option value="Airport">Airport</option>
                {/* Add more options if needed */}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Location Name
              </label>
              <input
                type="text"
                className="custom_input"
                value={selectedItem?.name || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Latitude & Longitude
              </label>
              <input
                type="text"
                className="custom_input"
                value={selectedItem?.latLng || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, latLng: e.target.value })
                }
              />
            </div>

            <div className="h-56">
              <iframe
                title="Google Map"
                className="w-full h-full border rounded"
                src={`https://maps.google.com/maps?q=${selectedItem?.latLng}&z=15&output=embed`}
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
        </div>
      </CustomModal>
    </>
  );
};

export default Locations;
