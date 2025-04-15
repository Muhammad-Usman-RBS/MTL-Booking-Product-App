import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { driverfarebData } from "../../../constants/dashboardTabsData/data";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DriverFare = () => {
  const [data, setData] = useState(driverfarebData);
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (item) => {
    setSelectedSlab(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.start === selectedSlab.start && item.end === selectedSlab.end
        ? selectedSlab
        : item
    );
    setData(updated);
    toast.success("Slab Updated!");
    setShowModal(false);
  };

  const tableHeaders = [
    { label: "Start Distance", key: "start" },
    { label: "End Distance", key: "end" },
    { label: "Standard Saloon", key: "standard" },
    { label: "Executive Saloon", key: "executive" },
    { label: "VIP Saloon", key: "vip" },
    { label: "Luxury MPV", key: "luxury" },
    { label: "8 Passenger MPV", key: "passenger" },
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
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Driver Fare" />
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
        heading={`Edit ${selectedSlab?.start} to ${selectedSlab?.end} Slab`}
      >
        <div className="w-80 mx-auto p-4 font-sans space-y-4">
          {[
            { label: "Start Distance", key: "start" },
            { label: "End Distance", key: "end" },
            { label: "Standard Saloon", key: "standard" },
            { label: "Executive Saloon", key: "executive" },
            { label: "VIP Saloon", key: "vip" },
            { label: "Luxury MPV", key: "luxury" },
            { label: "8 Passenger MPV", key: "passenger" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="number"
                className="custom_input"
                value={selectedSlab?.[key] || ""}
                onChange={(e) =>
                  setSelectedSlab({
                    ...selectedSlab,
                    [key]: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          ))}

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

export default DriverFare;
